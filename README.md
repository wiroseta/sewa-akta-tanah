# Sewa & Akta Tanah — v1.18.5 RC

## Large PDF Local + Google Drive Fix
- Memperbaiki error `Cannot read properties of undefined (reading length) [tahap: openai]` pada batch gambar.
- PDF lokal besar tetap diproses per 3 halaman, maksimum 500 MB.
- PDF Google Drive private >18 MB sampai 500 MB sekarang diunduh melalui sesi Google pengguna di browser lalu diproses dengan mesin batch yang sama.
- File Google Drive kecil tetap memakai jalur server yang lebih cepat.
- Progress menunjukkan metadata, download Drive, persiapan halaman, pembacaan AI per batch, dan penggabungan hasil.

## Deploy
1. Replace file GitHub dengan isi ZIP ini.
2. Deploy ulang `supabase/functions/extract-lease/index.ts`.
3. Tidak ada SQL baru.
4. Pastikan badge versi menunjukkan v1.18.5 RC.
