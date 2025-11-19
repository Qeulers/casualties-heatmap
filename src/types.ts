export interface CasualtyIncident {
  imo: string;
  vessel_name: string;
  casualty_type: string;
  details: string;
  casualty_date: string;
  modified: string;
  ingest_time: string;
  ship_name: string;
  ship_type: string;
  ship_imo: string;
  mmsi: string;
  flag: string;
  call_sign: string;
  build_year: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  timestamp_2: string;
  latitude_2: number | null;
  longitude_2: number | null;
  // Computed fields
  midpoint_lat?: number;
  midpoint_lon?: number;
  distance_km?: number;
}

export interface FilterState {
  dateRange: {
    start: Date;
    end: Date;
  };
  casualtyTypes: string[];
  showHeatmap: boolean;
  showMarkers: boolean;
}

export const CASUALTY_TYPE_COLORS: Record<string, string> = {
  'Other': '#94a3b8',
  'Mechanical Fault': '#f59e0b',
  'Engine Fault': '#ef4444',
  'Collision': '#dc2626',
  'Beached/Grounded': '#d97706',
  'Fire': '#ea580c',
  'Medical Emergency': '#06b6d4',
  'Sank': '#7c3aed',
  'Detained/Arrested': '#4b5563',
  'War Damage': '#991b1b',
  'Piracy': '#be123c',
  'Cargo Loss': '#0891b2',
  'Capsize': '#6366f1',
  'Electrical Fault': '#eab308',
  'Man Overboard': '#0ea5e9',
};
