v1.19.29 RC — Google Drive Connect Buttons Everywhere

Perubahan v1.19.29:
- Tombol Hubungkan Google Drive tersedia pada setiap area yang benar-benar membaca dokumen private dengan AI: Akta Sewa, PBB/SPPT, Sertifikat Tanah, Perjanjian di Bawah Tangan, dan Akta Lama/Dokumen Historis.
- Semua tombol koneksi memakai satu sesi/token Google Drive yang sama; setelah satu area terhubung, area lain dapat memakai token yang masih valid.
- Tombol Baca dari Google Drive tetap tidak memulai OAuth secara otomatis. Jika sesi berakhir, pengguna diminta menekan Hubungkan Google Drive secara eksplisit.
- Tidak ada perubahan database untuk v1.19.29.

v1.19.28 RC — Google Drive OAuth Session Reuse Fix

Perubahan v1.19.28:
- Pembacaan Google Drive tidak lagi memulai OAuth interaktif secara otomatis.
- OAuth hanya dimulai saat tombol Hubungkan Google Drive ditekan.
- Access token Google Drive yang masih valid disimpan di sessionStorage dan dipakai ulang setelah reload pada sesi browser yang sama.
- Jika token kedaluwarsa/401, aplikasi berhenti dengan instruksi Hubungkan Google Drive; tidak membuka popup OAuth sendiri.
- requestAccessToken tidak lagi memaksa prompt=consent.
- Packaging SQL dirapikan: supabase_latest.sql hanya berisi perubahan yang perlu dijalankan untuk build ini; histori lama dipindahkan/tersimpan di supabase_schema_history.sql.


# Sewa & Akta Tanah — v1.19.23 RC

## Universal 500 MB AI Document Reader

Baseline: v1.18.9 RC.

Perubahan utama:
- Jalur AI Akta Sewa sekarang memakai mesin dokumen universal yang sama dengan Sertifikat Tanah dan PBB.
- PDF lokal hingga 500 MB: PDF besar dirender per halaman di browser, dikompresi, lalu dikirim satu halaman per request ke Edge Function/OpenAI.
- PDF Google Drive hingga 500 MB: file besar memakai progressive/range loading melalui PDF.js dan diproses per halaman; tidak dikirim utuh ke Edge Function.
- Batas lama 18 MB / 45 MB di alur Akta Sewa dihapus.
- Sertifikat Tanah dan PBB tetap memakai mekanisme universal yang sama.
- Semua fitur v1.18.9 (HGB recognition, auto-name sync, property autofill) dipertahankan.

## Deploy
1. Replace file web di GitHub dengan isi ZIP ini.
2. Deploy ulang `supabase/functions/extract-lease/index.ts`.
3. Tidak ada SQL baru.
4. Hard refresh dan pastikan badge `v1.19.3 RC`.

Catatan: batas 500 MB adalah ukuran file input. PDF besar diproses per halaman agar Edge Function tidak menerima file ratusan MB sekaligus.


## v1.19.1 — Document History & AI Comparison
- Riwayat Akta Sewa: versi lama disimpan sebagai snapshot sebelum perubahan dan versi baru setelah disimpan.
- Riwayat Sertifikat Tanah per properti: snapshot sebelum/sesudah perubahan HGB/SHM/dll.
- Tombol **Riwayat & Bandingkan** pada Akta Sewa dan Sertifikat Tanah.
- AI membandingkan dua versi dan menandai perubahan, klausul lama yang tidak ditemukan di dokumen baru, serta klausul yang secara eksplisit disebut tetap berlaku.
- Pencarian **Cari Klausul & Riwayat** mencakup versi lama.
- Jalankan `supabase_v1191_document_history_ai_comparison.sql` sekali, lalu deploy ulang Edge Function `extract-lease`.

Catatan hukum: status “tidak ditemukan di dokumen baru” tidak dianggap otomatis masih berlaku; aplikasi menandainya untuk verifikasi.

