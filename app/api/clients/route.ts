import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { THERAPIST } from "@/lib/personas";

export async function GET() {
  try {
    // Get the therapist
    const therapist = await prisma.user.findUnique({
      where: { email: THERAPIST.email },
    });

    if (!therapist) {
      return NextResponse.json({ clients: [] });
    }

    // Get all clients for this therapist
    const clients = await prisma.client.findMany({
      where: { therapistId: therapist.id },
      include: {
        sessions: {
          orderBy: { date: "desc" },
          take: 1,
          include: {
            planVersions: {
              orderBy: { versionNumber: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { displayName: "asc" },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

