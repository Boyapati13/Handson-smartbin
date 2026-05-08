# Graph Report - .  (2026-05-08)

## Corpus Check
- 82 files · ~65,878 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 476 nodes · 581 edges · 69 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Alert Management|Alert Management]]
- [[_COMMUNITY_Device Protocol Layer|Device Protocol Layer]]
- [[_COMMUNITY_TCP Socket Server|TCP Socket Server]]
- [[_COMMUNITY_PostgreSQL Backend|PostgreSQL Backend]]
- [[_COMMUNITY_Fleet Dashboard UI|Fleet Dashboard UI]]
- [[_COMMUNITY_Bin State & Store|Bin State & Store]]
- [[_COMMUNITY_Device Registry|Device Registry]]
- [[_COMMUNITY_Simulation Engine|Simulation Engine]]
- [[_COMMUNITY_Route Optimisation|Route Optimisation]]
- [[_COMMUNITY_WebSocket Data Flow|WebSocket Data Flow]]
- [[_COMMUNITY_Auth & Access Control|Auth & Access Control]]
- [[_COMMUNITY_Map & Geolocation|Map & Geolocation]]
- [[_COMMUNITY_Brand & Visual Assets|Brand & Visual Assets]]
- [[_COMMUNITY_Telemetry Frame Log|Telemetry Frame Log]]
- [[_COMMUNITY_Reports & Analytics|Reports & Analytics]]
- [[_COMMUNITY_Maintenance Tracking|Maintenance Tracking]]
- [[_COMMUNITY_E2E Test Suites|E2E Test Suites]]
- [[_COMMUNITY_Unit Tests|Unit Tests]]
- [[_COMMUNITY_Deployment & Infra|Deployment & Infra]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Module Group 20|Module Group 20]]
- [[_COMMUNITY_Module Group 21|Module Group 21]]
- [[_COMMUNITY_Module Group 22|Module Group 22]]
- [[_COMMUNITY_Module Group 23|Module Group 23]]
- [[_COMMUNITY_Module Group 24|Module Group 24]]
- [[_COMMUNITY_Module Group 25|Module Group 25]]
- [[_COMMUNITY_Module Group 26|Module Group 26]]
- [[_COMMUNITY_Module Group 27|Module Group 27]]
- [[_COMMUNITY_Module Group 28|Module Group 28]]
- [[_COMMUNITY_Module Group 29|Module Group 29]]
- [[_COMMUNITY_Module Group 30|Module Group 30]]
- [[_COMMUNITY_Module Group 31|Module Group 31]]
- [[_COMMUNITY_Module Group 32|Module Group 32]]
- [[_COMMUNITY_Module Group 33|Module Group 33]]
- [[_COMMUNITY_Module Group 34|Module Group 34]]
- [[_COMMUNITY_Module Group 35|Module Group 35]]
- [[_COMMUNITY_Module Group 36|Module Group 36]]
- [[_COMMUNITY_Module Group 37|Module Group 37]]
- [[_COMMUNITY_Module Group 38|Module Group 38]]
- [[_COMMUNITY_Module Group 39|Module Group 39]]
- [[_COMMUNITY_Module Group 40|Module Group 40]]
- [[_COMMUNITY_Module Group 41|Module Group 41]]
- [[_COMMUNITY_Module Group 42|Module Group 42]]
- [[_COMMUNITY_Module Group 43|Module Group 43]]
- [[_COMMUNITY_Module Group 44|Module Group 44]]
- [[_COMMUNITY_Module Group 45|Module Group 45]]
- [[_COMMUNITY_Module Group 46|Module Group 46]]
- [[_COMMUNITY_Module Group 47|Module Group 47]]
- [[_COMMUNITY_Module Group 48|Module Group 48]]
- [[_COMMUNITY_Module Group 49|Module Group 49]]
- [[_COMMUNITY_Module Group 50|Module Group 50]]
- [[_COMMUNITY_Module Group 51|Module Group 51]]
- [[_COMMUNITY_Module Group 52|Module Group 52]]
- [[_COMMUNITY_Module Group 53|Module Group 53]]
- [[_COMMUNITY_Module Group 54|Module Group 54]]
- [[_COMMUNITY_Module Group 55|Module Group 55]]
- [[_COMMUNITY_Module Group 56|Module Group 56]]
- [[_COMMUNITY_Module Group 57|Module Group 57]]
- [[_COMMUNITY_Module Group 58|Module Group 58]]
- [[_COMMUNITY_Module Group 59|Module Group 59]]
- [[_COMMUNITY_Module Group 60|Module Group 60]]
- [[_COMMUNITY_Module Group 61|Module Group 61]]
- [[_COMMUNITY_Module Group 62|Module Group 62]]
- [[_COMMUNITY_Module Group 63|Module Group 63]]
- [[_COMMUNITY_Module Group 64|Module Group 64]]
- [[_COMMUNITY_Module Group 65|Module Group 65]]
- [[_COMMUNITY_Module Group 66|Module Group 66]]
- [[_COMMUNITY_Module Group 67|Module Group 67]]
- [[_COMMUNITY_Module Group 68|Module Group 68]]

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 18 edges
2. `AppContext (useApp hook — bins, alerts, frames, connectedDevices, sendCommand)` - 13 edges
3. `fillColor()` - 12 edges
4. `AppProvider()` - 11 edges
5. `useApi()` - 10 edges
6. `handleFrame(frame) frame dispatcher` - 10 edges
7. `pg.Pool (PostgreSQL connection pool)` - 10 edges
8. `startTCP()` - 9 edges
9. `nowTs()` - 9 edges
10. `ChatBot()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Key Backend Files Reference` --references--> `store.js module`  [INFERRED]
  FINAL_PRODUCTION_SETUP.md → server/store.js
