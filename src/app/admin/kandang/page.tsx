'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, Kandang, JenisAyam, TransaksiKeuangan } from '@/lib/dbService';
import { useToast } from '@/context/ToastContext';
import { Trash2, Edit3, Search, PlusCircle, XCircle, Info, Sparkles, Warehouse } from 'lucide-react';

export default function KandangPage() {
  const { showToast } = useToast();

  // State
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [jenisAyamList, setJenisAyamList] = useState<JenisAyam[]>([]);
  const [transaksiList, setTransaksiList] = useState<TransaksiKeuangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [jenisJantan, setJenisJantan] = useState('');
  const [jenisBetina, setJenisBetina] = useState('');
  const [nomorKandang, setNomorKandang] = useState('');
  const [tipeKandang, setTipeKandang] = useState('Induk');
  const [jumlahJantan, setJumlahJantan] = useState(0);
  const [jumlahBetina, setJumlahBetina] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const breeds = await dbService.getJenisAyam();
      setJenisAyamList(breeds);
      const pens = await dbService.getKandang();
      setKandangList(pens);
      const trx = await dbService.getTransaksi();
      setTransaksiList(trx);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form Auto-calculate
  const totalPopulasi = jumlahJantan + jumlahBetina;

  const resetForm = () => {
    setEditId(null);
    setJenisJantan('');
    setJenisBetina('');
    setNomorKandang('');
    setTipeKandang('Induk');
    setJumlahJantan(0);
    setJumlahBetina(0);
  };

  const handleEdit = (pen: Kandang) => {
    setEditId(pen.id);
    setNomorKandang(pen.nomor_kandang);
    setTipeKandang(pen.tipe_kandang || 'Induk');
    setJenisJantan(pen.jenis_ayam_jantan || '');
    setJenisBetina(pen.jenis_ayam_betina || '');
    setJumlahJantan(pen.jumlah_jantan);
    setJumlahBetina(pen.jumlah_betina);
    
    // Smooth scroll back to form for UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorKandang.trim()) {
      showToast('Nomor Kandang tidak boleh kosong.', 'error');
      return;
    }
    if (!jenisJantan || !jenisBetina) {
      showToast('Pilih jenis ayam jantan & betina.', 'error');
      return;
    }

    setSubmitting(true);
    const isIndukOrPullet = tipeKandang === 'Induk' || tipeKandang === 'Pullet';
    
    const payload = {
      nomor_kandang: nomorKandang.trim(),
      tipe_kandang: tipeKandang,
      jenis_ayam_jantan: isIndukOrPullet ? jenisJantan : null,
      jenis_ayam_betina: jenisBetina,
      jumlah_jantan: isIndukOrPullet ? jumlahJantan : 0,
      jumlah_betina: jumlahBetina, // Acts as Total for DOC/Pembesaran
    };

    try {
      if (editId) {
        await dbService.updateKandang(editId, payload);
        showToast(`Kandang ${payload.nomor_kandang} berhasil diperbarui.`, 'success');
      } else {
        await dbService.addKandang(payload);
        showToast(`Kandang ${payload.nomor_kandang} berhasil didaftarkan.`, 'success');
      }
      resetForm();
      // Reload lists
      const pens = await dbService.getKandang();
      setKandangList(pens);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data kandang.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await dbService.deleteKandang(deleteTargetId);
      showToast('Kandang berhasil dihapus.', 'success');
      setDeleteTargetId(null);
      // Reload lists
      const pens = await dbService.getKandang();
      setKandangList(pens);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus kandang.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filters search list
  const filteredPens = kandangList.filter(pen => {
    const q = searchQuery.toLowerCase();
    return (
      pen.nomor_kandang.toLowerCase().includes(q) ||
      (pen.jenis_ayam_jantan && pen.jenis_ayam_jantan.toLowerCase().includes(q)) ||
      (pen.jenis_ayam_betina && pen.jenis_ayam_betina.toLowerCase().includes(q))
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
              {editId ? 'Edit Data Kandang' : 'Daftarkan Kandang Baru'}
            </h3>
            {editId && (
              <button
                onClick={resetForm}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center font-semibold"
              >
                <XCircle className="w-4 h-4 mr-1" /> Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipe Kandang & Nomor Kandang */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                  Tipe Kandang
                </label>
                <select
                  required
                  value={tipeKandang}
                  onChange={(e) => setTipeKandang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="Induk" className="dark:bg-[#0b1329]">Induk</option>
                  <option value="DOC" className="dark:bg-[#0b1329]">DOC</option>
                  <option value="Pembesaran" className="dark:bg-[#0b1329]">Pembesaran</option>
                  <option value="Pullet" className="dark:bg-[#0b1329]">Pullet</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                  Nomor Kandang
                </label>
                <input
                  type="text"
                  required
                  value={nomorKandang}
                  onChange={(e) => setNomorKandang(e.target.value)}
                  placeholder="KNDG-01"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {(tipeKandang === 'Induk' || tipeKandang === 'Pullet') ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                      Jenis Ayam Jantan
                    </label>
                    <select
                      required
                      value={jenisJantan}
                      onChange={(e) => setJenisJantan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="" disabled>Pilih Jantan</option>
                      {jenisAyamList.map(j => (
                        <option key={j.id} value={j.nama_jenis_ayam} className="dark:bg-[#0b1329]">{j.nama_jenis_ayam}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                      Jenis Ayam Betina
                    </label>
                    <select
                      required
                      value={jenisBetina}
                      onChange={(e) => setJenisBetina(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="" disabled>Pilih Betina</option>
                      {jenisAyamList.map(j => (
                        <option key={j.id} value={j.nama_jenis_ayam} className="dark:bg-[#0b1329]">{j.nama_jenis_ayam}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {jenisAyamList.length === 0 && (
                  <p className="text-[10px] text-rose-500 font-semibold"><Info className="w-3.5 h-3.5 inline mr-1" />Belum ada Jenis Ayam terdaftar. Silakan ke Menu Jenis Ayam dahulu.</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                      Jumlah Jantan
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={jumlahJantan}
                      onChange={(e) => setJumlahJantan(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                      Jumlah Betina
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={jumlahBetina}
                      onChange={(e) => setJumlahBetina(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Total Populasi
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      readOnly
                      value={jumlahJantan + jumlahBetina}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0b1329]/80 text-xs text-slate-500 cursor-not-allowed font-semibold focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                      Auto Hitung
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Jenis Ayam
                  </label>
                  <select
                    required
                    value={jenisBetina}
                    onChange={(e) => setJenisBetina(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                  >
                    <option value="" disabled>Pilih Jenis Ayam</option>
                    {jenisAyamList.map(j => (
                      <option key={j.id} value={j.nama_jenis_ayam} className="dark:bg-[#0b1329]">{j.nama_jenis_ayam}</option>
                    ))}
                  </select>
                </div>
                {jenisAyamList.length === 0 && (
                  <p className="text-[10px] text-rose-500 font-semibold"><Info className="w-3.5 h-3.5 inline mr-1" />Belum ada Jenis Ayam terdaftar. Silakan ke Menu Jenis Ayam dahulu.</p>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Total Populasi
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={jumlahBetina}
                    onChange={(e) => setJumlahBetina(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-md hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>Simpan Data Kandang</span>
            </button>
          </form>
        </div>

        <div className="glass p-6 rounded-2xl lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center">
              <Warehouse className="w-5 h-5 text-emerald-500 mr-2" />
              Kelola Master Data Kandang
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Kandang / Jenis..."
                className="w-full sm:w-64 pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 focus:border-emerald-500 focus:outline-none dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 flex-grow">
              <div className="skeleton h-10 w-full rounded-xl"></div>
              <div className="skeleton h-16 w-full rounded-xl"></div>
              <div className="skeleton h-16 w-full rounded-xl"></div>
            </div>
          ) : filteredPens.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center">
              <Warehouse className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Kandang Belum Terdaftar</h4>
            </div>
          ) : (
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">No</th>
                    <th className="pb-3">Nomor Kandang</th>
                    <th className="pb-3">Jenis Ayam</th>
                    <th className="pb-3 text-right">Populasi</th>
                    <th className="pb-3 text-center">Rasio J/B</th>
                    <th className="pb-3 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                  {filteredPens.map((pen, index) => {
                    const total = pen.total_populasi || 1;
                    const malePercent = Math.round((pen.jumlah_jantan / total) * 100);
                    const femalePercent = Math.round((pen.jumlah_betina / total) * 100);

                    const revenue = transaksiList
                      .filter(t => t.nomor_kandang === pen.nomor_kandang && t.jenis_transaksi === 'Pemasukan')
                      .reduce((acc, curr) => acc + curr.nominal, 0);

                    const formatCurrency = (amount: number) => {
                      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
                    };

                    return (
                      <tr key={pen.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {pen.tipe_kandang || 'Induk'} {pen.nomor_kandang}
                            </span>
                            {revenue > 0 && (
                              <span className="text-[10px] font-bold text-emerald-500 mt-0.5">
                                {formatCurrency(revenue)} (Pendapatan)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col space-y-0.5 font-semibold">
                            {(pen.tipe_kandang === 'Induk' || pen.tipe_kandang === 'Pullet' || !pen.tipe_kandang) ? (
                              <>
                                <span className="inline-flex items-center text-blue-500 dark:text-blue-400">
                                  <span className="w-3 text-center mr-1">♂</span> {pen.jenis_ayam_jantan || '-'}
                                </span>
                                <span className="inline-flex items-center text-pink-500 dark:text-pink-400">
                                  <span className="w-3 text-center mr-1">♀</span> {pen.jenis_ayam_betina || '-'}
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center text-slate-600 dark:text-slate-400">
                                {pen.jenis_ayam_betina || '-'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-right font-extrabold text-slate-700 dark:text-slate-200">
                          {pen.total_populasi} <span className="text-[9px] font-normal text-slate-400">ekor</span>
                        </td>
                        <td className="py-4 px-4 w-40 text-center">
                          {(pen.tipe_kandang === 'Induk' || pen.tipe_kandang === 'Pullet' || !pen.tipe_kandang) ? (
                            <div className="flex items-center justify-center space-x-2 text-[10px]">
                              <span className="text-blue-400 font-bold">{pen.jumlah_jantan} ♂</span>
                              <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-blue-500" style={{ width: `${malePercent}%` }}></div>
                                <div className="h-full bg-pink-500" style={{ width: `${femalePercent}%` }}></div>
                              </div>
                              <span className="text-pink-400 font-bold">{pen.jumlah_betina} ♀</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Total only</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(pen)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(pen.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors"
                              title="Hapus"
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">Hapus Data Kandang?</h3>
            <p className="text-xs text-slate-400 mt-2">Tindakan ini bersifat permanen. Menghapus kandang akan menghapus seluruh data histori setoran telur yang terkait.</p>

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
