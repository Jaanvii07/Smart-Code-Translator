/**
 * Escapes raw control characters (newline, tab, carriage return, etc.)
 * found *inside* JSON string literals. Gemini sometimes returns multi-line
 * text (e.g. a code field or a long explanation) as a real line break
 * instead of an escaped \n, which is invalid JSON and throws "Bad control
 * character in string literal" on JSON.parse. This walks the text
 * character-by-character, tracking whether we're inside a string, and
 * only touches control characters found there — structural JSON
 * whitespace outside strings is left untouched.
 */
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
      console.error("Failed to parse Gemini JSON response:", secondError.message);
      console.error("Raw response was:", text);
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