const APP_BUILD="1.19.90-RC";
let data=[],assets=[],edit=-1,assetEdit=-1,currentUser=null,currentRole='viewer',dataOwnerId=null,pbbEdit=-1,pbbData=[],googleDriveToken='',pendingPriorDeeds=[],leaseRescanResult=null,leaseTaxAIResult=null,leaseAIWholeMeta={},pendingLeaseLink=null,pendingPbbHistory=[],leaseRelationAudit={};const $=s=>document.querySelector(s);const fmt=n=>n?new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(n):'-';
function parseMoney(v){if(typeof v==='number')return v;if(!v)return 0;let s=String(v).trim().replace(/\s/g,'').replace(/^Rp/i,'');if(s.includes(',')&&s.includes('.')){s=s.replace(/\./g,'').replace(',','.')}else if(s.includes(',')){s=s.replace(',','.')}else if((s.match(/\./g)||[]).length>1){s=s.replace(/\./g,'')}return Number(s.replace(/[^0-9.-]/g,''))||0}
function moneyDisplay(v){const n=parseMoney(v);return (v!==''&&v!=null&&!Number.isNaN(n))?`Rp ${new Intl.NumberFormat('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}`:''}
function numberID(v){const n=parseMoney(v);return (v!==''&&v!=null&&!Number.isNaN(n))?new Intl.NumberFormat('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n):''}
function isoToID(s){if(!s)return '';const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:s}
function normalizeIDDate(s){if(!s)return '';let v=String(s).trim().replace(/[\/.]/g,'-').replace(/\s+/g,'');if(/^\d{6}$/.test(v))v=`${v.slice(0,2)}-${v.slice(2,4)}-20${v.slice(4,6)}`;else if(/^\d{8}$/.test(v))v=`${v.slice(0,2)}-${v.slice(2,4)}-${v.slice(4,8)}`;let m=v.match(/^(\d{2})-(\d{2})-(\d{4})$/);if(!m)return v;let d=Number(m[1]),mo=Number(m[2]),y=Number(m[3]),dt=new Date(y,mo-1,d);return dt.getFullYear()===y&&dt.getMonth()===mo-1&&dt.getDate()===d?`${m[1]}-${m[2]}-${m[3]}`:v}
function idToISO(s){if(!s)return '';let v=normalizeIDDate(s),m=v.match(/^(\d{2})-(\d{2})-(\d{4})$/);if(m)return `${m[3]}-${m[2]}-${m[1]}`;return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:''}
function bindDateInput(el){if(!el||el.dataset.dateBound)return;el.dataset.dateBound='1';el.type='text';el.inputMode='numeric';if(!el.placeholder)el.placeholder='DDMMYY atau DD-MM-YYYY';el.addEventListener('blur',()=>{if(!el.value)return;let n=normalizeIDDate(el.value);if(idToISO(n))el.value=n;else{el.setCustomValidity('Tanggal tidak valid. Ketik DDMMYY, contoh 280926.');el.reportValidity()}});el.addEventListener('input',()=>el.setCustomValidity(''))}
function bindAllDateInputs(root=document){root.querySelectorAll('input[type=date],input[name=deedDate],input[name=start],input[name=end],input[name=renewalNotice],input[name=dueDate],input[name=paidDate],input.validUntil,input.surveyDate,input.due,input.paidDate,input.ledgerDate').forEach(bindDateInput)}
function moneyRaw(v){const n=parseMoney(v);return n?String(n):''}
function rupiahText(v){const n=parseMoney(v);return n?`Rp${new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(n)}`:String(v??'')}
function normalizeAIText(value){
 if(value===undefined||value===null)return value;
 let s=String(value);
 // Tanggal ISO / slash dari AI -> format Indonesia DD-MM-YYYY.
 s=s.replace(/\b(20\d{2}|19\d{2})[-\/.](0[1-9]|1[0-2])[-\/.](0[1-9]|[12]\d|3[01])\b/g,(_,y,m,d)=>`${d}-${m}-${y}`);
 // Rupiah yang sudah memiliki penanda mata uang.
 s=s.replace(/\bRp\.?\s*([0-9][0-9.,]*)/gi,(_,n)=>rupiahText(n));
 // Angka uang mentah pada kalimat finansial -> Rupiah dengan pemisah ribuan Indonesia.
 // Mendukung variasi seperti "harga sewa keseluruhan sebesar 9405000000", "deposit 250000000", dst.
 const moneyWords='harga\\s+sewa|nilai\\s+sewa|jumlah\\s+sewa|uang\\s+jaminan|security\\s+deposit|deposit|denda|pembayaran|biaya|nilai\\s+kontrak|total\\s+sewa|sewa\\s+keseluruhan';
 s=s.replace(new RegExp(`\\b(${moneyWords})([^\\n.;:]{0,45}?)(?:Rp\\.?\\s*)?([0-9]{5,})(?![0-9])`,'gi'),(all,label,middle,n)=>`${label}${middle}${rupiahText(n)}`);
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
 // v1.19.20 — linked/continuation deed chain
function openContinuationDeed(){let parent=edit>=0?data[edit]:null;if(!parent?.id)return alert('Simpan Akta ini terlebih dahulu.');$('#continuationRelation').value='perpanjangan';$('#continuationDlg').showModal()}
async function createContinuationDeed(){let parent=edit>=0?data[edit]:null;if(!parent?.id)return;let relation=$('#continuationRelation').value;$('#continuationDlg').close();pendingLeaseLink={parentContractId:parent.id,leaseRelationType:relation};await openEdit(-1);pendingLeaseLink={parentContractId:parent.id,leaseRelationType:relation};setField('tenant',parent.tenant||'');setField('lessor',parent.lessor||'');$('#contractAssetSelect').value=parent.assetId||'';if(parent.assetId)applySelectedAsset();setField('docUrl','');if($('#driveUrl'))$('#driveUrl').value='';syncLeaseDriveSourceHint({});let s=$('#leaseDetailSummary');if(s)s.textContent=`Akta Lanjutan (${relation.replaceAll('_',' ')}) dari Akta ${parent.deedNo||'-'} · ${parent.tenant||''}. Scan Akta baru; Akta lama tidak akan ditimpa.`}
window.openContinuationDeed=openContinuationDeed;window.createContinuationDeed=createContinuationDeed;
// v1.19.17: normalisasi hasil analisis PPh Final sewa tanah/bangunan.
 if(x.rentTaxMode)x.rentTaxMode=['gross_includes_tax','net_excludes_tax','no_withholding'].includes(x.rentTaxMode)?x.rentTaxMode:'gross_includes_tax';
 if(x.rentTaxRate!==undefined&&x.rentTaxRate!==null&&x.rentTaxRate!=='')x.rentTaxRate=Number(x.rentTaxRate)||0;
 ['rentTaxAmount','rentGross','rentNet'].forEach(k=>{if(x[k]!==undefined&&x[k]!==null&&x[k]!=='')x[k]=parseMoney(x[k])});
 return x;
}
function bindMoneyInput(el,onchange){if(!el||el.dataset.moneyBound)return;el.dataset.moneyBound='1';el.addEventListener('focus',()=>{el.value=moneyRaw(el.value);setTimeout(()=>el.select(),0)});el.addEventListener('blur',()=>{el.value=moneyDisplay(el.value);if(onchange)onchange()});el.addEventListener('input',()=>{if(onchange)onchange()});}
const date=s=>{if(!s)return null;const v=idToISO(s)||s;return new Date(v+'T00:00:00')};const days=s=>s?Math.ceil((date(s)-new Date())/86400000):999999;const cfg=window.SEWA_CONFIG||{};const configured=cfg.supabaseUrl&&!cfg.supabaseUrl.includes('PASTE_')&&cfg.supabaseKey&&!cfg.supabaseKey.includes('PASTE_');const sb=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;

function aiUsageKey(){let d=new Date();return `sewa_ai_scans_${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}`}
function recordAIScan(){try{localStorage.setItem(aiUsageKey(),String((Number(localStorage.getItem(aiUsageKey()))||0)+1));renderOpenAIStatus()}catch(_){}}
function renderOpenAIStatus(){let el=$('#openaiStatus');if(!el)return;let n=0;try{n=Number(localStorage.getItem(aiUsageKey()))||0}catch(_){}el.innerHTML=`<div class=stat><b>${n}</b><span>Scan AI bulan ini <small>(browser ini)</small></span></div><div class=stat><b>OpenAI</b><span>Saldo kredit resmi <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noopener noreferrer">Buka Billing ↗</a></span></div>`}

function status(m,k=''){const e=$('#authMsg');if(e){e.textContent=m;e.dataset.kind=k}}function withTimeout(p,ms,l){return Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error(l||'Timeout')),ms))])}
function rowToApp(r){let out={id:r.id,assetId:r.asset_id||'',tenant:r.tenant||'',lessor:r.lessor||'',asset:r.asset||'',propertyAddress:r.property_address||'',propertyArea:r.property_area||'',leaseLandArea:r.lease_land_area??'',leaseBuildingArea:r.lease_building_area??'',deedNo:r.deed_no||'',deedDate:isoToID(r.deed_date),start:isoToID(r.start_date),end:isoToID(r.end_date),rent:Number(r.rent||0),rentTaxMode:(r.payments_meta?.rentTaxMode||'gross_includes_tax'),rentTaxRate:Number(r.payments_meta?.rentTaxRate||0),rentTaxAmount:Number(r.payments_meta?.rentTaxAmount||0),rentGross:Number(r.payments_meta?.rentGross||0),rentNet:Number(r.payments_meta?.rentNet||0),taxClause:r.payments_meta?.taxClause||'',taxTreatment:r.payments_meta?.taxTreatment||'',taxNeedsVerification:!!r.payments_meta?.taxNeedsVerification,supplementalAgreements:Array.isArray(r.payments_meta?.supplementalAgreements)?r.payments_meta.supplementalAgreements:[],totalContractRent:Number(r.payments_meta?.totalContractRent||0),rentPeriods:Array.isArray(r.payments_meta?.rentPeriods)?r.payments_meta.rentPeriods:[],priorDeeds:Array.isArray(r.payments_meta?.priorDeeds)?r.payments_meta.priorDeeds:[],lastAIVerification:r.payments_meta?.lastAIVerification||null,parentContractId:r.payments_meta?.parentContractId||'',leaseRelationType:r.payments_meta?.leaseRelationType||'',deposit:Number(r.deposit||0),renewalNotice:isoToID(r.renewal_notice),renewalTerm:r.renewal_term||'',googleMapsUrl:r.google_maps_url||'',leasePlanUrl:r.lease_plan_url||'',leasePlanNotes:r.lease_plan_notes||'',docUrl:r.doc_url||'',notes:r.notes||'',payments:r.payments||[],contacts:r.contacts||[],bankAccounts:r.bank_accounts||[],landRights:r.land_rights||[],clauses:r.clauses||[],verificationStatus:r.verification_status||'perlu_verifikasi',sourcePages:r.source_pages||''};return normalizeAIObject(out)}
function appToRow(x){let a=assets.find(v=>v.id===x.assetId);return{user_id:(dataOwnerId||currentUser.id),asset_id:x.assetId||null,tenant:x.tenant||'',lessor:x.lessor||'',asset:a?.name||x.asset||'',property_address:a?.address||x.propertyAddress||'',property_area:x.propertyArea||'',lease_land_area:x.leaseLandArea?Number(x.leaseLandArea):null,lease_building_area:x.leaseBuildingArea?Number(x.leaseBuildingArea):null,deed_no:x.deedNo||null,deed_date:idToISO(x.deedDate)||null,start_date:idToISO(x.start)||null,end_date:idToISO(x.end)||null,rent:parseMoney(x.rent),payments_meta:{rentTaxMode:x.rentTaxMode||'gross_includes_tax',rentTaxRate:Number(x.rentTaxRate||0),rentTaxAmount:Number(x.rentTaxAmount||0),rentGross:Number(x.rentGross||0),rentNet:Number(x.rentNet||0),taxClause:x.taxClause||'',taxTreatment:x.taxTreatment||'',taxNeedsVerification:!!x.taxNeedsVerification,supplementalAgreements:Array.isArray(x.supplementalAgreements)?x.supplementalAgreements:[],totalContractRent:Number(x.totalContractRent||leaseAIWholeMeta.totalContractRent||0),rentPeriods:Array.isArray(x.rentPeriods)?x.rentPeriods:(leaseAIWholeMeta.rentPeriods||[]),priorDeeds:Array.isArray(x.priorDeeds)?x.priorDeeds:(pendingPriorDeeds||[]),lastAIVerification:x.lastAIVerification||leaseAIWholeMeta.lastAIVerification||null,parentContractId:x.parentContractId||pendingLeaseLink?.parentContractId||'',leaseRelationType:x.leaseRelationType||pendingLeaseLink?.leaseRelationType||''},deposit:parseMoney(x.deposit),renewal_notice:idToISO(x.renewalNotice)||null,renewal_term:x.renewalTerm||'',google_maps_url:a?.googleMapsUrl||x.googleMapsUrl||'',lease_plan_url:x.leasePlanUrl||'',lease_plan_notes:x.leasePlanNotes||'',doc_url:x.docUrl||'',notes:x.notes||'',payments:x.payments||[],contacts:x.contacts||[],bank_accounts:x.bankAccounts||[],clauses:x.clauses||[],verification_status:x.verificationStatus||'perlu_verifikasi',source_pages:x.sourcePages||'',updated_at:new Date().toISOString()}}
async function loadAssets(){
  const [{data:a,error},{data:titles,error:titleError}]=await Promise.all([sb.from('assets').select('*').order('name'),sb.from('land_titles').select('id,asset_id,right_type,certificate_no,valid_until')]);
  if(error)throw error;if(titleError)throw titleError;
  const byAsset={};(titles||[]).forEach(t=>{(byAsset[t.asset_id]??=[]).push({id:t.id,type:t.right_type||'Hak Tanah',number:t.certificate_no||'',end:t.valid_until||''})});
  assets=(a||[]).map(v=>({id:v.id,alias:v.alias||'',name:v.name||'',address:v.address||'',area:v.area||'',googleMapsUrl:v.google_maps_url||'',notes:normalizeAIText(v.notes||''),landRights:normalizeAIObject(byAsset[v.id]||[])}));refreshAssetSelect()
}
async function loadLeaseRelationAudit(){
  leaseRelationAudit={};
  const [linksRes,titlesRes]=await Promise.all([
    sb.from('lease_land_titles').select('contract_id,land_title_id'),
    sb.from('land_titles').select('id,asset_id,right_type,certificate_no')
  ]);
  if(linksRes.error)throw linksRes.error;if(titlesRes.error)throw titlesRes.error;
  const titleById=new Map((titlesRes.data||[]).map(t=>[String(t.id),t]));
  const contractById=new Map(data.map(c=>[String(c.id),c]));
  for(const link of (linksRes.data||[])){
    const cid=String(link.contract_id||''), contract=contractById.get(cid); if(!contract)continue;
    const a=leaseRelationAudit[cid]||(leaseRelationAudit[cid]={valid:0,mismatch:0,missing:0,total:0,issues:[]}); a.total++;
    const title=titleById.get(String(link.land_title_id||''));
    if(!title){a.missing++;a.issues.push('Relasi menunjuk sertifikat yang sudah tidak ada');continue}
    if(String(title.asset_id||'')===String(contract.assetId||''))a.valid++;
    else{a.mismatch++;a.issues.push(`${title.right_type||'Hak Tanah'} ${title.certificate_no||'(tanpa nomor)'} terkait ke properti lain`)}
  }
}
async function loadData(){try{await loadAssets();await loadPbbData();const {data:r,error}=await withTimeout(sb.from('contracts').select('*').order('created_at',{ascending:false}),12000,'Database tidak merespons.');if(error)throw error;data=(r||[]).map(rowToApp);await loadLeaseRelationAudit();render()}catch(e){data=[];leaseRelationAudit={};render();alert('Data gagal dibaca: '+e.message)}}
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
function paymentTransactions(p={}){let tx=Array.isArray(p.transactions)?p.transactions:[];if(!tx.length&&p.status==='paid'&&Number(p.amount||0)>0)tx=[{date:p.paidDate||'',amount:Number(p.amount||0),method:'',reference:'',notes:'Migrasi status pembayaran lama'}];return tx.map(t=>({...t,amount:parseMoney(t.amount)}))}
function paymentPaid(p={}){return paymentTransactions(p).reduce((n,t)=>n+parseMoney(t.amount),0)}
function contractPaymentTarget(x={},p={}){let stated=parseMoney(p.amount),rate=Math.max(0,Math.min(100,Number(x.rentTaxRate||0))),mode=x.rentTaxMode||'gross_includes_tax';if(mode==='gross_includes_tax')return Math.max(0,stated-Math.round(stated*rate/100));return stated}
function contractPaymentPaid(p={}){return paymentTransactions(p).filter(t=>!t.unallocated).reduce((n,t)=>n+parseMoney(t.amount),0)}
function contractPaymentRemaining(x={},p={}){return Math.max(0,contractPaymentTarget(x,p)-contractPaymentPaid(p))}
function paymentRemaining(p={}){return Math.max(0,parseMoney(p.amount)-paymentPaid(p))}
function paymentStatus(p={}){let target=parseMoney(p.amount),paid=paymentPaid(p);if(target>0&&paid>=target)return paid>target?'lebih_bayar':'lunas';if(paid>0)return 'kurang_bayar';return 'belum_bayar'}
function render(){if(!currentUser)return;renderOpenAIStatus();let q=$('#search').value.toLowerCase(),now=new Date();let overdue=0,unpaid90=0,contract180=0,hgb1095=0;let a=[];
function pushAlert(day,text,type='normal',tag=''){a.push([day,text,type,tag])}
data.forEach(x=>{
  (x.payments||[]).forEach(p=>{if(!p.due)return;let target=contractPaymentTarget(x,p),rem=contractPaymentRemaining(x,p),paid=contractPaymentPaid(p);if(rem<=0)return;let d=days(p.due),detail=paid>0?`Kurang bayar Rp${fmt(rem)} dari netto Rp${fmt(target)} (diterima Rp${fmt(paid)})`:`Belum dibayar netto Rp${fmt(target)}`;if(d<0){overdue++;pushAlert(d,`${detail} · ${x.tenant} — jatuh tempo ${isoToID(p.due)}`,'overdue','PEMBAYARAN')}else if(d<=90){unpaid90++;pushAlert(d,`${detail} · ${x.tenant} — jatuh tempo ${isoToID(p.due)}`,d<=30?'urgent':'due','PEMBAYARAN')}});
  let endDays=days(x.end);if(x.end){if(endDays<0)pushAlert(endDays,`Kontrak ${x.tenant} telah berakhir pada ${x.end}`,'overdue','KONTRAK');else if(endDays<=180){contract180++;pushAlert(endDays,`Kontrak ${x.tenant} berakhir ${x.end}. Siapkan perpanjangan / kontrak baru.`,endDays<=60?'urgent':'normal','KONTRAK')}}
  let d=days(x.renewalNotice);if(x.renewalNotice){if(d<0&&endDays>=0)pushAlert(d,`Deadline pemberitahuan perpanjangan ${x.tenant} sudah lewat — ${x.renewalNotice}`,'overdue','PERPANJANGAN');else if(d>=0&&d<=365)pushAlert(d,`Deadline pemberitahuan perpanjangan ${x.tenant} — ${x.renewalNotice}`,d<=60?'urgent':'normal','PERPANJANGAN')}
});
assets.forEach(as=>{(as.landRights||[]).forEach(l=>{if(!l.end)return;let d=days(l.end),label=`${l.type||'HGB'} ${l.number||as.name}`;if(d<0)pushAlert(d,`${label} telah berakhir pada ${isoToID(l.end)}`,'overdue','HAK TANAH');else if(d<=1095){hgb1095++;let level=d<=365?'urgent':d<=730?'due':'hgb';let action=d<=365?'Mendesak — segera tindak lanjuti perpanjangan.':d<=730?'Perlu tindak lanjut perpanjangan.':'Mulai persiapan perpanjangan dan dokumen pendukung.';pushAlert(d,`${label} berakhir ${isoToID(l.end)}. ${action}`,level,'HAK TANAH')}})});
currentPbbRows().forEach(p=>{if(p.payment_status==='lunas'||p.warning_ignored)return;let d=days(p.due_date);let amount=p.pbb_payable??p.pbb_due??0;let text=`PBB ${p.tax_year||''} · NOP ${p.nop||'-'} · ${pbbMoney(amount)} · jatuh tempo ${isoToID(p.due_date)||'-'}`;if(d<0)pushAlert(d,text,'overdue','PBB');else if(d<=90)pushAlert(d,text,d<=30?'urgent':'due','PBB')});
$('#stats').innerHTML=`<div class=stat><b>${assets.length}</b><span>Properti / lokasi</span></div><div class=stat><b>${data.length}</b><span>Akta sewa</span></div><div class=stat><b>${overdue}</b><span>Pembayaran terlambat</span></div><div class=stat><b>${contract180}</b><span>Kontrak ≤ 6 bulan</span></div><div class=stat><b>${hgb1095}</b><span>Hak tanah ≤ 3 tahun</span></div>`;
a.sort((x,y)=>x[0]-y[0]);$('#alerts').innerHTML=a.length?a.map(x=>{let when=x[0]<0?`TERLAMBAT ${Math.abs(x[0])} HARI`:x[0]===0?'HARI INI':`${x[0]} HARI LAGI`;return `<div class="warning ${x[2]}"><div class=warning-head><span class=warning-tag>${x[3]}</span><b>${when}</b></div><div>${x[1]}</div></div>`}).join(''):'<div class=muted>Belum ada agenda yang masuk periode peringatan.</div>';
let leaseShown=data.map((x,i)=>[x,i]).filter(([x])=>JSON.stringify(x).toLowerCase().includes(q));let leaseCount=$('#leaseSearchCount');if(leaseCount)leaseCount.textContent=`${leaseShown.length} dari ${data.length} Akta`;$('#cards').innerHTML=leaseShown.map(([x,i])=>{const paid=(x.payments||[]).filter(p=>contractPaymentRemaining(x,p)<=0&&contractPaymentTarget(x,p)>0).length,total=(x.payments||[]).length;return `<article class=card><div><h3>${x.tenant}</h3><div>${x.asset}</div><div class=muted>${x.lessor?'Pemilik: '+x.lessor+' · ':''}Akta ${x.deedNo||'-'} · ${x.start||'-'} s/d ${x.end||'-'}</div><div class=detail-lines><span>Nilai sewa: Rp${fmt(x.rent)}</span><span>${total?paid+'/'+total+' termin dibayar · ':''}${x.contacts?.length||0} kontak · ${(leaseRelationAudit[String(x.id)]?.valid||0)} hak tanah${((leaseRelationAudit[String(x.id)]?.mismatch||0)+(leaseRelationAudit[String(x.id)]?.missing||0))?` · ⚠ ${(leaseRelationAudit[String(x.id)]?.mismatch||0)+(leaseRelationAudit[String(x.id)]?.missing||0)} relasi perlu diperiksa`:''}</span></div></div><div><span class="pill ${x.verificationStatus==='sudah_diverifikasi'?'':'warn'}">${x.verificationStatus==='sudah_diverifikasi'?'DIVERIFIKASI':'PERLU VERIFIKASI'}</span></div><div class="asset-master-actions lease-card-actions"><button type="button" class="lease-open-approved v11978-edit" aria-label="${currentRole==='viewer'?'Buka Akta Sewa':'Buka / Edit Akta Sewa'}" onclick="openEdit(${i})"><span aria-hidden="true">✎</span></button>${currentRole==='administrator'?`<button type="button" class="secondary danger-action lease-delete-approved v11978-delete" aria-label="Hapus Akta Sewa" onclick="deleteLeaseContract('${x.id}')"><span aria-hidden="true">🗑️</span></button>`:''}</div></article>`}).join('')}

