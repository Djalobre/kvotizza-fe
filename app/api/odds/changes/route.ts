// app/api/odds/changes/route.ts
import { NextRequest, NextResponse } from "next/server";
const FASTAPI_BASE = "https://api.kvotizza.online";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = new URLSearchParams();

  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  try {
    const response = await fetch(
      `${FASTAPI_BASE}/api/odds/changes?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch odds changes" },
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
