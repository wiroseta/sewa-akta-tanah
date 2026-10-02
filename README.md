# v1.19.77 RC — Header/Tooltip Hotfix

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


## v1.19.63 RC — Physical-key Shortcuts + Dashboard Home Icon Fix
- Shortcut Mac sekarang membaca `KeyboardEvent.code` (KeyA/KeyP/dll), sehingga Option tidak mengubah huruf menjadi karakter khusus sebelum dispatcher membaca shortcut.
- Dashboard pada Master Properti, Master Akta, dan Master PBB memakai ikon `⌂`, bukan fallback titik.
- Mapping tombol navigasi utama memakai ID eksplisit agar tidak rusak setelah tombol sudah diubah menjadi icon-only.
- Cache-buster CSS/JS/config/manifest dinaikkan ke 1.19.63.
- Tidak ada perubahan database.


## v1.19.64 RC — Complete Button Icon Audit + Google Drive Icon
- Audit global seluruh tombol. Tidak ada lagi fallback titik/bulatan `●`.
- Semua aksi Google Drive memakai simbol Google Drive segitiga yang konsisten, termasuk buka dokumen Drive, baca dari Drive, hubungkan Drive, SPPT/PBB, sertifikat, legalitas, bangunan, agen, dan dokumen historis.
- Tombol yang dikenali memakai icon-only + tooltip fungsi + shortcut Cmd+Option (Mac) / Ctrl+Alt (non-Mac).
- Tombol yang belum bisa dipetakan secara aman mempertahankan teks, bukan simbol misterius.
- Shortcut tetap context-aware dan memakai physical KeyboardEvent.code dari v1.19.63.
- Tidak ada perubahan database/Supabase.


## v1.19.69 RC — Global Semantic Button Correction
- Audit ulang tombol di seluruh halaman: fungsi/action sekarang selalu lebih prioritas daripada nama objek.
- `Print Semua PBB` memakai ikon printer, bukan ikon SPPT/PBB.
- Export Excel memakai ikon spreadsheet; simpan/buka ke Google Drive memakai logo Google Drive.
- Tombol yang membuka URL Google Drive dideteksi sebagai Drive action meskipun labelnya hanya SPPT/Sertifikat/Dokumen.
- Tidak ada fallback titik/bulatan. Tombol yang belum terpetakan mempertahankan teks asli.
- Perubahan berlaku global pada Dashboard, Properti, PBB, Akta Sewa, Sertifikat, Legalitas, Agen, fasilitas, histori, dan dialog.
- Tidak ada perubahan database.


## v1.19.69 RC — Global Double Door Expand/Collapse Icons
- Buka Semua memakai SVG dua daun pintu terbuka.
- Tutup Semua memakai SVG dua daun pintu tertutup.
- Diterapkan global pada seluruh halaman/komponen yang memiliki Buka Semua/Tutup Semua.
- Tooltip dan shortcut tetap dipertahankan.
- Tidak ada perubahan database.


## v1.19.69 RC — Chosen Global Navigation & Open/Collapse Icons
- Properti/Lokasi: commercial building SVG (chosen option 4).
- Google Maps: map + property SVG (chosen option 6).
- PBB/SPPT: simplified SPPT-style document SVG.
- Akta Sewa: generic notarial deed-cover SVG with AKTA / PERJANJIAN SEWA, without any real notary identity/contact details.
- Buka one detail (Properti/Akta/PBB/Sertifikat): single open-door SVG.
- Buka Semua/Tutup Semua keep the chosen double-door SVG pair.
- Collapsible section headers are readable text again with summary and single-section chevron; they are excluded from icon-only conversion.
- No database migration.


## v1.19.75 RC — Master Navigation Click Fix
- Memperbaiki tiga ikon Master Properti, Master PBB, dan Master Akta Sewa yang tidak dapat diklik pada v1.19.69.
- Penyebab: MutationObserver terus menulis ulang innerHTML ikon sehingga memicu loop mutasi DOM.
- Ikon sekarang dirender satu kali dan event navigasi asli tetap aktif.
- Tidak ada perubahan database / SQL.


