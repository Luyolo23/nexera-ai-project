import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  "HTTP-Referer": "http://localhost:5173",
  "X-Title": "Nexera Avatar Prototype",
};

// extracts and cleans JSON from AI output

function extractJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return null;
  }

  let cleaned = rawText.trim();

  cleaned = cleaned.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/gi, "").trim();

  //extracting the JSON object if there's surrounding text
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

export async function parseCommand(userText) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "openrouter/auto",
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: "You are a strict command parser. Always respond with valid JSON only. No explanations, no markdown.",
          },
          {
            role: "user",
            content: `
Convert this command into JSON:

"${userText}"

Return **ONLY** valid JSON in this exact format:
{
  "action": "wave" or "walk" or "stop" or "idle",
  "target": "relevant target or none"
}

Examples:
"wave hello" -> {"action": "wave", "target": "none"}
"walk forward" -> {"action": "walk", "target": "forward"}
"stop moving" -> {"action": "stop", "target": "none"}
`,
          },
        ],
      },
      { headers: HEADERS }
    );

    const rawOutput = response.data.choices[0].message.content;
    
    const cleanedJson = extractJson(rawOutput);

    if (!cleanedJson) {
      console.warn("No JSON found in AI response");
      return { action: "idle", target: "none" };
    }

    try {
      const parsed = JSON.parse(cleanedJson);
      return {
        action: parsed.action || "idle",
        target: parsed.target || "none",
      };
    } catch (parseError) {
      return { action: "idle", target: "none" };
    }
  } catch (err) {
    console.error("Command parse request failed:", err);
    return { action: "idle", target: "none" };
  }
}