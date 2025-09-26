// app/api/football/analysis/[...path]/route.ts
import { NextResponse } from "next/server";

const FASTAPI_BASE = "https://api.kvotizza.online";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const path = params.path.join("/");

    const url = `${FASTAPI_BASE}/api/football/analysis/${path}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from FastAPI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join("/");
    const body = await request.text();

    const url = `${FASTAPI_BASE}/api/football/analysis/${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body || "{}",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to post to FastAPI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
