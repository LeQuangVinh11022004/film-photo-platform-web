"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { registerPhotographer } from "@/features/admin-auth";

type FieldKey = "fullName" | "username" | "email" | "password";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  function handleFieldChange(field: FieldKey, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) {
      setGeneralError("");
    }
  }

  function getFieldClassName(field: FieldKey) {
    const hasError = !!fieldErrors[field];
    const base =
      "mt-2.5 h-15 w-full rounded-[10px] px-4 text-base font-normal text-[#171715] outline-none transition backdrop-blur-sm placeholder:text-[#70706b]";
    if (hasError) {
      return `${base} border-2 border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-2 focus:ring-red-200/50`;
    }
    return `${base} border border-white/35 bg-white/65 focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setGeneralError("");
    const clientErrors: Partial<Record<FieldKey, string>> = {};

    if (!formData.fullName.trim()) {
      clientErrors.fullName = "Please enter your full name.";
    }
    if (!/^[A-Za-z0-9._-]{3,50}$/.test(formData.username.trim())) {
      clientErrors.username = "Use 3 to 50 letters, numbers, dots, underscores or hyphens.";
    }
    if (!formData.email.trim()) {
      clientErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      clientErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      clientErrors.password = "Please enter a password.";
    } else if (formData.password.length < 8) {
      clientErrors.password = "Password must be at least 8 characters long.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setGeneralError("Please fix the highlighted fields below.");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await registerPhotographer({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result?.userId) {
        setShowSuccessModal(true);
        return;
      }

      setGeneralError(result?.message || "Registration failed. Please check your information.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const serverErrors: Partial<Record<FieldKey, string>> = {};

        if (data && typeof data === "object") {
          const errorsObj = (data as { errors?: Record<string, string[]> }).errors;
          if (errorsObj && typeof errorsObj === "object") {
            for (const [key, msgs] of Object.entries(errorsObj)) {
              const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes("username")) serverErrors.username = msg;
              else if (lowerKey.includes("email")) serverErrors.email = msg;
              else if (lowerKey.includes("password")) serverErrors.password = msg;
              else if (lowerKey.includes("name")) serverErrors.fullName = msg;
            }
          }

          const apiMessage =
            (data as { message?: string; title?: string }).message ||
            (data as { title?: string }).title;

          if (apiMessage) {
            const lowerMsg = apiMessage.toLowerCase();
            if (lowerMsg.includes("username")) serverErrors.username = apiMessage;
            else if (lowerMsg.includes("email")) serverErrors.email = apiMessage;
            else if (lowerMsg.includes("password")) serverErrors.password = apiMessage;
          }

          if (Object.keys(serverErrors).length > 0) {
            setFieldErrors(serverErrors);
          }

          setGeneralError(
            apiMessage ||
              (Object.values(serverErrors)[0] ??
                (err.response
                  ? "Registration failed. Please check the highlighted fields."
                  : "Cannot reach the server. Make sure the backend is running."))
          );
        } else if (typeof data === "string" && data.trim()) {
          setGeneralError(data);
        } else {
          setGeneralError(
            err.response
              ? "Registration failed. Please check your information."
              : "Cannot reach the server. Make sure the backend is running."
          );
        }
      } else {
        setGeneralError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthPageLayout
        title="Create your account"
        description="Set up your workspace for creative bookings."
        backgroundImage="/images/auth/register-background.jpg"
        footer={
          <div className="space-y-2 text-center">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-[#70706b]">
              Looking to list your spaces or gear?{" "}
              <Link
                href="/register-provider"
                className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]"
              >
                Register as provider
              </Link>
            </p>
          </div>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label htmlFor="name" className="block text-sm font-semibold text-[#3b3b38]">
            Full name
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={formData.fullName}
              onChange={(e) => handleFieldChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={getFieldClassName("fullName")}
            />
            {fieldErrors.fullName ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.fullName}
              </p>
            ) : null}
          </label>
          <label htmlFor="username" className="block text-sm font-semibold text-[#3b3b38]">
            Username
            <input id="username" type="text" autoComplete="username" required maxLength={50}
              value={formData.username} onChange={(e) => handleFieldChange("username", e.target.value)}
              placeholder="Enter your username" className={getFieldClassName("username")} />
            {fieldErrors.username && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{fieldErrors.username}</p>}
          </label>
          <label htmlFor="email" className="block text-sm font-semibold text-[#3b3b38]">
            Email Address
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="Enter your email"
              className={getFieldClassName("email")}
            />
            {fieldErrors.email ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </label>
          <label htmlFor="password" className="block text-sm font-semibold text-[#3b3b38]">
            Password
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={formData.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              placeholder="Create a password"
              className={getFieldClassName("password")}
            />
            {fieldErrors.password ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.password}
              </p>
            ) : null}
          </label>

          {generalError ? (
            <p
              role="alert"
              className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {generalError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-15 w-full rounded-[10px] bg-[#111110]/85 px-5 text-base font-semibold text-white transition-colors hover:bg-[#33332f]/90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b58a2b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </AuthPageLayout>

      {showSuccessModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-success-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[#e8e3d7] bg-white p-7 text-center shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf5] text-[#059669] shadow-inner">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>

            <h2 id="register-success-title" className="text-xl font-bold tracking-tight text-[#171715] sm:text-2xl">
              Account Created!
            </h2>

            <p className="mt-3 text-base leading-6 text-[#4a4a46]">
              Your photographer account has been registered successfully. You can now sign in to book creative spaces.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#171715] text-sm font-semibold text-white transition-colors hover:bg-[#33332f]"
              >
                Go to Sign in
              </Link>
              <Link
                href="/"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#d8d2c8] bg-transparent text-xs font-semibold text-[#666560] transition-colors hover:bg-[#f8f6f2] hover:text-[#171715]"
              >
                Back to Home Page
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
