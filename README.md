# Sewa & Akta Tanah — v1.18.9 RC

## Large PDF Browser-Side Low-Memory Fix
- PDF besar tetap dibuka dan dirender di browser/perangkat pengguna, bukan diproses sebagai PDF utuh di Supabase.
- Setiap request AI hanya membawa **1 halaman** yang sudah diperkecil dan dikompresi (maks sisi sekitar 1400 px), menggantikan batch 3 halaman.
- Ada kompresi kedua otomatis untuk scan yang masih terlalu besar.
- Mengurangi penggunaan memory/compute Supabase Edge Function dan mencegah error `not having enough compute resources`.
- Jalur file lokal dan Google Drive PDF besar memakai mesin halaman-per-halaman yang sama.
- Batas file PDF besar tetap 500 MB.
- Progress menampilkan halaman yang sedang disiapkan dan dibaca AI.

## Deploy
1. Replace file website di GitHub dengan isi ZIP ini.
2. Deploy ulang `supabase/functions/extract-lease/index.ts`.
3. Tidak ada SQL baru.
4. Pastikan badge menunjukkan **v1.18.9 RC** sebelum pengujian.


## v1.18.7 RC — AI Property Autofill
- Setelah AI membaca Sertifikat Tanah, field master Properti yang masih kosong otomatis diisi.
- Nama properti dibuat dari lokasi + jenis hak + nomor sertifikat (contoh: `Tanah Genuksari – HGB 120`).
- Alamat properti diambil dari alamat/lokasi bidang.
- Keterangan luas dibuat dari luas tanah sertifikat.
- Google Maps hanya diisi bila hasil AI/dokumen mengandung URL Google Maps yang valid; aplikasi tidak mengarang link.
- Nilai yang sudah diisi manual tidak ditimpa oleh AI.


## v1.18.9 RC — Google Drive Progressive PDF Streaming
- PDF besar Google Drive tidak lagi diunduh penuh menjadi Blob sebelum diproses.
- PDF.js membaca file langsung dari endpoint Google Drive dengan HTTP Range dan chunk 1 MB.
- `disableAutoFetch` aktif agar bagian yang belum diperlukan tidak otomatis diambil.
- Progress menampilkan MB yang telah diminta/dimuat bila informasi progress tersedia.
- Setiap halaman dirender dan dikompresi satu per satu, lalu dikirim ke AI; canvas dibersihkan setelah digunakan.
- Jalur file lokal low-memory dan AI Property Autofill v1.18.7 tetap dipertahankan.
- Tidak ada SQL baru. Edge Function tetap kompatibel; deploy ulang disarankan hanya agar frontend/backend paket tetap sinkron.
