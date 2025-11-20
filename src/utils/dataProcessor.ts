import Papa from 'papaparse';
import type { CasualtyIncident } from '../types';
import { supabase, STORAGE_CONFIG } from '../lib/supabase';

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function loadAndProcessCSV(): Promise<CasualtyIncident[]> {
  // Fetch CSV from Supabase Storage
  console.log('Fetching from Supabase:', {
    bucket: STORAGE_CONFIG.bucketName,
    path: STORAGE_CONFIG.filePath,
  });

  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.bucketName)
    .download(STORAGE_CONFIG.filePath);

  if (error) {
    console.error('Supabase error details:', error);
    throw new Error(`Failed to load CSV from Supabase: ${JSON.stringify(error)}`);
  }

  if (!data) {
    throw new Error('No data received from Supabase Storage');
  }

  const csvText = await data.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<CasualtyIncident>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processed = results.data
          .filter(row => {
            // Filter out rows without at least one valid location
            const hasFirstLocation = row.latitude != null && row.longitude != null;
            const hasSecondLocation = row.latitude_2 != null && row.longitude_2 != null;
            return hasFirstLocation || hasSecondLocation;
          })
          .map(row => {
            const hasFirstLocation = row.latitude != null && row.longitude != null;
            const hasSecondLocation = row.latitude_2 != null && row.longitude_2 != null;
            
            let midpoint_lat: number | undefined;
            let midpoint_lon: number | undefined;
            let distance_km: number | undefined;
            
            if (hasFirstLocation && hasSecondLocation) {
              // Both locations available - calculate midpoint
              midpoint_lat = (row.latitude! + row.latitude_2!) / 2;
              midpoint_lon = (row.longitude! + row.longitude_2!) / 2;
              distance_km = calculateDistance(
                row.latitude!,
                row.longitude!,
                row.latitude_2!,
                row.longitude_2!
              );
            } else if (hasFirstLocation) {
              // Only first location available
              midpoint_lat = row.latitude!;
              midpoint_lon = row.longitude!;
              distance_km = 0;
            } else if (hasSecondLocation) {
              // Only second location available
              midpoint_lat = row.latitude_2!;
              midpoint_lon = row.longitude_2!;
              distance_km = 0;
            }
            
            return {
              ...row,
              midpoint_lat,
              midpoint_lon,
              distance_km,
            };
          });
        
        resolve(processed);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export function getDateRange(incidents: CasualtyIncident[]): { min: Date; max: Date } {
  const dates = incidents
    .map(i => new Date(i.casualty_date))
    .filter(d => !isNaN(d.getTime()));
  
  return {
    min: new Date(Math.min(...dates.map(d => d.getTime()))),
    max: new Date(Math.max(...dates.map(d => d.getTime()))),
  };
}

export function getAllCasualtyTypes(incidents: CasualtyIncident[]): string[] {
  const types = new Set(incidents.map(i => i.casualty_type).filter(Boolean));
  return Array.from(types).sort();
}
