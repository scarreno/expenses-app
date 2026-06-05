import { SettingsClient } from "@/app/components/settings/settings-client";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user"
import { getUserSettings } from "@/app/lib/settings/get-user-settings";


export default async function SettingsPage() {
    const user = await getCurrentUserOrRedirect();
    const settings = await getUserSettings(user.id);

    return(
        <SettingsClient settings={settings} />
    );
}