## v1.19.2 — Akta Lama / Dokumen Historis
- Akta aktif tetap disimpan di `contracts` dan tidak ditimpa dokumen lama.
- Tombol `+ Akta Lama / Dokumen Historis` menyimpan Akta Lama, Addendum, Perpanjangan, atau Akta Pengganti ke tabel `lease_documents`.
- Pembacaan AI memakai reader universal hingga 500 MB yang sama dengan Akta aktif.
- Dokumen historis muncul pada `Riwayat & Bandingkan Akta` sebagai rangkaian dokumen hukum.
- Jalankan `supabase_v1192_historical_lease_documents.sql` setelah SQL v1.19.1.


## v1.19.3 — Status AI Dokumen Historis
- Riwayat Akta menampilkan status **Sudah dibaca AI / Belum dibaca AI**.
- Dokumen historis baru menyimpan `ai_status` dan `ai_read_at`.
- Hasil `extracted_data` lama tetap dikenali sebagai sudah dibaca AI, sehingga tidak perlu scan ulang.
- Timestamp pembacaan AI ditampilkan bila tersedia.
- APP_BUILD, badge, dan README diselaraskan ke v1.19.3 RC.
- Jalankan `supabase_v1193_ai_document_status.sql` setelah migrasi v1.19.2.


## v1.19.4 — Historical Universal 500 MB Reader Lock
- Dokumen historis dipastikan memakai `invokeDocumentAI` / `invokeDriveAI` yang sama dengan Akta Sewa, PBB, dan Akta Tanah.
- File lokal dan Google Drive divalidasi hingga 500 MB. PDF besar diproses per halaman agar tidak dikirim utuh ke Edge Function.
- Progress pembacaan historis ditampilkan selama persiapan, pembacaan per halaman, dan penggabungan hasil.
- Tidak ada perubahan database/SQL tambahan dari v1.19.3.


## v1.19.5 — Saved Historical Documents Visible
- Dialog Akta Lama / Dokumen Historis sekarang menampilkan Riwayat Dokumen Tersimpan untuk Akta Sewa aktif.
- Status Sudah/Belum dibaca AI ditentukan dari ai_status/extracted_data yang sudah tersimpan; tidak memicu scan ulang.
- Hasil AI lama dapat dilihat langsung.
- Dokumen historis dapat dibandingkan dengan Akta Sewa aktif menggunakan data ekstraksi tersimpan.
- Reader universal file besar hingga 500 MB dari v1.19.4 tetap dipertahankan.


## v1.19.7 — Historical Save Verification Fix
- Penyimpanan dokumen historis sekarang diverifikasi kembali dari `lease_documents` sebelum aplikasi menyatakan sukses.
- Error database ditampilkan lebih rinci dan mengingatkan migrasi v1.19.7 bila schema belum siap.
- Kegagalan snapshot `document_history` tidak lagi membatalkan/menyamarkan dokumen historis yang sebenarnya sudah tersimpan.
- Jalankan `supabase_v1196_historical_save_fix.sql` sekali sebelum pengujian.

## v1.19.7 RC
- Riwayat Dokumen Tersimpan memiliki tombol **Hapus** untuk Administrator, dengan konfirmasi rinci.
- Pencegahan duplikat berdasarkan Akta aktif + jenis dokumen + nomor akta + tanggal dokumen.
- Paket distribusi dirapikan: gunakan hanya `supabase_latest.sql` untuk update database terbaru. File migration versi lama tidak lagi disertakan di root ZIP.


## v1.19.9 RC — Flexible Payment & Installment Ledger
- Setiap termin menyimpan target kewajiban dan dapat menerima beberapa pembayaran/cicilan.
- Sistem menghitung total terbayar, sisa/kurang bayar, lunas, dan lebih bayar otomatis.
- Dashboard memberi warning atas sisa tagihan yang belum lunas pada/menjelang jatuh tempo.
- Pembayaran aktual menyimpan tanggal, jumlah, metode, referensi/bukti, dan catatan.
- Data tetap tersimpan di JSONB `contracts.payments`; tidak diperlukan tabel SQL baru untuk fitur ini.
- `supabase_latest.sql` tetap menjadi satu-satunya file update database yang perlu diperhatikan.

