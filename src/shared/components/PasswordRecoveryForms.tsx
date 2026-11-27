import Link from "next/link";

function RecoveryUnavailable() {
  return (
    <div className="space-y-5 text-center">
      <p role="status" className="text-sm leading-6 text-[#555550]">
        Password recovery is not available yet. Please contact an administrator for help.
      </p>
      <Link href="/login" className="inline-block text-sm font-semibold text-[#171715] underline decoration-[#d6a83f] underline-offset-4 hover:text-[#8c6a20]">
        Return to sign in
      </Link>
    </div>
  );
}

export function ForgotPasswordForm() {
  return <RecoveryUnavailable />;
}

export function ResetPasswordForm() {
  return <RecoveryUnavailable />;
}
