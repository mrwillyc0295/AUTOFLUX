import React, { useState } from 'react';
import { Truck, DollarSign, CheckCircle2 } from 'lucide-react';

export const ShippingConfig = () => {
  const [shippingOffered, setShippingOffered] = useState(true);
  const [shippingCost, setShippingCost] = useState(2250); // Midpoint of 1500-3000

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-blue-500/20 shadow-xl bg-slate-900/50">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
          <Truck className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Configuración de Logística</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Define tarifas y disponibilidad de entrega</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-sm font-bold text-slate-200">¿Ofreces entrega de vehículos?</span>
          <button
            onClick={() => setShippingOffered(!shippingOffered)}
            className={`w-14 h-7 rounded-full transition-colors flex items-center px-1 ${shippingOffered ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${shippingOffered ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {shippingOffered && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Costo Estimado de Envío</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 rounded-2xl border border-slate-700 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Recomendación: Entre $1,500 y $3,000 dependiendo del tamaño del vehículo.</p>
          </div>
        )}

        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4">
          <CheckCircle2 className="w-4 h-4" /> Guardar Configuración
        </button>
      </div>
    </div>
  );
};
