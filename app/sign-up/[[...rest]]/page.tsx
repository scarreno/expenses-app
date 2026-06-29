import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
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