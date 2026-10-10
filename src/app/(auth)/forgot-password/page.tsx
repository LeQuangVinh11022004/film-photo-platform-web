import Link from "next/link";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { ForgotPasswordForm } from "@/shared/components/PasswordRecoveryForms";

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout
      title="Forgot your password?"
      description="Enter your email and we’ll send you a reset link."
      backgroundImage="/images/auth/forgot-password.jpg"
      footer={
        <p>
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]">
            Sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}