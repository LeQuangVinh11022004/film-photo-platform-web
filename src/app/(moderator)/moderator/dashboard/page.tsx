import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ModeratorDashboardPage() { return <><PageHeader eyebrow="Moderator workspace" title="Operations dashboard" description="Monitor and coordinate the platform's creative-service activity." /><FeaturePlaceholder items={["Pending approvals", "Active reservations", "Service activity"]} /></>; }
