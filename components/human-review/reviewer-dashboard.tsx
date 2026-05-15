"use client";

import { useEffect, useState } from "react";

import {
  fetchHumanReview,
  fetchHumanReviews,
  fetchSubmission,
  getPresignedDownloadUrl,
  submitHumanReview,
} from "@/lib/api";

import type {
  HumanReview,
  Submission,
} from "@/types/human-review";

function getStatusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("pass")) {
    return "panel__badge";
  }

  if (normalized.includes("fail")) {
    return "panel__badge panel__badge--danger";
  }

  return "panel__badge panel__badge--warm";
}

export function ReviewerDashboard() {
  const [reviews, setReviews] = useState<HumanReview[]>([]);

  const [activeReview, setActiveReview] =
    useState<HumanReview | null>(null);

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [reviewerComments, setReviewerComments] =
    useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const data = await fetchHumanReviews();

      setReviews(data);

      if (data.length > 0) {
        await loadReviewDetails(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadReviewDetails(reviewId: string) {
    try {
      const review = await fetchHumanReview(reviewId);

      setActiveReview(review);

      setReviewerComments(
        review.reviewer_comments || ""
      );

      const submissionData =
        await fetchSubmission(
          review.submission_id
        );

      setSubmission(submissionData);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDownloadFile() {
    try {
      if (
        !submission?.attachment_object_name
      ) {
        alert("No attachment found");

        return;
      }

      const downloadUrl =
        await getPresignedDownloadUrl(
          submission.attachment_object_name
        );

      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error(error);

      alert("Failed to download file");
    }
  }

  async function handleFinalVerdict(
    verdict: "PASSED" | "FAILED"
  ) {
    try {
      if (!activeReview) return;

      setLoading(true);

      await submitHumanReview(
        activeReview.id,
        reviewerComments,
        verdict
      );

      alert(
        `Review marked as ${verdict}`
      );

      await loadReviews();

      await loadReviewDetails(
        activeReview.id
      );
    } catch (error) {
      console.error(error);

      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="reviewer-hero">
        <div className="hero__copy">
          <p className="eyebrow">
            Reviewer Console
          </p>

          <h1>
            Human Review Workspace
          </h1>

          <p className="hero__text">
            Review borderline
            submissions, inspect
            evidence, download learner
            files, and make final
            PASS/FAIL decisions.
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
            Open a review from the
            queue and complete final
            evaluation.
          </p>
        </div>
      </section>

      <section className="layout-grid layout-grid--bottom">
        <div className="panel reviewer-queue-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">
                Submission Queue
              </p>

              <h2>
                Review-ready
                submissions
              </h2>
            </div>
          </div>

          <div className="reviewer-queue">
            {reviews.map((review) => (
              <button
                className={`queue-item ${
                  activeReview?.id ===
                  review.id
                    ? "queue-item--active"
                    : ""
                }`}
                key={review.id}
                onClick={() =>
                  loadReviewDetails(
                    review.id
                  )
                }
                type="button"
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
                  Weighted Score:{" "}
                  {
                    review.weighted_score
                  }
                </p>

                <p>
                  Verdict:{" "}
                  {
                    review.provisional_verdict
                  }
                </p>

                <span className="queue-item__link">
                  Open Review
                </span>
              </button>
            ))}
          </div>
        </div>

        {activeReview ? (
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
                    activeReview.assessment_id
                  }
                </strong>
              </div>

              <div className="detail-stat">
                <span>
                  Weighted Score
                </span>

                <strong>
                  {
                    activeReview.weighted_score
                  }
                </strong>
              </div>

              <div className="detail-stat">
                <span>
                  Provisional Verdict
                </span>

                <strong>
                  {
                    activeReview.provisional_verdict
                  }
                </strong>
              </div>
            </div>

            <div className="brief-card brief-card--accent">
              <p className="eyebrow">
                Review Reasons
              </p>

              <pre>
                {JSON.stringify(
                  activeReview
                    .review_payload
                    ?.review_reasons,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="brief-card">
              <p className="eyebrow">
                Failing Dimensions
              </p>

              <pre>
                {JSON.stringify(
                  activeReview
                    .review_payload
                    ?.failing_dimensions,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="brief-card">
              <p className="eyebrow">
                Dimension Rationales
              </p>

              <pre>
                {JSON.stringify(
                  activeReview
                    .review_payload
                    ?.dimension_rationales,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="brief-card">
              <p className="eyebrow">
                Dimension Citations
              </p>

              <pre>
                {JSON.stringify(
                  activeReview
                    .review_payload
                    ?.dimension_citations,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="brief-card">
              <p className="eyebrow">
                Submission Attachment
              </p>

              <button
                className="button button--primary"
                onClick={
                  handleDownloadFile
                }
                type="button"
              >
                Download Submission
                File
              </button>

              {submission?.attachment_object_name ? (
                <p
                  style={{
                    marginTop: 12,
                    wordBreak:
                      "break-word",
                  }}
                >
                  {
                    submission.attachment_object_name
                  }
                </p>
              ) : null}
            </div>

            <div className="brief-card">
              <p className="eyebrow">
                Reviewer Comments
              </p>

              <textarea
                className="reviewer-textarea"
                placeholder="Enter reviewer comments"
                rows={6}
                value={
                  reviewerComments
                }
                onChange={(e) =>
                  setReviewerComments(
                    e.target.value
                  )
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <button
                className="button button--primary"
                disabled={loading}
                onClick={() =>
                  handleFinalVerdict(
                    "PASSED"
                  )
                }
                type="button"
              >
                Mark PASS
              </button>

              <button
                className="button button--ghost"
                disabled={loading}
                onClick={() =>
                  handleFinalVerdict(
                    "FAILED"
                  )
                }
                type="button"
              >
                Mark FAIL
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}