import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <SignIn />
    </main>
  );
}