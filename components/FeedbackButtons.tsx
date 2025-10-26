import React from 'react';
import { PredictionLog } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon } from './icons';

interface Props {
  predictionLog: PredictionLog;
  onFeedback: (predictionId: string, feedbackType: 'emotion' | 'suggestion', value: 'accurate' | 'inaccurate' | 'helpful' | 'not_helpful') => void;
  context: 'display' | 'alert' | 'history' | 'suggestion' | 'suggestionAlert' | 'suggestionHistory';
}

const FeedbackButtons: React.FC<Props> = ({ predictionLog, onFeedback, context }) => {
  const isSuggestion = context.startsWith('suggestion');
  const feedbackType = isSuggestion ? 'suggestion' : 'emotion';
  const positiveValue = isSuggestion ? 'helpful' : 'accurate';
  const negativeValue = isSuggestion ? 'not_helpful' : 'inaccurate';
  const currentFeedback = predictionLog.prediction.feedback?.[feedbackType];

  const baseClasses = "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border";
  const smallClasses = "px-2 py-1 gap-1";

  const getButtonClasses = (value: string) => {
    let classes = `${baseClasses} `;
    if (context === 'alert' || context === 'suggestionAlert') {
        classes += `${smallClasses} `;
    }

    if (currentFeedback === value) {
      if (value === positiveValue) {
        return classes + 'bg-green-500/30 border-green-400 text-green-300';
      }
      return classes + 'bg-red-500/30 border-red-400 text-red-300';
    }
    return classes + 'bg-white/10 border-transparent text-gray-300 hover:bg-white/20';
  };
  
  const title = isSuggestion ? "Was this suggestion helpful?" : "Was this prediction accurate?";
  const positiveText = isSuggestion ? "Helpful" : "Accurate";
  const negativeText = isSuggestion ? "Not Helpful" : "Inaccurate";


  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-400 font-medium">{title}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => onFeedback(predictionLog.id, feedbackType, positiveValue as any)}
          className={getButtonClasses(positiveValue)}
          aria-pressed={currentFeedback === positiveValue}
        >
          <ThumbsUpIcon className="w-4 h-4" />
          <span>{positiveText}</span>
        </button>
        <button
          onClick={() => onFeedback(predictionLog.id, feedbackType, negativeValue as any)}
          className={getButtonClasses(negativeValue)}
          aria-pressed={currentFeedback === negativeValue}
        >
          <ThumbsDownIcon className="w-4 h-4" />
          <span>{negativeText}</span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackButtons;
