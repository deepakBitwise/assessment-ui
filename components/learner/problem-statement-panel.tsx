"use client";

import { useState } from "react";
import type { ProblemStatementData } from "@/types/assessment";

type Props = {
  problemStatement: ProblemStatementData;
};

const TABS = ["Overview", "Architecture", "Submit & Grading"] as const;
type Tab = (typeof TABS)[number];

export function ProblemStatementPanel({ problemStatement: ps }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="panel ps-panel">
      <div className="panel__header ps-panel__header">
        <div>
          <p className="eyebrow">{ps.id} · Enterprise Agentic Track</p>
          <h2>{ps.title}</h2>
          <p className="ps-subtitle">{ps.subtitle}</p>
        </div>
        <div className="ps-meta">
          <span className="ps-meta__item">
            <span className="ps-meta__label">Difficulty</span>
            <span className="ps-meta__stars">{ps.difficulty}</span>
          </span>
          <span className="ps-meta__item">
            <span className="ps-meta__label">Effort</span>
            <span className="ps-meta__value">{ps.effort}</span>
          </span>
        </div>
      </div>

      <div className="ps-tags">
        {ps.tags.map((tag) => (
          <span className="chip" key={tag}>{tag}</span>
        ))}
      </div>

      <nav className="ps-tabs">
        {TABS.map((tab) => (
          <button
            className={`ps-tab${activeTab === tab ? " ps-tab--active" : ""}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Overview" && (
        <div className="ps-section">
          <div className="ps-callout ps-callout--info">
            <p className="eyebrow ps-callout__label">Mission</p>
            <p>{ps.mission}</p>
          </div>

          <p className="ps-overview">{ps.overview}</p>

          <div className="ps-block-header">
            <span className="eyebrow">Key Features to Implement</span>
          </div>
          <div className="ps-feature-grid">
            {ps.features.map((feature) => (
              <div className="ps-feature-card" key={feature.title}>
                <span className="ps-feature-card__icon">{feature.icon}</span>
                <div>
                  <p className="ps-feature-card__title">{feature.title}</p>
                  <p className="ps-feature-card__desc">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Architecture" && (
        <div className="ps-section">
          <p className="ps-overview">
            The following describes the recommended high-level architecture. All mandatory
            components must be present and demonstrably integrated.
          </p>
          <div className="ps-steps">
            {ps.architectureSteps.map((step, index) => (
              <div className="ps-step" key={step.step}>
                <div className="ps-step__left">
                  <div className="ps-step__num">{step.step}</div>
                  {index < ps.architectureSteps.length - 1 && (
                    <div className="ps-step__line" />
                  )}
                </div>
                <div className="ps-step__content">
                  <p className="ps-step__title">{step.title}</p>
                  <p className="ps-step__desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Submit & Grading" && (
        <div className="ps-section">
          <div className="ps-block-header">
            <span className="eyebrow">Required Submission Fields</span>
          </div>
          <div className="ps-submit-list">
            {ps.submissionFields.map((field) => (
              <div className="ps-submit-field" key={field.key}>
                <code className="ps-submit-field__key">{field.key}</code>
                <div>
                  <p className="ps-submit-field__label">{field.label}</p>
                  <p className="ps-submit-field__desc">{field.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="ps-block-header" style={{ marginTop: "28px" }}>
            <span className="eyebrow">Evaluation Criteria</span>
          </div>
          <div className="ps-eval-list">
            {ps.evalCriteria.map((criterion) => (
              <div className="ps-eval-item" key={criterion.title}>
                <span className="ps-eval-item__icon">{criterion.icon}</span>
                <div className="ps-eval-item__body">
                  <div className="ps-eval-item__header">
                    <p className="ps-eval-item__title">{criterion.title}</p>
                    <span className="chip ps-eval-item__weight">{criterion.weight}</span>
                  </div>
                  <p className="ps-eval-item__desc">{criterion.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="ps-callout ps-callout--tip" style={{ marginTop: "24px" }}>
            <p className="eyebrow ps-callout__label">Minimum Pass Requirements</p>
            <ul className="ps-pass-list">
              {ps.minimumPassRequirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
