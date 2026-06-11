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

The backend is a FastAPI service. Demo credentials are hardcoded in `lib/auth.ts` for all three roles (learner / reviewer / admin). The backend must be running with seeded data for the dashboard to load real data.

## Architecture

**Framework**: Next.js 15 App Router with React 19 and TypeScript (strict mode). Path alias `@/*` maps to the repo root.

**Pages** (file-based, `app/` directory):
- `/` — Home / Login shell
- `/learner` — Learner dashboard
- `/reviewer` — Reviewer dashboard
- `/admin` — Admin assessment CRUD

**Three roles**: `"learner"`, `"reviewer"`, `"administrator"` (typed as `AppRole` in `types/assessment.ts`).

### API Layer (`lib/api.ts`)

All HTTP calls live here using native `fetch`. The base URL comes from `NEXT_PUBLIC_API_BASE_URL`. Key function groups:
- Auth: `login`, `signup`, `logout`, `getCurrentUser`, `refreshAccessToken`
- Assessments: `fetchAssessments`, `updateAssessment`
- Submissions: `fetchSubmission`, `fetchSubmissions`, `fetchSubmissionEvents`, `pushSubmissionEvent`, `updateSubmissionStatus`
- Human reviews: `fetchHumanReviews`, `submitHumanReview`
- Files: `getPresignedDownloadUrl`

Login uses `application/x-www-form-urlencoded`; everything else uses JSON.

### Auth / Session (`lib/auth.ts`)

No global state container. Auth state is stored in both `localStorage` and cookies:
- `localStorage`: `access_token`, `refresh_token`, `user` (JSON)
- Cookies: `auth_access_token`, `auth_refresh_token`, `auth_user_role`

Key functions: `storeAuthSession`, `clearAuthSession`, `getStoredUser`, `getStoredAccessToken`.

Components read auth state on mount via `useEffect`. `AppNav` renders role-specific navigation based on the stored user role. `LoginShell` handles the `?next=` redirect-after-auth query param.

### State Management

Pure React (`useState` + `useEffect`). No Redux, Zustand, or Context. Data is fetched on component mount and held in local state.

**Shell pattern**: `LearnerDashboardShell` handles API fetching and injects data as props into the presentational `LearnerDashboard`. The reviewer and admin pages own their own fetching directly.

### Styling

Custom CSS only — no Tailwind or CSS-in-JS. Design tokens are CSS custom properties on `:root` in `app/globals.css` (`--bg`, `--panel`, `--text`, `--teal`, `--coral`, `--gold`, `--radius-*`, `--shadow`). Font is "Sora". Admin components use CSS Modules (`assessment-list.module.css`).

### Types (`types/assessment.ts`)

Central file for all shared types. Key ones:
- `AppRole`, `Submission`, `SubmissionEvent`, `SubmissionEventType`, `SubmissionStatus`
- `DashboardContent`, `ReviewerWorkspace`, `ReviewerSubmission`
- `Assessment`, `AssessmentUpdatePayload`
- `EvaluationTier`, `LiveEvaluationStatus`

All API response shapes are also typed inline in `lib/api.ts`.

### Static Data (`data/`)

- `dashboard-content.ts` — Mock data for the learner dashboard (`learnerDashboardContent`) and home page route cards
- `constants.ts` — `DEFAULT_SUBMISSION_ID` used for dev/test targeting

### Key Components

| Component | Location | Role |
|---|---|---|
| `LoginShell` | `components/home/login-shell.tsx` | Signin/signup forms |
| `AppNav` | `components/navigation/app-nav.tsx` | Header with role-filtered nav and logout |
| `LearnerDashboardShell` | `components/home/learner-dashboard-shell.tsx` | Data fetching wrapper for learner |
| `LearnerDashboard` | `components/home/learner-dashboard.tsx` | Main learner UI |
| `ReviewerDashboard` | `components/home/reviewer-dashboard.tsx` | Review queue, submission detail, verdict submission |
| `AssessmentList` | `components/admin/assessment-list.tsx` | Assessment CRUD with inline editing |

All stateful components use the `"use client"` directive.
