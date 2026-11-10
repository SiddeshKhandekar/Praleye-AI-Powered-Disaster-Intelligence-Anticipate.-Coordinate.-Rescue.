# PRALEYE: Data Ingestion & Disaster Prediction Engine
## Document 01: Real-Time Free Telemetry Feeds & Mathematical Hazard Models

---

## 1. Free Real-Time Weather & Geophysical Data Sources (Zero API Key Cost)
Praleye ingests real-time environmental telemetry across India (Bounding Box: Latitude $6.5^\circ\text{N}$ to $37.1^\circ\text{N}$, Longitude $68.1^\circ\text{E}$ to $97.4^\circ\text{E}$) using $100\%$ free, high-availability APIs that require no paid subscriptions:

| Data Domain | Primary Source (Free) | Endpoint / Protocol | Telemetry Extracted | Polling Interval |
| :--- | :--- | :--- | :--- | :--- |
| **Meteorological & Hydrological** | **Open-Meteo Weather & GloFAS v4 Flood API** | `https://api.open-meteo.com/v1/forecast` & `https://flood-api.open-meteo.com/v1/flood` | Precipitation ($\text{mm/hr}$), CAPE, Soil Moisture ($0\text{--}27\text{cm}$), Wind Gusts ($\text{km/h}$), River Discharge ($\text{m}^3/\text{s}$), Temperature ($^\circ\text{C}$) | Every 5 mins |
| **Seismic Activity** | **USGS Earthquake API & NCS India** | `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` | Magnitude ($M_w$), Hypocenter Depth ($\text{km}$), Epicenter Lat/Lng, ShakeMap intensity | Every 2 mins |
| **Cyclone & Multi-Hazard** | **GDACS (UN/EC Global Disaster Alert)** | `https://www.gdacs.org/xml/rss.xml` (GeoJSON/CAP feeds) | Cyclone tracks, Storm surge height ($\text{m}$), Alert score | Every 10 mins |
| **Wildfire & Thermal** | **NASA FIRMS / EONET API** | `https://eonet.gsfc.nasa.gov/api/v3/events` | Satellite thermal anomalies, FRP (Fire Radiative Power in $\text{MW}$) | Every 15 mins |
| **Indian Official Bulletins** | **NDMA SACHET / IMD / CWC CAP RSS** | NDMA SACHET CAP RSS Feeds | District-level Red/Orange/Yellow alerts, Dam reservoir levels | Every 10 mins |
| **Geocoding & Reverse Geo** | **OpenStreetMap Nominatim / Photon** | `https://photon.komoot.io/api/` | Indian State, District, Tehsil, Pincode, Landmark coordinates | On-demand (Cached) |

---

## 2. Custom Analytics & Prediction Engine (`modules/prediction_engine`)
Instead of relying on static third-party alerts, Praleye computes a **Composite Disaster Probability Score** $P_d \in [0, 100]$ for every monitored Indian district/grid cell across five primary Indian hazard profiles.

### 2.1 Flood Probability Model ($P_{\text{flood}}$)
Evaluates river discharge anomalies from GloFAS v4, cumulative rainfall rate, soil saturation, and topographic elevation:
$$I_{\text{rain}} = \min\left(1.0, \frac{R_{24\text{h}}}{R_{\text{crit}}}\right), \quad I_{\text{river}} = \min\left(1.0, \frac{Q_{\text{current}}}{Q_{\text{bankfull}}}\right)$$
$$P_{\text{flood}} = 100 \times \sigma\left( w_1 I_{\text{rain}} + w_2 I_{\text{river}} + w_3 S_{\text{moisture}} - w_4 \ln(\max(1, E_{\text{elev}})) \right)$$
Where:
* $R_{24\text{h}}$ is 24-hour cumulative rainfall ($\text{mm}$) and $R_{\text{crit}} = 150\text{ mm}$ (adjusted to $100\text{ mm}$ for Himalayan/Western Ghats districts).
* $Q_{\text{current}}$ is real-time river discharge ($\text{m}^3/\text{s}$) from Open-Meteo GloFAS and $Q_{\text{bankfull}}$ is historical 95th percentile discharge.
* $S_{\text{moisture}} \in [0, 1]$ is volumetric soil moisture at $0\text{--}27\text{cm}$.
* $E_{\text{elev}}$ is terrain elevation above nearest river channel ($\text{m}$).
* Weights: $w_1 = 0.35$, $w_2 = 0.40$, $w_3 = 0.15$, $w_4 = 0.10$, normalized through a scaled logistic function $\sigma(x)$.

