export const apiClient = {
  async getHazardGrid() {
    const res = await fetch('/api/v1/predictions/india-grid');
    if (!res.ok) throw new Error('Failed to fetch hazard grid');
    return res.json();
  },

  async getOsintLiveFeed() {
    const res = await fetch('/api/v1/osint/live-feed');
    if (!res.ok) throw new Error('Failed to fetch OSINT reports');
    return res.json();
  },

  async getHospitals() {
    const res = await fetch('/api/v1/hospitals/network-status');
    if (!res.ok) throw new Error('Failed to fetch hospitals');
    return res.json();
  },

  async getSafeZones() {
    const res = await fetch('/api/v1/dashboards/safe-shelters');
    if (!res.ok) throw new Error('Failed to fetch safe zones');
    return res.json();
  },

  async getForces() {
    const res = await fetch('/api/v1/dashboards/forces-deployments');
    if (!res.ok) throw new Error('Failed to fetch defense forces');
    return res.json();
  },

  async autoAssignBeds(payload: { casualty_count: number; severity: string; lat: number; lon: number; airlift_required?: boolean }) {
    const res = await fetch('/api/v1/hospitals/auto-assign-beds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to auto-assign beds');
    return res.json();
  },

  async generateSitrep(payload: { active_sos_count?: number } = {}) {
    const res = await fetch('/api/v1/llm/generate-sitrep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate SITREP');
    return res.json();
  },

  async broadcastCapAlert(payload: Record<string, any>) {
    const res = await fetch('/api/v1/alerts/broadcast-cap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to broadcast alert');
    return res.text();
  },

  async dispatchForce(unitId: string, lat: number, lon: number) {
    const res = await fetch('/api/v1/dashboards/dispatch-force', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit_id: unitId, target_lat: lat, target_lon: lon })
    });
    if (!res.ok) throw new Error('Failed to dispatch unit');
    return res.json();
  }
};

