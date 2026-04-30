import { GoogleGenAI } from "@google/genai";
import { Car } from "../types";

// Initialize AI lazily to prevent crash if env vars are missing during load
let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY non configurada");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const ADVISOR_SYSTEM_PROMPT = `
Eres el "AutoFlux Strategic Advisor", el analista de datos más sofisticado para el mercado automotriz de Venezuela.
Tu objetivo es analizar un listado de vehículos disponibles y proporcionar una visión estratégica del mercado tanto para compradores como para vendedores.

REGLAS DE ANÁLISIS ESTRATÉGICO:
1. Tendencias de Inventario: Identifica qué marcas y modelos predominan y qué rangos de precios son los más comunes.
2. Oportunidades de Alta Demanda: Basándote en vistas e interacciones, determina qué vehículos tienen mayor tracción y por qué (ej: "Los SUV de 2021+ están rotando un 30% más rápido").
3. Acciones Sugeridas para Vendedores: Recomienda ajustes de precios, mejoras en fotos o tipos de inventario que deberían buscar para maximizar ventas.
4. Mejor Valor para Compradores: Relación Precio/Año/Kilometraje inmejorable.

FORMATO DE SALIDA (Markdown):
- Usa títulos llamativos (###).
- Usa Negritas para enfatizar datos clave.
- Usa puntos de viñeta para claridad.
- Sé profesional, analítico y motivador.
`;

export const getSmartAnalysis = async (cars: Car[], marketContext?: { totalSellers: number, totalViews: number }) => {
  if (cars.length === 0) {
    return "Actualmente no hay vehículos que coincidan con tus filtros. Te sugiero ampliar tu búsqueda para obtener mejores resultados.";
  }

  const prompt = `
  Analiza los siguientes vehículos disponibles y genera un reporte de mejores ofertas para el comprador:
  
  DATOS DE MERCADO ACTUAL:
  - Vendedores Activos: ${marketContext?.totalSellers || 0}
  - Tráfico Total (Vistas): ${marketContext?.totalViews || 0}

  VEHÍCULOS A ANALIZAR:
  ${JSON.stringify(cars.map(c => ({
    model: `${c.make} ${c.model}`,
    year: c.year,
    price: c.price,
    mileage: c.mileage,
    location: c.location,
    popularity: (c.views || 0) + (c.clics || 0)
  })))}

  Por favor, selecciona las mejores opciones y explica por qué el usuario debería reservar HOY mismo.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ADVISOR_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error in AI Analysis:", error);
    throw new Error("No pudimos conectar con el consultor experto en este momento.");
  }
};

export const getMarketTrendsAnalysis = async (allCars: Car[]) => {
  if (allCars.length === 0) {
    return "No hay suficiente inventario para realizar un análisis de tendencias.";
  }

  const prompt = `
  Como analista experto de AutoFlux, realiza un análisis estratégico completo del inventario actual:

  INVENTARIO TOTAL:
  ${JSON.stringify(allCars.map(c => ({
    make: c.make,
    model: c.model,
    year: c.year,
    price: c.price,
    mileage: c.mileage,
    views: c.views || 0,
    clics: c.clics || 0,
    status: c.status
  })))}

  TU TAREA:
  1. Resume las tendencias del inventario actual (marcas dominantes, años promedio, etc.).
  2. Identifica oportunidades de alta demanda (qué modelos están atrayendo más interés y clics).
  3. Sugiere acciones específicas para los vendedores para mejorar su rotación de inventario.
  4. Identifica brechas en el mercado (qué vehículos faltan que tendrían mucha demanda).

  Genera un reporte ejecutivo conciso pero potente.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ADVISOR_SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error in Market Trends Analysis:", error);
    throw new Error("Error al generar el análisis de mercado.");
  }
};
