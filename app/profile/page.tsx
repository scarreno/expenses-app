// app/profile/page.tsx
import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

export default async function ProfilePage() {
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = getDictionary(settings.language);

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title={dictionary.profile.title}
        description={dictionary.profile.description}
      />

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.profile.userInformation.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProfileRow label={dictionary.profile.userInformation.name} value={user.name}  notAvailableValue={dictionary.profile.notAvailable}/>
          <ProfileRow label={dictionary.profile.userInformation.email} value={user.email}  notAvailableValue={dictionary.profile.notAvailable} />
          <ProfileRow label={dictionary.profile.userInformation.userId} value={user.id}  notAvailableValue={dictionary.profile.notAvailable} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.profile.googleAccount.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProfileRow label={dictionary.profile.googleAccount.provider} value="Google"   notAvailableValue={dictionary.profile.notAvailable} />
          <ProfileRow label={dictionary.profile.googleAccount.googleEmail} value={user.email}   notAvailableValue={dictionary.profile.notAvailable} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.profile.preferences.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {dictionary.profile.preferences.description}
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function ProfileRow({
  label,
  value,
  notAvailableValue
}: {
  label: string;
  value?: string | null;
  notAvailableValue: string
}) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value ?? notAvailableValue}</span>
    </div>
  );
}