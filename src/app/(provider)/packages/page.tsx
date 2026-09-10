import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function PackagesPage() { return <><PageHeader eyebrow="Provider workspace" title="Service packages" description="Configure the packages customers can discover and book." /><FeaturePlaceholder items={["Package list", "Pricing", "Create package"]} /></>; }
