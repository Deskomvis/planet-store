export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-neutral-500">
        © {new Date().getFullYear()} Gudang Planet. Semua hak dilindungi.
      </div>
    </footer>
  );
}
