import { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import type { CasualtyIncident } from '../types';
import { CASUALTY_TYPE_COLORS } from '../types';

interface MapProps {
  incidents: CasualtyIncident[];
  isDarkMode: boolean;
  showHeatmap: boolean;
  showMarkers: boolean;
  selectedVesselIncidents?: CasualtyIncident[];
  activeSearchIncidents?: CasualtyIncident[];
  onVesselFocused?: () => void;
}

export function Map({ incidents, isDarkMode, showHeatmap, showMarkers, selectedVesselIncidents, activeSearchIncidents, onVesselFocused }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [0, 20],
      zoom: 2,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Build a set of active search incident IDs for quick lookup
  const activeSearchIds = useMemo(() => {
    if (!activeSearchIncidents || activeSearchIncidents.length === 0) return null;
    const ids = new Set<string>();
    for (const incident of activeSearchIncidents) {
      // Create a unique identifier for each incident
      ids.add(`${incident.imo}-${incident.vessel_name}-${incident.casualty_date}`);
    }
    return ids;
  }, [activeSearchIncidents]);

  const hasActiveSearch = activeSearchIds !== null && activeSearchIds.size > 0;

  // Combined effect for style changes and data updates
  useEffect(() => {
    if (!map.current) return;

    // Set the appropriate style
    const desiredStyle = isDarkMode
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    
    // Check if we need to change the style by looking at metadata
    let styleChanged = false;
    try {
      const currentStyle = map.current.getStyle();
      const styleJson = JSON.stringify(currentStyle);
      const isDarkCurrent = styleJson.includes('dark-matter');
      
      if (isDarkMode !== isDarkCurrent) {
        map.current.setStyle(desiredStyle);
        styleChanged = true;
      }
    } catch (e) {
      // Style not loaded yet, will be handled by styledata event
    }

    const updateMap = () => {
      if (!map.current) return;

      // Close any existing popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      // Only try to remove layers/sources if they exist
      // After setStyle(), these won't exist, so we skip removal
      try {
        if (map.current.getLayer('heatmap-layer')) {
          map.current.removeLayer('heatmap-layer');
        }
        if (map.current.getLayer('incidents-circles')) {
          map.current.removeLayer('incidents-circles');
        }
        if (map.current.getLayer('inactive-incidents-circles')) {
          map.current.removeLayer('inactive-incidents-circles');
        }
        if (map.current.getSource('incidents')) {
          map.current.removeSource('incidents');
        }
        if (map.current.getSource('inactive-incidents')) {
          map.current.removeSource('inactive-incidents');
        }
      } catch (e) {
        // Layers/sources already removed by setStyle, continue
      }

      // Separate incidents into active and inactive when search is active
      const activeIncidents = incidents.filter(i => {
        if (!hasActiveSearch || !activeSearchIds) return true;
        const id = `${i.imo}-${i.vessel_name}-${i.casualty_date}`;
        return activeSearchIds.has(id);
      });

      const inactiveIncidents = hasActiveSearch && activeSearchIds
        ? incidents.filter(i => {
            const id = `${i.imo}-${i.vessel_name}-${i.casualty_date}`;
            return !activeSearchIds.has(id);
          })
        : [];

      // Prepare GeoJSON data for active incidents
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: activeIncidents
          .filter(i => i.midpoint_lat != null && i.midpoint_lon != null)
          .map(incident => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [incident.midpoint_lon!, incident.midpoint_lat!],
            },
            properties: {
              ...incident,
              color: CASUALTY_TYPE_COLORS[incident.casualty_type] || '#94a3b8',
            },
          })),
      };

      // Prepare GeoJSON data for inactive incidents (grayed out)
      const inactiveGeojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: inactiveIncidents
          .filter(i => i.midpoint_lat != null && i.midpoint_lon != null)
          .map(incident => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [incident.midpoint_lon!, incident.midpoint_lat!],
            },
            properties: {
              ...incident,
            },
          })),
      };

      // Add source for active incidents
      map.current.addSource('incidents', {
        type: 'geojson',
        data: geojson,
      });

      // Add source for inactive incidents if there are any
      if (inactiveIncidents.length > 0) {
        map.current.addSource('inactive-incidents', {
          type: 'geojson',
          data: inactiveGeojson,
        });
      }

      // Determine effective view mode - force markers when search is active
      const effectiveShowHeatmap = hasActiveSearch ? false : showHeatmap;
      const effectiveShowMarkers = hasActiveSearch ? true : showMarkers;

      // Add heatmap layer (only when no active search)
      if (effectiveShowHeatmap) {
        map.current.addLayer({
          id: 'heatmap-layer',
          type: 'heatmap',
          source: 'incidents',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20,
            ],
            'heatmap-opacity': 0.8,
          },
        });
      }

      // Add circle markers (always show when search is active)
      if (effectiveShowMarkers) {
        // Add inactive (grayed out) circles first so they appear behind
        if (inactiveIncidents.length > 0) {
          map.current.addLayer({
            id: 'inactive-incidents-circles',
            type: 'circle',
            source: 'inactive-incidents',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 3,
                5, 5,
                10, 8,
              ],
              'circle-color': '#d1d5db', // Light gray
              'circle-opacity': 0.4,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#9ca3af',
            },
          });
          // No click handler for inactive circles - they are unselectable
        }

        // Add active circles on top
        map.current.addLayer({
          id: 'incidents-circles',
          type: 'circle',
          source: 'incidents',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 3,
              5, 5,
              10, 8,
            ],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.7,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Add click handler for popups (only for active incidents)
        const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
          if (!e.features || !e.features[0]) return;

          // Close existing popup
          if (popupRef.current) {
            popupRef.current.remove();
          }

          const feature = e.features[0];
          const props = feature.properties as any;

          const html = `
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">${props.vessel_name || 'Unknown Vessel'}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Type:</strong> ${props.casualty_type}</p>
                <p><strong>Date:</strong> ${new Date(props.casualty_date).toLocaleDateString()}</p>
                ${props.ship_type ? `<p><strong>Ship Type:</strong> ${props.ship_type}</p>` : ''}
                ${props.flag ? `<p><strong>Flag:</strong> ${props.flag}</p>` : ''}
                ${props.distance_km > 0 ? `<p><strong>Distance:</strong> ${props.distance_km.toFixed(1)} km</p>` : ''}
                <p class="mt-2"><strong>Details:</strong></p>
                <p class="text-xs">${props.details || 'No details available'}</p>
              </div>
            </div>
          `;

          popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map.current!);
        };

        map.current.on('click', 'incidents-circles', handleClick);

        // Change cursor on hover (only for active incidents)
        map.current.on('mouseenter', 'incidents-circles', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'incidents-circles', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      }
    };

    // Wait for style to load before updating
    // If we just changed the style, always wait for styledata event
    if (styleChanged || !map.current.isStyleLoaded()) {
      map.current.once('styledata', updateMap);
    } else {
      updateMap();
    }
  }, [incidents, showHeatmap, showMarkers, isDarkMode, hasActiveSearch, activeSearchIds]);

  // Handle flying to selected vessel incidents
  useEffect(() => {
    if (!map.current || !selectedVesselIncidents || selectedVesselIncidents.length === 0) return;
    
    // Get valid coordinates for all incidents
    const validIncidents = selectedVesselIncidents.filter(incident => {
      const lat = incident.midpoint_lat ?? incident.latitude ?? incident.latitude_2;
      const lon = incident.midpoint_lon ?? incident.longitude ?? incident.longitude_2;
      return lat != null && lon != null;
    });

    if (validIncidents.length === 0) return;

    // Close existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Remove existing highlight layer if present
    try {
      if (map.current.getLayer('highlight-circles')) {
        map.current.removeLayer('highlight-circles');
      }
      if (map.current.getSource('highlight-incidents')) {
        map.current.removeSource('highlight-incidents');
      }
    } catch (e) {
      // Layer/source doesn't exist, continue
    }

    // Create highlight GeoJSON
    const highlightGeojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validIncidents.map(incident => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            incident.midpoint_lon ?? incident.longitude ?? incident.longitude_2!,
            incident.midpoint_lat ?? incident.latitude ?? incident.latitude_2!
          ],
        },
        properties: {
          ...incident,
        },
      })),
    };

    // Add highlight source and layer
    map.current.addSource('highlight-incidents', {
      type: 'geojson',
      data: highlightGeojson,
    });

    map.current.addLayer({
      id: 'highlight-circles',
      type: 'circle',
      source: 'highlight-incidents',
      paint: {
        'circle-radius': 15,
        'circle-color': '#f59e0b',
        'circle-opacity': 0.6,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#f59e0b',
      },
    });

    // Calculate bounds and fit map
    if (validIncidents.length === 1) {
      // Single incident - fly to it
      const incident = validIncidents[0];
      const lat = incident.midpoint_lat ?? incident.latitude ?? incident.latitude_2!;
      const lon = incident.midpoint_lon ?? incident.longitude ?? incident.longitude_2!;
      
      map.current.flyTo({
        center: [lon, lat],
        zoom: 10,
        duration: 2000,
      });

      // Show popup for single incident
      setTimeout(() => {
        if (map.current) {
          const html = `
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">${incident.vessel_name || 'Unknown Vessel'}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>IMO:</strong> ${incident.imo || 'N/A'}</p>
                <p><strong>Type:</strong> ${incident.casualty_type}</p>
                <p><strong>Date:</strong> ${new Date(incident.casualty_date).toLocaleDateString()}</p>
                ${incident.ship_type ? `<p><strong>Ship Type:</strong> ${incident.ship_type}</p>` : ''}
                ${incident.flag ? `<p><strong>Flag:</strong> ${incident.flag}</p>` : ''}
                ${incident.distance_km && incident.distance_km > 0 ? `<p><strong>Distance:</strong> ${incident.distance_km.toFixed(1)} km</p>` : ''}
                <p class="mt-2"><strong>Details:</strong></p>
                <p class="text-xs">${incident.details || 'No details available'}</p>
              </div>
            </div>
          `;
          popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
            .setLngLat([lon, lat])
            .setHTML(html)
            .addTo(map.current);
        }
      }, 2000);
    } else {
      // Multiple incidents - fit bounds to show all
      const bounds = new maplibregl.LngLatBounds();
      
      for (const incident of validIncidents) {
        const lat = incident.midpoint_lat ?? incident.latitude ?? incident.latitude_2!;
        const lon = incident.midpoint_lon ?? incident.longitude ?? incident.longitude_2!;
        bounds.extend([lon, lat]);
      }

      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 10,
        duration: 2000,
      });

      // Show summary popup at center of bounds
      setTimeout(() => {
        if (map.current) {
          const center = bounds.getCenter();
          const firstIncident = validIncidents[0];
          const html = `
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">${firstIncident.vessel_name || 'Unknown Vessel'}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>IMO:</strong> ${firstIncident.imo || 'N/A'}</p>
                <p class="text-amber-600 font-semibold">${validIncidents.length} incidents highlighted</p>
                <div class="mt-2 max-h-32 overflow-y-auto">
                  ${validIncidents.map(inc => `
                    <div class="border-t border-slate-200 pt-1 mt-1">
                      <p><strong>${inc.casualty_type}</strong></p>
                      <p class="text-xs">${new Date(inc.casualty_date).toLocaleDateString()}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
          popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
            .setLngLat(center)
            .setHTML(html)
            .addTo(map.current);
        }
      }, 2000);
    }

    // Remove highlight after 10 seconds
    const timeoutId = setTimeout(() => {
      if (map.current) {
        try {
          if (map.current.getLayer('highlight-circles')) {
            map.current.removeLayer('highlight-circles');
          }
          if (map.current.getSource('highlight-incidents')) {
            map.current.removeSource('highlight-incidents');
          }
        } catch (e) {
          // Layer/source already removed
        }
      }
    }, 10000);

    // Notify parent that we've focused on the vessel
    onVesselFocused?.();

    return () => clearTimeout(timeoutId);
  }, [selectedVesselIncidents, onVesselFocused]);

  // Clean up highlight layer and popup when search is cleared
  useEffect(() => {
    if (!map.current) return;
    
    // Only run cleanup when activeSearchIncidents becomes empty
    if (!activeSearchIncidents || activeSearchIncidents.length === 0) {
      // Remove highlight layer
      try {
        if (map.current.getLayer('highlight-circles')) {
          map.current.removeLayer('highlight-circles');
        }
        if (map.current.getSource('highlight-incidents')) {
          map.current.removeSource('highlight-incidents');
        }
      } catch (e) {
        // Layer/source doesn't exist
      }

      // Close popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  }, [activeSearchIncidents]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
