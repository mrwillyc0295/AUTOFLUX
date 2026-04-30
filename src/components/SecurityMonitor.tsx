import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Lock, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SecurityMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [health, setHealth] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Hide after 5 seconds
    
    const interval = setInterval(() => {
      setHealth(prev => (prev === 100 ? 99 : 100));
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
        >
          <div className="bg-emerald-950/90 border border-emerald-500/30 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[6px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Seguridad</span>
            </div>
            <div className="w-px h-2 bg-emerald-500/30" />
            <div className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[6px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Bugs: 0</span>
            </div>
            <div className="w-px h-2 bg-emerald-500/30" />
            <div className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[6px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Cifrado</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
