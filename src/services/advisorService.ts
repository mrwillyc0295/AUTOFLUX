import { GoogleGenAI } from "@google/genai";
import { Car } from "../types";

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ADVISOR_SYSTEM_PROMPT = `
Eres el "AutoFlux Intel Advisor", el bot de análisis más sofisticado para el mercado automotriz de Venezuela.
Tu objetivo es analizar un listado de vehículos disponibles y proporcionar al comprador una recomendación precisa, honesta y ALTAMENTE MOTIVADORA para que tome la decisión de reservar.

REGLAS DE ANÁLISIS:
1. Identifica el "Mejor Valor": No siempre es el más barato, sino el que tiene mejor relación Precio/Año/Kilometraje.
2. Identifica la "Opción de Entrada": El vehículo más accesible pero que cumpla con los estándares de 2021+.
3. Identifica la "Gema Oculta": Un vehículo con muy poco kilometraje o extras interesantes.
4. Genera URGENCIA y CONFIANZA: Explica por qué ese vehículo es una oportunidad que no durará mucho (ej: "Este Corolla tiene un kilometraje inusualmente bajo para su año").
5. Enfócate en la RESERVA ($300): Tu recomendación final SIEMPRE debe invitar al usuario a realizar la Etapa 1 del proceso de AutoFlux para asegurar el vehículo.

FORMATO DE SALIDA (Markdown):
- Usa títulos llamativos (###).
- Usa Negritas para precios y modelos.
- Usa puntos de viñeta para comparar.
- Termina con un párrafo de "Veredicto del Experto" que empuje a la acción.

CONTEXTO DE PLATAFORMA:
- Nicho: 2021 en adelante.
- Modelo: Intermediación Digital Pura (Consignación Digital).
`;

export const getSmartAnalysis = async (cars: Car[], marketContext?: { totalSellers: number, totalViews: number }) => {
  if (cars.length === 0) {
    return "Actualmente no hay vehículos que coincidan con tus filtros. Te sugiero ampliar tu búsqueda para obtener mejores resultados.";
  }

  const prompt = `
  Analiza los siguientes vehículos disponibles en la plataforma AutoFlux.io y genera un reporte de mejores ofertas:
  
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
    popularity: (c.views || 0) + (c.interactions || 0)
  })))}

  Por favor, selecciona las 3 mejores opciones y explica por qué el usuario debería reservar HOY mismo.
  Usa los datos de popularidad y mercado para dar un sentido de urgencia real.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
