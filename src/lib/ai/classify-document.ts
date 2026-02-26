import { z } from "zod/v4"
import { anthropic } from "./client"

interface StandardInput {
  code: string
  name: string
  clauses: { clauseNumber: string; title: string }[]
}

const classificationItemSchema = z.object({
  standardCode: z.string(),
  clauseNumber: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
})

const responseSchema = z.object({
  classifications: z.array(classificationItemSchema),
  summary: z.string(),
})

export type ClassificationResult = z.infer<typeof responseSchema>
export type ClassificationItem = z.infer<typeof classificationItemSchema>

const MAX_TEXT_LENGTH = 30_000

function buildSystemPrompt(standards: StandardInput[]): string {
  const clauseList = standards
    .flatMap((s) =>
      s.clauses.map((c) => `- ${s.code} Clause ${c.clauseNumber}: ${c.title}`)
    )
    .join("\n")

  return `You are an ISO compliance classification engine. Given a document's text, identify which ISO standard clauses it relates to.

Available ISO standards and clauses:
${clauseList}

Respond with a JSON object (no markdown fences) containing:
{
  "classifications": [
    {
      "standardCode": "<e.g. ISO 9001>",
      "clauseNumber": "<e.g. 7.5>",
      "confidence": <0.0 to 1.0>,
      "reasoning": "<brief explanation>"
    }
  ],
  "summary": "<1-2 sentence summary of the document's compliance relevance>"
}

Rules:
- Only return clauses with confidence >= 0.5
- Maximum 10 classifications
- Be precise — only classify clauses that the document genuinely addresses
- confidence 0.9+ = document directly implements/addresses the clause
- confidence 0.7-0.89 = document is strongly related
- confidence 0.5-0.69 = document partially relates`
}

export async function classifyDocument(
  text: string,
  standards: StandardInput[]
): Promise<ClassificationResult> {
  const truncated = text.slice(0, MAX_TEXT_LENGTH)

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: buildSystemPrompt(standards),
    messages: [
      {
        role: "user",
        content: `Classify this document:\n\n${truncated}`,
      },
    ],
  })

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : ""

  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim()

  const parsed = JSON.parse(cleaned)
  return responseSchema.parse(parsed)
}
