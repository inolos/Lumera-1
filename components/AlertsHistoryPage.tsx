import React from 'react';
import { PredictionLog } from '../types';
import { EMOTIONS } from '../constants';
import { BellIcon, MapPinIcon, SparklesIcon } from './icons';
import FeedbackButtons from './FeedbackButtons';

interface Props {
  predictionHistory: PredictionLog[];
  onFeedback: (predictionId: string, feedbackType: 'emotion' | 'suggestion', value: 'accurate' | 'inaccurate' | 'helpful' | 'not_helpful') => void;
}

const AlertsHistoryPage: React.FC<Props> = ({ predictionHistory, onFeedback }) => {
  if (predictionHistory.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 bg-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
        <BellIcon className="w-16 h-16 mx-auto text-cyan-500" />
        <h2 className="text-2xl font-bold mt-4 text-white">No Prediction History Yet</h2>
        <p className="mt-2">
          Predictions you generate and proactive alerts you receive will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
      <h2 className="text-xl font-semibold mb-4 text-cyan-300 flex items-center gap-2">
        <BellIcon className="w-6 h-6" />
        Prediction History
      </h2>
      <ul className="space-y-4">
        {predictionHistory.map((log) => {
          const { predictedEmotion, reasoning, suggestion, grounding } = log.prediction;
          const emotionDetails = EMOTIONS[predictedEmotion];
          const { color } = emotionDetails;
          const Icon = log.type === 'proactive' ? BellIcon : SparklesIcon;

          return (
            <li key={log.id} className={`border-l-4 ${color.replace('text', 'border')} bg-white/5 p-4 rounded-r-lg`}>
              <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <p className="font-bold text-lg">
                            <span className={color}>{predictedEmotion}</span>
                        </p>
                    </div>
                  <p className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()} ({log.type})
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-2 italic">
                Reasoning: "{reasoning}"
              </p>
              <div className="mt-3">
                 <FeedbackButtons predictionLog={log} onFeedback={onFeedback} context="history" />
              </div>
              {suggestion && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs font-semibold text-cyan-300">Suggestion offered:</p>
                    <p className="text-sm text-gray-300 mt-1">{suggestion}</p>
                    <div className="mt-3">
                        <FeedbackButtons predictionLog={log} onFeedback={onFeedback} context="suggestionHistory" />
                    </div>
                </div>
              )}
              {grounding && grounding.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        Nearby places suggested:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {grounding.map((chunk, index) => (
                             <a 
                                key={index} 
                                href={chunk.maps.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full hover:bg-cyan-500/40 transition-colors"
                              >
                                {chunk.maps.title}
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AlertsHistoryPage;