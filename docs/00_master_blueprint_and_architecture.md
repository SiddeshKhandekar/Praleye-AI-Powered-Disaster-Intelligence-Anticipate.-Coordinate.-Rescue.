# PRALEYE: National Disaster Intelligence, Prediction & Tactical Response Platform
## Document 00: Master Blueprint, Modular Architecture & Execution Plan for Antigravity

---

## 1. Executive Vision
**Praleye** (derived from *Pralay* [Catastrophe] + *Eye* [Omniscient Surveillance]) is a map-first, real-time disaster prediction, OSINT rescue tracking, inter-departmental command, and automated medical triage platform tailored for the Republic of India.

Designed for the National Disaster Management Authority (NDMA), Indian Armed Forces, NDRF, Fire Services, State Relief Commissioners, Major Hospital Networks, and Citizens, Praleye operates across the entire disaster lifecycle:
1. **Pre-Disaster (Predictive Intelligence & Early Warning)**: Real-time ingestion of free meteorological, hydrological, and seismic telemetry to compute localized hazard probabilities, determine safe zones, and broadcast multilingual mass alerts (CAP/SMS/Voice) aligned with NDMA's SACHET (CAP v1.2) standard.
2. **During-Disaster (OSINT Rescue & Tactical Command)**: Live web and social media scraping to geolocate trapped citizens, coordinate military/NDRF/fire units on a unified WebGL tactical map, and generate Local LLM Situation Reports (SITREPs).
3. **Post-Disaster (Automated Medical Triage & Relief)**: Real-time tracking of a nationwide hospital network with an automated constraint-solving bed assignment engine, relief camp management, and supply chain routing.

---

## 2. "Instant-Run" Portable Architecture Principle
To guarantee that anyone cloning the Praleye repository from GitHub can run the project almost instantly on any device with minimal installation friction, Praleye uses a **Zero-Config Portable Hybrid Architecture**:

* **Database Layer**: Uses **SQLite in WAL (Write-Ahead Logging) mode with R-Tree Spatial Indexing** as the default zero-config database (stored locally in `data/praleye.db`, auto-seeded on first boot with Indian states, districts, safe zones, and the national hospital network). It transparently upgrades to **PostgreSQL + PostGIS** via environment variables when deployed in production.
* **Cache & Pub/Sub Layer**: Uses an **In-Memory Event Bus + Disk-Backed Cache (`diskcache`)** out-of-the-box so Redis is not strictly required for local execution, while supporting standard `REDIS_URL` in Docker/production.
* **AI Layer**: Connects automatically to a local **Ollama** instance (`http://localhost:11434`), and includes a deterministic **Rule-Based Tactical Fallback Synthesizer** if the host machine lacks a GPU or has not started Ollama yet.
* **Single-Command Startup**: A root `Makefile` and `package.json` orchestrate both the FastAPI Python backend and the React/Vite Map-First frontend concurrently.

---

## 3. Complete Monorepo File Architecture
Antigravity must strictly adhere to this modular directory structure. Every domain is isolated into self-contained sub-modules with explicit interfaces and unit tests so changes in one module never break another.

