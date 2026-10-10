"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { httpClient } from "@/services/httpClient";
import { endpoints } from "@/services/endpoints";

const inputClassName = "mt-2.5 h-15 w-full rounded-[10px] border border-white/35 bg-white/65 px-4 text-base font-normal text-[#171715] outline-none transition backdrop-blur-sm focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20 placeholder:text-[#70706b]";
const buttonClassName = "h-15 w-full rounded-[10px] bg-[#111110]/85 px-5 text-base font-semibold text-white transition-colors hover:bg-[#33332f]/90 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b58a2b]";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      await httpClient.post(endpoints.auth.forgotPassword, { email });
      setSent(true);
    } catch {
      setError("We couldn’t send the reset link right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <p role="status" className="text-sm leading-6 text-[#555550]">
          If an account exists for <strong className="font-semibold text-[#171715]">{email}</strong>, you’ll receive a password reset link shortly.
        </p>
        <Link href="/login" className="inline-block text-sm font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label htmlFor="recovery-email" className="block text-sm font-semibold text-[#3b3b38]">
        Email Address
        <input
          id="recovery-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className={inputClassName}
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Sending link..." : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("The passwords don’t match.");
      return;
    }

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("This reset link is missing its token. Request a new one to continue.");
      return;
    }

    setPending(true);
    try {
      await httpClient.post(endpoints.auth.resetPassword, { token, password });
      setComplete(true);
    } catch {
      setError("This reset link may have expired. Request a new one and try again.");
    } finally {
      setPending(false);
    }
  }

  if (complete) {
    return (
      <div className="space-y-5 text-center">
        <p role="status" className="text-sm leading-6 text-[#555550]">Your password has been updated.</p>
        <Link href="/login" className="inline-block text-sm font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]">
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label htmlFor="new-password" className="block text-sm font-semibold text-[#3b3b38]">
        New password
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          className={inputClassName}
        />
      </label>
      <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#3b3b38]">
        Confirm new password
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Enter your password again"
          className={inputClassName}
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Updating password..." : "Update password"}
      </button>
    </form>
  );
}