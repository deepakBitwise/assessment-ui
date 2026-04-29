import { ActivityTimeline } from "@/components/home/activity-timeline";
import { ActiveAssessmentPanel } from "@/components/home/active-assessment-panel";
import { HeroSection } from "@/components/home/hero-section";
import { ProgressRail } from "@/components/home/progress-rail";
import { RubricPreview } from "@/components/home/rubric-preview";
import { SubmissionWorkspace } from "@/components/home/submission-workspace";
import type { DashboardContent } from "@/types/assessment";

type LearnerDashboardProps = {
  content: DashboardContent;
};

export function LearnerDashboard({ content }: LearnerDashboardProps) {
  return (
    <>
      <HeroSection hero={content.hero} profile={content.profile} />

      <section className="layout-grid">
        <ProgressRail
          levels={content.levels}
          liveEvaluationStatus={content.liveEvaluationStatus}
        />
        <ActiveAssessmentPanel assessment={content.activeAssessment} />
      </section>

      <section className="layout-grid layout-grid--bottom">
        <SubmissionWorkspace workspace={content.submissionWorkspace} />

        <div className="stack">
          <RubricPreview rubric={content.rubric} />
          <ActivityTimeline activity={content.activity} />
        </div>
      </section>
    </>
  );
}