## v1.19.9 RC — FIFO Payment Ledger
- Jadwal kewajiban menurut Akta dipisahkan dari Riwayat Pembayaran Aktual.
- Pembayaran aktual otomatis dialokasikan FIFO ke termin tertua yang belum lunas.
- Satu pembayaran dapat menutup sisa termin lama dan sebagian termin berikutnya.
- Warning kekurangan menggunakan saldo kewajiban setelah alokasi otomatis.
- Data lama v1.19.8 dimigrasikan di browser ke ledger saat Akta dibuka; tidak memerlukan scan AI ulang.
- Tidak memerlukan SQL baru; struktur JSON `contracts.payments` tetap kompatibel.


## v1.19.10 RC — Payment Ledger Indonesian Date Fix
- Tanggal Riwayat Pembayaran Aktual mengikuti format Indonesia DD-MM-YYYY.
- Input cepat DDMMYY, contoh 060225, otomatis menjadi 06-02-2025 saat blur dan sebelum penyimpanan.
- Data ledger lama berformat 6 digit dinormalisasi saat dibuka tanpa mengubah mekanisme FIFO.


## v1.19.15 RC — Gross/Net Rent & Withholding Tax
- Memisahkan nilai sewa bruto, pajak yang dipotong penyewa, netto yang harus diterima, dan uang aktual yang masuk rekening.
- Tarif pajak editable; tidak hard-code tarif tertentu.
- FIFO menggunakan kewajiban netto, sementara nilai bruto menurut Akta tetap dipertahankan.
- Riwayat pembayaran aktual dapat mencatat jumlah pajak yang dipotong.
- Tidak memerlukan SQL baru; metadata pajak disimpan bersama data pembayaran kontrak.


## v1.19.15
Menambahkan Perjanjian di Bawah Tangan sebagai dokumen sewa tambahan. Data disimpan di database pada contracts.payments_meta.supplementalAgreements, dapat ditautkan ke Google Drive, dibaca AI, dan jadwal pembayarannya dimasukkan ke FIFO. Seluruh nilai ekonomi tetap dicatat utuh.


## v1.19.15 RC — Collapsible Long Pages
Halaman/form panjang memakai section header yang dapat dibuka/tutup, ringkasan pada header, Buka Semua/Tutup Semua, dan preferensi tersimpan di perangkat. Section yang terdeteksi memiliki warning tetap dibuka agar perhatian penting tidak tersembunyi. Tidak memerlukan SQL baru.


## v1.19.15 RC — Save Tax + Lease Collapsible Fix
Menambahkan `contracts.payments_meta` melalui `supabase_latest.sql` dan memperbaiki Akta Sewa agar header Buka/Tutup dipasang setiap dialog Akta dibuka, termasuk edit data lama.


## v1.19.15 RC — AI Historical Chain & Re-Verification
- AI Akta Sewa mengekstrak semua referensi Akta/Addendum sebelumnya ke `priorDeeds`.
- Referensi yang belum memiliki dokumen dibuat otomatis di `lease_documents` dengan status **Belum dibaca AI**; dokumen yang sudah memiliki hasil AI tidak diduplikasi/didowngrade.
- Scan dokumen historis juga dapat menemukan referensi Akta yang lebih lama dan memperpanjang rantai histori.
- Tombol **Verifikasi Ulang AI** membaca ulang file/Google Drive, menggunakan OpenAI credit, membandingkan hasil baru dengan data tersimpan, dan tidak menimpa data secara otomatis.
- **Terapkan Hasil ke Form** hanya memperbarui form; database baru berubah setelah pengguna menekan **Simpan**.


## v1.19.16 RC — Persistent Google Drive Source & Drive Re-Verification
- Link Google Drive yang digunakan untuk membaca Akta Sewa disimpan pada `contracts.doc_url` saat Akta disimpan.
- Saat Akta dibuka kembali, sumber Google Drive tersimpan otomatis ditampilkan kembali pada area pembacaan AI.
- **Verifikasi Ulang AI** otomatis memakai Google Drive tersimpan bila tidak ada file/link baru yang dipilih; pengguna tidak perlu mencari file Drive yang sama lagi.
- Jika pengguna memilih file lokal atau memasukkan link Drive baru, sumber tersebut tetap dapat dipakai untuk verifikasi; data lama tidak ditimpa sampai hasil verifikasi diterapkan dan Akta disimpan.
- Tidak memerlukan perubahan schema baru di atas `supabase_latest.sql` v1.19.15/v1.19.14; file SQL terbaru tetap disertakan sebagai satu-satunya migration utama.


