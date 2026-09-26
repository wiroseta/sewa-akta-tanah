# Sewa & Akta Tanah v1.15.2 — Property Relationship Model

Jangan gunakan migration v1.15 atau v1.15.1.

Model final:
- Properti/Lokasi adalah wadah lokasi, bukan pemilik semua relasi.
- Akta/Sertifikat Tanah berdiri sendiri dan satu lokasi dapat memiliki beberapa sertifikat. Setiap sertifikat dapat menyimpan denah tanah/surat ukur, Google Drive, dan Google Maps.
- Bangunan/Gudang/Gedung berdiri sendiri dan dapat terkait dengan beberapa sertifikat tanah.
- Satu Akta Sewa dapat terkait dengan beberapa sertifikat tanah dan beberapa bangunan, serta memiliki Denah Area Sewa sendiri.
- PBB per tahun dapat terkait dengan beberapa sertifikat tanah dan beberapa bangunan; dapat juga hanya tanah. Satu Akta Sewa dapat terkait dengan beberapa PBB.
- PBB menyimpan luas tanah, luas bangunan, NJOP tanah/m2 dan total, NJOP bangunan/m2 dan total, total NJOP, PBB terutang, jatuh tempo, status/tanggal bayar, SPPT dan bukti bayar Google Drive.
- Fasilitas (PLN/Telkom/PDAM/dll.) terkait ke Akta Sewa, bukan ke sertifikat tanah.
- Dokumen penting mendukung Google Drive; data lokasi mendukung Google Maps bila relevan.

Migration: supabase_v1152_property_relationship_migration.sql
