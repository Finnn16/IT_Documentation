import { useState, useEffect } from "react";
import Link from "next/link";
import SearchableDropdown from "../components/SearchableDropdown";

export default function BarangMasuk() {
  const [barangList, setBarangList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [form, setForm] = useState({
    pr_no: "",
    gl_acc: "",
    supplier: "",
    supplier_lainnya: "",
    requester: "",
    nama_barang: "",
    qty: "",
    harga_satuan: "",
    remark: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [barangRes, supplierRes] = await Promise.all([
        fetch("/api/barang"),
        fetch("/api/supplier"),
      ]);
      const barangData = await barangRes.json();
      const supplierData = await supplierRes.json();

      setBarangList(barangData);
      setSupplierList(supplierData);
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Calculate total price automatically
  const calculateTotalPrice = () => {
    const qty = parseFloat(form.qty) || 0;
    const hargaSatuan = parseFloat(form.harga_satuan) || 0;
    return qty * hargaSatuan;
  };

  const finalForm = {
    pr_no: form.pr_no,
    gl_acc: form.gl_acc,
    requester: form.requester,
    remark: form.remark,
    qty: parseInt(form.qty),
    harga_satuan: parseFloat(form.harga_satuan) || 0,
    harga_total:
      (parseInt(form.qty) || 0) * (parseFloat(form.harga_satuan) || 0),
    ppn_11:
      (parseInt(form.qty) || 0) * (parseFloat(form.harga_satuan) || 0) * 0.11,
    total_dengan_ppn:
      (parseInt(form.qty) || 0) * (parseFloat(form.harga_satuan) || 0) * 1.11,
    barangId: parseInt(form.nama_barang),
    supplierId:
      form.supplier === "lainnya" && form.supplier_lainnya.trim() !== ""
        ? form.supplier_lainnya
        : parseInt(form.supplier),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/barang-masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm),
      });

      if (res.ok) {
        alert("Data berhasil disimpan");
        setForm({
          pr_no: "",
          gl_acc: "",
          supplier: "",
          supplier_lainnya: "",
          requester: "",
          nama_barang: "",
          qty: "",
          harga_satuan: "",
          remark: "",
        });
      } else {
        alert("Gagal menyimpan data");
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
                <Input
                  name="pr_no"
                  label="PR NO"
                  value={form.pr_no}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GL ACC
                  </label>
                  <select
                    name="gl_acc"
                    value={form.gl_acc}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih GL ACC</option>
                    <option value="6120710">6120710 Pembelian Stok</option>
                    <option value="6120415">6120415 Service</option>
                  </select>
                </div>

                <Input
                  name="requester"
                  label="Requester/Project/Location"
                  value={form.requester}
                  onChange={handleChange}
                />

                {/* Dropdown supplier */}
                <SearchableDropdown
                  name="supplier"
                  label="Supplier"
                  value={form.supplier}
                  onChange={handleChange}
                  options={supplierList}
                  placeholder="Pilih supplier"
                  searchPlaceholder="Cari supplier..."
                  allowCustom={true}
                  customOptionText="Supplier lain"
                  customOptionValue="lainnya"
                  required={true}
                />

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
                />

                <Input
                  name="qty"
                  label="Qty"
                  type="number"
                  value={form.qty}
                  onChange={handleChange}
                />

                <Input
                  name="harga_satuan"
                  label="Harga Satuan (Rp)"
                  type="number"
                  step="0.01"
                  value={form.harga_satuan}
                  onChange={handleChange}
                />

                {/* Display calculated total price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Harga (Rp)
                  </label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      (parseFloat(form.qty) || 0) *
                        (parseFloat(form.harga_satuan) || 0)
                    )}
                  </div>
                </div>
              </div>

              {/* PPN and Total dengan PPN - full width row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PPN 11% (Rp)
                  </label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-yellow-50 text-yellow-800">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      (parseFloat(form.qty) || 0) *
                        (parseFloat(form.harga_satuan) || 0) *
                        0.11
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total dengan PPN (Rp)
                  </label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-green-50 text-green-800 font-semibold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      (parseFloat(form.qty) || 0) *
                        (parseFloat(form.harga_satuan) || 0) *
                        1.11
                    )}
                  </div>
                </div>
              </div>

              {/* Supplier lainnya field - full width when visible */}
              {form.supplier === "lainnya" && (
                <div className="mt-4">
                  <Input
                    name="supplier_lainnya"
                    label="Masukkan Supplier Baru"
                    value={form.supplier_lainnya}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Remark field - full width */}
              <div className="mt-4">
                <Input
                  name="remark"
                  label="Remark"
                  value={form.remark}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium mt-6"
              >
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="text-center">
          <p className="text-gray-500 text-sm">© 2025 Made by finnn16</p>
        </div>
      </div>
    </div>
  );
}

function Input({ name, label, type = "text", value, onChange, step }) {
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
        step={step}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>
  );
}
