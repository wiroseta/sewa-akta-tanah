# Sewa & Akta Tanah v1.19.52 RC — PBB Relation by NOP

Perubahan v1.19.52:
- Selector Hubungkan PBB ke Properti menampilkan satu baris per NOP, bukan per tahun.
- Tahun PBB tidak ditampilkan pada selector relasi.
- Alias/nama, NOP, dan alamat tetap searchable.
- Terapkan relasi NOP menghubungkan/melepas seluruh histori tahun dengan NOP yang sama.
- Ringkasan PBB pada Properti menampilkan satu kartu per NOP.
- Histori tahunan PBB tetap tersimpan dan tidak dihapus.
- Tidak ada perubahan schema SQL pada v1.19.52.

# Sewa & Akta Tanah v1.19.51 RC — Property Relations + In-Deed Search

Koreksi packaging: badge versi aplikasi, cache-buster index.html, dan start_url manifest sekarang seluruhnya menunjuk ke v1.19.51.

Fitur v1.19.51:
- Hubungkan PBB yang sudah ada ke Master Properti.
- Hubungkan Akta Sewa yang sudah ada ke Master Properti.
- Pencarian di dalam satu lokasi/properti mencakup relasi terkait.
- Pencarian di dalam Detail Akta Sewa dengan navigasi hasil.

Jalankan `supabase_latest.sql` sekali untuk perubahan relasi PBB -> properti.

## v1.19.51 RC — Indonesian Format Consistency Audit
- Normalisasi format Indonesia kini diterapkan kembali saat data lama dibaca dari database, bukan hanya saat hasil AI baru masuk.
- Ringkasan Klausul Penting, catatan, metadata pembayaran, histori/preview, data properti dan teks PBB yang relevan memakai normalizer yang sama.
- Angka uang mentah di kalimat finansial (contoh `9405000000`) ditampilkan sebagai Rupiah dengan pemisah ribuan Indonesia (contoh `Rp9.405.000.000`).
- Luas yang tertanam dalam teks memakai pemisah ribuan Indonesia dan `m²`; tanggal ISO di dalam teks menjadi `DD-MM-YYYY`.
- Normalisasi bersifat display/load-safe untuk data lama; penyimpanan Akta tetap menormalisasi teks agar hasil konsisten pada penyimpanan berikutnya.
- Tidak ada perubahan schema SQL untuk v1.19.51.


## v1.19.51 RC — Alias in Relation Pickers
- Selector Hubungkan PBB menampilkan alias sebagai identitas utama bila tersedia.
- NOP, tahun dan alamat tetap tampil sebagai informasi pendukung.
- Pencarian selector tetap mencakup alias.
- Pola alias-first diterapkan juga pada selector Akta/relasi yang memiliki alias.
- Tidak ada perubahan schema SQL.


## v1.19.54 RC — Compact Sticky Actions
- Navigasi utama dibuat compact dan sticky agar tidak hilang saat scroll.
- Batal/Simpan/Terapkan dipindahkan ke area atas dan tetap mudah diakses.
- Berlaku pada Akta, Properti, PBB, dan dialog/popup.
- Mobile/iPhone menggunakan layout lebih ringkas; menu utama memprioritaskan ikon dan kontrol penting.
- Tidak ada perubahan schema SQL.


## v1.19.55 RC — True Global Fixed Navigation
- Header/menu utama sekarang fixed ke viewport, bukan sticky terhadap container.
- Menu Properti/Lokasi, PBB, Akta Sewa dan Menu tetap terlihat saat scroll panjang.
- Detail Properti dan Detail Akta memakai offset di bawah global header sehingga tidak bertumpuk.
- Search bar/master action bar ikut menyesuaikan offset sticky.
- Layout mobile/iPhone menggunakan tinggi header lebih ringkas.
- Tidak ada perubahan SQL/database.


## v1.19.56 RC — Clear Button Theme & Compact Property Actions
- Secondary buttons now use a white surface, visible border and dark text so they no longer look disabled.
- Disabled buttons have a separate muted visual state.
- Destructive actions use a restrained red outline.
- Property Back / title / context / Cancel / Save are kept in one compact sticky row on desktop.
- On narrow iPhone layouts, Cancel is omitted from the row (Back provides the cancel/exit path) while Save remains immediately accessible.
- No database or SQL change.

