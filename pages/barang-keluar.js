import { useState, useEffect } from "react";
import Link from "next/link";
import SearchableDropdown from "../components/SearchableDropdown";

export default function BarangKeluar() {
  const [barangList, setBarangList] = useState([]);

  const [form, setForm] = useState({
    nama_barang: "",
    qty: "",
    status: "",
    keterangan: "",
    kondisi_barang: "",
  });

  useEffect(() => {
    async function fetchData() {
      // Gunakan query parameter available_only=true untuk hanya menampilkan barang dengan stok > 0
      const barangRes = await fetch("/api/barang?available_only=true");
      const barangData = await barangRes.json();
      setBarangList(barangData);
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    // Jika nama_barang berubah, reset qty
    if (e.target.name === "nama_barang") {
      setForm({ ...form, [e.target.name]: e.target.value, qty: "" });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi qty tidak melebihi stok yang tersedia
    const selectedBarang = barangList.find(
      (item) => item.id === parseInt(form.nama_barang)
    );
    if (selectedBarang && parseInt(form.qty) > selectedBarang.qty) {
      alert(`Qty tidak boleh melebihi stok tersedia (${selectedBarang.qty})`);
      return;
    }

    try {
      const formData = {
        barangId: parseInt(form.nama_barang),
        qty: parseInt(form.qty),
        status: form.status,
        keterangan: form.keterangan,
        kondisi_barang: form.kondisi_barang,
      };

      const res = await fetch("/api/barang-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Data berhasil disimpan");
        setForm({
          nama_barang: "",
          qty: "",
          status: "",
          keterangan: "",
          kondisi_barang: "",
        });

        // Refresh data barang untuk update stok di dropdown
        const barangRes = await fetch("/api/barang?available_only=true");
        const barangData = await barangRes.json();
        setBarangList(barangData);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menyimpan data");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dropdown nama_barang */}
                <SearchableDropdown
                  name="nama_barang"
                  label="Nama Barang"
                  value={form.nama_barang}
                  onChange={handleChange}
                  options={barangList}
                  placeholder="Pilih barang"
                  searchPlaceholder="Cari barang..."
                  required={true}
                  showQty={true}
                />

                <Input
                  name="qty"
                  label={`Quantity ${
                    form.nama_barang
                      ? `(Max: ${
                          barangList.find(
                            (item) => item.id === parseInt(form.nama_barang)
                          )?.qty || 0
                        })`
                      : ""
                  }`}
                  type="number"
                  value={form.qty}
                  onChange={handleChange}
                  min="1"
                  max={
                    form.nama_barang
                      ? barangList.find(
                          (item) => item.id === parseInt(form.nama_barang)
                        )?.qty || 0
                      : undefined
                  }
                />

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status Penggunaan
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Pilih status</option>
                    <option value="0">Sementara</option>
                    <option value="1">Pakai</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="kondisi_barang"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kondisi Barang
                  </label>
                  <select
                    id="kondisi_barang"
                    name="kondisi_barang"
                    value={form.kondisi_barang}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="0">Bekas</option>
                    <option value="1">Baru</option>
                  </select>
                </div>
              </div>

              {/* Keterangan field - full width */}
              <div className="mt-4">
                <label
                  htmlFor="keterangan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  name="keterangan"
                  value={form.keterangan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Keterangan tambahan..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-medium mt-6"
              >
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fixed Copyright */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="text-center">
          <p className="text-gray-500 text-sm">© 2025 Made by finnn16</p>
        </div>
      </div>
    </div>
  );
}

function Input({ name, label, type = "text", value, onChange, min, max }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
        required
      />
    </div>
  );
}
