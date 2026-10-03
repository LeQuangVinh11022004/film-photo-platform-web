import { notFound } from "next/navigation";
import { AdminSettingsPage, type SettingsSection } from "@/shared/components/AdminSettingsPage";

const sections: SettingsSection[] = ["profile", "account", "appearance", "notifications", "display"];

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as SettingsSection)) notFound();
  return <AdminSettingsPage section={section as SettingsSection} />;
}