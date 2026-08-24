import { GoogleGenAI } from "@google/genai";
import logger from "./logger.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-2.5-flash";

export const generateContent = async (prompt) => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is required");
  }

  const startedAt = Date.now();

  // Metadata only — the prompt itself contains the user's source code and
  // must never be written to logs.
  logger.debug(
    { model: MODEL_NAME, promptLength: prompt.length },
    "Gemini request started"
  );

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    logger.info(
      {
        model: MODEL_NAME,
        promptLength: prompt.length,
        responseLength: response.text?.length ?? 0,
        durationMs: Date.now() - startedAt,
      },
      "Gemini request succeeded"
    );

    return response.text;
  } catch (error) {
    logger.error(
      {
        model: MODEL_NAME,
        promptLength: prompt.length,
        durationMs: Date.now() - startedAt,
        err: { name: error.name, message: error.message },
      },
      "Gemini request failed"
    );
    throw error;
  }
};