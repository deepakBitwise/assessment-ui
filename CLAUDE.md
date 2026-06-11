# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Dev server on localhost:3000
npm run build       # Production build
npm run production  # Build + start (used in CI/CD to suppress error popups)
npm start           # Run the built production server
npm run lint        # Next.js ESLint
```

No test suite is configured.

## Environment

Create a `.env.local` with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

The backend is a FastAPI service. Demo credentials are hardcoded in `lib/auth.ts` (`DEMO_CREDENTIALS`) for all three roles. The backend must be running with seeded data for the dashboard to load real data.

## Architecture

**Framework**: Next.js 15 App Router with React 19 and TypeScript (strict mode). Path alias `@/*` maps to the repo root.

**Pages** (`app/` directory):
- `/` — Home / Login shell
- `/learner` — Learner dashboard
- `/reviewer` — Reviewer dashboard
- `/admin` — Admin assessment CRUD

**Three roles**: `"learner"`, `"reviewer"`, `"administrator"` (typed as `AppRole` in `types/assessment.ts`). `ROLE_ROUTES` in `lib/auth.ts` maps role strings to their routes.

### Component Layout

```
components/
├── navigation/app-nav.tsx          # Auth-aware navbar (role-filtered links, logout)
├── home/
│   ├── login-shell.tsx             # Login + signup forms, ?next= redirect support
│   ├── route-hub.tsx               # Workspace navigation cards
│   ├── active-assessment-panel.tsx # Assessment scenario + deliverables display
│   ├── rubric-preview.tsx          # Rubric table
│   └── administrator-placeholder.tsx
├── learner/                        # All learner dashboard components
│   ├── learner-dashboard-shell.tsx # Fetches active assessment; merges stored user profile
│   ├── learner-dashboard.tsx       # Composition root — orchestrates all sub-components
│   ├── hero-section.tsx            # Hero copy + ProfileCard
│   ├── profile-card.tsx            # User name, role, level/attempt/readiness metrics
│   ├── problem-statement-panel.tsx # Tabbed spec viewer (Overview / Architecture / Submit & Grading)
│   ├── submission-workspace.tsx    # ZIP upload + submission state machine
│   ├── live-status-card.tsx        # Real-time tier statuses + event stream
│   ├── progress-rail.tsx           # 7-level progression tracker with gated unlock
│   └── activity-timeline.tsx       # Expandable submission history
├── Reviewer/
│   └── reviewer-dashboard.tsx      # Review queue, submission detail, verdict submission
└── admin/
    ├── assessment-list.tsx         # Assessment CRUD with inline editing
    └── assessment-list.module.css  # CSS Module for admin components
```

### API Layer (`lib/api.ts`)

All HTTP calls use native `fetch`. The base URL comes from `NEXT_PUBLIC_API_BASE_URL`. Key function groups:
- **Auth**: `login`, `signup`, `logout`, `getCurrentUser`, `refreshAccessToken`
- **Assessments**: `fetchAssessments`, `updateAssessment`
- **Submissions**: `fetchSubmission`, `fetchSubmissions`, `fetchSubmissionEvents`, `pushSubmissionEvent`, `pushSubmissionEvents`, `updateSubmissionStatus`
- **Human reviews**: `fetchHumanReviews`, `submitHumanReview`
- **Files**: `getPresignedDownloadUrl`

`login` uses `application/x-www-form-urlencoded`; everything else uses JSON. Error detail extraction handles both `string` and `{msg}[]` shapes from FastAPI validation responses.

### Auth / Session (`lib/auth.ts`)

No global state container. Auth is stored in both `localStorage` and cookies:
- `localStorage`: `access_token`, `refresh_token`, `user` (JSON)
- Cookies: `auth_access_token`, `auth_refresh_token`, `auth_user_role`

Key functions: `storeAuthSession`, `clearAuthSession`, `getStoredUser`, `getStoredAccessToken`. Components read auth state on mount via `useEffect`. `AppNav` renders role-specific navigation based on stored user role.

### State Management

Pure React (`useState` + `useEffect`). No Redux, Zustand, or Context. Data is fetched on component mount and held in local state.

**Shell pattern**: `LearnerDashboardShell` fetches the active assessment and merges the stored user profile into `DashboardContent` before passing it down to the presentational `LearnerDashboard`. The reviewer and admin pages own their own fetching directly in the component.

### Key Patterns

**Polling with cleanup** — used in `LearnerDashboard` for real-time status:
```ts
let isActive = true;
const interval = setInterval(() => void load(), 2000); // 2s for submission, 10s for activity
return () => { isActive = false; clearInterval(interval); };
// Guard every state update: if (!isActive) return;
```

**Upload state machine** (`submission-workspace.tsx`) — drives button states and messages:
```
idle → ready → uploading → uploaded → submitting → submitted
```
Steps: select ZIP → POST `/files/upload-url` → PUT presigned URL → POST `/submit` → get `submission_id`.

**Expandable rows** — `ProgressRail` and `ActivityTimeline` track `string[]` of expanded IDs; toggle = filter out or add.

**Download URL fallback chain** — `getPresignedDownloadUrl` tries five response keys in order:
`download_url → url → presigned_url → file_url → public_url`.

**Reviewer verdict flow** — on PASS/FAIL: `submitHumanReview()` + `updateSubmissionStatus()` + `pushSubmissionEvent()` all fire, then local review list updates.

### Styling

Custom CSS only — no Tailwind or CSS-in-JS. Design tokens are CSS custom properties on `:root` in `app/globals.css`:
- Colors: `--bg`, `--bg-deep`, `--panel`, `--text`, `--muted`, `--teal`, `--coral`, `--gold`
- Spacing: `--radius-xl` (32px), `--radius-lg` (24px), `--radius-md` (18px), `--radius-sm` (14px)
- Font: "Sora"

Key layout classes: `.shell` (max 1400px container), `.layout-grid` (1.1fr 1fr two-column), `.sw-grid` (submission workspace + live status side-by-side), `.hero` (1.45fr 0.9fr). `.panel` is the base card style. `.status` has variants: `--passed`, `--failed`, `--pending`, `--queued`, `--general`. Breakpoints collapse layouts at 1120px and 720px.

Admin components use CSS Modules (`assessment-list.module.css`); inline styles appear sparingly in `LoginShell` and `ReviewerDashboard`.

### Types (`types/assessment.ts`)

Central file for all shared types. Key ones:
- `AppRole`, `Submission`, `SubmissionEvent`, `SubmissionEventType`, `SubmissionStatus`
- `DashboardContent`, `ReviewerWorkspace`, `ReviewerSubmission`
- `Assessment`, `AssessmentUpdatePayload`
- `EvaluationTier`, `LiveEvaluationStatus`, `ActiveAssessment`

API response shapes are typed inline in `lib/api.ts`.

### Static Data (`data/`)

- `dashboard-content.ts` — Two full mock problem statements (**WorkflowWeaver** FDE-CAPSTONE-001 and **DataPilot** FDE-CAPSTONE-002), `learnerDashboardContent`, `reviewerWorkspaceContent`, `adminPlaceholderContent`, and `routeCards` for the home page.
- `constants.ts` — `DEFAULT_USER_ID` and `DEFAULT_SUBMISSION_ID` used for dev/test targeting.