## v1.19.76 RC — Canonical Single-Icon Render Audit
- Menonaktifkan legacy JavaScript icon rewriters yang menumpuk ikon setelah render.
- Tombol aksi sekarang memakai satu ikon canonical dari markup/render function asal.
- Master Properti: Dashboard, Tambah, Buka Properti, Maps, dan Hapus kembali ke ukuran standar tanpa ikon ganda.
- Detail Properti: tombol kembali Master Properti dan Simpan memakai markup canonical.
- Tidak ada perubahan database.

### v1.19.76 RC CORRECTED-2
- Koreksi form Tambah/Edit PBB: ikon Simpan canonical 💾, kontrol section readable, dan Google Drive SPPT compact satu baris.
- URL Drive tetap tersimpan namun tampilan dipadatkan; tersedia Buka, Hubungkan, dan Baca/Verifikasi AI.
- Nomor versi tetap v1.19.76 RC sesuai permintaan pengguna.


## v1.19.76 RC CORRECTED-4
- Master Akta Sewa: canonical single colored icons restored for Dashboard, Add, Open/Edit and Delete.
- Prevents generic property-card icon CSS from blanking Lease action buttons.
- Same v1.19.76 version; no database migration.

### v1.19.76 RC CORRECTED-5
- Akta Sewa detail toolbar now pins to the true top of the app when the dashboard shell is hidden, with an opaque mask so scrolled content cannot leak above it.
- Removed the incorrect rainbow decoration from Google Drive labels; Drive actions retain their functional Drive/connect controls.
- Same v1.19.76 RC version; no database migration required.

## v1.19.77 RC — Approved Minimal Icon System
- Rebuilt from v1.19.76 RC CORRECTED-5 after page-by-page icon review.
- Collapsible hide/show headers contain text + chevron only; no decorative icon.
- Data/list rows do not receive decorative leading icons.
- Every add-data command uses one consistent green `+` only.
- Master-list edit/delete controls use compact single action icons.
- All browser/custom hover tooltip attributes (`title`, `data-tooltip`, related variants) are removed globally, including dynamically rendered controls.
- No database migration is required; `supabase_latest.sql` remains unchanged.


## v1.19.78 RC
Rebuilt minimal icon/action layer at source level. Removed legacy runtime icon rewriting and all hover tooltip attributes.


## v1.19.86 RC
- Fixed blank action icons caused by legacy `font-size:0` rules overriding child glyphs.
- Preserves approved minimal icon system: one icon per action, + only for add, no decorative icons on collapsible headers, no tooltips.
- No database schema change.


## v1.19.86 RC
Dashboard-only canonical header repair: SVG Properti/PBB/Akta and readable utility menu labels; removes conflicting legacy icon-only classes for these header controls.


## v1.19.86 RC
- Memperbaiki penghapusan Properti/Lokasi. Query PBB yang salah ke kolom `property_id` dihapus; schema aktif memakai `asset_id`.
- Pemeriksaan sebelum hapus mencakup Akta Sewa, PBB/SPPT, Sertifikat Tanah, Bangunan, Perizinan & Legalitas, dan Perjanjian Agen.
- Jika masih ada relasi, penghapusan diblokir dan hanya relasi yang benar-benar ada yang ditampilkan.
- Error Supabase kini menampilkan message/details/hint/code agar tidak lagi kosong setelah tanda titik dua.
- Header/SVG v1.19.85 dipertahankan. Tidak ada perubahan SQL.


