import type { ClientPersona } from "../personas";
import { THERAPIST } from "../personas";

export const SIMULATE_SESSION_SYSTEM = `
You are simulating a complete 45-50 minute individual therapy session between a licensed
therapist and a single client. Write a realistic, trauma-informed, ethically
appropriate therapy dialogue as plain text.

IMPORTANT: Generate a FULL-LENGTH session transcript. A real 45-50 minute session 
typically has 40-60 back-and-forth exchanges. Do NOT generate a shortened version.
The transcript should be comprehensive and detailed.

The session should include:
1. Opening/check-in (5-10 exchanges) - How the client has been since last session
2. Main content/exploration (25-35 exchanges) - Deep dive into presenting concerns, 
   exploring thoughts, feelings, behaviors, and patterns
3. Skill building or intervention (10-15 exchanges) - Teaching coping strategies, 
   cognitive restructuring, or other therapeutic techniques
4. Closing/homework (5-10 exchanges) - Summarizing, setting goals, assigning homework

Constraints:
- Do NOT include any identifying real-world information.
- Use the EXACT speaker names provided in the prompt (not generic labels).
- The therapist should use a CBT/ACT style: collaborative, present-focused,
  goal-oriented, and strengths-based.
- The transcript should clearly surface:
  - presenting concerns and their impact on daily life
  - recent events and triggers
  - emotional states and their intensity
  - relevant thoughts, beliefs, and cognitive patterns
  - behaviors and coping strategies (both helpful and unhelpful)
  - relationships and social support
  - progress since last session (if applicable)
  - specific homework or between-session actions

Be clinically realistic but not graphic. If the persona has suicidal ideation or
self-harm thoughts, describe them in professional, non-sensationalized language
and include appropriate safety assessment and planning.

Include moments of:
- Reflection and insight from the client
- Validation and empathy from the therapist
- Gentle challenges or reframes
- Psychoeducation about relevant concepts
- Collaborative problem-solving
- Skill practice or demonstration

At the end of the dialogue, ensure there is explicit discussion of:
- Summary of key insights from the session
- Specific homework assignments
- Goals for the coming week
- Scheduling or mention of next session

Return ONLY the raw transcript text. Generate at minimum 50 exchanges (100 lines of dialogue).
`;

export interface SessionContext {
  previousSessions?: Array<{
    sessionNumber: number;
    date: string;
    keyTopics: string;
  }>;
  currentPlan?: {
    presenting_concerns: string;
    goals: {
      short_term: string[];
      long_term: string[];
    };
    homework: string[];
    strengths: string[];
  };
}

export function buildSimulateSessionUserPrompt(args: {
  persona: ClientPersona;
  sessionNumber: number;
  focus?: string;
  context?: SessionContext;
}): string {
  const { persona, sessionNumber, focus, context } = args;

  let sessionContext = "";
  
  if (sessionNumber === 1) {
    sessionContext = "This is an INTAKE/FIRST SESSION. Include gathering background information, building rapport, and initial assessment.";
  } else {
    sessionContext = `This is session #${sessionNumber}. Reference previous work and check in on homework from last session.`;
    
    // Add context about previous sessions
    if (context?.previousSessions && context.previousSessions.length > 0) {
      sessionContext += `\n\nPREVIOUS SESSION CONTEXT:
${context.previousSessions.map(s => `- Session ${s.sessionNumber} (${s.date}): ${s.keyTopics}`).join('\n')}`;
    }
    
    // Add current treatment plan context
    if (context?.currentPlan) {
      sessionContext += `\n\nCURRENT TREATMENT PLAN:
- Presenting concerns: ${context.currentPlan.presenting_concerns}
- Short-term goals: ${context.currentPlan.goals.short_term.join('; ')}
- Long-term goals: ${context.currentPlan.goals.long_term.join('; ')}
- Current homework: ${context.currentPlan.homework.join('; ')}
- Identified strengths: ${context.currentPlan.strengths.join('; ')}

The session should:
1. Check in on progress toward these goals
2. Review homework completion and discuss what worked/didn't work
3. Build on previous insights and continue therapeutic work
4. Update or refine goals as appropriate
5. Assign new or modified homework based on progress`;
    }
  }

  return `Client persona JSON:
${JSON.stringify(persona, null, 2)}

Therapist name: ${THERAPIST.name}
Client name: ${persona.displayName}

SPEAKER FORMAT: Use these exact names as speaker labels:
- "${THERAPIST.name}:" for therapist lines
- "${persona.displayName}:" for client lines

Session number: ${sessionNumber}
${sessionContext}

Focus: ${focus || "general session aligned with presenting concerns and current treatment goals"}

IMPORTANT: Generate a COMPLETE 45-50 minute session with at least 50 back-and-forth exchanges.
Do not abbreviate or shorten the session. This should read like a real, full therapy transcript.

Generate the full transcript now.`;
}
