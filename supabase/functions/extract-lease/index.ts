import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
function subtractNotice(endDate:string,value:number,unit:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(endDate||''))||!Number.isFinite(value)||value<=0)return "";
 const [y,m,d]=endDate.split('-').map(Number); let dt:Date;
 if(unit==='day'||unit==='days')dt=new Date(Date.UTC(y,m-1,d-value));
 else if(unit==='week'||unit==='weeks')dt=new Date(Date.UTC(y,m-1,d-(value*7)));
 else if(unit==='month'||unit==='months'){
   const total=y*12+(m-1)-value, ty=Math.floor(total/12), tm=((total%12)+12)%12;
   const last=new Date(Date.UTC(ty,tm+1,0)).getUTCDate(); dt=new Date(Date.UTC(ty,tm,Math.min(d,last)));
 } else if(unit==='year'||unit==='years'){
   const ty=y-value,last=new Date(Date.UTC(ty,m,0)).getUTCDate(); dt=new Date(Date.UTC(ty,m-1,Math.min(d,last)));
 } else return "";
 return dt.toISOString().slice(0,10);
}
serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});let stage="request";try{
 console.log("[extract-lease v1.19.18] request received");
 const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw new Error("OPENAI_API_KEY belum diset di Supabase Secrets");
 let {filename,mimeType,base64,images,documentType='lease',driveFileId,driveAccessToken,pageStart,pageEnd,totalPages,comparisonData,pageResults}=await req.json();
 if(!base64&&driveFileId){
   stage="drive-auth"; console.log("[extract-lease] Drive request", {driveFileId, documentType, hasToken:!!driveAccessToken});
   if(!driveAccessToken)throw new Error("Token Google Drive tidak tersedia");
   stage="drive-metadata"; console.log("[extract-lease] reading Drive metadata");
   const metaRes=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveFileId)}?fields=id,name,mimeType,size&supportsAllDrives=true`,{headers:{Authorization:`Bearer ${driveAccessToken}`}});
   if(!metaRes.ok)throw new Error(`Tidak dapat membaca metadata Google Drive (${metaRes.status})`);
   const meta=await metaRes.json(); console.log("[extract-lease] Drive metadata OK", {name:meta.name,mimeType:meta.mimeType,size:meta.size});
   const size=Number(meta.size||0); const maxDriveBytes=500*1024*1024;
   if(size>maxDriveBytes)throw new Error("File Google Drive lebih dari 500 MB.");
   if(String(meta.mimeType||'').startsWith('application/vnd.google-apps.'))throw new Error("Gunakan file PDF/JPG/PNG di Google Drive, bukan Google Docs/Sheets.");
   stage="drive-download"; console.log("[extract-lease] downloading Drive file");
   const fileRes=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveFileId)}?alt=media&supportsAllDrives=true`,{headers:{Authorization:`Bearer ${driveAccessToken}`}});
   if(!fileRes.ok)throw new Error(`Tidak dapat mengunduh file Google Drive (${fileRes.status})`);
   const bytes=new Uint8Array(await fileRes.arrayBuffer());
   if(bytes.byteLength>maxDriveBytes)throw new Error("File Google Drive lebih dari 500 MB.");
   let binary=""; const chunk=0x8000;
   for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)));
   base64=btoa(binary); console.log("[extract-lease] Drive download OK", {bytes:bytes.byteLength}); filename=meta.name||filename||'drive-file.pdf'; mimeType=meta.mimeType||mimeType||'application/pdf';
 }
 if(documentType==='whole_document_consolidate'){
   stage="whole-document-consolidation";
   if(!Array.isArray(pageResults)||!pageResults.length)throw new Error("Hasil pembacaan halaman belum tersedia untuk konsolidasi dokumen");
   const consolidationPrompt=`Anda adalah pemeriksa akhir dokumen hukum Indonesia. Anda menerima hasil ekstraksi SEMUA halaman dari SATU dokumen. Jangan memperlakukan hasil halaman pertama sebagai hasil final. Rekonstruksi dokumen secara keseluruhan, hubungkan fakta lintas halaman, hilangkan duplikasi, dan lakukan validasi aritmetika serta kronologi.

ATURAN WAJIB UNTUK AKTA SEWA:
1. Tentukan jangka waktu kontrak dari seluruh dokumen (start sampai end).
2. Cari SEMUA periode harga sewa yang berada di dalam jangka waktu tersebut. Harga dapat sama atau berubah tiap tahun/periode.
3. rentPeriods harus memuat setiap periode secara terpisah: start, end, gross, tax, net, sourcePage. Jangan mengasumsikan harga tahun pertama berlaku untuk tahun lain kecuali dokumen memang menyatakannya.
4. totalContractRent/rent/rentGross adalah JUMLAH BRUTO seluruh periode sewa dalam kontrak, bukan harga satu tahun/termin. rentTaxAmount adalah total PPh seluruh periode dan rentNet adalah total netto seluruh periode.
5. payments harus berisi SEMUA termin pembayaran dari seluruh periode, tanpa duplikasi. Jumlah termin bruto harus direkonsiliasi dengan totalContractRent bila dokumen memungkinkan.
6. Jika kontrak 5 tahun tetapi hanya satu periode harga ditemukan, atau ada celah periode yang tidak terjelaskan, extractionComplete=false dan validationWarnings harus menjelaskan kekurangannya. Jangan menyatakan hasil lengkap.
7. Untuk PPh Final sewa tanah/bangunan gunakan tarif yang dinyatakan dokumen; bila dokumen menyebut harga sudah termasuk PPh dan tidak menyebut tarif lain, gunakan default 10% dari bruto. Jangan mengubah fakta kontraktual yang tertulis.
8. priorDeeds harus menggabungkan SEMUA Akta/Addendum/perjanjian sebelumnya yang disebut di halaman mana pun, dengan nomor, tanggal, jenis, notaris/keterangan, dan halaman sumber bila tersedia.
9. Klausul, rekening, hak tanah, pihak, objek, perpanjangan, denda, PBB, dan informasi penting lain harus dikonsolidasikan lintas halaman. Jangan hilangkan fakta hanya karena muncul di halaman yang berbeda.
10. Jangan mengarang. Bila dua halaman bertentangan, tandai validationWarnings.

Kembalikan HANYA JSON valid dengan struktur:
{"tenant":"","lessor":"","asset":"","propertyAddress":"","propertyArea":"","leaseLandArea":0,"leaseBuildingArea":0,"deedNo":"","deedDate":"","start":"","end":"","rent":0,"totalContractRent":0,"rentTaxMode":"gross_includes_tax|net_excludes_tax|no_withholding","rentTaxRate":10,"rentTaxAmount":0,"rentGross":0,"rentNet":0,"taxClause":"","taxTreatment":"","taxNeedsVerification":false,"deposit":0,"renewalNotice":"","renewalNoticeValue":0,"renewalNoticeUnit":"","renewalNoticeText":"","renewalNoticePage":"","renewalTerm":"","sourcePages":"","notes":"","extractionComplete":true,"validationWarnings":[],"rentPeriods":[{"start":"","end":"","gross":0,"tax":0,"net":0,"sourcePage":""}],"contacts":[{"role":"","name":"","phone":"","email":""}],"bankAccounts":[{"purpose":"","bank":"","account":"","holder":""}],"landRights":[{"type":"","number":"","area":"","end":""}],"payments":[{"due":"","amount":0,"label":""}],"clauses":[{"title":"","detail":"","page":"","importance":"Penting|Normal"}],"priorDeeds":[{"documentType":"","deedNo":"","deedDate":"","notary":"","label":"","sourcePage":""}]}.
Semua tanggal YYYY-MM-DD dan semua uang angka tanpa Rp/pemisah.

HASIL SEMUA HALAMAN (${pageResults.length} halaman/batch):\n${JSON.stringify(pageResults)}`;
   const rr=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6",input:consolidationPrompt})});
   const raw=await rr.json();if(!rr.ok)throw new Error(raw?.error?.message||`OpenAI error ${rr.status}`);
   const tx=raw.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==="output_text")?.text||raw.output_text||"";
   let clean=String(tx).trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();let data;try{data=JSON.parse(clean)}catch{throw new Error("AI mengembalikan konsolidasi dokumen yang bukan JSON valid")}
   if(Array.isArray(data.rentPeriods)&&data.rentPeriods.length){
     const gross=data.rentPeriods.reduce((n:any,x:any)=>n+Number(x?.gross||0),0),tax=data.rentPeriods.reduce((n:any,x:any)=>n+Number(x?.tax||0),0),net=data.rentPeriods.reduce((n:any,x:any)=>n+Number(x?.net||0),0);
     if(gross>0){data.totalContractRent=gross;data.rent=gross;data.rentGross=gross;data.rentTaxAmount=tax;data.rentNet=net||Math.max(0,gross-tax)}
   }
   const noticeValue=Number(data?.renewalNoticeValue||0),noticeUnit=String(data?.renewalNoticeUnit||'').toLowerCase();
   if(data?.end&&noticeValue>0&&noticeUnit){const calculated=subtractNotice(String(data.end),noticeValue,noticeUnit);if(calculated)data.renewalNotice=calculated}
   return new Response(JSON.stringify({data}),{headers:{...cors,"Content-Type":"application/json"}});
 }
 if(documentType==='history_compare'){
   stage="openai-compare";
   if(!comparisonData?.old||!comparisonData?.new)throw new Error("Data perbandingan tidak lengkap");
   const comparePrompt=`Bandingkan dua versi dokumen hukum/properti Indonesia berikut secara netral dan teliti. Jangan menyimpulkan klausul lama masih berlaku hanya karena tidak ada di dokumen baru. Jika klausul lama tidak ditemukan di dokumen baru, tandai perlu verifikasi. Jika dokumen baru secara eksplisit menyatakan klausul/akta lama tetap berlaku, masukkan ke explicitlyCarriedForward. Untuk sertifikat tanah, bandingkan jenis hak, nomor, luas, NIB, surat ukur, pemegang hak, masa berlaku, dan lokasi. Untuk akta sewa, bandingkan pihak, objek, jangka waktu, nilai sewa, pembayaran, deposit, perpanjangan, pemeliharaan, pajak, sublease/pengalihan, pengakhiran, force majeure, serah terima, sengketa, dan klausul penting. Kembalikan HANYA JSON valid: {"summary":"","changes":[{"topic":"","oldValue":"","newValue":"","note":""}],"missingFromNew":[{"topic":"","oldText":"","source":""}],"explicitlyCarriedForward":[{"topic":"","reason":""}]}.

JENIS: ${comparisonData.entityType||''}
DOKUMEN LAMA:
${JSON.stringify(comparisonData.old)}

DOKUMEN BARU:
${JSON.stringify(comparisonData.new)}`;
   const rr=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6",input:comparePrompt})});
   const raw=await rr.json();if(!rr.ok)throw new Error(raw?.error?.message||`OpenAI error ${rr.status}`);
   const tx=raw.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==="output_text")?.text||raw.output_text||"";let clean=String(tx).trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();let data;try{data=JSON.parse(clean)}catch{throw new Error("AI mengembalikan perbandingan yang bukan JSON valid")}
   return new Response(JSON.stringify({data}),{headers:{...cors,"Content-Type":"application/json"}});
 }
 if(!base64&&!(Array.isArray(images)&&images.length))throw new Error("File kosong");
 const prompts:any={
 lease:`Baca akta/perjanjian sewa atau dokumen tanah Indonesia ini dengan sangat teliti. Kembalikan HANYA JSON valid, tanpa markdown. Jangan menebak data yang tidak terlihat; gunakan string kosong, 0, atau array kosong. Semua tanggal harus YYYY-MM-DD. Semua nilai uang harus angka tanpa Rp/pemisah ribuan.

KHUSUS PERPANJANGAN: cari seluruh klausul yang mengatur pemberitahuan/permohonan perpanjangan masa sewa. Jika klausul menyatakan batas relatif terhadap akhir masa sewa, misalnya "6 bulan sebelum berakhir", ekstrak angka dan satuannya. renewalNoticeValue harus angka (contoh 6 atau 90), renewalNoticeUnit hanya salah satu: day, week, month, year. renewalNoticeText harus berisi ringkasan redaksi asli klausul. renewalNoticePage berisi halaman sumber yang TEPAT bila terlihat, misalnya "Pasal 1, halaman akta 6". renewalTerm WAJIB merangkum seluruh hak dan ketentuan perpanjangan secara substantif, bukan hanya durasinya: siapa yang dapat meminta perpanjangan, cara/bentuk pemberitahuan, batas waktu, apakah persetujuan otomatis atau bergantung pada persetujuan/hak pihak lain, serta periode perpanjangan bila memang disebut. Jika periode perpanjangan tidak disebut, jangan mengarang durasi; tetap isi renewalTerm dengan ketentuan yang benar-benar disebut. Contoh: "Pihak Kedua dapat mengajukan perpanjangan secara tertulis paling lambat 6 bulan sebelum berakhir; persetujuan sepenuhnya merupakan hak Pihak Pertama; periode perpanjangan tidak ditentukan." Jika dokumen menyebut tanggal deadline secara eksplisit, isi renewalNotice dengan tanggal itu. Jika hanya menyebut jangka relatif dan tanggal akhir sewa tersedia, JANGAN menebak tanggal renewalNotice; server akan menghitungnya secara deterministik dari end. Bedakan klausul PERPANJANGAN dari klausul PENGAKHIRAN/TERMINASI; jangan memakai masa pemberitahuan pengakhiran sebagai deadline perpanjangan. Jika ada klausul pengakhiran dini, masukkan terpisah ke clauses dengan title yang jelas seperti "Pengakhiran sebelum waktunya", termasuk notice period-nya, tanpa memengaruhi renewalNotice/renewalTerm. Jika tidak ada hak/ketentuan perpanjangan, kosongkan field-field perpanjangan. KHUSUS sourcePages: jangan isi dengan seluruh rentang dokumen seperti "1-27" atau "Sampul; 1-27". Isi hanya halaman-halaman utama yang benar-benar menjadi sumber data penting yang diekstrak, terutama identitas/objek sewa, jangka waktu dan perpanjangan, harga/pembayaran, serta klausul penting. Gunakan nomor halaman akta yang tercetak bila terlihat; untuk klausul perpanjangan utamakan format seperti "Pasal 1, halaman akta 6". Jika beberapa halaman penting, pisahkan dengan titik koma.

KHUSUS PAJAK SEWA TANAH/BANGUNAN: analisis redaksi pajak secara eksplisit. Default hukum untuk PPh Final Pasal 4 ayat (2) atas persewaan tanah dan/atau bangunan adalah 10% dari JUMLAH BRUTO nilai persewaan, tetapi jangan mengarang perlakuan kontraktual yang tidak tertulis. Jika dokumen menyebut nilai sewa SUDAH TERMASUK PPh/pajak yang dipotong penyewa, set rentTaxMode="gross_includes_tax", rentTaxRate=10 kecuali dokumen secara eksplisit menyebut tarif lain, rentGross=nilai sewa yang tertulis, rentTaxAmount=rentGross*rentTaxRate/100, dan rentNet=rentGross-rentTaxAmount. Jika dokumen secara jelas menyebut nilai sewa BERSIH/NETTO atau BELUM TERMASUK PPh dan PPh menjadi tambahan/ditanggung di atas nilai bersih tersebut, set rentTaxMode="net_excludes_tax"; nilai rent adalah nilai netto yang tertulis; lakukan gross-up: rentGross=rent/(1-rentTaxRate/100), rentTaxAmount=rentGross-rent, rentNet=rent. Jangan menghitung 10% langsung dari netto untuk kasus gross-up karena dasar PPh adalah bruto. Jika dokumen menyatakan tidak ada pemotongan oleh penyewa atau mekanisme setor sendiri, set mode yang paling sesuai dan jelaskan di taxTreatment. taxClause harus berisi ringkasan sedekat mungkin dengan redaksi klausul sumber beserta pasal/halaman jika terlihat. taxTreatment jelaskan siapa yang memotong/menyetor dan apakah pajak dipotong dari bruto atau ditambahkan/gross-up. taxNeedsVerification=true jika redaksi "termasuk/belum termasuk pajak" ambigu, jenis pajak tidak jelas, pihak pemotong tidak jelas, atau angka tidak dapat direkonsiliasi. Jika Akta sama sekali tidak menyebut pajak, gunakan rentTaxRate=10 sebagai default PPh Final tanah/bangunan tetapi taxNeedsVerification=true dan taxClause kosong; jangan mengklaim Akta menyebut tarif tersebut.\n\nKHUSUS LUAS AKTA SEWA: leaseLandArea dan leaseBuildingArea hanya boleh diisi dari luas yang dinyatakan sebagai objek sewa dalam akta ini. Jangan menyalin luas dari sertifikat atau PBB yang hanya disebut sebagai dasar/lampiran.\n\nStruktur JSON persis: {"tenant":"","lessor":"","asset":"","propertyAddress":"","propertyArea":"","leaseLandArea":0,"leaseBuildingArea":0,"deedNo":"","deedDate":"","start":"","end":"","rent":0,"rentTaxMode":"gross_includes_tax|net_excludes_tax|no_withholding","rentTaxRate":10,"rentTaxAmount":0,"rentGross":0,"rentNet":0,"taxClause":"","taxTreatment":"","taxNeedsVerification":false,"deposit":0,"renewalNotice":"","renewalNoticeValue":0,"renewalNoticeUnit":"","renewalNoticeText":"","renewalNoticePage":"","renewalTerm":"","sourcePages":"","notes":"","contacts":[{"role":"Pihak Pertama|Pihak Kedua|Notaris|Lainnya","name":"","phone":"","email":""}],"bankAccounts":[{"purpose":"","bank":"","account":"","holder":""}],"landRights":[{"type":"HGB|HM|SHM|Hak Pakai|Lainnya","number":"","area":"","end":""}],"payments":[{"due":"","amount":0,"label":""}],"clauses":[{"title":"","detail":"","page":"","importance":"Penting|Normal"}]}. Ringkas notes hanya untuk informasi penting yang tidak cocok ke field lain. Untuk clauses prioritaskan perpanjangan, pengakhiran, denda, pajak, pemeliharaan, larangan pengalihan/sublease, force majeure, serah terima, deposit, kewajiban para pihak, dan sengketa. Cantumkan halaman sumber bila dapat dikenali.`,
 land_title:`Baca dokumen Sertifikat/Akta Tanah Indonesia ini dengan sangat teliti. Kembalikan HANYA JSON valid tanpa markdown. Untuk rightType, prioritaskan judul/jenis hak yang tercetak pada sertifikat: tulisan HAK GUNA BANGUNAN atau HGB wajib dipetakan ke HGB; SERTIPIKAT HAK GUNA BANGUNAN/SHGB ke SHGB bila singkatan SHGB memang tercetak; HAK MILIK/SHM ke SHM atau HM sesuai yang tercetak; HAK PAKAI ke Hak Pakai. Gunakan Lainnya hanya jika jenis hak benar-benar bukan salah satu pilihan tersebut atau tidak dapat dikenali. Jangan menebak. Data luas harus hanya berasal dari dokumen tanah ini, bukan dari Akta Sewa atau PBB. Semua tanggal YYYY-MM-DD. Untuk SHM/HM yang tidak memiliki masa berakhir, validUntil harus string kosong. Struktur persis: {"rightType":"HGB|SHGB|SHM|HM|Hak Pakai|Lainnya","certificateNo":"","holderName":"","landArea":0,"validUntil":"","address":"","surveyNo":"","surveyDate":"","notes":""}. WAJIB cari bagian berjudul SURAT UKUR pada seluruh halaman. Jika bagian itu terlihat, isi surveyNo dari nomor yang tercetak tepat pada bagian SURAT UKUR dan surveyDate dari tanggal yang tercetak tepat pada bagian itu. Jangan membiarkan surveyNo/surveyDate kosong jika teksnya terbaca. Bedakan dari nomor/tanggal sertifikat, tanggal pembukuan, dan nomor dasar pendaftaran. Jika ada NIB, masukkan ke notes dengan awalan 'NIB:'. notes hanya untuk informasi penting lain dari dokumen.`,
 pbb:`Baca SELURUH dokumen SPPT PBB Indonesia ini dengan sangat teliti, termasuk halaman bukti bayar dan tabel/ringkasan histori pembayaran. Kembalikan HANYA JSON valid tanpa markdown. Jangan menebak. Semua angka luas dan NJOP harus hanya berasal dari SPPT PBB ini; jangan mengambil dari Sertifikat Tanah atau Akta Sewa. Semua tanggal YYYY-MM-DD dan uang berupa angka tanpa Rp/pemisah ribuan. Data utama adalah SPPT/tahun terbaru atau SPPT utama pada dokumen. Struktur persis: {"nop":"","taxpayerName":"","objectAddress":"","taxYear":0,"landArea":0,"buildingArea":0,"landNjopM2":0,"landNjopTotal":0,"buildingNjopM2":0,"buildingNjopTotal":0,"totalNjop":0,"taxDue":0,"payableAmount":0,"dueDate":"","paymentStatus":"lunas|belum_bayar|","paidDate":"","notes":"","paymentHistory":[{"nop":"","taxYear":0,"paymentStatus":"lunas|belum_bayar","dueDate":"","paidDate":"","taxDue":0,"payableAmount":0}]}. WAJIB periksa seluruh halaman untuk tabel histori/ringkasan pembayaran dengan NOP yang sama. Masukkan SETIAP tahun yang benar-benar tercantum ke paymentHistory, termasuk tahun utama bila tercantum. Jika sumber menyatakan Sudah Bayar/Lunas, set paymentStatus=lunas dan isi paidDate bila tanggal bayar terlihat. Jika menyatakan belum bayar, set belum_bayar. Jangan menyalin NJOP, luas, atau data tahun utama ke tahun historis bila data tahun historis itu tidak tercantum. taxDue adalah pokok/tagihan sebelum diskon bila jelas; payableAmount adalah jumlah yang harus/dibayar setelah diskon bila jelas. Jika SPPT hanya menampilkan NJOP per m2 dan luas, boleh hitung total NJOP tanah/bangunan secara aritmetika; jangan mengarang data lain.`
 }; const prompt=prompts[documentType]||prompts.lease
 const isImage=String(mimeType||'').startsWith('image/');
 const batchNote=Array.isArray(images)&&images.length?`\n\nDokumen besar sedang dibaca per batch. Ini halaman ${pageStart||'?'} sampai ${pageEnd||'?'} dari total ${totalPages||'?'}. Ekstrak HANYA data yang benar-benar terlihat pada halaman batch ini. Field yang tidak terlihat harus kosong/0/array kosong. Jangan menebak dari batch lain.`:'';
 const content:any[]=[{type:"input_text",text:prompt+batchNote}];
 if(Array.isArray(images)&&images.length){for(const im of images)content.push({type:"input_image",image_url:`data:${im.mimeType||'image/jpeg'};base64,${im.base64}`,detail:"auto"})}
 else if(isImage)content.push({type:"input_image",image_url:`data:${mimeType};base64,${base64}`,detail:"auto"});
 else content.push({type:"input_file",filename:filename||"akta.pdf",file_data:`data:${mimeType||'application/pdf'};base64,${base64}`});
 stage="openai"; console.log("[extract-lease] sending document to OpenAI", {filename,mimeType,documentType,base64Chars:typeof base64==='string'?base64.length:0,imageCount:Array.isArray(images)?images.length:0});
 const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6",input:[{role:"user",content}]})});
 const raw=await r.json();if(!r.ok)throw new Error(raw?.error?.message||`OpenAI error ${r.status}`);
 const text=raw.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==="output_text")?.text||raw.output_text||"";
 let clean=String(text).trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();let data;try{data=JSON.parse(clean)}catch{throw new Error("AI mengembalikan hasil yang bukan JSON valid")}
 const noticeValue=Number(data?.renewalNoticeValue||0),noticeUnit=String(data?.renewalNoticeUnit||'').toLowerCase();
 if(data?.end&&noticeValue>0&&noticeUnit){const calculated=subtractNotice(String(data.end),noticeValue,noticeUnit);if(calculated)data.renewalNotice=calculated}
 return new Response(JSON.stringify({data}),{headers:{...cors,"Content-Type":"application/json"}});
}catch(e){const message=e?.message||String(e);console.error("[extract-lease] failed",{stage,message});return new Response(JSON.stringify({error:message,stage}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}});
