# v1.19.40 RC — Safe Delete & Duplicate Prevention

- Administrator dapat menghapus satu record histori PBB/SPPT yang salah tanpa menghapus NOP/tahun lain.
- Akta Sewa memiliki Hapus aman; relasi dan dokumen historis milik akta ikut dibersihkan, tetapi Property/PBB/Sertifikat sumber tidak dihapus.
- Property Master hanya dapat dihapus bila tidak memiliki Akta Sewa, PBB, Sertifikat Tanah, atau Bangunan terkait. Aplikasi menampilkan jumlah dependensi dan memblokir penghapusan.
- Penyimpanan PBB tetap mencegah duplikat NOP + Tahun pada input baru/AI dengan memperbarui record yang sudah ada.
- Tombol Hapus hanya tersedia untuk Administrator.
- Tidak ada SQL baru dan Edge Function tidak perlu dideploy ulang.

v1.19.40 RC — Export Excel & Simpan ke Google Drive

Perubahan:
- Master PBB: tombol 📊 Export Excel menghasilkan Rekap_PBB_DD-MM-YYYY.xlsx berisi SPPT aktif + histori dengan kolom penting dan link dokumen.
- Master PBB: tombol ☁️ Simpan Excel ke Google Drive membuat file Excel yang sama lalu upload langsung ke Google Drive pengguna.
- OAuth Google Drive memakai scope gabungan drive.readonly + drive.file. drive.file dipakai agar aplikasi hanya dapat membuat/mengelola file yang dibuat oleh aplikasi, tanpa meminta hak edit seluruh Drive.
- Token sesi lama yang hanya readonly otomatis dianggap tidak cukup sehingga pengguna diminta Hubungkan Google Drive sekali lagi untuk izin upload.
- Semua fitur v1.19.36 tetap dipertahankan.

DEPLOYMENT:
1. Tidak ada SQL baru untuk v1.19.40. Jika SQL v1.19.35 belum dijalankan, jalankan SQL tersebut dari baseline sebelumnya.
2. Upload web v1.19.40 ke GitHub Pages.
3. Tidak perlu deploy ulang Edge Function.
4. Saat pertama memakai upload Excel, Hubungkan Google Drive kembali satu kali untuk memberikan izin drive.file.

v1.19.36 RC — Print Semua PBB (Tabel Ringkas)

Perubahan:
- Bagian Sertifikat Tanah pada PBB didesain ulang agar jelas: jenis hak, nomor, luas sertifikat, alamat, jenis cakupan, luas cakupan PBB, dan keterangan.
- Satu sertifikat boleh terkait dengan lebih dari satu NOP/PBB (many-to-many); ini bukan error.
- Jenis cakupan: Seluruh sertifikat, Sebagian sertifikat, atau Belum diketahui. Luas tidak dipaksa jika dokumen tidak menyebutkannya.
- Menampilkan jumlah relasi PBB lain pada sertifikat yang sama dan total luas cakupan yang sudah tercatat.
- Warning muncul bila luas PBB ini sendiri atau total luas cakupan tercatat lintas PBB melebihi luas sertifikat.
- Relasi tetap disimpan per record PBB dan metadata cakupan tersimpan di pbb_land_titles.
- Semua fitur v1.19.34 tetap dipertahankan.

DEPLOYMENT:
1. Jalankan supabase_latest.sql SEKALI.
2. Upload web v1.19.36 ke GitHub Pages.
3. Tidak perlu deploy ulang Edge Function untuk perubahan ini.


v1.19.36: tombol Print Semua PBB pada Master PBB. Hasil cetak A4 landscape berisi semua SPPT (aktif + histori) dengan informasi penting: alias/properti, NOP, tahun, wajib pajak, alamat, luas tanah, total NJOP, PBB dibayar, status, dan tanggal bayar. Tidak ada perubahan database/Edge Function.


## v1.19.40 RC — Hak Tanah 3-Year Early Warning
- Peringatan internal Hak Tanah dimulai saat sisa masa berlaku <= 3 tahun.
- <= 3 tahun: persiapan perpanjangan dan dokumen pendukung.
- <= 2 tahun: perlu tindak lanjut perpanjangan.
- <= 1 tahun: mendesak.
- Lewat tanggal berlaku: hak tanah telah berakhir.
- Dashboard menampilkan jumlah Hak tanah <= 3 tahun.
- Tidak ada perubahan SQL dan Edge Function.
