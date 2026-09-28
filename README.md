# Sewa & Akta Tanah — v1.19.0 RC

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
4. Hard refresh dan pastikan badge `v1.19.0 RC`.

Catatan: batas 500 MB adalah ukuran file input. PDF besar diproses per halaman agar Edge Function tidak menerima file ratusan MB sekaligus.
