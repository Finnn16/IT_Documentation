import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [statistics, setStatistics] = useState({
    totalBarang: 0,
    stokAman: 0,
    stokMinimum: 0,
    stokKritis: 0,
    transaksiMasuk: 0,
    transaksiKeluar: 0,
  });

  const [monthlyExpenses, setMonthlyExpenses] = useState({
    currentMonth: {},
    purchases: { total: 0, count: 0, byGLAccount: {}, details: [] },
    grandTotal: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        // Fetch barang data for stock statistics
        const resBarang = await fetch("/api/dashboard-barang");
        const dataBarang = await resBarang.json();

        // Fetch monthly expenses data
        const resExpenses = await fetch("/api/monthly-expenses");
        const dataExpenses = await resExpenses.json();

        // Calculate stock status
        let aman = 0,
          minimum = 0,
          kritis = 0;
        dataBarang.forEach((barang) => {
          if (barang.qty < barang.stok_minimum) {
            kritis++;
          } else if (barang.qty === barang.stok_minimum) {
            minimum++;
          } else {
            aman++;
          }
        });

        setStatistics({
          totalBarang: dataBarang.length,
          stokAman: aman,
          stokMinimum: minimum,
          stokKritis: kritis,
          transaksiMasuk: dataExpenses.purchases.count,
          transaksiKeluar: 0, // Will be implemented later
        });

        setMonthlyExpenses(dataExpenses);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, []);

  const StatCard = ({ title, value, icon, color, description, link }) => (
    <div
      className={`bg-white rounded-lg shadow-enhanced border border-gray-200 p-6 card-hover transition-all duration-300 ease-in-out transform ${
        link ? "cursor-pointer hover:border-blue-300" : ""
      }`}
    >
      {link ? (
        <Link href={link} className="block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 transition-colors duration-200">
                {title}
              </p>
              <p
                className={`text-3xl font-bold ${color} mt-2 transition-all duration-200`}
              >
                {loading ? "..." : value}
              </p>
              {description && (
                <p className="text-xs text-gray-500 mt-1 transition-colors duration-200">
                  {description}
                </p>
              )}
            </div>
            <div
              className={`w-16 h-16 ${color.replace(
                "text-",
                "bg-"
              )} bg-opacity-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-opacity-20`}
            >
              <div
                className={`text-2xl ${color} font-bold transition-all duration-200`}
              >
                {icon}
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 transition-colors duration-200">
              {title}
            </p>
            <p
              className={`text-3xl font-bold ${color} mt-2 transition-all duration-200`}
            >
              {loading ? "..." : value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1 transition-colors duration-200">
                {description}
              </p>
            )}
          </div>
          <div
            className={`w-16 h-16 ${color.replace(
              "text-",
              "bg-"
            )} bg-opacity-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-opacity-20`}
          >
            <div
              className={`text-2xl ${color} font-bold transition-all duration-200`}
            >
              {icon}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black mb-2">
          Dashboard Statistik
        </h1>
        <p className="text-gray-600">
          Selamat datang di IT Documentation System - PT Trimas Sarana Garment
          Industry
        </p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Barang"
          value={statistics.totalBarang}
          icon="■"
          color="text-blue-600"
          description="Item dalam inventori"
          link="/dashboard"
        />

        <StatCard
          title="Transaksi Masuk"
          value={statistics.transaksiMasuk}
          icon="↗"
          color="text-green-600"
          description="Bulan ini"
          link="/barang-masuk"
        />

        <StatCard
          title="Transaksi Keluar"
          value={statistics.transaksiKeluar}
          icon="↘"
          color="text-orange-600"
          description="Bulan ini"
          link="/barang-keluar"
        />

        <StatCard
          title="Stok Aman"
          value={statistics.stokAman}
          icon="●"
          color="text-green-600"
          description="Stok di atas minimum"
        />
      </div>

      {/* Stock Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Stok Minimum"
          value={statistics.stokMinimum}
          icon="●"
          color="text-yellow-600"
          description="Stok tepat minimum - perlu perhatian"
        />

        <StatCard
          title="Stok Kritis"
          value={statistics.stokKritis}
          icon="●"
          color="text-red-600"
          description="Stok di bawah minimum - segera restok!"
        />
      </div>

      {/* Monthly Expenses Section */}
      <div className="bg-white rounded-lg shadow-enhanced border border-gray-200 p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Pengeluaran Bulanan - {monthlyExpenses.currentMonth.monthName}{" "}
            {monthlyExpenses.currentMonth.year}
          </h2>
          <p className="text-gray-600">Total pengeluaran IT untuk bulan ini</p>
        </div>

        {/* Total Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Pembelian Barang (dengan PPN)
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(monthlyExpenses.purchases.total)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {monthlyExpenses.purchases.count} transaksi
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Total Pengeluaran
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(monthlyExpenses.grandTotal)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Sudah termasuk PPN 11%
            </p>
          </div>
        </div>

        {/* Purchase Details */}
        {monthlyExpenses.purchases.details.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pembelian Terbaru
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
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
                      PPN 11%
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total + PPN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GL ACC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyExpenses.purchases.details
                    .slice(0, 10)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
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
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-yellow-700">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.ppn_11)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.total_dengan_ppn)}
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
            {monthlyExpenses.purchases.details.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Menampilkan 10 transaksi terbaru dari{" "}
                {monthlyExpenses.purchases.details.length} total transaksi
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
