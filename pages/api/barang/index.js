import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nama, stok_minimum, kategoriId } = req.body;

    try {
      const barang = await prisma.barang.create({
        data: {
          nama,
          stok_minimum,
          kategori: { connect: { id: kategoriId } },
        },
      });
      res.status(201).json(barang);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal menambahkan barang" });
    }
  } else if (req.method === "GET") {
    try {
      const { available_only } = req.query;

      // Jika available_only=true, hanya tampilkan barang dengan stok > 0
      const whereCondition =
        available_only === "true" ? { qty: { gt: 0 } } : {};

      const barang = await prisma.barang.findMany({
        where: whereCondition,
        include: { kategori: true },
        orderBy: { nama: "asc" },
      });
      res.status(200).json(barang);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil data barang" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
