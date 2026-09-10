import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Film Photo Web</p>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-5xl font-semibold tracking-tight text-stone-900">Your creative service workspace.</h1>
        <p className="text-lg leading-8 text-stone-600">A frontend foundation for service providers, reservations, equipment and creative spaces.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700">Open provider dashboard</Link>
        <Link href="/login" className="rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 hover:bg-white">Sign in</Link>
      </div>
    </main>
  );
}
