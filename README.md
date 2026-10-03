PALM v1.20.99 RC

Perubahan:
- Akta Sewa Pembacaan AI: file picker PALM + optimizer lokal + Baca File; Google Drive: Buka + optimizer + Baca dari Google Drive.
- Akta Sewa Link dokumen/Google Drive: tombol centang diganti Buka + optimizer PALM + Baca dari Google Drive.
- Mempertahankan normalisasi v1.20.95 untuk Data Properti, Perizinan/Legalitas, dan Agen/Broker.
- Tidak ada SQL/Edge Function/helper lokal yang berubah.

Deploy GitHub: index.html, app.js, style.css.


v1.20.99 RC — Building repeat controls + global save feedback/keep-page normalization
- Bangunan/Gudang/Gedung: kontrol kartu menggunakan urutan + lalu −, icon-only 40×40; tombol − tetap terikat ke kartu yang sama sehingga aman saat ada beberapa bangunan.
- Simpan Properti: setelah semua data utama/detail berhasil disimpan, tetap di Detail Properti, mempertahankan posisi scroll, dan menampilkan konfirmasi sukses.
- Simpan PBB: setelah PBB + relasi berhasil disimpan, dialog/form tetap terbuka dan menampilkan konfirmasi sukses; navigasi kembali hanya melalui Batal/Kembali.
- Akta Sewa dan Dokumen Historis sudah memiliki feedback sukses/error dan tetap di konteks yang sama; perilaku tersebut dipertahankan.
- Tidak ada perubahan schema Supabase atau Edge Function.


v1.20.99 RC — Akta Sewa AI/Dokumen layout regression fix: desktop local-file and Google Drive workflows locked to PALM 40px one-row layout; mobile wraps intentionally.
