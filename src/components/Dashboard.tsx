import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Session, STRESS_CATEGORIES, StressCategory } from '../types';
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface DashboardProps {
  sessions: Session[];
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions, onBack }) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize all categories with 0
    Object.keys(STRESS_CATEGORIES).forEach(cat => {
      counts[cat] = 0;
    });

    sessions.forEach(s => {
      if (s.category) {
        counts[s.category] = (counts[s.category] || 0) + 1;
      }
    });

    return Object.entries(STRESS_CATEGORIES).map(([key, info]) => ({
      name: info.label,
      fullKey: key,
      value: counts[key]
    })).filter(d => d.value > 0);
  }, [sessions]);

  const totalSessions = sessions.length;
  const analyzedSessions = sessions.filter(s => s.category).length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-5xl mx-auto p-4 space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>상담실로 돌아가기</span>
        </button>
        <h2 className="text-2xl font-serif italic text-white/90">당신의 마음 통계</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">Total Sessions</p>
            <p className="text-3xl font-serif font-light">{totalSessions}</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">Analyzed</p>
            <p className="text-3xl font-serif font-light">{analyzedSessions}</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">Completion Rate</p>
            <p className="text-3xl font-serif font-light">
              {totalSessions > 0 ? Math.round((analyzedSessions / totalSessions) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="glass p-8 rounded-[40px] h-[400px]">
          <h3 className="text-lg font-serif italic mb-6 text-white/70">스트레스 분야 분석</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 20, 20, 0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropBlur: '10px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 10, 10, 0]}
                  barSize={32}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STRESS_CATEGORIES[entry.fullKey as StressCategory].color.replace('bg-', 'rgb(')} 
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-white/20 italic">
              아직 충분한 상담 데이터가 없어요.
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass p-8 rounded-[40px] space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
          <h3 className="text-lg font-serif italic mb-2 text-white/70">최근 상담 분석 목록</h3>
          <div className="space-y-3">
            {sessions.filter(s => s.category).map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{STRESS_CATEGORIES[s.category!].label}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                    {new Date(s.createdAt?.toMillis() || 0).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${STRESS_CATEGORIES[s.category!].color} text-black/80`}>
                  Analysis Done
                </div>
              </div>
            ))}
            {analyzedSessions === 0 && (
              <p className="text-center py-10 text-white/20 italic">최근 분석된 상담이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
