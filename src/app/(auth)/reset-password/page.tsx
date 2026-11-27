import { AuthPageLayout } from "@/shared/components/AuthPageLayout";
import { ResetPasswordForm } from "@/shared/components/PasswordRecoveryForms";

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout
      title="Set a new password"
      description="Password recovery is not currently supported."
      backgroundImage="/images/auth/reset-password.jpg"
    >
      <ResetPasswordForm />
    </AuthPageLayout>
  );
}