- `decodeFrame()` --conceptually_related_to--> `decodeFrame(buf) [server/device-bridge.js]`  [INFERRED]
  backend\parser.js → server/device-bridge.js
- `Probe()` --calls--> `useApp()`  [INFERRED]
  src\test\unit\context.test.jsx → src\context\AppContext.jsx
- `BarTooltip()` --calls--> `fillColor()`  [INFERRED]
  src\pages\Analytics.jsx → src\data\bins.js
- `useApi()` --depends_on--> `Server API Router (createApiRouter)`  [INFERRED]
  src\hooks\useApi.js → src/test/integration/api.test.js

## Communities

### Community 0 - "Alert Management"
Cohesion: 0.04
Nodes (41): ALERT_TYPES constant (OVERFLOW, SMOKE_FIRE, JAM, COMM_LOSS, DOOR_OPEN, BATTERY, FAULT_CODE), Alerts(), formatAge(), Analytics(), BarTooltip(), Route Savings Computation (computeRouteMetrics), AppContext, AppProvider() (+33 more)

### Community 1 - "Device Protocol Layer"
Cohesion: 0.05
Nodes (44): Frame Sequence Table (all E9xx codes), Heartbeat ACK Requirement (3 misses = reboot), IMEI→CardID→BinID Mapping (867105074732545→26042400P101→HS-001), Step 3: Automated Backend Frame Handlers, Alerts capped at 50 entries, Status Priority: offline > fault > full > warning > online, data_len-based frame parsing (not 0x0D search), Frames capped at 1000 entries (+36 more)

### Community 2 - "TCP Socket Server"
Cohesion: 0.08
Nodes (33): main() backend entrypoint, TCP_PORT env config (8078), Inverted-polarity status bits (0=active fault/open), DB init script (runs schema.sql), main(), log(), decodeFrame(), E9xx Binary Frame Protocol (+25 more)

### Community 3 - "PostgreSQL Backend"
Cohesion: 0.08
Nodes (28): createApiRouter(), GET /reports/fleet, GET|POST /maintenance, POST /bins/:id/command (compact/acknowledge/diagnostics), POST /public/report (citizen fault reports), get(), post(), Bin ID scheme (HS-001 to HS-008) (+20 more)

### Community 4 - "Fleet Dashboard UI"
Cohesion: 0.1
Nodes (20): BinDetail(), Event Log (real events from /reports/bins/:id), API Endpoint: GET /maintenance, API Endpoint: GET /public/reports, API Endpoint: GET /reports/alerts, API Endpoint: GET /reports/bins/:id, API Endpoint: GET /reports/export, BinDetail E2E Test Suite (+12 more)

