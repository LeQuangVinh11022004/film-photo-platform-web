import { FeaturePlaceholder } from "@/shared/components/FeaturePlaceholder";
import { PageHeader } from "@/shared/components/PageHeader";

export default function UsersPage() { return <><PageHeader eyebrow="Admin workspace" title="Users" description="Review accounts and manage platform access." /><FeaturePlaceholder items={["User directory", "Roles and access", "Account status"]} /></>; }
