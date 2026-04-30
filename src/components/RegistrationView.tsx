import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle, Loader2, LayoutGrid, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface RegistrationViewProps {
  onRegister: (name: string, whatsapp: string, role: 'marketplace' | 'seller') => void;
  onSecretAdminClick?: () => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegister, onSecretAdminClick }) => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<'marketplace' | 'seller'>('marketplace');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // BYPASS GEOLOCATION FOR DEVELOPMENT
  const isVenezuela = true; 
  const isUSA = true; 
  const isLoadingGeo = false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-6 md:p-8 rounded-[2rem] max-w-sm w-full relative z-10 border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-black text-white tracking-tighter italic">
              Auto<span className="text-blue-600">Flux</span>
            </h1>
            <div className="w-8 h-1 bg-blue-600 mx-auto mt-1 rounded-full shadow-lg shadow-blue-500/50" />
          </div>
          <h2 
            onClick={onSecretAdminClick}
            className="text-xl font-black text-white tracking-tighter mb-1 cursor-pointer hover:text-blue-400 transition-colors uppercase"
          >
            TRABAJO EXPRESS
          </h2>
          <p className="text-slate-400 font-medium text-[8px] uppercase tracking-widest">
            {step === 'role' ? 'ENTRADA RÁPIDA SIN PERMISOS' : 'REGISTRO DE AGENTE DEALER'}
          </p>
        </div>

        {step === 'role' ? (
          <div className="space-y-4">
            {/* Botón Marketplace - ACCESO PREMIUM VENEZUELA */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <button 
                onClick={() => onRegister('Invitado', '', 'marketplace')}
                className="w-full py-6 px-5 rounded-[1.5rem] font-extrabold text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl shadow-blue-600/30 group-hover:shadow-blue-500/40 cursor-pointer border border-white/10"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LayoutGrid className="w-12 h-12" />
                </div>
                <span className="flex items-center justify-center font-black">
                  <span className="text-xl mr-2">🇻🇪</span>
                  ACCESO AL MARKETPLACE
                </span>
                <span className="text-[8px] text-blue-100/70 uppercase tracking-widest font-black bg-white/10 px-3 py-0.5 rounded-full backdrop-blur-sm">
                  ENTRADA EXPRESS • SIN REGISTRO
                </span>
                <p className="text-[8px] text-blue-200/50 font-medium lowercase tracking-normal normal-case italic">
                  Explora el inventario más exclusivo de Venezuela inmediatamente.
                </p>
              </button>
            </motion.div>

            {/* Botón Dealer Partner - USA PROGRAM */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <button 
                onClick={() => {
                  setSelectedRole('seller');
                  setStep('form');
                }}
                className="w-full py-6 px-5 rounded-[1.5rem] font-extrabold text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 relative overflow-hidden bg-slate-900 text-white border border-blue-500/30 hover:border-blue-400 group-hover:bg-slate-800 cursor-pointer shadow-xl"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <span className="flex items-center justify-center font-black">
                  <span className="text-xl mr-2">🇺🇸</span>
                  DEALER PARTNER PROGRAM
                </span>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black border border-white/10 px-3 py-0.5 rounded-full">
                  SOLO PARA AGENTE EN USA
                </span>
                <p className="text-[8px] text-slate-500 font-medium lowercase tracking-normal normal-case italic">
                  Programa exclusivo para agentes y dealers en Florida.
                </p>
              </button>
            </motion.div>

            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-8">
              AutoFlux.io Global Infrastructure
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Ej: Alejandro Valera" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-white placeholder-slate-600 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] ml-1">WhatsApp</label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-slate-400 font-medium flex items-center gap-2">
                  <span>+1</span>
                </div>
                <input 
                  type="text" 
                  placeholder="305 123 4567" 
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-5 pl-24 bg-white/5 rounded-2xl border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-white placeholder-slate-600 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setStep('role')}
                className="w-1/3 py-5 bg-white/5 text-slate-300 border border-white/10 rounded-2xl font-extrabold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Volver
              </button>
              <button 
                onClick={() => onRegister(name, whatsapp, selectedRole)}
                disabled={!name || !whatsapp}
                className="w-2/3 py-5 bg-blue-600 text-white rounded-2xl font-extrabold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-blue-600/20"
              >
                Ingresar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
