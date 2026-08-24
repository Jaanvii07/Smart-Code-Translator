const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Configurable via env so the model can be changed without a redeploy.
// llama-3.3-70b-versatile is Groq's strongest free-tier general-purpose
// model and handles structured/JSON code tasks well.
const MODEL_NAME = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Prevents a hung request from blocking the caller indefinitely.
const REQUEST_TIMEOUT_MS = 30_000;

export const generateContent = async (prompt) => {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is required");
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in your .env file");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    console.log("Prompt:", prompt);

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("Groq API Error:", response.status, errorBody);

      // Groq's free-tier rate limit is 429 — worth its own message since
      // it's the most likely failure mode on the free plan, distinct from
      // an actual outage or bad request.
      if (response.status === 429) {
        throw new Error("Groq rate limit reached. Please try again in a moment.");
      }

      throw new Error(`Groq request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Groq returned an unexpected payload:", JSON.stringify(data));
      throw new Error("Groq returned an empty response");
    }

    return content;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Groq request timed out");
    }
    console.error("Groq API Error:", error.message);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};