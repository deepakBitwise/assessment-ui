import { ReviewerDashboard } from "@/components/home/reviewer-dashboard";
import { AppNav } from "@/components/navigation/app-nav";
import { reviewerWorkspaceContent } from "@/data/dashboard-content";

export default function ReviewerPage() {
  return (
    <main className="shell">
      <AppNav current="reviewer" />
      <ReviewerDashboard content={reviewerWorkspaceContent} />
    </main>
  );
}
