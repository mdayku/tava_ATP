import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planVersionId, therapistView, clientView } = body as {
      planVersionId: number;
      therapistView?: object;
      clientView?: object;
    };

    if (!planVersionId) {
      return NextResponse.json(
        { error: "Plan version ID is required" },
        { status: 400 }
      );
    }

    // Find the existing plan
    const existingPlan = await prisma.treatmentPlanVersion.findUnique({
      where: { id: planVersionId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update the plan
    const updatedPlan = await prisma.treatmentPlanVersion.update({
      where: { id: planVersionId },
      data: {
        therapistView: therapistView 
          ? JSON.stringify(therapistView) 
          : existingPlan.therapistView,
        clientView: clientView 
          ? JSON.stringify(clientView) 
          : existingPlan.clientView,
        editedByTherapist: true,
      },
    });

    return NextResponse.json({
      planVersionId: updatedPlan.id,
      therapistView: JSON.parse(updatedPlan.therapistView),
      clientView: JSON.parse(updatedPlan.clientView),
      editedByTherapist: updatedPlan.editedByTherapist,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