## v1.19.20 RC — AI PPh Final 4(2) Gross/Net Extraction
- AI memisahkan nilai sewa menurut Akta, bruto dasar PPh, PPh Final, dan netto yang diterima.
- Default PPh Final sewa tanah/bangunan 10% dari jumlah bruto; jika Akta tidak jelas, hasil ditandai perlu verifikasi.
- Jika nilai Akta sudah termasuk PPh: PPh dipotong dari bruto.
- Jika nilai Akta secara eksplisit netto/belum termasuk PPh dan PPh ditambahkan di atas netto: aplikasi melakukan gross-up (bruto = netto / (1 - tarif)).
- Klausul sumber pajak dan interpretasi AI ditampilkan untuk pemeriksaan pengguna.
- FIFO menggunakan nilai netto yang benar, sedangkan laporan tetap menunjukkan bruto dan PPh.
- Fitur Google Drive permanen dan Verifikasi Ulang AI v1.19.16 tetap dipertahankan.

## v1.19.20 RC — Whole-Document AI Consolidation & Validation
- Semua PDF Akta kini dibaca sampai halaman terakhir sebelum hasil final ditetapkan, termasuk PDF di Google Drive.
- Pembacaan halaman/chunk hanya tahap pengumpulan fakta; hasil tiap halaman tidak langsung menjadi hasil Akta.
- Setelah semua halaman selesai, Edge Function menjalankan Whole-Document Consolidation untuk menghubungkan fakta lintas halaman.
- Akta multi-tahun wajib menghasilkan rentPeriods, total nilai kontrak, seluruh termin pembayaran, PPh bruto/netto, klausul, dan referensi Akta sebelumnya.
- Validasi mendeteksi jangka kontrak yang tidak cocok dengan periode harga yang ditemukan dan memberi validationWarnings, bukan diam-diam memakai harga tahun pertama.
- `rent` pada hasil akhir Akta multi-periode diisi total bruto seluruh masa kontrak setelah konsolidasi.
- Deploy ulang `supabase/functions/extract-lease/index.ts` agar pipeline v1.19.20 aktif.


## v1.19.20 RC — Full Page Lease Detail
Akta Sewa sekarang dibuka sebagai halaman detail penuh di dalam aplikasi (bukan dialog/modal), dengan tombol kembali, dukungan browser Back/Escape, ringkasan header, section collapsible yang tetap dipertahankan, dan tombol Simpan sticky. Pipeline Whole-Document AI v1.19.20 tidak diubah.


## v1.19.20 RC — Linked Lease Deed + Verification Persistence Fix
- Memperbaiki error `lease_documents_document_type_check` ketika AI menemukan Akta sebelumnya.
- Tipe dokumen AI dinormalisasi ke nilai database yang aman.
- Kegagalan penyimpanan referensi histori tidak lagi membatalkan Akta utama yang sudah berhasil tersimpan.
- Hasil Verifikasi Ulang AI (total kontrak, rentPeriods, priorDeeds, waktu verifikasi) disimpan di `payments_meta` saat tombol Simpan ditekan.
- Terapkan Hasil ke Form tidak menulis histori ke database sebelum Simpan.
- Tombol `＋ Akta Lanjutan` membuat record baru yang terhubung ke Akta sebelumnya sebagai Perpanjangan, Addendum, Pengganti, atau Akta Baru Terkait.
- Jalankan `supabase_latest.sql` v1.19.20 sebelum pengujian.


