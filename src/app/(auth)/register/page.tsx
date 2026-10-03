import Link from "next/link";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { GoogleAuthButton } from "@/shared/components/GoogleAuthButton";

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Create your account"
      description="Set up your workspace for creative bookings."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5">
        <label htmlFor="name" className="block text-sm font-semibold text-[#3b3b38]">
          Full name
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Enter your full name"
            className="mt-2.5 h-15 w-full rounded-[10px] border border-[#d7d7d3] bg-white px-4 text-base font-normal text-[#171715] outline-none transition focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#92928d]"
          />
        </label>
        <label htmlFor="email" className="block text-sm font-semibold text-[#3b3b38]">
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
        <label htmlFor="password" className="block text-sm font-semibold text-[#3b3b38]">
          Password
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Create a password"
            className="mt-2.5 h-15 w-full rounded-[10px] border border-[#d7d7d3] bg-white px-4 text-base font-normal text-[#171715] outline-none transition focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#92928d]"
          />
        </label>
        <button type="submit" className="h-15 w-full rounded-[10px] bg-[#111110] px-5 text-base font-semibold text-white transition-colors hover:bg-[#33332f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b58a2b]">
          Create account
        </button>
      </form>
      <GoogleAuthButton />
    </AuthPageLayout>
  );
}
