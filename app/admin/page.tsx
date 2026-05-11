import { AssessmentList } from "@/components/admin/assessment-list";
import { AppNav } from "@/components/navigation/app-nav";

export default function AdminPage() {
  return (
    <main className="shell">
      <AppNav current="admin" />
      <AssessmentList />
    </main>
  );
}
