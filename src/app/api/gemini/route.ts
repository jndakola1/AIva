import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Google API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
