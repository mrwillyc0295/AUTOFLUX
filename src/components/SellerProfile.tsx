import React from 'react';
import { Car } from '../types';
import { ShieldCheck, ArrowLeft, Share2, Calendar, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { OptimizedImage } from './OptimizedImage';

interface SellerProfileProps {
  seller: {
    name: string;
    photo: string;
    bio: string;
  };
  cars: Car[];
  onBack: () => void;
  onShare: (car: Car) => void;
  onSelectCar: (car: Car) => void;
}

export const SellerProfile: React.FC<SellerProfileProps> = ({ seller, cars, onBack, onShare, onSelectCar }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#0B0F1A]">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-10 text-slate-500 hover:text-white font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Marketplace
        </button>

        <div className="glass-card rounded-[3rem] p-12 border-white/10 shadow-2xl mb-16 flex flex-col md:flex-row items-center md:items-start gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative shrink-0">
            <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 flex items-center justify-center">
              {seller.photo ? (
                <OptimizedImage 
                  src={seller.photo} 
                  alt={seller.name} 
                  className="w-full h-full object-cover" 
                  containerClassName="w-full h-full"
                  width={300}
                />
              ) : (
                <span className="text-6xl font-black text-white/20">{seller.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl border-4 border-[#0B0F1A] flex items-center justify-center text-white shadow-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Dealer Verificado</p>
              <h2 className="text-5xl font-extrabold text-white tracking-tighter">{seller.name}</h2>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-medium">
              {seller.bio || "Este dealer aún no ha añadido una biografía profesional."}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vehículos</p>
                <p className="text-2xl font-extrabold text-white">{cars.length}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center md:text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estatus</p>
                <p className="text-sm font-bold text-green-400 uppercase tracking-widest">Activo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-extrabold text-white tracking-tighter">Inventario de {seller.name.split(' ')[0]}</h3>
            <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <motion.div 
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
                onClick={() => onSelectCar(car)}
              >
                <div className="relative h-56 overflow-hidden">
                  <OptimizedImage 
                    src={car.image} 
                    alt={car.model} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    containerClassName="w-full h-full"
                    width={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-6">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">
                      {car.year}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(car);
                    }}
                    className="absolute top-4 right-6 w-8 h-8 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all group/share"
                    title="Compartir"
                  >
                    <Share2 className="w-3.5 h-3.5 group-hover/share:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-bold text-white tracking-tight">{car.make} {car.model}</h4>
                  <div className="flex items-center gap-3 mt-2 mb-6">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precio</span>
                      <span className="text-2xl font-bold text-white font-display">${car.price.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kilometraje</span>
                      <p className="text-sm font-bold text-slate-300 font-mono">{car.mileage.toLocaleString()} KM</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(car);
                    }}
                    className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:border-blue-500 transition-all shadow-xl"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir Post
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