## v1.19.87 RC — Lease/Property Relation Consistency + Header Return Fix
- Master Akta Sewa sekarang menghitung “hak tanah” dari tabel relasi `lease_land_titles`, bukan dari JSON hasil AI lama `contracts.land_rights`.
- Relasi hak tanah yang menunjuk sertifikat milik properti lain / sertifikat yang sudah tidak ada ditandai “perlu diperiksa”; tidak dihapus otomatis.
- Detail Akta menampilkan peringatan relasi lama yang tidak sesuai Properti/Lokasi terpilih. Menyimpan Akta setelah memilih sertifikat yang benar akan memperbarui relasi melalui mekanisme relasi yang sudah ada.
- Kembali dari Detail Akta ke Master Akta memulihkan `appShell` sehingga header global tidak hilang.
- Tidak ada perubahan schema/SQL. Header SVG v1.19.85 dan Property Delete Fix v1.19.86 dipertahankan.


## v1.19.91 RC
- Menyederhanakan tombol ekspansi relasi Sertifikat dan PBB pada Detail Akta menjadi tombol + / − compact.
- Fungsi pemilihan/relasi dari v1.19.88 tetap sama; hanya tampilan kontrol yang disederhanakan.


## v1.19.93 RC — Current Land-Title Holder Chronology Fix
- Pembacaan AI Sertifikat/Akta Tanah sekarang wajib membaca seluruh halaman dan menelusuri catatan peralihan hak secara kronologis.
- `holderName` berarti pemegang hak terakhir/terkini setelah jual beli/peralihan terakhir, bukan otomatis nama pada halaman identitas awal.
- Perpanjangan HGB, hak tanggungan, roya, atau catatan administratif yang tidak mengalihkan hak tidak mengganti pemegang hak.
- Pemegang sebelumnya dan riwayat peralihan penting dipertahankan di `notes` bila benar-benar terlihat pada dokumen.
- Kasus uji HGB 16 BSB Kecil: pemegang awal PT Karyadeka Alam Lestari + Jual Beli 28-07-2003 kepada Lim Ai Tijen Mariani => pemegang hak terkini harus Lim Ai Tijen Mariani.
- Tidak ada perubahan database/schema.


## v1.19.94 RC — Certificate AI Reader Alignment Fix
- Menyatukan kontrol File Sertifikat, Baca, koneksi Google Drive, dan Baca dari Google Drive dalam satu toolbar responsif.
- Desktop: keempat kontrol sejajar satu baris. Tablet/ponsel: wrap terkontrol tanpa tombol terserak.
- Tidak mengubah data model, SQL, atau pipeline AI v1.19.93.


## v1.19.96 RC — Land Area Source Lock + Reader Compact Fix
- Ekstraksi luas sertifikat dikunci ke label `Luas` pada bagian Surat Ukur/data fisik sertifikat yang sama.
- Format luas Indonesia dengan titik sebagai pemisah ribuan ditegaskan: `6.159 m²` = `6159`.
- Final consolidation memprioritaskan luas Surat Ukur dibanding angka lain dari halaman lain.
- Toolbar reader sertifikat dirapikan: File, Baca, ikon koneksi Drive, dan Baca dari Google Drive berada dalam satu baris proporsional pada desktop dan wrap teratur di layar kecil.
- Tidak ada perubahan database/SQL pada versi ini.


## v1.19.99 RC — Rebuilt Land Certificate UX + Current Holder AI
- Rebuilt from v1.19.96 because v1.19.97 artifact was unavailable.
- Dynamic compact/expand fields for address and certificate notes.
- NIB separated from certificate notes in UI while remaining backward-compatible with existing notes storage.
- AI output separates NIB and notes and reinforces full-document chronology for current holder.

## v1.20.00 RC — Automatic Google Drive Read/Reconnect
- Tombol koneksi Google Drive terpisah dihapus dari reader Akta Sewa, Sertifikat Tanah, PBB/SPPT, dokumen tambahan, dan dokumen historis.
- Tombol Baca dari Google Drive kini memeriksa sesi secara otomatis: sesi valid langsung membaca; sesi tidak ada/kedaluwarsa meminta OAuth lalu otomatis melanjutkan pembacaan.
- Jika API mengembalikan kegagalan autentikasi/401 saat membaca, token lama dibersihkan, koneksi diminta ulang, lalu pembacaan dicoba kembali satu kali secara otomatis.
- Reader Bangunan, Perizinan, Agen, dan Verifikasi Ulang Akta juga memakai helper auto-auth yang sama.
- Tidak ada perubahan database/SQL dan tidak ada perubahan Edge Function.


