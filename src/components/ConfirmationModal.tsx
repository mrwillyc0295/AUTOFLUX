import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card p-8 rounded-[2.5rem] max-w-sm w-full relative z-10 border-white/10 shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter mb-2 uppercase">{title}</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 py-4 bg-white/5 text-slate-300 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
