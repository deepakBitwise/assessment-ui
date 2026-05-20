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

  async function fetchReviews() {
    try {
      const reviewList =
        await fetchHumanReviews();
      const pendingReviews = reviewList.filter(
        (review: HumanReview) =>
          review.final_verdict === "PENDING"
      );

      setReviews(pendingReviews);

      if (pendingReviews.length > 0) {
        handleReviewSelection(
          pendingReviews[0]
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

      const updatedReviews =
        reviews.filter(
          (review) =>
            review.id !==
            activeReview.id
        );

      setReviews(updatedReviews);

      if (updatedReviews.length > 0) {
        handleReviewSelection(
          updatedReviews[0]
        );
      } else {
        setActiveReview(null);
        setActiveSubmission(null);
      }

      setReviewerComments("");
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
                No Pending Reviews
              </h2>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            {reviews.length} Pending
            Reviews
          </h2>

          <p className="spotlight-panel__summary">
            Open any review from the
            queue and provide final
            reviewer judgement.
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
                Pending Human Reviews
              </h2>
            </div>
          </div>

          <div className="reviewer-queue">
            {reviews.map((review) => (
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
                  Open Review
                </span>
              </button>
            ))}
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
                className={getStatusClassName(
                  activeReview.final_verdict
                )}
              >
                {
                  activeReview.final_verdict
                }
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
