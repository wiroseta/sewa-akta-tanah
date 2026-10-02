PALM Local PDF Optimizer — macOS — v1.20.57

AUTO-START (direkomendasikan)
1. Ghostscript harus sudah terpasang (PALM memakai /opt/homebrew/bin/gs pada Apple Silicon).
2. Double-click install_autostart.command satu kali.
3. Installer menyalin helper ke lokasi permanen:
   ~/Library/Application Support/PALM/LocalOptimizer
4. Installer memasang LaunchAgent user:
   ~/Library/LaunchAgents/com.palm.local-pdf-optimizer.plist
5. Setelah itu helper otomatis hidup setiap kali user login setelah Mac restart. Terminal tidak perlu dibiarkan terbuka.
6. Jika helper berhenti/crash, launchd akan menjalankannya kembali.
7. Log:
   ~/Library/Logs/PALM/local-optimizer.log
   ~/Library/Logs/PALM/local-optimizer-error.log
8. Untuk mengecek status kapan saja, double-click check_autostart.command.
9. Untuk melepas auto-start, double-click uninstall_autostart.command.

MODE MANUAL
- start_palm_optimizer.command tetap tersedia untuk diagnosis/manual run.
- Jangan menjalankan mode manual bersamaan dengan LaunchAgent karena keduanya memakai port 8765.

KEAMANAN
- Helper hanya listen pada 127.0.0.1:8765; tidak terbuka ke LAN/Internet.
- HTTPS memakai sertifikat localhost yang dipercaya di Login Keychain user.
- PALM otomatis mengecek https://localhost:8765/health lalu POST /optimize.
- Jika helper/Ghostscript tidak tersedia atau gagal, PALM tetap dapat fallback ke optimizer browser.
- File Drive baru dibuat backup setelah hasil optimasi lebih kecil dan lolos Quality Check. File original tetap memakai Drive File ID yang sama.
