# PondySevai — Puducherry Civic Volunteer Portal

**An Initiative by Decision Minds**

AI-powered civic volunteer management platform for the Government of Puducherry.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The app redirects to `/en` by default. Language paths: `/en`, `/ta`, `/fr`.

## Phase 1 Pages

| Route | Description |
|-------|-------------|
| `/en` | Landing page — hero, how it works, departments, rewards |
| `/en/register` | 4-step volunteer registration form |
| `/en/dashboard` | Volunteer dashboard (mock data) |
| `/en/departments` | All 27+ volunteer roles by department |
| `/en/rewards` | Tier system + leaderboard |
| `/en/nodal-officer` | Nodal officer applicant dashboard |

Switch language by replacing `/en` with `/ta` (Tamil) or `/fr` (French).

## Design System

- **Primary orange**: `#E65C00`
- **Navy**: `#1A2B4A`
- **Background**: `#FAFAF9`
- **Fonts**: Sora (headings) · DM Sans (body) · Noto Sans Tamil

## Tech Stack

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS** — utility-first styling
- **next-intl** — Tamil / English / French i18n
- **Lucide React** — icons

## Phase 2 (coming)

- FastAPI backend on Railway
- Supabase PostgreSQL + OTP auth
- MiniLM volunteer-role matching
- Anthropic Claude API profile assessment

---

Prepared by: Dharshini.N — Intern, Decision Minds AI Incubation Center  
Contact: dharshini13816@gmail.com
