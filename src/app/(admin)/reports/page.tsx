import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ReportsPage() { return <><PageHeader eyebrow="Admin workspace" title="Reports" description="View platform activity and operational performance." /><FeaturePlaceholder items={["Usage overview", "Reservation trends", "Export report"]} /></>; }
