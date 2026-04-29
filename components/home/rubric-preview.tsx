import type { RubricItem } from "@/types/assessment";

type RubricPreviewProps = {
  rubric: RubricItem[];
};

export function RubricPreview({ rubric }: RubricPreviewProps) {
  return (
    <div className="panel rubric-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Scoring Preview</p>
          <h2>What the evaluator will care about</h2>
        </div>
      </div>

      <div className="rubric-list">
        {rubric.map((item) => (
          <div className="rubric-row" key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.weight}</span>
            </div>
            <em>{item.score}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
