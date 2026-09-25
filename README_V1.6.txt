SEWA & AKTA TANAH v1.6 - DIAGNOSTIC LOGIN

Tujuan versi ini: memastikan login Supabase bekerja sebelum PWA/service worker diaktifkan kembali.

Perubahan:
- Login menampilkan status 1/4 sampai 4/4.
- Session hasil signInWithPassword langsung dipakai untuk membuka dashboard.
- Timeout 15 detik agar tidak berhenti tanpa informasi.
- Service worker lama di-unregister dan cache lama dibersihkan otomatis.
- Tampilan login/dashboard dipaksa berganti secara eksplisit.

UPLOAD KE GITHUB:
Ganti seluruh file aplikasi dengan isi folder ini. config.js sudah mempertahankan URL/key dari repository yang Anda upload.
Setelah commit dan Pages selesai deploy, tutup semua tab situs lalu buka kembali.
