# Sewa & Akta Tanah — v1.18.4 RC Large PDF Batch Reader

Baseline: v1.18.2 RC Rebuild Drive Fix.

## Perbaikan v1.18.4
- PDF lokal besar sekarang dapat dibaca sampai 500 MB, termasuk file 294,1 MB.
- PDF >18 MB tidak dikirim utuh ke AI. Browser membuka PDF dan merender 3 halaman per batch menjadi JPEG teroptimasi.
- Setiap batch dikirim ke Edge Function dan hasil ekstraksi digabungkan kembali di browser.
- Status proses menampilkan halaman yang sedang disiapkan/dibaca AI.
- PDF <=18 MB tetap memakai alur lama agar cepat.
- Foto tunggal tetap maksimum 18 MB.
- Google Drive server-side masih memakai guard 45 MB pada v1.18.4; untuk file 294,1 MB gunakan Choose File dari perangkat pada versi ini.
- Tidak ada SQL migration baru.

## Deployment
1. Replace seluruh file web di GitHub Pages.
2. Deploy ulang `supabase/functions/extract-lease/index.ts` sebagai Edge Function `extract-lease`.
3. Tidak perlu menjalankan SQL baru.
4. Hard refresh dan pastikan badge menunjukkan `v1.18.4 RC`.
5. Uji `HGB 120.pdf` melalui Choose File lalu `Baca PDF/Foto Sertifikat`.
