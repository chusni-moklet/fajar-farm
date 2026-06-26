import { supabase, isSupabaseConfigured } from './supabase';

export interface JenisAyam {
  id: string;
  nama_jenis_ayam: string;
  keterangan: string | null;
  created_at: string;
}

export interface Kandang {
  id: string;
  nomor_kandang: string;
  jenis_ayam_jantan: string | null;
  jenis_ayam_betina: string | null;
  jumlah_jantan: number;
  jumlah_betina: number;
  total_populasi: number;
  created_at: string;
}

export interface LaporanTelur {
  id: string;
  tanggal: string;
  nomor_kandang: string;
  periode_laporan: 'Harian' | 'Pekanan';
  jumlah_telur: number;
  created_at: string;
}

export interface Penetasan {
  id: string;
  tanggal_masuk: string;
  nomor_kandang: string | null;
  jumlah_telur_masuk: number;
  tidak_fertil: number;
  menetas: number;
  gagal: number;
  created_at: string;
}

export interface TransaksiKeuangan {
  id: string;
  tanggal: string;
  jenis_transaksi: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  keterangan: string | null;
  nominal: number;
  created_at: string;
}

export interface DashboardStats {
  totalKandang: number;
  totalPopulasi: number;
  totalJantan: number;
  totalBetina: number;
  totalTelur: number;
  recentKandang: Kandang[];
  recentLaporan: LaporanTelur[];
  eggProductionChartData: {
    labels: string[];
    data: number[];
  };
}

// Default Data for local storage fallback
const DEFAULT_JENIS_AYAM: JenisAyam[] = [
  { id: 'JA-1', nama_jenis_ayam: 'Ayam Petelur (Layer)', keterangan: 'Produksi telur harian/pekanan', created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: 'JA-2', nama_jenis_ayam: 'Ayam Pedaging (Broiler)', keterangan: 'Penggemukan potong', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'JA-3', nama_jenis_ayam: 'Ayam Kampung', keterangan: 'Tradisional lokal', created_at: new Date(Date.now() - 3600000 * 12).toISOString() }
];

