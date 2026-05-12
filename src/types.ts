
export type Mood = 'peaceful' | 'tired' | 'stressed' | 'sad' | 'angry' | 'happy';

export type StressCategory = 'Interpersonal' | 'Overwork' | 'Career' | 'Personal' | 'Health' | 'Other';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  userId: string;
  mood: Mood;
  category?: StressCategory;
  status: 'active' | 'completed';
  createdAt: any;
  updatedAt: any;
}

export const STRESS_CATEGORIES: Record<StressCategory, { label: string; color: string }> = {
  Interpersonal: { label: '대인 관계', color: 'bg-blue-400' },
  Overwork: { label: '과도한 업무', color: 'bg-rose-400' },
  Career: { label: '커리어/미래', color: 'bg-amber-400' },
  Personal: { label: '개인적 고민', color: 'bg-emerald-400' },
  Health: { label: '건강/신체', color: 'bg-indigo-400' },
  Other: { label: '기타/복합', color: 'bg-slate-400' },
};

export interface UserState {
  mood: Mood | null;
  history: Message[];
}

export const MOOD_DATA: Record<Mood, { emoji: string; label: string; color: string }> = {
  peaceful: { emoji: '😌', label: '평온해요', color: 'bg-emerald-400' },
  tired: { emoji: '🥱', label: '지쳤어요', color: 'bg-amber-400' },
  stressed: { emoji: '😫', label: '스트레스 쌓여요', color: 'bg-rose-400' },
  sad: { emoji: '😢', label: '슬퍼요', color: 'bg-indigo-400' },
  angry: { emoji: '😤', label: '화가 나요', color: 'bg-red-500' },
  happy: { emoji: '😊', label: '즐거워요', color: 'bg-sky-400' },
};
