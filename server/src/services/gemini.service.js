import { generateContent } from "../config/gemini.config.js";
import logger from "../config/logger.js";

export const askGemini = async (prompt) => {
  try {
    const response = await generateContent(prompt);

    if (!response) {
      throw new Error("No response from Gemini API");
    }

    return response;
  } catch (error) {
    logger.error({ err: { message: error.message } }, "askGemini failed");
    throw new Error("This service is currently unavailable. Please try again later.");
  }
};