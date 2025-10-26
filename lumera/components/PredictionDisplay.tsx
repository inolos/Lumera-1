import React from 'react';
import { PredictionLog } from '../types';
import { EMOTIONS } from '../constants';
import { LightBulbIcon, MapPinIcon } from './icons';
import FeedbackButtons from './FeedbackButtons';

interface Props {
  predictionLog: PredictionLog | null;
  isLoading: boolean;
  disabled: boolean;
  onGetPrediction: () => void;
  onFeedback: (predictionId: string, feedbackType: 'emotion' | 'suggestion', value: 'accurate' | 'inaccurate' | 'helpful' | 'not_helpful') => void;
}

const PredictionDisplay: React.FC<Props> = ({ predictionLog, isLoading, disabled, onGetPrediction, onFeedback }) => {
  const prediction = predictionLog?.prediction;
  const probabilityPercentage = prediction ? Math.round(prediction.probability * 100) : 0;
  const emotionDetails = prediction ? EMOTIONS[prediction.predictedEmotion] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-pulse text-lg text-cyan-300">Analyzing patterns...</div>
          </div>
        ) : prediction && emotionDetails && predictionLog ? (
          <div>
            <div className="text-center">
              <span className={`text-4xl font-bold ${emotionDetails.color}`}>
                {prediction.predictedEmotion}
              </span>
              <p className="text-gray-300 mt-2">{prediction.reasoning}</p>
            </div>
            <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full`}
                style={{ width: `${probabilityPercentage}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-1">
              {probabilityPercentage}% Confidence
            </p>
            <div className="mt-4">
              <FeedbackButtons 
                predictionLog={predictionLog}
                onFeedback={onFeedback}
                context="display"
              />
            </div>

            {prediction.suggestion && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-center">
                  <h4 className="text-md font-semibold text-cyan-300 flex items-center justify-center gap-2">
                    <LightBulbIcon className="w-5 h-5" />
                    A Helpful Suggestion
                  </h4>
                  <p className="text-gray-300 mt-2 text-sm">{prediction.suggestion}</p>
                </div>
                {prediction.grounding && prediction.grounding.length > 0 && (
                  <div className="mt-4 text-center">
                    <h5 className="text-sm font-semibold text-gray-300 flex items-center justify-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-cyan-400" />
                      Nearby places that might help:
                    </h5>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {prediction.grounding.map((chunk, index) => (
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
                <div className="mt-4">
                  <FeedbackButtons 
                    predictionLog={predictionLog}
                    onFeedback={onFeedback}
                    context="suggestion"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Click "Predict My Mood" to see what you might feel next in this context.
          </div>
        )}
      </div>
      <button
        onClick={onGetPrediction}
        disabled={isLoading || disabled}
        className="w-full sm:w-auto px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Predicting...
          </span>
        ) : (
          'Predict My Mood'
        )}
      </button>
    </div>
  );
};

export default PredictionDisplay;