'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, AnakAyam, Kandang, JenisAyam } from '@/lib/dbService';
import { useToast } from '@/context/ToastContext';
import { Bird, Trash2, PlusCircle, Info, Calendar } from 'lucide-react';

export default function AnakAyamPage() {
  const { showToast } = useToast();

  // Data State
  const [anakAyamList, setAnakAyamList] = useState<AnakAyam[]>([]);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [jenisAyamList, setJenisAyamList] = useState<JenisAyam[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [tanggalTetas, setTanggalTetas] = useState('');
  const [jenisAyam, setJenisAyam] = useState('');
  const [kandangPembesaran, setKandangPembesaran] = useState('');
  const [jumlahEkor, setJumlahEkor] = useState(0);
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const pens = await dbService.getKandang();
      setKandangList(pens.filter(pen => pen.tipe_kandang === 'DOC' || pen.tipe_kandang === 'Pembesaran' || pen.tipe_kandang === 'Pullet' || !pen.tipe_kandang));
      const types = await dbService.getJenisAyam();
      setJenisAyamList(types);
      const chicks = await dbService.getAnakAyam();
      setAnakAyamList(chicks);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setTanggalTetas(new Date().toISOString().split('T')[0]);
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggalTetas) {
      showToast('Pilih tanggal tetas.', 'error');
      return;
    }
    if (jumlahEkor <= 0) {
      showToast('Jumlah ekor harus lebih dari 0.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      tanggal_tetas: tanggalTetas,
      jenis_ayam: jenisAyam || null,
      kandang_pembesaran: kandangPembesaran || null,
      jumlah_ekor: jumlahEkor,
      keterangan: keterangan || null
    };

    try {
      await dbService.addAnakAyam(payload);
      showToast('Data anak ayam berhasil didaftarkan.', 'success');
      
      // Reset form (keep date)
      setJenisAyam('');
      setKandangPembesaran('');
      setJumlahEkor(0);
      setKeterangan('');

      // Reload
      const chicks = await dbService.getAnakAyam();
      setAnakAyamList(chicks);
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
      await dbService.deleteAnakAyam(deleteTargetId);
      showToast('Data anak ayam berhasil dihapus.', 'success');
      setDeleteTargetId(null);
      const chicks = await dbService.getAnakAyam();
      setAnakAyamList(chicks);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus data.', 'error');
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

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return '-';
    
    // Gunakan tanggal pada zona waktu lokal
    const birthDate = new Date(dateStr + 'T00:00:00'); 
    birthDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Belum menetas';
    if (diffDays === 0) return 'Hari ini';
    if (diffDays < 7) return `${diffDays} Hari`;
    
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    
    if (remainingDays === 0) return `${weeks} Pekan`;
    return `${weeks} Pekan ${remainingDays} Hari`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CONTAINER */}
        <div className="glass p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center mb-6">
            <PlusCircle className="w-5 h-5 text-emerald-500 mr-2" />
            Daftar Anak Ayam Baru
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tanggal Tetas */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Tanggal Tetas
              </label>
              <input
                type="date"
                required
                value={tanggalTetas}
                onChange={(e) => setTanggalTetas(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              />
            </div>

            {/* Jenis Ayam */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Jenis Ayam
              </label>
              <select
                value={jenisAyam}
                onChange={(e) => setJenisAyam(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              >
                <option value="">-- Pilih Jenis Ayam --</option>
                {jenisAyamList.map(j => (
                  <option key={j.id} value={j.nama_jenis_ayam} className="dark:bg-[#0b1329]">
                    {j.nama_jenis_ayam}
                  </option>
                ))}
              </select>
              {jenisAyamList.length === 0 && (
                <p className="text-[9px] text-rose-500 mt-1 font-medium flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Belum ada master Jenis Ayam.
                </p>
              )}
            </div>

            {/* Kandang Pembesaran */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Kandang Pembesaran
              </label>
              <select
                value={kandangPembesaran}
                onChange={(e) => setKandangPembesaran(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              >
                <option value="">-- Pilih Kandang --</option>
                {kandangList.map(k => (
                  <option key={k.id} value={k.nomor_kandang} className="dark:bg-[#0b1329]">
                    {k.tipe_kandang || 'Induk'} {k.nomor_kandang}
                  </option>
                ))}
              </select>
              {kandangList.length === 0 && (
                <p className="text-[9px] text-rose-500 mt-1 font-medium flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Belum ada master Kandang.
                </p>
              )}
            </div>

            {/* Jumlah Ekor */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Jumlah (Ekor)
              </label>
              <input
                type="number"
                required
                min="1"
                value={jumlahEkor || ''}
                onChange={(e) => setJumlahEkor(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Keterangan (Opsional)
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white min-h-[80px]"
                placeholder="Catatan tambahan..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-md hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              <span>Simpan Data</span>
            </button>
          </form>
        </div>

        {/* LIST CONTAINER */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex items-center mb-6">
            <Bird className="w-5 h-5 text-emerald-500 mr-2" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase">
              Data Anak Ayam (DOC)
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3 flex-grow">
              <div className="skeleton h-10 w-full rounded-xl"></div>
              <div className="skeleton h-16 w-full rounded-xl"></div>
              <div className="skeleton h-16 w-full rounded-xl"></div>
            </div>
          ) : anakAyamList.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center">
              <Bird className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Belum Ada Data</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Gunakan formulir di samping untuk menambahkan data anak ayam baru.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">No</th>
                    <th className="pb-3">Tanggal Tetas</th>
                    <th className="pb-3 text-center">Umur</th>
                    <th className="pb-3">Jenis & Kandang</th>
                    <th className="pb-3 text-right">Jumlah</th>
                    <th className="pb-3 text-right w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                  {anakAyamList.map((item, index) => {
                    const isNew = item.tanggal_tetas === new Date().toISOString().split('T')[0];
                    return (
                      <tr key={item.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-4 text-slate-600 dark:text-slate-300 font-medium">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            {formatIndoDate(item.tanggal_tetas)}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            isNew 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/20' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {calculateAge(item.tanggal_tetas)}
                          </span>
                        </td>
                        <td className="py-4">
                          <p className="font-bold text-slate-700 dark:text-slate-200">
                            {item.jenis_ayam || <span className="text-slate-400 italic font-normal">Tidak diset</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Kandang: {item.kandang_pembesaran ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">{kandangList.find(k => k.nomor_kandang === item.kandang_pembesaran)?.tipe_kandang || 'Induk'} {item.kandang_pembesaran}</span> : '-'}
                          </p>
                        </td>
                        <td className="py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {item.jumlah_ekor} <span className="text-[10px] font-normal text-slate-400">ekor</span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => setDeleteTargetId(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors"
                              title="Hapus Data"
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">Hapus Data Anak Ayam?</h3>
            <p className="text-xs text-slate-400 mt-2">Data yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?</p>

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
