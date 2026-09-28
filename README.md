# Sewa & Akta Tanah — v1.17.6 RC

## Indonesian AI Normalization
- Hasil pembacaan AI dinormalisasi sebelum dimasukkan ke form.
- Tanggal hasil AI menggunakan format Indonesia **DD-MM-YYYY**.
- Nilai uang pada field finansial dan teks klausul menggunakan **Rp** dengan pemisah ribuan titik.
- Luas dalam teks dinormalisasi ke format Indonesia dan simbol **m²**.
- Berlaku untuk Akta Sewa, Klausul Penting, pembayaran, Sertifikat/Hak Tanah, dan PBB.
- Normalisasi dilakukan di sisi aplikasi; pengguna tetap harus memeriksa hasil AI terhadap dokumen sumber sebelum menyimpan.

## Supabase update
**TIDAK DIPERLUKAN untuk v1.17.6.** Tidak ada perubahan schema/database.

`supabase_schema_history.sql` hanya arsip/referensi dan **jangan dijalankan untuk update normal**.

# Sewa & Akta Tanah — v1.17.5 RC

## Compact Dashboard & Unified Menu
- Menu **Users / Backup / Keluar** dipindahkan ke dropdown **••• Menu** pada layar mobile.
- Tombol utama **Properti / Lokasi, PBB, + Akta Sewa** tetap terlihat.
- Kartu ringkasan dibuat lebih kecil dalam grid 3 kolom agar lebih banyak informasi terlihat tanpa scroll.
- Status OpenAI/Scan AI juga dibuat compact.
- Desktop tetap mempertahankan akses toolbar yang luas.

## Supabase update
**TIDAK DIPERLUKAN untuk v1.17.5.** Ini hanya perubahan UI/CSS/JavaScript.

`supabase_schema_history.sql` hanya arsip/referensi dan **jangan dijalankan untuk update normal**.


## v1.17.5 RC
- Dashboard desktop dan iPhone dibuat lebih ringkas.
- Lima statistik utama menjadi satu baris compact pada desktop.
- Keluar, Users, dan Backup dipindahkan ke menu dropdown pada desktop dan mobile.
- Properti/Lokasi, PBB, dan + Akta Sewa tetap terlihat langsung.
- Supabase update: TIDAK DIPERLUKAN.
