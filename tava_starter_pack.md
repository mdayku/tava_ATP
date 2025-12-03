# Tava AI-Assisted Treatment Plans – Starter Pack (with Code Scaffolds)

This starter pack gives you a **single source of truth** for the Gauntlet x Tava Health challenge:
- A focused **MVP scope** that fits in ~half a day
- Data models and API contracts
- AI prompting specs (including **synthetic transcript generation**)
- Next.js + Prisma file structure
- Core **code scaffolds** for Prisma, API routes, and basic pages
- Clear next steps if you want to go further

You can drop this file into your repo as `TAVA_STARTER_PACK.md` and copy/paste the code blocks into the appropriate files.

---

## 1. MVP Scope (What You’ll Actually Build)

You will build a tiny but complete Tava-style app with:

1. **Two roles & dashboards**
   - **Therapist**: see mock clients, sessions, upload/paste transcripts, generate & edit plans.
   - **Client**: see their friendly plan, goals, homework, and summaries.

2. **Session input**
   - Paste or upload **synthetic transcripts** (we’ll generate them from personas).
   - Each transcript is attached to a therapist, client, and session.

3. **AI-generated treatment plans**
   - Parse transcript into structured JSON:
     - Presenting concerns  
     - Optional clinical impressions  
     - Goals (short-term / long-term)  
     - Interventions / approaches (CBT, ACT, DBT, etc.)  
     - Homework / between-session actions  
     - Strengths / protective factors  
     - Risk indicators / red flags  
   - Generate **two views** off the same underlying structure:
     - Therapist view (clinical, documentation-ready)
     - Client view (plain language, strengths-based, motivational)

4. **Optional requirements you *will* implement**
   - **Treatment plan lifecycle & versioning**  
     - New session → new version of the plan + “last updated” & simple timeline.
   - **Session summaries**  
     - Therapist summary (clinical note helper).
     - Client summary (“What we worked on today”).
   - **Safety & ethics awareness**  
     - Detect crisis language (e.g., self-harm, harm to others) and flag in therapist view.

5. **Synthetic session simulator**
   - Built-in **session generator** that uses LLMs and predefined personas to create mock transcripts.
   - Lets you test the system end-to-end with no real PHI.

6. **DX & tests**
   - One clean **README**.
   - At least one unit test around parsing & validating model output (treatment plan JSON).

---

## 2. Personas & Synthetic Transcripts

You’ll explicitly define a tiny roster of synthetic clients so everything feels concrete.

### 2.1 Therapist Persona

You only need **one therapist** for MVP:

- **Dr. Avery Rhodes, PhD**
  - Modalities: CBT, ACT
  - Population: adults 25–45, primarily anxiety/depression
  - Style: collaborative, warm, structured, goal-oriented

### 2.2 Client Personas (Examples)

Start with 4 clients you can reuse in synthetic generation:

1. **Client: Alex (they/them, 28)**  
   - Presenting concerns: generalized anxiety, perfectionism, difficulty sleeping.  
   - Context: works in tech, worries about performance and layoffs.  
   - Prior therapy: limited.

2. **Client: Jordan (he/him, 35)**  
   - Presenting concerns: burnout, low mood, anhedonia.  
   - Context: new parent, high workload, guilt about “not doing enough” at home.  

3. **Client: Maya (she/her, 22)**  
   - Presenting concerns: social anxiety, rumination, fear of judgment.  
   - Context: college senior, stressed about graduation and job search.  

4. **Client: Sam (they/them, 40)** – safety testing persona  
   - Presenting concerns: depression with **intermittent suicidal ideation (SI)**  
   - Context: recently divorced, limited social support.  
   - Use for **crisis language detection**.

---

## 3. Data Model (Prisma)

Use **Prisma + SQLite** for the half-day build. You can swap to Postgres later.

