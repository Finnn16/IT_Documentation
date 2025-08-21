import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const barangMasuk = await prisma.barangMasuk.findMany({
        include: { barang: true },
      });

      const barangKeluar = await prisma.barangKeluar.findMany({
        include: { barang: true },
      });

      // Data dari BarangLog (hanya untuk adjustment manual/koreksi stok)
      const barangLogData = await prisma.barangLog.findMany({
        include: { barang: true },
      });

      const log = [
        ...barangMasuk.map((item) => ({
          id: `masuk-${item.id}`,
          tanggal: item.tanggal_pr
            ? new Date(item.tanggal_pr).toISOString()
            : null,
          jenis: "Masuk",
          barang: item.barang.nama,
          qty: item.qty,
          remark: item.remark,
          source: "barang_masuk",
        })),
        ...barangKeluar.map((item) => ({
          id: `keluar-${item.id}`,
          tanggal: item.tanggal ? new Date(item.tanggal).toISOString() : null,
          jenis: "Keluar",
          barang: item.barang.nama,
          qty: item.qty,
          remark: item.keterangan,
          source: "barang_keluar",
        })),
        ...barangLogData.map((item) => ({
          id: `log-${item.id}`,
          tanggal: item.tanggal ? new Date(item.tanggal).toISOString() : null,
          jenis:
            item.jenis === "masuk"
              ? "Masuk (Adjustment)"
              : "Keluar (Adjustment)",
          barang: item.barang.nama,
          qty: item.qty,
          remark: item.keterangan,
          source: "barang_log",
        })),
      ].sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateB - dateA; // urutkan terbaru dulu
      });

      res.status(200).json(log);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil data logs" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
