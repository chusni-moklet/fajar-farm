-- 1. Tabel Master Jenis Ayam
CREATE TABLE jenis_ayam (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_jenis_ayam VARCHAR(100) UNIQUE NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tambahkan data awal (default values)
INSERT INTO jenis_ayam (nama_jenis_ayam, keterangan) VALUES
('Ayam Petelur (Layer)', 'Produksi telur harian/pekanan'),
('Ayam Pedaging (Broiler)', 'Penggemukan potong'),
('Ayam Kampung', 'Tradisional lokal');

-- 2. Tabel Master Kandang
CREATE TABLE kandang (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomor_kandang VARCHAR(50) UNIQUE NOT NULL,
    tipe_kandang VARCHAR(50) DEFAULT 'Induk' CHECK (tipe_kandang IN ('Induk', 'DOC', 'Pembesaran', 'Pullet')),
    jenis_ayam_jantan VARCHAR(100) REFERENCES jenis_ayam(nama_jenis_ayam) ON UPDATE CASCADE ON DELETE SET NULL,
    jenis_ayam_betina VARCHAR(100) REFERENCES jenis_ayam(nama_jenis_ayam) ON UPDATE CASCADE ON DELETE SET NULL,
    jumlah_jantan INT DEFAULT 0 CHECK (jumlah_jantan >= 0),
    jumlah_betina INT DEFAULT 0 CHECK (jumlah_betina >= 0),
    total_populasi INT GENERATED ALWAYS AS (jumlah_jantan + jumlah_betina) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Laporan Produksi Telur
CREATE TABLE laporan_telur (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    nomor_kandang VARCHAR(50) REFERENCES kandang(nomor_kandang) ON UPDATE CASCADE ON DELETE CASCADE,
    periode_laporan VARCHAR(20) NOT NULL CHECK (periode_laporan IN ('Harian', 'Pekanan')),
    jumlah_telur INT NOT NULL CHECK (jumlah_telur >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing untuk optimasi query dashboard
CREATE INDEX idx_laporan_telur_tanggal ON laporan_telur(tanggal);
CREATE INDEX idx_laporan_telur_kandang ON laporan_telur(nomor_kandang);

-- 4. Tabel Penetasan
CREATE TABLE penetasan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
    nomor_kandang VARCHAR(50) REFERENCES kandang(nomor_kandang) ON UPDATE CASCADE ON DELETE SET NULL,
    jumlah_telur_masuk INT NOT NULL CHECK (jumlah_telur_masuk >= 0),
    tidak_fertil INT DEFAULT 0 CHECK (tidak_fertil >= 0),
    menetas INT DEFAULT 0 CHECK (menetas >= 0),
    gagal INT DEFAULT 0 CHECK (gagal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Transaksi Keuangan
CREATE TABLE transaksi_keuangan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis_transaksi VARCHAR(20) NOT NULL CHECK (jenis_transaksi IN ('Pemasukan', 'Pengeluaran')),
    kategori VARCHAR(50) NOT NULL,
    keterangan TEXT,
    nominal BIGINT NOT NULL CHECK (nominal >= 0),
    nomor_kandang VARCHAR(50) REFERENCES kandang(nomor_kandang) ON UPDATE CASCADE ON DELETE SET NULL,
    kuantitas INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabel Anak Ayam
CREATE TABLE anak_ayam (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal_tetas DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis_ayam VARCHAR(100) REFERENCES jenis_ayam(nama_jenis_ayam) ON UPDATE CASCADE ON DELETE SET NULL,
    kandang_pembesaran VARCHAR(50) REFERENCES kandang(nomor_kandang) ON UPDATE CASCADE ON DELETE SET NULL,
    jumlah_ekor INT NOT NULL CHECK (jumlah_ekor >= 0),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Menonaktifkan Row Level Security (RLS) sementara agar aplikasi bisa bebas melakukan CRUD
-- (Jika ingin mengamankan aplikasi, RLS bisa diaktifkan kembali nanti dan dikonfigurasi policynya)
ALTER TABLE jenis_ayam DISABLE ROW LEVEL SECURITY;
ALTER TABLE kandang DISABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_telur DISABLE ROW LEVEL SECURITY;
ALTER TABLE penetasan DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_keuangan DISABLE ROW LEVEL SECURITY;
ALTER TABLE anak_ayam DISABLE ROW LEVEL SECURITY;
