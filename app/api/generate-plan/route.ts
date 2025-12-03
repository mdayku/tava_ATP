import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chatJson } from "@/lib/openai";
import { PLAN_SYSTEM, buildPlanUserPrompt, PreviousPlan } from "@/lib/prompts/plan";
import { CLIENT_PLAN_SYSTEM, buildClientPlanUserPrompt } from "@/lib/prompts/clientPlan";
import { scanTranscriptForRisk } from "@/lib/riskScanner";

interface TreatmentPlanJson {
  presenting_concerns: string;
  clinical_impressions: string;
  goals: {
    short_term: string[];
    long_term: string[];
  };
  interventions: string[];
  homework: string[];
  strengths: string[];
  risk_indicators: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body as { sessionId: number };

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        client: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const transcript = session.transcript;

    // Find previous plan for this client (from any previous session)
    let previousPlan: PreviousPlan | undefined;
    
    const previousSessions = await prisma.session.findMany({
      where: {
        clientId: session.clientId,
        id: { not: session.id },
        date: { lt: session.date },
      },
      orderBy: { date: "desc" },
      include: {
        planVersions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    // Find the most recent session with a plan
    const sessionWithPlan = previousSessions.find(s => s.planVersions.length > 0);
    
    if (sessionWithPlan && sessionWithPlan.planVersions[0]) {
      const prevPlanData = sessionWithPlan.planVersions[0];
      const parsedPlan = JSON.parse(prevPlanData.therapistView as string);
      
      // Count sessions to get session number
      const allClientSessions = await prisma.session.findMany({
        where: { clientId: session.clientId },
        orderBy: { date: "asc" },
      });
      const prevSessionNumber = allClientSessions.findIndex(s => s.id === sessionWithPlan.id) + 1;
      
      previousPlan = {
        sessionNumber: prevSessionNumber,
        date: sessionWithPlan.date.toLocaleDateString(),
        presenting_concerns: parsedPlan.presenting_concerns || "",
        goals: parsedPlan.goals || { short_term: [], long_term: [] },
        interventions: parsedPlan.interventions || [],
        homework: parsedPlan.homework || [],
        strengths: parsedPlan.strengths || [],
        risk_indicators: parsedPlan.risk_indicators || [],
      };
    }

    // 1) Generate core treatment plan (therapist-facing)
    const therapistPlan = await chatJson<TreatmentPlanJson>({
      system: PLAN_SYSTEM,
      user: buildPlanUserPrompt(transcript, previousPlan),
    });

    // 2) Generate client-friendly plan
    const clientPlan = await chatJson<TreatmentPlanJson>({
      system: CLIENT_PLAN_SYSTEM,
      user: buildClientPlanUserPrompt(therapistPlan),
    });

    // 3) Perform lexical risk scan
    const riskScan = scanTranscriptForRisk(transcript);

    // Determine next version number for this session
    const existingVersions = await prisma.treatmentPlanVersion.findMany({
      where: { sessionId: session.id },
      orderBy: { versionNumber: "desc" },
      take: 1,
    });

    const nextVersionNumber =
      existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : 1;

    // Save plan version to database
    const planVersion = await prisma.treatmentPlanVersion.create({
      data: {
        sessionId: session.id,
        versionNumber: nextVersionNumber,
        therapistView: JSON.stringify(therapistPlan),
        clientView: JSON.stringify(clientPlan),
        riskFlags: JSON.stringify({
          hasCrisisLanguage: riskScan.hasCrisisLanguage,
          keywords: riskScan.keywords,
          excerpts: riskScan.excerpts,
        }),
      },
    });

    return NextResponse.json({
      planVersionId: planVersion.id,
      versionNumber: planVersion.versionNumber,
      therapistView: therapistPlan,
      clientView: clientPlan,
      riskFlags: {
        hasCrisisLanguage: riskScan.hasCrisisLanguage,
        keywords: riskScan.keywords,
        excerpts: riskScan.excerpts,
      },
      isUpdate: !!previousPlan,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate treatment plan" },
      { status: 500 }
    );
  }
}
