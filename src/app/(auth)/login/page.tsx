import Link from "next/link";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { GoogleAuthButton } from "@/shared/components/GoogleAuthButton";

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Film Photo Workspace"
      description="Sign in to manage your creative spaces."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-6">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-[#3b3b38]"
        >
          Email Address
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            className="mt-2.5 h-15 w-full rounded-[10px] border border-[#d7d7d3] bg-white px-4 text-base font-normal text-[#171715] outline-none transition focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#92928d]"
          />
        </label>
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#3b3b38]"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="mt-2.5 h-15 w-full rounded-[10px] border border-[#d7d7d3] bg-white px-4 text-base font-normal text-[#171715] outline-none transition focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#92928d]"
          />
          <Link
            href="/forgot-password"
            className="text-sm text-[#696965] transition-colors hover:text-[#8c6a20]
            justify-end mt-2.5 block text-right font-semibold underline decoration-[#d6a83f] underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="h-15 w-full rounded-[10px] bg-[#111110] px-5 text-base font-semibold text-white transition-colors hover:bg-[#33332f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b58a2b]"
        >
          Sign in
        </button>
      </form>
      <GoogleAuthButton />
    </AuthPageLayout>
  );
}
