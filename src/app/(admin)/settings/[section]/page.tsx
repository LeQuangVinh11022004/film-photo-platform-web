import { notFound, redirect } from "next/navigation";
import { AdminSettingsPage, type SettingsSection } from "@/shared/components/AdminSettingsPage";

const sections: SettingsSection[] = ["profile", "account", "appearance"];
const removedSections = ["notifications", "display", "platform"];

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (removedSections.includes(section)) {
    redirect("/settings/profile");
  }
  if (!sections.includes(section as SettingsSection)) notFound();
  return <AdminSettingsPage section={section as SettingsSection} />;
}
