# PRALEYE: Hospital Network, Auto-Bed Triage, Alerts & Multi-Role Dashboards
## Document 04: Post-Disaster Medical Automation, CAP/SMS Alerts & Department Views

---

## 1. Hardcoded National Hospital Network (`hospitals_india_seed.json`)
Praleye ships with a rich, pre-configured dataset of Indian hospitals spanning both **Government/Military Apex Institutions** and **Major Private Hospital Chains** across all major disaster-prone zones:

* **Government & Defense Network**:
  * AIIMS New Delhi, AIIMS Bhubaneswar, AIIMS Rishikesh, AIIMS Guwahati, AIIMS Jodhpur, AIIMS Patna.
  * Armed Forces Medical Services (Command Hospital Pune, Command Hospital Lucknow, Command Hospital Udhampur, INHS Asvini Mumbai).
  * Major State Government & Municipal Hospitals (KEM Hospital Mumbai, Rajiv Gandhi Govt General Hospital Chennai, SSKM Kolkata, Victoria Hospital Bengaluru, Osmania General Hospital Hyderabad, GMC Kozhikode).
* **Hospital Chains (`chain_id` grouped for Chain-level & Individual Dashboards)**:
  * **Apollo Hospitals Enterprise** (Apollo Greams Road Chennai, Indraprastha Apollo Delhi, Apollo Gleneagles Kolkata, Apollo Jubilee Hills Hyderabad, Apollo Guwahati).
  * **Fortis Healthcare Network** (Fortis Memorial Gurugram, Fortis Mulund Mumbai, Fortis Anandapur Kolkata, Fortis Mohali).
  * **Manipal Hospitals Chain** (Manipal Old Airport Road Bengaluru, Manipal Baner Pune, Manipal Bhubaneswar).
  * **Max Healthcare / Medanta / Narayana Health**.

### Hospital Entity Schema (`models.py`)
Each hospital record tracks real-time capacity and disaster readiness:
* `id`, `name`, `chain_name` (`"AIIMS"`, `"Apollo"`, `"Fortis"`, `"Manipal"`, `"Armed Forces"`, `"State Govt"`), `state`, `district`, `lat`, `lng`.
* **Live Bed Inventory**:
  * `icu_beds_total`, `icu_beds_vacant`
  * `ventilator_beds_total`, `ventilator_beds_vacant`
  * `trauma_emergency_total`, `trauma_emergency_vacant`
  * `burn_unit_total`, `burn_unit_vacant`
  * `general_ward_total`, `general_ward_vacant`
* **Critical Resource Telemetry**:
  * `oxygen_reserve_hours` (Hours of liquid medical $\text{O}_2$ remaining at current draw)
  * `backup_generator_fuel_hours`
  * `blood_bank_units` ($\text{O}-, \text{O}+, \text{A}+, \text{B}+, \text{AB}+$)
  * `helipad_available` (Boolean for IAF Mi-17 / ALH Dhruv CASEVAC airlift)
  * `structural_status` (`"OPERATIONAL"`, `"SURGE_CAPACITY"`, `"DAMAGED_EVACUATING"`)

---

## 2. Automated Emergency Bed Assignment Engine (`auto_bed_allocator.py`)
In Post-Disaster Mode (Requirement 9), when a mass-casualty incident occurs or when an individual hospital's beds saturate or suffer power/oxygen failure, Praleye's **Automated Emergency Bed Allocator** automatically assigns patients across the hospital network.

### 2.1 Multi-Variable Triage & Routing Algorithm
Given an emergency batch of $N$ patients at disaster site $(\text{lat}_0, \text{lng}_0)$ with severity profile $S \in \{\text{CRITICAL\_VENT}, \text{SEVERE\_TRAUMA}, \text{BURN}, \text{MODERATE\_GENERAL}\}$, the engine evaluates every operational hospital $h \in H$ within search radius $R_{\max}$ and computes an **Optimal Assignment Cost Score $J(h)$**:

$$J(h) = \alpha \cdot \left(\frac{T_{\text{travel}}(x_0, h)}{T_{\max}}\right) + \beta \cdot \left(1 - \frac{B_{\text{vacant}}(h, S)}{B_{\text{total}}(h, S)}\right) + \gamma \cdot \Phi_{\text{risk}}(h) - \delta \cdot I_{\text{specialty}}(h, S)$$

Where:
* $T_{\text{travel}}(x_0, h)$ is real-time travel time ($\text{minutes}$) via road (OSRM) or airlift (if `helipad_available == True` and patient is critical).
* $B_{\text{vacant}}(h, S)$ is current vacant beds matching required patient severity $S$.
* $\Phi_{\text{risk}}(h)$ is a penalty term if hospital $h$ itself lies inside an active flood/seismic hazard polygon or has `oxygen_reserve_hours` $< 12\text{ hours}$.
* $I_{\text{specialty}}(h, S)$ is a bonus factor for trauma/burn centers.
* Default weights: $\alpha = 0.45$, $\beta = 0.30$, $\gamma = 0.15$, $\delta = 0.10$.

