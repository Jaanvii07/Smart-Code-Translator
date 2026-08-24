import { askAI } from "./ai.service.js";
import { ANALYZE_COMPLEXITY_PROMPT } from "../constants/prompts.js";
import { parseGeminiJSON } from "../utils/prompts.utils.js";
import { getLanguageName } from "../constants/languages.js";

export const analyzeComplexity=async(code, language)=>{
    const languageName = getLanguageName(language);

    const prompt = ANALYZE_COMPLEXITY_PROMPT(code, languageName);
    const rawResponse = await askAI(prompt);

    const result=parseGeminiJSON(rawResponse);

    return {
        timeComplexity: result.timeComplexity || "Unknown",
        spaceComplexity: result.spaceComplexity || "Unknown",
        explanation: result.explanation || "No explanation provided.",
    }
};