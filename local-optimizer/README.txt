PALM Local PDF Optimizer — macOS — v1.20.54

1. Ghostscript harus sudah terpasang.
2. Double-click start_palm_optimizer.command.
3. Saat pertama kali dijalankan, helper membuat sertifikat localhost dan mencoba mempercayainya di Login Keychain. Izinkan bila macOS meminta akses/password.
4. Biarkan Terminal helper tetap terbuka selama memakai Optimize File Google Drive.
5. PALM otomatis mengecek https://localhost:8765/health lalu POST /optimize.
6. Jika helper/Ghostscript tidak tersedia atau gagal, PALM otomatis fallback ke optimizer browser.
7. Helper hanya listen pada 127.0.0.1; tidak terbuka ke LAN/Internet.
8. Jika Safari masih menolak HTTPS localhost, double-click palm-localhost.crt di Keychain Access dan set Trust > Always Trust, lalu tutup/buka kembali Safari.

Catatan keamanan: file Drive baru dibuat backup setelah hasil optimasi lebih kecil dan lolos Quality Check. File original tetap memakai Drive File ID yang sama.
