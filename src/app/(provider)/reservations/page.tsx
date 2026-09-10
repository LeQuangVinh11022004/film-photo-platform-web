import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ReservationsPage() { return <><PageHeader eyebrow="Provider workspace" title="Reservations" description="Review and manage booking requests from customers." /><FeaturePlaceholder items={["Reservation queue", "Calendar view", "Reservation details"]} /></>; }
