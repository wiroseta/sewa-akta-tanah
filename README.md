v1.19.35 RC — PBB ↔ Sertifikat Tanah Coverage Model

Perubahan:
- Bagian Sertifikat Tanah pada PBB didesain ulang agar jelas: jenis hak, nomor, luas sertifikat, alamat, jenis cakupan, luas cakupan PBB, dan keterangan.
- Satu sertifikat boleh terkait dengan lebih dari satu NOP/PBB (many-to-many); ini bukan error.
- Jenis cakupan: Seluruh sertifikat, Sebagian sertifikat, atau Belum diketahui. Luas tidak dipaksa jika dokumen tidak menyebutkannya.
- Menampilkan jumlah relasi PBB lain pada sertifikat yang sama dan total luas cakupan yang sudah tercatat.
- Warning muncul bila luas PBB ini sendiri atau total luas cakupan tercatat lintas PBB melebihi luas sertifikat.
- Relasi tetap disimpan per record PBB dan metadata cakupan tersimpan di pbb_land_titles.
- Semua fitur v1.19.34 tetap dipertahankan.

DEPLOYMENT:
1. Jalankan supabase_latest.sql SEKALI.
2. Upload web v1.19.35 ke GitHub Pages.
3. Tidak perlu deploy ulang Edge Function untuk perubahan ini.
