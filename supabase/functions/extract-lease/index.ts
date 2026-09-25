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
serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});try{
 const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw new Error("OPENAI_API_KEY belum diset di Supabase Secrets");
 const {filename,mimeType,base64}=await req.json();if(!base64)throw new Error("File kosong");
 const prompt=`Baca akta/perjanjian sewa atau dokumen tanah Indonesia ini dengan sangat teliti. Kembalikan HANYA JSON valid, tanpa markdown. Jangan menebak data yang tidak terlihat; gunakan string kosong, 0, atau array kosong. Semua tanggal harus YYYY-MM-DD. Semua nilai uang harus angka tanpa Rp/pemisah ribuan.

KHUSUS PERPANJANGAN: cari seluruh klausul yang mengatur pemberitahuan/permohonan perpanjangan masa sewa. Jika klausul menyatakan batas relatif terhadap akhir masa sewa, misalnya "6 bulan sebelum berakhir", ekstrak angka dan satuannya. renewalNoticeValue harus angka (contoh 6 atau 90), renewalNoticeUnit hanya salah satu: day, week, month, year. renewalNoticeText harus berisi ringkasan redaksi asli klausul. renewalNoticePage berisi halaman sumber bila terlihat. Jika dokumen menyebut tanggal deadline secara eksplisit, isi renewalNotice dengan tanggal itu. Jika hanya menyebut jangka relatif dan tanggal akhir sewa tersedia, JANGAN menebak tanggal renewalNotice; server akan menghitungnya secara deterministik dari end. Bedakan klausul PERPANJANGAN dari klausul PENGAKHIRAN/TERMINASI; jangan memakai masa pemberitahuan pengakhiran sebagai deadline perpanjangan. Jika tidak ada hak/ketentuan perpanjangan, kosongkan field-field perpanjangan.

Struktur JSON persis: {"tenant":"","lessor":"","asset":"","propertyAddress":"","propertyArea":"","deedNo":"","deedDate":"","start":"","end":"","rent":0,"deposit":0,"renewalNotice":"","renewalNoticeValue":0,"renewalNoticeUnit":"","renewalNoticeText":"","renewalNoticePage":"","renewalTerm":"","sourcePages":"","notes":"","contacts":[{"role":"Pihak Pertama|Pihak Kedua|Notaris|Lainnya","name":"","phone":"","email":""}],"bankAccounts":[{"purpose":"","bank":"","account":"","holder":""}],"landRights":[{"type":"HGB|HM|SHM|Hak Pakai|Lainnya","number":"","area":"","end":""}],"payments":[{"due":"","amount":0,"label":""}],"clauses":[{"title":"","detail":"","page":"","importance":"Penting|Normal"}]}. Ringkas notes hanya untuk informasi penting yang tidak cocok ke field lain. Untuk clauses prioritaskan perpanjangan, pengakhiran, denda, pajak, pemeliharaan, larangan pengalihan/sublease, force majeure, serah terima, deposit, kewajiban para pihak, dan sengketa. Cantumkan halaman sumber bila dapat dikenali.`
 const isImage=String(mimeType||'').startsWith('image/');
 const content:any[]=[{type:"input_text",text:prompt}];
 if(isImage)content.push({type:"input_image",image_url:`data:${mimeType};base64,${base64}`,detail:"high"});
 else content.push({type:"input_file",filename:filename||"akta.pdf",file_data:`data:${mimeType||'application/pdf'};base64,${base64}`});
 const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6",input:[{role:"user",content}]})});
 const raw=await r.json();if(!r.ok)throw new Error(raw?.error?.message||`OpenAI error ${r.status}`);
 const text=raw.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==="output_text")?.text||raw.output_text||"";
 let clean=String(text).trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();let data;try{data=JSON.parse(clean)}catch{throw new Error("AI mengembalikan hasil yang bukan JSON valid")}
 const noticeValue=Number(data?.renewalNoticeValue||0),noticeUnit=String(data?.renewalNoticeUnit||'').toLowerCase();
 if(data?.end&&noticeValue>0&&noticeUnit){const calculated=subtractNotice(String(data.end),noticeValue,noticeUnit);if(calculated)data.renewalNotice=calculated}
 return new Response(JSON.stringify({data}),{headers:{...cors,"Content-Type":"application/json"}});
}catch(e){return new Response(JSON.stringify({error:e.message||String(e)}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}});
