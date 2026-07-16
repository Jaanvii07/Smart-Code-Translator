import { generateContent } from "../config/gemini.config.js";

export const askGemini=async(prompt)=>{
    try{
        const response=await generateContent(prompt);

        if(!response) {
            throw new Error("No response from Gemini API");
        }

        return response;
    }
    catch (error) {
        console.error("Error in askGemini:", error.message);
        throw new Error("This service is currently unavailable. Please try again later.");
    }
};

