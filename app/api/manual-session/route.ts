import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { THERAPIST } from "@/lib/personas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, transcript } = body as {
      clientId: number;
      transcript: string;
    };

    if (!clientId || !transcript) {
      return NextResponse.json(
        { error: "Client ID and transcript are required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Ensure therapist exists
    const therapist = await prisma.user.upsert({
      where: { email: THERAPIST.email },
      update: {},
      create: {
        email: THERAPIST.email,
        name: THERAPIST.name,
        role: "therapist",
      },
    });

    // Create session with manual transcript
    const session = await prisma.session.create({
      data: {
        clientId: client.id,
        therapistId: therapist.id,
        source: "manual",
        transcript,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      clientId: client.id,
      therapistId: therapist.id,
    });
  } catch (error) {
    console.error("Error creating manual session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

