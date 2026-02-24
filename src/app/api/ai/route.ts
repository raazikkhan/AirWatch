import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AQI_THRESHOLD = 100;

export async function POST(request: Request) {
  try {
    const { action, userProfile, currentAQI } = await request.json();

    switch (action) {
      case "recommendations": {
        const prompt = `
          Given the following user profile and current AQL:
          User: ${JSON.stringify(userProfile)}
          Current AQI: ${currentAQI}
          AQI Threshold: ${AQI_THRESHOLD}

          Provide 3 personlized health recommendations considering the user's health conditions and activity level, and the current air quality. Each recommendation should be a short, actionable sentence.
        `;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.7,
        });

        const recommendations =
          completion.choices[0]?.message?.content
            ?.split("\n")
            .filter((rec) => rec.trim() !== "") || [];

        return NextResponse.json({ recommendations });
      }

      case "dailyChallenge": {
        const prompt = `
          Given the following user profile and current AQL:
          User: ${JSON.stringify(userProfile)}
          Current AQI: ${currentAQI}
          AQI Threshold: ${AQI_THRESHOLD}

          Provide a single daily challenge related to improving air quality or reducing exposure to air pollution. 
          The challenge should be tailored to the user's profile and current air quality conditions.
          IMPORTANT: Response must be between 20-30 words only. Be concise but specific.
          Format: Start directly with the action, no prefixes like "Your challenge:" or "Today's task:".
        `;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.7,
          max_tokens: 50,
        });

        return NextResponse.json({
          challenge:
            completion.choices[0]?.message?.content?.trim() ||
            "Use public transport today",
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
