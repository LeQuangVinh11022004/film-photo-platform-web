import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function DashboardPage() { return <><PageHeader eyebrow="Provider workspace" title="Dashboard" description="Monitor your creative services and upcoming activity." /><FeaturePlaceholder items={["Upcoming reservations", "Active packages", "Monthly performance"]} /></>; }
