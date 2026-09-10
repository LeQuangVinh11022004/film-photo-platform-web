export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="mb-8 border-b border-stone-200 pb-6">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>}
    </header>
  );
}
