import { AuthButton } from "@/app/components/auth/auth-button";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 32,
          border: "1px solid #333",
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        <h1>Expenses MVP</h1>
        <p style={{ color: "#777" }}>
          Sign in to manage your receipts and expenses.
        </p>

        <div style={{ marginTop: 24 }}>
          <AuthButton />
        </div>
      </div>
    </main>
  );
}