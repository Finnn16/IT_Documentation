import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { barangId, qty, status, keterangan, kondisi_barang } = req.body;

    try {
      // Cek stok barang sebelum dikurangi
      const barang = await prisma.barang.findUnique({
        where: { id: parseInt(barangId) },
      });

      if (!barang) {
        return res.status(404).json({ error: "Barang tidak ditemukan" });
      }

      if (barang.qty < parseInt(qty)) {
        return res.status(400).json({
          error: `Stok tidak mencukupi. Stok tersedia: ${barang.qty}, diminta: ${qty}`,
        });
      }

      // Mulai transaction untuk memastikan konsistensi data
      const result = await prisma.$transaction(async (prisma) => {
        // 1. Buat record barang keluar
        const barangKeluar = await prisma.barangKeluar.create({
          data: {
            barangId: parseInt(barangId),
            qty: parseInt(qty),
            status: status === "1",
            keterangan,
            kondisi_barang: kondisi_barang === "1",
          },
        });

        // 2. Kurangi stok barang
        await prisma.barang.update({
          where: { id: parseInt(barangId) },
          data: { qty: { decrement: parseInt(qty) } },
        });

        // Catatan: BarangLog hanya untuk adjustment manual,
        // tidak perlu log otomatis karena sudah ada di BarangKeluar

        return barangKeluar;
      });

      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal menambahkan barang keluar" });
    }
  } else if (req.method === "GET") {
    const data = await prisma.barangKeluar.findMany({
      include: {
        barang: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.status(200).json(data);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
