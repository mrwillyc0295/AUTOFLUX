import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CarFront, MessageSquare, ShieldCheck, Zap, Calculator, Video, CreditCard, TrendingUp,
  MapPin, Calendar, Gauge, Send, X, ChevronRight, ChevronDown, Clock, CheckCircle2, AlertCircle, Share2, DollarSign, Settings,
  Users, Activity, Home, LayoutGrid, Plus, PlayCircle, Heart, Bell, Check, Fuel, Settings2, Search, Eye, MessageCircle, Instagram, Camera, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { MOCK_CARS } from './constants';
import { Car, Message, UserProfile } from './types';
import { getAdvisorResponse } from './services/geminiService';
import { getSmartAnalysis, getMarketTrendsAnalysis } from './services/advisorService';
import { Toaster, toast } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CAR_DATA, SUPPORTED_MAKES } from './carData';
import { APP_CONFIG } from './config';
import { BrandSelectionMenu } from './components/BrandSelectionMenu';
import { db, auth, handleFirestoreError } from './services/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  getDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { ShippingTracker } from './components/ShippingTracker';
import { CostCalculator } from './components/CostCalculator';
import { VehicleAnalytics } from './components/VehicleAnalytics';
import { SellerProfile } from './components/SellerProfile';
import { CreatePostView } from './components/CreatePostView';
import { RegistrationView } from './components/RegistrationView';
import { ViewHistory } from './components/ViewHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { ReservationPaymentView } from './components/ReservationPaymentView';
import { VehicleDetails } from './components/VehicleDetails';
import { ComparisonView } from './components/ComparisonView';
import { ExpertAuditionView } from './components/ExpertAuditionView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { MemberReferralView } from './components/MemberReferralView';
import { OptimizedImage } from './components/OptimizedImage';

type AppView = 'dashboard' | 'marketplace' | 'seller-dashboard' | 'member-profile' | 'seller-profile' | 'create-post' | 'vehicle-details' | 'admin-dashboard' | 'reservation-payment' | 'comparison' | 'expert-audition' | 'member-referral';

const AUTOfLUX_ADMIN_WHATSAPP = "+584248691131"; // Número real del dueño

import { FloatingComparisonBar } from './components/FloatingComparisonBar';

