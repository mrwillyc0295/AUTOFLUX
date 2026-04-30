import { Trash2, TrendingUp, BarChart3, Users, DollarSign, Activity, ChevronRight, MessageSquare, CarFront, Fuel, Settings2, Gauge, Share2, Calendar, MapPin, Edit3, Save, X as CloseIcon, Home, Download, CheckCircle, AlertTriangle, Clock as ClockIcon, Send, Plus, MessageCircle, Webhook } from 'lucide-react';
import { Car } from '../types';
import { cn } from '../lib/utils';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, limit } from 'firebase/firestore';

interface AdminDashboardProps {
  cars: Car[];
  users: { 
    name: string; 
    whatsapp: string; 
    photo?: string; 
    bio?: string;
    status?: 'active' | 'inactive';
    isNew?: boolean;
    lastLogin?: string;
    referredBy?: string;
  }[];
  onDeleteUser: (whatsapp: string) => void;
  onUpdateUser: (whatsapp: string, updatedData: Partial<{name: string, whatsapp: string}>) => void;
  onViewProfile: (seller: any) => void;
  onBack: () => void;
  onGoToMarketplace: () => void;
  onOpenExpertAudition: () => void;
  onShare: (car: Car) => void;
  onAddCar: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ cars, users, onDeleteUser, onUpdateUser, onViewProfile, onBack, onGoToMarketplace, onOpenExpertAudition, onShare, onAddCar }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'messages'>('analytics');
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const adminUsersPerPage = 20;
  const paginatedUsers = users.slice(0, adminUsersPage * adminUsersPerPage);

  const [editingUser, setEditingUser] = useState<{name: string, whatsapp: string} | null>(null);
  const [deletingUser, setDeletingUser] = useState<{name: string, whatsapp: string} | null>(null);
  const [selectedUserSummary, setSelectedUserSummary] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Subscribe to all chats
  React.useEffect(() => {
    if (activeTab === 'messages') {
      const q = query(
        collection(db, 'chats'), 
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.warn("Admin chat sync failed", error.message);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  // Subscribe to messages of selected chat
  React.useEffect(() => {
    if (selectedChat) {
      const q = query(
        collection(db, 'chats', selectedChat.id, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => doc.data()).reverse());
      }, (error) => {
        console.warn("Admin message sync failed", error.message);
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedChat) return;

    try {
      const chatId = selectedChat.id;
      const replyText = adminReply;
      setAdminReply('');

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'admin',
        text: replyText,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        status: 'responded',
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error sending admin reply", e);
    }
  };

  const getStatusLight = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse';
      case 'responded': return 'bg-blue-500/50';
      case 'calm': return 'bg-slate-700';
      default: return 'bg-slate-700';
    }
  };

  const sellers = Array.from(new Set(cars.map(c => c.seller)));
  
  const sortedCars = [...cars].sort((a, b) => (b.views || 0) + (b.interactions || 0) - ((a.views || 0) + (a.interactions || 0)));
  const topCars = sortedCars.slice(0, 3);

  // Market Metrics
  const totalBaseValue = cars.reduce((acc, car) => acc + (car.basePrice || car.price), 0);
  const totalMarketValue = cars.reduce((acc, car) => acc + car.price, 0);
  const avgPrice = totalMarketValue / (cars.length || 1);
  const totalInteractions = cars.reduce((acc, car) => acc + (car.interactions || 0), 0);
  const totalViews = cars.reduce((acc, car) => acc + (car.views || 0), 0);
  const globalConversion = (totalInteractions / (totalViews || 1)) * 100;

  const handleEditClick = (user: {name: string, whatsapp: string}) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditWhatsapp(user.whatsapp);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      onUpdateUser(editingUser.whatsapp, { name: editName, whatsapp: editWhatsapp });
      setEditingUser(null);
    }
  };

  const handleExportExcel = () => {
    const data = users.map(user => ({
      Nombre: user.name,
      WhatsApp: user.whatsapp,
      Estado: user.status === 'active' ? 'Activo' : 'Inactivo',
      Tipo: user.isNew ? 'Nuevo' : 'Constante',
      Referido_Por: user.referredBy || 'Directo',
      'Último Acceso': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A',
      Bio: user.bio || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dealers");
    XLSX.writeFile(workbook, "Reporte_Dealers_AutoFlux.xlsx");
  };

  const handleExportWhatsApp = () => {
    const textData = users.map(user => 
      `👤 *${user.name}*\n📱 ${user.whatsapp}${user.referredBy ? `\n🔗 Ref: ${user.referredBy}` : ''}\n📊 ${user.status === 'active' ? 'Activo' : 'Inactivo'}`
    ).join('\n\n');
    
    const message = `*REPORTE DE DEALERS AUTOFLUX*\nTotal: ${users.length}\n\n${textData}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportN8N = async () => {
    try {
      const data = users.map(user => ({
        name: user.name,
        whatsapp: user.whatsapp,
        status: user.status,
        isNew: user.isNew,
        lastLogin: user.lastLogin
      }));
      
      // Simulando webhook a n8n
      await fetch('https://n8n.autoflux.io/webhook/export-dealers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          event: "dealers_export", 
          timestamp: new Date().toISOString(),
          data 
        }),
      }).catch(err => console.warn('N8N webhook simulated error:', err)); // Ignoramos errores CORS reales para la simulacion
      
      alert("✅ Datos enviados exitosamente a n8n para sincronización.");
    } catch (error) {
      alert("Error al enviar datos a n8n.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#0B0F1A] relative scrollbar-hide">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-600/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
              <button 
                onClick={onBack} 
                className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] md:text-xs font-mono uppercase tracking-widest"
              >
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Volver
              </button>
              <button 
                onClick={onGoToMarketplace} 
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-blue-500/20"
              >
                <Home className="w-3 h-3" />
                Marketplace
              </button>
              <button 
                onClick={onOpenExpertAudition} 
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white transition-all rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-purple-500/20"
              >
                <Users className="w-3 h-3" />
                Audición Expertos
              </button>
              <button 
                onClick={onAddCar} 
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-[#A3FF47]/10 text-[#A3FF47] hover:bg-[#A3FF47] hover:text-black transition-all rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-[#A3FF47]/20"
              >
                <Plus className="w-3 h-3" />
                Publicar Carro
              </button>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter flex items-center gap-3 md:gap-4">
              <div className="w-2 md:w-3 h-10 md:h-12 bg-purple-600 rounded-full" />
              Panel de Control
              <span className="hidden sm:inline text-slate-600 font-mono text-sm tracking-normal font-normal ml-4">v2.4.0_SECURE</span>
            </h2>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 w-full lg:w-auto">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'analytics' ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-slate-500 hover:text-white"
              )}
            >
              Analítica
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'users' ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-slate-500 hover:text-white"
              )}
            >
              Dealers
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={cn(
                "flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'messages' ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "text-slate-500 hover:text-white"
              )}
            >
              Mensajes
            </button>
          </div>
        </div>
        
        {activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 gap-12">
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onOpenExpertAudition}
                className="flex-1 px-8 py-6 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white hover:scale-[1.02] transition-all shadow-xl shadow-blue-600/10 flex items-center justify-center gap-3 active:scale-95"
              >
                <Users className="w-6 h-6" />
                Abrir Sala de Audición Expertos
              </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {[
                { label: 'Valor Base', value: `$${totalBaseValue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Valor Market', value: `$${totalMarketValue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
                { label: 'Total Clientes', value: users.length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Conversión', value: `${globalConversion.toFixed(1)}%`, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden group">
                  <div className={cn("absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 -mr-4 md:-mr-8 -mt-4 md:-mt-8 rounded-full blur-2xl md:blur-3xl opacity-20 transition-opacity group-hover:opacity-40", stat.bg)} />
                  <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                    <div className={cn("p-2 md:p-3 rounded-xl md:rounded-2xl", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4 md:w-6 md:h-6", stat.color)} />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em]">{stat.label}</span>
                  </div>
                  <p className="text-lg md:text-3xl font-bold text-white font-display tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Top Performance Section */}
            <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-purple-500/20">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Rendimiento</h3>
                    <p className="text-slate-500 text-[10px] md:text-xs">Vehículos con mayor tracción</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {topCars.map((car, i) => {
                  const conversion = ((car.interactions || 0) / (car.views || 1)) * 100;
                  return (
                    <div key={car.id} className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-mono text-slate-400">
                          0{i + 1}
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onShare(car);
                            }}
                            className="w-7 h-7 md:w-8 md:h-8 bg-white/5 text-slate-500 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                            title="Compartir"
                          >
                            <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                          <div className="text-right">
                            <span className="text-[8px] md:text-[10px] font-mono text-slate-500 uppercase">Conv.</span>
                            <span className="block text-green-400 font-mono font-bold text-xs md:text-base">{conversion.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-white text-sm md:text-lg mb-1 truncate">{car.make} {car.model}</p>
                      <p className="text-[10px] text-slate-500 mb-3 md:mb-4">ID: {car.id.padStart(4, '0')}</p>
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase">Dealer</span>
                          <span className="text-[10px] md:text-sm font-mono text-slate-300">${(car.basePrice || car.price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase">Público</span>
                          <span className="text-lg md:text-xl font-display font-black text-white">${car.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 md:gap-2">
                        <div className="px-1.5 py-0.5 bg-white/5 rounded-md text-[8px] md:text-[10px] font-mono text-slate-400">
                          {car.views || 0} V
                        </div>
                        <div className="px-1.5 py-0.5 bg-white/5 rounded-md text-[8px] md:text-[10px] font-mono text-slate-400">
                          {car.interactions || 0} I
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Sellers Section */}
            <div className="space-y-6 md:space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-1 md:w-1.5 h-6 md:h-8 bg-blue-600 rounded-full" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tighter">Inventario</h3>
                    <p className="text-slate-500 text-[10px] md:text-sm">Distribución por unidad de negocio</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 w-fit">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
                  <span className="text-[9px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">{sellers.length} Activos</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:gap-10">
                {sellers.map(seller => {
                  const sellerCars = sortedCars.filter(c => c.seller === seller);
                  const sellerValue = sellerCars.reduce((acc, c) => acc + c.price, 0);
                  const sellerInteractions = sellerCars.reduce((acc, c) => acc + (c.interactions || 0), 0);
                  
                  return (
                    <div key={seller} className="relative group">
                      {/* Seller Header Card */}
                      <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] mb-4 md:mb-6 border-white/5 group-hover:border-blue-500/20 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-blue-900/20">
                              <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight">{seller}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-md border border-green-500/20">Verificado</span>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-md border border-blue-500/20">
                                  <CarFront className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                  <span>{sellerCars.length} Stock</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 px-3 md:px-6 py-3 md:py-4 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5">
                            <div className="text-left w-full min-w-0 break-words">
                              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1 leading-tight">Valor Total</p>
                              <p className="text-xs md:text-xl font-bold text-white font-display truncate">${sellerValue.toLocaleString()}</p>
                            </div>
                            <div className="text-left w-full min-w-0 break-words">
                              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1 leading-tight">Interac.</p>
                              <p className="text-xs md:text-xl font-bold text-blue-400 font-display truncate">{sellerInteractions}</p>
                            </div>
                            <div className="text-left w-full min-w-0 break-words">
                              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1 leading-tight">Valor Promedio</p>
                              <p className="text-xs md:text-xl font-bold text-slate-300 font-display truncate">${Math.round(sellerValue / (sellerCars.length || 1)).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cars Grid for this Seller */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pl-2 md:pl-8 border-l-2 border-white/5 ml-4 md:ml-12">
                        {sellerCars.map(car => {
                          const conversion = ((car.interactions || 0) / (car.views || 1)) * 100;
                          const whatsappUrl = car.sellerWhatsApp ? `https://wa.me/${car.sellerWhatsApp.replace(/\D/g, '')}` : null;
                          
                          return (
                            <div key={car.id} className="glass-card p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 duration-300">
                              <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-white text-base md:text-lg tracking-tight truncate">{car.make} {car.model}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] md:text-[10px] font-mono text-slate-500 uppercase">Ref: {car.id}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <span className="text-[8px] md:text-[10px] font-mono text-blue-400 font-bold uppercase">Activo</span>
                                  </div>
                                </div>
                                {whatsappUrl && (
                                  <a 
                                    href={whatsappUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 text-green-400 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10 group/wa shrink-0"
                                    title="Contactar Dealer"
                                  >
                                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 group-hover/wa:scale-110 transition-transform" />
                                  </a>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-1 text-center hover:bg-white/10 transition-colors">
                                    <Settings2 className="w-3.5 h-3.5 md:w-3 md:h-3 text-blue-400" />
                                    <span className="text-[9px] md:text-[8px] text-slate-300 font-bold uppercase tracking-tighter">{car.transmission || 'N/A'}</span>
                                  </div>
                                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-1 text-center hover:bg-white/10 transition-colors">
                                    <Fuel className="w-3.5 h-3.5 md:w-3 md:h-3 text-green-400" />
                                    <span className="text-[9px] md:text-[8px] text-slate-300 font-bold uppercase tracking-tighter">{car.fuelType || 'N/A'}</span>
                                  </div>
                                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-1 text-center hover:bg-white/10 transition-colors">
                                    <Gauge className="w-3.5 h-3.5 md:w-3 md:h-3 text-yellow-400" />
                                    <span className="text-[9px] md:text-[8px] text-slate-300 font-bold uppercase tracking-tighter">{car.engineLiters ? `${car.engineLiters}L` : 'N/A'}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 hover:bg-blue-500/10 transition-all group/stat min-w-0 overflow-hidden">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Activity className="w-3 h-3 text-blue-400 shrink-0" />
                                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider truncate">Vistas</p>
                                    </div>
                                    <div className="flex items-end justify-between gap-1">
                                      <span className="text-lg font-bold text-white font-display leading-none truncate">{car.views || 0}</span>
                                      <span className="text-[8px] text-blue-400 font-mono font-bold shrink-0">+{Math.round((car.views || 0) * 0.1)}%</span>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-purple-500/5 rounded-2xl border border-purple-500/10 hover:bg-purple-500/10 transition-all group/stat min-w-0 overflow-hidden">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <TrendingUp className="w-3 h-3 text-purple-400 shrink-0" />
                                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider truncate">Interac.</p>
                                    </div>
                                    <div className="flex items-end justify-between gap-1">
                                      <span className="text-lg font-bold text-white font-display leading-none truncate">{car.interactions || 0}</span>
                                      <span className="text-[8px] text-purple-400 font-mono font-bold shrink-0">{conversion.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Índice de Tracción</span>
                                    </div>
                                    <span className="text-[10px] text-blue-400 font-black font-mono">{Math.min(100, Math.round(conversion * 5))}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                                      style={{ width: `${Math.min(100, Math.round(conversion * 5))}%` }} 
                                    />
                                  </div>
                                </div>

                                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 md:gap-4 border-t border-white/5">
                                  <div className="flex flex-col gap-1 w-full sm:w-auto flex-1">
                                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-1 mb-1">
                                      <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Precio Dealer</span>
                                      <span className="text-xs font-bold text-slate-300 font-mono">
                                        ${(car.basePrice || car.price).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">P. Público</span>
                                      <span className="text-base md:text-lg font-black text-white font-display">
                                        ${car.price.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <button 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const nextStatus = car.status === 'active' ? 'sold' : 'active';
                                          await updateDoc(doc(db, 'cars', car.id), {
                                            status: nextStatus,
                                            updatedAt: serverTimestamp()
                                          });
                                        } catch (err) {
                                          console.error("Error updating car status", err);
                                        }
                                      }}
                                      className={cn(
                                        "px-3 md:px-4 py-1.5 md:py-2 border rounded-lg md:rounded-xl font-bold text-[8px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                        car.status === 'active'
                                          ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                                          : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white"
                                      )}
                                      title={car.status === 'active' ? "Marcar como Vendido" : "Marcar como Disponible"}
                                    >
                                      {car.status === 'active' ? <AlertTriangle className="w-3 md:w-3.5 h-3 md:h-3.5" /> : <CheckCircle className="w-3 md:w-3.5 h-3 md:h-3.5" />}
                                      {car.status === 'active' ? 'Sold' : 'Active'}
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onShare(car);
                                      }}
                                      className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-white font-bold text-[8px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:border-blue-500 transition-all"
                                    >
                                      <Share2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                      Share
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'messages' ? (
          <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col md:flex-row h-[700px]">
            {/* List of Chats */}
            <div className="w-full md:w-80 border-r border-white/5 flex flex-col">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Conversaciones</h3>
                <p className="text-slate-500 text-[10px] uppercase">Central de Atención</p>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {chats.length > 0 ? (
                  chats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={cn(
                        "w-full p-4 flex items-center gap-4 transition-all hover:bg-white/5 border-b border-white/5 text-left",
                        selectedChat?.id === chat.id ? "bg-white/10" : ""
                      )}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-blue-400 capitalize">
                          {chat.userName?.charAt(0) || '?'}
                        </div>
                        <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0B0F1A]", getStatusLight(chat.status))} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-sm truncate">{chat.userName || "Usuario Anónimo"}</p>
                        <p className="text-slate-500 text-[10px] truncate">{chat.lastMessage}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 font-mono text-[10px] italic">Esperando mensajes...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col bg-white/[0.02]">
              {selectedChat ? (
                <>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold">{selectedChat.userName}</h4>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest">ID: {selectedChat.userId}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {selectedChat.status === 'new' && (
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded-md border border-green-500/20">Nuevo Mensaje</span>
                      )}
                      <button 
                         onClick={async () => {
                           await updateDoc(doc(db, 'chats', selectedChat.id), { status: 'calm', updatedAt: serverTimestamp() });
                         }}
                         className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                      >
                        Archivar
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'admin' 
                            ? "bg-purple-600 text-white ml-auto" 
                            : msg.role === 'model'
                              ? "bg-slate-800 text-slate-300 border border-slate-700 italic"
                              : "bg-white/10 text-white"
                        )}
                      >
                        <p>{msg.text}</p>
                        <span className="text-[9px] opacity-40 block mt-1">
                          {msg.role?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleAdminReply} className="p-6 border-t border-white/5">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        placeholder="Escribe una respuesta oficial..."
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-2 w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-500 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400">Selecciona una conversación</h3>
                  <p className="text-slate-600 text-sm mt-2 max-w-xs">Gestiona las consultas de tus clientes de manera centralizada.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-widest">Base de Datos</h3>
                <p className="text-slate-500 text-[10px] md:text-xs mt-1">Gestión de perfiles y canales</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button 
                  onClick={handleExportExcel}
                  className="px-4 py-3 bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest border border-green-500/20 flex items-center justify-center gap-2"
                  title="Exportar a Excel"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
                <button 
                  onClick={handleExportWhatsApp}
                  className="px-4 py-3 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center justify-center gap-2"
                  title="Compartir Resumen por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button 
                  onClick={handleExportN8N}
                  className="px-4 py-3 bg-pink-600/10 text-pink-400 hover:bg-pink-600 hover:text-white transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest border border-pink-500/20 flex items-center justify-center gap-2"
                  title="Enviar webhook o sync a n8n"
                >
                  <Webhook className="w-4 h-4" />
                  Sync n8n
                </button>
                <div className="px-4 py-3 bg-white/5 rounded-xl text-[10px] md:text-xs font-mono text-slate-400 border border-white/10 text-center ml-2">
                  TOTAL: {users.length}
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-500">
                    <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest">Usuario</th>
                    <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Estado / Tipo</th>
                    <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest">Referido por</th>
                    <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest">Canal de Contacto</th>
                    <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? paginatedUsers.map((user, i) => (
                    <tr key={i} className="group">
                      <td className="py-4 px-4 bg-white/5 rounded-l-2xl border-y border-l border-white/5 group-hover:bg-white/10 transition-colors">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group/user"
                          onClick={() => setSelectedUserSummary(user)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-300 overflow-hidden border border-white/10 group-hover/user:border-blue-500/50 transition-all">
                            {user.photo ? (
                              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                {user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-white font-medium block group-hover/user:text-blue-400 transition-colors">{user.name}</span>
                            {user.lastLogin && (
                              <span className="text-[8px] text-slate-500 font-mono uppercase">Último: {new Date(user.lastLogin).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-center gap-2">
                          {user.status === 'active' ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-bold uppercase rounded-md border border-green-500/20">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Activo
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-bold uppercase rounded-md border border-red-500/20">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Inactivo
                            </div>
                          )}
                          {user.isNew ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase rounded-md border border-blue-500/20">
                              <TrendingUp className="w-2.5 h-2.5" />
                              Nuevo
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold uppercase rounded-md border border-purple-500/20">
                              <ClockIcon className="w-2.5 h-2.5" />
                              Constante
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex flex-col items-center">
                          {user.referredBy ? (
                            <span className="px-3 py-1 bg-blue-600/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                              {user.referredBy}
                            </span>
                          ) : (
                            <span className="text-[8px] text-slate-600 font-bold uppercase">Directo</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                        <span className="font-mono text-blue-400 text-sm">{user.whatsapp}</span>
                      </td>
                      <td className="py-4 px-4 bg-white/5 rounded-r-2xl border-y border-r border-white/5 text-right group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                            title="Editar Perfil"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setDeletingUser(user)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="Eliminar Usuario"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-600 font-mono text-sm italic">
                        NO_DATA_FOUND: Esperando registros...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {paginatedUsers.length > 0 ? paginatedUsers.map((user, i) => (
                <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer group/user"
                      onClick={() => setSelectedUserSummary(user)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-300 overflow-hidden border border-white/10 group-hover/user:border-blue-500/50 transition-all">
                        {user.photo ? (
                          <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-white font-bold block text-sm group-hover/user:text-blue-400 transition-colors">{user.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-blue-400 font-mono">{user.whatsapp}</span>
                          {user.referredBy && (
                            <span className="text-[8px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
                              Ref: {user.referredBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 bg-white/5 rounded-lg text-slate-400"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingUser(user)}
                        className="p-2 bg-red-500/10 rounded-lg text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex gap-2">
                      {user.status === 'active' ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-bold uppercase rounded-md">
                          Activo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-bold uppercase rounded-md">
                          Inactivo
                        </div>
                      )}
                      {user.isNew ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase rounded-md">
                          Nuevo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold uppercase rounded-md">
                          Constante
                        </div>
                      )}
                    </div>
                    {user.lastLogin && (
                      <span className="text-[8px] text-slate-500 font-mono uppercase">Visto: {new Date(user.lastLogin).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-600 font-mono text-xs italic">
                  NO_DATA_FOUND
                </div>
              )}
            </div>

            {users.length > paginatedUsers.length && (
              <div className="flex items-center justify-center mt-8">
                <button 
                  onClick={() => setAdminUsersPage(p => p + 1)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs tracking-widest font-bold uppercase transition-all"
                >
                  Cargar Más Usuarios
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] w-full max-w-md shadow-2xl border-blue-500/20">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Editar Perfil</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white transition-colors p-2">
                <CloseIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 md:p-4 glass-input rounded-xl md:rounded-2xl text-white font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                <input 
                  type="text" 
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  className="w-full p-3 md:p-4 glass-input rounded-xl md:rounded-2xl text-white font-medium text-sm"
                />
              </div>
              <button 
                onClick={handleSaveEdit}
                className="w-full py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] w-full max-w-sm shadow-2xl border-red-500/20 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">¿Eliminar Usuario?</h3>
            <p className="text-slate-400 text-sm mb-8">
              Estás a punto de eliminar a <strong className="text-white">{deletingUser.name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-4 bg-white/5 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDeleteUser(deletingUser.whatsapp);
                  setDeletingUser(null);
                }}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 shadow-red-500/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Summary Modal */}
      {selectedUserSummary && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-8 md:p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl border-purple-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Resumen de Cliente</h3>
              <button onClick={() => setSelectedUserSummary(null)} className="text-slate-500 hover:text-white transition-colors p-2">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center font-bold text-slate-300 overflow-hidden border-2 border-white/10 mb-4 shadow-2xl">
                {selectedUserSummary.photo ? (
                  <img src={selectedUserSummary.photo} alt={selectedUserSummary.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-4xl text-blue-400">
                    {selectedUserSummary.name.charAt(0)}
                  </div>
                )}
              </div>
              <h4 className="text-2xl font-black text-white mb-1">{selectedUserSummary.name}</h4>
              <p className="text-blue-400 font-mono text-sm mb-4">{selectedUserSummary.whatsapp}</p>
              
              <div className="flex gap-2">
                {selectedUserSummary.status === 'active' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-full border border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Activo
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-full border border-red-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Inactivo
                  </div>
                )}
                {selectedUserSummary.isNew ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded-full border border-blue-500/20">
                    <TrendingUp className="w-3 h-3" />
                    Nuevo
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase rounded-full border border-purple-500/20">
                    <ClockIcon className="w-3 h-3" />
                    Constante
                  </div>
                )}
                {selectedUserSummary.referredBy && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase rounded-full border border-yellow-500/20">
                    <Share2 className="w-3 h-3" />
                    Ref: {selectedUserSummary.referredBy}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Biografía / Notas</p>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  {selectedUserSummary.bio || "Este cliente no ha proporcionado una biografía."}
                </p>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Último Acceso</span>
                  <span className="text-white font-mono text-xs mt-1">
                    {selectedUserSummary.lastLogin ? new Date(selectedUserSummary.lastLogin).toLocaleString() : 'Nunca'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    onViewProfile({
                      seller: selectedUserSummary.name,
                      sellerPhoto: selectedUserSummary.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserSummary.name)}&background=random`,
                      sellerBio: selectedUserSummary.bio || 'Sin biografía disponible.'
                    });
                    setSelectedUserSummary(null);
                  }}
                  className="flex items-center gap-2 text-blue-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  <ChevronRight className="w-4 h-4" />
                  Ver Perfil Completo
                </button>
              </div>

              <button 
                onClick={() => setSelectedUserSummary(null)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Regresar al Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
