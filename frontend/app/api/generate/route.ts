import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { situation, aesthetic } = body;

  if (!situation) {
    return NextResponse.json({ error: "situation is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation, aesthetic, generate_image: false }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Return a mock response so the frontend still demos without the GPU backend
    return NextResponse.json(mockResponse(situation, aesthetic));
  }
}

function mockResponse(situation: string, aesthetic: string | null) {
  const aestheticLabel = aesthetic || "clean girl";
  return {
    outfit_plan: {
      top: "White cotton button-down shirt, slightly oversized",
      bottom: "High-waisted straight-leg trousers in warm beige",
      shoes: "Tan leather loafers with gold hardware",
      outerwear: "Camel wool blazer",
      accessories: "Minimal gold hoop earrings, structured leather tote, delicate chain necklace",
      aesthetic: aestheticLabel,
      explanation: `This look is perfectly suited for "${situation}". The neutral palette reads as effortlessly polished — elevated enough to feel intentional, relaxed enough to feel natural.`,
      raw: "",
    },
    diffusion_prompt: `Full body fashion editorial photo of a person wearing white cotton button-down shirt, high-waisted beige straight-leg trousers, tan leather loafers, camel wool blazer. ${aestheticLabel} aesthetic. Full length shot, head to toe, shoes visible, soft natural lighting, clean background, professional fashion photography, sharp focus, high resolution.`,
    image_url: null,
  };
}
