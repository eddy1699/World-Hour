
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysis } from "../types";

export const getGeminiInsight = async (countryName: string, timezone: string, season?: string): Promise<GeminiAnalysis | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const seasonalContext = season ? `The current season is ${season}.` : '';
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide cultural and current context for ${countryName} considering their timezone is ${timezone}. ${seasonalContext} Describe what people might be doing right now (e.g. breakfast, commuting, sleeping, partying) based on the time and seasonal mood (e.g. cold winter morning, hot summer night).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            culture: { 
                type: Type.STRING, 
                description: "A paragraph about what is likely happening in the country right now based on time and season." 
            },
            vibe: { 
                type: Type.STRING, 
                description: "A short poetic description of the mood." 
            },
            suggestion: { 
                type: Type.STRING, 
                description: "A practical suggestion for someone interacting with this region now, taking the season into account." 
            }
          },
          required: ["culture", "vibe", "suggestion"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return null;
  }
};
