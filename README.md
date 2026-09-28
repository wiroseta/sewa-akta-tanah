# Sewa & Akta Tanah — v1.17.8 RC Indonesian Text Normalization Fix

## Perubahan
- Memperbaiki tanggal ISO yang masih muncul di dalam teks hasil AI/Klausul Penting.
- Semua pola tanggal YYYY-MM-DD di Ringkasan Klausul dan Catatan dinormalisasi menjadi DD-MM-YYYY.
- Normalisasi Rupiah/luas yang sudah ada tetap diterapkan secara recursive pada hasil AI.
- Data klausul lama dinormalisasi saat dibuka, sehingga tidak perlu scan AI ulang hanya untuk memperbaiki format tampilan.
- Saat data disimpan kembali, teks klausul/catatan yang sudah dinormalisasi ikut tersimpan.
- Seluruh Role Security Fix v1.17.7 tetap dipertahankan.

## Supabase
**Supabase update: TIDAK DIPERLUKAN.**

Gunakan struktur Supabase yang sudah aktif dari v1.17.1.
