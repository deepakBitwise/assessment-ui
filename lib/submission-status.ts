import type { Submission, SubmissionStatus } from "@/types/assessment";

type SubmissionStatusSource = Pick<
  Submission,
  "automated_check" | "llm_judge" | "human_reviewer"
>;

export function getOverallSubmissionStatus(
  submission: SubmissionStatusSource
): SubmissionStatus {
  if (
    submission.automated_check === "REJECTED" ||
    submission.llm_judge === "REJECTED" ||
    submission.human_reviewer === "REJECTED"
  ) {
    return "REJECTED";
  }

  if (
    submission.automated_check === "PASSED" &&
    submission.llm_judge === "PASSED" &&
    submission.human_reviewer === "PASSED"
  ) {
    return "PASSED";
  }

  return "PENDING";
}
