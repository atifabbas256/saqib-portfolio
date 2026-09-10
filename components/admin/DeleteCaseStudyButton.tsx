"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCaseStudyButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete case study “${title}”?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/case-studies/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void onDelete()}
      className="text-xs text-muted hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
