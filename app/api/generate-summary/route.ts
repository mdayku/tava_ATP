import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chatJson } from "@/lib/openai";
import { SUMMARY_SYSTEM, buildSummaryUserPrompt, SessionSummaryJson } from "@/lib/prompts/summary";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body as { sessionId: number };

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const transcript = session.transcript;

    // Generate summary using AI
    const summary = await chatJson<SessionSummaryJson>({
      system: SUMMARY_SYSTEM,
      user: buildSummaryUserPrompt(transcript),
    });

    // Upsert summary (update if exists, create if not)
    const summaryRow = await prisma.sessionSummary.upsert({
      where: { sessionId: session.id },
      update: {
        therapistView: JSON.stringify(summary.therapist_view),
        clientView: JSON.stringify(summary.client_view),
      },
      create: {
        sessionId: session.id,
        therapistView: JSON.stringify(summary.therapist_view),
        clientView: JSON.stringify(summary.client_view),
      },
    });

    return NextResponse.json({
      summaryId: summaryRow.id,
      therapistView: summary.therapist_view,
      clientView: summary.client_view,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate session summary" },
      { status: 500 }
    );
  }
}

