// app/profile/page.tsx
import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUserOrRedirect();

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Profile"
        description="Manage your account information and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>User information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProfileRow label="Name" value={user.name} />
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow label="User ID" value={user.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProfileRow label="Provider" value="Google" />
          <ProfileRow label="Google email" value={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Account preferences will be available here in a future version.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value ?? "Not available"}</span>
    </div>
  );
}