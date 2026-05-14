import { LearnerDashboardShell } from "@/components/home/learner-dashboard-shell";
import { AppNav } from "@/components/navigation/app-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { learnerDashboardContent } from "@/data/dashboard-content";

export default function LearnerPage() {
  return (
    <main className="shell">
      <AppNav current="learner" />
      <AuthGuard allowedRole="LEARNER">
        <LearnerDashboardShell initialContent={learnerDashboardContent} />
      </AuthGuard>
    </main>
  );
}
