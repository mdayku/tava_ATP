import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CLIENT_PERSONAS, THERAPIST } from "@/lib/personas";
import { chatText } from "@/lib/openai";
import {
  SIMULATE_SESSION_SYSTEM,
  buildSimulateSessionUserPrompt,
  SessionContext,
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

    // Build context from previous sessions and plans
    let context: SessionContext | undefined;
    
    if (sessionNumber > 1) {
      // Get previous sessions with their summaries
      const previousSessions = await prisma.session.findMany({
        where: { clientId: client.id },
        orderBy: { date: "desc" },
        take: 3, // Last 3 sessions for context
        include: {
          summaries: true,
          planVersions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      });

      // Get the most recent treatment plan
      const latestPlanSession = previousSessions.find(s => s.planVersions.length > 0);
      const latestPlan = latestPlanSession?.planVersions[0];

      context = {
        previousSessions: previousSessions.map((s, idx) => {
          const summary = s.summaries;
          let keyTopics = "Session conducted";
          
          if (summary) {
            try {
              const therapistView = JSON.parse(summary.therapistView as string);
              if (therapistView.bullet_points) {
                keyTopics = therapistView.bullet_points.slice(0, 2).join("; ");
              } else if (therapistView.raw_text) {
                keyTopics = therapistView.raw_text.slice(0, 150);
              }
            } catch {
              // Use default
            }
          }
          
          return {
            sessionNumber: previousSessions.length - idx,
            date: s.date.toLocaleDateString(),
            keyTopics,
          };
        }),
      };

      if (latestPlan) {
        try {
          const plan = JSON.parse(latestPlan.therapistView as string);
          context.currentPlan = {
            presenting_concerns: plan.presenting_concerns || "",
            goals: plan.goals || { short_term: [], long_term: [] },
            homework: plan.homework || [],
            strengths: plan.strengths || [],
          };
        } catch {
          // Skip plan context if parsing fails
        }
      }
    }

    // Generate transcript using AI
    const transcript = await chatText({
      system: SIMULATE_SESSION_SYSTEM,
      user: buildSimulateSessionUserPrompt({
        persona,
        sessionNumber,
        focus,
        context,
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
