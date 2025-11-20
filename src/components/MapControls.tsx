import { useState } from 'react';
import { Moon, Sun, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import type { FilterState } from '../types';
import { CASUALTY_TYPE_COLORS } from '../types';

interface MapControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTypes: string[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  totalIncidents: number;
  filteredIncidents: number;
}

export function MapControls({
  filters,
  onFiltersChange,
  availableTypes,
  isDarkMode,
  onToggleDarkMode,
  totalIncidents,
  filteredIncidents,
}: MapControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleViewModeChange = (mode: 'heatmap' | 'markers') => {
    onFiltersChange({
      ...filters,
      showHeatmap: mode === 'heatmap',
      showMarkers: mode === 'markers',
    });
  };

  return (
    <>
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          title="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-slate-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Top-left legend panel */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-xs max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
        {/* Header - Clickable to collapse */}
        <div 
          className="p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex-1">
              Filters
            </h2>
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            ) : (
              <ChevronUp className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-bold text-blue-600 dark:text-blue-400">{filteredIncidents}</span> of{' '}
            <span className="font-bold">{totalIncidents}</span> incidents
          </p>
        </div>

        {/* View mode selection */}
        {!isCollapsed && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              View Mode
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange('heatmap')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.showHeatmap
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => handleViewModeChange('markers')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.showMarkers
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Incidents
              </button>
            </div>
          </div>
        )}

        {/* Casualty types */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
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
              <div className="space-y-1">
                {availableTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.casualtyTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
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
        )}
      </div>
    </>
  );
}
