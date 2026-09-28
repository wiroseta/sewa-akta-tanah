# Sewa & Akta Tanah — v1.18.3 RC Large Local File Fix

Baseline: v1.18.2 RC Rebuild Drive Fix. Semua fitur/perbaikan sebelumnya dipertahankan.

## Perbaikan v1.18.3
- Upload PDF/foto langsung dari komputer sekarang mendukung sampai 45 MB.
- File <=18 MB tetap memakai jalur langsung seperti sebelumnya.
- File >18 MB sampai 45 MB otomatis diunggah sementara ke bucket private `ai-temp`, diproses AI, lalu dihapus.
- Status proses memberi tahu saat file besar sedang diunggah, disiapkan, dibaca AI, dan diproses.
- Google Drive tetap mendukung sampai 45 MB melalui jalur server-side.

## Deployment WAJIB
1. Jalankan `supabase_v1183_ai_temp_storage.sql` sekali di Supabase SQL Editor.
2. Deploy ulang `supabase/functions/extract-lease/index.ts` sebagai Edge Function `extract-lease`.
3. Replace seluruh file web di GitHub Pages dengan isi paket ini.
4. Buka aplikasi dan pastikan badge menunjukkan `v1.18.3 RC`.
5. Uji kembali `HGB 120.pdf`. Untuk file >18 MB, status harus berubah menjadi `Mengunggah sementara dengan aman…`.

Bucket `ai-temp` bersifat private, dibatasi per user, maksimum 45 MB, dan file dihapus oleh aplikasi setelah proses selesai/gagal.
