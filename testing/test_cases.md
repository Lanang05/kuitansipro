# Dokumen Rencana Pengujian Aplikasi KuitansiPro (QA Test Suite)

Dokumen ini berisi 20+ skenario pengujian fungsional dan teknis untuk pengujian ETS/UAT (termasuk kompatibilitas locator Katalon Studio).

| ID Test | Tujuan Pengujian | Prasyarat | Data Pengujian | Langkah-langkah | Hasil yang Diharapkan | Status |
|---|---|---|---|---|---|---|
| TC-01 | Login pengguna valid | Akun terdaftar di Supabase | email: user@test.com, pass: 123456 | 1. Buka /login<br>2. Isi email & password<br>3. Klik tombol Masuk | Berhasil masuk ke /dashboard | PASS |
| TC-02 | Login password salah | Akun terdaftar | email: user@test.com, pass: wrongpass | 1. Isi email & pass salah<br>2. Klik Masuk | Menampilkan alert error "Email/password salah" | PASS |
| TC-03 | Validasi nama pelanggan kosong pada kuitansi | Sudah login | Form kuitansi kosong | 1. Masuk /receipts/new<br>2. Biarkan nama pelanggan kosong<br>3. Klik Terbitkan | Menampilkan peringatan wajib isi | PASS |
| TC-04 | Hitung otomatis Subtotal item | Sudah login | Qty: 3, Price: 50.000 | 1. Input Qty 3, Price 50000 | Subtotal terhitung otomatis Rp150.000 | PASS |
| TC-05 | Hitung otomatis Diskon & Pajak | Item total Rp100.000 | Diskon: 10.000, Pajak: 11% | 1. Input diskon 10000, Pajak 11 | Tax = (100k-10k)*11% = Rp9.900. Total = Rp99.900 | PASS |
| TC-06 | Buat kuitansi baru status LUNAS | Data pelanggan & produk ada | Bayar = Total Tagihan | 1. Isi item total Rp500.000<br>2. Input bayar Rp500.000<br>3. Simpan | Kuitansi tersimpan dengan status PAID | PASS |
| TC-07 | Keunikan Nomor Kuitansi | System generator | KWT-2026-XXXXXX | 1. Buat 2 kuitansi berturut-turut | Nomor kuitansi berbeda & unik | PASS |
| TC-08 | Simpan kuitansi sebagai DRAFT | Form kuitansi terisi | Any input | 1. Klik Simpan sebagai Draft | Kuitansi tersimpan dengan status DRAFT | PASS |
| TC-09 | Pencarian kuitansi berdasarkan nama | Terdapat kuitansi "Nusantara" | Keyword: "Nusantara" | 1. Buka /receipts<br>2. Ketik "Nusantara" pada input cari | Tabel memfilter hanya kuitansi terkait | PASS |
| TC-10 | Filter status kuitansi | Ada kuitansi LUNAS & UNPAID | Select filter: UNPAID | 1. Ubah dropdown filter ke "Belum Dibayar" | Hanya menampilkan kuitansi UNPAID | PASS |
| TC-11 | Catat pembayaran lanjutan (Partial to Paid) | Kuitansi sisa tagihan Rp200.000 | Nominal: Rp200.000 | 1. Buka detail kuitansi<br>2. Klik Catat Pembayaran<br>3. Input 200000 & simpan | Status otomatis berubah menjadi PAID | PASS |
| TC-12 | Cetak Kuitansi (Print view) | Pada halaman detail kuitansi | - | 1. Klik tombol Cetak | Membuka print preview browser bersih tanpa sidebar | PASS |
| TC-13 | Unduh Kuitansi PDF | Pada halaman detail kuitansi | - | 1. Klik Unduh PDF | File .pdf diunduh dengan nama sesuai nomor kuitansi | PASS |
| TC-14 | Tambah Pelanggan Baru | Halaman /customers | Nama: CV Mandiri, Phone: 08123 | 1. Klik Tambah Pelanggan<br>2. Isi form & simpan | Data muncul pada tabel pelanggan | PASS |
| TC-15 | Tambah Produk Katalog | Halaman /products | Nama: Jasa Web, Harga: 1000000 | 1. Klik Tambah Item<br>2. Isi form & simpan | Item dapat dipilih saat membuat kuitansi | PASS |
| TC-16 | Ekspor Laporan CSV | Halaman /reports | Ada data transaksi | 1. Klik Ekspor CSV | File .csv diunduh lengkap dengan header & UTF-8 BOM | PASS |
| TC-17 | Pembaruan Profil Usaha | Halaman /profile | Business Name: "PT Maju Bersama" | 1. Ubah nama usaha<br>2. Klik Simpan Profil | Nama usaha di header kuitansi diperbarui | PASS |
| TC-18 | Proteksi Rute Terkunci | Sesi logout | Akses /dashboard | 1. Logout<br>2. Buka URL /dashboard langsung | Di-redirect otomatis ke /login | PASS |
| TC-19 | Isolasi Data Antar Pengguna (RLS) | 2 akun terpisah | User A vs User B | 1. Login User A & buat kuitansi<br>2. Login User B | User B tidak dapat melihat kuitansi User A | PASS |
| TC-20 | Responsivitas Tampilan Mobile | Ukuran layar < 768px | viewport mobile | 1. Buka aplikasi di layar ponsel | Layout menyesuaikan tanpa overflow mendatar | PASS |
