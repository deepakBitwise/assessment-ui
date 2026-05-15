export type HumanReview = {
  id: string;
  submission_id: string;
  assessment_id: string;
  weighted_score: number;
  provisional_verdict: string;
  review_payload: any;
  reviewer_comments: string | null;
  final_verdict: "PENDING" | "PASSED" | "FAILED";
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  assessment_id: string;
  attachment_object_name: string;
  automated_check: string;
  llm_judge: string;
  human_reviewer: string;
  created_at: string;
  updated_at: string;
};