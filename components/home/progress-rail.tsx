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
};

const levelStateLabel: Record<LevelState, string> = {
  live: "Active now",
  complete: "Passed",
  locked: "Locked"
};

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

export function ProgressRail({
  levels,
  liveEvaluationStatus,
  rubric
}: ProgressRailProps) {
  const [expandedLevels, setExpandedLevels] = useState<string[]>(() =>
    levels.filter((level) => level.state === "live").map((level) => level.id)
  );
  const liveTierSummary = getLiveTierSummary(liveEvaluationStatus);

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
            <article className={`level-card level-card--${level.state}`} key={level.id}>
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
                  <span className="chip">{levelStateLabel[level.state]}</span>
                </div>

                <p className="level-card__brief">{level.brief}</p>

                {isExpanded ? (
                  <div className="level-card__details">
                    {level.state === "live" ? (
                      <div className="level-live-status">
                        <div className="level-live-status__header">
                          <strong>Live status</strong>
                          <span
                            className={`status-inline status-inline--${liveTierSummary.activeTier?.state ?? "pending"}`}
                          >
                            {liveTierSummary.activeTier?.state === "running"
                              ? "\u25cf"
                              : "\u25cb"}{" "}
                            {liveTierSummary.activeTier?.statusLabel ?? "pending"}
                          </span>
                        </div>
                        <p className="level-live-status__meta">
                          Submission {liveEvaluationStatus.submissionId} |{" "}
                          {liveEvaluationStatus.levelAttempt} |{" "}
                          {liveEvaluationStatus.submittedAgo}
                        </p>
                        <p className="level-live-status__title">
                          {liveTierSummary.activeTier?.title ?? "Evaluation queued"}
                        </p>
                        <p className="level-live-status__detail">
                          {liveTierSummary.detail}
                        </p>
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
                  <span>{isExpanded ? "Expanded details visible" : level.course}</span>
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
