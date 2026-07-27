import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.webp" alt="Planet Store" width={36} height={36} priority />
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Planet Store
          </span>
        </Link>
        <nav>
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Katalog
          </Link>
        </nav>
      </div>
    </header>
  );
}
