import { useEffect, useState } from "react";

export default function LogTransaksi() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      const dateStr = date.toLocaleDateString("id-ID", dateOptions);
      const timeStr = date.toLocaleTimeString("id-ID", timeOptions);

      return `${dateStr} ${timeStr}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Log Transaksi</h1>
        <p className="text-gray-600 mb-4">
          Riwayat semua transaksi barang masuk, keluar, dan adjustment manual
        </p>

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Keterangan Jenis Transaksi:
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                Masuk
              </span>
              <span className="text-gray-600">Barang masuk dari supplier</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                Keluar
              </span>
              <span className="text-gray-600">
                Barang keluar untuk karyawan
              </span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                Masuk (Manual)
              </span>
              <span className="text-gray-600">Penambahan qty manual</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-2">
                Keluar (Manual)
              </span>
              <span className="text-gray-600">Pengurangan qty manual</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-50 text-gray-700">
              <tr>
                <th className="py-3 px-4 border-b">Tanggal</th>
                <th className="py-3 px-4 border-b">Jenis</th>
                <th className="py-3 px-4 border-b">Barang</th>
                <th className="py-3 px-4 border-b">Qty</th>
                <th className="py-3 px-4 border-b">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 px-4 text-center text-gray-500"
                  >
                    Belum ada data transaksi
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={`${log.jenis}-${log.id}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-3 px-4 border-b border-gray-100">
                      {formatDate(log.tanggal)}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.jenis === "Masuk" ||
                          log.jenis === "Masuk (Manual)"
                            ? log.jenis === "Masuk (Manual)"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                            : log.jenis === "Keluar (Manual)"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.jenis}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      {log.barang}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <span
                        className={`font-medium ${
                          log.jenis === "Masuk" ||
                          log.jenis === "Masuk (Manual)"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {log.jenis === "Masuk" || log.jenis === "Masuk (Manual)"
                          ? "+"
                          : "-"}
                        {log.qty}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      {log.remark || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
