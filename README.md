# Sewa & Akta Tanah — v1.19.3 RC

## Universal 500 MB AI Document Reader

Baseline: v1.18.9 RC.

Perubahan utama:
- Jalur AI Akta Sewa sekarang memakai mesin dokumen universal yang sama dengan Sertifikat Tanah dan PBB.
- PDF lokal hingga 500 MB: PDF besar dirender per halaman di browser, dikompresi, lalu dikirim satu halaman per request ke Edge Function/OpenAI.
- PDF Google Drive hingga 500 MB: file besar memakai progressive/range loading melalui PDF.js dan diproses per halaman; tidak dikirim utuh ke Edge Function.
- Batas lama 18 MB / 45 MB di alur Akta Sewa dihapus.
- Sertifikat Tanah dan PBB tetap memakai mekanisme universal yang sama.
- Semua fitur v1.18.9 (HGB recognition, auto-name sync, property autofill) dipertahankan.

## Deploy
1. Replace file web di GitHub dengan isi ZIP ini.
2. Deploy ulang `supabase/functions/extract-lease/index.ts`.
3. Tidak ada SQL baru.
4. Hard refresh dan pastikan badge `v1.19.3 RC`.

Catatan: batas 500 MB adalah ukuran file input. PDF besar diproses per halaman agar Edge Function tidak menerima file ratusan MB sekaligus.


## v1.19.1 — Document History & AI Comparison
- Riwayat Akta Sewa: versi lama disimpan sebagai snapshot sebelum perubahan dan versi baru setelah disimpan.
- Riwayat Sertifikat Tanah per properti: snapshot sebelum/sesudah perubahan HGB/SHM/dll.
- Tombol **Riwayat & Bandingkan** pada Akta Sewa dan Sertifikat Tanah.
- AI membandingkan dua versi dan menandai perubahan, klausul lama yang tidak ditemukan di dokumen baru, serta klausul yang secara eksplisit disebut tetap berlaku.
- Pencarian **Cari Klausul & Riwayat** mencakup versi lama.
- Jalankan `supabase_v1191_document_history_ai_comparison.sql` sekali, lalu deploy ulang Edge Function `extract-lease`.

Catatan hukum: status “tidak ditemukan di dokumen baru” tidak dianggap otomatis masih berlaku; aplikasi menandainya untuk verifikasi.

## v1.19.2 — Akta Lama / Dokumen Historis
- Akta aktif tetap disimpan di `contracts` dan tidak ditimpa dokumen lama.
- Tombol `+ Akta Lama / Dokumen Historis` menyimpan Akta Lama, Addendum, Perpanjangan, atau Akta Pengganti ke tabel `lease_documents`.
- Pembacaan AI memakai reader universal hingga 500 MB yang sama dengan Akta aktif.
- Dokumen historis muncul pada `Riwayat & Bandingkan Akta` sebagai rangkaian dokumen hukum.
- Jalankan `supabase_v1192_historical_lease_documents.sql` setelah SQL v1.19.1.


## v1.19.3 — Status AI Dokumen Historis
- Riwayat Akta menampilkan status **Sudah dibaca AI / Belum dibaca AI**.
- Dokumen historis baru menyimpan `ai_status` dan `ai_read_at`.
- Hasil `extracted_data` lama tetap dikenali sebagai sudah dibaca AI, sehingga tidak perlu scan ulang.
- Timestamp pembacaan AI ditampilkan bila tersedia.
- APP_BUILD, badge, dan README diselaraskan ke v1.19.3 RC.
- Jalankan `supabase_v1193_ai_document_status.sql` setelah migrasi v1.19.2.


## v1.19.4 — Historical Universal 500 MB Reader Lock
- Dokumen historis dipastikan memakai `invokeDocumentAI` / `invokeDriveAI` yang sama dengan Akta Sewa, PBB, dan Akta Tanah.
- File lokal dan Google Drive divalidasi hingga 500 MB. PDF besar diproses per halaman agar tidak dikirim utuh ke Edge Function.
- Progress pembacaan historis ditampilkan selama persiapan, pembacaan per halaman, dan penggabungan hasil.
- Tidak ada perubahan database/SQL tambahan dari v1.19.3.
