import { NextResponse, NextRequest } from "next/server";
import { IsAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
    const isAdmin = await IsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const { topic, level, blanks, questions } = await req.json();

    const prompt = `You are creating content for a language learning app.

Generate a reading passage about "${topic}" at ${level} level with exactly ${blanks} blanks marked as [BLANK_1], [BLANK_2], etc.

Then provide ${questions} open-ended comprehension questions.

Respond ONLY with valid JSON:
{
  "title": "passage title",
  "content": "Full passage with [BLANK_1], [BLANK_2] etc placed naturally...",
  "blanks": [
    {"blankNumber": 1, "correctAnswer": "word", "acceptedAnswers": "word|alternative"},
    {"blankNumber": 2, "correctAnswer": "word", "acceptedAnswers": "word"}
  ],
  "questions": [
    {
      "question": "Question text?",
      "sampleAnswer": "A full model answer that a good student would write.",
      "markScheme": "Award 1 mark for X. Award 2 marks for Y. Award 3 marks for Z.",
      "maxMarks": 3
    }
  ]
}`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    const data = await response.json();
    const text = data.content.map((i: any) => i.text || "").join("");
    
    try {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        // Convert arrays to JSON strings for the form fields
        return NextResponse.json({
            ...parsed,
            blanksJson: JSON.stringify(parsed.blanksJson, null, 2),
            questionsJson: JSON.stringify(parsed.questionsJson, null, 2),
        });
    } catch {
        return new NextResponse("Failed to parse AI response", { status: 500 });
    }
}