import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function getAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await verifySession(sessionToken);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        reviewStatus: "PENDING",
        question: {
          type: "SITUATION",
        },
      },
      orderBy: {
        date: "desc",
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        question: {
          select: {
            id: true,
            question: true,
            category: true,
            expectedAnswer: true,
            explanation: true,
            points: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      reviews: attempts,
    });
  } catch (error) {
    console.error("Get situation reviews error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch situation reviews.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      attemptId,
      points,
      feedback,
    } = body;

    if (!attemptId || points === undefined) {
      return NextResponse.json(
        {
          message: "Attempt ID and points are required.",
        },
        { status: 400 }
      );
    }

    const allowedPoints = [20, 10, 5, 0];

    if (!allowedPoints.includes(Number(points))) {
      return NextResponse.json(
        {
          message: "Points must be 20, 10, 5 or 0.",
        },
        { status: 400 }
      );
    }

    const existingAttempt =
      await prisma.attempt.findUnique({
        where: {
          id: Number(attemptId),
        },
        include: {
          question: true,
        },
      });

    if (!existingAttempt) {
      return NextResponse.json(
        {
          message: "Attempt not found.",
        },
        { status: 404 }
      );
    }

    if (existingAttempt.question.type !== "SITUATION") {
      return NextResponse.json(
        {
          message: "This is not a situation question.",
        },
        { status: 400 }
      );
    }

    if (existingAttempt.reviewStatus !== "PENDING") {
      return NextResponse.json(
        {
          message: "This answer has already been reviewed.",
        },
        { status: 400 }
      );
    }

    const updatedAttempt =
      await prisma.attempt.update({
        where: {
          id: Number(attemptId),
        },
        data: {
          points: Number(points),
          score: Number(points) * 5,
          feedback:
            feedback?.trim() ||
            "Situation answer evaluated by Admin.",
          reviewStatus: "REVIEWED",
          reviewedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Situation answer evaluated successfully.",
      attempt: updatedAttempt,
    });
  } catch (error) {
    console.error(
      "Situation review error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to evaluate situation answer.",
      },
      { status: 500 }
    );
  }
}