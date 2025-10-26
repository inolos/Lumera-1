import React, { useState, useEffect } from 'react';
import { PredictionLog } from '../types';
import { EMOTIONS } from '../constants';
import { BellIcon, XIcon, LightBulbIcon, MapPinIcon } from './icons';
import FeedbackButtons from './FeedbackButtons';

interface Props {
  alertLog: PredictionLog;
  onDismiss: () => void;
  onFeedback: (predictionId: string, feedbackType: 'emotion' | 'suggestion', value: 'accurate' | 'inaccurate' | 'helpful' | 'not_helpful') => void;
}

const ProactiveAlert: React.FC<Props> = ({ alertLog, onDismiss, onFeedback }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { prediction } = alertLog;
  const emotionDetails = EMOTIONS[prediction.predictedEmotion];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-2xl shadow-2xl z-[100] border transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      } bg-gray-800/80 backdrop-blur-md border-cyan-500/50`}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${emotionDetails.color.replace('text', 'bg')}/20`}>
          <BellIcon className={`w-6 h-6 ${emotionDetails.color}`} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white">Proactive Alert</p>
          <p className="text-sm text-gray-300 mt-1">
            Heads up! You might feel <span className={`font-semibold ${emotionDetails.color}`}>{prediction.predictedEmotion}</span> here.
          </p>
          <p className="text-xs text-gray-400 mt-1 italic">
            Reason: "{prediction.reasoning}"
          </p>
          <div className="mt-2">
            <FeedbackButtons predictionLog={alertLog} onFeedback={onFeedback} context="alert" />
          </div>
           {prediction.suggestion && (
            <div className="mt-3 pt-2 border-t border-cyan-500/20">
              <p className="text-xs text-cyan-200 font-semibold flex items-center gap-1">
                <LightBulbIcon className="w-4 h-4" />
                A Quick Suggestion
              </p>
              <p className="text-xs text-gray-300 mt-1">{prediction.suggestion}</p>
              <div className="mt-2">
                 <FeedbackButtons predictionLog={alertLog} onFeedback={onFeedback} context="suggestionAlert" />
              </div>
            </div>
          )}
          {prediction.grounding && prediction.grounding.length > 0 && (
            <div className="mt-2 pt-2 border-t border-cyan-500/20">
              <p className="text-xs text-cyan-200 font-semibold flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Nearby Places:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                  {prediction.grounding.map((chunk, index) => (
                       <a 
                          key={index} 
                          href={chunk.maps.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full hover:bg-cyan-500/40 transition-colors"
                        >
                           {chunk.maps.title}
                       </a>
                  ))}
              </div>
            </div>
         )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-gray-400 rounded-full hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Dismiss alert"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProactiveAlert;