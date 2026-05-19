import type {
  AdminPlaceholder,
  DashboardContent,
  ReviewerWorkspace,
  RouteCard
} from "@/types/assessment";
import { DEFAULT_SUBMISSION_ID } from "./constants";

export const routeCards: RouteCard[] = [
  {
    href: "/learner",
    label: "Learner",
    description: "Progress tracking, assessment brief, and submission workspace."
  },
  {
    href: "/reviewer",
    label: "Reviewer",
    description: "Submission queue, learner drill-down, and sign-off workflow."
  },
  {
    href: "/admin",
    label: "Admin",
    description: "Reserved for cohort configuration, thresholds, and reporting.",
    status: "Coming later"
  }
];

export const workspaceRouteCards: Array<
  Omit<RouteCard, "href"> & { href: "/learner" | "/reviewer" | "/admin" }
> = routeCards.filter((route) => route.href !== "/") as Array<
  Omit<RouteCard, "href"> & { href: "/learner" | "/reviewer" | "/admin" }
>;

export const learnerDashboardContent: DashboardContent = {
  hero: {
    eyebrow: "DIFY Enablement Program",
    title: "Assessment portal for agent builders moving from training to real delivery.",
    description:
      "A focused learner workspace inspired by the platform spec: gated levels, portfolio-grade submissions, reviewer-ready evidence, and a calm progress experience that makes the next move obvious.",
    primaryAction: "Start Level 1 Brief",
    secondaryAction: "Preview Submission Rules"
  },
  profile: {
    program: "Learner profile",
    name: "Shivam Rao",
    role: "Forward Deployed Engineer - Ramp Cohort 06",
    status: "In Progress",
    metrics: [
      { label: "Current level", value: "1 / 7" },
      { label: "Attempts left", value: "3" },
      { label: "Readiness", value: "82%" }
    ],
    mentorInitials: "PK",
    mentorName: "Priya Kulkarni",
    mentorNote: "Available for design calibration and retry approvals"
  },
  levels: [
    {
      id: "01",
      title: "Basic LLM Agent",
      capability: "Prompting, persona, and response discipline",
      state: "live",
      course: "LLM APIs & Model Integration",
      brief:
        "Build and submit a grounded chatbot with a clear persona, reliable answer style, and evidence-backed fallback behavior."
    },
    {
      id: "02",
      title: "RAG-Powered Agent",
      capability: "Knowledge base retrieval and citations",
      state: "locked",
      course: "Retrieval Augmented Generation",
      brief:
        "Attach a domain corpus and demonstrate faithful retrieval before the next gate opens."
    },
    {
      id: "03",
      title: "Tool-Calling Agent",
      capability: "Workflow, tools, and memory",
      state: "locked",
      course: "Agentic AI - Tool Calling & Multi-step Reasoning",
      brief:
        "Design a multi-step workflow that reasons across structured tools and produces traceable summaries."
    }
  ],
  activeAssessment: {
    id: "assessment-1",
    eyebrow: "Active Assessment",
    title: "Level 1 - Basic LLM Agent",
    status: "Hands-on assessment",
    summary:
      "Implement a basic LLM agent that accepts a prompt, calls the configured model, and writes its final response to an output file. This level measures hands-on build ability, not course completion.",
    scenarioTitle: "Build a minimal working LLM agent",
    scenarioBody:
      "Create a small project directory for a basic LLM agent. The agent implementation should live in agent.py, configuration should be stored in .env, a sample run should produce output.txt, and README.md should explain exactly how to run the program. Compress this directory into a single ZIP and submit it for review. The goal is to demonstrate that you can assemble and run a simple agent end to end.",
    deliverables: [
      "A ZIP file containing agent.py",
      "The same ZIP must include output.txt from a successful sample run",
      "The same ZIP must include .env with the expected environment variable structure",
      "The same ZIP must include README.md with steps to install dependencies and run the agent"
    ],
    evidenceCards: [
      {
        label: "Assessment Window",
        value: "72 hours",
        note: "Starts when the brief is opened for the first time."
      },
      {
        label: "Pass Threshold",
        value: "3.5 / 5",
        note: "Every required rubric dimension must stay at 3 or higher."
      },
      {
        label: "Reviewer SLA",
        value: "1 business day",
        note: "Borderline or flagged submissions route to a senior FDE reviewer."
      }
    ]
  },
  liveEvaluationStatus: {
    submissionId: DEFAULT_SUBMISSION_ID,
    levelAttempt: "L1 attempt 1",
    submittedAgo: "submitted 2 min ago",
    tiers: [
      {
        title: "Tier 1 - Automated checks",
        state: "running",
        statusLabel: "running",
        checks: [
          {
            name: "zip_received",
            state: "passed",
            detail: "submission-level-1.zip uploaded"
          },
          {
            name: "required_files_present",
            state: "passed",
            detail: "agent.py, output.txt, .env, README.md"
          },
          {
            name: "structure_validation",
            state: "running",
            detail: "Directory contents being validated..."
          },
          {
            name: "readme_review",
            state: "queued",
            detail: ""
          }
        ]
      },
      {
        title: "Tier 2 - LLM judge",
        state: "queued",
        statusLabel: "queued"
      },
      {
        title: "Tier 3 - Human reviewer",
        state: "pending",
        statusLabel: "pending"
      }
    ],
    expectedVerdict: "Expected first verdict: in ~4 minutes"
  },
  submissionWorkspace: {
    title: "Package the Level 1 ZIP submission",
    fields: [
      {
        label: "Expected directory structure",
        value:
          "level-1-basic-llm-agent/\n|-- agent.py\n|-- output.txt\n|-- .env\n|-- README.md",
        fullWidth: true,
        variant: "textarea"
      },
      {
        label: "Submission ZIP",
        fileName: "submission-level-1.zip",
        value: "\nUpload a single .zip containing agent.py, output.txt, .env, and README.md",
        fullWidth: true,
        variant: "upload"
      },
      {
        label: "Assessment note",
        value:
          "Build a working basic LLM agent, verify it runs once, generate output.txt, and compress the directory before submission.",
        fullWidth: true,
        variant: "textarea"
      }
    ]
  },
  rubric: [
    { name: "Prompt architecture", weight: "25%", score: "Target 4.0" },
    { name: "Grounded behavior", weight: "25%", score: "Target 3.5" },
    { name: "UX clarity", weight: "20%", score: "Target 4.0" },
    { name: "Robust fallbacks", weight: "15%", score: "Target 3.0" },
    { name: "Documentation quality", weight: "15%", score: "Target 3.5" }
  ],
  activity: [
    {
      id: "activity-attempt-created",
      title: "Attempt created",
      meta: "Today, 09:10",
      detail: "Your Level 1 workspace is active and ready for submission packaging."
    },
    {
      id: "activity-checks-configured",
      title: "Automated checks configured",
      meta: "Today, 09:12",
      detail: "Health probe, manifest validation, and rubric preview were provisioned."
    },
    {
      id: "activity-mentor-checkpoint",
      title: "Mentor checkpoint",
      meta: "Tomorrow, 16:00",
      detail: "Optional design review before you freeze the first attempt."
    }
  ]
};

