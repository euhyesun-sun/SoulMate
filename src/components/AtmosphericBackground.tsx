
import React from 'react';
import { motion } from 'motion/react';

export const AtmosphericBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0502]">
      {/* Primary Atmospheric Gradients */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] bg-orange-950/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[100px] animate-float [animation-delay:2s]" />
        <div className="absolute top-[50%] right-[30%] w-[40%] h-[40%] bg-rose-900/20 rounded-full blur-[80px] animate-float [animation-delay:4s]" />
      </div>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0502] via-transparent to-transparent opacity-80" />
    </div>
  );
};
