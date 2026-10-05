PALM v1.21.10 RC — Dashboard Payment FIFO Reconciliation Fix

Perbaikan pembacaan AI Sertifikat berdasarkan pengujian D4/D5: pisahkan Penunjuk/asal tanah dari peralihan hak, isi alamat dari lokasi fisik paling lengkap, notes kronologis terstruktur, dan pertahankan PERLU VERIFIKASI untuk konflik literal.

PALM v1.21.2 RC — Property Detail Fixed Search Action Bar

PALM v1.21.2 RC

Major search update: Cari Seluruh Database & Riwayat now searches active Property/Sertifikat, PBB, Akta Sewa and stored historical versions. Scope filter replaces property-only filter. Explicit 40x40 X close control.


## v1.21.10 RC
- Memperbaiki Agenda & Peringatan Dashboard agar status keterlambatan pembayaran dihitung dari Riwayat Pembayaran Aktual yang direkonsiliasi FIFO terhadap Jadwal Pembayaran.
- Termin yang sudah lunas tidak lagi tetap muncul sebagai “Belum dibayar” hanya karena tanggal jatuh temponya sudah lewat.
- Rekonsiliasi Dashboard dibuat kompatibel dengan data lama: ledger pembayaran aktual direkonstruksi dari transaksi tersimpan lalu dialokasikan FIFO tanpa mengubah data Akta.
- Jadwal Pembayaran, Riwayat Pembayaran Aktual, perhitungan PPh, dan tiga ikon header v1.21.9 tidak diubah.

## v1.21.9 RC
- HANYA tiga ikon navigasi utama header yang diubah ke desain Modern Filled yang disetujui: Properti/Lokasi, PBB, dan Akta Sewa.
- Ikon PALM lainnya tidak diubah.
- Seluruh fungsi dan fix v1.21.8 dipertahankan.

## v1.21.8 RC
- Catatan Sertifikat AI dinormalisasi deterministik menjadi PEMEGANG AWAL, ASAL / PENUNJUK, dan RIWAYAT PERALIHAN dengan bullet.
- Modal Hubungkan PBB ke Properti diurutkan Nama Alias A→Z (case-insensitive), lalu NOP A→Z sebagai secondary sort. Status checked tidak memengaruhi urutan.
- Seluruh fix v1.21.7 dan sebelumnya dipertahankan.
