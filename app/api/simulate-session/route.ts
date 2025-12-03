import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CLIENT_PERSONAS, THERAPIST } from "@/lib/personas";
import { chatText } from "@/lib/openai";
import {
  SIMULATE_SESSION_SYSTEM,
  buildSimulateSessionUserPrompt,
} from "@/lib/prompts/simulateSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientPersonaId, sessionNumber = 1, focus } = body as {
      clientPersonaId: keyof typeof CLIENT_PERSONAS;
      sessionNumber?: number;
      focus?: string;
    };

    const persona = CLIENT_PERSONAS[clientPersonaId];
    if (!persona) {
      return NextResponse.json({ error: "Unknown persona" }, { status: 400 });
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

    // Ensure client exists
    const client = await prisma.client.upsert({
      where: {
        therapistId_personaId: {
          therapistId: therapist.id,
          personaId: persona.id,
        },
      },
      update: {},
      create: {
        therapistId: therapist.id,
        displayName: persona.displayName,
        personaId: persona.id,
      },
    });

    // Generate transcript using AI
    const transcript = await chatText({
      system: SIMULATE_SESSION_SYSTEM,
      user: buildSimulateSessionUserPrompt({
        persona,
        sessionNumber,
        focus,
      }),
    });

    // Save session to database
    const session = await prisma.session.create({
      data: {
        clientId: client.id,
        therapistId: therapist.id,
        source: "synthetic",
        transcript,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      transcript,
      clientId: client.id,
      therapistId: therapist.id,
    });
  } catch (error) {
    console.error("Error simulating session:", error);
    return NextResponse.json(
      { error: "Failed to simulate session" },
      { status: 500 }
    );
  }
}

