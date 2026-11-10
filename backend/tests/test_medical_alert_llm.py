import pytest
from modules.medical_triage.auto_bed_allocator import calculate_hospital_triage_cost, allocate_emergency_beds
from modules.alert_comms.cap_xml_generator import generate_cap_v12_xml
from modules.alert_comms.multilingual_engine import translate_disaster_alert, INDIAN_LANG_TRANSLATIONS
from modules.alert_comms.offline_beacon import generate_compressed_offline_sos_beacon
from modules.local_llm.sitrep_template import build_deterministic_military_sitrep

def test_hospital_triage_cost_and_batch_split():
    # 2 sample hospitals
    hospitals = [
        {
            "id": "H1", "name": "Apex Civil Hospital", "lat": 18.52, "lon": 73.85,
            "trauma_available": 10, "trauma_total": 40, "oxygen_reserve_hours": 30.0,
            "helipad_available": True, "structural_status": "OPERATIONAL"
        },
        {
            "id": "H2", "name": "Command Military Hospital", "lat": 18.55, "lon": 73.88,
            "trauma_available": 20, "trauma_total": 50, "oxygen_reserve_hours": 48.0,
            "helipad_available": True, "structural_status": "OPERATIONAL"
        },
        {
            "id": "H3_EVAC", "name": "Damaged Hospital", "lat": 18.51, "lon": 73.84,
            "trauma_available": 15, "trauma_total": 30, "oxygen_reserve_hours": 2.0,
            "helipad_available": False, "structural_status": "DAMAGED_EVACUATING"
        }
    ]

    # Test allocation of 25 trauma casualties
    res = allocate_emergency_beds(
        casualty_count=25,
        severity="TRAUMA",
        disaster_lat=18.50,
        disaster_lon=18.50,
        candidate_hospitals=hospitals
    )

    assert res["assigned_casualties"] == 25
    assert res["multi_hospital_split"] is True  # Needs splitting across H1 and H2
    # Ensure H3_EVAC was excluded due to damaged status and low oxygen (<4h)
    assigned_ids = [a["hospital_id"] for a in res["allocations"]]
    assert "H3_EVAC" not in assigned_ids


def test_cap_v12_xml_generation():
    xml = generate_cap_v12_xml(
        alert_id="TEST-001",
        district_name="Wayanad",
        hazard_type="Landslide",
        severity="Extreme",
        headline="Immediate Landslide Evacuation Order",
        description="Massive mudflow in Meppadi area.",
        instruction="Move immediately to higher ground.",
        language="en-IN"
    )
    assert 'xmlns="urn:oasis:names:tc:emergency:cap:1.2"' in xml
    assert "<severity>Extreme</severity>" in xml
    assert "<areaDesc>Wayanad District &amp; Surrounding Sub-divisions</areaDesc>" in xml


def test_multilingual_alert_11_languages():
    for lang in ["en", "hi", "mr", "ta", "te", "bn", "gu", "kn", "ml", "pa", "or"]:
        text = translate_disaster_alert("flood_alert", lang)
        assert len(text) > 10, f"Translation missing for {lang}"


def test_compressed_offline_beacon():
    beacon = generate_compressed_offline_sos_beacon(
        lat=18.52043,
        lon=73.85674,
        headcount=4,
        medical_need="TRAUMA",
        battery_pct=82
    )
    assert beacon["fits_sms_pdu"] is True
    assert beacon["byte_size"] <= 140
    assert beacon["acoustic_distress_freq_hz"] == 2800


def test_deterministic_military_sitrep():
    districts = [
        {"name": "Wayanad", "state": "Kerala", "p_flood": 85.0, "p_landslide": 92.0, "risk_level": "CRITICAL"}
    ]
    sitrep = build_deterministic_military_sitrep(districts, sos_count=8, icu_saturation_pct=72.5)
    content = sitrep["sitrep_content"]
    assert "HQ INTEGRATED DEFENCE STAFF" in content
    assert "WAYANAD" in content
    assert "72.5%" in content

