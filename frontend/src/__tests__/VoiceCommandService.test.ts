import { describe, it, expect } from 'vitest';
import { VoiceCommandService } from '../services/voiceCommandService';

describe('VoiceCommandService Intent Parsing', () => {
  it('should parse Hindi rescue command intent', () => {
    let parsedIntent: any = null;
    const service = new VoiceCommandService((intent) => {
      parsedIntent = intent;
    }, 'hi-IN');

    service.parseVoiceIntent('तुरंत बचाव अभियान शुरू करो');
    expect(parsedIntent).toEqual({
      action: 'SWITCH_MODE',
      target: 'MODE_2_OSINT_RESCUE'
    });
  });

  it('should parse English navigation intent', () => {
    let parsedIntent: any = null;
    const service = new VoiceCommandService((intent) => {
      parsedIntent = intent;
    }, 'en-IN');

    service.parseVoiceIntent('zoom to wayanad flood zone');
    expect(parsedIntent).toEqual({
      action: 'NAVIGATE',
      target: 'Wayanad',
      value: { lat: 11.6854, lon: 76.1320 }
    });
  });

  it('should parse SITREP briefing intent', () => {
    let parsedIntent: any = null;
    const service = new VoiceCommandService((intent) => {
      parsedIntent = intent;
    }, 'en-IN');

    service.parseVoiceIntent('generate daily military briefing sitrep');
    expect(parsedIntent).toEqual({
      action: 'OPEN_SITREP'
    });
  });
});
