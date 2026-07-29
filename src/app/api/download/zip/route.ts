import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { ZipArchive } from "archiver";

export const runtime = "nodejs";

type FileEntry = { url: string; filename: string };

export async function POST(request: NextRequest) {
  let body: { files?: FileEntry[]; zipName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const files = body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "Missing files" }, { status: 400 });
  }

  const targets: FileEntry[] = [];
  for (const file of files) {
    let target: URL;
    try {
      target = new URL(file.url);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    if (target.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    targets.push({ url: target.toString(), filename: file.filename });
  }

  const archive = new ZipArchive({ zlib: { level: 6 } });

  // Dedupe filenames so images with the same product name don't clobber
  // each other inside the archive.
  const usedNames = new Set<string>();
  function uniqueName(name: string) {
    const safe = name.replace(/[\r\n"/\\]/g, "") || "file";
    if (!usedNames.has(safe)) {
      usedNames.add(safe);
      return safe;
    }
    const dot = safe.lastIndexOf(".");
    const base = dot > 0 ? safe.slice(0, dot) : safe;
    const ext = dot > 0 ? safe.slice(dot) : "";
    let i = 2;
    let candidate = `${base} (${i})${ext}`;
    while (usedNames.has(candidate)) {
      i += 1;
      candidate = `${base} (${i})${ext}`;
    }
    usedNames.add(candidate);
    return candidate;
  }

  (async () => {
    for (const { url, filename } of targets) {
      try {
        const upstream = await fetch(url);
        if (!upstream.ok || !upstream.body) continue;
        const buffer = Buffer.from(await upstream.arrayBuffer());
        archive.append(buffer, { name: uniqueName(filename) });
      } catch {
        // Skip files that fail to fetch; still ship the rest as a zip.
      }
    }
    archive.finalize();
  })();

  const zipName = (body.zipName ?? "produk").replace(/[\r\n"]/g, "");

  return new NextResponse(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}.zip"`,
    },
  });
}
