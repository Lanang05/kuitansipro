# KuitansiPro — Smart Receipt Management System

Aplikasi web manajemen kuitansi digital profesional, lengkap, dan siap deploy untuk tugas ETS Bisnis Digital.

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi:** Pendaftaran dan login aman terintegrasi dengan Supabase Auth + Row Level Security (RLS).
- **Dashboard Statistik Real-Time:** Menampilkan total kuitansi, omset transaksi, penerimaan tunai, piutang, serta grafik Recharts.
- **Manajemen Kuitansi Kompleks:**
  - Penomoran otomatis unik (`KWT-2026-XXXXXX`).
  - Perhitungan otomatis subtotal, diskon, pajak (%), biaya tambahan, dan sisa tagihan.
  - Multi status: `DRAFT`, `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`.
- **Modul Pencatatan Pembayaran:** Mendukung cicilan / pembayaran bertahap dengan pembaharuan status otomatis.
- **Template Cetak & PDF Resmi:**
  - Siap cetak A4 dengan CSS print bersih (tanpa sidebar/navigasi).
  - Generator PDF native berbasis jsPDF & html2canvas.
  - Fitur **Terbilang** otomatis dalam Bahasa Indonesia.
- **Katalog Pelanggan & Produk:** Snapshot harga otomatis saat transaksi dibuat.
- **Laporan & Ekspor CSV:** Ekspor laporan bertipe CSV yang aman dari formula injection.
- **Profil Usaha Custom:** Ubah nama bisnis, logo, alamat, dan pesan footer kuitansi.

---

## 🛠️ Stack Teknologi

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Ikon:** Lucide React
- **Routing:** React Router DOM v6
- **Grafik:** Recharts
- **Database & Auth:** Supabase PostgreSQL & Supabase Auth
- **PDF & Export:** jsPDF + html2canvas

---

## 💻 Panduan Instalasi Lokal

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/username/kuitansipro.git
   cd kuitansipro
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable:**
   Buat file `.env` di folder utama:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Setup Database Supabase:**
   - Buka SQL Editor di Dashboard Supabase Anda.
   - Salin dan jalankan seluruh isi skrip SQL dari file `supabase/migrations/01_init_schema.sql`.

5. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Akses di browser: `http://localhost:5173`

---

## 🌐 Panduan Deployment ke Vercel

1. Push kode ke repositori GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com) dan impor repositori tersebut.
3. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Klik **Deploy**. Aplikasi SPA React akan live di URL publik Vercel!
