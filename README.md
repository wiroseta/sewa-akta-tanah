PALM v1.21.14 RC — Warning FIFO Reconciliation Fix

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
