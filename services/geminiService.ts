import { GoogleGenAI, Type } from "@google/genai";
import { Note, TodoItem } from "../types";

// Initialize Gemini Client
// Note: In a real production app, this should be behind a backend proxy to hide the API key.
// However, per instructions, we use process.env.API_KEY directly.
const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const suggestTasksForCategory = async (categoryName: string): Promise<string[]> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 5 concise, actionable to-do items for a category named "${categoryName}". Return only the tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Suggest Tasks Error:", error);
    throw error;
  }
};

export const enhanceNote = async (note: Note): Promise<{ title: string; content: string }> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Improve the following note. Fix grammar, make it more concise, and suggest a better title if necessary.
      
      Current Title: ${note.title}
      Current Content: ${note.content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as { title: string; content: string };
    }
    return { title: note.title, content: note.content };
  } catch (error) {
    console.error("Gemini Enhance Note Error:", error);
    throw error;
  }
};
