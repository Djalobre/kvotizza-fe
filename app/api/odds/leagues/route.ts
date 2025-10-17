// app/api/odds/leagues/route.ts
import { NextRequest, NextResponse } from "next/server";
const FASTAPI_BASE = "https://api.kvotizza.online";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");

  const url = country
    ? `${FASTAPI_BASE}/api/odds/leagues?country=${country}`
    : `${FASTAPI_BASE}/api/odds/leagues`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch leagues" },
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
