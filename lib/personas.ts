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
  email: "avery@tava.health",
  modalities: ["CBT", "ACT"],
  style: "collaborative, warm, structured, goal-oriented",
} as const;

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

export function getPersonaById(id: string): ClientPersona | undefined {
  return CLIENT_PERSONAS[id as ClientPersonaId];
}

export function getAllPersonaIds(): ClientPersonaId[] {
  return Object.keys(CLIENT_PERSONAS) as ClientPersonaId[];
}

