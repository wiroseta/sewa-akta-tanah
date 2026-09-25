import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});try{
 const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw new Error("OPENAI_API_KEY belum diset di Supabase Secrets");
 const {filename,mimeType,base64}=await req.json();if(!base64)throw new Error("File kosong");
 const prompt=`Baca akta/perjanjian sewa atau dokumen tanah Indonesia ini dengan teliti. Kembalikan HANYA JSON valid, tanpa markdown. Jangan menebak data yang tidak terlihat; gunakan string kosong atau array kosong. Semua tanggal harus YYYY-MM-DD. Semua nilai uang harus angka tanpa Rp/pemisah ribuan. Struktur JSON persis: {"tenant":"","lessor":"","asset":"","propertyAddress":"","propertyArea":"","deedNo":"","deedDate":"","start":"","end":"","rent":0,"deposit":0,"renewalNotice":"","renewalTerm":"","sourcePages":"","notes":"","contacts":[{"role":"Pihak Pertama|Pihak Kedua|Notaris|Lainnya","name":"","phone":"","email":""}],"bankAccounts":[{"purpose":"","bank":"","account":"","holder":""}],"landRights":[{"type":"HGB|HM|SHM|Hak Pakai|Lainnya","number":"","area":"","end":""}],"payments":[{"due":"","amount":0,"label":""}],"clauses":[{"title":"","detail":"","page":"","importance":"Penting|Normal"}]}. Ringkas notes hanya untuk informasi penting yang tidak cocok ke field lain. Untuk clauses prioritaskan perpanjangan, pengakhiran, denda, pajak, pemeliharaan, larangan pengalihan/sublease, force majeure, serah terima, deposit, kewajiban para pihak, dan sengketa. Cantumkan halaman sumber bila dapat dikenali.`;
 const isImage=String(mimeType||'').startsWith('image/');
 const content:any[]=[{type:"input_text",text:prompt}];
 if(isImage)content.push({type:"input_image",image_url:`data:${mimeType};base64,${base64}`,detail:"high"});
 else content.push({type:"input_file",filename:filename||"akta.pdf",file_data:`data:${mimeType||'application/pdf'};base64,${base64}`});
 const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6",input:[{role:"user",content}]})});
 const raw=await r.json();if(!r.ok)throw new Error(raw?.error?.message||`OpenAI error ${r.status}`);
 const text=raw.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==="output_text")?.text||raw.output_text||"";
 let clean=String(text).trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();let data;try{data=JSON.parse(clean)}catch{throw new Error("AI mengembalikan hasil yang bukan JSON valid")}
 return new Response(JSON.stringify({data}),{headers:{...cors,"Content-Type":"application/json"}});
}catch(e){return new Response(JSON.stringify({error:e.message||String(e)}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}});
