SEWA & AKTA TANAH v1.4 — SUPABASE DATABASE + RLS

1. Supabase > SQL Editor > New query.
2. Buka supabase_setup.sql, copy seluruh isinya, paste ke SQL Editor, lalu Run.
3. Pastikan tidak ada error.
4. Upload/ganti file berikut di GitHub: app.js, config.js, sw.js.
   File supabase_setup.sql tidak wajib dipublish ke website; aman disimpan sebagai referensi karena tidak berisi secret.
5. Tunggu GitHub Pages deploy, lalu hard refresh.
6. Login. Data baru sekarang disimpan di tabel public.contracts di Supabase, bukan localStorage.

Catatan: versi ini sengaja tidak otomatis memindahkan data localStorage lama. Contoh PT Langkee perlu dimasukkan ulang/diimpor setelah database aktif agar tidak ada data kritis yang dipindahkan tanpa verifikasi.
