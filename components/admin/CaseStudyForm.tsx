"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { CaseStudy, CaseStudyBlock, CaseStudyMeta } from "@/lib/caseStudies";

type Props = {
  initial?: CaseStudy;
  mode: "create" | "edit";
};

const emptyMeta: CaseStudyMeta[] = [
  { label: "Industry", value: "" },
  { label: "Year", value: new Date().getFullYear().toString() },
  { label: "Role", value: "UX/UI Designer" },
];

export default function CaseStudyForm({ initial, mode }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [siteUrl, setSiteUrl] = useState(initial?.siteUrl ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [coverAlt, setCoverAlt] = useState(initial?.coverAlt ?? "");
  const [meta, setMeta] = useState<CaseStudyMeta[]>(
    initial?.meta?.length ? initial.meta : emptyMeta,
  );
  const [blocks, setBlocks] = useState<CaseStudyBlock[]>(
    initial?.blocks?.length
      ? initial.blocks
      : [{ type: "text", body: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateMeta(index: number, key: keyof CaseStudyMeta, value: string) {
    setMeta((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }

  function updateBlock(index: number, next: CaseStudyBlock) {
    setBlocks((prev) => prev.map((block, i) => (i === index ? next : block)));
  }

  function addBlock(type: CaseStudyBlock["type"]) {
    if (type === "image") {
      setBlocks((prev) => [...prev, { type: "image", src: "", alt: "" }]);
    } else if (type === "text") {
      setBlocks((prev) => [...prev, { type: "text", body: "" }]);
    } else {
      setBlocks((prev) => [
        ...prev,
        { type: "heading", title: "", paragraphs: [""] },
      ]);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      slug: mode === "create" ? slug : undefined,
      summary,
      siteUrl,
      cover,
      coverAlt: coverAlt || `${title} cover`,
      meta: meta.filter((item) => item.label.trim() && item.value.trim()),
      blocks,
    };

    try {
      const res = await fetch(
        mode === "create"
          ? "/api/admin/case-studies"
          : `/api/admin/case-studies/${initial?.slug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/case-studies");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-3xl space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (mode === "create" && !slug) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                );
              }
            }}
            className="admin-input"
          />
        </Field>
        <Field label="Slug">
          <input
            required={mode === "create"}
            value={slug}
            disabled={mode === "edit"}
            onChange={(e) => setSlug(e.target.value)}
            className="admin-input disabled:opacity-60"
          />
        </Field>
      </div>

      <Field label="Summary">
        <textarea
          required
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="admin-input resize-y"
        />
      </Field>

      <ImageUploadField value={cover} onChange={setCover} label="Cover image" />

      <Field label="Cover alt text">
        <input
          value={coverAlt}
          onChange={(e) => setCoverAlt(e.target.value)}
          className="admin-input"
        />
      </Field>

      <Field label="Visit site URL">
        <input
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          className="admin-input"
          placeholder="https://..."
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Meta</h3>
          <button
            type="button"
            className="text-xs text-muted hover:text-foreground"
            onClick={() => setMeta((prev) => [...prev, { label: "", value: "" }])}
          >
            + Add field
          </button>
        </div>
        {meta.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-3">
            <input
              value={item.label}
              onChange={(e) => updateMeta(index, "label", e.target.value)}
              placeholder="Label"
              className="admin-input"
            />
            <input
              value={item.value}
              onChange={(e) => updateMeta(index, "value", e.target.value)}
              placeholder="Value"
              className="admin-input"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">
            Content blocks
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addBlock("image")}
              className="rounded border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
            >
              + Image
            </button>
            <button
              type="button"
              onClick={() => addBlock("text")}
              className="rounded border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
            >
              + Text
            </button>
            <button
              type="button"
              onClick={() => addBlock("heading")}
              className="rounded border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
            >
              + Heading
            </button>
          </div>
        </div>

        {blocks.map((block, index) => (
          <div
            key={index}
            className="space-y-3 rounded border border-border bg-[#14110e] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted">
                {block.type}
              </span>
              <button
                type="button"
                className="text-xs text-muted hover:text-red-400"
                onClick={() =>
                  setBlocks((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </div>

            {block.type === "image" ? (
              <>
                <ImageUploadField
                  value={block.src}
                  onChange={(src) => updateBlock(index, { ...block, src })}
                  label="Image"
                />
                <input
                  value={block.alt}
                  onChange={(e) =>
                    updateBlock(index, { ...block, alt: e.target.value })
                  }
                  placeholder="Alt text"
                  className="admin-input"
                />
              </>
            ) : null}

            {block.type === "text" ? (
              <textarea
                rows={4}
                value={block.body}
                onChange={(e) =>
                  updateBlock(index, { ...block, body: e.target.value })
                }
                className="admin-input resize-y"
                placeholder="Paragraph…"
              />
            ) : null}

            {block.type === "heading" ? (
              <>
                <input
                  value={block.title}
                  onChange={(e) =>
                    updateBlock(index, { ...block, title: e.target.value })
                  }
                  placeholder="Section title"
                  className="admin-input"
                />
                <textarea
                  rows={4}
                  value={block.paragraphs.join("\n\n")}
                  onChange={(e) =>
                    updateBlock(index, {
                      ...block,
                      paragraphs: e.target.value
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean),
                    })
                  }
                  className="admin-input resize-y"
                  placeholder="Paragraphs separated by a blank line"
                />
              </>
            ) : null}
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Publish case study"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/case-studies")}
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
