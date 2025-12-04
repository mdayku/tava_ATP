import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { THERAPIST } from "@/lib/personas";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("clientId") as string | null;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: "File and client ID are required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: Number(clientId) },
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

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let transcript = "";

    // Check file type and parse accordingly
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      // Parse Word document
      const result = await mammoth.extractRawText({ buffer });
      transcript = result.value;
    } else if (fileName.endsWith(".txt")) {
      // Plain text file
      transcript = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload .doc, .docx, or .txt files." },
        { status: 400 }
      );
    }

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "File appears to be empty" },
        { status: 400 }
      );
    }

    // Create session with uploaded transcript
    const session = await prisma.session.create({
      data: {
        clientId: client.id,
        therapistId: therapist.id,
        source: "manual",
        transcript: transcript.trim(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      clientId: client.id,
      therapistId: therapist.id,
      transcriptLength: transcript.length,
    });
  } catch (error) {
    console.error("Error uploading transcript:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

