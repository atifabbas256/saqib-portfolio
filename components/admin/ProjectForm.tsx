"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { WorkItem } from "@/lib/work";

type Props = {
  initial?: WorkItem;
  mode: "create" | "edit";
};

export default function ProjectForm({ initial, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [meta, setMeta] = useState(initial?.meta ?? "");
  const [year, setYear] = useState(
    initial?.year ?? new Date().getFullYear().toString(),
  );
  const [image, setImage] = useState(initial?.image ?? "");
  const [aspect, setAspect] = useState(initial?.aspect ?? "346 / 260");
  const [href, setHref] = useState(initial?.href ?? "#");
  const [comingSoon, setComingSoon] = useState(Boolean(initial?.comingSoon));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name,
      meta,
      year,
      image,
      aspect,
      href,
      comingSoon,
    };

    try {
      const res = await fetch(
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { error?: string; id?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-xl space-y-5">
      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="admin-input"
        />
      </Field>
      <Field label="Tag / industry">
        <input
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          className="admin-input"
          placeholder="Ecommerce"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Year">
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Aspect ratio">
          <input
            value={aspect}
            onChange={(e) => setAspect(e.target.value)}
            className="admin-input"
            placeholder="346 / 260"
          />
        </Field>
      </div>
      <ImageUploadField value={image} onChange={setImage} label="Cover image" />
      <Field label="Link (optional)">
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="admin-input"
          placeholder="#"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={comingSoon}
          onChange={(e) => setComingSoon(e.target.checked)}
        />
        Coming soon
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Add project" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded border border-border px-4 py-2 text-sm text-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
