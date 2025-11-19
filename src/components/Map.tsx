import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { CasualtyIncident } from '../types';
import { CASUALTY_TYPE_COLORS } from '../types';

interface MapProps {
  incidents: CasualtyIncident[];
  isDarkMode: boolean;
  showHeatmap: boolean;
  showMarkers: boolean;
}

export function Map({ incidents, isDarkMode, showHeatmap, showMarkers }: MapProps) {
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
        if (map.current.getSource('incidents')) {
          map.current.removeSource('incidents');
        }
      } catch (e) {
        // Layers/sources already removed by setStyle, continue
      }

      // Prepare GeoJSON data
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: incidents
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

      // Add source
      map.current.addSource('incidents', {
        type: 'geojson',
        data: geojson,
      });

      // Add heatmap layer
      if (showHeatmap) {
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

      // Add circle markers
      if (showMarkers) {
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

        // Add click handler for popups (only once)
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

        // Change cursor on hover
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
  }, [incidents, showHeatmap, showMarkers, isDarkMode]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
