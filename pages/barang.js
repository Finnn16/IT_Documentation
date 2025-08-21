import { useEffect, useState } from "react";

export default function FormBarang() {
  const [form, setForm] = useState({
    nama: "",
    stok_minimum: 3,
    kategoriId: "",
  });

  const [kategoriList, setKategoriList] = useState([]);

  useEffect(() => {
    async function fetchKategori() {
      const res = await fetch("/api/kategori-barang");
      const data = await res.json();
      setKategoriList(data);
    }
    fetchKategori();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/barang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: form.nama,
        stok_minimum: parseInt(form.stok_minimum),
        kategoriId: parseInt(form.kategoriId),
      }),
    });

    if (res.ok) {
      alert("Barang berhasil ditambahkan");
      setForm({ nama: "", stok_minimum: 3, kategoriId: "" });
    } else {
      alert("Gagal menambahkan barang");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto bg-white p-8 shadow-enhanced rounded-lg transition-all duration-300 hover:shadow-xl">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800 transition-colors duration-200">
          Tambah Barang Baru
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="nama"
            label="Nama Barang"
            value={form.nama}
            onChange={handleChange}
          />
          <Input
            name="stok_minimum"
            label="Stok Minimum"
            type="number"
            value={form.stok_minimum}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
              Kategori
            </label>
            <select
              name="kategoriId"
              value={form.kategoriId}
              onChange={handleChange}
              className="select-enhanced w-full transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">Pilih kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 px-6 text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-blue-200"
          >
            Simpan Barang
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ name, label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="input-enhanced w-full transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-md"
        required
      />
    </div>
  );
}
