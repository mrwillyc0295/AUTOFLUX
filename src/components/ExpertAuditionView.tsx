import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MessageSquare, ArrowLeft, Send, Sparkles, Brain, TrendingUp, ShieldCheck, Zap, Globe, DollarSign, BarChart3, Rocket, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface Expert {
  id: string;
  name: string;
  role: string;
  icon: any;
  color: string;
  description: string;
}

const EXPERTS: Expert[] = [
  { id: 'elon', name: 'Elon Musk', role: 'Visionario Tech/EV', icon: Rocket, color: 'text-blue-400', description: 'CEO de Tesla y SpaceX. Experto en innovación disruptiva y energía sostenible.' },
  { id: 'mary', name: 'Mary Barra', role: 'Estrategia Corporativa', icon: Globe, color: 'text-purple-400', description: 'CEO de GM. Experta en transición a gran escala y gestión automotriz global.' },
  { id: 'warren', name: 'Warren Buffett', role: 'Análisis Financiero', icon: DollarSign, color: 'text-green-400', description: 'Inversionista legendario. Experto en valor a largo plazo y solidez financiera.' },
  { id: 'seth', name: 'Seth Godin', role: 'Marketing y Marca', icon: Sparkles, color: 'text-orange-400', description: 'Gurú del marketing. Experto en crear conexiones y tribus alrededor de productos.' },
  { id: 'grant', name: 'Grant Cardone', role: 'Ventas y Cierre', icon: TrendingUp, color: 'text-red-400', description: 'Experto en ventas de alto impacto y expansión agresiva de mercado.' },
  { id: 'akio', name: 'Akio Toyoda', role: 'Calidad y Manufactura', icon: ShieldCheck, color: 'text-slate-400', description: 'Chairman de Toyota. Experto en eficiencia operativa y mejora continua (Kaizen).' },
  { id: 'mate', name: 'Mate Rimac', role: 'Tecnología EV', icon: Zap, color: 'text-yellow-400', description: 'CEO de Rimac. Experto en hiper-autos eléctricos y tecnología de baterías.' },
  { id: 'christian', name: 'Christian von Koenigsegg', role: 'Ingeniería Extrema', icon: Settings2, color: 'text-blue-500', description: 'Fundador de Koenigsegg. Experto en innovación técnica y rendimiento extremo.' },
  { id: 'horacio', name: 'Horacio Pagani', role: 'Diseño y Arte', icon: Sparkles, color: 'text-rose-400', description: 'Fundador de Pagani. Experto en estética, materiales compuestos y exclusividad.' },
  { id: 'gary', name: 'Gary Vaynerchuk', role: 'Social Media y CX', icon: MessageSquare, color: 'text-indigo-400', description: 'Experto en atención al cliente y tendencias en redes sociales.' },
  { id: 'cathy', name: 'Cathy Wood', role: 'Tendencias Futuras', icon: Brain, color: 'text-cyan-400', description: 'CEO de ARK Invest. Experta en tecnologías disruptivas y mercados del futuro.' },
  { id: 'jeff', name: 'Jeff Bezos', role: 'Logística y Eficiencia', icon: Globe, color: 'text-yellow-600', description: 'Fundador de Amazon. Experto en escala, logística y obsesión por el cliente.' },
  { id: 'vitalik', name: 'Vitalik Buterin', role: 'Pagos Digitales/Web3', icon: Zap, color: 'text-blue-300', description: 'Creador de Ethereum. Experto en descentralización y sistemas de pago seguros.' },
  { id: 'tim', name: 'Tim Cook', role: 'Cadena de Suministro', icon: BarChart3, color: 'text-slate-300', description: 'CEO de Apple. Experto en optimización de inventarios y operaciones globales.' },
  { id: 'angela', name: 'Angela Ahrendts', role: 'Retail de Lujo', icon: Sparkles, color: 'text-pink-400', description: 'Ex-Apple/Burberry. Experta en experiencia de compra física y digital de lujo.' },
  { id: 'nassim', name: 'Nassim Taleb', role: 'Gestión de Riesgo', icon: ShieldCheck, color: 'text-red-600', description: 'Autor de El Cisne Negro. Experto en antifragilidad y toma de decisiones bajo incertidumbre.' },
  { id: 'simon', name: 'Simon Sinek', role: 'Liderazgo y Propósito', icon: Brain, color: 'text-yellow-500', description: 'Experto en el "Por Qué" y cultura organizacional de alto rendimiento.' },
  { id: 'sheryl', name: 'Sheryl Sandberg', role: 'Crecimiento Operativo', icon: TrendingUp, color: 'text-blue-600', description: 'Ex-Meta. Experta en escalar plataformas digitales y monetización.' },
  { id: 'peter', name: 'Peter Diamandis', role: 'Tecnologías Exponenciales', icon: Rocket, color: 'text-cyan-500', description: 'Fundador de XPRIZE. Experto en abundancia y el impacto de la IA en los negocios.' },
  { id: 'jim', name: 'Jim Farley', role: 'Transformación Digital', icon: Zap, color: 'text-blue-400', description: 'CEO de Ford. Experto en conectar el legado automotriz con el futuro digital.' }
];

