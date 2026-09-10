import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function EquipmentPage() { return <><PageHeader eyebrow="Provider workspace" title="Equipment" description="Keep track of equipment offered with your services." /><FeaturePlaceholder items={["Equipment catalogue", "Stock status", "Add equipment"]} /></>; }
