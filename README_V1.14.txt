Sewa & Akta Tanah v1.14 — Google Maps Location

Perubahan:
- Menambahkan field Lokasi Google Maps pada setiap kontrak/aset.
- Tombol 'Buka di Google Maps' membuka titik lokasi di tab baru.
- Link Google Maps disimpan di Supabase dan tetap tersedia saat kontrak dibuka kembali.
- Alamat aset dari akta tetap terpisah dari titik Google Maps.
- Mempertahankan seluruh fitur v1.13, termasuk Buka Dokumen Google Drive dan ringkasan perpanjangan.

SETUP WAJIB SEKALI:
Jalankan supabase_v114_migration.sql di Supabase SQL Editor sebelum menyimpan data dengan field Google Maps.

Edge Function extract-lease tidak berubah dari v1.13; tidak perlu deploy ulang jika v1.13 sudah dideploy.
