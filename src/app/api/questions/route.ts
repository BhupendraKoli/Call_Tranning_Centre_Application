import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Get questions error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch questions.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: {
      questions?: unknown;
      question?: unknown;
      category?: unknown;
    } = await request.json();

    // BULK ADD
    if (Array.isArray(body.questions)) {
      const questions = body.questions;

      if (questions.length === 0) {
        return NextResponse.json(
          {
            message: "No questions provided.",
          },
          { status: 400 }
        );
      }

      const validQuestions = questions
        .map((item: unknown) => {
          if (!item || typeof item !== "object") {
            return { question: "", category: "" };
          }

          const questionItem = item as {
            question?: unknown;
            category?: unknown;
          };

          return {
            question: String(questionItem.question || "").trim(),
            category: String(questionItem.category || "").trim(),
          };
        })
        .filter(
          (item: { question: string; category: string }) =>
            item.question && item.category
        );

      if (validQuestions.length === 0) {
        return NextResponse.json(
          {
            message: "No valid questions found.",
          },
          { status: 400 }
        );
      }

      const createdQuestions = await prisma.$transaction(
        validQuestions.map(
          (item: { question: string; category: string }) =>
            prisma.question.create({
              data: {
                question: item.question,
                type: "SITUATION",
                category: item.category,

                optionA: null,
                optionB: null,
                optionC: null,
                optionD: null,

                correctAnswer: null,
                expectedAnswer: null,
                explanation: null,

                points: 0,
                status: "ACTIVE",
              },
            })
        )
      );

      return NextResponse.json(
        {
          success: true,
          message: `${createdQuestions.length} questions added successfully.`,
          questions: createdQuestions,
        },
        { status: 201 }
      );
    }

    // SINGLE QUESTION ADD
    const {
      question,
      category,
    } = body;

    if (
      typeof question !== "string" ||
      typeof category !== "string" ||
      !question.trim() ||
      !category.trim()
    ) {
      return NextResponse.json(
        {
          message: "Question and category are required.",
        },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.question.create({
      data: {
        question: question.trim(),
        type: "SITUATION",
        category: category.trim(),

        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,

        correctAnswer: null,
        expectedAnswer: null,
        explanation: null,

        points: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Question added successfully.",
        question: newQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create question error:", error);

    return NextResponse.json(
      {
        message: "Failed to add question.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      question,
      category,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          message: "Question ID is required.",
        },
        { status: 400 }
      );
    }

    if (!question || !category) {
      return NextResponse.json(
        {
          message: "Question and category are required.",
        },
        { status: 400 }
      );
    }

    const updatedQuestion = await prisma.question.update({
      where: {
        id: Number(id),
      },
      data: {
        question: question.trim(),
        category,
        type: "SITUATION",

        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,

        correctAnswer: null,
        expectedAnswer: null,
        explanation: null,

        points: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Question updated successfully.",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Update question error:", error);

    return NextResponse.json(
      {
        message: "Failed to update question.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          message: "Question ID is required.",
        },
        { status: 400 }
      );
    }

    const questionId = Number(id);

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found.",
        },
        { status: 404 }
      );
    }

    await prisma.attempt.deleteMany({
      where: {
        questionId,
      },
    });

    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Delete question error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete question.",
      },
      { status: 500 }
    );
  }
}