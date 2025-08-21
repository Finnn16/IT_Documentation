import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const data = await prisma.supplier.findMany({
        orderBy: { nama: "asc" },
      });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data supplier" });
    }
  }

  if (req.method === "POST") {
    const { nama } = req.body;

    try {
      const created = await prisma.supplier.create({
        data: { nama },
      });
      return res.status(201).json(created);
    } catch (error) {
      return res.status(500).json({ error: "Gagal menambahkan supplier" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
