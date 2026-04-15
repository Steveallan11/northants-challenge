import { NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/data";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
