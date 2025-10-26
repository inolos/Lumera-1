import { Coordinates } from './types';

/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param coords1 - The first set of coordinates.
 * @param coords2 - The second set of coordinates.
 * @returns The distance in meters.
 */
export const getDistance = (coords1: Coordinates, coords2: Coordinates): number => {
  const R = 6371e3; // Earth's radius in metres
  const lat1Rad = coords1.latitude * Math.PI / 180;
  const lat2Rad = coords2.latitude * Math.PI / 180;
  const deltaLatRad = (coords2.latitude - coords1.latitude) * Math.PI / 180;
  const deltaLonRad = (coords2.longitude - coords1.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
