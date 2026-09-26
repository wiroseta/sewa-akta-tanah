Sewa & Akta Tanah v1.15

Baseline: v1.14.
Fitur baru:
- Hak Tanah/HGB dapat memiliki link Google Drive dan Google Maps sendiri.
- Multiple Dokumen Tanah: Akta Tanah, AJB, Surat Ukur, KRK/KKPR, PBG/IMB, Site Plan, perpanjangan HGB, dll.
- Data PBB/SPPT: NOP, tahun, NJOP, PBB, jatuh tempo, status, Drive, Maps.
- Fasilitas/utilitas: PLN, Telkom/IndiHome, PDAM, internet, keamanan, IPL, telepon/custom; ID pelanggan, meter/layanan, telepon, nama, paket/daya, kontak, catatan, Drive, Maps.
- Akta sewa tetap memakai Link Dokumen/Google Drive dan Google Maps dari v1.14.

Sebelum memakai fitur baru, jalankan supabase_v115_migration.sql di Supabase SQL Editor.
Edge Function extract-lease tetap dapat memakai v1.13; tidak perlu deploy ulang untuk fitur ini.
