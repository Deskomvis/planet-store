import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { AdminLogoutButton } from "@/components/admin-logout-button";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <>
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-neutral-900">
              <Image src="/logo.webp" alt="Planet Store" width={28} height={28} />
              Admin Planet Store
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Ringkasan
              </Link>
              <Link href="/admin/testimoni" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Testimoni
              </Link>
              <Link href="/admin/pengaturan" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Pengaturan
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <span className="text-sm text-neutral-500">{session.name}</span>
            ) : null}
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
