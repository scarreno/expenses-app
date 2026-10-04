import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { AuthMarketingHeader } from "@/app/components/auth/auth-marketing-header";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center">
      <AuthMarketingHeader />
      <SignUp
        forceRedirectUrl="/onboarding"
        signInForceRedirectUrl="/onboarding"
        appearance={{
          theme: dark          
        }}
      />
    </main>
  );
}