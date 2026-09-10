"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export default function ImageUploadField({
  value,
  onChange,
  label = "Image",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/..."
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-foreground/30 hover:text-foreground">
          {uploading ? "Uploading…" : "Upload file"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-12 w-16 rounded object-cover"
          />
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
