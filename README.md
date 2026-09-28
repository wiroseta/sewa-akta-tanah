# Sewa & Akta Tanah — v1.18.0 RC Large Google Drive File Fix

Baseline: v1.17.9 RC. Semua fitur dan perbaikan sebelumnya dipertahankan.

## Perubahan utama
- File Google Drive tidak lagi diunduh ke browser lalu dikirim sebagai base64 ke Supabase.
- Browser hanya mengirim ID file + token OAuth sementara ke Edge Function.
- Edge Function mengambil file langsung dari Google Drive dan mengirimkannya ke OpenAI.
- Batas buatan 18 MB untuk alur Google Drive dihapus.
- Guard server untuk Google Drive ditetapkan 45 MB agar ada margin terhadap batas layanan upstream.
- Upload file lokal tetap 18 MB pada versi ini; perubahan ini khusus alur Google Drive.

## WAJIB DEPLOY EDGE FUNCTION
Sebelum mengetes v1.18.0, deploy ulang `supabase/functions/extract-lease/index.ts` ke function `extract-lease`. Tidak ada SQL migration baru.

Setelah Edge Function berhasil dideploy, upload file web v1.18.0 ke GitHub Pages, bersihkan cache Safari, lalu tes tombol Baca Sertifikat dari Google Drive.
