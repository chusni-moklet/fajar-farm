'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, JenisAyam } from '@/lib/dbService';
import { useToast } from '@/context/ToastContext';
import { Tags, Trash2, Edit3, Search, PlusCircle, XCircle } from 'lucide-react';

export default function JenisAyamPage() {
  const { showToast } = useToast();

  // State
  const [jenisAyamList, setJenisAyamList] = useState<JenisAyam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [namaJenisAyam, setNamaJenisAyam] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBreeds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbService.getJenisAyam();
      setJenisAyamList(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data jenis ayam.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  const resetForm = () => {
    setEditId(null);
    setNamaJenisAyam('');
    setKeterangan('');
  };

  const handleEdit = (breed: JenisAyam) => {
    setEditId(breed.id);
    setNamaJenisAyam(breed.nama_jenis_ayam);
    setKeterangan(breed.keterangan || '');
    
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenisAyam.trim()) {
      showToast('Nama Jenis Ayam tidak boleh kosong.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await dbService.updateJenisAyam(editId, namaJenisAyam.trim(), keterangan);
        showToast(`Jenis ayam '${namaJenisAyam.trim()}' berhasil diperbarui.`, 'success');
      } else {
        await dbService.addJenisAyam(namaJenisAyam.trim(), keterangan);
        showToast(`Jenis ayam '${namaJenisAyam.trim()}' berhasil ditambahkan.`, 'success');
      }
      resetForm();
      const data = await dbService.getJenisAyam();
      setJenisAyamList(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan jenis ayam.', 'error');
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
      await dbService.deleteJenisAyam(deleteTargetId);
      showToast('Jenis ayam berhasil dihapus.', 'success');
      setDeleteTargetId(null);
      const data = await dbService.getJenisAyam();
      setJenisAyamList(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus jenis ayam.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBreeds = jenisAyamList.filter(breed => {
    const q = searchQuery.toLowerCase();
    return (
      breed.nama_jenis_ayam.toLowerCase().includes(q) ||
      (breed.keterangan && breed.keterangan.toLowerCase().includes(q))
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
              {editId ? 'Edit Jenis Ayam' : 'Tambah Jenis Ayam'}
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
            {/* Nama Jenis Ayam */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Nama Jenis Ayam
              </label>
              <input
                type="text"
                required
                value={namaJenisAyam}
                onChange={(e) => setNamaJenisAyam(e.target.value)}
                placeholder="Contoh: Ayam Broiler Super, Ayam Layer Coklat"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none dark:text-white"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Keterangan
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Keterangan singkat mengenai tipe/jenis ayam ini..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/50 text-xs focus:border-emerald-500 focus:outline-none h-28 resize-none dark:text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-md hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 focus:outline-none flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              <span>Simpan Jenis Ayam</span>
            </button>
          </form>
        </div>

        {/* LIST CONTAINER */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase flex items-center">
              <Tags className="w-5 h-5 text-emerald-500 mr-2" />
              Kelola Master Data Jenis Ayam
            </h3>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Jenis Ayam..."
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
          ) : filteredBreeds.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center">
              <Tags className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Jenis Ayam Belum Ada</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Daftarkan jenis ayam pertama Anda terlebih dahulu melalui form disamping.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">No</th>
                    <th className="pb-3">Nama Jenis Ayam</th>
                    <th className="pb-3">Keterangan</th>
                    <th className="pb-3 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                  {filteredBreeds.map((breed, index) => (
                    <tr key={breed.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="py-4 font-bold text-slate-700 dark:text-slate-200">
                        {breed.nama_jenis_ayam}
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {breed.keterangan || '-'}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(breed)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(breed.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">Hapus Jenis Ayam?</h3>
            <p className="text-xs text-slate-400 mt-2">Menghapus jenis ayam akan melepaskan referensi silangan di data kandang yang terkait (menjadi kosong / SET NULL).</p>

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
