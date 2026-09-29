v1.19.34 RC — PBB Alias / Nama Properti

Perubahan v1.19.34:
- Tambah Alias / Nama Properti pada PBB agar NOP mudah dikenali (contoh: Pangkalan Truck SBT).
- Alias tampil sebagai nama utama pada kartu Master PBB, dengan NOP tetap terlihat di bawahnya.
- Pencarian Master PBB sekarang mencari alias, NOP, nama wajib pajak, alamat, tahun, dan properti/lokasi terkait.
- Alias berlaku pada level NOP: saat disimpan, alias disinkronkan ke seluruh SPPT/histori dengan NOP yang sama.
- Histori AI baru mewarisi alias PBB utama.
- Seluruh perbaikan v1.19.33 tetap dipertahankan.

WAJIB sebelum memakai versi ini:
Jalankan supabase_latest.sql satu kali di Supabase SQL Editor.
Tidak perlu deploy ulang Edge Function untuk perubahan v1.19.34.
