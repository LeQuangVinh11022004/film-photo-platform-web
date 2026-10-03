import { ErrorStatusPage } from "@/shared/components/ErrorPages";

export default function UnauthorizedPage() {
  return <ErrorStatusPage code="401" />;
}