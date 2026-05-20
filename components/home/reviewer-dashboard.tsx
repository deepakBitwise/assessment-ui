"use client";

import { useEffect, useState } from "react";
import {
  fetchHumanReviews,
  fetchSubmission,
  getPresignedDownloadUrl,
  pushSubmissionEvent,
  submitHumanReview,
  updateSubmissionStatus,
} from "@/lib/api";
import type {
  SubmissionEvent,
  SubmissionDetail,
  SubmissionStatus,
} from "@/types/assessment";
import type { HumanReview } from "@/lib/api";

type Submission = SubmissionDetail & {
  attachment_object_name?: string | null;
  automated_check?: SubmissionStatus;
  llm_judge?: SubmissionStatus;
  human_reviewer?: SubmissionStatus;
};

type ReviewFilter = "OPENED" | "CLOSED";

function getStatusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("pass")) {
    return "panel__badge";
  }

  if (
    normalized.includes("fail") ||
    normalized.includes("reject")
  ) {
    return "panel__badge panel__badge--danger";
  }

  return "panel__badge panel__badge--warm";
}

function getReviewStateTag(
  finalVerdict: string
) {
  return finalVerdict === "PENDING"
    ? "OPENED"
    : "CLOSED";
}

function buildReviewerEvent(
  verdict: "PASSED" | "REJECTED",
  reviewerComment: string
): SubmissionEvent {
  const trimmedComment =
    reviewerComment.trim();

  return {
    type:
      verdict === "PASSED"
        ? "SUCCESS"
        : "FAILURE",
    value:`${verdict === "PASSED" ? "Submission passed" : "Submission rejected"} by human reviewer. Comments : ${trimmedComment}`
  };
}