function addRepeat(id,vals,kind){if(kind==='clause')vals=normalizeAIObject(vals||{});let html='';if(kind==='contact')html=`<select class=role><option>Pihak Pertama</option><option>Pihak Kedua</option><option>Notaris</option><option>Lainnya</option></select><input class=name placeholder="Nama / PIC" value="${vals.name||''}"><input class=phone placeholder="Telepon" value="${vals.phone||''}"><input class=email placeholder="Email" value="${vals.email||''}">`;if(kind==='bank')html=`<input class=purpose placeholder="Tujuan rekening" value="${vals.purpose||''}"><input class=bank placeholder="Bank" value="${vals.bank||''}"><input class=account placeholder="No. rekening" value="${vals.account||''}"><input class=holder placeholder="Nama pemilik" value="${vals.holder||''}">`;if(kind==='land')html=`<select class=type><option>HGB</option><option>HM</option><option>SHM</option><option>Hak Pakai</option><option>Lainnya</option></select><input class=number placeholder="Nomor" value="${vals.number||''}"><input class=area placeholder="Luas" value="${vals.area||''}"><input type=text inputmode=numeric placeholder="DDMMYY" class=end value="${vals.end||''}"><input class=docUrl type=url placeholder="Google Drive sertifikat/akta" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='landdoc')html=`<select class=type><option>Akta Tanah</option><option>AJB</option><option>Surat Ukur</option><option>KRK / KKPR</option><option>PBG / IMB</option><option>Site Plan</option><option>Perpanjangan HGB</option><option>Lainnya</option></select><input class=number placeholder="Nomor dokumen" value="${vals.number||''}"><input type=text inputmode=numeric placeholder="DDMMYY" class=date value="${vals.date||''}"><input class=description placeholder="Keterangan" value="${vals.description||''}"><input class=docUrl type=url placeholder="Link Google Drive" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='pbb')html=`<input class=nop placeholder="NOP" value="${vals.nop||''}"><input class=year type=number placeholder="Tahun" value="${vals.year||''}"><input class=njop placeholder="NJOP / nilai objek" value="${vals.njop||''}"><input class=amount placeholder="PBB terutang" value="${vals.amount||''}"><input type=text inputmode=numeric class=due placeholder="DDMMYY" value="${vals.due||''}"><select class=status><option>Belum dibayar</option><option>Sudah dibayar</option><option>Lainnya</option></select><input class=docUrl type=url placeholder="SPPT / bukti bayar Google Drive" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='facility')html=`<select class=type><option>PLN</option><option>Telkom / IndiHome</option><option>PDAM</option><option>Internet</option><option>Keamanan</option><option>IPL</option><option>Telepon</option><option>Lainnya</option></select><input class=provider placeholder="Provider" value="${vals.provider||''}"><input class=customerId placeholder="ID pelanggan / kontrak" value="${vals.customerId||''}"><input class=meterNo placeholder="No. meter / layanan" value="${vals.meterNo||''}"><input class=phone placeholder="No. telp" value="${vals.phone||''}"><input class=registeredName placeholder="Nama terdaftar" value="${vals.registeredName||''}"><input class=plan placeholder="Daya / paket / tarif" value="${vals.plan||''}"><input class=contact placeholder="Kontak layanan" value="${vals.contact||''}"><input class=notes placeholder="Catatan" value="${vals.notes||''}"><input class=docUrl type=url placeholder="Dokumen/tagihan Google Drive" value="${vals.docUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'docUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button>`;if(kind==='facility')html=`<select class=facilityType><option>PLN</option><option>Telkom / IndiHome</option><option>PDAM</option><option>Internet</option><option>Telepon</option><option>Keamanan</option><option>IPL</option><option>Lainnya</option></select><input class=provider placeholder="Provider" value="${vals.provider||''}"><input class=customerId placeholder="ID pelanggan / no. kontrak" value="${vals.customerId||''}"><input class=meterNo placeholder="No. meter / layanan" value="${vals.meterNo||''}"><input class=phone placeholder="No. telepon" value="${vals.phone||''}"><input class=registeredName placeholder="Nama terdaftar" value="${vals.registeredName||''}"><input class=planPower placeholder="Daya / tarif / paket" value="${vals.planPower||''}"><input class=driveUrl type=url placeholder="Google Drive" value="${vals.driveUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Drive</button><input class=mapsUrl type=url placeholder="Google Maps (opsional)" value="${vals.mapsUrl||''}"><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Maps</button><input class=notes placeholder="Catatan" value="${vals.notes||''}">`;if(kind==='landtitle')html=`<div class="land-group-title">Data Sertifikat</div><label>Jenis Hak<select class=rightType><option>HGB</option><option>SHGB</option><option>SHM</option><option>HM</option><option>Hak Pakai</option><option>Lainnya</option></select></label><label>Nomor Sertifikat<input class=certificateNo placeholder="Contoh: 00020/Jatibarang" value="${vals.certificateNo||''}"></label><label>Luas Tanah menurut Sertifikat (m²)<input class=landArea type=number step=0.01 placeholder="Contoh: 10499" value="${vals.landArea||''}"></label><label>Berlaku Sampai / Berakhir (jika ada)<input type=text inputmode=numeric placeholder="DD-MM-YYYY" class=validUntil value="${isoToID(vals.validUntil)||''}"></label><label class="land-wide">Alamat / Lokasi Bidang<textarea class=address rows="3" placeholder="Alamat atau keterangan lokasi sesuai sertifikat">${vals.address||''}</textarea></label><label>Nama Pemegang Hak<textarea class=holderName rows="2" placeholder="Nama sesuai sertifikat">${vals.holderName||''}</textarea></label><div class="land-group-title">Surat Ukur</div><label>Nomor Surat Ukur<input class=surveyNo placeholder="Nomor surat ukur" value="${vals.surveyNo||''}"></label><label>Tanggal Surat Ukur<input type=text inputmode=numeric placeholder="DD-MM-YYYY" class=surveyDate value="${isoToID(vals.surveyDate)||''}"></label><label class="land-wide">NIB / Catatan Sertifikat<input class=notes placeholder="NIB dan informasi penting lain dari sertifikat" value="${vals.notes||''}"></label><div class="land-group-title">Dokumen & Lokasi</div><label class="land-link">Link Google Drive Sertifikat<input class=driveUrl type=url placeholder="https://drive.google.com/..." value="${vals.driveUrl||''}"></label><button type="button" class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Buka Sertifikat</button><label class="land-link">Link Google Drive Denah / Surat Ukur<input class=mapPlanUrl type=url placeholder="https://drive.google.com/..." value="${vals.mapPlanUrl||''}"></label><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapPlanUrl')">🗺️ Buka Denah</button><label class="land-link">Google Maps (opsional)<input class=mapsUrl type=url placeholder="https://maps.app.goo.gl/..." value="${vals.mapsUrl||''}"></label><button type="button" class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Buka Maps</button><div class="land-group-title">Baca Otomatis dengan AI</div><div class="land-ai-controls"><label class="land-file">File Sertifikat (PDF / Foto)<input class=landAiFile type=file accept="application/pdf,image/jpeg,image/png,image/webp"></label><button type="button" class="land-ai-btn" onclick="extractLandTitleRow(this)">✨ Baca</button><button type="button" class="secondary drive-connect-btn land-drive-connect-btn" onclick="connectDriveFromButton(this)" aria-label="Hubungkan Google Drive">🔗</button><button type="button" class="secondary land-drive-ai-btn" onclick="extractLandTitleDriveRow(this)">✨ Baca dari Google Drive</button></div><div class="land-ai-status muted drive-local-status" aria-live="polite"></div>`;if(kind==='building')html=`<div class=building-head><div><b class=building-read-title>${vals.name||'Bangunan baru'}</b><small class=building-read-meta>${vals.buildingType||'Gudang'}${vals.buildingArea?' · '+numberID(vals.buildingArea)+' m²':''}</small></div><button type=button class="secondary building-edit-toggle" onclick="toggleBuildingEdit(this)">Edit</button></div><div class=building-read-view><div class=building-read-address>${vals.address||'Alamat/keterangan belum diisi'}</div></div><div class=building-edit-view><label>Nama bangunan / gudang<input class=name value="${vals.name||''}"></label><label>Jenis bangunan<select class=buildingType><option>Gudang</option><option>Gedung</option><option>Kantor</option><option>Pabrik</option><option>Ruko</option><option>Lainnya</option></select></label><label>Luas bangunan (m²)<input class=buildingArea type=number step=0.01 value="${vals.buildingArea||''}"></label><label class=building-wide>Alamat / keterangan<input class=address value="${vals.address||''}"></label><label>Dokumen Google Drive<input class=driveUrl type=url value="${vals.driveUrl||''}"></label><button type=button class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Buka</button><label>Denah Google Drive<input class=floorPlanUrl type=url value="${vals.floorPlanUrl||''}"></label><button type=button class="secondary mini-open" onclick="openRowLink(this,'floorPlanUrl')">🗺️ Buka</button><label>Google Maps<input class=mapsUrl type=url value="${vals.mapsUrl||''}"></label><button type=button class="secondary mini-open" onclick="openRowLink(this,'mapsUrl')">📍 Buka</button><label class=building-wide>Catatan<input class=notes value="${vals.notes||''}"></label><div class=building-ai-title>Baca Otomatis dengan AI</div><label class=building-file>File Dokumen Bangunan (PDF / Foto)<input class=buildingAiFile type=file accept="application/pdf,image/jpeg,image/png,image/webp"></label><button type=button onclick="extractBuildingRow(this)">✨ Baca File Bangunan</button><button type=button class=secondary onclick="extractBuildingDriveRow(this)">✨ Baca dari Google Drive</button><button type=button class="secondary drive-connect-btn">🔗 Hubungkan Google Drive</button><div class="building-ai-status muted"></div></div>`;if(kind==='permit')html=`<div class=permit-head><b>📋 <span class=permit-read-title>${vals.documentType||'Izin / Dokumen Legal'}</span></b><span class=permit-status>${vals.status||'Aktif / tidak ditentukan'}</span></div><div class=permit-grid><label>Kelompok<select class=category><option>Bangunan</option><option>Tanah & Peralihan</option><option>Tata Ruang</option><option>Lingkungan</option><option>Air Tanah / Utilitas</option><option>Sewa</option><option>Izin Usaha / Operasional</option><option>Lainnya</option></select></label><label>Jenis izin / dokumen<input class=documentType list=permitTypes placeholder="PBG, SLF, IMB, KKPR, UKL-UPL, AJB…" value="${vals.documentType||''}"></label><label>Nomor<input class=documentNo value="${vals.documentNo||''}"></label><label>Instansi penerbit<input class=issuer value="${vals.issuer||''}"></label><label>Pemegang izin / dokumen<input class=holder value="${vals.holder||''}"></label><label>Tanggal terbit<input class=issueDate inputmode=numeric placeholder=DD-MM-YYYY value="${isoToID(vals.issueDate)||vals.issueDate||''}"></label><label>Berlaku mulai<input class=validFrom inputmode=numeric placeholder=DD-MM-YYYY value="${isoToID(vals.validFrom)||vals.validFrom||''}"></label><label>Berlaku sampai / kedaluwarsa<input class=validUntil inputmode=numeric placeholder="Kosong jika tidak ada" value="${isoToID(vals.validUntil)||vals.validUntil||''}"></label><label>Status<select class=status><option>Aktif</option><option>Akan Berakhir</option><option>Kedaluwarsa</option><option>Dalam Proses</option><option>Tidak Ditentukan</option></select></label><label>Relasi objek<input class=relatedObject placeholder="Bangunan / bidang tanah terkait" value="${vals.relatedObject||''}"></label><label class=permit-wide>Google Drive<input class=driveUrl type=url value="${vals.driveUrl||''}"></label><button type=button class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Buka</button><label class=permit-wide>Catatan / kewajiban penting<textarea class=notes rows=2>${vals.notes||''}</textarea></label><div class=permit-ai-toolbar><input class=permitAiFile type=file accept="application/pdf,image/jpeg,image/png,image/webp"><button type=button onclick="extractPermitRow(this)">✨ Baca File</button><button type=button class=secondary onclick="extractPermitDriveRow(this)">☁️ Baca Drive</button></div><div class="permit-ai-status muted"></div></div>`;if(kind==='agent')html=`<div class=agent-head><b>🤝 <span>${vals.agencyName||'Perjanjian Agen'}</span></b></div><div class=agent-grid><label>Perusahaan agen<input class=agencyName value="${vals.agencyName||''}"></label><label>Broker / PIC<input class=brokerName value="${vals.brokerName||''}"></label><label>No. izin usaha<input class=businessLicenseNo value="${vals.businessLicenseNo||''}"></label><label>Sertifikat kompetensi<input class=competencyNo value="${vals.competencyNo||''}"></label><label>No. perjanjian<input class=agreementNo value="${vals.agreementNo||''}"></label><label>Tanggal perjanjian<input class=agreementDate inputmode=numeric placeholder=DD-MM-YYYY value="${isoToID(vals.agreementDate)||vals.agreementDate||''}"></label><label>Mulai<input class=startDate inputmode=numeric placeholder=DD-MM-YYYY value="${isoToID(vals.startDate)||vals.startDate||''}"></label><label>Berakhir<input class=endDate inputmode=numeric placeholder="Kosong jika tidak ada" value="${isoToID(vals.endDate)||vals.endDate||''}"></label><label>Jenis transaksi<select class=transactionType><option>Sewa Tanah</option><option>Sewa Bangunan</option><option>Sewa Tanah & Bangunan</option><option>Jual Tanah</option><option>Jual Properti</option><option>Lainnya</option></select></label><label>Eksklusivitas<select class=exclusivity><option>Tidak ditentukan</option><option>Eksklusif</option><option>Non-eksklusif</option></select></label><label>Harga penawaran / nilai transaksi<input class=transactionValue inputmode=decimal value="${vals.transactionValue||''}"></label><label>Komisi (%)<input class=commissionPct type=number step=.01 value="${vals.commissionPct||''}"></label><label>Komisi nominal<input class=commissionAmount inputmode=decimal value="${vals.commissionAmount||''}"></label><label>Pembayar komisi<input class=commissionPayer value="${vals.commissionPayer||''}"></label><label>Status komisi<select class=commissionStatus><option>Belum Dibayar</option><option>Sudah Dibayar</option><option>Sebagian</option><option>Belum Terutang</option></select></label><label>Tanggal bayar<input class=commissionPaidDate inputmode=numeric placeholder=DD-MM-YYYY value="${isoToID(vals.commissionPaidDate)||vals.commissionPaidDate||''}"></label><label class=agent-wide>Aturan pembayaran / pajak / potongan<input class=paymentTerms value="${vals.paymentTerms||''}"></label><label class=agent-wide>Tail period / hak & kewajiban / pembatalan / sengketa<textarea class=importantClauses rows=3>${vals.importantClauses||''}</textarea></label><label class=agent-wide>Google Drive<input class=driveUrl type=url value="${vals.driveUrl||''}"></label><button type=button class="secondary mini-open" onclick="openRowLink(this,'driveUrl')">📄 Buka</button><label class=agent-wide>Bukti pembayaran<input class=paymentProofUrl type=url value="${vals.paymentProofUrl||''}"></label><button type=button class="secondary mini-open" onclick="openRowLink(this,'paymentProofUrl')">🧾 Buka</button><div class=agent-ai-toolbar><input class=agentAiFile type=file accept="application/pdf,image/jpeg,image/png,image/webp"><button type=button onclick="extractAgentRow(this)">✨ Baca File</button><button type=button class=secondary onclick="extractAgentDriveRow(this)">☁️ Baca Drive</button></div><div class="agent-ai-status muted"></div></div>`;if(kind==='clause')html=`<label class=clause-title-label>Judul Klausul<input class=title placeholder="Contoh: Perpanjangan" value="${vals.title||''}"></label><label class=clause-importance-label>Prioritas<select class=importance><option>Penting</option><option>Normal</option></select></label><label class=clause-detail-label>Ringkasan Klausul<textarea class=detail rows=3 placeholder="Ringkasan isi klausul penting...">${vals.detail||''}</textarea></label><label class=clause-page-label>Halaman / Pasal Sumber<input class=page placeholder="Contoh: Pasal 6, halaman 14-15" value="${vals.page||''}"></label>`;let d=document.createElement('div');d.className='repeat-row '+kind;d.innerHTML=html+'<button type="button" class="secondary" onclick="this.parentElement.remove()">−</button>';$('#'+id).appendChild(d);bindAllDateInputs(d);Object.keys(vals).forEach(k=>{let e=d.querySelector('.'+k);if(e)e.value=(kind==='landtitle'&&(k==='validUntil'||k==='surveyDate'))?isoToID(vals[k]):vals[k]});if(kind==='landtitle'&&typeof bindLandTitleSync==='function')bindLandTitleSync(d)}
let paymentLedger=[];
function ledgerId(){return 'pay_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function currentTaxRate(){return Math.max(0,Math.min(100,Number(document.querySelector('[name="rentTaxRate"]')?.value||0)))}
function currentTaxMode(){return document.querySelector('[name="rentTaxMode"]')?.value||'gross_includes_tax'}
function termGross(stated){let v=parseMoney(stated),r=currentTaxRate()/100,m=currentTaxMode();if(m==='net_excludes_tax'&&r>0&&r<1)return Math.round(v/(1-r));return v}
function termTax(stated){let m=currentTaxMode(),g=termGross(stated);return m==='no_withholding'?0:Math.round(g*currentTaxRate()/100)}
function termNet(stated){let v=parseMoney(stated),m=currentTaxMode();if(m==='gross_includes_tax')return Math.max(0,v-termTax(v));return v}
function extractLedger(payments=[]){let out=[],seen=new Set(),legacy=0;for(const p of payments||[])for(const t of paymentTransactions(p)){let id=t.ledgerId||`legacy_${legacy++}`;if(seen.has(id))continue;seen.add(id);out.push({id,date:normalizeIDDate(t.date||''),amount:parseMoney(t.originalAmount??t.amount),taxWithheld:parseMoney(t.taxWithheld),method:t.method||'',reference:t.reference||'',notes:t.notes||''})}return out}
function renderPaymentLedger(){let box=$('#paymentLedger');if(!box)return;box.innerHTML=paymentLedger.length?paymentLedger.map(t=>`<div class="ledger-row" data-id="${t.id}"><input type=text inputmode=numeric class=ledgerDate placeholder="Tanggal DDMMYY" value="${t.date||''}"><input type=text inputmode=decimal class="ledgerAmount money-input" placeholder="Netto masuk rekening" value="${moneyDisplay(t.amount)}"><input type=text inputmode=decimal class="ledgerTax money-input" placeholder="Pajak dipotong" value="${moneyDisplay(t.taxWithheld)}"><input class=ledgerMethod placeholder="Metode / bank" value="${t.method||''}"><input class=ledgerReference placeholder="Referensi / bukti" value="${t.reference||''}"><input class=ledgerNotes placeholder="Catatan" value="${t.notes||''}"><button type=button class="secondary ledgerRemove" title="Hapus pembayaran"><span aria-hidden="true">🗑️</span></button></div>`).join(''):'<div class="muted">Belum ada pembayaran aktual.</div>';box.querySelectorAll('.ledger-row').forEach(r=>{bindAllDateInputs(r);bindMoneyInput(r.querySelector('.ledgerAmount'),()=>syncLedgerFromDOM());bindMoneyInput(r.querySelector('.ledgerTax'),()=>syncLedgerFromDOM());r.querySelectorAll('input').forEach(e=>e.addEventListener('change',syncLedgerFromDOM));r.querySelector('.ledgerRemove').onclick=()=>{paymentLedger=paymentLedger.filter(t=>t.id!==r.dataset.id);renderPaymentLedger();allocateLedger()}})}
function syncLedgerFromDOM(){let rows=[...document.querySelectorAll('#paymentLedger .ledger-row')];paymentLedger=rows.map(r=>({id:r.dataset.id,date:normalizeIDDate(r.querySelector('.ledgerDate').value||''),amount:parseMoney(r.querySelector('.ledgerAmount').value),taxWithheld:parseMoney(r.querySelector('.ledgerTax').value),method:r.querySelector('.ledgerMethod').value||'',reference:r.querySelector('.ledgerReference').value||'',notes:r.querySelector('.ledgerNotes').value||''})).filter(t=>t.amount||t.taxWithheld||t.date||t.method||t.reference||t.notes);allocateLedger()}
function addLedgerPayment(t={}){paymentLedger.push({id:t.id||ledgerId(),date:normalizeIDDate(t.date||''),amount:parseMoney(t.amount),taxWithheld:parseMoney(t.taxWithheld),method:t.method||'',reference:t.reference||'',notes:t.notes||''});renderPaymentLedger();allocateLedger()}
function allocateLedger(){let rows=[...document.querySelectorAll('#payments .payrow')],remaining=rows.map(r=>termNet(r.querySelector('.amount')?.value)),alloc=rows.map(()=>[]);for(const t of paymentLedger){let left=parseMoney(t.amount);for(let i=0;i<rows.length&&left>0;i++){if(remaining[i]<=0)continue;let part=Math.min(left,remaining[i]);alloc[i].push({...t,amount:part,originalAmount:parseMoney(t.amount),ledgerId:t.id});remaining[i]-=part;left-=part}if(left>0&&rows.length)alloc[rows.length-1].push({...t,amount:left,originalAmount:parseMoney(t.amount),ledgerId:t.id,unallocated:true})}rows.forEach((r,i)=>{r._allocatedTransactions=alloc[i];updatePaymentRow(r)});updatePaymentCheck()}
function updatePaymentRow(r){if(!r)return;let stated=parseMoney(r.querySelector('.amount')?.value),gross=termGross(stated),tax=termTax(stated),target=termNet(stated),paid=(r._allocatedTransactions||[]).filter(t=>!t.unallocated).reduce((n,t)=>n+parseMoney(t.amount),0),rem=Math.max(0,target-paid),st=target>0&&rem<=0?'LUNAS':paid>0?'KURANG BAYAR':'BELUM BAYAR';let el=r.querySelector('.payment-row-summary');el.className='payment-row-summary '+(st==='LUNAS'?'ok':st==='KURANG BAYAR'?'warn-text':'muted');el.innerHTML=`<b>${st}</b> · Bruto Rp ${fmt(gross)}${tax?` · Pajak Rp ${fmt(tax)}`:''} · Netto harus diterima Rp ${fmt(target)} · Diterima Rp ${fmt(paid)} · Sisa Rp ${fmt(rem)}`}
function pay(p={}){let d=document.createElement('div');d.className='repeat-row payrow';d.innerHTML=`<input type=text inputmode=numeric placeholder="Jatuh tempo DDMMYY" class=due value="${p.due||''}"><input type=text inputmode="decimal" class="amount money-input" placeholder="Bruto termin Rp 0" value="${moneyDisplay(p.amount)}"><input class=label placeholder="Keterangan / termin" value="${p.label||''}"><button type=button class="secondary remove-payment">− Termin</button><div class="payment-row-summary muted"></div>`;$('#payments').appendChild(d);bindAllDateInputs(d);bindMoneyInput(d.querySelector('.amount'),allocateLedger);d.querySelector('.remove-payment').onclick=()=>{d.remove();allocateLedger()};updatePaymentRow(d)}
function paymentRowData(r){return{due:r.querySelector('.due')?.value||'',amount:parseMoney(r.querySelector('.amount')?.value),label:r.querySelector('.label')?.value||'',transactions:r._allocatedTransactions||[]}}
function updatePaymentCheck(){const box=$('#paymentCheck');if(!box)return;const rent=parseMoney(document.querySelector('[name="rent"]')?.value),rows=[...document.querySelectorAll('#payments .payrow')],statedTotal=rows.reduce((n,r)=>n+parseMoney(r.querySelector('.amount')?.value),0),gross=rows.reduce((n,r)=>n+termGross(r.querySelector('.amount')?.value),0),tax=rows.reduce((n,r)=>n+termTax(r.querySelector('.amount')?.value),0),net=rows.reduce((n,r)=>n+termNet(r.querySelector('.amount')?.value),0),paid=paymentLedger.reduce((n,t)=>n+parseMoney(t.amount),0),taxActual=paymentLedger.reduce((n,t)=>n+parseMoney(t.taxWithheld),0),remaining=Math.max(0,net-paid),advance=Math.max(0,paid-net),diff=rent-statedTotal;box.className='payment-check '+(remaining>0?'warn-text':'ok');box.innerHTML=`<div class=payment-check-title>${remaining>0?'⚠ Masih ada kewajiban netto yang belum diterima':'✓ Seluruh kewajiban netto terjadwal sudah diterima'}</div><div class=payment-check-grid><span><small>Total sewa bruto terjadwal</small><b>Rp ${fmt(gross)}</b></span><span><small>Pajak menurut jadwal</small><b>Rp ${fmt(tax)}</b></span><span><small>Netto seharusnya diterima</small><b>Rp ${fmt(net)}</b></span><span><small>Uang aktual diterima</small><b>Rp ${fmt(paid)}</b></span><span><small>Pajak aktual dicatat</small><b>Rp ${fmt(taxActual)}</b></span><span><small>Kekurangan netto</small><b>Rp ${fmt(remaining)}</b></span><span><small>Belum teralokasi / uang muka</small><b>Rp ${fmt(advance)}</b></span></div>${Math.abs(diff)>=.01?`<div class="muted" style="margin-top:8px">Catatan: total bruto jadwal berbeda Rp ${fmt(Math.abs(diff))} dari nilai sewa yang tertulis di Akta.</div>`:''}`}
function initPaymentLedger(payments=[]){paymentLedger=extractLedger(payments);renderPaymentLedger();allocateLedger()}
let supplementalAgreements=[];
function suppId(){return 'supp_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function renderSupplementalAgreements(){let box=$('#supplementalAgreements');if(!box)return;box.innerHTML=supplementalAgreements.length?supplementalAgreements.map(d=>`<div class="history-item supplemental-item" data-id="${d.id}"><b>${d.label||'Perjanjian di Bawah Tangan'}</b><div>${d.date||'-'} · Bruto Rp ${fmt(d.gross||0)} · Pajak Rp ${fmt(d.tax||0)} · Netto Rp ${fmt(d.net||0)}</div><div class="muted">${d.driveUrl?'Google Drive terhubung · ':''}${(d.payments||[]).length} jadwal pembayaran · ${d.aiReadAt?'✓ Sudah dibaca AI':'Input manual'}</div><div class="history-actions">${d.driveUrl?`<button type="button" class="secondary" onclick="window.open('${String(d.driveUrl).replace(/'/g,'&#39;')}','_blank','noopener')">📄 Drive</button>`:''}<button type="button" class="secondary" onclick="removeSupplementalAgreement('${d.id}')"><span aria-hidden="true">🗑️</span></button></div></div>`).join(''):'<div class="muted">Belum ada perjanjian di bawah tangan.</div>'}
function removeSupplementalAgreement(id){if(!confirm('Hapus perjanjian di bawah tangan ini dari kontrak?'))return;supplementalAgreements=supplementalAgreements.filter(d=>d.id!==id);renderSupplementalAgreements()}window.removeSupplementalAgreement=removeSupplementalAgreement;
function supplementalFromAI(x,driveUrl=''){x=normalizeExtractedLease(x||{});let stated=parseMoney(x.rent||0),rate=Number(x.rentTaxRate||document.querySelector('[name="rentTaxRate"]')?.value||10),mode=x.rentTaxMode||'gross_includes_tax',gross=mode==='net_excludes_tax'&&rate>0&&rate<100?Math.round(stated/(1-rate/100)):stated,tax=mode==='no_withholding'?0:Math.round(gross*rate/100),net=mode==='gross_includes_tax'?Math.max(0,gross-tax):stated;return{id:suppId(),type:'perjanjian_bawah_tangan',label:`Perjanjian di Bawah Tangan${x.deedNo?' · '+x.deedNo:''}`,date:x.deedDate||x.start||'',gross,tax,net,taxRate:rate,driveUrl,payments:(x.payments||[]).map(p=>({...p,source:'perjanjian_bawah_tangan'})),clauses:x.clauses||[],aiExtracted:x,aiReadAt:new Date().toISOString()}}
function mergeSupplementalPayments(doc){if(!Array.isArray(doc.payments)||!doc.payments.length)return;doc.payments.forEach(p=>pay({...p,label:(p.label||'Termin')+' · Bawah Tangan',source:'perjanjian_bawah_tangan',status:'unpaid'}));allocateLedger()}
async function readSupplementalFile(){let f=$('#supplementalFile').files?.[0],st=$('#supplementalStatus');if(!f)return alert('Pilih file perjanjian di bawah tangan.');try{aiProgress(st,'AI membaca perjanjian di bawah tangan…');let x=await invokeDocumentAI(f,'lease',m=>aiProgress(st,m));let d=supplementalFromAI(x,'');supplementalAgreements.push(d);mergeSupplementalPayments(d);renderSupplementalAgreements();recordAIScan();aiProgressDone(st,'Selesai. Nilai bruto/netto, klausul dan jadwal pembayaran ditambahkan. Periksa sebelum Simpan Akta Sewa.')}catch(e){aiProgressError(st,'Gagal: '+e.message)}}
async function readSupplementalDrive(){let u=$('#supplementalDriveUrl').value.trim(),st=$('#supplementalStatus');if(!driveFileId(u))return alert('Masukkan link Google Drive yang valid.');try{aiProgress(st,'AI membaca perjanjian di bawah tangan dari Google Drive…');let r=await invokeDriveAI(u,'lease',m=>aiProgress(st,m));let d=supplementalFromAI(r.data,r.webViewLink||u);supplementalAgreements.push(d);mergeSupplementalPayments(d);renderSupplementalAgreements();recordAIScan();aiProgressDone(st,'Selesai. Dokumen dan jadwal pembayarannya terhubung ke kontrak ini. Periksa lalu Simpan.')}catch(e){aiProgressError(st,'Gagal: '+e.message)}}
function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
function aiProgress(el,message,state='active'){if(!el)return;el.classList.add('ai-progress');el.dataset.state=state;el.innerHTML=`<span class=ai-progress-spinner aria-hidden=true></span><span>${message}</span>`}function aiProgressDone(el,message){if(!el)return;el.classList.add('ai-progress');el.dataset.state='done';el.innerHTML=`<span class=ai-progress-check aria-hidden=true>✓</span><span>${message}</span>`}function aiProgressError(el,message){if(!el)return;el.classList.add('ai-progress');el.dataset.state='error';el.innerHTML=`<span class=ai-progress-error aria-hidden=true>!</span><span>${message}</span>`}
function setField(name,value){if(value===undefined||value===null||value==='')return;const e=document.querySelector(`[name="${name}"]`);if(!e)return;e.value=e.classList.contains('money-input')?moneyDisplay(value):value}
function safeDocumentUrl(value){try{const u=new URL(String(value||'').trim());return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function syncOpenDocButton(){const b=$('#openDocBtn'),u=safeDocumentUrl(document.querySelector('[name="docUrl"]')?.value);if(!b)return;b.disabled=!u;b.title=u?'Buka dokumen di tab baru':'Masukkan link dokumen terlebih dahulu'}
function safeMapsUrl(v){try{const u=new URL((v||'').trim());const h=u.hostname.toLowerCase();if((u.protocol==='https:'||u.protocol==='http:')&&(h==='maps.app.goo.gl'||h==='google.com'||h.endsWith('.google.com')||h==='goo.gl'))return u.href}catch{}return ''}
function syncOpenMapsButton(){const b=$('#openMapsBtn'),u=safeMapsUrl(document.querySelector('[name="googleMapsUrl"]')?.value);if(!b)return;b.disabled=!u;b.title=u?'Buka lokasi di Google Maps':'Masukkan link Google Maps terlebih dahulu'}
function openCurrentMaps(){const u=safeMapsUrl(document.querySelector('[name="googleMapsUrl"]')?.value);if(!u)return alert('Link Google Maps belum tersedia atau tidak valid.');window.open(u,'_blank','noopener,noreferrer')}
function openCurrentDocument(){const u=safeDocumentUrl(document.querySelector('[name="docUrl"]')?.value);if(!u)return alert('Link dokumen / Google Drive belum tersedia.');window.open(u,'_blank','noopener,noreferrer')}
function renderTaxAIAnalysis(x={}){
 const el=$('#taxAIAnalysis');if(!el)return;let rate=Number(x.rentTaxRate||currentTaxRate()||0),mode=x.rentTaxMode||currentTaxMode(),stated=parseMoney(x.rent||document.querySelector('[name="rent"]')?.value),gross=parseMoney(x.rentGross)||termGross(stated),tax=parseMoney(x.rentTaxAmount)||termTax(stated),net=parseMoney(x.rentNet)||termNet(stated);let modeText=mode==='gross_includes_tax'?'Nilai Akta termasuk PPh; PPh dipotong dari bruto':mode==='net_excludes_tax'?'Nilai Akta adalah netto; PPh di-gross-up di atas nilai netto':'Tidak ada pemotongan PPh yang teridentifikasi';let warn=x.taxNeedsVerification?'⚠ Perlu verifikasi redaksi pajak':'✓ Perlakuan pajak berhasil diidentifikasi';el.innerHTML=`<b>Analisis Pajak AI</b><div>${warn}</div><div class="tax-ai-grid"><span>Nilai Akta<b>Rp ${fmt(stated)}</b></span><span>Bruto PPh<b>Rp ${fmt(gross)}</b></span><span>PPh Final ${rate||0}%<b>Rp ${fmt(tax)}</b></span><span>Netto diterima<b>Rp ${fmt(net)}</b></span></div><div class="muted">${modeText}${x.taxTreatment?' · '+x.taxTreatment:''}</div>${x.taxClause?`<div class="tax-clause"><small>Klausul sumber</small><div>${String(x.taxClause).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div></div>`:''}`;
}
function applyExtracted(x){
  x=normalizeExtractedLease(x);leaseAIWholeMeta={totalContractRent:Number(x.totalContractRent||0),rentPeriods:Array.isArray(x.rentPeriods)?x.rentPeriods:[],lastAIVerification:new Date().toISOString()};leaseTaxAIResult={rentTaxAmount:parseMoney(x.rentTaxAmount),rentGross:parseMoney(x.rentGross),rentNet:parseMoney(x.rentNet),taxClause:x.taxClause||'',taxTreatment:x.taxTreatment||'',taxNeedsVerification:!!x.taxNeedsVerification};
  pendingPriorDeeds=Array.isArray(x.priorDeeds)?x.priorDeeds:[];
  ['tenant','lessor','asset','propertyAddress','propertyArea','leaseLandArea','leaseBuildingArea','deedNo','deedDate','start','end','rent','rentTaxMode','rentTaxRate','rentTaxAmount','rentGross','rentNet','taxClause','taxTreatment','taxNeedsVerification','deposit','renewalNotice','renewalTerm','googleMapsUrl','sourcePages','notes'].forEach(k=>setField(k,x[k]));
  if(Array.isArray(x.contacts)&&x.contacts.length){$('#contacts').innerHTML='';x.contacts.forEach(v=>addRepeat('contacts',v,'contact'))}
  if(Array.isArray(x.bankAccounts)&&x.bankAccounts.length){$('#banks').innerHTML='';x.bankAccounts.forEach(v=>addRepeat('banks',v,'bank'))}
  if(Array.isArray(x.landRights)&&x.landRights.length&&$('#lands')){$('#lands').innerHTML='';x.landRights.forEach(v=>addRepeat('lands',v,'land'))}
  if(Array.isArray(x.payments)&&x.payments.length){$('#payments').innerHTML='';x.payments.forEach(v=>pay({...v,status:'unpaid'}));paymentLedger=[];renderPaymentLedger();allocateLedger()}
  if(Array.isArray(x.clauses)&&x.clauses.length){$('#clauses').innerHTML='';x.clauses.forEach(v=>addRepeat('clauses',v,'clause'))}
  if(Array.isArray(x.validationWarnings)&&x.validationWarnings.length){let n=document.querySelector('[name="notes"]');if(n)n.value=(n.value?n.value+'\n':'')+'PERINGATAN VALIDASI AI: '+x.validationWarnings.join(' | ')}
  renderTaxAIAnalysis(x);setField('verificationStatus','perlu_verifikasi');$('#verifyBadge').textContent='PERLU VERIFIKASI';updatePaymentCheck();syncOpenDocButton();syncOpenMapsButton();
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
const DRIVE_TOKEN_KEY='sewaGoogleDriveTokenV1',DRIVE_TOKEN_EXP_KEY='sewaGoogleDriveTokenExpV1',DRIVE_SCOPE_KEY='sewaGoogleDriveScopeV1',DRIVE_SCOPE='https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';
function clearStoredDriveToken(){googleDriveToken='';try{sessionStorage.removeItem(DRIVE_TOKEN_KEY);sessionStorage.removeItem(DRIVE_TOKEN_EXP_KEY);sessionStorage.removeItem(DRIVE_SCOPE_KEY)}catch(_){}}
function restoreDriveToken(){try{const t=sessionStorage.getItem(DRIVE_TOKEN_KEY)||'',exp=Number(sessionStorage.getItem(DRIVE_TOKEN_EXP_KEY)||0),scope=sessionStorage.getItem(DRIVE_SCOPE_KEY)||'';if(t&&exp>Date.now()+30000&&scope.includes('drive.file')){googleDriveToken=t;return true}if(t||exp)clearStoredDriveToken()}catch(_){}return false}
function storeDriveToken(r){googleDriveToken=r.access_token||'';const ttl=Math.max(60,Number(r.expires_in||3600));try{sessionStorage.setItem(DRIVE_TOKEN_KEY,googleDriveToken);sessionStorage.setItem(DRIVE_TOKEN_EXP_KEY,String(Date.now()+ttl*1000));sessionStorage.setItem(DRIVE_SCOPE_KEY,DRIVE_SCOPE)}catch(_){}return googleDriveToken}
function requestDriveToken(){return new Promise((resolve,reject)=>{
  if(!googleClientReady())return reject(new Error('Google OAuth Client ID belum dikonfigurasi di config.js'));
  const client=google.accounts.oauth2.initTokenClient({client_id:SEWA_CONFIG.googleClientId,scope:DRIVE_SCOPE,callback:r=>{if(r.error)return reject(new Error(r.error));resolve(storeDriveToken(r))}});
  // OAuth hanya boleh dimulai dari tombol Hubungkan Google Drive. Jangan paksa consent berulang.
  client.requestAccessToken({prompt:''});
})}
function requireDriveToken(){if(googleDriveToken||restoreDriveToken())return googleDriveToken;throw new Error('Google Drive belum terhubung atau sesi izin sudah berakhir. Tekan tombol koneksi Google Drive (🔗) terlebih dahulu, lalu ulangi pembacaan.')}
function driveStatusForButton(btn){return btn?.closest('.ai-extract,.drive-extract,.landtitle')?.querySelector('.drive-local-status,.land-ai-status,#driveStatus,#pbbExtractStatus,#supplementalStatus,#historicalLeaseStatus')||$('#driveStatus')}
async function connectDriveFromButton(btn){const st=driveStatusForButton(btn);try{if(btn)btn.disabled=true;if(st)st.textContent='Membuka izin Google Drive…';await requestDriveToken();document.querySelectorAll('.drive-connect-btn,#driveConnectBtn').forEach(x=>x.textContent='🔗 Hubungkan Ulang Google Drive');if(st)st.textContent='✓ Google Drive terhubung. Sekarang tekan Baca dari Google Drive.';return true}catch(e){if(st)st.textContent='Gagal menghubungkan Google Drive: '+(e.message||e);return false}finally{if(btn)btn.disabled=false}}
window.connectDriveFromButton=connectDriveFromButton;
async function connectDrive(){return connectDriveFromButton($('#driveConnectBtn'))}
function syncDriveConnectionUI(){const ok=!!(googleDriveToken||restoreDriveToken());document.querySelectorAll('.drive-connect-btn,#driveConnectBtn').forEach(x=>x.textContent=ok?'🔗 Hubungkan Ulang Google Drive':'🔗');return ok}
document.addEventListener('click',e=>{const b=e.target.closest('.drive-connect-btn');if(b&&!b.hasAttribute('onclick')){e.preventDefault();connectDriveFromButton(b)}});
async function blobToBase64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
async function fetchDriveFile(fileId){
  requireDriveToken();
  const metaUrl=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,webViewLink&supportsAllDrives=true`;
  let r=await fetch(metaUrl,{headers:{Authorization:`Bearer ${googleDriveToken}`}});
  if(r.status===401){clearStoredDriveToken();throw new Error('Sesi izin Google Drive sudah berakhir. Tekan tombol koneksi Google Drive (🔗) lalu coba lagi.')}
  if(!r.ok)throw new Error('Tidak dapat membaca metadata file Google Drive ('+r.status+').');
  const meta=await r.json();
  if(String(meta.mimeType).startsWith('application/vnd.google-apps.'))throw new Error('Gunakan file PDF/JPG/PNG di Google Drive, bukan Google Docs/Sheets.');
  r=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,{headers:{Authorization:`Bearer ${googleDriveToken}`}});
  if(!r.ok)throw new Error('Tidak dapat mengunduh file Google Drive ('+r.status+'). Pastikan akun Anda punya akses.');
  const blob=await r.blob(); if(blob.size>500*1024*1024)throw new Error('File lebih dari 500 MB.');
  return {name:meta.name||'drive-file.pdf',mimeType:meta.mimeType||blob.type||'application/pdf',blob,webViewLink:meta.webViewLink};
}
async function extractFromDrive(){const url=$('#driveUrl').value.trim(),btn=$('#driveExtractBtn'),st=$('#driveStatus');if(!driveFileId(url))return alert('Masukkan link Google Drive file yang valid.');btn.disabled=true;try{const r=await invokeDriveAI(url,'lease',m=>aiProgress(st,m));applyExtracted(r.data);setField('docUrl',r.webViewLink||url);$('#driveUrl').value=r.webViewLink||url;syncOpenDocButton();syncLeaseDriveSourceHint({docUrl:r.webViewLink||url});recordAIScan();aiProgressDone(st,'File Google Drive selesai dibaca. Link sumber sudah dimasukkan ke Akta; tekan Simpan agar sumber Google Drive tersimpan permanen dan dapat dipakai Verifikasi Ulang AI.')}catch(e){console.error(e);aiProgressError(st,'Gagal: '+(e.message||e))}finally{btn.disabled=false}}
function openRowLink(btn,cls){const u=btn.parentElement.querySelector('.'+cls)?.value?.trim();if(!u)return alert('Link belum diisi.');try{const x=new URL(u);if(!['http:','https:'].includes(x.protocol))throw 0;window.open(x.href,'_blank','noopener,noreferrer')}catch(e){alert('Link tidak valid. Gunakan link https://')}}window.openRowLink=openRowLink;

async function getAllPropertyObjects(assetId){
  if(!assetId)return{landTitles:[],buildings:[]};
  return await getPropertyChildren(assetId)
}
function relationAssetName(assetId){const a=assets.find(x=>String(x.id)===String(assetId));return String(a?.alias||a?.name||'Properti tidak dikenal')}
function checkListHtml(rows,type,selected=[],showAsset=false){
  let set=new Set(selected.map(String));
  if(!rows.length)return '<div class="lease-relation-empty">Belum ada data pada Properti/Lokasi ini.</div>';
  return rows.map(r=>{let label=type==='land'?`${r.right_type||'Tanah'} ${r.certificate_no||'(tanpa nomor)'}${r.land_area?' · '+r.land_area+' m²':''}`:`${r.name||'Bangunan'}${r.building_area?' · '+r.building_area+' m²':''}`;let owner=showAsset?`<small>${historySearchEscape(relationAssetName(r.asset_id))}</small>`:'';return `<label class="check-item relation-choice"><input type="checkbox" value="${historySearchEscape(r.id)}" ${set.has(String(r.id))?'checked':''}> <span><b>${historySearchEscape(label)}</b>${owner}</span></label>`}).join('')
}
let leaseLandAllRows=[],leaseLandPrimaryRows=[],leaseLandOtherRows=[],leaseLandOthersVisible=false,leaseLandOrphanIds=[];
function renderLeaseLandPicker(selected=[],orphanIds=[]){
  const selectedSet=new Set(selected.map(String));
  const primary=leaseLandPrimaryRows;
  const other=leaseLandOtherRows.filter(r=>leaseLandOthersVisible||selectedSet.has(String(r.id)));
  let html=checkListHtml(primary,'land',selected,true);
  if(other.length)html+=`<div class="relation-subhead">${leaseLandOthersVisible?'Sertifikat properti lain':'Sertifikat properti lain yang sudah terhubung'}</div>`+checkListHtml(other,'land',selected,true);
  if(orphanIds.length)html+=`<div class="compare-warning lease-relation-warning"><b>⚠ ${orphanIds.length} relasi lama tidak ditemukan di Master Sertifikat.</b><div>Relasi dipertahankan sampai Anda melepas centangnya lalu menyimpan Akta.</div></div>`+orphanIds.map(id=>`<label class="check-item relation-choice relation-orphan"><input type="checkbox" value="${historySearchEscape(id)}" checked><span><b>Relasi sertifikat lama</b><small>ID ${historySearchEscape(id)} · data master tidak ditemukan</small></span></label>`).join('');
  $('#leaseLandChoices').innerHTML=html;
  const btn=$('#leaseLandMoreBtn');if(btn){btn.hidden=!leaseLandOtherRows.length;btn.textContent=leaseLandOthersVisible?'−':'＋';btn.setAttribute('aria-label',leaseLandOthersVisible?'Sembunyikan sertifikat properti lain':'Tampilkan sertifikat properti lain')}
}
let leasePbbRows=[],leasePbbOthersVisible=false;
function leasePbbCard(r,checked){const alias=historySearchEscape(String(r.property_alias||relationAssetName(r.asset_id)||'Properti belum diberi alias').trim());return `<label class="check-item lease-pbb-item"><input type="checkbox" value="${historySearchEscape(r.id)}" ${checked?'checked':''} onchange="toggleLeasePbb('${historySearchEscape(r.id)}',this.checked)"> <span class="lease-pbb-label"><b class="lease-pbb-alias">${alias}</b><small>NOP ${historySearchEscape(r.nop||'-')} · ${historySearchEscape(r.tax_year||'-')} · tanah ${historySearchEscape(r.land_area||0)} m² · bangunan ${historySearchEscape(r.building_area||0)} m²</small></span></label>`}
function renderLeasePbbPicker(){let chosen=leasePbbRows.filter(r=>r._selected),other=leasePbbRows.filter(r=>!r._selected);$('#leasePbbSelected').innerHTML=chosen.length?chosen.map(r=>leasePbbCard(r,true)).join(''):'<div class="lease-pbb-empty">Belum ada PBB yang dipilih.</div>';$('#leasePbbOther').innerHTML=other.length?other.map(r=>leasePbbCard(r,false)).join(''):'<div class="lease-pbb-empty">Tidak ada PBB lainnya pada Properti/Lokasi ini.</div>';$('#leasePbbOtherWrap').hidden=!leasePbbOthersVisible;$('#leasePbbToggle').textContent=leasePbbOthersVisible?'−':'＋';$('#leasePbbToggle').setAttribute('aria-label',leasePbbOthersVisible?'Sembunyikan PBB lainnya':'Tampilkan PBB lainnya');$('#leasePbbToggle').hidden=!other.length;$('#leasePbbChoices').innerHTML=leasePbbRows.filter(r=>r._selected).map(r=>`<input type="checkbox" value="${historySearchEscape(r.id)}" checked>`).join('')}
function toggleLeasePbb(id,on){let r=leasePbbRows.find(x=>String(x.id)===String(id));if(r)r._selected=!!on;renderLeasePbbPicker()}window.toggleLeasePbb=toggleLeasePbb;
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
    if(l.error)throw l.error;if(b.error)throw b.error;if(p.error)throw p.error;if(f.error)throw f.error;
    landIds=(l.data||[]).map(x=>x.land_title_id);buildingIds=(b.data||[]).map(x=>x.building_id);pbbIds=(p.data||[]).map(x=>x.pbb_id);fac=f.data||[]
  }
  const allLand=await sb.from('land_titles').select('*').order('certificate_no');if(allLand.error)throw allLand.error;
  leaseLandAllRows=allLand.data||[];leaseLandPrimaryRows=leaseLandAllRows.filter(r=>String(r.asset_id)===String(assetId));leaseLandOtherRows=leaseLandAllRows.filter(r=>String(r.asset_id)!==String(assetId));leaseLandOthersVisible=false;
  const allLandIds=new Set(leaseLandAllRows.map(t=>String(t.id)));leaseLandOrphanIds=landIds.filter(id=>!allLandIds.has(String(id)));
  renderLeaseLandPicker(landIds,leaseLandOrphanIds);
  $('#leaseBuildingChoices').innerHTML=checkListHtml(obj.buildings,'building',buildingIds,true);
  let pq=sb.from('pbb_records').select('id,nop,tax_year,land_area,building_area,property_alias,asset_id').order('tax_year',{ascending:false});
  const pr=await pq;if(pr.error)throw pr.error;
  leasePbbRows=(pr.data||[]).filter(r=>String(r.asset_id)===String(assetId)||pbbIds.includes(r.id)).map(r=>({...r,_selected:pbbIds.includes(r.id)}));leasePbbOthersVisible=false;renderLeasePbbPicker();
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
function openLeaseDetailPage(x={}){
  const page=$('#dlg'), shell=$('#appShell');
  if(!page)return;
  window.__leaseListScrollY=window.scrollY;
  if(shell)shell.hidden=true;
  if($('#leasePage'))$('#leasePage').hidden=true;
  if($('#pbbPage'))$('#pbbPage').hidden=true;
  page.hidden=false;
  document.body.classList.add('lease-detail-open');
  const title=$('#leaseDetailTitle');
  if(title)title.textContent=edit>=0?`Akta Sewa${x?.tenant?' — '+x.tenant:''}`:'Tambah Akta Sewa';
  const summary=$('#leaseDetailSummary');
  if(summary)summary.textContent=[x?.deedNo&&`Akta No. ${x.deedNo}`,x?.start&&x?.end&&`${x.start} s.d. ${x.end}`,x?.tenant].filter(Boolean).join(' • ')||'Lengkapi atau periksa seluruh data Akta Sewa.';
  window.scrollTo({top:0,behavior:'instant'});
  try{history.pushState({leaseDetail:true},'',location.href)}catch{}
}
function closeLeaseDetailPage(fromPop=false){
  const page=$('#dlg'), shell=$('#appShell');
  if(page)page.hidden=true;
  if(shell)shell.hidden=false;
  if(shell)shell.style.display='block';
  const main=shell?.querySelector('main');if(main)main.hidden=true;
  if($('#pbbPage'))$('#pbbPage').hidden=true;
  if($('#assetPage'))$('#assetPage').hidden=true;
  if($('#leasePage'))$('#leasePage').hidden=false;
  document.body.classList.remove('lease-detail-open');
  render();
  requestAnimationFrame(()=>window.scrollTo({top:window.__leaseListScrollY||0,behavior:'instant'}));
  if(!fromPop && history.state?.leaseDetail){try{history.back()}catch{}}
}
window.addEventListener('popstate',()=>{if(!$('#dlg')?.hidden)closeLeaseDetailPage(true)});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#dlg')?.hidden)closeLeaseDetailPage()});
async function openEdit(i=-1){edit=i;pendingPriorDeeds=[];leaseRescanResult=null;pendingLeaseLink=i>=0?null:pendingLeaseLink;let x=i>=0?normalizeExtractedLease(data[i]):{};leaseAIWholeMeta={totalContractRent:Number(x.totalContractRent||0),rentPeriods:Array.isArray(x.rentPeriods)?x.rentPeriods:[],lastAIVerification:x.lastAIVerification||null};leaseTaxAIResult={rentTaxAmount:parseMoney(x.rentTaxAmount),rentGross:parseMoney(x.rentGross),rentNet:parseMoney(x.rentNet),taxClause:x.taxClause||'',taxTreatment:x.taxTreatment||'',taxNeedsVerification:!!x.taxNeedsVerification};$('#form').reset();['contacts','banks','payments','clauses','leaseFacilities'].forEach(id=>$('#'+id).innerHTML='');[...$('#form').elements].forEach(e=>{if(e.name&&x[e.name]!=null)e.value=(e.classList.contains('money-input')?moneyDisplay(x[e.name]):x[e.name])});refreshAssetSelect();$('#contractAssetSelect').value=x.assetId||'';if(x.assetId)applySelectedAsset();(x.contacts||[]).forEach(v=>addRepeat('contacts',v,'contact'));(x.bankAccounts||[]).forEach(v=>addRepeat('banks',v,'bank'));(x.payments||[]).forEach(pay);initPaymentLedger(x.payments||[]);supplementalAgreements=Array.isArray(x.supplementalAgreements)?x.supplementalAgreements:[];renderSupplementalAgreements();(x.clauses||[]).forEach(v=>addRepeat('clauses',v,'clause'));$('#verifyBadge').textContent=x.verificationStatus==='sudah_diverifikasi'?'SUDAH DIVERIFIKASI':'PERLU VERIFIKASI';openLeaseDetailPage(x);renderTaxAIAnalysis(x);document.querySelector('[name="rentTaxRate"]')?.addEventListener('input',allocateLedger,{once:true});document.querySelector('[name="rentTaxMode"]')?.addEventListener('change',allocateLedger,{once:true});updatePaymentCheck();syncOpenDocButton();syncOpenMapsButton();if($('#driveUrl'))$('#driveUrl').value=driveFileId(x.docUrl||'')?(x.docUrl||''):'';syncLeaseDriveSourceHint(x);await loadLeaseRelations(x.id||'',x.assetId||'');lockViewerDialog($('#dlg'))}window.openEdit=openEdit;
function collect(sel,fields){return [...document.querySelectorAll(sel)].map(r=>Object.fromEntries(fields.map(f=>[f,r.querySelector('.'+f)?.value||'']))).filter(o=>Object.values(o).some(Boolean))}
$('#addBtn').onclick=()=>{if(!assets.length){alert('Buat Aset / Tanah terlebih dahulu.');openAssetList();return}openEdit()};$('#extractBtn').onclick=extractDocument;$('#driveConnectBtn').onclick=connectDrive;syncDriveConnectionUI();$('#driveExtractBtn').onclick=extractFromDrive;$('#openDocBtn').onclick=openCurrentDocument;document.querySelector('[name="docUrl"]').addEventListener('input',syncOpenDocButton);$('#openMapsBtn').onclick=openCurrentMaps;document.querySelector('[name="googleMapsUrl"]').addEventListener('input',syncOpenMapsButton);$('#contractAssetSelect').addEventListener('change',async()=>{applySelectedAsset();await loadLeaseRelations(edit>=0?data[edit]?.id:'',$('#contractAssetSelect').value)});$('#cancel').onclick=closeLeaseDetailPage;$('#leaseBackBtn').onclick=closeLeaseDetailPage;$('#addPayment').onclick=()=>{pay();allocateLedger()};$('#addLedgerPayment').onclick=()=>addLedgerPayment();$('#addContact').onclick=()=>addRepeat('contacts',{},'contact');$('#addBank').onclick=()=>addRepeat('banks',{},'bank');$('#addClause').onclick=()=>addRepeat('clauses',{},'clause');$('#addLeaseFacility').onclick=()=>addRepeat('leaseFacilities',{},'facility');$('#search').oninput=render;bindMoneyInput(document.querySelector('[name="rent"]'),updatePaymentCheck);bindMoneyInput(document.querySelector('[name="deposit"]'));
$('#form').onsubmit=async e=>{e.preventDefault();let x=Object.fromEntries(new FormData(e.target));x.assetId=$('#contractAssetSelect').value;x.rent=parseMoney(x.rent);x.rentTaxRate=Number(x.rentTaxRate||0);x.rentTaxMode=x.rentTaxMode||'gross_includes_tax';x.rentGross=termGross(x.rent);x.rentTaxAmount=termTax(x.rent);x.rentNet=termNet(x.rent);x.taxTreatment=leaseTaxAIResult?.taxTreatment||(x.rentTaxMode==='gross_includes_tax'?'PPh dipotong dari bruto':x.rentTaxMode==='net_excludes_tax'?'PPh di-gross-up di atas netto':'Tanpa pemotongan PPh');x.taxClause=leaseTaxAIResult?.taxClause||'';x.taxNeedsVerification=!!leaseTaxAIResult?.taxNeedsVerification;x.supplementalAgreements=supplementalAgreements;x.totalContractRent=Number(leaseAIWholeMeta.totalContractRent||0);x.rentPeriods=leaseAIWholeMeta.rentPeriods||[];x.priorDeeds=pendingPriorDeeds||[];x.lastAIVerification=leaseAIWholeMeta.lastAIVerification||null;x.parentContractId=pendingLeaseLink?.parentContractId||(edit>=0?data[edit]?.parentContractId:'')||'';x.leaseRelationType=pendingLeaseLink?.leaseRelationType||(edit>=0?data[edit]?.leaseRelationType:'')||'';x.deposit=parseMoney(x.deposit);x.contacts=collect('#contacts .contact',['role','name','phone','email']);x.bankAccounts=collect('#banks .bank',['purpose','bank','account','holder']);x.clauses=collect('#clauses .clause',['title','detail','page','importance']).map(v=>normalizeAIObject(v));x.notes=normalizeAIText(x.notes||'');x.payments=[...document.querySelectorAll('#payments .payrow')].map(paymentRowData).filter(p=>p.amount||p.due||p.label||p.transactions.length);if(edit>=0&&data[edit]?.id)x.id=data[edit].id;let b=e.submitter,warnings=[];try{b.disabled=true;if(x.id){try{let existing=await historyRows('lease',x.id);if(!existing.length)await saveHistorySnapshot('lease',x.id,data[edit]?.assetId||null,data[edit],'baseline','Versi sebelum perubahan')}catch(h){warnings.push('Snapshot awal: '+h.message)}}await saveContract(x);let saved=data.find(v=>x.id?v.id===x.id:(v.deedNo===x.deedNo&&v.tenant===x.tenant));if(saved?.id){try{await saveLeaseRelations(saved.id)}catch(r){warnings.push('Relasi aset: '+r.message)}if(pendingPriorDeeds.length){try{let pr=await syncPriorDeedReferences(saved.id,pendingPriorDeeds);warnings.push(...(pr.warnings||[]).map(v=>'Referensi histori: '+v))}catch(pr){warnings.push('Referensi histori: '+pr.message)}try{await captureLeaseVersion(saved.id,x.id?'Perubahan disimpan':'Akta pertama disimpan')}catch(h){warnings.push('Riwayat versi: '+h.message)}}}await loadData();pendingLeaseLink=null;closeLeaseDetailPage();if(warnings.length)alert('Akta utama SUDAH TERSIMPAN. Ada bagian tambahan yang perlu diperiksa:\n\n'+warnings.join('\n'));else alert('Akta dan hasil Verifikasi AI berhasil disimpan permanen.')}catch(err){alert('Gagal menyimpan Akta utama: '+err.message)}finally{b.disabled=false}};


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
async function openHistorySearch(){
 $('#historySearchInput').value='';
 let sel=$('#historySearchAsset');
 if(sel){sel.innerHTML='<option value="">Semua Properti</option>'+assets.map(a=>`<option value="${historySearchEscape(a.id)}">${historySearchEscape(a.alias||a.name||a.address||'Properti')}</option>`).join('');sel.value=''}
 $('#historySearchResults').innerHTML='<div class="muted">Pilih properti bila ingin membatasi pencarian, lalu ketik kata pencarian.</div>';$('#historySearchDlg').showModal()
}
function historySearchEscape(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function fetchAllDocumentHistory(){
 const pageSize=1000,all=[];let from=0;
 while(true){
  let r=await sb.from('document_history').select('*').order('created_at',{ascending:false}).range(from,from+pageSize-1);
  if(r.error)throw r.error;
  let rows=r.data||[];all.push(...rows);
  if(rows.length<pageSize)break;
  from+=pageSize;
 }
 return all;
}
function historySearchLeaseIndex(entityId){return data.findIndex(v=>String(v.id)===String(entityId))}
async function openLeaseFromHistorySearch(entityId){let i=historySearchLeaseIndex(entityId);if(i<0)return alert('Akta aktif untuk riwayat ini tidak ditemukan. Riwayatnya tetap dapat dibuka melalui tombol Riwayat & Bandingkan.');$('#historySearchDlg').close();await openEdit(i)}
async function compareLeaseFromHistorySearch(entityId){let i=historySearchLeaseIndex(entityId),x=i>=0?data[i]:null;$('#historySearchDlg').close();await openHistory('lease',entityId,x?.tenant||'Akta Sewa')}
window.openLeaseFromHistorySearch=openLeaseFromHistorySearch;window.compareLeaseFromHistorySearch=compareLeaseFromHistorySearch;
function historySearchIdentity(x){let s=x.snapshot||{};if(x.entity_type==='lease')return {title:s.tenant||s.lessee||'Akta Sewa',sub:[s.asset,s.deedNo?`Akta ${s.deedNo}`:'',s.deedDate||'',s.start&&s.end?`${s.start} s/d ${s.end}`:''].filter(Boolean).join(' · ')};let lands=s.landTitles||[];let first=lands[0]||{};return {title:s.asset?.alias||s.asset?.name||'Sertifikat Tanah',sub:[first.right_type||first.rightType,first.certificate_no||first.certificateNo].filter(Boolean).join(' · ')}}
async function runHistorySearch(){
 let q=$('#historySearchInput').value.trim().toLowerCase(),box=$('#historySearchResults'),assetId=$('#historySearchAsset')?.value||'';
 if(q.length<2){box.innerHTML='<div class="muted">Ketik minimal 2 karakter.</div>';return}
 box.innerHTML='<div class="muted">Mencari di seluruh riwayat database…</div>';
 try{
  let rows=await fetchAllDocumentHistory(),latest=new Map();
  if(assetId)rows=rows.filter(x=>String(x.asset_id||x.snapshot?.assetId||x.snapshot?.asset?.id||'')===String(assetId));
  rows.forEach(x=>{let k=`${x.entity_type}:${x.entity_id}`;if(!latest.has(k))latest.set(k,x.id)});
  let hits=rows.filter(x=>JSON.stringify(x.snapshot||{}).toLowerCase().includes(q));
  let shown=hits.slice(0,200);
  box.innerHTML=`<div class="history-search-summary"><b>${hits.length} hasil</b> dari ${rows.length} versi riwayat diperiksa${assetId?` · properti: ${historySearchEscape(assets.find(a=>String(a.id)===String(assetId))?.alias||assets.find(a=>String(a.id)===String(assetId))?.name||'terpilih')}`:''}${hits.length>shown.length?` · menampilkan ${shown.length} teratas`:''}</div>`+(shown.length?shown.map(x=>{let id=historySearchIdentity(x),isLatest=latest.get(`${x.entity_type}:${x.entity_id}`)===x.id,isLease=x.entity_type==='lease',date=new Date(x.created_at).toLocaleString('id-ID');return `<div class="history-search-hit"><div class="history-search-head"><div><b>${historySearchEscape(id.title)}</b><div class="muted">${isLease?'Akta Sewa':'Sertifikat Tanah'} · ${isLatest?'VERSI TERBARU':'HISTORIS'} · ${historySearchEscape(date)}</div>${id.sub?`<div class="history-search-sub">${historySearchEscape(id.sub)}</div>`:''}</div><span class="pill ${isLatest?'':'warn'}">${isLatest?'TERBARU':'HISTORIS'}</span></div><div class="history-search-snippet">${highlightHistoryHit(x.snapshot,q)}</div>${isLease?`<div class="history-search-actions"><button type="button" onclick="openLeaseFromHistorySearch('${historySearchEscape(x.entity_id)}')">Buka Akta</button><button type="button" class="secondary" onclick="compareLeaseFromHistorySearch('${historySearchEscape(x.entity_id)}')">Riwayat & Bandingkan</button></div>`:''}</div>`}).join(''):'<div class="muted">Tidak ditemukan di seluruh riwayat database.</div>');
 }catch(e){box.innerHTML=`<div class="compare-warning">Pencarian gagal: ${historySearchEscape(e.message)}</div>`}
}
function highlightHistoryHit(s,q){let text=JSON.stringify(s||{}).replace(/[{}\[\]"]/g,' ').replace(/,/g,', '),low=text.toLowerCase(),i=low.indexOf(q);if(i<0)return '';let a=Math.max(0,i-140),b=Math.min(text.length,i+q.length+260),before=historySearchEscape(text.slice(a,i)),match=historySearchEscape(text.slice(i,i+q.length)),after=historySearchEscape(text.slice(i+q.length,b));return (a?'…':'')+before+'<mark>'+match+'</mark>'+after+(b<text.length?'…':'')}

function leaseSearchSnippet(obj,q){let text=JSON.stringify(obj||{}).replace(/[{}\[\]"]/g,' ').replace(/,/g,', '),low=text.toLowerCase(),i=low.indexOf(q);if(i<0)return historySearchEscape(text.slice(0,320));let a=Math.max(0,i-110),b=Math.min(text.length,i+q.length+260);return (a?'…':'')+historySearchEscape(text.slice(a,i))+'<mark>'+historySearchEscape(text.slice(i,i+q.length))+'</mark>'+historySearchEscape(text.slice(i+q.length,b))+(b<text.length?'…':'')}
function leaseSearchAssetId(row,type){if(type==='Properti')return row.id;return row.asset_id||row.assetId||row.snapshot?.asset_id||row.snapshot?.assetId||row.snapshot?.asset?.id||''}
function leaseSearchTitle(row,type){if(type==='Properti')return row.alias||row.name||row.address||'Properti';if(type==='Sertifikat')return `${row.right_type||'Sertifikat'} ${row.certificate_no||'-'}`;if(type==='Bangunan')return row.name||'Bangunan';if(type==='PBB')return `${row.property_alias||'PBB'} · NOP ${row.nop||'-'} · ${row.tax_year||'-'}`;if(type==='Akta Sewa')return `${row.tenant||row.lessee||'Akta Sewa'} · Akta ${row.deed_no||row.deedNo||'-'}`;if(type==='Riwayat Akta/Klausul'){let s=row.snapshot||{};return `${s.tenant||'Riwayat Akta'} · Akta ${s.deedNo||'-'}`}return type}
async function openLeaseDataSearch(){let active=edit>=0?data[edit]:null,sel=$('#leaseDataSearchAsset');sel.innerHTML='<option value="">Semua Properti</option>'+assets.map(a=>`<option value="${historySearchEscape(a.id)}">${historySearchEscape(a.alias||a.name||a.address||'Properti')}</option>`).join('');sel.value=active?.assetId||$('#contractAssetSelect').value||'';$('#leaseDataSearchInput').value='';$('#leaseDataSearchResults').innerHTML='<div class="muted">Ketik minimal 2 karakter. Pencarian mencakup data properti, sertifikat, bangunan, PBB, Akta Sewa, Klausul Penting, catatan, dan seluruh riwayat Akta.</div>';$('#leaseDataSearchDlg').showModal();setTimeout(()=>$('#leaseDataSearchInput').focus(),50)}
async function runLeaseDataSearch(){let q=$('#leaseDataSearchInput').value.trim().toLowerCase(),assetId=$('#leaseDataSearchAsset').value,box=$('#leaseDataSearchResults');if(q.length<2){box.innerHTML='<div class="muted">Ketik minimal 2 karakter.</div>';return}box.innerHTML='<div class="muted">Mencari data properti dan seluruh Akta…</div>';try{let [ar,lr,br,pr,cr,hr]=await Promise.all([sb.from('assets').select('*'),sb.from('land_titles').select('*'),sb.from('buildings').select('*'),sb.from('pbb_records').select('*'),sb.from('contracts').select('*'),fetchAllDocumentHistory()]);for(let r of [ar,lr,br,pr,cr])if(r.error)throw r.error;let groups=[['Properti',ar.data||[]],['Sertifikat',lr.data||[]],['Bangunan',br.data||[]],['PBB',pr.data||[]],['Akta Sewa',cr.data||[]],['Riwayat Akta/Klausul',hr||[]]],hits=[];for(let [type,rows] of groups)for(let row of rows){if(assetId&&String(leaseSearchAssetId(row,type))!==String(assetId))continue;if(JSON.stringify(row||{}).toLowerCase().includes(q))hits.push({type,row})}let shown=hits.slice(0,200);box.innerHTML=`<div class="history-search-summary"><b>${hits.length} hasil</b>${assetId?' pada '+historySearchEscape(assets.find(a=>String(a.id)===String(assetId))?.alias||'properti terpilih'):' pada semua properti'}${hits.length>200?' · menampilkan 200 teratas':''}</div>`+(shown.length?shown.map(h=>`<div class="lease-data-hit"><div class="history-search-head"><div><span class="lease-data-source">${historySearchEscape(h.type).toUpperCase()}</span><br><b>${historySearchEscape(leaseSearchTitle(h.row,h.type))}</b></div></div><div class="history-search-snippet">${leaseSearchSnippet(h.type==='Riwayat Akta/Klausul'?h.row.snapshot:h.row,q)}</div></div>`).join(''):'<div class="muted">Data yang dicari tidak ditemukan.</div>')}catch(e){box.innerHTML=`<div class="compare-warning">Pencarian gagal: ${historySearchEscape(e.message)}</div>`}}
(()=>{const btn=$('#leaseDataSearchBtn'),close=$('#leaseDataSearchClose'),input=$('#leaseDataSearchInput'),asset=$('#leaseDataSearchAsset');if(btn)btn.onclick=openLeaseDataSearch;if(close)close.onclick=()=>$('#leaseDataSearchDlg')?.close();if(input)input.addEventListener('input',()=>{clearTimeout(window.__lds);window.__lds=setTimeout(runLeaseDataSearch,220)});if(asset)asset.addEventListener('change',()=>{if(input?.value.trim().length>=2)runLeaseDataSearch()})})();
async function getPropertyChildren(assetId){
  const [lt,b,pr,ag]=await Promise.all([
    sb.from('land_titles').select('*').eq('asset_id',assetId).order('created_at'),
    sb.from('buildings').select('*').eq('asset_id',assetId).order('created_at'),
    sb.from('property_permits').select('*').eq('asset_id',assetId).order('created_at'),
    sb.from('property_agent_agreements').select('*').eq('asset_id',assetId).order('created_at')
  ]);
  if(lt.error)throw lt.error;if(b.error)throw b.error;if(pr.error)throw pr.error;if(ag.error)throw ag.error;
  return{landTitles:lt.data||[],buildings:b.data||[],permits:pr.data||[],agents:ag.data||[]}
}
async function propertyCounts(assetId){
  const [lt,b]=await Promise.all([
    sb.from('land_titles').select('id',{count:'exact',head:true}).eq('asset_id',assetId),
    sb.from('buildings').select('id',{count:'exact',head:true}).eq('asset_id',assetId)
  ]);
  return{lands:lt.count||0,buildings:b.count||0}
}
function openAssetList(){showMasterPage('assetPage');renderAssetCards()}window.openAssetList=openAssetList;
function assetSearchText(a){return [a.alias,a.name,a.address,a.area,a.notes].filter(Boolean).join(' ').toLowerCase()}
async function renderAssetCards(){
  const box=$('#assetCards'); if(!box)return;
  const q=String($('#assetSearch')?.value||'').trim().toLowerCase();
  const filtered=assets.map((a,i)=>({a,i})).filter(x=>!q||assetSearchText(x.a).includes(q));
  if($('#assetSearchCount'))$('#assetSearchCount').textContent=`${filtered.length} dari ${assets.length} Properti`;
  if(!filtered.length){box.innerHTML=`<div class="asset-empty">${assets.length?'Tidak ada properti yang cocok dengan pencarian.':'Belum ada properti/lokasi.'}</div>`;return}
  box.innerHTML='<div class="muted">Memuat struktur properti…</div>';
  const counts=await Promise.all(filtered.map(x=>propertyCounts(x.a.id).catch(()=>({lands:0,buildings:0}))));
  box.innerHTML=filtered.map((x,j)=>{let a=x.a,i=x.i;return `<div class="asset-master-card"><div class="property-label">PROPERTI / LOKASI</div>${a.alias?`<h3 class="asset-alias">${a.alias}</h3><div class="asset-official-name">${a.name||'-'}</div>`:`<h3>${a.name||'-'}</h3>`}<div class="asset-address">${a.address||'-'}</div><div class="property-counts"><span class="approved-land">${counts[j].lands} sertifikat tanah</span><span class="approved-building">${counts[j].buildings} bangunan</span></div><div class="asset-master-actions"><button type="button" class="asset-open-approved v11978-edit" aria-label="Buka Properti" onclick="openAssetEdit(${i})"><span aria-hidden="true">✎</span></button>${a.googleMapsUrl?`<button type="button" class="secondary asset-map-approved v11978-open" aria-label="Buka Google Maps" onclick="window.open('${a.googleMapsUrl}','_blank','noopener,noreferrer')"><span aria-hidden="true">↗</span></button>`:''}${currentRole==='administrator'?`<button type="button" class="secondary danger-action asset-delete-approved v11978-delete" aria-label="Hapus Properti" onclick="deletePropertySafe('${a.id}')"><span aria-hidden="true">🗑️</span></button>`:''}</div></div>`}).join('')
}
function assetDetailNodeText(el){let parts=[el.innerText||''];el.querySelectorAll('input,textarea,select').forEach(x=>{parts.push(x.value||'');if(x.tagName==='SELECT')parts.push(x.options[x.selectedIndex]?.text||'')});return parts.join(' ').toLowerCase()}
function runAssetDetailSearch(){
  const root=$('#assetDlg'),input=$('#assetDetailSearch'),count=$('#assetDetailSearchCount'),related=$('#assetDetailRelatedResults');if(!root||!input)return;
  const q=input.value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);let shown=0,total=0;
  const matches=t=>!terms.length||terms.every(k=>t.includes(k));
  root.querySelectorAll('#assetForm > .grid > label, #assetForm > .master-section, #assetForm > label').forEach(el=>{total++;let ok=matches(assetDetailNodeText(el));el.classList.toggle('asset-search-hidden',!ok);if(ok)shown++});
  let rel=[];const a=assetEdit>=0?assets[assetEdit]:null;
  if(a&&terms.length){
    data.forEach((x,i)=>{if(String(x.assetId||'')===String(a.id)&&matches(JSON.stringify(x).toLowerCase()))rel.push(`<div class="asset-related-hit"><b>📄 Akta Sewa · ${x.tenant||'-'}</b><span>Akta ${x.deedNo||'-'} · ${x.start||'-'} s/d ${x.end||'-'}</span><button type="button" class="secondary" onclick="openEdit(${i})">Buka Akta</button></div>`)});
    pbbData.forEach((x,i)=>{let linked=[x.property_alias,x.object_address].filter(Boolean).join(' ').toLowerCase();let belongs=String(x.asset_id||'')===String(a.id)||(a.alias&&linked.includes(String(a.alias).toLowerCase()))||(a.name&&linked.includes(String(a.name).toLowerCase()));if(belongs&&matches(JSON.stringify(x).toLowerCase()))rel.push(`<div class="asset-related-hit"><b>🧾 PBB · ${x.nop||'-'}</b><span>Tahun ${x.tax_year||'-'} · ${x.payment_status==='lunas'?'Sudah Bayar':'Belum Bayar'}</span><button type="button" class="secondary" onclick="openPbbEdit(${i})">Buka PBB</button></div>`)});
  }
  related.innerHTML=rel.length?`<h3>Hasil terkait lokasi ini</h3>${rel.join('')}`:'';related.hidden=!rel.length;
  if(count)count.textContent=terms.length?`${shown} bagian cocok${rel.length?' · '+rel.length+' data terkait':''}`:'Semua data ditampilkan';
}
window.runAssetDetailSearch=runAssetDetailSearch;
async function openAssetEdit(i=-1){
  assetEdit=i;let a=i>=0?assets[i]:{};
  $('#assetForm').reset();$('#assetLandTitles').innerHTML='';$('#assetBuildings').innerHTML='';$('#assetPermits').innerHTML='';$('#assetAgents').innerHTML='';
  for(let e of $('#assetForm').elements)if(e.name&&a[e.name]!=null)e.value=a[e.name];
  if(a.id)try{
    const c=await getPropertyChildren(a.id);
    c.landTitles.forEach(v=>addRepeat('assetLandTitles',{rightType:v.right_type,certificateNo:v.certificate_no,landArea:v.land_area,validUntil:v.valid_until,address:v.address,driveUrl:v.drive_url,mapPlanUrl:v.map_plan_url,mapsUrl:v.google_maps_url,holderName:v.holder_name,surveyNo:v.survey_no,surveyDate:v.survey_date,notes:v.notes},'landtitle'));
    c.buildings.forEach(v=>addRepeat('assetBuildings',{name:v.name,buildingType:v.building_type,buildingArea:v.building_area,address:v.address,driveUrl:v.drive_url,floorPlanUrl:v.floor_plan_url,mapsUrl:v.google_maps_url,notes:v.notes},'building'));
    (c.permits||[]).forEach(v=>addRepeat('assetPermits',{category:v.category,documentType:v.document_type,documentNo:v.document_no,issuer:v.issuer,holder:v.holder,issueDate:v.issue_date,validFrom:v.valid_from,validUntil:v.valid_until,status:v.status,relatedObject:v.related_object,driveUrl:v.drive_url,notes:v.notes},'permit'));
    (c.agents||[]).forEach(v=>addRepeat('assetAgents',{agencyName:v.agency_name,brokerName:v.broker_name,businessLicenseNo:v.business_license_no,competencyNo:v.competency_no,agreementNo:v.agreement_no,agreementDate:v.agreement_date,startDate:v.start_date,endDate:v.end_date,transactionType:v.transaction_type,exclusivity:v.exclusivity,transactionValue:v.transaction_value,commissionPct:v.commission_pct,commissionAmount:v.commission_amount,commissionPayer:v.commission_payer,commissionStatus:v.commission_status,commissionPaidDate:v.commission_paid_date,paymentTerms:v.payment_terms,importantClauses:v.important_clauses,driveUrl:v.drive_url,paymentProofUrl:v.payment_proof_url},'agent'));
    let firstLand=$('#assetLandTitles .landtitle');if(firstLand&&isAutoLandPropertyName($('#assetForm').elements.namedItem('name')?.value))syncAutoLandPropertyName(firstLand,true);
  }catch(e){alert('Gagal membaca detail properti: '+e.message)}
  $('#assetPage').hidden=true;$('#assetDlg').hidden=false;document.body.classList.add('asset-detail-open');$('#assetDetailTitle').textContent=a.alias||a.name||'Properti / Lokasi';$('#assetDetailSearch').value='';runAssetDetailSearch();lockViewerDialog($('#assetDlg'));window.scrollTo({top:0,behavior:'smooth'})
}window.openAssetEdit=openAssetEdit;
async function replacePropertyChildren(table,assetId,rows,mapper){
  let del=await sb.from(table).delete().eq('asset_id',assetId);if(del.error)throw del.error;
  if(!rows.length)return;
  let ins=await sb.from(table).insert(rows.map(r=>({user_id:(dataOwnerId||currentUser.id),asset_id:assetId,...mapper(r)})));if(ins.error)throw ins.error
}
$('#assetsBtn').onclick=openAssetList;$('#assetBack').onclick=showDashboard;$('#newAssetBtn').onclick=()=>openAssetEdit(-1);$('#assetSearch').addEventListener('input',renderAssetCards);function closeAssetDetailPage(){if($('#assetDlg'))$('#assetDlg').hidden=true;document.body.classList.remove('asset-detail-open');openAssetList()}$('#assetCancel').onclick=closeAssetDetailPage;$('#assetDetailBack').onclick=closeAssetDetailPage;$('#assetDetailSearch').addEventListener('input',runAssetDetailSearch);
$('#assetAddLandTitle').onclick=()=>addRepeat('assetLandTitles',{},'landtitle');
$('#assetAddBuilding').onclick=()=>addRepeat('assetBuildings',{},'building');
$('#assetAddPermit').onclick=()=>addRepeat('assetPermits',{},'permit');
$('#assetAddAgent').onclick=()=>addRepeat('assetAgents',{},'agent');
$('#assetAddPbb').onclick=async()=>{if(assetEdit<0||!assets[assetEdit]?.id)return alert('Simpan Properti terlebih dahulu sebelum menambahkan PBB.');window.pbbPropertyAssetId=assets[assetEdit].id;await openPbbEdit(-1,assets[assetEdit].id)};
$('#assetOpenMaps').onclick=()=>{let u=$('#assetForm').querySelector('[name="googleMapsUrl"]').value.trim();if(u)window.open(u,'_blank','noopener,noreferrer')};
$('#assetForm').onsubmit=async e=>{
  e.preventDefault();let x=Object.fromEntries(new FormData(e.target));
  let lands=collect('#assetLandTitles .landtitle',['rightType','certificateNo','landArea','validUntil','address','driveUrl','mapPlanUrl','mapsUrl','holderName','surveyNo','surveyDate','notes']);
  let buildings=collect('#assetBuildings .building',['name','buildingType','buildingArea','address','driveUrl','floorPlanUrl','mapsUrl','notes']);
  let permits=collect('#assetPermits .permit',['category','documentType','documentNo','issuer','holder','issueDate','validFrom','validUntil','status','relatedObject','driveUrl','notes']);
  let agents=collect('#assetAgents .agent',['agencyName','brokerName','businessLicenseNo','competencyNo','agreementNo','agreementDate','startDate','endDate','transactionType','exclusivity','transactionValue','commissionPct','commissionAmount','commissionPayer','commissionStatus','commissionPaidDate','paymentTerms','importantClauses','driveUrl','paymentProofUrl']);
  let row={user_id:(dataOwnerId||currentUser.id),alias:x.alias||'',name:x.name||'',address:x.address||'',area:x.area||'',google_maps_url:x.googleMapsUrl||'',notes:x.notes||'',updated_at:new Date().toISOString()};
  if(assetEdit>=0&&assets[assetEdit]?.id){let existing=await historyRows('land',assets[assetEdit].id);if(!existing.length)await captureAssetLandVersion(assets[assetEdit].id,'Versi sertifikat sebelum perubahan')}let r=assetEdit>=0?await sb.from('assets').update(row).eq('id',assets[assetEdit].id).select().single():await sb.from('assets').insert(row).select().single();
  if(r.error)return alert('Gagal menyimpan properti: '+r.error.message);
  try{
    let id=r.data.id;
    await replacePropertyChildren('land_titles',id,lands,v=>({right_type:v.rightType,certificate_no:v.certificateNo,land_area:v.landArea?Number(v.landArea):null,valid_until:idToISO(v.validUntil)||null,address:v.address,drive_url:v.driveUrl,map_plan_url:v.mapPlanUrl,google_maps_url:v.mapsUrl,holder_name:v.holderName||'',survey_no:v.surveyNo||'',survey_date:idToISO(v.surveyDate)||null,notes:v.notes}));
    await replacePropertyChildren('buildings',id,buildings,v=>({name:v.name,building_type:v.buildingType,building_area:v.buildingArea?Number(v.buildingArea):null,address:v.address,drive_url:v.driveUrl,floor_plan_url:v.floorPlanUrl,google_maps_url:v.mapsUrl,notes:v.notes}));
    await replacePropertyChildren('property_permits',id,permits,v=>({category:v.category||'Lainnya',document_type:v.documentType||'',document_no:v.documentNo||'',issuer:v.issuer||'',holder:v.holder||'',issue_date:idToISO(v.issueDate)||null,valid_from:idToISO(v.validFrom)||null,valid_until:idToISO(v.validUntil)||null,status:v.status||'Tidak Ditentukan',related_object:v.relatedObject||'',drive_url:v.driveUrl||'',notes:v.notes||''}));
    await replacePropertyChildren('property_agent_agreements',id,agents,v=>({agency_name:v.agencyName||'',broker_name:v.brokerName||'',business_license_no:v.businessLicenseNo||'',competency_no:v.competencyNo||'',agreement_no:v.agreementNo||'',agreement_date:idToISO(v.agreementDate)||null,start_date:idToISO(v.startDate)||null,end_date:idToISO(v.endDate)||null,transaction_type:v.transactionType||'',exclusivity:v.exclusivity||'Tidak ditentukan',transaction_value:parseMoney(v.transactionValue)||null,commission_pct:v.commissionPct?Number(v.commissionPct):null,commission_amount:parseMoney(v.commissionAmount)||null,commission_payer:v.commissionPayer||'',commission_status:v.commissionStatus||'Belum Dibayar',commission_paid_date:idToISO(v.commissionPaidDate)||null,payment_terms:v.paymentTerms||'',important_clauses:v.importantClauses||'',drive_url:v.driveUrl||'',payment_proof_url:v.paymentProofUrl||''}));
    await captureAssetLandVersion(id,assetEdit>=0?'Perubahan sertifikat disimpan':'Sertifikat pertama disimpan');
    await loadData();closeAssetDetailPage()
  }catch(err){alert('Properti tersimpan, tetapi detail tanah/bangunan gagal: '+err.message)}
};

async function deletePbbRecord(id){
 if(currentRole!=='administrator')return alert('Hanya Administrator yang dapat menghapus PBB.');
 let rec=pbbData.find(x=>String(x.id)===String(id));if(!rec)return alert('Data PBB tidak ditemukan.');
 let label=`SPPT ${rec.tax_year||'-'} · NOP ${rec.nop||'-'}${rec.pbb_payable!=null?' · '+pbbMoney(rec.pbb_payable):''}`;
 if(!confirm(`Hapus ${label}?\n\nHanya record SPPT ini yang dihapus. Properti, sertifikat, Akta Sewa, dan SPPT tahun lain tidak ikut dihapus.`))return;
 try{
  for(const t of ['lease_pbb','pbb_buildings','pbb_land_titles']){let q=await sb.from(t).delete().eq('pbb_id',id);if(q.error)throw q.error}
  let q=await sb.from('pbb_records').delete().eq('id',id).select('id');if(q.error)throw q.error;
  await loadPbbData();renderPbbMaster();alert('SPPT berhasil dihapus.');
 }catch(e){alert('Gagal menghapus SPPT: '+e.message)}
}window.deletePbbRecord=deletePbbRecord;

async function deleteLeaseContract(id){
 if(currentRole!=='administrator')return alert('Hanya Administrator yang dapat menghapus Akta Sewa.');
 let x=data.find(v=>String(v.id)===String(id));if(!x)return alert('Akta Sewa tidak ditemukan.');
 if(!confirm(`Hapus Akta Sewa ${x.deedNo||'-'} · ${x.tenant||'-'}?\n\nDokumen historis dan relasi yang hanya milik Akta ini ikut dihapus. Properti, PBB, dan Sertifikat Tanah sumber tidak dihapus.`))return;
 try{
  for(const t of ['lease_documents','document_history','lease_facilities','lease_pbb','lease_buildings','lease_land_titles']){let q=await (t==='document_history'?sb.from(t).delete().eq('entity_type','lease').eq('entity_id',id):sb.from(t).delete().eq('contract_id',id));if(q.error)throw q.error}
  let q=await sb.from('contracts').delete().eq('id',id).select('id');if(q.error)throw q.error;
  await loadData();openLeaseList();alert('Akta Sewa berhasil dihapus.');
 }catch(e){alert('Gagal menghapus Akta Sewa: '+e.message)}
}window.deleteLeaseContract=deleteLeaseContract;

function propertyDeleteErrorText(e){
 if(!e)return 'Kesalahan tidak diketahui.';
 if(typeof e==='string')return e;
 return [e.message,e.details,e.hint,e.code].filter(Boolean).join(' | ')||JSON.stringify(e)||'Kesalahan tidak diketahui.';
}
async function deletePropertySafe(id){
 if(currentRole!=='administrator')return alert('Hanya Administrator yang dapat menghapus Property Master.');
 let a=assets.find(v=>String(v.id)===String(id));if(!a)return alert('Properti tidak ditemukan.');
 try{
  // Gunakan hanya kolom relasi yang benar-benar ada pada schema aktif. pbb_records memakai asset_id; property_id tidak ada.
  const checks=[
   ['Akta Sewa','contracts','asset_id'],
   ['PBB/SPPT','pbb_records','asset_id'],
   ['Sertifikat Tanah','land_titles','asset_id'],
   ['Bangunan','buildings','asset_id'],
   ['Perizinan & Legalitas','property_permits','asset_id'],
   ['Perjanjian Agen','property_agent_agreements','asset_id']
  ];
  const deps=[];
  for(const [label,table,column] of checks){
   const r=await sb.from(table).select('id',{count:'exact',head:true}).eq(column,id);
   if(r.error)throw new Error(`${label}: ${propertyDeleteErrorText(r.error)}`);
   deps.push([label,r.count||0]);
  }
  const used=deps.filter(([,n])=>n>0);
  if(used.length){
   return alert(`Properti/Lokasi “${a.alias||a.name||'-'}” tidak dapat dihapus karena masih memiliki data terkait:\n\n${used.map(([label,n])=>`• ${n} ${label}`).join('\n')}\n\nLepaskan atau pindahkan relasi tersebut terlebih dahulu. Tidak ada data yang dihapus.`);
  }
  if(!confirm(`Hapus Properti/Lokasi “${a.alias||a.name||'-'}”?\n\nProperti ini sudah diperiksa dan tidak mempunyai data terkait pada Akta Sewa, PBB/SPPT, Sertifikat Tanah, Bangunan, Perizinan/Legalitas, atau Perjanjian Agen.\n\nTindakan ini tidak dapat dikembalikan.`))return;
  const q=await sb.from('assets').delete().eq('id',id).select('id');
  if(q.error)throw new Error(propertyDeleteErrorText(q.error));
  if(!q.data?.length)throw new Error('Record tidak terhapus. Periksa hak akses/RLS Administrator atau apakah record masih ada.');
  await loadData();openAssetList();alert('Properti/Lokasi berhasil dihapus.');
 }catch(e){
  console.error('deletePropertySafe',e);
  alert('Gagal memeriksa/menghapus Properti/Lokasi:\n\n'+propertyDeleteErrorText(e));
 }
}window.deletePropertySafe=deletePropertySafe;

async function loadPbbData(){let r=await sb.from('pbb_records').select('*').order('tax_year',{ascending:false});if(r.error)throw r.error;pbbData=(r.data||[]).map(v=>normalizeAIObject(v))}
function pbbMoney(v){return moneyDisplay(v)||'Rp 0,00'}
function pbbArea(v){return numberID(v)||'0,00'}
function normalizeNop(v=''){return String(v||'').toUpperCase().replace(/[^0-9A-Z]/g,'')}
function pbbSortKey(r){let a=String(r?.property_alias||'').trim();return {hasAlias:!!a,alias:a,nop:normalizeNop(r?.nop)||String(r?.nop||'')}}
function comparePbbMaster(a,b){let x=pbbSortKey(a),y=pbbSortKey(b);if(x.hasAlias!==y.hasAlias)return x.hasAlias?-1:1;if(x.hasAlias){let c=x.alias.localeCompare(y.alias,'id',{sensitivity:'base',numeric:true});if(c)return c}return x.nop.localeCompare(y.nop,'id',{numeric:true})}
function comparePbbRows(a,b){let c=comparePbbMaster(a,b);return c||((Number(b.tax_year)||0)-(Number(a.tax_year)||0))}
function pbbGroups(){let m=new Map();pbbData.forEach((r,i)=>{let k=normalizeNop(r.nop)||`NO-NOP-${r.id||i}`;if(!m.has(k))m.set(k,[]);m.get(k).push({...r,_index:i})});return [...m.values()].map(rows=>rows.sort((a,b)=>(Number(b.tax_year)||0)-(Number(a.tax_year)||0)||(String(b.created_at||'').localeCompare(String(a.created_at||''))))).sort((a,b)=>comparePbbMaster(a[0]||{},b[0]||{}))}
function currentPbbRows(){return pbbGroups().map(g=>g[0]).filter(Boolean)}
function pbbStatusText(r){return r.payment_status==='lunas'?`Lunas${r.paid_date?' · dibayar '+isoToID(r.paid_date):''}`:`Belum Bayar${r.due_date?' · jatuh tempo '+isoToID(r.due_date):''}`}
function pbbHistoryRow(r,isCurrent=false){return `<div class="pbb-history-row"><div><b>${r.tax_year||'-'}</b>${isCurrent?' <span class="pill">AKTIF</span>':''}<div class="muted">${pbbStatusText(r)} · ${pbbMoney(r.pbb_payable??r.pbb_due)}</div></div><div class="asset-master-actions"><button type="button" class="secondary" onclick="openPbbEdit(${r._index})">${currentRole==='viewer'?'Buka':'Edit'}</button>${r.drive_sppt_url?`<button type="button" class="secondary" onclick="window.open('${r.drive_sppt_url}','_blank','noopener,noreferrer')">📄 SPPT</button>`:''}${r.drive_payment_url?`<button type="button" class="secondary" onclick="window.open('${r.drive_payment_url}','_blank','noopener,noreferrer')">🧾 Bukti Bayar</button>`:''}${currentRole==='administrator'?`<button type="button" class="secondary danger-action" onclick="deletePbbRecord('${r.id}')"><span aria-hidden="true">🗑️</span></button>`:''}</div></div>`}
function pbbSearchText(g){let r=g[0]||{};let assetNames=[];try{let ids=new Set(g.flatMap(x=>[x.asset_id,x.property_id].filter(Boolean)));assetNames=assets.filter(a=>ids.has(a.id)).flatMap(a=>[a.alias,a.name,a.address])}catch(e){}return [r.property_alias,r.nop,r.taxpayer_name,r.object_address,...g.flatMap(x=>[x.property_alias,x.nop,x.taxpayer_name,x.object_address,x.tax_year]),...assetNames].filter(Boolean).join(' ').toLowerCase()}
function renderPbbMaster(){let q=($('#pbbSearch')?.value||'').trim().toLowerCase(),groups=pbbGroups();let shown=q?groups.filter(g=>pbbSearchText(g).includes(q)):groups;let count=$('#pbbSearchCount');if(count)count.textContent=`${shown.length} dari ${groups.length} NOP`;$('#pbbCards').innerHTML=shown.length?shown.map(g=>{let r=g[0],hist=g.slice(1);return `<div class="asset-master-card pbb-nop-card"><div class="pbb-current-head"><div>${r.property_alias?`<h3 class="asset-alias">${r.property_alias}</h3>`:''}<div class="muted">NOP</div><h3>${r.nop||'-'}</h3></div><span class="pill">${r.tax_year||'-'} AKTIF</span></div><div class="pbb-master-identity"><div><span class="muted">Nama Wajib Pajak</span><b>${r.taxpayer_name||'-'}</b></div><div><span class="muted">Alamat Objek Pajak</span><b>${r.object_address||'-'}</b></div></div><div class="muted">Tanah ${pbbArea(r.land_area)} m² · Bangunan ${pbbArea(r.building_area)} m² · Total NJOP ${pbbMoney(r.njop_total)}</div><div><b>${pbbMoney(r.pbb_payable??r.pbb_due)}</b> · ${pbbStatusText(r)}</div><div class="asset-master-actions pbb-card-actions"><button type="button" class="pbb-open-approved v11978-edit" aria-label="${currentRole==='viewer'?'Buka PBB Aktif':'Buka / Edit PBB Aktif'}" onclick="openPbbEdit(${r._index})"><span aria-hidden="true">✎</span></button>${r.drive_sppt_url?`<button type="button" class="secondary pbb-sppt-approved" aria-label="Buka SPPT ${r.tax_year||''}" onclick="window.open('${r.drive_sppt_url}','_blank','noopener,noreferrer')">SPPT ${r.tax_year||''}</button>`:''}</div>${hist.length?`<details class="pbb-history"><summary>Riwayat SPPT (${hist.length} dokumen)</summary>${hist.map(x=>pbbHistoryRow(x)).join('')}</details>`:'<div class="muted pbb-no-history">Belum ada SPPT tahun sebelumnya untuk NOP ini.</div>'}</div>`}).join(''):'<div class="muted pbb-empty">Tidak ada data PBB yang sesuai pencarian.</div>'}
function showMasterPage(id){$('#appShell main').hidden=true;$('#pbbPage').hidden=id!=='pbbPage';$('#leasePage').hidden=id!=='leasePage';$('#assetPage').hidden=id!=='assetPage';window.scrollTo({top:0,behavior:'smooth'})}
function showDashboard(){if($('#pbbPage'))$('#pbbPage').hidden=true;if($('#leasePage'))$('#leasePage').hidden=true;if($('#assetPage'))$('#assetPage').hidden=true;$('#appShell main').hidden=false;window.scrollTo({top:0,behavior:'smooth'})}
function openLeaseList(){showMasterPage('leasePage');render()}window.openLeaseList=openLeaseList;
async function openPbbList(){showMasterPage('pbbPage');try{await loadPbbData();renderPbbMaster()}catch(err){console.error(err);$('#pbbCards').innerHTML=`<div class="pbb-empty"><b>Data PBB belum dapat dimuat.</b><div class="muted">${err?.message||err}</div></div>`}}window.openPbbList=openPbbList;
async function openPbbEdit(i=-1,assetId=null){pendingPbbHistory=[];pbbEdit=i;let r=i>=0?pbbData[i]:{};if(i>=0&&!r.property_alias){let sibling=pbbData.find(v=>normalizeNop(v.nop)===normalizeNop(r.nop)&&v.property_alias);if(sibling)r={...r,property_alias:sibling.property_alias}}$('#pbbForm').reset();let map={propertyAlias:'property_alias',taxpayerName:'taxpayer_name',objectAddress:'object_address',taxYear:'tax_year',landArea:'land_area',buildingArea:'building_area',landNjopM2:'njop_land_per_m2',landNjopTotal:'njop_land_total',buildingNjopM2:'njop_building_per_m2',buildingNjopTotal:'njop_building_total',totalNjop:'njop_total',taxDue:'pbb_due',payableAmount:'pbb_payable',dueDate:'due_date',paymentStatus:'payment_status',paidDate:'paid_date',spptUrl:'drive_sppt_url',paymentProofUrl:'drive_payment_url',googleMapsUrl:'google_maps_url',warningIgnored:'warning_ignored',warningIgnoreReason:'warning_ignore_reason'};for(let e of $('#pbbForm').elements)if(e.name){let key=map[e.name]||e.name,v=r[key];if(e.type==='checkbox')e.checked=!!v;else if(v!=null){if(e.classList.contains('money-input'))e.value=moneyDisplay(v);else if(e.classList.contains('area-input'))e.value=numberID(v);else if(e.name==='dueDate'||e.name==='paidDate')e.value=isoToID(v);else e.value=v}}
  syncPbbPaymentFields();let lq=sb.from('land_titles').select('*').order('certificate_no'),bq=sb.from('buildings').select('*').order('name');if(assetId){lq=lq.eq('asset_id',assetId);bq=bq.eq('asset_id',assetId)}let l=await lq,b=await bq,landLinks=[],bi=[];
  if(r.id){let [lr,br]=await Promise.all([sb.from('pbb_land_titles').select('land_title_id,coverage_type,covered_area,coverage_notes').eq('pbb_id',r.id),sb.from('pbb_buildings').select('building_id').eq('pbb_id',r.id)]);landLinks=lr.data||[];bi=(br.data||[]).map(x=>x.building_id)}
  await renderPbbLandRelations(l.data||[],landLinks,r.id||null);$('#pbbBuildingChoices').innerHTML=checkListHtml(b.data||[],'building',bi);renderPbbNopHistory();$('#pbbEditDlg').showModal();lockViewerDialog($('#pbbEditDlg'))
}window.openPbbEdit=openPbbEdit;

function escHtml(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function renderPbbLandRelations(titles,links,currentPbbId){
 const box=$('#pbbLandChoices');if(!box)return;const lm=new Map((links||[]).map(x=>[String(x.land_title_id),x]));
 let usage={};if(titles.length){let ids=titles.map(x=>x.id),q=await sb.from('pbb_land_titles').select('pbb_id,land_title_id,coverage_type,covered_area,pbb_records(nop,tax_year)').in('land_title_id',ids);if(!q.error)(q.data||[]).forEach(x=>{if(String(x.pbb_id)===String(currentPbbId))return;(usage[String(x.land_title_id)]??=[]).push(x)})}
 box.innerHTML=titles.length?titles.map(t=>{let z=lm.get(String(t.id))||{},sel=!!lm.get(String(t.id)),others=usage[String(t.id)]||[],sum=others.reduce((a,x)=>a+(Number(x.covered_area)||0),0);let otherText=others.length?`${others.length} relasi PBB lain${sum?' · luas tercatat '+numberID(sum)+' m²':''}`:'Belum terkait NOP lain';return `<div class="pbb-land-card ${sel?'selected':''}" data-land-id="${t.id}" data-title-area="${Number(t.land_area)||0}" data-other-area="${sum}"><div class="pbb-land-head"><input class="pbb-land-check" type="checkbox" ${sel?'checked':''}><div><div class="pbb-land-title">${escHtml(t.right_type||'Hak Tanah')} No. ${escHtml(t.certificate_no||'(tanpa nomor)')}</div><div class="pbb-land-meta">Luas sertifikat: <b>${numberID(t.land_area||0)} m²</b>${t.address?' · '+escHtml(t.address):''}</div><div class="pbb-coverage-ok">${escHtml(otherText)}</div></div></div><div class="pbb-land-detail"><label>Jenis cakupan<select class="coverage-type"><option value="unknown">Belum diketahui</option><option value="full">Seluruh sertifikat</option><option value="partial">Sebagian sertifikat</option></select></label><label>Luas yang dicakup PBB ini (m²)<input class="covered-area area-input" inputmode="decimal" placeholder="Kosong jika tidak diketahui" value="${z.covered_area!=null?numberID(z.covered_area):''}"></label><label>Keterangan<input class="coverage-notes" placeholder="contoh: sisi timur / sesuai peta PBB / luas belum diketahui" value="${escHtml(z.coverage_notes||'')}"></label></div></div>`}).join(''):'<div class="muted">Belum ada data sertifikat tanah.</div>';
 box.querySelectorAll('.pbb-land-card').forEach(card=>{let chk=card.querySelector('.pbb-land-check'),type=card.querySelector('.coverage-type'),area=card.querySelector('.covered-area');let z=lm.get(String(card.dataset.landId))||{};type.value=z.coverage_type||'unknown';chk.addEventListener('change',()=>{card.classList.toggle('selected',chk.checked);validatePbbLandCoverage()});type.addEventListener('change',()=>{if(type.value==='full'&&!area.value)area.value=numberID(Number(card.dataset.titleArea)||0);validatePbbLandCoverage()});area.addEventListener('input',validatePbbLandCoverage)});validatePbbLandCoverage()
}
function collectPbbLandRelations(){return [...document.querySelectorAll('#pbbLandChoices .pbb-land-card')].filter(c=>c.querySelector('.pbb-land-check')?.checked).map(c=>({land_title_id:c.dataset.landId,coverage_type:c.querySelector('.coverage-type')?.value||'unknown',covered_area:c.querySelector('.covered-area')?.value?parseMoney(c.querySelector('.covered-area').value):null,coverage_notes:c.querySelector('.coverage-notes')?.value?.trim()||''}))}
async function replacePbbLandRelations(pbbId,rels){let d=await sb.from('pbb_land_titles').delete().eq('pbb_id',pbbId);if(d.error)throw d.error;if(rels.length){let i=await sb.from('pbb_land_titles').insert(rels.map(x=>({user_id:(dataOwnerId||currentUser.id),pbb_id:pbbId,...x})));if(i.error)throw i.error}}
async function validatePbbLandCoverage(){let warn=$('#pbbLandCoverageWarning');if(!warn)return;let problems=[];for(let c of document.querySelectorAll('#pbbLandChoices .pbb-land-card.selected')){let titleArea=Number(c.dataset.titleArea)||0,own=parseMoney(c.querySelector('.covered-area')?.value||0)||0;let other=Number(c.dataset.otherArea)||0;if(titleArea&&own>titleArea+.01)problems.push(`${c.querySelector('.pbb-land-title')?.textContent}: luas PBB ini melebihi luas sertifikat.`);if(titleArea&&own&&other&&own+other>titleArea+.01)problems.push(`${c.querySelector('.pbb-land-title')?.textContent}: total cakupan PBB tercatat ${numberID(own+other)} m² melebihi luas sertifikat ${numberID(titleArea)} m².`)}warn.hidden=!problems.length;warn.innerHTML=problems.map(x=>'⚠️ '+escHtml(x)).join('<br>')}

async function replacePbbLinks(table,pbbId,column,ids){let d=await sb.from(table).delete().eq('pbb_id',pbbId);if(d.error)throw d.error;if(ids.length){let i=await sb.from(table).insert(ids.map(id=>({user_id:(dataOwnerId||currentUser.id),pbb_id:pbbId,[column]:id})));if(i.error)throw i.error}}
function renderPbbNopHistory(){
  let box=$('#pbbNopHistoryList'),count=$('#pbbNopHistoryCount'),f=$('#pbbForm');if(!box||!f)return;
  let nop=(f.elements.namedItem('nop')?.value||'').trim(),nn=normalizeNop(nop);
  if(!nn){box.innerHTML='<div class="muted">Masukkan atau baca NOP untuk melihat histori.</div>';if(count)count.textContent='';return}
  let currentId=pbbEdit>=0?pbbData[pbbEdit]?.id:null;
  let rows=pbbData.filter(r=>normalizeNop(r.nop)===nn&&(!currentId||r.id!==currentId)).sort((a,b)=>Number(b.tax_year||0)-Number(a.tax_year||0));
  if(count)count.textContent=rows.length?`${rows.length} SPPT tersimpan`:'Belum ada histori';
  if(!rows.length){box.innerHTML='<div class="muted pbb-no-history">Belum ada SPPT tersimpan untuk NOP ini. Setelah SPPT pertama disimpan, tahun berikutnya akan tampil sebagai histori.</div>';return}
  box.innerHTML=rows.map((r,idx)=>`<div class="pbb-form-history-row"><div><b>${r.tax_year||'-'}</b> ${idx===0?'<span class="pill">TERBARU TERSIMPAN</span>':''}<div class="muted">${r.taxpayer_name||'-'} · ${r.object_address||'-'}</div></div><div><b>${pbbMoney(r.pbb_payable??r.pbb_due)}</b><div class="muted">Jatuh tempo ${isoToID(r.due_date)||'-'} · ${pbbStatusText(r)}${r.paid_date?` · Dibayar ${isoToID(r.paid_date)}`:''}</div><div class="muted">SPPT: ${r.drive_sppt_url?'sudah dilink':'belum dilink'} · Bukti bayar: ${r.drive_payment_url?'sudah dilink':'belum dilink'}</div></div><div class="pbb-form-history-actions"><button type="button" class="secondary" onclick="openStoredPbbFromHistory('${r.id}')">${currentRole==='viewer'?'Buka':'Buka / Edit Link'}</button>${r.drive_sppt_url?`<button type="button" class="secondary" onclick="window.open('${r.drive_sppt_url}','_blank','noopener,noreferrer')">📄 SPPT</button>`:''}${r.drive_payment_url?`<button type="button" class="secondary" onclick="window.open('${r.drive_payment_url}','_blank','noopener,noreferrer')">🧾 Bukti Bayar</button>`:''}</div></div>`).join('');
}
window.openStoredPbbFromHistory=function(id){let i=pbbData.findIndex(r=>String(r.id)===String(id));if(i<0)return;$('#pbbEditDlg').close();setTimeout(()=>openPbbEdit(i),0)};
function syncPbbPaymentFields(){let f=$('#pbbForm'),paid=f?.elements.namedItem('paidDate'),status=f?.elements.namedItem('paymentStatus');if(!paid||!status)return;paid.disabled=status.value!=='lunas';if(status.value!=='lunas')paid.value=''}
function printAllPbb(){
  if(!pbbData.length)return alert('Belum ada data PBB untuk dicetak.');
  let rows=[...pbbData].sort(comparePbbRows);
  let paid=r=>r.payment_status==='lunas'||r.payment_status==='sudah_bayar';
  let h=`<!doctype html><html><head><meta charset="utf-8"><title>Daftar PBB</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#111;margin:0;font-size:10px}h1{font-size:18px;margin:0 0 3px}.meta{color:#666;margin-bottom:10px}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #bbb;padding:5px 6px;vertical-align:top;overflow-wrap:anywhere}th{background:#f2f2f2;text-align:left;font-size:9px}td.num{text-align:right;white-space:nowrap}.alias{font-weight:700}.status{white-space:nowrap}.paid{font-weight:700}tr{break-inside:avoid}tfoot td{font-weight:700}@media print{button{display:none}}</style></head><body><h1>Daftar PBB / SPPT</h1><div class="meta">Dicetak ${new Date().toLocaleString('id-ID')} · ${rows.length} SPPT · ${new Set(rows.map(r=>normalizeNop(r.nop))).size} NOP</div><table><thead><tr><th style="width:12%">Alias / Properti</th><th style="width:13%">NOP</th><th style="width:5%">Tahun</th><th style="width:11%">Wajib Pajak</th><th style="width:21%">Alamat Objek Pajak</th><th style="width:8%">Luas Tanah</th><th style="width:9%">Total NJOP</th><th style="width:9%">PBB Dibayar</th><th style="width:7%">Status</th><th style="width:8%">Tgl Bayar</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="alias">${escHtml(r.property_alias||'-')}</td><td>${escHtml(r.nop||'-')}</td><td>${r.tax_year||'-'}</td><td>${escHtml(r.taxpayer_name||'-')}</td><td>${escHtml(r.object_address||'-')}</td><td class="num">${r.land_area!=null?numberID(r.land_area)+' m²':'-'}</td><td class="num">${r.njop_total!=null?pbbMoney(r.njop_total):'-'}</td><td class="num">${(r.pbb_payable??r.pbb_due)!=null?pbbMoney(r.pbb_payable??r.pbb_due):'-'}</td><td class="status ${paid(r)?'paid':''}">${paid(r)?'Lunas':'Belum Bayar'}</td><td>${paid(r)&&r.paid_date?isoToID(r.paid_date):'-'}</td></tr>`).join('')}</tbody></table><script>window.onload=()=>{window.print()}<\/script></body></html>`;
  let w=window.open('','_blank');if(!w)return alert('Popup print diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.');w.document.open();w.document.write(h);w.document.close();
}
window.printAllPbb=printAllPbb;

function pbbExportRows(){return [...pbbData].sort(comparePbbRows).map(r=>({
  'Alias / Nama Properti':r.property_alias||'', 'NOP':r.nop||'', 'Tahun PBB':r.tax_year||'', 'Nama Wajib Pajak':r.taxpayer_name||'', 'Alamat Objek Pajak':r.object_address||'',
  'Luas Tanah (m²)':r.land_area??'', 'Luas Bangunan (m²)':r.building_area??'', 'NJOP Tanah / m² (Rp)':r.njop_land_per_m2??'', 'Total NJOP Tanah (Rp)':r.njop_land_total??'',
  'NJOP Bangunan / m² (Rp)':r.njop_building_per_m2??'', 'Total NJOP Bangunan (Rp)':r.njop_building_total??'', 'Total NJOP (Rp)':r.njop_total??'', 'PBB Terutang (Rp)':r.pbb_due??'',
  'PBB Harus Dibayar (Rp)':r.pbb_payable??'', 'Status':(r.payment_status==='lunas'?'Sudah Bayar':'Belum Bayar'), 'Jatuh Tempo':isoToID(r.due_date)||'', 'Tanggal Pembayaran':isoToID(r.paid_date)||'',
  'Link Google Drive SPPT':r.drive_sppt_url||'', 'Link Google Drive Bukti Bayar':r.drive_payment_url||''
}))}
function makePbbWorkbook(){if(!window.XLSX)throw new Error('Modul Excel belum termuat. Pastikan koneksi internet aktif lalu reload halaman.');let rows=pbbExportRows();if(!rows.length)throw new Error('Belum ada data PBB untuk diekspor.');let ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=[24,23,10,24,45,16,18,20,22,24,25,20,20,24,16,16,18,42,42].map(w=>({wch:w}));let wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Rekap PBB');return wb}
function pbbExcelFilename(){let d=new Date(),pad=n=>String(n).padStart(2,'0');return `Rekap_PBB_${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}.xlsx`}
function exportAllPbbExcel(){try{XLSX.writeFile(makePbbWorkbook(),pbbExcelFilename(),{compression:true})}catch(e){alert('Gagal membuat Excel: '+(e.message||e))}}
async function uploadPbbExcelToDrive(){let btn=$('#saveAllPbbDriveBtn');try{btn.disabled=true;btn.textContent='☁️ Menyiapkan Excel…';if(!googleDriveToken&&!restoreDriveToken()){btn.textContent='🔗…';let ok=await connectDriveFromButton(btn);if(!ok)throw new Error('Google Drive belum terhubung.');}requireDriveToken();let wb=makePbbWorkbook(),bytes=XLSX.write(wb,{bookType:'xlsx',type:'array',compression:true}),name=pbbExcelFilename();let meta={name,mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};let fd=new FormData();fd.append('metadata',new Blob([JSON.stringify(meta)],{type:'application/json; charset=UTF-8'}));fd.append('file',new Blob([bytes],{type:meta.mimeType}),name);btn.textContent='☁️ Mengunggah ke Google Drive…';let r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{Authorization:`Bearer ${googleDriveToken}`},body:fd});if(r.status===401){clearStoredDriveToken();throw new Error('Sesi Google Drive berakhir. Hubungkan Google Drive kembali lalu ulangi.')}let out=await r.json().catch(()=>({}));if(!r.ok)throw new Error(out?.error?.message||`Upload Google Drive gagal (${r.status}).`);let link=out.webViewLink||`https://drive.google.com/open?id=${out.id}`;if(confirm(`Excel berhasil disimpan ke Google Drive sebagai ${out.name||name}.\n\nBuka file sekarang?`))window.open(link,'_blank','noopener,noreferrer')}catch(e){alert('Gagal menyimpan Excel ke Google Drive: '+(e.message||e))}finally{btn.disabled=false;btn.textContent='☁️ Simpan Excel ke Google Drive'}}
window.exportAllPbbExcel=exportAllPbbExcel;window.uploadPbbExcelToDrive=uploadPbbExcelToDrive;
$('#pbbBtn').onclick=openPbbList;$('#pbbBack').onclick=showDashboard;$('#leaseBtn').onclick=openLeaseList;$('#leaseListBack').onclick=showDashboard;$('#pbbSearch').addEventListener('input',renderPbbMaster);$('#printAllPbbBtn').onclick=printAllPbb;$('#exportAllPbbExcelBtn').onclick=exportAllPbbExcel;$('#saveAllPbbDriveBtn').onclick=uploadPbbExcelToDrive;$('#newPbbBtn').onclick=()=>openPbbEdit(-1);$('#pbbCancel').onclick=()=>{$('#pbbEditDlg').close();openPbbList()};$('#pbbForm').elements.namedItem('paymentStatus').addEventListener('change',syncPbbPaymentFields);$('#pbbForm').elements.namedItem('nop').addEventListener('input',renderPbbNopHistory);
['landNjopM2','landNjopTotal','buildingNjopM2','buildingNjopTotal','totalNjop','taxDue','payableAmount'].forEach(n=>bindMoneyInput($('#pbbForm').elements.namedItem(n)));['landArea','buildingArea'].forEach(n=>{let e=$('#pbbForm').elements.namedItem(n);e.addEventListener('focus',()=>{e.value=e.value?String(parseMoney(e.value)):'';setTimeout(()=>e.select(),0)});e.addEventListener('blur',()=>{e.value=numberID(e.value)})});
$('#pbbForm').onsubmit=async e=>{e.preventDefault();let x=Object.fromEntries(new FormData(e.target)),num=k=>x[k]?parseMoney(x[k]):null;let row={user_id:(dataOwnerId||currentUser.id),asset_id:(window.pbbPropertyAssetId||pbbData[pbbEdit]?.asset_id||null),property_alias:x.propertyAlias||'',nop:x.nop||'',taxpayer_name:x.taxpayerName||'',object_address:x.objectAddress||'',tax_year:x.taxYear?Number(x.taxYear):null,land_area:num('landArea'),building_area:num('buildingArea'),njop_land_per_m2:num('landNjopM2'),njop_land_total:num('landNjopTotal'),njop_building_per_m2:num('buildingNjopM2'),njop_building_total:num('buildingNjopTotal'),njop_total:num('totalNjop'),pbb_due:num('taxDue'),pbb_payable:num('payableAmount'),due_date:idToISO(x.dueDate)||null,payment_status:x.paymentStatus||'belum_bayar',paid_date:x.paymentStatus==='lunas'?(idToISO(x.paidDate)||null):null,drive_sppt_url:x.spptUrl||'',drive_payment_url:x.paymentProofUrl||'',google_maps_url:x.googleMapsUrl||'',warning_ignored:e.target.elements.namedItem('warningIgnored').checked,warning_ignore_reason:x.warningIgnoreReason||'',notes:x.notes||''};let r;if(pbbEdit>=0){r=await sb.from('pbb_records').update(row).eq('id',pbbData[pbbEdit].id).select().single()}else{let same=pbbData.find(v=>normalizeNop(v.nop)===normalizeNop(row.nop)&&Number(v.tax_year||0)===Number(row.tax_year||0));if(same){r=await sb.from('pbb_records').update(row).eq('id',same.id).select().single();if(!r.error)alert(`NOP ${row.nop} tahun ${row.tax_year} sudah ada. Data tahun tersebut diperbarui, bukan dibuat duplikat.`)}else r=await sb.from('pbb_records').insert(row).select().single()}if(r.error)return alert('Gagal menyimpan PBB: '+r.error.message);if(row.property_alias){let aliasSync=await sb.from('pbb_records').update({property_alias:row.property_alias}).eq('nop',row.nop);if(aliasSync.error)console.warn('Alias NOP belum tersinkron ke histori:',aliasSync.error)}let historySaved=0;try{historySaved=await saveExtractedPbbHistory(row)}catch(err){return alert('PBB utama tersimpan, tetapi riwayat pembayaran dari AI gagal disimpan: '+err.message)}try{await replacePbbLandRelations(r.data.id,collectPbbLandRelations());await replacePbbLinks('pbb_buildings',r.data.id,'building_id',checkedValues('#pbbBuildingChoices'));$('#pbbEditDlg').close();await loadPbbData();render();openPbbList()}catch(err){alert('PBB tersimpan tetapi relasi gagal: '+err.message)}};

function mergeAIResults(a,b){
 if(!a)return b||{};if(!b)return a;const out={...a};
 for(const [k,v] of Object.entries(b)){
   if(Array.isArray(v)){if(v.length)out[k]=[...(Array.isArray(out[k])?out[k]:[]),...v]}
   else if(v&&typeof v==='object')out[k]=mergeAIResults(out[k]||{},v);
   else if(v!==''&&v!==0&&v!=null){if(out[k]===''||out[k]===0||out[k]==null)out[k]=v;else if(['surveyNo','surveyDate','validUntil'].includes(k))out[k]=v}
 }return out
}
async function consolidateWholeDocument(pageResults,documentType,filename,totalPages,onProgress=()=>{}){
 if(!Array.isArray(pageResults)||!pageResults.length)throw new Error('Tidak ada hasil halaman untuk dikonsolidasikan.');
 if(documentType==='land_title'){
   onProgress(`Semua ${totalPages||pageResults.length} halaman selesai dibaca. AI sedang menentukan data sertifikat dan pemegang hak TERKINI dari seluruh kronologi…`);
   const out=await invokeExtractLease({documentType:'land_title_consolidate',filename,sourceDocumentType:documentType,pageResults,totalPages:totalPages||pageResults.length});
   if(!out?.data)throw new Error(out?.error||'Konsolidasi sertifikat kosong');
   onProgress('Konsolidasi seluruh sertifikat selesai. Memvalidasi pemegang hak, jenis hak, luas, Surat Ukur dan NIB…');
   return out.data;
 }
 if(documentType!=='lease'){onProgress(`Semua ${totalPages||pageResults.length} halaman selesai dibaca. Menggabungkan hasil dokumen…`);return pageResults.reduce((a,x)=>mergeAIResults(a,x.data||{}),{})}
 onProgress(`Semua ${totalPages||pageResults.length} halaman selesai dibaca. AI sedang memahami dokumen sebagai SATU kesatuan dan memvalidasi periode, nilai sewa, pajak, termin, klausul, dan referensi Akta…`);
 const out=await invokeExtractLease({documentType:'whole_document_consolidate',filename,sourceDocumentType:documentType,pageResults,totalPages:totalPages||pageResults.length});
 if(!out?.data)throw new Error(out?.error||'Konsolidasi dokumen kosong');
 if(out.data.extractionComplete===false){const w=Array.isArray(out.data.validationWarnings)?out.data.validationWarnings.join(' · '):'';onProgress('Konsolidasi selesai tetapi ada data yang perlu diverifikasi'+(w?': '+w:''));}
 else onProgress('Konsolidasi seluruh dokumen selesai. Memvalidasi hasil akhir…');
 return out.data;
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
   const total=pdf.numPages;let pageResults=[];
   for(let n=1;n<=total;n++){
     onProgress(`Menyiapkan halaman ${n} dari ${total} di perangkat Anda…`);
     const page=await pdf.getPage(n);const base64=await renderPdfPageForAI(page);page.cleanup();
     onProgress(`AI membaca halaman ${n} dari ${total}…`);
     const out=await invokeExtractLease({filename:file.name,documentType,images:[{base64,mimeType:'image/jpeg',page:n}],pageStart:n,pageEnd:n,totalPages:total});
     if(!out?.data)throw new Error(out?.error||`Hasil ekstraksi halaman ${n} kosong`);pageResults.push({page:n,data:out.data});
     // Yield to Safari/Chrome so memory from the previous canvas/request can be reclaimed.
     await new Promise(r=>setTimeout(r,40));
   }
   return await consolidateWholeDocument(pageResults,documentType,file.name,total,onProgress)
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
 if(isPdf)return invokeLargePdfAI(file,documentType,onProgress);
 if(file.size>18*1024*1024)return invokeLargeImageAI(file,documentType,onProgress);
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
   pdf=await task.promise;const totalPages=pdf.numPages;let pageResults=[];
   for(let n=1;n<=totalPages;n++){
     onProgress(`Menyiapkan halaman ${n} dari ${totalPages} langsung dari Google Drive…`);
     const page=await pdf.getPage(n);const base64=await renderPdfPageForAI(page);page.cleanup();
     onProgress(`AI membaca halaman ${n} dari ${totalPages}…`);
     const out=await invokeExtractLease({filename:meta.name||'drive-file.pdf',documentType,images:[{base64,mimeType:'image/jpeg',page:n}],pageStart:n,pageEnd:n,totalPages});
     if(!out?.data)throw new Error(out?.error||`Hasil ekstraksi halaman ${n} kosong`);pageResults.push({page:n,data:out.data});
     await new Promise(r=>setTimeout(r,60));
   }
   return await consolidateWholeDocument(pageResults,documentType,meta.name||'drive-file.pdf',totalPages,onProgress)
 }catch(e){
   const msg=String(e?.message||e);
   if(/401|unauthorized|missing pdf|unexpected server response/i.test(msg))throw new Error(`Streaming Google Drive gagal: ${msg}. Coba hubungkan ulang Google Drive.`);
   throw e
 }finally{try{pdf?.destroy()}catch(_){}try{task?.destroy()}catch(_){}}
}
async function invokeDriveAI(url,documentType,onProgress=()=>{}){
 const id=driveFileId(url);if(!id)throw new Error('Link Google Drive tidak valid.');
 onProgress('Menghubungkan ke Google Drive…');requireDriveToken();
 let headers={Authorization:`Bearer ${googleDriveToken}`};
 onProgress('Membaca informasi file Google Drive…');
 let mr=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,size&supportsAllDrives=true`,{headers});
 if(mr.status===401){clearStoredDriveToken();throw new Error('Sesi izin Google Drive sudah berakhir. Tekan tombol koneksi Google Drive (🔗) lalu coba lagi.')}
 if(!mr.ok)throw new Error(`Tidak dapat membaca metadata Google Drive (${mr.status}).`);
 const meta=await mr.json(),size=Number(meta.size||0),mime=String(meta.mimeType||'');
 if(mime.startsWith('application/vnd.google-apps.'))throw new Error('Gunakan file PDF/JPG/PNG di Google Drive, bukan Google Docs/Sheets.');
 if(size>500*1024*1024)throw new Error('File Google Drive lebih dari 500 MB.');
 const isPdf=mime==='application/pdf'||/\.pdf$/i.test(meta.name||'');
 if(isPdf){const data=await invokeLargeDrivePdfAI(id,meta,documentType,onProgress);return {data,webViewLink:url};}
 if(size>18*1024*1024){
   if(!isPdf){onProgress(`Mengunduh foto besar dari Google Drive untuk dioptimalkan di perangkat (${(size/1024/1024).toFixed(1)} MB)…`);let ir=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`,{headers});if(!ir.ok)throw new Error(`Tidak dapat mengunduh foto Google Drive (${ir.status}).`);let blob=await ir.blob();let f=new File([blob],meta.name||'drive-image',{type:mime||blob.type||'image/jpeg'});const data=await invokeLargeImageAI(f,documentType,onProgress);return {data,webViewLink:url};}
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
function applyPbbAI(x){x=normalizeAIObject(x||{});let m={nop:'nop',taxpayerName:'taxpayerName',objectAddress:'objectAddress',taxYear:'taxYear',landArea:'landArea',buildingArea:'buildingArea',landNjopM2:'landNjopM2',landNjopTotal:'landNjopTotal',buildingNjopM2:'buildingNjopM2',buildingNjopTotal:'buildingNjopTotal',totalNjop:'totalNjop',taxDue:'taxDue',payableAmount:'payableAmount',dueDate:'dueDate',paidDate:'paidDate',notes:'notes'};Object.entries(m).forEach(([k,n])=>{if(x[k]!==undefined&&x[k]!==null&&x[k]!==''){let e=$('#pbbForm').elements.namedItem(n);if(e){if(e.classList.contains('money-input'))e.value=moneyDisplay(x[k]);else if(e.classList.contains('area-input'))e.value=numberID(x[k]);else if(n==='dueDate'||n==='paidDate')e.value=isoToID(x[k]);else e.value=x[k]}}});if(x.paymentStatus){let e=$('#pbbForm').elements.namedItem('paymentStatus');if(e)e.value=String(x.paymentStatus).toLowerCase().includes('lunas')||String(x.paymentStatus).toLowerCase().includes('sudah')?'lunas':'belum_bayar';syncPbbPaymentFields();if(x.paidDate&&e?.value==='lunas')$('#pbbForm').elements.namedItem('paidDate').value=isoToID(x.paidDate)}pendingPbbHistory=Array.isArray(x.paymentHistory)?x.paymentHistory.filter(h=>h&&h.taxYear):[];renderPbbNopHistory()}
async function saveExtractedPbbHistory(mainRow){let rows=(pendingPbbHistory||[]).filter(h=>Number(h.taxYear)!==Number(mainRow.tax_year)&&normalizeNop(h.nop||mainRow.nop)===normalizeNop(mainRow.nop));let saved=0;for(let h of rows){let paid=String(h.paymentStatus||h.status||'').toLowerCase(),isPaid=paid.includes('sudah')||paid.includes('lunas')||!!h.paidDate;let row={user_id:(dataOwnerId||currentUser.id),nop:mainRow.nop,property_alias:mainRow.property_alias||'',taxpayer_name:mainRow.taxpayer_name||'',object_address:mainRow.object_address||'',tax_year:Number(h.taxYear),pbb_due:h.taxDue!=null?Number(h.taxDue):null,pbb_payable:h.payableAmount!=null?Number(h.payableAmount):null,due_date:idToISO(h.dueDate)||null,payment_status:isPaid?'lunas':'belum_bayar',paid_date:isPaid?(idToISO(h.paidDate)||null):null,drive_sppt_url:'',drive_payment_url:'',notes:'Riwayat pembayaran diekstrak AI dari dokumen SPPT/ringkasan pembayaran yang sama. Field yang tidak tercantum pada sumber sengaja tidak diisi.'};let same=pbbData.find(v=>normalizeNop(v.nop)===normalizeNop(row.nop)&&Number(v.tax_year||0)===Number(row.tax_year));let r=same?await sb.from('pbb_records').update(row).eq('id',same.id):await sb.from('pbb_records').insert(row);if(r.error)throw r.error;saved++}pendingPbbHistory=[];return saved}
$('#pbbExtractBtn').onclick=async()=>{let b=$('#pbbExtractBtn'),s=$('#pbbExtractStatus');b.disabled=true;try{let x=await invokeDocumentAI($('#pbbAiFile').files?.[0],'pbb',m=>aiProgress(s,m));applyPbbAI(x);aiProgressDone(s,'SPPT selesai dibaca. Periksa semua angka dan data sebelum menyimpan.')}catch(e){aiProgressError(s,'Gagal: '+(e.message||e))}finally{b.disabled=false}};
if($('#pbbDriveOpenBtn'))$('#pbbDriveOpenBtn').onclick=()=>{let u=$('#pbbAiDriveUrl')?.value?.trim();if(!u)return alert('Link Google Drive SPPT belum diisi.');window.open(u,'_blank','noopener')};
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
restoreDriveToken();
if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});initAuth();

// v1.16.0 RC: input tanggal cepat DDMMYY
bindAllDateInputs();


$('#leasePbbToggle').onclick=()=>{leasePbbOthersVisible=!leasePbbOthersVisible;renderLeasePbbPicker()};
$('#leaseLandMoreBtn').onclick=()=>{leaseLandOthersVisible=!leaseLandOthersVisible;const selected=checkedValues('#leaseLandChoices');renderLeaseLandPicker(selected,leaseLandOrphanIds)};
$('#leaseHistoryBtn').onclick=()=>{let x=edit>=0?data[edit]:null;if(!x?.id)return alert('Simpan Akta Sewa terlebih dahulu.');openHistory('lease',x.id,`Akta ${x.deedNo||'-'} · ${x.tenant||''}`)};
$('#landHistoryBtn').onclick=()=>{let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return alert('Simpan Properti/Sertifikat terlebih dahulu.');openHistory('land',a.id,a.name||'Sertifikat Tanah')};
$('#historyCompareBtn').onclick=compareHistoryAI;$('#historyCloseBtn').onclick=()=>$('#historyDlg').close();$('#historySearchBtn').onclick=openHistorySearch;$('#historySearchCloseBtn').onclick=()=>$('#historySearchDlg').close();$('#historySearchInput').addEventListener('input',()=>{clearTimeout(window.__hs);window.__hs=setTimeout(runHistorySearch,250)});$('#historySearchAsset')?.addEventListener('change',()=>{if($('#historySearchInput').value.trim().length>=2)runHistorySearch();else $('#historySearchResults').innerHTML='<div class="muted">Ketik minimal 2 karakter untuk mencari pada properti yang dipilih.</div>'});


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
 // v1.19.9 — FIFO payment ledger + historical duplicate protection.
 let existing=await sb.from('lease_documents').select('id,label,document_type,document_date,deed_no,ai_status,ai_read_at,extracted_data').eq('contract_id',active.id);
 if(existing.error)throw new Error(`Gagal memeriksa duplikat: ${existing.error.message}`);
 let duplicate=(existing.data||[]).find(d=>String(d.deed_no||'').trim().toLowerCase()===String(row.deed_no||'').trim().toLowerCase() && String(d.document_date||'')===String(row.document_date||''));
 if(duplicate&&historicalDocRead(duplicate))throw new Error(`Dokumen yang sama sudah ada di Riwayat Dokumen (${duplicate.label||'tanpa label'}) dan sudah dibaca AI.`);
 let r;
 if(duplicate&&!historicalDocRead(duplicate))r=await sb.from('lease_documents').update(row).eq('id',duplicate.id).select('*').single();
 else r=await sb.from('lease_documents').insert(row).select('*').single();
 if(r.error)throw new Error(`Database lease_documents: ${r.error.message}${r.error.code?' ['+r.error.code+']':''}. Pastikan SQL terbaru sudah dijalankan.`);
 if(!r.data?.id)throw new Error('Database tidak mengembalikan ID dokumen setelah penyimpanan.');
 // Verify the row really exists before telling the user that saving succeeded.
 let verify=await sb.from('lease_documents').select('id,contract_id,label,ai_status,ai_read_at,extracted_data').eq('id',r.data.id).maybeSingle();
 if(verify.error)throw new Error(`Dokumen dikirim tetapi verifikasi database gagal: ${verify.error.message}`);
 if(!verify.data)throw new Error('Dokumen belum ditemukan kembali setelah penyimpanan. Penyimpanan belum dianggap berhasil.');
 // document_history is secondary. A failure here must not hide a successfully saved historical document.
 try{await saveHistorySnapshot('lease',active.id,active.assetId||null,x,'historical_document',row.label)}catch(e){console.warn('Historical snapshot warning',e)}
 if(Array.isArray(x.priorDeeds)&&x.priorDeeds.length)await syncPriorDeedReferences(active.id,x.priorDeeds);
 await renderHistoricalLeaseSavedList();
 $('#historicalLeaseStatus').textContent=`✓ Tersimpan: ${row.label}`;
 alert('Dokumen historis sudah tersimpan dan diverifikasi di database. Akta aktif tidak diubah.');
}

// v1.19.5 — show saved historical documents inside the add-history dialog.
function historicalDocRead(d){return d?.ai_status==='sudah_dibaca'&&!d?.extracted_data?.referenceOnly}
function historicalDocTitle(d){return d?.label||String(d?.document_type||'Dokumen historis').replaceAll('_',' ')}
function historicalDocDetails(d){let x=normalizeExtractedLease(d?.extracted_data||{}),parts=[];if(d?.document_date)parts.push(isoToID(d.document_date));else if(x.deedDate)parts.push(x.deedDate);if(d?.deed_no||x.deedNo)parts.push('Akta '+(d.deed_no||x.deedNo));if(x.tenant)parts.push(x.tenant);return parts.join(' · ')||'Data dokumen historis tersimpan'}
async function renderHistoricalLeaseSavedList(){let box=$('#historicalLeaseSavedList'),active=activeLeaseForHistory();if(!box||!active?.id)return;box.innerHTML='<div class="muted">Memuat dokumen historis tersimpan…</div>';try{let docs=await leaseDocumentRows(active.id);if(!docs.length){box.innerHTML='<div class="history-empty"><b>Belum ada dokumen historis tersimpan untuk Akta Sewa ini.</b><div>Dokumen yang baru dibaca AI belum masuk daftar sampai tombol “Simpan sebagai Dokumen Historis” ditekan.</div></div>';return}box.innerHTML=docs.map(d=>{let read=historicalDocRead(d),when=d.ai_read_at?new Date(d.ai_read_at).toLocaleString('id-ID'):'',hasData=historicalDocRead(d);return `<div class="history-item historical-saved-row"><div><b>${historicalDocTitle(d)}</b><div>${historicalDocDetails(d)}</div><div class="ai-doc-status ${read?'ai-read':'ai-unread'}">${read?'✓ Sudah dibaca AI':'○ Belum dibaca AI'}${when?' · '+when:''}</div></div><div class="historical-row-actions">${hasData?`<button type="button" class="secondary" data-hist-view="${d.id}">Lihat Hasil AI</button>`:''}<button type="button" class="secondary" data-hist-compare="${d.id}">Bandingkan</button>${currentRole==='administrator'?`<button type="button" class="secondary danger-historical" data-hist-delete="${d.id}"><span aria-hidden="true">🗑️</span></button>`:''}</div></div>`}).join('');box.querySelectorAll('[data-hist-view]').forEach(b=>b.onclick=()=>viewSavedHistoricalAI(b.dataset.histView));box.querySelectorAll('[data-hist-compare]').forEach(b=>b.onclick=()=>compareSavedHistoricalWithActive(b.dataset.histCompare));box.querySelectorAll('[data-hist-delete]').forEach(b=>b.onclick=()=>deleteSavedHistoricalDocument(b.dataset.histDelete))}catch(e){box.innerHTML=`<div class="compare-warning">Gagal memuat riwayat dokumen: ${e.message}</div>`}}
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

function priorRefDate(v){return idToISO(v)||(/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v):null)}
function normDeedNo(v){return String(v||'').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')}
function safeLeaseDocumentType(v){let s=String(v||'').toLowerCase();if(s.includes('addendum'))return 'addendum';if(s.includes('perpanjang'))return 'perpanjangan';if(s.includes('pengganti'))return 'pengganti';if(s.includes('bawah')||s.includes('tambahan'))return 'perjanjian_tambahan';if(s.includes('lain'))return 'lainnya';if(s.includes('referensi'))return 'referensi_akta';return 'akta_lama'}
async function syncPriorDeedReferences(contractId,refs){
 if(!contractId||!Array.isArray(refs)||!refs.length)return {saved:0,warnings:[]};
 let docs=await leaseDocumentRows(contractId),owner=historyOwner(),saved=0,warnings=[];
 for(const raw of refs){let r=normalizeAIObject(raw||{}),no=String(r.deedNo||'').trim(),dt=priorRefDate(r.deedDate),label=String(r.label||'').trim()||`${String(r.documentType||'Akta sebelumnya').replaceAll('_',' ')}${no?' · Akta '+no:''}`;if(!no&&!dt&&!label)continue;
   let same=docs.find(d=>(no&&normDeedNo(d.deed_no)===normDeedNo(no))||(dt&&d.document_date===dt&&normDeedNo(d.deed_no)===normDeedNo(no)));if(same)continue;
   let row={user_id:owner,contract_id:contractId,asset_id:(data.find(x=>String(x.id)===String(contractId))?.assetId||null),document_type:safeLeaseDocumentType(r.documentType||'referensi_akta'),label,document_date:dt,deed_no:no||null,drive_url:'',extracted_data:{referenceOnly:true,notary:r.notary||'',context:r.context||'',source:'ai_reference',originalDocumentType:r.documentType||''},ai_status:'belum_dibaca',ai_read_at:null};
   let ins=await sb.from('lease_documents').insert(row).select('*').single();if(ins.error){warnings.push(label+': '+ins.error.message);continue}docs.push(ins.data);saved++
 }
 return {saved,warnings}
}
function storedLeaseDriveUrl(){let active=edit>=0?data[edit]:null;let u=active?.docUrl||document.querySelector('[name="docUrl"]')?.value||'';return driveFileId(u)?u:''}
function syncLeaseDriveSourceHint(x){let el=$('#leaseDriveSourceHint');if(!el)return;let u=driveFileId(x?.docUrl||'')?(x.docUrl||''):storedLeaseDriveUrl();el.innerHTML=u?'✓ Dokumen sumber Google Drive tersimpan. Verifikasi Ulang AI dapat membaca langsung file ini tanpa memilih ulang.':'Belum ada sumber Google Drive tersimpan untuk Akta ini.'}
function leaseRescanSource(){let f=$('#aiFile')?.files?.[0],u=$('#driveUrl')?.value?.trim(),saved=storedLeaseDriveUrl();if(f)return {type:'file',file:f,label:'file yang dipilih'};if(driveFileId(u))return {type:'drive',url:u,label:'Google Drive'};if(saved)return {type:'drive',url:saved,label:'Google Drive tersimpan'};return null}
async function rescanActiveLease(){let active=edit>=0?data[edit]:null;if(!active?.id)return alert('Simpan Akta Sewa terlebih dahulu sebelum Verifikasi Ulang AI.');let src=leaseRescanSource();if(!src)return alert('Dokumen sumber belum tersedia. Pilih file Akta atau masukkan link Google Drive, lalu Simpan agar sumber Drive dapat dipakai lagi untuk verifikasi berikutnya.');if(!confirm('Verifikasi Ulang AI akan membaca ulang Akta dari '+(src.label||'dokumen sumber')+' dan menggunakan OpenAI credit. Data tersimpan TIDAK akan langsung ditimpa. Lanjutkan?'))return;let st=$('#extractStatus'),b=$('#leaseRescanBtn');try{b.disabled=true;aiProgress(st,'AI membaca ulang seluruh Akta untuk verifikasi…');let fresh=src.type==='file'?await invokeDocumentAI(src.file,'lease',m=>aiProgress(st,m)):(await invokeDriveAI(src.url,'lease',m=>aiProgress(st,m))).data;fresh=normalizeExtractedLease(fresh);leaseRescanResult=fresh;recordAIScan();let cmp=await invokeExtractLease({documentType:'history_compare',comparisonData:{entityType:'lease',old:active,new:fresh}});renderLeaseRescanReview(active,fresh,cmp.data||{});aiProgressDone(st,'Verifikasi ulang selesai. Periksa perbedaannya. Data lama belum diubah.')}catch(e){aiProgressError(st,'Verifikasi ulang gagal: '+e.message)}finally{b.disabled=false}}
function renderLeaseRescanReview(oldData,fresh,cmp){let dlg=$('#leaseRescanDlg'),box=$('#leaseRescanResult');let refs=Array.isArray(fresh.priorDeeds)?fresh.priorDeeds:[];box.innerHTML=`<div class="compare-warning"><b>Data tersimpan belum diubah.</b> Terapkan hanya setelah hasil verifikasi diperiksa.</div><div class="history-item"><b>Hasil scan ulang</b><div>Akta ${fresh.deedNo||'-'} · ${fresh.deedDate||'-'} · ${(fresh.clauses||[]).length} klausul · ${refs.length} referensi Akta sebelumnya ditemukan</div></div><div id="leaseRescanCompare"></div>`;renderHistoryComparison($('#leaseRescanCompare'),cmp);dlg.showModal()}
async function applyLeaseRescan(){if(!leaseRescanResult)return;let active=edit>=0?data[edit]:null;if(!active?.id)return;let fresh=leaseRescanResult;if(!confirm('Terapkan hasil Verifikasi Ulang AI ke form Akta Sewa? Data database baru berubah setelah Anda menekan Simpan.'))return;applyExtracted(fresh);leaseAIWholeMeta.lastAIVerification=new Date().toISOString();$('#leaseRescanDlg').close();alert('Hasil verifikasi sudah diterapkan ke FORM. Total kontrak, periode, termin, pajak, klausul dan referensi Akta akan disimpan permanen saat Anda menekan Simpan.')}
window.rescanActiveLease=rescanActiveLease;
async function leaseDocumentRows(contractId){let r=await sb.from('lease_documents').select('*').eq('contract_id',contractId).order('document_date',{ascending:true,nullsFirst:true}).order('created_at',{ascending:true});if(r.error)throw r.error;return r.data||[]}
const __openHistoryV1191=openHistory;
openHistory=async function(entityType,entityId,title){await __openHistoryV1191(entityType,entityId,title);if(entityType!=='lease')return;let docs=await leaseDocumentRows(entityId);if(!docs.length)return;let tl=$('#historyTimeline');let active=data.find(v=>String(v.id)===String(entityId));tl.insertAdjacentHTML('afterbegin',`<div class="history-legal-chain"><h3>Rangkaian Dokumen Hukum</h3><p class="muted">Status AI menunjukkan apakah hasil pembacaan AI sudah tersimpan. Dokumen berstatus sudah dibaca tidak perlu di-scan ulang.</p>${docs.map(d=>{let read=historicalDocRead(d);let when=d.ai_read_at?new Date(d.ai_read_at).toLocaleString('id-ID'):'';return `<div class="history-item"><b>${d.label||d.document_type} ${d.deed_no?`· Akta ${d.deed_no}`:''}</b><div>${d.document_date?isoToID(d.document_date):'-'} · ${d.document_type.replaceAll('_',' ')}</div><div class="ai-doc-status ${read?'ai-read':'ai-unread'}">${read?'✓ Sudah dibaca AI':'○ Belum dibaca AI'}${when?' · '+when:''}</div></div>`}).join('')}<div class="history-item compare-ok"><b>AKTIF · Akta ${active?.deedNo||'-'}</b><div>${active?.deedDate||'-'} · ${active?.tenant||''}</div><div class="ai-doc-status ai-saved">Data aktif tersimpan · riwayat versi dapat dibandingkan tanpa membaca ulang PDF</div></div></div>`)};
$('#historicalLeaseBtn').onclick=openHistoricalLease;$('#historicalLeaseRefresh').onclick=renderHistoricalLeaseSavedList;$('#historicalLeaseClose').onclick=()=>$('#historicalLeaseDlg').close();$('#historicalLeaseReadFile').onclick=readHistoricalFile;$('#historicalLeaseReadDrive').onclick=readHistoricalDrive;$('#historicalLeaseSave').onclick=async()=>{let b=$('#historicalLeaseSave');b.disabled=true;try{await saveHistoricalLease()}catch(e){alert('Gagal menyimpan dokumen historis: '+e.message)}finally{b.disabled=false}};

if($('#supplementalReadFile'))$('#supplementalReadFile').onclick=readSupplementalFile;if($('#supplementalReadDrive'))$('#supplementalReadDrive').onclick=readSupplementalDrive;

// v1.19.14 RC — summary-first collapsible sections for long forms/dialogs.
(function(){
  const STORAGE_KEY='sewaAktaCollapsedSectionsV11913';
  function prefs(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return {}}}
  function savePrefs(v){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(v))}catch{}}
  function txt(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
  function nonEmptyCount(root){return [...root.querySelectorAll('input,textarea,select')].filter(el=>{if(el.type==='checkbox'||el.type==='radio')return el.checked;return String(el.value||'').trim()!==''}).length}
  function hasAttention(root){return !!root.querySelector('.warn,.warning,.compare-warning,.overdue,.late,.danger,[data-warning="true"]')||/kurang bayar|terlambat|jatuh tempo|belum lunas|warning/i.test(txt(root))}
  function summaryFor(root,title){let n=nonEmptyCount(root);let att=hasAttention(root);if(att)return '⚠ Perlu perhatian';if(/pembayaran aktual/i.test(title)){let rows=root.querySelectorAll('.ledger-row').length;return rows?`${rows} pembayaran tercatat`:'Belum ada pembayaran'}if(/jadwal pembayaran/i.test(title)){let rows=root.querySelectorAll('.payrow').length;return rows?`${rows} termin`:'Belum ada termin'}if(/rekening/i.test(title)){let rows=root.querySelectorAll('#banks > *').length;return rows?`${rows} rekening`:n?'Data tersedia':'Kosong'}if(/kontak|pic/i.test(title)){let rows=root.querySelectorAll('#contacts > *').length;return rows?`${rows} kontak`:n?'Data tersedia':'Kosong'}if(/klausul/i.test(title)){let rows=root.querySelectorAll('#clauses > *').length;return rows?`${rows} klausul`:n?'Data tersedia':'Kosong'}if(/bawah tangan|dokumen sewa tambahan/i.test(title)){let rows=root.querySelectorAll('#supplementalAgreements > *').length;return rows?`${rows} dokumen`:n?'Data tersedia':'Belum ada'}if(/bidang \/ sertifikat tanah/i.test(title)){let rows=root.querySelectorAll('#assetLandTitles .landtitle').length;return rows?`${rows} sertifikat`:'Belum ada sertifikat'}return n?`${n} data terisi`:'Klik untuk melihat'}
  function makeSection(nodes,title,key,defaultOpen=true){if(!nodes?.length)return;let first=nodes[0],parent=first.parentNode;if(!parent||first.closest('.collapsible-section'))return;let sec=document.createElement('section');sec.className='collapsible-section';sec.dataset.collapseKey=key;parent.insertBefore(sec,first);nodes.forEach(n=>sec.appendChild(n));let content=document.createElement('div');content.className='collapsible-content';while(sec.firstChild)content.appendChild(sec.firstChild);let head=document.createElement('button');head.type='button';head.className='collapsible-header';let titleEl=document.createElement('span');titleEl.className='collapsible-title';titleEl.textContent=title;let sum=document.createElement('span');sum.className='collapsible-summary';let chev=document.createElement('span');chev.className='collapsible-chevron';head.append(titleEl,sum,chev);sec.append(head,content);let p=prefs();let open=(key in p)?!!p[key]:defaultOpen;if(hasAttention(content))open=true;sec.classList.toggle('is-collapsed',!open);sec.classList.toggle('has-attention',hasAttention(content));function refresh(){sum.textContent=summaryFor(content,title);chev.textContent=sec.classList.contains('is-collapsed')?'▶':'▼'}refresh();head.onclick=()=>{sec.classList.toggle('is-collapsed');let q=prefs();q[key]=!sec.classList.contains('is-collapsed');savePrefs(q);refresh()};new MutationObserver(refresh).observe(content,{childList:true,subtree:true,characterData:true});content.addEventListener('input',refresh);content.addEventListener('change',refresh);return sec}
  function addControls(container){if(!container||container.querySelector(':scope > .collapse-page-controls'))return;let sections=[...container.querySelectorAll(':scope > .collapsible-section')];if(sections.length<2)return;let bar=document.createElement('div');bar.className='collapse-page-controls';bar.innerHTML='<button type="button" class="secondary collapse-open-all">📂 <span>Buka Semua</span></button><button type="button" class="secondary collapse-close-all">📁 <span>Tutup Semua</span></button>';container.insertBefore(bar,sections[0]);bar.querySelector('.collapse-open-all').onclick=()=>sections.forEach(s=>{s.classList.remove('is-collapsed');let q=prefs();q[s.dataset.collapseKey]=true;savePrefs(q);s.querySelector('.collapsible-chevron').textContent='▼'});bar.querySelector('.collapse-close-all').onclick=()=>sections.forEach(s=>{if(s.classList.contains('has-attention'))return;s.classList.add('is-collapsed');let q=prefs();q[s.dataset.collapseKey]=false;savePrefs(q);s.querySelector('.collapsible-chevron').textContent='▶'})}
  function groupLeaseForm(){let f=document.querySelector('#dlg #form');if(!f||f.dataset.collapsibleReady)return;f.dataset.collapsibleReady='1';let kids=[...f.children];let ai=kids.find(x=>x.classList.contains('ai-extract'));if(ai)makeSection([ai],'Pembacaan AI / Dokumen','lease-ai',false);function fromHeading(match,nextMatch,title,key,open){kids=[...f.children];let start=kids.findIndex(x=>x.tagName==='H3'&&match.test(txt(x)));if(start<0)return;let end=kids.length;for(let i=start+1;i<kids.length;i++){if(nextMatch&&kids[i].tagName==='H3'&&nextMatch.test(txt(kids[i]))){end=i;break}if(kids[i].classList.contains('actions')){end=i;break}}makeSection(kids.slice(start,end),title,key,open)}
    fromHeading(/Identitas & Masa Sewa/i,/Kontak|Rekening|Jadwal|Klausul/i,'Identitas & Masa Sewa','lease-identity',true);
    let rel=f.querySelector(':scope > .lease-relations');if(rel&&!rel.querySelector('#supplementalAgreements'))makeSection([rel],'Objek, PBB & Fasilitas','lease-relations',false);
    fromHeading(/Kontak \/ PIC/i,/Rekening Bank/i,'Kontak / PIC','lease-contacts',false);
    fromHeading(/Rekening Bank/i,/Jadwal Pembayaran/i,'Rekening Bank','lease-banks',false);
    let supp=[...f.querySelectorAll(':scope > .lease-relations')].find(x=>x.querySelector('#supplementalAgreements'));if(supp)makeSection([supp],'Perjanjian di Bawah Tangan / Dokumen Tambahan','lease-supplemental',false);
    fromHeading(/Jadwal Pembayaran Menurut Akta/i,/Riwayat Pembayaran Aktual/i,'Jadwal Pembayaran Menurut Akta','lease-schedule',true);
    fromHeading(/Riwayat Pembayaran Aktual/i,/Klausul Penting/i,'Riwayat Pembayaran Aktual','lease-ledger',true);
    fromHeading(/Klausul Penting/i,null,'Klausul Penting & Riwayat','lease-clauses',false);
    addControls(f)
  }
  function groupAssetForm(){let f=document.querySelector('#assetDlg #assetForm');if(!f||f.dataset.collapsibleReady)return;f.dataset.collapsibleReady='1';let sections=[...f.querySelectorAll(':scope > .master-section')];sections.forEach((s,i)=>{let h=s.querySelector('h3');if(h)makeSection([s],txt(h),`asset-${i}`,i===0)});addControls(f)}
  function groupPbbForm(){let f=document.querySelector('#pbbEditDlg #pbbForm');if(!f||f.dataset.collapsibleReady)return;f.dataset.collapsibleReady='1';let ai=f.querySelector(':scope > .ai-extract');if(ai)makeSection([ai],'Pembacaan AI SPPT','pbb-ai',false);let grid=f.querySelector(':scope > .pbb-grid');if(grid)makeSection([grid],'Data PBB / SPPT','pbb-data',true);addControls(f)}
  function run(){groupLeaseForm();groupAssetForm();groupPbbForm()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  document.addEventListener('click',e=>{if(e.target.closest('#addBtn,#assetsBtn,#pbbBtn,.edit-btn,.asset-edit,.pbb-edit'))setTimeout(run,0)})
})();