## v1.20.01 RC — Latest Land-Title Holder Chronology Fix
- AI land-title reading now extracts ownership events from every page (initial holder, sale/purchase, gift, inheritance, auction, name change, other transfers, extension, mortgage, roya, administrative notes).
- Final whole-document consolidation sorts the complete chronology and uses the recipient of the latest true ownership transfer as `holderName`.
- Extensions, mortgage/roya, and administrative entries cannot overwrite or revert the latest holder.
- Keeps v1.20.00 automatic Google Drive read/reconnect behavior and UI changes.


## v1.20.03 RC — Transfer-table holder fix + aligned holder layout
- Hardened land-title AI to interpret Indonesian transfer-registration tables by column: for JUAL BELI/ownership transfer, the recipient in `Nama yang berhak` is the current holder unless a later ownership transfer exists.
- Later HGB extension/renewal changes validity only and must not revert the holder.
- Address and Nama Pemegang Hak are again side-by-side at equal initial height; both remain dynamically expandable.


## v1.20.06 RC — Certificate chronology, notes & Survey Number validation
- Pemegang hak final kini memiliki deterministic chronology guard dari seluruh ownershipEvents; event perpanjangan/HT/roya/administratif tidak dapat mengembalikan nama pemegang lama.
- Catatan Sertifikat wajib menyimpan kronologi faktual peralihan; fallback dibangun dari ownershipEvents lengkap dengan halaman sumber bila AI final mengosongkannya.
- Nomor Surat Ukur diperketat: hanya berasal dari bagian Surat Ukur, bukan nomor sertifikat/NIB/akta/pembukuan/peralihan.
- Layout Alamat / Lokasi Bidang dan Nama Pemegang Hak tetap sejajar; field dinamis tetap dipertahankan.
- Perubahan ini memerlukan deploy ulang Edge Function extract-lease. Tidak ada perubahan database/SQL.


## v1.20.07 RC — Adaptive Visual Verification
- Sertifikat Tanah dan Akta Sewa dirender resolusi tinggi.
- Setiap halaman diverifikasi memakai versi warna asli dan grayscale/high-contrast.
- Nama, nomor, tanggal, luas, NIB dan Surat Ukur wajib dibaca karakter demi karakter tanpa autocorrect/tebakan.
- Field yang tetap ambigu harus ditandai perlu verifikasi, bukan dihalusinasikan.


## v1.20.09 RC — Conflict-Safe Visual Verification
- Menghapus aturan bahwa halaman SURAT UKUR otomatis mengalahkan halaman lain saat transkripsi nomor/tanggal/luas bertentangan.
- Konflik karakter pada nama, nomor, tanggal, luas dan NIB sekarang harus ditandai PERLU VERIFIKASI; field final tidak boleh dipilih hanya berdasarkan source hierarchy.
- Catatan Sertifikat tidak boleh menyimpan reasoning internal seperti “data halaman X digunakan”.
- Adaptive color + grayscale/high-contrast verification v1.20.07 tetap dipertahankan.
- Tidak ada perubahan database/SQL.


## v1.20.09 RC — Field Crop Verification + Monochrome Location Pin
- Sertifikat Tanah: physical overlapping high-resolution field crops are sent with original color and grayscale/high-contrast pages to improve literal reading of names, NIB, Surat Ukur, dates, and small identifiers.
- Google Maps/open-location commands use a monochrome location-pin SVG globally (black on white; currentColor permits white on active blue buttons).
- Local certificate AI button label changed from “Baca” to “Baca File”.
- No database migration is required.


