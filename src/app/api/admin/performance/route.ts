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

function getLevel(totalPoints: number) {
  if (totalPoints >= 2000) {
    return "Gold";
  }

  if (totalPoints >= 1000) {
    return "Silver";
  }

  if (totalPoints >= 500) {
    return "Bronze";
  }

  return "Beginner";
}

export async function GET(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const employees = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        attempts: {
          select: { score: true, points: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const performance = employees.map((employee) => {
      const attempts = employee.attempts;

      const totalPoints = attempts.reduce(
        (total, attempt) => total + attempt.points,
        0
      );

      const questionsCompleted = attempts.length;

      const correctAnswers = attempts.filter(
        (attempt) => attempt.score === 100
      ).length;

      const wrongAnswers = attempts.filter(
        (attempt) => attempt.score === 0
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

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        createdAt: employee.createdAt,
        totalPoints,
        level: getLevel(totalPoints),
        questionsCompleted,
        correctAnswers,
        wrongAnswers,
        averageScore,
      };
    });

    const employeeId = Number(
      new URL(request.url).searchParams.get("employeeId")
    );

    let attempts = null;
    if (Number.isInteger(employeeId) && employeeId > 0) {
      attempts = await prisma.attempt.findMany({
        where: { employeeId },
        select: {
          id: true,
          answer: true,
          feedback: true,
          reviewStatus: true,
          reviewedAt: true,
          date: true,
          question: {
            select: {
              id: true,
              question: true,
              category: true,
              type: true,
            },
          },
        },
        orderBy: { date: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      employees: performance,
      attempts,
    });
  } catch (error) {
    console.error("Admin performance error:", error);

    return NextResponse.json(
      {
        message: "Failed to load employee performance.",
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
      const attemptId = Number(body.attemptId);
      const feedback =
        typeof body.feedback === "string" ? body.feedback.trim() : "";

      if (!Number.isInteger(attemptId) || attemptId <= 0) {
        return NextResponse.json(
          { message: "A valid attempt ID is required." },
          { status: 400 }
        );
      }

      if (!feedback) {
        return NextResponse.json(
          { message: "Please enter a remark." },
          { status: 400 }
        );
      }

      const existingAttempt = await prisma.attempt.findUnique({
        where: { id: attemptId },
      });

      if (!existingAttempt) {
        return NextResponse.json(
          { message: "Attempt not found." },
          { status: 404 }
        );
      }

      const attempt = await prisma.attempt.update({
        where: { id: attemptId },
        data: {
          feedback,
          reviewStatus: "REVIEWED",
          reviewedAt: new Date(),
        },
        select: {
          id: true,
          feedback: true,
          reviewStatus: true,
          reviewedAt: true,
        },
      });

      return NextResponse.json({ success: true, attempt });
    } catch (error) {
      console.error("Admin performance remark error:", error);
      return NextResponse.json(
        { message: "Failed to save remark." },
        { status: 500 }
      );
    }
}