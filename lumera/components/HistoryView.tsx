import React from 'react';
import { MoodLog } from '../types';
import { EMOTIONS } from '../constants';

interface Props {
  history: MoodLog[];
}

const HistoryView: React.FC<Props> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>No moods match the current filters.</p>
        <p className="text-sm">Try clearing the filters to see all entries.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 mt-4">
      {history.map((log) => {
        const { color, icon: Icon } = EMOTIONS[log.emotion];
        return (
          <li key={log.id} className="bg-white/5 p-3 rounded-lg flex flex-col transition-colors hover:bg-white/10">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full bg-black/20 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${color}`}>{log.emotion}</p>
                <p className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right text-xs text-gray-400">
                  <p>{log.weather.condition}</p>
                  <p>{log.weather.temperature}°C</p>
              </div>
            </div>
            {log.note && (
              <p className="text-sm text-gray-300 mt-2 pt-2 border-t border-white/10">
                {log.note}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default HistoryView;
