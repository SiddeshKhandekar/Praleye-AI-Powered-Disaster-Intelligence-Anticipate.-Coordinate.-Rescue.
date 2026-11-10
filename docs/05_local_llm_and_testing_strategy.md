# PRALEYE: Local LLM Military Intelligence, High-Realism Features & Testing Strategy
## Document 05: Air-Gapped AI SITREPs, Launch-Grade Concepts & Unit Test Suite

---

## 1. Local LLM Integration for Government & Military (`modules/local_llm`)
To satisfy Requirement 8, Praleye integrates a **$100\%$ Local Large Language Model** via **Ollama** (`llama3.2:3b` or `qwen2.5:7b-instruct`) so sensitive national infrastructure, hospital vulnerabilities, and military HADR deployment data never leave government servers.

### 1.1 Architecture & Zero-Failure Fallback
* **Primary Engine**: Connects asynchronously to `OLLAMA_BASE_URL` (`http://localhost:11434/api/generate` & `/api/chat`).
* **Real-Time RAG Context Injection (`rag_context_builder.py`)**: Before answering any query or generating a summary, Praleye compiles a structured JSON snapshot of:
  1. Top 10 highest-risk Indian districts and their active weather drivers.
  2. Active verified OSINT SOS clusters and estimated stranded civilian counts.
  3. Current deployment positions of Army HADR columns, NDRF teams, and Fire units.
  4. Regional ICU/Trauma bed saturation percentages and low-oxygen hospitals.
* **Resilient Tactical Synthesizer Fallback**: If a developer or evaluator runs Praleye on a lightweight laptop without Ollama running, `sitrep_generator.py` automatically detects the connection refusal and uses a deterministic **Military Briefing Template Engine** driven by the exact same live database metrics—ensuring the UI never shows a broken error screen.

### 1.2 Automated Daily All-India Military & Government SITREP
Generates a formal **Ministry of Home Affairs (MHA) / Integrated Defence Staff (IDS) Daily Disaster Intelligence Summary** structured into:
1. **EXECUTIVE THREAT ASSESSMENT (NEXT 24–72 HOURS)**: Macro meteorological & seismic outlook across Indian theatres.
2. **PRIORITY ZONES REQUIRING PRE-POSITIONING**: Specific districts where NDRF/Army Engineering Task Forces should be pre-deployed before roads are cut off.
3. **ACTIVE OSINT RESCUE HOTSPOTS**: Summary of scraped civilian distress clusters.
4. **MEDICAL & LOGISTICS BOTTLENECKS**: Hospitals approaching $>90\%$ ICU saturation or $<12\text{h}$ oxygen supply.

---

## 2. Launch-Grade Realistic Features & Concepts (Requirement 11)
To elevate Praleye from a standard prototype into the most realistic, launch-ready national disaster platform, Antigravity will implement these five high-impact innovations:

1. **Offline-First Citizen SOS Beacon with Acoustic & Mesh Fallback Simulation**:
   * In real disasters, cell towers fail first. Praleye includes a **"Citizen Low-Bandwidth / Offline SOS Mode"** that compresses an SOS payload (GPS + Headcount + Medical need + Battery $\%$) into a tiny $140\text{-byte}$ base64 string for SMS/LoRa/Satellite relay, plus a high-decibel **Web Audio API Ultrasonic/Morse Distress Siren** ($2800\text{ Hz}$ pulsing tone) so rescue teams can locate trapped victims under rubble using audio.
2. **Critical Infrastructure Cascade Simulator (Power Grid, Telecom & Dam Spillways)**:
   * Models secondary cascading failures: e.g., when river discharge at a major Indian dam (Tehri, Hirakud, Bhakra, Mullaperiyar, Idukki) crosses $90\%$ capacity, Praleye simulates downstream inundation polygons and flags electrical substations and hospitals at risk of blackout.
3. **Golden-Hour Airlift (CASEVAC) Helipad & Weather Ceiling Validator**:
   * For the Indian Air Force / Army Aviation Corps view, Praleye cross-references hospital helipad coordinates with live local wind gusts ($V_{\text{gust}} < 55\text{ km/h}$) and visibility to show whether helicopter evacuation is currently `GREEN (FLYABLE)`, `AMBER (INSTRUMENT ONLY)`, or `RED (GROUNDED - USE ROAD/BOAT)`.
4. **Crowdsourced Photo/Post Verification Score (Anti-Fake-News Filter)**:
   * Disasters on social media are plagued by recycled old videos. Praleye's OSINT scraper cross-checks scraped social media claims against actual physical weather/seismic telemetry at those coordinates. If a viral post claims a flood in a district with $0\text{ mm}$ rainfall and normal river discharge, Praleye flags it as `UNVERIFIED / POTENTIAL MISINFORMATION` so rescue forces aren't misdirected.
5. **Time-Machine Disaster Replay & Drill Simulator**:
   * Allows NDMA or Military commanders to inject simulated historical or hypothetical mega-disasters (e.g., *Category-5 Odisha Super Cyclone*, *Magnitude 7.8 Mandi/Himalayan Earthquake*, *Chennai 400mm Cloudburst*) to stress-test hospital bed auto-allocation and department response times.

---

## 3. Comprehensive Automated Testing Strategy
Antigravity must generate and execute unit tests for every module before marking any phase complete.

### 3.1 Backend Unit & Integration Tests (`pytest`)
Run via `pytest backend/tests/ -v`:
1. `test_weather_ingestion.py`: Verifies Open-Meteo, USGS, and GDACS response parsing, schema validation, and graceful fallback when offline.
2. `test_prediction_engine.py`: Tests mathematical boundary conditions ($0 \le P_d \le 100$) for Flood, Landslide, Cyclone, Seismic, and Wet-Bulb Heatwave models using known Indian extreme weather vectors.
3. `test_osint_geo_ner.py`: Tests extraction of Indian states, districts, landmarks, and 6-digit pincodes from messy Hinglish/English distress tweets and verifies urgency scoring $U_{\text{sos}}$.
4. `test_auto_bed_allocator.py`:
   * Tests single-hospital assignment when sufficient beds exist.
   * Tests automatic multi-hospital batch splitting when casualty count exceeds the nearest hospital's vacancy.
   * Tests automatic exclusion of hospitals with $< 4\text{ hours}$ oxygen or `DAMAGED_EVACUATING` status.
5. `test_alert_multilingual.py`: Validates ITU CAP v1.2 XML schema generation and multilingual translation across all 11 Indian languages.
6. `test_local_llm_sitrep.py`: Tests RAG context compilation and verifies that the SITREP endpoint returns a valid structured military briefing both when Ollama is active and when the offline fallback synthesizer is triggered.

### 3.2 Frontend Component & State Tests (`vitest`)
Run via `npm --prefix frontend run test`:
1. `TopFilterSearchBar.test.tsx`: Verifies geocoding search input, debounce, and hazard layer toggle state updates.
2. `BottomModeSwitcher.test.tsx`: Verifies switching between the 4 operational modes updates the global Zustand store and active Deck.gl map layers.
3. `AutoBedTriageUI.test.tsx`: Verifies emergency casualty submission and live bed counter updates in the Hospital Dashboard.
4. `VoiceCommandService.test.ts`: Tests voice command intent parsing for navigation, mode switching, and multilingual TTS triggers.