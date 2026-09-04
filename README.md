# 🌿 SAHARA — AI-Powered Mental Wellness Platform

> A full-stack mental health platform connecting patients with licensed professionals, powered by AI-driven wellness support, mood tracking, and crisis detection.

---

## ✨ Features

| Module | Details |
|---|---|
| 🤖 AI Wellness Chat | OpenRouter-powered chatbot (Claude / GPT-4o-mini), crisis detection, doctor alerts |
| 📓 Mood Journal | Daily journaling with AI-generated titles, mood logs, streaks |
| 📊 Assessments | PHQ-9 (depression) & GAD-7 (anxiety) with scored reports |
| 📅 Appointments | Book with available doctors, conflict detection, email reminders |
| 💬 Messaging | Direct doctor–patient messaging after assignment |
| 🔔 Notifications | In-app + transactional email (Resend API) |
| 👨‍⚕️ Doctor Dashboard | Patient list, risk flags, clinical notes, analytics |
| 🛠️ Admin Dashboard | User management, doctor assignment, audit logs, analytics |
| 🔐 Auth | JWT + refresh token rotation, role-based access (patient / doctor / admin) |

---

## 🏗️ Tech Stack

**Frontend** — `client/`
- React 18 + Vite + Tailwind CSS
- React Router v6, Axios, Framer Motion

**Backend** — `server/`
- Node.js + Express + MongoDB Atlas (Mongoose)
- OpenRouter AI, Resend Email, node-cron scheduler
- Helmet, rate-limiter, bcrypt, JWT

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key → [openrouter.ai](https://openrouter.ai)
- Resend API key → [resend.com](https://resend.com)

### 1. Clone
```bash
git clone https://github.com/MANISH-github07/Sahara.git
cd Sahara
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
# .env already has correct defaults for local dev
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.
The Vite dev server proxies `/api` → `localhost:5000` automatically.

---

## 🔑 Environment Variables

See `server/.env.example` for all required variables.

Key variables to set in `server/.env`:

```
MONGODB_URI=           # MongoDB Atlas connection string
JWT_SECRET=            # Random 64-char string
JWT_REFRESH_SECRET=    # Another random 64-char string
OPENROUTER_API_KEY=    # sk-or-v1-...
RESEND_API_KEY=        # re_...
CLIENT_URL=            # http://localhost:5173 (local) or https://your-vercel-url.vercel.app (prod)
```

---

## 🌱 Seed Database (Test Accounts)

```bash
cd server
node src/scripts/seed.js
```

This creates:

| Role | Email | Password |
|---|---|---|
| Admin | admin@sahara.care | Admin@1234 |
| Doctor | priya@sahara.care | Doctor@1234 |
| Doctor | arjun@sahara.care | Doctor@1234 |
| Patient | manish@example.com | Test@1234 |
| Patient | sneha@example.com | Test@1234 |

---

## ☁️ Deployment

### Backend → Render
1. New Web Service → connect this repo → root directory: `server`
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add all env vars from `server/.env.example` in Render dashboard
5. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel
1. New Project → connect this repo → root directory: `client`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env var: `VITE_API_URL=https://your-render-service.onrender.com/api`

---

## 📁 Project Structure

```
Sahara/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios API calls
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Route pages (patient/doctor/admin)
│   │   └── routes/          # Protected route logic
│   └── .env.example
│
└── server/                  # Express backend
    ├── src/
    │   ├── config/          # DB, JWT, mailer config
    │   ├── controllers/     # Route handlers
    │   ├── middleware/      # Auth, roles, rate limiter
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # Express routers
    │   ├── services/        # AI, notifications, scheduler
    │   └── scripts/         # DB seed script
    └── .env.example
```

---

## 🔒 Security

- All secrets stored in `server/.env` (never committed)
- AI API keys are server-side only — never exposed to frontend
- JWT refresh token rotation on every request
- Rate limiting on auth endpoints
- Helmet security headers
- Input validation on all routes

---

## 📄 License

MIT — built as a mental wellness demo project.
