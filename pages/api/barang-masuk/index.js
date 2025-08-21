import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      pr_no,
      gl_acc,
      requester,
      remark,
      qty,
      harga_satuan,
      harga_total,
      ppn_11,
      total_dengan_ppn,
      barangId,
      supplierId,
    } = req.body;

    try {
      let finalSupplierId;

      // Jika supplierId bukan angka, berarti ini nama supplier baru (string)
      if (typeof supplierId === "string" && isNaN(Number(supplierId))) {
        if (!supplierId || supplierId.trim() === "") {
          return res
            .status(400)
            .json({ error: "Supplier baru tidak boleh kosong" });
        }

        const newSupplier = await prisma.supplier.create({
          data: { nama: supplierId },
        });
        finalSupplierId = newSupplier.id;
      } else {
        finalSupplierId = parseInt(supplierId);
        if (isNaN(finalSupplierId)) {
          return res.status(400).json({ error: "supplierId tidak valid" });
        }
      }

      // Gunakan transaction untuk memastikan konsistensi data
      const result = await prisma.$transaction(async (prisma) => {
        // Tambahkan ke barang_masuk
        const barangMasuk = await prisma.barangMasuk.create({
          data: {
            pr_no,
            gl_acc,
            requester,
            remark,
            qty,
            harga_satuan: harga_satuan || 0,
            harga_total: harga_total || 0,
            ppn_11: ppn_11 || 0,
            total_dengan_ppn: total_dengan_ppn || 0,
            barang: { connect: { id: barangId } },
            supplier: { connect: { id: finalSupplierId } },
          },
        });

        // Update stok barang (tambah qty)
        await prisma.barang.update({
          where: { id: barangId },
          data: { qty: { increment: qty } },
        });

        // Catatan: BarangLog hanya untuk adjustment manual,
        // tidak perlu log otomatis karena sudah ada di BarangMasuk

        return barangMasuk;
      });

      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal menyimpan barang masuk" });
    }
  } else if (req.method === "GET") {
    try {
      const supplier = await prisma.supplier.findMany({
        orderBy: { nama: "asc" },
      });
      return res.status(200).json(supplier);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data supplier" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
