"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLanguageProvider, useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";

type ErrorCode = "401" | "403" | "404";

function ErrorStatusContent({ code }: { code: ErrorCode }) {
  const router = useRouter();
  const { messages } = useAdminLanguage();
  const t = messages.errors;
  const title = code === "401" ? t.unauthorizedTitle : code === "403" ? t.forbiddenTitle : t.notFoundTitle;
  const description = code === "401" ? t.unauthorizedDescription : code === "403" ? t.forbiddenDescription : t.notFoundDescription;
  const destination = code === "401" ? "/login" : code === "403" ? "/admin/dashboard" : "/";
  const destinationLabel = code === "401" ? t.signIn : code === "403" ? t.dashboard : t.backHome;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <section className="w-full max-w-2xl text-center">
        <h1 className="text-[112px] font-bold leading-none tracking-normal text-slate-950 sm:text-[136px]">{code}</h1>
        <h2 className="mt-7 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-500">{description}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => router.back()} className="h-11 rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-950 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">{t.goBack}</button>
          <Link href={destination} className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">{destinationLabel}</Link>
        </div>
      </section>
    </main>
  );
}

export function ErrorStatusPage({ code }: { code: ErrorCode }) {
  return <AdminLanguageProvider><ErrorStatusContent code={code} /></AdminLanguageProvider>;
}

export function ErrorPagesIndex() {
  return <AdminLanguageProvider><ErrorPagesIndexContent /></AdminLanguageProvider>;
}

function ErrorPagesIndexContent() {
  const { messages } = useAdminLanguage();
  const t = messages.errors;
  const errorPages: { code: ErrorCode; title: string; description: string }[] = [
    { code: "401", title: t.unauthorized, description: t.unauthorizedIndexDescription },
    { code: "403", title: t.forbidden, description: t.forbiddenIndexDescription },
    { code: "404", title: t.notFound, description: t.notFoundIndexDescription },
  ];

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-950">Film Photo / Admin</Link>
        <header className="mt-8 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold text-slate-950">{t.indexTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.indexDescription}</p>
        </header>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {errorPages.map((item) => (
            <article key={item.code} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-slate-950">{item.code}</p>
              <h2 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{item.description}</p>
              <Link href={`/errors/${item.code}`} className="mt-5 inline-flex h-9 items-center rounded-md bg-slate-950 px-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-800">{t.openPage}</Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}