Sewa & Akta Tanah v1.10 — Google Drive Private

BARU:
- Tempel link file Google Drive private lalu baca langsung dengan AI.
- OAuth Google Drive read-only; file tidak perlu dibuat publik.
- Access token hanya disimpan di memori browser selama sesi, tidak masuk database/GitHub.
- Link Drive otomatis disimpan ke field Link dokumen / Google Drive.

SETUP GOOGLE CLOUD (sekali saja):
1. Buat/pilih Google Cloud project.
2. Enable Google Drive API.
3. Configure OAuth consent screen.
4. Buat OAuth Client ID tipe Web application.
5. Tambahkan Authorized JavaScript origins untuk URL GitHub Pages Anda (dan localhost bila perlu).
6. Salin Client ID ke config.js pada googleClientId. JANGAN taruh Client Secret di frontend/GitHub.
7. Untuk mode Testing, tambahkan akun Google Anda sebagai Test user.

Scope: https://www.googleapis.com/auth/drive.readonly
Catatan: scope ini memberi aplikasi izin baca semua file Drive yang dapat diakses akun setelah consent. Aplikasi v1.10 hanya mengunduh file dari link yang Anda tempel.
