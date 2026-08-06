import { NextResponse } from "next/server";

type DownloadFile = { url: string; filename: string };

const MAX_FILES = 100;
const MAX_ARCHIVE_BYTES = 150 * 1024 * 1024;
const encoder = new TextEncoder();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function concat(chunks: Uint8Array[]) {
  const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function safeFilenames(files: DownloadFile[]) {
  const used = new Set<string>();
  return files.map((file, index) => {
    const cleaned = file.filename.replace(/[\\/:*?"<>|\r\n]/g, "-").trim() || `gambar-${index + 1}.jpg`;
    const dot = cleaned.lastIndexOf(".");
    const base = dot > 0 ? cleaned.slice(0, dot) : cleaned;
    const extension = dot > 0 ? cleaned.slice(dot) : "";
    let filename = cleaned;
    let suffix = 2;
    while (used.has(filename.toLowerCase())) filename = `${base}-${suffix++}${extension}`;
    used.add(filename.toLowerCase());
    return filename;
  });
}

function createZip(entries: { filename: string; data: Uint8Array }[]) {
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.filename);
    const checksum = crc32(entry.data);
    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, entry.data.length);
    writeUint32(localView, 22, entry.data.length);
    writeUint16(localView, 26, name.length);
    local.set(name, 30);
    localChunks.push(local, entry.data);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, entry.data.length);
    writeUint32(centralView, 24, entry.data.length);
    writeUint16(centralView, 28, name.length);
    writeUint32(centralView, 42, localOffset);
    central.set(name, 46);
    centralChunks.push(central);
    localOffset += local.length + entry.data.length;
  }

  const centralSize = centralChunks.reduce((total, chunk) => total + chunk.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 8, entries.length);
  writeUint16(endView, 10, entries.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, localOffset);
  return concat([...localChunks, ...centralChunks, end]);
}

export async function POST(request: Request) {
  let files: DownloadFile[];
  try {
    const body = await request.json();
    files = body.files;
    if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) throw new Error();
  } catch {
    return NextResponse.json({ error: `Pilih 1 sampai ${MAX_FILES} gambar` }, { status: 400 });
  }

  const filenames = safeFilenames(files);
  try {
    const entries = await Promise.all(files.map(async (file, index) => {
      if (typeof file.url !== "string" || typeof file.filename !== "string") throw new Error("Data gambar tidak valid");
      const target = new URL(file.url);
      if (target.protocol !== "https:") throw new Error("URL gambar tidak valid");
      const response = await fetch(target);
      if (!response.ok) throw new Error(`Gagal mengambil ${filenames[index]}`);
      return { filename: filenames[index], data: new Uint8Array(await response.arrayBuffer()) };
    }));
    const totalBytes = entries.reduce((total, entry) => total + entry.data.length, 0);
    if (totalBytes > MAX_ARCHIVE_BYTES) {
      return NextResponse.json({ error: "Total ukuran gambar terlalu besar" }, { status: 413 });
    }

    const zip = createZip(entries);
    return new Response(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="gambar-terpilih.zip"',
        "Content-Length": String(zip.length),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyiapkan gambar" },
      { status: 502 }
    );
  }
}
