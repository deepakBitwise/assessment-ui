"use client";

import { useEffect, useState } from "react";

import { ActivityTimeline } from "@/components/learner/activity-timeline";
import { HeroSection } from "@/components/learner/hero-section";
import { LiveStatusCard } from "@/components/learner/live-status-card";
import { LLMJudgeReportModal } from "@/components/learner/llm-judge-report";
import { ProblemStatementPanel } from "@/components/learner/problem-statement-panel";
import { SubmissionWorkspace } from "@/components/learner/submission-workspace";

import {
  fetchSubmission,
  fetchSubmissionEvents,
  fetchSubmissions,
  fetchUserByUsername
} from "@/lib/api";

import { getStoredUser, getStoredAccessToken } from "@/lib/auth";

import type {
  ActivityItem,
  DashboardContent,
  Submission,
  SubmissionDetail,
  SubmissionEventHistory,
  SubmissionEventLog
} from "@/types/assessment";

type LearnerDashboardProps = {
  initialContent: DashboardContent;
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

function normalizeSubmissionEvents(
  history?: SubmissionEventHistory | null
): SubmissionEventLog[] {
  if (!history) {
    return [];
  }

  return history.events.map((event, index) => ({
    ...event,
    timestamp: event.timestamp ?? history.created_at,
    id: event.id ?? `${history.submission_id}-${history.created_at}-${index}`
  }));
}

function formatSubmissionActivity(
  submissions: Submission[],
  eventHistoryBySubmissionId: Record<string, SubmissionEventHistory | null>
): ActivityItem[] {
  return [...submissions]
    .sort(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    )
    .map((submission) => {
      const overallStatus = getOverallSubmissionStatus(submission);
      const eventHistory = eventHistoryBySubmissionId[submission.id];
      const events = normalizeSubmissionEvents(eventHistory);

      return {
        id: submission.id,
        title: `Submission ID: ${submission.id}`,
        meta: `${getRelativeTimeLabel(submission.updated_at)} | ${absoluteDateFormatter.format(
          new Date(submission.updated_at)
        )}`,
        detail: `Assessment ${submission.assessment_id} | Automated check: ${submission.automated_check} | LLM judge: ${submission.llm_judge} | Human reviewer: ${submission.human_reviewer}`,
        status: overallStatus,
        events
      };
    });
}

export function LearnerDashboard({
  initialContent
}: LearnerDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [enrolledAssessmentIds, setEnrolledAssessmentIds] = useState<string[] | null>(null);
  const [selectedPsId, setSelectedPsId] = useState(initialContent.problemStatements[0]?.id ?? "");
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [liveSubmissionEvents, setLiveSubmissionEvents] = useState<SubmissionEventLog[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>(initialContent.activity);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>(
    initialContent.liveEvaluationStatus.submissionId
  );
  const [reportSubmissionId, setReportSubmissionId] = useState<string | null>(null);

  const visibleProblemStatements = enrolledAssessmentIds === null
    ? content.problemStatements
    : content.problemStatements.filter(ps => enrolledAssessmentIds.includes(ps.assessmentId));

  const activeAssessmentId =
    visibleProblemStatements.find((ps) => ps.id === selectedPsId)?.assessmentId ??
    visibleProblemStatements[0]?.assessmentId ??
    "";

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    setContent((c) => ({
      ...c,
      profile: {
        ...c.profile,
        name: user.full_name || user.username,
        username: user.username,
        role: user.role === "LEARNER" ? c.profile.role : user.role
      }
    }));
  }, [initialContent]);

  useEffect(() => {
    const user = getStoredUser();
    const token = getStoredAccessToken();
    if (!user || !token) {
      setEnrolledAssessmentIds([]);
      return;
    }
    fetchUserByUsername(user.username, token)
      .then(userData => {
        const ids = userData.enrolled_assessments ?? [];
        setEnrolledAssessmentIds(ids);
        // If current selection is not in enrolled list, reset to first enrolled PS
        setSelectedPsId(prev => {
          const visible = initialContent.problemStatements.filter(ps =>
            ids.includes(ps.assessmentId)
          );
          const stillVisible = visible.some(ps => ps.id === prev);
          return stillVisible ? prev : (visible[0]?.id ?? "");
        });
      })
      .catch(() => setEnrolledAssessmentIds([]));
  }, [initialContent]);

  useEffect(() => {
    setCurrentSubmissionId(content.liveEvaluationStatus.submissionId);
  }, [content.liveEvaluationStatus.submissionId]);

  useEffect(() => {
    if (!currentSubmissionId) {
      setSubmission(null);
      setLiveSubmissionEvents([]);
      return;
    }

    async function loadSubmission() {
      try {
        const submissionId = currentSubmissionId;
        if (!submissionId) return;
        const submissionData = await fetchSubmission(submissionId);

        let eventHistory: SubmissionEventHistory | null = null;

        try {
          eventHistory = await fetchSubmissionEvents(submissionId);
        } catch (eventError) {
          console.error(
            `Failed to fetch submission events for ${submissionId}`,
            eventError
          );
        }

        if (!isActive || submissionId !== currentSubmissionId) {
          return;
        }

        setSubmission(
          submissionData ? { ...submissionData, submission_id: submissionId } : null
        );
        setLiveSubmissionEvents(normalizeSubmissionEvents(eventHistory));
      } catch (error) {
        console.error("Failed to fetch submission", error);
        if (isActive) {
          setSubmission(null);
          setLiveSubmissionEvents([]);
        }
      }
    }

    let isActive = true;

    void loadSubmission();

    const interval = setInterval(() => {
      void loadSubmission();
    }, 2000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
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

        const allSubmissions = await fetchSubmissions();
        const currentUser = getStoredUser();
        const submissions = currentUser
          ? allSubmissions.filter((s) => s.user_id === currentUser.username)
          : [];
        const eventHistoryEntries = await Promise.all(
          submissions.map(async (submission) => {
            try {
              const history = await fetchSubmissionEvents(submission.id);
              return [submission.id, history] as const;
            } catch (error) {
              console.error(
                `Failed to fetch events for submission ${submission.id}`,
                error
              );
              return [submission.id, null] as const;
            }
          })
        );
        const eventHistoryBySubmissionId = Object.fromEntries(eventHistoryEntries);

        if (!isActive) {
          return;
        }

        setActivity(formatSubmissionActivity(submissions, eventHistoryBySubmissionId));
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

      <ProblemStatementPanel
        problemStatements={visibleProblemStatements}
        selectedId={selectedPsId}
        onSelect={setSelectedPsId}
      />

      <section className="sw-grid">
        <SubmissionWorkspace
          assessmentId={activeAssessmentId}
          workspace={content.submissionWorkspace}
          onSubmissionSubmitted={(submissionId) => {
            setCurrentSubmissionId(submissionId);
            setSubmission(null);
            setLiveSubmissionEvents([]);
          }}
          username={content.profile.username}
        />

        <LiveStatusCard
          liveEvaluationStatus={content.liveEvaluationStatus}
          submission={submission}
          liveEvents={liveSubmissionEvents}
          currentSubmissionId={currentSubmissionId}
        />
      </section>

      <section className="stack">
        <ActivityTimeline
          activity={activity}
          isLoading={activityLoading}
          errorMessage={activityError}
          onViewReport={(id) => setReportSubmissionId(id)}
        />
      </section>

      {reportSubmissionId && (
        <LLMJudgeReportModal
          submissionId={reportSubmissionId}
          onClose={() => setReportSubmissionId(null)}
        />
      )}
    </>
  );
}
