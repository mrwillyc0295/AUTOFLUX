import React from 'react';
import { Car } from '../types';
import { ArrowLeft, CreditCard, Copy, CheckCircle2, ArrowRight, ShieldCheck, Landmark, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

import { db, handleFirestoreError } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReservationPaymentViewProps {
  car: Car;
  onBack: () => void;
}

export const ReservationPaymentView: React.FC<ReservationPaymentViewProps> = ({ car, onBack }) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const referralId = localStorage.getItem('autoflux_ref') || 'organico_directo';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const bankDetails = {
    bank: "Banesco Banco Universal",
    account: "0134 1099 21 0001234567",
    holder: "AutoFlux C.A.",
    rif: "J-41234567-8",
    amount: "300.00",
    concept: `Reserva ${car.make} ${car.model} ${car.year}`
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0B0F1A] scrollbar-hide">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-8 text-slate-500 hover:text-white font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver a Detalles
        </button>

        <div className="space-y-8">
          {/* Header Section with Flags */}
          <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-yellow-500 to-red-600" />
            
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-900/30 border-2 border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <MapPin className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">USA</p>
              </div>
              
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowRight className="w-8 h-8 text-blue-500" />
                </motion.div>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter mt-1">Importación</span>
              </div>

              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <MapPin className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Venezuela</p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Pago de Reserva (Etapa 1)</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Para asegurar tu <span className="text-white font-bold">{car.make} {car.model}</span>, por favor realiza la transferencia de la reserva a nuestra cuenta nacional.
            </p>
          </div>

          {/* Bank Details Section */}
          <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <Landmark className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Datos Bancarios Venezuela</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transferencia Nacional / Pago Móvil</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Banco", value: bankDetails.bank, field: "bank" },
                { label: "Titular", value: bankDetails.holder, field: "holder" },
                { label: "RIF", value: bankDetails.rif, field: "rif" },
                { label: "Número de Cuenta", value: bankDetails.account, field: "account" },
                { label: "Monto a Transferir", value: `$${bankDetails.amount} (Tasa BCV)`, field: "amount" },
                { label: "Concepto / Referencia", value: bankDetails.concept, field: "concept" }
              ].map((item) => (
                <div key={item.field} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-white">{item.value}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.value, item.field)}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-colors relative"
                  >
                    {copied === item.field ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Garantía AutoFlux</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Tu pago está protegido. Una vez realizada la transferencia, envía el comprobante a tu asesor asignado para activar la Etapa 2 de logística en USA.
                </p>
              </div>
            </div>

            <button 
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  // Registrar reserva en Firestore para auditoría de comisiones
                  await addDoc(collection(db, 'reservations'), {
                    carId: car.id,
                    carModel: `${car.make} ${car.model}`,
                    resellerId: referralId,
                    amount: 300,
                    commission: 100,
                    status: 'pending_confirmation',
                    createdAt: serverTimestamp()
                  });

                  const whatsappMsg = encodeURIComponent(`Hola AutoFlux, acabo de realizar el pago de la reserva ($300) para el ${car.make} ${car.model}.\n\nReferido por: ${referralId}\nAdjunto el comprobante.`);
                  window.open(`https://wa.me/584248691131?text=${whatsappMsg}`, '_blank');
                } catch (error) {
                  handleFirestoreError(error, 'create', 'reservations');
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={isProcessing}
              className="w-full mt-8 py-5 bg-green-600 disabled:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-500 transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 disabled:cursor-not-wait"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR PAGO POR WHATSAPP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
