# INTRUDER: Complete Deployment & Keep-Alive Guide

This guide covers step-by-step deployment of **INTRUDER** to production using **Render** (Node.js/Socket.io backend) and **Vercel** (React/Vite frontend), plus the **three-tier keep-alive provision** to prevent Render's free-tier from sleeping.

---

## Architecture Overview

```
   ┌────────────────────────────────────────────────────────┐
   │             Vercel (Frontend Hosting)                  │
   │  - URL: https://intruder-game.vercel.app               │
   │  - Vite + React + Tailwind + Neubrutalist UI          │
   │  - Injects: VITE_BACKEND_URL                           │
   └───────────────────────────┬────────────────────────────┘
                               │ WebSocket / HTTPS
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Render (Backend Web Service)               │
   │  - URL: https://intruder-server.onrender.com           │
   │  - Express + Socket.io Server (Port 10000 / 4000)      │
   │  - In-Memory Rooms State Authority                     │
   │  - Route: /api/health                                  │
   └─────────────▲──────────────────────────▲───────────────┘
                 │ 14-min self-ping         │ 10-min external cron
   ┌─────────────┴────────────┐  ┌──────────┴───────────────┐
   │ Built-in Self-Ping Loop  │  │  UptimeRobot / Cron-job  │
   │   (server/src/selfPing)  │  │    (Optional Backup)     │
   └──────────────────────────┘  └──────────────────────────┘
```

---

## Part 1: Deploy Backend on Render

### Method A: Manual Setup (Recommended)

1. Push your project to GitHub.
2. Log in to [Render.com](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `intruder-server` (or your preferred name)
   - **Region**: Choose closest to you (e.g., Frankfurt, Oregon, Singapore)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Expand **Advanced** $\rightarrow$ **Add Environment Variable**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `ENABLE_SELF_PING` | `true` | Activates built-in keep-alive loop |
   | `SELF_PING_INTERVAL_MINUTES` | `14` | Ping interval (Render sleeps after 15m) |
   | `PORT` | `10000` | Standard Render web port |
6. Click **Create Web Service**.
7. Once deployed, note down your Render service URL (e.g. `https://intruder-server.onrender.com`).
8. Test the health route in your browser:
   ```
   https://intruder-server.onrender.com/api/health
   ```
   You should see:
   ```json
   { "status": "ok", "game": "INTRUDER", "uptime": 12.4, "activeRooms": 0 }
   ```

---

### Method B: Render Blueprint (Infrastructure-as-Code)

A pre-configured [`render.yaml`](file:///c:/Users/Ayush%20Pareek/Desktop/vs%20folder/web%20dev/projects/INTRUDER/render.yaml) is already present in your repository root.
1. In Render dashboard, click **New +** $\rightarrow$ **Blueprint**.
2. Connect your repo. Render will automatically read `render.yaml` and configure the Web Service with health check and self-ping settings.

---

## Part 2: Preventing Render from Sleeping (Keep-Alive Provisions)

Render free-tier Web Services automatically spin down after **15 minutes** of inactivity. When asleep, the next request incurs a 30–50 second cold start.

We have implemented a **3-tier keep-alive strategy** so your game remains alive and instant:

### Provision 1: Built-in Server Self-Ping (Active by Default)
* Located at [`server/src/selfPing.js`](file:///c:/Users/Ayush%20Pareek/Desktop/vs%20folder/web%20dev/projects/INTRUDER/server/src/selfPing.js).
* **How it works**: Render automatically injects `RENDER_EXTERNAL_URL` into your service environment. The server detects this variable, builds the health check URL (`https://<service>.onrender.com/api/health`), and triggers an HTTP GET every **14 minutes**.
* **Log confirmation**: You will see this in your Render runtime logs:
  ```
  [Keep-Alive] Initialized keep-alive monitor pinging https://intruder-server.onrender.com/api/health every 14 min.
  [Keep-Alive] Ping OK (200 in 84ms) - Active rooms: 0
  ```

### Provision 2: Free External Uptime Monitor (Redundant Fail-Safe)
To guarantee 100% uptime even if a node restarts or sleeps:
1. Sign up for a free account at [cron-job.org](https://cron-job.org) or [UptimeRobot.com](https://uptimerobot.com).
2. Create a new monitor / cron job:
   - **URL**: `https://<your-render-service>.onrender.com/api/health`
   - **Execution Schedule / Interval**: Every **10 minutes**
   - **HTTP Method**: `GET`
3. Save. This free external ping ensures your server never goes idle.

### Provision 3: Client-Side Instant Wake-Up
* In [`client/src/hooks/useSocket.ts`](file:///c:/Users/Ayush%20Pareek/Desktop/vs%20folder/web%20dev/projects/INTRUDER/client/src/hooks/useSocket.ts), as soon as any visitor opens the website, a proactive background request is dispatched to `/api/health`.
* Socket.io reconnection attempts have been configured to **30 retries with 2-second intervals**, smoothly absorbing any initial cold start without throwing an error to the user.

---

## Part 3: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Select your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:
   | Name | Value |
   | :--- | :--- |
   | `VITE_BACKEND_URL` | `https://your-service-name.onrender.com` |
   *(Replace with your actual Render backend URL from Part 1, without a trailing slash)*.
5. Click **Deploy**.
6. Vercel will build and assign you a production URL (e.g. `https://intruder-game.vercel.app`).
7. Routing is automatically managed by [`client/vercel.json`](file:///c:/Users/Ayush%20Pareek/Desktop/vs%20folder/web%20dev/projects/INTRUDER/client/vercel.json) to prevent 404s on page refresh.

---

## Part 4: Post-Deployment Verification Checklist

- [ ] **Health Check**: Open `https://<your-render-url>/api/health` in browser $\rightarrow$ confirms `{ "status": "ok" }`.
- [ ] **Frontend Loading**: Open your Vercel URL $\rightarrow$ check top right status badge shows **ONLINE** (green).
- [ ] **Room Creation**: Enter your alias, click **CREATE ROOM** $\rightarrow$ verify 6-character room code appears in yellow badge.
- [ ] **Multi-Device Test**: Open the Vercel link on your smartphone or an incognito tab $\rightarrow$ enter the room code $\rightarrow$ verify both players appear in the lobby roster in real-time.
- [ ] **Keep-Alive Check**: Check Render logs after 20 minutes $\rightarrow$ verify `[Keep-Alive] Ping OK` entries are recurring every 14 minutes.
