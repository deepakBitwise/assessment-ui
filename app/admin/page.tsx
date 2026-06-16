import { AdminShell } from "@/components/admin/admin-shell";
import { AppNav } from "@/components/navigation/app-nav";

export default function AdminPage() {
  return (
    <main className="shell">
      <AppNav current="admin" />
      <AdminShell />
    </main>
  );
}
