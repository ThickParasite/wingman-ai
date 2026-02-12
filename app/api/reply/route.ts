import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, tone } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const cleanTone = typeof tone === "string" && tone.trim() ? tone.trim() : "Playful";

    const system = `
You are Wingman AI, a socially intelligent dating strategist.

Generate 3 short, natural, emotionally calibrated replies to the incoming message.

Rules:
- No cringe pickup lines.
- No overly sexual comments.
- No try-hard alpha behavior.
- Keep replies under 18 words.
- Make them confident but relaxed.
- Add slight intrigue or emotional pull.
- Sound like a real attractive person texting casually.

Return ONLY a JSON array of 3 strings.
`.trim();


    const user = `Tone: ${cleanTone}\nIncoming message: ${message}`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: `OpenAI error: ${text}` }, { status: 500 });
    }

    const data = await r.json();

    const outputText =
      data?.output?.[0]?.content?.find((c: any) => c?.type === "output_text")?.text ??
      data?.output_text ??
      "";

    let replies: string[] = [];
    try {
      replies = JSON.parse(outputText);
    } catch {
      replies = outputText
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    replies = (replies || [])
      .filter((x) => typeof x === "string" && x.trim())
      .slice(0, 3);

    while (replies.length < 3) replies.push("Say that again but in a different way?");

    return NextResponse.json({ replies });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
