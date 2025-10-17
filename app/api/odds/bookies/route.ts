// app/api/odds/bookies/route.ts
import { NextResponse } from "next/server";
const FASTAPI_BASE = "https://api.kvotizza.online";

export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_BASE}/api/odds/bookies`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch bookies" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
