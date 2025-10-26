import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, Weather, MoodLog, Emotion, Prediction, Context, PredictionLog } from './types';
import { getCurrentLocation } from './services/locationService';
import { getWeatherForLocation, getEmotionPrediction } from './services/geminiService';
import { getDistance } from './utils';
import { PROACTIVE_CHECK_INTERVAL, SIGNIFICANT_LOCATION_LOG_COUNT, SIGNIFICANT_LOCATION_RADIUS_METERS } from './constants';
import MoodLogger from './components/MoodLogger';
import PredictionDisplay from './components/PredictionDisplay';
import InsightsPanel from './components/InsightsPanel';
import CurrentContext from './components/CurrentContext';
import BottomNav from './components/BottomNav';
import ProactiveAlert from './components/ProactiveAlert';
import AlertsHistoryPage from './components/AlertsHistoryPage';
import LoadingScreen from './components/LoadingScreen';
import { LumeraLogoIcon } from './components/icons';

type Page = 'log' | 'predict' | 'insights' | 'alerts';

const App: React.FC = () => {
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<PredictionLog[]>([]);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [manualPredictionLog, setManualPredictionLog] = useState<PredictionLog | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<Page>('log');
  const [proactiveAlertLog, setProactiveAlertLog] = useState<PredictionLog | null>(null);
  
  const lastPredictionContext = useRef<{ lat: number; lon: number; time: number } | null>(null);

  // Refs to avoid stale closures in setInterval
  const moodHistoryRef = useRef(moodHistory);
  moodHistoryRef.current = moodHistory;
  const predictionHistoryRef = useRef(predictionHistory);
  predictionHistoryRef.current = predictionHistory;
  const isPredictingRef = useRef(isPredicting);
  isPredictingRef.current = isPredicting;
  const proactiveAlertLogRef = useRef(proactiveAlertLog);
  proactiveAlertLogRef.current = proactiveAlertLog;

  useEffect(() => {
    const loadedMoodHistory = localStorage.getItem('moodHistory');
    if (loadedMoodHistory) {
      setMoodHistory(JSON.parse(loadedMoodHistory));
    }
    const loadedPredictionHistory = localStorage.getItem('predictionHistory');
    if (loadedPredictionHistory) {
      setPredictionHistory(JSON.parse(loadedPredictionHistory));
    }
    initializeContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proactive Prediction Check
  useEffect(() => {
    const proactiveCheck = async () => {
        if (moodHistoryRef.current.length < SIGNIFICANT_LOCATION_LOG_COUNT || isPredictingRef.current || proactiveAlertLogRef.current) {
            return;
        }

        try {
            const coords = await getCurrentLocation();
            const now = Date.now();

            if (lastPredictionContext.current) {
                const distance = getDistance(coords, { latitude: lastPredictionContext.current.lat, longitude: lastPredictionContext.current.lon });
                if (distance < SIGNIFICANT_LOCATION_RADIUS_METERS && (now - lastPredictionContext.current.time) < 5 * 60 * 1000) {
                    return; 
                }
            }

            const logsNearby = moodHistoryRef.current.filter(log => 
                getDistance(coords, log.coordinates) < SIGNIFICANT_LOCATION_RADIUS_METERS
            );

            if (logsNearby.length >= SIGNIFICANT_LOCATION_LOG_COUNT) {
                console.log("Significant location detected. Triggering proactive prediction.");
                
                const weather = await getWeatherForLocation(coords);
                const date = new Date();
                const currentContext: Context = {
                    coordinates: coords,
                    weather: weather,
                    timestamp: date.getTime(),
                    dayOfWeek: date.toLocaleString('en-US', { weekday: 'long' }),
                    timeOfDay: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                };
                
                const newPrediction = await getEmotionPrediction(currentContext, moodHistoryRef.current, predictionHistoryRef.current);
                
                const newAlertLog: PredictionLog = {
                  id: new Date().toISOString(),
                  type: 'proactive',
                  prediction: newPrediction,
                  timestamp: Date.now(),
                };

                setProactiveAlertLog(newAlertLog);
                setPredictionHistory(prev => {
                    const updatedHistory = [newAlertLog, ...prev];
                    localStorage.setItem('predictionHistory', JSON.stringify(updatedHistory));
                    return updatedHistory;
                });

                lastPredictionContext.current = { lat: coords.latitude, lon: coords.longitude, time: now };
            }

        } catch (err) {
            console.warn("Proactive check failed:", err);
        }
    };
    
    const interval = setInterval(proactiveCheck, PROACTIVE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const initializeContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      setCurrentCoords(coords);
      const weather = await getWeatherForLocation(coords);
      setCurrentWeather(weather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  }, []);

  const handleLogMood = (emotion: Emotion, note: string) => {
    if (!currentCoords || !currentWeather) {
      setError("Cannot log mood without location and weather data. Please ensure permissions are enabled and try again.");
      return;
    }
    
    const now = new Date();
    const newLog: MoodLog = {
      id: now.toISOString(),
      emotion,
      note: note.trim() === '' ? undefined : note.trim(),
      coordinates: currentCoords,
      weather: currentWeather,
      timestamp: now.getTime(),
      dayOfWeek: now.toLocaleString('en-US', { weekday: 'long' }),
      timeOfDay: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [newLog, ...moodHistory];
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    setManualPredictionLog(null);
  };

  const handleGetPrediction = async () => {
    if (!currentCoords || !currentWeather) {
      setError("Cannot get prediction without current context. Please refresh.");
      return;
    }

    if (moodHistory.length < 3) {
      setError("Not enough data to make a prediction. Please log your mood at least 3 times.");
      return;
    }

    setIsPredicting(true);
    setError(null);
    setManualPredictionLog(null);

    const now = new Date();
    const currentContext: Context = {
      coordinates: currentCoords,
      weather: currentWeather,
      timestamp: now.getTime(),
      dayOfWeek: now.toLocaleString('en-US', { weekday: 'long' }),
      timeOfDay: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const newPrediction = await getEmotionPrediction(currentContext, moodHistory, predictionHistory);
      const newPredictionLog: PredictionLog = {
        id: new Date().toISOString(),
        type: 'manual',
        prediction: newPrediction,
        timestamp: Date.now(),
      };
      setManualPredictionLog(newPredictionLog);
      setPredictionHistory(prev => {
        const updatedHistory = [newPredictionLog, ...prev];
        localStorage.setItem('predictionHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFeedback = (
    predictionId: string, 
    feedbackType: 'emotion' | 'suggestion', 
    value: 'accurate' | 'inaccurate' | 'helpful' | 'not_helpful'
  ) => {
    const updatedHistory = predictionHistory.map(log => {
      if (log.id === predictionId) {
        const newLog = { ...log };
        if (!newLog.prediction.feedback) {
          newLog.prediction.feedback = {};
        }
        if (feedbackType === 'emotion' && (value === 'accurate' || value === 'inaccurate')) {
            newLog.prediction.feedback.emotion = value;
        } else if (feedbackType === 'suggestion' && (value === 'helpful' || value === 'not_helpful')) {
            newLog.prediction.feedback.suggestion = value;
        }
        return newLog;
      }
      return log;
    });

    setPredictionHistory(updatedHistory);
    localStorage.setItem('predictionHistory', JSON.stringify(updatedHistory));

    // Also update the currently displayed predictions
    if (manualPredictionLog?.id === predictionId) {
        setManualPredictionLog(prev => prev ? { ...prev, prediction: updatedHistory.find(l => l.id === predictionId)!.prediction } : null);
    }
    if (proactiveAlertLog?.id === predictionId) {
        setProactiveAlertLog(prev => prev ? { ...prev, prediction: updatedHistory.find(l => l.id === predictionId)!.prediction } : null);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'log':
        return (
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">Current Context</h2>
              <CurrentContext
                coords={currentCoords}
                weather={currentWeather}
                isLoading={isLoading}
                error={error}
                onRetry={initializeContext}
              />
            </div>
            <div className="bg-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300">How are you feeling right now?</h2>
              <MoodLogger onLogMood={handleLogMood} disabled={isLoading} />
            </div>
          </div>
        );
      case 'predict':
        return (
          <div className="bg-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Prediction</h2>
            <PredictionDisplay
              predictionLog={manualPredictionLog}
              isLoading={isPredicting}
              onGetPrediction={handleGetPrediction}
              onFeedback={handleFeedback}
              disabled={isLoading || moodHistory.length < 3}
            />
            {moodHistory.length < 3 && <p className="text-sm text-gray-400 mt-4">Log your mood {3 - moodHistory.length} more time(s) to enable predictions.</p>}
          </div>
        );
      case 'insights':
        return <InsightsPanel history={moodHistory} />;
      case 'alerts':
        return <AlertsHistoryPage predictionHistory={predictionHistory} onFeedback={handleFeedback} />;
      default:
        return null;
    }
  };

  return (
    <>
      {isInitializing && <LoadingScreen />}
      <div className={`min-h-screen font-sans transition-opacity duration-500 ${isInitializing ? 'opacity-0' : 'opacity-100'}`}>
        {proactiveAlertLog && <ProactiveAlert alertLog={proactiveAlertLog} onDismiss={() => setProactiveAlertLog(null)} onFeedback={handleFeedback} />}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
          <header className="flex items-center space-x-3 mb-6">
            <LumeraLogoIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Lumera
            </h1>
          </header>

          <main>
            <div key={activePage} className="animate-fade-in">
              {renderPage()}
            </div>
          </main>
        </div>
        <BottomNav activePage={activePage} onPageChange={setActivePage} />
      </div>
    </>
  );
};

export default App;