// v1.19.15 RC — robust collapsible Akta Sewa retained from v1.19.14. Runs every time the lease dialog opens.
(function(){
 const KEY='sewaAktaCollapseV11914';
 const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
 const put=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
 function att(root){return /kurang bayar|terlambat|jatuh tempo|belum lunas|perlu perhatian/i.test((root.textContent||''))||!!root.querySelector('.warn,.warning,.overdue,.danger,[data-warning="true"]')}
 function count(root,sel){return root.querySelectorAll(sel).length}
 function summary(root,title){if(att(root))return '⚠ Perlu perhatian';if(/Jadwal/.test(title))return count(root,'.payrow')+' termin';if(/Pembayaran Aktual/.test(title))return count(root,'.ledger-row')+' pembayaran';if(/Klausul/.test(title))return count(root,'#clauses > *')+' klausul';if(/Rekening/.test(title))return count(root,'#banks > *')+' rekening';if(/Kontak/.test(title))return count(root,'#contacts > *')+' kontak';if(/Bawah Tangan/.test(title))return count(root,'#supplementalAgreements > *')+' dokumen';return 'Klik untuk melihat'}
 function wrap(nodes,title,key,open=false){if(!nodes.length||nodes[0].closest('.v11914-collapse'))return;const parent=nodes[0].parentNode,sec=document.createElement('section');sec.className='collapsible-section v11914-collapse';sec.dataset.collapseKey=key;parent.insertBefore(sec,nodes[0]);const head=document.createElement('button');head.type='button';head.className='collapsible-header';const t=document.createElement('span');t.className='collapsible-title';t.textContent=title;const sm=document.createElement('span');sm.className='collapsible-summary';const ch=document.createElement('span');ch.className='collapsible-chevron';head.append(t,sm,ch);const body=document.createElement('div');body.className='collapsible-content';nodes.forEach(n=>body.appendChild(n));sec.append(head,body);let pref=get(),isOpen=(key in pref)?!!pref[key]:open;if(att(body))isOpen=true;sec.classList.toggle('is-collapsed',!isOpen);sec.classList.toggle('has-attention',att(body));const refresh=()=>{sm.textContent=summary(body,title);ch.textContent=sec.classList.contains('is-collapsed')?'▶':'▼';sec.classList.toggle('has-attention',att(body))};head.onclick=()=>{sec.classList.toggle('is-collapsed');pref=get();pref[key]=!sec.classList.contains('is-collapsed');put(pref);refresh()};body.addEventListener('input',refresh);body.addEventListener('change',refresh);new MutationObserver(refresh).observe(body,{subtree:true,childList:true,characterData:true});refresh();return sec}
 function install(){const f=document.querySelector('#dlg #form');if(!f||f.dataset.collapsibleReady||f.querySelector('.v11914-collapse'))return;
   const ai=f.querySelector(':scope > .ai-extract');if(ai)wrap([ai],'Pembacaan AI / Dokumen','ai',false);
   // Each direct H3 becomes its own section until the next structural boundary.
   [...f.children].filter(x=>x.tagName==='H3').forEach((h,i)=>{if(h.closest('.v11914-collapse'))return;let nodes=[h],n=h.nextElementSibling;while(n&&!['H3','SECTION'].includes(n.tagName)&&!n.classList.contains('actions')&&!(n.tagName==='LABEL'&&/Catatan tambahan/i.test(n.textContent||''))){let nx=n.nextElementSibling;nodes.push(n);n=nx}let title=(h.textContent||'Bagian').replace(/^\s*[📜🏭🧾⚡]\s*/,'').trim();let key='h3-'+title.toLowerCase().replace(/[^a-z0-9]+/g,'-');wrap(nodes,title,key,/Identitas|Jadwal Pembayaran|Riwayat Pembayaran/.test(title))});
   [...f.querySelectorAll(':scope > section.lease-relations')].forEach((sec,i)=>{if(sec.closest('.v11914-collapse'))return;let title=sec.querySelector('h3')?.textContent?.trim()||'Dokumen & Relasi';wrap([sec],title,'relation-'+i,false)});
   const notes=[...f.children].find(x=>x.tagName==='LABEL'&&/Catatan tambahan/i.test(x.textContent||''));if(notes)wrap([notes],'Catatan Tambahan','notes',false);
   const sections=[...f.querySelectorAll(':scope > .v11914-collapse')];if(sections.length>1&&!f.querySelector(':scope > .collapse-page-controls.v11914-controls')){let bar=document.createElement('div');bar.className='collapse-page-controls v11914-controls';bar.innerHTML='<button type="button" class="secondary">Buka Semua</button><button type="button" class="secondary">Tutup Semua</button>';f.insertBefore(bar,sections[0]);bar.children[0].onclick=()=>sections.forEach(x=>x.classList.remove('is-collapsed'));bar.children[1].onclick=()=>sections.forEach(x=>{if(!x.classList.contains('has-attention'))x.classList.add('is-collapsed')})}
 }
 const oldOpen=window.openEdit;window.openEdit=async function(...a){let r=await oldOpen(...a);setTimeout(install,0);return r};
 document.addEventListener('click',e=>{if(e.target.closest('#addBtn'))setTimeout(install,0)});
 if(document.querySelector('#dlg[open]'))install();
})();