## v1.20.10 RC — Canonical Verified Data + Global Monochrome Map Pin
- Sertifikat: hasil final menggunakan canonical verified data; field konflik tidak boleh diisi dengan kandidat ketiga/hasil lama.
- Pemegang awal tidak boleh menjadi pemegang terkini bila ada peralihan yang penerimanya belum terverifikasi.
- Keterangan luas properti yang berbentuk ringkasan otomatis `Luas tanah ... m²` direkonsiliasi dari luas sertifikat terverifikasi; catatan manual lain tidak ditimpa.
- Semua tombol Google Maps memakai SVG location pin monokrom, tanpa emoji merah/peta/panah eksternal.
- Tombol baca file tetap `Baca File`.


## v1.20.12 RC — Lease AI Stability / Single-Image Page Pipeline
- Akta Sewa now sends exactly one balanced-resolution image per PDF page instead of color + grayscale variants.
- Heavy high-resolution + grayscale + physical field crops remain exclusive to Sertifikat Tanah.
- Whole-document lease consolidation remains enabled.
- Edge Function adds explicit OpenAI start/HTTP-response/completion logs and a 50-second per-request timeout so failures are diagnosable instead of silent shutdowns.
- No database migration.


## v1.20.13 — OpenAI API cost / credit estimate
Dashboard dapat membaca biaya OpenAI organisasi bulan berjalan melalui OpenAI Costs API secara server-side.

Supabase Secrets opsional:
- `OPENAI_ADMIN_KEY`: Admin API key OpenAI (Organization Owner), diperlukan oleh Costs API. Jangan taruh key ini di browser/config.js.
- `OPENAI_CREDIT_BUDGET_USD`: angka USD yang ingin dipakai sebagai basis estimasi sisa kredit, contoh `10`. Karena OpenAI tidak menyediakan endpoint publik saldo prepaid aktual pada API Reference, nilai sisa yang tampil diberi label **Estimasi sisa kredit**.

Jika `OPENAI_ADMIN_KEY` belum diset, aplikasi tetap berjalan normal dan Dashboard menampilkan petunjuk konfigurasi serta link Billing OpenAI. Tidak ada perubahan database/SQL.


## v1.20.14 — OpenAI API status tanpa estimasi saldo
- Menghapus ketergantungan `OPENAI_ADMIN_KEY` dan `OPENAI_CREDIT_BUDGET_USD` dari Dashboard.
- Menghapus estimasi saldo/kredit agar aplikasi tidak menampilkan angka yang dapat berbeda dari saldo prepaid aktual OpenAI.
- Dashboard menampilkan jumlah scan AI lokal, status OpenAI API, dan tombol **Lihat saldo OpenAI** menuju halaman Billing resmi OpenAI.
- `OPENAI_API_KEY` tetap dipakai hanya server-side untuk pembacaan AI dokumen.
- Seluruh perbaikan v1.20.12 Lease AI Stability tetap dipertahankan.
- Tidak ada perubahan database/SQL.

## v1.20.18 RC — Payment Type Separation
- Jadwal kewajiban dan pembayaran aktual kini memiliki jenis: Sewa, Security Deposit, Penggantian PBB, Lainnya.
- Security Deposit/PBB tidak masuk rekonsiliasi harga sewa dan tidak otomatis dikenai PPh sewa.
- Pembayaran aktual dialokasikan FIFO hanya ke kewajiban dengan jenis yang sama; kelebihan pembayaran dicatat apa adanya.
- Dashboard memberi peringatan sesuai jenis kewajiban, bukan menyebut semua sebagai pembayaran sewa.
- Mempertahankan alias dropdown aset dan textarea dinamis v1.20.15.
- Tidak memerlukan perubahan database/SQL baru.


## v1.20.18
- Riwayat Pembayaran Aktual menambahkan pilihan Untuk Pembayaran yang menghubungkan transaksi aktual ke termin/kewajiban tertentu.
- Pilihan manual mengalahkan FIFO; Otomatis tetap memakai FIFO dalam jenis pembayaran yang sama.
- Target pembayaran tersimpan bersama transaksi tanpa perubahan schema SQL.


