SEWA & AKTA TANAH v1.7

1. Login v1.6 dipertahankan.
2. Jalankan supabase_v17_migration.sql SATU KALI di Supabase SQL Editor.
3. Upload seluruh file v1.7 ke GitHub (config.js tetap memakai project URL dan publishable key yang sudah bekerja).
4. Form kontrak kini mendukung banyak kontak, rekening, HGB/sertifikat, pembayaran, klausul, status verifikasi, dan halaman sumber.
5. Service Worker tetap dinonaktifkan sementara demi stabilitas login.

Catatan keamanan: jangan pernah menaruh Supabase secret/service-role key di GitHub.
