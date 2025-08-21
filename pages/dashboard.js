import { useEffect, useState } from "react";

export default function Dashboard() {
  const [barangList, setBarangList] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  // Modal state for editing quantity
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [editForm, setEditForm] = useState({
    qty: 0,
    keterangan: "",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    async function fetchData() {
      // Fetch barang
      const resBarang = await fetch("/api/dashboard-barang");
      const dataBarang = await resBarang.json();
      setBarangList(dataBarang);
      setFilteredBarang(dataBarang);

      // Fetch kategori
      const resKategori = await fetch("/api/kategori-barang");
      const dataKategori = await resKategori.json();
      setKategoriList(dataKategori);
    }
    fetchData();
  }, []);

  // Filter function
  useEffect(() => {
    let filtered = barangList;

    // Filter by search term (nama barang)
    if (searchTerm) {
      filtered = filtered.filter((barang) =>
        barang.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by kategori
    if (selectedKategori) {
      filtered = filtered.filter(
        (barang) => barang.kategori?.id.toString() === selectedKategori
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((barang) => {
        let status;
        if (barang.qty < barang.stok_minimum) {
          status = "kritis";
        } else if (barang.qty === barang.stok_minimum) {
          status = "minimum";
        } else {
          status = "aman";
        }
        return status === selectedStatus;
      });
    }

    setFilteredBarang(filtered);
  }, [barangList, searchTerm, selectedKategori, selectedStatus]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedKategori("");
    setSelectedStatus("");
  };

  // Handle edit quantity
  // eslint-disable-next-line no-unused-vars
  const handleEditClick = (barang) => {
    setSelectedBarang(barang);
    setEditForm({
      qty: barang.qty,
      keterangan: "",
    });
    setShowEditModal(true);
  };

  // eslint-disable-next-line no-unused-vars
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/barang/${selectedBarang.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qty: parseInt(editForm.qty),
          keterangan: editForm.keterangan,
        }),
      });

      if (response.ok) {
        // Refresh data
        const resBarang = await fetch("/api/dashboard-barang");
        const dataBarang = await resBarang.json();
        setBarangList(dataBarang);
        setFilteredBarang(dataBarang);

        setShowEditModal(false);
        setSelectedBarang(null);
        setEditForm({ qty: 0, keterangan: "" });
        alert("Quantity berhasil diupdate!");
      } else {
        const error = await response.json();
        alert(`Gagal mengupdate quantity: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Terjadi kesalahan saat mengupdate quantity");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedBarang(null);
    setEditForm({ qty: 0, keterangan: "" });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black mb-2">
          Dashboard Stok Barang
        </h1>
        <p className="text-gray-600">Monitoring stok dan inventory barang</p>
      </div>

      {/* Legend Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-black mb-3">
          Keterangan Status Stok
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg transition-colors duration-200 ease-out hover:bg-green-100 cursor-pointer">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <span className="font-medium text-green-800">Aman</span>
              <p className="text-sm text-green-700">Stok di atas minimum</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg transition-colors duration-200 ease-out hover:bg-yellow-100 cursor-pointer">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div>
              <span className="font-medium text-yellow-800">Minimum</span>
              <p className="text-sm text-yellow-700">Stok tepat minimum</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg transition-colors duration-200 ease-out hover:bg-red-100 cursor-pointer">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <span className="font-medium text-red-800">Kritis</span>
              <p className="text-sm text-red-700">Stok di bawah minimum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          Filter & Pencarian
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="searchInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cari Nama Barang
            </label>
            <input
              id="searchInput"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Masukkan nama barang..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ease-out hover:border-blue-400"
            />
          </div>

          {/* Kategori Filter */}
          <div>
            <label
              htmlFor="kategoriSelect"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kategori
            </label>
            <select
              id="kategoriSelect"
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ease-out hover:border-blue-400"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((kategori) => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="statusSelect"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status Stok
            </label>
            <select
              id="statusSelect"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ease-out hover:border-blue-400"
            >
              <option value="">Semua Status</option>
              <option value="aman">Aman (Di atas minimum)</option>
              <option value="minimum">Minimum (Tepat minimum)</option>
              <option value="kritis">Kritis (Di bawah minimum)</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="btn-secondary w-full px-4 py-2 transition-colors duration-200 ease-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Filter Results Info */}
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {filteredBarang.length} dari {barangList.length} barang
          {(searchTerm || selectedKategori || selectedStatus) && (
            <span className="ml-2 text-blue-600">(dengan filter aktif)</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-enhanced border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-out">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800">
              <tr>
                <th className="py-4 px-4 border-b border-blue-200 font-semibold">
                  Nama Barang
                </th>
                <th className="py-4 px-4 border-b border-blue-200 font-semibold">
                  Kategori
                </th>
                <th className="py-4 px-4 border-b border-blue-200 font-semibold">
                  Stok
                </th>
                <th className="py-4 px-4 border-b border-blue-200 font-semibold">
                  Stok Minimum
                </th>
                <th className="py-4 px-4 border-b border-blue-200 font-semibold">
                  Status
                </th>
                <th className="py-4 px-4 border-b border-blue-200 font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBarang.map((barang, index) => {
                // Determine row color based on stock status
                let rowBgClass = "";
                let textClass = "";

                if (barang.qty < barang.stok_minimum) {
                  // Red: Below minimum stock
                  rowBgClass =
                    "bg-red-50 hover:bg-red-100 transition-colors duration-200 ease-out";
                  textClass = "text-red-800";
                } else if (barang.qty === barang.stok_minimum) {
                  // Yellow: At minimum stock
                  rowBgClass =
                    "bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200 ease-out";
                  textClass = "text-yellow-800";
                } else {
                  // Green: Above minimum stock
                  rowBgClass =
                    "bg-green-50 hover:bg-green-100 transition-colors duration-200 ease-out";
                  textClass = "text-green-800";
                }

                return (
                  <tr
                    key={barang.id}
                    className={`${rowBgClass} ${textClass} border-b border-gray-200 transition-all duration-200 ease-out hover:border-l-4 hover:border-blue-400 cursor-pointer group`}
                  >
                    <td className="py-4 px-4 transition-colors duration-200 ease-out group-hover:font-medium group-hover:text-blue-700">
                      {barang.nama}
                    </td>
                    <td className="py-4 px-4 transition-colors duration-200 ease-out group-hover:text-gray-700">
                      {barang.kategori?.nama || "-"}
                    </td>
                    <td className="py-4 px-4 transition-colors duration-200 ease-out font-semibold group-hover:text-blue-600">
                      {barang.qty}
                    </td>
                    <td className="py-4 px-4 transition-colors duration-200 ease-out group-hover:text-gray-700">
                      {barang.stok_minimum}
                    </td>
                    <td className="py-4 px-4 font-bold transition-colors duration-200 ease-out">
                      {(() => {
                        if (barang.qty < barang.stok_minimum) return "Kritis";
                        if (barang.qty === barang.stok_minimum)
                          return "Minimum";
                        return "Aman";
                      })()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleEditClick(barang)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Edit Qty
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBarang.length === 0 && barangList.length > 0 && (
                <tr className="bg-gray-100">
                  <td
                    colSpan="6"
                    className="text-center py-8 text-gray-500 border-b border-gray-200"
                  >
                    Tidak ada barang yang sesuai dengan filter
                  </td>
                </tr>
              )}
              {barangList.length === 0 && (
                <tr className="bg-white">
                  <td
                    colSpan="6"
                    className="text-center py-8 text-gray-500 border-b border-gray-200"
                  >
                    Tidak ada data barang
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Quantity */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Edit Quantity - {selectedBarang?.nama}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="currentQty"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity Saat Ini
                </label>
                <input
                  id="currentQty"
                  type="number"
                  value={selectedBarang?.qty || 0}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="newQty"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity Baru
                </label>
                <input
                  id="newQty"
                  type="number"
                  min="0"
                  value={editForm.qty}
                  onChange={(e) =>
                    setEditForm({ ...editForm, qty: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ease-out hover:border-blue-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="keterangan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  value={editForm.keterangan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, keterangan: e.target.value })
                  }
                  placeholder="Alasan perubahan quantity (contoh: Karyawan A tidak lagi menggunakan barang ini)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ease-out hover:border-blue-400"
                  rows="3"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary px-4 py-2 transition-colors duration-200 ease-out hover:bg-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 transition-colors duration-200 ease-out hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
