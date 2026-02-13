"use client";

import { useState } from "react";

const TONES = ["Confident", "Playful", "Flirty", "Mysterious", "Funny", "Nonchalant", "Direct"] as const;
const FREE_LIMIT = 2;

export default function Home() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Playful");
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uses, setUses] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const limitReached = uses >= FREE_LIMIT;

  async function generate() {
    setError(null);

    if (!message.trim()) {
      setReplies([]);
      setError("Paste the message you got first.");
      return;
    }

    if (limitReached) {
      setReplies([]);
      setError("You’ve used your free replies.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, tone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");

      setReplies(data.replies || []);
      setUses((prev) => prev + 1);
    } catch (e: any) {
      setReplies([]);
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function resetSession() {
    setUses(0);
    setReplies([]);
    setError(null);
    setMessage("");
    setTone("Playful");
    setCheckoutLoading(false);
  }

  async function startCheckout() {
    setError(null);
    setCheckoutLoading(true);

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      if (!data?.url) throw new Error("Missing checkout URL");

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Checkout error");
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-5">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">Wingman AI</h1>
          <p className="text-zinc-300">
            Paste what they said. Pick a vibe. Get replies that don’t make you look weird.
          </p>
          <p className="text-xs text-zinc-500">
            Free replies left:{" "}
            <span className="text-zinc-300">{Math.max(0, FREE_LIMIT - uses)}</span> / {FREE_LIMIT}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <label className="text-sm text-zinc-300">Incoming message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Example: “lol idk maybe we’ll see”'
            className="w-full h-28 rounded-xl bg-zinc-950 border border-zinc-800 p-3 outline-none focus:border-zinc-600"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-300">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}
                className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generate}
                disabled={loading}
                className="rounded-xl px-4 py-2 bg-zinc-50 text-zinc-950 font-medium disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate replies"}
              </button>

              <button
                onClick={resetSession}
                className="rounded-xl px-4 py-2 border border-zinc-700 text-zinc-200 hover:bg-zinc-900"
                title="Clears your local session counter (for testing)"
              >
                Reset
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {limitReached && (
            <div className="mt-6 bg-gradient-to-br from-purple-700 via-indigo-700 to-pink-600 p-6 rounded-2xl text-white space-y-4 shadow-xl">
              <h3 className="text-xl font-semibold tracking-tight">You’ve used your free replies.</h3>

              <p className="text-white/90">
                Don’t overthink this one. Upgrade to <strong>Wingman Pro</strong> and get unlimited,
                emotionally calibrated replies whenever you need them.
              </p>

              <p className="text-sm text-white/80">
                As part of our launch, you can unlock Pro with a <strong>35% lifetime discount</strong>.
              </p>

              <div className="bg-black/20 border border-white/20 rounded-xl p-3 text-sm text-white/80">
                No cringe. No guesswork. Just confident replies when it matters.
              </div>

              <button
                className="mt-2 w-full rounded-xl px-4 py-3 bg-white text-purple-700 font-semibold hover:scale-[1.02] transition-transform disabled:opacity-70"
                onClick={startCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? "Redirecting to secure checkout..." : "Upgrade to Pro (Save 35%)"}
              </button>

              <p className="text-xs text-white/60 text-center">You can cancel anytime. No pressure.</p>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Replies</h2>
            <div className="grid gap-3">
              {replies.map((r, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <p className="text-zinc-100">{r}</p>
                  <button
                    onClick={() => copy(r)}
                    className="mt-3 text-sm text-zinc-300 hover:text-zinc-50"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-500">Tip: short + natural wins every time.</p>
      </div>
    </main>
  );
}
