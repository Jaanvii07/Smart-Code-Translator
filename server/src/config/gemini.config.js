import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-2.5-flash";

export const generateContent = async (prompt) => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is required");
  }

  try {
    console.log("Prompt:", prompt);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};