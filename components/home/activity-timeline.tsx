import type { ActivityItem } from "@/types/assessment";

type ActivityTimelineProps = {
  activity: ActivityItem[];
};

export function ActivityTimeline({ activity }: ActivityTimelineProps) {
  return (
    <div className="panel activity-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Recent Activity</p>
          <h2>Live progress and support touchpoints</h2>
        </div>
      </div>

      <div className="timeline">
        {activity.map((item) => (
          <article className="timeline__item" key={item.title}>
            <div className="timeline__dot" />
            <div>
              <div className="timeline__head">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
