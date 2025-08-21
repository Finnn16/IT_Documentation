import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.test.create({
      data: { name: "Coba koneksi" },
    });

    console.log("Insert berhasil:", result);
  } catch (error) {
    console.error("Gagal konek ke database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
