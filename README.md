PALM v1.20.95 RC — Property / Permit / Agent UI normalization

Changes:
- Data Properti/Lokasi: initial Alias and Nama/Deskripsi height normalized to 40px; description can grow when multiline. Address and area remain auto-grow.
- Perizinan & Legalitas: Google Drive row = flexible field + 40px Open + 40px Optimizer + Baca dari Google Drive. Local row = custom full-width file picker + 40px local optimizer + Baca File + 40px remove at right.
- Agen/Broker: same Google Drive workflow; payment proof = flexible field + 40px Open; local file row standardized; remove at right.
- Removed duplicate Baca Drive from local-file rows.
- Keeps v1.20.89 anti-freeze approach; no new MutationObserver introduced by this release.

Deploy to GitHub: index.html, app.js, style.css only.
No SQL / Edge Function / local helper redeploy required.
