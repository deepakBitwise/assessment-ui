"use client";

import { useState } from "react";
import type {
  Level,
  LevelState,
  LiveEvaluationStatus,
  RubricItem,
  SubmissionDetail,
  SubmissionEventLog
} from "@/types/assessment";

type ProgressRailProps = {
  levels: Level[];
  liveEvaluationStatus: LiveEvaluationStatus;
  rubric: RubricItem[];
  submission: SubmissionDetail | null;
  liveEvents: SubmissionEventLog[];
  currentSubmissionId?: string | null;
};

const levelStateLabel: Record<LevelState, string> = {
  live: "Active now",
  complete: "Passed",
  locked: "Locked"
};

/**
 * Maps tier index to submission object property keys
 * Maintains order: Tier 0 → automated_check, Tier 1 → llm_judge, Tier 2 → human_reviewer
 */
const tierStateMap = ['automated_check', 'llm_judge', 'human_reviewer'] as const;

function getStatusClass(status?: string) {
  if (!status) return "pending";

  if (status === "PASSED") return "passed";

  if (status === "REJECTED") return "failed";

  if (status === "QUEUED") return "queued";

  return "pending";
}

function getStatusLabel(status?: string) {
  if (!status) return "Pending";

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

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function ProgressRail({
  levels,
  liveEvaluationStatus,
  rubric,
  submission,
  liveEvents,
  currentSubmissionId = null
}: ProgressRailProps) {
  const [expandedLevels, setExpandedLevels] = useState<string[]>(() =>
    levels.filter((level) => level.state === "live").map((level) => level.id)
  );

  const displayedSubmissionId =
    currentSubmissionId ??
    submission?.submission_id ??
    liveEvaluationStatus.submissionId;

  function toggleLevel(levelId: string) {
    setExpandedLevels((current) =>
      current.includes(levelId)
        ? current.filter((id) => id !== levelId)
        : [...current, levelId]
    );
  }

  return (
    <div className="panel progress-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Learning Path</p>
          <h2>Seven-level progression rail</h2>
        </div>

        <span className="panel__badge">Strict gating</span>
      </div>

      <div className="levels">
        {levels.map((level, index) => {
          const isExpanded = expandedLevels.includes(level.id);

          return (
            <article
              className={`level-card level-card--${level.state}`}
              key={level.id}
            >
              <div className="level-card__index">
                <span>{level.id}</span>
                {index < levels.length - 1 ? <i /> : null}
              </div>

              <div className="level-card__body">
                <div className="level-card__header">
                  <div>
                    <h3>{level.title}</h3>
                    <p>{level.capability}</p>
                  </div>

                  <span className="chip">
                    {levelStateLabel[level.state]}
                  </span>
                </div>

                <p className="level-card__brief">{level.brief}</p>

                {isExpanded ? (
                  <div className="level-card__details">
                    {level.state === "live" && displayedSubmissionId ? (
                      <div className="level-live-status">
                        <div className="level-live-status__header">
                          <strong>Live status</strong>
                        </div>

                        <p className="level-live-status__meta">
                          Submission {displayedSubmissionId} |{" "}
                          {liveEvaluationStatus.levelAttempt} |{" "}
                          {liveEvaluationStatus.submittedAgo}
                        </p>

                        <div className="tier-status-list">
                          {liveEvaluationStatus.tiers.map((tier, index) => {
                            const stateKey = tierStateMap[index];
                            const tierState = submission?.[stateKey];

                            return (
                              <div className="tier-status-item" key={tier.title}>
                                <strong>{tier.title}</strong>
                                <span
                                  className={`status ${getStatusClass(tierState)}`}
                                >
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
                            <p className="level-live-status__detail">
                              Logs will appear here as each automated stage reports back.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="level-score-preview">
                      <div className="level-score-preview__header">
                        <strong>Scoring preview</strong>
                        <span>{level.course}</span>
                      </div>

                      <div className="level-score-preview__list">
                        {rubric.map((item) => (
                          <div
                            className="level-score-preview__item"
                            key={`${level.id}-${item.name}`}
                          >
                            <div>
                              <strong>{item.name}</strong>
                              <span>{item.weight}</span>
                            </div>

                            <em>{item.score}</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="level-card__footer">
                  <span>
                    {isExpanded
                      ? "Expanded details visible"
                      : level.course}
                  </span>

                  <button
                    className="text-link"
                    onClick={() => toggleLevel(level.id)}
                    type="button"
                  >
                    {isExpanded ? "Hide" : "Expand"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
