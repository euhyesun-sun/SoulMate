import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { MoodSelector } from './components/MoodSelector';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { Mood, Message, MOOD_DATA, Session } from './types';
import { getCounselingResponse } from './services/geminiService';
import { classifyStressRoot } from './services/analysisService';
import { Heart, Moon, LogIn, LogOut, User as UserIcon, Loader2, PieChart } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { createSession, addMessage, getUserSessions, updateSessionCategory, completeSession } from './services/firestoreService';

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [mood, setMood] = useState<Mood | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [userSessions, setUserSessions] = useState<Session[]>([]);

  // Fetch sessions for dashboard
  useEffect(() => {
    if (user && isDashboardOpen) {
      getUserSessions().then(setUserSessions);
    }
  }, [user, isDashboardOpen]);

  const handleMoodSelect = useCallback(async (selectedMood: Mood) => {
    setMood(selectedMood);
    setIsLoading(true);
    
    const moodInfo = MOOD_DATA[selectedMood];
    const initialText = `안녕하세요. 오늘 "${moodInfo.label}" 상태이시군요. ${moodInfo.emoji} 그 마음 제가 잘 들어드릴게요. 요즘 어떤 일이 가장 당신을 힘들게 하나요?`;
    
    try {
      if (user) {
        const sessionId = await createSession(selectedMood);
        setCurrentSessionId(sessionId);
        await addMessage(sessionId, 'assistant', initialText);
      }
    } catch (error) {
      console.warn("Could not sync with cloud, proceeding in local-only mode:", error);
    } finally {
      const initialMessage: Message = {
        id: 'init',
        role: 'assistant',
        content: initialText,
        timestamp: Date.now(),
      };
      setMessages([initialMessage]);
      setIsLoading(false);
    }
  }, [user]);

  const performAnalysis = async (sid: string, msgs: Message[]) => {
    if (!user || msgs.length < 3) return; 
    try {
      const category = await classifyStressRoot(msgs);
      await updateSessionCategory(sid, category);
      await completeSession(sid);
      console.log("Analysis completed:", category);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      if (currentSessionId && user) {
        await addMessage(currentSessionId, 'user', content);
      }

      const responseText = await getCounselingResponse(newHistory);
      
      if (currentSessionId && user) {
        await addMessage(currentSessionId, 'assistant', responseText);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMood = async () => {
    if (currentSessionId && messages.length > 1) {
      // Analyze before resetting if it has content
      await performAnalysis(currentSessionId, messages);
    }
    setMood(null);
    setCurrentSessionId(null);
    setMessages([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AtmosphericBackground />
        <Loader2 className="animate-spin text-white/20" size={40} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
      <AtmosphericBackground />

      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            resetMood();
            setIsDashboardOpen(false);
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-all">
            <Heart size={20} className="text-rose-400 fill-rose-400/20" />
          </div>
          <h1 className="text-xl font-serif italic tracking-tight font-light">SoulMate</h1>
        </motion.div>
        
        <div className="flex items-center gap-3">
          {user && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className={`p-2.5 rounded-full transition-all backdrop-blur-md flex items-center gap-2 ${isDashboardOpen ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Statistics"
            >
              <PieChart size={18} />
              <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase px-1">Analytics</span>
            </motion.button>
          )}

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 backdrop-blur-md items-center gap-2 text-[10px] font-light tracking-widest uppercase text-indigo-300"
          >
            <Moon size={12} />
            <span>Rest Area</span>
          </motion.div>
        </div>
      </header>

      <main className="w-full max-w-4xl relative z-0 mt-20">
        <AnimatePresence mode="wait">
          {isDashboardOpen ? (
            <Dashboard 
              key="dashboard"
              sessions={userSessions} 
              onBack={() => setIsDashboardOpen(false)} 
            />
          ) : !mood ? (
            <motion.div
              key="mood-selector"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="text-center mb-12">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/30 uppercase tracking-[0.4em] text-[10px] mb-4"
                >
                  Inner Sanctuary
                </motion.p>
                <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">당신의 쉼표가 되어줄게요.</h2>
                <p className="text-white/50 font-light">
                  오늘 하루 애쓴 당신의 마음을 이곳에 잠시 내려놓으세요.
                </p>
              </div>
              <MoodSelector onSelect={handleMoodSelect} selectedMood={mood} />
            </motion.div>
          ) : (
            <motion.div
              key="chat-interface"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="mt-8"
            >
              <div className="flex justify-between items-end mb-4 px-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{MOOD_DATA[mood].emoji}</span>
                  <div>
                    <h3 className="text-lg font-medium text-white/90">{MOOD_DATA[mood].label}</h3>
                    <p className="text-xs text-white/40">
                      {isLoading && messages.length > 1 ? "생각 중..." : "기록 중..."}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={resetMood}
                  className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                  상담 마치기 및 분석
                </button>
              </div>
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-6 text-[10px] text-white/20 tracking-[0.3em] uppercase">
        Built with soul for your comfort
      </footer>
    </div>
  );
}