export function ReviewerDashboard() {
  const [reviews, setReviews] = useState<
    HumanReview[]
  >([]);
  const [reviewFilter, setReviewFilter] =
    useState<ReviewFilter>("OPENED");

  const [activeReview, setActiveReview] =
    useState<HumanReview | null>(null);

  const [activeSubmission, setActiveSubmission] =
    useState<Submission | null>(null);

  const [reviewerComments, setReviewerComments] =
    useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const reviewMatchesFilter =
      activeReview &&
      getReviewStateTag(
        activeReview.final_verdict
      ) === reviewFilter;

    if (reviewMatchesFilter) {
      return;
    }

    const nextReview = reviews.find(
      (review) =>
        getReviewStateTag(
          review.final_verdict
        ) === reviewFilter
    );

    if (nextReview) {
      handleReviewSelection(
        nextReview
      );
      return;
    }

    if (reviews.length === 0) {
      setActiveReview(null);
      setActiveSubmission(null);
    }
  }, [reviewFilter, reviews]);

  async function fetchReviews() {
    try {
      const reviewList =
        await fetchHumanReviews();
      setReviews(reviewList);

      const openedReviews =
        reviewList.filter(
          (review) =>
            getReviewStateTag(
              review.final_verdict
            ) === "OPENED"
        );

      if (openedReviews.length > 0) {
        handleReviewSelection(
          openedReviews[0]
        );
      } else if (reviewList.length > 0) {
        handleReviewSelection(
          reviewList[0]
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReviewSelection(
    review: HumanReview
  ) {
    setActiveReview(review);

    setReviewerComments(
      review.reviewer_comments || ""
    );

    try {
      const submissionData =
        await fetchSubmission(
          review.submission_id
        );

      setActiveSubmission(
        submissionData
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function downloadSubmissionFile() {
    if (
      !activeSubmission?.attachment_object_name
    ) {
      alert("No uploaded file found");
      return;
    }

    try {
      const downloadUrl =
        await getPresignedDownloadUrl(
          activeSubmission.attachment_object_name
        );

      window.open(
        downloadUrl,
        "_blank"
      );
    } catch (error) {
      console.error(error);
      alert("Failed to download file");
    }
  }

  async function submitFinalReview(
    verdict: "PASSED" | "REJECTED"
  ) {
    if (!activeReview) return;

    try {
      setLoading(true);

      await submitHumanReview(
        activeReview.id,
        {
          reviewer_comments:
            reviewerComments,
          final_verdict: verdict,
        }
      );

      await updateSubmissionStatus(
        activeReview.submission_id,
        {
          automated_check:
            "PASSED",
          llm_judge: "PASSED",
          human_reviewer:
            verdict,
        }
      );

      const reviewerEvent =
        buildReviewerEvent(
          verdict,
          reviewerComments
        );

      await pushSubmissionEvent(
        activeReview.submission_id,
        reviewerEvent
      );

      const updatedActiveReview = {
        ...activeReview,
        reviewer_comments:
          reviewerComments,
        final_verdict: verdict,
      };

      const updatedReviews =
        reviews.map((review) =>
          review.id === activeReview.id
            ? updatedActiveReview
            : review
        );

      setReviews(updatedReviews);
      setActiveReview(
        updatedActiveReview
      );
    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (!activeReview && reviews.length === 0) {
    return (
      <section className="layout-grid layout-grid--bottom">
        <div className="panel reviewer-queue-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">
                Submission Queue
              </p>

              <h2>
                No Reviews Found
              </h2>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const openedCount = reviews.filter(
    (review) =>
      getReviewStateTag(
        review.final_verdict
      ) === "OPENED"
  ).length;

  const closedCount = reviews.filter(
    (review) =>
      getReviewStateTag(
        review.final_verdict
      ) === "CLOSED"
  ).length;

  const filteredReviews = reviews.filter(
    (review) =>
      getReviewStateTag(
        review.final_verdict
      ) === reviewFilter
  );

  const payload =
    activeReview?.evaluator_payload;

  return (
    <>
      {/* HERO */}
      <section className="reviewer-hero">
        <div className="hero__copy">
          <p className="eyebrow">
            Reviewer Console
          </p>

          <h1>
            Human Review Workspace
          </h1>

          <p className="hero__text">
            Review learner
            submissions, inspect
            uploaded files, and
            provide final verdict.
          </p>
        </div>

        <div className="panel reviewer-summary-panel">
          <p className="eyebrow">
            Queue Summary
          </p>

          <h2>
            {reviews.length} Total
            Reviews
          </h2>

          <p className="spotlight-panel__summary">
            Total: {reviews.length} |
            Opened: {openedCount} |
            Closed: {closedCount}
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="layout-grid layout-grid--bottom">
        {/* LEFT PANEL */}
        <div className="panel reviewer-queue-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">
                Submission Queue
              </p>

              <h2>
                Human Reviews
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                type="button"
                className={
                  reviewFilter ===
                  "OPENED"
                    ? "button button--primary"
                    : "button button--ghost"
                }
                onClick={() =>
                  setReviewFilter(
                    "OPENED"
                  )
                }
              >
                Opened
              </button>

              <button
                type="button"
                className={
                  reviewFilter ===
                  "CLOSED"
                    ? "button button--primary"
                    : "button button--ghost"
                }
                onClick={() =>
                  setReviewFilter(
                    "CLOSED"
                  )
                }
              >
                Closed
              </button>
            </div>
          </div>

          <div className="reviewer-queue">
            {filteredReviews.map((review) => (
              <button
                key={review.id}
                type="button"
                className={`queue-item ${activeReview?.id ===
                    review.id
                    ? " queue-item--active"
                    : ""
                  }`}
                onClick={() =>
                  handleReviewSelection(
                    review
                  )
                }
              >
                <div className="queue-item__head">
                  <strong>
                    {review.id}
                  </strong>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems:
                        "center",
                    }}
                  >
                    <span
                      className="panel__badge panel__badge--warm"
                    >
                      {getReviewStateTag(
                        review.final_verdict
                      )}
                    </span>

                    <span
                      className={getStatusClassName(
                        review.final_verdict
                      )}
                    >
                      {
                        review.final_verdict
                      }
                    </span>
                  </div>
                </div>

                <p>
                  Submission:{" "}
                  {
                    review.submission_id
                  }
                </p>

                <p>
                  Score:{" "}
                  {
                    review
                      .evaluator_payload
                      ?.weighted_score
                  }
                </p>

                <span className="queue-item__link">
                  View Review
                </span>
              </button>
            ))}

            {filteredReviews.length === 0 ? (
              <div className="brief-card">
                <p className="eyebrow">
                  No Reviews
                </p>

                <p>
                  No {reviewFilter.toLowerCase()} reviews are available in this queue.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT PANEL */}
        {activeReview && (
          <div className="panel reviewer-detail-panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">
                  Human Review
                </p>

                <h2>
                  {activeReview.id}
                </h2>
              </div>

              <span
                className="panel__badge panel__badge--warm"
              >
                {getReviewStateTag(
                  activeReview.final_verdict
                )}
              </span>
            </div>

            {/* DETAILS */}
            <div className="reviewer-detail-grid">
              <div className="detail-stat">
                <span>
                  Submission ID
                </span>

                <strong>
                  {
                    activeReview.submission_id
                  }
                </strong>
              </div>

              <div className="detail-stat">
                <span>
                  Assessment ID
                </span>

                <strong>
                  {
                    activeSubmission?.assessment_id
                  }
                </strong>
              </div>

              <div className="detail-stat">
                <span>
                  Weighted Score
                </span>

                <strong>
                  {
                    payload?.weighted_score
                  }
                </strong>
              </div>

              <div className="detail-stat">
                <span>
                  Provisional
                  Verdict
                </span>

                <strong>
                  {
                    payload?.provisional_verdict
                  }
                </strong>
              </div>
            </div>

            {/* DOWNLOAD */}
            <div className="brief-card">
              <p className="eyebrow">
                Learner Submission
              </p>

              <button
                className="button button--primary"
                onClick={
                  downloadSubmissionFile
                }
              >
                Download Uploaded File
              </button>
            </div>

            {/* REVIEW REASONS */}
            <div className="brief-card brief-card--accent">
              <p className="eyebrow">
                Review Reasons
              </p>

              <ul>
                {payload?.review_reasons?.map(
                  (
                    reason: string
                  ) => (
                    <li key={reason}>
                      {reason}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* OVERALL RATIONALE */}
            <div className="brief-card">
              <p className="eyebrow">
                Overall Rationale
              </p>

              <p>
                {
                  payload?.overall_rationale
                }
              </p>
            </div>

            {/* DIMENSION SCORES */}
            <div className="brief-card">
              <p className="eyebrow">
                Dimension Scores
              </p>

              <ul>
                {Object.entries(
                  payload?.score_breakdown ||
                  {}
                ).map(
                  (
                    [key, value]: any
                  ) => (
                    <li key={key}>
                      <strong>
                        {key}
                      </strong>
                      :{" "}
                      {
                        value.raw_score
                      }
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* REVIEWER COMMENTS */}
            <div className="brief-card">
              <p className="eyebrow">
                Reviewer Comments
              </p>

              <textarea
                value={
                  reviewerComments
                }
                onChange={(e) =>
                  setReviewerComments(
                    e.target.value
                  )
                }
                placeholder="Enter final reviewer comments..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius:
                    "12px",
                  marginTop: "12px",
                }}
              />
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                className="button button--primary"
                disabled={loading}
                onClick={() =>
                  submitFinalReview(
                    "PASSED"
                  )
                }
              >
                PASS
              </button>

              <button
                className="button button--ghost"
                disabled={loading}
                onClick={() =>
                  submitFinalReview(
                    "REJECTED"
                  )
                }
              >
                FAIL
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
