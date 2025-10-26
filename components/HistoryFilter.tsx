import React from 'react';
import { Emotion } from '../types';
import { EMOTIONS, DAYS_OF_WEEK } from '../constants';

interface Props {
  onFilterChange: (type: 'emotion' | 'day', value: string) => void;
  activeEmotion: Emotion | null;
  activeDay: string | null;
}

const HistoryFilter: React.FC<Props> = ({ onFilterChange, activeEmotion, activeDay }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Filter by Emotion</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(Emotion).map(emotion => {
            const { icon: Icon, color } = EMOTIONS[emotion];
            const isActive = activeEmotion === emotion;
            return (
              <button
                key={emotion}
                onClick={() => onFilterChange('emotion', emotion)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                  isActive
                    ? `${color.replace('text', 'bg')}/30 ${color.replace('text', 'border')}`
                    : `bg-white/10 border-transparent hover:bg-white/20`
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? color : 'text-gray-300'}`} />
                <span className={isActive ? 'text-white' : 'text-gray-300'}>{emotion}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Filter by Day</h3>
        <div className="grid grid-cols-4 gap-2">
          {DAYS_OF_WEEK.map(day => {
            const isActive = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => onFilterChange('day', day)}
                className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive ? 'bg-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryFilter;
