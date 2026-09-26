Sewa & Akta Tanah v1.15.3 — Property UI Correction
Baseline: v1.15.2 + database migration v1.15.2 already executed.

Perbaikan:
- Master utama ditampilkan sebagai Properti/Lokasi, bukan campuran Aset/Tanah/Bangunan.
- Sertifikat/bidang tanah disimpan di tabel land_titles.
- Bangunan/gudang/gedung disimpan di tabel buildings.
- Denah tanah/surat ukur tersimpan per sertifikat (map_plan_url).
- Denah bangunan tersimpan per bangunan (floor_plan_url).
- Fasilitas dihapus dari editor properti karena fasilitas melekat ke Akta Sewa.
- PBB tidak lagi diedit sebagai anak langsung properti karena relasinya many-to-many dengan tanah/bangunan.
- Tidak memerlukan migration SQL baru. Database tetap schema v1.15.2.
- Tahap berikutnya: UI relasi Akta Sewa ↔ beberapa sertifikat/bangunan/PBB + fasilitas per Akta Sewa, dan editor PBB lengkap.
