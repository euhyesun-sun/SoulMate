
import React from 'react';
import { motion } from 'motion/react';
import { Mood, MOOD_DATA } from '../types';

interface MoodSelectorProps {
  onSelect: (mood: Mood) => void;
  selectedMood: Mood | null;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood }) => {
  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-light text-center font-serif italic text-white/90"
      >
        오늘 당신의 마음은 어떤 색인가요?
      </motion.h2>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {(Object.entries(MOOD_DATA) as [Mood, typeof MOOD_DATA['peaceful']][]).map(([key, data], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(key)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-2xl glass transition-all duration-500
              ${selectedMood === key ? 'ring-2 ring-white/50 scale-105 bg-white/20' : 'hover:bg-white/15 opacity-70 hover:opacity-100'}
            `}
          >
            <span className="text-4xl">{data.emoji}</span>
            <span className="text-xs font-medium tracking-tighter opacity-80">{data.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
