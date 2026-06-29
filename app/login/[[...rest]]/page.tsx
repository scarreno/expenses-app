import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
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