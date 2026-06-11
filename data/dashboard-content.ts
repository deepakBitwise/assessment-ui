import type {
  AdminPlaceholder,
  DashboardContent,
  ProblemStatementData,
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

const workflowWeaverProblemStatement: ProblemStatementData = {
  id: "FDE-CAPSTONE-001",
  title: "WorkflowWeaver",
  subtitle:
    "Build a workflow automation platform where users describe business processes in natural language, and an AI agent executes them across connected business tools — autonomously.",
  tags: ["Expert", "Agentic AI", "MCP Orchestration", "LangGraph", "Enterprise Automation"],
  difficulty: "★★★★★",
  effort: "30 – 40 hrs",
  overview:
    "Business users today operate across multiple disconnected platforms — task trackers, documentation tools, communication channels, and project management systems. Every cross-platform workflow requires manual, repetitive effort that slows teams down and introduces human error.",
  mission:
    'Design and build WorkflowWeaver — a platform where a business user can describe a workflow in plain English (e.g., "Take today\'s meeting notes and create a Notion project page, raise GitHub issues for each action item, and post a summary to Microsoft Teams"), and an AI agent executes the entire multi-tool sequence — autonomously, reliably, and with observable progress.',
  features: [
    {
      icon: "💬",
      title: "Natural Language Workflow Creation",
      description:
        "Accept plain English workflow descriptions and parse them into structured multi-step action plans using LLM."
    },
    {
      icon: "🤖",
      title: "Multi-Tool Agent Execution",
      description:
        "Execute actions across Notion, GitHub, Google Drive, and Microsoft Teams in a single workflow run, orchestrated by LangGraph."
    },
    {
      icon: "💡",
      title: "Real-Time Execution Logs",
      description:
        "Stream live step-by-step execution logs to the frontend via Server-Sent Events as the agent runs."
    },
    {
      icon: "📋",
      title: "Workflow Templates",
      description:
        "Provide at least 3 pre-built workflow templates users can select and customize (e.g., Meeting-to-Tasks, Sprint Planning, Incident Response)."
    },
    {
      icon: "🔄",
      title: "Failure Recovery & Retry",
      description:
        "Detect failed steps and automatically retry with exponential backoff. Log failure reasons clearly in the execution report."
    },
    {
      icon: "↩️",
      title: "Action Rollback",
      description:
        "On critical failure, attempt to reverse previously executed actions and restore prior state where possible."
    }
  ],
  architectureSteps: [
    {
      step: 1,
      title: "User Interface — React + Tailwind",
      description:
        "A web UI where users type a workflow description in natural language. The UI displays real-time execution logs via Server-Sent Events (SSE), shows a workflow template library, and renders execution reports. All status updates stream from the backend without page reload."
    },
    {
      step: 2,
      title: "Backend API — FastAPI / Node.js",
      description:
        "Receives workflow requests from the frontend, triggers the LangGraph agent, and streams execution events back via SSE. Manages session state, workflow history, and exposes endpoints for templates and reports."
    },
    {
      step: 3,
      title: "AI Orchestration Layer — LangGraph + LLM API",
      description:
        "The core agent graph built with LangGraph. Nodes represent individual workflow steps (parse intent → plan actions → execute tool A → execute tool B → verify → report). The configured LLM serves as the reasoning engine."
    },
    {
      step: 4,
      title: "Tool Layer — MCP Servers",
      description:
        "Microsoft Teams is integrated using Incoming Webhooks or Teams Workflow webhooks. Workflow execution summaries and notifications are delivered to the configured Teams channel through the webhook endpoint."
    },
    {
      step: 5,
      title: "Observability — Langfuse",
      description:
        "Every LLM call, tool invocation, and agent decision within the workflow is traced to Langfuse. Traces include input/output, latency, cost, and model parameters. The Langfuse dashboard must contain traces from at least three end-to-end workflow executions."
    }
  ],
  evalCriteria: [
    {
      icon: "⚙️",
      title: "Functional Correctness",
      weight: "35%",
      description:
        "Does the platform execute end-to-end workflows successfully? Are all four tool integrations (Notion, GitHub, Microsoft Teams Webhooks, Google Drive) functional? Does failure recovery and rollback behave as described?"
    },
    {
      icon: "🧠",
      title: "Agent Design & Orchestration",
      weight: "25%",
      description:
        "Quality of the LangGraph agent graph — state design, node decomposition, conditional routing logic, and how effectively the LLM is prompted to plan and execute steps. Langfuse traces must be present and well-structured."
    },
    {
      icon: "🖥️",
      title: "User Experience & Real-Time Feedback",
      weight: "20%",
      description:
        "Quality of the React UI, clarity of real-time SSE execution logs, usefulness of workflow templates, and overall usability for a non-technical business user."
    },
    {
      icon: "📦",
      title: "Code Quality & Documentation",
      weight: "15%",
      description:
        "Repository structure, code readability, completeness of README, quality of .env.example, and whether setup instructions allow the evaluator to run the project independently."
    },
    {
      icon: "✨",
      title: "Innovation & Bonus Features",
      weight: "5%",
      description:
        "Any creative extensions beyond the minimum requirements — e.g., multi-agent sub-graphs, workflow scheduling, a visual workflow builder, or additional automation capabilities."
    }
  ],
  submissionFields: [
    {
      key: "participant_id",
      label: "Participant ID",
      description: "Your unique FDE programme participant ID (provided at onboarding). Format: FDE-YYYY-NNNN"
    },
    {
      key: "github_repo_url",
      label: "GitHub Repository",
      description: "Public GitHub repository URL containing your full project."
    },
    {
      key: "langfuse_project_url",
      label: "Langfuse Dashboard",
      description:
        "URL to your Langfuse project dashboard showing traces from at least 3 completed workflow runs. Must be publicly accessible or shared with the evaluator account."
    },
    {
      key: "demo_video_url",
      label: "Demo Video",
      description:
        "Link to a screen recording (unlisted YouTube or Loom) demonstrating one complete end-to-end workflow execution. Max duration: 5 minutes."
    },
    {
      key: "readme_checklist",
      label: "README Checklist",
      description:
        "Confirm your README.md contains: setup instructions, .env.example, architecture diagram, list of implemented features, and known limitations."
    }
  ],
  minimumPassRequirements: [
    "Execute at least one complete workflow end-to-end",
    "Integrate at least three of the four required tools (Notion, GitHub, Microsoft Teams, Google Drive)",
    "Include Langfuse traces for all LLM calls",
    "Have a runnable README with all required env variables documented"
  ]
};

export const learnerDashboardContent: DashboardContent = {
  hero: {
    eyebrow: "FDE Capstone Assessment",
    title: "WorkflowWeaver — AI Agent for Cross-Tool Workflow Automation.",
    description:
      "Build a workflow automation platform where users describe business processes in natural language and an AI agent executes them across Notion, GitHub, Teams, and Google Drive — autonomously.",
    primaryAction: "View Problem Statement",
    secondaryAction: "Preview Submission Rules"
  },
  profile: {
    program: "Learner profile",
    name: "Shivam Rao",
    username: "shivam.rao",
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
    eyebrow: "FDE Capstone — Active Assessment",
    title: "WorkflowWeaver — AI Agent for Cross-Tool Workflow Automation",
    status: "Hands-on capstone",
    summary:
      "Design and build WorkflowWeaver — a platform where a business user can describe a workflow in plain English and an AI agent executes the entire multi-tool sequence across Notion, GitHub, Microsoft Teams, and Google Drive — autonomously, reliably, and with observable progress.",
    scenarioTitle: "Build a workflow automation platform",
    scenarioBody:
      "Users describe business processes in natural language (e.g., \"Take today's meeting notes and create a Notion project page, raise GitHub issues for each action item, and post a summary to Microsoft Teams\"). Your system must parse the intent, plan a multi-step action sequence, execute each tool via MCP, stream live progress to the UI, and produce a structured execution report — all while tracing every LLM call through Langfuse.",
    deliverables: [
      "GitHub repository with full project source code (React frontend + FastAPI/Node.js backend + LangGraph agent)",
      "Langfuse dashboard URL showing traces from at least 3 completed workflow executions",
      "Demo video (unlisted YouTube or Loom, max 5 minutes) showing one complete end-to-end workflow run",
      "README.md with setup instructions, .env.example, architecture diagram, feature list, and known limitations"
    ],
    evidenceCards: [
      {
        label: "Effort Estimate",
        value: "30 – 40 hrs",
        note: "Expert-level capstone. Plan for integration testing time."
      },
      {
        label: "Pass Threshold",
        value: "3 of 4 tools",
        note: "At least three tool integrations must be functional end-to-end."
      },
      {
        label: "Evaluation",
        value: "DIFY Workflow",
        note: "Submitted via FDE programme's internal DIFY evaluation platform."
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
    title: "Submit your WorkflowWeaver project",
    fields: [
      {
        label: "Project ZIP",
        fileName: "workflowweaver-submission.zip",
        value: "\nUpload a ZIP of your full project (frontend + backend + LangGraph agent)",
        fullWidth: true,
        variant: "upload"
      },
      {
        label: "Submission notes",
        value:
          "Add your GitHub repo URL, Langfuse dashboard URL, and demo video link here before submitting.",
        fullWidth: true,
        variant: "textarea"
      }
    ]
  },
  rubric: [
    { name: "Functional Correctness", weight: "35%", score: "Target 3.5" },
    { name: "Agent Design & Orchestration", weight: "25%", score: "Target 3.5" },
    { name: "UX & Real-Time Feedback", weight: "20%", score: "Target 4.0" },
    { name: "Code Quality & Docs", weight: "15%", score: "Target 3.5" },
    { name: "Innovation & Bonus", weight: "5%", score: "Target 3.0" }
  ],
  activity: [
    {
      id: "activity-capstone-opened",
      title: "Capstone workspace opened",
      meta: "Today, 09:10",
      detail: "WorkflowWeaver FDE Capstone is active. Build your cross-tool automation platform."
    },
    {
      id: "activity-checks-configured",
      title: "Automated checks configured",
      meta: "Today, 09:12",
      detail: "GitHub repo validation, Langfuse trace check, and README verification provisioned."
    },
    {
      id: "activity-mentor-checkpoint",
      title: "Mentor checkpoint",
      meta: "Tomorrow, 16:00",
      detail: "Optional architecture review before you freeze your first attempt."
    }
  ],
  problemStatement: workflowWeaverProblemStatement
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
