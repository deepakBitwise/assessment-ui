"use client";

import { useEffect, useState } from "react";

import { ActivityTimeline } from "@/components/home/activity-timeline";
import { ActiveAssessmentPanel } from "@/components/home/active-assessment-panel";
import { HeroSection } from "@/components/home/hero-section";
import { ProgressRail } from "@/components/home/progress-rail";
import { SubmissionWorkspace } from "@/components/home/submission-workspace";

import { fetchSubmission, fetchSubmissions } from "@/lib/api";

import type { ActivityItem, DashboardContent, Submission } from "@/types/assessment";

type LearnerDashboardProps = {
  content: DashboardContent;
};

const absoluteDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto"
});

function getRelativeTimeLabel(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  const diffInMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const absoluteDiff = Math.abs(diffInMinutes);

  if (absoluteDiff < 60) {
    return relativeTimeFormatter.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return relativeTimeFormatter.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  return relativeTimeFormatter.format(diffInDays, "day");
}

function getOverallSubmissionStatus(submission: Submission) {
  if (
    submission.automated_check === "REJECTED" ||
    submission.llm_judge === "REJECTED" ||
    submission.human_reviewer === "REJECTED"
  ) {
    return "REJECTED";
  }

  if (
    submission.automated_check === "PASSED" &&
    submission.llm_judge === "PASSED" &&
    submission.human_reviewer === "PASSED"
  ) {
    return "PASSED";
  }

  return "PENDING";
}

function formatSubmissionActivity(submissions: Submission[]): ActivityItem[] {
  return [...submissions]
    .sort(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    )
    .map((submission) => {
      const overallStatus = getOverallSubmissionStatus(submission);

      return {
        id: submission.id,
        title: `Submission ID: ${submission.id}`,
        meta: `${getRelativeTimeLabel(submission.updated_at)} | ${absoluteDateFormatter.format(
          new Date(submission.updated_at)
        )}`,
        detail: `Assessment ${submission.assessment_id} | Automated check: ${submission.automated_check} | LLM judge: ${submission.llm_judge} | Human reviewer: ${submission.human_reviewer}`,
        status: overallStatus
      };
    });
}

export function LearnerDashboard({
  content
}: LearnerDashboardProps) {

  const [submission, setSubmission] = useState<any>(null);
  const [activity, setActivity] = useState<ActivityItem[]>(content.activity);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
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

  useEffect(() => {
    let isActive = true;

    async function loadSubmissions(showLoadingState: boolean) {
      try {
        if (isActive && showLoadingState) {
          setActivityLoading(true);
        }

        if (isActive) {
          setActivityError(null);
        }

        const submissions = await fetchSubmissions();

        if (!isActive) {
          return;
        }

        setActivity(formatSubmissionActivity(submissions));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setActivityError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading recent submissions."
        );
      } finally {
        if (isActive) {
          setActivityLoading(false);
        }
      }
    }

    void loadSubmissions(activity.length === 0);

    const interval = setInterval(() => {
      void loadSubmissions(false);
    }, 10000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [activity.length, currentSubmissionId]);

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
        <ActivityTimeline
          activity={activity}
          isLoading={activityLoading}
          errorMessage={activityError}
        />
      </section>
    </>
  );
}
