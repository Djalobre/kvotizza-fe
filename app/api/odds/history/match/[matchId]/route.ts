// app/api/odds/history/match/[matchId]/route.ts
import { NextRequest, NextResponse } from "next/server";
const FASTAPI_BASE = "https://api.kvotizza.online";

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const queryParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    queryParams.append(key, value);
  });

  try {
    const response = await fetch(
      `${FASTAPI_BASE}/api/odds/history/match/${
        params.matchId
      }?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch match odds history" },
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
