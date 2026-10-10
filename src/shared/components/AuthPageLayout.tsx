import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageLayoutProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
  backgroundImage?: string;
};

export function AuthPageLayout({
  title,
  description,
  footer,
  children,
  backgroundImage,
}: AuthPageLayoutProps) {
  const mainStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(12, 12, 10, 0.46), rgba(12, 12, 10, 0.46)), url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f7f7f5] px-5 py-10 sm:px-8"
      style={mainStyle}
    >
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      <section className="relative z-10 w-full max-w-140 rounded-[18px] border border-white/35 bg-white/70 px-6 py-10 shadow-[0_18px_40px_rgba(12,12,10,0.18)] backdrop-blur-[4px] sm:px-12 sm:py-14">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5 text-sm font-bold tracking-[0.02em] text-[#171715]">
          <span aria-hidden="true" className="h-7 w-px bg-[#d6a83f]" />
          <span>FILM PHOTO</span>
        </Link>
        <header className="text-center">
          <h1 className="text-[28px] font-semibold leading-tight text-[#151514] sm:text-[30px]">{title}</h1>
          <p className="mt-2 text-[16px] leading-6 text-[#777773]">{description}</p>
        </header>
        <div className="mt-10">{children}</div>
        <div className="mt-8 border-t border-[#e6e6e3] pt-6 text-center text-sm text-[#696965]">
          {footer}
        </div>
        <Link href="/" className="mt-5 block text-center text-sm font-medium text-[#696965] transition-colors hover:text-[#151514]">
          Back to website
        </Link>
      </section>
    </main>
  );
}