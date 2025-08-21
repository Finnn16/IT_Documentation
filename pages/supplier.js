import { useEffect, useState } from "react";

export default function SupplierPage() {
  const [nama, setNama] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch("/api/supplier");
    const data = await res.json();
    setSuppliers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama }),
    });

    if (res.ok) {
      setNama("");
      fetchSuppliers();
      alert("Supplier berhasil ditambahkan");
    } else {
      alert("Gagal menambahkan supplier");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Form Input */}
        <div className="bg-white p-6 rounded-lg shadow-enhanced border transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 transition-colors duration-200">
            Tambah Supplier Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                Nama Supplier
              </label>
              <input
                type="text"
                name="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="input-enhanced w-full transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-2 px-4 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              Simpan Supplier
            </button>
          </form>
        </div>

        {/* Tabel Supplier */}
        <div className="bg-white p-6 rounded-lg shadow-enhanced border transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 transition-colors duration-200">
            Daftar Supplier
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full table-auto text-sm">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">#</th>
                  <th className="py-3 px-4 text-left font-medium">
                    Nama Supplier
                  </th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-100 table-row-hover transition-all duration-300 ease-in-out ${
                      i % 2 === 0
                        ? "bg-white hover:bg-blue-50 hover:shadow-md"
                        : "bg-gray-50 hover:bg-blue-50 hover:shadow-md"
                    }`}
                  >
                    <td className="py-3 px-4 transition-colors duration-200">
                      {i + 1}
                    </td>
                    <td className="py-3 px-4 transition-colors duration-200">
                      {s.nama}
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr className="bg-white">
                    <td
                      colSpan="2"
                      className="text-center py-8 text-gray-500 border-b border-gray-100 transition-colors duration-200"
                    >
                      Belum ada supplier
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
