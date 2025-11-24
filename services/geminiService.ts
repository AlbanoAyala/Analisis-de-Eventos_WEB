import { GoogleGenAI, Type } from "@google/genai";
import { DrillingEvent, GeminiAnalysisResult } from "../types";

// Initialize Gemini client
// Note: In a real production app, calls should be proxied through a backend to protect the key.
// For this client-side demo, we use the env var directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWellEvents = async (wellName: string, events: DrillingEvent[]): Promise<GeminiAnalysisResult> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Prepare data for the prompt
    const eventsSummary = events.map(e => 
      `- Depth: ${e.prof_desde}m, Type: ${e.subcategoria_npt}, Details: ${e.comentario}`
    ).join('\n');

    const prompt = `
      You are a senior drilling engineer AI assistant. 
      Analyze the following drilling events for well "${wellName}".
      
      Data:
      ${eventsSummary}

      Please provide:
      1. A concise summary of the main operational challenges encountered.
      2. A list of 3 specific technical recommendations to avoid these non-productive time (NPT) events in future wells in the same field.

      Return the response in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GeminiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing well:", error);
    return {
      summary: "Error al conectar con Gemini AI para el análisis.",
      recommendations: ["Verifique su clave API", "Intente nuevamente más tarde"]
    };
  }
};