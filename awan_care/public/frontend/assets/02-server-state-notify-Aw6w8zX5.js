const e=`"use strict";
// أوان — الجزء 2 من 16: 02-server-state-notify
// كل ملفات js/ دي بتشتغل كأنها ملف واحد بالترتيب — ما تغيّرش ترتيبها في index.html
    // ===== وضع السيرفر (طبقة الشبكة): أي طلب لـ OpenAI أو جوجل بيعدّي على السيرفر، والمفاتيح ما بتوصلش للأجهزة =====
    const SV={on:false,health:null,user:null,v:0,client:"c-"+Math.random().toString(36).slice(2,10),leader:false,holder:"",snap:{},online:true,es:null,busy:false,again:false,timer:null,lastErr:"",deferRender:false};
    window.__awanSv=SV;
    const _svNative=window.fetch.bind(window);
    window.fetch=function(u,o){try{if(SV.on&&typeof u==="string"){const strip=(h,ks)=>{const x={...((o&&o.headers)||{})};ks.forEach(k=>{delete x[k];delete x[k.toLowerCase()]});return x};
      if(u.startsWith("https://api.openai.com/v1/"))return _svNative("/api/ai/v1/"+u.slice(26),{...(o||{}),headers:strip(o&&o.headers,["Authorization"]),credentials:"same-origin"});
      if(u.startsWith("https://places.googleapis.com/v1/places:searchText"))return _svNative("/api/places/searchText",{...(o||{}),headers:strip(o&&o.headers,["X-Goog-Api-Key"]),credentials:"same-origin"})}}catch(e){}return _svNative(u,o)};
    let state = load();
    function load(){
      try {
        const saved=JSON.parse(localStorage.getItem(KEY)||"null");
        const merged = saved ? merge(seed,saved) : clone(seed);
        migrateLegacyFacilities(merged);
        migrateStaffCodes(merged);
        migratePatientHealth(merged);
        migrateGenLogs(merged);
        migrateInvoices(merged);
        migrateConnect(merged);
        migrateCommHub(merged);
        migrateLibrary(merged);
        // "تذكرني" was unchecked at login -> the session shouldn't survive a fresh page load
        if(merged.facilitySession && !merged.facilitySession.remember){
          merged.facilitySession=null;
          merged.facilityTab="select";
        }
        return merged;
      }
      catch(e){ return clone(seed); }
    }
    // Ensures every patient has a unified health-record object even if this
    // browser's saved data predates the health-record feature.
    function defaultHealth(p){
      return {
        linkCode:(p&&p.file?p.file:"AWN")+"-MED",
        birthDate:"",birthType:"",birthNotes:"",
        hearingScreening:{status:"لم يتم بعد",date:"",facility:"",notes:""},
        neuroReports:[],
        priorRehab:{had:false,provider:"",duration:"",details:""},
        linkedFacility:{name:"",type:"مستشفى",status:"غير مرتبط"},
        sharedWithFamily:false,sharedWithSchool:false,schoolNote:""
      };
    }
    function migratePatientHealth(st){
      if(!Array.isArray(st.patients)) return;
      st.patients.forEach(p=>{
        if(!p||typeof p!=="object") return;
        if(!p.health||typeof p.health!=="object") p.health=defaultHealth(p);
        const h=p.health;
        if(!h.linkCode) h.linkCode=(p.file||"AWN")+"-MED";
        if(!h.hearingScreening) h.hearingScreening={status:"لم يتم بعد",date:"",facility:"",notes:""};
        if(!Array.isArray(h.neuroReports)) h.neuroReports=[];
        if(!h.priorRehab) h.priorRehab={had:false,provider:"",duration:"",details:""};
        if(!h.linkedFacility) h.linkedFacility={name:"",type:"مستشفى",status:"غير مرتبط"};
        if(h.sharedWithFamily===undefined) h.sharedWithFamily=false;
        if(h.sharedWithSchool===undefined) h.sharedWithSchool=false;
        if(h.schoolNote===undefined) h.schoolNote="";
      });
    }
    // Ensures the generalization-engine logs exist even on older saved data.
    function migrateGenLogs(st){
      if(!Array.isArray(st.sessionLogs)) st.sessionLogs=[];
      if(!Array.isArray(st.homeLogs)) st.homeLogs=[];
    }
    // Oan Connect & Decision Hub — meetings/decisions state for older saves.
    function migrateConnect(st){
      if(!Array.isArray(st.meetings)) st.meetings=[];
      if(!Array.isArray(st.decisions)) st.decisions=[];
      if(!st.connectTab) st.connectTab="meetings";
      if(st.activeMeetingId===undefined) st.activeMeetingId=null;
      st.meetings.forEach(m=>{
        if(!m||typeof m!=="object") return;
        if(!Array.isArray(m.participants)) m.participants=[];
        if(!Array.isArray(m.departments)) m.departments=[];
        if(!Array.isArray(m.actionItems)) m.actionItems=[];
        if(m.notes===undefined) m.notes="";
        if(m.summaryText===undefined) m.summaryText="";
        if(m.durationSeconds===undefined) m.durationSeconds=0;
        if(!m.status) m.status="مجدولة";
        if(!m.audience) m.audience=m.kind==="family"?"family":"internal";
      });
    }
    // Oan Connect Live Communication Hub — extends the existing internal
    // messages array with department tagging + status, without touching the
    // fields older widgets (sendInternalMessage/markMessageRead/supervisor &
    // staff dashboards) already rely on (toId/toName/read stay as-is).
    function migrateCommHub(st){
      if(!Array.isArray(st.messages)) st.messages=[];
      st.messages.forEach(m=>{
        if(!m||typeof m!=="object") return;
        if(m.fromDept===undefined){
          const sender=m.fromId?st.staff.find(s=>s.id===m.fromId):null;
          m.fromDept=sender?(sender.department||(sender.roleCategory==="management"?"management":sender.roleCategory==="reception"?"reception":null)):null;
        }
        if(m.toDept===undefined){
          const receiver=m.toId?st.staff.find(s=>s.id===m.toId):null;
          m.toDept=receiver?(receiver.department||(receiver.roleCategory==="management"?"management":receiver.roleCategory==="reception"?"reception":null)):null;
        }
        if(!m.kind) m.kind="رسالة";
        if(!m.status) m.status=m.read?"قيد الاطلاع":"مُرسلة";
        if(m.patientId===undefined) m.patientId=null;
      });
    }
    // Upgrades older/simple invoice records ({label,amount,paid}) to the full
    // billing schema (line items, tax, discount, partial payments, status)
    // without breaking any existing code that still reads inv.amount/inv.paid —
    // those two fields are kept mirrored to the new total/status going forward.
    function migrateInvoices(st){
      if(!Array.isArray(st.invoices)) st.invoices=[];
      if(!st.billingSettings) st.billingSettings={taxRate:0.15,taxEnabled:false};
      if(st.billingSettings.taxRate===undefined) st.billingSettings.taxRate=0.15;
      if(st.billingSettings.taxEnabled===undefined) st.billingSettings.taxEnabled=false;
      if(!st.invoiceFilter) st.invoiceFilter="all";
      st.invoices.forEach(inv=>{
        if(!inv||typeof inv!=="object") return;
        if(!Array.isArray(inv.items)) inv.items=[{description:inv.label||"خدمة",qty:1,unitPrice:Number(inv.amount)||0,total:Number(inv.amount)||0}];
        if(inv.subtotal===undefined) inv.subtotal=inv.items.reduce((s,it)=>s+Number(it.total||0),0);
        if(inv.taxRate===undefined) inv.taxRate=0;
        if(inv.taxAmount===undefined) inv.taxAmount=Math.round(inv.subtotal*inv.taxRate*100)/100;
        if(inv.discountAmount===undefined) inv.discountAmount=0;
        if(inv.total===undefined) inv.total=Math.max(0,Math.round((inv.subtotal+inv.taxAmount-inv.discountAmount)*100)/100);
        if(inv.amount===undefined) inv.amount=inv.total;
        if(!Array.isArray(inv.payments)){
          inv.payments = inv.paid ? [{id:"pay-legacy-"+inv.id,date:inv.date,amount:inv.total,method:inv.payment||"كاش",note:"مرحّل من نظام سابق"}] : [];
        }
        if(!inv.status) inv.status = inv.paid?"مدفوعة":"مُصدرة";
        if(inv.paid===undefined) inv.paid = inv.status==="مدفوعة";
        if(!inv.centerName) inv.centerName=st.center.name;
        if(inv.guardianName===undefined){
          const p=st.patients.find(x=>x.id===inv.patientId);
          inv.guardianName=p?(p.guardian||""):"";
          inv.guardianPhone=p?(p.phone||""):"";
        }
      });
    }
    // Predictive Generalization Engine: compares a child's logged performance
    // inside the center against what's logged at home for the same goals, and
    // flags a likely generalization gap when the two diverge. Pure/derived —
    // no new "AI insight" state is stored, it's recomputed live from the logs.
    const GEN_RESULT_SCORE = {"نجاح كامل":1,"نجاح جزئي":0.5,"لم ينجح بعد":0};
    function genResultPill(r){
      const cls = r==="نجاح كامل"?"pill-good":r==="نجاح جزئي"?"pill-gold":"pill-red";
      return \`<span class="pill \${cls}">\${esc(r)}</span>\`;
    }
    function computeGeneralizationStats(patientId){
      const sessions=state.sessionLogs.filter(l=>l.patientId===patientId).sort((a,b)=>b.date.localeCompare(a.date));
      const homes=state.homeLogs.filter(l=>l.patientId===patientId).sort((a,b)=>b.date.localeCompare(a.date));
      const recentSessions=sessions.slice(0,8), recentHomes=homes.slice(0,8);
      const avg=arr=>arr.length?arr.reduce((s,l)=>s+(GEN_RESULT_SCORE[l.result]??0),0)/arr.length:null;
      const centerScore=avg(recentSessions), homeScore=avg(recentHomes);
      let status="insufficient", gap=null;
      if(centerScore!==null && homeScore!==null){
        gap=centerScore-homeScore;
        status = gap>=0.34 ? "gap" : (gap<=-0.34 ? "homeAhead" : "aligned");
      }
      return {sessions,homes,recentSessions,recentHomes,centerScore,homeScore,gap,status};
    }
    // Ensures every staff member has a login code/id/roleCategory even if this
    // browser's saved data predates the staff login-code feature.
    function migrateStaffCodes(st){
      if(!Array.isArray(st.staff)) { st.staff=clone(seed.staff); }
      const usedCodes={};
      st.staff.forEach((s,i)=>{
        if(!s||typeof s!=="object") return;
        if(!s.id) s.id="st-legacy-"+i+"-"+Date.now();
        if(!s.roleCategory) s.roleCategory="staff";
        if(s.clinical===undefined) s.clinical = s.roleCategory==="staff"||s.roleCategory==="supervisor";
        if(s.department===undefined) s.department=null;
        if(!s.code || usedCodes[s.code]){
          const clean=(s.name||"").replace(/^(د\\.|أ\\.)\\s*/,"").trim();
          const letter=clean.charAt(0)||"م";
          let n=1; while(usedCodes[letter+n]) n++;
          s.code=letter+n;
        }
        usedCodes[s.code]=true;
      });
      if(!Array.isArray(st.evaluations)) st.evaluations=clone(seed.evaluations||[]);
      if(!Array.isArray(st.dailyTasks)) st.dailyTasks=clone(seed.dailyTasks||[]);
      if(!Array.isArray(st.workshops)) st.workshops=clone(seed.workshops||[]);
      if(!Array.isArray(st.complaints)) st.complaints=clone(seed.complaints||[]);
      if(!Array.isArray(st.courses)) st.courses=clone(seed.courses||[]);
      if(!Array.isArray(st.plans)) st.plans=clone(seed.plans||[]);
      if(!Array.isArray(st.qualityAudits)) st.qualityAudits=clone(seed.qualityAudits||[]);
      if(!Array.isArray(st.standardizedAssessments)) st.standardizedAssessments=clone(seed.standardizedAssessments||[]);
      if(!st.departmentPrograms||typeof st.departmentPrograms!=="object") st.departmentPrograms=clone(seed.departmentPrograms||{});
      st.departments.forEach(d=>{ if(!Array.isArray(st.departmentPrograms[d.id])) st.departmentPrograms[d.id]=[]; });
      if(Array.isArray(st.patients)) st.patients.forEach(p=>{ if(p&&typeof p==="object"&&!Array.isArray(p.assignedPrograms)) p.assignedPrograms=[]; });
      if(!Array.isArray(st.messages)) st.messages=clone(seed.messages||[]);
      if(st.currentStaffId===undefined) st.currentStaffId=null;
      if(st.staffSection===undefined) st.staffSection=null;
      if(!st.staffScheduleFilter) st.staffScheduleFilter="all";
      if(!Array.isArray(st.consultationReviews)) st.consultationReviews=clone(seed.consultationReviews||[]);
      if(!Array.isArray(st.invoices)) st.invoices=clone(seed.invoices||[]);
      if(!Array.isArray(st.packagePurchases)) st.packagePurchases=clone(seed.packagePurchases||[]);
      st.packagePurchases.forEach(pp=>{
        if(pp.sessionsTotal===undefined) pp.sessionsTotal=pp.sessions||0;
        if(pp.sessionsUsed===undefined) pp.sessionsUsed=0;
        if(pp.patientId===undefined){const match=st.patients.find(p=>p.name===pp.patientName);pp.patientId=match?match.id:null;}
      });
    }
    // Repairs facility records saved by older versions of this app that
    // predate the "id" field (or that are otherwise malformed), so stale
    // data left over from a previous version can never crash the app.
    function migrateLegacyFacilities(st){
      if(!Array.isArray(st.facilities)) { st.facilities=clone(seed.facilities); return }
      const seenIds={};
      st.facilities.forEach((f,i)=>{
        if(!f || typeof f!=="object") return;
        if(typeof f.id!=="string" || !f.id) f.id="legacy-"+i+"-"+Date.now();
        while(seenIds[f.id]){ f.id=f.id+"-"+i }
        seenIds[f.id]=true;
        if(!Array.isArray(f.services)) f.services=["خدمات علاجية وتأهيلية","إدارة مواعيد ومتابعة"];
        if(!f.icon) f.icon="briefcase";
        if(!f.code) f.code="ORG-"+Math.floor(1000+Math.random()*9000);
        if(!f.username) f.username="team-"+f.id;
        if(!f.password) f.password="1234";
      });
    }
    function clone(v){return JSON.parse(JSON.stringify(v))}
    function merge(base,saved){return {...clone(base),...saved,center:{...base.center,...(saved.center||{})}}}
    const DEVICE_ONLY=new Set(["svCall","clF","clSel","clPid","scApt","scDraft","scBusy","scConsent","scSendParent","memQ","rdQ","rdF","rdSel","rdBusy","enQ","enF","enS","enN","enSel","enBusy","intakeKiosk","kiDone","kiExitArm","dgShare","sipadMode","sipad","sipadPick","sipadErr","sipadExitArm","ipMirror","ipQ","ipF","ipTab","ipEdit","ipTl","devMsg","devDelArm","sipadBanner","plPop","planDay","planDept","ipDept","deptTab","deptMode","deptMsgTo","ptQ","ptSeg","ptDelArm","mxSound","cmTh","cmG","cmQ","cmOpen","tmQ","tmDept","rfConvert","apTab","apMonth","apKCat","kxPage","kxS","kxR","kxSlots","kxGov","kxCalc","kxCounted","vlPid","vlMode","vlTarget","vlAutoSD","vlSide","vlCam","vlF0","vlSpeech","vlRate","vlReport","vlPrompt","vlDelArm","vlAgeOv","vlExam","vlPh","vl2Tab","vlTx","vlCalibing","vlAutoEnd","asCat","asSt","asQ","asEst","asEstV","vlWhere","abL","abG","abObs","abSeal","abVid","vlAptId","niLogOpen","ebTab","ebQ","ebSf","ebDraft","ebBusy","ebLoc"]);
    function persist(){try{localStorage.setItem(KEY,JSON.stringify(state,(k,v)=>DEVICE_ONLY.has(k)?undefined:v))}catch(err){console.warn("تعذّر حفظ البيانات محليًا:",err)}}
    function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
    const ICONS = {
      tablet:'<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
      home:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
      patients:'<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.5-3.6 3.3-6 6.5-6s6 2.4 6.5 6"/>',
      schedule:'<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3.2 2"/>',
      referrals:'<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
      team:'<circle cx="9" cy="8.5" r="2.8"/><path d="M3.8 19c.4-3 2.6-5 5.2-5s4.8 2 5.2 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 14.3c2.1.4 3.7 2.1 4 4.7"/>',
      departments:'<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
      settings:'<line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="11" cy="17" r="2"/>',
      check:'<path d="M5 13l4.5 4.5L19 7"/>',
      chat:'<path d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.4 0 2.4 1.3 4.6 3.4 6l-.9 3.6 3.8-1.7c.7.15 1.4.2 2.2.2 4.7 0 8.5-3.3 8.5-7.4S16.7 3.5 12 3.5Z"/><circle cx="8.7" cy="10.9" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="10.9" r=".9" fill="currentColor" stroke="none"/><circle cx="15.3" cy="10.9" r=".9" fill="currentColor" stroke="none"/>',
      heart:'<path d="M12 20s-7.2-4.4-9.4-8.9C1 7.6 3 4.5 6.3 4.5c1.9 0 3.4 1 4.7 2.6C12.3 5.5 13.8 4.5 15.7 4.5c3.3 0 5.3 3.1 3.7 6.6C19.2 15.6 12 20 12 20Z"/>',
      lock:'<rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
      speech:'<path d="M4.5 5.5h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H10l-4.2 3.4V15.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"/>',
      blocks:'<rect x="4" y="4" width="8" height="8" rx="1.6"/><rect x="12" y="12" width="8" height="8" rx="1.6"/><rect x="4" y="12" width="8" height="8" rx="1.6" opacity=".45"/>',
      target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
      idea:'<circle cx="12" cy="10" r="5.5"/><line x1="12" y1="15.5" x2="12" y2="18"/><line x1="9.5" y1="20" x2="14.5" y2="20"/>',
      pulse:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
      briefcase:'<rect x="3.5" y="8" width="17" height="11" rx="1.8"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="3.5" y1="13" x2="20.5" y2="13"/>',
      school:'<path d="M12 3 3 8v2h18V8Z"/><rect x="5" y="10" width="14" height="9"/><line x1="9" y1="19" x2="9" y2="14"/><line x1="15" y1="19" x2="15" y2="14"/>',
      book:'<path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0Z"/><path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0Z"/>',
      medical:'<circle cx="12" cy="12" r="8.5"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
      idcard:'<rect x="3.5" y="6" width="17" height="12" rx="2"/><circle cx="9" cy="12" r="2"/><line x1="13.5" y1="10.5" x2="18" y2="10.5"/><line x1="13.5" y1="13.5" x2="18" y2="13.5"/>',
      eye:'<path d="M2.5 12c2.4-3.6 5.8-5.5 9.5-5.5s7.1 1.9 9.5 5.5c-2.4 3.6-5.8 5.5-9.5 5.5S4.9 15.6 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
      chart:'<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="13" width="3" height="7"/><rect x="11" y="9" width="3" height="11"/><rect x="16" y="5" width="3" height="15"/>',
      bell:'<path d="M12 4a5 5 0 0 0-5 5v3.5L5 16h14l-2-3.5V9a5 5 0 0 0-5-5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
      question:'<circle cx="12" cy="12" r="8.5"/><path d="M9.3 9.6a2.7 2.7 0 0 1 5.3.7c0 1.8-2.6 2.1-2.6 3.9"/><circle cx="12" cy="17.1" r=".25" fill="currentColor" stroke="none"/>',
      chevronDown:'<path d="M5 9l7 7 7-7"/>',
      globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.3 4 5.3 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.3-4-8.5s1.4-6.2 4-8.5Z"/>',
      star:'<path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.7 1.1-5.9-4.3-4.1 5.9-.7Z"/>',
      chevronLeft:'<path d="M15 6l-6 6 6 6"/>',
      shield:'<path d="M12 3.5 19 6.3v5.4c0 5-3.2 8.4-7 9.8-3.8-1.4-7-4.8-7-9.8V6.3Z"/><path d="M9 12l2 2 4-4.5"/>'
      ,mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 11.5a6 6 0 0 0 12 0"/><line x1="12" y1="17.5" x2="12" y2="20.5"/><line x1="8.5" y1="20.5" x2="15.5" y2="20.5"/>'
      ,invoice:'<path d="M6 3.5h12v17l-2.2-1.4-2 1.4-1.8-1.4-1.8 1.4-2-1.4L6 20.5Z"/><line x1="8.5" y1="8" x2="15.5" y2="8"/><line x1="8.5" y1="11.5" x2="15.5" y2="11.5"/><line x1="8.5" y1="15" x2="13" y2="15"/>'
      ,video:'<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="M15.5 10.2 21 7.5v9l-5.5-2.7Z"/>'
      ,commHub:'<path d="M4 5.5h12a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H9.5L6 17v-3H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"/><path d="M16.6 4.2a4.6 4.6 0 0 1 3 4.3"/><path d="M18.3 2.7a7.3 7.3 0 0 1 4.4 6.7" opacity=".55"/><circle cx="19.7" cy="8.6" r="1" fill="currentColor" stroke="none"/>'
      ,clipboardCheck:'<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 12.5l2 2 4-4.5"/>'
    };
    function ic(name,size=18,strokeWidth=1.8){return \`<svg class="icon" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="\${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">\${ICONS[name]||""}</svg>\`}
    // أدوات التقييم القياسية المدعومة — كل أداة معروفة بمجالاتها/فئاتها العامة (بدون
    // استنساخ البنود التفصيلية المحمية لحقوق الملكية لكل أداة). الأخصائي/ة تدخل
    // درجتها الفعلية حسب نسختها المرخّصة من الأداة؛ المستويات هنا عامة وقابلة للتعديل.
    const ASSESSMENT_INSTRUMENTS = {
      "VB-MAPP": ["المخاطبة (Mand)","التسمية (Tact)","الاستجابة السمعية (Listener Responding)","التقليد الحركي (Motor Imitation)","التقليد الصوتي / الإيكويك (Echoic)","المطابقة البصرية (Visual Perceptual / MTS)","اللعب المستقل (Independent Play)","مهارات المجموعة والصف (Group Skills)","التركيب اللغوي (Linguistic Structure)"],
      "ABLLS-R": ["التعاون والفاعلية التعزيزية","التقليد الحركي","التقليد الصوتي","المطابقة البصرية","الإدراك السمعي واللغة الاستقبالية","اللغة التعبيرية (المخاطبة/التسمية)","النحو والتركيب اللغوي","مهارات المجموعة الصفية","اللعب الفردي والاجتماعي","العناية الذاتية","المهارات الحركية","المهارات الأكاديمية (قراءة/كتابة/رياضيات)"],
      "PEP-3": ["التقليد","الإدراك","الحركة الدقيقة","الحركة الكبرى","التكامل البصري الحركي","الأداء المعرفي اللفظي","الأداء المعرفي غير اللفظي","التواصل التعبيري","التواصل الاستقبالي"],
      "ASQ": ["التواصل","الحركة الكبرى","الحركة الدقيقة","حل المشكلات","المهارات الشخصية والاجتماعية"],
      "AFLS": ["المهارات الأساسية والتواصلية","مهارات المنزل","مهارات المجتمع","مهارات المدرسة","الاستقلالية الذاتية","مهارات العمل والانتقال للتوظيف"],
      "PEAK": ["التدريب المباشر (Direct Training)","التعميم (Generalization)","المهارات المكافئة (Equivalence)","التحويل (Transformation)"],
      "تقييم داخلي مخصص": []
    };
    const ASSESSMENT_LEVELS = ["لم يبدأ بعد","ناشئ / يحتاج مساعدة كاملة","يحتاج مساعدة جزئية","مكتسب مع بعض التذبذب","مكتسب بالكامل"];
    // مكتبة البرامج العلاجية — أسماء عامة ومعروفة لمناهج/برامج تدخل شائعة حسب كل
    // تخصص (بدون استنساخ أي منهج أو بنود تفصيلية محمية بحقوق ملكية). كل مشرف/ة
    // قسم يفعّل من هذه القائمة (أو يضيف برنامجًا مخصصًا) البرامج التي يعمل بها
    // قسمه فعليًا، وهذا هو ما يظهر بعدها كخيارات عند إسناد برنامج لملف مستفيد.
    const PROGRAM_LIBRARY = {
      speech: ["برنامج تنمية اللغة الاستقبالية والتعبيرية","برنامج تعديل اضطرابات النطق والأصوات","برنامج الطلاقة اللفظية (التأتأة)","التواصل بالتبادل الصوري (PECS)","برنامج التواصل البديل والمعزز (AAC)","برنامج تحفيز الحركة الفموية النطقية (PROMPT)","برنامج المهارات البراجماتية والتواصل الاجتماعي"],
      ot: ["برنامج التكامل الحسي (Sensory Integration)","برنامج المهارات الحركية الدقيقة","برنامج الكتابة اليدوية (Handwriting)","برنامج الاستقلالية في العناية الذاتية","برنامج التنظيم الذاتي الحسي (Zones of Regulation)","برنامج التآزر البصري الحركي","برنامج العلاج الطبيعي — التوازن والمشي"],
      aba: ["برنامج التدريب بالتجارب المنفصلة (DTT)","برنامج التدريب في البيئة الطبيعية (NET)","برنامج تحليل السلوك اللفظي (Verbal Behavior)","برنامج الدعم السلوكي الإيجابي (PBS)","نموذج دنفر للتدخل المبكر (ESDM)","برنامج الفصل الهيكلي (TEACCH)"],
      psych: ["برنامج الدعم النفسي والإرشاد الأسري","برنامج تنظيم الانفعالات","برنامج المهارات الاجتماعية والمعرفية","برنامج اللعب العلاجي (Floortime / DIR)"],
      skills: ["برنامج المهارات الحياتية اليومية (ADL)","برنامج الاستقلالية الذاتية","برنامج المهارات الاجتماعية","برنامج اللعب الوظيفي والتفاعلي"],
      vocational: ["برنامج التهيئة المهنية والتدريب على المهام","برنامج الانتقال إلى سوق العمل","برنامج المهارات الوظيفية الأساسية"],
      inclusion: ["برنامج الدمج الأكاديمي والتكيّف الصفي","برنامج الدعم السلوكي داخل الفصل","متابعة خطة التعليم الفردية (IEP)"],
      classrooms: ["برنامج الفصل الهيكلي المرئي","برنامج تنظيم الجدول الزمني البصري","برنامج الاستعداد الأكاديمي المبكر"]
    };
    const LOGO_URI="data:image/png;base64,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";
    function mark(size){return \`<img src="\${LOGO_URI}" width="\${size}" height="\${size}" alt="أوان" style="display:block;object-fit:contain">\`}
    const T = {
      ar:{ brandName:"أوان", brandTag:"لكل طفل وقته", brandFull:"أوان لرعاية ذوي الاحتياجات الخاصة", brandSub:"منصة تشغيل مراكز الرعاية والتأهيل",
        navHome:"لوحة القيادة", navPatients:"الملفات", navJourney:"رحلة الطفل", navSchedule:"المواعيد", navReferrals:"الإحالات", navTeam:"الفريق", navDepartments:"الأقسام والخدمات", navAttendance:"الحضور والغياب", navAudit:"سجل التدقيق", navIntakeAI:"الاستقبال الذكي", navLiveOps:"المراقبة الحية",navVideoLab:"التقييم بالفيديو",navAssess:"الأطفال المقيّمين",navEbnak:"ابنك ابني",navScribe:"الكاتب الذكي",navClaims:"مطالبات التأمين",navCalls:"الاستقبال الصوتي",navServer:"السيرفر والحسابات",navIpads:"آيبادات الفريق",navMyIpad:"آيبادي",navDeptPlan:"جدول القسم", navDigital:"الإدارة الرقمية", navAgents:"الإدارة الآلية", navReports:"التقارير", navInvoices:"الفواتير", navConnect:"أوان كونكت", navCommHub:"أوان تواصل", navLibrary:"مكتبة الإرشاد", navLicense:"الترخيص البلدي", navGovSupport:"دعم الدولة", navReviewRequests:"طلب التقييمات", navSettings:"إعدادات المركز",
        workspaceLabel:"مساحة العمل", dataLocal:"البيانات محفوظة محلياً", resetSample:"إعادة البيانات التجريبية", publicPortals:"البوابات العامة",
        dashEyebrow:"مساحة القيادة اليومية", dashTitle:"صورة واضحة لنبض المركز", dashWelcome:(n,c)=>\`أهلاً بك في \${n}، \${c}.\`, bookSession:"＋ حجز جلسة",
        heroDate:"الأربعاء، 2 سبتمبر 2026", heroLine1:"كل تفصيل صغير يصنع فرقاً", heroLine2:"في رحلة كل طفل.", heroSub:"مساحة تشغيلية موحدة للفريق والأسرة والمدرسة.", heroStat1:"جلسة اليوم", heroStat2:"حضور الفريق",
        metricActive:"الملفات النشطة", metricActiveDetail:(n)=>\`من أصل \${n} ملف\`, metricSessions:"جلسات هذا الأسبوع", metricSessionsDetail:"مواعيد مجدولة", metricGoals:"الأهداف قيد التحقيق", metricGoalsDetail:"78% من الأهداف", metricReferrals:"إحالات تنتظر الفرز", metricReferralsDetail:"تحتاج إجراء", updatedToday:"محدث اليوم",
        upcomingAppts:"المواعيد القادمة", viewSchedule:"عرض الجدول ←", quickActions:"إجراءات سريعة", quickByRole:"حسب دورك",
        addFileTitle:"إضافة ملف جديد", addFileDetail:"إنشاء سجل مستفيد داخل المركز", reviewReferralsTitle:"مراجعة الإحالات", reviewReferralsDetail:(n)=>\`\${n} طلبات في الصندوق\`, deptsTitle:"الأقسام والخدمات", deptsDetail:"الوصول إلى أدوات كل قسم",
        landingKicker:"مركزك. فريقك. أثر كل جلسة.", landingH1a:"لكل طفل وقته ..", landingH1b:"ولكل طفل طريق يناسب", landingH1em:"قدراته",
        landingLede:"مساحة عمل هادئة تساعد فرق الرعاية على تنظيم اليوم، متابعة أهداف المستفيدين، وإبقاء الأسرة على اطلاع — من الإحالة الأولى إلى كل خطوة صغيرة.",
        landingStart:"ابدأ يومك في أوان ←", landingAttendanceBtn:"تسجيل حضور الفريق", landingTrust:"خصوصية بياناتكم أولاً — صلاحيات الوصول تُفرض من الخادم",
        landingGreeting:(n)=>\`صباح الخير، \${n}\`, landingSessionsToday:"جلسات اليوم", landingSessionsUnit:(n)=>\`\${n} جلسة\`, landingAttendance:"الحضور", landingAttendanceOf:(a,b)=>\`\${a} من \${b}\`, landingReferralsReview:"إحالات تحتاج مراجعة",
        landingSpotlightBadge:"أداء الأسبوع", landingSpotlightMetric:"نسبة إنجاز الأهداف", landingSpotlightSub:"بيانات مجمّعة لكل المستفيدين — بلا أي بيانات فردية على الصفحة العامة", landingFeature1:"يوم لا يفوّت موعداً", landingFeature2:"أسرة مطمئنة ومشاركة", landingFeature3:"فريق واحد لكل رحلة", landingFeature4:"سجل سريري منظم",
        navEnterWorkspace:"دخول مساحة العمل", navFamilyPortal:"بوابة الأسرة", langToggle:"English",
        navLogin:"تسجيل الدخول", navAbout:"حول", navSupport:"الدعم",
        aboutTitle:"عن أوان", aboutBody:"أوان منصة تشغيلية لمراكز وعيادات الرعاية والتأهيل، تجمع الفريق والأسرة والمؤسسة في مساحة واحدة — بخصوصية بيانات أولاً، وتجربة واضحة لكل طرف من أول إحالة إلى كل خطوة صغيرة بعدها.",
        supportTitle:"الدعم", supportBody:"لأي استفسار تقني أو مساعدة في استخدام أوان، فريقنا جاهز لمساعدتك:" },
      en:{ brandName:"AWAN", brandTag:"Every Child, Their Time", brandFull:"AWAN Care & Rehabilitation", brandSub:"Rehab center operations platform",
        navHome:"Dashboard", navPatients:"Case Files", navJourney:"Child Journey", navSchedule:"Schedule", navReferrals:"Referrals", navTeam:"Team", navDepartments:"Departments & Services", navAttendance:"Attendance", navAudit:"Audit log", navIntakeAI:"Smart intake", navLiveOps:"Live monitor",navVideoLab:"Video AI assessment",navAssess:"Assessed children",navEbnak:"Ebnak Ebny (families)",navScribe:"AI scribe",navClaims:"Insurance claims",navCalls:"Voice reception",navServer:"Server & accounts",navIpads:"Team iPads",navMyIpad:"My iPad",navDeptPlan:"Department plan", navDigital:"Digital center", navAgents:"Autopilot", navReports:"Reports", navInvoices:"Invoices", navConnect:"Oan Connect", navCommHub:"Oan Comm Hub", navLibrary:"Guidance Library", navLicense:"Municipal License", navGovSupport:"State Support", navReviewRequests:"Review Requests", navSettings:"Center Settings",
        workspaceLabel:"Workspace", dataLocal:"Data saved on this device", resetSample:"Reset sample data", publicPortals:"Public Portals",
        dashEyebrow:"Daily command space", dashTitle:"A clear pulse of the center", dashWelcome:(n,c)=>\`Welcome to \${n}, \${c}.\`, bookSession:"＋ Book session",
        heroDate:"Wednesday, Sep 2, 2026", heroLine1:"Every small detail makes a difference", heroLine2:"in every child's journey.", heroSub:"One workspace for the team, the family, and the school.", heroStat1:"sessions today", heroStat2:"team attendance",
        metricActive:"Active case files", metricActiveDetail:(n)=>\`out of \${n} files\`, metricSessions:"Sessions this week", metricSessionsDetail:"scheduled appointments", metricGoals:"Goals on track", metricGoalsDetail:"78% of goals", metricReferrals:"Referrals awaiting triage", metricReferralsDetail:"need action", updatedToday:"updated today",
        upcomingAppts:"Upcoming appointments", viewSchedule:"View schedule →", quickActions:"Quick actions", quickByRole:"based on your role",
        addFileTitle:"Add a new case file", addFileDetail:"Create a beneficiary record", reviewReferralsTitle:"Review referrals", reviewReferralsDetail:(n)=>\`\${n} requests in the inbox\`, deptsTitle:"Departments & Services", deptsDetail:"Access every department's tools",
        landingKicker:"Your center. Your team. Every session counts.", landingH1a:"Every child has their time ..", landingH1b:"and a path that fits", landingH1em:"their abilities.",
        landingLede:"A calm workspace that helps care teams organize the day, track beneficiary goals, and keep families informed — from the first referral to every small step.",
        landingStart:"Start your day in AWAN →", landingAttendanceBtn:"Check in the team", landingTrust:"Your data, first — access rights are enforced by the server",
        landingGreeting:(n)=>\`Good morning, \${n}\`, landingSessionsToday:"Sessions today", landingSessionsUnit:(n)=>\`\${n} sessions\`, landingAttendance:"Attendance", landingAttendanceOf:(a,b)=>\`\${a} of \${b}\`, landingReferralsReview:"Referrals to review",
        landingSpotlightBadge:"This week", landingSpotlightMetric:"Goal completion rate", landingSpotlightSub:"Aggregated across all beneficiaries — no individual data on the public page", landingFeature1:"Never miss a session", landingFeature2:"Families informed and engaged", landingFeature3:"One team, every step", landingFeature4:"Organized clinical records",
        navEnterWorkspace:"Enter workspace", navFamilyPortal:"Family portal", langToggle:"العربية",
        navLogin:"Log in", navAbout:"About", navSupport:"Support",
        aboutTitle:"About AWAN", aboutBody:"AWAN is an operations platform for care and rehabilitation centers, bringing the team, the family, and the organization together in one space — privacy-first, with a clear experience for everyone, from the first referral to every small step after.",
        supportTitle:"Support", supportBody:"For any technical question or help using AWAN, our team is ready to help:" }
    };
    function t(key){return T[state.lang][key]}
    function statusClass(s){return /مكتمل|نشط|متاحة|متاح|جاهز|تم التواصل|قيد التقدم|معتمدة/.test(s)?"pill-good":/عالية|جديدة|قيد المراجعة|قريباً|في جلسة|معلقة/.test(s)?"pill-gold":/ملغي|متوقف|إجازة|معادة/.test(s)?"pill-red":"pill-grey"}
    function pill(s){return \`<span class="pill \${statusClass(s)}">\${esc(s)}</span>\`}
    function date(s){if(!s)return"—"; const d=new Date(s+"T00:00:00");return isNaN(d) ? esc(s) : new Intl.DateTimeFormat(state.lang==="ar"?"ar-SA":"en-US",{day:"numeric",month:"short",year:"numeric"}).format(d)}
    function time(s){return esc((s||"").slice(0,5))}
    function notify(msg){ntPush(/تعذّر|مقدرتش|خطأ|ممنوع|🛡|لازم|محتاج/.test(String(msg))?"warn":"ok","",String(msg))}
    // ---- إشعارات دايمة: ما بتختفيش غير لما تتقفل ----
    const NT_KEY="awan-notifs";let NT=[];try{NT=JSON.parse(localStorage.getItem(NT_KEY)||"[]")||[]}catch(_e){NT=[]}
    function ntSave(){try{localStorage.setItem(NT_KEY,JSON.stringify(NT.slice(0,60)))}catch(_e){}}
    function ntPush(kind,title,text){const last=NT[0];if(last&&last.title===title&&last.text===text){last.n=(last.n||1)+1;last.at=Date.now()}else NT.unshift({id:"nt"+Date.now()+Math.random().toString(36).slice(2,5),kind,title,text,at:Date.now(),n:1});if(NT.length>60)NT.length=60;ntSave();ntPaint(true)}
    window.ntPush=ntPush;
    function ntClose(id){NT=NT.filter(x=>x.id!==id);ntSave();ntPaint()}
    function ntCloseAll(){NT=[];ntSave();ntPaint()}
    function ntToggle(){ntOpen=!ntOpen;ntPaint()}
    let ntOpen=false;
    function ntPaint(fresh){let el=document.getElementById("nt-stack");if(!el){el=document.createElement("div");el.id="nt-stack";el.className="nt-stack";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.appendChild(el)}
      if(!NT.length){el.innerHTML="";return}const now=Date.now();const show=ntOpen?NT:NT.slice(0,3);clearTimeout(ntPaint._t);const nx=NT.filter(x=>now-x.at<8000).map(x=>8050-(now-x.at));if(nx.length)ntPaint._t=setTimeout(()=>ntPaint(),Math.min(...nx));const ico={ok:"check",warn:"bell",err:"shield",comm:"commHub"};
      el.innerHTML=(NT.length>1?\`<div class="nt-bar"><span>\${NT.length} إشعار</span>\${NT.length>1?\`<button onclick="ntToggle()">\${ntOpen?"اعرض أقل":"اعرض الكل"}</button>\`:""}<button onclick="ntCloseAll()">اقفل الكل ✕</button></div>\`:"")+show.map((x,i)=>\`<div class="nt nt-\${x.kind} \${fresh&&i===0?"in":""} \${!ntOpen&&now-x.at>=8000?"mini":""}" onclick="if(this.classList.contains('mini')&&event.target.className!=='nt-x'){ntToggle()}"><span class="nt-ico">\${ic(ico[x.kind]||"check",14)}</span><div class="nt-tx">\${x.title?\`<b>\${esc(x.title)}</b>\`:""}<span>\${esc(x.text)}</span><small>\${localTimeOf(new Date(x.at))}\${x.n>1?\` · ×\${x.n}\`:""}</small></div><button class="nt-x" onclick="ntClose('\${x.id}')" aria-label="اقفل">✕</button></div>\`).join("")+(!ntOpen&&NT.length>3?\`<button class="nt-more" onclick="ntToggle()">+ \${NT.length-3} إشعارات تانية</button>\`:"")}
    setTimeout(()=>ntPaint(),0);
    function can(perm){if(state.role==="management")return true;const p=state.rolePermissions&&state.rolePermissions[state.role];return !!(p&&p[perm])}
    function togglePermission(role,perm){if(!state.rolePermissions[role])return;state.rolePermissions[role][perm]=!state.rolePermissions[role][perm];persist();notify("تم تحديث صلاحيات "+roles[role].label);render()}
    const permissionLabels={editDepartments:"تعديل الأقسام والخدمات",manageFamilyPortal:"إدارة بوابة الأسرة",editAppointments:"تعديل وحذف المواعيد",editPatients:"تعديل ملفات المستفيدين"};
    function personById(id){return state.staff.find(s=>s.id===id)}
    function getCurrentPerson(){return state.currentStaffId?personById(state.currentStaffId):null}
    function departmentLabel(id){if(!id)return"—";const d=state.departments.find(x=>x.id===id);return d?d.name:"—"}
    // Modular Billing & Invoicing System — core invoice schema/engine.
    // An invoice supports itemized services, tax, a discount, a status of
    // مسودة (draft) / مُصدرة (issued) / مدفوعة (paid) / مسدد جزئياً (partially
    // paid) / ملغاة (cancelled), and an array of individual payments (so more
    // than one payment method can be applied against the same invoice over
    // time — e.g. a partial cash payment now, the rest by bank transfer later).
    // \`amount\`/\`paid\` are kept mirrored on every invoice for backward
    // compatibility with the older dashboard/report widgets that read them.
    function createInvoice(data){
      const items = (Array.isArray(data.items)&&data.items.length) ? data.items : [{description:data.label||"خدمة",qty:1,unitPrice:Number(data.amount)||0,total:Number(data.amount)||0}];
      const subtotal = Math.round(items.reduce((s,it)=>s+Number(it.total!==undefined?it.total:(Number(it.qty||1)*Number(it.unitPrice||0))),0)*100)/100;
      const taxRate = data.taxRate!==undefined ? Number(data.taxRate)||0 : 0;
      const discountAmount = Number(data.discountAmount)||0;
      const taxAmount = Math.round(subtotal*taxRate*100)/100;
      const total = Math.max(0, Math.round((subtotal+taxAmount-discountAmount)*100)/100);
      const isDeferred = data.payment==="آجل";
      const status = data.status || (isDeferred?"مُصدرة":"مدفوعة");
      const payments = status==="مدفوعة" ? [{id:"pay-"+Date.now(),date:todayISO(),amount:total,method:data.payment||"كاش",note:""}] : [];
      const patient = data.patientId ? state.patients.find(p=>p.id===data.patientId) : null;
      const inv = {
        id:"inv-"+Date.now()+"-"+Math.floor(Math.random()*1000),
        patientId:data.patientId||null, patientName:data.patientName,
        guardianName:patient?(patient.guardian||""):"", guardianPhone:patient?(patient.phone||""):"",
        centerName:state.center.name,
        type:data.type, label:data.label, items,
        subtotal, taxRate, taxAmount, discountAmount, total,
        amount: total, // legacy alias — existing dashboard/report code reads inv.amount
        payment:data.payment, payments,
        status, paid: status==="مدفوعة",
        date:todayISO()
      };
      state.invoices.unshift(inv);
      return inv;
    }
    function invoiceBalance(inv){
      const paidSum=(inv.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);
      return Math.max(0, Math.round((inv.total-paidSum)*100)/100);
    }
    function invoiceStatusPill(status){
      const cls = status==="مدفوعة"?"pill-good":status==="ملغاة"?"pill-red":status==="مسودة"?"pill-grey":"pill-gold";
      return \`<span class="pill \${cls}">\${esc(status)}</span>\`;
    }
    // Per-child/family account ledger: invoice history + totals + balance due.
    function patientLedger(patientId){
      const invoices=state.invoices.filter(i=>i.patientId===patientId).sort((a,b)=>b.date.localeCompare(a.date));
      const totalInvoiced=Math.round(invoices.reduce((s,i)=>s+Number(i.total||0),0)*100)/100;
      const totalPaid=Math.round(invoices.reduce((s,i)=>s+(i.payments||[]).reduce((s2,p)=>s2+Number(p.amount||0),0),0)*100)/100;
      const balanceDue=Math.max(0,Math.round((totalInvoiced-totalPaid)*100)/100);
      return {invoices,totalInvoiced,totalPaid,balanceDue};
    }
    function recordInvoicePayment(invoiceId,amount,method,note){
      const inv=state.invoices.find(i=>i.id===invoiceId);
      if(!inv) return null;
      const amt=Number(amount)||0;
      if(amt<=0 || inv.status==="ملغاة") return inv;
      inv.payments=inv.payments||[];
      inv.payments.unshift({id:"pay-"+Date.now(),date:todayISO(),amount:amt,method:method||"كاش",note:note||""});
      const balance=invoiceBalance(inv);
      inv.status = balance<=0 ? "مدفوعة" : "مسدد جزئياً";
      inv.paid = inv.status==="مدفوعة";
      return inv;
    }
    function updateInvoiceStatus(invoiceId,status){
      const inv=state.invoices.find(i=>i.id===invoiceId);
      if(!inv) return null;
      inv.status=status;
      inv.paid=status==="مدفوعة";
      return inv;
    }
    // =====================================================================
    // AWAN BILLING API — INTEGRATION MOCKUP (front-end/back-end connection points)
    // ---------------------------------------------------------------------
    // This entire file runs offline against local \`state\` — there is no real
    // server yet. The async functions below are shaped exactly like the real
    // REST client this billing module will use once it's wired to the
    // production center server: same names, same inputs/outputs, already
    // awaited by the UI — so swapping each function body for a real fetch()
    // later is a drop-in change, not a redesign. Suggested endpoints for the
    // production API:
    //   POST   /api/v1/centers/:centerId/invoices           -> apiCreateInvoice
    //   GET    /api/v1/centers/:centerId/invoices            -> apiListInvoices
    //   GET    /api/v1/invoices/:invoiceId                   -> apiGetInvoice
    //   POST   /api/v1/invoices/:invoiceId/payments          -> apiRecordPayment
    //   PATCH  /api/v1/invoices/:invoiceId/status            -> apiUpdateInvoiceStatus
    //   GET    /api/v1/patients/:patientId/ledger            -> apiGetPatientLedger
`;export{e as default};
//# sourceMappingURL=02-server-state-notify-Aw6w8zX5.js.map
