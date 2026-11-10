import pytest
from modules.prediction_engine.hazard_calculator import (
    calculate_flood_probability,
    calculate_landslide_susceptibility,
    calculate_cyclone_surge_probability,
    calculate_seismic_intensity_mmi,
    calculate_wet_bulb_heat_risk,
    classify_risk_level
)
from modules.prediction_engine.dam_cascade_simulator import simulate_dam_cascade_failure
from modules.prediction_engine.safe_zone_locator import validate_iaf_helipad_weather_ceiling

def test_flood_probability_bounds():
    # Extreme monsoon rainfall
    p_extreme = calculate_flood_probability(
        rain_24h_mm=250.0,
        soil_moisture=0.95,
        river_discharge_m3s=350.0,
        elevation_m=10.0,
        is_mountainous=False
    )
    assert 70.0 <= p_extreme <= 100.0, f"Expected high flood prob, got {p_extreme}"

    # Dry weather
    p_dry = calculate_flood_probability(
        rain_24h_mm=0.0,
        soil_moisture=0.10,
        river_discharge_m3s=5.0,
        elevation_m=500.0,
        is_mountainous=True
    )
    assert 0.0 <= p_dry <= 25.0, f"Expected low flood prob, got {p_dry}"


def test_landslide_susceptibility_bounds():
    # Steep slope + high antecedent rainfall (e.g., Wayanad / Chamoli)
    p_steep = calculate_landslide_susceptibility(
        slope_deg=42.0,
        rain_72h_mm=280.0,
        soil_moisture=0.90,
        recent_seismic_mag=4.5
    )
    assert 60.0 <= p_steep <= 100.0, f"Expected critical landslide prob, got {p_steep}"

    # Flat plain
    p_flat = calculate_landslide_susceptibility(
        slope_deg=2.0,
        rain_72h_mm=100.0,
        soil_moisture=0.80
    )
    assert p_flat == 0.0


def test_cyclone_surge_calculation():
    # High cyclone conditions on coast (e.g., Odisha 120km/h winds)
    p_cyclone = calculate_cyclone_surge_probability(
        wind_gust_kmh=130.0,
        pressure_msl_hpa=965.0,
        distance_coast_km=10.0
    )
    assert 65.0 <= p_cyclone <= 100.0

    # Far inland
    p_inland = calculate_cyclone_surge_probability(
        wind_gust_kmh=40.0,
        pressure_msl_hpa=1010.0,
        distance_coast_km=450.0
    )
    assert p_inland == 0.0


def test_wet_bulb_heat_risk():
    # Severe heatwave (46°C, 50% humidity)
    res_extreme = calculate_wet_bulb_heat_risk(temperature_c=46.0, relative_humidity=50.0)
    assert res_extreme["p_heat"] >= 80.0
    assert res_extreme["risk_level"] == "CRITICAL"

    # Pleasant day (24°C, 45% humidity)
    res_pleasant = calculate_wet_bulb_heat_risk(temperature_c=24.0, relative_humidity=45.0)
    assert res_pleasant["p_heat"] <= 20.0
    assert res_pleasant["risk_level"] == "LOW"


def test_dam_cascade_simulator():
    sim = simulate_dam_cascade_failure("DAM-IDUKKI", upstream_rain_24h_mm=250.0, current_storage_pct=92.0)
    assert sim["spillway_gates_open"] is True
    assert sim["projected_storage_pct"] > 95.0
    assert "Ernakulam" in sim["threatened_districts"] or "Idukki" in sim["threatened_districts"]


def test_iaf_helipad_validator():
    # Gale force winds -> RED
    res_storm = validate_iaf_helipad_weather_ceiling(wind_gust_kmh=65.0)
    assert res_storm["airlift_status"] == "RED"
    assert res_storm["flyable"] is False

    # Clear skies -> GREEN
    res_clear = validate_iaf_helipad_weather_ceiling(wind_gust_kmh=20.0, visibility_km=9.0)
    assert res_clear["airlift_status"] == "GREEN"
    assert res_clear["flyable"] is True
