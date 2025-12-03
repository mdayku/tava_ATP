import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("Warning: OPENAI_API_KEY is not set. AI features will not work.");
}

export const openai = new OpenAI({
  apiKey: apiKey || "dummy-key-for-build",
});

export async function chatJson<T = unknown>(options: {
  system: string;
  user: string;
}): Promise<T> {
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

  return JSON.parse(content) as T;
}

export async function chatText(options: {
  system: string;
  user: string;
}): Promise<string> {
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