## v1.19.21 RC — Payment Reconciliation & Single-Row Ledger Fix
- Dashboard kini menilai pelunasan termin berdasarkan **netto yang seharusnya diterima** sesuai mode/rate PPh kontrak, bukan membandingkan penerimaan netto terhadap nilai bruto termin. Ini menghilangkan false warning seperti kekurangan 10% pada pembayaran yang sebenarnya sudah lunas.
- Rekonsiliasi tetap memakai alokasi FIFO dari Riwayat Pembayaran Aktual ke termin paling lama.
- Riwayat Pembayaran Aktual diperbaiki menjadi satu row penuh: Tanggal, Netto, Pajak, Bank, Referensi, Catatan, dan tombol Hapus berada pada baris yang sama di desktop. Tombol minus diganti menjadi `Hapus`.
- Tidak memerlukan perubahan schema/database.


## v1.19.23 RC — PBB Berbasis NOP & Histori SPPT
- Menu PBB sekarang dikelompokkan berdasarkan NOP.
- SPPT tahun terbaru otomatis menjadi data PBB aktif untuk NOP tersebut.
- SPPT tahun lama tetap tersimpan dan dapat dibuka dari Riwayat SPPT.
- Status aktif menampilkan jatuh tempo; bila lunas menampilkan tanggal pembayaran.
- Dashboard PBB hanya memakai SPPT aktif/terbaru per NOP untuk warning, agar SPPT historis tidak membuat warning aktif ganda.
- Saat menyimpan NOP + tahun yang sudah ada, record tahun itu diperbarui dan tidak dibuat duplikat.
- Tidak memerlukan perubahan schema/SQL baru; kompatibel dengan data PBB v1.19.21.


## v1.19.23 RC
- Master PBB menjadi halaman penuh terpisah dari Dashboard.
- Master per NOP menampilkan Nama Wajib Pajak dan Alamat Objek Pajak.
- Search Master PBB mencari NOP, nama wajib pajak, alamat objek pajak, tahun, dan metadata properti yang tersedia.
- Histori SPPT per NOP dan current-year logic v1.19.22 tetap dipertahankan.


## v1.19.24 RC — Master Akta Sewa + PBB Navigation Fix
- Akta Sewa sekarang memiliki halaman Master tersendiri dengan daftar seluruh akta dan search bar di atas.
- Tombol Tambah Akta Sewa dipindahkan ke halaman Master Akta Sewa.
- Search tetap mencakup seluruh metadata akta yang tersimpan, termasuk penyewa, pemilik, properti, nomor akta, notaris/riwayat dan periode bila tersedia.
- Navigasi PBB diperbaiki dan cache-buster app.js/config.js dinaikkan ke v1.19.24 agar browser/GitHub Pages tidak menjalankan JavaScript v1.19.20 yang tersimpan di cache.
- Halaman PBB kini dibuka terlebih dahulu lalu memuat data; jika query PBB gagal, halaman tetap terbuka dan menampilkan detail error, bukan terlihat seperti tombol tidak bekerja.
- Tidak memerlukan SQL baru.


## v1.19.25 RC — Exclusive Lease Detail View Fix
- Detail Akta Sewa kini eksklusif: Master Akta Sewa dan Master PBB disembunyikan saat detail dibuka.
- Tombol Kembali/Batal dari detail mengembalikan pengguna ke Master Akta Sewa, bukan menumpuk kedua halaman.
- Mempertahankan posisi scroll daftar Akta saat kembali.
- Cache buster aplikasi dinaikkan ke v1.19.25.


## v1.19.26 RC — PBB NOP Auto History in Form
- Tambah/Edit PBB sekarang otomatis menampilkan Riwayat SPPT tersimpan berdasarkan NOP yang sama.
- Histori dimuat segera saat NOP diketik maupun setelah NOP terisi dari pembacaan AI file/Google Drive.
- SPPT yang sedang diedit tidak diduplikasi di daftar histori.
- Histori menampilkan tahun, wajib pajak, alamat objek, nilai PBB, jatuh tempo, status, tanggal dibayar, serta tombol Buka/Edit dan SPPT bila link tersedia.
- Data hasil AI yang belum disimpan tetap dianggap draft; histori hanya berasal dari data PBB yang sudah tersimpan.
- Tidak memerlukan perubahan SQL.