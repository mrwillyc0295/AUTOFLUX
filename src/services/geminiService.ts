import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { BUSINESS_RULES } from "../constants";

export const getAdvisorResponse = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING: No se encontró la clave de API de Gemini. Asegúrate de configurar VITE_GEMINI_API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: 'user', parts: [{ text: BUSINESS_RULES }] },
        { role: 'model', parts: [{ text: "Entendido. Estoy listo para actuar como el Asesor de Negocio Inteligente de AutoFlux.io. ¿En qué puedo ayudarte hoy?" }] },
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        tools: [{
          functionDeclarations: [
            {
              name: "solicitar_video_vehiculo",
              description: "Usa esta herramienta cuando el cliente solicite explícitamente ver un video del vehículo para que un equipo humano pueda grabarlo o enviarlo.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  cliente_id: {
                    type: Type.STRING,
                    description: "El ID único del chat o cliente para identificarlo rápidamente."
                  },
                  cliente_nombre: {
                    type: Type.STRING,
                    description: "El nombre del cliente si ha sido proporcionado, o 'Cliente Anónimo' si se desconoce."
                  },
                  vehiculo_interes: {
                    type: Type.STRING,
                    description: "El modelo, año y características del vehículo que el cliente desea ver en video."
                  },
                  dashboard_chat_link: {
                    type: Type.STRING,
                    description: "La URL directa para que el equipo humano abra el chat específico en el Panel de Control (Dashboard) operativo. Ej: https://autoflux.io/dashboard/chat/ID"
                  }
                },
                required: [
                  "cliente_id",
                  "cliente_nombre",
                  "vehiculo_interes",
                  "dashboard_chat_link"
                ]
              }
            } as FunctionDeclaration
          ]
        }]
      }
    });

    const response = await model;
    
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === 'solicitar_video_vehiculo') {
         const args = call.args as Record<string, any>;
         // In a real environment, you would log this to a DB or send a webhook
         console.log("TOOL CALL EMITTED: solicitar_video_vehiculo", args);
         return `¡Entendido! He enviado la alerta a nuestro equipo humano para que te graben o envíen el video personalizado del **${args.vehiculo_interes}**. Hemos registrado tu usuario como *${args.cliente_nombre}*. Se pondrán en contacto contigo muy pronto. ¿Deseas saber algo más sobre este vehículo o revisar el proceso de pago?\n\n*[ALERTA INTERNA PARA RRHH]*\nSe ha generado un nuevo ticket de solicitud de video.\nLink del chat: ${args.dashboard_chat_link}`;
      }
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "Ocurrió un error inesperado al contactar a la inteligencia artificial. Por favor, intenta de nuevo.";
    const rawMessage = error.message ? error.message.toLowerCase() : "";
    
    if (rawMessage.includes("api_key") || rawMessage.includes("key not valid") || rawMessage.includes("unauthenticated")) {
      errorMessage = "Error de autenticación con el servicio de IA. Verifica que tu clave de API Gemini esté configurada correctamente en el entorno.";
    } else if (rawMessage.includes("quota") || rawMessage.includes("429") || rawMessage.includes("exhausted")) {
      errorMessage = "Se ha alcanzado el límite de consultas a la IA por el momento (Quota Exceeded). Por favor, espera unos minutos antes de volver a intentarlo.";
    } else if (rawMessage.includes("network") || rawMessage.includes("fetch") || rawMessage.includes("failed to fetch")) {
      errorMessage = "Hay un problema con la conexión de red al servicio de IA. Revisa tu conexión a internet.";
    } else if (rawMessage.includes("500") || rawMessage.includes("503")) {
      errorMessage = "Los servidores de IA están experimentando problemas actualmente. Por favor, inténtalo de nuevo más tarde.";
    }

    throw new Error(errorMessage);
  }
};