// ============================================================
// v1.19.47 — Property direct relationships + search inside deed
// ============================================================
let propertyLinkMode='', leaseLocalHits=[], leaseLocalHitIndex=-1;
function leaseLocalNodeText(el){let p=[el.innerText||''];el.querySelectorAll?.('input,textarea,select').forEach(x=>{p.push(x.value||'');if(x.tagName==='SELECT')p.push(x.options[x.selectedIndex]?.text||'')});return p.join(' ').toLowerCase()}
function leaseSearchSections(){const f=$('#form');if(!f)return[];let nodes=[...f.querySelectorAll(':scope > section, :scope > .form-section, :scope > fieldset, :scope > div')];return nodes.filter(x=>!x.classList.contains('lease-local-search')&&!x.closest('.lease-local-search'))}
function runLeaseLocalSearch(move=0){const q=String($('#leaseLocalSearch')?.value||'').trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean),nodes=leaseSearchSections();nodes.forEach(x=>x.classList.remove('lease-search-hit','lease-search-current'));leaseLocalHits=[];leaseLocalHitIndex=-1;if(!terms.length){$('#leaseLocalSearchCount').textContent='Semua data ditampilkan';return}nodes.forEach(el=>{let t=leaseLocalNodeText(el);if(terms.every(k=>t.includes(k))){el.classList.add('lease-search-hit');leaseLocalHits.push(el)}});$('#leaseLocalSearchCount').textContent=leaseLocalHits.length?`${leaseLocalHits.length} bagian cocok`:'Tidak ditemukan';if(leaseLocalHits.length){leaseLocalHitIndex=move<0?leaseLocalHits.length-1:0;focusLeaseLocalHit()}}
function focusLeaseLocalHit(){leaseLocalHits.forEach(x=>x.classList.remove('lease-search-current'));if(leaseLocalHitIndex<0)return;let el=leaseLocalHits[leaseLocalHitIndex];el.classList.add('lease-search-current');let d=el.closest('details');if(d)d.open=true;el.scrollIntoView({behavior:'smooth',block:'center'});$('#leaseLocalSearchCount').textContent=`${leaseLocalHitIndex+1} / ${leaseLocalHits.length} hasil`}
function moveLeaseLocalHit(dir){if(!leaseLocalHits.length)return runLeaseLocalSearch(dir);leaseLocalHitIndex=(leaseLocalHitIndex+dir+leaseLocalHits.length)%leaseLocalHits.length;focusLeaseLocalHit()}
$('#leaseLocalSearch')?.addEventListener('input',()=>runLeaseLocalSearch());$('#leaseSearchPrev')?.addEventListener('click',()=>moveLeaseLocalHit(-1));$('#leaseSearchNext')?.addEventListener('click',()=>moveLeaseLocalHit(1));

