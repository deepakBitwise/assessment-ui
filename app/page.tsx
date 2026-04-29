import { LoginShell } from "@/components/home/login-shell";
import { AppNav } from "@/components/navigation/app-nav";
import { workspaceRouteCards } from "@/data/dashboard-content";

export default function Home() {
  return (
    <main className="shell">
      <AppNav current="home" />
      <LoginShell routes={workspaceRouteCards} />
    </main>
  );
}
