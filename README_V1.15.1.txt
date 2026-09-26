Sewa & Akta Tanah v1.15.1 — Asset Master Revision

PENTING:
- ASET/TANAH sekarang menjadi master utama.
- Akta sewa (contracts) terhubung melalui contracts.asset_id.
- Dokumen tanah, PBB, dan fasilitas disimpan sebagai tabel tersendiri di bawah aset.
- Setiap dokumen/fasilitas dapat memiliki Google Drive; data lokasi dapat memiliki Google Maps.
- Data kontrak v1.14 dipertahankan dan dibuatkan master aset otomatis saat migration.
- JANGAN jalankan supabase_v115_migration.sql lama.
- Jalankan supabase_v1151_asset_master_migration.sql setelah file website v1.15.1 di-commit.
