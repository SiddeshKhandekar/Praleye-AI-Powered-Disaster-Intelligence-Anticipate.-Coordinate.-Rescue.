# PRALEYE: Map-First UI/UX Design System, 4-Edge HUD & Multilingual Voice
## Document 03: Human-Crafted Tactical Interface & Voice Command Architecture

---

## 1. Anti-AI-Cliché Design Philosophy & Real-World References
To ensure Praleye looks like a bespoke, human-engineered mission-critical platform rather than a generic AI-generated template:
* **Strict Visual Prohibitions**:
  * **NO** purple/indigo SaaS gradients (`#6366f1` / `#8b5cf6`).
  * **NO** generic marketing hero sections, oversized rounded cards (`rounded-3xl`), or floating chatbot bubbles.
  * **NO** wasted whitespace around the map; the map occupies $100\text{vw} \times 100\text{vh}$ as the living tactical canvas.
* **Direct Architectural References**:
  1. **Windy.com**: Fluid particle overlays, intuitive bottom timeline & weather layer pills, compact color-scale legends.
  2. **Palantir Gotham / Foundry**: High-density dark obsidian slate panels, crisp $1\text{px}$ technical borders, tabular monospace telemetry, entity link graphs.
  3. **Flightradar24 / MarineTraffic**: Floating peripheral HUD bars, instant entity selection drawers, live coordinate/UTC/IST clocks.

### Color Palette & Typography Tokens (`tactical-hud.css`)
* **Canvas Background**: Deep Tactical Obsidian `#070A0F`
* **HUD Surface Glass**: `rgba(11, 16, 25, 0.88)` with `backdrop-filter: blur(12px)` and `1px solid rgba(255, 255, 255, 0.09)` border.
* **Semantic Hazard Tokens**:
  * **Nominal / Safe Zone**: Tactical Emerald `#10B981`
  * **Watch / Advisory**: Amber Gold `#F59E0B`
  * **Severe Warning**: Signal Orange `#F97316`
  * **Critical / Active SOS**: Crimson Alert `#EF4444`
  * **Hydrological / Flood**: Cyan Telemetry `#06B6D4`
* **Typography**:
  * **UI & Headers**: `'Plus Jakarta Sans'` or `'Inter'` (tight tracking, semi-bold uppercase micro-labels `10px` with `0.08em` letter-spacing).
  * **Coordinates, Metrics & Timestamps**: `'JetBrains Mono'` or `'IBM Plex Mono'` (`font-variant-numeric: tabular-nums`).

---

## 2. The 4-Edge Peripheral Map-First Viewport Layout (Requirement 4)
The entire application is structured around a full-screen interactive **MapLibre GL JS + Deck.gl** canvas surrounded by four precision-engineered HUD strips:

~~~text
+--------------------------------------------------------------------------------------------------+
| [PRALEYE] | [Search City, State, District, Pincode...] | [Weather][Flood][Seismic][SOS][Hospitals]| <- TOP STRIP
+-----------+--------------------------------------------------------------------------+-----------+
|           |                                                                          |           |
|  LEFT     |                                                                          |   RIGHT   |
|  CATEGORY |                                                                          |   DEPTH   |
|  DOCK     |                        100vw x 100vh INTERACTIVE                         | INSPECTOR |
|           |                       MAPLIBRE GL + DECK.GL CANVAS                       |  DRAWER   |
| - Role    |                                                                          |           |
|   Switch  |                     (3D Terrain, Hazard Polygons,                        | - Drill   |
| - Regions |                      Live Scraped SOS Beacons,                           |   Metrics |
| - Layers  |                      Safe Zones, Hospital Pins,                          | - Local   |
| - Forces  |                      Evacuation Routes, NDRF Units)                      |   LLM AI  |
| - Alerts  |                                                                          | - Triage  |
| - Voice   |                                                                          |   Queue   |
|           |                                                                          |           |
+-----------+--------------------------------------------------------------------------+-----------+
| [MODE 1: Pre-Disaster Predict] [MODE 2: Live OSINT Rescue] [MODE 3: Safe Zones] [MODE 4: Relief] | <- BOTTOM STRIP
+--------------------------------------------------------------------------------------------------+
~~~

### 2.1 Top Horizontal Strip (`TopFilterSearchBar.tsx`)
* **Left**: Praleye National Command Emblem + Live IST Clock (`UTC+05:30`) + Active NDMA Threat Level Badge.
* **Center-Left (Omnibox Search)**: Instant geocoding search supporting Indian States, Districts, Cities, Villages, 6-digit Pincodes, or raw coordinates (`Lat, Lng`). Selecting a result smoothly flies the map camera (`map.flyTo`) to that bounding box and loads local telemetry.
* **Center-Right (Map Layer Filter Pills)**: Multi-select toggle chips controlling what renders on the map:
  * `Precipitation & Wind` | `Flood Risk Grid` | `Seismic Epicenters` | `Scraped SOS Pins` | `Safe Shelters` | `Hospital Bed Status` | `NDRF/Army Units`.
