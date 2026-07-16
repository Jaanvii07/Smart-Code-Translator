/**
 * Escapes raw control characters (newline, tab, carriage return, etc.)
 * that appear *inside* JSON string literals. LLMs frequently return
 * multi-line code as a real line break instead of an escaped \n,
 * which is invalid JSON and throws "Bad control character in string
 * literal" on JSON.parse. This walks the text character-by-character,
 * tracking whether we're inside a string, and only touches control
 * characters found there — structural JSON whitespace is untouched.
 */
function sanitizeJsonControlChars(str) {
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
}

/**
 * Parses a raw LLM text response as JSON, tolerating the two most
 * common ways models mangle it: markdown code fences around the JSON,
 * and unescaped control characters inside string values.
 *
 * Throws the same error message your app already surfaces to the user
 * if every recovery attempt fails.
 */
function parseAIJsonResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Failed to parse AI response. The AI returned an unexpected format.");
  }

  // Strip ```json ... ``` or ``` ... ``` fences if the model wrapped the JSON in one.
  let text = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");

  try {
    return JSON.parse(text);
  } catch (firstError) {
    try {
      return JSON.parse(sanitizeJsonControlChars(text));
    } catch (secondError) {
      console.error("Failed to parse Gemini JSON response:", secondError.message);
      console.error("Raw response was:", rawText);
      throw new Error("Failed to parse AI response. The AI returned an unexpected format.");
    }
  }
}

module.exports = { parseAIJsonResponse, sanitizeJsonControlChars };