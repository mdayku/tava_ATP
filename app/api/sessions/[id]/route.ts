import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = Number(params.id);

  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      client: true,
      therapist: true,
      planVersions: {
        orderBy: { versionNumber: "desc" },
      },
      summaries: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = Number(params.id);

  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  try {
    // Delete related records first (cascade)
    await prisma.treatmentPlanVersion.deleteMany({
      where: { sessionId },
    });

    await prisma.sessionSummary.deleteMany({
      where: { sessionId },
    });

    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
