"use client";

import type {
  LiveEvaluationStatus,
  SubmissionDetail,
  SubmissionEventLog
} from "@/types/assessment";

type LiveStatusCardProps = {
  liveEvaluationStatus: LiveEvaluationStatus;
  submission: SubmissionDetail | null;
  liveEvents: SubmissionEventLog[];
  currentSubmissionId?: string | null;
};

const tierStateMap = ["automated_check", "llm_judge", "human_reviewer"] as const;

function getStatusClass(status?: string) {
  if (status === "PASSED") return "passed";
  if (status === "REJECTED") return "failed";
  if (status === "QUEUED") return "queued";
  return "pending";
}

function getStatusLabel(status?: string) {
  if (status === "PASSED") return "Completed";
  if (status === "REJECTED") return "Failed";
  if (status === "QUEUED") return "Queued";
  return "Pending";
}

function getEventTone(type: SubmissionEventLog["type"]) {
  if (type === "SUCCESS") return "passed";
  if (type === "FAILURE") return "failed";
  if (type === "QUEUED") return "queued";
  if (type === "GENERAL") return "general";
  return "pending";
}

function formatEventTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function LiveStatusCard({
  liveEvaluationStatus,
  submission,
  liveEvents,
  currentSubmissionId = null
}: LiveStatusCardProps) {
  const hasSubmission = submission !== null;

  const displayedSubmissionId = hasSubmission
    ? (currentSubmissionId ?? submission.submission_id ?? liveEvaluationStatus.submissionId)
    : null;

  return (
    <div className="panel live-status-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Live Evaluation</p>
          <h2>Current status</h2>
        </div>
        <span className={`panel__badge${hasSubmission ? " panel__badge--live" : ""}`}>
          {hasSubmission ? "Live" : "Awaiting"}
        </span>
      </div>

      {!hasSubmission ? (
        /* ── Empty / no-submission state ── */
        <div className="live-status-empty">
          <p className="live-status-empty__title">No active submission</p>
          <p className="live-status-empty__hint">
            Submit your project using the workspace on the left — evaluation
            status and logs will appear here in real time.
          </p>
          <div className="live-status-empty__tiers">
            {liveEvaluationStatus.tiers.map((tier) => (
              <div className="tier-status-item tier-status-item--muted" key={tier.title}>
                <strong>{tier.title}</strong>
                <span className="status pending">Pending</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Active submission state ── */
        <>
          {displayedSubmissionId && (
            <p className="live-status-panel__id">
              Submission: <code>{displayedSubmissionId}</code>
            </p>
          )}

          <div className="tier-status-list">
            {liveEvaluationStatus.tiers.map((tier, index) => {
              const stateKey = tierStateMap[index];
              const tierState = submission[stateKey];
              return (
                <div className="tier-status-item" key={tier.title}>
                  <strong>{tier.title}</strong>
                  <span className={`status ${getStatusClass(tierState)}`}>
                    {getStatusLabel(tierState)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="live-event-stream">
            <div className="live-event-stream__header">
              <strong>Latest logs</strong>
              <span>
                {liveEvents.length > 0
                  ? `${liveEvents.length} update${liveEvents.length === 1 ? "" : "s"}`
                  : "Waiting for evaluator output"}
              </span>
            </div>

            {liveEvents.length > 0 ? (
              <div className="live-event-stream__list">
                {liveEvents.map((event) => (
                  <article
                    className="live-event-card"
                    key={event.id ?? `${event.type}-${event.timestamp}-${event.value}`}
                  >
                    <div className="live-event-card__head">
                      <p>{event.value}</p>
                      <span className={`status ${getEventTone(event.type)}`}>
                        {event.type}
                      </span>
                      <time>{formatEventTimestamp(event.timestamp)}</time>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="live-status-panel__empty">
                Logs will appear here as each automated stage reports back.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
