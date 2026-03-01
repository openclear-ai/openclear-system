import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "缺少 Gemini API Key" }, { status: 500 });
    }
    if (!image || !mimeType) {
      return NextResponse.json({ error: "缺少 image 或 mimeType" }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1" },
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Extract info from the air waybill / label image.
Return JSON only (no markdown).

{
  "trackingNumber": "string",
  "destination": "string",
  "carrierName": "string"
}

Rules:
- trackingNumber: remove spaces, keep digits/letters/hyphen only if present
- destination: prefer 3-letter airport code (e.g. SYD). If unknown, return ""
- carrierName: best guess carrier name if visible (e.g. DHL, UPS, FedEx, Australia Post, 4PX, YunExpress). If unknown, return ""
              `.trim(),
            },
            {
              inlineData: { mimeType, data: image },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    // Gemini 有时会返回多余空白，先 trim
    const rawText = (response.text || "").trim();

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText || "{}");
    } catch {
      return NextResponse.json(
        { error: "AI 返回格式不是 JSON", raw: rawText },
        { status: 500 }
      );
    }

    const trackingNumber = String(parsed.trackingNumber || "")
      .replace(/\s+/g, "")
      .replace(/[^\w-]/g, ""); // 只保留字母数字下划线和 -

    const destination = String(parsed.destination || "").trim();
    const carrierName = String(parsed.carrierName || "").trim();

    return NextResponse.json({
      trackingNumber,
      destination,
      carrierName,
    });
  } catch (error: any) {
    console.error("Analyze API Error:", error);
    return NextResponse.json({ error: error?.message || "识别失败" }, { status: 500 });
  }
}