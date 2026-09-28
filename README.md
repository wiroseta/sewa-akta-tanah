# Sewa & Akta Tanah — v1.17.9 RC Save / Relationship Schema Fix

## Perubahan
- Mempertahankan seluruh fitur dan normalisasi Indonesia dari v1.17.8.
- Memperbaiki kegagalan Simpan Akta ketika app mengakses `lease_land_titles`, `lease_buildings`, `lease_pbb`, atau `lease_facilities`.
- Menambahkan migration Supabase idempotent untuk membuat tabel relasi yang memang dipakai `app.js`.
- Migration menyalin relasi dari tabel legacy `contract_land_titles`, `contract_buildings`, `contract_pbb`, dan `facilities` bila tersedia.
- Menambahkan RLS workspace-aware untuk Administrator dan Document Manager.
- Meminta PostgREST reload schema setelah migration.

## WAJIB sebelum tes Simpan
1. Buka Supabase → SQL Editor.
2. Jalankan seluruh isi `supabase_v1179_lease_relationship_tables_fix.sql`.
3. Pastikan hasilnya sukses.
4. Upload/deploy file aplikasi v1.17.9 ke GitHub Pages.
5. Refresh halaman lalu tes Simpan Akta tanpa scan AI ulang.

Migration aman dijalankan ulang dan tidak menghapus data lama.
