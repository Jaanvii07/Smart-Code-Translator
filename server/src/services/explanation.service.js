import { askGemini } from "./gemini.service.js";
import { EXPLAIN_PROMPT } from "../constants/prompts.js";
import { parseGeminiJSON } from "../utils/prompts.utils.js";
import { getLanguageName } from "../constants/languages.js";

export const explainCode=async(code , language)=>{
    const languageName = getLanguageName(language);

    const prompt = EXPLAIN_PROMPT(code, languageName);
    const rawResponse = await askGemini(prompt);

    const result=parseGeminiJSON(rawResponse);

    return {
        explanation: result.explanation || "No explanation provided.",
    }
};