### 2.2 Automatic Failover & Load Balancing
1. **Batch Splitting**: If an incident has 45 trauma casualties and the nearest hospital (e.g., AIIMS Rishikesh) only has 18 vacant trauma beds, the algorithm automatically allocates 18 beds to AIIMS Rishikesh, decrements its live vacancy counter, and routes the remaining 27 patients to the next optimal hospitals (e.g., Max Dehradun, Command Hospital Chandimandir) in a single atomic transaction.
2. **Hospital Failure Auto-Evacuation**: If a hospital reports an issue (e.g., generator failure or flood water entering ground floor), clicking **"Trigger Emergency Patient Redistribution"** automatically reassigns all current ICU/Trauma patients of that hospital to neighboring facilities and generates ambulance/airlift manifests.

---

## 3. High-Priority Government Alert & Safe-Zone Routing System (`alert_comms`)
For Requirement 3 (Pre-disaster & During-disaster public coordination):
1. **Common Alerting Protocol (CAP v1.2) Standard**: Generates ITU-T X.1303 compliant XML payloads identical to NDMA's **SACHET** Cell Broadcast system (header `XX-NDMAEW`).
2. **Multi-Channel Dispatch**:
   * **SMS Gateway**: Integrates with **Fast2SMS** and **Twilio**, plus an instant built-in **Simulated Telecom Cell Broadcast Console** that previews the exact emergency pop-up message on citizen devices.
   * **Dynamic Safe-Zone Deep Link**: Every SMS/Alert automatically embeds the nearest safe shelter name, distance, compass bearing, and offline-capable turn-by-turn evacuation instructions in both English and the local state language:
     > *"अति-आवश्यक बाढ़ चेतावनी (NDMA/PRALEYE): आपके क्षेत्र (पिन: 781001) में अगले 4 घंटों में गंभीर बाढ़ की संभावना (89%) है। तुरंत निकटतम सुरक्षित आश्रय: नेहरू स्टेडियम, गुवाहाटी (1.8 किमी उत्तर) की ओर प्रस्थान करें।"*

---

## 4. Role-Based Dashboards (Requirement 10)
Accessible via the Left Category Dock without losing context of the live tactical map:

### 4.1 Super Admin Dashboard (NDMA / MHA Central Control)
* **System Telemetry & Scraper Health**: Live status of Open-Meteo, USGS, GDACS, X/Reddit/Telegram OSINT scrapers, Geo-NER latency, and Local Ollama LLM token throughput.
* **National Risk Matrix**: Sortable table of all Indian States & Districts ranked by real-time probability scores ($P_{\text{flood}}, P_{\text{cyclone}}, P_{\text{landslide}}, P_{\text{seismic}}, P_{\text{heat}}$).
* **Global Alert Override**: Authorize nationwide or state-wide CAP Cell Broadcasts and adjust prediction model sensitivity thresholds.

### 4.2 Unified Government & Forces Department Dashboard (Indian Army / IAF / NDRF / Fire Brigade / Police)
* **Department Filter Switcher**: View all forces combined or filter specifically to **Indian Army (Humanitarian Assistance & Disaster Relief - HADR columns)**, **Indian Air Force (Helicopter Task Force)**, **NDRF Battalions (1st to 16th Bn)**, or **State Fire & Emergency Services**.
* **Mission Dispatch Board**: Drag-and-drop or 1-click assignment of rescue teams to live scraped SOS clusters.
* **Asset & Logistics Inventory**: Track inflatable motorboats, satellite phones, Bailey bridges, NDRF canine squads, food packet stockpiles, and water purification units.
* **Military SITREP Briefing Panel**: Dedicated view of the Local LLM daily strategic assessment across Northern, Eastern, Western, Southern, Central, and Andaman & Nicobar commands.

### 4.3 Hospital Command Dashboard (Individual Facility & Hospital Chain Views)
* **Dual-Level View Selector**:
  * **Chain Aggregate View** (e.g., *All Apollo Hospitals India*, *All AIIMS Network*, *All Armed Forces Command Hospitals*): Displays pan-India bed occupancy heatmaps, inter-hospital transfer corridors, and chain-wide oxygen/blood reserves.
  * **Individual Hospital View** (e.g., *AIIMS New Delhi* or *Apollo Greams Road Chennai*):
    * Live interactive sliders/counters to update ICU, Ventilator, Trauma, Burn, and General bed vacancies.
    * **Incoming Emergency Triage Queue**: Live list of patients automatically assigned by Praleye's bed allocator with ETA countdowns.
    * **"Report Facility Emergency / Request Patient Offload" Button**: One-click trigger that marks the facility as distressed and automatically redistributes queued or admitted patients to partner hospitals.