import React, { useState } from 'react';
import { Camera, X, ChevronDown, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { CAR_DATA, SUPPORTED_MAKES, YEARS } from '../carData';

import { APP_CONFIG } from '../config';

import { toast } from 'sonner';

interface CreatePostViewProps {
  onBack: () => void;
  onPublish: (post: any) => void;
  isAdmin?: boolean;
}

export const CreatePostView: React.FC<CreatePostViewProps> = ({ onBack, onPublish, isAdmin }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [make, setMake] = useState('Toyota');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
         alert("Error: El video no debe pesar más de 50MB");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [model, setModel] = useState('Corolla');
  const [engine, setEngine] = useState('');
  const [year, setYear] = useState('2024');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('Gasolina');
  const [transmission, setTransmission] = useState('Automático');
  const [engineLiters, setEngineLiters] = useState('2.0');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Nuevo');
  const [sellerWhatsApp, setSellerWhatsApp] = useState('');
  const [commission, setCommission] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);

  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    if (CAR_DATA[newMake]) {
      const firstModel = CAR_DATA[newMake][0];
      setModel(typeof firstModel === 'string' ? firstModel : firstModel.name);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (photos.length < 10) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotos(prev => {
              if (prev.length < 10) {
                return [...prev, reader.result as string];
              }
              return prev;
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
        const nextPhotos = prev.filter((_, i) => i !== index);
        if (currentPhotoIndex >= nextPhotos.length) {
            setCurrentPhotoIndex(Math.max(0, nextPhotos.length - 1));
        }
        return nextPhotos;
    });
  };

  const handlePublish = () => {
    if (!make || !model || !year || !price) {
      toast.error("Por favor completa los campos obligatorios (Marca, Modelo, Año, Precio)");
      return;
    }

    const numericPrice = parseFloat(price);
    const numericYear = parseInt(year);

    // Realistic Price Validation (Simple heuristic)
    // For cars 2022+, price should generally be > $15,000 and < $500,000 for standard models
    // This is a basic check to prevent obviously fake prices like $1 or $1,000,000,000
    if (numericPrice < 1000) {
      toast.error("El precio ingresado parece demasiado bajo para un vehículo. Por favor verifica.");
      return;
    }
    if (numericPrice > 300000 && !isAdmin) {
      toast.error("El precio ingresado es muy alto. Si es un vehículo especial, contacta a soporte para verificación manual.");
      return;
    }

    if (photos.length < 1) {
      toast.error("Debes subir al menos 1 foto para poder publicar tu vehículo.");
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      const basePrice = numericPrice;
      const marketplacePrice = basePrice * APP_CONFIG.logic_rules.price_adjustment; 

      onPublish({
        make,
        model,
        cilindrada: `${engineLiters}L ${engine}`,
        fuelType,
        transmission,
        condition,
        year: numericYear,
        mileage: parseInt(mileage) || 0,
        basePrice: basePrice,
        price: marketplacePrice,
        sellerWhatsApp,
        commission: parseFloat(commission) || 0,
        image: photos[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
        images: photos,
        ...(video ? { video } : {})
      });
      setIsPublishing(false);
    }, 1000);
  };

  const carData = CAR_DATA[make];
  if (!carData) return <p className="text-white text-center p-10">Cargando modelos...</p>;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#0B0F1A] scrollbar-hide">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-8 text-slate-500 hover:text-white font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al Perfil
        </button>

        <div className="glass-card rounded-[2.5rem] p-10 border-white/10 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white tracking-tighter mb-10">Crear Nuevo Post</h2>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Galería de Fotos (Recomendado: 10 fotos)</label>
                {photos.length > 0 && (
                  <button 
                    onClick={() => setPhotos([])}
                    className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                  >
                    Limpiar Galería
                  </button>
                )}
              </div>
              
              {/* Photo Requirements Reminder */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-[2rem] p-7 mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-amber-500 text-sm font-black uppercase tracking-[0.1em]">Pack de 10 Fotos Obligatorio</h4>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-1">
                      Para garantizar la calidad de AutoFlux y vender más rápido, debes subir exactamente 10 fotos siguiendo estrictamente este orden:
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: '01', title: '4 Exterior', desc: 'Frente, Atrás y ambos Lados' },
                    { id: '02', title: '2 Interior', desc: 'Asientos y Maleta' },
                    { id: '03', title: '2 Tablero', desc: 'Consola e Instrumentos' },
                    { id: '04', title: '2 Técnicas', desc: 'Motor y Cauchos' }
                  ].map((item) => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                      <span className="text-amber-500 font-black text-xs mt-0.5">{item.id}.</span>
                      <div>
                        <p className="text-[12px] text-white font-bold leading-none mb-1">{item.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                {photos.length > 0 ? (
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-lg">
                    <motion.img 
                      key={currentPhotoIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={photos[currentPhotoIndex]} 
                      alt={`Car ${currentPhotoIndex}`} 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => removePhoto(currentPhotoIndex)}
                      className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-all border border-white/10 shadow-xl"
                      title="Eliminar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {currentPhotoIndex === 0 && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                        Foto de Portada
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button onClick={() => setCurrentPhotoIndex(prev => Math.max(0, prev - 1))} className="p-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 text-[10px] px-3 font-bold">Anterior</button>
                        <button onClick={() => setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))} className="p-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 text-[10px] px-3 font-bold">Siguiente</button>
                    </div>
                  </div>
                ) : (
                  <label className="aspect-video bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                    />
                    <Camera className="w-8 h-8 text-slate-600 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-2" />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-400 uppercase tracking-widest">Subir Pack de 10 Fotos</span>
                  </label>
                )}
                {photos.length > 0 && photos.length < 10 && (
                    <label className="mt-4 block text-center py-4 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handlePhotoUpload}
                        />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Añadir más fotos ({photos.length}/10)</span>
                    </label>
                )}
              </div>

              {/* Video Upload Section */}
              <div className="relative mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-blue-500 text-sm font-black uppercase tracking-[0.1em]">Video del Vehículo (Opcional)</h4>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-1">
                      Sube un video corto mostrando el exterior e interior de tu vehículo. Máximo 50MB.
                    </p>
                  </div>
                </div>

                {video ? (
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-lg">
                    <video 
                      src={video} 
                      controls
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setVideo(null)}
                      className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-all border border-white/10 shadow-xl"
                      title="Eliminar video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                      Video Cargado
                    </div>
                  </div>
                ) : (
                  <label className="aspect-video bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={handleVideoUpload}
                    />
                    <Video className="w-8 h-8 text-slate-600 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-2" />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-400 uppercase tracking-widest">Subir Video (Max 50MB)</span>
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Marca del Vehículo</label>
                <div className="relative">
                  <select 
                    value={make}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                  >
                    {SUPPORTED_MAKES.map(m => (
                      <option key={m} value={m} className="bg-[#1A1F2C] text-white py-2">{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Modelo del Vehículo</label>
                <div className="relative">
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                  >
                    {carData.map(m => {
                      const mName = typeof m === 'string' ? m : m.name;
                      const mDisplay = typeof m === 'string' ? m : `${m.name} ${m.category ? `- ${m.category}` : ''}`;
                      return (
                        <option key={mName} value={mName} className="bg-[#1A1F2C] text-white py-2">{mDisplay}</option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Motor</label>
                  <div className="relative">
                    <select 
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                    >
                      <option value="Gasolina" className="bg-[#1A1F2C] text-white py-2">Gasolina</option>
                      <option value="Diesel" className="bg-[#1A1F2C] text-white py-2">Diesel</option>
                      <option value="Híbrido" className="bg-[#1A1F2C] text-white py-2">Híbrido</option>
                      <option value="Eléctrico" className="bg-[#1A1F2C] text-white py-2">Eléctrico</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Transmisión</label>
                  <div className="relative">
                    <select 
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                    >
                      <option value="Automático" className="bg-[#1A1F2C] text-white py-2">Automático</option>
                      <option value="Manual" className="bg-[#1A1F2C] text-white py-2">Manual</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Condición</label>
                  <div className="relative">
                    <select 
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                    >
                      <option value="Nuevo" className="bg-[#1A1F2C] text-white py-2">Nuevo</option>
                      <option value="Usado" className="bg-[#1A1F2C] text-white py-2">Usado</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Litros del Motor (1.4 a 5.0+)</label>
                  <div className="relative">
                    <select 
                      value={engineLiters}
                      onChange={(e) => setEngineLiters(e.target.value)}
                      className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                    >
                      {["1.0", "1.2", "1.4", "1.6", "1.8", "2.0", "2.4", "2.5", "3.0", "3.5", "4.0", "5.0", "6.2"].map(l => (
                        <option key={l} value={l} className="bg-[#1A1F2C] text-white py-2">{l} Litros</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Especificación (Ej: V6, Turbo)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: V6 Turbo"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full p-5 glass-input rounded-2xl text-white font-medium placeholder-slate-700" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Año (2022 - 2028)</label>
                  <div className="relative">
                    <select 
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full p-5 glass-input rounded-2xl text-white font-medium appearance-none cursor-pointer"
                    >
                      {YEARS.map(y => (
                        <option key={y} value={y} className="bg-[#1A1F2C] text-white py-2">{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kilometraje</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full p-5 glass-input rounded-2xl text-white font-medium placeholder-slate-700" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tu Precio Requerido ($ USD)</label>
                    <input 
                      type="number" 
                      placeholder="Ej: 45000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-5 glass-input rounded-2xl text-white font-medium placeholder-slate-700 transition-colors focus:border-blue-500/50" 
                    />
                    <p className="text-[9px] text-slate-500 ml-1 mt-1 font-medium">Ingresa el monto exacto que deseas recibir por el vehículo.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">WhatsApp del Dealer</label>
                  <input 
                    type="text" 
                    placeholder="Ej: +584121234567"
                    value={sellerWhatsApp}
                    onChange={(e) => setSellerWhatsApp(e.target.value)}
                    className="w-full p-5 glass-input rounded-2xl text-white font-medium placeholder-slate-700" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ml-1">Comisión por Venta ($ USD)</label>
                <input 
                  type="number" 
                  placeholder="Ej: 500"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full p-5 glass-input rounded-2xl text-blue-400 font-bold border-blue-500/30 placeholder-slate-700" 
                />
              </div>
            </div>

            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-extrabold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Publicando...' : 'Publicar en Marketplace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
