"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeleteButton({
  url,
  confirmMessage,
  className,
  children,
  onDeleted,
}: {
  url: string;
  confirmMessage: string;
  className?: string;
  children?: ReactNode;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Gagal menghapus data");
        return;
      }
      setConfirmOpen(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={
          className ??
          "cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        }
      >
        {children ?? "Hapus"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        message={confirmMessage}
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
