import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  // Try to read from a local eval-results.json file if it exists
  const filePath = path.join(process.cwd(), "data", "eval-results.json");
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    }
  } catch {
    // fall through to mock
  }

  // Return mock data
  return NextResponse.json({
    format_compliance: 87,
    rouge_l: 0.31,
    aesthetic_diversity: 12,
    eval_set_size: 30,
  });
}
