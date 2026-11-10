# PRALEYE: System Requirements, Dependencies & Instant-Run Guide

---

## 1. Zero-Friction Portability Design
Praleye is engineered so that after cloning from GitHub, **there are zero paid API keys required, zero external database servers strictly needed, and minimal package overhead**.

### Minimum Host Prerequisites
* **Node.js**: `v18.18+` or `v20+` (for the React + Vite + MapLibre GL frontend)
* **Python**: `v3.10+`, `v3.11+`, or `v3.12+` (for the FastAPI + Analytics + OSINT Scraper backend)
* **Ollama (Optional but Recommended)**: For local GPU/CPU LLM inference (`ollama pull llama3.2:3b`). If not installed, Praleye's built-in Tactical Rule-Based Synthesizer runs automatically so no feature breaks.

---

## 2. Backend Python Dependencies (`backend/requirements.txt`)
Kept intentionally lean using fast, pre-compiled wheel packages (`pydantic`, `fastapi`, `httpx`, `beautifulsoup4`, `feedparser`) so installation completes in under 25 seconds on any laptop:

~~~txt
# Core API & Async Runtime
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.9.2
pydantic-settings==2.5.2
python-dotenv==1.0.1
websockets==13.1

# Zero-Config Database & Caching
sqlalchemy==2.0.35
aiosqlite==0.20.0
diskcache==5.6.3

# Weather, Geo & OSINT Web/Social Scraping (100% Free)
httpx==0.27.2
feedparser==6.0.11
beautifulsoup4==4.12.3
lxml==5.3.0
trafilatura==1.12.2
ntscraper==0.3.16

# Scientific Computing, Prediction & Triage Optimization
numpy==2.1.1

# Testing Suite
pytest==8.3.3
pytest-asyncio==0.24.0
~~~

---

## 3. Frontend Dependencies (`frontend/package.json`)
Uses lightweight, hardware-accelerated WebGL mapping without requiring a paid Mapbox token (`maplibre-gl` + free OpenFreeMap / CARTO Dark Matter vector tiles + AWS Terrain tiles):

~~~json
{
  "name": "praleye-tactical-ui",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173 --host",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "maplibre-gl": "^4.7.1",
    "@deck.gl/core": "^9.0.31",
    "@deck.gl/layers": "^9.0.31",
    "@deck.gl/aggregation-layers": "^9.0.31",
    "@deck.gl/mapbox": "^9.0.31",
    "zustand": "^5.0.0",
    "lucide-react": "^0.453.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.6.2",
    "vite": "^5.4.8",
    "vitest": "^2.1.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.5.0",
    "jsdom": "^25.0.1",
    "tailwindcss": "^3.4.13",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20"
  }
}
~~~

---

## 4. Instant-Run Commands (After GitHub Clone)
Antigravity must configure the root `package.json` and `Makefile` so the user can launch the entire platform with a single command:

### Option A: Native Instant Start (Fastest, Zero Docker Required)
~~~bash
# 1. Copy the environment template file (works out of the box with zero edits)
cp example.env .env

# 2. One-time automatic setup (creates Python venv, installs backend & frontend deps, seeds India database)
npm run setup

# 3. Start Praleye Backend (Port 8000) + Frontend (Port 5173) concurrently
npm run dev
~~~

### Option B: Run All Unit Tests (Backend + Frontend)
~~~bash
npm run test
~~~

### Option C: Docker Compose One-Liner (Optional)
~~~bash
docker compose up --build
~~~