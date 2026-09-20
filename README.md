# INTRUDER (V1.0) - Multiplayer Social Deduction Game

A real-time, browser-based online multiplayer social deduction & word association web game built with **React**, **Node.js**, **Socket.io**, and **Tailwind CSS**, designed in a bold **Neubrutalist** visual style.

---

## Quick Start (Local Development)

### 1. Install Dependencies
From the repository root:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Run Both Frontend & Backend Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:4000](http://localhost:4000)
- **Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## Production Deployment (Render + Vercel)

See [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for complete instructions:
1. **Backend (Render)**: Deploy `/server` as a Node Web Service or use [`render.yaml`](./render.yaml). Includes an automatic **14-minute self-ping keep-alive** monitor to prevent Render free tier from sleeping.
2. **Frontend (Vercel)**: Deploy `/client` as a Vite SPA with `VITE_BACKEND_URL` environment variable. Includes [`vercel.json`](./client/vercel.json) for client-side routing.
