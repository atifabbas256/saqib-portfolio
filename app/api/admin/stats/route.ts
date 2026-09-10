import { NextResponse } from "next/server";
import { getContentStats } from "@/lib/content";

export async function GET() {
  const stats = await getContentStats();
  return NextResponse.json(stats);
}
