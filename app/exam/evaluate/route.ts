import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { passageContent, questions } = await req.json();

    const prompt = `You are an examiner evaluating student answers for a reading comprehension exam.

Passage:
${passageContent}

Evaluate each answer strictly and fairly based on the mark scheme provided.

${questions.map((q: any, i: number) => `
Question ${i + 1}: ${q.question}
Mark scheme: ${q.markScheme}
Sample answer: ${q.sampleAnswer}
Max marks: ${q.maxMarks}
Student answer: ${q.userAnswer}
`).join("\n")}

Respond ONLY with valid JSON:
{
  "results": [
    {
      "questionId": 1,
      "score": 2,
      "feedback": "Brief specific feedback explaining the score and what was missing or well done."
    }
  ]
}

Be consistent and fair. Award partial marks where appropriate. Keep feedback to 1-2 sentences.`;

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
        // Map question IDs back
        parsed.results = parsed.results.map((r: any, i: number) => ({
            ...r,
            questionId: questions[i].id,
            question: questions[i].question,
            userAnswer: questions[i].userAnswer,
            maxMarks: questions[i].maxMarks,
        }));
        return NextResponse.json(parsed);
    } catch {
        return new NextResponse("Evaluation failed", { status: 500 });
    }
}