## v1.20.18 RC
- Memperjelas tiga tombol di bawah Klausul Penting: `+ Klausul`, `Riwayat & Bandingkan Akta`, dan `+ Akta Lama / Dokumen Historis`.
- Ketiga tombol tidak lagi diringkas menjadi ikon § / jam / centang dan tidak memakai tooltip.
- Tidak ada perubahan SQL.


## v1.20.19 RC — Lease Object Address & Area Consolidation
- Memperketat whole-document AI agar alamat objek sewa dicari dan digabung lintas halaman.
- Luas tanah sertifikat tidak boleh otomatis menjadi luas tanah menurut Akta Sewa.
- Rincian luas bangunan wajib dipertahankan; total hanya dihitung bila komponen lengkap dan jelas dapat dijumlahkan.
- Bila total luas belum pasti, field luas ditampilkan kosong (bukan 0) dan kandidat luas masuk catatan/peringatan verifikasi.
- Tidak ada perubahan database/SQL pada versi ini.


## v1.20.21 RC — General Other Payments & Ledger Row Persistence
- Jenis `Penggantian PBB` digabung menjadi `Pembayaran Lain-lain`; tujuan pembayaran ditulis pada Keterangan/Catatan.
- Data lama dengan kind `pbb`/`pbb_reimbursement` tetap kompatibel dan ditampilkan sebagai Pembayaran Lain-lain.
- Baris Pembayaran Aktual yang baru tidak lagi hilang saat jenis diubah ke Security Deposit sebelum tanggal/jumlah diisi.
- Hanya Sewa yang masuk rekonsiliasi harga sewa/PPh.

## v1.20.26 RC — One-Line Payment Layout
- Jadwal pembayaran desktop: Jenis | Tanggal | Nominal | Keterangan dinamis | − dalam satu baris.
- Riwayat pembayaran aktual desktop: Jenis | Tanggal | Nominal | PPh | Metode/Bank | Referensi/Bukti | Catatan dinamis | − dalam satu baris.
- Tombol hapus memakai tanda − saja.
- Field target/termin manual disembunyikan dari alur normal; pencocokan Sewa memakai FIFO. Mekanisme targetId lama tetap dipertahankan untuk kompatibilitas data.
- Security Deposit dan Pembayaran Lain-lain tidak masuk rekonsiliasi sewa.
- Tidak ada perubahan database/SQL.


## v1.20.26 RC — Collapsible Lease Objects
- Objek yang Dicakup Akta Sewa kini memakai header biru yang dapat hide/show.
- Header menampilkan ringkasan jumlah sertifikat, bangunan, PBB, dan fasilitas.
- Status buka/tutup disimpan lokal agar konsisten saat halaman dibuka kembali.


## v1.20.29 RC — Payment Header & Dynamic Notes Definitive Fix
- Header Jadwal dan Riwayat memakai grid kolom yang sama persis dengan baris data.
- Keterangan/Catatan compact normal, expand saat pointer/focus, compact kembali saat pointer keluar/blur.
- Header Jadwal tetap biru saat ada peringatan.

## v1.20.31 RC — Payment Table Responsive Grid Correction
- Corrected the payment schedule and payment history layout so headers and fields use the same fluid grid.
- Removed the 900px stacking breakpoint that caused Mac/tablet-sized windows to become vertical; stacking now occurs only on phone widths below 600px.
- Keterangan and Catatan stay compact at rest and expand to their full content on hover/focus, then collapse again on pointer leave/blur.
- Keterangan no longer reserves an excessively wide fixed column; its width is proportional to the available row width.


## v1.20.32 RC — Indonesian Area Format & Dynamic Asset Address
- Luas tanah/bangunan Akta Sewa ditampilkan dalam format Indonesia (contoh 20.928,21 dan 14.963,96), tetap disimpan numerik.
- Alamat aset dapat diedit dan auto-expand mengikuti seluruh isi tanpa kembali memotong teks.
- Tidak ada perubahan database/SQL. Semua aturan payment page v1.20.31 dipertahankan.
