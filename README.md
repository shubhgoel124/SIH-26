# SANGAM — Capacity Connect

SANGAM is our SIH 2026 implementation of **Capacity Connect**: a digital capacity building and learning management portal for organisations running internal training.

It is a sibling platform to [SAKSHAM](https://github.com/anup015/SIH26) (placement portal). Separate repo, separate database, separate Vercel project.

## Roles

| Role | Capabilities |
|------|----------------|
| **Trainee** | Profile, browse/enroll courses, materials, MCQ assessments, certificates, feedback |
| **Trainer** | Profile, create courses, upload library materials, questionnaires, participation |
| **Admin** | Approve users, analytics (Recharts), announcements, competency map |

## Demo accounts (seeded)

| Email | Password | Role |
|-------|----------|------|
| `admin@sangam.dev` | `password` | Admin (pre-approved) |
| `trainer@sangam.dev` | `password` | Trainer (pre-approved) |
| `trainee@sangam.dev` | `password` | Trainee |
| `pending.trainer@sangam.dev` | `password` | Trainer (pending approval) |

## Local setup

```bash
# 1. Start Postgres (Docker)
docker compose up -d

# 2. Install & generate Prisma client
npm install

# 3. Push schema + seed demos
npx prisma db push
npx tsx prisma/seed.ts

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env`. Defaults point at the local Docker Postgres on port **5433**.

For production, use a fresh Neon database and set:

- `DATABASE_URL` — Neon connection string  
- `AUTH_SECRET` — strong secret  
- `CLOUDINARY_*` — for material/certificate uploads  
- `MAILTRAP_TOKEN` — optional; set `SKIP_EMAILS=true` to skip  

## Architecture notes

- Next.js 15 App Router + NextAuth v5 JWT sessions (same pattern as SAKSHAM)
- Prisma + PostgreSQL
- Cloudinary uploads via `/api/upload`
- Certificate QR verification at `/verify/[token]`
- Competency map is seeded demo data for the hackathon prototype

## Out of scope (this pass)

- Embedding-based course recommendations / FastAPI service  
- Payments  
- Native mobile app  
