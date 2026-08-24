import { askAI } from "./ai.service.js";
import { OPTIMIZE_PROMPT } from "../constants/prompts.js";
import { parseGeminiJSON } from "../utils/prompts.utils.js";
import { getLanguageName } from "../constants/languages.js";

export const optimizeCode=async(code , language)=>{
    const languageName = getLanguageName(language);

    const prompt = OPTIMIZE_PROMPT(code, languageName);
    const rawResponse = await askAI(prompt);

    const result=parseGeminiJSON(rawResponse);

    return {
       optimizedCode: result.optimizedCode || "",
       suggestions: result.suggestions || "No suggestions available.",
    }
};