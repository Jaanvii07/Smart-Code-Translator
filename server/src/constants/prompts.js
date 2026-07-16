// Shared rules appended to every prompt that must return JSON.
// These exist specifically to prevent the two failure modes that
// actually happened in production: (1) literal newlines inside a
// JSON string value, which breaks JSON.parse, and (2) the model
// wrapping its JSON in markdown fences, which costs an extra parse
// step and occasional truncation.
const JSON_SAFETY_RULES = `
- Return raw JSON only — no markdown code fences, no backticks, no leading/trailing text.
- Any line break inside a JSON string value MUST be written as the two characters \\n (backslash + n), never as an actual newline. This is critical: a real line break inside a string breaks JSON parsing.
- Escape any double quotes that appear inside a string value as \\".
- Output must be a single valid JSON object and nothing else.`;

export const TRANSLATE_PROMPT = (code, sourceLang, targetLang) => `
You are an expert code translator. Translate the following ${sourceLang} code to ${targetLang}.

Rules:
1. Return only the translated code — no explanations, no commentary, no markdown code blocks.
2. Preserve the logic and functionality exactly.
3. Use idiomatic patterns of the target language, not a literal line-by-line port.
4. Include necessary imports/headers for the target language.
5. Do not add example usage, tests, or comments beyond what the original code already had.

Source code (${sourceLang}):
${code}

Translated code (${targetLang}):
`;

export const ANALYZE_COMPLEXITY_PROMPT = (code, language) => `
You are an expert algorithm analyst. Analyze the time and space complexity of the following ${language} code.

Respond with ONLY a JSON object in this exact shape:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "explanation": "markdown-formatted explanation"
}

Content rules:
1. Be precise with Big-O notation; consider worst-case complexity.
2. In "explanation", justify the complexity by pointing to the specific loop, recursion, or data structure responsible — do not just restate the Big-O in words.
3. Use markdown inside "explanation": wrap identifiers, function names, and code terms in backticks (e.g. \`nums[i]\`), and use **bold** only for the 1-2 most important terms. Do not use headers (#) — this is a short explanation, not a document.
4. Do not repeat the full source code back in the explanation.
5. Keep "explanation" under 120 words.
${JSON_SAFETY_RULES}

Code (${language}):
${code}
`;

export const OPTIMIZE_PROMPT = (code, language) => `
You are an expert ${language} developer. Optimize the following code for better performance and readability.

Respond with ONLY a JSON object in this exact shape:
{
  "optimizedCode": "the optimized code",
  "suggestions": "markdown-formatted list of what changed and why"
}

Content rules:
1. Keep the same functionality — optimizing must never change behavior.
2. Use best practices and idiomatic patterns for ${language}.
3. In "suggestions", write one markdown bullet per change, each starting with "- ". Bold the technique name, then a short reason. Example: "- **Use a hash set for lookups** — reduces the membership check from O(n) to O(1)."
4. List only real, meaningful changes. If the code is already optimal, say so in one bullet rather than inventing minor changes.
5. Do not include markdown code fences inside "optimizedCode" — just the raw code.
${JSON_SAFETY_RULES}

Code (${language}):
${code}
`;

export const EXPLAIN_PROMPT = (code, language) => `
You are a patient programming teacher. Explain the following ${language} code in a beginner-friendly way.

Respond with ONLY a JSON object in this exact shape:
{
  "explanation": "markdown-formatted explanation"
}

Content rules:
1. Structure "explanation" as: one short paragraph giving the overall purpose, then 2-5 sections covering the important parts in the order they appear in the code.
2. Use markdown "## " headers for each section (short titles, e.g. "## Reading the input"), not numbered bold text.
3. Wrap identifiers, function/variable names, and syntax in backticks (e.g. \`students.add(...)\`).
4. Use a markdown bullet list ("- ") when listing multiple related items (e.g. multiple imports or steps), instead of a run-on sentence.
5. Use simple language a beginner can understand; define any non-obvious term the first time it's used.
6. Do not repeat the entire source code back — quote only short fragments (a few words) when pointing at something specific.
7. Keep the total explanation under 300 words.
${JSON_SAFETY_RULES}

Code (${language}):
${code}
`;