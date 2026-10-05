PALM v1.21.39 RC — Master PBB & Akta Sewa Heading Definitive Fix

Perubahan v1.21.39:
- Memperbaiki akar masalah judul Master PBB dan Master Akta Sewa yang tertutup actionbar fixed.
- Struktur DOM sekarang sama dengan Master Properti: toolbar lebih dulu, kemudian heading/keterangan, kemudian daftar kartu.
- Actionbar diubah dari fixed menjadi sticky dalam normal flow sehingga tidak menutupi heading.
- Menghapus spacer/padding kartu yang sebelumnya diperlukan untuk fixed actionbar.
- Cache CSS/app dinaikkan ke v1.21.39.
- Seluruh perubahan v1.21.38 dan sebelumnya dipertahankan.

PALM v1.21.38 RC — Master PBB & Akta Sewa Title Placement Fix

Perubahan v1.21.38:
- Memperbaiki judul Master PBB dan Master Akta Sewa yang pada v1.21.37 tidak tampil/tertutup dengan benar.
- Struktur DOM kedua halaman sekarang mengikuti Master Properti / Lokasi: intro/judul sebagai konten normal dan actionbar tetap sticky.
- Menghapus kebutuhan padding buatan pada judul Akta Sewa.
- Seluruh perubahan v1.21.37 dan sebelumnya dipertahankan.

PALM v1.21.37 RC — Master PBB & Akta Sewa Titles

Perubahan v1.21.37:
- Menambahkan judul Master PBB dan keterangan singkat di halaman daftar PBB.
- Menampilkan Master Akta Sewa dan keterangan singkat secara konsisten di bawah action/search bar.
- Styling desktop dan iPhone mengikuti pola Master Properti / Lokasi.
- Toolbar/search tetap sticky; judul dan keterangan ikut scroll bersama konten.
- Seluruh perubahan v1.21.36 dan sebelumnya dipertahankan.

PALM v1.21.36 RC — Akta Search & Google Drive Open Icon Fix

Perubahan v1.21.36:
- Memperbaiki lebar field pencarian pada Detail Akta Sewa agar tidak memenuhi seluruh baris pada desktop dan status hasil tetap rapi di sisi kanan.
- Pada layar sempit/iPhone, pencarian kembali memakai lebar penuh secara compact.
- Tombol Buka File pada baris Google Drive Pembacaan AI sekarang memakai logo Google Drive resmi/standar PALM, bukan tanda centang atau ikon open generik.
- Tombol Optimizer tetap icon-only 40x40 dan tombol AI tetap bertuliskan “✨ Baca dari Google Drive”.
- Seluruh perubahan v1.21.35 dan sebelumnya dipertahankan.

PALM v1.21.35 RC — Akta Sewa AI / Dokumen Layout & Icon Standard

Perubahan v1.21.35:
- Menyamakan layout Pembacaan AI / Dokumen Akta Sewa dengan standar PALM modul lain.
- File lokal: file picker → Optimizer 40×40 → ✨ Baca File.
- Google Drive: link → Buka Dokumen 40×40 → Optimizer 40×40 → ✨ Baca dari Google Drive.
- Menghapus logo Google Drive berwarna dari tombol AI; aksi AI selalu menggunakan simbol ✨.
- Tombol Buka Dokumen dan Optimizer menggunakan class/ikon global PALM.
- Menjaga layout compact dan wrapping pada layar iPhone.
- Seluruh perubahan v1.21.34 dan sebelumnya dipertahankan.

PALM v1.21.34 RC — Property PBB Count

Perubahan v1.21.34:
- Kartu Master Properti/Lokasi sekarang menampilkan jumlah PBB yang terhubung, di samping jumlah Sertifikat Tanah dan Bangunan.
- Jumlah PBB dihitung berdasarkan NOP unik/master PBB, bukan jumlah SPPT tahunan. Satu NOP dengan beberapa tahun SPPT tetap dihitung sebagai 1 PBB.
- Seluruh perubahan v1.21.33 dan sebelumnya dipertahankan.

PALM v1.21.33 RC — Safe Land Title Identity Fix

