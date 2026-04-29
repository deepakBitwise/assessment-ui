import type {
  Level,
  LevelState,
  LiveEvaluationStatus
} from "@/types/assessment";

type ProgressRailProps = {
  levels: Level[];
  liveEvaluationStatus: LiveEvaluationStatus;
};

const levelStateLabel: Record<LevelState, string> = {
  live: "Active now",
  complete: "Passed",
  locked: "Locked"
};

function getIndicator(state: "passed" | "running" | "queued") {
  if (state === "passed") {
    return "✓";
  }

  if (state === "running") {
    return "●";
  }

  return "○";
}

export function ProgressRail({
  levels,
  liveEvaluationStatus
}: ProgressRailProps) {
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
        {levels.map((level, index) => (
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
              <div className="level-card__footer">
                <span>{level.course}</span>
                <button className="text-link">
                  {level.state === "live" ? "Open brief" : "View requirements"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="evaluation-status">
        <div className="evaluation-status__header">
          <strong>Submission {liveEvaluationStatus.submissionId}</strong>
          <span>
            {liveEvaluationStatus.levelAttempt} · {liveEvaluationStatus.submittedAgo}
          </span>
        </div>

        <div className="evaluation-status__tiers">
          {liveEvaluationStatus.tiers.map((tier) => (
            <div className="evaluation-tier" key={tier.title}>
              <div className="evaluation-tier__header">
                <strong>{tier.title}</strong>
                <span className={`status-inline status-inline--${tier.state}`}>
                  {tier.state === "running" ? "●" : tier.state === "queued" ? "○" : "○"}{" "}
                  {tier.statusLabel}
                </span>
              </div>

              {tier.checks ? (
                <div className="evaluation-checks">
                  {tier.checks.map((check) => (
                    <div className="evaluation-check" key={check.name}>
                      <span className={`evaluation-check__state evaluation-check__state--${check.state}`}>
                        {getIndicator(check.state)}
                      </span>
                      <span className="evaluation-check__name">{check.name}</span>
                      <span className="evaluation-check__detail">{check.detail}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <p className="evaluation-status__footer">
          {liveEvaluationStatus.expectedVerdict}
        </p>
      </div>
    </div>
  );
}
