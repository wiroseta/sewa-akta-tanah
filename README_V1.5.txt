Sewa & Akta Tanah v1.5 - Login Display Fix

Perbaikan:
1. Setelah signInWithPassword berhasil, session langsung dipakai untuk membuka dashboard; tidak lagi bergantung hanya pada event auth.
2. CSS eksplisit memastikan authScreen benar-benar tersembunyi dan appShell tampil setelah login.
3. Cache service worker dinaikkan ke v1.5 agar browser mengambil file terbaru.

Upload/ganti app.js, style.css, dan sw.js di GitHub. config.js yang sekarang sudah benar dan tidak perlu diubah.
Setelah deploy, lakukan hard refresh atau tutup lalu buka kembali tab.
