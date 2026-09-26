Sewa & Akta Tanah v1.13 — Renewal Detail + Direct Google Drive

Perubahan:
1. Opsi/periode perpanjangan menjadi textarea multiline agar ringkasan klausul terbaca penuh.
2. Halaman sumber AI dibuat lebih presisi; tidak lagi diarahkan mengisi seluruh rentang dokumen.
3. Tombol “Buka Dokumen” ditambahkan di samping Link dokumen / Google Drive.
4. Untuk file Google Drive private, aplikasi menyimpan webViewLink resmi dari metadata Drive bila tersedia.
5. Tombol dokumen membuka file pada tab baru; hak akses Google Drive tetap mengikuti akun Google pengguna.

Pemasangan:
- Upload seluruh isi ZIP ke GitHub Pages dan commit.
- Karena prompt Edge Function berubah, ganti supabase/functions/extract-lease/index.ts di Supabase lalu Deploy updates.
- Tidak ada migrasi database.
