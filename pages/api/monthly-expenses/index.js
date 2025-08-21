import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Get current month start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Get barang masuk data for current month with price information
      const barangMasukThisMonth = await prisma.barangMasuk.findMany({
        where: {
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          barang: {
            select: {
              nama: true,
            },
          },
          supplier: {
            select: {
              nama: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      // Calculate total expenses for current month (using total dengan PPN)
      const totalExpenses = barangMasukThisMonth.reduce((sum, item) => {
        return sum + (parseFloat(item.total_dengan_ppn) || 0);
      }, 0);

      // Get expenses by GL Account
      const expensesByGLAcc = barangMasukThisMonth.reduce((acc, item) => {
        const glAcc = item.gl_acc;
        const amount = parseFloat(item.total_dengan_ppn) || 0;

        if (!acc[glAcc]) {
          acc[glAcc] = {
            total: 0,
            count: 0,
            description: glAcc === "6120710" ? "Pembelian Stok" : "Service",
          };
        }

        acc[glAcc].total += amount;
        acc[glAcc].count += 1;

        return acc;
      }, {});

      const response = {
        currentMonth: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          monthName: now.toLocaleDateString("id-ID", { month: "long" }),
        },
        purchases: {
          total: totalExpenses,
          count: barangMasukThisMonth.length,
          byGLAccount: expensesByGLAcc,
          details: barangMasukThisMonth.map((item) => ({
            id: item.id,
            pr_no: item.pr_no,
            barang: item.barang.nama,
            supplier: item.supplier.nama,
            qty: item.qty,
            harga_satuan: parseFloat(item.harga_satuan) || 0,
            harga_total: parseFloat(item.harga_total) || 0,
            ppn_11: parseFloat(item.ppn_11) || 0,
            total_dengan_ppn: parseFloat(item.total_dengan_ppn) || 0,
            gl_acc: item.gl_acc,
            created_at: item.created_at,
          })),
        },
        grandTotal: totalExpenses,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching monthly expenses:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data pengeluaran bulanan" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