async function refreshPropertyLinkedData(){let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return;let [pr,cr]=await Promise.all([sb.from('pbb_records').select('*').eq('asset_id',a.id).order('tax_year',{ascending:false}),sb.from('contracts').select('*').eq('asset_id',a.id).order('created_at',{ascending:false})]);let allPs=pr.data||[],cs=cr.data||[];let byNop=new Map();allPs.forEach(r=>{let k=normalizeNop(r.nop)||String(r.id);let prev=byNop.get(k);if(!prev||Number(r.tax_year||0)>Number(prev.tax_year||0))byNop.set(k,r)});let ps=[...byNop.values()];$('#assetPbbSummary').innerHTML=ps.length?ps.map(r=>{let alias=(r.property_alias||'').trim();let title=alias?`🧾 ${historySearchEscape(alias)}`:`🧾 NOP ${historySearchEscape(r.nop||'-')}`;let nopLine=alias?`NOP ${historySearchEscape(r.nop||'-')} · `:'';return `<div class="property-linked-card"><span><b>${title}</b><small>${nopLine}Tahun ${r.tax_year||'-'} · ${r.payment_status==='lunas'?'Sudah Bayar':'Belum Bayar'}</small></span><button type="button" class="secondary" onclick="openPbbById('${r.id}')">Buka</button><button type="button" class="secondary" onclick="unlinkPropertyPbb('${r.id}')">Lepas</button></div>`}).join(''):'<div class="muted">Belum ada PBB yang dihubungkan ke properti ini.</div>';$('#assetLeaseSummary').innerHTML=cs.length?cs.map(r=>`<div class="property-linked-card"><span><b>📝 ${historySearchEscape(r.tenant||'-')}</b><small>Akta ${historySearchEscape(r.deed_no||'-')} · ${isoToID(r.start_date)||'-'} s/d ${isoToID(r.end_date)||'-'}</small></span><button type="button" class="secondary" onclick="openLeaseById('${r.id}')">Buka</button><button type="button" class="secondary" onclick="unlinkPropertyLease('${r.id}')">Lepas</button></div>`).join(''):'<div class="muted">Belum ada Akta Sewa yang dihubungkan ke properti ini.</div>'}
async function openPbbById(id){let i=pbbData.findIndex(x=>String(x.id)===String(id));if(i<0){await loadPbbData();i=pbbData.findIndex(x=>String(x.id)===String(id))}if(i>=0)openPbbEdit(i)}window.openPbbById=openPbbById;
async function openLeaseById(id){let i=data.findIndex(x=>String(x.id)===String(id));if(i>=0)openEdit(i)}window.openLeaseById=openLeaseById;
async function unlinkPropertyPbb(id){if(!confirm('Lepas hubungan PBB dari properti ini? Data PBB tidak akan dihapus.'))return;let r=await sb.from('pbb_records').update({asset_id:null}).eq('id',id);if(r.error)return alert(r.error.message);await loadPbbData();await refreshPropertyLinkedData();runAssetDetailSearch()}window.unlinkPropertyPbb=unlinkPropertyPbb;
async function unlinkPropertyLease(id){if(!confirm('Lepas hubungan Akta Sewa dari properti ini? Data Akta tidak akan dihapus.'))return;let r=await sb.from('contracts').update({asset_id:null}).eq('id',id);if(r.error)return alert(r.error.message);let x=data.find(v=>String(v.id)===String(id));if(x)x.assetId='';await refreshPropertyLinkedData();runAssetDetailSearch()}window.unlinkPropertyLease=unlinkPropertyLease;
function propertyLinkText(r,mode){return mode==='pbb'?[r.nop,r.tax_year,r.property_alias,r.taxpayer_name,r.object_address,r.notes].join(' ').toLowerCase():[r.tenant,r.lessor,r.deedNo,r.deedDate,r.start,r.end,r.asset,r.propertyAddress,r.notes,JSON.stringify(r.clauses||[])].join(' ').toLowerCase()}
async function openPropertyLinkPicker(mode){let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return alert('Simpan Properti terlebih dahulu.');propertyLinkMode=mode;$('#propertyLinkTitle').textContent=mode==='pbb'?'🔗 Hubungkan PBB ke Properti':'🔗 Hubungkan Akta Sewa ke Properti';$('#propertyLinkHelp').textContent='Centang data yang harus melekat ke properti ini. Data asli tidak dihapus saat hubungan dilepas.';$('#propertyLinkSearch').value='';await renderPropertyLinkPicker();$('#propertyLinkDlg').showModal()}
async function renderPropertyLinkPicker(){let a=assets[assetEdit],q=$('#propertyLinkSearch').value.trim().toLowerCase(),rows=propertyLinkMode==='pbb'?pbbData:data;let html=rows.filter(r=>!q||propertyLinkText(r,propertyLinkMode).includes(q)).map(r=>{let linked=String(r.asset_id||r.assetId||'')===String(a.id);let title,sub;if(propertyLinkMode==='pbb'){let alias=String(r.property_alias||'').trim();title=alias||`NOP ${r.nop||'-'} · ${r.tax_year||'-'}`;sub=alias?`NOP ${r.nop||'-'} · ${r.tax_year||'-'}${r.object_address?' · '+r.object_address:''}`:(r.object_address||'')}else{let alias=String(r.property_alias||r.asset_alias||r.asset||'').trim();title=alias?`${alias} · ${r.tenant||'-'}`:`${r.tenant||'-'} · Akta ${r.deedNo||'-'}`;sub=`Akta ${r.deedNo||'-'} · ${r.start||'-'} s/d ${r.end||'-'}${r.propertyAddress?' · '+r.propertyAddress:''}`};return `<label class="property-link-row"><input type="checkbox" ${linked?'checked':''} onchange="setPropertyLink('${r.id}',this.checked)"><span><b>${historySearchEscape(title)}</b><small>${historySearchEscape(sub)}</small></span></label>`}).join('');$('#propertyLinkResults').innerHTML=html||'<div class="muted">Tidak ada data yang cocok.</div>'}
async function setPropertyLink(id,on){let a=assets[assetEdit];if(propertyLinkMode==='pbb'){let r=await sb.from('pbb_records').update({asset_id:on?a.id:null}).eq('id',id);if(r.error)return alert(r.error.message);let x=pbbData.find(v=>String(v.id)===String(id));if(x)x.asset_id=on?a.id:null}else{let r=await sb.from('contracts').update({asset_id:on?a.id:null}).eq('id',id);if(r.error)return alert(r.error.message);let x=data.find(v=>String(v.id)===String(id));if(x)x.assetId=on?a.id:''}await refreshPropertyLinkedData();runAssetDetailSearch()}window.setPropertyLink=setPropertyLink;
$('#assetLinkPbb')?.addEventListener('click',()=>openPropertyLinkPicker('pbb'));$('#assetLinkLease')?.addEventListener('click',()=>openPropertyLinkPicker('lease'));$('#propertyLinkClose')?.addEventListener('click',()=>$('#propertyLinkDlg').close());$('#propertyLinkSearch')?.addEventListener('input',renderPropertyLinkPicker);

