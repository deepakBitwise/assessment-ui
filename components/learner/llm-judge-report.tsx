"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { fetchLLMJudgeResult } from "@/lib/api";
import type { JudgeRun, LLMJudgeResult } from "@/types/assessment";

type Props = {
  submissionId: string;
  onClose: () => void;
};

const DIMENSION_LABELS: Record<string, string> = {
  groundedness: "Groundedness",
  correctness: "Correctness",
  retrieval_quality: "Retrieval Quality",
  architecture_quality: "Architecture Quality",
  documentation_clarity: "Documentation Clarity",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(d);
}

function ScoreBar({
  score,
  max = 5,
  failing = false
}: {
  score: number;
  max?: number;
  failing?: boolean;
}) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="report-score-bar">
      <div
        className={`report-score-bar__fill${failing ? " report-score-bar__fill--fail" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function RunCard({
  run,
  failingDimensions
}: {
  run: JudgeRun;
  failingDimensions: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const confidencePct =
    run.confidence != null ? `${Math.round(run.confidence * 100)}%` : "—";

  return (
    <div className="report-run">
      <button
        className="report-run__header"
        onClick={() => setExpanded((e) => !e)}
        type="button"
      >
        <span className="report-run__header-left">
          <strong>Run {run.run_no}</strong>
          <span className="report-run__confidence">
            Confidence: {confidencePct}
          </span>
          {run.error ? (
            <span className="status failed">Error</span>
          ) : run.parse_success === false ? (
            <span className="status pending">Parse failed</span>
          ) : null}
        </span>
        <span
          className={`report-run__chevron${expanded ? " report-run__chevron--open" : ""}`}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="report-run__body">
          {run.overall_rationale && (
            <p className="report-run__rationale">{run.overall_rationale}</p>
          )}
          {run.low_confidence_reason && (
            <p className="report-run__low-conf">
              <strong>Low confidence reason:</strong> {run.low_confidence_reason}
            </p>
          )}
          {run.scores && run.scores.length > 0 && (
            <div className="report-run__scores">
              {run.scores.map((s) => {
                const isFailing = failingDimensions.includes(s.dimension);
                return (
                  <div
                    key={s.dimension}
                    className={`report-run__score-item${isFailing ? " report-run__score-item--fail" : ""}`}
                  >
                    <div className="report-run__score-head">
                      <span className="report-run__dim">
                        {DIMENSION_LABELS[s.dimension] ?? s.dimension}
                      </span>
                      <span className="report-run__score-val">
                        {s.score} / 5
                      </span>
                    </div>
                    <ScoreBar score={s.score} failing={isFailing} />
                    {s.rationale && (
                      <p className="report-run__rationale-text">{s.rationale}</p>
                    )}
                    {s.citation && (
                      <p className="report-run__citation">
                        Evidence: {s.citation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LLMJudgeReportModal({ submissionId, onClose }: Props) {
  const [result, setResult] = useState<LLMJudgeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setResult(null);

    fetchLLMJudgeResult(submissionId)
      .then((data) => {
        if (active) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load evaluation report."
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [submissionId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isPassed = result?.provisional_verdict === "PASSED";
  const isRejected = result?.provisional_verdict === "REJECTED";
  const failingDimensions = result?.failing_dimensions ?? [];
  const scoreBreakdown = result?.score_breakdown ?? {};
  const hasBreakdown = Object.keys(scoreBreakdown).length > 0;

  if (!mounted) return null;

  return createPortal(
    <div
      className="report-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-label="LLM Judge Report"
      >
        {/* ── Sticky header ── */}
        <div className="report-modal__header">
          <div className="report-modal__header-left">
            <span className="report-modal__icon">⚖️</span>
            <div>
              <p className="eyebrow">AI Evaluation</p>
              <h2 className="report-modal__title">LLM Judge Report</h2>
            </div>
          </div>
          <div className="report-modal__header-actions">
            <button
              className="button button--ghost report-print-btn"
              onClick={() => window.print()}
              type="button"
            >
              Print / Save PDF
            </button>
            <button
              className="report-modal__close"
              onClick={onClose}
              type="button"
              aria-label="Close report"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="report-modal__body">
          {loading && (
            <div className="report-state">
              <p className="eyebrow">Loading</p>
              <p>Fetching evaluation report…</p>
            </div>
          )}

          {!loading && error && (
            <div className="report-state report-state--error">
              <p className="eyebrow">Unavailable</p>
              <p>{error}</p>
              <p className="report-state__hint">
                The LLM judge report may not be ready yet for this submission.
                Try again after the evaluation pipeline completes.
              </p>
            </div>
          )}

          {!loading && result && (
            <>
              {/* ── Verdict Banner ── */}
              <div
                className={`report-verdict${isPassed ? " report-verdict--passed" : isRejected ? " report-verdict--rejected" : ""}`}
              >
                <div className="report-verdict__left">
                  <span
                    className={`status report-verdict__badge${isPassed ? " passed" : isRejected ? " failed" : " pending"}`}
                  >
                    {result.provisional_verdict ?? "PENDING"}
                  </span>
                  <div>
                    <p className="report-verdict__label">Provisional Verdict</p>
                    <p className="report-verdict__sub">
                      Submission: <code>{submissionId}</code>
                    </p>
                  </div>
                </div>
                <div className="report-verdict__score">
                  <span className="report-verdict__score-val">
                    {result.final_score != null
                      ? result.final_score.toFixed(1)
                      : "—"}
                    <span className="report-verdict__score-max">
                      {" "}
                      / {result.final_score_max ?? 100}
                    </span>
                  </span>
                  <span className="report-verdict__score-label">
                    Final Score
                  </span>
                </div>
              </div>

              {/* ── Score Overview ── */}
              <section className="report-section">
                <h3 className="report-section__title">Score Overview</h3>
                <div className="report-score-grid">
                  <div className="report-score-card">
                    <p className="report-score-card__label">
                      Automated Check (Tier 1)
                    </p>
                    <p className="report-score-card__value">
                      {result.tier1_score != null
                        ? result.tier1_score.toFixed(1)
                        : "—"}
                      <span className="report-score-card__max">
                        {" "}
                        / {result.tier1_max ?? "—"}
                      </span>
                    </p>
                    {result.tier1_score != null && result.tier1_max != null && (
                      <ScoreBar
                        score={result.tier1_score}
                        max={result.tier1_max}
                      />
                    )}
                  </div>

                  <div className="report-score-card">
                    <p className="report-score-card__label">
                      LLM Judge (Tier 2)
                    </p>
                    <p className="report-score-card__value">
                      {result.tier2_score != null
                        ? result.tier2_score.toFixed(1)
                        : "—"}
                      <span className="report-score-card__max">
                        {" "}
                        / {result.tier2_max ?? "—"}
                      </span>
                    </p>
                    {result.tier2_score != null && result.tier2_max != null && (
                      <ScoreBar
                        score={result.tier2_score}
                        max={result.tier2_max}
                      />
                    )}
                  </div>

                  <div className="report-score-card report-score-card--final">
                    <p className="report-score-card__label">Final Score</p>
                    <p className="report-score-card__value">
                      {result.final_score != null
                        ? result.final_score.toFixed(1)
                        : "—"}
                      <span className="report-score-card__max">
                        {" "}
                        / {result.final_score_max ?? 100}
                      </span>
                    </p>
                    {result.final_score != null &&
                      result.final_score_max != null && (
                        <ScoreBar
                          score={result.final_score}
                          max={result.final_score_max}
                          failing={isRejected}
                        />
                      )}
                  </div>
                </div>
              </section>

              {/* ── Dimension Breakdown ── */}
              {hasBreakdown && (
                <section className="report-section">
                  <h3 className="report-section__title">
                    Dimension Breakdown
                    {failingDimensions.length > 0 && (
                      <span className="report-section__subtitle">
                        {failingDimensions.length} dimension
                        {failingDimensions.length > 1 ? "s" : ""} below floor
                      </span>
                    )}
                  </h3>
                  <div className="report-dimensions">
                    {Object.entries(scoreBreakdown).map(([dim, breakdown]) => {
                      const isFailing = failingDimensions.includes(dim);
                      const rawScore =
                        breakdown.raw_score ?? result.median_scores?.[dim];
                      const rationale = result.dimension_rationales?.[dim];
                      const firstRationale = rationale
                        ? rationale.split(" | ")[0]
                        : null;
                      const citation = result.dimension_citations?.[dim];

                      return (
                        <div
                          key={dim}
                          className={`report-dimension${isFailing ? " report-dimension--fail" : ""}`}
                        >
                          <div className="report-dimension__head">
                            <div className="report-dimension__name-row">
                              <span className="report-dimension__name">
                                {DIMENSION_LABELS[dim] ?? dim}
                              </span>
                              {isFailing && (
                                <span className="report-dimension__fail-tag">
                                  Below floor
                                </span>
                              )}
                            </div>
                            <div className="report-dimension__scores">
                              <span className="report-dimension__weight">
                                Weight:{" "}
                                {breakdown.weight != null
                                  ? `${Math.round(breakdown.weight * 100)}%`
                                  : "—"}
                              </span>
                              <span className="report-dimension__raw">
                                {rawScore ?? "—"} / 5
                              </span>
                              {breakdown.contribution != null && (
                                <span className="report-dimension__contrib">
                                  +{breakdown.contribution.toFixed(2)} pts
                                </span>
                              )}
                            </div>
                          </div>
                          {rawScore != null && (
                            <ScoreBar score={rawScore} failing={isFailing} />
                          )}
                          {firstRationale && (
                            <p className="report-dimension__rationale">
                              {firstRationale}
                            </p>
                          )}
                          {citation && (
                            <p className="report-dimension__citation">
                              Evidence: {citation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── Human Review Notice ── */}
              {(result.needs_human_review ||
                (result.review_reasons?.length ?? 0) > 0) && (
                <section className="report-section">
                  <div className="report-review-notice">
                    <div className="report-review-notice__head">
                      <span className="report-review-notice__icon">👁</span>
                      <strong>Pending Human Review</strong>
                    </div>
                    {result.review_reasons?.length > 0 && (
                      <ul className="report-review-reasons">
                        {result.review_reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                    {result.next_action && (
                      <p className="report-review-next">
                        Next step:{" "}
                        <code>{result.next_action.replace(/_/g, " ")}</code>
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* ── Judge Runs ── */}
              {result.judge_runs?.length > 0 && (
                <section className="report-section">
                  <h3 className="report-section__title">
                    Judge Runs
                    <span className="report-section__subtitle">
                      {result.judge_runs.length} independent evaluation
                      {result.judge_runs.length > 1 ? "s" : ""} — median scores
                      used
                    </span>
                  </h3>
                  <div className="report-runs">
                    {result.judge_runs.map((run) => (
                      <RunCard
                        key={run.run_no}
                        run={run}
                        failingDimensions={failingDimensions}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Footer metadata ── */}
              <div className="report-meta">
                {result.assessment_id && (
                  <span>
                    Assessment: <code>{result.assessment_id}</code>
                  </span>
                )}
                {result.rubric_version && (
                  <span>
                    Rubric: <code>{result.rubric_version}</code>
                  </span>
                )}
                {result.project_type && (
                  <span>
                    Type: <code>{result.project_type}</code>
                  </span>
                )}
                {result.attempt_number != null && (
                  <span>Attempt: #{result.attempt_number}</span>
                )}
                {result.evaluated_at && (
                  <span>Evaluated: {formatDate(result.evaluated_at)}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
