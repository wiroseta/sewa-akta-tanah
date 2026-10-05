# PALM send-warning-emails — v1.21.11 RC

Deploy this Edge Function as `send-warning-emails` after running `supabase_latest.sql`.

Required Edge Function secrets:
- `RESEND_API_KEY` — API key from the email delivery provider.
- `WARNING_FROM_EMAIL` — verified sender, e.g. `PALM <warning@your-domain.com>`.
- `WARNING_CRON_SECRET` — a long random secret used only by the scheduled caller.

Schedule one HTTP POST per day (recommended morning Asia/Jakarta) to the deployed Edge Function and send:
`Authorization: Bearer <WARNING_CRON_SECRET>`.

The function uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, which are available to Supabase Edge Functions. It reads only users with `warning_email_enabled=true`, reconstructs PALM warning stages, uses FIFO payment reconciliation, sends the warning, and records `(recipient, warning_key, warning_stage)` in `app_warning_email_log` to prevent duplicate mail for the same stage.

Warning stages mirror the Dashboard windows:
- Payment/PBB: <=90, <=30, H-14, H-7, H-3, H-1, H, overdue.
- Contract end: <=180, <=60, <=30, H-14, H-7, H-3, H-1, H, overdue.
- Renewal notice: <=365, <=60, <=30, H-14, H-7, H-3, H-1, H, overdue.
- Land right expiry: <=1095, <=730, <=365, <=180, <=90, <=30, H-14, H-7, H-3, H-1, H, overdue.

Email is OFF by default for every user until an Administrator enables it in User Management.
