-- v1.8: Data awal Akta Sewa PT Langkee Baja Indonesia
-- Jalankan setelah supabase_setup.sql dan supabase_v17_migration.sql.
-- Script mencari user wiroseta@gmail.com dan tidak membuat duplikat Akta No. 79.

insert into public.contracts (
  user_id, tenant, lessor, asset, property_address, property_area,
  deed_no, deed_date, start_date, end_date, rent, deposit,
  renewal_notice, renewal_term, contacts, bank_accounts, land_rights,
  payments, clauses, verification_status, source_pages, notes
)
select
  u.id,
  'PT LANGKEE BAJA INDONESIA',
  'Lim Ai Tijen Mariani',
  'Gudang & Kantor – Jl. Siliwangi 430A, Semarang',
  'Jalan Siliwangi No. 430A, Rukun Tetangga 001, Rukun Warga 003, Kelurahan Kalibanteng Kulon, Kecamatan Semarang Barat, Kota Semarang, Provinsi Jawa Tengah',
  'Gudang ±1.090 m²; kantor ±260 m²; berdiri di atas 4 bidang hak atas tanah',
  '79', date '2026-06-20', date '2026-07-01', date '2032-06-30',
  3751333333.33, 50000000,
  date '2031-12-30', 'Opsi perpanjangan 2 tahun; permohonan tertulis paling lambat 6 bulan sebelum masa sewa berakhir',
  '[
    {"role":"Pihak Pertama","name":"Lim Ai Tijen Mariani","phone":"+628112607988 / +62811288787","email":"wiroseta@yahoo.com"},
    {"role":"Pihak Kedua","name":"Shifa Dea Nisa","phone":"085795065969","email":"shifadean@gmail.com"}
  ]'::jsonb,
  '[
    {"purpose":"Pembayaran uang sewa","bank":"Bank OCBC – Cabang Semarang","account":"10383056375","holder":"Lim Ai Tijen Mariani"},
    {"purpose":"Pengembalian kelebihan security deposit bila ada","bank":"Bank Central Asia (BCA)","account":"3432264464","holder":"Shifa Dea Nisa"}
  ]'::jsonb,
  '[
    {"type":"HM","number":"8/Kalibanteng Kulon","area":"±106 m²","end":""},
    {"type":"HM","number":"281/Kalibanteng Kulon","area":"±204 m²","end":""},
    {"type":"HM","number":"355/Kalibanteng Kulon","area":"±200 m²","end":""},
    {"type":"HGB","number":"715/Kalibanteng Kulon","area":"1.077 m²","end":""}
  ]'::jsonb,
  '[
    {"due":"2026-06-20","amount":566666666.67,"label":"Termin 1 – periode sewa 01-07-2026 s/d 30-06-2027; dibayar saat penandatanganan akta (nilai sebelum PPh)"},
    {"due":"2027-02-28","amount":566666666.67,"label":"Termin 2 – periode sewa 01-07-2027 s/d 30-06-2028 (nilai sebelum PPh)"},
    {"due":"2028-02-28","amount":623333333.33,"label":"Termin 3 – periode sewa 01-07-2028 s/d 30-06-2029 (nilai sebelum PPh)"},
    {"due":"2029-02-28","amount":623333333.33,"label":"Termin 4 – periode sewa 01-07-2029 s/d 30-06-2030 (nilai sebelum PPh)"},
    {"due":"2030-02-28","amount":685666666.67,"label":"Termin 5 – periode sewa 01-07-2030 s/d 30-06-2031 (nilai sebelum PPh)"},
    {"due":"2031-02-28","amount":685666666.67,"label":"Termin 6/pelunasan – periode sewa 01-07-2031 s/d 30-06-2032 (nilai sebelum PPh)"}
  ]'::jsonb,
  '[
    {"title":"Jangka waktu sewa","detail":"6 tahun, 01-07-2026 sampai 30-06-2032.","page":"6–7","importance":"Penting"},
    {"title":"Perpanjangan","detail":"Pihak Kedua mendapat prioritas memperpanjang 2 tahun; permohonan tertulis paling lambat 6 bulan sebelum berakhir.","page":"6","importance":"Penting"},
    {"title":"Keterlambatan pengembalian objek","detail":"Denda Rp3.000.000 per hari bila objek tidak dikembalikan kosong dan terpelihara setelah masa sewa berakhir.","page":"7","importance":"Penting"},
    {"title":"Keterlambatan pembayaran","detail":"Denda Rp3.000.000 per hari; setelah 7 hari tidak membayar, perjanjian sewa otomatis batal demi hukum menurut akta.","page":"12–13","importance":"Penting"},
    {"title":"Penggunaan objek","detail":"Objek digunakan untuk gudang mobil dan kantor kegiatan usaha Pihak Kedua; penggunaan lain yang bertentangan dengan hukum menyebabkan perjanjian berakhir menurut akta.","page":"13","importance":"Penting"},
    {"title":"Pengalihan / peminjaman sewa","detail":"Tidak diperkenankan melimpahkan atau meminjamkan hak sewa kepada pihak lain tanpa izin tertulis Pihak Pertama.","page":"16","importance":"Penting"},
    {"title":"Security deposit","detail":"Rp50.000.000; digunakan untuk kewajiban yang belum dipenuhi. Kelebihan dikembalikan bila kewajiban kurang dari deposit.","page":"16–17","importance":"Penting"},
    {"title":"Asuransi","detail":"Pihak Kedua wajib mengasuransikan gudang dan kantor dengan nilai pertanggungan minimal Rp6.000.000.000 atau nilai penggantian bangunan, mana yang lebih tinggi.","page":"22","importance":"Penting"},
    {"title":"Pengakhiran oleh Pihak Kedua","detail":"Pemberitahuan tertulis sekurang-kurangnya 3 bulan sebelum meninggalkan objek; tidak berhak menuntut pengembalian bagian uang sewa yang sudah dibayar dan deposit tidak dikembalikan menurut ketentuan akta.","page":"24–25","importance":"Penting"}
  ]'::jsonb,
  'perlu_verifikasi',
  'Akta hal. 1–30; data utama: hal. 3–17, 22, 24–27',
  'Data diinput dari salinan Akta Perjanjian Sewa Menyewa No. 79 tanggal 20 Juni 2026. Tanggal berakhir HGB No. 715 tidak tercantum pada halaman sertifikat yang dirujuk dalam akta, sehingga kolom expiry HGB sengaja dikosongkan. Nomor rekening, telepon, dan email ditandai perlu verifikasi sebelum status diubah menjadi Sudah Diverifikasi.'
from auth.users u
where lower(u.email) = 'wiroseta@gmail.com'
  and not exists (
    select 1 from public.contracts c
    where c.user_id = u.id and c.deed_no = '79' and c.deed_date = date '2026-06-20'
  );

-- Hasil yang diharapkan: 1 row pada eksekusi pertama, 0 row jika data sudah pernah dimasukkan.
select deed_no, deed_date, tenant, start_date, end_date, rent, verification_status
from public.contracts
where user_id = (select id from auth.users where lower(email)='wiroseta@gmail.com' limit 1)
  and deed_no='79' and deed_date=date '2026-06-20';
