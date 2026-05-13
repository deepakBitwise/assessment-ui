"use client";

import { useState } from "react";
import type {
  Level,
  LevelState,
  LiveEvaluationStatus,
  RubricItem
} from "@/types/assessment";

type ProgressRailProps = {
  levels: Level[];
  liveEvaluationStatus: LiveEvaluationStatus;
  rubric: RubricItem[];
  submission: any;
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

function getLiveTierSummary(liveEvaluationStatus: LiveEvaluationStatus) {
  const activeTier =
    liveEvaluationStatus.tiers.find((tier) => tier.state === "running") ??
    liveEvaluationStatus.tiers.find((tier) => tier.state === "queued") ??
    liveEvaluationStatus.tiers[0];

  const activeCheck =
    activeTier?.checks?.find((check) => check.state === "running") ??
    activeTier?.checks?.find((check) => check.state === "queued");

  return {
    activeTier,
    detail:
      activeCheck?.detail ||
      activeCheck?.name.replaceAll("_", " ") ||
      activeTier?.statusLabel ||
      "Awaiting evaluation updates"
  };
}

function getStatusClass(status?: string) {
  if (!status) return "pending";

  if (status === "PASSED") return "passed";

  if (status === "REJECTED") return "failed";

  return "pending";
}

function getStatusLabel(status?: string) {
  if (!status) return "Pending";

  if (status === "PASSED") return "Completed";

  if (status === "REJECTED") return "Failed";

  return "Pending";
}

export function ProgressRail({
  levels,
  liveEvaluationStatus,
  rubric,
  submission
}: ProgressRailProps) {
  const [expandedLevels, setExpandedLevels] = useState<string[]>(() =>
    levels.filter((level) => level.state === "live").map((level) => level.id)
  );

  const liveTierSummary = getLiveTierSummary(liveEvaluationStatus);
  const displayedSubmissionId =
    submission?.submission_id ?? liveEvaluationStatus.submissionId;

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
                    {level.state === "live" && displayedSubmissionId ? ( // Remove this condition to always show live status when expanded
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