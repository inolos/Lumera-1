import React, { useMemo } from 'react';
import { MoodLog, Emotion } from '../types';
import { EMOTIONS } from '../constants';

interface Props {
  history: MoodLog[];
}

const MoodChart: React.FC<Props> = ({ history }) => {
  const moodCounts = useMemo(() => {
    const counts = Object.values(Emotion).reduce((acc, emotion) => {
      acc[emotion] = 0;
      return acc;
    }, {} as Record<Emotion, number>);

    history.forEach(log => {
      if (counts[log.emotion] !== undefined) {
        counts[log.emotion]++;
      }
    });
    return counts;
  }, [history]);

  const maxCount = Math.max(...Object.values(moodCounts), 1); // Avoid division by zero

  return (
    <div className="flex justify-between items-end h-32 bg-white/5 p-4 rounded-lg space-x-2">
      {Object.values(Emotion).map(emotion => {
        const count = moodCounts[emotion];
        const { color, icon: Icon } = EMOTIONS[emotion];
        const heightPercentage = (count / maxCount) * 100;

        return (
          <div key={emotion} className="flex-1 flex flex-col items-center justify-end h-full group">
            <div className="text-white text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {count}
            </div>
            <div
              className={`w-full rounded-t-md transition-all duration-500 ease-out ${color.replace('text', 'bg')}`}
              style={{ height: `${heightPercentage}%` }}
              title={`${emotion}: ${count} ${count === 1 ? 'time' : 'times'}`}
            ></div>
            <Icon className={`w-5 h-5 mt-2 ${color}`} />
          </div>
        );
      })}
    </div>
  );
};

export default MoodChart;
