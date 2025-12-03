import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = Number(params.id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        client: true,
        therapist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        planVersions: {
          orderBy: { versionNumber: "desc" },
        },
        summaries: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Parse JSON fields
    const planVersions = session.planVersions.map((pv) => ({
      ...pv,
      therapistView: JSON.parse(pv.therapistView),
      clientView: JSON.parse(pv.clientView),
      riskFlags: JSON.parse(pv.riskFlags),
    }));

    const summaries = session.summaries
      ? {
          ...session.summaries,
          therapistView: JSON.parse(session.summaries.therapistView),
          clientView: JSON.parse(session.summaries.clientView),
        }
      : null;

    return NextResponse.json({
      session: {
        ...session,
        planVersions,
        summaries,
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
