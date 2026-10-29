import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        {
          message: "Question ID and status are required.",
        },
        { status: 400 }
      );
    }

    if (status !== "ACTIVE" && status !== "INACTIVE") {
      return NextResponse.json(
        {
          message: "Invalid status.",
        },
        { status: 400 }
      );
    }

    const question = await prisma.question.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Question status updated successfully.",
      question,
    });
  } catch (error) {
    console.error("Status update error:", error);

    return NextResponse.json(
      {
        message: "Failed to update question status.",
      },
      { status: 500 }
    );
  }
}