Create `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  role      String   // "therapist" | "client"
  name      String
  email     String   @unique
  createdAt DateTime @default(now())

  therapistClients Client[]   @relation("TherapistClients")
  clientProfile    Client?    @relation("ClientUser", fields: [clientProfileId], references: [id])
  clientProfileId  Int?
}

model Client {
  id           Int       @id @default(autoincrement())
  user         User?     @relation("ClientUser")
  therapist    User      @relation("TherapistClients", fields: [therapistId], references: [id])
  therapistId  Int
  displayName  String
  personaId    String    // "alex", "jordan", etc. for synthetic generation
  createdAt    DateTime  @default(now())

  sessions     Session[]
}

model Session {
  id           Int       @id @default(autoincrement())
  client       Client    @relation(fields: [clientId], references: [id])
  clientId     Int
  therapist    User      @relation(fields: [therapistId], references: [id])
  therapistId  Int

  source       String    @default("synthetic") // "synthetic" | "manual"
  date         DateTime  @default(now())
  transcript   String
  createdAt    DateTime  @default(now())

  summaries    SessionSummary?
  planVersions TreatmentPlanVersion[]
}

model SessionSummary {
  id             Int       @id @default(autoincrement())
  session        Session   @relation(fields: [sessionId], references: [id])
  sessionId      Int

  therapistView  Json
  clientView     Json
  createdAt      DateTime  @default(now())
}

model TreatmentPlanVersion {
  id             Int       @id @default(autoincrement())
  session        Session   @relation(fields: [sessionId], references: [id])
  sessionId      Int

  versionNumber  Int
  therapistView  Json
  clientView     Json
  riskFlags      Json      // e.g. { hasCrisisLanguage: true, keywords: [...] }
  createdAt      DateTime  @default(now())

  editedByTherapist Boolean @default(false)
}
```

Run:

```bash
npx prisma migrate dev --name init
```

---

## 4. Library Helpers

### 4.1 `lib/openai.ts` – LLM Client Wrapper

```ts
// lib/openai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatJson(options: {
  system: string;
  user: string;
}) {
  const { system, user } = options;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content from model");
  }

  return JSON.parse(content);
}

export async function chatText(options: {
  system: string;
  user: string;
}) {
  const { system, user } = options;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content from model");
  }

  return content;
}
```

### 4.2 `lib/personas.ts` – Hardcoded Therapist + Clients

```ts
// lib/personas.ts

export type ClientPersonaId = "alex" | "jordan" | "maya" | "sam";

export interface ClientPersona {
  id: ClientPersonaId;
  displayName: string;
  age: number;
  pronouns: string;
  presentingConcerns: string;
  context: string;
  notes: string;
}

export const THERAPIST = {
  id: "avery",
  name: "Dr. Avery Rhodes",
  modalities: ["CBT", "ACT"],
  style: "collaborative, warm, structured, goal-oriented",
};

export const CLIENT_PERSONAS: Record<ClientPersonaId, ClientPersona> = {
  alex: {
    id: "alex",
    displayName: "Alex",
    age: 28,
    pronouns: "they/them",
    presentingConcerns: "generalized anxiety, perfectionism, difficulty sleeping",
    context: "works in tech, worried about performance and layoffs",
    notes: "highly self-critical, wants practical tools",
  },
  jordan: {
    id: "jordan",
    displayName: "Jordan",
    age: 35,
    pronouns: "he/him",
    presentingConcerns: "burnout, low mood, loss of interest",
    context: "new parent, high workload, guilt about not doing enough at home",
    notes: "values family, struggles with boundaries",
  },
  maya: {
    id: "maya",
    displayName: "Maya",
    age: 22,
    pronouns: "she/her",
    presentingConcerns: "social anxiety, fear of judgment, rumination",
    context: "college senior, stressed about graduation and job search",
    notes: "insightful, motivated, avoids social situations",
  },
  sam: {
    id: "sam",
    displayName: "Sam",
    age: 40,
    pronouns: "they/them",
    presentingConcerns: "depression with intermittent suicidal ideation",
    context: "recently divorced, limited social support",
    notes: "used for testing crisis language detection",
  },
};
```

### 4.3 `lib/prompts/*` – Prompt Specs

