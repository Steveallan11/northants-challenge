import { NextResponse } from "next/server";

import { createAdminSession } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    if (!body.idToken) {
      return NextResponse.json({ success: false, message: "Missing Firebase ID token." }, { status: 400 });
    }

    await createAdminSession(body.idToken);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to create admin session.",
      },
      { status: 401 },
    );
  }
}
