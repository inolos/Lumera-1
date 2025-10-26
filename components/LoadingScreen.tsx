import React from 'react';
import { LumeraLogoIcon } from './icons';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[200]">
      <div className="flex flex-col items-center text-center">
        <LumeraLogoIcon className="w-24 h-24 text-cyan-400 animate-pulse-glow" />
        <h1 className="text-5xl font-bold tracking-tight text-white mt-4">
          Lumera
        </h1>
        <p className="text-gray-300 mt-2 animate-pulse">
          Calibrating your emotional compass...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
