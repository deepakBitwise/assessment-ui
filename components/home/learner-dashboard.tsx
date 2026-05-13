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

  useEffect(() => {
  async function loadSubmission() {
    try {
      const data = await fetchSubmission("submission-1");
      setSubmission(data);
    } catch (error) {
      console.error("Failed to fetch submission", error);
    }
  }

  // Initial fetch
  loadSubmission();

  // Poll every 2 seconds
  const interval = setInterval(() => {
    loadSubmission();
  }, 2000);

  // Cleanup
  return () => clearInterval(interval);

}, []);

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