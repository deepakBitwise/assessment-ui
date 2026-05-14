import { ReviewerDashboard } from "@/components/home/reviewer-dashboard";
import { AppNav } from "@/components/navigation/app-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { reviewerWorkspaceContent } from "@/data/dashboard-content";

export default function ReviewerPage() {
  return (
    <main className="shell">
      <AppNav current="reviewer" />
      <AuthGuard allowedRole="REVIEWER">
        <ReviewerDashboard content={reviewerWorkspaceContent} />
      </AuthGuard>
    </main>
  );
}
