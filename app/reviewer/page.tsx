import { ReviewerDashboard } from "@/components/Reviewer/reviewer-dashboard";
import { AppNav } from "@/components/navigation/app-nav";

export default function ReviewerPage() {
  return (
    <main className="shell">
      <AppNav current="reviewer" />
      <ReviewerDashboard />
    </main>
  );
}