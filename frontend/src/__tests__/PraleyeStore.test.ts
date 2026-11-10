import { describe, it, expect, beforeEach } from 'vitest';
import { usePraleyeStore } from '../store/usePraleyeStore';

describe('usePraleyeStore HUD State Management', () => {
  beforeEach(() => {
    usePraleyeStore.setState({
      mode: 'MODE_1_PREDICTION',
      activeView: 'COMMAND_HUD',
      language: 'hi',
      timeOffsetHours: 0
    });
  });

  it('should switch between 4 operational modes', () => {
    const store = usePraleyeStore.getState();
    expect(store.mode).toBe('MODE_1_PREDICTION');

    store.setMode('MODE_2_OSINT_RESCUE');
    expect(usePraleyeStore.getState().mode).toBe('MODE_2_OSINT_RESCUE');

    store.setMode('MODE_4_TRIAGE');
    expect(usePraleyeStore.getState().mode).toBe('MODE_4_TRIAGE');
  });

  it('should toggle hazard layers in active set', () => {
    const store = usePraleyeStore.getState();
    expect(store.activeLayers.has('WEATHER_RADAR')).toBe(true);

    store.toggleLayer('WEATHER_RADAR');
    expect(usePraleyeStore.getState().activeLayers.has('WEATHER_RADAR')).toBe(false);

    store.toggleLayer('WEATHER_RADAR');
    expect(usePraleyeStore.getState().activeLayers.has('WEATHER_RADAR')).toBe(true);
  });

  it('should update time machine scrubber offset', () => {
    const store = usePraleyeStore.getState();
    expect(store.timeOffsetHours).toBe(0);

    store.setTimeOffsetHours(48);
    expect(usePraleyeStore.getState().timeOffsetHours).toBe(48);
  });
});

