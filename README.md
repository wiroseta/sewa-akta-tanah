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


## v1.21.26 RC
- Master PBB: tombol utama Export dikembalikan ke icon-only Share/Export 40×40 CSS px.
- Menu Export diberi label final: Print, Save as Excel, Excel Save to Google Drive.
- Perubahan v1.21.25 untuk tombol Google Drive bukti bayar tetap dipertahankan.
