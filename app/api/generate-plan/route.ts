import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chatJson } from "@/lib/openai";
import { PLAN_SYSTEM, buildPlanUserPrompt, TreatmentPlanJson } from "@/lib/prompts/plan";
import { CLIENT_PLAN_SYSTEM, buildClientPlanUserPrompt, ClientPlanJson } from "@/lib/prompts/clientPlan";
import { scanTranscriptForRisk } from "@/lib/riskScanner";

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

    // 1) Generate core treatment plan (therapist-facing)
    const therapistPlan = await chatJson<TreatmentPlanJson>({
      system: PLAN_SYSTEM,
      user: buildPlanUserPrompt(transcript),
    });

    // 2) Generate client-friendly plan
    const clientPlan = await chatJson<ClientPlanJson>({
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
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate treatment plan" },
      { status: 500 }
    );
  }
}

