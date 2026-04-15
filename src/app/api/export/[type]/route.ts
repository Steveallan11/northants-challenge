import { NextResponse } from "next/server";
import Papa from "papaparse";

import { getExportRows } from "@/lib/data";

const exportTypes = new Set(["players", "newsletter", "attempts", "leaderboard"]);

export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!exportTypes.has(type)) {
    return NextResponse.json({ success: false, message: "Invalid export type." }, { status: 400 });
  }

  const rows = await getExportRows(type as "players" | "newsletter" | "attempts" | "leaderboard");
  const csv = Papa.unparse(rows as Array<Record<string, unknown>>);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
    },
  });
}
