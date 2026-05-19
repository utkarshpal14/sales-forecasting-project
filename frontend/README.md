# Sales Forecast Dashboard Frontend

## Setup

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm start`
3. Build production bundle:
   - `npm run build`

## Environment

1. Copy `.env.example` to `.env` and add your Supabase keys (gitignored).
2. Set your Render URL in **`.env.production`** (used when Vercel runs `npm run build`).

| File | When | `REACT_APP_API_BASE_URL` |
|------|------|--------------------------|
| `.env.development` | `npm start` | `http://localhost:8000` |
| `.env.production` | Vercel build | `https://your-app.onrender.com` |

Supabase vars go in `.env` locally and in Vercel Environment Variables for production.

### Local development

- Prefer **`npm start`** (uses local backend on port 8000).
- If you use **`serve -s build`**, the app still calls `http://localhost:8000` when opened on localhost — start your FastAPI backend locally first.
### Supabase signup 429 (`/auth/v1/signup`)

This is **not** your FastAPI backend. Supabase’s **built-in email** on the free plan allows only **~2–4 confirmation emails per hour**.

**For local testing (recommended):**

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers** → **Email**
2. Turn off **“Confirm email”** (save)
3. Wait **15–60 minutes** if you’re already rate-limited, then sign up **once**

**For production:** add **custom SMTP** under **Authentication** → **SMTP Settings** (Resend, SendGrid, etc.).

### Deploy frontend on Vercel

1. Import the repo and set **Root Directory** to `frontend`.
2. Build command: `npm run build` · Output: `build`.
3. Add the environment variables above (use your Render URL for the API).
4. On **Render** (backend), set `FRONTEND_ORIGINS` to your Vercel URL, e.g. `https://your-app.vercel.app` (comma-separate multiple origins if needed).

## Features

- Dark-luxe single page dashboard with animated UX
- Predict, batch predict, insight, optimize, and model info pages
- Fully connected to FastAPI endpoints with fallback mock data
- Recharts visualizations and Framer Motion transitions