Create a folder `lib/prompts`.

#### `lib/prompts/simulateSession.ts`

```ts
// lib/prompts/simulateSession.ts
import type { ClientPersona } from "../personas";

export const SIMULATE_SESSION_SYSTEM = `
You are simulating a 50-minute individual therapy session between a licensed
therapist and a single client. Write a realistic, trauma-informed, ethically
appropriate therapy dialogue as plain text.

Constraints:
- Do NOT include any identifying real-world information.
- The session should alternate between THERAPIST: and CLIENT: lines.
- The therapist should use a CBT/ACT style: collaborative, present-focused,
  goal-oriented, and strengths-based.
- The transcript should clearly surface:
  - presenting concerns
  - recent events
  - emotional states
  - relevant thoughts and behaviors
  - some mention of homework or between-session actions

Be clinically realistic but not graphic. If the persona has suicidal ideation or
self-harm thoughts, describe them in professional, non-sensationalized language.

At the end of the dialogue, ensure there is at least one explicit statement
from the therapist about homework, next steps, or goals.

Return ONLY the raw transcript text with THERAPIST: and CLIENT: prefixes.
`;

export function buildSimulateSessionUserPrompt(args: {
  persona: ClientPersona;
  sessionNumber: number;
  focus?: string;
}) {
  const { persona, sessionNumber, focus } = args;

  return `Client persona JSON:
${JSON.stringify(persona, null, 2)}

Session number: ${sessionNumber}
Focus: ${focus || "general session aligned with presenting concerns"}

Generate the transcript now.`;
}
```

#### `lib/prompts/plan.ts`

```ts
// lib/prompts/plan.ts

export const PLAN_SYSTEM = `
You are a licensed mental health clinician writing structured treatment plans
based on a therapy session transcript. You produce clinically sound, structured
outputs that other clinicians could use as a starting point.

You must respond ONLY with valid JSON matching this schema:

{
  "presenting_concerns": "string",
  "clinical_impressions": "string",
  "goals": {
    "short_term": ["string"],
    "long_term": ["string"]
  },
  "interventions": ["string"],
  "homework": ["string"],
  "strengths": ["string"],
  "risk_indicators": ["string"]
}

Guidelines:
- Use professional clinical language.
- Be specific and behaviorally anchored.
- Only include risk indicators if the transcript supports them.
- If a field is not applicable, use an empty string ("") or empty array ([]).
- Do NOT include any extra keys.
`;

export function buildPlanUserPrompt(transcript: string) {
  return `Here is a therapy session transcript between a therapist and a single client.

Transcript:
${transcript}

Generate a structured treatment plan JSON now.`;
}
```

#### `lib/prompts/clientPlan.ts`

```ts
// lib/prompts/clientPlan.ts

export const CLIENT_PLAN_SYSTEM = `
You are rewriting a mental health treatment plan for a client to read.
The input is a JSON object with structured clinical information.
You must output JSON with the EXACT SAME KEYS, but rewrite all values in
warm, plain, encouraging language at an 8th-grade reading level.

- Keep all arrays the same length.
- Keep the overall meaning but avoid medical jargon.
- Emphasize strengths, progress, and actionable next steps.
- Do not add risk indicators unless present in the input JSON.
`;

export function buildClientPlanUserPrompt(therapistPlanJson: any) {
  return `Here is the therapist-facing treatment plan JSON:

${JSON.stringify(therapistPlanJson, null, 2)}

Rewrite it for the client following the rules above.`;
}
```

#### `lib/prompts/summary.ts`

```ts
// lib/prompts/summary.ts

export const SUMMARY_SYSTEM = `
You summarize therapy sessions for both clinicians and clients.

Given a transcript, produce two summaries:
1) therapist_view: clinical, concise, organized by domains (mood, behavior,
   stressors, progress toward goals).
2) client_view: warm, encouraging, focusing on "what we worked on",
   "insights", and "what's next".

Respond ONLY with valid JSON:

