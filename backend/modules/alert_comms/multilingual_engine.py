from typing import Dict

# Dictionary translations across all 11 official Indian languages
INDIAN_LANG_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "flood_alert": "CRITICAL FLOOD WARNING (NDMA/PRALEYE): Inundation imminent in your area. Evacuate immediately to nearest designated safe shelter.",
        "landslide_alert": "LANDSLIDE WARNING: Debris flow risk high along ghat roads. Seek high-altitude reinforced shelters.",
        "cyclone_alert": "CYCLONE WARNING: Destructive coastal wind gusts expected. Stay indoors in structural cyclone shelters."
    },
    "hi": {
        "flood_alert": "अति-आवश्यक बाढ़ चेतावनी (NDMA/प्रलय): आपके क्षेत्र में बाढ़ की गंभीर आशंका है। तुरंत निकटतम सुरक्षित आश्रय की ओर प्रस्थान करें।",
        "landslide_alert": "भूस्खलन चेतावनी: पहाड़ी क्षेत्रों और घाट मार्गों पर मलबा गिरने का भारी खतरा। सुरक्षित ऊंचे स्थानों पर शरण लें।",
        "cyclone_alert": "चक्रवात चेतावनी: तटीय क्षेत्रों में तीव्र विनाशकारी हवाओं की संभावना। पक्के चक्रवात आश्रय में रहें।"
    },
    "mr": {
        "flood_alert": "तातडीचा पूर इशारा (NDMA/प्रलय): आपल्या भागात गंभीर पुराचा धोका आहे. तात्काळ जवळच्या सुरक्षित निवारा केंद्रात जा.",
        "landslide_alert": "दरड कोसळण्याचा इशारा: घाट रस्ते आणि डोंगराळ भागात दरड कोसळण्याची दाट शक्यता.",
        "cyclone_alert": "चक्रीवादळ इशारा: किनारपट्टी भागात जोरदार वारे वाहतील. सुरक्षित आश्रयामध्ये राहा."
    },
    "ta": {
        "flood_alert": "அவசர வெள்ள எச்சரிக்கை (NDMA/பிரளய்): உங்கள் பகுதியில் கடுமையான வெள்ள அபாயம் உள்ளது. உடனடியாக பாதுகாப்பான முகாமிற்கு செல்லவும்.",
        "landslide_alert": "நிலச்சரிவு எச்சரிக்கை: மலைப்பகுதிகளில் நிலச்சரிவு ஏற்படும் அபாயம் அதிகம்.",
        "cyclone_alert": "புயல் எச்சரிக்கை: கடலோர பகுதிகளில் பலத்த காற்று வீசக்கூடும். பாதுகாப்பான இடத்தில் இருக்கவும்."
    },
    "te": {
        "flood_alert": "అత్యవసర వరద హెచ్చరిక (NDMA/ప్రళయ్): మీ ప్రాంతంలో తీవ్రమైన వరద ముప్పు ఉంది. వెంటనే సురక్షిత ఆశ్రయానికి వెళ్లండి.",
        "landslide_alert": "కొండచరియలు విరిగిపడే హెచ్చరిక: ఘాట్ రోడ్లలో ప్రయాణం చేయవద్దు.",
        "cyclone_alert": "తుఫాను హెచ్చరిక: తీరప్రాంతాల్లో బలమైన గాలులు వీస్తాయి."
    },
    "bn": {
        "flood_alert": "জরুরি বন্যা সতর্কতা (NDMA/প্রলয়): আপনার এলাকায় তীব্র বন্যার সম্ভাবনা রয়েছে। অবিলম্বে নিকটস্থ নিরাপদ আশ্রয়ে যান।",
        "landslide_alert": "ভূমিধস সতর্কতা: পাহাড়ি অঞ্চলে ভূমিধসের তীব্র ঝুঁকি।",
        "cyclone_alert": "ঘূর্ণিঝড় সতর্কতা: উপকূলীয় অঞ্চলে বিধ্বংসী ঝড়ো হাওয়ার আশঙ্কা।"
    },
    "gu": {
        "flood_alert": "તાકીદની પૂર ચેતવણી (NDMA/પ્રલય): તમારા વિસ્તારમાં ગંભીર પૂરનું જોખમ છે. તાત્કાલિક નજીકના સલામત આશ્રયસ્થાને જાઓ.",
        "landslide_alert": "ભૂસ્ખલન ચેતવણી: પર્વતીય વિસ્તારોમાં ભૂસ્ખલનનો ભારે ખતરો.",
        "cyclone_alert": "વાવાઝોડાની ચેતવણી: દરિયાકાંઠાના વિસ્તારોમાં વિનાશક પવનોની શક્યતા."
    },
    "kn": {
        "flood_alert": "ತುರ್ತು ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ (NDMA/ಪ್ರಳಯ): ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ತೀವ್ರ ಪ್ರವಾಹದ ಭೀತಿಯಿದೆ. ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಆಶ್ರಯಕ್ಕೆ ತೆರಳಿ.",
        "landslide_alert": "ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ: ಘಾಟ್ ರಸ್ತೆಗಳಲ್ಲಿ ಭೂಕುಸಿತದ ಹೆಚ್ಚಿನ ಅಪಾಯವಿದೆ.",
        "cyclone_alert": "ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ: ಕರಾವಳಿ ತೀರದಲ್ಲಿ ಬಿರುಗಾಳಿ ಬೀಸುವ ಸಂಭವವಿದೆ."
    },
    "ml": {
        "flood_alert": "അടിയന്തര പ്രളയ മുന്നറിയിപ്പ് (NDMA/പ്രളയ്): നിങ്ങളുടെ പ്രദേശത്ത് കനത്ത പ്രളയ സാധ്യതയുണ്ട്. ഉടൻ സുരക്ഷിത കേന്ദ്രത്തിലേക്ക് മാറുക.",
        "landslide_alert": "ഉരുൾപൊട്ടൽ മുന്നറിയിപ്പ്: മലയോര മേഖലകളിൽ ഉരുൾപൊട്ടൽ ഭീഷണി നിലനിൽക്കുന്നു.",
        "cyclone_alert": "ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്: തീരദേശങ്ങളിൽ അതിശക്തമായ കാറ്റിന് സാധ്യത."
    },
    "pa": {
        "flood_alert": "ਐਮਰਜੈਂਸੀ ਹੜ੍ਹ ਚੇਤਾਵਨੀ (NDMA/ਪ੍ਰਲੈ): ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਹੜ੍ਹ ਦਾ ਵੱਡਾ ਖਤਰਾ ਹੈ। ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਸ਼ੈਲਟਰ ਵੱਲ ਜਾਓ।",
        "landslide_alert": "ਜ਼ਮੀਨ ਖਿਸਕਣ ਦੀ ਚੇਤਾਵਨੀ: ਪਹਾੜੀ ਰਸਤਿਆਂ 'ਤੇ ਜ਼ਮੀਨ ਖਿਸਕਣ ਦਾ ਗੰਭੀਰ ਖਤਰਾ।",
        "cyclone_alert": "ਤੂਫਾਨ ਚੇਤਾਵਨੀ: ਤੱਟਵਰਤੀ ਖੇਤਰਾਂ ਵਿੱਚ ਤੇਜ਼ ਹਵਾਵਾਂ ਚੱਲਣਗੀਆਂ।"
    },
    "or": {
        "flood_alert": "ଜରୁରୀକାଳୀନ ବନ୍ୟା ଚେତାବନୀ (NDMA/ପ୍ରଳୟ): ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ଭୟଙ୍କର ବନ୍ୟା ଆଶଙ୍କା। ତୁରନ୍ତ ନିକଟସ୍ଥ ନିରାପଦ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ।",
        "landslide_alert": "ଭୂସ୍ଖଳନ ଚେତାବନୀ: ପାହାଡ଼ିଆ ଅଞ୍ଚଳରେ ଭୂସ୍ଖଳନର ତୀବ୍ର ବିପଦ।",
        "cyclone_alert": "ବାତ୍ୟା ଚେତାବନୀ: ଉପକୂଳବର୍ତ୍ତୀ ଅଞ୍ଚଳରେ ପ୍ରଳୟଙ୍କରୀ ପବନ ବହିବାର ଆଶଙ୍କା।"
    }
}

def translate_disaster_alert(alert_key: str, lang: str = "hi") -> str:
    """Returns disaster warning string translated into requested Indian language."""
    lang_dict = INDIAN_LANG_TRANSLATIONS.get(lang.lower(), INDIAN_LANG_TRANSLATIONS["en"])
    return lang_dict.get(alert_key, INDIAN_LANG_TRANSLATIONS["en"].get(alert_key, "Emergency Disaster Warning"))
