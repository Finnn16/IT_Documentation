import { useState, useEffect } from "react";
import Link from "next/link";

export default function MonthlyReport() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/monthly-expenses/${selectedYear}/${selectedMonth}`
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Laporan Pengeluaran Bulanan
              </h1>
              <p className="text-gray-600">PT TRIMAS SARANA GARMENT INDUSTRY</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Month/Year Selector */}
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : reportData ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Laporan {reportData.targetMonth.monthName}{" "}
                {reportData.targetMonth.year}
              </h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Pembelian Barang
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(reportData.purchases.total)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {reportData.purchases.count} transaksi
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Pengeluaran Tetap
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(reportData.staticExpenses.total)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {reportData.staticExpenses.items.length} kategori
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Total Pengeluaran
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(reportData.grandTotal)}
                </p>
                <p className="text-xs text-red-600 mt-1">Pembelian + Tetap</p>
              </div>
            </div>

            {/* Detailed Table */}
            {reportData.purchases.details.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detail Pembelian
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PR No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Barang
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga Satuan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GL ACC
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.purchases.details.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.pr_no}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.barang}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.supplier}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.qty}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(item.harga_satuan)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(item.harga_total)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.gl_acc === "6120710"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.gl_acc === "6120710"
                                ? "Pembelian Stok"
                                : "Service"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              Tidak ada data untuk periode yang dipilih
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
