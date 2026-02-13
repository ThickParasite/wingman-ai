export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-2">
        <h1 className="text-3xl font-semibold">You’re in. ✅</h1>
        <p className="text-zinc-300">Your Wingman Pro subscription is active.</p>
        <a className="text-zinc-200 underline" href="/">
          Back to Wingman AI
        </a>
      </div>
    </main>
  );
}
