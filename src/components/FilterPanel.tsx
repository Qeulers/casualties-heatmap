import { useState } from 'react';
import { Calendar, Filter, X, Moon, Sun, Layers, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { FilterState } from '../types';
import { CASUALTY_TYPE_COLORS } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTypes: string[];
  dateRange: { min: Date; max: Date };
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  totalIncidents: number;
  filteredIncidents: number;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  availableTypes,
  dateRange,
  isDarkMode,
  onToggleDarkMode,
  totalIncidents,
  filteredIncidents,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.casualtyTypes.includes(type)
      ? filters.casualtyTypes.filter(t => t !== type)
      : [...filters.casualtyTypes, type];
    
    onFiltersChange({ ...filters, casualtyTypes: newTypes });
  };

  const handleSelectAll = () => {
    onFiltersChange({ ...filters, casualtyTypes: availableTypes });
  };

  const handleDeselectAll = () => {
    onFiltersChange({ ...filters, casualtyTypes: [] });
  };

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg"
      >
        <Filter className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>

      {/* Filter panel */}
      <div
        className={`fixed lg:relative top-0 left-0 h-full bg-white dark:bg-slate-800 shadow-xl z-10 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-80 overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Filters
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-slate-300" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredIncidents}</span> of{' '}
              <span className="font-bold">{totalIncidents}</span> incidents
            </p>
          </div>

          {/* View toggles */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showHeatmap}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, showHeatmap: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Show Heatmap
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showMarkers}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, showMarkers: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Show Individual Incidents
                </span>
              </label>
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">From</label>
                <input
                  type="date"
                  value={format(filters.dateRange.start, 'yyyy-MM-dd')}
                  min={format(dateRange.min, 'yyyy-MM-dd')}
                  max={format(dateRange.max, 'yyyy-MM-dd')}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: new Date(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">To</label>
                <input
                  type="date"
                  value={format(filters.dateRange.end, 'yyyy-MM-dd')}
                  min={format(dateRange.min, 'yyyy-MM-dd')}
                  max={format(dateRange.max, 'yyyy-MM-dd')}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: new Date(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Casualty types */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Casualty Types
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  None
                </button>
              </div>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {availableTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={filters.casualtyTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CASUALTY_TYPE_COLORS[type] || '#94a3b8' }}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