## v1.19.57 RC — Legalitas, Agen Properti & Compact AI
- Menambah Perizinan & Legalitas per properti: Bangunan, Tanah & Peralihan, Tata Ruang, Lingkungan, Air Tanah/Utilitas, Sewa, Izin Usaha/Operasional, dan custom.
- Menambah tanggal terbit/mulai/berakhir, issuer, holder, status, relasi objek, Drive, catatan/kewajiban.
- Menambah Perjanjian Agen/Broker: identitas agen/PIC, izin/kompetensi, periode, transaksi, eksklusivitas, nilai transaksi, %/nominal komisi, pembayar, status/tanggal bayar, payment terms, tail period/klausul, Drive dan bukti bayar.
- Compact AI controls dan label Hapus yang eksplisit menggantikan tombol minus ambigu.
- `supabase_latest.sql` hanya migration v1.19.57; history ditambahkan ke `supabase_schema_history.sql`.
- Pembacaan AI file dan Google Drive memakai documentType permit dan agent_agreement melalui Universal Document Reader yang sama; hasil tetap wajib diverifikasi sebelum disimpan.

## v1.19.58 RC — iPhone Responsive & Page Structure Fix
- Memperbaiki global/fixed navigation dan detail topbar agar tidak menutupi konten atau muncul kembali di tengah halaman saat scroll.
- Memperbaiki overflow horizontal pada Data Sertifikat, file picker, tombol AI/Google Drive, card, form, dan nested grid di iPhone.
- Mencegah installer collapsible Akta lama membungkus ulang form yang sudah diproses, untuk menghindari struktur halaman ganda/aneh.
- Membuat header, pencarian, Buka/Tutup Semua, summary dan section Akta lebih compact pada mobile tanpa mengecilkan keterbacaan data.
- Tidak ada perubahan database pada build ini.


## v1.19.62 RC — Compact Akta Command Bar & Shortcuts
- Menghilangkan tombol Kembali ganda pada header Detail Akta.
- Navigasi Kembali dan Simpan Akta dipadatkan ke command bar atas dengan ikon, label singkat, tooltip saat hover/focus, dan aksesibilitas aria-label.
- Shortcut: Cmd+Option+K untuk Kembali dan Cmd+Option+S untuk Simpan Akta (Ctrl+Alt juga didukung).
- Huruf shortcut digarisbawahi pada label desktop; pada iPhone label disembunyikan sehingga hanya ikon compact yang tampil.
- Tidak ada perubahan database/Supabase.

## v1.19.62 RC — Global Compact Command System
- Menerapkan pola command bar v1.19.59 ke seluruh aplikasi: tombol lebih compact dan layout action konsisten.
- Tombol fungsi utama diberi ikon, tooltip saat hover, dan shortcut Cmd+Option (Mac) / Ctrl+Alt.
- Huruf shortcut digarisbawahi pada label desktop.
- Pada iPhone, tombol navigasi sederhana menjadi icon-first untuk menghemat ruang; fungsi tetap tersedia melalui aria-label/title.
- Tidak mengubah ID tombol atau event listener lama.
- Tidak ada perubahan database pada build ini.


## v1.19.62 RC — Global Icon Command System
- Seluruh tombol program memakai icon-only yang compact dengan aria-label dan tooltip fungsi.
- Semua tombol memperoleh shortcut Cmd+Option+huruf (Ctrl+Alt pada non-Mac), dipilih secara context-aware.
- Tombol dengan fungsi umum memakai ikon konsisten: simpan, kembali, tambah, cari, hapus, AI, Drive, print, export, riwayat, Maps, dan lain-lain.
- Existing button ID dan event listener dipertahankan. Tidak ada perubahan database.


## v1.19.62 RC — Shortcut Reliability & Dashboard Home Icon
- Tombol kembali ke Dashboard memakai ikon `⌂` (Home), bukan titik/menu.
- Dispatcher shortcut lama v1.19.59/v1.19.60 dinonaktifkan agar tidak berebut shortcut dengan sistem global.
- Cmd+Option+A sekarang secara eksplisit membuka Akta Sewa dari Dashboard; P=Properti, B=PBB, M=Menu, D=Dashboard jika tombol Dashboard aktif.
- Shortcut tetap context-aware pada dialog/detail/page aktif.
- Tooltip diposisikan di bawah tombol agar terlihat pada header paling atas. Setelah shortcut keyboard dijalankan, tooltip fungsi/shortcut muncul singkat sebagai feedback.
