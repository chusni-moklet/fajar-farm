'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, LaporanTelur, Kandang } from '@/lib/dbService';
import { useToast } from '@/context/ToastContext';
import { ClipboardList, Trash2, Calendar, PlusCircle, Search, Info } from 'lucide-react';

export default function LaporanPage() {
  const { showToast } = useToast();

  // State
  const [laporanList, setLaporanList] = useState<LaporanTelur[]>([]);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKandang, setFilterKandang] = useState('');

  // Form State
  const [tanggal, setTanggal] = useState('');
  const [nomorKandang, setNomorKandang] = useState('');
  const [periodeLaporan, setPeriodeLaporan] = useState<'Harian' | 'Pekanan'>('Harian');
  const [jumlahTelur, setJumlahTelur] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const pens = await dbService.getKandang();
      setKandangList(pens);
      const reports = await dbService.getLaporan();
      setLaporanList(reports);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data laporan.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Set default date to today
  useEffect(() => {
    setTanggal(new Date().toISOString().split('T')[0]);
    fetchReports();
  }, [fetchReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal) {
      showToast('Pilih tanggal setor.', 'error');
      return;
    }
    if (!nomorKandang) {
      showToast('Pilih nomor kandang.', 'error');
      return;
    }
    if (jumlahTelur < 0) {
      showToast('Jumlah telur tidak boleh kurang dari 0.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      tanggal,
      nomor_kandang: nomorKandang,
      periode_laporan: periodeLaporan,
      jumlah_telur: jumlahTelur
    };

    try {
      await dbService.addLaporan(payload);
      showToast('Laporan produksi telur berhasil disetor.', 'success');
      // Reset form keeping date
      setNomorKandang('');
      setJumlahTelur(0);
      setPeriodeLaporan('Harian');

      // Reload reports
      const reports = await dbService.getLaporan();
      setLaporanList(reports);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan laporan.', 'error');
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
      await dbService.deleteLaporan(deleteTargetId);
      showToast('Laporan berhasil dihapus.', 'success');
      setDeleteTargetId(null);
      const reports = await dbService.getLaporan();
      setLaporanList(reports);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus laporan.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredReports = laporanList.filter(rep => {
    return filterKandang === '' || rep.nomor_kandang === filterKandang;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CONTAINER */}
        <div className="glass p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center mb-6">
            <PlusCircle className="w-5 h-5 text-emerald-500 mr-2" />
            Setor Laporan Produksi
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tanggal Setor */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Tanggal Setor
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              />
            </div>

            {/* Nomor Kandang */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Nomor Kandang
              </label>
              <select
                required
                value={nomorKandang}
                onChange={(e) => setNomorKandang(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              >
                <option value="" disabled>Pilih Kandang</option>
                {kandangList.map(k => (
                  <option key={k.id} value={k.nomor_kandang} className="dark:bg-[#0b1329]">Kandang {k.nomor_kandang}</option>
                ))}
              </select>
              {kandangList.length === 0 && (
                <p className="text-[10px] text-rose-500 mt-2 font-semibold">
                  <Info className="w-3.5 h-3.5 inline mr-1" />
                  Belum ada kandang terdaftar. Silakan ke Menu Admin dahulu.
                </p>
              )}
            </div>

            {/* Periode Laporan */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Periode Laporan
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  onClick={() => setPeriodeLaporan('Harian')}
                  className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    periodeLaporan === 'Harian'
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-slate-500 hover:border-emerald-500/50'
                  }`}
                >
                  <span className="text-xs">Harian</span>
                </label>

                <label
                  onClick={() => setPeriodeLaporan('Pekanan')}
                  className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    periodeLaporan === 'Pekanan'
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-slate-500 hover:border-emerald-500/50'
                  }`}
                >
                  <span className="text-xs">Pekanan</span>
                </label>
              </div>
            </div>

            {/* Jumlah Telur */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Jumlah Telur (Butir)
              </label>
              <input
                type="number"
                required
                min="0"
                value={jumlahTelur}
                onChange={(e) => setJumlahTelur(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-md hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              <span>Setor Laporan</span>
            </button>
          </form>
        </div>

        {/* LIST CONTAINER */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center">
              <ClipboardList className="w-5 h-5 text-emerald-500 mr-2" />
              Histori Laporan Produksi
            </h3>
            {/* Filter by Cage */}
            <div className="relative">
              <select
                value={filterKandang}
                onChange={(e) => setFilterKandang(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 focus:border-emerald-500 focus:outline-none pr-8 dark:text-white"
              >
                <option value="">Semua Kandang</option>
                {kandangList.map(k => (
                  <option key={k.id} value={k.nomor_kandang} className="dark:bg-[#0b1329]">Kandang {k.nomor_kandang}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 flex-grow">
              <div className="skeleton h-10 w-full rounded-xl"></div>
              <div className="skeleton h-16 w-full rounded-xl"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Laporan Belum Ada</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Peternak belum menyetor data produksi telur. Isi formulir di samping untuk menyetor laporan baru.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">No</th>
                    <th className="pb-3">Tanggal</th>
                    <th className="pb-3">Nomor Kandang</th>
                    <th className="pb-3 text-center">Periode</th>
                    <th className="pb-3 text-right">Jumlah Telur</th>
                    <th className="pb-3 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                  {filteredReports.map((item, index) => {
                    const isWeekly = item.periode_laporan === 'Pekanan';
                    return (
                      <tr key={item.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-4 font-semibold text-slate-700 dark:text-slate-200">
                          {formatIndoDate(item.tanggal)}
                        </td>
                        <td className="py-4 font-bold text-slate-700 dark:text-slate-200">
                          Kandang {item.nomor_kandang}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            isWeekly
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-500/10'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/10'
                          }`}>
                            {item.periode_laporan}
                          </span>
                        </td>
                        <td className="py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          {item.jumlah_telur} <span className="text-[9px] font-normal text-slate-400">butir</span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors"
                              title="Hapus Laporan"
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

      {/* CONFIRMATION DELETE MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass max-w-sm w-full p-6 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">Hapus Laporan Telur?</h3>
            <p className="text-xs text-slate-400 mt-2">Tindakan ini bersifat permanen dan data laporan ini akan dihapus dari histori produksi peternakan.</p>

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