// Extend property detail opening without replacing the stable v1.19.46 implementation.
const __v11946OpenAssetEdit=window.openAssetEdit;window.openAssetEdit=async function(i=-1){await __v11946OpenAssetEdit(i);if(i>=0)await refreshPropertyLinkedData()};

// ============================================================
// v1.19.49 RC — unified search result panels, compact clauses,
// and defensive navigation reset across full-page modules.
// ============================================================
function v11949EnsureSearchDialog(){
  let d=document.getElementById('contextSearchDlg'); if(d)return d;
  d=document.createElement('dialog'); d.id='contextSearchDlg'; d.className='context-search-dialog';
  d.innerHTML='<div class="context-search-head"><div><small>PENCARIAN</small><h2 id="contextSearchTitle">Hasil Pencarian</h2><div id="contextSearchSummary" class="muted"></div></div><button type="button" class="secondary" id="contextSearchClose">Tutup</button></div><div id="contextSearchResults" class="context-search-results"></div>';
  document.body.appendChild(d); d.querySelector('#contextSearchClose').onclick=()=>d.close(); return d;
}
function v11949Esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v11949Hi(s,q){let safe=v11949Esc(s),terms=String(q||'').trim().split(/\s+/).filter(Boolean).sort((a,b)=>b.length-a.length);for(let t of terms){let e=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');safe=safe.replace(new RegExp(`(${e})`,'ig'),'<mark>$1</mark>')}return safe}
function v11949Label(el){let lab=el.closest('label');if(lab){let c=lab.cloneNode(true);c.querySelectorAll('input,textarea,select,button').forEach(x=>x.remove());let t=c.textContent.trim();if(t)return t}return el.getAttribute('placeholder')||el.name||el.className||'Data'}
function v11949Section(el){let sec=el.closest('.collapsible-section');if(sec)return sec.querySelector('.collapsible-title')?.textContent?.trim()||'Akta Sewa';let h=el.closest('.master-section')?.querySelector('h3');return h?.textContent?.trim()||'Detail'}
function v11949OpenTarget(el){let sec=el.closest('.collapsible-section');if(sec)sec.classList.remove('is-collapsed');let det=el.closest('details');if(det)det.open=true;el.classList.add('lease-search-current');el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>el.classList.remove('lease-search-current'),2200)}
window.v11949OpenSearchTarget=function(id){let el=document.querySelector(`[data-search-target="${id}"]`);document.getElementById('contextSearchDlg')?.close();if(el)setTimeout(()=>v11949OpenTarget(el),80)};
function v11949Collect(root,q){let terms=q.toLowerCase().split(/\s+/).filter(Boolean),out=[],seen=new Set(),n=0;root.querySelectorAll('input:not([type=file]):not([type=hidden]),textarea,select').forEach(el=>{let val=el.tagName==='SELECT'?(el.options[el.selectedIndex]?.text||el.value):el.value;if(!val)return;let hay=(v11949Label(el)+' '+val).toLowerCase();if(!terms.every(t=>hay.includes(t)))return;let key=v11949Section(el)+'|'+v11949Label(el)+'|'+val;if(seen.has(key))return;seen.add(key);let id='v11949-'+(++n)+'-'+Date.now();el.dataset.searchTarget=id;out.push({id,section:v11949Section(el),label:v11949Label(el),text:val})});return out}
function v11949ShowResults(title,q,hits){let d=v11949EnsureSearchDialog();d.querySelector('#contextSearchTitle').textContent=title;d.querySelector('#contextSearchSummary').textContent=`Ditemukan ${hits.length} hasil untuk “${q}”`;d.querySelector('#contextSearchResults').innerHTML=hits.length?hits.map(h=>`<article class="context-search-card"><div class="context-search-source">${v11949Esc(h.section)}</div><h3>${v11949Hi(h.label,q)}</h3><div class="context-search-snippet">${v11949Hi(h.text,q)}</div><button type="button" class="secondary" onclick="v11949OpenSearchTarget('${h.id}')">Buka di data</button></article>`).join(''):'<div class="context-search-empty">Tidak ada data yang cocok.</div>';d.showModal()}
function v11949LeaseSearch(){let q=String(document.getElementById('leaseLocalSearch')?.value||'').trim();let c=document.getElementById('leaseLocalSearchCount');if(!q){if(c)c.textContent='Ketik untuk mencari seluruh Akta';return}let hits=v11949Collect(document.getElementById('form'),q);if(c)c.textContent=`${hits.length} hasil`;v11949ShowResults('Hasil Pencarian dalam Akta Ini',q,hits)}
let __v11949SearchTimer;document.getElementById('leaseLocalSearch')?.addEventListener('input',e=>{clearTimeout(__v11949SearchTimer);let q=e.target.value.trim();if(!q){document.getElementById('leaseLocalSearchCount').textContent='Ketik untuk mencari seluruh Akta';return}__v11949SearchTimer=setTimeout(v11949LeaseSearch,350)},true);
document.getElementById('leaseSearchPrev')?.addEventListener('click',v11949LeaseSearch,true);document.getElementById('leaseSearchNext')?.addEventListener('click',v11949LeaseSearch,true);
function v11949AssetSearch(){let q=String(document.getElementById('assetDetailSearch')?.value||'').trim();if(!q)return;let hits=v11949Collect(document.getElementById('assetForm'),q);let a=assetEdit>=0?assets[assetEdit]:null;if(a){data.forEach((x,i)=>{if(String(x.assetId||'')===String(a.id)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))hits.push({id:'lease-rel-'+i,section:'Akta Sewa Terkait',label:x.tenant||'Akta Sewa',text:`Akta ${x.deedNo||'-'} · ${x.start||'-'} s.d. ${x.end||'-'}`})})}v11949ShowResults('Hasil Pencarian dalam Properti Ini',q,hits)}
let __v11949AssetTimer;document.getElementById('assetDetailSearch')?.addEventListener('input',e=>{clearTimeout(__v11949AssetTimer);if(!e.target.value.trim())return;__v11949AssetTimer=setTimeout(v11949AssetSearch,350)},true);
function v11949CompactClauses(){document.querySelectorAll('#clauses .repeat-row.clause').forEach(row=>{if(row.dataset.compactReady)return;row.dataset.compactReady='1';row.classList.add('clause-compact');let title=row.querySelector('.title'),imp=row.querySelector('.importance'),detail=row.querySelector('.detail'),page=row.querySelector('.page');let head=document.createElement('div');head.className='clause-compact-head';head.innerHTML=`<div class="clause-read-title"></div><div class="clause-read-meta"></div><button type="button" class="secondary clause-edit-toggle">Edit</button>`;let read=document.createElement('div');read.className='clause-read-detail';row.insertBefore(head,row.firstChild);head.after(read);let sync=()=>{head.querySelector('.clause-read-title').textContent=title?.value||'Klausul';head.querySelector('.clause-read-meta').textContent=[imp?.value,page?.value?`Hal./Pasal ${page.value}`:''].filter(Boolean).join(' · ');read.textContent=detail?.value||'-'};sync();[title,imp,detail,page].forEach(x=>{x?.addEventListener('input',sync);x?.addEventListener('change',sync)});head.querySelector('.clause-edit-toggle').onclick=()=>{row.classList.toggle('is-editing');head.querySelector('.clause-edit-toggle').textContent=row.classList.contains('is-editing')?'Selesai':'Edit'};})}
const __v11949AddRepeat=window.addRepeat||addRepeat;window.addRepeat=function(...args){let r=__v11949AddRepeat(...args);if(args[2]==='clause')setTimeout(v11949CompactClauses,0);return r};
const __v11949OpenEdit=window.openEdit;window.openEdit=async function(...args){let r=await __v11949OpenEdit(...args);setTimeout(v11949CompactClauses,30);return r};setTimeout(v11949CompactClauses,0);
function v11949DashboardReset(){document.querySelectorAll('#assetDlg,#leasePage,#pbbPage,#assetPage,#dlg').forEach(el=>{if(el)el.hidden=true});document.body.classList.remove('asset-detail-open','lease-detail-open');let shell=document.getElementById('appShell');if(shell)shell.hidden=false;let main=document.querySelector('#appShell main');if(main)main.hidden=false;window.scrollTo({top:0,behavior:'auto'})}
const __v11949ShowDashboard=window.showDashboard||showDashboard;window.showDashboard=function(){try{__v11949ShowDashboard()}finally{v11949DashboardReset()}};
['assetBack','leaseListBack','pbbBack'].forEach(id=>{let b=document.getElementById(id);if(b)b.onclick=window.showDashboard});
window.addEventListener('popstate',()=>{if(!document.getElementById('assetDlg')?.hidden||!document.getElementById('assetPage')?.hidden||!document.getElementById('leasePage')?.hidden||!document.getElementById('pbbPage')?.hidden)v11949DashboardReset()});


// ============================================================
// v1.19.51 RC — readable building cards + AI building reader +
// staged checkbox/apply relation pickers and consistency audit.
// ============================================================
function toggleBuildingEdit(btn){let row=btn.closest('.building');if(!row)return;row.classList.toggle('is-editing');btn.textContent=row.classList.contains('is-editing')?'Selesai':'Edit'} window.toggleBuildingEdit=toggleBuildingEdit;
function applyBuildingAI(row,x){x=normalizeAIObject(x||{});let map={name:'name',buildingType:'buildingType',buildingArea:'buildingArea',address:'address',notes:'notes'};for(let [k,c] of Object.entries(map)){if(x[k]!==undefined&&x[k]!==null&&x[k]!==''){let e=row.querySelector('.'+c);if(e)e.value=x[k]}}let n=row.querySelector('.name')?.value||'Bangunan',t=row.querySelector('.buildingType')?.value||'',a=row.querySelector('.buildingArea')?.value||'';row.querySelector('.building-read-title').textContent=n;row.querySelector('.building-read-meta').textContent=t+(a?' · '+numberID(a)+' m²':'');row.querySelector('.building-read-address').textContent=row.querySelector('.address')?.value||'Alamat/keterangan belum diisi';row.classList.add('is-editing')}
async function extractBuildingRow(btn){let row=btn.closest('.building'),file=row.querySelector('.buildingAiFile')?.files?.[0],st=row.querySelector('.building-ai-status');if(!file)return alert('Pilih file PDF atau foto dokumen bangunan terlebih dahulu.');btn.disabled=true;try{let x=await invokeDocumentAI(file,'building',m=>aiProgress(st,m));applyBuildingAI(row,x);recordAIScan();aiProgressDone(st,'Dokumen bangunan selesai dibaca. Periksa hasil sebelum menyimpan Properti.')}catch(e){aiProgressError(st,'Gagal membaca dokumen bangunan: '+e.message)}finally{btn.disabled=false}} window.extractBuildingRow=extractBuildingRow;
async function extractBuildingDriveRow(btn){let row=btn.closest('.building'),url=row.querySelector('.driveUrl')?.value?.trim(),st=row.querySelector('.building-ai-status');if(!driveFileId(url))return alert('Masukkan link Google Drive dokumen bangunan terlebih dahulu.');btn.disabled=true;try{let r=await invokeDriveAI(url,'building',m=>aiProgress(st,m));applyBuildingAI(row,r.data);if(r.webViewLink)row.querySelector('.driveUrl').value=r.webViewLink;recordAIScan();aiProgressDone(st,'Dokumen bangunan dari Google Drive selesai dibaca. Periksa hasil sebelum menyimpan Properti.')}catch(e){aiProgressError(st,'Gagal membaca dokumen bangunan: '+e.message)}finally{btn.disabled=false}} window.extractBuildingDriveRow=extractBuildingDriveRow;

let propertyLinkDraft=new Map();
const __v11947OpenPropertyLinkPicker=openPropertyLinkPicker;
openPropertyLinkPicker=async function(mode){let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return alert('Simpan Properti terlebih dahulu.');propertyLinkMode=mode;propertyLinkDraft=new Map();let rows=mode==='pbb'?pbbData:data;rows.forEach(r=>propertyLinkDraft.set(String(r.id),String(r.asset_id||r.assetId||'')===String(a.id)));$('#propertyLinkTitle').textContent=mode==='pbb'?'🔗 Hubungkan PBB ke Properti':'🔗 Hubungkan Akta Sewa ke Properti';$('#propertyLinkHelp').textContent='Centang satu atau beberapa data. Perubahan baru disimpan setelah menekan Terapkan.';$('#propertyLinkSearch').value='';await renderPropertyLinkPicker();let dlg=$('#propertyLinkDlg');if(!dlg.querySelector('#propertyLinkApply')){let foot=document.createElement('div');foot.className='property-link-footer';foot.innerHTML='<span id="propertyLinkSelectedCount" class="muted"></span><div><button type="button" class="secondary" id="propertyLinkCancel">Batal</button><button type="button" id="propertyLinkApply">Terapkan</button></div>';dlg.appendChild(foot);foot.querySelector('#propertyLinkCancel').onclick=()=>dlg.close();foot.querySelector('#propertyLinkApply').onclick=applyPropertyLinkDraft}updatePropertyLinkCount();dlg.showModal()}; window.openPropertyLinkPicker=openPropertyLinkPicker;
renderPropertyLinkPicker=async function(){let a=assets[assetEdit],q=$('#propertyLinkSearch').value.trim().toLowerCase(),rows=propertyLinkMode==='pbb'?pbbData:data;let html=rows.filter(r=>!q||propertyLinkText(r,propertyLinkMode).includes(q)).map(r=>{let checked=propertyLinkDraft.get(String(r.id))??false,title,sub;if(propertyLinkMode==='pbb'){let alias=String(r.property_alias||'').trim();title=alias||`NOP ${r.nop||'-'}`;sub=`NOP ${r.nop||'-'} · ${r.tax_year||'-'}${r.object_address?' · '+r.object_address:''}`}else{let alias=String(r.property_alias||r.asset_alias||r.asset||'').trim();title=alias?`${alias} · ${r.tenant||'-'}`:`${r.tenant||'-'} · Akta ${r.deedNo||'-'}`;sub=`Akta ${r.deedNo||'-'} · ${r.start||'-'} s/d ${r.end||'-'}${r.propertyAddress?' · '+r.propertyAddress:''}`};return `<label class="property-link-row staged"><input type="checkbox" ${checked?'checked':''} onchange="stagePropertyLink('${r.id}',this.checked)"><span><b>${historySearchEscape(title)}</b><small>${historySearchEscape(sub)}</small></span></label>`}).join('');$('#propertyLinkResults').innerHTML=html||'<div class="muted">Tidak ada data yang cocok.</div>';updatePropertyLinkCount()};
function stagePropertyLink(id,on){propertyLinkDraft.set(String(id),!!on);updatePropertyLinkCount()} window.stagePropertyLink=stagePropertyLink;
function updatePropertyLinkCount(){let e=$('#propertyLinkSelectedCount');if(e)e.textContent=`${[...propertyLinkDraft.values()].filter(Boolean).length} dipilih`}
async function applyPropertyLinkDraft(){let a=assets[assetEdit],rows=propertyLinkMode==='pbb'?pbbData:data,btn=$('#propertyLinkApply');btn.disabled=true;try{for(let r of rows){let want=!!propertyLinkDraft.get(String(r.id)),has=String(r.asset_id||r.assetId||'')===String(a.id);if(want===has)continue;if(propertyLinkMode==='pbb'){let q=await sb.from('pbb_records').update({asset_id:want?a.id:null}).eq('id',r.id);if(q.error)throw q.error;r.asset_id=want?a.id:null}else{let q=await sb.from('contracts').update({asset_id:want?a.id:null}).eq('id',r.id);if(q.error)throw q.error;r.assetId=want?a.id:''}}$('#propertyLinkDlg').close();await refreshPropertyLinkedData();runAssetDetailSearch()}catch(e){alert('Gagal menerapkan relasi: '+e.message)}finally{btn.disabled=false}} window.applyPropertyLinkDraft=applyPropertyLinkDraft;
// Do not save immediately from checkbox changes in v1.19.51.
setPropertyLink=function(id,on){stagePropertyLink(id,on)}; window.setPropertyLink=setPropertyLink;


// ============================================================
// v1.19.52 RC — PBB property relations are NOP-based, not year-based
// One selector/card per NOP; applying/unlinking affects every yearly PBB row for that NOP.
// ============================================================
function propertyPbbNopGroups(rows=pbbData){
 const groups=new Map();
 for(const r of rows||[]){
  const key=normalizeNop(r.nop||'')||String(r.id||'');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(r);
 }
 return [...groups.entries()].map(([key,items])=>{
  items.sort((a,b)=>Number(b.tax_year||0)-Number(a.tax_year||0));
  return {key,items,representative:items[0]};
 });
}

