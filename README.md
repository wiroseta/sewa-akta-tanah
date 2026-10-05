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