### 2.2 Landslide Susceptibility Model ($P_{\text{landslide}}$)
Critical for Himachal Pradesh, Uttarakhand, Sikkim, Arunachal Pradesh, and Kerala (Wayanad/Idukki):
$$P_{\text{landslide}} = 100 \times \min\left(1.0, \left(\frac{\theta_{\text{slope}}}{45^\circ}\right)^{1.4} \times \left(0.5 \cdot S_{\text{moisture}} + 0.5 \cdot \frac{R_{72\text{h}}}{250}\right) \times \left(1 + 0.3 \cdot M_{\text{seismic}}\right)\right)$$
Where $\theta_{\text{slope}}$ is terrain slope angle, $R_{72\text{h}}$ is 3-day antecedent rainfall ($\text{mm}$), and $M_{\text{seismic}}$ is recent local seismic tremor factor.

### 2.3 Cyclone & Coastal Surge Model ($P_{\text{cyclone}}$)
Critical for Odisha, Andhra Pradesh, Tamil Nadu, West Bengal, Gujarat, and Maharashtra coasts:
$$P_{\text{cyclone}} = 100 \times \min\left(1.0, 0.45\left(\frac{V_{\text{gust}}}{120}\right) + 0.35\left(\frac{1013 - P_{\text{msl}}}{60}\right) + 0.20\left(\frac{1}{\max(1, D_{\text{coast}})}\right)\right)$$
Where $V_{\text{gust}}$ is wind gust speed ($\text{km/h}$), $P_{\text{msl}}$ is mean sea-level atmospheric pressure ($\text{hPa}$), and $D_{\text{coast}}$ is distance from coastline ($\text{km}$).

### 2.4 Seismic Aftershock & Structural Impact Index ($P_{\text{seismic}}$)
Uses Peak Ground Velocity (PGV) attenuation based on Indian Seismic Zones (Zone II to Zone V):
$$I_{\text{MMI}} = 1.68 + 1.58 M_w - 1.42 \ln\left(\sqrt{D_{\text{epi}}^2 + h_{\text{depth}}^2}\right) + Z_{\text{factor}}$$
Where $M_w$ is moment magnitude, $D_{\text{epi}}$ is epicentral distance ($\text{km}$), $h_{\text{depth}}$ is focal depth ($\text{km}$), and $Z_{\text{factor}} \in [0.2, 1.0]$ corresponds to BIS IS-1893 Seismic Zone V (Northeast, Kashmir, Kutch, Uttarakhand).

### 2.5 Heatwave & Wet-Bulb Mortality Risk ($P_{\text{heat}}$)
Computes Stull's Wet-Bulb Temperature ($T_w$) using ambient temperature $T$ ($^\circ\text{C}$) and relative humidity $\text{RH}\%$:
$$T_w = T \arctan\left(0.151977 (\text{RH} + 8.313659)^{1/2}\right) + \arctan(T + \text{RH}) - \arctan(\text{RH} - 1.676331) + 0.00391838(\text{RH})^{3/2}\arctan(0.023101 \cdot \text{RH}) - 4.686035$$
When $T_w \ge 31^\circ\text{C}$ or $T \ge 45^\circ\text{C}$ in plains ($37^\circ\text{C}$ in hills), $P_{\text{heat}} \ge 85\%$ (Critical Heatstroke Alert).

---

## 3. Safe Zone Selection & Evacuation Routing Submodule
When any district crosses $P_d \ge 65\%$ (Orange/Red Threshold):
1. **Safe Zone Filtering (`safe_zone_locator.py`)**:
   * Queries all registered shelters (Schools, Indoor Stadiums, Army Cantonments, Elevated Cyclone Shelters) within a $25\text{ km}$ radius.
   * Eliminates any shelter located inside the predicted hazard polygon or below safe elevation threshold $E_{\text{shelter}} > E_{\text{flood\_level}} + 5\text{ m}$.
   * Ranks surviving safe zones by remaining capacity $(C_{\text{max}} - C_{\text{occupied}})$, structural rating, and road accessibility.
2. **Evacuation Corridor Calculation**:
   * Integrates with the free **OSRM (Open Source Routing Machine)** public API (`https://router.project-osrm.org/route/v1/driving/`) to compute the fastest evacuation route from high-risk wards to the assigned safe zone while avoiding flooded or blocked road segments.