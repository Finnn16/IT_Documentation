import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { year, month } = req.query;

      // Parse year and month from URL parameters
      const targetYear = parseInt(year);
      const targetMonth = parseInt(month) - 1; // JavaScript months are 0-indexed

      // Validate parameters
      if (
        isNaN(targetYear) ||
        isNaN(targetMonth) ||
        targetMonth < 0 ||
        targetMonth > 11
      ) {
        return res
          .status(400)
          .json({ error: "Invalid year or month parameter" });
      }

      // Get start and end dates for the specified month
      const startOfMonth = new Date(targetYear, targetMonth, 1);
      const endOfMonth = new Date(
        targetYear,
        targetMonth + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Get barang masuk data for specified month with price information
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

      // Calculate total expenses for specified month
      const totalExpenses = barangMasukThisMonth.reduce((sum, item) => {
        return sum + (parseFloat(item.harga_total) || 0);
      }, 0);

      // Get expenses by GL Account
      const expensesByGLAcc = barangMasukThisMonth.reduce((acc, item) => {
        const glAcc = item.gl_acc;
        const amount = parseFloat(item.harga_total) || 0;

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

      // Static additional monthly expenses (same for all months)
      const staticExpenses = [
        {
          category: "Listrik",
          amount: 2500000,
          description: "Biaya listrik bulanan",
        },
        {
          category: "Internet",
          amount: 750000,
          description: "Biaya internet dan telekomunikasi",
        },
        {
          category: "Maintenance IT",
          amount: 1200000,
          description: "Maintenance hardware dan software",
        },
        {
          category: "Konsumsi",
          amount: 800000,
          description: "Konsumsi karyawan IT",
        },
      ];

      const staticTotal = staticExpenses.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      const response = {
        targetMonth: {
          year: targetYear,
          month: targetMonth + 1,
          monthName: new Date(targetYear, targetMonth).toLocaleDateString(
            "id-ID",
            { month: "long" }
          ),
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
            gl_acc: item.gl_acc,
            created_at: item.created_at,
          })),
        },
        staticExpenses: {
          total: staticTotal,
          items: staticExpenses,
        },
        grandTotal: totalExpenses + staticTotal,
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
