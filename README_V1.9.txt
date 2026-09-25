SEWA & AKTA TANAH v1.9 — AI EXTRACT AKTA

Fitur baru:
- Upload PDF/JPG/PNG/WebP scan akta dari form.
- AI membaca dokumen dan mengisi identitas, masa sewa, nilai sewa, deposit, termin, kontak, rekening, HGB/hak tanah, serta klausul penting.
- Semua hasil AI otomatis diberi status PERLU VERIFIKASI.
- API key OpenAI TIDAK disimpan di GitHub/browser; disimpan sebagai Supabase Secret.

SETUP SEKALI SAJA (Supabase CLI):
1. Login dan link project Supabase Anda.
2. Set secret: supabase secrets set OPENAI_API_KEY=sk-...
3. Deploy: supabase functions deploy extract-lease
4. Upload isi folder web ke GitHub Pages seperti versi sebelumnya.

Catatan keamanan: jangan pernah menaruh OPENAI_API_KEY di config.js atau GitHub.
Batas UI saat ini: 18 MB/file untuk pembacaan langsung.
