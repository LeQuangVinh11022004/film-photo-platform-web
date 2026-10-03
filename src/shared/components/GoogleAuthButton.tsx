import { endpoints } from "@/services/endpoints";
import { API_BASE_URL } from "@/services/config";

const googleLoginUrl = `${API_BASE_URL}${endpoints.auth.google}`;

export function GoogleAuthButton() {
  return (
    <>
      <div className="my-7 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.08em] text-[#92928d]">
        <span className="h-px flex-1 bg-[#e6e6e3]" />
        or continue with
        <span className="h-px flex-1 bg-[#e6e6e3]" />
      </div>
      <a
        href={googleLoginUrl}
        className="flex h-14.5 w-full items-center justify-center gap-3 rounded-[10px] border border-[#d7d7d3] bg-white px-4 text-base font-semibold text-[#292927] transition-colors hover:bg-[#fafaf8] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b58a2b]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44c-.28 1.47-1.13 2.72-2.42 3.56v2.96h3.92c2.29-2.11 3.55-5.22 3.55-8.55Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.92-2.96c-1.08.72-2.45 1.15-4.01 1.15-3.08 0-5.69-2.08-6.62-4.88H1.33v3.05C3.3 21.3 7.27 24 12 24Z" />
          <path fill="#FBBC05" d="M5.38 14.38c-.24-.72-.38-1.49-.38-2.38s.14-1.66.38-2.38V6.57H1.33C.48 8.26 0 10.07 0 12s.48 3.74 1.33 5.43l4.05-3.05Z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.16 15.24 0 12 0 7.27 0 3.3 2.7 1.33 6.57l4.05 3.05C6.31 6.83 8.92 4.75 12 4.75Z" />
        </svg>
        Continue with Google
      </a>
    </>
  );
}