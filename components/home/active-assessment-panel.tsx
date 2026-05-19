import type { ActiveAssessment } from "@/types/assessment";

type ActiveAssessmentPanelProps = {
  assessment: ActiveAssessment;
};

export function ActiveAssessmentPanel({
  assessment
}: ActiveAssessmentPanelProps) {
  return (
    <div className="panel spotlight-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{assessment.eyebrow}</p>
          <h2>{assessment.title}</h2>
        </div>
        <span className="panel__badge panel__badge--warm">{assessment.status}</span>
      </div>

      <p className="spotlight-panel__summary">{assessment.summary}</p>

      {/* <div className="evidence-grid">
        {assessment.evidenceCards.map((item) => (
          <div className="evidence-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.note}</p>
          </div>
        ))}
      </div> */}

      <div className="brief-grid">
        <div className="brief-card brief-card--accent">
          <p className="eyebrow">Scenario</p>
          <h3>{assessment.scenarioTitle}</h3>
          <p>{assessment.scenarioBody}</p>
        </div>

        <div className="brief-card">
          <p className="eyebrow">Deliverables</p>
          <ul>
            {assessment.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