refreshPropertyLinkedData=async function(){
 let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return;
 let [pr,cr]=await Promise.all([
  sb.from('pbb_records').select('*').eq('asset_id',a.id).order('tax_year',{ascending:false}),
  sb.from('contracts').select('*').eq('asset_id',a.id).order('created_at',{ascending:false})
 ]);
 let ps=pr.data||[],cs=cr.data||[],pg=propertyPbbNopGroups(ps);
 $('#assetPbbSummary').innerHTML=pg.length?pg.map(g=>{let r=g.representative,alias=String(r.property_alias||'').trim();return `<div class="property-linked-card"><span><b>🧾 ${historySearchEscape(alias||('NOP '+(r.nop||'-')))}</b><small>NOP ${historySearchEscape(r.nop||'-')}${r.object_address?' · '+historySearchEscape(r.object_address):''}</small></span><button type="button" class="secondary" onclick="openPbbById('${r.id}')">Buka</button><button type="button" class="secondary" onclick="unlinkPropertyPbbNop('${historySearchEscape(g.key)}')">Lepas</button></div>`}).join(''):'<div class="muted">Belum ada PBB yang dihubungkan ke properti ini.</div>';
 $('#assetLeaseSummary').innerHTML=cs.length?cs.map(r=>`<div class="property-linked-card"><span><b>📝 ${historySearchEscape(r.tenant||'-')}</b><small>Akta ${historySearchEscape(r.deed_no||'-')} · ${isoToID(r.start_date)||'-'} s/d ${isoToID(r.end_date)||'-'}</small></span><button type="button" class="secondary" onclick="openLeaseById('${r.id}')">Buka</button><button type="button" class="secondary" onclick="unlinkPropertyLease('${r.id}')">Lepas</button></div>`).join(''):'<div class="muted">Belum ada Akta Sewa yang dihubungkan ke properti ini.</div>';
}; window.refreshPropertyLinkedData=refreshPropertyLinkedData;

async function unlinkPropertyPbbNop(nopKey){
 if(!confirm('Lepas hubungan NOP ini dari properti? Seluruh histori tahun PBB tetap tersimpan dan tidak akan dihapus.'))return;
 let ids=pbbData.filter(r=>(normalizeNop(r.nop||'')||String(r.id||''))===String(nopKey)).map(r=>r.id);
 if(!ids.length)return;
 let q=await sb.from('pbb_records').update({asset_id:null}).in('id',ids);if(q.error)return alert(q.error.message);
 pbbData.forEach(r=>{if(ids.some(id=>String(id)===String(r.id)))r.asset_id=null});
 await refreshPropertyLinkedData();runAssetDetailSearch();
} window.unlinkPropertyPbbNop=unlinkPropertyPbbNop;

const __v11952OpenPropertyLinkPicker=openPropertyLinkPicker;
openPropertyLinkPicker=async function(mode){
 let a=assetEdit>=0?assets[assetEdit]:null;if(!a?.id)return alert('Simpan Properti terlebih dahulu.');
 propertyLinkMode=mode;propertyLinkDraft=new Map();
 if(mode==='pbb'){
  propertyPbbNopGroups().forEach(g=>propertyLinkDraft.set(g.key,g.items.some(r=>String(r.asset_id||'')===String(a.id))));
 }else data.forEach(r=>propertyLinkDraft.set(String(r.id),String(r.asset_id||r.assetId||'')===String(a.id)));
 $('#propertyLinkTitle').textContent=mode==='pbb'?'🔗 Hubungkan PBB ke Properti':'🔗 Hubungkan Akta Sewa ke Properti';
 $('#propertyLinkHelp').textContent=mode==='pbb'?'Centang satu atau beberapa NOP. Setiap NOP hanya ditampilkan satu kali; histori tahun tetap tersimpan. Perubahan baru disimpan setelah menekan Terapkan.':'Centang satu atau beberapa data. Perubahan baru disimpan setelah menekan Terapkan.';
 $('#propertyLinkSearch').value='';await renderPropertyLinkPicker();
 let dlg=$('#propertyLinkDlg');if(!dlg.querySelector('#propertyLinkApply')){let foot=document.createElement('div');foot.className='property-link-footer';foot.innerHTML='<span id="propertyLinkSelectedCount" class="muted"></span><div><button type="button" class="secondary" id="propertyLinkCancel">Batal</button><button type="button" id="propertyLinkApply">Terapkan</button></div>';dlg.appendChild(foot);foot.querySelector('#propertyLinkCancel').onclick=()=>dlg.close();foot.querySelector('#propertyLinkApply').onclick=applyPropertyLinkDraft}updatePropertyLinkCount();dlg.showModal();
}; window.openPropertyLinkPicker=openPropertyLinkPicker;

renderPropertyLinkPicker=async function(){
 let q=$('#propertyLinkSearch').value.trim().toLowerCase(),html='';
 if(propertyLinkMode==='pbb'){
  let groups=propertyPbbNopGroups().filter(g=>{let r=g.representative;return !q||[r.property_alias,r.nop,r.taxpayer_name,r.object_address,r.notes].join(' ').toLowerCase().includes(q)});
  html=groups.map(g=>{let r=g.representative,checked=propertyLinkDraft.get(g.key)??false,alias=String(r.property_alias||'').trim(),title=alias||`NOP ${r.nop||'-'}`,sub=`NOP ${r.nop||'-'}${r.object_address?' · '+r.object_address:''}`;return `<label class="property-link-row staged"><input type="checkbox" ${checked?'checked':''} onchange="stagePropertyLink('${historySearchEscape(g.key)}',this.checked)"><span><b>${historySearchEscape(title)}</b><small>${historySearchEscape(sub)}</small></span></label>`}).join('');
 }else{
  html=data.filter(r=>!q||propertyLinkText(r,'lease').includes(q)).map(r=>{let checked=propertyLinkDraft.get(String(r.id))??false,alias=String(r.property_alias||r.asset_alias||r.asset||'').trim(),title=alias?`${alias} · ${r.tenant||'-'}`:`${r.tenant||'-'} · Akta ${r.deedNo||'-'}`,sub=`Akta ${r.deedNo||'-'} · ${r.start||'-'} s/d ${r.end||'-'}${r.propertyAddress?' · '+r.propertyAddress:''}`;return `<label class="property-link-row staged"><input type="checkbox" ${checked?'checked':''} onchange="stagePropertyLink('${r.id}',this.checked)"><span><b>${historySearchEscape(title)}</b><small>${historySearchEscape(sub)}</small></span></label>`}).join('');
 }
 $('#propertyLinkResults').innerHTML=html||'<div class="muted">Tidak ada data yang cocok.</div>';updatePropertyLinkCount();
}; window.renderPropertyLinkPicker=renderPropertyLinkPicker;

applyPropertyLinkDraft=async function(){
 let a=assets[assetEdit],btn=$('#propertyLinkApply');btn.disabled=true;
 try{
  if(propertyLinkMode==='pbb'){
   for(const g of propertyPbbNopGroups()){
    let want=!!propertyLinkDraft.get(g.key),ids=g.items.map(r=>r.id),needs=g.items.some(r=>(String(r.asset_id||'')===String(a.id))!==want);
    if(!needs)continue;let q=await sb.from('pbb_records').update({asset_id:want?a.id:null}).in('id',ids);if(q.error)throw q.error;g.items.forEach(r=>r.asset_id=want?a.id:null);
   }
  }else{
   for(let r of data){let want=!!propertyLinkDraft.get(String(r.id)),has=String(r.asset_id||r.assetId||'')===String(a.id);if(want===has)continue;let q=await sb.from('contracts').update({asset_id:want?a.id:null}).eq('id',r.id);if(q.error)throw q.error;r.assetId=want?a.id:''}
  }
  $('#propertyLinkDlg').close();await refreshPropertyLinkedData();runAssetDetailSearch();
 }catch(e){alert('Gagal menerapkan relasi: '+e.message)}finally{btn.disabled=false}
}; window.applyPropertyLinkDraft=applyPropertyLinkDraft;

// ============================================================
// v1.19.53 RC — move Save/Cancel/Apply action bars to the top.
// Existing buttons are MOVED (not cloned), so all listeners remain intact.
// ============================================================
function v11953CompactActions(){
 const moveIntoTopbar=(formSel,barSel)=>{
  const form=document.querySelector(formSel),top=document.querySelector(barSel);if(!form||!top)return;
  const a=[...form.querySelectorAll('.actions')].find(x=>x.closest('form')===form);if(!a||a.classList.contains('v11953-moved'))return;
  a.classList.add('compact-form-actions','v11953-moved');
  a.querySelectorAll('button[type="submit"]').forEach(b=>b.setAttribute('form',form.id));
  top.appendChild(a);
 };
 moveIntoTopbar('#form','.lease-detail-topbar');
 // Asset Detail already has one canonical Save button in its top bar. Do not move the form action bar here.
 // This prevents the old Batal + Simpan pair from creating a second Save and an ambiguous X.

 document.querySelectorAll('dialog').forEach(dlg=>{
  if(dlg.id==='propertyLinkDlg')return;
  const form=dlg.querySelector('form');
  let a=form?[...form.querySelectorAll('.actions')].find(x=>x.closest('form')===form):[...dlg.querySelectorAll('.actions')].find(x=>x.closest('dialog')===dlg&&!x.closest('form'));
  if(!a||a.classList.contains('v11953-moved'))return;
  a.classList.add('compact-form-actions','v11953-moved');
  const title=dlg.querySelector('.dialog-title');
  if(form){a.querySelectorAll('button[type="submit"]').forEach(b=>b.setAttribute('form',form.id));if(title&&title.closest('form')===form)title.after(a);else form.prepend(a)}
  else if(title)title.after(a);else dlg.prepend(a);
 });
 // Relation picker: keep selection count + Batal/Terapkan immediately below its heading/search area.
 const pd=document.querySelector('#propertyLinkDlg'),pf=pd?.querySelector('.property-link-footer');
 if(pd&&pf&&!pf.classList.contains('v11953-moved')){pf.classList.add('compact-form-actions','v11953-moved');const s=pd.querySelector('#propertyLinkSearch');if(s)s.after(pf);else pd.prepend(pf)}
}
document.addEventListener('DOMContentLoaded',()=>{v11953CompactActions();new MutationObserver(v11953CompactActions).observe(document.body,{childList:true,subtree:true})});


// ============================================================
// v1.19.57 RC — Legal permits, property agents & compact AI toolbar
// ============================================================
function applyAIObjectToRow(row,x,map){x=normalizeAIObject(x||{});for(const [src,cls] of Object.entries(map)){let el=row.querySelector('.'+cls);if(!el||x[src]==null||x[src]==='')continue;let v=x[src];if(/Date$|Until$|From$/.test(src))v=isoToID(v)||v;el.value=v}bindAllDateInputs(row)}
async function extractPermitRow(btn){let row=btn.closest('.permit'),f=row.querySelector('.permitAiFile')?.files?.[0],st=row.querySelector('.permit-ai-status');if(!f)return alert('Pilih file izin/dokumen terlebih dahulu.');btn.disabled=true;try{let x=await invokeDocumentAI(f,'permit',m=>aiProgress(st,m));applyAIObjectToRow(row,x,{category:'category',documentType:'documentType',documentNo:'documentNo',issuer:'issuer',holder:'holder',issueDate:'issueDate',validFrom:'validFrom',validUntil:'validUntil',status:'status',relatedObject:'relatedObject',notes:'notes'});recordAIScan();aiProgressDone(st,'Selesai. Periksa hasil AI sebelum menyimpan.')}catch(e){aiProgressError(st,'Gagal: '+e.message)}finally{btn.disabled=false}} window.extractPermitRow=extractPermitRow;
async function extractAgentRow(btn){let row=btn.closest('.agent'),f=row.querySelector('.agentAiFile')?.files?.[0],st=row.querySelector('.agent-ai-status');if(!f)return alert('Pilih file perjanjian agen terlebih dahulu.');btn.disabled=true;try{let x=await invokeDocumentAI(f,'agent_agreement',m=>aiProgress(st,m));applyAIObjectToRow(row,x,{agencyName:'agencyName',brokerName:'brokerName',businessLicenseNo:'businessLicenseNo',competencyNo:'competencyNo',agreementNo:'agreementNo',agreementDate:'agreementDate',startDate:'startDate',endDate:'endDate',transactionType:'transactionType',exclusivity:'exclusivity',transactionValue:'transactionValue',commissionPct:'commissionPct',commissionAmount:'commissionAmount',commissionPayer:'commissionPayer',commissionStatus:'commissionStatus',commissionPaidDate:'commissionPaidDate',paymentTerms:'paymentTerms',importantClauses:'importantClauses'});recordAIScan();aiProgressDone(st,'Selesai. Periksa komisi, periode, eksklusivitas dan klausul sebelum menyimpan.')}catch(e){aiProgressError(st,'Gagal: '+e.message)}finally{btn.disabled=false}} window.extractAgentRow=extractAgentRow;
async function extractPermitDriveRow(btn){let row=btn.closest('.permit'),url=row.querySelector('.driveUrl')?.value?.trim(),st=row.querySelector('.permit-ai-status');if(!driveFileId(url))return alert('Masukkan link Google Drive izin/dokumen terlebih dahulu.');btn.disabled=true;try{let r=await invokeDriveAI(url,'permit',m=>aiProgress(st,m));applyAIObjectToRow(row,r.data,{category:'category',documentType:'documentType',documentNo:'documentNo',issuer:'issuer',holder:'holder',issueDate:'issueDate',validFrom:'validFrom',validUntil:'validUntil',status:'status',relatedObject:'relatedObject',notes:'notes'});if(r.webViewLink)row.querySelector('.driveUrl').value=r.webViewLink;recordAIScan();aiProgressDone(st,'Dokumen legal dari Google Drive selesai dibaca. Periksa hasil sebelum menyimpan.')}catch(e){aiProgressError(st,'Gagal: '+e.message)}finally{btn.disabled=false}} window.extractPermitDriveRow=extractPermitDriveRow;
async function extractAgentDriveRow(btn){let row=btn.closest('.agent'),url=row.querySelector('.driveUrl')?.value?.trim(),st=row.querySelector('.agent-ai-status');if(!driveFileId(url))return alert('Masukkan link Google Drive perjanjian agen terlebih dahulu.');btn.disabled=true;try{let r=await invokeDriveAI(url,'agent_agreement',m=>aiProgress(st,m));applyAIObjectToRow(row,r.data,{agencyName:'agencyName',brokerName:'brokerName',businessLicenseNo:'businessLicenseNo',competencyNo:'competencyNo',agreementNo:'agreementNo',agreementDate:'agreementDate',startDate:'startDate',endDate:'endDate',transactionType:'transactionType',exclusivity:'exclusivity',transactionValue:'transactionValue',commissionPct:'commissionPct',commissionAmount:'commissionAmount',commissionPayer:'commissionPayer',commissionStatus:'commissionStatus',commissionPaidDate:'commissionPaidDate',paymentTerms:'paymentTerms',importantClauses:'importantClauses'});if(r.webViewLink)row.querySelector('.driveUrl').value=r.webViewLink;recordAIScan();aiProgressDone(st,'Perjanjian agen dari Google Drive selesai dibaca. Periksa hasil sebelum menyimpan.')}catch(e){aiProgressError(st,'Gagal: '+e.message)}finally{btn.disabled=false}} window.extractAgentDriveRow=extractAgentDriveRow;
function v11957ClarifyRemoveButtons(){document.querySelectorAll('.repeat-row.landtitle>button:last-child,.repeat-row.building>button:last-child,.repeat-row.permit>button:last-child,.repeat-row.agent>button:last-child').forEach(b=>{if(b.textContent.trim()==='−')b.textContent=b.closest('.permit')?'Hapus Izin':b.closest('.agent')?'Hapus Perjanjian':b.closest('.building')?'Hapus Bangunan':'Hapus Sertifikat';b.classList.add('danger-remove')})}
document.addEventListener('DOMContentLoaded',()=>{v11957ClarifyRemoveButtons();new MutationObserver(v11957ClarifyRemoveButtons).observe(document.body,{childList:true,subtree:true})});


// ============================================================
// v1.19.59 RC — Akta compact command bar and Mac keyboard shortcuts.
// Cmd+Option+K = Kembali; Cmd+Option+S = Simpan Akta.
// Ctrl+Alt equivalents are also accepted on non-Mac keyboards.
// ============================================================
function v11959LeaseCommandBar(){
 const form=document.querySelector('#form');
 const save=form?.querySelector('.compact-form-actions button[type="submit"]');
 if(save&&!save.classList.contains('lease-save-action')){
  save.classList.add('lease-save-action');
  save.setAttribute('aria-label','Simpan Akta');
  save.setAttribute('data-tooltip','Simpan Akta · ⌘⌥S');
  save.innerHTML='<span class="action-icon" aria-hidden="true">💾</span><span class="action-label"><u>S</u>impan</span>';
 }
}
document.addEventListener('DOMContentLoaded',()=>{
 v11959LeaseCommandBar();
 new MutationObserver(v11959LeaseCommandBar).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{
  const modifier=false; // v1.19.62: legacy shortcut handler disabled; global dispatcher owns shortcuts
  if(!modifier)return;
  const lease=document.querySelector('#dlg');
  if(!lease||lease.hidden)return;
  const k=String(e.key||'').toLowerCase();
  if(k==='k'){
   e.preventDefault();
   document.querySelector('#leaseBackBtn')?.click();
  }else if(k==='s'){
   e.preventDefault();
   const form=document.querySelector('#form');
   if(form){ if(form.requestSubmit) form.requestSubmit(); else form.querySelector('button[type="submit"]')?.click(); }
  }
 },true);
});

// ============================================================
// v1.19.60 RC — Global compact buttons/layout + keyboard shortcuts.
// Applies the v1.19.59 command-bar idea consistently without changing
// existing button IDs/listeners. Shortcuts: Cmd+Option (Mac) or Ctrl+Alt.
// ============================================================
const V11960_COMMANDS=[
 {re:/simpan properti/i,icon:'💾',key:'p',word:'Simpan Properti'},
 {re:/simpan akta/i,icon:'💾',key:'s',word:'Simpan Akta'},
 {re:/simpan pbb/i,icon:'💾',key:'b',word:'Simpan PBB'},
 {re:/\b(kembali|kembali ke daftar)/i,icon:'←',key:'k',word:'Kembali'},
 {re:/\bbatal\b/i,icon:'✕',key:'a',word:'Batal'},
 {re:/\btutup\b/i,icon:'✕',key:'t',word:'Tutup'},
 {re:/buka semua/i,icon:'__OPEN_ALL__',key:'u',word:'Buka Semua'},
 {re:/tutup semua/i,icon:'__CLOSE_ALL__',key:'m',word:'Tutup Semua'},
 {re:/cari klausul|cari data|\bcari\b/i,icon:'⌕',key:'c',word:'Cari'},
 {re:/hubungkan google drive/i,icon:'🔗',key:'g',word:'Hubungkan Google Drive'},
 {re:/baca.*google drive|baca dari google drive/i,icon:'✨',key:'d',word:'Baca dari Google Drive'},
 {re:/baca (file|pdf|sertifikat)|baca otomatis/i,icon:'✨',key:'r',word:'Baca'},
 {re:/verifikasi ulang/i,icon:'⌕',key:'v',word:'Verifikasi'},
 {re:/riwayat.*bandingkan|bandingkan/i,icon:'◷',key:'i',word:'Riwayat & Bandingkan'},
 {re:/export excel/i,icon:'▦',key:'e',word:'Export Excel'},
 {re:/\bprint\b|cetak/i,icon:'🖨',key:'n',word:'Print'},
 {re:/backup/i,icon:'⬇',key:'x',word:'Backup'},
 {re:/restore/i,icon:'↻',key:'o',word:'Restore'},
 {re:/tambah|\+ /i,icon:'＋',key:'h',word:'Tambah'},
 {re:/hapus/i,icon:'🗑',key:'j',word:'Hapus'},
 {re:/\bedit\b/i,icon:'✎',key:'l',word:'Edit'}
];
function v11960UnderlineLabel(label,key){
 const i=label.toLocaleLowerCase('id').indexOf(key);if(i<0)return label;
 return label.slice(0,i)+'<u>'+label[i]+'</u>'+label.slice(i+1);
}
function v11960EnhanceButtons(root=document){
 // v1.19.76: disabled legacy icon rewriter; canonical icons are authored once at render time.
 return;
 root.querySelectorAll('button').forEach(b=>{
  if(b.classList.contains('v11960-ready'))return;
  const raw=(b.textContent||'').replace(/\s+/g,' ').trim();if(!raw)return;
  const spec=V11960_COMMANDS.find(x=>x.re.test(raw));if(!spec)return;
  b.classList.add('v11960-command','v11960-ready');
  // Icon-first mobile is reserved for short navigation/action commands; destructive and AI actions keep labels.
  if(/^(Kembali|Batal|Tutup|Cari|Edit)$/.test(spec.word))b.classList.add('v11960-mobile-icon');
  const clean=raw.replace(/^[^\p{L}\p{N}＋←✕⌕▾▴]+/u,'').trim()||spec.word;
  const label=clean.length>34?spec.word:clean;
  b.setAttribute('aria-label',label);
  b.dataset.tooltip=label+' · ⌘⌥'+spec.key.toUpperCase();
  b.dataset.v11960Shortcut=spec.key;
  b.title=label+' — shortcut ⌘⌥'+spec.key.toUpperCase();
  b.innerHTML='<span class="v11960-icon" aria-hidden="true">'+spec.icon+'</span><span class="v11960-label">'+v11960UnderlineLabel(label,spec.key)+'</span>';
 });
}
function v11960Visible(el){return !!(el&&el.isConnected&&!el.disabled&&el.offsetParent!==null)}
function v11960RunShortcut(key){
 const candidates=[...document.querySelectorAll('button[data-v11960-shortcut="'+CSS.escape(key)+'"]')].filter(v11960Visible);
 if(!candidates.length)return false;
 // Prefer the command inside the currently open dialog/detail view.
 const openDialog=document.querySelector('dialog[open]');
 const target=(openDialog&&candidates.find(b=>openDialog.contains(b)))||candidates[candidates.length-1];
 target.click();return true;
}
document.addEventListener('DOMContentLoaded',()=>{
 v11960EnhanceButtons();
 new MutationObserver(m=>{for(const x of m)for(const n of x.addedNodes)if(n.nodeType===1)v11960EnhanceButtons(n.matches?.('button')?n.parentElement:n)}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{
  if(true)return; // v1.19.62: legacy v1.19.60 shortcut handler disabled
  const key=String(e.key||'').toLowerCase();
  if(v11960RunShortcut(key)){e.preventDefault();e.stopPropagation()}
 },true);
});

// ============================================================
// v1.19.63 RC — Global Icon Command System / Shortcut Reliability Fix
// Uses physical KeyboardEvent.code (KeyA, KeyP, etc.) so macOS Option does not
// turn letters into special characters before the shortcut dispatcher sees them.
// Explicit command IDs prevent a previously iconified label from becoming "●".
// ============================================================
const V11963_EXPLICIT={
 assetsBtn:{label:'Properti / Lokasi',icon:'🏠',key:'p'}, pbbBtn:{label:'PBB',icon:'🧾',key:'b'},
 leaseBtn:{label:'Akta Sewa',icon:'📄',key:'a'}, mobileMenuBtn:{label:'Menu',icon:'•••',key:'m'},
 assetBack:{label:'Dashboard',icon:'⌂',key:'d'}, leaseListBack:{label:'Dashboard',icon:'⌂',key:'d'},
 pbbBack:{label:'Dashboard',icon:'⌂',key:'d'},
 leaseBackBtn:{label:'Kembali ke Daftar Akta',icon:'←',key:'k'}
};
const V11961_ICON_RULES=[
 {re:/dashboard/i,icon:'⌂',key:'d'},
 {re:/properti\s*\/\s*lokasi|master properti|detail lokasi/i,icon:'🏠',key:'p'},
 {re:/\bpbb\b/i,icon:'🧾',key:'b'}, {re:/akta sewa/i,icon:'📄',key:'a'}, {re:/menu/i,icon:'•••',key:'m'},
 {re:/users?|pengguna/i,icon:'👥',key:'u'}, {re:/keluar|logout/i,icon:'⇥',key:'q'},
 {re:/simpan/i,icon:'💾',key:'s'}, {re:/kembali/i,icon:'←',key:'k'}, {re:/batal/i,icon:'✕',key:'x'},
 {re:/tutup semua/i,icon:'__CLOSE_ALL__',key:'t'}, {re:/buka semua/i,icon:'__OPEN_ALL__',key:'o'}, {re:/\btutup\b/i,icon:'✕',key:'t'},
 {re:/cari|search/i,icon:'⌕',key:'c'}, {re:/tambah|buat baru|baru|^\s*\+/i,icon:'＋',key:'n'},
 {re:/hapus|delete/i,icon:'🗑',key:'h'}, {re:/edit|ubah/i,icon:'✎',key:'e'}, {re:/print|cetak/i,icon:'🖨',key:'r'},
 {re:/export.*excel|excel/i,icon:'▦',key:'e'}, {re:/backup/i,icon:'⬇',key:'b'}, {re:/restore|pulihkan/i,icon:'↻',key:'r'},
 {re:/hubungkan.*drive/i,icon:'🔗',key:'g'}, {re:/google drive|drive/i,icon:'☁',key:'d'}, {re:/verifikasi/i,icon:'✓',key:'v'},
 {re:/baca.*ai|ai.*baca|baca file|baca pdf|baca sertifikat|baca otomatis/i,icon:'✨',key:'i'},
 {re:/riwayat|history/i,icon:'◷',key:'y'}, {re:/bandingkan|compare/i,icon:'⇄',key:'g'}, {re:/maps?|peta|buka.*lokasi/i,icon:'📍',key:'l'},
 {re:/upload/i,icon:'↑',key:'u'}, {re:/download/i,icon:'↓',key:'d'}, {re:/sebelumnya|prev/i,icon:'‹',key:'p'},
 {re:/berikutnya|next|lanjut/i,icon:'›',key:'n'}, {re:/ok|terapkan|apply|pilih/i,icon:'✓',key:'o'},
 {re:/salin|copy/i,icon:'⧉',key:'c'}, {re:/refresh|muat ulang/i,icon:'↻',key:'r'}
];
function v11961CleanLabel(b){
 const explicit=V11963_EXPLICIT[b.id]; if(explicit)return explicit.label;
 const saved=b.dataset.v11961Label||b.dataset.v11960Label; if(saved&&saved!=='Aksi')return saved;
 const aria=b.getAttribute('aria-label'); if(aria&&aria!=='Aksi')return aria.trim();
 const title=(b.getAttribute('title')||'').split(/\s+[—·-]\s+/)[0]; if(title&&title!=='Aksi')return title.trim();
 return (b.textContent||'').replace(/\s+/g,' ').replace(/^[^\p{L}\p{N}+]+/u,'').trim()||'Aksi';
}
function v11961Rule(label){return V11961_ICON_RULES.find(r=>r.re.test(label))||{icon:'●',key:null}}
function v11961Key(label,preferred){if(preferred)return preferred;const letters=(label.toLocaleLowerCase('id').match(/[a-z0-9]/g)||[]);return letters[0]||'z'}
function v11961Enhance(root=document){
 // v1.19.76: disabled legacy icon rewriter; canonical icons are authored once at render time.
 return;
 const buttons=root.matches?.('button')?[root]:[...root.querySelectorAll?.('button')||[]];
 buttons.forEach(b=>{
  // v1.19.69: collapsible headers are navigation containers, never convert them to icon-only commands.
  if(b.classList.contains('collapsible-header'))return;
  const explicit=V11963_EXPLICIT[b.id];
  if(b.classList.contains('v11963-ready')&&!explicit)return;
  const label=explicit?.label||v11961CleanLabel(b); const rule=explicit||v11961Rule(label); const key=v11961Key(label,rule.key);
  b.dataset.v11961Label=label;b.dataset.v11961Shortcut=key;b.dataset.v11963Code='Key'+key.toUpperCase();
  b.classList.add('v11961-command','v11961-ready','v11963-ready'); b.setAttribute('aria-label',label);
  const hint='⌘⌥'+key.toUpperCase(); b.dataset.tooltip=label+' · '+hint; b.title=label+' — '+hint;
  b.innerHTML='<span class="v11961-icon" aria-hidden="true">'+rule.icon+'</span><span class="v11961-sr">'+label+'</span>';
 });
}
function v11961Visible(el){return !!(el&&el.isConnected&&!el.disabled&&el.offsetParent!==null)}
function v11961Shortcut(key){
 const all=[...document.querySelectorAll('button[data-v11961-shortcut="'+CSS.escape(key)+'"]')].filter(v11961Visible); if(!all.length)return false;
 const dialog=document.querySelector('dialog[open]');
 const detail=[...document.querySelectorAll('#propertyDetailPage:not([hidden]),#dlg:not([hidden]),#assetPage:not([hidden]),#leasePage:not([hidden]),#pbbPage:not([hidden]),.modal:not([hidden])')].pop();
 let target=(dialog&&all.find(x=>dialog.contains(x)))||(detail&&all.find(x=>detail.contains(x)));
 if(!target){const preferred={a:'#leaseBtn',p:'#assetsBtn',b:'#pbbBtn',m:'#mobileMenuBtn',d:'button[aria-label="Dashboard"]'}[key];if(preferred){const x=document.querySelector(preferred);if(v11961Visible(x))target=x;}}
 target=target||all[0]; target.classList.add('v11962-shortcut-flash'); target.focus({preventScroll:true}); target.click();
 setTimeout(()=>target.classList.remove('v11962-shortcut-flash'),900); return true;
}
function v11963KeyFromEvent(e){
 if(/^Key[A-Z]$/.test(e.code||''))return e.code.slice(3).toLowerCase();
 const k=String(e.key||'').toLowerCase(); return /^[a-z0-9]$/.test(k)?k:'';
}
document.addEventListener('DOMContentLoaded',()=>{
 v11961Enhance(document);
 new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)v11961Enhance(n)}))).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{
  if(!((e.metaKey||e.ctrlKey)&&e.altKey)||e.shiftKey)return;
  const key=v11963KeyFromEvent(e); if(!key)return;
  if(v11961Shortcut(key)){e.preventDefault();e.stopImmediatePropagation();}
 },true);
});

// ============================================================
// v1.19.64 RC — Complete Button Icon Audit + Google Drive Identity
// No anonymous dot fallback. Every visible button gets a semantic icon,
// tooltip and context-aware keyboard shortcut. Google Drive actions use
// the recognizable Drive triangle mark.
// ============================================================
const V11964_DRIVE_ICON='<svg class="v11964-drive-svg" viewBox="0 0 87.3 78" aria-hidden="true"><path fill="#0066DA" d="M6.6 66.85 10.45 73.5c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z"/><path fill="#00AC47" d="M43.65 25.05 29.9 1.25A9.5 9.5 0 0 0 26.6 0L13.75 22.25 27.5 46.05z"/><path fill="#EA4335" d="M73.55 76.8a9.5 9.5 0 0 0 3.3-3.3l1.6-2.75 7.65-13.25a9.5 9.5 0 0 0 1.2-4.5H59.8L46.05 76.8z"/><path fill="#00832D" d="M43.65 25.05 57.4 1.25A9.5 9.5 0 0 0 54.1 0H33.2a9.5 9.5 0 0 0-3.3 1.25z"/><path fill="#2684FC" d="M59.8 53H27.5L13.75 76.8a9.5 9.5 0 0 0 4.5 1.2h50.8a9.5 9.5 0 0 0 4.5-1.2z"/><path fill="#FFBA00" d="M73.4 26.55 60.55 4.3a9.5 9.5 0 0 0-3.15-3.05L43.65 25.05 59.8 53h27.5a9.5 9.5 0 0 0-1.2-4.5z"/></svg>';
const V11964_RULES=[
 {re:/dashboard/i,icon:'⌂',key:'d'}, {re:/properti\s*\/\s*lokasi|master properti|detail lokasi|buka properti/i,icon:'🏠',key:'p'},
 {re:/\bpbb\b|sppt|bukti bayar/i,icon:'🧾',key:'b'}, {re:/akta sewa|buka akta/i,icon:'📄',key:'a'}, {re:/menu/i,icon:'•••',key:'m'},
 {re:/google drive|\bdrive\b/i,icon:'__DRIVE__',key:'g'}, {re:/maps?|peta|lokasi/i,icon:'📍',key:'l'},
 {re:/dokumen|sertifikat/i,icon:'📄',key:'f'}, {re:/denah/i,icon:'🗺️',key:'d'},
 {re:/simpan/i,icon:'💾',key:'s'}, {re:/kembali/i,icon:'←',key:'k'}, {re:/batal|tutup tanpa perubahan/i,icon:'✕',key:'x'},
 {re:/tutup semua/i,icon:'__CLOSE_ALL__',key:'t'}, {re:/buka semua/i,icon:'__OPEN_ALL__',key:'o'}, {re:/\btutup\b/i,icon:'✕',key:'t'},
 {re:/cari|search/i,icon:'⌕',key:'c'}, {re:/tambah|buat baru|baru|^\s*\+/i,icon:'＋',key:'n'}, {re:/hapus|delete/i,icon:'🗑',key:'h'},
 {re:/edit|ubah/i,icon:'✎',key:'e'}, {re:/\bbuka\b|lihat hasil/i,icon:'↗',key:'o'}, {re:/print|cetak/i,icon:'🖨',key:'r'},
 {re:/export.*excel|excel/i,icon:'▦',key:'e'}, {re:/backup|download backup/i,icon:'⬇',key:'b'}, {re:/restore|pulihkan/i,icon:'↻',key:'r'},
 {re:/verifikasi/i,icon:'✓',key:'v'}, {re:/baca.*ai|ai.*baca|baca file|baca pdf|baca otomatis|baca perjanjian|baca sppt/i,icon:'✨',key:'i'},
 {re:/riwayat|history/i,icon:'◷',key:'y'}, {re:/bandingkan|compare/i,icon:'⇄',key:'g'}, {re:/upload/i,icon:'↑',key:'u'},
 {re:/download/i,icon:'↓',key:'d'}, {re:/sebelumnya|prev/i,icon:'‹',key:'p'}, {re:/berikutnya|next|lanjut/i,icon:'›',key:'n'},
 {re:/ok|terapkan|apply|pilih/i,icon:'✓',key:'o'}, {re:/salin|copy/i,icon:'⧉',key:'c'}, {re:/refresh|muat ulang/i,icon:'↻',key:'r'},
 {re:/users?|pengguna/i,icon:'👥',key:'u'}, {re:/keluar|logout/i,icon:'⇥',key:'q'}, {re:/nonaktifkan/i,icon:'⊘',key:'n'},
 {re:/lepas/i,icon:'⛓',key:'l'}, {re:/termin|pembayaran/i,icon:'💳',key:'p'}, {re:/fasilitas/i,icon:'⚙',key:'f'},
 {re:/kontak/i,icon:'👤',key:'k'}, {re:/rekening/i,icon:'🏦',key:'r'}, {re:/klausul/i,icon:'§',key:'k'}, {re:/agen/i,icon:'🤝',key:'a'},
 {re:/izin|legal/i,icon:'✓',key:'i'}, {re:/bangunan/i,icon:'🏭',key:'b'}
];
function v11964Rule(label){return V11964_RULES.find(r=>r.re.test(label))||null}
function v11964IconHTML(icon){return icon==='__DRIVE__'?V11964_DRIVE_ICON:icon==='__OPEN_ALL__'?V11966_OPEN_ALL_ICON:icon==='__CLOSE_ALL__'?V11966_CLOSE_ALL_ICON:icon}
function v11964Enhance(root=document){
 // v1.19.76: disabled legacy icon rewriter; canonical icons are authored once at render time.
 return;
 const buttons=root.matches?.('button')?[root]:[...root.querySelectorAll?.('button')||[]];
 buttons.forEach(b=>{
  if(b.classList.contains('collapsible-header'))return;
  let label=b.dataset.v11961Label||b.getAttribute('aria-label')||b.getAttribute('title')||'';
  label=String(label).split(/\s+[—·]\s+/)[0].replace(/\s+/g,' ').trim();
  if(!label||label==='Aksi') label=(b.textContent||'').replace(/\s+/g,' ').trim();
  const explicit=V11963_EXPLICIT[b.id]; if(explicit)label=explicit.label;
  let rule=explicit||v11964Rule(label);
  // Never show an unexplained dot. Unknown commands keep a compact text label until explicitly mapped.
  if(!rule){b.classList.remove('v11961-command');b.classList.add('v11964-text-fallback');b.innerHTML='<span class="v11964-fallback-label"></span>';b.querySelector('span').textContent=label||'Aksi';b.setAttribute('aria-label',label||'Aksi');b.title=label||'Aksi';return;}
  const key=(rule.key||v11961Key(label,null)).toLowerCase();
  b.dataset.v11961Label=label;b.dataset.v11961Shortcut=key;b.dataset.v11963Code='Key'+key.toUpperCase();
  b.classList.remove('v11964-text-fallback');b.classList.add('v11961-command','v11964-ready');b.setAttribute('aria-label',label);
  const hint='⌘⌥'+key.toUpperCase();b.dataset.tooltip=label+' · '+hint;b.title=label+' — '+hint;
  b.innerHTML='<span class="v11961-icon" aria-hidden="true">'+v11964IconHTML(rule.icon)+'</span><span class="v11961-sr">'+label+'</span>';
 });
}
document.addEventListener('DOMContentLoaded',()=>{
 v11964Enhance(document);
 new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)v11964Enhance(n)}))).observe(document.body,{childList:true,subtree:true});
});