### Community 5 - "Bin State & Store"
Cohesion: 0.1
Nodes (27): buildAckFrame(), buildCompactCommandFrame(), buildDiagnosticsRequestFrame(), buildDoorUnlockFrame(), buildHeartbeatFrame(), buildResetCommandFrame(), deriveStatus(), FAULT_CODES (+19 more)

### Community 6 - "Device Registry"
Cohesion: 0.11
Nodes (23): App(), AppShell(), LandingOrRedirect(), AuthContext, AuthProvider(), loadUser(), useAuth(), USERS credential map (+15 more)

### Community 7 - "Simulation Engine"
Cohesion: 0.09
Nodes (28): Favicon Cyan Accent Color (#47bfff), Favicon Glowing Blur Gradient Overlay Effect, Favicon Lightning Bolt / Flash Shape, Favicon Primary Purple Brand Color (#863bff), HandsOn Brand Identity Logo (PNG), HandsOn PNG Logo Hand Gesture Icon (pointing/cursor hand), HandsOn PNG Logo Sky Blue Color (#29ABE2), HandsOn PNG Logo 'handson' Bold Rounded Wordmark (+20 more)

### Community 8 - "Route Optimisation"
Cohesion: 0.11
Nodes (19): ArcGauge(), fillColor(), statusMap, batteryBar(), BotMsg(), ChatBot(), fillBar(), now() (+11 more)

### Community 9 - "WebSocket Data Flow"
Cohesion: 0.19
Nodes (15): CO2 Savings Calculation (vs fixed schedule baseline), computeRouteMetrics(), fixedScheduleDistance(), formatDuration(), hasValidCoords(), haversine(), nearestNeighbour(), routeDistance() (+7 more)

### Community 10 - "Auth & Access Control"
Cohesion: 0.18
Nodes (11): E9xx Binary Frame Protocol (shared protocol layer), HY-CKX1 Smart Bin IoT Device, TCP Port 8078 (device ingress), GCP Firewall Config (port 8078), getLanIP() local IP detector, DNS Spoof Server (Dns2), Spoof target: recycle4g.lxhsoft.com, Upstream DNS fallback (8.8.8.8) (+3 more)

### Community 11 - "Map & Geolocation"
Cohesion: 0.18
Nodes (12): Step 1: Update Device TCP IP to LAN IP, Device LCD Configuration Steps, Critical Blocker: GCP Firewall Rule TCP 8078 Missing, Static IP 130.211.208.47, Step 1: Reserve Static Public IP on GCP, Step 2: Configure GCP Firewall Access (TCP 8078), Step 3: Update Device TCP IP to Static Public IP, GCP Console Firewall Creation Steps (+4 more)

### Community 12 - "Brand & Visual Assets"
Cohesion: 0.22
Nodes (4): Probe(), wrap(), ErrorBoundary, WithErrorBoundary()

### Community 13 - "Telemetry Frame Log"
Cohesion: 0.25
Nodes (2): buildFrame(), sendAck()

### Community 14 - "Reports & Analytics"
Cohesion: 0.22
Nodes (9): GET /api/alerts Integration Test, API Integration Test Suite, GET /api/bins Integration Test (with filters), POST /api/bins/:id/command Integration Test, GET /api/health Integration Test, GET /api/stats Integration Test, GET /api/telemetry Integration Test, Server API Router (createApiRouter) (+1 more)

### Community 15 - "Maintenance Tracking"
Cohesion: 0.7
Nodes (4): CardSkeleton(), KpiSkeleton(), Shimmer(), TableSkeleton()

### Community 16 - "E2E Test Suites"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Unit Tests"
Cohesion: 0.5
Nodes (4): Backend Ports (8078 TCP, 8765 WS, 3001 HTTP), System Architecture (Device→GCP→React), System Architecture (full-stack vs production backend), Production Backend (TCP → PostgreSQL, no in-memory state)

### Community 18 - "Deployment & Infra"
Cohesion: 0.5
Nodes (4): Fill Color Thresholds (blue<70, amber 70-89, red 90+), data/bins.js module (fillColor, statusMap), fillColor() test suite, statusMap test suite

### Community 19 - "Build Configuration"
Cohesion: 0.67
Nodes (2): create_firewall_rule(), Create a firewall rule allowing TCP 8078

### Community 20 - "Module Group 20"
Cohesion: 0.67
Nodes (0): 

### Community 21 - "Module Group 21"
Cohesion: 0.67
Nodes (2): PublicReport(), POST /public/report API Endpoint

### Community 22 - "Module Group 22"
Cohesion: 0.67
Nodes (3): Documentation Icon (code/file symbol in purple), Icons Purple Accent Stroke Style (#aa3bff) for feature icons, Social Profile / User Community Icon (purple)

### Community 23 - "Module Group 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Module Group 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Module Group 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Module Group 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Module Group 27"
Cohesion: 1.0
Nodes (2): Tailwind Config (HandsOn brand tokens), HandsOn Blue (#29ABE2) design token

### Community 28 - "Module Group 28"
Cohesion: 1.0
Nodes (2): Vite Config (React plugin), Vitest Config (jsdom + coverage)

### Community 29 - "Module Group 29"
Cohesion: 1.0
Nodes (2): .env Configuration File, Environment Variables (server + backend + frontend)

### Community 30 - "Module Group 30"
Cohesion: 1.0
Nodes (2): Dashboard Verification Steps, Frontend Pages (routes list)

### Community 31 - "Module Group 31"
Cohesion: 1.0
Nodes (2): Expected Connection Sequence (frame-by-frame), Handshake Frame Hex (E9 00 0F + IMEI)

### Community 32 - "Module Group 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Module Group 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Module Group 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Module Group 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Module Group 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Module Group 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Module Group 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Module Group 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Module Group 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Module Group 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Module Group 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Module Group 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Module Group 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Module Group 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Module Group 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Module Group 47"
Cohesion: 1.0
Nodes (1): ESLint Config (React + Hooks)

### Community 48 - "Module Group 48"
Cohesion: 1.0
Nodes (1): PostCSS Config

### Community 49 - "Module Group 49"
Cohesion: 1.0
Nodes (1): GET /bins (filter by status/fill)

### Community 50 - "Module Group 50"
Cohesion: 1.0
Nodes (1): GET /alerts

### Community 51 - "Module Group 51"
Cohesion: 1.0
Nodes (1): GET /telemetry (frame log)

### Community 52 - "Module Group 52"
Cohesion: 1.0
Nodes (1): GET /reports/export (CSV + JSON)

### Community 53 - "Module Group 53"
Cohesion: 1.0
Nodes (1): GET /api/device/status (LAN IPs + connected devices)

### Community 54 - "Module Group 54"
Cohesion: 1.0
Nodes (1): getStats

### Community 55 - "Module Group 55"
Cohesion: 1.0
Nodes (1): addMaintenanceLog

### Community 56 - "Module Group 56"
Cohesion: 1.0
Nodes (1): addPublicReport

### Community 57 - "Module Group 57"
Cohesion: 1.0
Nodes (1): addComment

### Community 58 - "Module Group 58"
Cohesion: 1.0
Nodes (1): REAL_DEVICE

### Community 59 - "Module Group 59"
Cohesion: 1.0
Nodes (1): FRAME_CATALOG

### Community 60 - "Module Group 60"
Cohesion: 1.0
Nodes (1): ALERT_TYPES

### Community 61 - "Module Group 61"
Cohesion: 1.0
Nodes (1): WEEK_DATA

### Community 62 - "Module Group 62"
Cohesion: 1.0
Nodes (1): Probe Component (test helper)

### Community 63 - "Module Group 63"
Cohesion: 1.0
Nodes (1): Step 2: Monitor Server Logs for Connection Flow

### Community 64 - "Module Group 64"
Cohesion: 1.0
Nodes (1): Optional: Datadog Integration for Frame Forwarding

### Community 65 - "Module Group 65"
Cohesion: 1.0
Nodes (1): Advanced: DNS Name for Static IP

### Community 66 - "Module Group 66"
Cohesion: 1.0
Nodes (1): Verification Checklist (4 checks)

### Community 67 - "Module Group 67"
Cohesion: 1.0
Nodes (1): REST API Reference

### Community 68 - "Module Group 68"
Cohesion: 1.0
Nodes (1): Quick Start (local dev)

## Knowledge Gaps
- **134 isolated node(s):** `Create a firewall rule allowing TCP 8078`, `ESLint Config (React + Hooks)`, `log() color logger`, `Playwright E2E Config`, `PostCSS Config` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Module Group 23`** (2 nodes): `resolveDevice()`, `device-registry.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 24`** (2 nodes): `getLanIP()`, `dns-spoof.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 25`** (2 nodes): `BIN()`, `routing.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 26`** (2 nodes): `makeBin()`, `simulator.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 27`** (2 nodes): `Tailwind Config (HandsOn brand tokens)`, `HandsOn Blue (#29ABE2) design token`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 28`** (2 nodes): `Vite Config (React plugin)`, `Vitest Config (jsdom + coverage)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 29`** (2 nodes): `.env Configuration File`, `Environment Variables (server + backend + frontend)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 30`** (2 nodes): `Dashboard Verification Steps`, `Frontend Pages (routes list)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 31`** (2 nodes): `Expected Connection Sequence (frame-by-frame)`, `Handshake Frame Hex (E9 00 0F + IMEI)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 32`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 33`** (1 nodes): `playwright.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 34`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 35`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 36`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 37`** (1 nodes): `vitest.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 38`** (1 nodes): `init.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 39`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 40`** (1 nodes): `dashboard.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 41`** (1 nodes): `fleet.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 42`** (1 nodes): `navigation.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 43`** (1 nodes): `components.test.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 44`** (1 nodes): `device-bridge.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 45`** (1 nodes): `store.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 46`** (1 nodes): `utils.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 47`** (1 nodes): `ESLint Config (React + Hooks)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 48`** (1 nodes): `PostCSS Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 49`** (1 nodes): `GET /bins (filter by status/fill)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 50`** (1 nodes): `GET /alerts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 51`** (1 nodes): `GET /telemetry (frame log)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 52`** (1 nodes): `GET /reports/export (CSV + JSON)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 53`** (1 nodes): `GET /api/device/status (LAN IPs + connected devices)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 54`** (1 nodes): `getStats`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 55`** (1 nodes): `addMaintenanceLog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 56`** (1 nodes): `addPublicReport`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 57`** (1 nodes): `addComment`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 58`** (1 nodes): `REAL_DEVICE`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 59`** (1 nodes): `FRAME_CATALOG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 60`** (1 nodes): `ALERT_TYPES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 61`** (1 nodes): `WEEK_DATA`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 62`** (1 nodes): `Probe Component (test helper)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 63`** (1 nodes): `Step 2: Monitor Server Logs for Connection Flow`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 64`** (1 nodes): `Optional: Datadog Integration for Frame Forwarding`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 65`** (1 nodes): `Advanced: DNS Name for Static IP`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 66`** (1 nodes): `Verification Checklist (4 checks)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 67`** (1 nodes): `REST API Reference`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 68`** (1 nodes): `Quick Start (local dev)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useApp()` connect `Alert Management` to `Route Optimisation`, `Fleet Dashboard UI`, `Brand & Visual Assets`, `Device Registry`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `Routes()` connect `Alert Management` to `WebSocket Data Flow`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `formatDuration()` connect `WebSocket Data Flow` to `Alert Management`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `useApp()` (e.g. with `Alerts()` and `Analytics()`) actually correct?**
  _`useApp()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `AppContext (useApp hook — bins, alerts, frames, connectedDevices, sendCommand)` (e.g. with `useWebSocket()` and `useApi()`) actually correct?**
  _`AppContext (useApp hook — bins, alerts, frames, connectedDevices, sendCommand)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `fillColor()` (e.g. with `processQuery()` and `BarTooltip()`) actually correct?**
  _`fillColor()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `useApi()` (e.g. with `Server API Router (createApiRouter)` and `AppContext (useApp hook — bins, alerts, frames, connectedDevices, sendCommand)`) actually correct?**
  _`useApi()` has 2 INFERRED edges - model-reasoned connections that need verification._