"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReorderButtons({
  categoryId,
  disableUp,
  disableDown,
}: {
  categoryId: string;
  disableUp: boolean;
  disableDown: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function move(direction: "up" | "down") {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Gagal mengubah urutan");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={loading || disableUp}
        aria-label="Naikkan urutan"
        className="px-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={loading || disableDown}
        aria-label="Turunkan urutan"
        className="px-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
      >
        ▼
      </button>
    </div>
  );
}
