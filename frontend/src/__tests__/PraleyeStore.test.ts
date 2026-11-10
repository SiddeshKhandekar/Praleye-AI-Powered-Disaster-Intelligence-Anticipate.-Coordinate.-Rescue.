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

  it('should toggle visualization modes between HYBRID, HEATMAP, and PINS', () => {
    const store = usePraleyeStore.getState();
    expect(store.vizMode).toBe('HYBRID');

    store.setVizMode('HEATMAP');
    expect(usePraleyeStore.getState().vizMode).toBe('HEATMAP');

    store.setVizMode('PINS');
    expect(usePraleyeStore.getState().vizMode).toBe('PINS');
  });

  it('should set and clear hovered entity state', () => {
    const store = usePraleyeStore.getState();
    expect(store.hoveredEntity).toBeNull();

    store.setHoveredEntity({
      type: 'DISTRICT',
      data: { name: 'Wayanad' },
      x: 100,
      y: 200
    });
    expect(usePraleyeStore.getState().hoveredEntity?.type).toBe('DISTRICT');

    store.setHoveredEntity(null);
    expect(usePraleyeStore.getState().hoveredEntity).toBeNull();
  });
});

