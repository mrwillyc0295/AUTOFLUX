import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, LayoutGrid } from 'lucide-react';
import { Car } from '../types';
import { cn } from '../lib/utils';

interface FloatingComparisonBarProps {
  comparisonList: Car[];
  onToggle: (car: Car) => void;
  onClear: () => void;
  onViewComparison: () => void;
  isVisible: boolean;
}

export const FloatingComparisonBar: React.FC<FloatingComparisonBarProps> = ({
  comparisonList,
  onToggle,
  onClear,
  onViewComparison,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {comparisonList.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-2xl px-4"
        >
          <div className="glass-card p-4 rounded-3xl shadow-2xl border-blue-500/30 flex items-center justify-between gap-6 bg-[#0B0F1A]/80 backdrop-blur-xl">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              {comparisonList.map(car => (
                <div key={car.id} className="relative shrink-0 group">
                  <img 
                    src={car.image} 
                    alt={car.model} 
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-blue-500/50 transition-colors" 
                    referrerPolicy="no-referrer" 
                  />
                  <button 
                    onClick={() => onToggle(car)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg border-2 border-[#0B0F1A] hover:bg-red-600 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold uppercase tracking-widest border border-white/10">
                    {car.make} {car.model}
                  </div>
                </div>
              ))}
              {comparisonList.length < 3 && (
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500">
                  <Plus className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={onClear}
                className="px-4 py-2 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Limpiar
              </button>
              <button 
                onClick={onViewComparison}
                disabled={comparisonList.length < 2}
                className="px-6 py-3 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Comparar ({comparisonList.length})
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
