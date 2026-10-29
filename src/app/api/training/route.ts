import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { message: "Category is required." },
        { status: 400 }
      );
    }

    // Employee ने आधीच solve केलेले questions
    const solvedAttempts = await prisma.attempt.findMany({
      where: {
        employeeId: user.id,
        question: {
          category,
        },
      },
      select: {
        questionId: true,
      },
    });

    const solvedQuestionIds = solvedAttempts.map(
      (attempt) => attempt.questionId
    );

    // फक्त नवीन / unsolved questions
    const questions = await prisma.question.findMany({
      where: {
        category,
        status: "ACTIVE",
        id: {
          notIn: solvedQuestionIds,
        },
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        question: true,
        type: true,
        category: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correctAnswer: false,
        expectedAnswer: false,
        explanation: false,
        points: true,
      },
    });

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Training questions error:", error);

    return NextResponse.json(
      { message: "Failed to fetch training questions." },
      { status: 500 }
    );
  }
}