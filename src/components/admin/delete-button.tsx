"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  url,
  confirmMessage,
}: {
  url: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Gagal menghapus data");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}
