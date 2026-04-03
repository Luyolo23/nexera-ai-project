import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  "HTTP-Referer": "http://localhost:5173",
  "X-Title": "Nexera AI Prototype",
};

export async function normalizeInput(userText) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: `
Extract the main object from the input.

Return ONLY valid JSON in this format:
{ "object": "name" }

Rules:
- object must be 1 or 2 words
- no explanations
- no extra text

Examples:
Input: something astronauts wear
Output: { "object": "helmet" }

Input: protective head gear
Output: { "object": "helmet" }

Now process:
${userText}
`,
          },
        ],
      },
      { headers: HEADERS }
    );

    const raw = response.data.choices[0].message.content;
    console.log("AI raw (normalize):", raw);

  
    try {
      const parsed = JSON.parse(raw);
      return parsed.object.toLowerCase();
    } catch {
      
      const cleaned = raw
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .slice(-2)
        .join(" ")
        .trim();

      return cleaned;
    }
  } catch (error) {
    console.error("Normalize error:", error.response?.data || error);

    
    return userText.toLowerCase();
  }
}

export async function generateExplanation(object) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: `
Explain what a ${object} is used for in a training or educational context.

Rules:
- Maximum 2 sentences
- Simple language
- No extra fluff
`,
          },
        ],
      },
      { headers: HEADERS }
    );

    const raw = response.data.choices[0].message.content;
    console.log("AI raw (explanation):", raw);

    return raw.trim();
  } catch (error) {
    console.error("Explanation error:", error.response?.data || error);

    return "No explanation available.";
  }
}

export async function generateActionExplanation(action, target) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: `
Briefly explain why a learning avatar might perform the action "${action}" with the target "${target}" in an educational simulation.

Rules:
- Maximum 2 sentences
- Simple language
- No extra fluff
`,
          },
        ],
      },
      { headers: HEADERS }
    );

    const raw = response.data.choices[0].message.content;
    console.log("AI raw (action explanation):", raw);

    return raw.trim();
  } catch (error) {
    console.error("Action Explanation error:", error.response?.data || error);
    return "No explanation available for this movement.";
  }
}