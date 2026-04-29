"use client";

import { useState } from "react";
import type {
  LearnerProfileSnapshot,
  ReviewerSubmission,
  ReviewerWorkspace
} from "@/types/assessment";

type ReviewerDashboardProps = {
  content: ReviewerWorkspace;
};

function getStatusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("pass")) {
    return "panel__badge";
  }

  if (normalized.includes("flag")) {
    return "panel__badge panel__badge--danger";
  }

  return "panel__badge panel__badge--warm";
}

function LearnerProfileDetail({
  profile,
  submission
}: {
  profile: LearnerProfileSnapshot;
  submission: ReviewerSubmission;
}) {
  return (
    <div className="panel reviewer-detail-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Learner Profile</p>
          <h2>{profile.name}</h2>
        </div>
        <span className={getStatusClassName(submission.status)}>{submission.status}</span>
      </div>

      <div className="reviewer-detail-grid">
        <div className="detail-stat">
          <span>Cohort</span>
          <strong>{profile.cohort}</strong>
        </div>
        <div className="detail-stat">
          <span>Current level</span>
          <strong>{profile.currentLevel}</strong>
        </div>
        <div className="detail-stat">
          <span>Readiness</span>
          <strong>{profile.readiness}</strong>
        </div>
        <div className="detail-stat">
          <span>Submission</span>
          <strong>{profile.lastSubmission}</strong>
        </div>
      </div>

      <div className="reviewer-notes-grid">
        <div className="brief-card brief-card--accent">
          <p className="eyebrow">Strengths</p>
          <ul>
            {profile.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="brief-card">
          <p className="eyebrow">Attention Areas</p>
          <ul>
            {profile.attentionAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="review-summary">
        <strong>{submission.id}</strong>
        <p>{submission.summary}</p>
        <span>{submission.risk}</span>
      </div>
    </div>
  );
}

export function ReviewerDashboard({ content }: ReviewerDashboardProps) {
  const [activeSubmissionId, setActiveSubmissionId] = useState(content.submissions[0]?.id);
  const activeSubmission =
    content.submissions.find((submission) => submission.id === activeSubmissionId) ??
    content.submissions[0];
  const activeProfile = activeSubmission
    ? content.learnerProfiles[activeSubmission.id]
    : undefined;

  return (
    <>
      <section className="reviewer-hero">
        <div className="hero__copy">
          <p className="eyebrow">Reviewer Console</p>
          <h1>{content.title}</h1>
          <p className="hero__text">
            Prioritize borderline submissions, inspect learner context, and keep the
            sign-off flow traceable without losing momentum.
          </p>
          <div className="hero__actions">
            <button className="button button--primary">Open Next Review</button>
            <button className="button button--ghost">Reviewer Guidelines</button>
          </div>
        </div>

        <div className="panel reviewer-summary-panel">
          <p className="eyebrow">Queue Summary</p>
          <h2>{content.queueSummary}</h2>
          <p className="spotlight-panel__summary">
            Sort by urgency, click into a learner, and make the final call with the
            same calm, evidence-backed workflow every time.
          </p>
        </div>
      </section>

      <section className="layout-grid layout-grid--bottom">
        <div className="panel reviewer-queue-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Submission Queue</p>
              <h2>Review-ready submissions</h2>
            </div>
          </div>

          <div className="reviewer-queue">
            {content.submissions.map((submission) => (
              <button
                className={`queue-item${submission.id === activeSubmission?.id ? " queue-item--active" : ""}`}
                key={submission.id}
                onClick={() => setActiveSubmissionId(submission.id)}
                type="button"
              >
                <div className="queue-item__head">
                  <strong>{submission.learnerName}</strong>
                  <span className={getStatusClassName(submission.status)}>{submission.status}</span>
                </div>
                <p>{submission.level} · {submission.attempt}</p>
                <p>{submission.score} · {submission.submittedAt}</p>
                <span className="queue-item__link">Open learner profile</span>
              </button>
            ))}
          </div>
        </div>

        {activeSubmission && activeProfile ? (
          <LearnerProfileDetail
            profile={activeProfile}
            submission={activeSubmission}
          />
        ) : null}
      </section>
    </>
  );
}
