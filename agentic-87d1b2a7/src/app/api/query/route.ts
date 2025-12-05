import { NextResponse } from "next/server";
import { generateAgentResponse } from "@/lib/legalAgent";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const response = generateAgentResponse(String(question ?? ""));

    return NextResponse.json({
      answer: response.answer,
      sources: response.supportingEntries.map(({ entry, matchedKeywords }) => ({
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        citations: entry.citations,
        era: entry.era,
        jurisdiction: entry.jurisdiction,
        category: entry.category,
        matchedKeywords,
      })),
      disclaimer: response.disclaimer,
    });
  } catch (error) {
    console.error("Agent error", error);
    return NextResponse.json(
      {
        answer:
          "An unexpected issue prevented me from processing that request. Please retry in a moment.",
        sources: [],
        disclaimer:
          "Research assistant only — confirm the status of every authority and consult licensed counsel before acting.",
      },
      { status: 500 }
    );
  }
}
