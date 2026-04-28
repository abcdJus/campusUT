import { LoginPanel } from "@/components/LoginPanel";

export default function LoginPage() {
  return (
    <main className="page-shell centered">
      <section className="workspace-panel auth-shell">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Welcome to CampusTalk</h1>
        </div>
        <LoginPanel />
      </section>
    </main>
  );
}