Perubahan v1.21.33:
- Jenis Hak + Nomor Sertifikat tidak lagi dianggap unique key global. Nomor yang sama boleh mewakili bidang/lokasi berbeda.
- Sertifikat yang sudah memiliki internal ID tetap di-update berdasarkan ID tersebut.
- Untuk Sertifikat baru, PALM hanya otomatis memakai ulang Master bila ada identitas bidang kuat yang sama: NIB, Nomor Surat Ukur, atau file Google Drive Sertifikat yang sama.
- Jika nomor sama dan hanya alamat + luas yang cocok, PALM meminta pilihan: gunakan Master lama atau buat Sertifikat baru.
- Jika nomor sama tetapi identitas/lokasi berbeda, PALM membuat Master Sertifikat baru dan tidak menimpa record lama.
- List Sertifikat Tanah sekarang menampilkan NIB, Surat Ukur, dan luas agar nomor sertifikat yang sama mudah dibedakan.
- Seluruh fix v1.21.32 dan sebelumnya dipertahankan.

Deploy: app.js, index.html, README.md. Tidak ada perubahan database/Supabase SQL.

PALM v1.21.32 RC — Property–Sertifikat Unlink Fix

Perubahan v1.21.32:
- Tombol − pada kartu Sertifikat di Detail Property sekarang benar-benar melepas relasi asset_land_titles untuk Property aktif.
- Penghapusan relasi meminta konfirmasi dan tidak menghapus Master Sertifikat.
- Relasi Sertifikat ke Property lain, PBB, dan Akta Sewa tidak ikut dihapus.
- Kartu Sertifikat baru yang belum disimpan tetap hanya dihapus dari form.
- Mempertahankan seluruh perbaikan v1.21.31 dan sebelumnya.

PALM v1.21.31 RC — List Sertifikat Close & Search Fix

Perubahan v1.21.31:
- Memperbaiki tombol X pada window List Sertifikat Tanah agar selalu menutup dialog.
- Memperbaiki search List Sertifikat Tanah agar tetap aktif.
- Akar masalah: dialog List Sertifikat Tanah berada setelah pemuatan app.js, sehingga listener yang dipasang saat startup tidak menemukan elemen dialog.
- Handler kritis X dan search sekarang dipasang langsung pada elemen dialog sehingga tidak tergantung urutan pemuatan DOM.
- Seluruh perubahan v1.21.30 dan sebelumnya dipertahankan.

PALM v1.21.30 RC — Master PBB Action Bar Alignment Fix

Perubahan v1.21.30:
- Toolbar Master PBB disejajarkan dengan batas kiri/kanan area kartu data.
- Tombol Kembali, Export, dan Tambah dipusatkan vertikal pada baris toolbar.
- Field pencarian desktop diperpendek agar tidak mendominasi lebar toolbar.
- Layout mobile tetap compact dan responsive tanpa horizontal overflow.
- Seluruh perbaikan v1.21.29 dan sebelumnya dipertahankan.

PALM v1.21.16 RC — PBB Editor Final UI

Perubahan v1.21.16:
- Header Tambah / Edit PBB dibuat satu baris dengan tombol Tutup dan Simpan; label PBB / SPPT dihapus.
- Buka Semua / Tutup Semua tetap tepat di atas Pembacaan AI SPPT.
- File lokal: Optimizer standar PALM (ikon clamp) + Baca File (bintang + teks).
- Link Google Drive: Buka Google Drive + Optimizer standar PALM (ikon clamp) + Baca dari Google Drive (bintang + teks).
- Ikon clamp ditetapkan sebagai ikon Optimizer standar PALM.
- Seluruh perbaikan Master PBB v1.21.15 tetap dipertahankan.

PALM v1.21.15 RC — Warning FIFO Reconciliation Fix

## v1.21.12 changes
- Fix dashboard warning FIFO: pembayaran aktual tidak lagi hilang ketika ledger transaction menunjuk termin yang sudah lunas; sisa pembayaran tetap diteruskan ke termin berikutnya sesuai FIFO.
- Dashboard "Pembayaran terlambat" dan Agenda memakai rekonsiliasi yang sama.
- Toleransi pembulatan <= Rp1 dianggap nol agar selisih receh seperti Rp0,45 tidak menjadi sisa/lebih bayar.
- Edge Function `send-warning-emails` memakai perbaikan FIFO dan toleransi yang sama agar email warning konsisten dengan Dashboard.
- Tidak ada perubahan database/schema. Cron/Resend yang sudah terpasang tetap digunakan.

