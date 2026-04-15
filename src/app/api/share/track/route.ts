import { NextResponse } from "next/server";

import { trackReferralVisit } from "@/lib/data";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    shareCode?: string;
    quizId?: string;
    visitorSessionId?: string;
  };

  if (!body.shareCode || !body.quizId) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await trackReferralVisit({
    shareCode: body.shareCode,
    quizId: body.quizId,
    visitorSessionId: body.visitorSessionId,
  });

  return NextResponse.json({ success: true });
}
