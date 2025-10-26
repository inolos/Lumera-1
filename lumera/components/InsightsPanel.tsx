import React, { useState, useMemo } from 'react';
import { MoodLog, Emotion } from '../types';
import MoodChart from './MoodChart';
import HistoryFilter from './HistoryFilter';
import HistoryView from './HistoryView';
import { ChartBarIcon, FilterIcon } from './icons';

interface Props {
  history: MoodLog[];
}

const InsightsPanel: React.FC<Props> = ({ history }) => {
  const [emotionFilter, setEmotionFilter] = useState<Emotion | null>(null);
  const [dayFilter, setDayFilter] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!emotionFilter && !dayFilter) {
      return history;
    }
    return history.filter(log => {
      const emotionMatch = !emotionFilter || log.emotion === emotionFilter;
      const dayMatch = !dayFilter || log.dayOfWeek === dayFilter;
      return emotionMatch && dayMatch;
    });
  }, [history, emotionFilter, dayFilter]);

  const handleFilterChange = (type: 'emotion' | 'day', value: string) => {
    if (type === 'emotion') {
      const newEmotion = value as Emotion;
      setEmotionFilter(prev => (prev === newEmotion ? null : newEmotion));
    } else {
      setDayFilter(prev => (prev === value ? null : value));
    }
  };
  
  const hasActiveFilters = emotionFilter || dayFilter;

  return (
    <div className="bg-white/5 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-cyan-300 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Mood Frequency
          </h2>
          {history.length > 0 ? <MoodChart history={history} /> : <p className="text-sm text-gray-400 text-center py-4">Log moods to see your frequency chart.</p>}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-cyan-300 flex items-center gap-2">
            <FilterIcon className="w-6 h-6" />
            History & Filters
          </h2>
          <HistoryFilter 
            onFilterChange={handleFilterChange}
            activeEmotion={emotionFilter}
            activeDay={dayFilter}
          />
        </div>
      </div>
      <div className="border-b border-white/10 my-4"></div>
      
      <div>
        <HistoryView history={filteredHistory} />
      </div>

       {hasActiveFilters && (
        <div className="pt-4 mt-4 border-t border-white/10">
          <button 
            onClick={() => { setEmotionFilter(null); setDayFilter(null); }}
            className="w-full text-center py-2 px-4 bg-cyan-500/50 text-white rounded-lg hover:bg-cyan-500/70 transition-colors text-sm font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