export default function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Bienvenido a **AutoFlux.io**. Soy tu Asesor de Negocio Inteligente. ¿Deseas conocer nuestro proceso de compra en 4 etapas, simular una solicitud de video o realizar un pago de reserva?',
      timestamp: new Date()
    }
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Car | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Car | null>(null);
  const [btcRate, setBtcRate] = useState(65000);
  const [currentView, setCurrentView] = useState<AppView>('marketplace');
  const [navigationError, setNavigationError] = useState<string | null>(null);

  // --- SISTEMA DE AFILIADOS: CAPTURA DE REFERIDO ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('autoflux_ref', ref);
      // Opcional: Limpiar URL para una mejor UX
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      console.log("Sistema: Referido capturado ->", ref);
      toast.success("Enlace de afiliado activado", {
        description: `Bienvenido. Referido por: ${ref}`
      });
    }
  }, []);

  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const envStatus = {
    firebase: !!import.meta.env.VITE_FIREBASE_API_KEY,
    gemini: !!import.meta.env.VITE_GEMINI_API_KEY || !!process.env.GEMINI_API_KEY,
    dbId: !!import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID
  };

  // --- ARQUITECTURA SENIOR: OPTIMIZACIÓN Y SEGURIDAD ---
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [lastCallTimestamp, setLastCallTimestamp] = useState<Record<string, number>>({});
  
  // Rate Limiting Secuencial
  const checkRateLimit = (actionId: string, limitMs = 1000): boolean => {
    const now = Date.now();
    const lastCall = lastCallTimestamp[actionId] || 0;
    if (now - lastCall < limitMs) {
      toast.error("Demasiadas peticiones. Por favor, espera un momento.");
      return false;
    }
    setLastCallTimestamp(prev => ({ ...prev, [actionId]: now }));
    return true;
  };

  // Sanitización de Inputs
  const sanitize = (text: string): string => {
    return text.replace(/[<>]/g, "").trim();
  };

  const safeSetView = (view: AppView) => {
    try {
      setNavigationError(null);
      if (!view) throw new Error("Ruta de destino no definida.");
      setCurrentView(view);
    } catch (error: any) {
      console.error("AutoFlux Bug Catch:", error.message);
      setNavigationError("Fallo en el enrutamiento defensivo.");
    }
  };
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [sharingPost, setSharingPost] = useState<any | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [trendsAnalysisResult, setTrendsAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("Estás a punto de salir de tu sesión actual o regresar al inicio.");
  const [exitAction, setExitAction] = useState<(() => void) | null>(null);
  const [videoRequests, setVideoRequests] = useState<{ carId: string; carModel: string; timestamp: Date }[]>([]);
  const [offers, setOffers] = useState<{ carId: string; carModel: string; amount: number; timestamp: Date }[]>([]);

  const handleVideoRequest = (car: Car) => {
    setVideoRequests(prev => [{ carId: car.id, carModel: `${car.make} ${car.model}`, timestamp: new Date() }, ...prev]);
    toast.success(`Nueva solicitud de video`, {
      description: `Un cliente ha solicitado un video del ${car.make} ${car.model}.`,
      action: {
        label: 'Ver',
        onClick: () => safeSetView('seller-dashboard')
      },
    });
  };

  const handleOffer = (car: Car, amount: number) => {
    setOffers(prev => [{ carId: car.id, carModel: `${car.make} ${car.model}`, amount, timestamp: new Date() }, ...prev]);
    toast.info(`Nueva oferta recibida`, {
      description: `Has recibido una oferta de $${amount.toLocaleString()} por el ${car.make} ${car.model}.`,
      action: {
        label: 'Revisar',
        onClick: () => safeSetView('seller-dashboard')
      },
    });
  };

  const toggleComparison = (car: Car) => {
    setComparisonList(prev => {
      const exists = prev.find(c => c.id === car.id);
      if (exists) {
        return prev.filter(c => c.id !== car.id);
      }
      if (prev.length >= 3) {
        alert("Puedes comparar hasta 3 vehículos a la vez.");
        return prev;
      }
      return [...prev, car];
    });
  };

  const [cars, setCars] = useState<Car[]>([]);
  const [viewedCars, setViewedCars] = useState<Car[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);

  // Auth Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Try to recover session from LocalStorage first (WhatsApp link)
        const storedDocId = localStorage.getItem('autoflux_user_doc_id');
        const userDocId = storedDocId || user.uid;
        
        // Sync user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', userDocId));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          setUserProfile(profileData);
          setIsRegistered(true);
          if (profileData.role === 'admin') {
            setIsAdmin(true);
            setProfileReturnView('admin-dashboard');
          } else if (profileData.role === 'seller') {
            setProfileReturnView('seller-dashboard');
          }
          
          // Update lastSeen
          updateDoc(userDoc.ref, { lastSeen: serverTimestamp() }).catch(() => {});
        } else if (storedDocId) {
          // If stored ID doesn't exist anymore, fallback to UID
          const fallbackDoc = await getDoc(doc(db, 'users', user.uid));
          if (fallbackDoc.exists()) {
            setUserProfile(fallbackDoc.data() as UserProfile);
            setIsRegistered(true);
            localStorage.setItem('autoflux_user_doc_id', user.uid);
          }
        }
      } else {
        setUserProfile(null);
        setIsRegistered(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // SISTEMA DE RASTREO DE REFERIDOS (CAPTURAR CÓDIGO)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      console.log("Referido detectado:", refCode);
      localStorage.setItem('autoflux_ref', refCode);
      toast.success("Bienvenido a AutoFlux", {
        description: `Tu asesor de confianza es: ${refCode}. Te brindaremos prioridad de atención.`,
        duration: 8000
      });
    }
  }, []);

  // Sync Cars (Paginación nativa via Query)
  useEffect(() => {
    const qCars = query(
      collection(db, 'cars'), 
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE * page)
    );
    const unsubscribeCars = onSnapshot(qCars, (snapshot) => {
      const carsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
      setCars(carsList);
    }, (error) => {
      console.warn("Public car sync limit/permission", error.message);
      // Don't throw for background syncs to avoid disrupting the UI
    });

    return () => unsubscribeCars();
  }, [page]);

  // Sync with Firestore Chat
  useEffect(() => {
    if (userProfile?.uid) {
      const chatId = userProfile.uid;
      setActiveChatId(chatId);
      
      const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map(doc => ({
          role: doc.data().role as 'user' | 'model' | 'admin',
          text: doc.data().text,
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })).reverse();
        
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }
      }, (error) => {
        console.warn("Chat message sync failed", error.message);
      });

      return () => unsubscribe();
    }
  }, [userProfile]);

  // Admin User Sync
  useEffect(() => {
    if (!isAdmin) {
      setRegisteredUsers([]);
      return;
    }

    const qUsers = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(200) // Optimal for 3000 total cars/users, we view top 200 recent
    );

    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setRegisteredUsers(usersList);
    }, (error) => {
      console.warn("Admin sync failed", error.message);
    });

    return () => unsubscribeUsers();
  }, [isAdmin]);

  const incrementView = async (carId: string) => {
    try {
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, {
        views: (cars.find(c => c.id === carId)?.views || 0) + 1
      }).catch(err => {
        handleFirestoreError(err, 'write', `cars/${carId}`);
        throw err;
      });
    } catch (e) { console.error("Error incrementing view", e); }
  };

  const incrementInteraction = async (carId: string) => {
    try {
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, {
        clics: (cars.find(c => c.id === carId)?.clics || 0) + 1
      }).catch(err => {
        handleFirestoreError(err, 'write', `cars/${carId}`);
        throw err;
      });
    } catch (e) { console.error("Error incrementing click", e); }
  };
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileReturnView, setProfileReturnView] = useState<AppView>('marketplace');
  const [comparisonList, setComparisonList] = useState<Car[]>([]);
  const [nameEditCount, setNameEditCount] = useState(0);
  const [originalName, setOriginalName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const deleteUser = (whatsapp: string) => {
    setRegisteredUsers(prev => prev.filter(u => u.whatsapp !== whatsapp));
  };

  const updateUser = (whatsapp: string, updatedData: Partial<{name: string, whatsapp: string}>) => {
    setRegisteredUsers(prev => prev.map(u => u.whatsapp === whatsapp ? { ...u, ...updatedData } : u));
  };

  const handleRegistration = async (name: string, whatsapp: string, role: 'marketplace' | 'seller') => {
    console.log("Registration started:", name, whatsapp, role);
    try {
      setIsRegistering(true);
      
      // DIAGNÓSTICO EN TIEMPO REAL: Verifica si Firebase está listo
      const hasApiKey = !!import.meta.env.VITE_FIREBASE_API_KEY || !!auth.app.options.apiKey;
      const dbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID;

      if (!hasApiKey) {
        throw new Error("CONFIG_MISSING_API: La llave de Firebase no está configurada. Sigue las instrucciones del Monitor de Diagnóstico.");
      }
      
      if (!dbId || dbId === "ai-studio-eda91011-086a-4d53-9aa0-8c6d453c4726") {
         console.warn("Usando DB ID por defecto o missing.");
      }

      // LOGIN ANÓNIMO SEGURO
      const cred = await signInAnonymously(auth).catch(err => {
        console.error("Firebase Auth Error:", err);
        if (err.code === 'auth/configuration-not-found') throw new Error("AUTH_CONFIG_ERROR: El servicio de autenticación no está listo.");
        if (err.code === 'auth/network-request-failed') throw new Error("NETWORK_ERROR: Revisa tu conexión a internet.");
        throw err;
      });
      
      const uid = cred.user.uid;
      
      // Use whatsapp as ID for persistence if available, otherwise use uid
      const cleanWhatsapp = whatsapp.replace(/\D/g, '');
      const userDocId = cleanWhatsapp ? `wa_${cleanWhatsapp}` : uid;
      localStorage.setItem('autoflux_user_doc_id', userDocId);
      
      // Get referral if exists
      const referralId = localStorage.getItem('autoflux_ref');
      
      const userRef = doc(db, 'users', userDocId);
      const userSnapshot = await getDoc(userRef).catch(err => {
        handleFirestoreError(err, 'get', 'users');
        throw err;
      });
      
      let profile: UserProfile;

      if (userSnapshot.exists()) {
        const existingData = userSnapshot.data() as UserProfile;
        profile = {
          ...existingData,
          uid: userDocId, 
        };
        // Update lastSeen for persistence
        await updateDoc(userRef, { 
          // @ts-ignore
          lastSeen: serverTimestamp() 
        }).catch(err => {
          console.warn("Could not update lastSeen", err);
        });
        toast.success(`Bienvenido de nuevo, ${profile.name}`, { id: 'reg' });
      } else {
        // Nuevo registro o Invitado
        profile = {
          uid: userDocId,
          authUid: uid,
          name,
          whatsapp,
          role,
          createdAt: serverTimestamp(),
          ...(referralId ? { referredBy: referralId } : {})
        };
        await setDoc(userRef, profile).catch(err => {
          handleFirestoreError(err, 'create', 'users');
          throw err;
        });
        toast.success(`Cuenta creada con éxito, ${name}`, { id: 'reg' });
      }
      
      setUserProfile(profile);
      setIsRegistered(true);
      if (profile.role === 'admin') {
        setIsAdmin(true);
        safeSetView('admin-dashboard');
        setProfileReturnView('admin-dashboard');
      } else if (profile.role === 'seller') {
        safeSetView('seller-dashboard');
        setProfileReturnView('seller-dashboard');
      } else {
        safeSetView('marketplace');
      }
    } catch (error: any) {
      console.error("Fallo crítico en Inicio:", error);
      
      let errorMsg = "Ocurrió un problema inesperado.";
      let errorDesc = "Intenta refrescar la página.";

      if (error.message.includes('CONFIG_MISSING')) {
        errorMsg = "Configuración Incompleta";
        errorDesc = "Faltan variables de entorno en Vercel. Haz clic en el rayo (abajo izq) para ver cuáles.";
        setShowDiagnostics(true); 
      } else if (error.message.includes('AUTH_CONFIG_ERROR')) {
        errorMsg = "Servicio no Activado";
        errorDesc = "Debes activar 'Anonymous Auth' en tu consola de Firebase.";
        setShowDiagnostics(true);
      } else if (error.message.includes('NETWORK_ERROR')) {
        errorMsg = "Error de Red";
        errorDesc = "No pudimos conectar con los servidores. Revisa tu internet.";
      } else if (error.code === 'auth/admin-restricted-operation') {
        errorMsg = "Operación Restringida";
        errorDesc = "Debes activar 'Anonymous Auth' en tu Consola de Firebase.";
      }

      toast.error(errorMsg, { 
        id: 'reg-error',
        description: errorDesc,
        duration: 8000
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setIsRegistered(false);
      setIsAdmin(false);
      safeSetView('marketplace');
      
      // Reset App State
      setFilterMake("");
      setFilterModel("");
      setFilterYear("2022");
      setFilterPriceMax("");
      setCurrentPage(1);
      setSelectedCar(null);
      setSelectedSeller(null);
      setComparisonList([]);
      setSharingPost(null);
      setAnalysisResult(null);
      setEditingPost(null);
      setShowAdminLogin(false);
      
      toast.success("Sesión cerrada");
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const [filterMake, setFilterMake] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;

  // Memoización de catálogo para evitar renderizados DDoS y mejorar rendimiento
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      return (
        (filterMake === "" || car.make === filterMake) &&
        (filterModel === "" || car.model === filterModel) &&
        (filterYear === "" || car.year >= parseInt(filterYear)) &&
        (filterPriceMax === "" || car.price <= parseInt(filterPriceMax)) &&
        (filterCondition === "" || car.condition === filterCondition)
      );
    });
  }, [cars, filterMake, filterModel, filterYear, filterPriceMax, filterCondition]);

  const activeCars = useMemo(() => {
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    return filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  }, [filteredCars, currentPage, carsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCars.length / carsPerPage);
  }, [filteredCars, carsPerPage]);

  const [searchHistory, setSearchHistory] = useState<{make: string, model: string, year: string, priceMax: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filterMake || filterModel || (filterYear && filterYear !== "2022") || filterPriceMax) {
        const newSearch = { make: filterMake, model: filterModel, year: filterYear, priceMax: filterPriceMax };
        setSearchHistory(prev => {
          const exists = prev.some(s => s.make === newSearch.make && s.model === newSearch.model && s.year === newSearch.year && s.priceMax === newSearch.priceMax);
          if (exists) return prev;
          return [newSearch, ...prev].slice(0, 5);
        });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [filterMake, filterModel, filterYear, filterPriceMax]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Intentamos con Binance (Alta disponibilidad y CORS friendly)
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (binanceRes.ok) {
          const data = await binanceRes.json();
          if (data.price) {
            setBtcRate(parseFloat(data.price));
            return;
          }
        }
        
        // Fallback a Blockchain.info si Binance falla
        const blockchainRes = await fetch('https://blockchain.info/ticker');
        if (blockchainRes.ok) {
          const data = await blockchainRes.json();
          if (data.USD && data.USD.last) {
            setBtcRate(data.USD.last);
            return;
          }
        }
      } catch (e) { 
        // Silenciamos el error para no ensuciar la consola en desarrollo si hay bloqueos de red
        console.warn("No se pudieron actualizar las tasas en tiempo real (BTC). Usando valor por defecto.", e); 
      }
    };
    fetchRates();
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isTyping]);

  useEffect(() => {
    if (userProfile) {
      setProfileWhatsapp(userProfile.whatsapp || '');
      setProfileBio(userProfile.bio || '');
      setProfileName(userProfile.name || '');
      setOriginalName(userProfile.name || '');
      if (userProfile.photo) setProfileImage(userProfile.photo);
    }
  }, [userProfile]);

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSaveProfile = () => {
    if (userProfile) {
      const isNameChanged = profileName !== originalName;
      
      if (isNameChanged && nameEditCount >= 3) {
        alert("Has alcanzado el límite máximo de 3 cambios de nombre.");
        setProfileName(originalName);
        return;
      }

      const updatedProfile = {
        ...userProfile,
        name: profileName,
        whatsapp: profileWhatsapp,
        bio: profileBio,
        ...(profileImage ? { photo: profileImage } : {})
      };
      
      if (isNameChanged) {
        setNameEditCount(prev => prev + 1);
        setOriginalName(profileName);
      }

      setUserProfile(updatedProfile);
      
      // Update in registered users list for persistence
      setRegisteredUsers(prev => prev.map(u => 
        (u.whatsapp === userProfile.whatsapp && u.name === originalName) ? updatedProfile : u
      ));

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const hasUnsavedChanges = () => {
    if (!userProfile) return false;
    return profileName !== (userProfile.name || '') ||
           profileWhatsapp !== (userProfile.whatsapp || '') ||
           profileBio !== (userProfile.bio || '') ||
           profileImage !== (userProfile.photo || null);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentView === 'seller-dashboard' && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentView, profileName, profileWhatsapp, profileBio, profileImage, userProfile]);

  const handleViewChange = (newView: AppView) => {
    if (currentView === 'seller-dashboard' && hasUnsavedChanges()) {
      setConfirmationMessage("Tienes cambios sin guardar en tu perfil. ¿Estás seguro de que deseas salir?");
      setExitAction(() => () => safeSetView(newView));
      setShowExitConfirmation(true);
    } else {
      safeSetView(newView);
    }
  };

  const handleLogout = () => {
    if (currentView === 'seller-dashboard' && hasUnsavedChanges()) {
      setConfirmationMessage("Tienes cambios sin guardar en tu perfil. ¿Estás seguro de que deseas salir?");
      setExitAction(() => logout);
      setShowExitConfirmation(true);
    } else {
      logout();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    if (!checkRateLimit('chat_send', 1500)) return;
    
    const messageText = sanitize(textOverride || input);
    if (!messageText.trim()) return;

    const newUserMessage: Message = { role: 'user', text: messageText, timestamp: new Date() };

    if (!userProfile?.uid) {
      setMessages(prev => [...prev, newUserMessage]);
      setInput('');
      setIsTyping(true);
      try {
        const history = messages.map(m => ({ 
          role: (m.role === 'admin' ? 'model' : m.role) as 'user' | 'model', 
          parts: [{ text: m.text }] 
        }));
        const response = await getAdvisorResponse(messageText, history);
        setMessages(prev => [...prev, { role: 'model', text: response || 'Sin respuesta del asesor.', timestamp: new Date() }]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Hubo un error de conexión con la Inteligencia Artificial.";
        setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage}`, timestamp: new Date() }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Persist to Firestore
    const chatId = userProfile.uid;
    setInput('');
    setIsTyping(true);

    try {
      // 1. Update/Create Chat Header
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef).catch(err => {
        handleFirestoreError(err, 'get', `chats/${chatId}`);
        throw err;
      });
      
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          userId: userProfile.uid,
          userName: userProfile.name,
          lastMessage: messageText,
          status: 'new',
          updatedAt: serverTimestamp()
        }).catch(err => {
          handleFirestoreError(err, 'create', `chats/${chatId}`);
          throw err;
        });
      } else {
        await updateDoc(chatRef, {
          lastMessage: messageText,
          status: 'new',
          updatedAt: serverTimestamp()
        }).catch(err => {
          handleFirestoreError(err, 'update', `chats/${chatId}`);
          throw err;
        });
      }

      // 2. Add Message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'user',
        text: messageText,
        timestamp: serverTimestamp()
      }).catch(err => {
        handleFirestoreError(err, 'create', `chats/${chatId}/messages`);
        throw err;
      });

      // 3. AI response
      const history = messages.map(m => ({ 
        role: (m.role === 'admin' ? 'model' : m.role) as 'user' | 'model', 
        parts: [{ text: m.text }] 
      }));
      const responseText = await getAdvisorResponse(messageText, history);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        text: responseText || 'He recibido tu mensaje. Un asesor revisará tu caso pronto.',
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error("Error in chat persistence:", error);
      toast.error("Error al enviar mensaje");
    } finally {
      setIsTyping(false);
    }
  };

  const renderChatSidebar = () => {
    return (
      <aside className={cn(
        "bg-white flex flex-col shrink-0 overflow-hidden relative z-50",
        currentView === 'vehicle-details' 
          ? "w-full h-[600px] rounded-[2.5rem] mt-8 shadow-2xl border border-slate-200" 
          : "w-full md:w-96 border-l border-slate-200 h-[500px] md:h-screen"
      )}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Asesor AutoFlux</h2>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Inteligencia de Negocio
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100" 
                  : "bg-slate-100 text-black rounded-tl-none"
              )}>
                <div className="prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && idx === messages.findLastIndex(m => m.role === 'model') && (msg.text.includes('[Pagar Reserva ($300)]') || msg.text.includes('[Conversar]') || msg.text.includes('[PayPal]') || msg.text.includes('[Cripto]') || msg.text.includes('[PagoMovil]') || msg.text.includes('[$tranferencia]') || msg.text.includes('[Enviar Comprobante]')) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {msg.text.includes('[PayPal]') && (
                      <button 
                        onClick={() => handleSendMessage(undefined, "Quiero pagar con PayPal")}
                        className="px-4 py-2 bg-[#003087] text-white rounded-xl text-xs font-bold hover:bg-[#001C64] transition-all shadow-lg"
                      >
                        PayPal
                      </button>
                    )}
                    {msg.text.includes('[Cripto]') && (
                      <button 
                        onClick={() => handleSendMessage(undefined, "Quiero pagar con Cripto (Binance)")}
                        className="px-4 py-2 bg-[#F3BA2F] text-black rounded-xl text-xs font-bold hover:bg-[#F3BA2F]/80 transition-all shadow-lg"
                      >
                        Cripto (Binance)
                      </button>
                    )}
                    {msg.text.includes('[PagoMovil]') && (
                      <button 
                        onClick={() => handleSendMessage(undefined, "Quiero pagar con Pago Movil (Bancamiga)")}
                        className="px-4 py-2 bg-[#E14170] text-white rounded-xl text-xs font-bold hover:bg-[#C02F5A] transition-all shadow-lg"
                      >
                        Pago Móvil
                      </button>
                    )}
                    {msg.text.includes('[$tranferencia]') && (
                      <button 
                        onClick={() => handleSendMessage(undefined, "Quiero pagar con Transferencia Bank (Digital Waves)")}
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all shadow-lg"
                      >
                        Transferencia $
                      </button>
                    )}
                    {msg.text.includes('[Pagar Reserva ($300)]') && (
                      <button 
                        onClick={() => handleSendMessage(undefined, "Quiero pagar la reserva de $300")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                      >
                        Pagar Reserva ($300)
                      </button>
                    )}
                    {msg.text.includes('[Enviar Comprobante]') && (
                      <button 
                        onClick={() => window.open(`https://wa.me/${AUTOfLUX_ADMIN_WHATSAPP.replace(/\D/g, '')}?text=Hola,%20adjunto%20comprobante%20de%20pago%20de%20mi%20reserva.`, '_blank')}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 flex items-center gap-1"
                      >
                        Enviar Comprobante 📸
                      </button>
                    )}
                    {msg.text.includes('[Conversar]') && (
                      <button 
                        onClick={() => window.open(`https://wa.me/${AUTOfLUX_ADMIN_WHATSAPP.replace(/\D/g, '')}`, '_blank')}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-200"
                      >
                        Conversar
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="p-4 bg-slate-100 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm border border-slate-200/50">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-duration:1s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                  Asesor escribiendo...
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe al asesor..."
              className="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium text-black"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              type="button"
              onClick={() => handleSendMessage(undefined, "Simula un pago en BTC")}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-colors"
            >
              Simular Pago BTC
            </button>
            <button 
              type="button"
              onClick={() => handleSendMessage(undefined, "Simula un pago con PayPal")}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-colors"
            >
              Simular Pago PayPal
            </button>
            <button 
              type="button"
              onClick={() => handleSendMessage(undefined, "Simula una solicitud de video")}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-colors"
            >
              Simular Video
            </button>
            <button 
              type="button"
              onClick={() => handleSendMessage(undefined, "Simula una oferta")}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-colors"
            >
              Simular Oferta
            </button>
            <button 
              type="button"
              onClick={() => handleSendMessage(undefined, "¿Cómo es el proceso de compra en 4 etapas?")}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-colors"
            >
              Ver Proceso (4 Etapas)
            </button>
          </div>
        </form>
      </aside>
    );
  };

  const renderDiagnostics = () => (
    <AnimatePresence>
      {showDiagnostics && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowDiagnostics(false)}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Activity className="text-blue-400" /> Diagnóstico de Sistema
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Firebase API Key</span>
                  {envStatus.firebase ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : <AlertCircle className="text-red-500 w-5 h-5" />}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Gemini (AI) API Key</span>
                  {envStatus.gemini ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : <AlertCircle className="text-red-500 w-5 h-5" />}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Firestore Database ID</span>
                  {envStatus.dbId ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : <AlertCircle className="text-red-500 w-5 h-5" />}
                </div>
              </div>
            </div>

            {!envStatus.firebase && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm leading-relaxed">
                  <strong>⚠️ IMPORTANTE:</strong> Faltan variables de entorno en Vercel. 
                  Copia los comandos que te di en AI Studio y pégalos en la sección "Environment Variables" de tu proyecto en Vercel.
                </p>
              </div>
            )}

            <button 
              onClick={() => setShowDiagnostics(false)}
              className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Toaster position="top-right" expand={false} richColors theme="dark" />
      {renderDiagnostics()}
      
      {/* Emergency Toggle for Vercel debugging */}
      <button 
        onClick={() => setShowDiagnostics(true)}
        className="fixed bottom-4 left-4 z-[400] w-10 h-10 bg-slate-900/50 border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-opacity opacity-20 hover:opacity-100"
        title="Diagnostic Monitor"
      >
        <Activity className="w-4 h-4" />
      </button>


      {false && isRegistering && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0B0F1A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            {/* Loading UI removed as per user request */}
          </motion.div>
        </AnimatePresence>
      )}

      {!isRegistered && !isAdmin ? (
        <RegistrationView 
          onSecretAdminClick={() => setShowAdminLogin(true)}
          onRegister={handleRegistration}
        />
      ) : (
        <ErrorBoundary onReset={() => setNavigationError(null)}>
          <div className="min-h-screen bg-[#0B0F1A] font-sans text-slate-100 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
              {/* Header */}
              <header className="h-20 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-white/5 px-6 md:px-10 flex items-center justify-between shrink-0 z-30 relative">
                <div className="flex items-center justify-start flex-1">
                  <button 
                    onClick={() => handleViewChange('marketplace')}
                    className="text-2xl font-extrabold tracking-tighter hover:opacity-80 transition-opacity text-center whitespace-nowrap"
                  >
                    Auto<span className="text-blue-600">Flux</span>
                  </button>
                </div>
                <div className="flex-1 flex justify-end">
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
                  >
                    <X className="w-3 h-3" />
                    Cambiar Acceso
                  </button>
                </div>
              </header>
              
              {/* Navigation Bar */}
              {/* Navigation bar removed */}


              {isAdmin && currentView !== 'seller-profile' && currentView !== 'vehicle-details' && currentView !== 'reservation-payment' && currentView !== 'create-post' && currentView !== 'marketplace' && currentView !== 'expert-audition' && currentView !== 'comparison' ? (
                <AdminDashboard 
                  cars={cars} 
                  users={registeredUsers} 
                  onDeleteUser={deleteUser}
                  onUpdateUser={updateUser}
                  onViewProfile={(seller) => {
                    setSelectedSeller(seller);
                    setProfileReturnView('admin-dashboard');
                    safeSetView('seller-profile');
                  }}
                  onBack={() => {
                    setExitAction(() => () => setIsAdmin(false));
                    setShowExitConfirmation(true);
                  }} 
                  onGoToMarketplace={() => {
                    safeSetView('marketplace');
                  }}
                  onOpenExpertAudition={() => safeSetView('expert-audition')}
                  onShare={setSharingPost}
                  onAddCar={() => {
                    setProfileReturnView('admin-dashboard');
                    safeSetView('create-post');
                  }}
                />
                ) : currentView === 'marketplace' ? (
                <div className="flex-1 overflow-y-auto p-3 md:p-8 bg-[#0B0F1A]">
                  <div className="max-w-5xl mx-auto">
                      <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center relative">
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tighter">Hot Deals 🔥</h2>
                        <p className="text-slate-500 font-medium uppercase text-[8px] tracking-[0.2em]">GALERIA MARKETPLACE PARA VENEZUELA</p>
                      
                      {/* Dashboard Shortcut for Sellers/Admins */}
                      {(isAdmin || userProfile?.role === 'admin' || userProfile?.role === 'seller') && (
                        <button 
                          onClick={() => {
                            if (isAdmin || userProfile?.role === 'admin') safeSetView('admin-dashboard');
                            else safeSetView('seller-dashboard');
                          }}
                          className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 shadow-xl shadow-blue-600/10"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          Ir a mi Panel de Control
                        </button>
                      )}
                    </div>

                    {/* Brand Selection Menu (Hybrid Mode) */}
                    {APP_CONFIG.menu_config.display_mode === 'hybrid' && (
                      <BrandSelectionMenu 
                        selectedBrand={filterMake}
                        onSelectBrand={(brand) => {
                          if (filterMake === brand) {
                            setFilterMake("");
                            setFilterModel("");
                          } else {
                            setFilterMake(brand);
                            setFilterModel("");
                          }
                          setCurrentPage(1);
                        }}
                      />
                    )}

                    {/* Filters */}
                    <div className="glass-card p-4 md:p-6 rounded-[2rem] mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 md:gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Modelo</label>
                        <div className="relative">
                          <select value={filterModel} onChange={(e) => { setFilterModel(e.target.value); setCurrentPage(1); }} className="w-full p-4 glass-input rounded-2xl text-sm text-white appearance-none cursor-pointer">
                            <option value="" className="bg-[#0B0F1A]">Todos los modelos</option>
                            {filterMake && CAR_DATA[filterMake] ? CAR_DATA[filterMake].map(m => {
                              const mName = typeof m === 'string' ? m : m.name;
                              const mDisplay = typeof m === 'string' ? m : `${m.name} ${m.category ? `- ${m.category}` : ''}`;
                              return <option key={mName} value={mName} className="bg-[#0B0F1A]">{mDisplay}</option>;
                            }) : null}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Condición</label>
                        <div className="relative">
                          <select value={filterCondition} onChange={(e) => { setFilterCondition(e.target.value); setCurrentPage(1); }} className="w-full p-4 glass-input rounded-2xl text-sm text-white appearance-none cursor-pointer">
                            <option value="" className="bg-[#0B0F1A]">Ambos</option>
                            <option value="Nuevo" className="bg-[#0B0F1A]">Nuevo</option>
                            <option value="Usado" className="bg-[#0B0F1A]">Usado</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Año</label>
                        <div className="relative">
                          <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }} className="w-full p-4 glass-input rounded-2xl text-sm text-white appearance-none cursor-pointer">
                            <option value="2022" className="bg-[#0B0F1A]">Desde 2022</option>
                            <option value="2023" className="bg-[#0B0F1A]">Desde 2023</option>
                            <option value="2024" className="bg-[#0B0F1A]">Desde 2024</option>
                            <option value="2025" className="bg-[#0B0F1A]">Desde 2025</option>
                            <option value="2026" className="bg-[#0B0F1A]">Desde 2026</option>
                            <option value="2027" className="bg-[#0B0F1A]">Desde 2027</option>
                            <option value="2028" className="bg-[#0B0F1A]">Desde 2028</option>
                            <option value="2029" className="bg-[#0B0F1A]">Desde 2029</option>
                            <option value="2030" className="bg-[#0B0F1A]">Desde 2030</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!checkRateLimit('ai_analysis', 5000)) return;
                          try {
                            const filtered = filteredCars;
                            
                            const totalSellers = new Set(cars.map(c => c.seller)).size;
                            const totalViews = cars.reduce((acc, c) => acc + (c.views || 0), 0);

                            toast.loading(`IA Consultando mercado para ${filterMake || 'todos los vehículos'}...`, { id: "analysis" });
                            const response = await getSmartAnalysis(filtered, { totalSellers, totalViews });
                            setAnalysisResult(response);
                            toast.success("Análisis completado", { id: "analysis" });
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Error al conectarse a la Inteligencia Artificial.", { id: "analysis" });
                          }
                        }}
                        className="w-full lg:w-auto h-[56px] px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 group shrink-0"
                      >
                         <Zap className="w-4 h-4 fill-white group-hover:animate-pulse" />
                         <span>Buscar con IA</span>
                      </button>

                      <button 
                        onClick={async () => {
                          if (!checkRateLimit('trends_analysis', 10000)) return;
                          try {
                            setIsAnalyzingTrends(true);
                            toast.loading("Generando análisis estratégico de mercado...", { id: "trends" });
                            const response = await getMarketTrendsAnalysis(cars);
                            setTrendsAnalysisResult(response);
                            toast.success("Análisis estratégico listo", { id: "trends" });
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Error al generar análisis estratégico.", { id: "trends" });
                          } finally {
                            setIsAnalyzingTrends(false);
                          }
                        }}
                        className="w-full lg:w-auto h-[56px] px-8 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center justify-center gap-3 group shrink-0"
                      >
                         <Activity className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                         <span>Analizar con IA</span>
                      </button>
                    </div>

                    {trendsAnalysisResult && (
                      <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 z-[130]">
                        <motion.div 
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="glass-card p-8 md:p-12 rounded-[3.5rem] max-w-4xl w-full border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden"
                        >
                          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
                          
                          <div className="flex items-center justify-between mb-8 relative">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <TrendingUp className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Tendencias del Mercado</h3>
                                <p className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.3em]">AI-Driven Strategic Insights</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setTrendsAnalysisResult(null)}
                              className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>

                          <div className="bg-[#0B0F1A]/50 border border-white/5 rounded-[2.5rem] p-6 md:p-10 mb-8 max-h-[60vh] overflow-y-auto custom-scrollbar relative">
                            <div className="prose prose-invert prose-blue max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-blue-400 prose-headings:tracking-tighter prose-li:text-slate-300">
                              <ReactMarkdown>{trendsAnalysisResult}</ReactMarkdown>
                            </div>
                          </div>

                          <div className="flex justify-end gap-4">
                            <button 
                              onClick={() => setTrendsAnalysisResult(null)} 
                              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all"
                            >
                              Entendido
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}


                    

                    {analysisResult && (
                      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 z-[120]">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="glass-card p-8 md:p-12 rounded-[3.5rem] max-w-3xl w-full border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.15)] relative overflow-hidden"
                        >
                          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                          
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                              <Zap className="w-7 h-7 text-white fill-white" />
                            </div>
                            <div>
                              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Reporte Maestro IA</h3>
                              <p className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.3em]">Marketplace Analysis Dashboard</p>
                            </div>
                          </div>

                          <div className="bg-[#0B0F1A]/50 border border-white/5 rounded-[2.5rem] p-6 md:p-8 mb-10 max-h-[55vh] overflow-y-auto custom-scrollbar">
                            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-blue-400 prose-headings:tracking-tighter">
                              <ReactMarkdown>{analysisResult}</ReactMarkdown>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                              onClick={() => {
                                setAnalysisResult(null);
                                // Scroll to first car or open chat
                                window.scrollTo({ top: 1000, behavior: 'smooth' });
                              }} 
                              className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-xl shadow-blue-600/20"
                            >
                              Ver Ofertas Recomendadas
                            </button>
                            <button 
                              onClick={() => setAnalysisResult(null)} 
                              className="px-8 py-5 bg-white/5 text-slate-400 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                            >
                              Cerrar Panel
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
                      {activeCars.map((car) => (
                        <motion.div 
                          key={car.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -10 }}
                          className="glass-card rounded-[2.5rem] overflow-hidden group cursor-pointer"
                          onClick={() => {
                            if (!checkRateLimit('car_click', 500)) return;
                            setSelectedCar(car);
                            setViewedCars(prev => [car, ...prev.filter(c => c.id !== car.id)].slice(0, 5));
                            incrementView(car.id);
                            incrementInteraction(car.id);
                            safeSetView('vehicle-details');
                            handleSendMessage(undefined, `Hola, me interesa negociar el vehículo ${car.make} ${car.model}. ¿Podrías darme más información?`);
                          }}
                        >
                          <div className="relative h-72 overflow-hidden">
                            <OptimizedImage 
                              src={car.image} 
                              alt={car.model}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              containerClassName="w-full h-full"
                              width={800}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                                  
                                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    {APP_CONFIG.logic_rules.show_usa_flag && (
                                      <div className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-2 shadow-xl mb-1">
                                        <span className="text-[10px]">🇺🇸</span>
                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Import</span>
                                      </div>
                                    )}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleComparison(car);
                                      }}
                                      className={cn(
                                        "w-10 h-10 backdrop-blur-md border rounded-full flex items-center justify-center transition-all group/compare",
                                        comparisonList.find(c => c.id === car.id)
                                          ? "bg-blue-600 border-blue-500 text-white"
                                          : "bg-white/10 border-white/10 text-white hover:bg-blue-600 hover:border-blue-500"
                                      )}
                                      title="Comparar"
                                    >
                                      <LayoutGrid className="w-4 h-4 group-hover/compare:scale-110 transition-transform" />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-6 left-6">
                                    <div className="flex items-center gap-3 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                                      <div className="flex items-center gap-1.5 bg-blue-600/20 px-2 py-1 rounded-md border border-blue-500/20">
                                        <MapPin className="w-3 h-3 text-blue-400" />
                                        {car.location}
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md border border-white/10">
                                        <Calendar className="w-3 h-3 text-blue-400" />
                                        {car.year}
                                      </div>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-white tracking-tighter">{car.make} {car.model}</h3>
                                  </div>
                                </div>
                                
                                <div className="p-8">
                                  <div className="flex items-center justify-between mb-8 gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      <div className="relative shrink-0">
                                        {car.sellerPhoto ? (
                                          <OptimizedImage 
                                            src={car.sellerPhoto} 
                                            alt={car.seller} 
                                            className="w-16 h-16 rounded-2xl border-2 border-white/10 object-cover cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-black/20" 
                                            containerClassName="w-16 h-16 rounded-2xl"
                                            width={100}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSeller(car);
                                              setProfileReturnView('marketplace');
                                              safeSetView('seller-profile');
                                            }}
                                          />
                                        ) : (
                                          <div 
                                            className="w-16 h-16 rounded-2xl border-2 border-white/10 bg-blue-600/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-black/20"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSeller(car);
                                              setProfileReturnView('marketplace');
                                              safeSetView('seller-profile');
                                            }}
                                          >
                                            <span className="text-2xl font-black text-blue-400">{car.seller.charAt(0)}</span>
                                          </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-[#0B0F1A] flex items-center justify-center">
                                          <ShieldCheck className="w-3 h-3 text-white" />
                                        </div>
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Dealer</p>
                                        <p className="text-white font-bold text-base truncate cursor-pointer hover:text-blue-400 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSeller(car);
                                            setProfileReturnView('marketplace');
                                            safeSetView('seller-profile');
                                          }}
                                        >
                                          {car.seller}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className={cn(
                                        "inline-block px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.2em] mb-1.5 border shadow-sm",
                                        car.status === 'active'
                                          ? "bg-green-500/20 border-green-500/30 text-green-400 shadow-green-900/40 animate-pulse"
                                          : car.status === 'reserved'
                                            ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                                            : "bg-red-600 border-red-500 text-white shadow-red-900/40 animate-pulse"
                                      )}>
                                        {car.status === 'active' ? '✅ Disponible' : car.status === 'reserved' ? 'Reservado' : '🔥 Vendido'}
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Precio</p>
                                      <p className="text-2xl font-black text-blue-400 tracking-tighter">${car.price.toLocaleString()}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 mb-8">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                      <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Settings2 className="w-5 h-5 text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Transmisión</p>
                                        <p className="text-sm text-white font-bold">{car.transmission || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                      <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Fuel className="w-5 h-5 text-green-400" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Motor</p>
                                        <p className="text-sm text-white font-bold">{car.fuelType || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                      <div className="w-10 h-10 bg-purple-400/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Gauge className="w-5 h-5 text-purple-400" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Litros</p>
                                        <p className="text-sm text-white font-bold">{car.engineLiters ? `${car.engineLiters}L` : 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                      <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5 text-yellow-400" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Condición</p>
                                        <p className="text-sm text-white font-bold">{car.condition || 'Usado'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-colors min-w-0 overflow-hidden">
                                      <div className="flex items-center gap-2 text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-2 truncate">
                                        <Gauge className="w-3 h-3 shrink-0" />
                                        Kilometraje
                                      </div>
                                      <div className="text-white font-black text-base font-mono tracking-tight truncate">
                                        {car.mileage.toLocaleString()} 
                                        <span className="text-[9px] text-slate-500 ml-1">KM</span>
                                      </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-colors min-w-0 overflow-hidden">
                                      <div className="flex items-center gap-2 text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-2 truncate">
                                        <Activity className="w-3 h-3 shrink-0" />
                                        Estatus
                                      </div>
                                      <div className="text-green-400 font-black text-[10px] uppercase tracking-widest truncate">Disponible</div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCar(car);
                                        safeSetView('reservation-payment');
                                      }}
                                      className="w-full py-5 bg-white text-slate-950 rounded-2xl font-extrabold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xl shadow-white/5"
                                    >
                                      <CreditCard className="w-5 h-5" />
                                      RESERVA Y COMPRA
                                    </button>
                                    
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSharingPost(car);
                                      }}
                                      className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-500 hover:border-orange-400 transition-all"
                                    >
                                      <Share2 className="w-4 h-4" />
                                      Compartir
                                    </button>

                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const referrerName = window.prompt("Ingresa tu nombre para rastrear tu comisión:", "");
                                        if (referrerName === null) return; // Cancelled
                                        
                                        const finalName = referrerName.trim() || 'Un aliado AutoFlux';
                                        const message = `🚀 OPORTUNIDAD: Refiero este ${car.make} ${car.model} de $${car.price.toLocaleString()}. \n\nVer aquí: ${window.location.origin}/car/${car.id}?ref=${encodeURIComponent(finalName)} \n\nReferido por: ${finalName}`;
                                        
                                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                        toast.success("Sistema de Referidos", { 
                                          description: `¡Éxito! Estás compartiendo como ${finalName}. Se te notificará si se concreta la venta.`,
                                          duration: 6000
                                        });
                                      }}
                                      className="w-full py-5 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-900/10"
                                    >
                                      <Share2 className="w-4 h-4" />
                                      Referir y Ganar
                                    </button>

                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVideoRequest(car);
                                      }}
                                      className="w-full py-5 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                      <Video className="w-4 h-4" />
                                      Pedir Video ($50)
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {totalPages > 1 && (
                            <div className="col-span-full flex items-center justify-center gap-4 mt-12">
                                <button 
                                  onClick={() => {
                                    setCurrentPage(prev => Math.max(1, prev - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  disabled={currentPage === 1}
                                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                                >
                                  <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const startPage = Math.max(0, Math.min(currentPage - 4, totalPages - 6));
                                    const endPage = Math.min(totalPages, startPage + 6);
                                    return Array.from({ length: totalPages }).slice(startPage, endPage).map((_, i) => {
                                      const pageNumber = i + startPage + 1;
                                      return (
                                        <button
                                          key={pageNumber}
                                          onClick={() => {
                                            setCurrentPage(pageNumber);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className={cn(
                                            "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                                            currentPage === pageNumber
                                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                              : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10"
                                          )}
                                        >
                                          {pageNumber}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                                <button 
                                  onClick={() => {
                                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  disabled={currentPage === totalPages}
                                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                            )}

                            {cars.length >= PAGE_SIZE * page && (
                              <div className="col-span-full flex justify-center mt-8">
                                <button
                                  onClick={() => setPage(p => p + 1)}
                                  className="px-8 py-3 bg-white/5 border border-blue-500/30 text-blue-400 hover:text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-blue-600 transition-all flex items-center gap-2"
                                >
                                  Cargar más del inventario
                                </button>
                              </div>
                            )}
                    </div>
                  </div>
            ) : currentView === 'member-referral' && userProfile ? (
              <MemberReferralView 
                user={userProfile}
                onBack={() => safeSetView('member-profile')}
              />
            ) : currentView === 'comparison' ? (
              <ComparisonView 
                selectedCars={comparisonList}
                onRemoveCar={(id) => setComparisonList(prev => prev.filter(c => c.id !== id))}
                onBack={() => safeSetView('marketplace')}
                onSelectCar={(car) => {
                  setSelectedCar(car);
                  safeSetView('vehicle-details');
                }}
              />
            ) : currentView === 'expert-audition' ? (
              <ExpertAuditionView 
                onBack={() => safeSetView(isAdmin ? 'admin-dashboard' : 'seller-dashboard')} 
                cars={cars}
                users={registeredUsers}
              />
            ) : currentView === 'seller-dashboard' ? (
              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0B0F1A] scrollbar-hide">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-10 md:mb-16 flex flex-col items-center text-center gap-8">
                    <div className="max-w-2xl px-4">
                      <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-3">DEALER DASHBOARD</h2>
                      <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Miami Auto Deals</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-2">


                      <div className="w-full px-5 py-5 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-start md:items-center gap-4">
                        <Camera className="w-6 h-6 md:w-8 md:h-8 text-amber-500 shrink-0 mt-0.5 md:mt-0" />
                        <p className="text-sm md:text-base text-[#FFFDD0] font-bold tracking-wide text-left leading-relaxed">
                          📸 <span className="uppercase">Guía de Publicación:</span> Para validar tu anuncio sube 10 fotos (4 Exterior • 2 Interior • 2 Tablero • 2 Detalles Técnicos).
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button 
                          onClick={() => {
                            if (!checkRateLimit('create_post_btn', 3000)) return;
                            setProfileReturnView('seller-dashboard');
                            handleViewChange('create-post');
                          }}
                          className="flex-1 px-8 py-5 bg-[#A3FF47] text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-[#A3FF47]/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                          <Plus className="w-6 h-6" />
                          Subir Nuevo Vehículo
                        </button>
                        <button 
                          onClick={() => handleViewChange('marketplace')}
                          className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          <LayoutGrid className="w-5 h-5" />
                          Ver Marketplace
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Perfil del Vendedor Integrado */}
                      <div className="glass-card p-8 rounded-[2.5rem] border-white/10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white tracking-[0.15em] uppercase mb-1">
                              Mi Perfil <span className="text-blue-500">Profesional</span>
                            </h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Gestiona tu identidad en AutoFlux</p>
                          </div>
                        </div>
                        
                        <div className="space-y-8">
                          <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="space-y-3 shrink-0">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Foto de Perfil Real</label>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 max-w-[200px]">
                                  Para transmitir confianza y seguridad a los compradores en AutoFlux, es esencial que uses una fotografía real y profesional de ti mismo o de tu conceseionario.
                                </p>
                              </div>
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                                accept="image/*" 
                              />
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-500 border-2 border-dashed border-white/10 cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all group overflow-hidden"
                              >
                                {profileImage ? (
                                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <Users className="w-6 h-6 group-hover:scale-110 transition-transform mb-1 text-slate-400 group-hover:text-blue-400 mt-2" />
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2 text-center group-hover:text-blue-400">Subir Retrato</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 space-y-6 w-full">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                                    <span className={cn(
                                      "text-[9px] font-bold uppercase tracking-tighter",
                                      nameEditCount >= 3 ? "text-red-500" : "text-blue-400"
                                    )}>
                                      {3 - nameEditCount} cambios restantes
                                    </span>
                                  </div>
                                  <input 
                                    type="text" 
                                    className={cn(
                                      "w-full p-4 glass-input rounded-2xl text-white font-medium text-sm transition-all",
                                      nameEditCount >= 3 && profileName === originalName ? "opacity-50 cursor-not-allowed" : ""
                                    )} 
                                    placeholder="Tu nombre..." 
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    disabled={nameEditCount >= 3 && profileName === originalName}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">WhatsApp de Contacto</label>
                                  <input 
                                    type="text" 
                                    className="w-full p-4 glass-input rounded-2xl text-white font-medium text-sm" 
                                    placeholder="+58 412..." 
                                    value={profileWhatsapp}
                                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Biografía Profesional</label>
                                <textarea 
                                  className="w-full p-4 glass-input rounded-2xl text-white font-medium text-sm" 
                                  rows={2} 
                                  placeholder="Tu experiencia..."
                                  value={profileBio}
                                  onChange={(e) => setProfileBio(e.target.value)}
                                ></textarea>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={handleSaveProfile}
                            className={cn(
                              "w-full py-4 rounded-2xl font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl",
                              showSaveSuccess 
                                ? "bg-green-600 text-[#FFFDD0] shadow-green-600/20" 
                                : "bg-orange-600 text-[#FFFDD0] hover:bg-orange-500 shadow-orange-600/20"
                            )}
                          >
                            {showSaveSuccess ? '¡Perfil Actualizado!' : 'Actualizar Perfil'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest text-center">Mi Galería de Carros</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-orange-600/20 rounded-[2rem] border border-orange-500/30 min-w-0 break-words text-center">
                            <span className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest mb-2 leading-tight">
                              Valor Promedio
                            </span>
                            <span className="text-xl md:text-2xl font-black text-orange-400 font-display truncate w-full text-center">
                              ${Math.round(cars.filter(car => car.seller === userProfile?.name).reduce((sum, car) => sum + (car.basePrice || car.price), 0) / (cars.filter(car => car.seller === userProfile?.name).length || 1)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-[2rem] border border-orange-500/50 shadow-lg shadow-orange-900/20 min-w-0 break-words text-center">
                            <span className="text-[10px] font-bold text-orange-300/80 uppercase tracking-widest mb-2 leading-tight flex items-center justify-center gap-1 text-center">
                              Valor Total de Todos los Carros
                            </span>
                            <span className="text-xl md:text-2xl font-black text-orange-300 font-display truncate w-full text-center">
                              ${cars.filter(car => car.seller === userProfile?.name).reduce((sum, car) => sum + (car.basePrice || car.price), 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white/5 rounded-[2rem] border border-white/10 min-w-0 break-words text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 leading-tight text-center">
                              Inventario
                            </span>
                            <span className="text-xl md:text-2xl font-black text-slate-300 font-display truncate w-full text-center">
                              {cars.filter(car => car.seller === userProfile?.name).length} Unidades
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-xl">
                              <Eye className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Top 3 Carros Más Vistos</h3>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {cars
                              .filter(car => car.seller === userProfile?.name)
                              .sort((a, b) => (b.views || 0) - (a.views || 0))
                              .slice(0, 3)
                              .map((car, index) => (
                                <div key={car.id} className="flex items-center gap-4 bg-[#0B0F1A] p-4 rounded-2xl border border-white/5">
                                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                    <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded-full">
                                      {index + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-bold truncate">{car.make} {car.model}</h4>
                                    <p className="text-slate-400 text-xs mb-2">{car.year} • {car.location}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                                        <Eye className="w-3 h-3 text-blue-400" />
                                        <span className="text-xs font-mono text-white">{car.views || 0}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                                        <Zap className="w-3 h-3 text-orange-400" />
                                        <span className="text-xs font-mono text-white">{car.clics || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cars.filter(car => car.seller === userProfile?.name).map((car) => (
                          <motion.div 
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
                            onClick={() => {
                              setSelectedCar(car);
                              handleViewChange('vehicle-details');
                            }}
                          >
                            <div className="relative h-56 overflow-hidden">
                              <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#A3FF47] uppercase tracking-widest bg-[#A3FF47]/10 px-3 py-1.5 rounded-full border border-[#A3FF47]/20">Publicado</span>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">{car.year}</span>
                              </div>
                            </div>
                            <div className="p-8">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-white tracking-tight">{car.make} {car.model}</h3>
                                  <p className="text-green-400 text-xs mt-1 font-bold mb-4">Precio Dealer: ${(car.basePrice || car.price).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle Edit
                                    }}
                                    className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-all"
                                  >
                                    <Settings2 className="w-4 h-4 text-slate-400 hover:text-white" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle Delete
                                    }}
                                    className="p-2 bg-white/5 rounded-lg hover:bg-red-600 transition-all"
                                  >
                                    <X className="w-4 h-4 text-slate-400 hover:text-white" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="space-y-2 mb-6">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                  <Settings2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Transmisión</span>
                                    <span className="text-[10px] text-white font-bold">{car.transmission || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                  <Fuel className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Motor</span>
                                    <span className="text-[10px] text-white font-bold">{car.fuelType || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                  <Gauge className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Litros</span>
                                    <span className="text-[10px] text-white font-bold">{car.engineLiters ? `${car.engineLiters}L` : 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                  <Tag className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Condición</span>
                                    <span className="text-[10px] text-white font-bold">{car.condition || 'Usado'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 text-slate-500">
                                  <Users className="w-4 h-4" />
                                  <span className="text-xs font-bold">{car.views || 0} Vistas</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs font-bold">{car.interactions || 0} Interacciones</span>
                                </div>
                              </div>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSharingPost(car);
                                }}
                                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-orange-500 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                Compartir Post
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Solicitudes de Video</h3>
                        <div className="space-y-4">
                          {videoRequests.length > 0 ? (
                            videoRequests.map((req, idx) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <Bell className="w-4 h-4 text-yellow-500" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NUEVA SOLICITUD</p>
                                    <p className="text-sm font-bold text-white">{req.carModel}</p>
                                    <p className="text-[8px] text-slate-500 font-mono">{req.timestamp.toLocaleTimeString()}</p>
                                  </div>
                                </div>
                                <button className="w-full py-2.5 bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                  Subir Video
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-xs text-slate-500 font-medium italic">No hay solicitudes pendientes</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Ofertas Recibidas</h3>
                        <div className="space-y-4">
                          {offers.length > 0 ? (
                            offers.map((offer, idx) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NUEVA OFERTA</p>
                                    <p className="text-sm font-bold text-white">{offer.carModel}</p>
                                    <p className="text-lg font-black text-green-400 tracking-tighter">${offer.amount.toLocaleString()}</p>
                                    <p className="text-[8px] text-slate-500 font-mono">{offer.timestamp.toLocaleTimeString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-xs text-slate-500 font-medium italic">No hay ofertas pendientes</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Comisiones Acumuladas:</h3>
                        <p className="text-4xl font-black text-white tracking-tighter mb-6">$0</p>
                        <button className="w-full py-4 bg-white/5 text-[#FFFDD0] rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                          Cobrar
                        </button>
                      </div>

                      <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Mis Dealers Verificados</h3>
                        <div className="space-y-4">
                          {[
                            { name: "Mis Dealers", team: "USA Dato Team" },
                            { name: "Miami Auto Deals", team: "USA Dato Team" }
                          ].map((v, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                  <Users className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{v.name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{v.team}</p>
                                </div>
                              </div>
                              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => safeSetView('member-referral')}
                        className="w-full py-5 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl mb-4"
                      >
                        <Share2 className="w-5 h-5" />
                        Socio Afiliado ($100/reserva)
                      </button>

                      <button 
                        onClick={() => {
                          setExitAction(() => () => {
                            setIsRegistered(false);
                            setUserProfile(null);
                            setIsAdmin(false);
                          });
                          setShowExitConfirmation(true);
                        }}
                        className="w-full py-5 bg-red-600/10 border border-red-500/20 text-red-500 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                        <X className="w-5 h-5" />
                        Cerrar Sesión / Salir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentView === 'seller-profile' && selectedSeller ? (
              <SellerProfile 
                seller={{
                  name: selectedSeller.seller,
                  photo: selectedSeller.sellerPhoto,
                  bio: selectedSeller.sellerBio
                }}
                cars={cars.filter(c => c.seller === selectedSeller.seller)}
                onBack={() => safeSetView(profileReturnView)}
                onShare={setSharingPost}
                onSelectCar={(car) => {
                  setSelectedCar(car);
                  safeSetView('vehicle-details');
                }}
              />
            ) : currentView === 'create-post' ? (
              <CreatePostView 
                isAdmin={isAdmin}
                onBack={() => safeSetView(profileReturnView || 'seller-dashboard')} 
                onPublish={async (newPost) => {
                  try {
                    toast.loading("Publicando vehículo en la red...", { id: 'pub' });
                    const carData = {
                      ...newPost,
                      sellerId: auth.currentUser?.uid || 'anonymous',
                      seller: userProfile?.name || 'Dealer AutoFlux',
                      sellerPhoto: userProfile?.photo || '',
                      sellerBio: userProfile?.bio || '',
                      status: 'active',
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      views: 0,
                      clics: 0
                    };
                    await addDoc(collection(db, 'cars'), carData);
                    safeSetView(profileReturnView || 'seller-dashboard');
                    toast.success("¡Vehículo publicado con éxito!", { id: 'pub' });
                  } catch (error) {
                    handleFirestoreError(error, 'create', 'cars');
                    toast.error("Error al publicar. Verifica tu conexión.", { id: 'pub' });
                  }
                }}
              />
            ) : currentView === 'vehicle-details' ? (
              selectedCar ? (
                <VehicleDetails 
                  chatSidebar={renderChatSidebar()}
                  car={selectedCar}
                  onBack={() => safeSetView('marketplace')}
                  onShare={setSharingPost}
                  onReserve={() => safeSetView('reservation-payment')}
                  onMakeOffer={(amount) => handleOffer(selectedCar, amount)}
                  onRequestVideo={(car) => {
                    handleVideoRequest(car);
                    const refName = localStorage.getItem('autoflux_ref');
                    const refParam = refName ? `\n(Referido por: ${refName})` : '';
                    window.open(`https://wa.me/${AUTOfLUX_ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hola AutoFlux, solicito video del ${car.make} ${car.model} (${car.year}) por $${car.price.toLocaleString()}.${refParam}`)}`);
                  }}
                  onChatWithAdvisor={(car) => {
                    const refName = localStorage.getItem('autoflux_ref');
                    const refPrefix = refName ? `[SISTEMA DE REFERIDO: ${refName.toUpperCase()}] ` : '';
                    const greeting = `${refPrefix}Me interesa el ${car.make} ${car.model} de $${car.price.toLocaleString()}. ¿Cómo es el proceso?`;
                    
                    setMessages(prev => [...prev, {
                      role: 'user',
                      text: greeting,
                      timestamp: new Date()
                    }]);
                    handleSendMessage(undefined, greeting);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center min-h-screen">
                  {(() => {
                    setTimeout(() => safeSetView('marketplace'), 10);
                    return null;
                  })()}
                </div>
              )
            ) : currentView === 'reservation-payment' && selectedCar ? (
              <ReservationPaymentView 
                car={selectedCar}
                onBack={() => safeSetView('vehicle-details')}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                  <p className="text-slate-500 mt-2">Próximamente disponible.</p>
                </div>
              </div>
            )}

            <FloatingComparisonBar 
              comparisonList={comparisonList}
              onToggle={toggleComparison}
              onClear={() => setComparisonList([])}
              onViewComparison={() => safeSetView('comparison')}
              isVisible={['marketplace', 'vehicle-details', 'seller-dashboard', 'seller-profile'].includes(currentView)}
            />

          </main>

          <ConfirmationModal 
            isOpen={showExitConfirmation}
            title="¿Estás seguro?"
            message={confirmationMessage}
            onConfirm={() => {
              if (exitAction) exitAction();
              setShowExitConfirmation(false);
              setExitAction(null);
            }}
            onCancel={() => {
              setShowExitConfirmation(false);
              setExitAction(null);
            }}
          />
        </div>
      </ErrorBoundary>
    )}

      {/* Modals */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Video className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Simulación de Video Bajo Demanda</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    El vendedor {selectedCar?.seller} está grabando el video detallado solicitado.
                  </p>
                </div>
                <button onClick={() => setShowVideoModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Flujo de Intermediación Activo</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Una vez el vendedor suba el video, nuestro equipo validará la calidad y estado del {selectedCar?.make} {selectedCar?.model} antes de mostrártelo.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => {
                      setShowVideoModal(false);
                      handleSendMessage(undefined, "Simula un pago en BTC para la reserva de $1,300");
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Avanzar a Reserva
                  </button>
                  <button 
                    onClick={() => setShowVideoModal(false)}
                    className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedSeller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSeller(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center"
            >
              <button onClick={() => setSelectedSeller(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
              {selectedSeller.sellerPhoto ? (
                <img src={selectedSeller.sellerPhoto} alt={selectedSeller.seller} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-6 bg-blue-600/20 border-2 border-white/10 flex items-center justify-center">
                  <span className="text-3xl font-black text-blue-400">{selectedSeller.seller.charAt(0)}</span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedSeller.seller}</h3>
              <p className="text-slate-500 text-sm mb-6">{selectedSeller.sellerBio}</p>
              <button 
                onClick={() => {
                  setSelectedSeller(null);
                  handleSendMessage(undefined, `Hola, me interesa el catálogo de ${selectedSeller.seller}. ¿Me pueden asesorar?`);
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
              >
                Conversar
              </button>
            </motion.div>
          </div>
        )}
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPost(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Editar {editingPost.model}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Cilindrada</label>
                  <input 
                    type="text" 
                    value={editingPost.cilindrada}
                    onChange={(e) => setEditingPost({...editingPost, cilindrada: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Año</label>
                  <input 
                    type="number" 
                    value={editingPost.year}
                    onChange={(e) => setEditingPost({...editingPost, year: parseInt(e.target.value)})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kilometraje (KM)</label>
                  <input 
                    type="number" 
                    value={editingPost.mileage}
                    onChange={(e) => setEditingPost({...editingPost, mileage: parseInt(e.target.value)})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const carRef = doc(db, 'cars', editingPost.id);
                      await updateDoc(carRef, {
                        ...editingPost,
                        updatedAt: serverTimestamp()
                      });
                      setEditingPost(null);
                      toast.success("Cambios guardados");
                    } catch (e) {
                      handleFirestoreError(e, 'update', `cars/${editingPost.id}`);
                    }
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all mt-4"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {selectedAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnalysis(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Análisis de {selectedAnalysis.make} {selectedAnalysis.model}</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <p className="text-sm text-blue-800 font-bold">Potencial de Venta</p>
                  <p className="text-2xl font-bold text-blue-900">Alto</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-sm text-slate-600 font-bold">Clics</p>
                    <p className="text-xl font-bold text-slate-900">120</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-sm text-slate-600 font-bold">Interés</p>
                    <p className="text-xl font-bold text-slate-900">85%</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Este vehículo tiene un alto potencial de venta. Se recomienda mantener el precio competitivo y asegurar que las fotos sean de alta calidad.
                </p>
                <button 
                  onClick={() => setSelectedAnalysis(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all mt-4"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {sharingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSharingPost(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center"
            >
              <button onClick={() => setSharingPost(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Compartir Vehículo</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">
                {sharingPost.make} {sharingPost.model}
              </p>
              
              <div className="flex flex-col space-y-3">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`¡Mira este espectacular ${sharingPost.make} ${sharingPost.model} en AutoFlux.io! Publicado por ${sharingPost.seller || 'Vendedor Verificado'}. ¡Gana *$100 - $500 USD* por referido! 💰 #AutoFlux #VentaDeVehiculos #${(sharingPost.make || '').replace(/\s+/g, '')} #${(sharingPost.model || '').replace(/\s+/g, '')} ${window.location.origin}/post/${sharingPost.id}${userProfile ? `?ref=${userProfile.name.replace(/\s+/g, '').toLowerCase()}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#128C7E] transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                >
                  <MessageSquare className="w-5 h-5" />
                  WhatsApp
                </a>
                <a 
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/post/${sharingPost.id}${userProfile ? `?ref=${userProfile.name.replace(/\s+/g, '').toLowerCase()}` : ''}`)}&quote=${encodeURIComponent(`¡Mira este espectacular ${sharingPost.make} ${sharingPost.model} en AutoFlux.io! Publicado por ${sharingPost.seller || 'Vendedor Verificado'}. ¡Gana *$100 - $500 USD* por referido! 💰 #AutoFlux #VentaDeVehiculos`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#1877F2] text-white rounded-2xl font-bold hover:bg-[#0C5DC7] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                >
                  <Share2 className="w-5 h-5" />
                  Facebook
                </a>
                <button 
                  onClick={() => {
                    const refLink = `${window.location.origin}/post/${sharingPost.id}${userProfile ? `?ref=${userProfile.name.replace(/\s+/g, '').toLowerCase()}` : ''}`;
                    const text = `¡Mira este espectacular ${sharingPost.make} ${sharingPost.model} en AutoFlux.io! Publicado por ${sharingPost.seller || 'Vendedor Verificado'}. ¡Gana *$100 - $500 USD* por referido! 💰 #AutoFlux #VentaDeVehiculos #${(sharingPost.make || '').replace(/\s+/g, '')} #${(sharingPost.model || '').replace(/\s+/g, '')} ${refLink}`;
                    navigator.clipboard.writeText(text);
                    toast.success("¡Enlace y detalles copiados!", {
                      description: "El enlace ya incluye tu código de referido."
                    });
                  }}
                  className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-5 h-5" />
                  Copiar Enlace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-card p-10 rounded-[3rem] w-full max-w-sm shadow-2xl border-purple-500/20"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-purple-600/20 rounded-[2rem] flex items-center justify-center mb-6">
                  <Settings className="w-8 h-8 text-purple-400 animate-spin-slow" />
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-tighter">Acceso de Seguridad</h3>
                <p className="text-slate-500 text-sm mt-2">Ingrese la clave maestra para continuar</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (adminPassInput === "11739552") {
                  try {
                    // Register as admin in Firestore to allow rule-based access
                    if (auth.currentUser) {
                      await setDoc(doc(db, 'admins', auth.currentUser.uid), {
                        masterKey: "11739552",
                        role: "admin",
                        createdAt: serverTimestamp()
                      });
                    }
                    setIsAdmin(true);
                    safeSetView('admin-dashboard');
                    setProfileReturnView('admin-dashboard');
                    setShowAdminLogin(false);
                    setAdminPassInput('');
                    setAdminError(false);
                    toast.success("Acceso Maestro Concedido");
                  } catch (err) {
                    console.error("Admin bootstrap error:", err);
                    // Still allow UI admin if bootstrap fails, but rules might block data
                    setIsAdmin(true);
                    safeSetView('admin-dashboard');
                    setProfileReturnView('admin-dashboard');
                    setShowAdminLogin(false);
                  }
                } else {
                  setAdminError(true);
                  setTimeout(() => setAdminError(false), 2000);
                }
              }}>
                <div className="relative">
                  <input 
                    autoFocus
                    type="password"
                    value={adminPassInput}
                    onChange={(e) => setAdminPassInput(e.target.value)}
                    className={cn(
                      "w-full p-5 bg-white/5 rounded-2xl border transition-all text-center text-2xl tracking-[0.8em] font-bold text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20",
                      adminError ? "border-red-500 animate-shake" : "border-white/10"
                    )}
                    placeholder="••••••••"
                  />
                  {adminError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-[10px] font-bold mt-3 text-center uppercase tracking-widest"
                    >
                      Acceso Denegado: Clave Incorrecta
                    </motion.p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminPassInput('');
                      setAdminError(false);
                    }}
                    className="py-4 bg-white/5 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:from-purple-500 hover:to-indigo-500 transition-all shadow-xl shadow-purple-900/40"
                  >
                    Verificar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
