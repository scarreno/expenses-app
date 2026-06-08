import { SettingsClient } from "@/app/components/settings/settings-client";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user"
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { PageHeader } from "@/app/components/layout/page-header";


export default async function SettingsPage() {
    const user = await getCurrentUserOrRedirect();
    const settings = await getUserSettings(user.id);

    return (
        <main className="container mx-auto max-w-4xl space-y-6 py-8">
        <PageHeader
            title="Settings"
            description="Manage application preferences and display options."
        />

        <SettingsClient settings={settings} />
        </main>
    );
}