{
  "therapist_view": {
    "raw_text": "string",
    "bullet_points": ["string"]
  },
  "client_view": {
    "headline": "string",
    "what_we_did": ["string"],
    "next_steps": ["string"]
  }
}
`;

export function buildSummaryUserPrompt(transcript: string) {
  return `Transcript:
${transcript}

Generate the summary JSON now.`;
}
```

#### `lib/prompts/risk.ts`

```ts
// lib/prompts/risk.ts

export const RISK_SYSTEM = `
You are assisting with risk assessment by classifying language in a therapy
session transcript. You are conservative and err on the side of caution.
You are NOT making clinical decisions; you only flag text for a clinician.

Respond ONLY with valid JSON of the form:

{
  "has_crisis_language": true,
  "risk_category": "none" | "passive_SI" | "active_SI" | "harm_others" | "other",
  "evidence_snippets": ["string"]
}
`;

export function buildRiskUserPrompt(transcript: string) {
  return `Transcript:
${transcript}

Analyze the transcript and fill out the JSON above.
If there is no crisis language, use:

{
  "has_crisis_language": false,
  "risk_category": "none",
  "evidence_snippets": []
}`;
}
```

#### `lib/riskScanner.ts` – Simple Keyword Scanner

```ts
// lib/riskScanner.ts

export interface RiskScanResult {
  hasCrisisLanguage: boolean;
  keywords: string[];
  excerpts: string[];
}

const KEYWORDS = [
  "kill myself",
  "end my life",
  "suicidal",
  "suicide",
  "self-harm",
  "hurt myself",
  "hurt someone",
  "harm others",
  "don't want to live",
];

export function scanTranscriptForRisk(transcript: string): RiskScanResult {
  const lower = transcript.toLowerCase();
  const foundKeywords: string[] = [];
  const excerpts: string[] = [];

  for (const kw of KEYWORDS) {
    if (lower.includes(kw)) {
      foundKeywords.push(kw);
      // Grab a small excerpt around the keyword
      const idx = lower.indexOf(kw);
      const start = Math.max(0, idx - 80);
      const end = Math.min(transcript.length, idx + kw.length + 80);
      excerpts.push(transcript.slice(start, end));
    }
  }

  return {
    hasCrisisLanguage: foundKeywords.length > 0,
    keywords: foundKeywords,
    excerpts,
  };
}
```

---

## 5. API Routes (Next.js App Router)

Assuming `app/` directory structure.

### 5.1 `app/api/simulate-session/route.ts`

```ts
// app/api/simulate-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CLIENT_PERSONAS } from "@/lib/personas";
import { chatText } from "@/lib/openai";
import {
  SIMULATE_SESSION_SYSTEM,
  buildSimulateSessionUserPrompt,
} from "@/lib/prompts/simulateSession";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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

  // For MVP: assume a single therapist user exists with id=1
  // and one Client row per persona.
  const therapist = await prisma.user.upsert({
    where: { email: "avery@example.com" },
    update: {},
    create: {
      email: "avery@example.com",
      name: "Dr. Avery Rhodes",
      role: "therapist",
    },
  });

  const client = await prisma.client.upsert({
    where: {
      // Unique composite mapping: therapistId + personaId
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

  const transcript = await chatText({
    system: SIMULATE_SESSION_SYSTEM,
    user: buildSimulateSessionUserPrompt({
      persona,
      sessionNumber,
      focus,
    }),
  });

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
}
```

> **Note:** You’ll want a unique constraint on `(therapistId, personaId)` for Client. Add this to `schema.prisma`:

```prisma
model Client {
  // ...
  @@unique([therapistId, personaId], name: "therapistId_personaId")
}
```

### 5.2 `app/api/generate-plan/route.ts`

