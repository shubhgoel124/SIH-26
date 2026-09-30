# SANGAM - Capacity Connect

SANGAM is our SIH 2026 implementation of **Capacity Connect**: a digital capacity building and learning management portal for organisations running internal training.

Sibling platform to SAKSHAM. Separate app and data. No Docker and no external database required.

## Quick start

```bash
cd sangam
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo data seeds automatically into `data/db.json` on first request.

Reset demo data anytime:

```bash
npm run reset-data
```

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@sangam.dev` | `password` | Admin (pre-approved) |
| `trainer@sangam.dev` | `password` | Trainer (pre-approved) |
| `trainee@sangam.dev` | `password` | Trainee |
| `pending.trainer@sangam.dev` | `password` | Trainer (pending approval) |

## Roles

| Role | Capabilities |
|------|----------------|
| **Trainee** | Profile, browse/enroll courses, materials, MCQ assessments, certificates, feedback |
| **Trainer** | Profile, create courses, upload library materials, questionnaires, participation |
| **Admin** | Approve users, analytics (Recharts), announcements, competency map |

## How data and uploads work

- All app data lives in a local JSON file: `data/db.json` (created automatically).
- File uploads go to `public/uploads/` unless Cloudinary env vars are set.
- Emails are skipped when `SKIP_EMAILS=true` (default for local demo).

## Environment

Copy `.env.example` to `.env`. Only `AUTH_SECRET` is required for local use.

## Out of scope (this pass)

- Embedding-based course recommendations / FastAPI service
- Payments
- Native mobile app
