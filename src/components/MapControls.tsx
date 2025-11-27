import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Layers, ChevronDown, ChevronUp, User, LogOut } from 'lucide-react';
import type { FilterState } from '../types';
import { CASUALTY_TYPE_COLORS } from '../types';

interface MapControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTypes: string[];
  availableFlags: string[];
  availableShipTypes: string[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  totalIncidents: number;
  filteredIncidents: number;
}

export function MapControls({
  filters,
  onFiltersChange,
  availableTypes,
  availableFlags,
  availableShipTypes,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  totalIncidents,
  filteredIncidents,
}: MapControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(true);
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [isShipTypeOpen, setIsShipTypeOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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

  const handleFlagToggle = (flag: string) => {
    const newFlags = filters.flags.includes(flag)
      ? filters.flags.filter(f => f !== flag)
      : [...filters.flags, flag];
    onFiltersChange({ ...filters, flags: newFlags });
  };

  const handleSelectAllFlags = () => {
    onFiltersChange({ ...filters, flags: availableFlags });
  };

  const handleDeselectAllFlags = () => {
    onFiltersChange({ ...filters, flags: [] });
  };

  const handleShipTypeToggle = (shipType: string) => {
    const newShipTypes = filters.shipTypes.includes(shipType)
      ? filters.shipTypes.filter(t => t !== shipType)
      : [...filters.shipTypes, shipType];
    onFiltersChange({ ...filters, shipTypes: newShipTypes });
  };

  const handleSelectAllShipTypes = () => {
    onFiltersChange({ ...filters, shipTypes: availableShipTypes });
  };

  const handleDeselectAllShipTypes = () => {
    onFiltersChange({ ...filters, shipTypes: [] });
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
      <div className="absolute top-4 right-4 z-10" ref={accountRef}>
        {/* Account button */}
        <button
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          title="Account"
        >
          <User className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>

        {/* Account dropdown */}
        {isAccountOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => {
                onToggleDarkMode();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <button
              onClick={() => {
                setIsAccountOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
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

        {/* Filter sections */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto">
            {/* Event Types - Collapsible */}
            <div className="border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsEventTypeOpen(!isEventTypeOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Event Types ({filters.casualtyTypes.length}/{availableTypes.length})
                </h3>
                {isEventTypeOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {isEventTypeOpen && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2 mb-2">
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
              )}
            </div>

            {/* Flags - Collapsible */}
            <div className="border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsFlagOpen(!isFlagOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Flags ({filters.flags.length}/{availableFlags.length})
                </h3>
                {isFlagOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {isFlagOpen && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={handleSelectAllFlags}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      All
                    </button>
                    <button
                      onClick={handleDeselectAllFlags}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      None
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableFlags.map((flag) => (
                      <label
                        key={flag}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.flags.includes(flag)}
                          onChange={() => handleFlagToggle(flag)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                          {flag}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ship Types - Collapsible */}
            <div>
              <button
                onClick={() => setIsShipTypeOpen(!isShipTypeOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ship Types ({filters.shipTypes.length}/{availableShipTypes.length})
                </h3>
                {isShipTypeOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {isShipTypeOpen && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={handleSelectAllShipTypes}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      All
                    </button>
                    <button
                      onClick={handleDeselectAllShipTypes}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      None
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableShipTypes.map((shipType) => (
                      <label
                        key={shipType}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.shipTypes.includes(shipType)}
                          onChange={() => handleShipTypeToggle(shipType)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                          {shipType}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
