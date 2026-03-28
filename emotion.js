const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Pull the API key from Vercel's Environment Variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a precise emotion classifier. Analyze the given text and return a JSON array of exactly 6 emotion objects.

EMOTION DEFINITIONS (use these strictly):
- joy: happiness, delight, excitement, contentment, amusement, gratitude
- anger: frustration, rage, irritation, annoyance, hostility, resentment
- sadness: grief, sorrow, loneliness, heartbreak, disappointment, melancholy, missing someone
- fear: anxiety, worry, nervousness, dread, terror, insecurity, panic
- love: romantic affection, deep caring, adoration, desire, intimacy, warmth toward someone PRESENT
- surprise: astonishment, shock, disbelief, unexpectedness, amazement

CRITICAL RULES:
1. The DOMINANT emotion must score >= 0.40. Non-dominant emotions should be low (0.01-0.15).
2. Scores MUST sum to exactly 1.00.
3. "I miss you", "I lost someone", "they left me" = SADNESS, NOT love. Missing someone is grief, not affection.
4. Complaints, frustration about situations = ANGER, not sadness.
5. "I can't believe..." = SURPRISE only if genuinely unexpected. If negative, consider anger or sadness.
6. Only score love high when the text expresses ACTIVE affection or warmth (e.g., "I love you", "you make me so happy").
7. Each object must have "label" (lowercase) and "score" (decimal, 2 decimal places).
8. Focus on emotions... when I am putting sad It's giving love score...
9. Also it shows joy when i am saying sad 

Return ONLY the raw JSON array. No markdown, no explanation, no wrapping.
Example: [{"label":"joy","score":0.65},{"label":"anger","score":0.05},{"label":"sadness","score":0.10},{"label":"fear","score":0.05},{"label":"love","score":0.10},{"label":"surprise","score":0.05}]`;

app.post("/api/emotion", async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs || typeof inputs !== "string") {
      return res.status(400).json({ error: "Missing 'inputs' text field" });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "API key is missing from environment variables." });
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: inputs },
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Groq API error:", response.status, errBody);
      return res.status(response.status).json({ error: "Groq API error" });
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    const emotions = JSON.parse(content);
    res.json([emotions]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// IMPORTANT: Export the app instead of calling app.listen()
module.exports = app;
