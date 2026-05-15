export type LevelState = "live" | "complete" | "locked";

export type Level = {
  id: string;
  title: string;
  capability: string;
  state: LevelState;
  course: string;
  brief: string;
};

export type EvidenceCard = {
  label: string;
  value: string;
  note: string;
};

export type RubricItem = {
  name: string;
  weight: string;
  score: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  detail: string;
  status?: string;
  events?: SubmissionEventLog[];
};

export type Metric = {
  label: string;
  value: string;
};

export type Profile = {
  program: string;
  name: string;
  role: string;
  status: string;
  metrics: Metric[];
  mentorInitials: string;
  mentorName: string;
  mentorNote: string;
};

export type ActiveAssessment = {
  id: string;
  eyebrow: string;
  title: string;
  status: string;
  summary: string;
  scenarioTitle: string;
  scenarioBody: string;
  deliverables: string[];
  evidenceCards: EvidenceCard[];
};

export type SubmissionField = {
  label: string;
  value: string;
  fileName?: string | null;
  fullWidth?: boolean;
  variant?: "default" | "upload" | "textarea";
};

export type SubmissionWorkspace = {
  title: string;
  fields: SubmissionField[];
};

export type EvaluationCheck = {
  name: string;
  state: "passed" | "running" | "queued";
  detail: string;
};

export type EvaluationTier = {
  title: string;
  state: "running" | "queued" | "pending";
  statusLabel: string;
  checks?: EvaluationCheck[];
};

export type LiveEvaluationStatus = {
  submissionId: string;
  levelAttempt: string;
  submittedAgo: string;
  tiers: EvaluationTier[];
  expectedVerdict: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
};

export type DashboardContent = {
  hero: HeroContent;
  profile: Profile;
  levels: Level[];
  activeAssessment: ActiveAssessment;
  liveEvaluationStatus: LiveEvaluationStatus;
  submissionWorkspace: SubmissionWorkspace;
  rubric: RubricItem[];
  activity: ActivityItem[];
};

export type AppRole = "learner" | "reviewer" | "administrator";

export type RoleTab = {
  id: AppRole;
  label: string;
  description: string;
  status?: string;
};

export type ReviewerSubmission = {
  id: string;
  learnerName: string;
  learnerRole: string;
  level: string;
  attempt: string;
  submittedAt: string;
  score: string;
  status: string;
  summary: string;
  risk: string;
};

export type LearnerProfileSnapshot = {
  name: string;
  cohort: string;
  currentLevel: string;
  readiness: string;
  lastSubmission: string;
  strengths: string[];
  attentionAreas: string[];
};

export type ReviewerWorkspace = {
  title: string;
  queueSummary: string;
  submissions: ReviewerSubmission[];
  learnerProfiles: Record<string, LearnerProfileSnapshot>;
};

export type AdminPlaceholder = {
  title: string;
  description: string;
  bullets: string[];
};

export type RouteCard = {
  href: "/" | "/learner" | "/reviewer" | "/admin";
  label: string;
  description: string;
  status?: string;
};

export type Assessment = {
  id: string;
  problem_statement: string;
  deliverables: string[];
  attachment_object_name: string;
  created_at: string;
  updated_at: string;
};

export type AssessmentResponse = {
  data: Assessment[];
  count: number;
};

export type AssessmentUpdatePayload = {
  problem_statement: string;
  deliverables: string[];
};

export type SubmissionStatus = "PASSED" | "PENDING" | "REJECTED";

export type SubmissionEventType =
  | "SUCCESS"
  | "FAILURE"
  | "WARNING"
  | "INFO"
  | "QUEUED"
  | "GENERAL";

export type SubmissionEvent = {
  type: SubmissionEventType;
  value: string;
};

export type SubmissionEventLog = SubmissionEvent & {
  id?: string;
  timestamp: string;
};

export type SubmissionEventHistory = {
  id: string;
  submission_id: string;
  created_at: string;
  events: SubmissionEvent[];
};

export type Submission = {
  assessment_id: string;
  automated_check: SubmissionStatus;
  llm_judge: SubmissionStatus;
  human_reviewer: SubmissionStatus;
  id: string;
  created_at: string;
  updated_at: string;
};

export type SubmissionDetail = Submission & {
  submission_id?: string;
};
