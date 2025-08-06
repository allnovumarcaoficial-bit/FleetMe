import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const user = await prisma.user.create({
    data: {
      name: "Adrian",
      email: "adrianfl@allnovu.net",
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Usuario creado:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