```ts
// app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { chatJson } from "@/lib/openai";
import { PLAN_SYSTEM, buildPlanUserPrompt } from "@/lib/prompts/plan";
import {
  CLIENT_PLAN_SYSTEM,
  buildClientPlanUserPrompt,
} from "@/lib/prompts/clientPlan";
import { scanTranscriptForRisk } from "@/lib/riskScanner";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId } = body as { sessionId: number };

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const transcript = session.transcript;

  // 1) core treatment plan (therapist-facing)
  const therapistPlan = await chatJson({
    system: PLAN_SYSTEM,
    user: buildPlanUserPrompt(transcript),
  });

  // 2) client-friendly plan
  const clientPlan = await chatJson({
    system: CLIENT_PLAN_SYSTEM,
    user: buildClientPlanUserPrompt(therapistPlan),
  });

  // 3) lexical risk scan
  const riskScan = scanTranscriptForRisk(transcript);

  // Determine next version number for this session
  const existingVersions = await prisma.treatmentPlanVersion.findMany({
    where: { sessionId: session.id },
    orderBy: { versionNumber: "desc" },
    take: 1,
  });

  const nextVersionNumber =
    existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : 1;

  const planVersion = await prisma.treatmentPlanVersion.create({
    data: {
      sessionId: session.id,
      versionNumber: nextVersionNumber,
      therapistView: therapistPlan,
      clientView: clientPlan,
      riskFlags: {
        hasCrisisLanguage: riskScan.hasCrisisLanguage,
        keywords: riskScan.keywords,
        excerpts: riskScan.excerpts,
      },
    },
  });

  return NextResponse.json({
    planVersionId: planVersion.id,
    versionNumber: planVersion.versionNumber,
    therapistView: therapistPlan,
    clientView: clientPlan,
    riskFlags: planVersion.riskFlags,
  });
}
```

### 5.3 `app/api/generate-summary/route.ts`

```ts
// app/api/generate-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { chatJson } from "@/lib/openai";
import {
  SUMMARY_SYSTEM,
  buildSummaryUserPrompt,
} from "@/lib/prompts/summary";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId } = body as { sessionId: number };

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const transcript = session.transcript;

  const summary = await chatJson({
    system: SUMMARY_SYSTEM,
    user: buildSummaryUserPrompt(transcript),
  });

  const summaryRow = await prisma.sessionSummary.upsert({
    where: { sessionId: session.id },
    update: {
      therapistView: summary.therapist_view,
      clientView: summary.client_view,
    },
    create: {
      sessionId: session.id,
      therapistView: summary.therapist_view,
      clientView: summary.client_view,
    },
  });

  return NextResponse.json({
    summaryId: summaryRow.id,
    therapistView: summary.therapist_view,
    clientView: summary.client_view,
  });
}
```

---

## 6. UI Skeleton (Pages)

Assumes Next.js App Router with TypeScript.

### 6.1 `app/layout.tsx`

```tsx
// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Tava AI-Assisted Treatment Plans (Demo)",
  description: "Gauntlet x Tava challenge demo app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-5xl mx-auto py-8 px-4">{children}</div>
      </body>
    </html>
  );
}
```

### 6.2 `app/page.tsx` – Landing / “Auth”

