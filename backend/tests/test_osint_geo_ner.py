import pytest
from modules.osint_scraper.geo_ner_locator import extract_indian_geolocation
from modules.osint_scraper.sos_classifier import score_sos_urgency
from modules.osint_scraper.telemetry_verifier import cross_verify_weather_credibility
from modules.osint_scraper.social_harvester import harvest_osint_reports

@pytest.mark.asyncio
async def test_pincode_and_landmark_extraction():
    # Stage 1: Pincode resolution (Pune 411011)
    t1 = "Water entered 1st floor near Kasba Ganpati, Pune 411011, 4 trapped"
    res1 = await extract_indian_geolocation(t1)
    assert res1["resolution_stage"] == "STAGE_1_PINCODE_CENTROID"
    assert res1["district_id"] == "IN-MH-PUN"
    assert round(res1["lat"], 2) == 18.52

    # Stage 2: Landmark match without pincode (Velachery MRTS Chennai)
    t2 = "Severe waterlogging near Velachery station, 2 infants need milk"
    res2 = await extract_indian_geolocation(t2)
    assert res2["resolution_stage"] == "STAGE_2_LANDMARK_GAZETTEER"
    assert res2["district_id"] == "IN-TN-CHE"
    assert round(res2["lat"], 2) == 12.98


def test_sos_urgency_classifier():
    # Critical threat (Drowning + infant + elderly)
    text_crit = "Drowning, water chest deep! 2 infants and paralyzed elderly grandfather trapped in house!"
    u_crit = score_sos_urgency(text_crit, group_size=5)
    assert u_crit["urgency_label"] == "CRITICAL"
    assert u_crit["urgency_score"] >= 75.0
    assert u_crit["life_threat"] is True
    assert u_crit["vulnerable_people"] is True

    # Low priority informational
    text_low = "Heavy rain started in our sector, roads are wet."
    u_low = score_sos_urgency(text_low, group_size=1)
    assert u_low["urgency_label"] in ["LOW", "MEDIUM"]
    assert u_low["urgency_score"] < 50.0


def test_anti_fake_news_telemetry_filter():
    # Legitimate report backed by sensor rain (>80mm)
    v_real = cross_verify_weather_credibility(
        claimed_hazard="flood",
        rain_24h_mm=95.0,
        wind_gust_kmh=30.0,
        river_discharge_m3s=180.0,
        recent_seismic_mag=0.0
    )
    assert v_real["credibility_score"] >= 90.0
    assert v_real["is_verified"] is True

    # Viral rumor claiming flood with 0mm rainfall
    v_fake = cross_verify_weather_credibility(
        claimed_hazard="flood",
        rain_24h_mm=1.0,
        wind_gust_kmh=10.0,
        river_discharge_m3s=8.0,
        recent_seismic_mag=0.0
    )
    assert v_fake["credibility_score"] <= 20.0
    assert v_fake["is_verified"] is False
    assert "ANOMALY" in v_fake["telemetry_corroboration"]


@pytest.mark.asyncio
async def test_social_harvester_stream():
    feed = await harvest_osint_reports()
    assert len(feed) >= 5
    for item in feed:
        assert "lat" in item and "lon" in item
        assert "urgency_score" in item
        assert "credibility_score" in item
        assert item["status"] == "PENDING"
