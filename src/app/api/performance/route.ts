import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

function getLevel(totalPoints: number) {
  if (totalPoints >= 2000) return "Gold";
  if (totalPoints >= 1000) return "Silver";
  if (totalPoints >= 500) return "Bronze";
  return "Beginner";
}

export async function GET() {
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

    const attempts = await prisma.attempt.findMany({
      where: {
        employeeId: user.id,
      },
      include: {
        question: {
          select: {
            category: true,
            question: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalPoints = attempts.reduce(
      (total, attempt) => total + attempt.points,
      0
    );

    const questionsCompleted = attempts.length;

    const averageScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (total, attempt) => total + attempt.score,
              0
            ) / attempts.length
          )
        : 0;

    const categoryMap: Record<
      string,
      {
        completed: number;
        points: number;
        totalScore: number;
      }
    > = {};

    for (const attempt of attempts) {
      const category = attempt.question.category;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          completed: 0,
          points: 0,
          totalScore: 0,
        };
      }

      categoryMap[category].completed += 1;
      categoryMap[category].points += attempt.points;
      categoryMap[category].totalScore += attempt.score;
    }

    const categoryPerformance = Object.entries(categoryMap).map(
      ([category, data]) => ({
        category,
        completed: data.completed,
        points: data.points,
        averageScore:
          data.completed > 0
            ? Math.round(data.totalScore / data.completed)
            : 0,
      })
    );

    const trainingHistory = attempts.map((attempt) => ({
      id: attempt.id,
      date: attempt.date,
      category: attempt.question.category,
      question: attempt.question.question,
      type: attempt.question.type,
      answer: attempt.answer,
      score: attempt.score,
      points: attempt.points,
      feedback: attempt.feedback,
      reviewStatus: attempt.reviewStatus,
    }));

    return NextResponse.json({
      success: true,

      employee: {
        name: user.name,
        email: user.email,
      },

      summary: {
        totalPoints,
        level: getLevel(totalPoints),
        questionsCompleted,
        averageScore,
      },

      categoryPerformance,

      trainingHistory,
    });
  } catch (error) {
    console.error("Performance API error:", error);

    return NextResponse.json(
      {
        message: "Failed to load performance data.",
      },
      { status: 500 }
    );
  }
}