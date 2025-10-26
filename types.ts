export enum Emotion {
  Happy = 'Happy',
  Calm = 'Calm',
  Sad = 'Sad',
  Stressed = 'Stressed',
  Anxious = 'Anxious',
  Excited = 'Excited',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Weather {
  temperature: number;
  condition: string;
}

export interface Context {
  coordinates: Coordinates;
  timestamp: number;
  dayOfWeek: string;
  timeOfDay: string;
  weather: Weather;
}

export interface MoodLog extends Context {
  id: string;
  emotion: Emotion;
  note?: string; // Add optional note for journaling
}

export interface MapGrounding {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  maps: MapGrounding;
}

export interface Prediction {
  predictedEmotion: Emotion;
  probability: number;
  reasoning: string;
  suggestion?: string; // Stage 4: Add optional coping mechanism
  grounding?: GroundingChunk[]; // For Google Maps Grounding
  feedback?: {
    emotion?: 'accurate' | 'inaccurate';
    suggestion?: 'helpful' | 'not_helpful';
  };
}

export interface PredictionLog {
  id: string;
  type: 'proactive' | 'manual';
  prediction: Prediction;
  timestamp: number;
}