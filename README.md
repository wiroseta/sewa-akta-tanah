# Sewa & Akta Tanah Manager v1.1 — Login Supabase

Frontend dapat disimpan di repository GitHub public. Login memakai Supabase Auth; password tidak disimpan di GitHub.

## Setup singkat
1. Buat project di Supabase.
2. Authentication > Users: buat user pemilik aplikasi (email + password).
3. Project Settings/API: salin Project URL dan Publishable key (atau anon key lama) ke `config.js`.
4. Upload semua file ke GitHub repository dan aktifkan GitHub Pages.
5. Di Supabase Authentication > URL Configuration, masukkan URL GitHub Pages sebagai Site URL / allowed redirect URL bila diperlukan.

## Penting
- Jangan pernah masukkan Supabase secret/service-role key atau OpenAI API key ke repository/frontend.
- Versi ini menambahkan login sungguhan, tetapi data kontrak masih tersimpan di localStorage browser per user ID. Jangan gunakan sebagai penyimpanan final dokumen hukum.
- Tahap berikutnya: pindahkan data ke tabel Supabase dengan Row Level Security (RLS), private storage untuk dokumen, dan Edge Function untuk OpenAI.


## v1.8.3
Validasi total jadwal pembayaran dengan ringkasan nilai sewa, total termin, selisih, dan persentase terjadwal.


## Riwayat Versi / Changelog

### v1.15.6
- Form Sertifikat Tanah memakai label permanen agar arti setiap field tetap terlihat setelah AI mengisi data.
- Field dikelompokkan menjadi Data Sertifikat, Surat Ukur, Dokumen & Lokasi, dan Baca Otomatis dengan AI.
- Tombol AI diperjelas menjadi Baca PDF/Foto Sertifikat dan Baca Sertifikat dari Google Drive.
- Tanggal masa berlaku dan tanggal Surat Ukur tetap opsional dan tidak dipaksa sama dengan tanggal lain.
- Perbaikan penyimpanan nama pemegang hak, nomor Surat Ukur, dan tanggal Surat Ukur ke database.
- PBB tetap menggunakan label permanen untuk setiap field dan luas PBB tetap independen dari Sertifikat/Akta Sewa.

### v1.15.5
- AI scan/upload PDF/foto dan Google Drive private untuk Sertifikat Tanah.
- AI scan/upload PDF/foto dan Google Drive private untuk SPPT PBB.
- Luas Sertifikat Tanah, Akta Sewa, dan PBB disimpan independen sesuai dokumen sumber dan tidak dipaksa sama.
- Akta Sewa memiliki luas tanah dan luas bangunan menurut Akta Sewa sendiri.
- Sertifikat menyimpan pemegang hak, nomor/tanggal surat ukur, dan masa berlaku opsional.
- PBB menyimpan nama wajib pajak dan alamat objek pajak.
- Tanggal berakhir sertifikat tidak diisi otomatis bila tidak tersedia.
- Mulai versi ini hanya satu README.md digunakan untuk dokumentasi dan changelog.
