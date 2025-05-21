import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Set max duration for the API route

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Collect all image files from the formData.
    // Assuming the frontend sends multiple files with the same key, e.g., "images".
    const images: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "images" && value instanceof File) {
        images.push(value);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        {
          message: "No images provided. Please upload one or more ECG images.",
        },
        { status: 400 }
      );
    }

    // Get the Google Cloud API key from environment variables
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "API key not configured. Please set GOOGLE_CLOUD_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Prepare the parts for the Gemini API payload
    const contentParts: any[] = [];

    // Add the initial text prompt. This prompt is updated to inform the model
    // that it might receive multiple images that together form a complete ECG strip.
    // It also instructs the model to account for potential overlaps.
    let promptText =
      "This is an ECG analysis request. You will be provided with one or more images that collectively represent a continuous ECG strip. Please analyze these images in detail, considering that there might be overlaps between consecutive images. Provide a professional medical interpretation including:\n\n1. Heart rate and rhythm assessment\n2. Identification of any abnormalities\n3. P-wave, QRS complex, and T-wave analysis\n4. Potential clinical significance\n\nOrganize your response clearly with sections and bullet points where appropriate.";

    contentParts.push({ text: promptText });

    // Convert each image to base64 and add it to the contentParts array
    for (const image of images) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");

      contentParts.push({
        inline_data: {
          mime_type: image.type,
          data: base64Image,
        },
      });
    }

    // Set up the payload for Gemini API
    const payload = {
      contents: [{ parts: contentParts }],
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

    // Check if analysis data exists before trying to access it
    if (
      !data.candidates ||
      data.candidates.length === 0 ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      data.candidates[0].content.parts.length === 0
    ) {
      return NextResponse.json(
        { message: "Gemini API did not return a valid analysis." },
        { status: 500 }
      );
    }

    const analysis = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        message: "Internal server error. Please check server logs for details.",
      },
      { status: 500 }
    );
  }
}
