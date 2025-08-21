import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const barang = await prisma.barang.findMany({
        include: { kategori: true },
        orderBy: { nama: "asc" },
      });
      res.status(200).json(barang);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil data barang" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
