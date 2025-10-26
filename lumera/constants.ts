// Fix: Import React to resolve 'Cannot find namespace 'React'' error.
import React from 'react';
import { Emotion } from './types';
import { HappyIcon, CalmIcon, SadIcon, StressedIcon, AnxiousIcon, ExcitedIcon } from './components/icons';

export const EMOTIONS: { [key in Emotion]: { color: string; icon: React.ComponentType<{ className?: string }> } } = {
  [Emotion.Happy]: { color: 'text-yellow-400', icon: HappyIcon },
  [Emotion.Calm]: { color: 'text-green-400', icon: CalmIcon },
  [Emotion.Sad]: { color: 'text-blue-400', icon: SadIcon },
  [Emotion.Stressed]: { color: 'text-red-500', icon: StressedIcon },
  [Emotion.Anxious]: { color: 'text-purple-400', icon: AnxiousIcon },
  [Emotion.Excited]: { color: 'text-orange-400', icon: ExcitedIcon },
};

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Constants for Proactive Prediction (Stage 3)
export const PROACTIVE_CHECK_INTERVAL = 30000; // 30 seconds for demo purposes
export const SIGNIFICANT_LOCATION_LOG_COUNT = 3; // Min logs in an area to be "significant"
export const SIGNIFICANT_LOCATION_RADIUS_METERS = 150; // 150-meter radius for location matching
