
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  /**
   * AI Orchestrator: Handles complex scheduling logic and CRM queries
   */
  static async processAIRequest(prompt: string, context: { services: any[], staff: any[], tenantName: string }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are Aura AI, a professional concierge for ${context.tenantName}. 
          Your goal is to help users book appointments, learn about services, and answer questions.
          Available Services: ${JSON.stringify(context.services)}
          Available Staff: ${JSON.stringify(context.staff)}
          Response style: Professional, warm, and concise. Always guide the user towards booking.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "The message to show the user" },
              intent: { type: Type.STRING, enum: ["BOOKING", "INFO", "SUPPORT"], description: "Detected user intent" },
              bookingData: {
                type: Type.OBJECT,
                properties: {
                  serviceId: { type: Type.STRING },
                  staffId: { type: Type.STRING },
                  date: { type: Type.STRING },
                  time: { type: Type.STRING }
                }
              }
            }
          }
        }
      });
      
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("AI Orchestrator Error:", error);
      return { reply: "I'm having trouble connecting right now. How can I help you manually?", intent: "SUPPORT" };
    }
  }

  /**
   * Generates a professional logo for the Aura platform using Gemini 3 Pro Image (nano banana pro)
   */
  static async generateLogo(): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: 'A luxury, ultra-minimalist professional logo for a high-end beauty SaaS called "Aura". The design must feature a sophisticated, glowing "A" icon that incorporates a subtle spark and a wave of light. Use a premium gradient of deep indigo, electric violet, and soft silver. The background should be a clean, very dark slate (almost black) to make the glow pop. High-end fashion aesthetic, vector style, 4K resolution, centered, professional brand identity.',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        },
      });

      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Logo Generation Error:", error);
      throw error;
    }
  }

  /**
   * Simplified model for quick translations or validations
   */
  static async getTranslation(text: string, targetLang: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate this text to ${targetLang}: "${text}"`,
    });
    return response.text;
  }
}
