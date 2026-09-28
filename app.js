const APP_BUILD="1.19.7-RC";
let data=[],assets=[],edit=-1,assetEdit=-1,currentUser=null,currentRole='viewer',dataOwnerId=null,pbbEdit=-1,pbbData=[],googleDriveToken='';const $=s=>document.querySelector(s);const fmt=n=>n?new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(n):'-';
function parseMoney(v){if(typeof v==='number')return v;if(!v)return 0;let s=String(v).trim().replace(/\s/g,'').replace(/^Rp/i,'');if(s.includes(',')&&s.includes('.')){s=s.replace(/\./g,'').replace(',','.')}else if(s.includes(',')){s=s.replace(',','.')}else if((s.match(/\./g)||[]).length>1){s=s.replace(/\./g,'')}return Number(s.replace(/[^0-9.-]/g,''))||0}
function moneyDisplay(v){const n=parseMoney(v);return (v!==''&&v!=null&&!Number.isNaN(n))?`Rp ${new Intl.NumberFormat('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}`:''}
function numberID(v){const n=parseMoney(v);return (v!==''&&v!=null&&!Number.isNaN(n))?new Intl.NumberFormat('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n):''}
function isoToID(s){if(!s)return '';const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:s}
function normalizeIDDate(s){if(!s)return '';let v=String(s).trim().replace(/[\/.]/g,'-').replace(/\s+/g,'');if(/^\d{6}$/.test(v))v=`${v.slice(0,2)}-${v.slice(2,4)}-20${v.slice(4,6)}`;else if(/^\d{8}$/.test(v))v=`${v.slice(0,2)}-${v.slice(2,4)}-${v.slice(4,8)}`;let m=v.match(/^(\d{2})-(\d{2})-(\d{4})$/);if(!m)return v;let d=Number(m[1]),mo=Number(m[2]),y=Number(m[3]),dt=new Date(y,mo-1,d);return dt.getFullYear()===y&&dt.getMonth()===mo-1&&dt.getDate()===d?`${m[1]}-${m[2]}-${m[3]}`:v}
function idToISO(s){if(!s)return '';let v=normalizeIDDate(s),m=v.match(/^(\d{2})-(\d{2})-(\d{4})$/);if(m)return `${m[3]}-${m[2]}-${m[1]}`;return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:''}
function bindDateInput(el){if(!el||el.dataset.dateBound)return;el.dataset.dateBound='1';el.type='text';el.inputMode='numeric';if(!el.placeholder)el.placeholder='DDMMYY atau DD-MM-YYYY';el.addEventListener('blur',()=>{if(!el.value)return;let n=normalizeIDDate(el.value);if(idToISO(n))el.value=n;else{el.setCustomValidity('Tanggal tidak valid. Ketik DDMMYY, contoh 280926.');el.reportValidity()}});el.addEventListener('input',()=>el.setCustomValidity(''))}
function bindAllDateInputs(root=document){root.querySelectorAll('input[type=date],input[name=deedDate],input[name=start],input[name=end],input[name=renewalNotice],input[name=dueDate],input[name=paidDate],input.validUntil,input.surveyDate,input.due,input.paidDate').forEach(bindDateInput)}
function moneyRaw(v){const n=parseMoney(v);return n?String(n):''}
function rupiahText(v){const n=parseMoney(v);return n?`Rp${new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(n)}`:String(v??'')}
function normalizeAIText(value){
 if(value===undefined||value===null)return value;
 let s=String(value);
 // Tanggal ISO / slash dari AI -> format Indonesia DD-MM-YYYY.
 s=s.replace(/\b(20\d{2}|19\d{2})[-\/.](0[1-9]|1[0-2])[-\/.](0[1-9]|[12]\d|3[01])\b/g,(_,y,m,d)=>`${d}-${m}-${y}`);
 // Rupiah yang sudah memiliki penanda mata uang.
 s=s.replace(/\bRp\.?\s*([0-9][0-9.,]*)/gi,(_,n)=>rupiahText(n));
 // Angka uang mentah setelah istilah finansial yang umum pada hasil ekstraksi akta.
 s=s.replace(/\b(harga\s+sewa(?:\s+seluruhnya)?|nilai\s+sewa|jumlah\s+sewa|uang\s+jaminan|deposit|denda|pembayaran|biaya)\s+(?:sebesar\s+)?([0-9]{5,})(?![0-9])/gi,(all,label,n)=>`${label} ${rupiahText(n)}`);
 // Luas: gunakan pemisah ribuan Indonesia dan simbol m².
 s=s.replace(/\b([0-9]{4,}(?:[.,][0-9]+)?)\s*(?:m2|m²|meter\s+persegi)\b/gi,(_,n)=>`${new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(parseMoney(n))} m²`);
 return s;
}
function normalizeAIObject(x){
 if(Array.isArray(x))return x.map(normalizeAIObject);
 if(!x||typeof x!=='object')return x;
 const out={};for(const [k,v] of Object.entries(x)){
   if(typeof v==='string')out[k]=normalizeAIText(v);else out[k]=normalizeAIObject(v);
 }
 return out;
}
function normalizeExtractedLease(raw){
 const x=normalizeAIObject(raw||{});
 ['deedDate','start','end','renewalNotice'].forEach(k=>{if(x[k])x[k]=isoToID(x[k])});
 if(Array.isArray(x.payments))x.payments=x.payments.map(p=>({...p,due:isoToID(p.due||''),paidDate:isoToID(p.paidDate||''),amount:parseMoney(p.amount)}));
 if(Array.isArray(x.landRights))x.landRights=x.landRights.map(r=>({...r,end:isoToID(r.end||'')}));
 return x;
}
function bindMoneyInput(el,onchange){if(!el||el.dataset.moneyBound)return;el.dataset.moneyBound='1';el.addEventListener('focus',()=>{el.value=moneyRaw(el.value);setTimeout(()=>el.select(),0)});el.addEventListener('blur',()=>{el.value=moneyDisplay(el.value);if(onchange)onchange()});el.addEventListener('input',()=>{if(onchange)onchange()});}
const date=s=>{if(!s)return null;const v=idToISO(s)||s;return new Date(v+'T00:00:00')};const days=s=>s?Math.ceil((date(s)-new Date())/86400000):999999;const cfg=window.SEWA_CONFIG||{};const configured=cfg.supabaseUrl&&!cfg.supabaseUrl.includes('PASTE_')&&cfg.supabaseKey&&!cfg.supabaseKey.includes('PASTE_');const sb=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;

function aiUsageKey(){let d=new Date();return `sewa_ai_scans_${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}`}
function recordAIScan(){try{localStorage.setItem(aiUsageKey(),String((Number(localStorage.getItem(aiUsageKey()))||0)+1));renderOpenAIStatus()}catch(_){}}
function renderOpenAIStatus(){let el=$('#openaiStatus');if(!el)return;let n=0;try{n=Number(localStorage.getItem(aiUsageKey()))||0}catch(_){}el.innerHTML=`<div class=stat><b>${n}</b><span>Scan AI bulan ini <small>(browser ini)</small></span></div><div class=stat><b>OpenAI</b><span>Saldo kredit resmi <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noopener noreferrer">Buka Billing ↗</a></span></div>`}

function status(m,k=''){const e=$('#authMsg');if(e){e.textContent=m;e.dataset.kind=k}}function withTimeout(p,ms,l){return Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error(l||'Timeout')),ms))])}
function rowToApp(r){return{id:r.id,assetId:r.asset_id||'',tenant:r.tenant||'',lessor:r.lessor||'',asset:r.asset||'',propertyAddress:r.property_address||'',propertyArea:r.property_area||'',leaseLandArea:r.lease_land_area??'',leaseBuildingArea:r.lease_building_area??'',deedNo:r.deed_no||'',deedDate:isoToID(r.deed_date),start:isoToID(r.start_date),end:isoToID(r.end_date),rent:Number(r.rent||0),deposit:Number(r.deposit||0),renewalNotice:isoToID(r.renewal_notice),renewalTerm:r.renewal_term||'',googleMapsUrl:r.google_maps_url||'',leasePlanUrl:r.lease_plan_url||'',leasePlanNotes:r.lease_plan_notes||'',docUrl:r.doc_url||'',notes:r.notes||'',payments:r.payments||[],contacts:r.contacts||[],bankAccounts:r.bank_accounts||[],landRights:r.land_rights||[],clauses:r.clauses||[],verificationStatus:r.verification_status||'perlu_verifikasi',sourcePages:r.source_pages||''}}
function appToRow(x){let a=assets.find(v=>v.id===x.assetId);return{user_id:(dataOwnerId||currentUser.id),asset_id:x.assetId||null,tenant:x.tenant||'',lessor:x.lessor||'',asset:a?.name||x.asset||'',property_address:a?.address||x.propertyAddress||'',property_area:x.propertyArea||'',lease_land_area:x.leaseLandArea?Number(x.leaseLandArea):null,lease_building_area:x.leaseBuildingArea?Number(x.leaseBuildingArea):null,deed_no:x.deedNo||null,deed_date:idToISO(x.deedDate)||null,start_date:idToISO(x.start)||null,end_date:idToISO(x.end)||null,rent:parseMoney(x.rent),deposit:parseMoney(x.deposit),renewal_notice:idToISO(x.renewalNotice)||null,renewal_term:x.renewalTerm||'',google_maps_url:a?.googleMapsUrl||x.googleMapsUrl||'',lease_plan_url:x.leasePlanUrl||'',lease_plan_notes:x.leasePlanNotes||'',doc_url:x.docUrl||'',notes:x.notes||'',payments:x.payments||[],contacts:x.contacts||[],bank_accounts:x.bankAccounts||[],clauses:x.clauses||[],verification_status:x.verificationStatus||'perlu_verifikasi',source_pages:x.sourcePages||'',updated_at:new Date().toISOString()}}
async function loadAssets(){
  const [{data:a,error},{data:titles,error:titleError}]=await Promise.all([sb.from('assets').select('*').order('name'),sb.from('land_titles').select('id,asset_id,right_type,certificate_no,valid_until')]);
  if(error)throw error;if(titleError)throw titleError;
  const byAsset={};(titles||[]).forEach(t=>{(byAsset[t.asset_id]??=[]).push({id:t.id,type:t.right_type||'Hak Tanah',number:t.certificate_no||'',end:t.valid_until||''})});
  assets=(a||[]).map(v=>({id:v.id,name:v.name||'',address:v.address||'',area:v.area||'',googleMapsUrl:v.google_maps_url||'',notes:v.notes||'',landRights:byAsset[v.id]||[]}));refreshAssetSelect()
}
async function loadData(){try{await loadAssets();await loadPbbData();const {data:r,error}=await withTimeout(sb.from('contracts').select('*').order('created_at',{ascending:false}),12000,'Database tidak merespons.');if(error)throw error;data=(r||[]).map(rowToApp);render()}catch(e){data=[];render();alert('Data gagal dibaca: '+e.message)}}
async function saveContract(x){let r=x.id?await sb.from('contracts').update(appToRow(x)).eq('id',x.id).select().single():await sb.from('contracts').insert(appToRow(x)).select().single();if(r.error)throw r.error;await loadData()}
function refreshAssetSelect(){let sel=$('#contractAssetSelect');if(!sel)return;let old=sel.value;sel.innerHTML='<option value="">Pilih aset / tanah...</option>'+assets.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');if(assets.some(a=>a.id===old))sel.value=old}
function applySelectedAsset(){let a=assets.find(v=>v.id===$('#contractAssetSelect').value);if(!a)return;document.querySelector('[name="propertyAddress"]').value=a.address||'';document.querySelector('[name="googleMapsUrl"]').value=a.googleMapsUrl||'';syncOpenMapsButton()}
async function loadAccessProfile(){
 currentRole='viewer';dataOwnerId=currentUser?.id||null;
 let r=await sb.rpc('app_get_my_access');
 if(r.error){console.warn('Role profile:',r.error.message);return}
 let a=Array.isArray(r.data)?r.data[0]:r.data;if(a){currentRole=a.role||'viewer';dataOwnerId=a.data_owner_id||currentUser.id}
}
function roleLabel(){return currentRole==='administrator'?'Administrator':currentRole==='document_manager'?'Document Manager':'Viewer'}
function applyRoleUI(){document.body.dataset.role=currentRole;$('#userEmail').textContent=`${currentUser.email||''} · ${roleLabel()}`;let admin=currentRole==='administrator',write=admin||currentRole==='document_manager';$('#usersBtn').hidden=!admin;$('#backupBtn').hidden=!admin;$('#addBtn').hidden=!write;$('#newAssetBtn').hidden=!write;$('#newPbbBtn').hidden=!write;document.querySelectorAll('.write-only').forEach(e=>e.hidden=!write)}
async function openDashboard(s){currentUser=s?.user;if(!currentUser)return;$('#authScreen').style.display='none';$('#appShell').hidden=false;$('#appShell').style.display='block';await loadAccessProfile();applyRoleUI();loadData()}function showLogin(){currentUser=null;$('#appShell').hidden=true;$('#appShell').style.display='none';$('#authScreen').hidden=false;$('#authScreen').style.display='grid'}
async function initAuth(){showLogin();if(!configured)return status('Konfigurasi Supabase belum lengkap.','error');try{const r=await withTimeout(sb.auth.getSession(),10000,'Pemeriksaan session timeout.');if(r.data?.session)return openDashboard(r.data.session);status('Supabase siap. Silakan masuk.')}catch(e){status('Pemeriksaan awal gagal: '+e.message,'error')}sb.auth.onAuthStateChange((ev,s)=>{if(s)openDashboard(s);else if(ev==='SIGNED_OUT')showLogin()})}
$('#loginForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;status('Menghubungi Supabase…');try{const r=await withTimeout(sb.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value}),15000,'Supabase tidak memberi respons.');if(r.error)throw r.error;if(!r.data?.session)throw new Error('Session tidak ditemukan');openDashboard(r.data.session)}catch(x){status('Login gagal: '+x.message,'error')}finally{b.disabled=false}};$('#logoutBtn').onclick=async()=>{await sb.auth.signOut();showLogin()};
async function saveContract(x){let r=x.id?await sb.from('contracts').update(appToRow(x)).eq('id',x.id).select().single():await sb.from('contracts').insert(appToRow(x)).select().single();if(r.error)throw r.error;await loadData()}
function nearestHgb(x){let ds=(x.landRights||[]).map(l=>l.end).filter(Boolean).sort();return ds[0]||''}
function render(){if(!currentUser)return;renderOpenAIStatus();let q=$('#search').value.toLowerCase(),now=new Date();let overdue=0,unpaid90=0,contract180=0,hgb730=0;let a=[];
function pushAlert(day,text,type='normal',tag=''){a.push([day,text,type,tag])}
data.forEach(x=>{
  (x.payments||[]).forEach(p=>{if(p.status==='paid'||!p.due)return;let d=days(p.due);if(d<0){overdue++;pushAlert(d,`Pembayaran ${x.tenant}: Rp${fmt(p.amount)} — jatuh tempo ${isoToID(p.due)}`,'overdue','PEMBAYARAN')}else if(d<=90){unpaid90++;pushAlert(d,`Pembayaran ${x.tenant}: Rp${fmt(p.amount)} — jatuh tempo ${isoToID(p.due)}`,d<=30?'urgent':'due','PEMBAYARAN')}});
  let endDays=days(x.end);if(x.end){if(endDays<0)pushAlert(endDays,`Kontrak ${x.tenant} telah berakhir pada ${x.end}`,'overdue','KONTRAK');else if(endDays<=180){contract180++;pushAlert(endDays,`Kontrak ${x.tenant} berakhir ${x.end}. Siapkan perpanjangan / kontrak baru.`,endDays<=60?'urgent':'normal','KONTRAK')}}
  let d=days(x.renewalNotice);if(x.renewalNotice){if(d<0&&endDays>=0)pushAlert(d,`Deadline pemberitahuan perpanjangan ${x.tenant} sudah lewat — ${x.renewalNotice}`,'overdue','PERPANJANGAN');else if(d>=0&&d<=365)pushAlert(d,`Deadline pemberitahuan perpanjangan ${x.tenant} — ${x.renewalNotice}`,d<=60?'urgent':'normal','PERPANJANGAN')}
});
assets.forEach(as=>{(as.landRights||[]).forEach(l=>{if(!l.end)return;let d=days(l.end),label=`${l.type||'HGB'} ${l.number||as.name}`;if(d<0)pushAlert(d,`${label} telah berakhir pada ${isoToID(l.end)}`,'overdue','HAK TANAH');else if(d<=730){hgb730++;pushAlert(d,`${label} berakhir ${isoToID(l.end)}. Mulai proses perpanjangan.`,d<=365?'urgent':'hgb','HAK TANAH')}})});
pbbData.forEach(p=>{if(p.payment_status==='lunas'||p.warning_ignored)return;let d=days(p.due_date);let amount=p.pbb_payable??p.pbb_due??0;let text=`PBB ${p.tax_year||''} · NOP ${p.nop||'-'} · ${pbbMoney(amount)} · jatuh tempo ${isoToID(p.due_date)||'-'}`;if(d<0)pushAlert(d,text,'overdue','PBB');else if(d<=90)pushAlert(d,text,d<=30?'urgent':'due','PBB')});
$('#stats').innerHTML=`<div class=stat><b>${assets.length}</b><span>Properti / lokasi</span></div><div class=stat><b>${data.length}</b><span>Akta sewa</span></div><div class=stat><b>${overdue}</b><span>Pembayaran terlambat</span></div><div class=stat><b>${contract180}</b><span>Kontrak ≤ 6 bulan</span></div><div class=stat><b>${hgb730}</b><span>Hak tanah ≤ 2 tahun</span></div>`;
a.sort((x,y)=>x[0]-y[0]);$('#alerts').innerHTML=a.length?a.map(x=>{let when=x[0]<0?`TERLAMBAT ${Math.abs(x[0])} HARI`:x[0]===0?'HARI INI':`${x[0]} HARI LAGI`;return `<div class="warning ${x[2]}"><div class=warning-head><span class=warning-tag>${x[3]}</span><b>${when}</b></div><div>${x[1]}</div></div>`}).join(''):'<div class=muted>Belum ada agenda yang masuk periode peringatan.</div>';
$('#cards').innerHTML=data.map((x,i)=>[x,i]).filter(([x])=>JSON.stringify(x).toLowerCase().includes(q)).map(([x,i])=>{const paid=(x.payments||[]).filter(p=>p.status==='paid').length,total=(x.payments||[]).length;return `<article class=card><div><h3>${x.tenant}</h3><div>${x.asset}</div><div class=muted>${x.lessor?'Pemilik: '+x.lessor+' · ':''}Akta ${x.deedNo||'-'} · ${x.start||'-'} s/d ${x.end||'-'}</div><div class=detail-lines><span>Nilai sewa: Rp${fmt(x.rent)}</span><span>${total?paid+'/'+total+' termin dibayar · ':''}${x.contacts?.length||0} kontak · ${x.landRights?.length||0} hak tanah</span></div></div><div><span class="pill ${x.verificationStatus==='sudah_diverifikasi'?'':'warn'}">${x.verificationStatus==='sudah_diverifikasi'?'DIVERIFIKASI':'PERLU VERIFIKASI'}</span></div><div><button onclick="openEdit(${i})">${currentRole==='viewer'?'Buka':'Buka / Edit'}</button></div></article>`}).join('')}

function addRepeat(id,vals,kind){if(kind==='clause')vals=normalizeAIObject(vals||{});let html='';if(kind==='contact')html=`<select class=role><option>Pihak Pertama</option><option>Pihak Kedua</option><option>Notaris</option><option>Lainnya</option></select><input class=name placeholder="Nama / PIC" value="${vals.name||''}"><input class=phone placeholder="Telepon" value="${vals.phone||''}"><input class=email placeholder="Email" value="${vals.email||''}">`;if(kind==='bank')html=`<input class=purpose placeholder="Tujuan rekening" value="${vals.purpose||''}"><input class=bank placeholder="Bank" value="${vals.bank||''}"><input class=account placeholder="No. rekening" value="${vals.account||''}"><input class=holder placeholder="Nama pemilik" value="${vals.holder||''}">`;if(kind==='land')html=`<select class=type><option>HGB</option><option>HM</option><option>SHM</option><option>Hak Pakai</option><option>Lainnya</option></select><input class=number placeholder="Nomor" value="${vals.number||''}"><input class=area placeholder="Luas" value="${vals.area||''}"><input type=text inputmode=numeric placeholder="DDMMYY" class=end value="${vals.end||''}"><input class=docUrl type=url placeholder="Google Drive sertifikat/akta" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='landdoc')html=`<select class=type><option>Akta Tanah</option><option>AJB</option><option>Surat Ukur</option><option>KRK / KKPR</option><option>PBG / IMB</option><option>Site Plan</option><option>Perpanjangan HGB</option><option>Lainnya</option></select><input class=number placeholder="Nomor dokumen" value="${vals.number||''}"><input type=text inputmode=numeric placeholder="DDMMYY" class=date value="${vals.date||''}"><input class=description placeholder="Keterangan" value="${vals.description||''}"><input class=docUrl type=url placeholder="Link Google Drive" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='pbb')html=`<input class=nop placeholder="NOP" value="${vals.nop||''}"><input class=year type=number placeholder="Tahun" value="${vals.year||''}"><input class=njop placeholder="NJOP / nilai objek" value="${vals.njop||''}"><input class=amount placeholder="PBB terutang" value="${vals.amount||''}"><input type=text inputmode=numeric class=due placeholder="DDMMYY" value="${vals.due||''}"><select class=status><option>Belum dibayar</option><option>Sudah dibayar</option><option>Lainnya</option></select><input class=docUrl type=url placeholder="SPPT / bukti bayar Google Drive" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='facility')html=`<select class=type><option>PLN</option><option>Telkom / IndiHome</option><option>PDAM</option><option>Internet</option><option>Keamanan</option><option>IPL</option><option>Telepon</option><option>Lainnya</option></select><input class=provider placeholder="Provider" value="${vals.provider||''}"><input class=customerId placeholder="ID pelanggan / kontrak" value="${vals.customerId||''}"><input class=meterNo placeholder="No. meter / layanan" value="${vals.meterNo||''}"><input class=phone placeholder="No. telp" value="${vals.phone||''}"><input class=registeredName placeholder="Nama terdaftar" value="${vals.registeredName||''}"><input class=plan placeholder="Daya / paket / tarif" value="${vals.plan||''}"><input class=contact placeholder="Kontak layanan" value="${vals.contact||''}"><input class=notes placeholder="Catatan" value="${vals.notes||''}"><input class=docUrl type=url placeholder="Dokumen/tagihan Google Drive" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='facility')html=`<select class=facilityType><option>PLN</option><option>Telkom / IndiHome</option><option>PDAM</option><option>Internet</option><option>Telepon</option><option>Keamanan</option><option>IPL</option><option>Lainnya</option></select><input class=provider placeholder="Provider" value="${vals.provider||''}"><input class=customerId placeholder="ID pelanggan / no. kontrak" value="${vals.customerId||''}"><input class=meterNo placeholder="No. meter / layanan" value="${vals.meterNo||''}"><input class=phone placeholder="No. telepon" value="${vals.phone||''}"><input class=registeredName placeholder="Nama terdaftar" value="${vals.registeredName||''}"><input class=planPower placeholder="Daya / tarif / paket" value="${vals.planPower||''}"><input class=driveUrl type=url placeholder="Google Drive" value="${vals.driveUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button><input class=notes placeholder="Catatan" value="${vals.notes||''}">`;if(kind==='landtitle')html=`<div class="land-group-title">Data Sertifikat</div><label>Jenis Hak<select class=rightType><option>HGB</option><option>SHGB</option><option>SHM</option><option>HM</option><option>Hak Pakai</option><option>Lainnya</option></select></label><label>Nomor Sertifikat<input class=certificateNo placeholder="Contoh: 00020/Jatibarang" value="${vals.certificateNo||''}"></label><label>Luas Tanah menurut Sertifikat (m²)<input class=landArea type=number step=0.01 placeholder="Contoh: 10499" value="${vals.landArea||''}"></label><label>Berlaku Sampai / Berakhir (jika ada)<input type=text inputmode=numeric placeholder="DD-MM-YYYY" class=validUntil value="${isoToID(vals.validUntil)||''}"></label><label class="land-wide">Alamat / Lokasi Bidang<input class=address placeholder="Alamat atau keterangan lokasi sesuai sertifikat" value="${vals.address||''}"></label><label>Nama Pemegang Hak<input class=holderName placeholder="Nama sesuai sertifikat" value="${vals.holderName||''}"></label><div class="land-group-title">Surat Ukur</div><label>Nomor Surat Ukur<input class=surveyNo placeholder="Nomor surat ukur" value="${vals.surveyNo||''}"></label><label>Tanggal Surat Ukur<input type=text inputmode=numeric placeholder="DD-MM-YYYY" class=surveyDate value="${isoToID(vals.surveyDate)||''}"></label><label class="land-wide">NIB / Catatan Sertifikat<input class=notes placeholder="NIB dan informasi penting lain dari sertifikat" value="${vals.notes||''}"></label><div class="land-group-title">Dokumen & Lokasi</div><label class="land-link">Link Google Drive Sertifikat<input class=driveUrl type=url placeholder="https://drive.google.com/..." value="${vals.driveUrl||''}"></label><button type="button" class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Buka Sertifikat</button><label class="land-link">Link Google Drive Denah / Surat Ukur<input class=mapPlanUrl type=url placeholder="https://drive.google.com/..." value="${vals.mapPlanUrl||''}"></label><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapPlanUrl')">🗺️ Buka Denah</button><label class="land-link">Google Maps (opsional)<input class=mapsUrl type=url placeholder="https://maps.app.goo.gl/..." value="${vals.mapsUrl||''}"></label><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Buka Maps</button><div class="land-group-title">Baca Otomatis dengan AI</div><label class="land-file">File Sertifikat (PDF / Foto)<input class=landAiFile type=file accept="application/pdf,image/jpeg,image/png,image/webp"></label><button type="button" class="land-ai-btn" onclick="extractLandTitleRow(this)">✨ Baca PDF/Foto Sertifikat</button><button type="button" class="secondary land-drive-ai-btn" onclick="extractLandTitleDriveRow(this)">✨ Baca Sertifikat dari Google Drive</button><div class="land-ai-status muted" aria-live="polite"></div>`;if(kind==='building')html=`<input class=name placeholder="Nama bangunan/gudang" value="${vals.name||''}"><select class=buildingType><option>Gudang</option><option>Gedung</option><option>Kantor</option><option>Pabrik</option><option>Ruko</option><option>Lainnya</option></select><input class=buildingArea type=number step=0.01 placeholder="Luas bangunan m²" value="${vals.buildingArea||''}"><input class=address placeholder="Alamat/keterangan" value="${vals.address||''}"><input class=driveUrl type=url placeholder="Google Drive dokumen bangunan" value="${vals.driveUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Drive</button><input class=floorPlanUrl type=url placeholder="Google Drive denah bangunan" value="${vals.floorPlanUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'floorPlanUrl')">🗺️ Denah</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button><input class=notes placeholder="Catatan" value="${vals.notes||''}">`;if(kind==='clause')html=`<label class=clause-title-label>Judul Klausul<input class=title placeholder="Contoh: Perpanjangan" value="${vals.title||''}"></label><label class=clause-importance-label>Prioritas<select class=importance><option>Penting</option><option>Normal</option></select></label><label class=clause-detail-label>Ringkasan Klausul<textarea class=detail rows=3 placeholder="Ringkasan isi klausul penting...">${vals.detail||''}</textarea></label><label class=clause-page-label>Halaman / Pasal Sumber<input class=page placeholder="Contoh: Pasal 6, halaman 14-15" value="${vals.page||''}"></label>`;let d=document.createElement('div');d.className='repeat-row '+kind;d.innerHTML=html+'<button type="button" class="secondary" onclick="this.parentElement.remove()">−</button>';$('#'+id).appendChild(d);bindAllDateInputs(d);Object.keys(vals).forEach(k=>{let e=d.querySelector('.'+k);if(e)e.value=(kind==='landtitle'&&(k==='validUntil'||k==='surveyDate'))?isoToID(vals[k]):vals[k]});if(kind==='landtitle'&&typeof bindLandTitleSync==='function')bindLandTitleSync(d)}
function pay(p={}){let d=document.createElement('div');d.className='repeat-row payrow';const st=p.status||'unpaid';d.innerHTML=`<input type=text inputmode=numeric placeholder="DDMMYY" class=due value="${p.due||''}"><input type=text inputmode="decimal" class="amount money-input" placeholder="Rp 0" value="${moneyDisplay(p.amount)}"><input class=label placeholder="Keterangan" value="${p.label||''}"><select class=status><option value="unpaid" ${st!=='paid'?'selected':''}>Belum dibayar</option><option value="paid" ${st==='paid'?'selected':''}>Sudah dibayar</option></select><input type=text inputmode=numeric placeholder="DDMMYY" class=paidDate value="${p.paidDate||''}" title="Tanggal pembayaran aktual"><button type=button class=secondary>−</button>`;$('#payments').appendChild(d);bindAllDateInputs(d);const statusEl=d.querySelector('.status'),paidDate=d.querySelector('.paidDate');function syncPaid(){paidDate.disabled=statusEl.value!=='paid';if(statusEl.value==='paid'&&!paidDate.value)paidDate.value=isoToID(new Date().toISOString().slice(0,10));if(statusEl.value!=='paid')paidDate.value=''}statusEl.addEventListener('change',syncPaid);syncPaid();bindMoneyInput(d.querySelector('.amount'),updatePaymentCheck);d.querySelector('button').onclick=()=>{d.remove();updatePaymentCheck()};updatePaymentCheck()}
function updatePaymentCheck(){const box=$('#paymentCheck');if(!box)return;const rent=parseMoney(document.querySelector('[name="rent"]')?.value);const amounts=[...document.querySelectorAll('#payments .amount')].map(e=>parseMoney(e.value));const total=Math.round(amounts.reduce((s,n)=>s+n,0)*100)/100;const count=amounts.filter(n=>n>0).length;if(!rent&&!total){box.innerHTML='';box.className='payment-check muted';return}const diff=Math.round((rent-total)*100)/100;const match=Math.abs(diff)<0.01;const pct=rent?Math.round((total/rent)*10000)/100:0;box.className='payment-check '+(match?'ok':'warn-text');box.innerHTML=`<div class=payment-check-title>${match?'✓ Jadwal pembayaran sesuai dengan nilai sewa':'⚠ Jadwal pembayaran belum sesuai'}</div><div class=payment-check-grid><span><small>Nilai sewa</small><b>Rp ${fmt(rent)}</b></span><span><small>Total ${count} termin</small><b>Rp ${fmt(total)}</b></span><span><small>Selisih</small><b>${match?'Rp 0':(diff>0?'Kurang ':'Lebih ')+'Rp '+fmt(Math.abs(diff))}</b></span><span><small>Terjadwal</small><b>${pct.toLocaleString('id-ID',{maximumFractionDigits:2})}%</b></span></div>`}
function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
function aiProgress(el,message,state='active'){if(!el)return;el.classList.add('ai-progress');el.dataset.state=state;el.innerHTML=`<span class=ai-progress-spinner aria-hidden=true></span><span>${message}</span>`}function aiProgressDone(el,message){if(!el)return;el.classList.add('ai-progress');el.dataset.state='done';el.innerHTML=`<span class=ai-progress-check aria-hidden=true>✓</span><span>${message}</span>`}function aiProgressError(el,message){if(!el)return;el.classList.add('ai-progress');el.dataset.state='error';el.innerHTML=`<span class=ai-progress-error aria-hidden=true>!</span><span>${message}</span>`}
function setField(name,value){if(value===undefined||value===null||value==='')return;const e=document.querySelector(`[name="${name}"]`);if(!e)return;e.value=e.classList.contains('money-input')?moneyDisplay(value):value}
function safeDocumentUrl(value){try{const u=new URL(String(value||'').trim());return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function syncOpenDocButton(){const b=$('#openDocBtn'),u=safeDocumentUrl(document.querySelector('[name="docUrl"]')?.value);if(!b)return;b.disabled=!u;b.title=u?'Buka dokumen di tab baru':'Masukkan link dokumen terlebih dahulu'}
function safeMapsUrl(v){try{const u=new URL((v||'').trim());const h=u.hostname.toLowerCase();if((u.protocol==='https:'||u.protocol==='http:')&&(h==='maps.app.goo.gl'||h==='google.com'||h.endsWith('.google.com')||h==='goo.gl'))return u.href}catch{}return ''}
function syncOpenMapsButton(){const b=$('#openMapsBtn'),u=safeMapsUrl(document.querySelector('[name="googleMapsUrl"]')?.value);if(!b)return;b.disabled=!u;b.title=u?'Buka lokasi di Google Maps':'Masukkan link Google Maps terlebih dahulu'}
function openCurrentMaps(){const u=safeMapsUrl(document.querySelector('[name="googleMapsUrl"]')?.value);if(!u)return alert('Link Google Maps belum tersedia atau tidak valid.');window.open(u,'_blank','noopener,noreferrer')}
function openCurrentDocument(){const u=safeDocumentUrl(document.querySelector('[name="docUrl"]')?.value);if(!u)return alert('Link dokumen / Google Drive belum tersedia.');window.open(u,'_blank','noopener,noreferrer')}
function applyExtracted(x){
  x=normalizeExtractedLease(x);
  ['tenant','lessor','asset','propertyAddress','propertyArea','leaseLandArea','leaseBuildingArea','deedNo','deedDate','start','end','rent','deposit','renewalNotice','renewalTerm','googleMapsUrl','sourcePages','notes'].forEach(k=>setField(k,x[k]));
  if(Array.isArray(x.contacts)&&x.contacts.length){$('#contacts').innerHTML='';x.contacts.forEach(v=>addRepeat('contacts',v,'contact'))}
  if(Array.isArray(x.bankAccounts)&&x.bankAccounts.length){$('#banks').innerHTML='';x.bankAccounts.forEach(v=>addRepeat('banks',v,'bank'))}
  if(Array.isArray(x.landRights)&&x.landRights.length&&$('#lands')){$('#lands').innerHTML='';x.landRights.forEach(v=>addRepeat('lands',v,'land'))}
  if(Array.isArray(x.payments)&&x.payments.length){$('#payments').innerHTML='';x.payments.forEach(v=>pay({...v,status:'unpaid'}))}
  if(Array.isArray(x.clauses)&&x.clauses.length){$('#clauses').innerHTML='';x.clauses.forEach(v=>addRepeat('clauses',v,'clause'))}
  setField('verificationStatus','perlu_verifikasi');$('#verifyBadge').textContent='PERLU VERIFIKASI';updatePaymentCheck();syncOpenDocButton();syncOpenMapsButton();
}

async function invokeExtractLease(body){
  const {data:out,error}=await sb.functions.invoke('extract-lease',{body});
  if(error){
    let detail='';
    try{
      const response=error.context;
      if(response && typeof response.clone==='function'){
        const payload=await response.clone().json();
        detail=payload?.error||payload?.message||'';
        if(payload?.stage)detail+=(detail?' ':'')+'[tahap: '+payload.stage+']';
      }
    }catch(_){}
    throw new Error(detail||error.message||String(error));
  }
  if(out?.error)throw new Error(out.error+(out.stage?' [tahap: '+out.stage+']':''));
  return out;
}
async function extractDocument(){const file=$('#aiFile').files?.[0],btn=$('#extractBtn'),st=$('#extractStatus');if(!file)return alert('Pilih file PDF atau foto scan terlebih dahulu.');btn.disabled=true;try{const data=await invokeDocumentAI(file,'lease',m=>aiProgress(st,m));applyExtracted(data);recordAIScan();aiProgressDone(st,'Dokumen selesai dibaca. Periksa semua hasil, terutama angka, tanggal, nomor akta, dan klausul sebelum menyimpan.')}catch(e){console.error(e);aiProgressError(st,'Gagal membaca dokumen: '+(e.message||e))}finally{btn.disabled=false}}
function driveFileId(url){
  const s=String(url||'').trim();
  const m=s.match(/\/d\/([a-zA-Z0-9_-]+)/)||s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m?m[1]:'';
}
function googleClientReady(){return window.google?.accounts?.oauth2 && window.SEWA_CONFIG?.googleClientId && !window.SEWA_CONFIG.googleClientId.startsWith('ISI_')}
function requestDriveToken(){return new Promise((resolve,reject)=>{
  if(!googleClientReady())return reject(new Error('Google OAuth Client ID belum dikonfigurasi di config.js'));
  const client=google.accounts.oauth2.initTokenClient({client_id:SEWA_CONFIG.googleClientId,scope:'https://www.googleapis.com/auth/drive.readonly',callback:r=>{if(r.error)return reject(new Error(r.error));googleDriveToken=r.access_token;resolve(googleDriveToken)}});
  client.requestAccessToken({prompt:googleDriveToken?'':'consent'});
})}
async function connectDrive(){const st=$('#driveStatus'),b=$('#driveConnectBtn');try{b.disabled=true;st.textContent='Membuka izin Google Drive…';await requestDriveToken();st.textContent='✓ Google Drive terhubung untuk sesi ini.';b.textContent='Hubungkan Ulang Google Drive'}catch(e){st.textContent='Gagal menghubungkan Google Drive: '+(e.message||e)}finally{b.disabled=false}}
async function blobToBase64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
async function fetchDriveFile(fileId){
  if(!googleDriveToken)await requestDriveToken();
  const metaUrl=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,webViewLink&supportsAllDrives=true`;
  let r=await fetch(metaUrl,{headers:{Authorization:`Bearer ${googleDriveToken}`}});
  if(r.status===401){googleDriveToken='';await requestDriveToken();r=await fetch(metaUrl,{headers:{Authorization:`Bearer ${googleDriveToken}`}})}
  if(!r.ok)throw new Error('Tidak dapat membaca metadata file Google Drive ('+r.status+').');
  const meta=await r.json();
  if(String(meta.mimeType).startsWith('application/vnd.google-apps.'))throw new Error('Gunakan file PDF/JPG/PNG di Google Drive, bukan Google Docs/Sheets.');
  r=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,{headers:{Authorization:`Bearer ${googleDriveToken}`}});
  if(!r.ok)throw new Error('Tidak dapat mengunduh file Google Drive ('+r.status+'). Pastikan akun Anda punya akses.');
  const blob=await r.blob(); if(blob.size>500*1024*1024)throw new Error('File lebih dari 500 MB.');
  return {name:meta.name||'drive-file.pdf',mimeType:meta.mimeType||blob.type||'application/pdf',blob,webViewLink:meta.webViewLink};
}
async function extractFromDrive(){const url=$('#driveUrl').value.trim(),btn=$('#driveExtractBtn'),st=$('#driveStatus');if(!driveFileId(url))return alert('Masukkan link Google Drive file yang valid.');btn.disabled=true;try{const r=await invokeDriveAI(url,'lease',m=>aiProgress(st,m));applyExtracted(r.data);setField('docUrl',url);syncOpenDocButton();recordAIScan();aiProgressDone(st,'File Google Drive selesai dibaca. Periksa hasil sebelum menyimpan.')}catch(e){console.error(e);aiProgressError(st,'Gagal: '+(e.message||e))}finally{btn.disabled=false}}
function openRowLink(btn,cls){const u=btn.parentElement.querySelector('.'+cls)?.value?.trim();if(!u)return alert('Link belum diisi.');try{const x=new URL(u);if(!['http:','https:'].includes(x.protocol))throw 0;window.open(x.href,'_blank','noopener,noreferrer')}catch(e){alert('Link tidak valid. Gunakan link https://')}}window.openRowLink=openRowLink;

async function getAllPropertyObjects(assetId){
  if(!assetId)return{landTitles:[],buildings:[]};
  return await getPropertyChildren(assetId)
}
function checkListHtml(rows,type,selected=[]){
  let set=new Set(selected);
  if(!rows.length)return '<div class="muted">Belum ada data.</div>';
  return rows.map(r=>{let label=type==='land'?`${r.right_type||'Tanah'} ${r.certificate_no||'(tanpa nomor)'}${r.land_area?' · '+r.land_area+' m²':''}`:`${r.name||'Bangunan'}${r.building_area?' · '+r.building_area+' m²':''}`;return `<label class="check-item"><input type="checkbox" value="${r.id}" ${set.has(r.id)?'checked':''}> <span>${label}</span></label>`}).join('')
}
async function loadLeaseRelations(contractId,assetId){
  const obj=await getAllPropertyObjects(assetId);
  let landIds=[],buildingIds=[],pbbIds=[],fac=[];
  if(contractId){
    const [l,b,p,f]=await Promise.all([
      sb.from('lease_land_titles').select('land_title_id').eq('contract_id',contractId),
      sb.from('lease_buildings').select('building_id').eq('contract_id',contractId),
      sb.from('lease_pbb').select('pbb_id').eq('contract_id',contractId),
      sb.from('lease_facilities').select('*').eq('contract_id',contractId).order('created_at')
    ]);
    if(!l.error)landIds=(l.data||[]).map(x=>x.land_title_id);if(!b.error)buildingIds=(b.data||[]).map(x=>x.building_id);if(!p.error)pbbIds=(p.data||[]).map(x=>x.pbb_id);if(!f.error)fac=f.data||[]
  }
  $('#leaseLandChoices').innerHTML=checkListHtml(obj.landTitles,'land',landIds);
  $('#leaseBuildingChoices').innerHTML=checkListHtml(obj.buildings,'building',buildingIds);
  const pr=await sb.from('pbb_records').select('id,nop,tax_year,land_area,building_area').order('tax_year',{ascending:false});
  $('#leasePbbChoices').innerHTML=(pr.data||[]).length?(pr.data||[]).map(r=>`<label class="check-item"><input type="checkbox" value="${r.id}" ${pbbIds.includes(r.id)?'checked':''}> <span>NOP ${r.nop||'-'} · ${r.tax_year||'-'} · tanah ${r.land_area||0} m² · bangunan ${r.building_area||0} m²</span></label>`).join(''):'<div class="muted">Belum ada PBB.</div>';
  $('#leaseFacilities').innerHTML='';fac.forEach(v=>addRepeat('leaseFacilities',{facilityType:v.facility_type,provider:v.provider,customerId:v.customer_id,meterNo:v.meter_no,phone:v.phone,registeredName:v.registered_name,planPower:v.plan_power,driveUrl:v.drive_url,mapsUrl:v.google_maps_url,notes:v.notes},'facility'))
}
function checkedValues(sel){return [...document.querySelectorAll(sel+' input[type=checkbox]:checked')].map(x=>x.value)}
async function replaceLinks(table,contractId,column,ids){
  let d=await sb.from(table).delete().eq('contract_id',contractId);if(d.error)throw d.error;
  if(ids.length){let i=await sb.from(table).insert(ids.map(id=>({user_id:(dataOwnerId||currentUser.id),contract_id:contractId,[column]:id})));if(i.error)throw i.error}
}
async function saveLeaseRelations(contractId){
  await replaceLinks('lease_land_titles',contractId,'land_title_id',checkedValues('#leaseLandChoices'));
  await replaceLinks('lease_buildings',contractId,'building_id',checkedValues('#leaseBuildingChoices'));
  await replaceLinks('lease_pbb',contractId,'pbb_id',checkedValues('#leasePbbChoices'));
  let fac=collect('#leaseFacilities .facility',['facilityType','provider','customerId','meterNo','phone','registeredName','planPower','driveUrl','mapsUrl','notes']);
  let d=await sb.from('lease_facilities').delete().eq('contract_id',contractId);if(d.error)throw d.error;
  if(fac.length){let i=await sb.from('lease_facilities').insert(fac.map(v=>({user_id:(dataOwnerId||currentUser.id),contract_id:contractId,facility_type:v.facilityType,provider:v.provider,customer_id:v.customerId,meter_no:v.meterNo,phone:v.phone,registered_name:v.registeredName,plan_power:v.planPower,drive_url:v.driveUrl,google_maps_url:v.mapsUrl,notes:v.notes})));if(i.error)throw i.error}
}
async function openEdit(i=-1){edit=i;let x=i>=0?normalizeExtractedLease(data[i]):{};$('#form').reset();['contacts','banks','payments','clauses','leaseFacilities'].forEach(id=>$('#'+id).innerHTML='');[...$('#form').elements].forEach(e=>{if(e.name&&x[e.name]!=null)e.value=(e.classList.contains('money-input')?moneyDisplay(x[e.name]):x[e.name])});refreshAssetSelect();$('#contractAssetSelect').value=x.assetId||'';if(x.assetId)applySelectedAsset();(x.contacts||[]).forEach(v=>addRepeat('contacts',v,'contact'));(x.bankAccounts||[]).forEach(v=>addRepeat('banks',v,'bank'));(x.payments||[]).forEach(pay);(x.clauses||[]).forEach(v=>addRepeat('clauses',v,'clause'));$('#verifyBadge').textContent=x.verificationStatus==='sudah_diverifikasi'?'SUDAH DIVERIFIKASI':'PERLU VERIFIKASI';$('#dlg').showModal();updatePaymentCheck();syncOpenDocButton();syncOpenMapsButton();await loadLeaseRelations(x.id||'',x.assetId||'');lockViewerDialog($('#dlg'))}window.openEdit=openEdit;
function collect(sel,fields){return [...document.querySelectorAll(sel)].map(r=>Object.fromEntries(fields.map(f=>[f,r.querySelector('.'+f)?.value||'']))).filter(o=>Object.values(o).some(Boolean))}
$('#addBtn').onclick=()=>{if(!assets.length){alert('Buat Aset / Tanah terlebih dahulu.');openAssetList();return}openEdit()};$('#extractBtn').onclick=extractDocument;$('#driveConnectBtn').onclick=connectDrive;$('#driveExtractBtn').onclick=extractFromDrive;$('#openDocBtn').onclick=openCurrentDocument;document.querySelector('[name="docUrl"]').addEventListener('input',syncOpenDocButton);$('#openMapsBtn').onclick=openCurrentMaps;document.querySelector('[name="googleMapsUrl"]').addEventListener('input',syncOpenMapsButton);$('#contractAssetSelect').addEventListener('change',async()=>{applySelectedAsset();await loadLeaseRelations(edit>=0?data[edit]?.id:'',$('#contractAssetSelect').value)});$('#cancel').onclick=()=>$('#dlg').close();$('#addPayment').onclick=()=>pay();$('#addContact').onclick=()=>addRepeat('contacts',{},'contact');$('#addBank').onclick=()=>addRepeat('banks',{},'bank');$('#addClause').onclick=()=>addRepeat('clauses',{},'clause');$('#addLeaseFacility').onclick=()=>addRepeat('leaseFacilities',{},'facility');$('#search').oninput=render;bindMoneyInput(document.querySelector('[name="rent"]'),updatePaymentCheck);bindMoneyInput(document.querySelector('[name="deposit"]'));
$('#form').onsubmit=async e=>{e.preventDefault();let x=Object.fromEntries(new FormData(e.target));x.assetId=$('#contractAssetSelect').value;x.rent=parseMoney(x.rent);x.deposit=parseMoney(x.deposit);x.contacts=collect('#contacts .contact',['role','name','phone','email']);x.bankAccounts=collect('#banks .bank',['purpose','bank','account','holder']);x.clauses=collect('#clauses .clause',['title','detail','page','importance']).map(v=>normalizeAIObject(v));x.notes=normalizeAIText(x.notes||'');x.payments=collect('#payments .payrow',['due','amount','label','status','paidDate']).map(p=>({...p,amount:parseMoney(p.amount)}));if(edit>=0&&data[edit]?.id)x.id=data[edit].id;let b=e.submitter;try{b.disabled=true;if(x.id){let existing=await historyRows('lease',x.id);if(!existing.length)await saveHistorySnapshot('lease',x.id,data[edit]?.assetId||null,data[edit],'baseline','Versi sebelum perubahan')}await saveContract(x);let saved=data.find(v=>x.id?v.id===x.id:(v.deedNo===x.deedNo&&v.tenant===x.tenant));if(saved?.id){await saveLeaseRelations(saved.id);await captureLeaseVersion(saved.id,x.id?'Perubahan disimpan':'Akta pertama disimpan')}await loadData();$('#dlg').close()}catch(err){alert('Gagal menyimpan: '+err.message)}finally{b.disabled=false}};



// v1.19.1 — immutable document history + AI comparison
let historyContext={entityType:'',entityId:'',title:''};
function historyOwner(){return dataOwnerId||currentUser?.id}
async function saveHistorySnapshot(entityType,entityId,assetId,snapshot,eventType='snapshot',label=''){
 if(!entityId||!snapshot||!historyOwner())return;
 const clean=JSON.parse(JSON.stringify(snapshot));
 const r=await sb.from('document_history').insert({user_id:historyOwner(),entity_type:entityType,entity_id:String(entityId),asset_id:assetId||null,event_type:eventType,label:label||'',snapshot:clean});
 if(r.error)throw r.error;
}
async function historyRows(entityType,entityId){let r=await sb.from('document_history').select('*').eq('entity_type',entityType).eq('entity_id',String(entityId)).order('created_at',{ascending:true});if(r.error)throw r.error;return r.data||[]}
function historyLabel(r,i){let d=new Date(r.created_at);return `Versi ${i+1} · ${d.toLocaleString('id-ID')} · ${r.label||r.event_type||'snapshot'}`}
async function openHistory(entityType,entityId,title){if(!entityId)return alert('Simpan dokumen terlebih dahulu agar riwayat dapat dibuat.');historyContext={entityType,entityId,title};let rows=await historyRows(entityType,entityId);$('#historyTitle').textContent='Riwayat — '+title;let tl=$('#historyTimeline');tl.innerHTML=rows.length?rows.map((r,i)=>`<div class="history-item"><b>${historyLabel(r,i)}</b><div>${historySummary(entityType,r.snapshot)}</div></div>`).join(''):'<div class="muted">Belum ada riwayat tersimpan. Simpan perubahan berikutnya untuk mulai membuat versi.</div>';let opts=rows.map((r,i)=>`<option value="${r.id}">${historyLabel(r,i)}</option>`).join('');$('#historyOld').innerHTML=opts;$('#historyNew').innerHTML=opts;if(rows.length>1){$('#historyOld').selectedIndex=Math.max(0,rows.length-2);$('#historyNew').selectedIndex=rows.length-1}$('#historyCompareResult').innerHTML='';$('#historyDlg').showModal()}
function historySummary(t,s){if(t==='lease')return `${s.tenant||'-'} · Akta ${s.deedNo||'-'} · ${s.start||'-'} s/d ${s.end||'-'} · ${(s.clauses||[]).length} klausul`;let lands=s.landTitles||[];return lands.map(x=>`${x.right_type||x.rightType||'Hak'} ${x.certificate_no||x.certificateNo||'-'} · ${x.land_area||x.landArea||'-'} m²`).join('<br>')||'Tidak ada sertifikat'}
async function compareHistoryAI(){let oldId=$('#historyOld').value,newId=$('#historyNew').value;if(!oldId||!newId||oldId===newId)return alert('Pilih dua versi yang berbeda.');let rows=await historyRows(historyContext.entityType,historyContext.entityId),a=rows.find(x=>x.id===oldId),b=rows.find(x=>x.id===newId);if(!a||!b)return;let box=$('#historyCompareResult');aiProgress(box,'AI sedang membandingkan dokumen lama dan baru…');try{let out=await invokeExtractLease({documentType:'history_compare',comparisonData:{entityType:historyContext.entityType,old:a.snapshot,new:b.snapshot}});renderHistoryComparison(box,out.data||{})}catch(e){aiProgressError(box,'Perbandingan gagal: '+e.message)}}
function renderHistoryComparison(box,x){let changes=x.changes||[],missing=x.missingFromNew||[],carried=x.explicitlyCarriedForward||[];box.className='history-comparison';box.innerHTML=`<h3>Hasil Perbandingan AI</h3>${x.summary?`<p>${x.summary}</p>`:''}<h4>Perubahan</h4>${changes.length?changes.map(v=>`<div class="compare-row"><b>${v.topic||'Perubahan'}</b><div><span class="old">Lama: ${v.oldValue||'-'}</span><span class="new">Baru: ${v.newValue||'-'}</span></div><small>${v.note||''}</small></div>`).join(''):'<div class="muted">Tidak ada perubahan material yang dikenali.</div>'}<h4>⚠️ Ada di dokumen lama, tidak ditemukan di dokumen baru</h4>${missing.length?missing.map(v=>`<div class="compare-warning"><b>${v.topic||'Klausul'}</b><div>${v.oldText||v.detail||''}</div><small>${v.source||''} · Perlu verifikasi apakah masih berlaku; aplikasi tidak menyimpulkan status hukumnya.</small></div>`).join(''):'<div class="muted">Tidak ada.</div>'}${carried.length?`<h4>Disebut tetap berlaku</h4>${carried.map(v=>`<div class="compare-ok"><b>${v.topic||'Klausul'}</b><div>${v.reason||''}</div></div>`).join('')}`:''}`}
async function captureLeaseVersion(contractId,label='Disimpan'){let r=await sb.from('contracts').select('*').eq('id',contractId).single();if(r.error)throw r.error;let snap=rowToApp(r.data);await saveHistorySnapshot('lease',contractId,r.data.asset_id,snap,'save',label)}
async function captureAssetLandVersion(assetId,label='Sertifikat disimpan'){let a=await sb.from('assets').select('*').eq('id',assetId).single(),l=await sb.from('land_titles').select('*').eq('asset_id',assetId).order('created_at');if(a.error)throw a.error;if(l.error)throw l.error;await saveHistorySnapshot('land',assetId,assetId,{asset:a.data,landTitles:l.data||[]},'save',label)}
async function openHistorySearch(){ $('#historySearchInput').value='';$('#historySearchResults').innerHTML='<div class="muted">Ketik kata pencarian.</div>';$('#historySearchDlg').showModal() }
async function runHistorySearch(){let q=$('#historySearchInput').value.trim().toLowerCase();if(q.length<2){$('#historySearchResults').innerHTML='<div class="muted">Ketik minimal 2 karakter.</div>';return}let r=await sb.from('document_history').select('*').order('created_at',{ascending:false}).limit(500);if(r.error){$('#historySearchResults').textContent=r.error.message;return}let hits=(r.data||[]).filter(x=>JSON.stringify(x.snapshot).toLowerCase().includes(q));$('#historySearchResults').innerHTML=hits.length?hits.slice(0,100).map(x=>`<div class="history-search-hit"><b>${x.entity_type==='lease'?'Akta Sewa':'Sertifikat Tanah'} · ${new Date(x.created_at).toLocaleDateString('id-ID')}</b><div>${highlightHistoryHit(x.snapshot,q)}</div></div>`).join(''):'<div class="muted">Tidak ditemukan.</div>'}
function highlightHistoryHit(s,q){let text=JSON.stringify(s).replace(/[{}\[\]"]/g,' ').replace(/,/g,', ');let i=text.toLowerCase().indexOf(q);let a=Math.max(0,i-120),b=Math.min(text.length,i+q.length+220);return (a?'…':'')+text.slice(a,b)+(b<text.length?'…':'')}

async function getPropertyChildren(assetId){
  const [lt,b]=await Promise.all([
    sb.from('land_titles').select('*').eq('asset_id',assetId).order('created_at'),
    sb.from('buildings').select('*').eq('asset_id',assetId).order('created_at')
  ]);
  if(lt.error)throw lt.error;if(b.error)throw b.error;
  return{landTitles:lt.data||[],buildings:b.data||[]}
}
async function propertyCounts(assetId){
  const [lt,b]=await Promise.all([
    sb.from('land_titles').select('id',{count:'exact',head:true}).eq('asset_id',assetId),
    sb.from('buildings').select('id',{count:'exact',head:true}).eq('asset_id',assetId)
  ]);
  return{lands:lt.count||0,buildings:b.count||0}
}
function openAssetList(){renderAssetCards();$('#assetListDlg').showModal()}window.openAssetList=openAssetList;
async function renderAssetCards(){
  const box=$('#assetCards');
  if(!assets.length){box.innerHTML='<div class="muted">Belum ada properti/lokasi.</div>';return}
  box.innerHTML='<div class="muted">Memuat struktur properti…</div>';
  const counts=await Promise.all(assets.map(a=>propertyCounts(a.id).catch(()=>({lands:0,buildings:0}))));
  box.innerHTML=assets.map((a,i)=>`<div class="asset-master-card"><div class="property-label">PROPERTI / LOKASI</div><h3>${a.name}</h3><div>${a.address||'-'}</div><div class="property-counts"><span>📜 ${counts[i].lands} sertifikat tanah</span><span>🏭 ${counts[i].buildings} bangunan</span></div><div class="asset-master-actions"><button type="button" onclick="openAssetEdit(${i})">Buka Properti</button>${a.googleMapsUrl?`<button type="button" class="secondary" onclick="window.open('${a.googleMapsUrl}','_blank','noopener,noreferrer')">📍 Maps</button>`:''}</div></div>`).join('')
}
async function openAssetEdit(i=-1){
  assetEdit=i;let a=i>=0?assets[i]:{};
  $('#assetForm').reset();$('#assetLandTitles').innerHTML='';$('#assetBuildings').innerHTML='';
  for(let e of $('#assetForm').elements)if(e.name&&a[e.name]!=null)e.value=a[e.name];
  if(a.id)try{
    const c=await getPropertyChildren(a.id);
    c.landTitles.forEach(v=>addRepeat('assetLandTitles',{rightType:v.right_type,certificateNo:v.certificate_no,landArea:v.land_area,validUntil:v.valid_until,address:v.address,driveUrl:v.drive_url,mapPlanUrl:v.map_plan_url,mapsUrl:v.google_maps_url,holderName:v.holder_name,surveyNo:v.survey_no,surveyDate:v.survey_date,notes:v.notes},'landtitle'));
    c.buildings.forEach(v=>addRepeat('assetBuildings',{name:v.name,buildingType:v.building_type,buildingArea:v.building_area,address:v.address,driveUrl:v.drive_url,floorPlanUrl:v.floor_plan_url,mapsUrl:v.google_maps_url,notes:v.notes},'building'));
    let firstLand=$('#assetLandTitles .landtitle');if(firstLand&&isAutoLandPropertyName($('#assetForm').elements.namedItem('name')?.value))syncAutoLandPropertyName(firstLand,true);
  }catch(e){alert('Gagal membaca detail properti: '+e.message)}
  $('#assetListDlg').close();$('#assetDlg').showModal();lockViewerDialog($('#assetDlg'))
}window.openAssetEdit=openAssetEdit;
async function replacePropertyChildren(table,assetId,rows,mapper){
  let del=await sb.from(table).delete().eq('asset_id',assetId);if(del.error)throw del.error;
  if(!rows.length)return;
  let ins=await sb.from(table).insert(rows.map(r=>({user_id:(dataOwnerId||currentUser.id),asset_id:assetId,...mapper(r)})));if(ins.error)throw ins.error
}
$('#assetsBtn').onclick=openAssetList;$('#assetListClose').onclick=()=>$('#assetListDlg').close();$('#newAssetBtn').onclick=()=>openAssetEdit(-1);$('#assetCancel').onclick=()=>$('#assetDlg').close();
$('#assetAddLandTitle').onclick=()=>addRepeat('assetLandTitles',{},'landtitle');
$('#assetAddBuilding').onclick=()=>addRepeat('assetBuildings',{},'building');
$('#assetAddPbb').onclick=async()=>{if(assetEdit<0||!assets[assetEdit]?.id)return alert('Simpan Properti terlebih dahulu sebelum menambahkan PBB.');window.pbbPropertyAssetId=assets[assetEdit].id;await openPbbEdit(-1,assets[assetEdit].id)};
$('#assetOpenMaps').onclick=()=>{let u=$('#assetForm').querySelector('[name="googleMapsUrl"]').value.trim();if(u)window.open(u,'_blank','noopener,noreferrer')};
$('#assetForm').onsubmit=async e=>{
  e.preventDefault();let x=Object.fromEntries(new FormData(e.target));
  let lands=collect('#assetLandTitles .landtitle',['rightType','certificateNo','landArea','validUntil','address','driveUrl','mapPlanUrl','mapsUrl','holderName','surveyNo','surveyDate','notes']);
  let buildings=collect('#assetBuildings .building',['name','buildingType','buildingArea','address','driveUrl','floorPlanUrl','mapsUrl','notes']);
  let row={user_id:(dataOwnerId||currentUser.id),name:x.name||'',address:x.address||'',area:x.area||'',google_maps_url:x.googleMapsUrl||'',notes:x.notes||'',updated_at:new Date().toISOString()};
  if(assetEdit>=0&&assets[assetEdit]?.id){let existing=await historyRows('land',assets[assetEdit].id);if(!existing.length)await captureAssetLandVersion(assets[assetEdit].id,'Versi sertifikat sebelum perubahan')}let r=assetEdit>=0?await sb.from('assets').update(row).eq('id',assets[assetEdit].id).select().single():await sb.from('assets').insert(row).select().single();
  if(r.error)return alert('Gagal menyimpan properti: '+r.error.message);
  try{
    let id=r.data.id;
    await replacePropertyChildren('land_titles',id,lands,v=>({right_type:v.rightType,certificate_no:v.certificateNo,land_area:v.landArea?Number(v.landArea):null,valid_until:idToISO(v.validUntil)||null,address:v.address,drive_url:v.driveUrl,map_plan_url:v.mapPlanUrl,google_maps_url:v.mapsUrl,holder_name:v.holderName||'',survey_no:v.surveyNo||'',survey_date:idToISO(v.surveyDate)||null,notes:v.notes}));
    await replacePropertyChildren('buildings',id,buildings,v=>({name:v.name,building_type:v.buildingType,building_area:v.buildingArea?Number(v.buildingArea):null,address:v.address,drive_url:v.driveUrl,floor_plan_url:v.floorPlanUrl,google_maps_url:v.mapsUrl,notes:v.notes}));
    await captureAssetLandVersion(id,assetEdit>=0?'Perubahan sertifikat disimpan':'Sertifikat pertama disimpan');
    await loadData();$('#assetDlg').close();openAssetList()
  }catch(err){alert('Properti tersimpan, tetapi detail tanah/bangunan gagal: '+err.message)}
};

async function loadPbbData(){let r=await sb.from('pbb_records').select('*').order('tax_year',{ascending:false});if(r.error)throw r.error;pbbData=r.data||[]}
function pbbMoney(v){return moneyDisplay(v)||'Rp 0,00'}
function pbbArea(v){return numberID(v)||'0,00'}
async function openPbbList(){await loadPbbData();$('#pbbCards').innerHTML=pbbData.length?pbbData.map((r,i)=>`<div class="asset-master-card"><h3>NOP ${r.nop||'-'} · ${r.tax_year||'-'}</h3><div>Tanah ${pbbArea(r.land_area)} m² · Bangunan ${pbbArea(r.building_area)} m²</div><div class="muted">Total NJOP ${pbbMoney(r.njop_total)} · PBB terutang ${pbbMoney(r.pbb_due)} · Harus dibayar ${pbbMoney(r.pbb_payable)}</div><div class="muted">Jatuh tempo ${isoToID(r.due_date)||'-'} · ${r.payment_status==='lunas'?'Sudah Bayar':'Belum Bayar'}${r.warning_ignored?' · Warning diabaikan':''}</div><div class="asset-master-actions"><button type="button" onclick="openPbbEdit(${i})">${currentRole==='viewer'?'Buka':'Buka / Edit'}</button>${r.drive_sppt_url?`<button type="button" class="secondary" onclick="window.open('${r.drive_sppt_url}','_blank','noopener,noreferrer')">📄 SPPT</button>`:''}${r.drive_payment_url?`<button type="button" class="secondary" onclick="window.open('${r.drive_payment_url}','_blank','noopener,noreferrer')">🧾 Bukti Bayar</button>`:''}</div></div>`).join(''):'<div class="muted">Belum ada data PBB.</div>';$('#pbbDlg').showModal()}window.openPbbList=openPbbList;
async function openPbbEdit(i=-1,assetId=null){pbbEdit=i;let r=i>=0?pbbData[i]:{};$('#pbbForm').reset();let map={taxpayerName:'taxpayer_name',objectAddress:'object_address',taxYear:'tax_year',landArea:'land_area',buildingArea:'building_area',landNjopM2:'njop_land_per_m2',landNjopTotal:'njop_land_total',buildingNjopM2:'njop_building_per_m2',buildingNjopTotal:'njop_building_total',totalNjop:'njop_total',taxDue:'pbb_due',payableAmount:'pbb_payable',dueDate:'due_date',paymentStatus:'payment_status',paidDate:'paid_date',spptUrl:'drive_sppt_url',paymentProofUrl:'drive_payment_url',googleMapsUrl:'google_maps_url',warningIgnored:'warning_ignored',warningIgnoreReason:'warning_ignore_reason'};for(let e of $('#pbbForm').elements)if(e.name){let key=map[e.name]||e.name,v=r[key];if(e.type==='checkbox')e.checked=!!v;else if(v!=null){if(e.classList.contains('money-input'))e.value=moneyDisplay(v);else if(e.classList.contains('area-input'))e.value=numberID(v);else if(e.name==='dueDate'||e.name==='paidDate')e.value=isoToID(v);else e.value=v}}
  syncPbbPaymentFields();let lq=sb.from('land_titles').select('*').order('certificate_no'),bq=sb.from('buildings').select('*').order('name');if(assetId){lq=lq.eq('asset_id',assetId);bq=bq.eq('asset_id',assetId)}let l=await lq,b=await bq,li=[],bi=[];
  if(r.id){let [lr,br]=await Promise.all([sb.from('pbb_land_titles').select('land_title_id').eq('pbb_id',r.id),sb.from('pbb_buildings').select('building_id').eq('pbb_id',r.id)]);li=(lr.data||[]).map(x=>x.land_title_id);bi=(br.data||[]).map(x=>x.building_id)}
  $('#pbbLandChoices').innerHTML=checkListHtml(l.data||[],'land',li);$('#pbbBuildingChoices').innerHTML=checkListHtml(b.data||[],'building',bi);$('#pbbDlg').close();$('#pbbEditDlg').showModal();lockViewerDialog($('#pbbEditDlg'))
}window.openPbbEdit=openPbbEdit;
async function replacePbbLinks(table,pbbId,column,ids){let d=await sb.from(table).delete().eq('pbb_id',pbbId);if(d.error)throw d.error;if(ids.length){let i=await sb.from(table).insert(ids.map(id=>({user_id:(dataOwnerId||currentUser.id),pbb_id:pbbId,[column]:id})));if(i.error)throw i.error}}
function syncPbbPaymentFields(){let f=$('#pbbForm'),paid=f?.elements.namedItem('paidDate'),status=f?.elements.namedItem('paymentStatus');if(!paid||!status)return;paid.disabled=status.value!=='lunas';if(status.value!=='lunas')paid.value=''}
$('#pbbBtn').onclick=openPbbList;$('#pbbClose').onclick=()=>$('#pbbDlg').close();$('#newPbbBtn').onclick=()=>openPbbEdit(-1);$('#pbbCancel').onclick=()=>{$('#pbbEditDlg').close();openPbbList()};$('#pbbForm').elements.namedItem('paymentStatus').addEventListener('change',syncPbbPaymentFields);
['landNjopM2','landNjopTotal','buildingNjopM2','buildingNjopTotal','totalNjop','taxDue','payableAmount'].forEach(n=>bindMoneyInput($('#pbbForm').elements.namedItem(n)));['landArea','buildingArea'].forEach(n=>{let e=$('#pbbForm').elements.namedItem(n);e.addEventListener('focus',()=>{e.value=e.value?String(parseMoney(e.value)):'';setTimeout(()=>e.select(),0)});e.addEventListener('blur',()=>{e.value=numberID(e.value)})});
$('#pbbForm').onsubmit=async e=>{e.preventDefault();let x=Object.fromEntries(new FormData(e.target)),num=k=>x[k]?parseMoney(x[k]):null;let row={user_id:(dataOwnerId||currentUser.id),nop:x.nop||'',taxpayer_name:x.taxpayerName||'',object_address:x.objectAddress||'',tax_year:x.taxYear?Number(x.taxYear):null,land_area:num('landArea'),building_area:num('buildingArea'),njop_land_per_m2:num('landNjopM2'),njop_land_total:num('landNjopTotal'),njop_building_per_m2:num('buildingNjopM2'),njop_building_total:num('buildingNjopTotal'),njop_total:num('totalNjop'),pbb_due:num('taxDue'),pbb_payable:num('payableAmount'),due_date:idToISO(x.dueDate)||null,payment_status:x.paymentStatus||'belum_bayar',paid_date:x.paymentStatus==='lunas'?(idToISO(x.paidDate)||null):null,drive_sppt_url:x.spptUrl||'',drive_payment_url:x.paymentProofUrl||'',google_maps_url:x.googleMapsUrl||'',warning_ignored:e.target.elements.namedItem('warningIgnored').checked,warning_ignore_reason:x.warningIgnoreReason||'',notes:x.notes||''};let r=pbbEdit>=0?await sb.from('pbb_records').update(row).eq('id',pbbData[pbbEdit].id).select().single():await sb.from('pbb_records').insert(row).select().single();if(r.error)return alert('Gagal menyimpan PBB: '+r.error.message);try{await replacePbbLinks('pbb_land_titles',r.data.id,'land_title_id',checkedValues('#pbbLandChoices'));await replacePbbLinks('pbb_buildings',r.data.id,'building_id',checkedValues('#pbbBuildingChoices'));$('#pbbEditDlg').close();await loadPbbData();render();openPbbList()}catch(err){alert('PBB tersimpan tetapi relasi gagal: '+err.message)}};

function mergeAIResults(a,b){
 if(!a)return b||{};if(!b)return a;const out={...a};
 for(const [k,v] of Object.entries(b)){
   if(Array.isArray(v)){if(v.length)out[k]=[...(Array.isArray(out[k])?out[k]:[]),...v]}
   else if(v&&typeof v==='object')out[k]=mergeAIResults(out[k]||{},v);
   else if(v!==''&&v!==0&&v!=null){if(out[k]===''||out[k]===0||out[k]==null)out[k]=v;else if(['surveyNo','surveyDate','validUntil'].includes(k))out[k]=v}
 }return out
}
async function canvasJpegBase64(canvas,quality=.58){return new Promise((resolve,reject)=>canvas.toBlob(async b=>{if(!b)return reject(new Error('Gagal membuat gambar halaman PDF.'));try{resolve(await blobToBase64(b))}catch(e){reject(e)}},'image/jpeg',quality))}
async function renderPdfPageForAI(page){
 const base=page.getViewport({scale:1});
 // Keep each page intentionally small: the Edge Function receives only one compressed page per request.
 const maxSide=1400,scale=Math.min(1.45,maxSide/Math.max(base.width,base.height));
 const vp=page.getViewport({scale});const c=document.createElement('canvas');c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);
 const ctx=c.getContext('2d',{alpha:false});await page.render({canvasContext:ctx,viewport:vp,background:'white'}).promise;
 let base64=await canvasJpegBase64(c,.58);
 // Extra guard for unusually dense scans. Re-render smaller rather than sending a large request to Supabase.
 if(base64.length>1400000){const smallScale=scale*.72,svp=page.getViewport({scale:smallScale});c.width=Math.ceil(svp.width);c.height=Math.ceil(svp.height);await page.render({canvasContext:c.getContext('2d',{alpha:false}),viewport:svp,background:'white'}).promise;base64=await canvasJpegBase64(c,.5)}
 c.width=c.height=1;return base64
}
async function invokeLargePdfAI(file,documentType,onProgress=()=>{}){
 if(!window.pdfjsLib)throw new Error('Modul PDF besar belum termuat. Muat ulang halaman lalu coba lagi.');
 if(file.size>500*1024*1024)throw new Error('File lebih dari 500 MB.');
 onProgress('Membuka PDF di perangkat Anda…');const objectUrl=URL.createObjectURL(file);let pdf;
 try{
   pdf=await pdfjsLib.getDocument({url:objectUrl,disableAutoFetch:true,disableStream:false,disableRange:false}).promise;
   const total=pdf.numPages;let merged={};
   for(let n=1;n<=total;n++){
     onProgress(`Menyiapkan halaman ${n} dari ${total} di perangkat Anda…`);
     const page=await pdf.getPage(n);const base64=await renderPdfPageForAI(page);page.cleanup();
     onProgress(`AI membaca halaman ${n} dari ${total}…`);
     const out=await invokeExtractLease({filename:file.name,documentType,images:[{base64,mimeType:'image/jpeg',page:n}],pageStart:n,pageEnd:n,totalPages:total});
     if(!out?.data)throw new Error(out?.error||`Hasil ekstraksi halaman ${n} kosong`);merged=mergeAIResults(merged,out.data);
     // Yield to Safari/Chrome so memory from the previous canvas/request can be reclaimed.
     await new Promise(r=>setTimeout(r,40));
   }
   onProgress('Semua halaman selesai dibaca. Menggabungkan hasil…');return merged
 }finally{try{pdf?.destroy()}catch(_){}URL.revokeObjectURL(objectUrl)}
}
async function invokeLargeImageAI(file,documentType,onProgress=()=>{}){
 onProgress('Mengoptimalkan foto besar di perangkat Anda…');
 let bmp;try{bmp=await createImageBitmap(file)}catch(_){throw new Error('Foto besar tidak dapat dibuka oleh browser/perangkat ini. Coba simpan sebagai PDF atau perkecil resolusi foto.');}
 const maxSide=1800,scale=Math.min(1,maxSide/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));
 c.getContext('2d',{alpha:false}).drawImage(bmp,0,0,c.width,c.height);try{bmp.close()}catch(_){}
 const base64=await canvasJpegBase64(c,.62);c.width=c.height=1;onProgress('Mengirim foto yang sudah dioptimalkan ke AI…');
 const out=await invokeExtractLease({filename:file.name,documentType,images:[{base64,mimeType:'image/jpeg',page:1}],pageStart:1,pageEnd:1,totalPages:1});if(!out?.data)throw new Error(out?.error||'Hasil ekstraksi kosong');return out.data
}
async function invokeDocumentAI(file,documentType,onProgress=()=>{}){
 if(!file)throw new Error('Pilih file terlebih dahulu.');
 if(file.size>500*1024*1024)throw new Error('File lebih dari 500 MB.');
 const isPdf=(file.type==='application/pdf'||/\.pdf$/i.test(file.name));
 if(file.size>18*1024*1024){if(!isPdf)return invokeLargeImageAI(file,documentType,onProgress);return invokeLargePdfAI(file,documentType,onProgress)}
 onProgress('Menyiapkan file untuk dibaca…');const base64=await fileToBase64(file);onProgress('Mengirim dokumen ke AI. AI sedang membaca dan mengekstrak data…');const out=await invokeExtractLease({filename:file.name,mimeType:file.type||'application/pdf',base64,documentType});if(!out?.data)throw new Error(out?.error||'Hasil ekstraksi kosong');onProgress('AI selesai membaca. Memproses hasil…');return out.data
}
async function invokeLargeDrivePdfAI(id,meta,documentType,onProgress=()=>{}){
 if(!window.pdfjsLib)throw new Error('Modul PDF besar belum termuat. Muat ulang halaman lalu coba lagi.');
 const size=Number(meta.size||0),totalMB=size/1024/1024;
 const mediaUrl=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`;
 onProgress(`Membuka PDF ${totalMB.toFixed(1)} MB langsung dari Google Drive tanpa mengunduh seluruh file…`);
 let pdf,task;
 try{
   task=pdfjsLib.getDocument({url:mediaUrl,httpHeaders:{Authorization:`Bearer ${googleDriveToken}`},withCredentials:false,disableRange:false,disableStream:false,disableAutoFetch:true,rangeChunkSize:1024*1024});
   task.onProgress=p=>{
     const loaded=Number(p?.loaded||0),total=Number(p?.total||size||0);
     if(total>0){const pct=Math.min(100,Math.round(loaded/total*100));onProgress(`Mengambil bagian PDF yang diperlukan dari Google Drive: ${(loaded/1024/1024).toFixed(1)} / ${(total/1024/1024).toFixed(1)} MB (${pct}%)…`)}
   };
   pdf=await task.promise;const totalPages=pdf.numPages;let merged={};
   for(let n=1;n<=totalPages;n++){
     onProgress(`Menyiapkan halaman ${n} dari ${totalPages} langsung dari Google Drive…`);
     const page=await pdf.getPage(n);const base64=await renderPdfPageForAI(page);page.cleanup();
     onProgress(`AI membaca halaman ${n} dari ${totalPages}…`);
     const out=await invokeExtractLease({filename:meta.name||'drive-file.pdf',documentType,images:[{base64,mimeType:'image/jpeg',page:n}],pageStart:n,pageEnd:n,totalPages});
     if(!out?.data)throw new Error(out?.error||`Hasil ekstraksi halaman ${n} kosong`);merged=mergeAIResults(merged,out.data);
     await new Promise(r=>setTimeout(r,60));
   }
   onProgress('Semua halaman selesai dibaca. Menggabungkan hasil…');return merged
 }catch(e){
   const msg=String(e?.message||e);
   if(/401|unauthorized|missing pdf|unexpected server response/i.test(msg))throw new Error(`Streaming Google Drive gagal: ${msg}. Coba hubungkan ulang Google Drive.`);
   throw e
 }finally{try{pdf?.destroy()}catch(_){}try{task?.destroy()}catch(_){}}
}
async function invokeDriveAI(url,documentType,onProgress=()=>{}){
 const id=driveFileId(url);if(!id)throw new Error('Link Google Drive tidak valid.');
 onProgress('Menghubungkan ke Google Drive…');if(!googleDriveToken)await requestDriveToken();
 let headers={Authorization:`Bearer ${googleDriveToken}`};
 onProgress('Membaca informasi file Google Drive…');
 let mr=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,size&supportsAllDrives=true`,{headers});
 if(mr.status===401){googleDriveToken='';await requestDriveToken();headers={Authorization:`Bearer ${googleDriveToken}`};mr=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,size&supportsAllDrives=true`,{headers})}
 if(!mr.ok)throw new Error(`Tidak dapat membaca metadata Google Drive (${mr.status}).`);
 const meta=await mr.json(),size=Number(meta.size||0),mime=String(meta.mimeType||'');
 if(mime.startsWith('application/vnd.google-apps.'))throw new Error('Gunakan file PDF/JPG/PNG di Google Drive, bukan Google Docs/Sheets.');
 if(size>500*1024*1024)throw new Error('File Google Drive lebih dari 500 MB.');
 const isPdf=mime==='application/pdf'||/\.pdf$/i.test(meta.name||'');
 if(size>18*1024*1024){
   if(!isPdf){onProgress(`Mengunduh foto besar dari Google Drive untuk dioptimalkan di perangkat (${(size/1024/1024).toFixed(1)} MB)…`);let ir=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`,{headers});if(!ir.ok)throw new Error(`Tidak dapat mengunduh foto Google Drive (${ir.status}).`);let blob=await ir.blob();let f=new File([blob],meta.name||'drive-image',{type:mime||blob.type||'image/jpeg'});const data=await invokeLargeImageAI(f,documentType,onProgress);return {data,webViewLink:url};}
   const data=await invokeLargeDrivePdfAI(id,meta,documentType,onProgress);return {data,webViewLink:url};
 }
 onProgress('Mengirim referensi file ke server. AI sedang membaca dan mengekstrak data…');
 const out=await invokeExtractLease({driveFileId:id,driveAccessToken:googleDriveToken,documentType});if(!out?.data)throw new Error(out?.error||'Hasil ekstraksi kosong');
 onProgress('AI selesai membaca. Memproses hasil…');return {data:out.data,webViewLink:url}
}
function fillIfEmpty(el,value){if(!el||value===undefined||value===null)return;let v=String(value).trim();if(v&&!String(el.value||'').trim())el.value=v}
function normalizeLandRightType(v){let raw=String(v||'').trim(),k=raw.toUpperCase().replace(/[.\s_-]+/g,' ');if(/\b(SHGB|SERTIFIKAT HAK GUNA BANGUNAN)\b/.test(k))return 'SHGB';if(/\b(HGB|HAK GUNA BANGUNAN)\b/.test(k))return 'HGB';if(/\b(SHM|SERTIFIKAT HAK MILIK)\b/.test(k))return 'SHM';if(k==='HM'||/\bHAK MILIK\b/.test(k))return 'HM';if(/\bHAK PAKAI\b/.test(k))return 'Hak Pakai';return 'Lainnya'}
function landTitleRowData(row){return {rightType:normalizeLandRightType(row?.querySelector('.rightType')?.value),certificateNo:row?.querySelector('.certificateNo')?.value||'',landArea:row?.querySelector('.landArea')?.value||'',address:row?.querySelector('.address')?.value||''}}
function landTitlePropertyName(x){let rt=normalizeLandRightType(x.rightType),no=String(x.certificateNo||'').trim(),addr=String(x.address||'').trim();let loc='';let m=addr.match(/(?:Kelurahan|Desa)\s+([^,]+)/i);if(m)loc=m[1].trim();if(!loc){m=addr.match(/(?:Kecamatan)\s+([^,]+)/i);if(m)loc=m[1].trim()}if(!loc&&addr)loc=addr.split(',')[0].replace(/^(Jl\.?|Jalan)\s+/i,'').trim();let parts=[];if(loc)parts.push('Tanah '+loc);else parts.push('Tanah');if(rt||no)parts.push([rt,no].filter(Boolean).join(' '));return parts.filter(Boolean).join(' – ')}
function isAutoLandPropertyName(v){return /^Tanah(?:\s+.+)?\s+–\s+(?:HGB|SHGB|SHM|HM|Hak Pakai|Lainnya)\s+.+$/i.test(String(v||'').trim())}
function syncAutoLandPropertyName(row,force=false){let form=$('#assetForm'),name=form?.elements.namedItem('name');if(!name||!row)return;let next=landTitlePropertyName(landTitleRowData(row)),cur=String(name.value||'').trim();if(!cur||force||isAutoLandPropertyName(cur))name.value=next}
function bindLandTitleSync(row){if(!row||row.dataset.rightSync==='1')return;row.dataset.rightSync='1';['rightType','certificateNo','address'].forEach(c=>{let e=row.querySelector('.'+c);if(e)e.addEventListener(c==='rightType'?'change':'input',()=>syncAutoLandPropertyName(row))})}
function autofillPropertyFromLandTitle(row,x){let form=$('#assetForm');if(!form)return;let name=form.elements.namedItem('name'),address=form.elements.namedItem('address'),area=form.elements.namedItem('area'),maps=form.elements.namedItem('googleMapsUrl');fillIfEmpty(name,landTitlePropertyName(x));fillIfEmpty(address,x.address);if(x.landArea!==undefined&&x.landArea!==null&&x.landArea!=='')fillIfEmpty(area,`Luas tanah ${numberID(x.landArea)} m²`);let mapCandidate=x.googleMapsUrl||x.mapsUrl||x.google_maps_url||'';if(/^https?:\/\/(?:www\.)?(?:google\.[^/]+\/maps|maps\.app\.goo\.gl)\//i.test(String(mapCandidate).trim()))fillIfEmpty(maps,mapCandidate);if(row){bindLandTitleSync(row);let rowMap=row.querySelector('.mapsUrl');if(rowMap&&!rowMap.value&&mapCandidate)rowMap.value=mapCandidate}}
function applyLandTitleAI(row,x){x=normalizeAIObject(x||{});x.rightType=normalizeLandRightType(x.rightType);let m={rightType:'rightType',certificateNo:'certificateNo',landArea:'landArea',validUntil:'validUntil',address:'address',holderName:'holderName',surveyNo:'surveyNo',surveyDate:'surveyDate',notes:'notes'};Object.entries(m).forEach(([k,c])=>{if(x[k]!==undefined&&x[k]!==null&&x[k]!==''){let e=row.querySelector('.'+c);if(e)e.value=(k==='validUntil'||k==='surveyDate')?isoToID(x[k]):x[k]}});bindLandTitleSync(row);autofillPropertyFromLandTitle(row,x)}
async function extractLandTitleRow(btn){let row=btn.closest('.landtitle'),file=row.querySelector('.landAiFile').files?.[0],st=row.querySelector('.land-ai-status');btn.disabled=true;try{applyLandTitleAI(row,await invokeDocumentAI(file,'land_title',m=>aiProgress(st,m)));recordAIScan();aiProgressDone(st,'Sertifikat selesai dibaca. Periksa hasil sebelum menyimpan.')}catch(e){aiProgressError(st,'Gagal membaca sertifikat: '+(e.message||e))}finally{btn.disabled=false}}window.extractLandTitleRow=extractLandTitleRow;
async function extractLandTitleDriveRow(btn){let row=btn.closest('.landtitle'),url=row.querySelector('.driveUrl').value.trim(),st=row.querySelector('.land-ai-status');btn.disabled=true;try{let r=await invokeDriveAI(url,'land_title',m=>aiProgress(st,m));applyLandTitleAI(row,r.data);recordAIScan();row.querySelector('.driveUrl').value=r.webViewLink;aiProgressDone(st,'Sertifikat Google Drive selesai dibaca. Periksa hasil sebelum menyimpan.')}catch(e){aiProgressError(st,'Gagal membaca sertifikat dari Drive: '+(e.message||e))}finally{btn.disabled=false}}window.extractLandTitleDriveRow=extractLandTitleDriveRow;
function applyPbbAI(x){x=normalizeAIObject(x||{});let m={nop:'nop',taxpayerName:'taxpayerName',objectAddress:'objectAddress',taxYear:'taxYear',landArea:'landArea',buildingArea:'buildingArea',landNjopM2:'landNjopM2',landNjopTotal:'landNjopTotal',buildingNjopM2:'buildingNjopM2',buildingNjopTotal:'buildingNjopTotal',totalNjop:'totalNjop',taxDue:'taxDue',payableAmount:'payableAmount',dueDate:'dueDate',notes:'notes'};Object.entries(m).forEach(([k,n])=>{if(x[k]!==undefined&&x[k]!==null&&x[k]!==''){let e=$('#pbbForm').elements.namedItem(n);if(e){if(e.classList.contains('money-input'))e.value=moneyDisplay(x[k]);else if(e.classList.contains('area-input'))e.value=numberID(x[k]);else if(n==='dueDate')e.value=isoToID(x[k]);else e.value=x[k]}}})}
$('#pbbExtractBtn').onclick=async()=>{let b=$('#pbbExtractBtn'),s=$('#pbbExtractStatus');b.disabled=true;try{let x=await invokeDocumentAI($('#pbbAiFile').files?.[0],'pbb',m=>aiProgress(s,m));applyPbbAI(x);aiProgressDone(s,'SPPT selesai dibaca. Periksa semua angka dan data sebelum menyimpan.')}catch(e){aiProgressError(s,'Gagal: '+(e.message||e))}finally{b.disabled=false}};
$('#pbbDriveExtractBtn').onclick=async()=>{let b=$('#pbbDriveExtractBtn'),s=$('#pbbExtractStatus');b.disabled=true;try{let r=await invokeDriveAI($('#pbbAiDriveUrl').value.trim(),'pbb',m=>aiProgress(s,m));applyPbbAI(r.data);$('#pbbForm').elements.namedItem('spptUrl').value=r.webViewLink;aiProgressDone(s,'SPPT Google Drive selesai dibaca. Periksa hasil sebelum menyimpan.')}catch(e){aiProgressError(s,'Gagal: '+(e.message||e))}finally{b.disabled=false}};


// v1.16.0 RC: backup & restore seluruh data aplikasi untuk akun aktif.
const BACKUP_TABLES=['assets','land_titles','buildings','contracts','pbb_records','lease_land_titles','lease_buildings','lease_pbb','lease_facilities','pbb_land_titles','pbb_buildings','document_history','lease_documents'];
const RESTORE_DELETE_ORDER=['lease_documents','document_history','lease_facilities','lease_pbb','lease_buildings','lease_land_titles','pbb_buildings','pbb_land_titles','pbb_records','contracts','buildings','land_titles','assets'];
const RESTORE_INSERT_ORDER=['assets','land_titles','buildings','contracts','pbb_records','lease_land_titles','lease_buildings','lease_pbb','lease_facilities','pbb_land_titles','pbb_buildings','document_history','lease_documents'];
function backupMessage(m,k=''){let e=$('#backupStatus');if(e){e.textContent=m;e.dataset.kind=k}}
async function collectBackup(){
 if(!currentUser)throw new Error('Silakan login terlebih dahulu.');
 const tables={};
 for(let i=0;i<BACKUP_TABLES.length;i++){
  const t=BACKUP_TABLES[i];backupMessage(`Membaca ${t} (${i+1}/${BACKUP_TABLES.length})…`);
  const r=await sb.from(t).select('*');if(r.error)throw new Error(`${t}: ${r.error.message}`);tables[t]=r.data||[];
 }
 let aiScans={};try{for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(k&&k.startsWith('sewa_ai_scans_'))aiScans[k]=localStorage.getItem(k)}}catch(_){}
 return {app:'Sewa & Akta Tanah',version:'1.17.0',format:1,createdAt:new Date().toISOString(),userId:(dataOwnerId||currentUser.id),userEmail:currentUser.email||'',tables,local:{aiScans}};
}
function downloadJson(obj,name){let blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function downloadBackup(){if(currentRole!=='administrator')return alert('Backup hanya tersedia untuk Administrator.');let b=$('#downloadBackupBtn');b.disabled=true;try{backupMessage('Menyiapkan backup…');let x=await collectBackup(),d=new Date(),stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;downloadJson(x,`Sewa_Akta_Tanah_Backup_${stamp}.json`);backupMessage('✓ Backup selesai diunduh. Simpan file ini di tempat aman.','ok')}catch(e){backupMessage('Backup gagal: '+e.message,'error')}finally{b.disabled=false}}
function validateBackup(x){if(!x||x.app!=='Sewa & Akta Tanah'||!x.tables||typeof x.tables!=='object')throw new Error('File bukan backup Sewa & Akta Tanah yang valid.');for(const t of BACKUP_TABLES)if(!Array.isArray(x.tables[t]))throw new Error(`Data ${t} tidak ditemukan di backup.`);return x}
async function restoreBackup(){
 if(currentRole!=='administrator')return alert('Restore hanya tersedia untuk Administrator.');
 let f=$('#restoreFile').files?.[0];if(!f)return alert('Pilih file backup JSON terlebih dahulu.');let b=$('#restoreBackupBtn');b.disabled=true;
 try{backupMessage('Membaca file backup…');let x=validateBackup(JSON.parse(await f.text()));let total=Object.values(x.tables).reduce((n,a)=>n+a.length,0);if(!confirm(`Restore akan MENGGANTI data akun ini dengan backup ${new Date(x.createdAt).toLocaleString('id-ID')} (${total} baris data).\n\nLanjutkan?`))return;
  // Hanya data milik user aktif yang dihapus. RLS Supabase tetap menjadi lapisan pengaman tambahan.
  for(let i=0;i<RESTORE_DELETE_ORDER.length;i++){let t=RESTORE_DELETE_ORDER[i];backupMessage(`Mengosongkan data lama: ${t}…`);let r=await sb.from(t).delete().eq('user_id',(dataOwnerId||currentUser.id));if(r.error)throw new Error(`${t}: ${r.error.message}`)}
  for(let i=0;i<RESTORE_INSERT_ORDER.length;i++){let t=RESTORE_INSERT_ORDER[i],rows=x.tables[t]||[];if(!rows.length)continue;backupMessage(`Memulihkan ${t} (${i+1}/${RESTORE_INSERT_ORDER.length})…`);rows=rows.map(r=>({...r,user_id:(dataOwnerId||currentUser.id)}));let r=await sb.from(t).insert(rows);if(r.error)throw new Error(`${t}: ${r.error.message}`)}
  try{Object.entries(x.local?.aiScans||{}).forEach(([k,v])=>localStorage.setItem(k,v))}catch(_){}
  await loadData();backupMessage('✓ Restore selesai. Data sudah dimuat ulang.','ok');alert('Restore selesai. Periksa dashboard, properti, PBB, dan akta sewa.')
 }catch(e){backupMessage('Restore berhenti: '+e.message,'error');alert('Restore gagal/berhenti: '+e.message+'\n\nJangan hapus file backup. Jika sebagian data sudah berubah, jalankan restore kembali dengan file backup yang sama.')}finally{b.disabled=false}
}
$('#backupBtn').onclick=()=>{if(currentRole!=='administrator')return;backupMessage('');$('#restoreFile').value='';$('#backupDlg').showModal()};$('#backupCloseBtn').onclick=()=>$('#backupDlg').close();$('#downloadBackupBtn').onclick=downloadBackup;$('#restoreBackupBtn').onclick=restoreBackup;


// v1.17.0 — role-based shared workspace user management.
function usersMessage(m,k=''){let e=$('#usersStatus');if(e){e.textContent=m;e.dataset.kind=k}}
async function loadUsers(){
 if(currentRole!=='administrator')return;
 usersMessage('Memuat daftar user…');let r=await sb.rpc('app_list_users');
 if(r.error){usersMessage('Gagal memuat user: '+r.error.message,'error');return}
 let rows=r.data||[];$('#usersList').innerHTML=rows.length?rows.map(u=>`<div class="user-row"><div><strong>${u.email||'-'}</strong><div class="muted">${u.id===dataOwnerId?'Workspace Owner · ':''}${u.role==='administrator'?'Administrator':u.role==='document_manager'?'Document Manager':'Viewer'}</div></div><div>${u.id===dataOwnerId?'<span class="pill">OWNER</span>':`<button type="button" class="secondary" onclick="removeWorkspaceUser('${u.id}')">Nonaktifkan</button>`}</div></div>`).join(''):'<div class="muted">Belum ada user.</div>';usersMessage('')
}
async function openUsers(){if(currentRole!=='administrator')return;$('#userForm').reset();$('#usersDlg').showModal();await loadUsers()}
async function removeWorkspaceUser(id){if(!confirm('Nonaktifkan akses user ini dari workspace?'))return;let r=await sb.rpc('app_remove_user',{target_user_id:id});if(r.error)return alert('Gagal: '+r.error.message);await loadUsers()}
window.removeWorkspaceUser=removeWorkspaceUser;
$('#usersBtn').onclick=openUsers;$('#usersCloseBtn').onclick=()=>$('#usersDlg').close();
$('#userForm').onsubmit=async e=>{e.preventDefault();if(currentRole!=='administrator')return;let email=$('#newUserEmail').value.trim().toLowerCase(),password=$('#newUserPassword').value,role=$('#newUserRole').value,b=e.submitter;b.disabled=true;try{
 usersMessage('Membuat / menghubungkan akun…');
 let lookup=await sb.rpc('app_find_user_by_email',{target_email:email});if(lookup.error)throw lookup.error;
 if(!lookup.data){let temp=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});let s=await temp.auth.signUp({email,password});if(s.error)throw s.error;usersMessage('Akun dibuat. Menetapkan hak akses…')}
 let a=await sb.rpc('app_set_user_role',{target_email:email,target_role:role});if(a.error)throw a.error;usersMessage('✓ User berhasil ditambahkan.','ok');e.target.reset();await loadUsers()
 }catch(x){usersMessage('Gagal: '+x.message,'error')}finally{b.disabled=false}}
function lockViewerDialog(dlg){if(currentRole!=='viewer')return;dlg.querySelectorAll('input,select,textarea').forEach(e=>e.disabled=true);dlg.querySelectorAll('button[type="submit"],.write-only').forEach(e=>e.hidden=true)}
['dlg','assetDlg','pbbEditDlg'].forEach(id=>{let d=$('#'+id);if(d)d.addEventListener('toggle',()=>{if(d.open)lockViewerDialog(d)})});

const mobileMenuBtn=$('#mobileMenuBtn'),utilityMenu=document.querySelector('.utility-menu');
if(mobileMenuBtn&&utilityMenu){mobileMenuBtn.onclick=e=>{e.stopPropagation();let open=utilityMenu.classList.toggle('open');mobileMenuBtn.setAttribute('aria-expanded',String(open))};document.addEventListener('click',e=>{if(!utilityMenu.contains(e.target)){utilityMenu.classList.remove('open');mobileMenuBtn.setAttribute('aria-expanded','false')}});utilityMenu.querySelectorAll('.utility-menu-panel button').forEach(b=>b.addEventListener('click',()=>{utilityMenu.classList.remove('open');mobileMenuBtn.setAttribute('aria-expanded','false')}))}
if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});initAuth();

// v1.16.0 RC: input tanggal cepat DDMMYY
bindAllDateInputs();


$('#leaseHistoryBtn').onclick=()=>{let x=edit>=0?data[edit]:null;if(!x?.id)return alert('Simpan Akta Sewa terlebih dahulu.');openHistory('lease',x.id,`Akta ${x.deedNo||'-'} · ${x.tenant||''}`)};
$('#landHistoryBtn').onclick=()=>{let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return alert('Simpan Properti/Sertifikat terlebih dahulu.');openHistory('land',a.id,a.name||'Sertifikat Tanah')};
$('#historyCompareBtn').onclick=compareHistoryAI;$('#historyCloseBtn').onclick=()=>$('#historyDlg').close();$('#historySearchBtn').onclick=openHistorySearch;$('#historySearchCloseBtn').onclick=()=>$('#historySearchDlg').close();$('#historySearchInput').addEventListener('input',()=>{clearTimeout(window.__hs);window.__hs=setTimeout(runHistorySearch,250)});


// v1.19.2 — Akta Lama / Dokumen Historis (separate from active contract)
let historicalLeaseExtracted=null;
function activeLeaseForHistory(){return edit>=0?data[edit]:null}
function historicalLeasePreviewHtml(x){x=normalizeExtractedLease(x||{});return `<h3>Preview hasil AI</h3><div class="history-item"><b>${x.tenant||'-'} · Akta ${x.deedNo||'-'}</b><div>${x.deedDate||'-'} · ${x.start||'-'} s/d ${x.end||'-'} · ${(x.clauses||[]).length} klausul</div><div class="ai-doc-status ai-read">✓ Sudah dibaca AI · hasil ekstraksi siap disimpan</div></div><p class="muted">Data ini akan disimpan sebagai dokumen historis dan tidak akan menimpa Akta Sewa aktif.</p>`}
async function openHistoricalLease(){let x=activeLeaseForHistory();if(!x?.id)return alert('Simpan Akta Sewa aktif terlebih dahulu sebelum menambahkan dokumen historis.');historicalLeaseExtracted=null;$('#historicalLeaseDlg').querySelectorAll('input').forEach(e=>e.value='');$('#historicalLeaseType').value='akta_lama';$('#historicalLeasePreview').innerHTML='';$('#historicalLeaseStatus').textContent='';$('#historicalLeaseSave').disabled=true;$('#historicalLeaseDlg').showModal();await renderHistoricalLeaseSavedList()}
// v1.19.4 — Historical documents are locked to the same Universal 500 MB reader used by active leases/PBB/land documents.
async function readHistoricalFile(){let f=$('#historicalLeaseFile').files?.[0],st=$('#historicalLeaseStatus'),b=$('#historicalLeaseReadFile');if(!f)return alert('Pilih file Akta lama / Addendum terlebih dahulu.');if(f.size>500*1024*1024)return aiProgressError(st,'File lebih dari 500 MB. Batas maksimum pembacaan AI adalah 500 MB.');b.disabled=true;$('#historicalLeaseSave').disabled=true;historicalLeaseExtracted=null;try{aiProgress(st,`Menyiapkan dokumen historis ${(f.size/1024/1024).toFixed(1)} MB dengan Universal Document Reader…`);historicalLeaseExtracted=await invokeDocumentAI(f,'lease',m=>aiProgress(st,m));$('#historicalLeasePreview').innerHTML=historicalLeasePreviewHtml(historicalLeaseExtracted);$('#historicalLeaseSave').disabled=false;aiProgressDone(st,'Dokumen historis selesai dibaca dengan reader yang sama seperti Akta Sewa/PBB/Akta Tanah. Periksa preview lalu simpan.')}catch(e){aiProgressError(st,'Gagal membaca dokumen historis: '+e.message)}finally{b.disabled=false}}
async function readHistoricalDrive(){let u=$('#historicalLeaseDriveUrl').value.trim(),st=$('#historicalLeaseStatus'),b=$('#historicalLeaseReadDrive');if(!driveFileId(u))return alert('Masukkan link Google Drive yang valid.');b.disabled=true;$('#historicalLeaseSave').disabled=true;historicalLeaseExtracted=null;try{aiProgress(st,'Menyiapkan dokumen historis Google Drive dengan Universal Document Reader hingga 500 MB…');let r=await invokeDriveAI(u,'lease',m=>aiProgress(st,m));historicalLeaseExtracted=r.data;$('#historicalLeasePreview').innerHTML=historicalLeasePreviewHtml(historicalLeaseExtracted);$('#historicalLeaseSave').disabled=false;aiProgressDone(st,'Dokumen historis Google Drive selesai dibaca dengan reader yang sama seperti Akta Sewa/PBB/Akta Tanah. Periksa preview lalu simpan.')}catch(e){aiProgressError(st,'Gagal membaca dokumen historis: '+e.message)}finally{b.disabled=false}}
async function saveHistoricalLease(){
 let active=activeLeaseForHistory();
 if(!active?.id)throw new Error('Akta Sewa aktif tidak ditemukan. Tutup dialog, buka kembali Akta Sewa, lalu coba lagi.');
 if(!historicalLeaseExtracted)throw new Error('Hasil pembacaan AI belum tersedia. Baca dokumen terlebih dahulu.');
 let x=normalizeExtractedLease(historicalLeaseExtracted),owner=historyOwner();
 if(!owner)throw new Error('Workspace/user pemilik data tidak ditemukan. Silakan login ulang.');
 let row={user_id:owner,contract_id:active.id,asset_id:active.assetId||null,document_type:$('#historicalLeaseType').value,label:$('#historicalLeaseLabel').value.trim()||`${$('#historicalLeaseType').selectedOptions[0].text} · Akta ${x.deedNo||'-'}`,document_date:idToISO(x.deedDate)||null,deed_no:x.deedNo||null,drive_url:$('#historicalLeaseDriveUrl').value.trim(),extracted_data:x,ai_status:'sudah_dibaca',ai_read_at:new Date().toISOString()};
 // v1.19.7 — prevent accidental duplicate historical documents before insert.
 let existing=await sb.from('lease_documents').select('id,label,document_type,document_date,deed_no,ai_read_at').eq('contract_id',active.id).eq('document_type',row.document_type);
 if(existing.error)throw new Error(`Gagal memeriksa duplikat: ${existing.error.message}`);
 let duplicate=(existing.data||[]).find(d=>String(d.deed_no||'').trim().toLowerCase()===String(row.deed_no||'').trim().toLowerCase() && String(d.document_date||'')===String(row.document_date||''));
 if(duplicate)throw new Error(`Dokumen yang sama sudah ada di Riwayat Dokumen (${duplicate.label||'tanpa label'}). Hapus record duplikat lama jika memang ingin menggantinya.`);
 let r=await sb.from('lease_documents').insert(row).select('*').single();
 if(r.error)throw new Error(`Database lease_documents: ${r.error.message}${r.error.code?' ['+r.error.code+']':''}. Pastikan SQL terbaru sudah dijalankan.`);
 if(!r.data?.id)throw new Error('Database tidak mengembalikan ID dokumen setelah penyimpanan.');
 // Verify the row really exists before telling the user that saving succeeded.
 let verify=await sb.from('lease_documents').select('id,contract_id,label,ai_status,ai_read_at,extracted_data').eq('id',r.data.id).maybeSingle();
 if(verify.error)throw new Error(`Dokumen dikirim tetapi verifikasi database gagal: ${verify.error.message}`);
 if(!verify.data)throw new Error('Dokumen belum ditemukan kembali setelah penyimpanan. Penyimpanan belum dianggap berhasil.');
 // document_history is secondary. A failure here must not hide a successfully saved historical document.
 try{await saveHistorySnapshot('lease',active.id,active.assetId||null,x,'historical_document',row.label)}catch(e){console.warn('Historical snapshot warning',e)}
 await renderHistoricalLeaseSavedList();
 $('#historicalLeaseStatus').textContent=`✓ Tersimpan: ${row.label}`;
 alert('Dokumen historis sudah tersimpan dan diverifikasi di database. Akta aktif tidak diubah.');
}

// v1.19.5 — show saved historical documents inside the add-history dialog.
function historicalDocRead(d){return d?.ai_status==='sudah_dibaca'||!!(d?.extracted_data&&Object.keys(d.extracted_data).length)}
function historicalDocTitle(d){return d?.label||String(d?.document_type||'Dokumen historis').replaceAll('_',' ')}
function historicalDocDetails(d){let x=normalizeExtractedLease(d?.extracted_data||{}),parts=[];if(d?.document_date)parts.push(isoToID(d.document_date));else if(x.deedDate)parts.push(x.deedDate);if(d?.deed_no||x.deedNo)parts.push('Akta '+(d.deed_no||x.deedNo));if(x.tenant)parts.push(x.tenant);return parts.join(' · ')||'Data dokumen historis tersimpan'}
async function renderHistoricalLeaseSavedList(){let box=$('#historicalLeaseSavedList'),active=activeLeaseForHistory();if(!box||!active?.id)return;box.innerHTML='<div class="muted">Memuat dokumen historis tersimpan…</div>';try{let docs=await leaseDocumentRows(active.id);if(!docs.length){box.innerHTML='<div class="history-empty"><b>Belum ada dokumen historis tersimpan untuk Akta Sewa ini.</b><div>Dokumen yang baru dibaca AI belum masuk daftar sampai tombol “Simpan sebagai Dokumen Historis” ditekan.</div></div>';return}box.innerHTML=docs.map(d=>{let read=historicalDocRead(d),when=d.ai_read_at?new Date(d.ai_read_at).toLocaleString('id-ID'):'',hasData=!!(d.extracted_data&&Object.keys(d.extracted_data).length);return `<div class="history-item historical-saved-row"><div><b>${historicalDocTitle(d)}</b><div>${historicalDocDetails(d)}</div><div class="ai-doc-status ${read?'ai-read':'ai-unread'}">${read?'✓ Sudah dibaca AI':'○ Belum dibaca AI'}${when?' · '+when:''}</div></div><div class="historical-row-actions">${hasData?`<button type="button" class="secondary" data-hist-view="${d.id}">Lihat Hasil AI</button>`:''}<button type="button" class="secondary" data-hist-compare="${d.id}">Bandingkan</button>${currentRole==='administrator'?`<button type="button" class="secondary danger-historical" data-hist-delete="${d.id}">Hapus</button>`:''}</div></div>`}).join('');box.querySelectorAll('[data-hist-view]').forEach(b=>b.onclick=()=>viewSavedHistoricalAI(b.dataset.histView));box.querySelectorAll('[data-hist-compare]').forEach(b=>b.onclick=()=>compareSavedHistoricalWithActive(b.dataset.histCompare));box.querySelectorAll('[data-hist-delete]').forEach(b=>b.onclick=()=>deleteSavedHistoricalDocument(b.dataset.histDelete))}catch(e){box.innerHTML=`<div class="compare-warning">Gagal memuat riwayat dokumen: ${e.message}</div>`}}
async function deleteSavedHistoricalDocument(id){
 if(currentRole!=='administrator')return alert('Hanya Administrator yang dapat menghapus dokumen historis.');
 let active=activeLeaseForHistory(),docs=await leaseDocumentRows(active.id),d=docs.find(x=>String(x.id)===String(id));
 if(!d)return alert('Dokumen historis tidak ditemukan.');
 let when=d.ai_read_at?new Date(d.ai_read_at).toLocaleString('id-ID'):'';
 if(!confirm(`Hapus dokumen historis ini?\n\n${historicalDocTitle(d)}\n${historicalDocDetails(d)}${when?'\nDibaca AI: '+when:''}\n\nHasil AI yang tersimpan untuk record ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`))return;
 let r=await sb.from('lease_documents').delete().eq('id',id).eq('contract_id',active.id).select('id');
 if(r.error)return alert('Gagal menghapus dokumen historis: '+r.error.message);
 if(!r.data?.length)return alert('Dokumen tidak terhapus. Pastikan Anda login sebagai Administrator dan SQL terbaru sudah dijalankan.');
 await renderHistoricalLeaseSavedList();
 alert('Dokumen historis berhasil dihapus.');
}
async function viewSavedHistoricalAI(id){let active=activeLeaseForHistory(),docs=await leaseDocumentRows(active.id),d=docs.find(x=>String(x.id)===String(id));if(!d?.extracted_data)return alert('Hasil AI dokumen ini belum tersimpan.');$('#historicalLeasePreview').innerHTML=`<h3>Hasil AI Tersimpan — ${historicalDocTitle(d)}</h3>${historicalLeasePreviewHtml(d.extracted_data).replace('<h3>Preview hasil AI</h3>','')}<p class="muted">Ini adalah hasil AI yang sudah tersimpan. Tidak ada pembacaan AI ulang.</p>`;$('#historicalLeasePreview').scrollIntoView({behavior:'smooth',block:'nearest'})}
async function compareSavedHistoricalWithActive(id){let active=activeLeaseForHistory(),docs=await leaseDocumentRows(active.id),d=docs.find(x=>String(x.id)===String(id));if(!d?.extracted_data)return alert('Dokumen ini belum mempunyai hasil AI tersimpan. Baca dan simpan dokumen terlebih dahulu.');let box=$('#historicalLeasePreview');aiProgress(box,'AI sedang membandingkan hasil ekstraksi historis dengan Akta Sewa aktif…');try{let out=await invokeExtractLease({documentType:'history_compare',comparisonData:{entityType:'lease',old:d.extracted_data,new:active}});renderHistoryComparison(box,out.data||{});box.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(e){aiProgressError(box,'Perbandingan gagal: '+e.message)}}

async function leaseDocumentRows(contractId){let r=await sb.from('lease_documents').select('*').eq('contract_id',contractId).order('document_date',{ascending:true,nullsFirst:true}).order('created_at',{ascending:true});if(r.error)throw r.error;return r.data||[]}
const __openHistoryV1191=openHistory;
openHistory=async function(entityType,entityId,title){await __openHistoryV1191(entityType,entityId,title);if(entityType!=='lease')return;let docs=await leaseDocumentRows(entityId);if(!docs.length)return;let tl=$('#historyTimeline');let active=data.find(v=>String(v.id)===String(entityId));tl.insertAdjacentHTML('afterbegin',`<div class="history-legal-chain"><h3>Rangkaian Dokumen Hukum</h3><p class="muted">Status AI menunjukkan apakah hasil pembacaan AI sudah tersimpan. Dokumen berstatus sudah dibaca tidak perlu di-scan ulang.</p>${docs.map(d=>{let read=d.ai_status==='sudah_dibaca'||(d.extracted_data&&Object.keys(d.extracted_data).length);let when=d.ai_read_at?new Date(d.ai_read_at).toLocaleString('id-ID'):'';return `<div class="history-item"><b>${d.label||d.document_type} ${d.deed_no?`· Akta ${d.deed_no}`:''}</b><div>${d.document_date?isoToID(d.document_date):'-'} · ${d.document_type.replaceAll('_',' ')}</div><div class="ai-doc-status ${read?'ai-read':'ai-unread'}">${read?'✓ Sudah dibaca AI':'○ Belum dibaca AI'}${when?' · '+when:''}</div></div>`}).join('')}<div class="history-item compare-ok"><b>AKTIF · Akta ${active?.deedNo||'-'}</b><div>${active?.deedDate||'-'} · ${active?.tenant||''}</div><div class="ai-doc-status ai-saved">Data aktif tersimpan · riwayat versi dapat dibandingkan tanpa membaca ulang PDF</div></div></div>`)};
$('#historicalLeaseBtn').onclick=openHistoricalLease;$('#historicalLeaseRefresh').onclick=renderHistoricalLeaseSavedList;$('#historicalLeaseClose').onclick=()=>$('#historicalLeaseDlg').close();$('#historicalLeaseReadFile').onclick=readHistoricalFile;$('#historicalLeaseReadDrive').onclick=readHistoricalDrive;$('#historicalLeaseSave').onclick=async()=>{let b=$('#historicalLeaseSave');b.disabled=true;try{await saveHistoricalLease()}catch(e){alert('Gagal menyimpan dokumen historis: '+e.message)}finally{b.disabled=false}};
