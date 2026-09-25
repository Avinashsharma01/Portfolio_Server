# 🚂 Deploying Portfolio & Razorpay Server to Railway

This server is fully configured and ready for 1-click deployment to [Railway](https://railway.app/).

---

## 📋 What Was Configured for Railway

1. **Host Binding (`0.0.0.0`)**: Configured [server.js](server.js) to bind to `0.0.0.0` and dynamic `process.env.PORT`.
2. **Flexible Database Connection**: [config/db.js](config/db.js) automatically recognizes both `MONGODB_URI` (MongoDB Atlas) and `MONGO_URL` (Railway MongoDB plugin), and safely masks credentials in deployment logs.
3. **Healthcheck & Status Endpoints**:
   - `GET /` — API overview, server uptime, database status
   - `GET /health` and `GET /api/health` — Railway healthcheck probe endpoints
4. **Railway Configuration**:
   - `railway.json` — Specifies Nixpacks builder, start command, healthcheck endpoint (`/api/health`), and restart policy.
   - `Procfile` — Standard fallback process definition (`web: node server.js`).
5. **Modern Node Runtime**: `"engines": { "node": ">=18.0.0" }` in `package.json`.
6. **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT` to cleanly close open database and HTTP connections when Railway restarts or redeploys instances.

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Commit and Push Changes to GitHub

In your project directory terminal, stage and push the changes:

```bash
git add .
git commit -m "chore: prepare server for Railway deployment"
git push origin main
```

*(Note: `.env` is in `.gitignore` and will never be committed to GitHub)*

---

### Step 2: Create a New Project on Railway

1. Go to [railway.com](https://railway.com/) and sign in with your GitHub account.
2. Click **+ New Project**.
3. Select **Deploy from GitHub repo**.
4. Choose your repository: **`Avinashsharma01/Portfolio_Server`**.
5. Click **Deploy Now**.

---

### Step 3: Configure Environment Variables

1. In Railway, click on your deployed service box.
2. Navigate to the **Variables** tab.
3. Click **Add Variable** (or **RAW Editor**) and add the following keys:

| Variable Name | Value Description | Example / Notes |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://<username>:<password>@cluster.mongodb.net/AvinashPF_Server?retryWrites=true&w=majority` |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret | From [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `JWT_SECRET` | Secret string for auth tokens | Any secure string |
| `FRONTEND_URL` | Your frontend portfolio domain | `https://your-portfolio.vercel.app` (or `*` to allow all) |

> ⚠️ **Note on PORT**: Do **NOT** set `PORT` in Railway Variables. Railway automatically assigns a dynamic port and injects it into `process.env.PORT`.

---

### Step 4: Generate a Public Domain

By default, Railway services do not have a public URL until you generate one:

1. Click your service card in Railway.
2. Go to the **Settings** tab.
3. Scroll down to the **Networking** section (or click **Networking** tab).
4. Click **Generate Domain** (Railway will assign a domain like `portfolio-server-production.up.railway.app`).
5. You can also customize the domain name prefix if you want.

---

### Step 5: Verify the Deployment

Open your browser or run `curl`:

1. **Root Status**:
   ```
   https://<your-railway-domain>.up.railway.app/
   ```
   You should see:
   ```json
   {
     "status": "ok",
     "service": "Portfolio & Course Backend API",
     "version": "1.0.0",
     "database": "connected"
   }
   ```

2. **Health Check**:
   ```
   https://<your-railway-domain>.up.railway.app/api/health
   ```

---

### Step 6: Connect Your Frontend

In your frontend application (e.g. Next.js / Vite / React portfolio):
Update your API base URL environment variable (e.g. `VITE_API_URL` or `NEXT_PUBLIC_API_URL`):

```env
VITE_API_URL=https://<your-railway-domain>.up.railway.app
```