~~~text
praleye/
├── example.env                           # Zero-config working environment template
├── .gitignore
├── Makefile                              # Instant-run orchestration commands
├── package.json                          # Root workspace runner (concurrently runs UI + API)
├── docker-compose.yml                    # Optional 1-click container stack (App + Ollama)
├── README.md                             # Quickstart & architecture overview
│
├── docs/                                 # Master specifications for Antigravity
│   ├── 00_MASTER_BLUEPRINT_AND_ARCHITECTURE.md
│   ├── 01_DATA_INGESTION_AND_PREDICTION_ENGINE.md
│   ├── 02_OSINT_WEB_AND_SOCIAL_SCRAPING.md
│   ├── 03_UI_UX_MAP_FIRST_DESIGN_SYSTEM.md
│   ├── 04_HOSPITAL_TRIAGE_AND_DASHBOARDS.md
│   ├── 05_LOCAL_LLM_AND_TESTING_STRATEGY.md
│   └── requirements.md
│
├── backend/                              # Python 3.11+ FastAPI Modular Backend
│   ├── pyproject.toml                    # Poetry / uv / pip dependencies
│   ├── requirements.txt                  # Pinned lightweight dependencies
│   ├── main.py                           # FastAPI entry point, lifespan & WebSocket mount
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                     # Pydantic Settings (env loader)
│   │   ├── database.py                   # Async SQLAlchemy (SQLite WAL / PostGIS)
│   │   ├── event_bus.py                  # WebSocket broadcast & in-memory pub/sub
│   │   ├── security.py                   # RBAC roles (Admin, Military, NDRF, Hospital, Public)
│   │   └── exceptions.py                 # Standardized error handlers
│   │
│   ├── seed/                             # Auto-seeding data on first boot
│   │   ├── __init__.py
│   │   ├── india_districts_geojson.json  # Key Indian states/districts & flood/seismic zones
│   │   ├── hospitals_india_seed.json     # Hardcoded nationwide hospital network & chains
│   │   ├── safe_zones_seed.json          # Pre-vetted high-altitude/structural safe shelters
│   │   └── forces_units_seed.json        # NDRF battalions, Army columns, Fire stations
│   │
│   ├── modules/                          # Strictly decoupled domain submodules
│   │   ├── weather_ingestion/            # Requirement 1: Free real-time weather/hazard feeds
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── open_meteo_client.py      # Weather, precipitation, soil moisture, river discharge
│   │   │   ├── usgs_ncs_seismic.py       # Real-time earthquake feeds (India region bounding box)
│   │   │   ├── nasa_firms_gdacs.py       # Satellite thermal anomalies & GDACS cyclone feeds
│   │   │   └── imd_cwc_rss.py            # IMD warnings & Central Water Commission flood RSS
│   │   │
│   │   ├── prediction_engine/            # Requirement 2: Custom analytics & hazard probability
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── hazard_calculator.py      # Mathematical models for Flood, Cyclone, Landslide, Heatwave
│   │   │   ├── safe_zone_locator.py      # Elevation & proximity safe-zone recommender
│   │   │   └── anomaly_detector.py       # Z-score & rate-of-change spike detector
│   │   │
│   │   ├── osint_scraper/                # Requirement 5: Free web & social media scraping
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── social_harvester.py       # Nitter/ntscraper, Reddit JSON, Telegram public scraper
│   │   │   ├── news_rss_crawler.py       # GDELT Doc API + Google News India RSS + Trafilatura
│   │   │   ├── geo_ner_locator.py        # NLP Indian toponym & pincode extractor -> Lat/Lng
│   │   │   └── sos_classifier.py         # Urgency scoring & deduplication of trapped victims
│   │   │
│   │   ├── alert_comms/                  # Requirement 3 & 7: Pre-disaster alerts & Multilingual
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── cap_xml_generator.py      # ITU Common Alerting Protocol (CAP v1.2) generator
│   │   │   ├── sms_gateway.py            # Fast2SMS / Twilio / Simulated Telecom Cell Broadcast
│   │   │   └── multilingual_engine.py    # 11 Indian languages translation & TTS script builder
│   │   │
│   │   ├── medical_triage/               # Requirement 9: Hospital network & auto bed assignment
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── hospital_registry.py      # CRUD & live telemetry for Hospital Chains & Govt Hospitals
│   │   │   └── auto_bed_allocator.py     # Multi-variable constraint solver for emergency bed assignment
│   │   │
│   │   ├── command_dashboards/           # Requirement 10: Admin, Military/NDRF/Fire, Hospital views
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── force_deployment.py       # Army/NDRF/Fire Brigade unit dispatch & mission logs
│   │   │   └── relief_logistics.py       # Post-disaster ration, water, medicine & camp tracker
│   │   │
│   │   └── local_llm/                    # Requirement 8: Local LLM for Military/Gov SITREPs
│   │       ├── __init__.py
│   │       ├── router.py
│   │       ├── schemas.py
│   │       ├── ollama_client.py          # Async streaming wrapper for local Ollama API
│   │       ├── sitrep_generator.py       # Daily All-India Military/Gov summary compiler
│   │       └── rag_context_builder.py    # Injects live weather, SOS & hospital state into LLM prompt
│   │
│   └── tests/                            # Comprehensive Pytest Unit & Integration Suite
│       ├── conftest.py
│       ├── test_weather_ingestion.py
│       ├── test_prediction_engine.py
│       ├── test_osint_geo_ner.py
│       ├── test_auto_bed_allocator.py
│       ├── test_alert_multilingual.py
│       └── test_local_llm_sitrep.py
│
└── frontend/                             # React 18 + TypeScript + Vite + MapLibre GL + Deck.gl
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── styles/
    │   │   └── tactical-hud.css          # Requirement 6: Bespoke human-crafted GIS/Command styling
    │   ├── types/
    │   │   └── praleye.types.ts          # Strict TypeScript interfaces mirroring backend schemas
    │   ├── store/
    │   │   └── usePraleyeStore.ts        # Zustand global state (Map viewport, Mode, Active Role, Filters)
    │   ├── services/
    │   │   ├── apiClient.ts              # Axios/Fetch client with automatic fallback
    │   │   ├── socketClient.ts           # Real-time WebSocket telemetry listener
    │   │   └── voiceCommandService.ts    # Requirement 7: Web Speech API + Multilingual TTS/STT
    │   │
    │   ├── components/
    │   │   ├── map/                      # Requirement 4: Map-First Core Canvas
    │   │   │   ├── TacticalMapCanvas.tsx # MapLibre GL + Deck.gl multi-layer canvas
    │   │   │   ├── layers/
    │   │   │   │   ├── WeatherRiskLayer.tsx
    │   │   │   │   ├── LiveSosClusterLayer.tsx
    │   │   │   │   ├── SafeZonesRouteLayer.tsx
    │   │   │   │   ├── HospitalNetworkLayer.tsx
    │   │   │   │   └── ForceUnitsLayer.tsx
    │   │   │   └── MapPopupCard.tsx
    │   │   │
    │   │   ├── hud/                      # Requirement 4: 4-Edge Peripheral Navigation Frame
    │   │   │   ├── TopFilterSearchBar.tsx    # Top Strip: Geocoding Search + Hazard Layer Toggles
    │   │   │   ├── BottomModeSwitcher.tsx    # Bottom Strip: 4 Operational Modes + Time Scrubber
    │   │   │   ├── LeftCategoryDock.tsx      # Left Dock: Menu, RBAC Dashboards & Category Selectors
    │   │   │   └── RightDepthInspector.tsx   # Right Drawer: Deep Analytics, LLM Chat, Triage & SOS Feed
    │   │   │
    │   │   ├── dashboards/               # Requirement 10: Role-Specific Overlay/Split Dashboards
    │   │   │   ├── AdminControlDashboard.tsx
    │   │   │   ├── GovForcesDashboard.tsx    # Army / NDRF / Fire Brigade / Police
    │   │   │   └── HospitalCommandView.tsx   # Individual Hospital & Chain-wide Matrix
    │   │   │
    │   │   └── modals/
    │   │       ├── BroadcastAlertModal.tsx   # CAP/SMS Multilingual Evacuation Trigger
    │   │       ├── EmergencyBedAssignModal.tsx
    │   │       └── MilitarySitrepModal.tsx
    │   │
    │   └── __tests__/                    # Vitest + React Testing Library unit tests
    │       ├── TopFilterSearchBar.test.tsx
    │       ├── BottomModeSwitcher.test.tsx
    │       ├── AutoBedTriageUI.test.tsx
    │       └── VoiceCommandService.test.ts
