# Sewa & Akta Tanah — v1.18.2 RC Rebuild + Large Google Drive Diagnostics Fix

Baseline: paket v1.18.1 yang dikembalikan pengguna. Semua fitur/perbaikan sebelumnya dipertahankan.

## Perbaikan v1.18.2
- Nomor versi UI benar-benar v1.18.2 RC.
- Cache-buster `config.js` dan `app.js` disinkronkan ke v1.18.2 agar GitHub Pages/Safari tidak memuat JS lama.
- Google Drive large-file flow tetap diproses server-side melalui Edge Function `extract-lease` (maksimum guard 45 MB).
- Error Edge Function menampilkan detail dan tahap (`drive-auth`, `drive-metadata`, `drive-download`, `openai`).
- Upload langsung dari komputer tetap maksimum 18 MB.
- Migration v1.17.9 dan seluruh fitur sebelumnya tetap dipertahankan.

## Deployment
1. Upload/replace seluruh isi paket web ke root GitHub Pages.
2. Deploy `supabase/functions/extract-lease/index.ts` sebagai Edge Function `extract-lease`.
3. Tidak ada SQL migration baru untuk v1.18.2.
4. Setelah GitHub Pages selesai deploy, buka ulang aplikasi. Badge harus menampilkan `v1.18.2 RC` sebelum mengetes AI.
