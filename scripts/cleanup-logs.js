const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupDuplicateLogs() {
  try {
    console.log("Membersihkan log duplikat dari BarangLog...");

    // Hapus semua log yang bukan adjustment manual
    // (log yang tidak mengandung "Adjustment manual" dalam keterangan)
    const deletedCount = await prisma.barangLog.deleteMany({
      where: {
        NOT: {
          keterangan: {
            contains: "Adjustment manual",
          },
        },
      },
    });

    console.log(`Berhasil menghapus ${deletedCount.count} log duplikat`);

    // Tampilkan log yang tersisa
    const remainingLogs = await prisma.barangLog.findMany({
      include: { barang: true },
      orderBy: { tanggal: "desc" },
    });

    console.log(`Log yang tersisa: ${remainingLogs.length} record`);
    remainingLogs.forEach((log) => {
      console.log(
        `- ${log.barang.nama}: ${log.jenis} ${log.qty} - ${log.keterangan}`
      );
    });
  } catch (error) {
    console.error("Error saat membersihkan log:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateLogs();
