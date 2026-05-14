# HandsOn SmartBin — Fleet Management Platform

> Solar-powered smart waste management with real-time telemetry, predictive fleet analytics, and direct HY-CKX1 device integration.

**Live:** `http://130.211.208.47` · **API:** `http://130.211.208.47:3001/api` · **Device TCP:** `130.211.208.47:8078`

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Device Protocol](#device-protocol)
- [Quick Start (Local)](#quick-start-local)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Production Deployment (GCP)](#production-deployment-gcp)
- [Connecting the Device](#connecting-the-device)
- [Frontend Pages](#frontend-pages)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Overview

HandsOn SmartBin is a full-stack IoT fleet management platform for the **HY-CKX1 solar compressor bin** by HandsOn Systems Ltd. (Malta). It provides:

- **Real-time telemetry** — parses native E9xx UART frames from the device over TCP
- **Live dashboard** — fill levels, battery, temperature, GPS, door state for every bin
- **Fleet analytics** — collection queue, route optimisation, CO2 savings, uptime tracking
- **Alert system** — smoke detection, mechanical jams, battery warnings, communication loss
- **Reports and export** — CSV/JSON export with all 25 device parameters per bin
- **SmartBin Assistant** — AI chatbot answering bin queries from live sensor data
- **Demo mode** — full 8-bin Malta fleet with realistic data, no device required

---

## Architecture

Two backend options are available. The full-stack server (`server/`) runs the dashboard, simulator, and WebSocket feed. The production backend (`backend/`) is a lean TCP-to-PostgreSQL pipeline with no in-memory state.

### Full-stack server (demo + dashboard)

```
┌──────────────────────────────────────────────────────┐
│              GCP VM  130.211.208.47 (static)         │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Frontend   │  │  Backend    │  │  TCP Proxy  │  │
│  │  React/Vite │  │  Express    │  │  Node.js    │  │
│  │  pm2 :80    │  │  pm2 :3001  │  │  :8078      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         └────── WebSocket :8765 ───────────┘         │
└──────────────────────────────────────────────────────┘
                                   ▲ TCP E9xx frames
                        ┌──────────┴──────────┐
                        │  HY-CKX1 Device     │
                        │  Card: 26042400P101  │
                        │  IMEI: 867105074732545│
                        └─────────────────────┘
```

### Production backend (TCP → PostgreSQL)

```
┌──────────────────────────────────────────────────────┐
│              backend/  (Node.js ESM)                 │
│                                                      │
│   TCP :8078                                          │
│   ├── parse E9xx frames                              │
│   ├── ACK back to device                             │
│   └── write to PostgreSQL                            │
│       ├── sessions   (connect / disconnect times)    │
│       ├── frames     (raw hex audit trail)           │
│       ├── readings   (sensor time-series)            │
│       ├── bin_state  (current state, upserted)       │
│       └── alerts     (jam / smoke / fault events)   │
└──────────────────────────────────────────────────────┘
                  ▲ TCP E9xx frames
       ┌──────────┴──────────┐
       │  HY-CKX1 Device     │
       └─────────────────────┘
```

**Stack:** React 19, Vite, Recharts, Leaflet, Node.js ESM, Express, ws, PostgreSQL, pg, pm2, GCP

---

## Device Protocol

The HY-CKX1 uses the **E9xx binary protocol** over TCP.

### Frame Format
```
0xE9 | func_code | data_len | data_body... | 0x0D 0x0A
```

The parser uses `data_len` (byte 3) to calculate exact frame size — never searches for 0x0D, which could appear in normal sensor values (temperature 13C, fill 13%, etc.).

### Frames Received from Device

| Code | Name | Data |
|------|------|------|
| `E9 00` | Handshake | IMEI 15 ASCII bytes |
| `E9 10` | Location | lat,lng ASCII string |
| `E9 11` | Alert | `[0x01,0x00]`=jam · `[0x00,0x01]`=smoke |
| `E9 06` | Bucket status | 3 status bytes (Table 1 bytes 2-4) |
| `E9 07` | Battery | voltage, current, level%, temp (Table 1 bytes 5-8) |
| `E9 08` | Capacity | fill% slots 1/2/3 (Table 2 bytes 2-4) |
| `E9 09` | Counts | 3x open + 3x compress counts (Table 2 bytes 5-10) |
| `E9 AB/AC` | Heartbeat | Server ACKs with `E9 AB 00 0D 0A` |
| `E9 01` | Sensor trigger | door number (payload[0] & 0x0F) |
| `E9 04` | Compress start | door number |
| `E9 05` | Compress done | door number |

### Status Byte Bits (INVERTED polarity — 0=fault, 1=normal)

| Bit | 0 = | 1 = |
|-----|-----|-----|
| Bit0 | Door **open** | Door closed |
| Bit1 | **Overflow** | Normal |
| Bit2 | Bin **missing** | Normal |
| Bit3 | **Motor fault** | Normal |
| Bit4 | **Sensor fault** | Normal |

### Commands Sent to Device

| Code | Command |
|------|---------|
| `E9 C1 01 D1 0D 0A` | Open deposit door 1 |
| `E9 C2 01 D1 0D 0A` | Close deposit door 1 |
| `E9 C3 00 0D 0A` | Read all bucket status |
| `E9 C4 00 0D 0A` | Read battery status |
| `E9 C5 00 0D 0A` | Read all bucket capacity |
| `E9 C6 00 0D 0A` | Read open/compression counts |
| `E9 C7 01 [cm] 0D 0A` | Set overflow distance |

**On connect:** server auto-polls `C3 -> C4 -> C5 -> C6` to get current device state immediately.

---

## Quick Start (Local)

### Prerequisites
- Node.js 20+, npm 10+

### Full-stack server (frontend + dashboard + simulator)

```bash
git clone https://github.com/Boyapati13/Handson-smartbin.git
cd Handson-smartbin
npm install
npm run dev:all
```

Open **http://localhost:5173**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| WebSocket | ws://localhost:8765 |
| REST API | http://localhost:3001/api |
| Device TCP | 0.0.0.0:8078 |

### Production backend (TCP → PostgreSQL only)

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL=postgresql://user:password@localhost:5432/smartbin

npm install
npm run db:init   # creates tables (safe to re-run)
npm start         # listens on TCP :8078
```

Devices connect on `:8078`. All frames, sensor readings, and alerts are persisted to Postgres — no in-memory state, no simulator.

---

## GitHub Pages Deployment

This repository now includes an automated Pages workflow:

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` (or manual run from Actions tab)
- Deploy target: `https://boyapati13.github.io/Handson-smartbin/`

### One-time repository setup

1. Open **Settings → Pages**
2. In **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` (or run **Deploy to GitHub Pages** manually)

The workflow builds the frontend and publishes the `dist/` output to GitHub Pages with the correct repository base path.

---

## Production Deployment (GCP)

### Redeploy (GCP Cloud Shell)

```bash
gcloud compute ssh smartbin --zone=us-central1-a

cd ~/Handson-smartbin
git pull origin main
npm install
npm run build

pm2 restart smartbin
pm2 restart frontend
pm2 save

pm2 list
curl http://localhost:3001/api/health
```

### PM2 Processes

| Name | Port | Purpose |
|------|------|---------|
| smartbin | 3001, 8078, 8765 | Full-stack backend + WebSocket + TCP proxy |
| frontend | 80 | Serve built React app |
| smartbin-backend | 8078 | Production backend (TCP → PostgreSQL), replaces smartbin when live |

### Firewall
Rule `allow-smartbin-device`: `tcp:80, tcp:3001, tcp:8078, tcp:8765`

---

## Connecting the Device

On the **HY-CKX1 device config screen**:

| Field | Change to |
|-------|-----------|
| TCP IP | `130.211.208.47` |
| Port | `8078` |

Tap **SAVE** → restart app. Device appears live on dashboard within seconds.

**Registered device:** Card `26042400P101` · IMEI `867105074732545` · mapped to `HS-001`

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing + demo/admin login |
| `/dashboard` | Operations Centre | KPIs, map, collection queue, alerts |
| `/device` | Live Device Monitor | All sensor tiles from real device |
| `/fleet` | Bin Fleet | All bins, search and filter |
| `/fleet/:id` | Bin Detail | Full per-bin: 3-slot fill, battery voltage/current, per-door counts, real event log |
| `/routes` | Route Planner | TSP optimisation, CO2, fuel cost |
| `/analytics` | Analytics | Fill/battery trends, status breakdown |
| `/alerts` | Alerts | Active alerts, acknowledge and reset |
| `/maintenance` | Maintenance | Log and track maintenance visits |
| `/reports` | Reports | Fleet/per-bin analytics + CSV/JSON export |
| `/telemetry` | Telemetry | Raw E9xx frame stream console |

---

## API Reference

Base: `http://130.211.208.47:3001/api`

```
GET  /health
GET  /bins
GET  /bins?status=full&minFill=80
GET  /bins/:id
POST /bins/:id/command          { cmd: "compact|acknowledge|diagnostics|door_unlock|reset" }
GET  /stats
GET  /alerts
GET  /alerts?sev=crit
DELETE /alerts/:id
GET  /telemetry?limit=100
GET  /reports/fleet
GET  /reports/bins/:id
GET  /reports/alerts
GET  /reports/export            (CSV — 25 columns, all device fields)
GET  /reports/export/json       (Full JSON download)
GET  /maintenance
POST /maintenance
GET  /public/reports
POST /public/report
```

---

## Authentication

| Account | Email | Password | Mode |
|---------|-------|----------|------|
| Demo | `demo@handson.io` | `demo1234` | 8 Malta bins, realistic data |
| Admin | `admin@handson.io` | `handson2024` | HS-001 real device |

Edit credentials in `src/context/AuthContext.jsx` → `USERS` object.

**Demo mode** — WS bin updates ignored; commands simulate locally.
**Admin mode** — all data from real device via WebSocket + REST API.

---

## Environment Variables

### Full-stack server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `HTTP_PORT` | `3001` | REST API port |
| `WS_PORT` | `8765` | WebSocket port |
| `DEVICE_TCP_PORT` | `8078` | Device TCP listen port |
| `DEVICE_PUBLIC_HOST` | null | Public IP (shown in device setup instructions) |
| `SIMULATION` | `false` | Enable bin simulation |
| `CLOUD_FORWARD` | `false` | Mirror to recycle4g.lxhsoft.com |

### Production backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string (required) |
| `TCP_PORT` | `8078` | Device TCP listen port |
| `CLOUD_FORWARD` | `false` | Mirror traffic to recycle4g.lxhsoft.com |
| `CLOUD_FORWARD_HOST` | `recycle4g.lxhsoft.com` | Legacy cloud host for forwarding |
| `CLOUD_FORWARD_PORT` | `8078` | Legacy cloud port |

### Frontend (`.env.production`)

| Variable | Value |
|----------|-------|
| `VITE_WS_URL` | `ws://130.211.208.47:8765` |
| `VITE_API_URL` | `http://130.211.208.47:3001/api` |

---

## Testing

```bash
npm test          # 126 tests across 8 files
npm run build     # production build — must be clean
npm run dev:all   # local dev (UI + server)
npm run dns       # DNS spoof server (zero device change needed)
```

### Test Files (126 tests)

| File | Tests |
|------|-------|
| device-bridge.test.js | Frame parsing, 0x0D-in-data regression, decodeFrame |
| store.test.js | CRUD, alerts, frames, stats, uptime |
| context.test.jsx | WebSocket messages, demo/admin isolation |
| api.test.js | All REST endpoints, command validation |
| simulator.test.js | Bin simulation, frame builders |
| routing.test.js | Haversine, TSP, GPS null guards |
| alerts.test.js | Alert lifecycle |
| integration.test.js | End-to-end API |

---

## Project Structure

```
handson-smartbin/
├── backend/                        Production TCP → PostgreSQL backend
│   ├── index.js                    Entry point: init DB, start TCP
│   ├── tcp.js                      TCP socket server (port 8078)
│   ├── parser.js                   E9xx frame parser + decoder
│   ├── registry.js                 Device card → bin ID mapping
│   ├── .env.example                Config template
│   ├── package.json
│   └── db/
│       ├── pool.js                 pg connection pool + initDb()
│       ├── schema.sql              5 tables: sessions, frames, readings, bin_state, alerts
│       ├── queries.js              DB write functions (insertFrame, upsertBinState, …)
│       └── init.js                 One-shot schema setup script
├── server/                         Full-stack backend (dashboard + simulator)
│   ├── index.js                    Entry point: WS + HTTP + TCP
│   ├── tcp-proxy.js                E9xx frame parser + device handler
│   ├── device-bridge.js            Frame decoder + length-based parseFrames()
│   ├── device-registry.js          Card-to-bin-ID mapping
│   ├── store.js                    In-memory data store
│   ├── api.js                      REST API (all routes)
│   ├── simulator.js                Bin simulation (SIMULATION=true)
│   └── dns-spoof.js                DNS intercept server
├── src/
│   ├── context/
│   │   ├── AppContext.jsx          WS state, demo/admin mode, command dispatch
│   │   └── AuthContext.jsx         Login, user credentials
│   ├── pages/
│   │   ├── Landing.jsx             Marketing + login
│   │   ├── Dashboard.jsx           Operations centre
│   │   ├── DeviceMonitor.jsx       Live device: all E9xx sensor tiles
│   │   ├── BinDetail.jsx           Full per-bin data (all protocol fields)
│   │   ├── Reports.jsx             Fleet/per-bin analytics + CSV/JSON export
│   │   ├── Analytics.jsx           Fleet fill/battery trends
│   │   ├── Alerts.jsx              Alert management
│   │   ├── Maintenance.jsx         Maintenance logging
│   │   ├── Routes.jsx              Route planner (TSP)
│   │   └── Telemetry.jsx           Raw frame stream console
│   ├── components/
│   │   ├── ChatBot.jsx             SmartBin assistant chatbot
│   │   ├── MapView.jsx             Leaflet map (null-GPS safe)
│   │   ├── RouteMap.jsx            Route planner map
│   │   └── ...
│   ├── data/bins.js                Static bin data + demo fleet
│   └── utils/routing.js            TSP optimisation + GPS guards
├── public/handson_logo.png         Official brand PNG
├── .env                            Server env (not committed)
├── .env.production                 Frontend build env (not committed)
└── README.md
```

---

## HandsOn Systems Ltd.

- **Phone:** (+356) 2722 4445
- **Email:** info@handsonsystems.com
- **Address:** MST26 Mosta Techno Park, Mosta MST 3000, Malta
- **Web:** [handsonsystems.com](https://www.handsonsystems.com)

*"Connected Solutions for Tomorrow's World, Today"*

---

© 2026 HandsOn Systems Ltd. All rights reserved.
