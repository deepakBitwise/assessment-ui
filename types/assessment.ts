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
  title: string;
  meta: string;
  detail: string;
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
