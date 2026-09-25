Sewa & Akta Tanah v1.11 — Renewal Deadline Calculation

PERBAIKAN:
- AI sekarang wajib membedakan klausul perpanjangan dari klausul pengakhiran/terminasi.
- AI mengekstrak jangka pemberitahuan perpanjangan sebagai angka + satuan (hari/minggu/bulan/tahun).
- Deadline pemberitahuan dihitung secara deterministik oleh Supabase Edge Function dari tanggal akhir sewa.
- Contoh: akhir sewa 2031-12-30 + "6 bulan sebelum berakhir" => deadline 2031-06-30.
- Mendukung hari, minggu, bulan, dan tahun; pengurangan bulan/tahun aman untuk akhir bulan.
- Tidak memerlukan perubahan/migrasi database. Field renewal_notice yang sudah ada tetap digunakan.

PENTING SETELAH UPLOAD FILE WEBSITE KE GITHUB:
Deploy ulang Edge Function karena perbaikan utama ada di supabase/functions/extract-lease/index.ts:
  supabase functions deploy extract-lease

Setelah deploy, uji kembali satu akta yang memiliki klausul perpanjangan dan cocokkan tanggal akhir sewa, redaksi klausul, dan Deadline pemberitahuan perpanjangan sebelum menyimpan.
