# Sewa & Akta Tanah v1.19.52 RC — PBB Relation by NOP

Perubahan v1.19.52:
- Selector Hubungkan PBB ke Properti menampilkan satu baris per NOP, bukan per tahun.
- Tahun PBB tidak ditampilkan pada selector relasi.
- Alias/nama, NOP, dan alamat tetap searchable.
- Terapkan relasi NOP menghubungkan/melepas seluruh histori tahun dengan NOP yang sama.
- Ringkasan PBB pada Properti menampilkan satu kartu per NOP.
- Histori tahunan PBB tetap tersimpan dan tidak dihapus.
- Tidak ada perubahan schema SQL pada v1.19.52.

# Sewa & Akta Tanah v1.19.51 RC — Property Relations + In-Deed Search

Koreksi packaging: badge versi aplikasi, cache-buster index.html, dan start_url manifest sekarang seluruhnya menunjuk ke v1.19.51.

Fitur v1.19.51:
- Hubungkan PBB yang sudah ada ke Master Properti.
- Hubungkan Akta Sewa yang sudah ada ke Master Properti.
- Pencarian di dalam satu lokasi/properti mencakup relasi terkait.
- Pencarian di dalam Detail Akta Sewa dengan navigasi hasil.

Jalankan `supabase_latest.sql` sekali untuk perubahan relasi PBB -> properti.

## v1.19.51 RC — Indonesian Format Consistency Audit
- Normalisasi format Indonesia kini diterapkan kembali saat data lama dibaca dari database, bukan hanya saat hasil AI baru masuk.
- Ringkasan Klausul Penting, catatan, metadata pembayaran, histori/preview, data properti dan teks PBB yang relevan memakai normalizer yang sama.
- Angka uang mentah di kalimat finansial (contoh `9405000000`) ditampilkan sebagai Rupiah dengan pemisah ribuan Indonesia (contoh `Rp9.405.000.000`).
- Luas yang tertanam dalam teks memakai pemisah ribuan Indonesia dan `m²`; tanggal ISO di dalam teks menjadi `DD-MM-YYYY`.
- Normalisasi bersifat display/load-safe untuk data lama; penyimpanan Akta tetap menormalisasi teks agar hasil konsisten pada penyimpanan berikutnya.
- Tidak ada perubahan schema SQL untuk v1.19.51.


## v1.19.51 RC — Alias in Relation Pickers
- Selector Hubungkan PBB menampilkan alias sebagai identitas utama bila tersedia.
- NOP, tahun dan alamat tetap tampil sebagai informasi pendukung.
- Pencarian selector tetap mencakup alias.
- Pola alias-first diterapkan juga pada selector Akta/relasi yang memiliki alias.
- Tidak ada perubahan schema SQL.
