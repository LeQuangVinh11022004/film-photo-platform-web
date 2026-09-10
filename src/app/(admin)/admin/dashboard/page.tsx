import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function AdminDashboardPage() { return <><PageHeader eyebrow="Admin workspace" title="Admin dashboard" description="Manage platform records, accounts and high-level reporting." /><FeaturePlaceholder items={["Platform overview", "CRUD shortcuts", "System activity"]} /></>; }