interface ExpertAuditionViewProps {
  onBack: () => void;
  cars: any[];
  users: any[];
}

export const ExpertAuditionView: React.FC<ExpertAuditionViewProps> = ({ onBack, cars, users }) => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<{ expertId: string, text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExperts, setSelectedExperts] = useState<string[]>(EXPERTS.map(e => e.id).slice(0, 5));

  const templates = [
    { label: '🆚 Benchmarking vs Competencia', text: 'Realiza un análisis comparativo de AutoFlux.io frente a gigantes como Kavak, AutoTrader y CarGurus. ¿Qué ventajas competitivas tenemos y qué funcionalidades críticas nos faltan para dominar el mercado?' },
    { label: '🚀 Estrategia de Crecimiento', text: 'Basado en nuestro inventario actual, ¿cuál debería ser nuestra estrategia de marketing y expansión para los próximos 6 meses? Enfócate en captación de vendedores premium.' },
    { label: '🛡️ Auditoría de Confianza', text: '¿Cómo podemos mejorar la percepción de seguridad y exclusividad en la plataforma? Analiza el flujo de compra y la verificación de usuarios.' },
    { label: '📊 Optimización de Inventario', text: 'Analiza nuestro mix de productos actual. ¿Qué marcas faltan? ¿Estamos sobre-stockeados en algún segmento? Sugiere una rotación ideal.' }
  ];

  const handleAudition = async (customQuery?: string) => {
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;
    setIsLoading(true);
    setResponses([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const selectedNames = EXPERTS.filter(e => selectedExperts.includes(e.id)).map(e => `${e.name} (${e.role})`).join(', ');
      
      const inventorySummary = {
        totalCars: cars.length,
        avgPrice: cars.length > 0 ? cars.reduce((acc, car) => acc + (car.price || 0), 0) / cars.length : 0,
        makes: [...new Set(cars.map(c => c.make))],
        totalUsers: users.length,
        sellers: users.filter(u => u.role === 'seller').length
      };

      const prompt = `
        Actúa como un panel de expertos para la plataforma AutoFlux.io (un marketplace de vehículos de lujo y alta gama).
        Los expertos seleccionados para esta audición son: ${selectedNames}.
        
        CONTEXTO DEL SISTEMA ACTUAL:
        - Vehículos en inventario: ${inventorySummary.totalCars}
        - Precio promedio: $${inventorySummary.avgPrice.toLocaleString()}
        - Marcas presentes: ${inventorySummary.makes.join(', ')}
        - Usuarios registrados: ${inventorySummary.totalUsers} (${inventorySummary.sellers} son dealers/vendedores).
        
        El usuario pregunta: "${finalQuery}"
        
        Proporciona una respuesta donde CADA uno de los expertos mencionados dé su opinión crítica, técnica o estratégica basada en su personalidad y experiencia real. 
        
        INSTRUCCIÓN CRÍTICA: Cuando realices una comparación entre modelos, precios o estrategias, utiliza SIEMPRE una tabla de Markdown titulada "📊 COMPARATIVA ESTRATÉGICA" para que la información sea visualmente clara y accionable.
        
        Formato de cada experto:
        ### [Nombre del Experto]
        [Respuesta del experto con análisis profundo y específico basado en los datos del sistema]
        
        ---
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const text = result.text;
      
      // Parse the response into individual expert sections
      const sections = text.split('---').map(s => s.trim()).filter(s => s.length > 0);
      const parsedResponses = sections.map(section => {
        const match = section.match(/### (.*)\n([\s\S]*)/);
        if (match) {
          const name = match[1].trim();
          const expert = EXPERTS.find(e => name.toLowerCase().includes(e.name.toLowerCase()));
          return {
            expertId: expert?.id || 'unknown',
            text: match[2].trim()
          };
        }
        return null;
      }).filter(r => r !== null) as { expertId: string, text: string }[];

      setResponses(parsedResponses);
    } catch (error: any) {
      console.error("Error in expert audition:", error);
      
      let errorMessage = "Ocurrió un error inesperado al contactar con el panel de expertos. Por favor, intenta de nuevo.";
      const rawMessage = error.message ? error.message.toLowerCase() : "";
      
      if (rawMessage.includes("api_key") || rawMessage.includes("key not valid") || rawMessage.includes("unauthenticated")) {
        errorMessage = "Error de autenticación con el servicio de IA. Verifica que tu clave de API Gemini esté configurada.";
      } else if (rawMessage.includes("quota") || rawMessage.includes("429") || rawMessage.includes("exhausted")) {
        errorMessage = "El panel de expertos está muy concurrido en este momento (Límite de cuota alcanzado). Espera unos minutos y vuelve a intentarlo.";
      } else if (rawMessage.includes("network") || rawMessage.includes("fetch") || rawMessage.includes("failed to fetch")) {
        errorMessage = "Hay un problema con la conexión a internet. Revisa tu red e intenta de nuevo para escuchar a los expertos.";
      } else if (rawMessage.includes("500") || rawMessage.includes("503")) {
        errorMessage = "Los servidores del panel están experimentando interrupciones. Por favor, inténtalo más tarde.";
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpert = (id: string) => {
    setSelectedExperts(prev => 
      prev.includes(id) 
        ? prev.filter(expertId => expertId !== id) 
        : (prev.length < 8 ? [...prev, id] : prev)
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#0B0F1A] relative scrollbar-hide">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={onBack}
              className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Volver al Dashboard
            </button>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter flex items-center gap-4">
              <Users className="w-10 h-10 text-blue-500" />
              Audición de Expertos
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium uppercase tracking-widest">Consulta con las mentes más brillantes de la industria</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expertos Seleccionados</p>
              <p className="text-xl font-black text-blue-400">{selectedExperts.length} / 8</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar: Expert Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-[2rem] border-white/10">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Panel de Profesionales
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {EXPERTS.map((expert) => (
                  <button
                    key={expert.id}
                    onClick={() => toggleExpert(expert.id)}
                    className={cn(
                      "w-full p-3 rounded-2xl border transition-all flex items-center gap-3 text-left group",
                      selectedExperts.includes(expert.id)
                        ? "bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                      selectedExperts.includes(expert.id) ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500"
                    )}>
                      <expert.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-xs font-bold truncate",
                        selectedExperts.includes(expert.id) ? "text-white" : "text-slate-400"
                      )}>{expert.name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter truncate">{expert.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main: Chat and Responses */}
          <div className="lg:col-span-3 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Rocket className="w-32 h-32 text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">¿Qué quieres consultar hoy?</h3>
                <p className="text-slate-500 text-sm mb-8">Plantea un desafío de negocio, una duda técnica o una estrategia de mercado.</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {templates.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => handleAudition(t.text)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-full text-[10px] font-bold transition-all"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ej: ¿Cómo podemos optimizar la logística de entrega de vehículos de lujo en Venezuela usando blockchain?"
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px] resize-none"
                    />
                  </div>
                  <button 
                    onClick={() => handleAudition()}
                    disabled={isLoading || !query.trim() || selectedExperts.length === 0}
                    className="px-8 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-3xl transition-all flex flex-col items-center justify-center gap-2 shadow-xl shadow-blue-900/20 group"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Iniciar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {responses.length > 0 ? (
                  responses.map((resp, idx) => {
                    const expert = EXPERTS.find(e => e.id === resp.expertId);
                    if (!expert) return null;
                    
                    return (
                      <motion.div
                        key={expert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-8 rounded-[2.5rem] border-white/10 shadow-xl"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", expert.color.replace('text', 'bg').replace('400', '600/20').replace('500', '600/20'))}>
                            <expert.icon className={cn("w-7 h-7", expert.color)} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white tracking-tight">{expert.name}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{expert.role}</p>
                          </div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                          <ReactMarkdown>{resp.text}</ReactMarkdown>
                        </div>
                      </motion.div>
                    );
                  })
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <Brain className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">El panel está deliberando...</p>
                      <p className="text-slate-500 text-sm">Analizando datos y perspectivas estratégicas</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Selecciona tus expertos e inicia la consulta</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
