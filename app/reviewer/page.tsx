import { ReviewerDashboard } from "@/components/human-review/reviewer-dashboard";

import { AppNav } from "@/components/navigation/app-nav";

export default function ReviewerPage() {
  return (
    <main className="shell">
      <AppNav current="reviewer" />

      <ReviewerDashboard />
    </main>
  );
}