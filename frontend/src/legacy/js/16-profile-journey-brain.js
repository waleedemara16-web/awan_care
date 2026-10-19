"use strict";
// أوان — الجزء 16 من 16: 16-profile-journey-brain
// كل ملفات js/ هذي تشتغل كأنها ملف واحد بالترتيب — ما تغيّر ترتيبها في index.html
    // =================== الملف المهني للأخصائي (صورة، درجة علمية، ترخيص، شهادات) + دليل الإيميل والدرايف ===================
    // ملفات الشهادات تتحفظ في IndexedDB (مو في localStorage عشان الحجم)، والبيانات الوصفية في state.
    const PF_DB={db:null};
    function pfDb(){return new Promise((ok,no)=>{if(PF_DB.db)return ok(PF_DB.db);try{const r=indexedDB.open("awan-files",1);r.onupgradeneeded=()=>{r.result.createObjectStore("files")};r.onsuccess=()=>{PF_DB.db=r.result;ok(r.result)};r.onerror=()=>no(r.error)}catch(e){no(e)}})}
    async function pfPut(id,blob){const db=await pfDb();return new Promise((ok,no)=>{const t=db.transaction("files","readwrite");t.objectStore("files").put(blob,id);t.oncomplete=()=>ok();t.onerror=()=>no(t.error)})}
    async function pfGet(id){const db=await pfDb();return new Promise((ok,no)=>{const t=db.transaction("files","readonly");const r=t.objectStore("files").get(id);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>no(r.error)})}
    async function pfDelFile(id){try{const db=await pfDb();db.transaction("files","readwrite").objectStore("files").delete(id)}catch(_e){}}
    function pfImg(file,max,q){return new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b?ok({blob:b,url:c.toDataURL("image/jpeg",q)}):no(new Error("img")),"image/jpeg",q)};im.onerror=()=>no(new Error("img"));im.src=fr.result};fr.onerror=()=>no(fr.error);fr.readAsDataURL(file)})}
    const PF_DEGREES=["دبلوم","بكالوريوس","دبلوم عالي","ماجستير","دكتوراه"];
    const PF_CLASS=["أخصائي","أخصائي أول","استشاري","فني","غير مصنّف بعد"];
    const PF_CTYPES=["شهادة جامعية","ترخيص مهني (هيئة التخصصات الصحية)","شهادة مهنية / اعتماد","دورة تدريبية","شهادة خبرة","أخرى"];
    const PFUI={open:false,page:false,busy:false};
    function pfOf(s){if(!s.profile)s.profile={certs:[]};if(!Array.isArray(s.profile.certs))s.profile.certs=[];return s.profile}
    function pfMe(){return state.sipadMode&&state.sipad?sipadStaff():getCurrentPerson()}
    function pfIsSelf(s){const m=pfMe();return !!m&&!!s&&m.id===s.id}
    function pfCanVerify(s){return typeof ipCanCtl==="function"?ipCanCtl(s)||(state.role==="management"):state.role==="management"}
    function pfAv(s,cls){const p=s&&s.profile;const ini=esc(((s&&s.name||"").replace(/^(أ\.|د\.)\s*/,"")||"?").charAt(0));return p&&p.photo?`<span class="pf-av ${cls||""}"><img src="${p.photo}" alt=""></span>`:`<span class="pf-av ${cls||""}">${ini}</span>`}
    function pfLic(s){const p=pfOf(s);if(!p.licenseExp)return null;const d=Math.floor((Date.parse(p.licenseExp)-Date.parse(localDateOf(new Date())))/864e5);return {days:d,cls:d<0?"bad":d<=60?"warn":"ok",txt:d<0?`الترخيص منتهي من ${-d} يوم`:d<=60?`الترخيص ينتهي بعد ${d} يوم`:`الترخيص ساري لين ${date(p.licenseExp)}`}}
    function pfDone(s){const p=pfOf(s);const k=["photo","degree","major","university","licenseNo","licenseClass","licenseExp","years","email","bio"];const n=k.filter(x=>p[x]).length+(p.certs.length?2:0);return Math.round(n/(k.length+2)*100)}
    function pfHtml(s,mode){
      const p=pfOf(s);const self=mode==="self";const ver=!self&&pfCanVerify(s);const lic=pfLic(s);const pc=pfDone(s);const dep=state.departments.find(x=>x.id===s.department);
      const v=k=>esc(p[k]||"");const sel=(k,opts)=>`<select class="select" name="${k}"><option value="">اختر</option>${opts.map(o=>`<option ${p[k]===o?"selected":""}>${o}</option>`).join("")}</select>`;
      let h=`<section class="card pf-card"><div class="pf-top">${pfAv(s,"xl")}<div class="pf-id"><h2>${esc(s.name)}</h2><span>${esc(s.role||"")}${dep?" · "+esc(dep.name):""}</span>
        <div class="pf-tags">${p.degree?`<span class="pill pill-blue">🎓 ${esc(p.degree)}${p.major?" · "+esc(p.major):""}</span>`:""}${p.licenseClass?`<span class="pill pill-good">${esc(p.licenseClass)}</span>`:""}${lic?`<span class="pill ${lic.cls==="ok"?"pill-good":lic.cls==="warn"?"pill-gold":"pill-red"}">${esc(lic.txt)}</span>`:""}${p.years?`<span class="pill pill-grey">${esc(p.years)} سنين خبرة</span>`:""}</div></div>
        <div class="pf-pct"><b>${pc}%</b><small>اكتمال الملف</small><i><i style="width:${pc}%"></i></i></div></div>
        ${self?`<label class="btn btn-outline pf-up">📷 ${p.photo?"غيّر صورتي":"ارفع صورتي"}<input type="file" accept="image/*" onchange="pfPhoto(this,'${s.id}')" hidden></label>${p.photo?`<button class="btn btn-outline" onclick="pfPhotoDel('${s.id}')">شيل الصورة</button>`:""}`:""}`;
      if(self)h+=`<form class="pf-form" onsubmit="pfSave(event,'${s.id}')" autocomplete="off"><h3>البيانات المهنية</h3><div class="form-grid">
          <div class="field"><label>الدرجة العلمية</label>${sel("degree",PF_DEGREES)}</div><div class="field"><label>التخصص</label><input class="input" name="major" value="${v("major")}" placeholder="مثال: علوم التأهيل — اضطرابات التواصل"></div>
          <div class="field"><label>الجامعة</label><input class="input" name="university" value="${v("university")}"></div><div class="field"><label>سنة التخرج</label><input class="input" name="gradYear" inputmode="numeric" value="${v("gradYear")}"></div>
          <div class="field"><label>رقم الترخيص المهني (هيئة التخصصات الصحية)</label><input class="input" name="licenseNo" value="${v("licenseNo")}"></div><div class="field"><label>التصنيف المهني</label>${sel("licenseClass",PF_CLASS)}</div>
          <div class="field"><label>تاريخ انتهاء الترخيص</label><input class="input" type="date" name="licenseExp" value="${v("licenseExp")}"></div><div class="field"><label>سنين الخبرة</label><input class="input" name="years" inputmode="numeric" value="${v("years")}"></div>
          <div class="field"><label>الإيميل المهني</label><input class="input" type="email" name="email" dir="ltr" value="${v("email")}" placeholder="name@center.sa"></div><div class="field"><label>اللغات</label><input class="input" name="langs" value="${v("langs")}" placeholder="العربية، الإنجليزية"></div>
          <div class="field full"><label>نبذة مهنية قصيرة</label><textarea class="textarea" name="bio" rows="3" placeholder="خبراتك واهتماماتك وأساليبك المفضلة في التدخل">${v("bio")}</textarea></div></div>
          <button class="btn btn-primary">حفظ ملفي</button></form>`;
      else h+=`<div class="pf-view">${[["الدرجة العلمية","degree"],["التخصص","major"],["الجامعة","university"],["سنة التخرج","gradYear"],["رقم الترخيص","licenseNo"],["التصنيف","licenseClass"],["انتهاء الترخيص","licenseExp"],["سنين الخبرة","years"],["الإيميل","email"],["اللغات","langs"]].map(([l,k])=>`<div><small>${l}</small><b ${k==="email"?'dir="ltr"':""}>${p[k]?esc(k==="licenseExp"?date(p[k]):p[k]):"—"}</b></div>`).join("")}${p.bio?`<div class="full"><small>نبذة</small><b>${esc(p.bio)}</b></div>`:""}</div>`;
      h+=`<h3 class="pf-h3">الشهادات والتراخيص <span class="muted">(${p.certs.length})</span></h3>${p.certs.length?`<div class="pf-certs">${p.certs.map(c=>`<div class="pf-cert ${c.verified?"ok":""}"><span class="pf-ci">${/pdf/.test(c.mime||"")?"📄":"🖼️"}</span><div><b>${esc(c.name)}</b><small>${esc(c.type||"")}${c.issuer?" · "+esc(c.issuer):""}${c.date?" · "+date(c.date):""}</small>${c.verified?`<em>✓ تحقق منها ${esc(c.verifiedBy||"")}</em>`:`<em class="wait">للحين ما تراجعت</em>`}</div>
          <div class="pf-ca"><button class="btn btn-outline" onclick="pfOpen('${s.id}','${c.id}')">فتح</button>${ver&&!c.verified?`<button class="btn btn-primary" onclick="pfVerify('${s.id}','${c.id}')">تم التحقق</button>`:""}${self?`<button class="btn btn-outline dv-del" onclick="pfCertDel('${s.id}','${c.id}')">حذف</button>`:""}</div></div>`).join("")}</div>`:`<div class="empty">${self?"ارفع شهاداتك وترخيصك عشان المشرف يراجعها.":"للحين ما رفع شهادات."}</div>`}`;
      if(self)h+=`<form class="pf-add" onsubmit="pfAddCert(event,'${s.id}')"><h3>＋ شهادة جديدة</h3><div class="form-grid"><div class="field"><label>اسم الشهادة</label><input class="input" name="name" required placeholder="مثال: بكالوريوس اضطرابات التواصل"></div><div class="field"><label>النوع</label><select class="select" name="type">${PF_CTYPES.map(t=>`<option>${t}</option>`).join("")}</select></div>
          <div class="field"><label>الجهة المانحة</label><input class="input" name="issuer"></div><div class="field"><label>التاريخ</label><input class="input" type="date" name="date"></div>
          <div class="field full"><label>الملف (صورة أو PDF)</label><input class="input" type="file" name="file" accept="image/*,application/pdf" required></div></div>
          <button class="btn btn-primary" ${PFUI.busy?"disabled":""}>${PFUI.busy?"يترفع…":"ارفع الشهادة"}</button><p class="muted" style="font-size:12px;margin:6px 0 0">الصور تتضغط تلقائي. الـPDF لين 8 ميجا. الملفات تتحفظ على الجهاز هذا لين ما المنصة تشتغل على السيرفر.</p></form>`;
      return h+`</section>`;
    }
    async function pfPhoto(inp,sid){const s=personById(sid);const f=inp.files&&inp.files[0];if(!s||!f||!pfIsSelf(s))return;try{const r=await pfImg(f,320,0.82);pfOf(s).photo=r.url;audit("تحديث الصورة الشخصية",s.name);persist();notify("✓ صورتك تحدثت");render()}catch(_e){notify("ما قدرت أقرا الصورة، جرّب صورة ثانية")}}
    function pfPhotoDel(sid){const s=personById(sid);if(!s||!pfIsSelf(s))return;pfOf(s).photo=null;persist();render()}
    function pfSave(e,sid){e.preventDefault();const s=personById(sid);if(!s||!pfIsSelf(s))return notify("كل موظف يعدّل ملفه بنفسه");const f=Object.fromEntries(new FormData(e.target).entries());const p=pfOf(s);
      ["degree","major","university","gradYear","licenseNo","licenseClass","licenseExp","years","email","langs","bio"].forEach(k=>p[k]=String(f[k]||"").trim());p.updatedAt=new Date().toISOString();if(p.email)s.email=p.email;
      audit("تحديث الملف المهني",s.name);persist();notify("✓ ملفك المهني انحفظ");render()}
    async function pfAddCert(e,sid){e.preventDefault();const s=personById(sid);if(!s||!pfIsSelf(s))return;const fd=new FormData(e.target);const file=fd.get("file");if(!file||!file.size)return notify("اختار ملف الشهادة");
      const isPdf=/pdf/.test(file.type);if(!isPdf&&!/^image\//.test(file.type))return notify("الملف لازم يكون صورة أو PDF");if(isPdf&&file.size>8*1024*1024)return notify("الـPDF أكبر من 8 ميجا");
      PFUI.busy=true;render();try{const id="cert-"+Date.now();let blob=file,mime=file.type;if(!isPdf){const r=await pfImg(file,1800,0.8);blob=r.blob;mime="image/jpeg"}await pfPut(id,blob);
        pfOf(s).certs.unshift({id,name:String(fd.get("name")||"").trim(),type:fd.get("type"),issuer:String(fd.get("issuer")||"").trim(),date:fd.get("date")||"",mime,size:blob.size,at:new Date().toISOString(),verified:false});
        audit("رفع شهادة: "+fd.get("name"),s.name);const sup=s.department?agSup(s.department):null;if(sup&&sup.id!==s.id)state.messages.unshift({id:"msg-"+Date.now()+"-pf",fromId:s.id,fromName:s.name,toId:sup.id,toName:sup.name,text:`📄 رفعت شهادة جديدة «${fd.get("name")}» على ملفي المهني — محتاجة مراجعتك.`,date:todayISO(),read:false});
        persist();notify("✓ الشهادة انرفعت ووصلت للمشرف يراجعها")}catch(_e){notify("ما قدرت أحفظ الملف على الجهاز هذا")}PFUI.busy=false;render()}
    async function pfOpen(sid,cid){try{const b=await pfGet(cid);if(!b)return notify("الملف هذا مو موجود على الجهاز هذا (انرفع من جهاز ثاني)");const u=URL.createObjectURL(b);const w=window.open(u,"_blank");if(!w){const a=document.createElement("a");a.href=u;a.download=cid;a.click()}setTimeout(()=>URL.revokeObjectURL(u),60000)}catch(_e){notify("ما قدرت أفتح الملف")}}
    function pfCertDel(sid,cid){const s=personById(sid);if(!s||!pfIsSelf(s))return;const p=pfOf(s);const c=p.certs.find(x=>x.id===cid);if(!c)return;if(PFUI.delArm!==cid){PFUI.delArm=cid;notify("اضغط «حذف» ثاني للتأكيد");setTimeout(()=>{if(PFUI.delArm===cid)PFUI.delArm=null},4000);return}
      PFUI.delArm=null;p.certs=p.certs.filter(x=>x.id!==cid);pfDelFile(cid);audit("حذف شهادة: "+c.name,s.name);persist();render()}
    function pfVerify(sid,cid){const s=personById(sid);if(!s||!pfCanVerify(s))return notify("التحقق من الشهادات للمشرف والإدارة");const c=pfOf(s).certs.find(x=>x.id===cid);if(!c)return;const me=getCurrentPerson();c.verified=true;c.verifiedBy=me?me.name:(state.role==="management"?"الإدارة":"المشرف");c.verifiedAt=new Date().toISOString();
      audit("التحقق من شهادة: "+c.name,s.name);state.messages.unshift({id:"msg-"+Date.now()+"-pv",fromId:me?me.id:null,fromName:c.verifiedBy,toId:s.id,toName:s.name,text:`✓ شهادتك «${c.name}» تراجعت انتحقق منها.`,date:todayISO(),read:false});persist();notify("انسجل التحقق");render()}

    // ---- دليل الإيميل والدرايف ----
    function dirEnsure(){state.center=state.center||{};if(!state.center.mailDomain)state.center.mailDomain="center.sa";if(!state.center.dir)state.center.dir={};return state.center.dir}
    function dirGet(key,def){const d=dirEnsure();return d[key]||def}
    function dirEntries(){const D=dirEnsure();const dom=state.center.mailDomain;const out=[];
      out.push({key:"admin",group:"الإدارة",name:"الإدارة العامة",email:dirGet("admin.email","admin@"+dom),drive:dirGet("admin.drive","")});
      state.staff.filter(s=>s.roleCategory==="management").forEach(s=>out.push({key:"st."+s.id,group:"الإدارة",name:s.name,sub:s.role,email:(s.profile&&s.profile.email)||dirGet("st."+s.id+".email","admin@"+dom),person:s}));
      out.push({key:"reception",group:"الاستقبال",name:"الاستقبال",email:dirGet("reception.email","reception@"+dom),drive:dirGet("reception.drive","")});
      state.departments.filter(d=>d.state!=="قريباً").forEach(d=>{const sup=agSup(d.id);out.push({key:"dep."+d.id,group:"الأقسام",name:d.name,sub:sup?"المشرف: "+sup.name:"",email:dirGet("dep."+d.id+".email",d.id+"@"+dom),drive:dirGet("dep."+d.id+".drive",""),dept:d.id});
        if(sup)out.push({key:"st."+sup.id,group:"مشرفين الأقسام",name:sup.name,sub:"مشرف "+d.name,email:(sup.profile&&sup.profile.email)||dirGet("st."+sup.id+".email",d.id+".supervisor@"+dom),person:sup,dept:d.id})});
      return out.map(e=>({...e,set:!!(D[e.key+".email"]||(e.person&&e.person.profile&&e.person.profile.email))}))}
    function dirCanEdit(e){if(state.sipadMode)return false;if(state.role==="management")return true;if(state.role!=="supervisor")return false;const me=getCurrentPerson();return !!e.dept&&(!me||!me.department||me.department===e.dept)}
    function dirHtml(compact){const L=dirEntries();const groups=[...new Set(L.map(e=>e.group))];const anyEdit=L.some(dirCanEdit);const guess=L.filter(e=>!e.set).length;
      return `<section class="card dir-card"><div class="card-head"><h2>${ic("chat",18)} دليل الإيميل والدرايف</h2>${state.role==="management"&&!state.sipadMode?`<button class="btn btn-outline" onclick="dirEdit()">${PFUI.dirEdit?"إغلاق التعديل":"تعديل الدليل"}</button>`:anyEdit?`<button class="btn btn-outline" onclick="dirEdit()">${PFUI.dirEdit?"إغلاق":"تعديل قسمي"}</button>`:""}</div>
        ${guess&&state.role==="management"&&!state.sipadMode?`<p class="dir-note">${guess} عنوان للحين مقترح على دومين <b dir="ltr">${esc(state.center.mailDomain)}</b> — اكتب الإيميلات الحقيقية من «تعديل الدليل».</p>`:""}
        ${PFUI.dirEdit?dirForm(L):groups.map(g=>`<h4 class="dir-g">${esc(g)}</h4><div class="dir-list">${L.filter(e=>e.group===g).map(e=>`<div class="dir-row">${e.person?pfAv(e.person,"sm"):`<span class="pf-av sm">${ic(e.group==="الأقسام"?"departments":"team",14)}</span>`}<div><b>${esc(e.name)}</b>${e.sub?`<small>${esc(e.sub)}</small>`:""}<code dir="ltr">${e.email?esc(e.email):"—"}${e.email&&!e.set?' <i class="dir-sug">مقترح</i>':""}</code></div>
          <div class="dir-act">${e.email?`<a class="btn btn-primary" href="mailto:${esc(e.email)}" target="_blank" rel="noopener">✉️ إيميل</a><button class="btn btn-outline" onclick="dirCopy('${esc(e.email)}')">نسخ</button>`:""}${e.drive?`<a class="btn btn-outline" href="${esc(e.drive)}" target="_blank" rel="noopener">📁 الدرايف</a>`:""}</div></div>`).join("")}</div>`).join("")}</section>`}
    function dirForm(L){const ed=L.filter(dirCanEdit);return `<form class="dir-form" onsubmit="dirSave(event)">${state.role==="management"?`<div class="field"><label>دومين إيميلات المركز</label><input class="input" name="domain" dir="ltr" value="${esc(state.center.mailDomain)}"></div>`:""}
      ${ed.map(e=>`<div class="dir-frow"><b>${esc(e.name)}</b><input class="input" name="${esc(e.key)}.email" dir="ltr" type="email" placeholder="الإيميل" value="${e.set?esc(e.email):""}">${e.person?"":`<input class="input" name="${esc(e.key)}.drive" dir="ltr" placeholder="رابط مجلد الدرايف (اختياري)" value="${esc(e.drive||"")}">`}</div>`).join("")}<button class="btn btn-primary">حفظ الدليل</button></form>`}
    function dirEdit(){PFUI.dirEdit=!PFUI.dirEdit;render()}
    function dirSave(e){e.preventDefault();const D=dirEnsure();const f=Object.fromEntries(new FormData(e.target).entries());const L=dirEntries();
      if(state.role==="management"&&f.domain)state.center.mailDomain=String(f.domain).trim().replace(/^@/,"");
      L.filter(dirCanEdit).forEach(x=>{["email","drive"].forEach(k=>{const v=f[x.key+"."+k];if(v===undefined)return;const t=String(v).trim();if(t)D[x.key+"."+k]=t;else delete D[x.key+"."+k]})});
      audit("تحديث دليل الإيميل والدرايف","");PFUI.dirEdit=false;persist();notify("✓ الدليل تحدث");render()}
    function dirCopy(t){try{navigator.clipboard.writeText(t).then(()=>notify("انتسخ: "+t),()=>notify(t))}catch(_e){notify(t)}}
    // ---- ربط الواجهات ----
    function pfSwap(h){state.staff.forEach(s=>{if(!s.profile||!s.profile.photo)return;const n=esc(s.name).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      h=h.replace(new RegExp('<span class="sp-av">[^<]{0,4}</span>(<b>|<span><b>)'+n+'</b>','g'),(m,g1)=>`<span class="sp-av has-ph"><img src="${s.profile.photo}" alt=""></span>${g1}${esc(s.name)}</b>`)});return h}
    const _pfLock=sipadLockScreen;sipadLockScreen=function(){return pfSwap(_pfLock())};
    const _pfConn=staffConnectView;staffConnectView=function(){let h=pfSwap(_pfConn());const k=h.indexOf('<div class="cnx-wrap">');return k>=0?h.slice(0,k)+dirHtml()+h.slice(k):h+dirHtml()};
    const _pfConn2=connectView;connectView=function(){const h=_pfConn2();if(state.role==="staff")return h;return dirHtml()+h};
    // الآيباد: زرار «ملفي» + شاشة الملف المهني (فيها دليل الإيميل كمان)
    const _pfScr=staffIpadScreen;staffIpadScreen=function(){let h=_pfScr();const s=state.sipad&&sipadStaff();if(!s)return h;
      h=h.replace('<button class="spn-top" onclick="attOpen()">',`<button class="spn-top" onclick="pfIpad(true)">${s.profile&&s.profile.photo?`<img class="pf-mini" src="${s.profile.photo}" alt="">`:"👤"} ملفي</button><button class="spn-top" onclick="attOpen()">`);
      if(PFUI.open){const i=h.indexOf('<main class="ki-main">');const j=h.lastIndexOf("</main>");if(i>=0&&j>i)h=h.slice(0,i)+`<main class="ki-main"><div class="ev-head"><div><h1>ملفي المهني</h1><small>بياناتك وشهاداتك — المشرف يراجعها ويوثّقها</small></div><button class="btn btn-outline" onclick="pfIpad(false)">← رجوع لجدولي</button></div>${pfHtml(s,"self")}${dirHtml()}`+h.slice(j)}
      return h};
    function pfIpad(on){PFUI.open=!!on;render();window.scrollTo(0,0)}
    const _pfSLock=sipadLock;sipadLock=function(){PFUI.open=false;return _pfSLock()};
    const _pfHome=sipadHome;sipadHome=function(s){const h=_pfHome(s);const p=s.profile;if(!p||!p.photo)return h;return h.replace('<section class="sp-hello"><div>',`<section class="sp-hello"><div class="sp-hello-ph"><img src="${p.photo}" alt=""></div><div>`)};
    // المنصة: «آيبادي» فيها ملفي المهني، وصفحة الموظف للمشرف فيها ملفه للمراجعة
    const _pfMine=myIpadView;myIpadView=function(){let h=_pfMine();const me=getCurrentPerson();if(!me||!ipOwnerEligible(me))return h;const p=pfOf(me);const lic=pfLic(me);
      const strip=`<section class="card pf-strip">${pfAv(me,"lg")}<div><b>ملفي المهني</b><small>${p.degree?esc(p.degree)+(p.major?" · "+esc(p.major):""):"للحين ما كمّلت بياناتك"} · ${p.certs.length} شهادة${lic?" · "+esc(lic.txt):""}</small></div><span class="pf-pctm">${pfDone(me)}%</span><button class="btn ${PFUI.page?"btn-outline":"btn-primary"}" onclick="pfPage()">${PFUI.page?"إغلاق":"افتح ملفي وارفع شهاداتي"}</button></section>${PFUI.page?pfHtml(me,"self"):""}`;
      const k=h.indexOf('<div class="mi-wrap">');return k>=0?h.slice(0,k)+strip+h.slice(k):h+strip};
    function pfPage(){PFUI.page=!PFUI.page;render()}
    const _pfStaffPage=staffPageHtml;staffPageHtml=function(s,self){let h=_pfStaffPage(s,self);if(!s||self)return h;h=h.replace(/<div class="pg-av">[^<]*<\/div>/,`<div class="pg-av">${s.profile&&s.profile.photo?`<img src="${s.profile.photo}" alt="">`:esc((s.name.replace(/^(أ\.|د\.)\s*/,"")||"?").charAt(0))}</div>`);
      const k=h.indexOf('<div class="pg-grid">');return k>=0?h.slice(0,k)+pfHtml(s,"view")+h.slice(k):h};
    Object.assign(window,{pfPhoto,pfPhotoDel,pfSave,pfAddCert,pfOpen,pfCertDel,pfVerify,pfIpad,pfPage,dirEdit,dirSave,dirCopy,sipadLock});

    window.setView=setView;window.mxFull=mxFull;window.svSetup=svSetup;window.svLogin=svLogin;window.svFamLogin=svFamLogin;window.svTab=svTab;window.svLogout=svLogout;window.svInstall=svInstall;window.svPushSetup=svPushSetup;window.svUserAdd=svUserAdd;window.svUserSet=svUserSet;window.svUserPw=svUserPw;window.svGenPw=svGenPw;window.svSecSave=svSecSave;window.svWaTest=svWaTest;window.svPushTest=svPushTest;window.svCopy=svCopy;window.trSet=trSet;window.scRec=scRec;window.scFile=scFile;window.scWrite=scWrite;window.scField=scField;window.scAddGoal=scAddGoal;window.scPick=scPick;window.scFlag=scFlag;window.scSign=scSign;window.__awanState=()=>state;window.memTeach=memTeach;window.memWhy=memWhy;window.memDel=memDel;window.memPromote=memPromote;window.memSet=memSet;window.memAsk=memAsk;window.memResetFb=memResetFb;window.lvSet=lvSet;window.lvForce=lvForce;window.lvTake=lvTake;window.lvTakeFor=lvTakeFor;window.rdScan=rdScan;window.rdPaste=rdPaste;window.rdAddSrc=rdAddSrc;window.rdSrcT=rdSrcT;window.rdSrcDel=rdSrcDel;window.rdCfgSet=rdCfgSet;window.rdAct=rdAct;window.rdSendOne=rdSendOne;window.enRun=enRun;window.enAIBatch=enAIBatch;window.enSend=enSend;window.enSendAllChild=enSendAllChild;window.ebAddPlan=ebAddPlan;window.ebLog=ebLog;window.ebFamLog=ebFamLog;window.ebReply=ebReply;window.ebRemind=ebRemind;window.ebSet=ebSet;window.ebAnalyze=ebAnalyze;window.ebSaveEvent=ebSaveEvent;window.ebSend=ebSend;window.ebSendAll=ebSendAll;window.ebLib=ebLib;window.ebSetK=ebSetK;window.ebGeo=ebGeo;window.niLogT=niLogT;window.ntCloseDone=ntCloseDone;window.ntClose=ntClose;window.ntCloseAll=ntCloseAll;window.ntToggle=ntToggle;window.abTag=abTag;window.abCtx=abCtx;window.abObs2=abObs2;window.abO2Tag=abO2Tag;window.abO2Tr=abO2Tr;window.abO2Done=abO2Done;window.abO2Cancel=abO2Cancel;window.abStartFor=abStartFor;window.asSet=asSet;window.asQ=asQ;window.asRun=asRun;window.asNewVideo=asNewVideo;window.asExport=asExport;window.asImport=asImport;window.vlCalib=vlCalib;window.vlPhase=vlPhase;window.vlSay=vlSay;window.vlTask=vlTask;window.vlItem=vlItem;window.vlStim=vlStim;window.vlTranscribe=vlTranscribe;window.vlAudioOk=vlAudioOk;window.vlItemFix=vlItemFix;window.vlPrint=vlPrint;window.vlSendParent=vlSendParent;window.vlStart=vlStart;window.vlFile=vlFile;window.vlBegin=vlBegin;window.vlEnd=vlEnd;window.vlCancel=vlCancel;window.vlSD=vlSD;window.vlScore=vlScore;window.vlSet=vlSet;window.vlConsent=vlConsent;window.vlOpen=vlOpen;window.vlBack=vlBack;window.vlNote=vlNote;window.vlReview=vlReview;window.vlGoalOn=vlGoalOn;window.vlFix=vlFix;window.vlToPlan=vlToPlan;window.vlDel=vlDel;window.vlSeek=vlSeek;window.vlAI=vlAI;window.kxGo=kxGo;window.kxIn=kxIn;window.kxChip=kxChip;window.kxStr=kxStr;window.kxNext=kxNext;window.kxBook=kxBook;window.kxLater=kxLater;window.kxGovSet=kxGovSet;window.kxSent=kxSent;window.kxLeadSet=kxLeadSet;window.kxLeadBook=kxLeadBook;window.gdStop=gdStop;window.gdSet=gdSet;window.gdDoc=gdDoc;window.gdLicSet=gdLicSet;window.gdUndo=gdUndo;window.gdInc=gdInc;window.gdIncClose=gdIncClose;window.gdMock=gdMock;window.agCmd=agCmd;window.agChip=agChip;window.agExec=agExec;window.agDrop=agDrop;window.agDeptRun=agDeptRun;window.agQuick=agQuick;window.agTri=agTri;window.agTriAI=agTriAI;window.agRoute=agRoute;window.agCover=agCover;window.agComp=agComp;window.apExcuse=apExcuse;window.apAddKnow=apAddKnow;window.dgCopyLink=dgCopyLink;window.kioskFull=kioskFull;window.openStaffIpad=openStaffIpad;window.apMode=apMode;window.apAgentMode=apAgentMode;window.apRunNow=apRunNow;window.apTab=apTab;window.apSet=apSet;window.apApprove=apApprove;window.apApproveAll=apApproveAll;window.apPayGen=apPayGen;window.apPayApprove=apPayApprove;window.apPayPaid=apPayPaid;window.apSalarySet=apSalarySet;window.apPayCsv=apPayCsv;window.apViol=apViol;window.apAddViol=apAddViol;window.apAddLeave=apAddLeave;window.apLeave=apLeave;window.apRulesSave=apRulesSave;window.rfStage=rfStage;window.rfSend=rfSend;window.rfCopyLink=rfCopyLink;window.rfConvertOpen=rfConvertOpen;window.rfConvert=rfConvert;window.state_rfClose=state_rfClose;window.scAbsent=scAbsent;window.scCompensate=scCompensate;window.scAutoBook=scAutoBook;window.tmSearch=tmSearch;window.tmDept=tmDept;window.cmOpen=cmOpen;window.cmSet=cmSet;window.cmSearch=cmSearch;window.cmQuick=cmQuick;window.cmSend=cmSend;window.cmMeet=cmMeet;window.cmDictate=cmDictate;window.state_ptSeg=state_ptSeg;window.openMeetingRoom=openMeetingRoom;window.approveCommItem=approveCommItem;window.mxSound=mxSound;window.mxSim=mxSim;window.ptSet=ptSet;window.ptSearch=ptSearch;window.ptOpen=ptOpen;window.ptBook=ptBook;window.ptArchive=ptArchive;window.ptExport=ptExport;window.deptGo=deptGo;window.deptMode=deptMode;window.deptTab=deptTab;window.deptMsg=deptMsg;window.deptMsgSend=deptMsgSend;window.deptLinkOne=deptLinkOne;window.ipDeptClear=ipDeptClear;window.openDepartmentDetail=openDepartmentDetail;window.plUndoLast=plUndoLast;window.plPopOpen=plPopOpen;window.plPopClose=plPopClose;window.plPopSave=plPopSave;window.plCancelApt=plCancelApt;window.plDelBlock=plDelBlock;window.plHours=plHours;window.plCover=plCover;window.plCopy=plCopy;window.plLinkAll=plLinkAll;window.plDemoStaff=plDemoStaff;window.plSetDay=plSetDay;window.plSetDept=plSetDept;window.state_plGoIpad=state_plGoIpad;window.ipSetTab=ipSetTab;window.ipDevEdit=ipDevEdit;window.ipDevSave=ipDevSave;window.ipDevFormSync=ipDevFormSync;window.ipDevCmd=ipDevCmd;window.ipDevMsgAsk=ipDevMsgAsk;window.ipDevMsgSend=ipDevMsgSend;window.ipDevToggle=ipDevToggle;window.ipDevDel=ipDevDel;window.ipDevCopy=ipDevCopy;window.ipDevOpen=ipDevOpen;window.ipTlOpen=ipTlOpen;window.ipTlClose=ipTlClose;window.ipTlPick=ipTlPick;window.ipTlSaveApt=ipTlSaveApt;window.ipTlCancelApt=ipTlCancelApt;window.ipTlAddApt=ipTlAddApt;window.ipTlAddBlock=ipTlAddBlock;window.ipTlDelBlock=ipTlDelBlock;window.ipTlHours=ipTlHours;window.ipCtlMsg=ipCtlMsg;window.sipadBannerClose=sipadBannerClose;window.ipOpen=ipOpen;window.ipClose=ipClose;window.ipStep=ipStep;window.ipMsg=ipMsg;window.ipSearch=ipSearch;window.ipSize=ipSize;window.ipFilter=ipFilter;window.ipSimStart=ipSimStart;window.ipSimStop=ipSimStop;window.openStaffIpad=openStaffIpad;window.closeStaffIpad=closeStaffIpad;window.sipadPick=sipadPick;window.sipadLogin=sipadLogin;window.sipadLock=sipadLock;window.sipadOpen=sipadOpen;window.goPublic=goPublic;window.goApp=goApp;window.toggleLang=toggleLang;window.toggleTheme=toggleTheme;window.changeRole=changeRole;window.resetData=resetData;window.saveSettings=saveSettings;window.filterPatients=filterPatients;window.openPatient=openPatient;window.openModal=openModal;window.closeModal=closeModal;window.addPatient=addPatient;window.addAppointment=addAppointment;window.saveAppointment=saveAppointment;window.deleteAppointment=deleteAppointment;window.confirmCompensation=confirmCompensation;window.addReferral=addReferral;window.addStaff=addStaff;window.addDepartment=addDepartment;window.openDepartmentDetail=openDepartmentDetail;window.closeDepartmentDetail=closeDepartmentDetail;window.saveDepartmentInfo=saveDepartmentInfo;window.togglePermission=togglePermission;window.notify=notify;window.saveNotes=saveNotes;window.savePatientInfo=savePatientInfo;window.archivePatient=archivePatient;window.restorePatient=restorePatient;window.deletePatientPermanently=deletePatientPermanently;window.setPatientsTab=setPatientsTab;window.advanceReferral=advanceReferral;window.advanceRegistration=advanceRegistration;window.markAttendance=markAttendance;window.parentLogin=parentLogin;window.schoolLogin=schoolLogin;window.publicReferral=publicReferral;window.setParentTab=setParentTab;window.submitCaseStudy=submitCaseStudy;window.submitConsultation=submitConsultation;window.submitQuestion=submitQuestion;window.aptPhoneFor=aptPhoneFor;window.logoutFamily=logoutFamily;window.pickBookingGenderPref=pickBookingGenderPref;window.pickBookingSpecialist=pickBookingSpecialist;window.pickBookingDay=pickBookingDay;window.pickBookingTime=pickBookingTime;window.submitSessionBooking=submitSessionBooking;window.cancelBooking=cancelBooking;window.markBookingSeen=markBookingSeen;window.markAllBookingsSeen=markAllBookingsSeen;window.confirmReschedule=confirmReschedule;window.requestAddon=requestAddon;window.submitCustomServiceRequest=submitCustomServiceRequest;window.toggleFamilyService=toggleFamilyService;window.addFamilyService=addFamilyService;window.removeFamilyService=removeFamilyService;window.setFacilityTab=setFacilityTab;window.enterFacility=enterFacility;window.switchBizTab=switchBizTab;window.bizAuthSubmit=bizAuthSubmit;window.bizOrgSubmit=bizOrgSubmit;window.bizEnterOrg=bizEnterOrg;window.bizPreviewLogo=bizPreviewLogo;window.bizClearLogo=bizClearLogo;window.logoutFacility=logoutFacility;window.registerAdmin=registerAdmin;window.loginAdmin=loginAdmin;window.logoutAdmin=logoutAdmin;window.previewOrgLogo=previewOrgLogo;window.clearOrgLogo=clearOrgLogo;window.saveOrgProfile=saveOrgProfile;window.staffCodeLogin=staffCodeLogin;window.staffLogout=staffLogout;window.openStaffSection=openStaffSection;window.closeStaffSection=closeStaffSection;window.toggleStaffTask=toggleStaffTask;window.startLiveSession=startLiveSession;window.liveSelectGoal=liveSelectGoal;window.liveAddGoal=liveAddGoal;window.liveTrial=liveTrial;window.liveUndo=liveUndo;window.liveNoteInput=liveNoteInput;window.liveSoap=liveSoap;window.liveDictate=liveDictate;window.livePanic=livePanic;window.liveEndSession=liveEndSession;window.liveCloseSession=liveCloseSession;window.liveOpenPatient=liveOpenPatient;window.dttSetDay=dttSetDay;window.intakeTyping=intakeTyping;window.intakeSubmit=intakeSubmit;window.aiToggle=aiToggle;window.aiApprove=aiApprove;window.aiAskInfo=aiAskInfo;window.csCaseSubmit=csCaseSubmit;window.csCaseEdit=csCaseEdit;window.csCaseCancel=csCaseCancel;window.csRequestFamily=csRequestFamily;window.csGoalSet=csGoalSet;window.csApproveAll=csApproveAll;window.opsFilter=opsFilter;window.opsDaily=opsDaily;window.opsDailyClose=opsDailyClose;window.agentToggle=agentToggle;window.aiSave=aiSave;window.aiTest=aiTest;window.aiCaseGoals=aiCaseGoals;window.openIntakeKiosk=openIntakeKiosk;window.closeIntakeKiosk=closeIntakeKiosk;window.kiStep=kiStep;window.kiSubmit=kiSubmit;window.kiNew=kiNew;window.dgShareLink=dgShareLink;window.dgShareClose=dgShareClose;window.dgCopy=dgCopy;window.dttResume=dttResume;window.setAuditFilter=setAuditFilter;window.goAudit=goAudit;window.csCloseSig=csCloseSig;window.famOtpCancel=famOtpCancel;window.csOpen=csOpen;window.csCancel=csCancel;window.csStart=csStart;window.csMove=csMove;window.csEnd=csEnd;window.csClear=csClear;window.csSave=csSave;window.csShowSig=csShowSig;window.csWithdraw=csWithdraw;window.famConsentStart=famConsentStart;window.famConsentVerify=famConsentVerify;window.famConsentWithdraw=famConsentWithdraw;window.kioskSubmit=kioskSubmit;window.kioskFull=kioskFull;window.ackNewChildAppt=ackNewChildAppt;window.ackAllNewChildAppts=ackAllNewChildAppts;window.setStaffScheduleFilter=setStaffScheduleFilter;window.updateStaffCode=updateStaffCode;window.updateStaffRoleCategory=updateStaffRoleCategory;window.reviewPlan=reviewPlan;window.confirmReturnPlan=confirmReturnPlan;window.submitQualityAudit=submitQualityAudit;window.sendInternalMessage=sendInternalMessage;window.markMessageRead=markMessageRead;window.toggleStaffPresence=toggleStaffPresence;window.updateStaffDepartment=updateStaffDepartment;window.submitNewBooking=submitNewBooking;window.reviewConsultation=reviewConsultation;window.confirmRejectConsultation=confirmRejectConsultation;window.updateLicenseStepStatus=updateLicenseStepStatus;window.removeLicenseStep=removeLicenseStep;window.addLicenseStep=addLicenseStep;window.saveLicenseInfo=saveLicenseInfo;window.saveLicenseNotes=saveLicenseNotes;window.generateProgressReport=generateProgressReport;window.toggleReportShare=toggleReportShare;window.viewProgressReport=viewProgressReport;window.saveReviewSettings=saveReviewSettings;window.markReviewSent=markReviewSent;window.toggleHasReviewed=toggleHasReviewed;window.updateGovStepStatus=updateGovStepStatus;window.removeGovStep=removeGovStep;window.addGovStep=addGovStep;window.saveGovInfo=saveGovInfo;window.saveGovNotes=saveGovNotes;window.saveHealthBirth=saveHealthBirth;window.saveHearing=saveHearing;window.saveNeuroReport=saveNeuroReport;window.deleteNeuroReport=deleteNeuroReport;window.savePriorRehab=savePriorRehab;window.saveHealthLink=saveHealthLink;window.toggleHealthShare=toggleHealthShare;window.saveSchoolNote=saveSchoolNote;window.submitMedicalLinkReport=submitMedicalLinkReport;window.attachMedicalReport=attachMedicalReport;window.submitSessionLog=submitSessionLog;window.submitHomeLog=submitHomeLog;window.startVoiceCapture=startVoiceCapture;window.stopVoiceCapture=stopVoiceCapture;window.analyzeVoiceNote=analyzeVoiceNote;window.setConnectTab=setConnectTab;window.confirmScheduleMeeting=confirmScheduleMeeting;window.toggleMeetingKindFields=toggleMeetingKindFields;window.openMeetingRoom=openMeetingRoom;window.backToConnect=backToConnect;window.startMeeting=startMeeting;window.saveMeetingNotes=saveMeetingNotes;window.addMeetingDecision=addMeetingDecision;window.addMeetingActionItem=addMeetingActionItem;window.toggleActionItemDone=toggleActionItemDone;window.endAndAnalyzeMeeting=endAndAnalyzeMeeting;window.advanceDecision=advanceDecision;window.sendCommMessage=sendCommMessage;window.markCommSeen=markCommSeen;window.approveCommItem=approveCommItem;window.dismissCommBanner=dismissCommBanner;window.sendFamilyCommMessage=sendFamilyCommMessage;window.setLibraryTab=setLibraryTab;window.setLibraryFilter=setLibraryFilter;window.applyActivityAtHome=applyActivityAtHome;window.addLibraryArticle=addLibraryArticle;window.renderStdAssessDomains=renderStdAssessDomains;window.addCustomAssessDomain=addCustomAssessDomain;window.saveStdAssessment=saveStdAssessment;window.deleteStdAssessment=deleteStdAssessment;window.toggleDeptProgram=toggleDeptProgram;window.addCustomDeptProgram=addCustomDeptProgram;window.renderAssignProgramOptions=renderAssignProgramOptions;window.saveAssignProgram=saveAssignProgram;window.removeAssignedProgram=removeAssignedProgram;window.lxGo=lxGo;window.lxEnter=lxEnter;
    if(location.hash==="#case"){state.view="public";state.portal="parent";state.parentTab="case"}
    if(location.hash==="#intake-kiosk"){state.intakeKiosk=true;try{sessionStorage.setItem("awan-kiosk","1")}catch(_e){}}
    try{if(sessionStorage.getItem("awan-kiosk")==="1")state.intakeKiosk=true}catch(_e){}
    if(/^#ipad=/.test(location.hash)){const _d=location.hash.slice(6);try{sessionStorage.setItem("awan-dev",_d);sessionStorage.setItem("awan-sipad-mode","1")}catch(_e){}state.sipadMode=true}
    if(location.hash==="#staff-ipad"){state.sipadMode=true;try{sessionStorage.setItem("awan-sipad-mode","1")}catch(_e){}}
    try{if(sessionStorage.getItem("awan-sipad-mode")==="1"){state.sipadMode=true;const _sid=sessionStorage.getItem("awan-sipad");if(_sid&&personById(_sid))state.sipad=_sid}}catch(_e){}
    if(window.__awanSim){state.sipadMode=true;if(state.view==="public")state.view="dashboard"}
    window.addEventListener("hashchange",()=>{if(location.hash==="#staff-ipad"){openStaffIpad()}else if(location.hash==="#intake-kiosk"){openIntakeKiosk()}else if(location.hash==="#case"){state.intakeKiosk=false;state.view="public";state.portal="parent";state.parentTab="case";render()}});
    /* === تفاعلية إضافية: ميل ثلاثي الأبعاد للكروت + توهج يتبع المؤشر + تموّج عند الضغط ===
       تعمل بالتفويض (delegation) على document عشان تفضل شغالة حتى بعد كل render() اللي يستبدل محتوى #app بالكامل. */
    (function initExtraInteractivity(){
      const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canHover = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
      if(reduceMotion) return;

      if(canHover){
        let rafId=null, lastEvt=null;
        const clearTilt=()=>{document.querySelectorAll(".tilt-card, .portal-card").forEach(c=>{c.style.transform=""})};
        document.addEventListener("mousemove",(e)=>{
          lastEvt=e;
          if(rafId) return;
          rafId=requestAnimationFrame(()=>{
            rafId=null;
            const el=lastEvt.target.closest && lastEvt.target.closest(".tilt-card, .portal-card");
            document.querySelectorAll(".tilt-card, .portal-card").forEach(c=>{if(c!==el) c.style.transform=""});
            if(!el) return;
            const r=el.getBoundingClientRect();
            const px=(lastEvt.clientX-r.left)/r.width, py=(lastEvt.clientY-r.top)/r.height;
            const rx=(py-0.5)*-7, ry=(px-0.5)*7;
            el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
          });
        });
        document.addEventListener("mouseleave",clearTilt,true);
        window.addEventListener("blur",clearTilt);
      }

      document.addEventListener("mousemove",(e)=>{
        const hero=e.target.closest && e.target.closest(".hero-banner");
        if(!hero) return;
        const r=hero.getBoundingClientRect();
        hero.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");
        hero.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%");
      });

      document.addEventListener("click",(e)=>{
        const btn=e.target.closest && e.target.closest(".btn");
        if(!btn) return;
        const r=btn.getBoundingClientRect();
        const ripple=document.createElement("span");
        ripple.className="btn-ripple";
        const size=Math.max(r.width,r.height)*1.7;
        ripple.style.position="fixed";
        ripple.style.width=ripple.style.height=size+"px";
        ripple.style.left=(e.clientX-size/2)+"px";
        ripple.style.top=(e.clientY-size/2)+"px";
        ripple.style.zIndex="9999";
        const dark=btn.classList.contains("btn-primary")||btn.classList.contains("hero-btn-solid")||btn.classList.contains("btn-secondary");
        ripple.style.background=dark?"rgba(255,255,255,.45)":"rgba(23,66,61,.14)";
        document.body.appendChild(ripple);
        ripple.addEventListener("animationend",()=>ripple.remove());
      },true);
    })();

    (function initBackToTop(){
      const btn=document.createElement("button");
      btn.type="button";
      btn.className="back-to-top";
      btn.setAttribute("aria-label","العودة إلى أعلى الصفحة");
      btn.innerHTML=`<span style="display:flex;transform:rotate(180deg)">${ic("chevronDown",18)}</span>`;
      document.body.appendChild(btn);
      const reduceMotion=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let ticking=false;
      const onScroll=()=>{
        if(ticking) return;
        ticking=true;
        requestAnimationFrame(()=>{
          btn.classList.toggle("visible", window.scrollY>200);
          ticking=false;
        });
      };
      window.addEventListener("scroll",onScroll,{passive:true});
      btn.addEventListener("click",()=>{
        window.scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"});
      });
      onScroll();
    })();

    function ensureBookingDraft(){if(!state.bookingDraft)state.bookingDraft={day:null,time:null,specialist:(state.staff[0]||{}).name||"",offer:"",payment:"Apple Pay",genderPref:""};if(state.bookingDraft.genderPref===undefined)state.bookingDraft.genderPref="";return state.bookingDraft}
    function upcomingDays(){const names=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];const out=[];const base=new Date();for(let i=1;i<=7;i++){const d=new Date(base);d.setDate(base.getDate()+i);out.push({iso:d.toISOString().slice(0,10),label:names[d.getDay()],sub:new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short"}).format(d)})}return out}
    function pickBookingGenderPref(g){const d=ensureBookingDraft();d.genderPref=(d.genderPref===g)?"":g;const sp=state.staff.find(s=>s.name===d.specialist);if(d.genderPref&&(!sp||sp.gender!==d.genderPref)){const first=state.staff.find(s=>s.gender===d.genderPref);d.specialist=first?first.name:""}persist();render()}
    function pickBookingSpecialist(name){ensureBookingDraft().specialist=name;persist();render()}
    function pickBookingDay(iso){const d=ensureBookingDraft();d.day=iso;d.time=null;persist();render()}
    function pickBookingTime(tm){ensureBookingDraft().time=tm;persist();render()}
    function sessionBookingView(){
      if(!state.familySession) return `<div class="notice-blue">سجّلي دخول من بطاقة «متابعة طفلي وحجوزاتي» أولًا لإتمام حجز الجلسة.</div><button class="btn btn-outline" style="margin-top:12px" onclick="setParentTab('follow')">الذهاب لتسجيل الدخول</button>`;
      const d=ensureBookingDraft();const days=upcomingDays();const times=["09:00","11:00","13:00","15:00","17:00"];
      const genderFiltered=state.staff.filter(s=>!d.genderPref||s.gender===d.genderPref);
      return `
        <h3 style="font-size:14px;margin-bottom:10px">تفضيل جنس الأخصائي <small class="muted" style="font-weight:400">(اختياري)</small></h3>
        <div class="chips"><label class="chip ${!d.genderPref?"checked":""}" onclick="pickBookingGenderPref('')">بدون تفضيل</label><label class="chip ${d.genderPref==="أنثى"?"checked":""}" onclick="pickBookingGenderPref('أنثى')">أخصائية (سيدة)</label><label class="chip ${d.genderPref==="ذكر"?"checked":""}" onclick="pickBookingGenderPref('ذكر')">أخصائي (رجل)</label></div>
        <h3 style="font-size:14px;margin:18px 0 10px">١) اختاري الأخصائي</h3>
        ${genderFiltered.length?`<div class="chips">${genderFiltered.map(s=>`<label class="chip ${d.specialist===s.name?"checked":""}" onclick="pickBookingSpecialist('${s.name.replace(/'/g,"\\'")}')">${esc(s.name)}${s.premium?" ⭐ مميز":""}</label>`).join("")}</div>`:`<div class="notice">لا يوجد حاليًا أخصائي متاح بهذا التفضيل — جرّبي بدون تفضيل.</div>`}
        <h3 style="font-size:14px;margin:18px 0 10px">٢) اختاري يوم الأسبوع المناسب</h3>
        <div class="chips">${days.map(dd=>`<label class="chip ${d.day===dd.iso?"checked":""}" onclick="pickBookingDay('${dd.iso}')">${dd.label} <small style="opacity:.65">${dd.sub}</small></label>`).join("")}</div>
        ${d.day?`<h3 style="font-size:14px;margin:18px 0 10px">٣) اختاري الوقت</h3><div class="chips">${times.map(tm=>`<label class="chip ${d.time===tm?"checked":""}" onclick="pickBookingTime('${tm}')">${tm}</label>`).join("")}</div>`:""}
        <div class="actions"><button class="btn btn-primary" style="width:100%" ${(!d.day||!d.time||!d.specialist)?"disabled":""} onclick="submitSessionBooking()">تأكيد الحجز</button></div>
      `;
    }
    function submitSessionBooking(){
      const d=ensureBookingDraft();if(!d.day||!d.time){notify("اختاري اليوم والوقت أولًا");return}
      const p=state.patients.find(x=>x.code===state.familySession.code);
      state.sessionBookings.unshift({id:"BK-"+Date.now().toString().slice(-6),patientId:p?p.id:null,patientName:p?p.name:state.familySession.name,day:d.day,time:d.time,specialist:d.specialist,status:"مؤكد",seen:false});
      state.bookingDraft=null;state.parentTab="myBookings";persist();notify("تم تأكيد الحجز ✓");render();
    }
    function pillFor(s){const c=s==="ملغي"?"pill-red":(s==="مؤجّلة"?"pill-gold":"pill-good");return `<span class="pill ${c}">${esc(s)}</span>`}
    function newBookingsCount(){return state.sessionBookings.filter(b=>!b.seen&&b.status!=="ملغي").length}
    function markBookingSeen(id){const b=state.sessionBookings.find(x=>x.id===id);if(b){b.seen=true;persist();render()}}
    function markAllBookingsSeen(){state.sessionBookings.forEach(b=>b.seen=true);persist();notify("تم الاطلاع على كل الحجوزات الجديدة");render()}
    function myBookingsView(){
      if(!state.familySession) return `<div class="notice-blue">سجّلي دخول من «متابعة طفلي وحجوزاتي» أولًا لعرض حجوزاتك.</div>`;
      const rows=state.sessionBookings.filter(b=>b.patientName===state.familySession.name);
      if(!rows.length) return `<div class="empty">لا يوجد حجوزات بعد. <a class="back-link" onclick="setParentTab('sessionBooking')">احجزي جلسة الآن</a></div>`;
      return `<div class="list">${rows.map(b=>{const waMsg=`تذكير: حجز جلسة يوم ${date(b.day)} الساعة ${time(b.time)} مع ${b.specialist} في ${esc(state.center.name)}.`;return `<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>${date(b.day)} · ${time(b.time)} — ${esc(b.specialist)}</strong><small>${esc(b.status||"")}</small></div><div class="list-end">${pillFor(b.status)}${b.status!=="ملغي"?`<div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap"><a class="btn btn-outline" style="padding:6px 10px;font-size:11px" target="_blank" rel="noopener" href="${waLink(waMsg)}">${ic("chat",12)} تذكير واتساب</a><button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="openModal('reschedule','${b.id}')">تأجيل</button><button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="cancelBooking('${b.id}')">اعتذار / إلغاء</button></div>`:""}</div></div>`}).join("")}</div>`;
    }
    // ↪ الدالة cancelBooking انتقلت لملف js/06-assess-programs-consents-intake.js عشان تكون جاهزة وقت التحميل
    // ↪ الدالة confirmReschedule انتقلت لملف js/06-assess-programs-consents-intake.js عشان تكون جاهزة وقت التحميل
    function addonsView(){return `<div class="section-grid-2">${state.addonServices.map(a=>`<div class="section-card"><span class="section-icon">${ic("heart",22)}</span><h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p><button class="btn btn-primary" style="width:100%" onclick="requestAddon('${a.id}')">اطلبي الخدمة</button></div>`).join("")}</div>`}
    function requestAddon(id){if(!state.familySession){notify("سجّلي دخول من «متابعة طفلي وحجوزاتي» أولًا");return}const a=state.addonServices.find(x=>x.id===id);state.referrals.unshift({name:`طلب خدمة مكمّلة — ${a.name} لـ ${state.familySession.name}`,person:state.familySession.name,type:"عام",priority:"متوسطة",status:"جديدة",date:new Date().toISOString().slice(0,10)});persist();notify(`تم إرسال طلب ${a.name} — سيتواصل الفريق لتأكيد الموعد`);render()}
    function setFacilityTab(tab){state.facilityTab=tab;persist();render()}
    function facilityHub(back){
      const head=`<div class="public-head" style="margin:0 0 20px"><div class="brand"><span class="brand-mark">${mark(22,"#a7c2b3","#e4aa54")}</span><span><strong>ابدأ يومك في أوان</strong><small>اختر نوع المؤسسة</small></span></div></div>`;
      const tab=state.facilityTab;
      if(tab==="admin") return adminHub(back);
      if(!tab||tab==="select"){
        return `<div class="public-shell"><div class="gate card" style="max-width:1040px">${head}${back}<h2 style="margin-top:18px">أي نوع مؤسسة تمثّلين؟</h2><p class="muted">لكل مؤسسة خدماتها وبيانات دخول فريقها الخاصة.</p><div class="public-grid" style="margin-top:20px"><div class="portal-card" style="border-color:var(--gold)"><span class="portal-icon" style="background:var(--gold-2);color:#8f6a1f">${ic("settings",24)}</span><h3>الإدارة</h3><p>لصاحب المركز أو المستشفى أو أي مؤسسة جديدة — سجّلي مؤسستك وابرزيها في الصفحة الرئيسية.</p><button class="btn btn-primary" style="background:linear-gradient(135deg,var(--gold),#c98f3a)" onclick="setFacilityTab('admin')">تسجيل مؤسسة جديدة</button></div>${state.facilities.map(f=>`<div class="portal-card"><span class="portal-icon">${ic(f.icon,24)}</span><h3>${esc(f.label)}</h3><p><span class="pill pill-grey" style="margin-left:0;margin-bottom:6px">${esc(f.type)}</span><br>${esc(f.tagline)}</p><button class="btn btn-primary" onclick="enterFacility('${f.id}')">دخول</button></div>`).join("")}</div></div></div>`;
      }
      const fac=state.facilities.find(f=>f.id===tab);
      if(!fac){state.facilityTab="select";return facilityHub(back)}
      if(!state.facilitySession||state.facilitySession.id!==tab){
        // دخول مباشر بدون شاشة تسجيل دخول منفصلة — اختيار المؤسسة يكفي
        state.facilitySession={id:tab,remember:true};
        persist();
      }
      const showDepts=fac.type==="مركز"||fac.type==="مستشفى";
      const cards=showDepts
        ? state.departments.map(d=>`<div class="portal-card" style="min-height:175px"><span class="portal-icon">${ic(d.icon,22)}</span><h3 style="font-size:15px">${esc(d.name)}</h3><p>${esc(d.desc)}</p><div>${pill(d.state)}</div></div>`).join("")
        : fac.services.map(s=>`<div class="portal-card" style="min-height:110px;justify-content:center;text-align:center;align-items:center"><span class="portal-icon">${ic("check",20)}</span><h3 style="font-size:13.5px;margin:12px 0 0">${esc(s)}</h3></div>`).join("");
      return `<div class="public-shell"><div class="gate card" style="max-width:1040px">${head}<button class="back-link back-link-top" onclick="setFacilityTab('select')"><span class="back-link-arrow">${ic("chevronLeft",14,2.4)}</span>اختيار مؤسسة أخرى</button><h2 style="margin-top:18px">أهلاً ${esc(fac.label)}</h2><p class="muted">${showDepts?"الأقسام والخدمات المتاحة داخل المؤسسة:":"الخدمات المتاحة لكم عبر أوان:"}</p><div class="public-grid" style="margin-top:16px">${cards}</div><div class="actions" style="margin-top:22px"><button class="btn btn-primary" onclick="goApp()">الدخول الكامل لنظام أوان</button>${fac.type==="مركز"?`<button class="btn btn-outline" onclick="goPublic('kiosk')">تسجيل حضور الفريق</button>`:""}${fac.type==="مدرسة"?`<button class="btn btn-outline" onclick="goPublic('school')">فتح بوابة أهداف الطلاب</button>`:""}<button class="btn btn-outline" onclick="logoutFacility()">تسجيل الخروج</button></div></div></div>`;
    }
    function enterFacility(id){state.facilityTab=id;state.facilitySession={id,remember:true};state.view="dashboard";delete state.portal;persist();render()}
    function switchBizTab(tab){
      const reg=document.getElementById("bizTabRegister"),log=document.getElementById("bizTabLogin");
      const rb=document.getElementById("bizTabRegisterBtn"),lb=document.getElementById("bizTabLoginBtn");
      if(reg) reg.hidden=tab!=="register";
      if(log) log.hidden=tab!=="login";
      if(rb) rb.className=tab==="register"?"btn btn-primary":"btn btn-outline";
      if(lb) lb.className=tab==="login"?"btn btn-primary":"btn btn-outline";
    }
    function bizAuthSubmit(event,mode){
      const ok=mode==="register"?registerAdmin(event):loginAdmin(event);
      if(ok) openModal("entryGateOrg");
    }
    function bizOrgSubmit(event){
      saveOrgProfile(event);
      const acc=state.adminSession&&state.adminAccounts.find(a=>a.username===state.adminSession.username);
      if(acc&&acc.org){
        state.center.name=acc.org.orgName;
        if(acc.org.location) state.center.city=acc.org.location;
        persist();
        closeModal();
        enterFacility(acc.org.id);
      }
    }
    // دخول أعمال بدون حساب — اسم المؤسسة بس (بلا إيميل/باسورد)، يدخل على طول للوحة القيادة
    function bizEnterOrg(e){
      e.preventDefault();
      try{
        const f=formData(e);
        if(!f.orgName||!f.orgName.trim()){notify("من فضلك اكتبي اسم المؤسسة");return}
        const logo=(state.orgProfileDraft&&state.orgProfileDraft.logo!==undefined)?state.orgProfileDraft.logo:null;
        state.center.name=f.orgName;
        if(f.location) state.center.city=f.location;
        state.featuredPartner={orgName:f.orgName,orgType:f.orgType,location:f.location,logo};
        state.orgProfileDraft=null;
        persist();
        closeModal();
        enterFacility("center-demo");
      }catch(err){
        reportUnexpectedError(err);
      }
    }
    function logoutFacility(){state.facilitySession=null;state.facilityTab="select";persist();render()}
    function defaultServicesForType(type){
      const found=state.facilities.find(f=>f.type===type && typeof f.id==="string" && f.id.endsWith("-demo"));
      if(found) return found.services;
      return ["خدمات علاجية وتأهيلية","إدارة مواعيد ومتابعة"];
    }
    function slug(s){return s.replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24)||"org"}
    function genOrgCode(orgName){return (slug(orgName).toUpperCase().replace(/[\u0600-\u06FF]/g,"")||"ORG")+"-"+Math.floor(1000+Math.random()*9000)}
    function adminHub(back){
      const headAdmin=`<div class="public-head" style="margin:0 0 20px"><div class="brand"><span class="brand-mark" style="background:var(--gold-2);color:#8f6a1f">${ic("settings",20)}</span><span><strong>إدارة مؤسستك في أوان</strong><small>سجّلي بياناتك وأبرزي مؤسستك في الصفحة الرئيسية</small></span></div></div>`;
      const topBack=`<button class="back-link back-link-top" onclick="setFacilityTab('select')"><span class="back-link-arrow">${ic("chevronLeft",14,2.4)}</span>رجوع لأنواع المؤسسات</button>`;
      if(!state.adminSession){
        return `<div class="public-shell"><div class="gate card" style="max-width:720px">${headAdmin}${topBack}
          <div class="grid2" style="margin-top:18px;gap:18px">
            <div>
              <h3 style="font-size:14px;margin-bottom:10px">مؤسسة جديدة؟ سجّلي حساب</h3>
              <form onsubmit="registerAdmin(event)">
                <div class="field"><label>اسمك</label><input class="input" name="ownerName" required></div>
                <div class="field" style="margin-top:10px"><label>اسم المستخدم</label><input class="input" name="username" required placeholder="مثال: faisal-center"></div>
                <div class="field" style="margin-top:10px"><label>كلمة المرور</label><input class="input" type="password" name="password" required></div>
                <button class="btn btn-primary" style="width:100%;margin-top:16px">إنشاء الحساب</button>
              </form>
            </div>
            <div>
              <h3 style="font-size:14px;margin-bottom:10px">عندك حساب بالفعل؟</h3>
              <form onsubmit="loginAdmin(event)">
                <div class="field"><label>اسم المستخدم</label><input class="input" name="username" required></div>
                <div class="field" style="margin-top:10px"><label>كلمة المرور</label><input class="input" type="password" name="password" required></div>
                <button class="btn btn-outline" style="width:100%;margin-top:16px">دخول</button>
              </form>
            </div>
          </div>
          <div id="admin-result" style="margin-top:16px"></div>
        </div></div>`;
      }
      const acc=state.adminAccounts.find(a=>a.username===state.adminSession.username);
      const org=acc&&acc.org;
      const draft=state.orgProfileDraft||{};
      const fval=(k,fallback)=>draft[k]!==undefined?draft[k]:(org?org[k]:fallback);
      const logo=fval("logo",null);
      return `<div class="public-shell"><div class="gate card" style="max-width:760px">${headAdmin}${topBack}
        <h2 style="margin-top:18px">أهلًا ${esc(state.adminSession.ownerName)}</h2>
        <p class="muted">${org?"بيانات مؤسستك — أي تعديل بيتحدث فورًا في الصفحة الرئيسية.":"سجّلي بيانات مؤسستك عشان تظهر جنب شعار أوان في الصفحة الرئيسية."}</p>
        <form onsubmit="saveOrgProfile(event)" style="margin-top:14px">
          <div class="form-grid">
            <div class="field"><label>اسم المركز / المستشفى</label><input class="input" name="orgName" required value="${esc(fval("orgName",""))}"></div>
            <div class="field"><label>نوع المؤسسة</label><select class="select" name="orgType">${["مركز","عيادة","مستشفى","مدرسة"].map(t=>`<option ${fval("orgType","مركز")===t?"selected":""}>${t}</option>`).join("")}</select></div>
            <div class="field full"><label>الموقع / المدينة</label><input class="input" name="location" value="${esc(fval("location",""))}" placeholder="مثال: جدة"></div>
          </div>
          <div class="field" style="margin-top:12px">
            <label>شعار المؤسسة <small class="hint">(اختياري)</small></label>
            <input class="input" type="file" accept="image/*" onchange="previewOrgLogo(this)">
            ${logo?`<div style="margin-top:10px;display:flex;align-items:center;gap:10px"><img src="${logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;border:1px solid var(--line)"><button type="button" class="btn btn-outline" style="width:auto;padding:6px 12px;font-size:11px" onclick="clearOrgLogo(this)">إزالة الشعار</button></div>`:""}
          </div>
          <div class="actions"><button class="btn btn-primary">حفظ ونشر في الصفحة الرئيسية</button><button type="button" class="btn btn-outline" onclick="logoutAdmin()">تسجيل الخروج</button></div>
        </form>
        ${org?`<div class="notice-blue" style="margin-top:16px">فريقك يقدر يدخل عبر «ابدأ يومك في أوان» بنفس بيانات حسابك: اسم المستخدم <b>${esc(state.adminSession.username)}</b> وكلمة المرور اللي سجّلتِ بيها.</div>`:""}
        <div id="admin-result" style="margin-top:14px"></div>
      </div></div>`;
    }
    function registerAdmin(e){
      e.preventDefault();const f=formData(e);
      if(state.adminAccounts.find(a=>a.username===f.username)){document.getElementById("admin-result").innerHTML=`<div class="notice" style="background:var(--danger-2);border-color:#fecaca;color:var(--danger)">البريد الإلكتروني هذا مسجّل بالفعل، جرّبي بريد ثاني أو سجّلي الدخول.</div>`;return false}
      state.adminAccounts.push({username:f.username,password:f.password,ownerName:f.ownerName,org:null});
      state.adminSession={username:f.username,ownerName:f.ownerName};
      persist();render();
      return true;
    }
    function loginAdmin(e){
      e.preventDefault();const f=formData(e);
      const acc=state.adminAccounts.find(a=>a.username===f.username&&a.password===f.password);
      if(acc){state.adminSession={username:acc.username,ownerName:acc.ownerName};persist();render();return true}
      document.getElementById("admin-result").innerHTML=`<div class="notice" style="background:var(--danger-2);border-color:#fecaca;color:var(--danger)">البريد الإلكتروني أو كلمة المرور غير صحيحة.</div>`;
      return false;
    }
    function logoutAdmin(){state.adminSession=null;state.orgProfileDraft=null;persist();render()}
    function snapshotOrgForm(el){
      const form=el&&el.closest?el.closest("form"):null;
      if(!form) return {};
      return {orgName:form.orgName?form.orgName.value:undefined,orgType:form.orgType?form.orgType.value:undefined,location:form.location?form.location.value:undefined};
    }
    function previewOrgLogo(input){
      const file=input.files&&input.files[0];if(!file)return;
      if(!file.type||file.type.indexOf("image/")!==0){notify("الرجاء اختيار ملف صورة");return}
      const snap=snapshotOrgForm(input);
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const size=160;
          const canvas=document.createElement("canvas");
          canvas.width=size;canvas.height=size;
          const ctx=canvas.getContext("2d");
          const scale=Math.max(size/img.width,size/img.height);
          const w=img.width*scale,h=img.height*scale;
          ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
          let dataUrl;
          try{dataUrl=canvas.toDataURL("image/jpeg",0.85)}catch(err){notify("تعذّر معالجة الصورة، جرّبي صورة ثانية");return}
          state.orgProfileDraft=Object.assign({},state.orgProfileDraft,snap,{logo:dataUrl});
          persist();render();
        };
        img.onerror=()=>{notify("تعذّر تحميل الصورة، جرّبي صورة ثانية")};
        img.src=reader.result;
      };
      reader.onerror=()=>{notify("تعذّر قراءة الملف")};
      reader.readAsDataURL(file);
    }
    function clearOrgLogo(btn){const snap=snapshotOrgForm(btn);state.orgProfileDraft=Object.assign({},state.orgProfileDraft,snap,{logo:null});persist();render()}
    function bizPreviewLogo(input){
      const file=input.files&&input.files[0];if(!file)return;
      if(!file.type||file.type.indexOf("image/")!==0){notify("الرجاء اختيار ملف صورة");return}
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const size=160;
          const canvas=document.createElement("canvas");
          canvas.width=size;canvas.height=size;
          const ctx=canvas.getContext("2d");
          const scale=Math.max(size/img.width,size/img.height);
          const w=img.width*scale,h=img.height*scale;
          ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
          let dataUrl;
          try{dataUrl=canvas.toDataURL("image/jpeg",0.85)}catch(err){notify("تعذّر معالجة الصورة، جرّبي صورة ثانية");return}
          state.orgProfileDraft=Object.assign({},state.orgProfileDraft,{logo:dataUrl});
          persist();
          const holder=document.getElementById("bizLogoPreview");
          if(holder) holder.innerHTML=`<img src="${dataUrl}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;border:1px solid var(--line)"><button type="button" class="btn btn-outline" style="width:auto;padding:6px 12px;font-size:11px" onclick="bizClearLogo()">إزالة الشعار</button>`;
        };
        img.onerror=()=>{notify("تعذّر تحميل الصورة، جرّبي صورة ثانية")};
        img.src=reader.result;
      };
      reader.onerror=()=>{notify("تعذّر قراءة الملف")};
      reader.readAsDataURL(file);
    }
    function bizClearLogo(){
      state.orgProfileDraft=Object.assign({},state.orgProfileDraft,{logo:null});
      persist();
      const holder=document.getElementById("bizLogoPreview");
      if(holder) holder.innerHTML="";
    }
    function saveOrgProfile(e){
      e.preventDefault();
      try{
        if(!state.adminSession){notify("انتهت الجلسة، سجّلي الدخول ثاني من فضلك");render();return}
        const f=formData(e);
        if(!f.orgName||!f.orgName.trim()){notify("من فضلك اكتبي اسم المؤسسة");return}
        let acc=state.adminAccounts.find(a=>a.username===state.adminSession.username);
        if(!acc){
          // self-heal: the session pointed at an account record that no
          // longer exists (e.g. state was reloaded from another tab) —
          // recreate it instead of crashing, so the save still goes through.
          acc={username:state.adminSession.username,password:"",ownerName:state.adminSession.ownerName,org:null};
          state.adminAccounts.push(acc);
        }
        const logo=(state.orgProfileDraft&&state.orgProfileDraft.logo!==undefined)?state.orgProfileDraft.logo:(acc.org?acc.org.logo:null);
        const id=(acc.org&&acc.org.id)||("org-"+Date.now());
        const code=(acc.org&&acc.org.code)||genOrgCode(f.orgName);
        const org={id,orgName:f.orgName,orgType:f.orgType,location:f.location,logo,code};
        acc.org=org;
        const existingIdx=state.facilities.findIndex(x=>x.id===id);
        const facEntry={id,type:f.orgType,icon:{"مركز":"briefcase","عيادة":"medical","مستشفى":"pulse","مدرسة":"school"}[f.orgType]||"briefcase",label:f.orgName,code,username:acc.username,password:acc.password||"1234",tagline:f.location?("في "+f.location):"مؤسسة شريكة",services:defaultServicesForType(f.orgType)};
        if(existingIdx>=0) state.facilities[existingIdx]=facEntry; else state.facilities.push(facEntry);
        state.featuredPartner={orgName:f.orgName,orgType:f.orgType,location:f.location,logo};
        state.orgProfileDraft=null;
        persist();
        notify("تم الحفظ — مؤسستك ظاهرة الحين في الصفحة الرئيسية ✓");
        render();
      }catch(err){
        reportUnexpectedError(err);
      }
    }
  
    // =================== رحلة الطفل الموحّدة: من أول ما الطفل يدخل المركز لين تقرير ٣ شهور ===================
    // طبقة ربط واحدة تقرا من كل التابات (الإحالات، دراسة الحالة، الموافقات، التقييمات، الأهداف، المواعيد، الجلسات، التقارير)
    // بتطلع لكل طفل: هو وين في الرحلة، الخطوة الجاية وش، مين مسؤول، وزرار يوديك على المكان الصح في التاب الصح.
    const JR_STEPS=[
      {k:"intake",l:"الاستقبال",ic:"referrals"},
      {k:"case",l:"دراسة الحالة",ic:"book"},
      {k:"assess",l:"التقييم الأولي",ic:"target"},
      {k:"plan",l:"الخطة والاعتماد",ic:"check"},
      {k:"consent",l:"موافقة الأسرة",ic:"shield"},
      {k:"book",l:"جدولة الجلسات",ic:"schedule"},
      {k:"sessions",l:"الجلسات",ic:"pulse"},
      {k:"monthly",l:"المراجعة الشهرية",ic:"chart"},
      {k:"quarter",l:"تقرير ٣ شهور",ic:"star"}
    ];
    const JR_CYCLE=90,JR_QDUE=75;
    // نفس مراحل محرك «أوان يعرف وش التالي» صارت هي مراحل الرحلة — مصدر واحد لكل الشاشات (لوحة الملفات، التصدير، الوكلاء…)
    NX_STAGES.splice(0,NX_STAGES.length,...JR_STEPS.map(s=>s.l));
    function jrToday(){return localDateOf(new Date())}
    function jrAdd(d,n){const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return localDateOf(x)}
    function jrD(a,b){return Math.round((Date.parse(b+"T12:00:00")-Date.parse(a+"T12:00:00"))/864e5)}
    function jrDay(v){if(!v)return null;const s=String(v);return /^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):localDateOf(v)}
    function jrMin(arr){const L=arr.map(jrDay).filter(Boolean).sort();return L[0]||null}
    function jrIsAssess(a){return /تقييم/.test(a.service||"")}
    function jrQuarters(p){return (state.progressReports||[]).filter(r=>r.patientId===p.id&&r.reportType==="quarterly").sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
    function jrJourney(p){
      const today=jrToday(),id=p.id,open=`jrGo('${id}','file')`;
      const cs=typeof caseStudyOf==="function"?caseStudyOf(p):null;
      const ref=(state.referrals||[]).find(r=>r.patientId===id);
      const si=(state.smartIntakes||[]).find(r=>r.patientId===id);
      const apts=state.appointments.filter(a=>a.patient===p.name&&a.status!=="ملغي");
      const assessApts=apts.filter(jrIsAssess).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      const therapy=apts.filter(a=>!jrIsAssess(a));
      const upTherapy=therapy.filter(a=>a.status!=="مكتمل"&&a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      const doneTherapy=therapy.filter(a=>a.status==="مكتمل");
      const logs=(state.sessionLogs||[]).filter(l=>l.patientId===id);
      const goals=goalsOf(p);const appr=goals.filter(g=>g.status==="معتمد");const prop=goals.filter(g=>g.status==="مقترح");
      const plans=(state.plans||[]).filter(x=>x.patient===p.name).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      const planOk=plans.find(x=>x.status==="معتمدة");const planBack=plans[0]&&plans[0].status==="معادة للتعديل"?plans[0]:null;const planWait=plans.find(x=>x.status==="معلقة");
      const sa=(state.standardizedAssessments||[]).filter(r=>r.patientId===id).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      const ev=(typeof evEnsure==="function"?evEnsure():[]).filter(r=>r.patientId===id);
      const evWait=ev.find(r=>r.status==="بانتظار المشرف");const evBack=ev.find(r=>r.status==="معادة");const evOk=ev.filter(r=>r.status==="معتمدة");
      const legacy=!goals.length&&!!p.goal&&!/يُحدَّد|يحدد|سيتحدد/.test(p.goal)&&(logs.length>0||doneTherapy.length>0||p.status==="نشط"&&therapy.length>0);
      const consent=typeof consentStatus==="function"?consentStatus(p,"treatment"):{st:"active"};
      // تواريخ
      const pidTs=/^p(\d{12,})$/.test(id)?localDateOf(+id.slice(1)):null;
      const intakeDate=jrMin([ref&&(ref.date||ref.createdAt),si&&(si.submittedAt||si.createdAt),pidTs,p.createdAt,...apts.map(a=>a.date),...logs.map(l=>l.date)])||today;
      const assessDone=sa[0]||evOk[0]||evWait||assessApts.find(a=>a.status==="مكتمل");
      const assessDate=sa[0]?sa[0].date:evOk[0]?jrDay(evOk[0].submittedAt||evOk[0].reviewedAt):evWait?jrDay(evWait.submittedAt):(assessApts.find(a=>a.status==="مكتمل")||{}).date||null;
      const planDone=appr.length>0||!!planOk||legacy;
      const planDate=jrMin([...appr.map(g=>g.approvedAt),planOk&&planOk.date])||(legacy?jrMin([...doneTherapy.map(a=>a.date),...logs.map(l=>l.date)]):null);
      const bookDone=upTherapy.length>0||doneTherapy.length>0||logs.length>0;
      // الدورة العلاجية (٩٠ يوم): تبدأ من اعتماد الخطة، وكل تقرير ٣ شهور يفتح دورة جديدة
      const Q=jrQuarters(p);const lastQ=Q[Q.length-1];
      const cycleNo=Q.length+1;
      const cycleStart=planDone?(lastQ?lastQ.date:(jrMin([planDate,...doneTherapy.map(a=>a.date),...logs.map(l=>l.date)])||today)):null;
      const due=cycleStart?jrAdd(cycleStart,JR_CYCLE):null;
      const dayN=cycleStart?Math.max(0,jrD(cycleStart,today)):0;
      const inCyc=d=>cycleStart&&d&&d>=cycleStart&&d<=today;
      const cLogs=logs.filter(l=>inCyc(l.date));const cDone=doneTherapy.filter(a=>inCyc(a.date));
      const cPast=therapy.filter(a=>inCyc(a.date)&&a.date<today);
      const att=cPast.length?Math.round(cPast.filter(a=>a.status==="مكتمل").length/cPast.length*100):null;
      const monthly=(state.progressReports||[]).filter(r=>r.patientId===id&&r.reportType!=="quarterly"&&cycleStart&&r.date>=cycleStart);
      const needMonthly=Math.min(2,Math.floor(dayN/30));
      const S={};const st=(k,status,o)=>{S[k]=Object.assign({k,status},o||{})};
      st("intake","done",{date:intakeDate,info:ref?`إحالة: ${ref.name}`:si?"دراسة حالة إلكترونية / كشك الاستقبال":"تسجيل مباشر",owner:"الاستقبال"});
      if(cs)st("case","done",{date:jrDay(cs.at),info:cs.source||"دراسة الحالة",owner:"الاستقبال"});
      else st("case",planDone?"miss":"todo",{info:planDone?"ناقصة — الطفل شغال بخطة من غير دراسة حالة":"للحين ما انعبّت",owner:"الاستقبال",act:"أرسل رابط دراسة الحالة / املأها",go:`jrGo('${id}','case')`});
      if(assessDone)st("assess","done",{date:assessDate,info:sa[0]?`${sa[0].instrument} · ${assessPctOf(sa[0])}%`:evOk[0]||evWait?"تقييم من آيباد الأخصائي":"جلسة تقييم أولي",owner:"الأخصائي"});
      else if(legacy)st("assess","miss",{info:"ما فيه تقييم مسجّل على أوان — يُفضّل تقييم قياسي كخط أساس",owner:"الأخصائي",act:"سجّل تقييم قياسي",go:`jrGo('${id}','std')`});
      else{const up=assessApts.find(a=>a.status!=="مكتمل"&&a.date>=today);
        st("assess","todo",up?{info:`محجوز ${up.date===today?"اليوم":date(up.date)} ${time(up.time)} مع ${up.clinician}`,owner:"الأخصائي",act:"سجّل نتيجة التقييم",go:`jrGo('${id}','std')`,booked:true}:{info:"ما فيه موعد تقييم",owner:"الاستقبال",act:"احجز تقييم أولي",go:`jrGo('${id}','assessBook')`})}
      if(planDone)st("plan","done",{date:planDate,info:appr.length?`${appr.length} أهداف معتمدة`:planOk?planOk.title:"خطة قائمة",owner:"المشرف"});
      else if(evWait)st("plan","todo",{info:`تقييم ${evWait.staffName||"الأخصائي"} بانتظار اعتماد المشرف`,owner:"المشرف",sup:true,act:"راجع واعتمد",go:`jrGo('${id}','plan')`});
      else if(prop.length)st("plan","todo",{info:`${prop.length} أهداف مقترحة بانتظار توقيع المشرف`,owner:"المشرف",sup:true,act:"اعتمد الأهداف",go:`jrGo('${id}','plan')`});
      else if(planBack||evBack)st("plan","todo",{info:"الخطة رجعت للأخصائي بملاحظات المشرف",owner:"الأخصائي",act:"عدّل الخطة",go:`jrGo('${id}','plan')`});
      else if(planWait)st("plan","todo",{info:`«${planWait.title}» بانتظار الاعتماد`,owner:"المشرف",sup:true,act:"اعتمد الخطة",go:`jrGo('${id}','file')`,planId:planWait.id});
      else st("plan","todo",{info:assessDone?"التقييم خلص وما فيه أهداف للحين":"بعد التقييم",owner:"الأخصائي",act:"اكتب الأهداف",go:`jrGo('${id}','plan')`});
      if(consent.st==="active")st("consent","done",{date:jrDay(consent.c&&(consent.c.signedAt||consent.c.at||consent.c.date)),info:"موافقة العلاج سارية",owner:"الاستقبال"});
      else st("consent","todo",{info:consent.st==="expired"?"الموافقة انتهت":consent.st==="withdrawn"?"الأسرة سحبت الموافقة":"ما فيه موافقة علاج موقّعة",owner:"الاستقبال",act:"توقيع موافقة العلاج",go:`jrGo('${id}','consent')`});
      if(bookDone)st("book","done",{date:jrMin([...therapy.map(a=>a.date),...logs.map(l=>l.date)]),info:upTherapy[0]?`الجاية ${upTherapy[0].date===today?"اليوم":date(upTherapy[0].date)} ${time(upTherapy[0].time)} مع ${upTherapy[0].clinician}`:"ما فيه موعد جاي محجوز",owner:"الاستقبال",warn:!upTherapy.length});
      else st("book","todo",{info:"الخطة جاهزة وما فيه جلسات محجوزة",owner:"الاستقبال",act:"احجز الجلسات",go:`jrGo('${id}','book')`});
      const sessInfo=`${cDone.length||cLogs.length} جلسة في الدورة${att!=null?" · حضور "+att+"%":""}`;
      if(cycleStart)st("sessions",dayN>=JR_CYCLE?"done":"todo",{date:cycleStart,info:sessInfo,owner:"الأخصائي",act:"سجّل أداء جلسة",go:`jrGo('${id}','log')`});
      else st("sessions","todo",{info:"تبدأ بعد اعتماد الخطة",owner:"الأخصائي"});
      if(cycleStart&&needMonthly>0&&monthly.length>=needMonthly)st("monthly","done",{date:monthly[0].date,info:`${monthly.length} مراجعة في الدورة`,owner:"الأخصائي"});
      else st("monthly","todo",{info:cycleStart?(needMonthly>monthly.length?`مستحقة: مراجعة الشهر ${monthly.length+1}`:`أول مراجعة ${date(jrAdd(cycleStart,30))}`):"كل ٣٠ يوم من بداية الخطة",owner:"الأخصائي",act:"اكتب المراجعة",go:`jrGo('${id}','monthly')`,due:cycleStart&&needMonthly>monthly.length});
      st("quarter","todo",{info:due?(dayN>=JR_CYCLE?`متأخر ${dayN-JR_CYCLE} يوم — كان مستحق ${date(due)}`:`مستحق ${date(due)} · فاضل ${JR_CYCLE-dayN} يوم`):"بعد ٩٠ يوم من اعتماد الخطة",owner:"الأخصائي ← المشرف",act:"جهّز تقرير ٣ شهور",go:`jrGo('${id}','quarter')`,due:cycleStart&&dayN>=JR_QDUE,late:cycleStart&&dayN>JR_CYCLE});
      if(lastQ)S.quarter.last=lastQ;
      // الخطوة الحالية
      let cur;
      if(!planDone){cur=!cs&&!assessDone&&!evWait&&!prop.length?"case":!assessDone&&!evWait&&!prop.length?"assess":"plan"}
      else if(S.consent.status!=="done")cur="consent";
      else if(!bookDone)cur="book";
      else if(S.quarter.due)cur="quarter";
      else if(S.monthly.due)cur="monthly";
      else cur="sessions";
      const idx=JR_STEPS.findIndex(s=>s.k===cur);
      return {p,S,cur,idx,step:S[cur],cycleNo,cycleStart,due,dayN,att,cDone:cDone.length,cLogs:cLogs.length,upTherapy,lastQ,Q};
    }
    // دمج المحرك القديم: تنبيهاته (انقطاع، هدف واقف، نقل…) زي ما هي، والمرحلة والخطوة الطبيعية من الرحلة الموحّدة
    const _jrNext=awanNext;
    awanNext=function(p){
      const n=_jrNext(p);let J;try{J=jrJourney(p)}catch(e){return n}
      n.stage=J.idx;n.jr=J.cur;
      const exc=/في جلسة|حزمة النقل|انقطاع|راجع الهدف|اتحقق|تحقق/.test(n.text);
      if(!exc){const s=J.step;n.text=s.act||JR_STEPS[J.idx].l;n.why=s.info||"";n.owner=s.owner||"—";n.sup=!!s.sup;
        n.urg=J.cur==="sessions"?0:s.late?3:s.sup?2:1;if(J.cur==="sessions"){n.text="ماشي حسب الخطة";n.why=s.info}
        n.go=s.go||n.go}
      return n;
    };
    // ---- التنقّل: كل زرار في الرحلة يوديك للتاب الصح والطفل متحدد، وشريط فوق يفكّرك أنت شغال على مين ----
    function jrGo(pid,k){
      const p=state.patients.find(x=>x.id===pid);if(!p)return;
      const J=jrJourney(p);const from=J.cur;
      const ctx=lbl=>{state.jrCtx={pid,step:from,label:lbl,name:p.name}};
      const toFile=(sel,after)=>{state.patientId=pid;state.view="patient-detail";if(after)after();persist();render();if(sel)setTimeout(()=>{const el=document.querySelector(sel);if(el){el.scrollIntoView({behavior:"smooth",block:"start"});el.classList.add("jr-flash");setTimeout(()=>el.classList.remove("jr-flash"),1800)}},60)};
      if(k==="file")return toFile(".jr-card");
      if(k==="case")return toFile(".cs-card",()=>{if(typeof csCaseEdit==="function"&&caseStudyOf(p))state.csEditFor=pid});
      if(k==="plan")return toFile(state.role==="management"||state.role==="supervisor"?(evEnsure().some(r=>r.patientId===pid&&r.status==="بانتظار المشرف")?".jr-evsup":".cs-card"):".cs-card");
      if(k==="consent")return toFile(".jr-consents",()=>{if(typeof canManageConsents!=="function"||canManageConsents()){state.consentSignFor=pid;state.csSigView=null}});
      if(k==="std"){toFile(".jr-std");setTimeout(()=>openModal("newStdAssessment",pid),80);return}
      if(k==="log"){toFile(".jr-card");setTimeout(()=>openModal("sessionLog",pid),80);return}
      if(k==="monthly"){toFile(".jr-reports");setTimeout(()=>openModal("generateReport",pid),80);return}
      if(k==="quarter"){toFile(".jr-card");setTimeout(()=>jrQuarterOpen(pid),80);return}
      if(k==="assessBook"||k==="book"){ctx(k==="book"?"حجز الجلسات":"حجز التقييم الأولي");state.view="schedule";persist();render();
        setTimeout(()=>{ptBook(pid);setTimeout(()=>{const sv=document.querySelector('#modal [name="service"]');if(sv){const want=k==="book"?"":"تقييم أولي";if(want){if(sv.tagName==="SELECT"){const o=[...sv.options].find(o=>/تقييم/.test(o.value||o.textContent));if(o)sv.value=o.value}else sv.value=want;sv.dispatchEvent(new Event("change",{bubbles:true}))}}},90)},60);return}
    }
    function jrCtxClose(){state.jrCtx=null;render()}
    function jrBanner(){
      const c=state.jrCtx;if(!c)return "";
      if(state.view==="patient-detail"&&state.patientId===c.pid){state.jrCtx=null;return ""}
      if(state.view==="public")return "";
      const p=state.patients.find(x=>x.id===c.pid);if(!p){state.jrCtx=null;return ""}
      const J=jrJourney(p);const moved=J.cur!==c.step;const nx=J.step;
      return `<div class="jr-ctx ${moved?"ok":""}"><span class="jr-ctx-ic">${ic(moved?"check":"target",16)}</span><div><small>${moved?"تمت الخطوة ✓":"أنت شغال على رحلة"} · ${esc(p.name)}</small><b>${moved?`الخطوة الجاية: ${esc(JR_STEPS[J.idx].l)} — ${esc(nx.info||"")}`:`الخطوة: ${esc(c.label||JR_STEPS[J.idx].l)}`}</b></div>
        <div class="jr-ctx-a">${moved&&nx.go?`<button class="btn btn-primary" onclick="state_jrNoop();${nx.go}">${esc(nx.act||"كمّل")}</button>`:""}<button class="btn btn-outline" onclick="jrGo('${p.id}','file')">ارجع لملف الطفل</button><button class="jr-x" onclick="jrCtxClose()" aria-label="إغلاق">×</button></div></div>`;
    }
    function state_jrNoop(){}
    const _jrShell=shell;shell=function(body){return _jrShell(jrBanner()+body)};
    // ---- كارت الرحلة في ملف الطفل (بدل كارت «أوان يعرف وش التالي» — نفس الفكرة بس متوصلة بكل التابات) ----
    function jrStepper(J,small){
      return `<ol class="jr-steps ${small?"sm":""}">${JR_STEPS.map((s,i)=>{const x=J.S[s.k];const cls=i===J.idx?"on":x.status==="done"?"done":x.status==="miss"?"miss":"";
        return `<li class="${cls}" title="${esc(s.l+(x.info?" — "+x.info:""))}">${small?"":`<button type="button" onclick="${x.go&&x.status!=="done"?x.go:`jrGo('${J.p.id}','file')`}">`}<i>${x.status==="done"?"✓":i+1}</i>${small?"":`<span>${esc(s.l)}</span><em>${x.status==="done"&&x.date?date(x.date):x.status==="miss"?"ناقص":i===J.idx?"الحين":""}</em></button>`}</li>`}).join("")}</ol>`;
    }
    function jrCycleBar(J){
      if(!J.cycleStart)return `<div class="jr-cyc muted">الدورة العلاجية (٩٠ يوم) تبدأ أول ما الخطة تتعتمد.</div>`;
      const pct=Math.min(100,Math.round(J.dayN/JR_CYCLE*100));
      return `<div class="jr-cyc"><div class="jr-cyc-h"><b>الدورة ${J.cycleNo} · اليوم ${Math.min(J.dayN,999)} من ${JR_CYCLE}</b><span>${date(J.cycleStart)} ← ${date(J.due)}</span></div><div class="jr-bar"><i style="width:${pct}%"></i><s style="right:${30/JR_CYCLE*100}%"></s><s style="right:${60/JR_CYCLE*100}%"></s><s class="q" style="right:${JR_QDUE/JR_CYCLE*100}%"></s></div><div class="jr-cyc-l"><span>بداية الخطة</span><span>مراجعة ١</span><span>مراجعة ٢</span><span>تقرير ٣ شهور</span></div></div>`;
    }
    function jrCard(p){
      const J=jrJourney(p);const n=_jrNext(p);const s=J.step;
      const alert=/انقطاع|راجع الهدف|حزمة النقل|اتحقق|تحقق/.test(n.text)?`<div class="jr-alert u${n.urg}"><b>${esc(n.text)}</b><span>${esc(n.why)}</span>${n.sup?`<em>يحتاج تدخل مشرف</em>`:""}</div>`:"";
      const misses=JR_STEPS.filter(x=>J.S[x.k].status==="miss").map(x=>`<button class="jr-miss" onclick="${J.S[x.k].go}">${ic("bell",12)} ${esc(x.l)}: ${esc(J.S[x.k].info)}</button>`).join("");
      return `<section class="card jr-card"><div class="card-head"><h2>${ic("target",18)} رحلة الطفل</h2><div style="display:flex;gap:6px;flex-wrap:wrap">${J.Q.length?`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="jrQuarterView('${J.Q[J.Q.length-1].id}')">آخر تقرير ٣ شهور</button>`:""}<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="setView('journey')">كل الأطفال</button></div></div>
        ${jrStepper(J)}
        <div class="jr-now"><div><small>الخطوة الحالية · ${esc(JR_STEPS[J.idx].l)} · المسؤول: ${esc(s.owner||"—")}</small><b>${esc(J.cur==="sessions"?"ماشي حسب الخطة":s.act||JR_STEPS[J.idx].l)}</b><span>${esc(s.info||"")}</span></div>${s.go?`<button class="btn btn-primary" onclick="${s.go}">${esc(s.act||"نفّذ")}</button>`:""}</div>
        ${s.planId&&(state.role==="management"||state.role==="supervisor")?`<div class="jr-quick"><button class="btn btn-primary" onclick="reviewPlan('${s.planId}','approve')">اعتماد الخطة</button><button class="btn btn-outline" onclick="reviewPlan('${s.planId}','return')">إرجاع بملاحظات</button></div>`:""}${alert}${misses?`<div class="jr-misses">${misses}</div>`:""}${jrCycleBar(J)}
        ${J.cycleStart?`<div class="jr-quick"><button class="btn btn-outline" onclick="jrGo('${p.id}','log')">${ic("pulse",13)} سجّل جلسة</button><button class="btn btn-outline" onclick="jrGo('${p.id}','monthly')">${ic("chart",13)} مراجعة شهرية</button><button class="btn btn-outline" onclick="jrGo('${p.id}','book')">${ic("schedule",13)} احجز</button><button class="btn ${J.S.quarter.due?"btn-primary":"btn-outline"}" onclick="jrQuarterOpen('${p.id}')">${ic("star",13)} تقرير ٣ شهور${J.S.quarter.due?" (مستحق)":""}</button></div>`:""}
      </section>`;
    }
    awanNextCard=jrCard;
    // كروت ملف الطفل نعلّم عليها عشان أزرار الرحلة تنزل عليها مباشرة
    const _jrPD=patientDetail;patientDetail=function(id){let h=_jrPD(id);if(!h)return h;
      return h.replace('<section class="card" style="margin-bottom:18px;border:2px solid var(--gold)">','<section class="card jr-evsup" style="margin-bottom:18px;border:2px solid var(--gold)">')};
    // ---- كارت «الخطة العلاجية» في الملف: أرقام حقيقية بدل القيم الثابتة ----
    function jrProgress(p){
      const goals=goalsOf(p).filter(g=>g.status==="معتمد");const logs=(state.sessionLogs||[]).filter(l=>l.patientId===p.id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      const sc={"نجاح كامل":2,"نجاح جزئي":1,"لم ينجح بعد":0};const recent=logs.slice(0,8);
      if(!recent.length)return {pct:null,label:"للحين ما فيه جلسات مسجلة"};
      const pct=Math.round(recent.reduce((s,l)=>s+(sc[l.result]??1),0)/(recent.length*2)*100);
      return {pct,label:`من آخر ${recent.length} نتيجة جلسة${goals.length?" · "+goals.length+" أهداف معتمدة":""}`};
    }
    function jrPlanPill(p){const J=jrJourney(p);return pill(J.cycleStart?`الدورة ${J.cycleNo} · يوم ${Math.min(J.dayN,999)}`:JR_STEPS[J.idx].l)}
    function jrNextHtml(p){const today=jrToday();const a=state.appointments.filter(x=>x.patient===p.name&&x.status!=="ملغي"&&x.status!=="مكتمل"&&x.date>=today).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time))[0];
      if(!a)return `<div style="font-size:16px;font-weight:800;color:var(--muted);margin-top:4px">ما فيه موعد محجوز</div><button class="btn btn-outline" style="margin-top:8px;padding:6px 10px;font-size:11px" onclick="jrGo('${p.id}','book')">احجز موعد</button>`;
      return `<div style="font-size:22px;font-weight:800;color:var(--navy);margin-top:4px">${date(a.date)}</div><div class="muted">${time(a.time)} · ${esc(a.service||"")} · ${esc(a.clinician||"")}</div>`}
    function jrProgHtml(p){const g=jrProgress(p);if(g.pct==null)return `<div class="muted" style="font-size:12px;margin-top:7px">${esc(g.label)}</div>`;
      return `<div style="height:9px;border-radius:99px;background:#ece4d8;margin-top:7px"><div style="height:100%;width:${g.pct}%;background:var(--navy);border-radius:99px"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:5px"><span>${esc(g.label)}</span><b>${g.pct}%</b></div>`}
    // ---- صفحة «رحلة الأطفال»: كل الأطفال على المسار، مين واقف وين، ووش المطلوب ----
    function jrList(){const vis=typeof ptVisible==="function"?ptVisible:()=>true;return state.patients.filter(p=>!p.archived&&vis(p)).map(p=>{try{return jrJourney(p)}catch(e){return null}}).filter(Boolean)}
    function jrSet(k,v){state[k]=v;render()}
    function journeyView(){
      const all=jrList();const f=state.jrFilter||"all";const q=(state.jrQ||"").trim();
      const counts=JR_STEPS.map(s=>all.filter(J=>J.cur===s.k).length);
      const dueQ=all.filter(J=>J.S.quarter.due).sort((a,b)=>b.dayN-a.dayN);
      const sup=all.filter(J=>J.step.sup).length;const late=all.filter(J=>J.S.quarter.late).length;const missing=all.filter(J=>JR_STEPS.some(s=>J.S[s.k].status==="miss")).length;
      let list=all.filter(J=>f==="all"||(f==="sup"?J.step.sup:f==="miss"?JR_STEPS.some(s=>J.S[s.k].status==="miss"):J.cur===f));
      if(q)list=list.filter(J=>(J.p.name+" "+(J.p.file||"")+" "+(J.p.guardian||"")).includes(q));
      list.sort((a,b)=>(b.S.quarter.late?1:0)-(a.S.quarter.late?1:0)||(b.step.sup?1:0)-(a.step.sup?1:0)||a.idx-b.idx);
      const row=J=>{const s=J.step;return `<article class="jr-row ${s.sup?"sup":""} ${J.S.quarter.late?"late":""}"><button class="jr-row-id" onclick="jrGo('${J.p.id}','file')"><b>${esc(J.p.name)}</b><small>${esc(J.p.file||"")} · ${esc(J.p.need||"")}</small></button>${jrStepper(J,true)}
        <div class="jr-row-s"><small>${esc(JR_STEPS[J.idx].l)} · ${esc(s.owner||"")}</small><b>${esc(J.cur==="sessions"?"ماشي حسب الخطة":s.act||"")}</b><span>${esc(s.info||"")}</span></div>
        <div class="jr-row-c">${J.cycleStart?`<div class="jr-bar sm"><i style="width:${Math.min(100,Math.round(J.dayN/JR_CYCLE*100))}%"></i></div><small>الدورة ${J.cycleNo} · يوم ${Math.min(J.dayN,999)}/${JR_CYCLE}</small>`:`<small class="muted">الدورة للحين ما بدأت</small>`}</div>
        <div class="jr-row-a">${s.go&&J.cur!=="sessions"?`<button class="btn btn-primary" onclick="${s.go}">${esc(s.act||"نفّذ")}</button>`:`<button class="btn btn-outline" onclick="jrGo('${J.p.id}','file')">افتح الملف</button>`}</div></article>`};
      return head("من الاستقبال لين تقرير ٣ شهور","رحلة الطفل","كل طفل في المركز على مسار واحد متوصل: كل خطوة تتقفل في التاب حقها، والرحلة تنقله للي بعدها لوحدها.",`<button class="btn btn-outline" onclick="setView('patients')">${ic("patients",14)} الملفات</button>`)
        +`<section class="jr-flow">${JR_STEPS.map((s,i)=>`<button class="jr-flow-i ${f===s.k?"on":""}" onclick="jrSet('jrFilter','${f===s.k?"all":s.k}')"><span class="jr-flow-n">${i+1}</span><span class="jr-flow-ic">${ic(s.ic,16)}</span><b>${counts[i]}</b><small>${esc(s.l)}</small></button>`).join("")}</section>
        <section class="jr-kpis"><button class="jr-kpi ${f==="all"?"on":""}" onclick="jrSet('jrFilter','all')"><b>${all.length}</b><small>كل الأطفال</small></button><button class="jr-kpi gold ${f==="sup"?"on":""}" onclick="jrSet('jrFilter','sup')"><b>${sup}</b><small>بانتظار قرار مشرف</small></button><button class="jr-kpi ${f==="quarter"?"on":""}" onclick="jrSet('jrFilter','quarter')"><b>${dueQ.length}</b><small>تقرير ٣ شهور مستحق</small></button><button class="jr-kpi red" onclick="jrSet('jrFilter','quarter')"><b>${late}</b><small>تقرير متأخر</small></button><button class="jr-kpi ${f==="miss"?"on":""}" onclick="jrSet('jrFilter','miss')"><b>${missing}</b><small>ملف فيه خطوة ناقصة</small></button></section>
        <section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("target",18)} ${f==="all"?"كل الأطفال":f==="sup"?"بانتظار قرار مشرف":f==="miss"?"ملفات فيها خطوة ناقصة":esc((JR_STEPS.find(s=>s.k===f)||{}).l||"")} <span class="muted" style="font-weight:600;font-size:13px">(${list.length})</span></h2><input class="input" style="max-width:240px" placeholder="ابحث باسم الطفل أو رقم الملف" value="${esc(q)}" onchange="jrSet('jrQ',this.value)"></div>
        ${list.length?`<div class="jr-rows">${list.map(row).join("")}</div>`:`<div class="empty">ما فيه أطفال في الخطوة هذي.</div>`}</section>`;
    }
    // شريط مختصر للرحلة فوق لوحة القيادة
    function jrStrip(){const all=jrList();if(!all.length)return "";const counts=JR_STEPS.map(s=>all.filter(J=>J.cur===s.k).length);const due=all.filter(J=>J.S.quarter.due).length;const sup=all.filter(J=>J.step.sup).length;
      return `<section class="card jr-strip"><div class="card-head"><h2>${ic("target",18)} رحلة الأطفال — من الاستقبال لتقرير ٣ شهور</h2><button class="btn btn-outline" onclick="setView('journey')">افتح الرحلة</button></div><div class="jr-strip-r">${JR_STEPS.map((s,i)=>`<button onclick="state_jrNoop();jrSet('jrFilter','${s.k}');setView('journey')"><b>${counts[i]}</b><small>${esc(s.l)}</small></button>`).join(`<span class="jr-arrow">‹</span>`)}</div>${due||sup?`<div class="jr-strip-n">${due?`<span class="pill pill-gold">${due} تقرير ٣ شهور مستحق</span>`:""}${sup?`<span class="pill pill-blue">${sup} بانتظار قرار مشرف</span>`:""}</div>`:""}</section>`}
        const _jrHome=roleHome;roleHome=function(){if(state.view==="journey")return journeyView();return _jrHome()};
    // ---- تقرير ٣ شهور: يتجمع لوحده من كل اللي انسجل في الدورة ----
    const JR_SC={"نجاح كامل":2,"نجاح جزئي":1,"لم ينجح بعد":0};
    function jrLevel(pct){return pct==null?"جيد":pct>=80?"ممتاز":pct>=65?"جيد جدًا":pct>=45?"جيد":"يحتاج دعمًا إضافيًا"}
    function jrQuarterData(p){
      const J=jrJourney(p);const today=jrToday();const from=J.cycleStart||J.S.intake.date;const to=today;
      const inR=d=>d&&d>=from&&d<=to;
      const logs=(state.sessionLogs||[]).filter(l=>l.patientId===p.id&&inR(l.date));
      const home=(state.homeLogs||[]).filter(l=>l.patientId===p.id&&inR(l.date));
      const apr=goalsOf(p).filter(g=>g.status==="معتمد");
      const gtexts=[...new Set([...apr.map(g=>g.text),...logs.map(l=>l.goalText).filter(Boolean),...(!apr.length&&p.goal&&!/يحدد|سيتحدد/.test(p.goal)?[p.goal]:[])])];
      const goals=gtexts.map(t=>{const g=apr.find(x=>x.text===t)||{};const L=logs.filter(l=>l.goalText===t).sort((a,b)=>String(a.date).localeCompare(String(b.date)));const H=home.filter(l=>l.goalText===t);
        const full=L.filter(l=>l.result==="نجاح كامل").length,part=L.filter(l=>l.result==="نجاح جزئي").length,none=L.filter(l=>l.result==="لم ينجح بعد").length;
        const pct=L.length?Math.round(L.reduce((s,l)=>s+(JR_SC[l.result]??1),0)/(L.length*2)*100):null;
        const last3=L.slice(-3);const mastered=last3.length===3&&last3.every(l=>l.result==="نجاح كامل");const stuck=last3.length===3&&last3.every(l=>l.result==="لم ينجح بعد");
        const half=Math.floor(L.length/2);const a=L.slice(0,half),b=L.slice(half);const trend=a.length&&b.length?Math.round((b.reduce((s,l)=>s+JR_SC[l.result],0)/b.length-a.reduce((s,l)=>s+JR_SC[l.result],0)/a.length)/2*100):null;
        return {text:t,domain:g.domain||"",dept:g.dept?deptName(g.dept):"",n:L.length,full,part,none,pct,trend,mastered,stuck,home:H.length,homeFull:H.filter(l=>l.result==="نجاح كامل").length,first:L[0]?L[0].date:null,last:L.length?L[L.length-1].date:null}});
      const apts=state.appointments.filter(a=>a.patient===p.name&&!jrIsAssess(a)&&inR(a.date)&&a.date<=today);
      const done=apts.filter(a=>a.status==="مكتمل").length,canc=apts.filter(a=>a.status==="ملغي").length,missed=apts.filter(a=>a.status!=="مكتمل"&&a.status!=="ملغي"&&a.date<today).length;
      const attBase=done+missed+canc;const att=attBase?Math.round(done/attBase*100):null;
      const sa=(state.standardizedAssessments||[]).filter(r=>r.patientId===p.id).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      const base=sa.filter(r=>r.date<=from).slice(-1)[0]||sa[0]||null;const lat=sa.length>1?sa[sa.length-1]:null;
      const asm=r=>r?{instrument:r.instrument,date:r.date,pct:assessPctOf(r),domains:(r.domains||[]).map(d=>({name:d.name,score:d.score||0}))}:null;
      const cs=caseStudyOf(p);const progs=(p.assignedPrograms||[]).map(a=>({program:a.program,dept:deptName(a.department)}));
      const monthly=(state.progressReports||[]).filter(r=>r.patientId===p.id&&r.reportType!=="quarterly"&&inR(r.date)).map(r=>({date:r.date,level:r.level,staff:r.staffName||""}));
      const clin=[...new Set([...state.appointments.filter(a=>a.patient===p.name&&inR(a.date)).map(a=>a.clinician),...logs.map(l=>l.staffName)].filter(Boolean))];
      const depts=[...(typeof ptDeptsOf==="function"?ptDeptsOf(p):new Set())].map(deptName);
      const gp=goals.filter(g=>g.pct!=null);const overall=gp.length?Math.round(gp.reduce((s,g)=>s+g.pct,0)/gp.length):null;
      const recs=[];
      goals.filter(g=>g.mastered).forEach(g=>recs.push(`الهدف «${g.text}» تحقق بثبات (آخر ٣ جلسات نجاح كامل) — يُنقل لمرحلة التعميم في البيت والمدرسة ويُعتمد هدف أعلى منه في الدورة الجاية.`));
      goals.filter(g=>g.stuck).forEach(g=>recs.push(`الهدف «${g.text}» محتاج مراجعة: تقسيمه لخطوات أصغر أو تغيير مستوى المساعدة.`));
      goals.filter(g=>!g.n).forEach(g=>recs.push(`الهدف «${g.text}» ما انسجل عليه أداء في الدورة — يُراجع مع الأخصائي.`));
      if(att!=null&&att<80)recs.push(`نسبة الحضور ${att}% أقل من المطلوب (٨٠٪) — يُتفق مع الأسرة على انتظام المواعيد.`);
      if(!home.length)recs.push("تفعيل المتابعة المنزلية: تسجيل ولي الأمر لأداء الطفل في البيت من بوابة الأسرة لقياس تعميم المهارات.");
      if(!lat)recs.push("إعادة التقييم القياسي في بداية الدورة الجاية لمقارنة النتائج بخط الأساس.");
      recs.push(overall!=null&&overall>=65?"الاستمرار على نفس الخطة مع رفع مستوى الأهداف تدريجيًا.":"الاستمرار في البرنامج مع تكثيف التمارين المنزلية ومراجعة الخطة مع المشرف.");
      const prepared=getCurrentPerson();
      return {pid:p.id,cycle:J.cycleNo,from,to,gen:new Date().toISOString(),child:{name:p.name,file:p.file,age:p.age,need:p.need,guardian:p.guardian,school:p.school,program:p.program},
        depts,clin,steps:JR_STEPS.map(s=>({l:s.l,status:J.S[s.k].status,date:J.S[s.k].date||null,info:J.S[s.k].info||""})),
        cs:cs?{reason:(cs.fields&&(cs.fields.reason||cs.fields.concern))||"",primary:cs.analysis&&cs.analysis.primary?deptName(cs.analysis.primary):""}:null,
        base:asm(base),latest:asm(lat),goals,att:{done,canc,missed,pct:att,total:apts.length},home:{n:home.length,full:home.filter(l=>l.result==="نجاح كامل").length},progs,monthly,
        overall,level:jrLevel(overall),recs,notes:"",prepared:prepared?{name:prepared.name,role:prepared.role||""}:{name:state.role==="management"?"الإدارة":"فريق "+state.center.name,role:""},center:state.center.name,
        logsN:logs.length};
    }
    function jrQText(d){
      return [`تقرير ٣ شهور — ${d.child.name} (ملف ${d.child.file})`,`الدورة ${d.cycle}: من ${date(d.from)} إلى ${date(d.to)} · ${d.center}`,
        `المستوى العام: ${d.level}${d.overall!=null?" ("+d.overall+"%)":""} · الحضور: ${d.att.pct!=null?d.att.pct+"%":"—"} (${d.att.done} جلسة مكتملة)`,
        "الأهداف:\n"+(d.goals.length?d.goals.map(g=>`• ${g.text}: ${g.pct!=null?g.pct+"%":"لا توجد بيانات"}${g.mastered?" — تحقق":g.stuck?" — يحتاج مراجعة":""}`).join("\n"):"—"),
        d.base?`التقييم: ${d.base.instrument} ${d.base.pct}%${d.latest?` ← ${d.latest.pct}% (${d.latest.instrument})`:""}`:"",
        "التوصيات:\n"+d.recs.map(r=>"• "+r).join("\n"),d.notes?"ملاحظات الأخصائي:\n"+d.notes:"",`مُعد التقرير: ${d.prepared.name}`].filter(Boolean).join("\n\n");
    }
    function jrBars(items){return `<div class="jrq-bars">${items.map(x=>`<div class="jrq-bar"><span>${esc(x.l)}</span><div><i style="width:${x.v==null?0:x.v}%;${x.c?"background:"+x.c:""}"></i>${x.v2!=null?`<i class="b2" style="width:${x.v2}%"></i>`:""}</div><b>${x.v==null?"—":x.v+"%"}${x.v2!=null?` ← ${x.v2}%`:""}</b></div>`).join("")}</div>`}
    function jrQuarterHtml(d,mode,rid){
      const canEdit=mode==="draft";const r=rid?(state.progressReports||[]).find(x=>x.id===rid):null;const isFam=state.view==="public";
      const stepRow=d.steps.map(s=>`<li class="${s.status}"><i>${s.status==="done"?"✓":s.status==="miss"?"!":"•"}</i><b>${esc(s.l)}</b><small>${s.date?date(s.date):s.status==="miss"?"ناقص":"—"}</small></li>`).join("");
      const domains=d.base?(d.base.domains.map(x=>{const l=d.latest&&d.latest.domains.find(y=>y.name===x.name);return {l:x.name,v:Math.round(x.score/4*100),v2:l?Math.round(l.score/4*100):null}})):[];
      return `<div class="jrq" id="jrq-print"><header class="jrq-h"><div><small>${esc(d.center)} · تقرير ${esc(isFam?"المتابعة":"دورة علاجية")}</small><h1>تقرير ٣ شهور</h1><p>${esc(d.child.name)} · ملف ${esc(d.child.file||"")}</p></div><div class="jrq-lv"><span>المستوى العام</span><b>${esc(d.level)}</b>${d.overall!=null?`<em>${d.overall}%</em>`:""}</div></header>
        <div class="jrq-meta"><div><small>الفترة</small><b>${date(d.from)} — ${date(d.to)}</b></div><div><small>الدورة</small><b>${d.cycle}</b></div><div><small>العمر</small><b>${esc(d.child.age||"—")}</b></div><div><small>الاحتياج</small><b>${esc(d.child.need||"—")}</b></div><div><small>الأقسام</small><b>${esc(d.depts.join("، ")||d.child.program||"—")}</b></div><div><small>الفريق</small><b>${esc(d.clin.join("، ")||"—")}</b></div></div>
        <h3>١. مسار الرحلة</h3><ol class="jrq-steps">${stepRow}</ol>
        ${d.cs&&d.cs.reason?`<h3>٢. سبب التحويل (من دراسة الحالة)</h3><p class="jrq-p">${esc(d.cs.reason)}${d.cs.primary?` — القسم الأساسي المقترح: ${esc(d.cs.primary)}`:""}</p>`:""}
        <h3>٣. الحضور والالتزام</h3><div class="jrq-kpis"><div><b>${d.att.done}</b><small>جلسة مكتملة</small></div><div><b>${d.att.missed}</b><small>غياب</small></div><div><b>${d.att.canc}</b><small>إلغاء</small></div><div><b>${d.att.pct!=null?d.att.pct+"%":"—"}</b><small>نسبة الحضور</small></div><div><b>${d.logsN}</b><small>نتيجة جلسة مسجلة</small></div><div><b>${d.home.n}</b><small>متابعة منزلية</small></div></div>
        <h3>٤. التقدم في الأهداف</h3>${d.goals.length?`${jrBars(d.goals.map(g=>({l:g.text,v:g.pct,c:g.mastered?"#629386":g.stuck?"#F5795F":null})))}<table class="jrq-t"><thead><tr><th>الهدف</th><th>جلسات</th><th>نجاح كامل</th><th>جزئي</th><th>لم ينجح</th><th>البيت</th><th>الحالة</th></tr></thead><tbody>${d.goals.map(g=>`<tr><td>${esc(g.text)}${g.dept?`<small>${esc(g.dept)}</small>`:""}</td><td>${g.n}</td><td>${g.full}</td><td>${g.part}</td><td>${g.none}</td><td>${g.home?g.homeFull+"/"+g.home:"—"}</td><td>${g.mastered?'<span class="pill pill-good">تحقق</span>':g.stuck?'<span class="pill pill-red">يحتاج مراجعة</span>':!g.n?'<span class="pill">بدون بيانات</span>':g.trend!=null&&g.trend>0?'<span class="pill pill-blue">في تحسّن</span>':'<span class="pill pill-gold">مستمر</span>'}</td></tr>`).join("")}</tbody></table>`:`<p class="jrq-p muted">ما فيه أهداف معتمدة أو نتائج جلسات في الدورة هذي.</p>`}
        <h3>٥. التقييم القياسي</h3>${d.base?`<p class="jrq-p">${esc(d.base.instrument)} · خط الأساس ${date(d.base.date)}: <b>${d.base.pct}%</b>${d.latest?` · إعادة التقييم ${date(d.latest.date)}: <b>${d.latest.pct}%</b>`:" · (إعادة التقييم في الدورة الجاية)"}</p>${domains.length?jrBars(domains):""}`:`<p class="jrq-p muted">ما فيه تقييم قياسي مسجّل على الملف.</p>`}
        ${d.progs.length?`<h3>٦. البرامج العلاجية</h3><div class="chips">${d.progs.map(x=>`<span class="chip checked">${esc(x.program)}</span>`).join("")}</div>`:""}
        ${d.monthly.length?`<h3>المراجعات الشهرية خلال الدورة</h3><p class="jrq-p">${d.monthly.map(m=>`${date(m.date)}: ${esc(m.level||"")}`).join(" · ")}</p>`:""}
        <h3>٧. التوصيات وخطة الدورة الجاية</h3>${canEdit?`<textarea class="textarea" id="jrq-recs" style="min-height:140px">${esc(d.recs.join("\n"))}</textarea>`:`<ul class="jrq-recs">${d.recs.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`}
        <h3>ملاحظات الأخصائي</h3>${canEdit?`<textarea class="textarea" id="jrq-notes" placeholder="أي ملاحظة إكلينيكية تحب تضيفها للتقرير قبل الاعتماد">${esc(d.notes||"")}</textarea>`:`<p class="jrq-p">${esc(d.notes||"—")}</p>`}
        <div class="jrq-sign"><div><small>أعدّه</small><b>${esc(d.prepared.name)}</b><span>${esc(d.prepared.role)}</span></div><div><small>اعتماد مشرف القسم</small><b>${r&&r.approvedBy?esc(r.approvedBy):"................"}</b></div><div><small>تاريخ الإصدار</small><b>${date(jrDay(d.gen))}</b></div></div>
        <p class="jrq-foot">التقرير متجمّع تلقائيًا من سجلات أوان (الجلسات، المواعيد، الأهداف، التقييمات، المتابعة المنزلية) ومراجَع من الأخصائي المرخّص.</p></div>`;
    }
    function jrOverlay(inner,actions){
      let ov=document.getElementById("jr-ov");if(!ov){ov=document.createElement("div");ov.id="jr-ov";document.body.appendChild(ov)}
      ov.innerHTML=`<div class="jr-ov-bg" onclick="jrOvClose()"></div><div class="jr-ov-box"><div class="jr-ov-bar">${actions}<button class="jr-x" onclick="jrOvClose()" aria-label="إغلاق">×</button></div>${inner}</div>`;ov.classList.add("on");document.body.classList.add("jr-lock");
    }
    function jrOvClose(){const ov=document.getElementById("jr-ov");if(ov){ov.classList.remove("on");ov.innerHTML=""}document.body.classList.remove("jr-lock");state.jrDraft=null}
    function jrPrint(){document.body.classList.add("jr-printing");setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove("jr-printing"),400)},50)}
    function jrQuarterOpen(pid){
      const p=state.patients.find(x=>x.id===pid);if(!p)return;const J=jrJourney(p);
      if(!J.cycleStart){notify("لازم الخطة تتعتمد الأول عشان تبدأ الدورة العلاجية");return}
      const d=jrQuarterData(p);state.jrDraft=d;
      const early=J.dayN<JR_QDUE?`<span class="jr-ov-note">الدورة للحين في يومها ${J.dayN} — تقدر تطلع التقرير بدري لو محتاجه</span>`:"";
      jrOverlay(jrQuarterHtml(d,"draft"),`${early}<button class="btn btn-primary" onclick="jrQuarterSave(false)">${ic("check",14)} اعتماد وحفظ في الملف</button><button class="btn btn-outline" onclick="jrQuarterSave(true)">اعتماد ومشاركة مع الأسرة</button><button class="btn btn-outline" onclick="jrPrint()">طباعة / PDF</button>`);
    }
    function jrQuarterSave(share){
      const d=state.jrDraft;if(!d)return;const p=state.patients.find(x=>x.id===d.pid);if(!p)return;
      const re=document.getElementById("jrq-recs"),no=document.getElementById("jrq-notes");
      if(re)d.recs=re.value.split("\n").map(x=>x.trim()).filter(Boolean);if(no)d.notes=no.value.trim();
      const me=getCurrentPerson();const sup=state.role==="supervisor"||state.role==="management";
      const r={id:"pr-q-"+Date.now(),patientId:p.id,patientName:p.name,date:jrToday(),level:d.level,achievedGoals:d.goals.filter(g=>g.mastered).map(g=>g.text).join("، "),notes:d.notes,reportType:"quarterly",cycle:d.cycle,qData:d,summaryText:jrQText(d),staffId:me?me.id:null,staffName:me?me.name:d.prepared.name,shared:!!share,approvedBy:sup?(me?me.name:"الإدارة"):null};
      state.progressReports.unshift(r);
      if(share&&typeof cmSendTo==="function")try{cmSendTo("fam:"+p.id,`تقرير الـ٣ شهور لـ ${p.name.split(" ")[0]} جاهز على بوابة الأسرة 🌿 المستوى العام: ${d.level}.`)}catch(e){}
      audit(`إصدار تقرير ٣ شهور (الدورة ${d.cycle})`,p.name);state.jrDraft=null;persist();jrOvClose();render();
      notify(`انحفظ تقرير ٣ شهور${share?" انتشارك مع الأسرة":""} · بدأت الدورة ${d.cycle+1} لـ ${p.name.split(" ")[0]}`);
    }
    function jrQuarterView(id){
      const r=(state.progressReports||[]).find(x=>x.id===id);if(!r||!r.qData)return;const staff=state.view!=="public"&&state.role!=="family";
      const canApprove=staff&&(state.role==="supervisor"||state.role==="management")&&!r.approvedBy;
      jrOverlay(jrQuarterHtml(r.qData,"view",id),`${canApprove?`<button class="btn btn-primary" onclick="jrQuarterApprove('${id}')">${ic("check",14)} اعتماد المشرف</button>`:""}${staff?`<button class="btn btn-outline" onclick="toggleReportShare('${id}');jrQuarterView('${id}')">${r.shared?"✓ مُشارَك مع الأسرة":"مشاركة مع الأسرة"}</button>`:""}<button class="btn btn-outline" onclick="jrPrint()">طباعة / PDF</button>`);
    }
    function jrQuarterApprove(id){const r=(state.progressReports||[]).find(x=>x.id===id);if(!r)return;const me=getCurrentPerson();r.approvedBy=me?me.name:"الإدارة";audit("اعتماد تقرير ٣ شهور",r.patientName);persist();render();jrQuarterView(id);notify("اعتُمد التقرير")}
    const _jrVPR=viewProgressReport;viewProgressReport=function(id){const r=(state.progressReports||[]).find(x=>x.id===id);if(r&&r.reportType==="quarterly"&&r.qData)return jrQuarterView(id);return _jrVPR(id)};
    // ---- ربط الخطوات اللي تحصل في تابات ثانية بالرحلة ----
    const _jrConv=rfConvert;rfConvert=function(e,id){const before=new Set(state.patients.map(p=>p.id));_jrConv.apply(this,arguments);const np=state.patients.find(p=>!before.has(p.id));if(np){state.jrCtx={pid:np.id,step:"__new",label:"انفتح الملف",name:np.name};render()}};
    if(typeof addPatient==="function"){const _jrAdd=addPatient;addPatient=function(e){const before=new Set(state.patients.map(p=>p.id));_jrAdd.apply(this,arguments);const np=state.patients.find(p=>!before.has(p.id));if(np){state.jrCtx={pid:np.id,step:"__new",label:"انفتح الملف",name:np.name};render()}};window.addPatient=addPatient}
    DEVICE_ONLY.add("jrDraft");
    Object.assign(window,{jrGo,jrCtxClose,jrSet,jrQuarterOpen,jrQuarterSave,jrQuarterView,jrQuarterApprove,jrOvClose,jrPrint,state_jrNoop,viewProgressReport,rfConvert});
    ["management","supervisor","reception","staff"].forEach(r=>{const nav=roles[r].nav;if(!nav.includes("journey")){const i=nav.indexOf("patients");nav.splice(i>=0?i:0,0,"journey")}});
    navItems.splice(Math.max(0,navItems.findIndex(n=>n[0]==="patients")),0,["journey","target"]);

    // =================== تنظيم أوان: قائمة مجمّعة بترتيب الرحلة + ملف طفل بتبويبات + الطفل يمشي معك بين التابات + بحث شامل ===================
    // ---- ١) القائمة الجانبية: مجموعات مرتبة بنفس ترتيب رحلة الطفل ----
    const ORG_GROUPS=[
      {k:"today",l:"القيادة اليوم",n:"",keys:["digital","myIpad","staffPage","liveOps","dashboard"]},
      {k:"intake",l:"الاستقبال والتسجيل",n:"١",keys:["referrals","calls","intakeAI"],journey:true},
      {k:"child",l:"رحلة الطفل",n:"٢",keys:["journey","patients","assessments","videoLab","schedule","scribe"],journey:true},
      {k:"family",l:"الأسرة والتواصل",n:"٣",keys:["ebnak","connect","communicationHub","library"],journey:true},
      {k:"team",l:"الفريق والأقسام",n:"",keys:["team","departments","attendance","ipads","deptPlan"]},
      {k:"gov",l:"الحوكمة والنظام",n:"",keys:["reports","audit","reviewRequests","license","govSupport","agents","server","settings"]}
    ];
    const ORG_LABEL={dashboard:"navHome",patients:"navPatients",schedule:"navSchedule",referrals:"navReferrals",team:"navTeam",departments:"navDepartments",attendance:"navAttendance",reports:"navReports",invoices:"navInvoices",connect:"navConnect",communicationHub:"navCommHub",library:"navLibrary",license:"navLicense",govSupport:"navGovSupport",reviewRequests:"navReviewRequests",audit:"navAudit",intakeAI:"navIntakeAI",liveOps:"navLiveOps",videoLab:"navVideoLab",assessments:"navAssess",ebnak:"navEbnak",scribe:"navScribe",claims:"navClaims",calls:"navCalls",server:"navServer",myIpad:"navMyIpad",staffPage:"navMyIpad",ipads:"navIpads",deptPlan:"navDeptPlan",agents:"navAgents",digital:"navDigital",settings:"navSettings",journey:"navJourney"};
    function orgLabel(k){const s=t(ORG_LABEL[k]);return s&&s!==ORG_LABEL[k]?s:k}
    function orgIcon(k){const n=navItems.find(x=>x[0]===k);return n?n[1]:"blocks"}
    function orgGroupOf(v){if(v==="patient-detail")return "child";const g=ORG_GROUPS.find(g=>g.keys.includes(v));return g?g.k:null}
    function orgNavCol(){if(!state.navCol||typeof state.navCol!=="object")state.navCol={};return state.navCol}
    function orgToggleGroup(k){const c=orgNavCol();c[k]=!c[k];persist();render()}
    function orgBadge(k){
      try{
        if(k==="schedule"&&(state.role==="management"||state.role==="reception")){const n=newBookingsCount();return n?`<em class="og-b red">${n}</em>`:""}
        if(k==="connect"&&(state.role==="management"||state.role==="supervisor")){const n=pendingDecisionsCount();return n?`<em class="og-b red">${n}</em>`:""}
        if(k==="communicationHub"){const n=pendingCommCount();return n?`<em class="og-b red">${n}</em>`:""}
        if(k==="journey"){const L=jrList();const n=L.filter(J=>J.step.sup||J.S.quarter.due).length;return n?`<em class="og-b">${n}</em>`:""}
        if(k==="referrals"){const n=(state.referrals||[]).filter(r=>!["done","archived"].includes(r.stage)&&r.status!=="مقبولة"&&r.type!=="تقرير طبي").length;return n?`<em class="og-b">${n}</em>`:""}
      }catch(e){}
      return "";
    }
    sidebar=function(){
      const allowed=roles[state.role].nav;const act=state.view==="patient-detail"?"patients":state.view;const actG=orgGroupOf(state.view);const col=orgNavCol();
      const used=new Set();
      const groups=ORG_GROUPS.map(g=>({...g,items:g.keys.filter(k=>allowed.includes(k)&&!used.has(k)&&used.add(k))}));
      const rest=allowed.filter(k=>!used.has(k));if(rest.length)groups.push({k:"more",l:"أخرى",n:"",items:rest});
      const btn=k=>`<button class="${act===k?"active":""}" onclick="setView('${k}')"><span class="nav-icon">${ic(orgIcon(k),16)}</span><span class="og-t">${esc(orgLabel(k))}</span>${orgBadge(k)}</button>`;
      return `<aside class="sidebar og-side"><div class="side-kicker">${esc(t("workspaceLabel"))} · ${esc(roles[state.role].label)}</div><button class="og-search" onclick="cmdkOpen()">${ic("eye",14)}<span>بحث سريع</span><kbd>Ctrl K</kbd></button>
        <nav class="side-nav og-nav">${groups.filter(g=>g.items.length).map(g=>{const open=g.k===actG||!col[g.k];return `<div class="og-g ${g.journey?"jr":""} ${open?"open":""} ${g.k===actG?"cur":""}"><button type="button" class="og-h" onclick="orgToggleGroup('${g.k}')">${g.n?`<i class="og-n">${g.n}</i>`:""}<span>${esc(g.l)}</span><b class="og-c">${ic("chevronDown",12,2.4)}</b></button><div class="og-items">${g.items.map(btn).join("")}</div></div>`}).join("")}</nav>
        <div class="side-footer"><b>${esc(state.center.name)}</b><br>${esc(state.center.city)}<br><span style="color:#22c55e">● ${esc(t("dataLocal"))}</span><br><button class="btn btn-outline" style="margin-top:10px;width:100%;font-size:10px" onclick="resetData()">${esc(t("resetSample"))}</button></div></aside>`;
    };
    // ---- ٢) زرار البحث في الشريط العلوي ----
    const _orgTop=topbar;topbar=function(){const h=_orgTop();return h.replace('<div class="top-actions">',`<div class="top-actions"><button class="og-topsearch" onclick="cmdkOpen()" title="بحث شامل (Ctrl+K)">${ic("eye",14)} بحث</button>`)};
    // ---- ٣) ملف الطفل بتبويبات بدل صفحة طويلة ----
    const PD_TABS=[
      {k:"overview",l:"نظرة عامة",ic:"home",m:/بيانات المستفيد|رحلة الطفل|الخطة العلاجية/},
      {k:"plan",l:"الخطة والأهداف",ic:"target",m:/دراسة الحالة|البرامج العلاجية|بانتظار اعتمادك|الأهداف/},
      {k:"assess",l:"التقييمات",ic:"clipboardCheck",m:/التقييم/},
      {k:"sessions",l:"الجلسات والتقارير",ic:"chart",m:/تقارير التقدم|تعميم المهارات|المكتبة|الجلسات/},
      {k:"family",l:"الأسرة والموافقات",ic:"heart",m:/الموافقات|الأسرة/},
      {k:"health",l:"الملف الصحي",ic:"shield",m:/الملف الصحي/},
      {k:"log",l:"السجل",ic:"book",m:/الإجراءات|سجل/}
    ];
    const PD_SEL={".jr-card":"overview",".cs-card":"plan",".jr-evsup":"plan",".jr-consents":"family",".jr-std":"assess",".jr-reports":"sessions"};
    function pdTabFor(el){if(el.classList.contains("grid-2")||el.classList.contains("jr-card"))return "overview";if(el.classList.contains("cs-card")||el.classList.contains("jr-evsup"))return "plan";if(el.classList.contains("jr-std"))return "assess";if(el.classList.contains("jr-reports"))return "sessions";if(el.classList.contains("jr-consents"))return "family";
      const h=(el.querySelector("h2")||{}).textContent||"";const tb=PD_TABS.find(x=>x.k!=="overview"&&x.m.test(h));return tb?tb.k:"overview"}
    function pdCounts(p){const id=p.id;const c={};
      c.assess=(state.standardizedAssessments||[]).filter(r=>r.patientId===id).length+(typeof evEnsure==="function"?evEnsure().filter(r=>r.patientId===id).length:0);
      c.plan=goalsOf(p).filter(g=>g.status!=="مرفوض").length;
      c.sessions=(state.sessionLogs||[]).filter(l=>l.patientId===id).length;
      c.family=CONSENT_TYPES?CONSENT_TYPES.filter(tp=>consentStatus(p,tp.k).st!=="active").length:0;return c}
    function pdHub(){
      if(state.view!=="patient-detail")return;const box=document.querySelector(".content");if(!box||box.dataset.pdHub==="1")return;
      const p=state.patients.find(x=>x.id===state.patientId);if(!p)return;
      const kids=[...box.children];const ph=kids.find(e=>e.classList.contains("page-head"));if(!ph)return;
      const present=new Set();kids.forEach(el=>{if(el.tagName==="SECTION"||el.classList.contains("grid-2")){const k=pdTabFor(el);el.dataset.pdt=k;present.add(k)}});
      if(!PD_TABS.some(x=>x.k===state.pdTab&&present.has(x.k)))state.pdTab="overview";
      const c=pdCounts(p);const J=jrJourney(p);
      const bar=document.createElement("div");bar.className="pd-tabs";bar.setAttribute("role","tablist");
      bar.innerHTML=`<div class="pd-id"><span class="pd-av">${esc((p.name||"؟").trim()[0])}</span><div><b>${esc(p.name)}</b><small>${esc(JR_STEPS[J.idx].l)}${J.cycleStart?` · الدورة ${J.cycleNo} · يوم ${Math.min(J.dayN,999)}`:""}</small></div></div><div class="pd-tl">${PD_TABS.filter(x=>present.has(x.k)).map(x=>`<button role="tab" class="${state.pdTab===x.k?"on":""}" onclick="pdSet('${x.k}')">${ic(x.ic,14)}<span>${esc(x.l)}</span>${x.k==="family"&&c.family?`<em class="warn">${c.family}</em>`:c[x.k]&&x.k!=="family"?`<em>${c[x.k]}</em>`:""}</button>`).join("")}</div>`;
      ph.after(bar);box.dataset.pdHub="1";box.dataset.pdTab=state.pdTab;box.classList.add("pd-hub");
    }
    function pdSet(k){state.pdTab=k;const box=document.querySelector(".content.pd-hub");if(box){box.dataset.pdTab=k;box.querySelectorAll(".pd-tl button").forEach(b=>b.classList.toggle("on",b.getAttribute("onclick")===`pdSet('${k}')`));const bar=box.querySelector(".pd-tabs");if(bar&&bar.getBoundingClientRect().top<0)bar.scrollIntoView({block:"start"})}}
    function pdReveal(sel){const el=document.querySelector(sel);if(!el)return;const k=el.dataset.pdt;if(k&&k!==state.pdTab)pdSet(k)}
    // أزرار الرحلة اللي تنزل على كارت معيّن تفتح التبويب حقه الأول
    const _orgJrGo=jrGo;jrGo=function(pid,k){const map={file:".jr-card",case:".cs-card",plan:".cs-card",consent:".jr-consents",std:".jr-std",log:".jr-card",monthly:".jr-reports",quarter:".jr-card"};if(map[k]){state.pdTab=PD_SEL[map[k]]||"overview";if(k==="plan"&&evEnsure().some(r=>r.patientId===pid&&r.status==="بانتظار المشرف"))state.pdTab="plan"}return _orgJrGo(pid,k)};
    // ---- ٤) الطفل «متحدد» يمشي معك في كل تاب له علاقة بيه ----
    const ORG_CHILD_VIEWS=["schedule","assessments","videoLab","scribe","ebnak","connect","communicationHub","referrals","intakeAI","deptPlan","library","attendance"];
    function focusGo(v){if(!roles[state.role].nav.includes(v))return;state.view=v;persist();render();window.scrollTo({top:0,behavior:"smooth"})}
    function focusClear(){state.focusPid=null;persist();render()}
    function focusBar(){
      if(state.jrCtx||!state.focusPid||!ORG_CHILD_VIEWS.includes(state.view))return "";
      const p=state.patients.find(x=>x.id===state.focusPid&&!x.archived);if(!p)return "";
      const J=jrJourney(p);const s=J.step;const nav=roles[state.role].nav;const today=jrToday();
      const up=state.appointments.filter(a=>a.patient===p.name&&a.status!=="ملغي"&&a.status!=="مكتمل"&&a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      const sa=(state.standardizedAssessments||[]).filter(r=>r.patientId===p.id).length;
      const chip=(v,label,n)=>nav.includes(v)?`<button class="fb-chip ${state.view===v?"on":""}" onclick="focusGo('${v}')">${ic(orgIcon(v),13)} ${esc(label)}${n!=null?` <em>${n}</em>`:""}</button>`:"";
      const ctxAct=state.view==="schedule"?`<button class="btn btn-primary" onclick="ptBook('${p.id}')">احجز لـ ${esc(p.name.split(" ")[0])}</button>`:state.view==="assessments"||state.view==="videoLab"?`<button class="btn btn-primary" onclick="jrGo('${p.id}','std')">سجّل تقييم قياسي</button>`:s.go&&J.cur!=="sessions"?`<button class="btn btn-primary" onclick="${s.go}">${esc(s.act||"نفّذ")}</button>`:"";
      return `<div class="fb"><div class="fb-id"><span class="pd-av">${esc(p.name.trim()[0])}</span><div><small>الطفل المحدد</small><b>${esc(p.name)}</b></div></div>${jrStepper(J,true)}<div class="fb-now"><small>${esc(JR_STEPS[J.idx].l)}</small><b>${esc(J.cur==="sessions"?(up[0]?`الجاية ${up[0].date===today?"اليوم":date(up[0].date)} ${time(up[0].time)}`:"ماشي حسب الخطة"):s.act||"")}</b></div>
        <div class="fb-chips"><button class="fb-chip" onclick="jrGo('${p.id}','file')">${ic("patients",13)} الملف</button>${chip("schedule","المواعيد",up.length)}${chip("assessments","التقييمات",sa)}${chip("communicationHub","التواصل",null)}${chip("journey","الرحلة",null)}</div>
        <div class="fb-a">${ctxAct}<button class="jr-x" onclick="focusClear()" title="إلغاء تحديد الطفل">×</button></div></div>`;
    }
    const _orgShell=shell;shell=function(body){if(state.view==="patient-detail"&&state.patientId)state.focusPid=state.patientId;return _orgShell(focusBar()+body)};
    // ---- ٥) بحث شامل Ctrl+K: أي طفل، أي شاشة، أي خطوة ----
    let CK={q:"",i:0,items:[]};
    function cmdkItems(q){
      q=(q||"").trim();const out=[];const vis=typeof ptVisible==="function"?ptVisible:()=>true;const nav=roles[state.role].nav;
      const kids=state.patients.filter(p=>!p.archived&&vis(p)&&(!q||(p.name+" "+(p.file||"")+" "+(p.guardian||"")+" "+(p.phone||"")).includes(q))).slice(0,q?8:4);
      kids.forEach(p=>{let J;try{J=jrJourney(p)}catch(e){}out.push({g:"الأطفال",ic:"patients",t:p.name,s:`${p.file||""}${J?" · "+JR_STEPS[J.idx].l:""}`,run:`jrGo('${p.id}','file')`});
        if(J&&q&&J.step.go&&J.cur!=="sessions")out.push({g:"الأطفال",ic:"target",t:`${J.step.act} — ${p.name.split(" ")[0]}`,s:J.step.info||"",run:J.step.go,sub:true})});
      ORG_GROUPS.forEach(g=>g.keys.filter(k=>nav.includes(k)).forEach(k=>{const l=orgLabel(k);if(!q||l.includes(q)||g.l.includes(q))out.push({g:"الشاشات",ic:orgIcon(k),t:l,s:g.l,run:`setView('${k}')`})}));
      JR_STEPS.forEach(s=>{if(!q||s.l.includes(q))out.push({g:"خطوات الرحلة",ic:s.ic,t:`أطفال في «${s.l}»`,s:"افتح رحلة الطفل على الخطوة هذي",run:`state_jrNoop();jrSet('jrFilter','${s.k}');setView('journey')`})});
      return out.slice(0,24);
    }
    function cmdkPaint(){const box=document.getElementById("cmdk-list");if(!box)return;CK.items=cmdkItems(CK.q);if(CK.i>=CK.items.length)CK.i=0;let g="";
      box.innerHTML=CK.items.length?CK.items.map((x,i)=>{const h=x.g!==g?`<div class="ck-g">${esc(x.g)}</div>`:"";g=x.g;return h+`<button class="ck-i ${i===CK.i?"on":""} ${x.sub?"sub":""}" onmouseenter="cmdkHover(${i})" onclick="cmdkRun(${i})">${ic(x.ic,15)}<span><b>${esc(x.t)}</b><small>${esc(x.s||"")}</small></span></button>`}).join(""):`<div class="ck-empty">ما فيه نتايج لـ «${esc(CK.q)}»</div>`;
      const on=box.querySelector(".ck-i.on");if(on)on.scrollIntoView({block:"nearest"})}
    function cmdkOpen(){if(state.view==="public")return;CK={q:"",i:0,items:[]};let ov=document.getElementById("cmdk");if(!ov){ov=document.createElement("div");ov.id="cmdk";document.body.appendChild(ov)}
      ov.innerHTML=`<div class="ck-bg" onclick="cmdkClose()"></div><div class="ck-box" role="dialog" aria-label="بحث شامل"><div class="ck-in">${ic("eye",18)}<input id="cmdk-q" placeholder="اكتب اسم طفل، رقم ملف، أو اسم شاشة…" autocomplete="off" oninput="cmdkType(this.value)"><kbd>Esc</kbd></div><div class="ck-list" id="cmdk-list"></div><div class="ck-foot"><span>↑↓ للتنقل</span><span>Enter للفتح</span><span>Ctrl+K من أي مكان</span></div></div>`;
      ov.classList.add("on");cmdkPaint();setTimeout(()=>{const i=document.getElementById("cmdk-q");if(i)i.focus()},20)}
    function cmdkClose(){const ov=document.getElementById("cmdk");if(ov){ov.classList.remove("on");ov.innerHTML=""}}
    function cmdkType(v){CK.q=v;CK.i=0;cmdkPaint()}
    function cmdkHover(i){if(CK.i===i)return;CK.i=i;document.querySelectorAll("#cmdk .ck-i").forEach((b,j)=>b.classList.toggle("on",j===i))}
    function cmdkRun(i){const x=CK.items[i];if(!x)return;cmdkClose();try{(new Function(x.run))()}catch(e){console.warn(e)}}
    document.addEventListener("keydown",e=>{
      if((e.ctrlKey||e.metaKey)&&(e.key==="k"||e.key==="K"||e.code==="KeyK")){if(state.view==="public"||state.sipadMode||state.intakeKiosk)return;e.preventDefault();const ov=document.getElementById("cmdk");if(ov&&ov.classList.contains("on"))cmdkClose();else cmdkOpen();return}
      const ov=document.getElementById("cmdk");if(!ov||!ov.classList.contains("on"))return;
      if(e.key==="Escape"){e.preventDefault();cmdkClose()}else if(e.key==="ArrowDown"){e.preventDefault();CK.i=Math.min(CK.items.length-1,CK.i+1);cmdkPaint()}else if(e.key==="ArrowUp"){e.preventDefault();CK.i=Math.max(0,CK.i-1);cmdkPaint()}else if(e.key==="Enter"){e.preventDefault();cmdkRun(CK.i)}
    });
    // ---- ٦) خريطة أوان: كل خطوة في الرحلة تتعمل في أي تاب، ومين مسؤول، وكم طفل واقف عندها ----
    const ORG_MAP={intake:{who:"الاستقبال",tabs:["referrals","calls","intakeAI"]},case:{who:"الاستقبال + الأسرة",tabs:["digital","patients"]},assess:{who:"الأخصائي",tabs:["assessments","videoLab","myIpad"]},plan:{who:"الأخصائي ← المشرف",tabs:["patients","departments"]},consent:{who:"الاستقبال + الأسرة",tabs:["patients","ebnak"]},book:{who:"الاستقبال",tabs:["schedule","deptPlan"]},sessions:{who:"الأخصائي",tabs:["myIpad","scribe","liveOps"]},monthly:{who:"الأخصائي",tabs:["patients","scribe"]},quarter:{who:"الأخصائي ← المشرف ← الأسرة",tabs:["journey","ebnak"]}};
    function orgMap(all){const nav=roles[state.role].nav;
      return `<details class="card og-map" ${state.ogMapClosed?"":"open"} ontoggle="ogMapToggle(this.open)"><summary><h2>${ic("globe",18)} خريطة أوان — كل خطوة تتعمل وين ومين مسؤول</h2><span class="muted">اضغط على أي تاب يوديك عليه</span></summary>
        <ol class="og-metro">${JR_STEPS.map((s,i)=>{const m=ORG_MAP[s.k];const n=all.filter(J=>J.cur===s.k).length;const tabs=m.tabs.filter(k=>nav.includes(k));
          return `<li><div class="og-st"><span class="og-dot">${i+1}</span><b>${esc(s.l)}</b>${n?`<em>${n} طفل</em>`:""}</div><small>${esc(m.who)}</small><div class="og-tabs">${tabs.map(k=>`<button onclick="setView('${k}')">${ic(orgIcon(k),12)} ${esc(orgLabel(k))}</button>`).join("")||`<span class="muted" style="font-size:11px">من ملف الطفل</span>`}</div></li>`}).join("")}</ol></details>`}
    const _orgJV=journeyView;journeyView=function(){const h=_orgJV();const k=h.indexOf('<section class="card" style="margin-top:16px">');return k>0?h.slice(0,k)+orgMap(jrList())+h.slice(k):h};
    // ---- تطبيق التبويبات بعد كل رسم ----
    const _orgRender=render;render=function(){const r=_orgRender.apply(this,arguments);try{pdHub()}catch(e){console.warn(e)}return r};
    function ogMapToggle(o){state.ogMapClosed=!o}
    DEVICE_ONLY.add("ogMapClosed");
    Object.assign(window,{ogMapToggle,orgToggleGroup,pdSet,focusGo,focusClear,cmdkOpen,cmdkClose,cmdkType,cmdkHover,cmdkRun,jrGo,render});

    // =================== عقل أوان: الذكاء الاصطناعي في خدمة الإدارة + المنصة متقسمة على ٩ محاور بدل ٣٠ تاب ===================
    // ---- ١) المحاور: كل مجموعة تابات متكررة/متشابهة صارت محور واحد في القائمة، وجواه شريط تبويبات ----
    const HUBS=[
      {k:"brain",l:"عقل أوان",d:"القيادة بالذكاء الاصطناعي",ic:"idea",views:[["brain","مركز القيادة"],["agents","الإدارة الآلية"],["liveOps","المراقبة الحية"],["digital","لوحة الرقمنة"]]},
      {k:"my",l:"آيبادي",d:"يومي وجلساتي",ic:"tablet",views:[["myIpad","آيبادي"],["staffPage","صفحتي"]]},
      {k:"intake",l:"الاستقبال",d:"الإحالات والتسجيل",ic:"referrals",views:[["referrals","الإحالات"],["intakeAI","التسجيل ودراسة الحالة"],["calls","المكالمات"]]},
      {k:"kids",l:"الأطفال",d:"الرحلة والملفات والتقييم",ic:"patients",views:[["journey","رحلة الطفل"],["patients","الملفات"],["assessments","التقييمات"],["videoLab","التقييم بالفيديو"]]},
      {k:"sessions",l:"الجلسات",d:"المواعيد والجداول",ic:"schedule",views:[["schedule","المواعيد"],["deptPlan","جدول القسم"],["scribe","الكاتب الذكي"],["ipads","آيبادات الفريق"]]},
      {k:"family",l:"الأسرة والتواصل",d:"رسائل واجتماعات وإرشاد",ic:"heart",views:[["communicationHub","أوان تواصل"],["connect","أوان كونكت"],["ebnak","ابنك ابني"],["library","مكتبة الإرشاد"]]},
      {k:"team",l:"الفريق والأقسام",d:"الموظفين والحضور",ic:"team",views:[["team","الفريق"],["departments","الأقسام"],["attendance","الحضور والغياب"]]},
      {k:"gov",l:"الحوكمة والإعدادات",d:"تقارير وامتثال وتدقيق وضبط",ic:"shield",views:[["reports","التقارير"],["audit","سجل التدقيق"],["reviewRequests","طلب التقييمات"],["license","الترخيص البلدي"],["govSupport","دعم الدولة"],["server","السيرفر والحسابات"],["settings","إعدادات المركز"]]}
    ];
    ["management","supervisor"].forEach(r=>{const nav=roles[r].nav;if(!nav.includes("brain"))nav.unshift("brain")});
    if(!navItems.some(n=>n[0]==="brain"))navItems.unshift(["brain","idea"]);
    // البحث الشامل ولون القائمة يقروا من المحاور الجديدة
    ORG_GROUPS.splice(0,ORG_GROUPS.length,...HUBS.map(h=>({k:h.k,l:h.l,n:"",keys:h.views.map(v=>v[0])})));
    function hubOf(v){if(v==="patient-detail")return HUBS.find(h=>h.k==="kids");if(v==="meetingRoom")return HUBS.find(h=>h.k==="family");return HUBS.find(h=>h.views.some(x=>x[0]===v))||null}
    function hubViews(h){const nav=roles[state.role].nav;return h.views.filter(v=>nav.includes(v[0]))}
    function hubLabel(k){for(const h of HUBS){const v=h.views.find(x=>x[0]===k);if(v)return v[1]}return null}
    const _orgLabel0=orgLabel;orgLabel=function(k){return hubLabel(k)||_orgLabel0(k)};
    function hubGo(k){const h=HUBS.find(x=>x.k===k);if(!h)return;const vs=hubViews(h);if(!vs.length)return;const last=(state.hubLast||{})[k];const v=vs.find(x=>x[0]===last)?last:vs[0][0];setView(v)}
    function hubBadge(h){apEnsure();let n=0,red=false;hubViews(h).forEach(([k])=>{const b=orgBadge(k);const m=b.match(/>(\d+)</);if(m){n+=+m[1];if(/red/.test(b))red=true}});
      if(h.k==="brain"&&(state.role==="management"||state.role==="supervisor")){const d=brDecisions().length;n+=d;if(d)red=true}
      return n?`<em class="og-b ${red?"red":""}">${n}</em>`:""}
    sidebar=function(){
      const cur=hubOf(state.view);const hs=HUBS.filter(h=>hubViews(h).length);
      return `<aside class="sidebar og-side hb-side"><div class="side-kicker">${esc(t("workspaceLabel"))} · ${esc(roles[state.role].label)}</div>
        <button class="og-search" onclick="cmdkOpen()">${ic("eye",14)}<span>بحث سريع</span><kbd>Ctrl K</kbd></button>
        <nav class="side-nav hb-nav">${hs.map(h=>`<button class="hb-i ${cur&&cur.k===h.k?"active":""} ${h.k==="brain"?"brain":""}" onclick="hubGo('${h.k}')"><span class="nav-icon">${ic(h.ic,17)}</span><span class="hb-t"><b>${esc(h.l)}</b><small>${esc(h.d)}</small></span>${hubBadge(h)}</button>`).join("")}</nav>
        <div class="side-footer"><b>${esc(state.center.name)}</b><br>${esc(state.center.city)}<br><span style="color:#22c55e">● ${esc(t("dataLocal"))}</span><br><button class="btn btn-outline" style="margin-top:10px;width:100%;font-size:10px" onclick="resetData()">${esc(t("resetSample"))}</button></div></aside>`;
    };
    function hubBar(){
      const h=hubOf(state.view);if(!h)return "";const vs=hubViews(h);if(vs.length<2)return "";
      const act=state.view==="patient-detail"?"patients":state.view==="meetingRoom"?"connect":state.view;
      if(!state.hubLast||typeof state.hubLast!=="object")state.hubLast={};if(vs.some(v=>v[0]===act))state.hubLast[h.k]=act;
      return `<nav class="hb-bar" aria-label="${esc(h.l)}"><span class="hb-bar-t">${ic(h.ic,15)} ${esc(h.l)}</span><div class="hb-bar-l">${vs.map(([k,l])=>`<button class="${act===k?"on":""}" onclick="setView('${k}')">${esc(l)}${orgBadge(k)}</button>`).join("")}</div></nav>`;
    }
    const _hbShell=shell;shell=function(body){return _hbShell(hubBar()+body)};
    // الإدارة والإشراف يبدأوا من عقل أوان
    const _hbRender=render;render=function(){if(state.role==="management"&&(state.view==="dashboard"||!state.view))state.view="brain";return _hbRender.apply(this,arguments)};
    const _hbHome=roleHome;roleHome=function(){if(state.view==="brain")return brainView();return _hbHome()};
    // ---- ٢) صندوق القرارات الموحّد: كل شي بانتظار الإدارة من كل التابات في مكان واحد ----
    function brMe(){return getCurrentPerson()}
    function brDeptOK(dep){if(state.role==="management")return true;const me=brMe();return !me||!me.department||!dep||me.department===dep}
    function brAgents(tab){state.apTab=tab;setView("agents")}
    function brDecisions(){
      const out=[];const add=(o)=>out.push(o);if(!(state.role==="management"||state.role==="supervisor"))return out;
      const A=apEnsure();const AG=k=>(AP_AGENTS.find(a=>a[0]===k)||[0,"الإدارة الآلية","bell"]);
      A.queue.filter(q=>brDeptOK(q.dept)&&!(state.role==="supervisor"&&/billing|revenue|payroll/.test(q.agent))).forEach(q=>add({cat:/payroll|violations|leaves/.test(q.agent)?"team":/journey|plans|reports|triage|routing|compensation|reception/.test(q.agent)?"kids":"ops",sev:q.sev||1,ic:AG(q.agent)[2],src:AG(q.agent)[1],t:q.title,d:q.detail||"",acts:[["نفّذ",`apApprove('${q.id}',true)`,1],["ارفض",`apApprove('${q.id}',false)`]]}));
      (state.plans||[]).filter(p=>p.status==="معلقة"&&brDeptOK(p.department)).forEach(p=>add({cat:"kids",sev:2,ic:"target",src:"الخطط العلاجية",t:`اعتماد خطة: ${p.patient}`,d:`${p.title} · ${date(p.date)}`,acts:[["اعتمد",`reviewPlan('${p.id}','approve')`,1],["رجّعها بملاحظات",`reviewPlan('${p.id}','return')`]]}));
      (typeof evEnsure==="function"?evEnsure():[]).filter(r=>r.status==="بانتظار المشرف"&&brDeptOK(r.dept)).forEach(r=>add({cat:"kids",sev:2,ic:"clipboardCheck",src:"تقييم من الآيباد",t:`تقييم ${r.patientName} بانتظار اعتمادك`,d:`${r.staffName||""} · ${(r.goals||[]).filter(g=>g.on).length} أهداف مقترحة`,acts:[["راجع واعتمد",`jrGo('${r.patientId}','plan')`,1]]}));
      state.patients.filter(p=>!p.archived&&(p.goals||[]).some(g=>g.status==="مقترح")&&!(typeof evEnsure==="function"&&evEnsure().some(r=>r.patientId===p.id&&r.status==="بانتظار المشرف"))).forEach(p=>{const n=p.goals.filter(g=>g.status==="مقترح").length;add({cat:"kids",sev:2,ic:"target",src:"الأهداف",t:`${n} أهداف مقترحة لـ ${p.name}`,d:"من دراسة الحالة / الذكاء الاصطناعي",acts:[["اعتمد الكل",`csApproveAll('${p.id}')`,1],["راجع",`jrGo('${p.id}','plan')`]]})});
      (state.progressReports||[]).filter(r=>r.reportType==="quarterly"&&!r.approvedBy).forEach(r=>add({cat:"kids",sev:1,ic:"star",src:"تقرير ٣ شهور",t:`اعتماد تقرير ٣ شهور: ${r.patientName}`,d:`${date(r.date)} · ${r.staffName||""}`,acts:[["راجع واعتمد",`jrQuarterView('${r.id}')`,1]]}));
      (state.smartIntakes||[]).filter(r=>r.submittedAt&&r.patientId&&!["approved","info","rejected"].includes(r.status)).forEach(r=>add({cat:"kids",sev:2,ic:"idea",src:"دراسة الحالة",t:`دراسة حالة جديدة: ${(r.fields&&r.fields.child)||""}`,d:"المسودة والأهداف جاهزين للمراجعة",acts:[["افتح وراجع",`setView('intakeAI')`,1]]}));
      if(typeof decisionsScopedToCurrent==="function")decisionsScopedToCurrent().filter(d=>d.status==="قيد المراجعة").forEach(d=>add({cat:"ops",sev:1,ic:"video",src:"قرارات الاجتماعات",t:d.text,d:`${d.ownerName||""}${d.dueDate?" · قبل "+date(d.dueDate):""}`,acts:[["اعتمد",`advanceDecision('${d.id}','معتمدة')`,1],["افتح",`setView('connect')`]]}));
      if(state.role==="management"||state.role==="reception"){const nb=(state.sessionBookings||[]).filter(b=>!b.seen&&b.status!=="ملغي");if(nb.length)add({cat:"family",sev:2,ic:"bell",src:"بوابة الأسرة",t:`${nb.length} حجز جديد من الأسر`,d:nb.slice(0,3).map(b=>b.childName||b.patientName||b.child||"").filter(Boolean).join("، "),acts:[["افتح المواعيد",`setView('schedule')`,1]]})}
      if(state.hr){const lv=(state.hr.leaves||[]).filter(l=>l.status==="مقدمة");if(lv.length&&state.role==="management")add({cat:"team",sev:1,ic:"schedule",src:"الإجازات",t:`${lv.length} طلب إجازة بانتظار`,d:lv.slice(0,3).map(l=>l.name||"").join("، "),acts:[["راجع",`brAgents('leaves')`,1]]});
        const vi=(state.hr.violations||[]).filter(v=>v.status==="مقترحة");if(vi.length&&state.role==="management")add({cat:"team",sev:1,ic:"shield",src:"المخالفات",t:`${vi.length} مخالفة مقترحة محتاجة قرار`,d:"المخالفة ما تتخصم غير بعد اعتمادك",acts:[["راجع",`brAgents('violations')`,1]]});
        const m=apToday().slice(0,7);const P=state.hr.payrolls&&state.hr.payrolls[m];if(P&&P.status==="مسودة"&&state.role==="management")add({cat:"team",sev:2,ic:"chart",src:"الرواتب",t:`اعتماد مسير ${m}`,d:`صافي ${(P.total||0).toLocaleString("en")} ريال`,acts:[["راجع واعتمد",`brAgents('payroll')`,1]]})}
      return out.sort((a,b)=>b.sev-a.sev);
    }
    // ---- ٣) رادار المخاطر: الذكاء يتوقع المشكلة قبل ما تحصل ----
    function brRisks(){
      apEnsure();const out=[];const day=apToday();const R=apEnsure().rules;const nx=awanNextAll();const add=(o)=>out.push(o);
      const gap=nx.filter(n=>/انقطاع/.test(n.text));if(gap.length)add({lvl:gap.some(n=>n.sup)?3:2,ic:"patients",t:"أطفال معرضين للانقطاع",n:gap.length,who:gap.slice(0,3).map(n=>n.name.split(" ").slice(0,2).join(" ")),why:"آخر جلسة من أكثر من أسبوعين وما فيه موعد جاي",act:["احجز لهم تلقائيًا","brAutoBook()"],go:`state_jrNoop();jrSet('jrFilter','all');setView('journey')`});
      const stuck=nx.filter(n=>/راجع الهدف/.test(n.text));if(stuck.length)add({lvl:2,ic:"target",t:"أهداف واقفة",n:stuck.length,who:stuck.slice(0,3).map(n=>n.name.split(" ").slice(0,2).join(" ")),why:"٣ جلسات ورا بعض «لم ينجح بعد» — محتاجة تعديل الخطة",act:["افتح أول حالة",stuck[0].go],go:`setView('journey')`});
      const weak=state.patients.filter(p=>!p.archived).map(p=>{const L=state.appointments.filter(a=>a.patient===p.name&&a.date<day&&a.date>=agDay(-30)&&!/تقييم/.test(a.service||""));const done=L.filter(a=>a.status==="مكتمل").length;return {p,n:L.length,pct:L.length?Math.round(done/L.length*100):100}}).filter(x=>x.n>=3&&x.pct<70);
      if(weak.length)add({lvl:2,ic:"heart",t:"التزام أسر ضعيف",n:weak.length,who:weak.slice(0,3).map(x=>`${x.p.name.split(" ")[0]} ${x.pct}%`),why:"حضور أقل من ٧٠٪ آخر ٣٠ يوم — احتمال انسحاب",act:["رسالة للأسر",`setView('communicationHub')`],go:`setView('journey')`});
      const T=agClin();const over=T.filter(s=>!agAbsent(s,day)&&agLoad(s,day).pct>=R.loadHigh);if(over.length)add({lvl:2,ic:"team",t:"أخصائيين فوق طاقتهم اليوم",n:over.length,who:over.slice(0,3).map(s=>`${s.name.replace(/^(أ\.|د\.)\s*/,"").split(" ")[0]} ${agLoad(s,day).pct}%`),why:`الحمل فوق ${R.loadHigh}% — خطر إرهاق وجودة أقل`,act:["وازن الجداول",`agCommand('وازن جداول الأخصائيين اليوم');brToast()`],go:`brAgents('sched')`});
      const abs=T.filter(s=>agAbsent(s,day)).map(s=>({s,n:state.appointments.filter(a=>a.clinician===s.name&&a.date===day&&a.status==="مجدول").length})).filter(x=>x.n);if(abs.length)add({lvl:3,ic:"idcard",t:"جلسات اليوم من غير أخصائي",n:abs.reduce((a,x)=>a+x.n,0),who:abs.slice(0,3).map(x=>`${x.s.name.replace(/^(أ\.|د\.)\s*/,"").split(" ")[0]} (${x.n})`),why:"الأخصائي غايب أو في إجازة",act:["وزّعها تلقائيًا",`agCommand('${abs[0].s.name.replace(/^(أ\.|د\.)\s*/,"").split(" ")[0]} غايب اليوم وزّع جلساته');brToast()`],go:`setView('deptPlan')`});
      const L=typeof jrList==="function"?jrList():[];const late=L.filter(J=>J.S.quarter.late);if(late.length)add({lvl:2,ic:"star",t:"تقارير ٣ شهور متأخرة",n:late.length,who:late.slice(0,3).map(J=>J.p.name.split(" ").slice(0,2).join(" ")),why:"الأسرة بانتظار تقرير الدورة",act:["افتح أول تقرير",`jrQuarterOpen('${late[0].p.id}')`],go:`state_jrNoop();jrSet('jrFilter','quarter');setView('journey')`});
      const noC=L.filter(J=>J.S.consent.status!=="done"&&J.S.book.status==="done");if(noC.length)add({lvl:noC.length>3?3:2,ic:"shield",t:"جلسات من غير موافقة علاج",n:noC.length,who:noC.slice(0,3).map(J=>J.p.name.split(" ").slice(0,2).join(" ")),why:"مخالفة امتثال لو جه تفتيش",act:["أرسل للأسر يوقّعوا",`brAgents('cockpit')`],go:`state_jrNoop();jrSet('jrFilter','consent');setView('journey')`});
      try{if(state.role==="management")gdRisks().filter(r=>r.sev>=3).slice(0,2).forEach(r=>add({lvl:3,ic:"shield",t:r.t,n:null,who:[r.impact],why:r.fix,act:["افتح",String(r.go||"").replace(/apTab\(/g,"brAgents(")],go:String(r.go||"").replace(/apTab\(/g,"brAgents(")}))}catch(e){}
      return out.sort((a,b)=>b.lvl-a.lvl);
    }
    function brAutoBook(){const L=awanNextAll().filter(n=>/انقطاع/.test(n.text));let k=0;L.forEach(n=>{const before=state.appointments.length;try{APX.autoBook(n.pid)}catch(e){}if(state.appointments.length>before)k++});audit(`حجز تلقائي لـ ${k} طفل منقطع`,"");persist();render();notify(k?`انحجز لـ ${k} طفل وابتعتت رسالة للأسرة`:"ما قدرت ألاقي أخصائي سابق للأطفال هذول — احجز يدوي من المواعيد")}
    function brToast(){notify("أوان يشتغل على الأمر — تابعه في «أوامرك»")}
    // ---- ٤) الملخص الذكي لليوم: بالقواعد، أو بصياغة OpenAI لو متفعّل ----
    function brFacts(){apEnsure();
      const day=apToday();const ap=state.appointments.filter(a=>a.date===day&&a.status!=="ملغي");const done=ap.filter(a=>a.status==="مكتمل").length;
      const recs=ipRecords();const live=recs.filter(r=>r.status==="session").length;const T=agClin();const pres=T.filter(s=>!agAbsent(s,day)).length;
      const kids=state.patients.filter(p=>!p.archived).length;const L=jrList();const dq=L.filter(J=>J.S.quarter.due).length;
      return {day,ap:ap.length,done,live,T:T.length,pres,kids,dec:brDecisions().length,risks:brRisks(),dq,health:apHealth(),mode:apEnsure().mode};
    }
    function brBriefLocal(F){
      const top=F.risks[0];const parts=[];
      parts.push(`اليوم عندنا ${F.ap} جلسة${F.ap?` — خلص منهم ${F.done}${F.live?` و${F.live} شغالين الحين`:""}`:""}، والفريق حاضر ${F.pres} من ${F.T} أخصائي.`);
      parts.push(F.dec?`في ${F.dec} قرار مستنيك في صندوق القرارات${F.dq?`، و${F.dq} تقرير ٣ شهور مستحق`:""}.`:`ما فيه قرارات مستنياك — الإدارة الآلية ماشية لوحدها${F.dq?`، بس في ${F.dq} تقرير ٣ شهور مستحق`:""}.`);
      if(top)parts.push(`أهم شي تاخذ بالك منها: ${top.t}${top.n!=null?` (${top.n})`:""} — ${top.why}.`);
      parts.push(F.health.score>=80?`صحة المركز ${F.health.score}٪ — يوم مستقر.`:`صحة المركز ${F.health.score}٪ — أضعف نقطة: ${F.health.parts.slice().sort((a,b)=>a[1]-b[1])[0][0]} (${F.health.parts.slice().sort((a,b)=>a[1]-b[1])[0][1]}٪).`);
      return parts.join(" ");
    }
    async function brBriefAI(){
      if(!aiReady()){notify("فعّل ربط OpenAI من «الإدارة الآلية ← OpenAI» الأول");return}
      const F=brFacts();state.brBusy=true;render();
      try{
        const data={date:F.day,sessions_today:F.ap,done:F.done,live:F.live,staff_present:`${F.pres}/${F.T}`,active_children:F.kids,decisions_waiting:F.dec,quarterly_due:F.dq,health:F.health,risks:F.risks.map(r=>({title:r.t,count:r.n,why:r.why}))};
        const out=await openaiJSON("أنت مستشار تشغيل لمدير مركز تأهيل أطفال في السعودية. اكتب ملخص صباحي قصير (٣–٤ جمل) باللهجة المصرية المهذبة للمدير، وبعده ٣ أولويات مرتبة ينفذها اليوم. من غير أي أسماء أطفال ومن غير تشخيص. رجّع JSON: {\"brief\":\"...\",\"priorities\":[\"...\",\"...\",\"...\"]}",JSON.stringify(data));
        state.brAI={at:Date.now(),text:String(out.brief||"").slice(0,700),pri:(out.priorities||[]).slice(0,3).map(x=>String(x).slice(0,160))};audit("ملخص اليوم بالذكاء الاصطناعي","");
      }catch(err){notify("ما قدرت أوصل لـ OpenAI: "+String(err.message||err).slice(0,80))}
      state.brBusy=false;persist();render();
    }
    function brCmd(e){e.preventDefault();const v=e.target.cmd.value;e.target.cmd.value="";if(String(v).trim()){agCommand(v)}}
    function brFilter(k){state.brCat=k;render()}
    function brWorkflow(){
      const all=jrList();
      const pendingReferrals=(state.referrals||[]).filter(r=>r.status==="جديدة"||r.status==="قيد الفرز").length;
      const dueReports=all.filter(J=>J.S.quarter.due).length;
      const pendingDecisions=decisionsScopedToCurrent().filter(d=>d.status==="قيد المراجعة").length;
      const upcoming=(state.appointments||[]).filter(a=>a.status!=="ملغي"&&a.status!=="مكتمل"&&a.date>=apToday()&&a.date<=agDay(7)).length;
      const flow=[
        ["referrals","الاستقبال","إحالات جديدة أو قيد الفرز",pendingReferrals,"referrals"],
        ["patients","التقييم والخطة","ملفات الأطفال على مسار الرعاية",all.length,"journey"],
        ["schedule","المواعيد والجلسات","مواعيد قادمة",upcoming,"schedule"],
        ["chart","التقارير والمتابعة","تقارير ربع سنوية مستحقة",dueReports,"journey"],
        ["video","الاجتماعات والتوصيات","قرارات بانتظار المراجعة",pendingDecisions,"connect"]
      ].filter(x=>roles[state.role].nav.includes(x[4]));
      return `<section class="card" style="margin:0 0 16px"><div class="card-head"><h2>${ic("pulse",18)} مسار العمل — من الاستقبال إلى التقارير والتوصيات</h2></div><p class="muted br-sub">الأرقام تقرأ من السجلات الحالية؛ افتح المرحلة لمتابعتها دون إنشاء بيانات مكررة.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:9px">${flow.map(([icon,label,desc,count,view])=>`<button class="box-card" style="text-align:start;cursor:pointer;display:flex;flex-direction:column;gap:5px" onclick="${view==="journey"&&label==="التقارير والمتابعة"?"state.jrFilter='quarter';":""}setView('${view}')"><span class="muted">${ic(icon,15)} ${esc(label)}</span><b style="font-size:22px">${count}</b><small class="muted">${esc(desc)}</small></button>`).join("")}</div></section>`;
    }
    // ---- ٥) مركز القيادة ----
    function brainView(){
      const F=brFacts();const A=apEnsure();const me=brMe();const hr=new Date().getHours();
      const hello=(hr<12?"صباح الخير":"مساء الخير")+(me?"، "+me.name.split(" ").slice(0,2).join(" "):"");
      const ai=state.brAI&&localDateOf(new Date(state.brAI.at))===F.day?state.brAI:null;
      const D=brDecisions();const cat=state.brCat||"all";const DC=D.filter(x=>cat==="all"||x.cat===cat);
      const cats=[["all","الكل"],["kids","الأطفال"],["team","الفريق"],["family","الأسرة"],["ops","التشغيل"]].filter(([k])=>k==="all"||D.some(x=>x.cat===k));
      const todayLog=A.log.filter(l=>localDateOf(new Date(l.at))===F.day);
      const sel=state.role==="management";
      const tiles=[
        ["team","team","الفريق الحاضر",`${F.pres}/${F.T}`,`${F.T-F.pres?F.T-F.pres+" غايب":"الكل موجود"}`,"attendance"],
        ["family","heart","الأسر",pendingCommCount()+((state.role==="management"||state.role==="reception")?newBookingsCount():0),"رسائل وحجوزات جديدة","communicationHub"],
        ["gov","shield","الامتثال",jrList().filter(J=>J.S.consent.status!=="done").length,"ملف من غير موافقة علاج","journey"]
      ].filter(Boolean).filter(x=>roles[state.role].nav.includes(x[5]));
      return `<div class="br">
        <section class="br-hero"><div class="br-aurora" aria-hidden="true"><i></i><i></i></div>
          <div class="br-hero-m"><div class="br-kick"><span class="mx-dot"></span> عقل أوان · ${new Date().toLocaleDateString("ar-SA-u-ca-gregory",{weekday:"long",day:"numeric",month:"long"})}</div>
            <h1>${esc(hello)}</h1>
            <p class="br-brief">${esc(ai?ai.text:brBriefLocal(F))}</p>
            ${ai&&ai.pri.length?`<ol class="br-pri">${ai.pri.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}
            <div class="br-src">${ai?`<span class="br-tag ai">✨ صاغه OpenAI ${cmTime(ai.at)}</span>`:`<span class="br-tag">ملخص تلقائي من بيانات المركز</span>`}<button class="br-ghost" onclick="brBriefAI()" ${state.brBusy?"disabled":""}>${state.brBusy?"يكتب…":aiReady()?"✨ صياغة بالذكاء الاصطناعي":"✨ فعّل OpenAI للصياغة الذكية"}</button></div>
          </div>
          <div class="br-hero-s"><div class="br-ring">${apRing(F.health.score)}<div><b>${F.health.score}</b><small>صحة المركز</small></div></div>
            <div class="br-parts">${F.health.parts.map(p=>`<div><small>${esc(p[0])}</small><i><s style="width:${p[1]}%"></s></i><b>${p[1]}%</b></div>`).join("")}</div>
            ${sel?`<div class="br-mode"><small>الإدارة الآلية</small><div>${[["off","إيقاف"],["assist","تقترح"],["auto","تنفّذ"]].map(([k,l])=>`<button class="${A.mode===k?"on m-"+k:""}" onclick="apMode('${k}')">${l}</button>`).join("")}</div></div>`:""}</div>
        </section>
        <form class="br-cmd" onsubmit="brCmd(event)"><span class="br-cmd-ic">${ic("idea",18)}</span><input class="input" name="cmd" autocomplete="off" placeholder="اؤمر أوان… مثال: ريم غايبة بكرة وزّع جلساتها · احجز لخالد تخاطب الأحد الساعة 10 · عوّض الجلسات اللي فاتت"><button class="btn btn-primary">${ic("pulse",14)} نفّذ</button></form>
        <div class="br-chips">${["أدِر المركز كله الحين","وازن جداول الأخصائيين اليوم","عوّض كل الجلسات اللي فاتت","افرز الإحالات الجديدة وحوّلها"].map(x=>`<button type="button" onclick="agChip('${x}')">${esc(x)}</button>`).join("")}<span class="br-chips-n">${aiReady()?"يفهم أي صياغة (OpenAI)":"بالقواعد المحلية — OpenAI يوسّع الفهم"}</span></div>
        ${A.plans.filter(p=>p.status!=="dropped").slice(0,2).length?`<section class="br-plans"><div class="br-sh"><h2>${ic("chat",16)} أوامرك</h2><button class="br-link" onclick="brAgents('hq')">كل الأوامر</button></div>${A.plans.filter(p=>p.status!=="dropped").slice(0,2).map(agPlanCard).join("")}</section>`:""}
        <section class="br-tiles">${tiles.map(([k,icn,l,v,s,go])=>`<button class="br-tile t-${k}" onclick="setView('${go}')"><span class="br-tile-ic">${ic(icn,18)}</span><b>${esc(String(v))}</b><span>${esc(l)}</span><small>${esc(s)}</small></button>`).join("")}</section>
        ${brWorkflow()}
        <div class="br-grid">
          <section class="card br-dec"><div class="card-head"><h2>${ic("check",18)} صندوق القرارات <span class="br-count">${D.length}</span></h2>${A.queue.filter(q=>!q.forced&&brDeptOK(q.dept)).length>1?`<button class="btn btn-outline" style="font-size:12px;padding:7px 12px" onclick="apApproveAll()">نفّذ كل اقتراحات الوكلاء</button>`:""}</div>
            <p class="muted br-sub">كل شي بانتظار قرار من كل التابات — الخطط، التقييمات، الأهداف، الوكلاء، الاجتماعات، الحجوزات، الإجازات والرواتب — في مكان واحد.</p>
            ${cats.length>2?`<div class="br-cats">${cats.map(([k,l])=>`<button class="${cat===k?"on":""}" onclick="brFilter('${k}')">${l} <em>${k==="all"?D.length:D.filter(x=>x.cat===k).length}</em></button>`).join("")}</div>`:""}
            ${DC.length?`<div class="br-dl">${DC.slice(0,state.brAll?99:8).map(x=>`<div class="br-di s${x.sev}"><span class="br-di-ic">${ic(x.ic,16)}</span><div class="br-di-b"><small>${esc(x.src)}</small><b>${esc(x.t)}</b>${x.d?`<span>${esc(x.d)}</span>`:""}</div><div class="br-di-a">${x.acts.map(([l,run,p])=>`<button class="btn ${p?"btn-primary":"btn-outline"}" onclick="${run}">${esc(l)}</button>`).join("")}</div></div>`).join("")}</div>${DC.length>8&&!state.brAll?`<button class="br-more" onclick="state_jrNoop();brShowAll()">عرض الكل (${DC.length})</button>`:""}`:`<div class="br-empty">${ic("check",22)}<b>ما فيه قرارات مستنياك</b><span>أي شي جديدة من أي تاب بتظهر هنا لوحدها.</span></div>`}
          </section>
          <section class="card br-radar"><div class="card-head"><h2>${ic("pulse",18)} رادار المخاطر</h2><span class="muted" style="font-size:11px">توقّع قبل ما المشكلة تحصل</span></div>
            ${F.risks.length?F.risks.slice(0,7).map(r=>`<div class="br-r l${r.lvl}"><div class="br-r-h"><span class="br-r-ic">${ic(r.ic,15)}</span><b>${esc(r.t)}</b>${r.n!=null?`<em>${r.n}</em>`:""}</div><small>${esc(r.why)}</small>${r.who&&r.who.length?`<div class="br-r-w">${r.who.map(w=>`<span>${esc(w)}</span>`).join("")}</div>`:""}<div class="br-r-a">${r.act?`<button class="btn btn-primary" onclick="${r.act[1]}">${esc(r.act[0])}</button>`:""}<button class="btn btn-outline" onclick="${r.go}">التفاصيل</button></div></div>`).join(""):`<div class="br-empty">${ic("shield",22)}<b>ما فيه مخاطر واضحة</b><span>المركز ماشي في السليم.</span></div>`}
          </section>
        </div>
        <section class="card br-agents"><div class="card-head"><h2>${ic("tablet",18)} وكلاء أوان الشغالين</h2><button class="br-link" onclick="brAgents('cockpit')">إعدادات الوكلاء</button></div>
          <div class="br-ag">${AP_AGENTS.slice(0,state.brAgAll?99:10).map(([k,l,icn,d])=>{const m=A.agents[k]||"auto";const n=todayLog.filter(x=>x.agent===k&&x.done).length;const q=A.queue.filter(x=>x.agent===k).length;return `<button class="br-a m-${A.mode==="off"?"off":m}" onclick="brAgents('cockpit')" title="${esc(d)}"><span>${ic(icn,15)}</span><b>${esc(l)}</b><small>${A.mode==="off"?"متوقف":m==="auto"?"ينفذ":"يقترح"} · ${n} اليوم${q?` · ${q} بانتظار`:""}</small></button>`}).join("")}</div>${AP_AGENTS.length>10&&!state.brAgAll?`<button class="br-more" onclick="brAgAllShow()">كل الوكلاء (${AP_AGENTS.length})</button>`:""}
          ${todayLog.length?`<div class="br-log"><b>آخر اللي انعمل لوحده اليوم</b>${todayLog.slice(0,5).map(l=>`<div><span>${cmTime(l.at)}</span>${esc(l.title)}</div>`).join("")}</div>`:""}
        </section>
      </div>`;
    }
    function brAgAllShow(){state.brAgAll=true;render()}
    function brShowAll(){state.brAll=true;render()}
    DEVICE_ONLY.add("brBusy");DEVICE_ONLY.add("brAll");DEVICE_ONLY.add("brAgAll");
    Object.assign(window,{brAutoBook,brAgAllShow,agCommand,hubGo,brAgents,brBriefAI,brCmd,brFilter,brShowAll,brToast,agChip,apMode,apApprove,apApproveAll,reviewPlan,csApproveAll,advanceDecision,jrQuarterView,jrQuarterOpen});
    render();