## Deployment
GitHub Pages: deploy `app.js`, `index.html`, dan `README.md`.
Supabase Edge Function: redeploy hanya `supabase/functions/send-warning-emails/index.ts`.
Supabase SQL Editor: tidak perlu dijalankan.
Cron: tidak perlu dibuat ulang atau diubah.

PALM v1.21.11 RC — Per-User Warning Email Delivery

Baseline: v1.21.10 RC Dashboard Payment FIFO Reconciliation Fix. All existing v1.21.10 behavior is retained.

## v1.21.11 changes
- User Management now contains per-user `Terima peringatan email` ON/OFF and `Alamat email peringatan`.
- Warning email is OFF by default; Administrator explicitly enables each recipient.
- `supabase_latest.sql` is the only current DB upgrade SQL. It adds the user settings, delivery log, and RPC used by User Management.
- New Edge Function: `supabase/functions/send-warning-emails`.
- Server warning generation mirrors Dashboard warning windows and preserves v1.21.10 FIFO payment reconciliation.
- Delivery log deduplicates each recipient + warning + warning stage.
- Automatic sending does not depend on PALM/browser/iPhone/Mac being open.

## Deployment required
GitHub Pages: `app.js`, `index.html`, `style.css`, `README.md`.
Supabase SQL Editor: run `supabase_latest.sql` once.
Supabase Edge Functions: deploy `supabase/functions/send-warning-emails`, configure its required secrets, then schedule one POST per day.

## No redeploy required
`config.js`, icons, manifest, service worker, local optimizer, and seed SQL are unchanged.


### Corrected UI build
- User Management warning-email settings are responsive and no longer overflow horizontally.
- One `Simpan Perubahan` button saves warning-email settings for all users.
- `supabase_latest.sql` drops the legacy `app_list_users()` before recreating its expanded return signature.


## v1.21.11 RC Corrected 2 — Daily Warning Digest
- Email warning digabung menjadi maksimal satu email ringkasan per penerima per proses harian.
- Warning dikelompokkan: TERLAMBAT, HARI INI, H-1 s.d. H-3, H-4 s.d. H-7, H-8 s.d. H-14, H-15 s.d. H-30, dan PERINGATAN AWAL.
- Warning overdue memakai stage tetap `overdue`, sehingga tidak terkirim ulang setiap hari hanya karena jumlah hari keterlambatan berubah.
- Dedup tetap per recipient + warning_key + warning_stage.
- `supabase_latest.sql` memakai validasi email yang sudah dikoreksi dan aman untuk upgrade dari versi lama.


## v1.21.14 RC — Master PBB Layout
- Master PBB mengikuti pola Master Property: global header dan action bar compact sticky; intro, tools sekunder, dan kartu PBB scrollable.
- Action bar: Kembali ke Dashboard | Search | jumlah NOP | Tambah PBB.
- Tombol/link Google Drive SPPT di kartu Master PBB dan riwayat dihapus. URL Drive tetap tersimpan dan tetap dipakai pada form PBB untuk Baca/Verifikasi AI dan Optimizer.
- Print/Excel/Drive export dipertahankan sebagai tools sekunder yang ikut scroll.


## v1.21.15 RC — Master PBB Drive Restore
- Restore tombol Google Drive pada setiap kartu Master PBB untuk membuka hasil scan SPPT aktif secara langsung.
- Tombol Drive terpisah dari Export; Export tetap untuk Print / Excel / Excel ke Google Drive.
- Sticky action bar Master PBB tetap dipertahankan.

### v1.21.15 RC hotfix — Master PBB action icons
- Membersihkan CSS legacy `::before` pada tombol Kembali, Export, dan Tambah di Master PBB.
- Kembali dan Export memakai SVG DOM; Tambah memakai glyph `+` DOM sehingga tidak menjadi kotak kosong.
- Fungsi/navigasi tidak diubah; tombol Google Drive pada kartu PBB tetap dipertahankan.


## v1.21.18 RC
- PBB export dropdown now uses labeled actions: Print PBB Terbaru, Save as Excel, Save Excel to Google Drive.


