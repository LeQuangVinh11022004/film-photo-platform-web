"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { GoogleAuthButton } from "@/shared/components/GoogleAuthButton";
import { registerProvider } from "@/features/admin-auth";

type FieldKey =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword"
  | "businessName"
  | "phoneNumber"
  | "address"
  | "description";

export default function RegisterProviderPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    phoneNumber: "",
    address: "",
    description: "",
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

  function getFieldClassName(field: FieldKey, isTextarea = false) {
    const hasError = !!fieldErrors[field];
    const base = isTextarea
      ? "mt-2 w-full resize-none rounded-[10px] px-4 py-3 text-base font-normal outline-none transition backdrop-blur-sm placeholder:text-[#70706b]"
      : "mt-2 h-14 w-full rounded-[10px] px-4 text-base font-normal outline-none transition backdrop-blur-sm placeholder:text-[#70706b]";

    if (hasError) {
      return `${base} border-2 border-red-500 bg-red-50/50 text-[#171715] focus:border-red-600 focus:ring-2 focus:ring-red-200/50`;
    }

    return `${base} border border-white/35 bg-white/65 text-[#171715] focus:border-[#b58a2b] focus:ring-2 focus:ring-[#d6a83f]/20`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setGeneralError("");
    const clientErrors: Partial<Record<FieldKey, string>> = {};

    if (!formData.fullName.trim()) {
      clientErrors.fullName = "Please enter your full name.";
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

    if (!formData.confirmPassword) {
      clientErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      clientErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.businessName.trim()) {
      clientErrors.businessName = "Please enter your business name.";
    }

    if (!formData.phoneNumber.trim()) {
      clientErrors.phoneNumber = "Please enter your phone number.";
    }

    if (!formData.address.trim()) {
      clientErrors.address = "Please enter your business address.";
    }

    if (!formData.description.trim()) {
      clientErrors.description = "Please describe your business.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setGeneralError("Please fix the highlighted fields below.");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await registerProvider({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      // Successful registration returns user object with userId or role: PROVIDER
      if (result && (result.userId || result.role === "PROVIDER" || result.success !== false)) {
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
              if (lowerKey.includes("email")) serverErrors.email = msg;
              else if (lowerKey.includes("business")) serverErrors.businessName = msg;
              else if (lowerKey.includes("phone")) serverErrors.phoneNumber = msg;
              else if (lowerKey.includes("password")) serverErrors.password = msg;
              else if (lowerKey.includes("location") || lowerKey.includes("address")) serverErrors.address = msg;
              else if (lowerKey.includes("description")) serverErrors.description = msg;
              else if (lowerKey.includes("name")) serverErrors.fullName = msg;
            }
          }

          const apiMessage =
            (data as { message?: string; title?: string }).message ||
            (data as { title?: string }).title;

          if (apiMessage) {
            const lowerMsg = apiMessage.toLowerCase();
            if (lowerMsg.includes("email")) serverErrors.email = apiMessage;
            else if (lowerMsg.includes("phone")) serverErrors.phoneNumber = apiMessage;
            else if (lowerMsg.includes("password")) serverErrors.password = apiMessage;
            else if (lowerMsg.includes("address")) serverErrors.address = apiMessage;
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
          const lower = data.toLowerCase();
          if (lower.includes("email")) serverErrors.email = data;
          if (Object.keys(serverErrors).length > 0) setFieldErrors(serverErrors);
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
        title="Register as Provider"
        description="Set up your workspace to list creative spaces, equipment, and packages."
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
              Looking to book creative spaces?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]"
              >
                Sign up as customer
              </Link>
            </p>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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

          <label htmlFor="email" className="block text-sm font-semibold text-[#3b3b38]">
            Email Address
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="Enter your business email"
              className={getFieldClassName("email")}
            />
            {fieldErrors.email ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
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
                placeholder="Min 8 characters"
                className={getFieldClassName("password")}
              />
              {fieldErrors.password ? (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.password}
                </p>
              ) : null}
            </label>

            <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#3b3b38]">
              Confirm password
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className={getFieldClassName("confirmPassword")}
              />
              {fieldErrors.confirmPassword ? (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="business-name" className="block text-sm font-semibold text-[#3b3b38]">
              Business Name
              <input
                id="business-name"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleFieldChange("businessName", e.target.value)}
                placeholder="Your brand or studio name"
                className={getFieldClassName("businessName")}
              />
              {fieldErrors.businessName ? (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.businessName}
                </p>
              ) : null}
            </label>

            <label htmlFor="phone" className="block text-sm font-semibold text-[#3b3b38]">
              Phone number
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                placeholder="e.g. 0901234567"
                className={getFieldClassName("phoneNumber")}
              />
              {fieldErrors.phoneNumber ? (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.phoneNumber}
                </p>
              ) : null}
            </label>
          </div>

          <label htmlFor="location" className="block text-sm font-semibold text-[#3b3b38]">
            Location / Address
            <input
              id="location"
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              placeholder="Studio / Business address"
              className={getFieldClassName("address")}
            />
            {fieldErrors.address ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.address}
              </p>
            ) : null}
          </label>

          <label htmlFor="description" className="block text-sm font-semibold text-[#3b3b38]">
            Description of your business
            <textarea
              id="description"
              rows={3}
              required
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Briefly describe your services, spaces, or equipment..."
              className={getFieldClassName("description", true)}
            />
            {fieldErrors.description ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.description}
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
            {submitting ? "Submitting registration..." : "Register as Provider"}
          </button>
        </form>
        <GoogleAuthButton />
      </AuthPageLayout>

      {/* Success Approval Modal */}
      {showSuccessModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-[#e8e3d7] bg-white p-7 text-center shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf5] text-[#059669] shadow-inner">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>

            <h2 id="success-modal-title" className="text-xl font-bold tracking-tight text-[#171715] sm:text-2xl">
              Registration Submitted!
            </h2>

            <p className="mt-3 text-base leading-6 text-[#4a4a46]">
              Your registration request has been sent successfully. Please wait for approval.
            </p>

            <div className="mt-4 rounded-xl border border-[#e8e3d7] bg-[#fbfaf7] p-3 text-xs text-[#70706b]">
              Your account status is currently <strong>PENDING</strong>. We will review your application and activate your workspace soon.
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#171715] text-sm font-semibold text-white transition-colors hover:bg-[#33332f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171715]"
              >
                Back to Home Page
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#d8d2c8] bg-transparent text-xs font-semibold text-[#666560] transition-colors hover:bg-[#f8f6f2] hover:text-[#171715]"
              >
                Go to Sign in
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
