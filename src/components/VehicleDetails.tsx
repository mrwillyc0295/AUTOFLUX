import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { 
  MapPin, Calendar, Gauge, Settings2, Fuel, 
  ArrowLeft, Share2, CreditCard, ShieldCheck,
  Zap, Clock, CheckCircle2, Loader2, Tag,
  ChevronLeft, ChevronRight, Video, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CostCalculator } from './CostCalculator';
import { APP_CONFIG } from '../config';
import { OptimizedImage } from './OptimizedImage';

interface VehicleDetailsProps {
  car: Car;
  onBack: () => void;
  onShare: (car: Car) => void;
  onReserve: () => void;
  onMakeOffer: (amount: number) => void;
  onRequestVideo: (car: Car) => void;
  onChatWithAdvisor: (car: Car) => void;
  chatSidebar?: React.ReactNode;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({ 
  car, onBack, onShare, onReserve, onMakeOffer, onRequestVideo, onChatWithAdvisor, chatSidebar 
}) => {
  // --- SAFETY GUARD: SI EL CARRO NO EXISTE, VOLVER AL MARKETPLACE ---
  useEffect(() => {
    if (!car) {
      toast.error("Vehículo no encontrado", {
        description: "El vehículo seleccionado ya no está disponible o el enlace es inválido."
      });
      const timer = setTimeout(onBack, 2000);
      return () => clearTimeout(timer);
    }
  }, [car, onBack]);

  const [isReserving, setIsReserving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [isOffering, setIsOffering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = car.images && car.images.length > 0 ? [car.image, ...car.images] : [car.image];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleReserve = () => {
    setIsReserving(true);
    // Simulate a brief processing time for fluid animation before navigating
    setTimeout(() => {
      setIsReserving(false);
      onReserve();
    }, 600);
  };

  const handleMakeOffer = () => {
    const amount = parseInt(offerAmount);
    if (!amount || amount <= 0) return;
    setIsOffering(true);
    setTimeout(() => {
      onMakeOffer(amount);
      setOfferAmount('');
      setIsOffering(false);
    }, 1000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    onShare(car);
    setTimeout(() => setIsSharing(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0B0F1A] scrollbar-hide">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-8 text-slate-500 hover:text-white font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Marketplace
        </button>

        <div className="grid grid-cols-1 gap-10">
          {/* Main Image Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[3rem] overflow-hidden border-white/10 shadow-2xl relative"
          >
            <div className="aspect-[16/9] relative group">
              <OptimizedImage 
                src={allImages[currentImageIndex]} 
                alt={`${car.make} ${car.model} - Imagen ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover transition-opacity duration-300"
                containerClassName="w-full h-full"
                width={1200}
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />

              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 backdrop-blur text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 backdrop-blur text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-2 z-10">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(i);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === i ? 'bg-blue-500 w-4' : 'bg-white/50 hover:bg-white'} `}
                      />
                    ))}
                  </div>
                </>
              )}
              
              <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6 z-20">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {APP_CONFIG.logic_rules.show_usa_flag && (
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <span className="text-xs">🇺🇸</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-blue-600 px-3 py-1 rounded-full border border-blue-500/50">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{car.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{car.year}</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                    {car.make} <span className="text-blue-500">{car.model}</span>
                  </h1>
                </div>
                <div className="text-left md:text-right">
                  <div className={cn(
                    "inline-block px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] mb-3 border shadow-sm",
                    car.status === 'active'
                      ? "bg-green-500/20 border-green-500/30 text-green-400 shadow-green-900/40 animate-pulse"
                      : car.status === 'reserved'
                        ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                        : "bg-red-600 border-red-500 text-white shadow-red-900/40 animate-pulse"
                  )}>
                    {car.status === 'active' ? '✅ Disponible' : car.status === 'reserved' ? 'Apartado' : '🔥 Vendido'}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Precio de Oferta</p>
                  <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">${car.price.toLocaleString()}</p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-colors shadow-2xl"
                title="Compartir"
              >
                <AnimatePresence mode="wait">
                  {isSharing ? (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="share"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              
              {/* Video Player */}
              {car.video && (
                <div className="glass-card p-6 rounded-[2.5rem] border-white/10 overflow-hidden relative group">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    Video del Vehículo
                  </h3>
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden">
                    <video 
                      src={car.video} 
                      controls
                      controlsList="nodownload"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Technical Specs */}
              <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  Especificaciones Técnicas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Settings2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Transmisión</span>
                    </div>
                    <p className="text-white font-bold">{car.transmission || 'Automático'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Fuel className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Motor</span>
                    </div>
                    <p className="text-white font-bold">{car.fuelType || 'Gasolina'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Gauge className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Cilindrada</span>
                    </div>
                    <p className="text-white font-bold">{car.engineLiters ? `${car.engineLiters}L` : '4.0L'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Kilometraje</span>
                    </div>
                    <p className="text-white font-bold">{car.mileage.toLocaleString()} KM</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Condición</span>
                    </div>
                    <p className="text-white font-bold">{car.condition || 'Usado'}</p>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="glass-card p-8 rounded-[2.5rem] border-white/10 flex flex-col gap-8 hover:bg-white/5 transition-colors group">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-white/10 bg-slate-800 flex items-center justify-center shadow-2xl shadow-black/40 group-hover:scale-105 transition-transform duration-500">
                      {car.sellerPhoto ? (
                        <OptimizedImage 
                          src={car.sellerPhoto} 
                          alt={car.seller} 
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                          width={150}
                        />
                      ) : (
                        <span className="text-3xl font-black text-white/20">{car.seller.charAt(0)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-2xl border-4 border-[#0B0F1A] flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">{car.seller}</h3>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full border border-blue-500/20">
                        PRO SELLER
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium mb-4">{car.sellerBio}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onRequestVideo(car)}
                        className="flex-1 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Solicitar Video ($50)
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChatWithAdvisor(car)}
                        className="flex-1 py-4 bg-blue-600 border border-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Conversar
                      </motion.button>
                    </div>
                  </div>
                  <div className="hidden lg:block text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Estatus Cuenta</p>
                    <span className="px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-green-500/20 shadow-lg shadow-green-500/5">
                      VERIFICADO
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Chat Advisor Render Slot */}
              {chatSidebar}
            </div>

            {/* Action Sidebar */}
            <div className="space-y-6">
              <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-600/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Proceso de Compra</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">1</div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">Reserva</p>
                      <p className="text-[10px] text-slate-400 mt-1">Congela el precio y asegura tu turno de atención.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">2</div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inspección</p>
                      <p className="text-[10px] text-slate-500 mt-1">Video detallado y revisión técnica completa.</p>
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReserve}
                  disabled={isReserving}
                  className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] border-2 border-indigo-400/50 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {isReserving ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        PROCESANDO...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        <CreditCard className="w-5 h-5" />
                        RESERVAR AHORA
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* --- SISTEMA DE REFERIDOS ESTRATÉGICOS --- */}
              <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 shadow-lg shadow-blue-900/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Share2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Programa de Referidos</h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-6 font-medium">
                  Convierte este {car.make} en tu oportunidad de negocio. Comparte este perfil y gana una comisión si se concreta la venta.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tu Nombre (Para rastreo)</label>
                    <input 
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      id="referrer-name-details"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      const nameInput = document.getElementById('referrer-name-details') as HTMLInputElement;
                      const referrerName = nameInput?.value.trim() || 'Un aliado AutoFlux';
                      const message = `🚀 OPORTUNIDAD AUTOFLUX: Refiero este ${car.make} ${car.model} (${car.year}) por $${car.price.toLocaleString()}. \n\nVer peritaje y detalles aquí: ${window.location.origin}/car/${car.id}?ref=${encodeURIComponent(referrerName)} \n\nReferido por: ${referrerName} \n\n¿Te interesa? Avísame para gestionar tu prioridad de atención.`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      toast.success("Enlace de referido listo para compartir", {
                        description: `Compartiendo como: ${referrerName}`
                      });
                    }}
                    className="w-full py-4 bg-white/5 border border-blue-500/30 text-blue-400 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar por WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      const nameInput = document.getElementById('referrer-name-details') as HTMLInputElement;
                      const referrerName = nameInput?.value.trim() || 'aliado';
                      navigator.clipboard.writeText(`${window.location.origin}/car/${car.id}?ref=${encodeURIComponent(referrerName)}`);
                      toast.success("Enlace copiado al portapapeles", {
                        description: `Enlace personalizado para ${referrerName}.`
                      });
                    }}
                    className="w-full py-3 text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Copiar URL Directa
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2rem] border-white/10">
                <div className="flex items-center gap-3 text-slate-400 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Entrega Estimada</span>
                </div>
                <p className="text-white font-bold">8 - 12 Semanas</p>
                <div className="mt-4 flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Seguro Incluido</span>
                </div>
              </div>

              {/* Centralized Communication Buttons Removed from here */}

              <CostCalculator carPrice={car.price} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