## v1.21.22 RC
- Memperbaiki tombol pada Pembacaan AI SPPT/PBB yang masih salah pada v1.21.19.
- Baris file lokal sekarang: file → Baca File → Optimizer icon-only 40×40.
- Baris Google Drive sekarang: link → Buka Dokumen icon-only 40×40 → Optimizer icon-only 40×40 → Baca dari Google Drive.
- Menghapus tampilan teks “Optimizer” yang terpotong dan logo Drive yang keliru sebagai tombol aksi.
- Tidak mengubah logika penyimpanan/data PBB.

## v1.21.19 RC
- Master Akta Sewa mengikuti layout Master Property / Master PBB.
- Action bar tetap terlihat saat scroll: Kembali | Search | jumlah data | Tambah.
- Tombol action standar 40×40 CSS px.
- Tombol hapus kartu Akta memakai simbol minus, konsisten dengan standar PALM.
- Layout mobile dibuat ringkas agar action bar tidak memakan ruang layar berlebihan.


## v1.21.22 RC — PBB Approved Button Visuals
- PBB/SPPT Optimizer memakai ikon clamp 🗜️ sesuai referensi yang disetujui.
- Baca File dikunci sebagai tombol biru bertuliskan “✨ Baca File”.
- Baca dari Google Drive dikunci sebagai tombol biru bertuliskan “✨ Baca dari Google Drive”.
- Fungsi tombol tidak diubah; perubahan hanya visual/kontrol PBB/SPPT.


## v1.21.22 RC
- PBB local AI row: Choose File → Optimizer clamp → Baca File; text button auto-width.
- PBB AI Google Drive row: removed Open button; link → Optimizer clamp → Baca dari Google Drive.
- Data PBB/SPPT: added 40×40 Google Drive open button beside saved Google Drive SPPT field.


## v1.21.25 RC — Final AI Button Label Fix
- PBB Baca File memakai teks literal tepat: `✨ Baca File`; tanpa pseudo-element, bintang belakang, atau ikon tambahan.
- PBB Baca dari Google Drive memakai teks literal tepat: `✨ Baca dari Google Drive`; tanpa logo Google Drive, bintang belakang, atau ikon tambahan.
- Optimizer clamp tetap terpisah 40×40 CSS px dan layout v1.21.22 dipertahankan.


## v1.21.25 RC
- Fix root cause tombol AI PBB yang diubah menjadi icon-only oleh legacy v1.19.65 enhancer.
- `✨ Baca File` dan `✨ Baca dari Google Drive` sekarang dikecualikan dari legacy icon enhancer dan dikunci sebagai text action canonical PALM.


## v1.21.29 RC
- Master PBB: tombol utama Export dikembalikan ke icon-only Share/Export 40×40 CSS px.
- Menu Export diberi label final: Print, Save as Excel, Excel Save to Google Drive.
- Perubahan v1.21.25 untuk tombol Google Drive bukti bayar tetap dipertahankan.

- v1.21.29 RC: Root fix menu Export Master PBB. Item menu dipaksa tetap readable text: Print, Save as Excel, Excel Save to Google Drive; legacy icon-only classes dibersihkan saat menu dibuka.


## v1.21.29 RC — Master Sertifikat & AI Duplicate Guard
- Mencegah AI/Save Property membuat record Sertifikat baru bila Jenis Hak + Nomor Sertifikat yang dinormalisasi sudah ada tepat satu kali; PALM memakai kembali ID master yang ada.
- Bila Master sudah memiliki lebih dari satu duplikat untuk key yang sama, Save dihentikan dengan pesan agar data dibersihkan terlebih dahulu.
- Menu ••• mendapat `List Sertifikat Tanah` untuk melihat master, mencari, melihat jumlah keterkaitan, dan menghapus record salah/duplikat.
- Penghapusan meminta konfirmasi dan menampilkan keterkaitan Property/PBB/Akta Sewa yang akan dilepas.


## v1.21.29 RC
- Fix menu ••• List Sertifikat Tanah: bentuk mengikuti menu utility lain (ikon + teks).
- Handler pembuka Master Sertifikat dibuat eksplisit dan defensif; dialog dibuka sebelum query data dan error query ditampilkan di dalam dialog.
- Seluruh dedup guard v1.21.28 dipertahankan.
