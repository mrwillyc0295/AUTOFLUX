import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Truck, Package, MapPin } from 'lucide-react';

export const ShippingTracker = ({ status }: { status: 'compra' | 'inspeccion' | 'puerto' | 'aduana' | 'entrega' }) => {
  const steps = [
    { id: 'compra', label: 'Compra', icon: Package },
    { id: 'inspeccion', label: 'Inspección', icon: CheckCircle },
    { id: 'puerto', label: 'Puerto', icon: Truck },
    { id: 'aduana', label: 'Aduana', icon: MapPin },
    { id: 'entrega', label: 'Entrega', icon: CheckCircle },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Seguimiento de Logística</h3>
      <div className="flex justify-between items-center relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800 -z-0" />
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
              <motion.div 
                initial={false}
                animate={{ 
                  backgroundColor: isActive ? '#2563eb' : '#1e293b',
                  boxShadow: isActive ? '0 0 20px rgba(37, 99, 235, 0.5)' : 'none'
                }}
                className="p-3 rounded-full"
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
              <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                {step.label.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
