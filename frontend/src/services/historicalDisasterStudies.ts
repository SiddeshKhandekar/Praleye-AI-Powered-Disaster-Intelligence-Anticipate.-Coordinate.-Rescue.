export interface DisasterAnalysis {
  id: string;
  disaster_name: string;
  year: number;
  location: string;
  state: string;
  lat: number;
  lon: number;
  hazard_type: 'LANDSLIDE' | 'FLASH_FLOOD' | 'CYCLONE' | 'GLACIAL_OUTBURST' | 'HEATWAVE';
  casualties: number;
  damage_summary: string;
  actual_bottlenecks: string[];
  praleye_prevention_lifecycle: {
    phase_1_anticipate: {
      action: string;
      lead_time_hours: number;
      telemetry_trigger: string;
    };
    phase_2_coordinate: {
      action: string;
      osint_response: string;
      safeguard_routing: string;
    };
    phase_3_rescue_triage: {
      action: string;
      hospital_network: string;
      bed_allocation: string;
      lives_saved_estimate: string;
    };
  };
}

export const HISTORICAL_DISASTER_CASE_STUDIES: DisasterAnalysis[] = [
  {
    id: "CASE-WAYANAD-2024",
    disaster_name: "Wayanad Massive Landslides & Debris Flow",
    year: 2024,
    location: "Chooralmala, Mundakkai & Meppadi, Wayanad",
    state: "Kerala",
    lat: 11.5512,
    lon: 76.1280,
    hazard_type: "LANDSLIDE",
    casualties: 420,
    damage_summary: "Over 572 mm of rain fell in 48 hours over high-gradient Western Ghats tea plantations. Two midnight debris avalanches completely swept away Mundakkai and Chooralmala towns, destroying the Chooralmala connecting bridge and severing all ground access for 15+ hours.",
    actual_bottlenecks: [
      "Departmental Isolation: Rainfall telemetry at hilltop tea estates was not cross-referenced with slope gradient models in real time.",
      "Bridge Severance: Chooralmala bridge destruction prevented heavy rescue machinery from reaching victims during the critical 0-12 hour golden window.",
      "Trapped Civilian Confusion: Villagers had no direct, geolocated routing to high-elevation safe zones before nightfall."
    ],
    praleye_prevention_lifecycle: {
      phase_1_anticipate: {
        action: "Praleye's Landslide Susceptibility model P_landslide crosses 88% threshold at 16:00 (10 hours before the midnight collapse). Voluntary evacuation trigger generated.",
        lead_time_hours: 10,
        telemetry_trigger: "Slope angle 38.5° + 72-hour cumulative precipitation (410mm) crossing critical soil saturation index."
      },
      phase_2_coordinate: {
        action: "Automated CAP v1.2 Cell Broadcast in Malayalam sent to all cell phones in Pincode 673577 with high-elevation route directions to St. Joseph School Shelter (880m elevation).",
        osint_response: "OSINT scraper ingests and geolocates grassroots SOS calls from Chooralmala tea estate workers within 90 seconds of posting.",
        safeguard_routing: "Directs citizens AWAY from riverbanks towards Meppadi high-altitude relief camp."
      },
      phase_3_rescue_triage: {
        action: "Army 122 Infantry Battalion (TA) Madras deployed with pre-positioned Bailey bridge elements before road collapse.",
        hospital_network: "Mananthavady District Hospital, GMC Kozhikode, and Aster MIMS.",
        bed_allocation: "Pre-locks 45 Trauma and 18 ICU beds with automated load-balancing, preventing trauma center gridlock.",
        lives_saved_estimate: "Estimated 300+ civilian lives preserved via proactive daytime evacuation."
      }
    }
  },
  {
    id: "CASE-CHAMOLI-2021",
    disaster_name: "Chamoli Glacial Lake Outburst & Rishi Ganga Flash Flood",
    year: 2021,
    location: "Rishi Ganga Gorge & Tapovan Tunnel, Chamoli",
    state: "Uttarakhand",
    lat: 30.4800,
    lon: 79.6900,
    hazard_type: "GLACIAL_OUTBURST",
    casualties: 204,
    damage_summary: "A massive rock and hanging glacier detachment at Ronti Peak caused an explosive avalanche and flash flood down the Rishi Ganga and Dhauliganga rivers, obliterating the Rishi Ganga Hydroelectric Project and trapping 130+ workers inside the Tapovan barrage tunnel.",
    actual_bottlenecks: [
      "Zero Telemetry Ingestion: Downstream project workers had zero warning as river discharge surged by 15,000 cusecs in under 4 minutes.",
      "Tunnel Communications Collapse: Workers trapped 2.5 km deep in sludge had no cellular signal or acoustic beacon for search-and-rescue teams.",
      "Helicopter Flight Delays: Dense mountain turbulence and lack of real-time helipad ceiling telemetry delayed aerial winching."
    ],
    praleye_prevention_lifecycle: {
      phase_1_anticipate: {
        action: "Dam & River Gauge surge detector flags an instantaneous 400% GloFAS river discharge spike at upper hydrometric node.",
        lead_time_hours: 1,
        telemetry_trigger: "Sudden hydrological surge wave detected 18km upstream of Tapovan."
      },
      phase_2_coordinate: {
        action: "Praleye immediately triggers emergency siren protocol at Tapovan Dam site, ordering automatic evacuation of tunnel portal.",
        osint_response: "Scrapes worker families' social posts and links them to tunnel shift logs.",
        safeguard_routing: "Routes workers to Gopeshwar Police Ground (2550m) emergency hub."
      },
      phase_3_rescue_triage: {
        action: "IAF CASEVAC Helipad Validator certifies Joshimath helipad clearance under green flight window for Mi-17 V5 winching.",
        hospital_network: "AIIMS Rishikesh Trauma Center and Gopeshwar District Hospital.",
        bed_allocation: "Locks 25 hypothermia and trauma ICU beds at AIIMS Rishikesh.",
        lives_saved_estimate: "130+ tunnel workers evacuated before the 4-minute flash flood arrival."
      }
    }
  },
  {
    id: "CASE-CHENNAI-2015",
    disaster_name: "Chennai Mega Cloudburst & Chembarambakkam Spillway Inundation",
    year: 2015,
    location: "Velachery, Saidapet, Adyar River Basin, Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lon: 80.2707,
    hazard_type: "FLASH_FLOOD",
    casualties: 470,
    damage_summary: "Over 494 mm of rain fell in 24 hours. The sudden midnight release of 29,000 cusecs from Chembarambakkam Reservoir caused catastrophic overflow of the Adyar River, completely submerging Velachery, Saidapet, and Chennai Airport runway under 6 to 12 feet of water.",
    actual_bottlenecks: [
      "Uncoordinated Dam Discharge: Chembarambakkam gates were opened at night without automated downstream ward-level flood mapping.",
      "Hospital Blackout: MIOT Hospital backup generators in the basement flooded, causing fatal oxygen ventilator failures for ICU patients.",
      "Communication Outage: Cellular towers submerged, preventing stranded families on rooftops from sending GPS distress coordinates."
    ],
    praleye_prevention_lifecycle: {
      phase_1_anticipate: {
        action: "Dam Cascade Simulator models Chembarambakkam inflow 36 hours prior, calculating downstream inundation polygons for Velachery and Saidapet.",
        lead_time_hours: 36,
        telemetry_trigger: "Reservoir storage reaching 92% capacity under 300mm forecast precipitation."
      },
      phase_2_coordinate: {
        action: "Praleye flags MIOT Hospital and district medical centers as high-risk flood intersection polygons 18 hours in advance, triggering prophylactic patient transfer.",
        osint_response: "3-Stage Geo-NER extracts street-level landmarks (Velachery MRTS, 2nd Main Road) from 12,000+ social tweets.",
        safeguard_routing: "Routes 25,000 residents to Jawaharlal Nehru Stadium Periamet safe zone."
      },
      phase_3_rescue_triage: {
        action: "Proactive offload of ICU patients from low-elevation hospitals to Apollo Greams Road and Rajiv Gandhi Govt General Hospital.",
        hospital_network: "Apollo Chennai, RGGGH, and Command Hospital.",
        bed_allocation: "Allocates 120 critical ventilator and trauma beds.",
        lives_saved_estimate: "Prevented 18 hospital ICU fatalities and safe evacuation of 40,000+ families."
      }
    }
  }
];
