import React, { useState, useMemo } from 'react';
import { Calculator, Percent, DollarSign, Settings2 } from 'lucide-react';

export const CostCalculator = ({ carPrice }: { carPrice: number }) => {
  const [shipping, setShipping] = useState(1500);
  const [taxMode, setTaxMode] = useState<'percentage' | 'fixed'>('percentage');
  const [taxPercentage, setTaxPercentage] = useState(20);
  const [fixedTax, setFixedTax] = useState(carPrice * 0.2);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const calculatedTaxes = useMemo(() => {
    return taxMode === 'percentage' 
      ? carPrice * (taxPercentage / 100) 
      : fixedTax;
  }, [carPrice, taxMode, taxPercentage, fixedTax]);

  const total = useMemo(() => carPrice + shipping + calculatedTaxes, [carPrice, shipping, calculatedTaxes]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-500" />
          Calculadora de Costos
        </h3>
        <button 
          onClick={() => setIsConfiguring(!isConfiguring)}
          className={`p-1.5 rounded-lg transition-colors ${isConfiguring ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-400 bg-slate-800/50'}`}
          title="Configurar impuestos y envío"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4 font-mono">
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400">Precio Vehículo</span>
          <span className="text-white font-bold">${carPrice.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400">Envío</span>
          {isConfiguring ? (
            <div className="flex items-center gap-1">
              <span className="text-slate-500">$</span>
              <input 
                type="number" 
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value))}
                className="bg-slate-800 text-white px-2 py-1 rounded-lg w-24 text-right outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700 text-sm"
              />
            </div>
          ) : (
            <span className="text-white font-bold">${shipping.toLocaleString()}</span>
          )}
        </div>
        
        <div className="pt-2 border-t border-slate-800/50">
          <div className="flex justify-between text-sm items-center mb-3">
            <span className="text-slate-400">Impuestos</span>
            {isConfiguring && (
              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setTaxMode('percentage')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors uppercase tracking-wider flex items-center ${taxMode === 'percentage' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Percent className="w-3 h-3 mr-1" /> %
                </button>
                <button
                  onClick={() => setTaxMode('fixed')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors uppercase tracking-wider flex items-center ${taxMode === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <DollarSign className="w-3 h-3 mr-1" /> Fijo
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-sm items-center">
            {isConfiguring ? (
              <div className="flex-1 flex justify-end">
                {taxMode === 'percentage' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs uppercase tracking-widest">Porcentaje:</span>
                    <input 
                      type="number" 
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(Number(e.target.value))}
                      className="bg-slate-800 text-white px-2 py-1 rounded-lg w-20 text-right outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700 text-sm"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs uppercase tracking-widest">Monto:</span>
                    <span className="text-slate-500">$</span>
                    <input 
                      type="number" 
                      value={fixedTax}
                      onChange={(e) => setFixedTax(Number(e.target.value))}
                      className="bg-slate-800 text-white px-2 py-1 rounded-lg w-24 text-right outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700 text-sm"
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className="text-slate-500 text-xs">
                  {taxMode === 'percentage' ? `(${taxPercentage}%)` : '(Valor Fijo)'}
                </span>
                <span className="text-white font-bold">${calculatedTaxes.toLocaleString()}</span>
              </>
            )}
          </div>
          {isConfiguring && (
            <div className="flex justify-end mt-3 pt-2 border-t border-slate-800/30">
              <span className="text-slate-400 text-xs mr-2">Total Impuestos:</span>
              <span className="text-blue-400 font-bold text-sm">${calculatedTaxes.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-center">
          <span className="text-slate-200 font-bold uppercase text-xs">Total Estimado</span>
          <span className="text-blue-400 font-extrabold text-2xl tracking-tighter">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
