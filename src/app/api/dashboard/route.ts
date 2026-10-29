import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

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
    });

    const totalPoints = attempts.reduce(
      (total, attempt) => total + attempt.points,
      0
    );

    const questionsCompleted = attempts.length;

    const correctAnswers = attempts.filter(
      (attempt) => attempt.score === 100
    ).length;

    const averageScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (total, attempt) => total + attempt.score,
              0
            ) / attempts.length
          )
        : 0;

    let level = "Beginner";
    let nextLevelPoints = 500;

    if (totalPoints >= 2000) {
      level = "Gold";
      nextLevelPoints = 0;
    } else if (totalPoints >= 1000) {
      level = "Silver";
      nextLevelPoints = 2000;
    } else if (totalPoints >= 500) {
      level = "Bronze";
      nextLevelPoints = 1000;
    }

    return NextResponse.json({
      success: true,

      employee: {
        name: user.name,
        email: user.email,
      },

      stats: {
        totalPoints,
        level,
        questionsCompleted,
        correctAnswers,
        averageScore,
        nextLevelPoints,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}