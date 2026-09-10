import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ModeratorPackagesPage() { return <><PageHeader eyebrow="Moderator workspace" title="Service packages" description="Moderate service packages published by providers." /><FeaturePlaceholder items={["Package approvals", "Package catalogue", "Reported packages"]} /></>; }
