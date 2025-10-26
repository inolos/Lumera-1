import React, { useState } from 'react';
import { Emotion } from '../types';
import { EMOTIONS } from '../constants';

interface Props {
  onLogMood: (emotion: Emotion, note: string) => void;
  disabled: boolean;
}

const MoodLogger: React.FC<Props> = ({ onLogMood, disabled }) => {
  const [loggedEmotion, setLoggedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');

  const handleLog = (emotion: Emotion) => {
    onLogMood(emotion, note);
    setLoggedEmotion(emotion);
    setNote(''); // Clear note after logging
    setTimeout(() => setLoggedEmotion(null), 2000); // Reset visual feedback after 2 seconds
  };

  return (
    <div className="space-y-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about why you're feeling this way... (optional)"
        className="w-full p-3 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-colors text-white placeholder-gray-400"
        rows={3}
        disabled={disabled}
      />
      {loggedEmotion && (
        <div className="text-center p-3 bg-green-500/20 text-green-300 rounded-lg transition-opacity">
          Logged feeling: {loggedEmotion}. Thanks for sharing!
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.values(Emotion).map((emotion) => {
          const { color, icon: Icon } = EMOTIONS[emotion];
          return (
            <button
              key={emotion}
              onClick={() => handleLog(emotion)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                loggedEmotion === emotion
                  ? 'bg-green-500/30 border-2 border-green-400'
                  : 'bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-cyan-400/20'
              }`}
            >
              <Icon className={`w-8 h-8 ${color}`} />
              <span className={`mt-2 font-medium text-sm ${color}`}>{emotion}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodLogger;