import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ModeratorReservationsPage() { return <><PageHeader eyebrow="Moderator workspace" title="Reservations" description="Handle operational issues and oversee reservations." /><FeaturePlaceholder items={["Reservation queue", "Issue resolution", "Reservation history"]} /></>; }
