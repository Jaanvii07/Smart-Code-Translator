import logger from "../config/logger.js";

const sanitizeJsonControlChars = (str) => {
  let result = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString && char.charCodeAt(0) < 0x20) {
      switch (char) {
        case "\n":
          result += "\\n";
          break;
        case "\r":
          result += "\\r";
          break;
        case "\t":
          result += "\\t";
          break;
        case "\b":
          result += "\\b";
          break;
        case "\f":
          result += "\\f";
          break;
        default:
          result += "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");
      }
      continue;
    }

    result += char;
  }

  return result;
};

export const parseGeminiJSON = (text) => {
  let cleanText = text.trim();

  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\s*\n?/, "");
    cleanText = cleanText.replace(/\n?```\s*$/, "");
  }

  cleanText = cleanText.trim();

  try {
    return JSON.parse(cleanText);
  } catch (firstError) {
    // First attempt failed — most likely an unescaped control character
    // (raw newline/tab) inside a string value. Sanitize and retry once
    // before giving up.
    try {
      return JSON.parse(sanitizeJsonControlChars(cleanText));
    } catch (secondError) {
      // Only log a short, bounded preview — never the full response — since
      // the response text contains the user's translated/optimized code or
      // explanation end-to-end. This preview exists purely to diagnose
      // malformed-JSON structure, not to capture full content.
      logger.error(
        {
          err: secondError.message,
          responseLength: text.length,
          responsePreview: text.slice(0, 200),
        },
        "Failed to parse Gemini JSON response"
      );
      throw new Error(
        "Failed to parse AI response. The AI returned an unexpected format.",
      );
    }
  }
};

export const cleanCodeResponse = (text) => {
  let cleanText = text.trim();

  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```\w*\s*\n?/, "");
    cleanText = cleanText.replace(/\n?```\s*$/, "");
  }

  return cleanText.trim();
};