import { AdministratorPlaceholder } from "@/components/home/administrator-placeholder";
import { AppNav } from "@/components/navigation/app-nav";
import { adminPlaceholderContent } from "@/data/dashboard-content";

export default function AdminPage() {
  return (
    <main className="shell">
      <AppNav current="admin" />
      <AdministratorPlaceholder content={adminPlaceholderContent} />
    </main>
  );
}
