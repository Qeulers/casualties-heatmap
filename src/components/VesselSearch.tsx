import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { CasualtyIncident } from '../types';

interface VesselSearchProps {
  incidents: CasualtyIncident[];
  onVesselSelect: (incidents: CasualtyIncident[]) => void;
  activeSearchIncidents: CasualtyIncident[];
  onClearSearch: () => void;
}

interface SearchResult {
  incident: CasualtyIncident;
  allIncidents: CasualtyIncident[];
  matchType: 'name' | 'imo' | 'mmsi' | 'callsign';
  recordCount: number;
}

export function VesselSearch({ incidents, onVesselSelect, activeSearchIncidents, onClearSearch }: VesselSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-compute all incidents per vessel
  const vesselIncidentsMap = useMemo(() => {
    const map = new Map<string, CasualtyIncident[]>();
    for (const incident of incidents) {
      const key = `${incident.imo}-${incident.vessel_name}`;
      const existing = map.get(key) || [];
      existing.push(incident);
      map.set(key, existing);
    }
    return map;
  }, [incidents]);

  // Search results - only show when query has at least 3 characters
  const searchResults = useMemo((): SearchResult[] => {
    if (query.length < 3) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    for (const incident of incidents) {
      // Create a unique key for deduplication
      const key = `${incident.imo}-${incident.vessel_name}`;
      if (seen.has(key)) continue;

      const allIncidents = vesselIncidentsMap.get(key) || [incident];
      const recordCount = allIncidents.length;

      // Check vessel name match
      if (incident.vessel_name?.toLowerCase().includes(lowerQuery)) {
        results.push({ incident, allIncidents, matchType: 'name', recordCount });
        seen.add(key);
        continue;
      }

      // Check IMO number match (convert to string first as it may be a number)
      const imoStr = String(incident.imo || '');
      if (imoStr.toLowerCase().includes(lowerQuery)) {
        results.push({ incident, allIncidents, matchType: 'imo', recordCount });
        seen.add(key);
        continue;
      }

      // Check MMSI match
      const mmsiStr = String(incident.mmsi || '');
      if (mmsiStr.toLowerCase().includes(lowerQuery)) {
        results.push({ incident, allIncidents, matchType: 'mmsi', recordCount });
        seen.add(key);
        continue;
      }

      // Check call sign match (convert to string first as it may not be a string)
      const callSignStr = String(incident.call_sign || '');
      if (callSignStr.toLowerCase().includes(lowerQuery)) {
        results.push({ incident, allIncidents, matchType: 'callsign', recordCount });
        seen.add(key);
      }
    }

    // Sort by relevance (exact matches first, then alphabetically)
    return results
      .sort((a, b) => {
        const aName = a.incident.vessel_name?.toLowerCase() || '';
        const bName = b.incident.vessel_name?.toLowerCase() || '';
        const aImo = String(a.incident.imo || '').toLowerCase();
        const bImo = String(b.incident.imo || '').toLowerCase();
        const aMmsi = String(a.incident.mmsi || '').toLowerCase();
        const bMmsi = String(b.incident.mmsi || '').toLowerCase();
        const aCallSign = String(a.incident.call_sign || '').toLowerCase();
        const bCallSign = String(b.incident.call_sign || '').toLowerCase();
        
        // Exact match at start gets priority
        const aStartsWith = aName.startsWith(lowerQuery) || aImo.startsWith(lowerQuery) || aMmsi.startsWith(lowerQuery) || aCallSign.startsWith(lowerQuery);
        const bStartsWith = bName.startsWith(lowerQuery) || bImo.startsWith(lowerQuery) || bMmsi.startsWith(lowerQuery) || bCallSign.startsWith(lowerQuery);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return aName.localeCompare(bName);
      })
      .slice(0, 10); // Limit to 10 results
  }, [query, incidents, vesselIncidentsMap]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchResults]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onVesselSelect(result.allIncidents);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[highlightedIndex]) {
          handleSelect(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!text) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-200 dark:bg-yellow-700 font-semibold">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  const hasActiveSearch = activeSearchIncidents.length > 0;
  const activeVesselName = hasActiveSearch ? activeSearchIncidents[0]?.vessel_name : null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-80">
      <div className="relative">
        {/* Active search indicator */}
        {hasActiveSearch && (
          <div className="mb-2 flex items-center justify-between bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {activeVesselName || 'Unknown Vessel'}
              </span>
              <span className="text-xs bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                {activeSearchIncidents.length}
              </span>
            </div>
            <button
              onClick={onClearSearch}
              className="ml-2 p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-colors flex-shrink-0"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search input - only show when no active search */}
        {!hasActiveSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(e.target.value.length >= 3);
              }}
              onFocus={() => {
                if (query.length >= 3) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search name, IMO, MMSI, callsign..."
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown results */}
        {isOpen && query.length >= 3 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto"
          >
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                No vessels found matching "{query}"
              </div>
            ) : (
              <ul>
                {searchResults.map((result, index) => (
                  <li
                    key={`${result.incident.imo}-${result.incident.vessel_name}-${index}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-3 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                      index === highlightedIndex
                        ? 'bg-blue-50 dark:bg-slate-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {highlightMatch(result.incident.vessel_name || 'Unknown Vessel', query)}
                      </span>
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        {result.recordCount} {result.recordCount === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                      <span>
                        IMO: {result.matchType === 'imo' 
                          ? highlightMatch(String(result.incident.imo || ''), query)
                          : result.incident.imo || 'N/A'}
                      </span>
                      {result.incident.mmsi && (
                        <span>
                          MMSI: {result.matchType === 'mmsi'
                            ? highlightMatch(String(result.incident.mmsi), query)
                            : result.incident.mmsi}
                        </span>
                      )}
                      {result.incident.call_sign && (
                        <span>
                          Call Sign: {result.matchType === 'callsign'
                            ? highlightMatch(String(result.incident.call_sign), query)
                            : result.incident.call_sign}
                        </span>
                      )}
                      {result.incident.flag && (
                        <span>Flag: {result.incident.flag}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
