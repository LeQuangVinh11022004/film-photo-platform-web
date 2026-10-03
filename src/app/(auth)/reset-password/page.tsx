import Link from "next/link";
import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { ResetPasswordForm } from "@/shared/components/PasswordRecoveryForms";

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout
      title="Set a new password"
      description="Choose a new password for your workspace."
      footer={
        <p>
          Need another reset link?{" "}
          <Link href="/forgot-password" className="font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]">
            Request one
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthPageLayout>
  );
}