export const reviewerWorkspaceContent: ReviewerWorkspace = {
  title: "Reviewer console for fast, evidence-backed sign-off",
  queueSummary: "7 waiting | 3 borderline | 1 escalation recommended",
  submissions: [
    {
      id: "sub_01HFG7T",
      learnerName: "Shivam Rao",
      learnerRole: "Forward Deployed Engineer",
      level: "Level 3",
      attempt: "Attempt 1",
      submittedAt: "Today, 08:42",
      score: "3.3 +/- 0.4",
      status: "Borderline",
      summary:
        "Workflow is coherent, but robustness evidence is weak around empty-input and rate-limit cases.",
      risk: "Needs reviewer judgment"
    },
    {
      id: "sub_01HFH11",
      learnerName: "Rohan Mehta",
      learnerRole: "Forward Deployed Engineer",
      level: "Level 4",
      attempt: "Attempt 2",
      submittedAt: "Today, 07:55",
      score: "3.8 +/- 0.1",
      status: "Ready to pass",
      summary:
        "Instrumentation is clean, A/B results are traceable, and supporting artifacts are complete.",
      risk: "Low risk"
    },
    {
      id: "sub_01HFJ20",
      learnerName: "Maria Lopez",
      learnerRole: "Forward Deployed Engineer",
      level: "Level 7",
      attempt: "Attempt 1",
      submittedAt: "Yesterday, 18:10",
      score: "2.9 +/- 0.6",
      status: "Flagged",
      summary:
        "Safety hardening exists, but bias test coverage and escalation policy are not yet convincing.",
      risk: "Escalate to mentor"
    }
  ],
  learnerProfiles: {
    sub_01HFG7T: {
      name: "Shivam Rao",
      cohort: "Ramp Cohort 06",
      currentLevel: "Level 3 | Tool-Calling Agent",
      readiness: "82%",
      lastSubmission: "Repo Health Monitor",
      strengths: [
        "Structured workflow layout and good tool separation",
        "Reflection shows awareness of failure modes",
        "Custom tool choice matches the scenario"
      ],
      attentionAreas: [
        "Empty-repo handling is under-tested",
        "Confidence note does not always cite evidence",
        "Retry behavior needs clearer fallback language"
      ]
    },
    sub_01HFH11: {
      name: "Rohan Mehta",
      cohort: "Ramp Cohort 06",
      currentLevel: "Level 4 | Evaluation and Observability",
      readiness: "91%",
      lastSubmission: "Prompt Quality Lab",
      strengths: [
        "Strong trace coverage across test prompts",
        "Evaluation notes are concise and actionable",
        "Well-organized artifact package"
      ],
      attentionAreas: [
        "Reviewer could ask for more failure-case screenshots"
      ]
    },
    sub_01HFJ20: {
      name: "Maria Lopez",
      cohort: "Ramp Cohort 05",
      currentLevel: "Level 7 | Responsible AI and Safety",
      readiness: "76%",
      lastSubmission: "Safety Hardening Sprint",
      strengths: [
        "Clear intent around moderation and escalation",
        "Good breadth of threat scenarios"
      ],
      attentionAreas: [
        "Bias testing needs stronger evidence",
        "Guardrail behavior is not consistently documented",
        "Human-in-the-loop trigger logic is too vague"
      ]
    }
  }
};

export const adminPlaceholderContent: AdminPlaceholder = {
  title: "Administrator workspace planned next",
  description:
    "This slot is reserved for cohort setup, level configuration, rubric tuning, and evaluation analytics.",
  bullets: [
    "Cohort and role management",
    "Assessment versioning and threshold controls",
    "Reviewer calibration, costs, and pass-rate dashboards"
  ]
};
