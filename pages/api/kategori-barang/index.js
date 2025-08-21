import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const kategori = await prisma.kategoriBarang.findMany({
        orderBy: { nama: "asc" },
      });
      res.status(200).json(kategori);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil kategori" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