const DEFAULT_KANDANG: Kandang[] = [
  { id: 'KNDG-1', nomor_kandang: '01', jenis_ayam_jantan: 'Ayam Petelur (Layer)', jenis_ayam_betina: 'Ayam Petelur (Layer)', jumlah_jantan: 20, jumlah_betina: 230, total_populasi: 250, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'KNDG-2', nomor_kandang: '02', jenis_ayam_jantan: 'Ayam Pedaging (Broiler)', jenis_ayam_betina: 'Ayam Pedaging (Broiler)', jumlah_jantan: 150, jumlah_betina: 250, total_populasi: 400, created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'KNDG-3', nomor_kandang: '03', jenis_ayam_jantan: 'Ayam Kampung', jenis_ayam_betina: 'Ayam Kampung', jumlah_jantan: 30, jumlah_betina: 90, total_populasi: 120, created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
];

const getYesterday = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

const DEFAULT_LAPORAN: LaporanTelur[] = [
  { id: 'LPRN-1', tanggal: getYesterday(0), nomor_kandang: '01', periode_laporan: 'Harian', jumlah_telur: 185, created_at: new Date(Date.now() - 60000 * 10).toISOString() },
  { id: 'LPRN-2', tanggal: getYesterday(1), nomor_kandang: '01', periode_laporan: 'Harian', jumlah_telur: 190, created_at: new Date(Date.now() - 86400000 + 60000).toISOString() },
  { id: 'LPRN-3', tanggal: getYesterday(2), nomor_kandang: '03', periode_laporan: 'Harian', jumlah_telur: 45, created_at: new Date(Date.now() - 172800000 + 60000).toISOString() },
  { id: 'LPRN-4', tanggal: getYesterday(3), nomor_kandang: '01', periode_laporan: 'Harian', jumlah_telur: 180, created_at: new Date(Date.now() - 259200000 + 60000).toISOString() },
  { id: 'LPRN-5', tanggal: getYesterday(4), nomor_kandang: '03', periode_laporan: 'Harian', jumlah_telur: 50, created_at: new Date(Date.now() - 345600000 + 60000).toISOString() }
];

const DEFAULT_PENETASAN: Penetasan[] = [];
const DEFAULT_TRANSAKSI: TransaksiKeuangan[] = [];

// Helper functions for Local Storage storage
const getLocalStorageData = <T>(key: string, defaultData: T[]): T[] => {
  if (typeof window === 'undefined') return defaultData;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
};

const setLocalStorageData = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const dbService = {
  // ==========================================
  // JENIS AYAM (MASTER DATA)
  // ==========================================
  async getJenisAyam(): Promise<JenisAyam[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jenis_ayam')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalStorageData<JenisAyam>('ff_jenis_ayam', DEFAULT_JENIS_AYAM);
    }
  },

  async addJenisAyam(nama: string, keterangan: string): Promise<JenisAyam> {
    const trimmedNama = nama.trim();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jenis_ayam')
        .insert([{ nama_jenis_ayam: trimmedNama, keterangan: keterangan || null }])
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error(`Jenis Ayam '${trimmedNama}' sudah terdaftar.`);
        }
        throw error;
      }
      return data;
    } else {
      const list = getLocalStorageData<JenisAyam>('ff_jenis_ayam', DEFAULT_JENIS_AYAM);
      const isExist = list.some(item => item.nama_jenis_ayam.toLowerCase() === trimmedNama.toLowerCase());
      if (isExist) {
        throw new Error(`Jenis Ayam '${trimmedNama}' sudah terdaftar.`);
      }
      const newItem: JenisAyam = {
        id: `JA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        nama_jenis_ayam: trimmedNama,
        keterangan: keterangan || null,
        created_at: new Date().toISOString()
      };
      list.unshift(newItem);
      setLocalStorageData('ff_jenis_ayam', list);
      return newItem;
    }
  },

  async updateJenisAyam(id: string, nama: string, keterangan: string): Promise<JenisAyam> {
    const trimmedNama = nama.trim();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jenis_ayam')
        .update({ nama_jenis_ayam: trimmedNama, keterangan: keterangan || null })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error(`Nama Jenis Ayam '${trimmedNama}' sudah digunakan.`);
        }
        throw error;
      }
      return data;
    } else {
      const list = getLocalStorageData<JenisAyam>('ff_jenis_ayam', DEFAULT_JENIS_AYAM);
      const idx = list.findIndex(j => j.id === id);
      if (idx === -1) throw new Error('Jenis ayam tidak ditemukan.');

      const isConflict = list.some(j => j.id !== id && j.nama_jenis_ayam.toLowerCase() === trimmedNama.toLowerCase());
      if (isConflict) throw new Error(`Nama Jenis Ayam '${trimmedNama}' sudah digunakan.`);

      const oldBreedName = list[idx].nama_jenis_ayam;
      const updatedItem: JenisAyam = {
        ...list[idx],
        nama_jenis_ayam: trimmedNama,
        keterangan: keterangan || null
      };
      list[idx] = updatedItem;
      setLocalStorageData('ff_jenis_ayam', list);

      // Emulate ON UPDATE CASCADE on kandang
      const kandangList = getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
      let kandangChanged = false;
      const updatedKandangList = kandangList.map(k => {
        let changed = false;
        let jantan = k.jenis_ayam_jantan;
        let betina = k.jenis_ayam_betina;
        if (k.jenis_ayam_jantan === oldBreedName) {
          jantan = trimmedNama;
          changed = true;
        }
        if (k.jenis_ayam_betina === oldBreedName) {
          betina = trimmedNama;
          changed = true;
        }
        if (changed) kandangChanged = true;
        return changed ? { ...k, jenis_ayam_jantan: jantan, jenis_ayam_betina: betina } : k;
      });
      if (kandangChanged) {
        setLocalStorageData('ff_kandang', updatedKandangList);
      }

      return updatedItem;
    }
  },

  async deleteJenisAyam(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('jenis_ayam')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = getLocalStorageData<JenisAyam>('ff_jenis_ayam', DEFAULT_JENIS_AYAM);
      const idx = list.findIndex(j => j.id === id);
      if (idx === -1) throw new Error('Jenis ayam tidak ditemukan.');
      
      const breedName = list[idx].nama_jenis_ayam;
      list.splice(idx, 1);
      setLocalStorageData('ff_jenis_ayam', list);

      // Emulate ON DELETE SET NULL on kandang
      const kandangList = getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
      let kandangChanged = false;
      const updatedKandangList = kandangList.map(k => {
        let changed = false;
        let jantan = k.jenis_ayam_jantan;
        let betina = k.jenis_ayam_betina;
        if (k.jenis_ayam_jantan === breedName) {
          jantan = null;
          changed = true;
        }
        if (k.jenis_ayam_betina === breedName) {
          betina = null;
          changed = true;
        }
        if (changed) kandangChanged = true;
        return changed ? { ...k, jenis_ayam_jantan: jantan, jenis_ayam_betina: betina } : k;
      });
      if (kandangChanged) {
        setLocalStorageData('ff_kandang', updatedKandangList);
      }
    }
  },

  // ==========================================
  // KANDANG (MASTER DATA)
  // ==========================================
  async getKandang(): Promise<Kandang[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kandang')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
    }
  },

  async addKandang(payload: Omit<Kandang, 'id' | 'total_populasi' | 'created_at'>): Promise<Kandang> {
    const numKandang = payload.nomor_kandang.trim();
    const sumTotal = payload.jumlah_jantan + payload.jumlah_betina;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kandang')
        .insert([{
          nomor_kandang: numKandang,
          jenis_ayam_jantan: payload.jenis_ayam_jantan || null,
          jenis_ayam_betina: payload.jenis_ayam_betina || null,
          jumlah_jantan: payload.jumlah_jantan,
          jumlah_betina: payload.jumlah_betina
        }])
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error(`Nomor Kandang '${numKandang}' sudah terdaftar.`);
        }
        throw error;
      }
      return data;
    } else {
      const list = getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
      const isExist = list.some(k => k.nomor_kandang.toLowerCase() === numKandang.toLowerCase());
      if (isExist) throw new Error(`Nomor Kandang '${numKandang}' sudah terdaftar.`);

      const newItem: Kandang = {
        id: `KNDG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        nomor_kandang: numKandang,
        jenis_ayam_jantan: payload.jenis_ayam_jantan || null,
        jenis_ayam_betina: payload.jenis_ayam_betina || null,
        jumlah_jantan: payload.jumlah_jantan,
        jumlah_betina: payload.jumlah_betina,
        total_populasi: sumTotal,
        created_at: new Date().toISOString()
      };
      list.unshift(newItem);
      setLocalStorageData('ff_kandang', list);
      return newItem;
    }
  },

  async updateKandang(id: string, payload: Omit<Kandang, 'id' | 'total_populasi' | 'created_at'>): Promise<Kandang> {
    const numKandang = payload.nomor_kandang.trim();
    const sumTotal = payload.jumlah_jantan + payload.jumlah_betina;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kandang')
        .update({
          nomor_kandang: numKandang,
          jenis_ayam_jantan: payload.jenis_ayam_jantan || null,
          jenis_ayam_betina: payload.jenis_ayam_betina || null,
          jumlah_jantan: payload.jumlah_jantan,
          jumlah_betina: payload.jumlah_betina
        })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error(`Nomor Kandang '${numKandang}' sudah digunakan kandang lain.`);
        }
        throw error;
      }
      return data;
    } else {
      const list = getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
      const idx = list.findIndex(k => k.id === id);
      if (idx === -1) throw new Error('Kandang tidak ditemukan.');

      const isConflict = list.some(k => k.id !== id && k.nomor_kandang.toLowerCase() === numKandang.toLowerCase());
      if (isConflict) throw new Error(`Nomor Kandang '${numKandang}' sudah digunakan kandang lain.`);

      const oldNomorKandang = list[idx].nomor_kandang;
      const updatedItem: Kandang = {
        ...list[idx],
        nomor_kandang: numKandang,
        jenis_ayam_jantan: payload.jenis_ayam_jantan || null,
        jenis_ayam_betina: payload.jenis_ayam_betina || null,
        jumlah_jantan: payload.jumlah_jantan,
        jumlah_betina: payload.jumlah_betina,
        total_populasi: sumTotal
      };
      list[idx] = updatedItem;
      setLocalStorageData('ff_kandang', list);

      // Emulate ON UPDATE CASCADE on laporan_telur
      if (oldNomorKandang !== numKandang) {
        const reportList = getLocalStorageData<LaporanTelur>('ff_laporan_telur', DEFAULT_LAPORAN);
        const updatedReports = reportList.map(r => 
          r.nomor_kandang === oldNomorKandang ? { ...r, nomor_kandang: numKandang } : r
        );
        setLocalStorageData('ff_laporan_telur', updatedReports);
      }

      return updatedItem;
    }
  },

  async deleteKandang(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('kandang')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
      const idx = list.findIndex(k => k.id === id);
      if (idx === -1) throw new Error('Kandang tidak ditemukan.');

      const nomorKandang = list[idx].nomor_kandang;
      list.splice(idx, 1);
      setLocalStorageData('ff_kandang', list);

      // Emulate ON DELETE CASCADE on laporan_telur
      const reportList = getLocalStorageData<LaporanTelur>('ff_laporan_telur', DEFAULT_LAPORAN);
      const filteredReports = reportList.filter(r => r.nomor_kandang !== nomorKandang);
      setLocalStorageData('ff_laporan_telur', filteredReports);
    }
  },

  // ==========================================
  // LAPORAN (INPUT TELUR)
  // ==========================================
  async getLaporan(): Promise<LaporanTelur[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('laporan_telur')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalStorageData<LaporanTelur>('ff_laporan_telur', DEFAULT_LAPORAN);
    }
  },

  async addLaporan(payload: Omit<LaporanTelur, 'id' | 'created_at'>): Promise<LaporanTelur> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('laporan_telur')
        .insert([{
          tanggal: payload.tanggal,
          nomor_kandang: payload.nomor_kandang,
          periode_laporan: payload.periode_laporan,
          jumlah_telur: payload.jumlah_telur
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocalStorageData<LaporanTelur>('ff_laporan_telur', DEFAULT_LAPORAN);
      const newItem: LaporanTelur = {
        id: `LPRN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        tanggal: payload.tanggal,
        nomor_kandang: payload.nomor_kandang,
        periode_laporan: payload.periode_laporan,
        jumlah_telur: payload.jumlah_telur,
        created_at: new Date().toISOString()
      };
      list.unshift(newItem);
      setLocalStorageData('ff_laporan_telur', list);
      return newItem;
    }
  },

  async deleteLaporan(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('laporan_telur')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = getLocalStorageData<LaporanTelur>('ff_laporan_telur', DEFAULT_LAPORAN);
      const idx = list.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Laporan tidak ditemukan.');
      list.splice(idx, 1);
      setLocalStorageData('ff_laporan_telur', list);
    }
  },

  // ==========================================
  // PENETASAN
  // ==========================================
  async getPenetasan(): Promise<Penetasan[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('penetasan')
        .select('*')
        .order('tanggal_masuk', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalStorageData<Penetasan>('ff_penetasan', DEFAULT_PENETASAN);
    }
  },

  async addPenetasan(payload: Omit<Penetasan, 'id' | 'created_at'>): Promise<Penetasan> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('penetasan')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocalStorageData<Penetasan>('ff_penetasan', DEFAULT_PENETASAN);
      const newItem: Penetasan = {
        ...payload,
        id: `PNT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        created_at: new Date().toISOString()
      };
      list.unshift(newItem);
      setLocalStorageData('ff_penetasan', list);
      return newItem;
    }
  },

  async updatePenetasan(id: string, payload: Omit<Penetasan, 'id' | 'created_at'>): Promise<Penetasan> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('penetasan')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocalStorageData<Penetasan>('ff_penetasan', DEFAULT_PENETASAN);
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Data penetasan tidak ditemukan.');
      const updatedItem: Penetasan = { ...list[idx], ...payload };
      list[idx] = updatedItem;
      setLocalStorageData('ff_penetasan', list);
      return updatedItem;
    }
  },

  async deletePenetasan(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('penetasan')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = getLocalStorageData<Penetasan>('ff_penetasan', DEFAULT_PENETASAN);
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Data penetasan tidak ditemukan.');
      list.splice(idx, 1);
      setLocalStorageData('ff_penetasan', list);
    }
  },

  // ==========================================
  // TRANSAKSI KEUANGAN
  // ==========================================
  async getTransaksi(): Promise<TransaksiKeuangan[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transaksi_keuangan')
        .select('*')
        .order('tanggal', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalStorageData<TransaksiKeuangan>('ff_transaksi', DEFAULT_TRANSAKSI);
    }
  },

  async addTransaksi(payload: Omit<TransaksiKeuangan, 'id' | 'created_at'>): Promise<TransaksiKeuangan> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transaksi_keuangan')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocalStorageData<TransaksiKeuangan>('ff_transaksi', DEFAULT_TRANSAKSI);
      const newItem: TransaksiKeuangan = {
        ...payload,
        id: `TRX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        created_at: new Date().toISOString()
      };
      list.unshift(newItem);
      setLocalStorageData('ff_transaksi', list);
      return newItem;
    }
  },

  async updateTransaksi(id: string, payload: Omit<TransaksiKeuangan, 'id' | 'created_at'>): Promise<TransaksiKeuangan> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transaksi_keuangan')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocalStorageData<TransaksiKeuangan>('ff_transaksi', DEFAULT_TRANSAKSI);
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Data transaksi tidak ditemukan.');
      const updatedItem: TransaksiKeuangan = { ...list[idx], ...payload };
      list[idx] = updatedItem;
      setLocalStorageData('ff_transaksi', list);
      return updatedItem;
    }
  },

  async deleteTransaksi(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('transaksi_keuangan')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = getLocalStorageData<TransaksiKeuangan>('ff_transaksi', DEFAULT_TRANSAKSI);
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Data transaksi tidak ditemukan.');
      list.splice(idx, 1);
      setLocalStorageData('ff_transaksi', list);
    }
  },

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    let kandangList: Kandang[] = [];
    let laporanList: LaporanTelur[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: kData, error: kErr } = await supabase.from('kandang').select('*');
      if (kErr) throw kErr;
      kandangList = kData || [];

      const { data: lData, error: lErr } = await supabase.from('laporan_telur').select('*');
      if (lErr) throw lErr;
      laporanList = lData || [];
    } else {
      kandangList = getLocalStorageData<Kandang>('ff_kandang', DEFAULT_KANDANG);
      laporanList = getLocalStorageData<LaporanTelur>('ff_laporan_telur', DEFAULT_LAPORAN);
    }

    let totalPopulasi = 0;
    let totalJantan = 0;
    let totalBetina = 0;
    let totalTelur = 0;

    kandangList.forEach(k => {
      totalPopulasi += k.total_populasi || 0;
      totalJantan += k.jumlah_jantan || 0;
      totalBetina += k.jumlah_betina || 0;
    });

    laporanList.forEach(l => {
      totalTelur += l.jumlah_telur || 0;
    });

    // Recent items
    // Sort kandang by created_at desc (which list already is, but we sort explicitly to be sure)
    const sortedKandang = [...kandangList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const sortedLaporan = [...laporanList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Egg production chart data for the last 7 entries (sorted chronologically oldest to newest)
    const chartList = [...laporanList]
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime() || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-7);

    const labels = chartList.map(item => `Kandang ${item.nomor_kandang} (${item.tanggal})`);
    const data = chartList.map(item => item.jumlah_telur);

    return {
      totalKandang: kandangList.length,
      totalPopulasi,
      totalJantan,
      totalBetina,
      totalTelur,
      recentKandang: sortedKandang.slice(0, 5),
      recentLaporan: sortedLaporan.slice(0, 5),
      eggProductionChartData: {
        labels,
        data
      }
    };
  }
};