~~~

---

## 4. Antigravity Phased Execution Order
To ensure zero broken builds and $100\%$ test coverage during autonomous code generation, Antigravity must build the system in the following strict sequence:

1. **Phase 1: Core Foundation & Seed Data**
   * Initialize `backend/core/` (Config, SQLite database with spatial helpers, Event Bus) and `backend/seed/` (Indian districts, hardcoded hospital network, safe zones, defense units).
   * Write and pass database seeding unit tests.
2. **Phase 2: Weather Ingestion & Prediction Engine**
   * Implement `modules/weather_ingestion` and `modules/prediction_engine`.
   * Run `pytest backend/tests/test_prediction_engine.py` to validate risk probability formulas.
3. **Phase 3: OSINT Web & Social Media Scraper + Geo-NER**
   * Implement `modules/osint_scraper` with resilient fallback feeds so rate limits never crash the app.
   * Validate location extraction on Indian cities, states, and pincodes via `test_osint_geo_ner.py`.
4. **Phase 4: Hospital Network, Automated Triage & Command Modules**
   * Implement `modules/medical_triage`, `modules/command_dashboards`, `modules/alert_comms`, and `modules/local_llm`.
   * Verify the automated bed assignment optimization algorithm via `test_auto_bed_allocator.py`.
5. **Phase 5: Map-First Frontend & 4-Edge HUD**
   * Build the MapLibre GL JS + Deck.gl canvas and the 4-edge layout (`TopFilterSearchBar`, `BottomModeSwitcher`, `LeftCategoryDock`, `RightDepthInspector`).
   * Connect Multilingual Voice Actions and Role Dashboards.
   * Run Frontend Vitest unit suite and full system smoke test.