import { useState, useEffect, useMemo } from 'react';
import { Login } from './components/Login';
import { Map } from './components/Map';
import { MapControls } from './components/MapControls';
import { DateRangeSlider } from './components/DateRangeSlider';
import { loadAndProcessCSV, getDateRange, getAllCasualtyTypes } from './utils/dataProcessor';
import type { CasualtyIncident, FilterState } from './types';
import { Loader2 } from 'lucide-react';
import { testSupabaseConnection } from './utils/supabaseTest';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidents, setIncidents] = useState<CasualtyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const dateRange = useMemo(() => {
    if (incidents.length === 0) return { min: new Date(), max: new Date() };
    return getDateRange(incidents);
  }, [incidents]);

  const availableTypes = useMemo(() => {
    return getAllCasualtyTypes(incidents);
  }, [incidents]);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: new Date(), end: new Date() },
    casualtyTypes: [],
    showHeatmap: true,
    showMarkers: false,
  });

  // Load data on mount
  useEffect(() => {
    loadAndProcessCSV()
      .then((data) => {
        setIncidents(data);
        const range = getDateRange(data);
        const types = getAllCasualtyTypes(data);
        setFilters({
          dateRange: { start: range.min, end: range.max },
          casualtyTypes: types,
          showHeatmap: true,
          showMarkers: false,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const incidentDate = new Date(incident.casualty_date);
      const inDateRange =
        incidentDate >= filters.dateRange.start && incidentDate <= filters.dateRange.end;
      const inTypeFilter = filters.casualtyTypes.includes(incident.casualty_type);
      return inDateRange && inTypeFilter;
    });
  }, [incidents, filters]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading incident data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  const handleDateRangeChange = (start: Date, end: Date) => {
    setFilters({
      ...filters,
      dateRange: { start, end },
    });
  };

  return (
    <div className="h-screen relative bg-slate-50 dark:bg-slate-900">
      <Map
        incidents={filteredIncidents}
        isDarkMode={isDarkMode}
        showHeatmap={filters.showHeatmap}
        showMarkers={filters.showMarkers}
      />
      <MapControls
        filters={filters}
        onFiltersChange={setFilters}
        availableTypes={availableTypes}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        totalIncidents={incidents.length}
        filteredIncidents={filteredIncidents.length}
      />
      <DateRangeSlider
        minDate={dateRange.min}
        maxDate={dateRange.max}
        startDate={filters.dateRange.start}
        endDate={filters.dateRange.end}
        onChange={handleDateRangeChange}
      />
    </div>
  );
}

export default App;
