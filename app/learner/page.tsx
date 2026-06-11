import { LearnerDashboardShell } from "@/components/learner/learner-dashboard-shell";
import { AppNav } from "@/components/navigation/app-nav";
import { learnerDashboardContent } from "@/data/dashboard-content";

export default function LearnerPage() {
  return (
    <main className="shell">
      <AppNav current="learner" />
      <LearnerDashboardShell initialContent={learnerDashboardContent} />
    </main>
  );
}
