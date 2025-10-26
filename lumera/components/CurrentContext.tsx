
import React from 'react';
import { Coordinates, Weather } from '../types';
import { LocationIcon, WeatherIcon } from './icons';

interface Props {
  coords: Coordinates | null;
  weather: Weather | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const CurrentContext: React.FC<Props> = ({ coords, weather, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-3 text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
        <span>Fetching your current context...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400">
        <p>{error}</p>
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-red-500/50 text-white rounded-lg hover:bg-red-500/70 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center space-x-3">
        <LocationIcon className="w-6 h-6 text-cyan-400" />
        <div>
          <p className="font-semibold">Location</p>
          {coords ? (
            <p className="text-sm text-gray-300">
              Lat: {coords.latitude.toFixed(4)}, Lon: {coords.longitude.toFixed(4)}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Unavailable</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <WeatherIcon className="w-6 h-6 text-cyan-400" />
        <div>
          <p className="font-semibold">Weather</p>
          {weather ? (
            <p className="text-sm text-gray-300">
              {weather.temperature}°C, {weather.condition}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentContext;
