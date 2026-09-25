# Sewa & Akta Tanah Manager v1.1 — Login Supabase

Frontend dapat disimpan di repository GitHub public. Login memakai Supabase Auth; password tidak disimpan di GitHub.

## Setup singkat
1. Buat project di Supabase.
2. Authentication > Users: buat user pemilik aplikasi (email + password).
3. Project Settings/API: salin Project URL dan Publishable key (atau anon key lama) ke `config.js`.
4. Upload semua file ke GitHub repository dan aktifkan GitHub Pages.
5. Di Supabase Authentication > URL Configuration, masukkan URL GitHub Pages sebagai Site URL / allowed redirect URL bila diperlukan.

## Penting
- Jangan pernah masukkan Supabase secret/service-role key atau OpenAI API key ke repository/frontend.
- Versi ini menambahkan login sungguhan, tetapi data kontrak masih tersimpan di localStorage browser per user ID. Jangan gunakan sebagai penyimpanan final dokumen hukum.
- Tahap berikutnya: pindahkan data ke tabel Supabase dengan Row Level Security (RLS), private storage untuk dokumen, dan Edge Function untuk OpenAI.