* **Right**: Multilingual Selector (`EN`, `HI`, `TA`, `TE`, `BN`, `MR`, `ML`, `KN`, `GU`, `OR`, `PA`) + Hands-Free Voice Mic Trigger.

### 2.2 Bottom Horizontal Strip (`BottomModeSwitcher.tsx`)
Switches the operational mode of the **exact same geographic area** currently viewed on the map:
1. **Mode 1: Pre-Disaster Prediction & Early Warning**
   * Displays 72-hour predictive hazard probability polygons ($P_{\text{flood}}, P_{\text{cyclone}}, P_{\text{landslide}}, P_{\text{heat}}$), soil saturation, and river gauge trends. Includes a time-horizon scrubber ($+6\text{h}, +12\text{h}, +24\text{h}, +48\text{h}, +72\text{h}$).
2. **Mode 2: Live OSINT Crisis & SOS Rescue**
   * Displays real-time web/social media scraped distress beacons, spatial density clusters, verified trapped citizen counts, and active NDRF/Army/Fire rescue tracks.
3. **Mode 3: Safe Zones & Mass Evacuation**
   * Highlights structurally vetted safe shelters, remaining shelter capacities, OSRM safe evacuation corridors, and opens the CAP/SMS Mass Broadcast console.
4. **Mode 4: Post-Disaster Relief & Hospital Triage**
   * Renders the nationwide hospital network color-coded by ICU/Trauma bed availability, live ambulance/airlift routing vectors, automated bed assignment queue, and relief supply camps.

### 2.3 Left Vertical Dock (`LeftCategoryDock.tsx`)
* **RBAC View Switcher**: Switch between **Map Command HUD**, **Super Admin Dashboard**, **Gov/Army/NDRF/Fire Dashboard**, and **Hospital Network Dashboard**.
* **Category Selectors**:
  * *State/Zone Quick Jump* (Northern, North-Eastern, Eastern, Southern, Western, Central Commands).
  * *Hazard Category* (Hydrological, Meteorological, Seismic, Thermal, Biological/Medical).
  * *Department Filter* (Indian Army, IAF, Navy, NDRF, SDRF, Fire & Emergency, State Police).
  * *Hospital Tier Filter* (AIIMS/Central Govt, Military Command Hospitals, Apollo Chain, Fortis Chain, Manipal Chain, District Civil Hospitals).

### 2.4 Right Vertical Depth Drawer (`RightDepthInspector.tsx`)
Dynamically adapts its depth controls based on the Left Category selection, Bottom Mode, or clicked Map Entity:
* **Tab A: Contextual Telemetry & Depth Controls**: Adjust prediction sensitivity sliders, inspect district-level rainfall/river discharge hydrographs, and view safe-zone occupancy breakdowns.
* **Tab B: Live Scraped OSINT & Rescue Feed**: Real-time scrolling feed of geolocated social media/news SOS alerts with 1-click camera focus and rescue unit dispatch.
* **Tab C: Automated Hospital Bed Allocator**: Interactive triage dispatcher for incoming casualties showing hospital capacity bars and automatic optimal assignment.
* **Tab D: Local LLM Tactical Assistant & Daily Military SITREP**: Chat interface + 1-click "Generate All-India Defence & NDMA Daily Briefing" powered by local Ollama.

---

## 3. Multilingual Engine & Voice Actions (`voiceCommandService.ts` & `multilingual_engine.py`)
Requirement 7 mandates multilingual messaging and voice actions for high-stress command environments and diverse Indian citizens.

### 3.1 Supported Languages (11 Indian Languages)
English (`en-IN`), Hindi (`hi-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Bengali (`bn-IN`), Marathi (`mr-IN`), Malayalam (`ml-IN`), Kannada (`kn-IN`), Gujarati (`gu-IN`), Odia (`or-IN`), Punjabi (`pa-IN`).

### 3.2 Voice Action Commands (Speech-to-Intent)
Uses the browser's native `webkitSpeechRecognition` / `SpeechRecognition` API (configured with selected Indian locale, e.g., `hi-IN` or `en-IN`) coupled with a deterministic intent parser + Local LLM fallback:
* **Navigation Intents**: *"Zoom to Guwahati Assam"*, *"Show Chennai flood zone"*, *"चमोली उत्तराखंड दिखाओ"* -> Flies map camera to coordinates.
* **Mode Switching Intents**: *"Switch to rescue mode"*, *"Show hospital beds"*, *"Open safe zones"* -> Changes active Bottom Mode.
* **Triage Intents**: *"Assign 8 critical trauma patients in Kochi"* -> Triggers the Automated Bed Assignment modal and reads back the assigned hospitals via TTS.
* **Briefing Intents**: *"Read daily military summary in Hindi"* -> Translates the current SITREP and speaks it aloud using `window.speechSynthesis` (matching native Indian voices) or Bhashini TTS API.