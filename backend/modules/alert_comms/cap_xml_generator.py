from datetime import datetime, timezone, timedelta
import xml.etree.ElementTree as ET

def generate_cap_v12_xml(
    alert_id: str,
    district_name: str,
    hazard_type: str,
    severity: str,  # Extreme, Severe, Moderate
    headline: str,
    description: str,
    instruction: str,
    language: str = "en-IN"
) -> str:
    """
    Generates ITU-T Recommendation X.1303 / OASIS CAP v1.2 standard XML payload
    identical to NDMA's SACHET Cell Broadcast format.
    """
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=6)

    root = ET.Element("alert", xmlns="urn:oasis:names:tc:emergency:cap:1.2")
    
    ET.SubElement(root, "identifier").text = f"IN-NDMA-{alert_id}"
    ET.SubElement(root, "sender").text = "ndma-alert@gov.in"
    ET.SubElement(root, "sent").text = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    ET.SubElement(root, "status").text = "Actual"
    ET.SubElement(root, "msgType").text = "Alert"
    ET.SubElement(root, "scope").text = "Public"
    ET.SubElement(root, "code").text = "XX-NDMAEW"

    info = ET.SubElement(root, "info")
    ET.SubElement(info, "language").text = language
    ET.SubElement(info, "category").text = "Met" if hazard_type.lower() in ["flood", "cyclone"] else "Geo"
    ET.SubElement(info, "event").text = f"{hazard_type} Warning"
    ET.SubElement(info, "urgency").text = "Immediate"
    ET.SubElement(info, "severity").text = severity
    ET.SubElement(info, "certainty").text = "Observed"
    ET.SubElement(info, "eventCode").text = "SAME"
    ET.SubElement(info, "expires").text = expires.strftime("%Y-%m-%dT%H:%M:%SZ")
    ET.SubElement(info, "senderName").text = "National Disaster Management Authority (PRALEYE)"
    ET.SubElement(info, "headline").text = headline
    ET.SubElement(info, "description").text = description
    ET.SubElement(info, "instruction").text = instruction

    area = ET.SubElement(info, "area")
    ET.SubElement(area, "areaDesc").text = f"{district_name} District & Surrounding Sub-divisions"

    return ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")
