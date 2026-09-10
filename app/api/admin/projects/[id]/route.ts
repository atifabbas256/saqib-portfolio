import { NextResponse } from "next/server";
import { getWorkItems, saveWorkItems } from "@/lib/content";
import { requireAdmin } from "@/lib/admin/auth";
import type { WorkItem } from "@/lib/work";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const items = await getWorkItems();
    const item = items.find(
      (entry) => entry.id === id && entry.category === "project",
    );
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = (await request.json()) as Partial<WorkItem>;
    const items = await getWorkItems();
    const index = items.findIndex(
      (entry) => entry.id === id && entry.category === "project",
    );
    if (index < 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const current = items[index]!;
    const updated: WorkItem = {
      ...current,
      name: body.name?.trim() || current.name,
      meta: body.meta?.trim() || current.meta,
      year: body.year?.trim() || current.year,
      image: body.image?.trim() || current.image,
      aspect: body.aspect?.trim() || current.aspect,
      href: body.href?.trim() || current.href,
      comingSoon:
        body.comingSoon === undefined
          ? current.comingSoon
          : Boolean(body.comingSoon),
      category: "project",
    };

    items[index] = updated;
    await saveWorkItems(items);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const items = await getWorkItems();
    const next = items.filter(
      (entry) => !(entry.id === id && entry.category === "project"),
    );
    if (next.length === items.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await saveWorkItems(next);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
