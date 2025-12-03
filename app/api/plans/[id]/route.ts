import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const planId = Number(params.id);

  if (isNaN(planId)) {
    return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
  }

  try {
    await prisma.treatmentPlanVersion.delete({
      where: { id: planId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}

