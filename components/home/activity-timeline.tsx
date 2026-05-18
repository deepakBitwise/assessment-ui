import type { ActivityItem } from "@/types/assessment";

import { useEffect, useState } from "react";

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

function getEventStatusClass(type: string) {
  if (type === "SUCCESS") return "passed";
  if (type === "FAILURE") return "failed";
  if (type === "QUEUED") return "queued";
  if (type === "GENERAL") return "general";
  return "pending";
}

function formatEventTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function ActivityTimeline({
  activity,
  isLoading = false,
  errorMessage = null
}: ActivityTimelineProps) {
  const [showDetails, setShowDetails] = useState(true);
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
                <div className="timeline-actions">
                  <button
                    className="button button--secondary timeline-actions__toggle"
                    onClick={() => setShowDetails(!showDetails)}
                    aria-expanded={showDetails}
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </button>
                </div>
                {showDetails && item.events?.length ? (
                  <div className="timeline-event-group">
                    {item.events.map((event) => (
                      <div
                        className="timeline-event"
                        key={event.id ?? `${item.id}-${event.type}-${event.timestamp}-${event.value}`}
                      >
                        <div className="timeline-event__head">
                          <p>{event.value}</p>
                          <span className={`status ${getEventStatusClass(event.type)}`}>
                            {event.type}
                          </span>
                          <time>{formatEventTimestamp(event.timestamp)}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))
          : null}
      </div>
    </div>
  );
}
