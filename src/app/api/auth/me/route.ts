import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const user = await verifySession(sessionToken);

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      {
        message: "Authentication failed.",
      },
      { status: 500 }
    );
  }
}