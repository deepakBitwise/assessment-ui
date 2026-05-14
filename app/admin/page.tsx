import { AssessmentList } from "@/components/admin/assessment-list";
import { AppNav } from "@/components/navigation/app-nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminPage() {
  return (
    <main className="shell">
      <AppNav current="admin" />
      <AuthGuard allowedRole="ADMIN">
        <AssessmentList />
      </AuthGuard>
    </main>
  );
}
