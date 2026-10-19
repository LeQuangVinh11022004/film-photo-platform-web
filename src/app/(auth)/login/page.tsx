"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { GoogleAuthButton } from "@/shared/components/GoogleAuthButton";
import { loginUser } from "@/features/admin-auth/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);
    try {
      const result = await loginUser({ email: email.trim(), password });
      if (!result.success || !result.token || !result.user) {
        setError(result.message || "Sign in failed. Please try again.");
        return;
      }

      const normalizedRole = result.user.role.trim().toUpperCase();
      const role = normalizedRole === "ADMIN"
        ? "admin"
        : normalizedRole === "MODERATOR"
          ? "moderator"
          : normalizedRole === "PROVIDER" || normalizedRole === "SERVICE_PROVIDER"
            ? "provider"
            : null;

      if (!role) {
        setError(`This account role (${result.user.role}) does not have a workspace here.`);
        return;
      }

      setSession(result.token, {
        id: result.user.userId,
        name: result.user.fullName,
        email: result.user.email,
        role,
      }, result.expiresAtUtc);
      router.replace(role === "admin" ? "/admin/dashboard" : role === "provider" ? "/provider/dashboard" : "/moderator");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        setError(message ?? (err.response ? "Sign in failed. Please try again." : "Cannot reach the server. Make sure the backend is running."));
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      title="Film Photo Workspace"
      description="Sign in to manage your creative spaces."
      backgroundImage="/images/auth/login-background.jpg"
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
      <form className="space-y-6" onSubmit={handleSubmit}>
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="mt-2.5 h-15 w-full rounded-[10px] border border-white/35 bg-white/65 px-4 text-base font-normal text-[#171715] outline-none transition backdrop-blur-sm focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#70706b]"
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="mt-2.5 h-15 w-full rounded-[10px] border border-white/35 bg-white/65 px-4 text-base font-normal text-[#171715] outline-none transition backdrop-blur-sm focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#70706b]"
          />
          <Link
            href="/forgot-password"
            className="text-sm text-[#696965] transition-colors hover:text-[#8c6a20]
            justify-end mt-2.5 block text-right font-semibold underline decoration-[#d6a83f] underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        {error ? (
          <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="h-15 w-full rounded-[10px] bg-[#111110]/85 px-5 text-base font-semibold text-white transition-colors hover:bg-[#33332f]/90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b58a2b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <GoogleAuthButton />
    </AuthPageLayout>
  );
}
