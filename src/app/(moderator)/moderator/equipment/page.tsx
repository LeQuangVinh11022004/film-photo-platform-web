import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ModeratorEquipmentPage() { return <><PageHeader eyebrow="Moderator workspace" title="Equipment" description="Review equipment listings and operational availability." /><FeaturePlaceholder items={["Listing approvals", "Equipment catalogue", "Reported listings"]} /></>; }
