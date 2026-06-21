import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured.");
      return NextResponse.json(
        { error: "AI_DISABLED", message: "El servicio de IA no está configurado." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "El prompt no puede estar vacío." },
        { status: 400 }
      );
    }

    // Call OpenAI DALL-E 3 Image Generation API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1792x1024", // Landscape aspect ratio matching 16:9
        response_format: "b64_json"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error response:", errText);
      return NextResponse.json(
        { error: "GENERATION_FAILED", message: `Error de OpenAI: ${response.statusText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    const base64Bytes = responseData.data?.[0]?.b64_json;
    if (!base64Bytes) {
      return NextResponse.json(
        { error: "GENERATION_FAILED", message: "La IA no pudo generar la imagen." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/jpeg;base64,${base64Bytes}`,
    });
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RATE_LIMIT")) {
      return NextResponse.json(
        { error: "RATE_LIMIT", message: "El servicio de IA está ocupado en este momento. Inténtalo de nuevo en unos segundos." },
        { status: 429 }
      );
    }
    console.error("Error generating event image:", error);
    return NextResponse.json(
      { error: "UNKNOWN", message: error?.message || "Ocurrió un error inesperado al generar la imagen." },
      { status: 500 }
    );
  }
}
