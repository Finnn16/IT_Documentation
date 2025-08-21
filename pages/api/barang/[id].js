import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { qty, keterangan } = req.body;

    try {
      // Validasi input
      if (qty === undefined || qty < 0) {
        return res.status(400).json({ error: "Quantity tidak valid" });
      }

      if (!keterangan || keterangan.trim() === "") {
        return res.status(400).json({ error: "Keterangan wajib diisi" });
      }

      // Ambil data barang saat ini
      const currentBarang = await prisma.barang.findUnique({
        where: { id: parseInt(id) },
      });

      if (!currentBarang) {
        return res.status(404).json({ error: "Barang tidak ditemukan" });
      }

      const oldQty = currentBarang.qty;
      const newQty = parseInt(qty);
      const qtyDifference = newQty - oldQty;

      // Jika quantity tidak berubah, tidak perlu update
      if (qtyDifference === 0) {
        return res.status(400).json({
          error: "Quantity baru sama dengan quantity saat ini",
        });
      }

      // Update quantity barang
      const updatedBarang = await prisma.barang.update({
        where: { id: parseInt(id) },
        data: { qty: newQty },
      });

      // Buat log perubahan dengan keterangan yang lebih detail
      await prisma.barangLog.create({
        data: {
          barangId: parseInt(id),
          jenis: qtyDifference > 0 ? "masuk" : "keluar",
          qty: Math.abs(qtyDifference),
          keterangan: `Adjustment manual: ${keterangan} (Qty: ${oldQty} → ${newQty}, Selisih: ${
            qtyDifference > 0 ? "+" : ""
          }${qtyDifference})`,
        },
      });

      res.status(200).json({
        message: "Quantity berhasil diupdate",
        barang: updatedBarang,
        changes: {
          oldQty,
          newQty,
          difference: qtyDifference,
        },
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      res.status(500).json({ error: "Gagal mengupdate quantity barang" });
    }
  } else if (req.method === "GET") {
    try {
      const barang = await prisma.barang.findUnique({
        where: { id: parseInt(id) },
        include: { kategori: true },
      });

      if (!barang) {
        return res.status(404).json({ error: "Barang tidak ditemukan" });
      }

      res.status(200).json(barang);
    } catch (error) {
      console.error("Error fetching barang:", error);
      res.status(500).json({ error: "Gagal mengambil data barang" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Check if barang has any transactions
      const barangWithTransactions = await prisma.barang.findUnique({
        where: { id: parseInt(id) },
        include: {
          barangMasuk: true,
          barangKeluar: true,
          log: true,
        },
      });

      if (!barangWithTransactions) {
        return res.status(404).json({ error: "Barang tidak ditemukan" });
      }

      // If there are transactions, prevent deletion
      if (
        barangWithTransactions.barangMasuk.length > 0 ||
        barangWithTransactions.barangKeluar.length > 0 ||
        barangWithTransactions.log.length > 0
      ) {
        return res.status(400).json({
          error: "Tidak dapat menghapus barang yang sudah memiliki transaksi",
        });
      }

      // Delete the barang
      await prisma.barang.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Barang berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting barang:", error);
      res.status(500).json({ error: "Gagal menghapus barang" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
