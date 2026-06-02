// app/profile/page.tsx
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";

export default async function ProfilePage() {
  const user = await getCurrentUserOrRedirect();

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>

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
    </main>
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