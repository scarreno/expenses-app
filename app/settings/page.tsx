import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { SettingsClient } from "@/app/components/settings/settings-client";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";

export default async function SettingsPage() {
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage application preferences and display options."
      />

      <SettingsClient settings={settings} />
    </PageContainer>
  );
}