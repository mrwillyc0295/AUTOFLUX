import React from 'react';
import { motion } from 'motion/react';
import { X, Check, ArrowLeft, Fuel, Gauge, Settings2, Calendar, MapPin, DollarSign, Star, Plus } from 'lucide-react';
import { Car } from '../types';
import { cn } from '../lib/utils';

interface ComparisonViewProps {
  selectedCars: Car[];
  onRemoveCar: (carId: string) => void;
  onBack: () => void;
  onSelectCar: (car: Car) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  selectedCars, 
  onRemoveCar, 
  onBack,
  onSelectCar
}) => {
  const specs = [
    { label: 'Año', key: 'year', icon: Calendar },
    { label: 'Precio', key: 'price', icon: DollarSign, format: (val: number) => `$${val.toLocaleString()}` },
    { label: 'Kilometraje', key: 'mileage', icon: Gauge, format: (val: number) => `${val.toLocaleString()} km` },
    { label: 'Transmisión', key: 'transmission', icon: Settings2 },
    { label: 'Combustible', key: 'fuelType', icon: Fuel },
    { label: 'Motor', key: 'engineLiters', icon: Gauge, format: (val: string) => val ? `${val}L` : 'N/A' },
    { label: 'Ubicación', key: 'location', icon: MapPin },
  ];

  const getMaintenanceScore = (car: Car) => {
    let score = 3; // Baseline
    const make = car.make.toLowerCase();
    
    const reliableMakes = ['toyota', 'honda', 'lexus', 'mazda', 'subaru', 'mitsubishi', 'nissan'];
    const premiumMakes = ['bmw', 'mercedes-benz', 'porsche', 'land rover', 'audi', 'cadillac', 'infiniti', 'lexus']; // Lexus is both reliable but expensive parts

    if (reliableMakes.includes(make)) score += 1;
    if (premiumMakes.includes(make)) score -= 1;
    
    // EV/Hybrid bonus
    if (car.fuelType?.toLowerCase().includes('electric') || car.make === 'Tesla') score += 1;
    
    // Year bonus
    if (car.year >= 2024) score += 1;
    if (car.year < 2018) score -= 1;

    return Math.max(1, Math.min(5, score));
  };

  const getBestValue = (key: string, cars: Car[]) => {
    if (cars.length < 2) return null;
    
    if (key === 'price' || key === 'mileage') {
      const values = cars.map(c => c[key as keyof Car] as number);
      return Math.min(...values);
    }
    
    if (key === 'year') {
      const values = cars.map(c => c[key as keyof Car] as number);
      return Math.max(...values);
    }
    
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#0B0F1A] relative scrollbar-hide">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Volver al Marketplace
          </button>
          <h2 className="text-4xl font-extrabold text-white tracking-tighter">Comparar Vehículos</h2>
        </div>

        {selectedCars.length === 0 ? (
          <div className="glass-card p-20 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings2 className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No hay vehículos seleccionados</h3>
            <p className="text-slate-500 mb-8">Selecciona al menos dos vehículos para comparar sus especificaciones.</p>
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all"
            >
              Ir al Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedCars.map((car) => {
              const maintenanceScore = getMaintenanceScore(car);
              
              return (
                <motion.div 
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                    <button 
                      onClick={() => onRemoveCar(car.id)}
                      className="absolute top-4 right-4 w-8 h-8 bg-red-500/20 backdrop-blur-md border border-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-6">
                      <h3 className="text-xl font-bold text-white tracking-tight">{car.make} {car.model}</h3>
                      <p className="text-blue-400 font-bold text-sm">${car.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1">
                    {/* Maintenance Score Section */}
                    <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Puntuación de Mantenimiento</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={cn(
                                "w-4 h-4 transition-all",
                                star <= maintenanceScore ? "text-yellow-500 fill-yellow-500 scale-110" : "text-slate-700"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-white">
                          {maintenanceScore}/5 <span className="text-slate-500 font-medium">(Estimado)</span>
                        </span>
                      </div>
                    </div>

                    {specs.map((spec) => {
                      const value = car[spec.key as keyof Car];
                      const bestValue = getBestValue(spec.key, selectedCars);
                      const isBest = bestValue !== null && value === bestValue;
                      const Icon = spec.icon;

                      return (
                        <div key={spec.key} className={cn(
                          "p-4 rounded-2xl border transition-all",
                          isBest ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5"
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-3.5 h-3.5", isBest ? "text-green-400" : "text-slate-500")} />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{spec.label}</span>
                            </div>
                            {isBest && (
                              <div className="flex items-center gap-1 text-[8px] font-black text-green-400 uppercase tracking-tighter">
                                <Check className="w-2.5 h-2.5" />
                                Mejor Opción
                              </div>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm font-bold",
                            isBest ? "text-green-400" : "text-white"
                          )}>
                            {spec.format ? (spec.format as any)(value) : (value || 'N/A')}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-6 pt-0">
                    <button 
                      onClick={() => onSelectCar(car)}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </motion.div>
              );
            })}
            
            {selectedCars.length < 3 && (
              <button 
                onClick={onBack}
                className="glass-card rounded-[2.5rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center p-10 hover:bg-white/5 transition-all group min-h-[400px]"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Agregar Vehículo</p>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

