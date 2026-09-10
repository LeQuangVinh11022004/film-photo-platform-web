export function FeaturePlaceholder({ items }: { items: string[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => <div key={item} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"><p className="font-medium text-stone-900">{item}</p><p className="mt-2 text-sm text-stone-500">Ready for API integration.</p></div>)}
    </section>
  );
}
