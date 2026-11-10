export class VoiceCommandService {
  private recognition: any = null;
  private isListening = false;

  constructor(
    private onIntentParsed: (intent: { action: string; target?: string; value?: any }) => void,
    private lang: string = 'en-IN'
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.lang;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.parseVoiceIntent(transcript);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  public setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public toggleListening(): boolean {
    if (!this.recognition) return false;
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }
    return this.isListening;
  }

  public parseVoiceIntent(transcript: string) {
    // Mode Switching Intents
    if (transcript.includes('rescue') || transcript.includes('sos') || transcript.includes('बचाव')) {
      this.onIntentParsed({ action: 'SWITCH_MODE', target: 'MODE_2_OSINT_RESCUE' });
    } else if (transcript.includes('predict') || transcript.includes('forecast') || transcript.includes('पूर्वानुमान')) {
      this.onIntentParsed({ action: 'SWITCH_MODE', target: 'MODE_1_PREDICTION' });
    } else if (transcript.includes('safe') || transcript.includes('shelter') || transcript.includes('सुरक्षित')) {
      this.onIntentParsed({ action: 'SWITCH_MODE', target: 'MODE_3_SAFE_ZONES' });
    } else if (transcript.includes('hospital') || transcript.includes('triage') || transcript.includes('अस्पताल')) {
      this.onIntentParsed({ action: 'SWITCH_MODE', target: 'MODE_4_TRIAGE' });
    }
    // Navigation Intents
    else if (transcript.includes('pune') || transcript.includes('पुणे')) {
      this.onIntentParsed({ action: 'NAVIGATE', target: 'Pune', value: { lat: 18.5204, lon: 73.8567 } });
    } else if (transcript.includes('wayanad') || transcript.includes('वायनाड')) {
      this.onIntentParsed({ action: 'NAVIGATE', target: 'Wayanad', value: { lat: 11.6854, lon: 76.1320 } });
    } else if (transcript.includes('delhi') || transcript.includes('दिल्ली')) {
      this.onIntentParsed({ action: 'NAVIGATE', target: 'Delhi', value: { lat: 28.6139, lon: 77.2090 } });
    } else if (transcript.includes('chennai') || transcript.includes('चेन्नई')) {
      this.onIntentParsed({ action: 'NAVIGATE', target: 'Chennai', value: { lat: 13.0827, lon: 80.2707 } });
    }
    // Modal Actions
    else if (transcript.includes('sitrep') || transcript.includes('briefing')) {
      this.onIntentParsed({ action: 'OPEN_SITREP' });
    } else if (transcript.includes('alert') || transcript.includes('broadcast')) {
      this.onIntentParsed({ action: 'OPEN_ALERT' });
    }
  }

  public speak(text: string, lang = 'hi-IN') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}

