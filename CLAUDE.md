# PondySevai — Project Context for Claude Code

## What this project is
PondySevai is an AI-powered civic volunteer management platform for the Government of Puducherry (Union Territory), India. It automates the full volunteer lifecycle: registration → AI screening → nodal officer review → training → deployment → certification.

**An Initiative by Decision Minds**  
Developed by: Dharshini.N (Intern, Decision Minds AI Incubation Center)

---

## Current phase: Phase 1 — Frontend & UX Layer

Phase 1 deliverables:
- [x] Next.js 15 App Router project scaffold
- [x] next-intl multilingual framework (Tamil, English, French)
- [x] Landing page (hero, how-it-works, departments, rewards, CTA)
- [x] 4-step registration flow (personal info → skills → role prefs → declaration)
- [x] Volunteer dashboard (profile, assignment, training, notifications)
- [x] Departments page (all 27+ roles in a searchable table)
- [x] Rewards/Leaderboard page
- [x] Nodal officer dashboard (applicant table with AI score display)
- [x] Decision Minds branding throughout
- [x] Accessibility: ARIA labels, large-text toggle, touch targets ≥44px
- [x] PWA manifest

Phase 2 (backend) will add:
- FastAPI backend on Railway
- Supabase PostgreSQL + Auth (OTP)
- REST API endpoints for registration, role management
- MiniLM sentence-transformer matching pipeline
- Claude API (claude-sonnet-4-6) profile assessment service

---

## Tech stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **i18n**: next-intl (Tamil, English, French)
- **Fonts**: Sora (headings), DM Sans (body), Noto Sans Tamil
- **Backend (Phase 2)**: FastAPI (Python), Supabase, Railway
- **AI**: Anthropic Claude API (claude-sonnet-4-6), MiniLM sentence-transformers
- **Deploy**: Vercel (frontend), Railway (backend)

---

## Design system (from proposal §8.1)
- **Orange**: #E65C00 (civic energy, CTAs, primary brand)
- **Blue**: #1A2B4A (trust, government authority, backgrounds)
- **Brand Blue**: #1A56DB (AI elements, links)
- **Background**: #FAFAF9 (warm white)
- **Fonts**: Noto Sans Tamil (Tamil Unicode), DM Sans (Latin body)
- **Base font**: 16px, large-text toggle to 20px

---

## Route structure
```
app/[locale]/
  page.tsx              ← Landing page
  register/page.tsx     ← 4-step volunteer registration
  dashboard/page.tsx    ← Volunteer dashboard
  departments/page.tsx  ← All roles by department
  rewards/page.tsx      ← Tier system + leaderboard
  nodal-officer/page.tsx ← Officer applicant dashboard
```

---

## Key files
- `lib/utils.ts` — DEPARTMENTS, ALL_ROLES, COMMUNES, REWARD_TIERS constants
- `messages/en.json` — English i18n strings (source of truth)
- `messages/ta.json` — Tamil translations
- `messages/fr.json` — French translations
- `components/layout/Navbar.tsx` — Fixed nav with lang switcher + accessibility toggle
- `components/layout/Footer.tsx` — Footer with Decision Minds attribution
- `components/sections/` — Hero, HowItWorks, Departments, Rewards, CTA

---

## Puducherry communes
1. Puducherry
2. Villianur
3. Bahour
4. Ariyankuppam

---

## AI pipeline (Phase 3)
Layer 1: MiniLM (all-MiniLM-L6-v2) — cosine similarity scoring (threshold 0.65)
Layer 2: Claude API — natural language profile summary for nodal officer
Mobility flag: if checked, high-demand roles excluded from matching automatically

---

## Accessibility requirements (WCAG 2.1 AA)
- All interactive elements: min 44×44px touch targets
- ARIA labels on all interactive elements
- Large text toggle (16px → 20px)
- High contrast mode toggle
- Noto Sans Tamil for Tamil Unicode rendering
- OTP auth only (no passwords)
