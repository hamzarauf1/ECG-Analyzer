import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Set max duration for the API route

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 }
      );
    }

    // Get the Google Cloud API key from environment variables
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "API key not configured" },
        { status: 500 }
      );
    }

    // Convert the image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Set up the payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "This is an ECG image. Please analyze it in detail. Provide a professional medical interpretation including:\n\n1. Heart rate and rhythm assessment\n2. Identification of any abnormalities\n3. P-wave, QRS complex, and T-wave analysis\n4. Potential clinical significance\n\nOrganize your response clearly with sections and bullet points where appropriate.",
            },
            {
              inline_data: {
                mime_type: image.type,
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    // Make the request to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        {
          message:
            "Error from Gemini API: " +
            (errorData.error?.message || "Unknown error"),
        },
        { status: geminiResponse.status }
      );
    }

    const data = await geminiResponse.json();
    const analysis = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
