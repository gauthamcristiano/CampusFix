import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category, location, message } = req.body || {};

    if (
      typeof category !== "string" ||
      typeof location !== "string" ||
      typeof message !== "string" ||
      category.length > 60 ||
      location.length > 100 ||
      message.length < 12 ||
      message.length > 1200
    ) {
      return res.status(400).json({
        error: "Invalid complaint details"
      });
    }

    const prompt = `
You are Tefi AI, a campus complaint inspection agent.

Analyze this student complaint.

Category: ${category}
Location: ${location}
Description: ${message}

Decide whether it is a genuine campus issue.

Rules:
- APPROVE: Relevant and sufficiently clear campus issue.
- CLARIFY: Relevant but missing important details.
- QUARANTINE: Clearly spam, promotional or unrelated.
- ESCALATE: Possible immediate safety hazard.
- Never classify an emergency as ordinary spam.
- Do not invent facts.
- If uncertain, choose CLARIFY.

Return a reason and suggested responsible team.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: {
              type: Type.STRING,
              enum: ["APPROVE", "CLARIFY", "QUARANTINE", "ESCALATE"]
            },
            priority: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Urgent"]
            },
            reason: { type: Type.STRING },
            suggestedTeam: { type: Type.STRING }
          },
          required: [
            "decision",
            "priority",
            "reason",
            "suggestedTeam"
          ]
        }
      }
    });

    const result = JSON.parse(response.text);

    const allowedDecisions = [
      "APPROVE", "CLARIFY", "QUARANTINE", "ESCALATE"
    ];

    if (!allowedDecisions.includes(result.decision)) {
      throw new Error("Invalid AI decision");
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Tefi inspection failed:", error.message);

    return res.status(500).json({
      error: "Tefi could not inspect this report. Please try again."
    });
  }
}
