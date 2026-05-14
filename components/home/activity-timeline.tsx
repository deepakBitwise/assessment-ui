import type { ActivityItem } from "@/types/assessment";

type ActivityTimelineProps = {
  activity: ActivityItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

function getStatusClass(status?: string) {
  if (status === "PASSED") return "passed";
  if (status === "REJECTED") return "failed";
  return "pending";
}

function getStatusLabel(status?: string) {
  if (status === "PASSED") return "Passed";
  if (status === "REJECTED") return "Rejected";
  return "Under Review";
}

export function ActivityTimeline({
  activity,
  isLoading = false,
  errorMessage = null
}: ActivityTimelineProps) {
  return (
    <div className="panel activity-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Recent Activities</p>
          <h2>Live progress and support touchpoints</h2>
        </div>
      </div>

      <div className="timeline">
        {isLoading ? (
          <article className="timeline__item">
            <div className="timeline__dot" />
            <div>
              <div className="timeline__head">
                <strong>Loading submissions</strong>
                <span>Refreshing activity</span>
              </div>
              <p>Recent assessment updates will appear here shortly.</p>
            </div>
          </article>
        ) : null}

        {!isLoading && errorMessage ? (
          <article className="timeline__item">
            <div className="timeline__dot" />
            <div>
              <div className="timeline__head">
                <strong>Unable to load activity</strong>
                <span>Backend unavailable</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          </article>
        ) : null}

        {!isLoading && !errorMessage && activity.length === 0 ? (
          <article className="timeline__item">
            <div className="timeline__dot" />
            <div>
              <div className="timeline__head">
                <strong>No submissions yet</strong>
                <span>Waiting for the first attempt</span>
              </div>
              <p>Once a learner submits work, the latest review progress will show up here.</p>
            </div>
          </article>
        ) : null}

        {!isLoading && !errorMessage
          ? activity.map((item) => (
              <article className="timeline__item" key={item.id}>
                <div className="timeline__dot" />
                <div>
                  <div className="timeline__head timeline__head--with-status">
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.meta}</span>
                    </div>
                    {item.status ? (
                      <span className={`status ${getStatusClass(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    ) : null}
                  </div>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))
          : null}
      </div>
    </div>
  );
}
