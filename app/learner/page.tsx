import { LearnerDashboard } from "@/components/home/learner-dashboard";
import { AppNav } from "@/components/navigation/app-nav";
import { learnerDashboardContent } from "@/data/dashboard-content";

export default function LearnerPage() {
  return (
    <main className="shell">
      <AppNav current="learner" />
      <LearnerDashboard content={learnerDashboardContent} />
    </main>
  );
}
