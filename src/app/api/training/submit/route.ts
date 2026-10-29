import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

function calculatePoints(answer: string) {
  const lines = answer
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;

  if (lines >= 11) {
    return 20;
  }

  if (lines >= 6) {
    return 10;
  }

  if (lines >= 1) {
    return 5;
  }

  return 0;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const user = await verifySession(sessionToken);

    if (!user || user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Employee access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const questionId = Number(body.questionId);
    const answer = String(body.answer || "").trim();

    if (!questionId) {
      return NextResponse.json(
        { message: "Question ID is required." },
        { status: 400 }
      );
    }

    if (!answer) {
      return NextResponse.json(
        { message: "Please enter your answer." },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found." },
        { status: 404 }
      );
    }

    if (question.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "This question is no longer active." },
        { status: 400 }
      );
    }

    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        employeeId: user.id,
        questionId,
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { message: "You have already answered this question." },
        { status: 400 }
      );
    }

    const points = calculatePoints(answer);

    const attempt = await prisma.attempt.create({
      data: {
        employeeId: user.id,
        questionId,
        answer,
        score: points * 5,
        points,
        feedback: null,
        reviewStatus: "COMPLETED",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Answer submitted successfully. You earned ${points} points.`,
      points,
      attempt,
    });
  } catch (error) {
    console.error("Training submit error:", error);

    return NextResponse.json(
      {
        message: "Failed to submit answer.",
      },
      { status: 500 }
    );
  }
}