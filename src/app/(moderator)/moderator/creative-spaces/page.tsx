import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ModeratorCreativeSpacesPage() { return <><PageHeader eyebrow="Moderator workspace" title="Creative spaces" description="Review and manage creative spaces across providers." /><FeaturePlaceholder items={["Space approvals", "Space catalogue", "Reported spaces"]} /></>; }
