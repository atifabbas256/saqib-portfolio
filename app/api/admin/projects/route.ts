import { NextResponse } from "next/server";
import {
  getWorkItems,
  saveWorkItems,
  slugify,
} from "@/lib/content";
import { requireAdmin } from "@/lib/admin/auth";
import type { WorkItem } from "@/lib/work";

export async function GET() {
  try {
    await requireAdmin();
    const items = await getWorkItems();
    return NextResponse.json(
      items.filter((item) => item.category === "project"),
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as Partial<WorkItem>;

    if (!body.name?.trim() || !body.image?.trim()) {
      return NextResponse.json(
        { error: "Name and image are required" },
        { status: 400 },
      );
    }

    const items = await getWorkItems();
    const id = slugify(body.id || body.name);
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    if (items.some((item) => item.id === id)) {
      return NextResponse.json(
        { error: "A work item with this id already exists" },
        { status: 409 },
      );
    }

    const item: WorkItem = {
      id,
      name: body.name.trim(),
      meta: body.meta?.trim() || "Project",
      year: body.year?.trim() || new Date().getFullYear().toString(),
      image: body.image.trim(),
      category: "project",
      aspect: body.aspect?.trim() || "346 / 260",
      href: body.href?.trim() || "#",
      comingSoon: Boolean(body.comingSoon),
    };

    items.push(item);
    await saveWorkItems(items);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
