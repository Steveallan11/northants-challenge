import { NextResponse } from "next/server";

import { dbQuery, hasDatabase } from "@/lib/db";
import { hasFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET() {
  const checks = {
    databaseConfigured: hasDatabase(),
    firebaseAdminConfigured: hasFirebaseAdmin(),
    databaseReachable: false,
    timestamp: new Date().toISOString(),
  };

  if (checks.databaseConfigured) {
    try {
      await dbQuery("select 1");
      checks.databaseReachable = true;
    } catch {
      checks.databaseReachable = false;
    }
  }

  const ok = checks.databaseConfigured && checks.firebaseAdminConfigured && checks.databaseReachable;

  return NextResponse.json(
    {
      ok,
      checks,
    },
    {
      status: ok ? 200 : 503,
    },
  );
}