// ============================================================
// v1.19.66 RC — Global semantic button correction pass.
// Action meaning has priority over object/page words. This prevents e.g.
// "Print Semua PBB" from becoming a PBB receipt icon and "Simpan Excel ke
// Google Drive" from becoming a generic save icon. Drive links always show
// the Google Drive mark. Unknown actions keep their text (never a dot).
// ============================================================
const V11966_OPEN_ALL_ICON = `<svg class="v11966-door-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 4.5 10.5 2v20l-7-2.5zM20.5 4.5 13.5 2v20l7-2.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8.2" cy="12" r=".8" fill="currentColor"/><circle cx="15.8" cy="12" r=".8" fill="currentColor"/></svg>`;
const V11966_CLOSE_ALL_ICON = `<svg class="v11966-door-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3" width="17" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v18" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9.3" cy="12" r=".75" fill="currentColor"/><circle cx="14.7" cy="12" r=".75" fill="currentColor"/></svg>`;
const V11965_EXPLICIT = {
  printAllPbbBtn:{label:'Print Semua PBB',icon:'🖨',key:'r'},
  exportAllPbbExcelBtn:{label:'Export Excel',icon:'▦',key:'e'},
  saveAllPbbDriveBtn:{label:'Simpan Excel ke Google Drive',icon:'__DRIVE__',key:'g'},
  newPbbBtn:{label:'Tambah SPPT / PBB',icon:'＋',key:'n'},
  pbbBack:{label:'Dashboard',icon:'⌂',key:'d'},
  assetBack:{label:'Dashboard',icon:'⌂',key:'d'},
  leaseListBack:{label:'Dashboard',icon:'⌂',key:'d'}
};
const V11965_ACTION_RULES = [
 {re:/print|cetak/i,icon:'🖨',key:'r'},
 {re:/export.*excel/i,icon:'▦',key:'e'},
 {re:/simpan.*google drive|simpan.*drive|upload.*drive/i,icon:'__DRIVE__',key:'g'},
 {re:/buka.*google drive|buka.*drive|google drive|\bdrive\b/i,icon:'__DRIVE__',key:'g'},
 {re:/dashboard/i,icon:'⌂',key:'d'},
 {re:/simpan/i,icon:'💾',key:'s'},
 {re:/kembali/i,icon:'←',key:'k'},
 {re:/batal|tutup tanpa perubahan/i,icon:'✕',key:'x'},
 {re:/hapus|delete/i,icon:'🗑',key:'h'},
 {re:/tambah|buat baru|baru|^\s*\+/i,icon:'＋',key:'n'},
 {re:/cari|search/i,icon:'⌕',key:'c'},
 {re:/edit|ubah/i,icon:'✎',key:'e'},
 {re:/buka semua/i,icon:'__OPEN_ALL__',key:'o'},
 {re:/tutup semua/i,icon:'__CLOSE_ALL__',key:'t'},
 {re:/\btutup\b/i,icon:'✕',key:'t'},
 {re:/verifikasi/i,icon:'✓',key:'v'},
 {re:/baca.*ai|ai.*baca|baca file|baca pdf|baca otomatis|baca perjanjian|baca sppt/i,icon:'✨',key:'i'},
 {re:/riwayat|history/i,icon:'◷',key:'y'},
 {re:/bandingkan|compare/i,icon:'⇄',key:'g'},
 {re:/maps?|peta|buka.*lokasi/i,icon:'📍',key:'l'},
 {re:/backup|download backup/i,icon:'⬇',key:'b'},
 {re:/restore|pulihkan/i,icon:'↻',key:'r'},
 {re:/upload/i,icon:'↑',key:'u'},
 {re:/download/i,icon:'↓',key:'d'},
 {re:/salin|copy/i,icon:'⧉',key:'c'},
 {re:/refresh|muat ulang/i,icon:'↻',key:'r'},
 {re:/ok|terapkan|apply|pilih/i,icon:'✓',key:'o'},
 {re:/keluar|logout/i,icon:'⇥',key:'q'}
];
const V11965_OBJECT_RULES = [
 {re:/properti\s*\/\s*lokasi|master properti|detail lokasi/i,icon:'🏠',key:'p'},
 {re:/\bpbb\b|sppt|bukti bayar/i,icon:'🧾',key:'b'},
 {re:/akta sewa/i,icon:'📄',key:'a'},
 {re:/sertifikat|dokumen/i,icon:'📄',key:'f'},
 {re:/denah/i,icon:'🗺️',key:'d'},
 {re:/users?|pengguna/i,icon:'👥',key:'u'},
 {re:/menu/i,icon:'•••',key:'m'},
 {re:/agen/i,icon:'🤝',key:'a'},
 {re:/izin|legal/i,icon:'✓',key:'i'},
 {re:/bangunan/i,icon:'🏭',key:'b'},
 {re:/fasilitas/i,icon:'⚙',key:'f'},
 {re:/rekening/i,icon:'🏦',key:'r'},
 {re:/klausul/i,icon:'§',key:'k'}
];
function v11965OriginalLabel(b){
 const ex=V11965_EXPLICIT[b.id]; if(ex)return ex.label;
 let x=b.dataset.v11961Label||b.getAttribute('aria-label')||'';
 if(!x||x==='Aksi')x=(b.textContent||'').replace(/\s+/g,' ').trim();
 return String(x).split(/\s+[—·]\s+/)[0].trim()||'Aksi';
}
function v11965IsDriveButton(b,label){
 if(/google drive|\bdrive\b/i.test(label))return true;
 const oc=b.getAttribute('onclick')||'';
 return /drive\.google\.com|googleusercontent\.com/i.test(oc);
}
function v11965Spec(b,label){
 const ex=V11965_EXPLICIT[b.id]; if(ex)return ex;
 if(v11965IsDriveButton(b,label))return {label:label||'Buka di Google Drive',icon:'__DRIVE__',key:'g'};
 return V11965_ACTION_RULES.find(r=>r.re.test(label))||V11965_OBJECT_RULES.find(r=>r.re.test(label))||null;
}
function v11965Enhance(root=document){
 const buttons=root.matches?.('button')?[root]:[...root.querySelectorAll?.('button')||[]];
 buttons.forEach(b=>{
   if(b.classList.contains('collapsible-header'))return;
   const label=v11965OriginalLabel(b), spec=v11965Spec(b,label);
   if(!spec){
     // Safety: no mystery icon. Preserve readable label for unmapped commands.
     b.classList.remove('v11961-command','v11964-ready');
     b.classList.add('v11965-text-fallback');
     b.textContent=label;
     b.setAttribute('aria-label',label);
     b.title=label;
     delete b.dataset.v11961Shortcut;
     return;
   }
   const key=(spec.key||v11961Key(label,null)).toLowerCase();
   b.dataset.v11961Label=label;b.dataset.v11961Shortcut=key;b.dataset.v11963Code='Key'+key.toUpperCase();
   b.classList.remove('v11964-text-fallback','v11965-text-fallback');
   b.classList.add('v11961-command','v11964-ready','v11965-ready');
   b.setAttribute('aria-label',label);
   const hint='⌘⌥'+key.toUpperCase(); b.dataset.tooltip=label+' · '+hint; b.title=label+' — '+hint;
   b.innerHTML='<span class="v11961-icon" aria-hidden="true">'+v11964IconHTML(spec.icon)+'</span><span class="v11961-sr">'+label+'</span>';
 });
}
document.addEventListener('DOMContentLoaded',()=>{
 v11965Enhance(document);
 /* v1.19.75: legacy observer removed; unified observer below */
});


// ============================================================
// v1.19.67 RC — Final global visual-language pass requested 30 Sep 2026.
// Properti = commercial building SVG; Maps = map + property SVG;
// PBB = SPPT-like document SVG; Akta Sewa = generic notarial deed cover SVG;
// open one detail = single open door; collapsible headers keep readable text.
// ============================================================
const V11967_PROPERTY_ICON=`<svg class="v11967-ui-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V9.5l6-2.5V21M11 21V4l8 3v14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.5 12h1M7.5 15h1M14 9h1M17 10h1M14 13h1M17 14h1M14 17h1M17 18h1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const V11967_MAP_ICON=`<svg class="v11967-ui-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 5 5-2 5 2 5-2 3 1.2V19l-5 2-5-2-5 2-3-1.2zM8 3v16M13 5v14M18 3v18" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/><path d="M13.8 15.2v-3.4l2.2-1.7 2.2 1.7v3.4M13.2 12.2l2.8-2.1 2.8 2.1" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/></svg>`;
const V11967_PBB_ICON=`<svg class="v11967-ui-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="2.5" width="15" height="19" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="12" y="7.2" text-anchor="middle" font-size="4.1" font-weight="800" fill="currentColor" font-family="system-ui,sans-serif">PBB</text><path d="M7 9.2h10M7 12h10M7 14.8h6.2M7 17.6h6.2M10.3 9.2v5.6M13.6 9.2v5.6" fill="none" stroke="currentColor" stroke-width="1"/><rect x="14.7" y="16.1" width="2.6" height="2.6" fill="none" stroke="currentColor" stroke-width="1"/><path d="M15.3 16.7h.5v.5h-.5zM16.2 17.6h.5v.5h-.5z" fill="currentColor"/></svg>`;
const V11967_LEASE_ICON=`<svg class="v11967-ui-svg v11967-lease-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.2" y="2.2" width="15.6" height="19.6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9.2 5.2 12 3.8l2.8 1.4-.7 3H9.9zM12 4v4M10.1 6.2h3.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><text x="12" y="12.4" text-anchor="middle" font-size="4" font-weight="850" fill="currentColor" font-family="system-ui,sans-serif">AKTA</text><text x="12" y="15.1" text-anchor="middle" font-size="1.75" font-weight="700" fill="currentColor" font-family="system-ui,sans-serif">PERJANJIAN SEWA</text><path d="M7.5 17.2h9M8.8 19h6.4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`;
const V11967_OPEN_ONE_ICON=`<svg class="v11967-ui-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h10.5V21H5z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m15.5 3.5 4 2.2v13.6l-4 1.7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="17.6" cy="12" r=".7" fill="currentColor"/></svg>`;
function v11967IconHTML(icon){
 if(icon==='__PROPERTY__')return V11967_PROPERTY_ICON;
 if(icon==='__MAP__')return V11967_MAP_ICON;
 if(icon==='__PBB__')return V11967_PBB_ICON;
 if(icon==='__LEASE__')return V11967_LEASE_ICON;
 if(icon==='__OPEN_ONE__')return V11967_OPEN_ONE_ICON;
 return v11964IconHTML(icon);
}
const V11967_EXPLICIT={
 assetsBtn:{label:'Properti / Lokasi',icon:'__PROPERTY__',key:'p'},
 pbbBtn:{label:'PBB / SPPT',icon:'__PBB__',key:'b'},
 leaseBtn:{label:'Akta Sewa',icon:'__LEASE__',key:'a'}
};
function v11967IsCollapsibleHeader(b){return b.classList.contains('collapsible-header')||!!b.closest('.collapsible-header')}
function v11967Spec(b,label){
 if(V11967_EXPLICIT[b.id])return V11967_EXPLICIT[b.id];
 if(v11965IsDriveButton(b,label))return {label:label||'Buka di Google Drive',icon:'__DRIVE__',key:'g'};
 if(/print|cetak/i.test(label))return {icon:'🖨',key:'r'};
 if(/export.*excel/i.test(label))return {icon:'▦',key:'e'};
 if(/buka semua/i.test(label))return {icon:'__OPEN_ALL__',key:'o'};
 if(/tutup semua/i.test(label))return {icon:'__CLOSE_ALL__',key:'t'};
 if(/google maps|\bmaps?\b|\bpeta\b|buka.*lokasi/i.test(label))return {icon:'__MAP__',key:'l'};
 if(/buka\s*(\/\s*edit)?\s*properti|buka properti|buka akta|buka pbb|buka sertifikat|buka di data|buka detail/i.test(label))return {icon:'__OPEN_ONE__',key:'o'};
 if(/properti\s*\/\s*lokasi|master properti|detail lokasi/i.test(label))return {icon:'__PROPERTY__',key:'p'};
 if(/\bpbb\b|sppt|bukti bayar/i.test(label))return {icon:'__PBB__',key:'b'};
 if(/akta sewa/i.test(label))return {icon:'__LEASE__',key:'a'};
 return V11965_ACTION_RULES.find(r=>r.re.test(label))||V11965_OBJECT_RULES.find(r=>r.re.test(label))||null;
}
function v11967RestoreCollapsibleHeader(b){
 const title=b.querySelector('.collapsible-title'),summary=b.querySelector('.collapsible-summary'),chev=b.querySelector('.collapsible-chevron');
 if(!title||!chev)return;
 const sec=b.closest('.collapsible-section');
 b.classList.remove('v11961-command','v11964-ready','v11965-ready','v11964-text-fallback','v11965-text-fallback');
 b.classList.add('v11967-readable-collapse');
 delete b.dataset.v11961Shortcut;delete b.dataset.v11963Code;delete b.dataset.tooltip;
 b.removeAttribute('title');
 // If an older icon pass replaced the children, reconstruct from stored original title when possible.
 if(!summary){ /* existing generated collapsible headers normally retain all three children */ }
 chev.textContent=sec?.classList.contains('is-collapsed')?'▶':'▼';
}
function v11967Enhance(root=document){ return; /* v1.19.78 disabled legacy icon enhancer */
 // v1.19.76: disabled legacy icon rewriter; canonical icons are authored once at render time.
 return;
 const buttons=root.matches?.('button')?[root]:[...root.querySelectorAll?.('button')||[]];
 buttons.forEach(b=>{
  if(v11967IsCollapsibleHeader(b)){v11967RestoreCollapsibleHeader(b);return;}
  const label=v11965OriginalLabel(b),spec=v11967Spec(b,label);
  if(!spec)return;
  const key=(spec.key||v11961Key(label,null)).toLowerCase();
  b.dataset.v11961Label=label;b.dataset.v11961Shortcut=key;b.dataset.v11963Code='Key'+key.toUpperCase();
  b.classList.remove('v11964-text-fallback','v11965-text-fallback');b.classList.add('v11961-command','v11964-ready','v11965-ready','v11967-ready');
  b.setAttribute('aria-label',label);const hint='⌘⌥'+key.toUpperCase();b.dataset.tooltip=label+' · '+hint;b.title=label+' — '+hint;
  b.innerHTML='<span class="v11961-icon" aria-hidden="true">'+v11967IconHTML(spec.icon)+'</span><span class="v11961-sr">'+label+'</span>';
 });
}
document.addEventListener('DOMContentLoaded',()=>{
 v11967Enhance(document);
 /* v1.19.75: legacy observer removed; unified observer below */
});


// ============================================================
// v1.19.69 RC — Global readable collapsible-header repair.
// Audit safeguard for every page/dialog/window: section headers must always
// retain a visible text title and chevron; icon-command enhancers must not
// turn them into icon-only buttons.
// ============================================================
function v11968HeaderTitle(sec,head){
 const saved=(head?.dataset?.collapseTitle||'').trim(); if(saved)return saved;
 const existing=head?.querySelector?.('.collapsible-title')?.textContent?.trim(); if(existing)return existing;
 const body=sec?.querySelector?.(':scope > .collapsible-content');
 const h=body?.querySelector?.('h1,h2,h3,h4,.section-title,.master-section h3');
 if(h?.textContent?.trim())return h.textContent.replace(/^\s*[📜🏭🧾⚡📋🤝§◷✓●•]+\s*/u,'').trim();
 const key=String(sec?.dataset?.collapseKey||'').toLowerCase();
 const known={
  'lease-ai':'Pembacaan AI / Dokumen','ai':'Pembacaan AI / Dokumen','lease-relations':'Objek, PBB & Fasilitas',
  'lease-supplemental':'Perjanjian di Bawah Tangan / Dokumen Tambahan','notes':'Catatan Tambahan',
  'pbb-ai':'Pembacaan AI SPPT','pbb-data':'Data PBB / SPPT'
 };
 if(known[key])return known[key];
 if(key.startsWith('h3-'))return key.slice(3).split('-').filter(Boolean).map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');
 return (head?.dataset?.v11961Label||head?.getAttribute?.('aria-label')||'Bagian').replace(/\s+[—·].*$/,'').trim()||'Bagian';
}
function v11968RepairHeader(head){
 if(!head?.classList?.contains('collapsible-header'))return;
 const sec=head.closest('.collapsible-section'); if(!sec)return;
 const title=v11968HeaderTitle(sec,head); head.dataset.collapseTitle=title;
 let summary=head.querySelector('.collapsible-summary')?.textContent?.trim()||'';
 // Rebuild headers damaged by earlier global icon passes.
 head.classList.remove('v11961-command','v11961-ready','v11963-ready','v11964-ready','v11965-ready','v11967-ready','v11964-text-fallback','v11965-text-fallback');
 head.classList.add('v11967-readable-collapse','v11968-readable-collapse');
 head.removeAttribute('title'); head.setAttribute('aria-label',(sec.classList.contains('is-collapsed')?'Buka ':'Tutup ')+title);
 head.innerHTML='';
 const t=document.createElement('span');t.className='collapsible-title';t.textContent=title;
 const sm=document.createElement('span');sm.className='collapsible-summary';sm.textContent=summary;
 const ch=document.createElement('span');ch.className='collapsible-chevron';ch.textContent=sec.classList.contains('is-collapsed')?'▶':'▼';
 head.append(t,sm,ch);
}
function v11968Audit(root=document){ return; /* v1.19.78 disabled legacy header rewriter */
 const heads=[];
 if(root.matches?.('.collapsible-header'))heads.push(root);
 root.querySelectorAll?.('.collapsible-header').forEach(h=>heads.push(h));
 heads.forEach(v11968RepairHeader);
}
document.addEventListener('DOMContentLoaded',()=>{
 v11968Audit(document);
 // Run after older observers have finished their pass.
 /* v1.19.75: legacy observer removed; unified observer below */
 document.addEventListener('click',e=>{const h=e.target.closest?.('.collapsible-header');if(h)setTimeout(()=>v11968RepairHeader(h),0)},true);
});

// ============================================================
// v1.19.69 RC — navigation correctness + colorful icon presentation.
// ============================================================
function v11969CloseDetailLayers(){
 const asset=document.querySelector('#assetDlg'),lease=document.querySelector('#dlg');
 if(asset)asset.hidden=true;if(lease)lease.hidden=true;
 document.body.classList.remove('asset-detail-open','lease-detail-open');
 try{document.querySelector('#pbbEditDlg')?.close?.()}catch(_e){}
}
function v11969SetMasterActive(id){
 ['assetsBtn','pbbBtn','leaseBtn'].forEach(x=>document.getElementById(x)?.classList.toggle('v11969-active',x===id));
}
function v11969WrapMasterNav(){
 const map={assetsBtn:'assetPage',pbbBtn:'pbbPage',leaseBtn:'leasePage'};
 Object.entries(map).forEach(([id,page])=>{const b=document.getElementById(id);if(!b||b.dataset.v11969Nav)return;b.dataset.v11969Nav='1';b.addEventListener('click',()=>{v11969CloseDetailLayers();v11969SetMasterActive(id);setTimeout(()=>window.scrollTo(0,0),0)},true)});
}
function v11969ColorMasterIcons(){
 const specs={assetsBtn:[V11967_PROPERTY_ICON,'Properti / Lokasi'],pbbBtn:[V11967_PBB_ICON,'PBB / SPPT'],leaseBtn:[V11967_LEASE_ICON,'Akta Sewa']};
 Object.entries(specs).forEach(([id,[svg,label]])=>{
  const b=document.getElementById(id);if(!b)return;
  b.classList.remove('v11961-command','v11960-command','v11964-ready','v11965-ready','v11967-ready');
  b.classList.add('dashboard-master-nav');
  b.setAttribute('aria-label',label); b.removeAttribute('title'); delete b.dataset.tooltip;
  b.innerHTML=`<span class="dashboard-master-svg" aria-hidden="true">${svg}</span><span class="dashboard-master-label">${label}</span>`;
  b.dataset.v11970ColorIcon='1';
 });
}
function v11969DriveOpen(){const u=document.getElementById('driveUrl')?.value?.trim();if(u)window.open(u,'_blank','noopener');else alert('Link Google Drive belum tersedia.');}
document.addEventListener('DOMContentLoaded',()=>{v11969WrapMasterNav();setTimeout(v11969ColorMasterIcons,50);document.getElementById('driveOpenCompactBtn')?.addEventListener('click',v11969DriveOpen);});

// ============================================================
// v1.19.71 RC — readable utility dropdown + global search icon.
// ============================================================
const V11971_SEARCH_ICON='🔍';
function v11971ReadableUtilityMenu(){
 const specs={
  usersBtn:['👥','Kelola Users'],
  historySearchBtn:[V11971_SEARCH_ICON,'Cari Klausul & Riwayat'],
  backupBtn:['🗄️','Backup & Restore'],
  logoutBtn:['🚪','Keluar']
 };
 Object.entries(specs).forEach(([id,[icon,label]])=>{const b=document.getElementById(id);if(!b)return;b.classList.remove('v11961-command','v11960-command');b.classList.add('v11971-menu-row');b.setAttribute('aria-label',label);b.removeAttribute('title');delete b.dataset.tooltip;b.innerHTML=`<span class="v11971-menu-icon" aria-hidden="true">${icon}</span><span class="v11971-menu-label">${label}</span>`;});
}
function v11971SearchIcons(root=document){ return; /* v1.19.78 disabled legacy search icon rewriter */
 const buttons=root.matches?.('button')?[root]:[...root.querySelectorAll?.('button')||[]];
 buttons.forEach(b=>{
  if(b.closest('.collapsible-header'))return;
  const label=String(b.dataset.v11961Label||b.getAttribute('aria-label')||b.title||b.textContent||'').replace(/\s+/g,' ').trim();
  if(!/cari|search/i.test(label))return;
  const icon=b.querySelector('.v11961-icon');
  if(icon){icon.textContent=V11971_SEARCH_ICON;b.classList.add('v11971-search-command');return;}
  // Preserve readable text buttons; replace only a leading search glyph.
  const first=b.firstChild;if(first?.nodeType===3&&/[🔎⌕]/u.test(first.textContent||'')){first.textContent=(first.textContent||'').replace(/[🔎⌕]/gu,V11971_SEARCH_ICON);b.classList.add('v11971-search-command')}
 });
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{v11971ReadableUtilityMenu();v11971SearchIcons(document)},120);});

// ============================================================
// v1.19.72 RC — approved colorful icon language, global audit.
// Keeps the approved blue-glass headers while replacing legacy monochrome
// object/section glyphs with the agreed colorful semantic icon family.
// ============================================================
const V11972_ICON_RULES=[
 [/identitas.*masa sewa/i,'🏠'],[/jadwal pembayaran/i,'📅'],[/pajak|pph/i,'🪙'],[/klausul penting/i,'📘'],[/dokumen.*riwayat|riwayat.*dokumen/i,'📄'],[/fasilitas/i,'🏢'],[/perawatan/i,'🛠️'],[/utilitas/i,'⚡'],[/asuransi/i,'🛡️'],[/perizinan|legalitas/i,'📋'],[/agen|broker/i,'🤝'],[/catatan/i,'📝'],[/riwayat.*banding|banding.*riwayat/i,'🕘'],[/pengaturan/i,'⚙️'],
 [/bidang|sertifikat|akta tanah/i,'📜'],[/bangunan|gudang|gedung/i,'🏭'],[/pbb|sppt/i,'🧾'],[/akta sewa/i,'📝'],[/properti|lokasi/i,'🏢'],[/peta|maps/i,'🗺️'],[/dokumen|arsip/i,'🗂️']
];
function v11972CleanLabel(s){return String(s||'').replace(/^\s*[🏠📅🪙📘📄🏢🛠️⚡🛡️📋🤝📝🕘⚙️📜🏭🧾🗺️🗂️📍✓●•]+\s*/u,'').trim()}
function v11972IconFor(label){const clean=v11972CleanLabel(label);for(const [re,icon] of V11972_ICON_RULES)if(re.test(clean))return icon;return ''}
function v11972SectionIcons(root=document){ return; /* v1.19.78 no decorative section icons */
 const heads=root.matches?.('.collapsible-header')?[root]:[...root.querySelectorAll?.('.collapsible-header')||[]];
 heads.forEach(h=>{const t=h.querySelector('.collapsible-title');if(!t)return;const clean=v11972CleanLabel(t.textContent),icon=v11972IconFor(clean);if(icon){t.textContent=icon+'  '+clean;t.dataset.v11972Icon='1'}});
 const hs=root.matches?.('h3,h4')?[root]:[...root.querySelectorAll?.('.master-section h3,.relation-grid h4')||[]];
 hs.forEach(h=>{const clean=v11972CleanLabel(h.textContent),icon=v11972IconFor(clean);if(icon)h.textContent=icon+'  '+clean});
}
function v11972ColorObjectButtons(){
 // v1.19.76: disabled legacy icon rewriter; canonical icons are authored once at render time.
 return;
 const specs={assetsBtn:['__PROPERTY__','Master Properti'],pbbBtn:['__PBB__','Master PBB'],leaseBtn:['__LEASE__','Master Akta Sewa']};
 Object.entries(specs).forEach(([id,[icon,label]])=>{const b=document.getElementById(id);if(!b)return;b.innerHTML=`<span class="v11972-color-icon" aria-hidden="true">${icon}</span><span class="v11961-sr">${label}</span>`;b.setAttribute('aria-label',label);b.title=label;b.dataset.v11970ColorIcon='1'});
 // Detail-property leading object icon and all map/location commands should be colorful too.
 document.querySelectorAll('button').forEach(b=>{if(b.classList.contains('collapsible-header'))return;const label=String(b.dataset.v11961Label||b.getAttribute('aria-label')||b.title||b.textContent||'');
   if(/google maps|\bmaps?\b|\bpeta\b|lokasi/i.test(label)&&b.querySelector('.v11961-icon')){b.querySelector('.v11961-icon').textContent='🗺️';b.classList.add('v11972-color-command')}
   if(/properti|detail lokasi/i.test(label)&&b.querySelector('.v11961-icon')){b.querySelector('.v11961-icon').textContent='🏢';b.classList.add('v11972-color-command')}
 });
}
function v11972Audit(root=document){v11972SectionIcons(root);v11972ColorObjectButtons()}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>v11972Audit(document),180));


// v1.19.75 RC — iPhone performance cleanup.
// Consolidates three historical subtree MutationObservers into one debounced observer.
// Only newly-added roots are processed; no full-document rescan on each mutation.
(function v11974UnifiedUIObserver(){
 let queued=new Set(), raf=0;
 function flush(){
   raf=0; const roots=[...queued]; queued.clear();
   for(const root of roots){
     try{v11967Enhance(root)}catch(e){}
     try{v11968Audit(root)}catch(e){}
     try{v11972SectionIcons(root)}catch(e){}
     try{v11971SearchIcons(root)}catch(e){}
   }
 }
 const obs=new MutationObserver(ms=>{
   for(const m of ms) for(const n of m.addedNodes) if(n.nodeType===1) queued.add(n);
   if(queued.size&&!raf) raf=requestAnimationFrame(flush);
 });
 obs.observe(document.body,{childList:true,subtree:true});
 window.__v11974UIObserver=obs;
})();

// ============================================================
// v1.19.75 RC — final canonical icon audit.
// Purpose: every action owns exactly one approved colored icon. Legacy icon
// enhancers must never prepend a second monochrome/colored glyph.
// ============================================================
function v11975StripDuplicateIcons(button){
 if(!button)return;
 button.dataset.v11975Canonical='1';
 // Remove enhancer-injected icon spans only. Keep semantic markup we authored.
 button.querySelectorAll(':scope > .v11961-icon,:scope > .v11972-color-icon').forEach(n=>n.remove());
}
function v11975CanonicalAudit(root=document){
 const ids=['assetDetailBack','assetBack','leaseListBack','pbbBack','assetTopSaveBtn','assetOpenMaps'];
 ids.forEach(id=>{const b=document.getElementById(id);if(b)v11975StripDuplicateIcons(b)});
 const cards=root.matches?.('.asset-master-card')?[root]:[...root.querySelectorAll?.('.asset-master-card')||[]];
 cards.forEach(card=>card.querySelectorAll('.asset-open-approved,.asset-map-approved,.asset-delete-approved').forEach(v11975StripDuplicateIcons));
 // Tooltip policy: canonical controls use aria-label only, avoiding browser title + custom tooltip duplication.
 document.querySelectorAll('[data-v11975-canonical="1"]').forEach(b=>{if(b.hasAttribute('title'))b.removeAttribute('title');if(b.hasAttribute('data-tooltip'))b.removeAttribute('data-tooltip')});
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>v11975CanonicalAudit(document),240)});
// Extend the unified observer cheaply: audit only newly added roots.
(function(){const o=window.__v11974UIObserver;const obs=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)v11975CanonicalAudit(n)});obs.observe(document.body,{childList:true,subtree:true});window.__v11975CanonicalObserver=obs})();



// ============================================================
// v1.19.78 RC — source-level minimal action system.
// No tooltip mutation observers, no global innerHTML icon rewriting.
// ============================================================
(function v11978MinimalActions(){
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function stripTooltipAttrs(root=document){
   const nodes=[]; if(root?.nodeType===1)nodes.push(root); root.querySelectorAll?.('[title],[data-tooltip],[data-tip],[data-original-title]').forEach(n=>nodes.push(n));
   nodes.forEach(n=>{n.removeAttribute('title');n.removeAttribute('data-tooltip');n.removeAttribute('data-tip');n.removeAttribute('data-original-title')});
 }
 function cleanDecorativeHeadings(root=document){
   const re=/^\s*[🏠📅🪙📘📄🏢🛠️⚡🛡️📋🤝📝🕘⚙️📜🏭🧾🗺️🗂️📍🔗]+\s*/u;
   root.querySelectorAll?.('.master-section h3,.relation-grid h4,.collapsible-title').forEach(n=>{n.textContent=String(n.textContent||'').replace(re,'').trim()});
 }
 function setButton(id,cls,html,label){const b=document.getElementById(id);if(!b)return;b.classList.add(cls);b.setAttribute('aria-label',label);b.innerHTML=html;}
 function authoredControls(){
   setButton('newAssetBtn','v11978-add','<span aria-hidden="true">+</span>','Tambah Properti Baru');
   setButton('newPbbBtn','v11978-add','<span aria-hidden="true">+</span>','Tambah SPPT / PBB');
   setButton('addBtn','v11978-add','<span aria-hidden="true">+</span>','Tambah Akta Sewa');
   ['assetAddLandTitle','assetAddBuilding','assetAddPermit','assetAddAgent','assetAddPbb'].forEach(id=>{const b=document.getElementById(id);if(b){b.classList.add('v11978-add-small');b.innerHTML='<span aria-hidden="true">+</span>';}});
   setButton('assetBack','v11978-back','<span aria-hidden="true">←</span>','Kembali ke Dashboard');
   setButton('pbbBack','v11978-back','<span aria-hidden="true">←</span>','Kembali ke Dashboard');
   setButton('leaseListBack','v11978-back','<span aria-hidden="true">←</span>','Kembali ke Dashboard');
   setButton('assetDetailBack','v11978-back','<span aria-hidden="true">←</span>','Kembali ke Master Properti');
   setButton('assetTopSaveBtn','v11978-save','<span aria-hidden="true">💾</span>','Simpan Properti');
 }
 function run(root=document){stripTooltipAttrs(root);cleanDecorativeHeadings(root);authoredControls()}
 document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>run(document),50));
 // No tooltip/title is authored by v1.19.78. One lightweight observer only strips attributes from newly rendered records.
 const obs=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){stripTooltipAttrs(n);cleanDecorativeHeadings(n)}});
 document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{childList:true,subtree:true}));
 window.v11978MinimalActions=run;
})();
