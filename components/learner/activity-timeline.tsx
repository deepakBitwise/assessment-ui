import type { ActivityItem } from "@/types/assessment";

import { useState } from "react";

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
  if (Number.isNaN(date.getTime())) return timestamp;
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
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);

  function toggleDetails(itemId: string) {
    setExpandedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }

  return (
    <div className="panel activity-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Recent Activity</p>
          <h2>Submission history</h2>
        </div>
        {activity.length > 0 && (
          <span className="panel__badge">{activity.length} {activity.length === 1 ? "entry" : "entries"}</span>
        )}
      </div>

      <div className="activity-list">
        {isLoading && (
          <div className="activity-row activity-row--empty">
            <span>Loading submissions…</span>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="activity-row activity-row--empty">
            <span className="status failed">Error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {!isLoading && !errorMessage && activity.length === 0 && (
          <div className="activity-row activity-row--empty">
            <span>No submissions yet — your first attempt will appear here.</span>
          </div>
        )}

        {!isLoading && !errorMessage && activity.map((item) => {
          const isExpanded = expandedItemIds.includes(item.id);
          return (
            <div className="activity-row" key={item.id}>
              <div className="activity-row__main">
                <span className="activity-row__title">{item.title}</span>
                <span className="activity-row__meta">{item.meta}</span>
                <div className="activity-row__right">
                  {item.status && (
                    <span className={`status ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  )}
                  <button
                    className="text-link activity-row__toggle"
                    onClick={() => toggleDetails(item.id)}
                    type="button"
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="activity-row__expanded">
                  <p className="activity-row__detail">{item.detail}</p>
                  {item.events && item.events.length > 0 && (
                    <div className="activity-event-list">
                      {item.events.map((event) => (
                        <div
                          className="activity-event"
                          key={event.id ?? `${item.id}-${event.type}-${event.timestamp}-${event.value}`}
                        >
                          <span className={`status ${getEventStatusClass(event.type)}`}>
                            {event.type}
                          </span>
                          <span className="activity-event__value">{event.value}</span>
                          <time className="activity-event__time">
                            {formatEventTimestamp(event.timestamp)}
                          </time>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
