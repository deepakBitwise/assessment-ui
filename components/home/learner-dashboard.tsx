import { ActivityTimeline } from "@/components/home/activity-timeline";
import { ActiveAssessmentPanel } from "@/components/home/active-assessment-panel";
import { HeroSection } from "@/components/home/hero-section";
import { ProgressRail } from "@/components/home/progress-rail";
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
          rubric={content.rubric}
        />
        <div className="stack">
          <ActiveAssessmentPanel assessment={content.activeAssessment} />
          <SubmissionWorkspace
            assessment={content.activeAssessment}
            workspace={content.submissionWorkspace}
          />
        </div>
      </section>
      <br></br>
      <section className="stack">
        <ActivityTimeline activity={content.activity} />
      </section>
    </>
  );
}