```tsx
// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Tava AI-Assisted Treatment Plans
        </h1>
        <p className="text-slate-600">
          Minimal demo for the Gauntlet x Tava challenge. Choose a role to view
          the experience.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold">Therapist view</h2>
            <p className="text-sm text-slate-600 mt-1">
              See synthetic clients, generate AI-assisted treatment plans, track
              versions, and review risk flags.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/therapist"
              className="inline-flex items-center px-4 py-2 rounded-md border border-slate-800 text-sm font-medium"
            >
              Enter as Dr. Avery
            </Link>
          </div>
        </div>

        <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold">Client view</h2>
            <p className="text-sm text-slate-600 mt-1">
              See a friendly, plain-language treatment plan and session
              summaries as a client.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/client/1"
              className="inline-flex items-center px-4 py-2 rounded-md border border-slate-800 text-sm font-medium"
            >
              View as Alex
            </Link>
            <Link
              href="/client/2"
              className="inline-flex items-center px-4 py-2 rounded-md border border-slate-300 text-sm"
            >
              Others (Jordan/Maya/Sam…) – wire later
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### 6.3 `app/therapist/page.tsx` – Therapist Dashboard

```tsx
// app/therapist/page.tsx
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TherapistDashboardPage() {
  // For MVP: list all clients for therapist id=1
  const therapistId = 1;
  const clients = await prisma.client.findMany({
    where: { therapistId },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Therapist dashboard</h1>
        <p className="text-slate-600 text-sm">
          Synthetic clients linked to Dr. Avery. Generate sessions and plans,
          then view client-facing experiences.
        </p>
      </header>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Clients</h2>
        </div>

        <div className="border rounded-lg bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Persona</th>
                <th className="text-left px-3 py-2">Last session</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const lastSession = c.sessions[0];
                return (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">{c.displayName}</td>
                    <td className="px-3 py-2 text-slate-600">{c.personaId}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {lastSession
                        ? new Date(lastSession.date).toLocaleString()
                        : "No sessions yet"}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/therapist/clients/${c.id}`}
                        className="text-sm underline"
                      >
                        View timeline
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
```

### 6.4 `app/therapist/clients/[id]/page.tsx` – Client Timeline

```tsx
// app/therapist/clients/[id]/page.tsx
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Props {
  params: { id: string };
}

export default async function TherapistClientPage({ params }: Props) {
  const clientId = Number(params.id);
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        include: {
          planVersions: {
            orderBy: { versionNumber: "desc" },
          },
          summaries: true,
        },
      },
    },
  });

  if (!client) {
    return (
      <main className="space-y-4">
        <p>Client not found.</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {client.displayName} – timeline
        </h1>
        <p className="text-sm text-slate-600">
          Persona: <span className="font-mono">{client.personaId}</span>
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Sessions</h2>
          {/* For MVP, you can add buttons to call the APIs from the UI later */}
        </div>

        <ul className="space-y-3">
          {client.sessions.map((s) => {
            const latestPlan = s.planVersions[0];
            return (
              <li
                key={s.id}
                className="border rounded-lg bg-white p-3 space-y-1 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      Session #{s.id} –{" "}
                      {new Date(s.date).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-slate-600">
                      Source: <span className="font-mono">{s.source}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {latestPlan ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Plan v{latestPlan.versionNumber}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        No plan yet
                      </span>
                    )}
                    {latestPlan?.riskFlags &&
                      (latestPlan.riskFlags as any).hasCrisisLanguage && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          ⚠ Possible crisis language
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                  {/* In a full build, these would link to modal views or detail pages */}
                  <button className="px-2 py-1 border rounded-md">
                    View transcript
                  </button>
                  <button className="px-2 py-1 border rounded-md">
                    Generate plan
                  </button>
                  <button className="px-2 py-1 border rounded-md">
                    Generate summary
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
```

### 6.5 `app/client/[id]/page.tsx` – Client Dashboard

```tsx
// app/client/[id]/page.tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Props {
  params: { id: string };
}

export default async function ClientDashboardPage({ params }: Props) {
  const clientId = Number(params.id);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        include: {
          planVersions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
          summaries: true,
        },
      },
    },
  });

  if (!client) {
    return (
      <main className="space-y-4">
        <p>Client not found.</p>
      </main>
    );
  }

  const latestSession = client.sessions[0];
  const latestPlan = latestSession?.planVersions[0];
  const summary = latestSession?.summaries;

  const plan = latestPlan?.clientView as any | undefined;

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Hi {client.displayName}, here&apos;s your current plan
        </h1>
        <p className="text-sm text-slate-600 max-w-xl">
          This is an AI-assisted summary of your work with your therapist. It is
          a draft and not a substitute for your therapist&apos;s clinical
          judgment.
        </p>
      </header>

      {plan ? (
        <section className="space-y-4">
          <div className="border rounded-lg bg-white p-4 space-y-2">
            <h2 className="text-lg font-semibold">What you&apos;re working on</h2>
            <p className="text-sm">
              {plan.presenting_concerns || "Your therapist is still drafting this."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg bg-white p-4 space-y-2">
              <h3 className="font-semibold text-sm">Short-term goals</h3>
              <ul className="list-disc list-inside text-sm">
                {plan.goals?.short_term?.map((g: string, idx: number) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
            <div className="border rounded-lg bg-white p-4 space-y-2">
              <h3 className="font-semibold text-sm">Long-term goals</h3>
              <ul className="list-disc list-inside text-sm">
                {plan.goals?.long_term?.map((g: string, idx: number) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg bg-white p-4 space-y-2">
              <h3 className="font-semibold text-sm">Homework & practice</h3>
              <ul className="list-disc list-inside text-sm">
                {plan.homework?.map((h: string, idx: number) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
            <div className="border rounded-lg bg-white p-4 space-y-2">
              <h3 className="font-semibold text-sm">Your strengths</h3>
              <ul className="list-disc list-inside text-sm">
                {plan.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <p className="text-sm text-slate-600">
            Your therapist hasn&apos;t generated a plan for you yet.
          </p>
        </section>
      )}

      {summary && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Latest session summary</h2>
          <div className="border rounded-lg bg-white p-4 space-y-2 text-sm">
            <h3 className="font-medium">
              {summary.clientView?.headline ?? "What we worked on"}
            </h3>
            <div>
              <h4 className="font-semibold text-xs uppercase text-slate-500">
                What we did
              </h4>
              <ul className="list-disc list-inside">
                {summary.clientView?.what_we_did?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase text-slate-500">
                Next steps
              </h4>
              <ul className="list-disc list-inside">
                {summary.clientView?.next_steps?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
```

---

## 7. Minimal Test Idea (Plan JSON Validation)

You can use Vitest/Jest or Next’s built-in test runner. Example with Jest-style API:

```ts
// tests/planParsing.test.ts
import { z } from "zod";

const TreatmentPlanSchema = z.object({
  presenting_concerns: z.string(),
  clinical_impressions: z.string(),
  goals: z.object({
    short_term: z.array(z.string()),
    long_term: z.array(z.string()),
  }),
  interventions: z.array(z.string()),
  homework: z.array(z.string()),
  strengths: z.array(z.string()),
  risk_indicators: z.array(z.string()),
});

describe("TreatmentPlanSchema", () => {
  it("validates a mocked model response", () => {
    const mock = {
      presenting_concerns: "Client reports ongoing anxiety and sleep issues.",
      clinical_impressions: "Consistent with generalized anxiety disorder.",
      goals: {
        short_term: ["Practice breathing exercise 3x/week."],
        long_term: ["Reduce anxiety severity by 50% over 3 months."],
      },
      interventions: ["CBT psychoeducation on anxiety cycle"],
      homework: ["Record worry episodes in a log each evening."],
      strengths: ["Motivated to change", "Supportive partner"],
      risk_indicators: [],
    };

    const parsed = TreatmentPlanSchema.parse(mock);
    expect(parsed.goals.short_term.length).toBeGreaterThan(0);
  });
});
```

---

## 8. Quick Setup Checklist

1. Create Next.js app (App Router + TS):
   ```bash
   npx create-next-app tava-demo --typescript --app
   ```

2. Install deps:
   ```bash
   cd tava-demo
   npm install @prisma/client prisma openai zod
   ```

3. Copy:
   - `prisma/schema.prisma`
   - `lib/openai.ts`
   - `lib/personas.ts`
   - `lib/prompts/*`
   - `lib/riskScanner.ts`
   - API routes under `app/api/*`
   - Page files under `app/*`

4. Run Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Set env var in `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

6. Run dev server:
   ```bash
   npm run dev
   ```

Then exercise the flow in sequence:
- `POST /api/simulate-session` for a persona (via curl or a quick button you wire later).  
- `POST /api/generate-plan` for the created session.  
- `POST /api/generate-summary` for the same session.  
- View therapist and client pages to show the outputs.

That’s enough to impress for this Gauntlet hiring partner project while keeping scope tightly under control.
