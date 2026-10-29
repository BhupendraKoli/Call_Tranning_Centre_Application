import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  const password = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@heeraagro.com",
    },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@heeraagro.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
