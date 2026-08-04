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
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 text-lg font-bold text-neutral-900">
              <span className="flex shrink-0 items-center">
                <Image src="/logo-gp-black.webp" alt="Gudang Planet" width={130} height={39} />
              </span>
              Admin Gudang Planet
            </Link>
            <nav className="flex max-w-full items-center gap-4 overflow-x-auto pb-1 sm:pb-0">
              <Link href="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Ringkasan
              </Link>
              {session?.role === "admin" ? (
                <>
                  <Link
                    href="/admin/testimoni"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Testimoni
                  </Link>
                  <Link
                    href="/admin/special-edition"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Special Edition
                  </Link>
                  <Link
                    href="/admin/pengaturan"
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Pengaturan
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
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
