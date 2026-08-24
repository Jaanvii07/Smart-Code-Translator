import { generateContent } from "../config/groq.config.js";

export const askAI = async (prompt) => {
    try {
        const response = await generateContent(prompt);

        if (!response) {
            throw new Error("No response from AI provider");
        }

        return response;
    }
    catch (error) {
        console.error("Error in askAI:", error.message);
        throw new Error("This service is currently unavailable. Please try again later.");
    }
};