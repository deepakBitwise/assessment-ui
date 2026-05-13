"use client";

import { useEffect, useState } from "react";

import { ActivityTimeline } from "@/components/home/activity-timeline";
import { ActiveAssessmentPanel } from "@/components/home/active-assessment-panel";
import { HeroSection } from "@/components/home/hero-section";
import { ProgressRail } from "@/components/home/progress-rail";
import { SubmissionWorkspace } from "@/components/home/submission-workspace";

import { fetchSubmission } from "@/lib/api";

import type { DashboardContent } from "@/types/assessment";

type LearnerDashboardProps = {
  content: DashboardContent;
};

export function LearnerDashboard({
  content
}: LearnerDashboardProps) {

  const [submission, setSubmission] = useState<any>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>(
    content.liveEvaluationStatus.submissionId
  );

  useEffect(() => {
    if (!currentSubmissionId) {
      return;
    }

    async function loadSubmission() {
      try {
        const submissionId = currentSubmissionId;
        if (!submissionId) return;
        const data = await fetchSubmission(submissionId);
        setSubmission(data ? { ...data, submission_id: submissionId } : null);
      } catch (error) {
        console.error("Failed to fetch submission", error);
      }
    }

    loadSubmission();

    const interval = setInterval(() => {
      loadSubmission();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentSubmissionId]);

  return (
    <>
      <HeroSection
        hero={content.hero}
        profile={content.profile}
      />

      <section className="layout-grid">
        <ProgressRail
          levels={content.levels}
          liveEvaluationStatus={content.liveEvaluationStatus}
          rubric={content.rubric}
          submission={submission}
        />

        <div className="stack">
          <ActiveAssessmentPanel
            assessment={content.activeAssessment}
          />

          <SubmissionWorkspace
            assessment={content.activeAssessment}
            workspace={content.submissionWorkspace}
            onSubmissionSubmitted={(submissionId) => {
              setCurrentSubmissionId(submissionId);
              // setSubmission({ submission_id: submissionId });
            }}
          />
        </div>
      </section>

      <br />

      <section className="stack">
        <ActivityTimeline activity={content.activity} />
      </section>
    </>
  );
}