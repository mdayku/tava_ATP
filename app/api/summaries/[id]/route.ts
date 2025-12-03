import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const summaryId = Number(params.id);

  if (isNaN(summaryId)) {
    return NextResponse.json({ error: "Invalid summary ID" }, { status: 400 });
  }

  try {
    await prisma.sessionSummary.delete({
      where: { id: summaryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting summary:", error);
    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}

