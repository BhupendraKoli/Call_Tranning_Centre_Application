import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch employees.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          message: "Email already exists.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully.",
        employee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee error:", error);

    return NextResponse.json(
      {
        message: "Failed to create employee.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { id, name, email, password } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        {
          message: "Employee ID, name and email are required.",
        },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        id: {
          not: Number(id),
        },
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          message: "Email already exists.",
        },
        { status: 400 }
      );
    }

    const data: {
      name: string;
      email: string;
      password?: string;
    } = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };

    if (password?.trim()) {
      data.password = await bcrypt.hash(password, 10);
    }

    const employee = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return NextResponse.json(
      {
        message: "Failed to update employee.",
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
          message: "Employee ID is required.",
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete employee.",
      },
      { status: 500 }
    );
  }
}