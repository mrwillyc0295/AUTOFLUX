import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Copy, Check, Users, DollarSign, ArrowLeft, ExternalLink, QrCode } from 'lucide-react';
import { UserProfile } from '../types';
import { toast } from 'sonner';

interface MemberReferralViewProps {
  user: UserProfile;
  onBack: () => void;
}

export const MemberReferralView: React.FC<MemberReferralViewProps> = ({ user, onBack }) => {
  const [copied, setCopied] = useState(false);
  
  // En producción esto vendría de la URL real, aquí usamos una base genérica
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}?ref=${user.name.replace(/\s+/g, '').toLowerCase()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("¡Enlace copiado!", {
      description: "Compártelo con tus clientes para ganar comisiones."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Socio Afiliado AutoFlux
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pt-6">
        {/* Welcome Section */}
        <section className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2">¡Gana hasta $500 por Referido!</h2>
            <p className="text-blue-100 text-sm max-w-md font-medium">
              Recibe <span className="font-black text-white">$100 USD</span> inmediatos por cada Reserva y un total de <span className="font-black text-white">$500 USD</span> al completarse la venta.
            </p>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-40 h-40 text-blue-500/30 rotate-12" />
        </section>

        {/* Link Generator */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Tu Enlace Personalizado</h3>
              <p className="text-xs text-slate-500">Copia y comparte este link en redes o WhatsApp</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono text-xs text-slate-600 flex items-center overflow-x-auto whitespace-nowrap">
              {referralLink}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button 
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`¡Mira estos autos increíbles en AutoFlux! ${referralLink}`)}`, '_blank')}
                className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center">
            <Users className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Clicks</p>
            <p className="text-2xl font-black text-slate-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center">
            <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Comisión</p>
            <p className="text-2xl font-black text-slate-900">$0</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center col-span-2 md:col-span-1">
            <ExternalLink className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reservas</p>
            <p className="text-2xl font-black text-slate-900">0</p>
          </div>
        </div>

        {/* How it works */}
        <section className="space-y-4">
          <h3 className="font-bold text-slate-900 px-2 tracking-tight">¿Cómo funciona?</h3>
          <div className="grid gap-4">
            {[
              { 
                step: 1, 
                title: "Comparte tu Link", 
                desc: "Envía tu enlace por redes sociales, estados de WhatsApp o mensajes directos." 
              },
              { 
                step: 2, 
                title: "Rastreo de 30 Días", 
                desc: "Si el cliente entra hoy pero reserva dentro de 3 semanas, la comisión sigue siendo tuya." 
              },
              { 
                step: 3, 
                title: "Cobra y Gana", 
                desc: "Liquidamos tus $100 por reserva al instante y hasta $500 si el cliente finaliza la compra." 
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Contact */}
        <button 
          onClick={() => window.open(`https://wa.me/584248691131?text=Hola,%20soy%20socio%20afiliado%20y%20quiero%20consultar%20mis%20comisiones.`, '_blank')}
          className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          Contactar Soporte de Pagos
        </button>
      </main>
    </div>
  );
};
