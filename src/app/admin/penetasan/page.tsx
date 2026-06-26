'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, Penetasan, Kandang } from '@/lib/dbService';
import { useToast } from '@/context/ToastContext';
import { Trash2, Edit3, Search, PlusCircle, XCircle, Egg, Info } from 'lucide-react';

export default function PenetasanPage() {
  const { showToast } = useToast();

  // State
  const [penetasanList, setPenetasanList] = useState<Penetasan[]>([]);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);
  const [nomorKandang, setNomorKandang] = useState('');
  const [telurMasuk, setTelurMasuk] = useState(0);
  const [tidakFertil, setTidakFertil] = useState(0);
  const [menetas, setMenetas] = useState(0);
  const [gagal, setGagal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = await dbService.getPenetasan();
      setPenetasanList(p);
      const k = await dbService.getKandang();
      setKandangList(k);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setEditId(null);
    setTanggalMasuk(new Date().toISOString().split('T')[0]);
    setNomorKandang('');
    setTelurMasuk(0);
    setTidakFertil(0);
    setMenetas(0);
    setGagal(0);
  };

  const handleEdit = (p: Penetasan) => {
    setEditId(p.id);
    setTanggalMasuk(p.tanggal_masuk);
    setNomorKandang(p.nomor_kandang || '');
    setTelurMasuk(p.jumlah_telur_masuk);
    setTidakFertil(p.tidak_fertil);
    setMenetas(p.menetas);
    setGagal(p.gagal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (telurMasuk <= 0) {
      showToast('Jumlah telur masuk harus lebih dari 0.', 'error');
      return;
    }
    const totalOut = tidakFertil + menetas + gagal;
    if (totalOut > telurMasuk) {
      showToast('Total hasil (Tidak Fertil + Menetas + Gagal) tidak boleh melebihi Telur Masuk.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      tanggal_masuk: tanggalMasuk,
      nomor_kandang: nomorKandang || null,
      jumlah_telur_masuk: telurMasuk,
      tidak_fertil: tidakFertil,
      menetas: menetas,
      gagal: gagal
    };

    try {
      if (editId) {
        await dbService.updatePenetasan(editId, payload);
        showToast('Data penetasan berhasil diperbarui.', 'success');
      } else {
        await dbService.addPenetasan(payload);
        showToast('Data penetasan berhasil ditambahkan.', 'success');
      }
      resetForm();
      const p = await dbService.getPenetasan();
      setPenetasanList(p);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await dbService.deletePenetasan(deleteTargetId);
      showToast('Data penetasan berhasil dihapus.', 'success');
      setDeleteTargetId(null);
      const p = await dbService.getPenetasan();
      setPenetasanList(p);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = penetasanList.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.nomor_kandang && p.nomor_kandang.toLowerCase().includes(q)) ||
      p.tanggal_masuk.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CONTAINER */}
        <div className="glass p-6 rounded-2xl h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center">
              <PlusCircle className="w-5 h-5 text-emerald-500 mr-2" />
              {editId ? 'Edit Data Penetasan' : 'Input Penetasan Baru'}
            </h3>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center font-semibold"
              >
                <XCircle className="w-4 h-4 mr-1" /> Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Tanggal Masuk Inkubator
              </label>
              <input
                type="date"
                required
                value={tanggalMasuk}
                onChange={(e) => setTanggalMasuk(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Asal Kandang (Opsional)
              </label>
              <select
                value={nomorKandang}
                onChange={(e) => setNomorKandang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              >
                <option value="">-- Pilih Asal Kandang --</option>
                {kandangList.map(k => (
                  <option key={k.id} value={k.nomor_kandang} className="dark:bg-[#0b1329]">
                    Kandang {k.nomor_kandang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Jumlah Telur Masuk
              </label>
              <input
                type="number"
                required
                min="1"
                value={telurMasuk || ''}
                onChange={(e) => setTelurMasuk(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                  Menetas
                </label>
                <input
                  type="number"
                  min="0"
                  value={menetas || ''}
                  onChange={(e) => setMenetas(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20 text-xs focus:border-emerald-500 focus:outline-none dark:text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                  Tidak Fertil
                </label>
                <input
                  type="number"
                  min="0"
                  value={tidakFertil || ''}
                  onChange={(e) => setTidakFertil(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20 text-xs focus:border-amber-500 focus:outline-none dark:text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                  Gagal
                </label>
                <input
                  type="number"
                  min="0"
                  value={gagal || ''}
                  onChange={(e) => setGagal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-rose-50 dark:bg-rose-900/20 text-xs focus:border-rose-500 focus:outline-none dark:text-white text-center font-bold"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-[10px] text-slate-400 mb-2 flex justify-between">
                <span>Total Hasil: {tidakFertil + menetas + gagal}</span>
                <span className={tidakFertil + menetas + gagal > telurMasuk ? 'text-rose-500 font-bold' : 'text-emerald-500'}>
                  Sisa (Belum lapor): {Math.max(0, telurMasuk - (tidakFertil + menetas + gagal))}
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-md hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                <span>{editId ? 'Simpan Perubahan' : 'Simpan Data'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center">
              <Egg className="w-5 h-5 text-emerald-500 mr-2" />
              Kelola Data Penetasan
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Asal Kandang/Tanggal..."
                className="w-full sm:w-64 pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 focus:border-emerald-500 focus:outline-none dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 flex-grow">
              <div className="skeleton h-10 w-full rounded-xl"></div>
              <div className="skeleton h-16 w-full rounded-xl"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center">
              <Egg className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Data Belum Ada</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Belum ada data penetasan yang terdaftar.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">No</th>
                    <th className="pb-3">Tanggal Masuk</th>
                    <th className="pb-3">Asal Kandang</th>
                    <th className="pb-3 text-center">Telur Masuk</th>
                    <th className="pb-3 text-center">Menetas</th>
                    <th className="pb-3 text-center">Gagal/Tidak Fertil</th>
                    <th className="pb-3 text-right">Hatchability</th>
                    <th className="pb-3 text-right w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                  {filtered.map((p, index) => {
                    const totalGagal = p.gagal + p.tidak_fertil;
                    const persentase = p.jumlah_telur_masuk > 0 ? Math.round((p.menetas / p.jumlah_telur_masuk) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-4 font-semibold text-slate-700 dark:text-slate-200">
                          {p.tanggal_masuk}
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">
                          {p.nomor_kandang ? `Kandang ${p.nomor_kandang}` : '-'}
                        </td>
                        <td className="py-4 text-center font-bold text-blue-500">
                          {p.jumlah_telur_masuk}
                        </td>
                        <td className="py-4 text-center font-bold text-emerald-500">
                          {p.menetas}
                        </td>
                        <td className="py-4 text-center text-rose-500 font-semibold text-[11px]">
                          {p.tidak_fertil} TF / {p.gagal} G
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-1 rounded-md font-bold text-[10px] ${persentase >= 80 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : persentase >= 50 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                            {persentase}%
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL OVERLAY */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass max-w-sm w-full p-6 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">Hapus Data Penetasan?</h3>
            <p className="text-xs text-slate-400 mt-2">Tindakan ini bersifat permanen.</p>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-55"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all flex items-center justify-center disabled:opacity-55"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
