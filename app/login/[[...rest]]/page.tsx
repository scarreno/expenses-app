import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { AuthMarketingHeader } from "@/app/components/auth/auth-marketing-header";

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center">
      <AuthMarketingHeader />
      <SignIn
      forceRedirectUrl="/onboarding"
      signUpForceRedirectUrl="/onboarding"
        appearance={{
          theme: dark
        }}
      />
    </main>
  );
}