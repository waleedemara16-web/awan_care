"use strict";
// أوان — الجزء 15 من 16: 15-staff-roles-governance-qr
// كل ملفات js/ هذي تشتغل كأنها ملف واحد بالترتيب — ما تغيّر ترتيبها في index.html
    // =================== كود موحد لأول دخول + كل موظف يغيّر كوده براحته ===================
    // الكود الموحد ما يتحط في s.code (عشان الأكواد الشخصية تفضل فريدة وتعرّف الشخص)؛
    // الموظف اللي للحين ما سوّى كوده (codeTemp) يدخل بالكود الموحد ويختار اسمه، وبعدين يعمل كوده الخاص وقت ما يحب.
    function uniCode(){state.center=state.center||{};if(!state.center.unifiedCode)state.center.unifiedCode="1234";return String(state.center.unifiedCode)}
    (function(){try{if(!state.unifiedCodeV1){uniCode();state.staff.forEach(s=>{s.codeTemp=true});state.unifiedCodeV1=true;persist()}}catch(_e){}})();
    function codeLabel(s,self){if(!s)return "—";if(s.codeTemp)return "الكود الموحد "+uniCode();return self?String(s.code||"—"):"كود خاص ✓"}
    function codeOk(v){return /^[0-9A-Za-z؀-ۿ]{4,10}$/.test(v)}
    function codeSet(sid,nv,cf){const s=personById(sid);if(!s)return "";nv=(nv||"").trim();cf=(cf||"").trim();
      if(!codeOk(nv))return "الكود لازم يكون من 4 لـ 10 حروف أو أرقام";
      if(nv!==cf)return "الكودين مو زي بعض";
      if(nv===uniCode())return "هذا الكود الموحد — اختار كود خاص بيك";
      if(state.staff.some(x=>x.id!==sid&&String(x.code||"").toLowerCase()===nv.toLowerCase()))return "الكود هذا مستخدم — اختار كود ثاني";
      s.code=nv;s.codeTemp=false;s.codeSetAt=new Date().toISOString();audit("الموظف غيّر كود الدخول حقه",s.name);persist();return ""}
    const CODEUI={later:{},err:"",pick:null};
    function codeCardHtml(s,where){
      const temp=!!s.codeTemp;
      return `<section class="card code-card ${temp?"temp":""}"><div class="card-head"><h2>${ic("lock",18)} ${temp?"أنت داخل بالكود الموحد":"كود الدخول حقك"}</h2>${temp&&where==="ipad"?`<button class="btn btn-outline" onclick="codeLater('${s.id}')">بعدين</button>`:""}</div>
        <p class="muted" style="margin-top:0">${temp?`الكود الموحد (${esc(uniCode())}) مؤقت للدخول الأول. اعمل كودك الخاص — هو اللي بتدخل بيه على الآيباد والمنصة وكيوسك الحضور.`:"تقدر تغيّره في أي وقت. محد غيرك يشوفه."}</p>
        <form class="code-form" onsubmit="codeSubmit(event,'${s.id}')" autocomplete="off"><input class="input" name="n" type="password" inputmode="numeric" placeholder="الكود الجديد (4 أرقام أو أكثر)" required><input class="input" name="c" type="password" inputmode="numeric" placeholder="اكتبه ثاني للتأكيد" required><button class="btn btn-primary">${temp?"اعمل كودي":"غيّر الكود"}</button></form>
        ${CODEUI.err?`<p class="sp-err" style="margin:8px 0 0">${esc(CODEUI.err)}</p>`:""}</section>`;
    }
    function codeSubmit(e,sid){e.preventDefault();const me=state.sipadMode&&state.sipad?sipadStaff():getCurrentPerson();if(!me||me.id!==sid){notify("كل واحد يغيّر كوده بنفسه بس");return}
      const fd=new FormData(e.target);const err=codeSet(sid,fd.get("n"),fd.get("c"));CODEUI.err=err;if(err){render();return}notify("✓ كودك الجديد انحفظ — من هنا ورايح ادخل بيه");render()}
    function codeLater(sid){CODEUI.later[sid]=1;CODEUI.err="";render()}
    function codeReset(sid){const s=personById(sid);if(!s||!ipCanCtl(s))return ipDenied();s.codeTemp=true;audit("إرجاع كود الموظف للكود الموحد",s.name);persist();notify(`${s.name} يقدر يدخل الحين بالكود الموحد ${uniCode()} ويعمل كود جديد`);render()}
    function uniCodeSet(e){e.preventDefault();if(state.role!=="management")return notify("الكود الموحد تغيّره الإدارة بس");const v=(new FormData(e.target).get("u")||"").trim();if(!codeOk(v))return notify("الكود لازم يكون من 4 لـ 10 حروف أو أرقام");if(state.staff.some(x=>String(x.code||"")===v))return notify("الكود هذا مستخدم كود خاص لموظف");state.center.unifiedCode=v;audit("تغيير الكود الموحد","");persist();notify("الكود الموحد صار "+v);render()}
    // الآيباد: الكود الموحد مقبول للي للحين ما سوّوا كودهم
    const _cdLogin=sipadLogin;sipadLogin=function(e){const s=personById(state.sipadPick);const inp=e.target.querySelector('[name="code"]');const v=(inp&&inp.value||"").trim();if(s&&s.codeTemp&&v===uniCode()&&inp)inp.value=s.code||"";return _cdLogin(e)};
    const _cdHome=sipadHome;sipadHome=function(s){const h=_cdHome(s);if(!s.codeTemp||CODEUI.later[s.id]||!state.sipadMode)return h;const k=h.indexOf("</section>");return k>=0?h.slice(0,k+10)+codeCardHtml(s,"ipad")+h.slice(k+10):codeCardHtml(s,"ipad")+h};
    const _cdLock=sipadLockScreen;sipadLockScreen=function(){const h=_cdLock();return h.replace("نفس الكود اللي تسجلي بيه حضورك على كيوسك الباب.",`كودك الخاص، أو الكود الموحد <b>${esc(uniCode())}</b> لو للحين ما سوّيت كودك.`)};
    // صفحتي: كارت الكود · صفحة الموظف للمشرف/الإدارة: زرار إرجاع للكود الموحد
    const _cdPage=staffPageHtml;staffPageHtml=function(s,self){let h=_cdPage(s,self);if(!s)return h;
      if(self){const k=h.indexOf('<div class="pg-side">');if(k>=0)h=h.slice(0,k+21)+codeCardHtml(s,"page")+h.slice(k+21)}
      else if(ipCanCtl(s)){h=h.replace('<div class="pg-acts">',`<div class="pg-acts"><button class="btn btn-outline" onclick="codeReset('${s.id}')">${ic("idcard",14)} ${s.codeTemp?"للحين على الكود الموحد":"رجّع كوده للكود الموحد"}</button>`)}
      return h};
    // اختيار الاسم لما حد يكتب الكود الموحد في المنصة أو كيوسك الحضور
    function codePickOpen(mode){const L=state.staff.filter(s=>s.codeTemp);if(!L.length){notify("كل الموظفين عاملين أكوادهم الخاصة — الكود الموحد مو شغال");return}
      let ov=document.getElementById("code-pick");if(!ov){ov=document.createElement("div");ov.id="code-pick";ov.className="code-pick";document.body.appendChild(ov)}
      ov.innerHTML=`<div class="code-pick-box"><h2>${mode==="kiosk"?"تسجيل حضور بالكود الموحد":"دخول بالكود الموحد"}</h2><p class="muted">اختار اسمك. بعد الدخول تقدر تعمل كودك الخاص.</p>
        <div class="sp-people">${L.map(x=>`<button class="sp-person" onclick="codePickGo('${mode}','${x.id}')"><span class="sp-av">${esc((x.name.replace(/^(أ\.|د\.)\s*/,"")||"?").charAt(0))}</span><b>${esc(x.name)}</b><small>${esc(x.role||"")}</small></button>`).join("")}</div>
        <button class="btn btn-outline" style="margin-top:14px" onclick="codePickClose()">إلغاء</button></div>`}
    function codePickClose(){const ov=document.getElementById("code-pick");if(ov)ov.remove()}
    function codePickGo(mode,id){const s=personById(id);codePickClose();if(!s||!s.codeTemp)return;
      if(mode==="kiosk"){const nowIn=staffAttendanceMark(s,"كيوسك (الكود الموحد)");state.kioskMsg={ok:true,text:(nowIn?"أهلًا ":"مع السلامة ")+s.name+" — انسجل "+(nowIn?"حضورك":"انصرافك")+" الساعة "+localTimeOf(new Date())+" · اعمل كودك الخاص من «آيبادي»"};persist();render();return}
      const f=document.createElement("form");f.innerHTML=`<input name="code">`;f.querySelector("input").value=s.code||"";_cdStaffLogin({preventDefault(){},target:f});if(state.view!=="myIpad"&&roles[state.role]&&roles[state.role].nav.includes("myIpad")){state.view="myIpad";render()}}
    const _cdStaffLogin=staffCodeLogin;staffCodeLogin=function(e){const v=(new FormData(e.target).get("code")||"").trim();if(v&&v===uniCode()){e.preventDefault&&e.preventDefault();if(typeof closeModal==="function")try{closeModal()}catch(_e){}codePickOpen("login");return}return _cdStaffLogin(e)};
    const _cdKiosk=kioskSubmit;kioskSubmit=function(e){const inp=e.target.querySelector("input");const v=(inp&&inp.value||"").trim();if(v&&v===uniCode()){e.preventDefault();inp.value="";codePickOpen("kiosk");return}return _cdKiosk(e)};
    // كارت الكود الموحد في إدارة الأجهزة
    const _cdDevs=devicesView;devicesView=function(){const h=_cdDevs();const temp=state.staff.filter(s=>s.codeTemp);
      const card=`<section class="card code-uni"><div><h2>${ic("lock",18)} الكود الموحد للدخول الأول: <b class="code-big">${esc(uniCode())}</b></h2><p class="muted" style="margin:4px 0 0">كل موظف يدخل بيه أول مرة (على الآيباد يختار اسمه ويكتبه) وبعدين يعمل كوده الخاص من آيباده أو من «آيبادي». ${temp.length?`<b>${temp.length}</b> من ${state.staff.length} للحين على الكود الموحد.`:"كل الموظفين عملوا أكوادهم ✓"}</p></div>${state.role==="management"?`<form class="code-form" onsubmit="uniCodeSet(event)"><input class="input" name="u" placeholder="كود موحد جديد" inputmode="numeric"><button class="btn btn-outline">تغيير</button></form>`:""}</section>`;
      const k=h.indexOf('<div class="ip-seg">');return k>=0?h.slice(0,k)+card+h.slice(k):card+h};
    Object.assign(window,{codeSubmit,codeLater,codeReset,uniCodeSet,codePickGo,codePickClose,sipadLogin,staffCodeLogin,kioskSubmit});

    // =================== تنظيم أدوار الموظفين + ملفات كل قسم + آيباد حي في صفحة الموظف + يوم شغل حقيقي ===================
    // 1) القوائم حسب الدور
    try{
      roles.staff.nav=["myIpad","schedule","patients","connect"];
      roles.supervisor.nav=roles.supervisor.nav.filter(k=>!["ebnak","claims","library"].includes(k));
      if(roles.reception)roles.reception.nav=roles.reception.nav.filter(k=>k!=="departments"&&k!=="ebnak");
    }catch(_e){}
    const RL_ALLOW={ebnak:["management"],departments:["management","supervisor"],assessments:["management","supervisor","reception"],communicationHub:["management","supervisor","reception"]};
    function rlDenied(view){const a=RL_ALLOW[view];return a&&!a.includes(state.role)}
    const _rlHome=roleHome;roleHome=function(){if(state.role==="staff"){state.view="myIpad";return myIpadView()}return _rlHome()};
    const _rlEb=ebView;ebView=function(){if(rlDenied("ebnak")){state.view=(roles[state.role]||{nav:["patients"]}).nav[0];return roleHome()}return _rlEb()};
    const _rlDep=departments;departments=function(){if(rlDenied("departments")){state.view=(roles[state.role]||{nav:["patients"]}).nav[0];return roleHome()}return _rlDep()};
    const _rlAs=asView;asView=function(){if(rlDenied("assessments")){state.view=(roles[state.role]||{nav:["patients"]}).nav[0];return roleHome()}return _rlAs()};
    // أي شاشة مو في قايمة الموظف ترجّعه لآيباده
    const _rlRender=render;render=function(){if(state.role==="staff"&&!state.sipadMode&&state.view==="communicationHub")state.view="connect";if(state.role==="staff"&&!state.sipadMode&&state.view!=="public"&&state.view!=="meetingRoom"&&state.view!=="patient-detail"&&state.view!=="staffPage"&&!roles.staff.nav.includes(state.view))state.view="myIpad";return _rlRender.apply(this,arguments)};

    // 2) ملفات كل قسم
    function ptDeptsOf(p){const set=new Set();if(!p)return set;if(p.dept)set.add(p.dept);(p.assignedPrograms||[]).forEach(a=>a.department&&set.add(a.department));(p.goals||[]).forEach(g=>g.dept&&g.status!=="مرفوض"&&set.add(g.dept));
      state.appointments.forEach(a=>{if(a.patient===p.name&&a.status!=="ملغي"){const s=state.staff.find(x=>x.name===a.clinician);if(s&&s.department)set.add(s.department)}});(state.newEvals||[]).forEach(r=>{if(r.patientId===p.id&&r.dept)set.add(r.dept)});return set}
    function ptScope(){if(state.role==="management"||state.role==="reception")return null;const me=getCurrentPerson();if(!me)return state.role==="staff"?{dept:"__none",me:null}:null;return me.department?{dept:me.department,me}:null}
    function ptVisible(p,sc){sc=sc===undefined?ptScope():sc;if(!sc)return true;if(sc.me&&state.appointments.some(a=>a.patient===p.name&&a.clinician===sc.me.name))return true;return ptDeptsOf(p).has(sc.dept)}
    function ptScoped(fn){return function(){const sc=ptScope();if(!sc)return fn.apply(this,arguments);const all=state.patients;state.patients=all.filter(p=>ptVisible(p,sc));try{return fn.apply(this,arguments)}finally{state.patients=all}}}
    const _ptsV=patients;patients=function(){const sc=ptScope();const h=ptScoped(_ptsV)();if(!sc)return h;const dn=sc.dept==="__none"?"":deptName(sc.dept);
      return (dn?`<div class="pt-scope">${ic("departments",16)} ملفات <b>${esc(dn)}</b> بس — كل قسم شايف ملفاته.</div>`:`<div class="pt-scope">سجّل دخولك بكودك عشان تشوف ملفات قسمك.</div>`)+h};
    ptPaint=ptScoped(ptPaint);
    const _ptDet=patientDetail;patientDetail=function(id){const p=state.patients.find(x=>x.id===id);if(p&&!ptVisible(p))return head("الملفات","الملف هذا مو من قسمك","كل قسم يشوف ملفات أطفاله بس.","")+`<button class="btn btn-outline" onclick="setView('patients')">رجوع لملفات قسمي</button>`;return _ptDet(id)};

    // 3) يوم شغل حقيقي: أطفال لكل قسم بأهداف معتمدة + جدول اليوم لكل أخصائي
    const LV_GOALS={
      speech:["يطلب 10 أشياء مفضلة بكلمة واحدة","ينفذ أمرًا من خطوتين في 4 من 5 فرص","يسمّي 20 صورة لأشياء مألوفة","ينطق صوت /س/ في بداية الكلمة بدقة 80%","يكوّن جملة من 3 كلمات لوصف صورة"],
      aba:["يجلس على الطاولة لمهمة منظمة 5 دقائق","يستجيب لاسمه بالنظر في 4 من 5 فرص","يقلد 10 حركات كبيرة عند النمذجة","يطلب الاستراحة بكارت بدل السلوك المعيق","يطابق 10 صور متطابقة"],
      ot:["يمسك القلم بمسكة ثلاثية لنسخ خطوط","يقص على خط مستقيم 10 سم","يتحمل الأرجوحة 3 دقائق بدون انسحاب","يزرر 3 أزرار كبيرة باستقلالية","يركّب بازل من 6 قطع"],
      skills:["يغسل يديه باستقلالية بخطوات صحيحة","يلبس الحذاء باستقلالية","يرتب أدواته بعد النشاط","يأكل بالملعقة دون انسكاب"],
      inclusion:["يقرأ كلمات من 3 حروف بدقة 80%","يكتب اسمه من الذاكرة","يجمع أعدادًا ضمن 10","يرفع يده قبل الكلام في الحصة"],
      psych:["يسمّي 4 مشاعر من الصور","يستخدم التنفس العميق عند الغضب","يتبادل الحديث مع زميل 3 دورات"],
      vocational:["ينجز مهمة فرز من 20 قطعة","يلتزم بجدول مهام مصوّر 15 دقيقة","يدفع ثمن شراء بسيط بالنقود"],
      classrooms:["يجلس في الحلقة 10 دقائق","يتبع روتين الصباح المصوّر"]};
    const LV_NEED={speech:"تأخر لغوي",aba:"اضطراب طيف التوحد",ot:"صعوبات حسية حركية",skills:"احتياج لمهارات الاستقلالية",inclusion:"صعوبات تعلم",psych:"صعوبات انفعالية وانتباه",vocational:"تأهيل مهني",classrooms:"دعم صفي"};
    const LV_KIDS=["ريان عبدالله الزهراني","جود فهد الشهري","سلمان خالد العتيبي","لين محمد الغامدي","عبدالرحمن سعد الحربي","تالا ماجد القحطاني","يزن علي الدوسري","رهف ناصر المالكي","مهند سامي العمري","غلا تركي السبيعي","فيصل حمد الشمري","ليان عمر الزهراني","سعد بندر المطيري","جنى أحمد العنزي","حمزة يوسف البقمي","دانة صالح الجهني","عمر وليد الحارثي","ميار خالد الرشيدي","تميم سلطان القرني","شهد ماجد العسيري","نواف فهد الشمراني","ريما إبراهيم السهلي","زياد مشعل الحربي","أسيل عادل الغامدي","إياد حسن العتيبي","سارا نايف القحطاني","معاذ رائد الدوسري","لمى هشام المطيري","بدر سعيد الزهراني","هيا فارس الشهري","ركان عبدالعزيز العنزي","وتين مازن الحربي"];
    function lvIsDemo(){return state.center&&state.center.name==="مركز الرعاية النموذجي"&&state.demoAuto!==false}
    function lvGoalsFor(p,dep){const bank=LV_GOALS[dep]||LV_GOALS.speech;const g=goalsOf(p);if(g.some(x=>x.status==="معتمد"&&x.dept===dep))return;
      const off=Math.abs([...p.name].reduce((a,c)=>a+c.charCodeAt(0),0))%bank.length;[0,1,2].forEach(k=>{const t=bank[(off+k)%bank.length];if(!g.some(x=>x.text===t))g.push({id:"g-lv-"+p.id+"-"+k,text:t,dept:dep,domain:deptName(dep),source:"الخطة المعتمدة",status:"معتمد",approvedBy:(agSup(dep)||{}).name||"المشرف",approvedAt:new Date().toISOString()})});
      if(!p.goal||/يُحدَّد|يحدد/.test(p.goal))p.goal=g.find(x=>x.status==="معتمد").text}
    function lvSeed(){
      if(!lvIsDemo())return;const today=localDateOf(new Date());state.demoDays=state.demoDays||{};let ch=0;
      // كل طفل موجود ياخذ قسم وأهداف معتمدة
      state.patients.filter(p=>!p.archived).forEach(p=>{const ds=[...ptDeptsOf(p)];if(!p.dept){p.dept=ds[0]||(/توحد/.test(p.need||"")?"aba":/طبيعي|حرك|وظيفي/.test(p.program||"")?"ot":"speech");ch++}lvGoalsFor(p,p.dept)});
      // كل قسم فيه أخصائيين لازم يصير فيه أطفال
      if(!state.lvKids){let ki=0;state.departments.forEach(d=>{const clin=agClin(d.id).filter(s=>s.roleCategory==="staff");if(!clin.length)return;const have=state.patients.filter(p=>!p.archived&&p.dept===d.id).length;
        for(let i=have;i<Math.min(8,clin.length*3)&&ki<LV_KIDS.length;i++){const nm=LV_KIDS[ki++];if(state.patients.some(p=>p.name===nm))continue;const num=1000+state.patients.length+1;
          const p={id:"p-lv-"+ki,name:nm,file:"AWN-"+num,age:(3+ki%7)+" سنوات",need:LV_NEED[d.id]||"قيد المتابعة",program:d.name.replace("قسم ",""),school:"",status:"نشط",notes:"",goal:"",next:"",code:"LV-"+num,schoolCode:"",guardian:"ولي أمر "+nm.split(" ")[0],phone:"05"+String(10000000+ki*7919).slice(0,8),archived:false,assignedPrograms:[],goals:[],dept:d.id,
            consents:[{id:"cs-lv-"+ki,type:"treatment",version:"1.0",text:"",grantedAt:new Date().toISOString(),by:"ولي الأمر",method:"بيانات تجريبية",recordedBy:"النظام"}]};
          p.health=typeof defaultHealth==="function"?defaultHealth(p):undefined;lvGoalsFor(p,d.id);state.patients.push(p);ch++}});state.lvKids=true;ch++}
      // جدول اليوم لكل أخصائي (لو ما له مواعيد اليوم)
      if(!state.demoDays[today]){const g=new Date(today+"T12:00").getDay();const nowM=new Date().getHours()*60+new Date().getMinutes();if(g!==5&&g!==6){
        state.staff.filter(s=>(s.clinical||s.roleCategory==="staff")&&s.department).forEach((s,si)=>{
          if(state.appointments.some(a=>a.clinician===s.name&&a.date===today&&a.status!=="ملغي"))return;
          const kids=state.patients.filter(p=>!p.archived&&p.dept===s.department);if(!kids.length)return;
          const sh=sipadShift(s)||[480,900];const b=sipadBreak(s);const room=evRoomOf(s.name);let k=si;
          for(let m=sh[0];m+SIPAD_SLOT<=sh[1];m+=SIPAD_SLOT){if(b&&m<b[1]&&m+SIPAD_SLOT>b[0])continue;if((m/SIPAD_SLOT+si)%4===3)continue;
            const p=kids[k++%kids.length];if(state.appointments.some(a=>a.patient===p.name&&a.date===today&&a.status!=="ملغي"&&Math.abs(sipadMin(a.time)-m)<SIPAD_SLOT))continue;
            const past=m+SIPAD_SLOT<=nowM;state.appointments.push({id:"apt-lv-"+s.id+"-"+m,date:today,time:sipadHM(m),duration:SIPAD_SLOT,patient:p.name,service:EV_SERVICE[s.department]||"جلسة",clinician:s.name,room:room==="غرفة العلاج"?"غرفة "+(1+si%6):room,status:past?"مكتمل":"مجدول",demo:true});
            if(past)goalsOf(p).filter(x=>x.status==="معتمد").slice(0,2).forEach((x,j)=>{const pc=[40,60,70,80,90][(m/10+j+si)%5];state.sessionLogs.unshift({id:"sl-lv-"+s.id+"-"+m+"-"+j,patientId:p.id,date:today,goalText:x.text,result:pc>=80?"نجاح كامل":pc>=50?"نجاح جزئي":"لم ينجح بعد",notes:`${pc}% صحيح مستقل في 10 محاولات.`,staffId:s.id,staffName:s.name,source:"dtt"})})}});
        state.demoDays[today]=true;ch++}}
      if(ch)persist();
    }
    try{lvSeed()}catch(_e){console.warn(_e)}

    // 4) صفحة «آيبادي»: آيباد حي شغال (مو صورة) — يفضل مفتوح وما يتقفل مع تحديث الصفحة
    const _miPage=myIpadView;
    myIpadView=function(){const me=getCurrentPerson();if(!me||!ipOwnerEligible(me))return _miPage();ensureAllIpads();const d=ipadOf(me);
      const R=sipadRowsFull(me);const apts=R.apts||[];const done=apts.filter(a=>a.status==="مكتمل").length;
      const caps=ROLE_CAPS[me.roleCategory==="supervisor"?"supervisor":"staff"];const sup=me.department?agSup(me.department):null;
      return `<section class="mi-head"><div><small>آيبادي · ${esc(deptName(me.department||""))}</small><h1>${sipadGreet()}، ${esc(me.name)}</h1><span class="muted">الدوام ${esc(me.schedule||"—")} · ${done}/${apts.length} جلسة اليوم · الآيباد هذا شغلك كله: الجدول، الجلسات، التقييم، المهام.</span></div></section>
        <div class="mi-wrap"><div class="mi-col"><div id="mi-slot" class="mi-slot"></div><p class="mi-cap">هذا آيبادك الحقيقي — اشتغل عليه هنا أو على الجهاز نفسه، نفس البيانات.</p></div>
        <div class="mi-side">${codeCardHtml(me,"page")}
          <section class="card"><div class="card-head"><h2>${ic("shield",18)} مين يتحكم في آيبادي</h2><span class="pill pill-grey">${ic("lock",12)} عرض بس</span></div><p class="muted" style="margin:0">الصلاحيات والقفل والجدول يتحكم فيهم ${me.roleCategory==="supervisor"?"<b>الإدارة</b>":`<b>${sup?esc(sup.name):"مشرف القسم"}</b> والإدارة`}.</p></section>
          <section class="card"><div class="card-head"><h2>${ic("check",18)} صلاحياتي على الآيباد</h2></div><div class="pg-perms">${DEV_PERMS.map(([k,l])=>{const on=!d||!d.perms||d.perms[k]!==false;return `<div class="pg-perm ${on?"on":""}"><span>${esc(l)}</span><em>${on?"مسموح":"مقفول"}</em></div>`}).join("")}</div>
            <ul class="pg-caps" style="margin-top:10px">${caps.map(c=>`<li>${esc(c)}</li>`).join("")}</ul></section></div></div>`};
    const MI={key:null};
    function miDock(){const slot=document.getElementById("mi-slot");let dock=document.getElementById("mi-dock");
      if(!slot||state.view!=="myIpad"||state.sipadMode){if(dock)dock.style.display="none";return}
      const me=getCurrentPerson();const d=me&&ipadOf(me);if(!d){if(dock)dock.style.display="none";return}
      if(!dock){dock=document.createElement("div");dock.id="mi-dock";dock.className="mi-dock";dock.innerHTML=`<div class="mi-dev" id="mi-dev"><span class="sim-btn-top"></span><span class="sim-btn-vol"></span><div class="sim-cam"></div><div class="sim-scr"><div class="sim-status"><span id="mi-time"></span><span class="sim-dots">•••</span><span class="sim-ic">📶 <b>100%</b> <i class="sim-bat"><i></i></i></span></div><iframe id="mi-frame" title="آيبادي" allow="camera; microphone"></iframe><div class="sim-home"></div></div></div>`;document.body.appendChild(dock)}
      const key=d.id+"|"+me.id;if(MI.key!==key){MI.key=key;const old=document.getElementById("mi-frame");const nf=document.createElement("iframe");nf.id="mi-frame";nf.title="آيبادي";nf.setAttribute("allow","camera; microphone");nf.src=location.href.split("#")[0]+"#ipad-sim="+encodeURIComponent(d.id)+"&as="+encodeURIComponent(me.id);old.replaceWith(nf)}
      const r=slot.getBoundingClientRect();const W=r.width;const sc=W/876;slot.style.height=(1236*sc)+"px";const r2=slot.getBoundingClientRect();
      dock.style.display="block";dock.style.top=(r2.top+window.scrollY)+"px";dock.style.left=(r2.left+window.scrollX)+"px";dock.style.width=r2.width+"px";dock.style.height=r2.height+"px";
      document.getElementById("mi-dev").style.transform=`scale(${sc})`;
      const t=document.getElementById("mi-time");if(t)t.textContent=new Date().toLocaleTimeString("ar-SA-u-nu-latn",{hour:"numeric",minute:"2-digit"});
    }
    const _miRender=render;render=function(){const r=_miRender.apply(this,arguments);try{miDock()}catch(_e){}return r};
    window.addEventListener("resize",()=>{try{miDock()}catch(_e){}});
    setInterval(()=>{if(state.view==="myIpad")try{miDock()}catch(_e){}},1200);
    Object.assign(window,{render});

    // =================== حوكمة المركز + سجل المهام (ما لك وما عليك) + أوان كونكت للموظف ===================
    const _gvHub=communicationHubView;communicationHubView=function(){if(rlDenied("communicationHub")){state.view="connect";return connectView()}return _gvHub()};
    // ---- الحوكمة ----
    const GV_DEFAULT={version:1,updatedAt:null,
      duties:{staff:["الالتزام بمواعيد الدوام والجلسات (40 دقيقة) وتسجيل الحضور والانصراف.","تنفيذ الخطة العلاجية المعتمدة من المشرف، وأي تعديل في الأهداف يكون بموافقة المشرف.","تسجيل بيانات كل جلسة على الآيباد في نفس اليوم.","إجراء التقييمات الجديدة المسندة وكتابة مسودة الخطة خلال اليوم.","التواصل مع الأسر من خلال أوان كونكت بس.","الحفاظ على سرية بيانات الأطفال، وعدم تصويرهم أو مشاركة بياناتهم خارج المنصة.","إبلاغ المشرف فورًا بأي حادث سلامة أو ملاحظة تخص حماية الطفل.","حضور الاجتماعات والتدريبات المقررة."],
        supervisor:["كل التزامات الأخصائي على جلساته.","مراجعة واعتماد خطط وتقييمات القسم خلال يوم عمل.","توزيع الحالات والمهام على الفريق بعدالة ووضوح، وتسجيل كل تكليف على المنصة.","متابعة جودة الجلسات وتقديم تغذية راجعة مكتوبة.","الرد على اعتذارات ومتعذرات الفريق بقرار مكتوب."]},
      rights:{staff:["جدول واضح ومعلن مسبقًا، وبريك محمي ما يتحجز فيه جلسات.","حمل عمل عادل في حدود دوامه، وأي تكليف إضافي يكون مكتوب ومسجل باسم اللي أصدره.","مساحة للإبداع في أساليب التنفيذ جوه أهداف الخطة المعتمدة.","الاطلاع على معايير تقييم أدائه ونتيجته، وحق الاعتراض المكتوب.","التدريب والتطوير المهني.","قناة رسمية للشكاوى والمقترحات مع الحفاظ على السرية.","عدم تواصل الأسر معه على رقمه الشخصي — التواصل من المنصة بس.","حق الاعتذار المسبب عن التكليف الإضافي، وحق تسجيل «متعذرة» بسبب على أي مهمة."],
        supervisor:["كل حقوق الأخصائي.","صلاحيات واضحة ومكتوبة على قسمه وآيبادات فريقه.","دعم الإدارة في القرارات اللي تخرج عن صلاحياته."]},
      policies:[
        {t:"الحضور والانصراف",x:"الحضور بالكود على الآيباد أو الكيوسك. التأخير أكثر من 15 دقيقة يتسجل ويتبلغ بيه المشرف. الإجازات تتطلب من المنصة."},
        {t:"سرية البيانات والخصوصية",x:"بيانات الأطفال والأسر تتعامل معها جوه المنصة بس، وفق نظام حماية البيانات الشخصية. ممنوع النسخ أو التصوير أو الإرسال لأي جهة خارجية."},
        {t:"التواصل مع الأسر",x:"من أوان كونكت بس، بلغة مهنية. كل رسالة تتسجل ويطّلع عليها المشرف. ممنوع إعطاء الرقم الشخصي."},
        {t:"التصوير والتسجيل",x:"ممنوع إلا بموافقة ولي الأمر الموقعة على المنصة، ولأغراض إكلينيكية بس."},
        {t:"السلامة وحماية الطفل",x:"الطفل ما ينترك لوحده. أي إصابة أو ملاحظة حماية تتبلغ فورًا للمشرف وتتوثق نفس اليوم."},
        {t:"التوثيق",x:"كل جلسة تتوثق على الآيباد قبل نهاية الدوام. التوثيق جزء من أداء الموظف."},
        {t:"الهدايا وتضارب المصالح",x:"ممنوع قبول هدايا مادية أو تقديم خدمات خاصة لأسر المركز خارج المركز."},
        {t:"التصعيد والشكاوى",x:"الموظف ← مشرف القسم ← الإدارة. كل شكوى لها رقم ومدة رد، ومحد يتأذى بسبب شكوى قدّمها بحسن نية."},
        {t:"استخدام الآيباد",x:"الآيباد للشغل بس، يتقفل تلقائي، وإعداداته يتحكم فيها المشرف والإدارة."}]};
    function gvEnsure(){if(!state.governance)state.governance=JSON.parse(JSON.stringify(GV_DEFAULT));if(!state.govAcks)state.govAcks={};return state.governance}
    function gvRole(s){return s&&s.roleCategory==="supervisor"?"supervisor":"staff"}
    function gvAcked(s){const G=gvEnsure();const a=state.govAcks[s.id];return a&&a.v===G.version?a:null}
    function gvMe(){return state.sipadMode&&state.sipad?sipadStaff():getCurrentPerson()}
    function gvAck(sid){const me=gvMe();if(!me||me.id!==sid)return notify("كل موظف يوقّع على الحوكمة بنفسه");const G=gvEnsure();state.govAcks[sid]={v:G.version,at:new Date().toISOString()};audit(`الاطلاع والموافقة على حوكمة المركز (إصدار ${G.version})`,me.name);persist();notify("✓ انسجلت موافقتك بالتاريخ والوقت");render()}
    function gvCardHtml(s,compact){const G=gvEnsure();const r=gvRole(s);const a=gvAcked(s);const self=gvMe()&&gvMe().id===s.id;
      const list=(arr,cls)=>`<ul class="gv-list ${cls}">${arr.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
      return `<section class="card gv-card"><div class="card-head"><h2>${ic("shield",18)} حوكمة المركز — ما لك وما عليك</h2>${a?`<span class="pill pill-good">وافقت ✓ ${date(localDateOf(a.at))}</span>`:`<span class="pill pill-gold">إصدار ${G.version} · محتاج موافقتك</span>`}</div>
        ${!a&&self?`<div class="gv-ack"><span>اقرا ما لك وما عليك وسياسات المركز، وبعدين أكّد إنك اطّلعت.</span><button class="btn btn-primary" onclick="gvAck('${s.id}')">اطّلعت وأوافق</button></div>`:""}
        <div class="gv-cols"><details ${compact?"":"open"}><summary>${ic("check",15)} ما عليك (${G.duties[r].length})</summary>${list(G.duties[r],"dut")}</details>
        <details ${compact?"":"open"}><summary>${ic("star",15)} ما لك (${G.rights[r].length})</summary>${list(G.rights[r],"rig")}</details></div>
        <details class="gv-pol"><summary>${ic("book",15)} سياسات المركز (${G.policies.length})</summary>${G.policies.map(p=>`<div class="gv-p"><b>${esc(p.t)}</b><span>${esc(p.x)}</span></div>`).join("")}</details>
        <p class="muted gv-foot">إصدار ${G.version}${G.updatedAt?" · آخر تحديث "+date(localDateOf(G.updatedAt)):""} · أي تعديل من الإدارة يطلع إصدار جديد ومحتاج موافقة ثانية.</p></section>`}
    // إدارة الحوكمة (للإدارة) في صفحة الفريق
    function gvAdminHtml(){const G=gvEnsure();const people=state.staff.filter(ipOwnerEligible);const ok=people.filter(s=>gvAcked(s));const ed=state.role==="management";
      return `<section class="card gv-admin"><div class="card-head"><h2>${ic("shield",18)} حوكمة المركز · إصدار ${G.version}</h2><span class="pill ${ok.length===people.length?"pill-good":"pill-gold"}">${ok.length}/${people.length} وافقوا</span></div>
        <details><summary>مين للحين ما وافق (${people.length-ok.length})</summary><div class="ev-chips" style="margin-top:8px">${people.filter(s=>!gvAcked(s)).map(s=>`<span class="ev-chip">${esc(s.name)}</span>`).join("")||"<span class='muted'>الكل وافق ✓</span>"}</div></details>
        ${ed?`<details><summary>تعديل الحوكمة ونشر إصدار جديد</summary><form class="gv-form" onsubmit="gvSave(event)"><p class="muted">كل سطر = بند.</p>
          <label>ما على الأخصائي<textarea class="textarea" name="ds" rows="6">${esc(G.duties.staff.join("\n"))}</textarea></label>
          <label>ما للأخصائي<textarea class="textarea" name="rs" rows="6">${esc(G.rights.staff.join("\n"))}</textarea></label>
          <label>ما على المشرف<textarea class="textarea" name="dp" rows="4">${esc(G.duties.supervisor.join("\n"))}</textarea></label>
          <label>ما للمشرف<textarea class="textarea" name="rp" rows="3">${esc(G.rights.supervisor.join("\n"))}</textarea></label>
          <label>السياسات (العنوان: النص)<textarea class="textarea" name="po" rows="8">${esc(G.policies.map(p=>p.t+": "+p.x).join("\n"))}</textarea></label>
          <button class="btn btn-primary">حفظ ونشر إصدار ${G.version+1}</button></form></details>`:""}</section>`}
    function gvSave(e){e.preventDefault();if(state.role!=="management")return notify("الحوكمة تعدلها الإدارة بس");const f=new FormData(e.target);const L=k=>String(f.get(k)||"").split("\n").map(x=>x.trim()).filter(Boolean);const G=gvEnsure();
      G.duties={staff:L("ds"),supervisor:L("dp")};G.rights={staff:L("rs"),supervisor:L("rp")};G.policies=L("po").map(l=>{const i=l.indexOf(":");return i>0?{t:l.slice(0,i).trim(),x:l.slice(i+1).trim()}:{t:l,x:""}});G.version++;G.updatedAt=new Date().toISOString();
      audit(`نشر إصدار ${G.version} من حوكمة المركز`,"");state.staff.filter(ipOwnerEligible).forEach(s=>state.messages.unshift({id:"msg-"+Date.now()+"-gv-"+s.id,fromId:null,fromName:"الإدارة",toId:s.id,toName:s.name,text:`📜 انتشر إصدار ${G.version} من حوكمة المركز — اقراه ووافق عليه من آيبادك.`,date:todayISO(),read:false}));persist();notify("انتشر الإصدار الجديد ووصل لكل الفريق");render()}
    const _gvTeam=teamSmart;teamSmart=function(){const h=_gvTeam();if(state.role!=="management"&&state.role!=="supervisor")return h;const k=h.indexOf('<section class="dh-kpis">');return k>=0?h.slice(0,k)+gvAdminHtml()+h.slice(k):gvAdminHtml()+h};

    // ---- سجل المهام: كل تكليف بمين أصدره ومتى ونوعه وحالته ----
    const TKUI={r:null};
    function tkNorm(t){if(!t.status)t.status=t.done?"تمت":"جديدة";if(!t.kind)t.kind="صميم";if(!t.assignedAt)t.assignedAt=(t.date||localDateOf(new Date()))+"T08:00:00";return t}
    function tkMine(s){return (state.dailyTasks||[]).filter(t=>t.staffId===s.id).map(tkNorm).sort((a,b)=>(Date.parse(b.assignedAt)||0)-(Date.parse(a.assignedAt)||0))}
    function tkOpen(t){return t.status==="جديدة"||t.status==="مستلمة"}
    const TK_PILL={"جديدة":"pill-gold","مستلمة":"pill-blue","تمت":"pill-good","متعذرة":"pill-red","معتذر عنها":"pill-grey"};
    function tkMeta(t){const at=t.assignedAt?localTimeOf(t.assignedAt):"";return `${t.from?"من "+esc(t.from):"مهمة يومية"}${at?" · "+date(localDateOf(t.assignedAt))+" "+at:""}${t.due?" · مطلوبة قبل "+esc(t.due):""} · ${t.kind==="إضافي"?"تكليف إضافي":"من صميم العمل"}`}
    function tkTile(t,canAct){const r=TKUI.r&&TKUI.r.id===t.id?TKUI.r:null;
      let act="";if(canAct){if(r)act=`<form class="tk-reason" onsubmit="tkReasonSend(event,'${t.id}')"><input class="input" name="r" placeholder="${r.kind==="decline"?"سبب الاعتذار":"سبب التعذر"}" required><button class="btn btn-primary">إرسال</button><button type="button" class="btn btn-outline" onclick="tkReason(null)">إلغاء</button></form>`;
        else if(t.status==="جديدة")act=`<button class="btn btn-primary" onclick="tkAct('${t.id}','accept')">استلمت</button>${t.kind==="إضافي"?`<button class="btn btn-outline" onclick="tkReason('${t.id}','decline')">اعتذار مسبب</button>`:""}`;
        else if(t.status==="مستلمة")act=`<button class="btn btn-primary" onclick="tkAct('${t.id}','done')">تمت ✓</button><button class="btn btn-outline" onclick="tkReason('${t.id}','block')">متعذرة</button>`}
      const res=t.status==="تمت"&&t.doneAt?`تنفّذت ${localTimeOf(t.doneAt)}`:t.reason?`السبب: ${esc(t.reason)}`:t.ackAt?`استلمها ${localTimeOf(t.ackAt)}`:"";
      return `<div class="tk ${t.kind==="إضافي"?"extra":""} st-${t.status==="تمت"?"done":t.status==="جديدة"?"new":"x"}"><div class="tk-top"><span class="pill ${TK_PILL[t.status]||""}">${esc(t.status)}</span>${t.kind==="إضافي"?`<span class="pill pill-blue">تكليف إضافي</span>`:""}</div><b>${esc(t.text)}</b><small>${tkMeta(t)}</small>${res?`<em>${res}</em>`:""}${act?`<div class="tk-act">${act}</div>`:""}</div>`}
    function tkAct(id,a,reason){const t=(state.dailyTasks||[]).find(x=>x.id===id);if(!t)return;tkNorm(t);const me=gvMe();if(!me||me.id!==t.staffId)return notify("المهمة هذي مو مسندة لك");const now=new Date().toISOString();
      if(a==="accept"){t.status="مستلمة";t.ackAt=now}else if(a==="done"){t.status="تمت";t.done=true;t.doneAt=now}else if(a==="block"){t.status="متعذرة";t.reason=reason;t.closedAt=now}else if(a==="decline"){t.status="معتذر عنها";t.reason=reason;t.closedAt=now}
      audit(`مهمة «${t.text}» ← ${t.status}${reason?" ("+reason+")":""}`,me.name);
      if(t.fromId&&t.fromId!==me.id&&a!=="accept"){const f=personById(t.fromId);if(f)state.messages.unshift({id:"msg-"+Date.now()+"-tk",fromId:me.id,fromName:me.name,toId:f.id,toName:f.name,text:`المهمة «${t.text}»: ${t.status}${reason?" — "+reason:""}`,date:todayISO(),read:false})}
      TKUI.r=null;persist();render()}
    function tkReason(id,kind){TKUI.r=id?{id,kind}:null;render();setTimeout(()=>{const i=document.querySelector(".tk-reason input");if(i)i.focus()},40)}
    function tkReasonSend(e,id){e.preventDefault();const r=(new FormData(e.target).get("r")||"").trim();if(!r)return;tkAct(id,TKUI.r&&TKUI.r.kind==="decline"?"decline":"block",r)}
    const _gvToggle=toggleStaffTask;toggleStaffTask=function(id){const t=(state.dailyTasks||[]).find(x=>x.id===id);if(t){tkNorm(t);return tkAct(id,t.status==="جديدة"?"accept":"done")}return _gvToggle(id)};
    function tkListHtml(s,canAct,all){const L=tkMine(s);const today=localDateOf(new Date());const show=all?L:L.filter(t=>tkOpen(t)||localDateOf(t.doneAt||t.closedAt||t.assignedAt)===today);
      const open=L.filter(tkOpen).length;
      return `<section class="card tk-card"><div class="card-head"><h2>${ic("check",18)} ${all?"سجل المهام":"قائمة مهامي"}</h2><span class="pill ${open?"pill-gold":"pill-good"}">${open?open+" مفتوحة":"ما فيه مفتوح ✓"}</span></div>
        <p class="muted tk-note">كل مهمة متسجلة بمين كلّفك ومتى ونوعها. التكليف الإضافي من حقك تعتذر عنه بسبب، وأي مهمة متعذرة سجّل سببها — هذا يحفظ حقك وحق المركز.</p>
        ${show.length?`<div class="tk-grid">${show.map(t=>tkTile(t,canAct)).join("")}</div>`:`<div class="empty">ما فيه مهام مسجلة.</div>`}</section>`}
    // الآيباد: المهام الموكلة بالسجل الجديد + باقي التنبيهات + الحوكمة
    sipadTasksHtml=function(s){const L=sipadTasks(s).filter(x=>x.k!=="task");const ICN={eval:"target",plan:"book",msg:"chat",next:"idea"};
      let h=tkListHtml(s,true,false);
      if(L.length)h+=`<section class="card sp-tasks"><div class="card-head"><h2>${ic("bell",18)} مطلوب منك اليوم</h2><span class="pill pill-gold">${L.length}</span></div><div class="sp-tlist">${L.map(x=>`<div class="sp-task k-${x.k}"><span class="sp-ti">${ic(ICN[x.k]||"check",16)}</span><div><b>${esc(x.text)}</b><small>${esc(x.sub||"")}</small></div>${x.k==="msg"?`<button class="btn btn-outline" onclick="${x.act}">تمام</button>`:""}</div>`).join("")}</div></section>`;
      return h};
    const _gvHome=sipadHome;sipadHome=function(s){const h=_gvHome(s);return h+gvCardHtml(s,true)};
    // إسناد المهام من صفحة الموظف: النوع والميعاد ومين أصدرها
    pgTask=function(e,sid){e.preventDefault();const s=personById(sid);if(!ipCanCtl(s))return ipDenied();const f=new FormData(e.target);const t=(f.get("t")||"").trim();if(!t)return;const me=getCurrentPerson();
      state.dailyTasks=state.dailyTasks||[];state.dailyTasks.unshift({id:"tk-"+Date.now(),staffId:sid,text:t,done:false,status:"جديدة",kind:f.get("k")==="إضافي"?"إضافي":"صميم",due:f.get("due")||"",date:localDateOf(new Date()),assignedAt:new Date().toISOString(),from:me?me.name:(state.role==="management"?"الإدارة":"المشرف"),fromId:me?me.id:null});
      audit("إسناد مهمة ("+(f.get("k")==="إضافي"?"تكليف إضافي":"من صميم العمل")+")",s.name+": "+t);persist();notify("المهمة انسجلت ووصلت لآيباد "+s.name);render()};
    const _gvPage=staffPageHtml;staffPageHtml=function(s,self){let h=_gvPage(s,self);if(!s)return h;
      h=h.replace('<input class="input" name="t" placeholder="مهمة جديدة تظهر على آيباده…" required>','<input class="input" name="t" placeholder="مهمة جديدة تظهر على آيباده…" required><select class="select" name="k" style="max-width:150px"><option value="صميم">من صميم العمل</option><option value="إضافي">تكليف إضافي</option></select><input class="input" name="due" type="time" style="max-width:110px" title="مطلوبة قبل">');
      if(!self){const k=h.lastIndexOf("</div></div>");const add=tkListHtml(s,false,true)+gvCardHtml(s,true);if(k>=0)h=h.slice(0,k)+add+h.slice(k)}
      return h};
    const _gvMine=myIpadView;myIpadView=function(){let h=_gvMine();const me=getCurrentPerson();if(!me||!ipOwnerEligible(me))return h;
      const k=h.indexOf('<div class="mi-side">');if(k>=0)h=h.slice(0,k+20)+tkListHtml(me,true,false)+gvCardHtml(me,false)+h.slice(k+20);return h};

    // ---- أوان كونكت للموظف: المشرف والإدارة، فريق القسم، أسر أطفاله، واجتماعاته ----
    const CNX={th:null,q:""};
    function cnxMe(){return getCurrentPerson()}
    function cnxContacts(me){const sup=me.department?agSup(me.department):null;const mg=state.staff.filter(s=>s.roleCategory==="management");
      const team=state.staff.filter(s=>s.department===me.department&&s.id!==me.id&&(!sup||s.id!==sup.id));
      const pts=[...new Set(state.appointments.filter(a=>a.clinician===me.name&&a.status!=="ملغي").map(a=>a.patient))].map(n=>state.patients.find(p=>p.name===n&&!p.archived)).filter(Boolean);
      return {lead:[sup,...mg].filter(x=>x&&x.id!==me.id),team,pts}}
    function cnxThread(me,key){const [k,id]=key.split(":");
      if(k==="st")return state.messages.filter(m=>(m.fromId===me.id&&m.toId===id)||(m.fromId===id&&m.toId===me.id));
      return state.messages.filter(m=>m.patientId===id&&(m.toDept==="family"||m.fromDept==="family"))}
    function cnxUnread(me,key){const [k,id]=key.split(":");if(k==="st")return state.messages.filter(m=>m.fromId===id&&m.toId===me.id&&!m.read).length;return state.messages.filter(m=>m.patientId===id&&m.fromDept==="family"&&!m.read&&!(m.seenBy||[]).includes(me.id)).length}
    function cnxOpen(key){CNX.th=key;const me=cnxMe();if(me){const [k,id]=key.split(":");let ch=0;state.messages.forEach(m=>{if(k==="st"&&m.fromId===id&&m.toId===me.id&&!m.read){m.read=true;ch++}if(k==="fam"&&m.patientId===id&&m.fromDept==="family"&&!(m.seenBy||[]).includes(me.id)){m.seenBy=[...(m.seenBy||[]),me.id];ch++}});if(ch)persist()}render();setTimeout(()=>{const b=document.getElementById("cnx-body");if(b)b.scrollTop=b.scrollHeight;const i=document.getElementById("cnx-in");if(i)i.focus()},40)}
    function cnxSend(e){e.preventDefault();const me=cnxMe();if(!me||!CNX.th)return;const t=(new FormData(e.target).get("t")||"").trim();if(!t)return;const [k,id]=CNX.th.split(":");const now=new Date().toISOString();
      if(k==="st"){const to=personById(id);if(!to)return;state.messages.unshift({id:"msg-"+Date.now(),fromId:me.id,fromName:me.name,toId:to.id,toName:to.name,text:t,date:todayISO(),at:now,read:false,via:"connect"})}
      else{const p=state.patients.find(x=>x.id===id);if(!p)return;state.messages.unshift({id:"msg-"+Date.now(),fromId:me.id,fromName:me.name,fromDept:me.department||"staff",toId:null,toName:null,toDept:"family",patientId:p.id,text:t,date:todayISO(),at:now,kind:"رسالة",status:"مُرسلة",read:false,via:"connect"});audit("رسالة لأسرة من أوان كونكت",p.name)}
      persist();render();setTimeout(()=>{const b=document.getElementById("cnx-body");if(b)b.scrollTop=b.scrollHeight;const i=document.getElementById("cnx-in");if(i)i.focus()},40)}
    function cnxQuick(t){const i=document.getElementById("cnx-in");if(i){i.value=t;i.focus()}}
    function cnxMeetReq(){const me=cnxMe();const sup=me&&me.department?agSup(me.department):null;if(!sup)return notify("ما فيه مشرف للقسم");state.messages.unshift({id:"msg-"+Date.now(),fromId:me.id,fromName:me.name,toId:sup.id,toName:sup.name,text:"📅 طلب اجتماع مع المشرف — ممكن نحدد ميعاد؟",date:todayISO(),at:new Date().toISOString(),read:false,via:"connect"});persist();notify("انرسل طلب الاجتماع لـ "+sup.name);CNX.th="st:"+sup.id;render()}
    function staffConnectView(){const me=cnxMe();if(!me)return head("أوان كونكت","أوان كونكت","سجّل دخولك بكودك الأول.","");
      const C=cnxContacts(me);const keys=[...C.lead.map(s=>"st:"+s.id),...C.team.map(s=>"st:"+s.id),...C.pts.map(p=>"fam:"+p.id)];if(!CNX.th||!keys.includes(CNX.th))CNX.th=keys[0]||null;
      const row=(key,name,sub,av)=>{const u=cnxUnread(me,key);return `<button class="cnx-c ${CNX.th===key?"on":""}" onclick="cnxOpen('${key}')"><span class="sp-av">${esc(av)}</span><span><b>${esc(name)}</b><small>${esc(sub)}</small></span>${u?`<i class="cnx-u">${u}</i>`:""}</button>`};
      const av=n=>(n.replace(/^(أ\.|د\.)\s*/,"")||"?").charAt(0);
      const list=`<div class="cnx-list"><h4>المشرف والإدارة</h4>${C.lead.map(s=>row("st:"+s.id,s.name,s.roleCategory==="supervisor"?"مشرف القسم":"الإدارة",av(s.name))).join("")||"<p class='muted'>—</p>"}
        <h4>فريق ${esc(deptName(me.department||""))}</h4>${C.team.map(s=>row("st:"+s.id,s.name,s.role||"",av(s.name))).join("")||"<p class='muted'>—</p>"}
        <h4>أسر أطفالي</h4>${C.pts.map(p=>row("fam:"+p.id,"أسرة "+p.name.split(" ").slice(0,2).join(" "),p.guardian||"ولي الأمر",av(p.name))).join("")||"<p class='muted'>ما فيه أطفال في جدولك</p>"}</div>`;
      let chat=`<div class="cnx-chat"><div class="empty">اختار جهة من القايمة.</div></div>`;
      if(CNX.th){const [k,id]=CNX.th.split(":");const isF=k==="fam";const who=isF?state.patients.find(p=>p.id===id):personById(id);
        const T=cnxThread(me,CNX.th).slice().sort((a,b)=>String(a.at||a.date||"").localeCompare(String(b.at||b.date||""))||String(a.id).localeCompare(String(b.id)));
        chat=`<div class="cnx-chat"><div class="cnx-h"><b>${isF?"أسرة "+esc(who?who.name:""):esc(who?who.name:"")}</b><small>${isF?"الرسايل توصل لبوابة الأسرة بتتسجل ويطّلع عليها المشرف":esc(who&&who.role||"")}</small></div>
          ${isF?`<div class="cnx-pol">${ic("shield",14)} حسب حوكمة المركز: التواصل مع الأسرة من هنا بس، بلغة مهنية — ممنوع الرقم الشخصي.</div>`:""}
          <div class="cnx-body" id="cnx-body">${T.length?T.map(m=>{const mine=m.fromId===me.id;return `<div class="cnx-m ${mine?"me":""}"><small>${esc(mine?"أنت":m.fromName||"")} · ${m.at?localTimeOf(m.at)+" · ":""}${date(m.date)}</small><div>${esc(m.text)}</div></div>`}).join(""):`<div class="muted" style="text-align:center;padding:30px">ابدأ المحادثة.</div>`}</div>
          ${isF?`<div class="cnx-q">${["تأكيد موعد الجلسة الجاية","ملخص جلسة اليوم","تمرين بسيط للبيت"].map(q=>`<button class="ev-chip" onclick="cnxQuick('${q}: ')">${q}</button>`).join("")}</div>`:""}
          <form class="cnx-f" onsubmit="cnxSend(event)" autocomplete="off"><input class="input" id="cnx-in" name="t" placeholder="اكتب رسالتك…" required><button class="btn btn-primary">إرسال</button></form></div>`}
      const meets=(state.meetings||[]).filter(m=>(m.departments||[]).includes(me.department)||(m.participants||[]).some(x=>x===me.id||x===me.name||(x&&x.id===me.id))||(m.kind==="family"&&C.pts.some(p=>p.id===m.patientId))).slice(0,6);
      return head("أوان كونكت","تواصلك الرسمي","مع مشرفك والإدارة وفريق قسمك وأسر أطفالك — كله متسجل ومحفوظ.",`<button class="btn btn-outline" onclick="cnxMeetReq()">${ic("video",14)} طلب اجتماع مع المشرف</button>`)
        +`<div class="cnx-wrap">${list}${chat}</div>`
        +`<section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("video",18)} اجتماعاتي</h2><span class="muted">${meets.length}</span></div>${meets.length?`<div class="list">${meets.map(m=>`<div class="list-row"><div class="list-main"><strong>${esc(m.title)}</strong><small>${esc(m.status||"")}${m.date?" · "+date(m.date):""}${m.time?" "+esc(m.time):""}</small></div><div class="list-end"><button class="btn btn-outline" onclick="openMeetingRoom('${m.id}')">دخول</button></div></div>`).join("")}</div>`:`<div class="empty">ما فيه اجتماعات لك الحين.</div>`}</section>`}
    const _gvConnect=connectView;connectView=function(){if(state.role==="staff")return staffConnectView();return _gvConnect()};
    try{gvEnsure()}catch(_e){}
    Object.assign(window,{gvAck,gvSave,tkAct,tkReason,tkReasonSend,toggleStaffTask,pgTask,cnxOpen,cnxSend,cnxQuick,cnxMeetReq});

    // =================== إشعارات الآيباد + QR الحضور والانصراف ===================
    // ---- QR الحضور: كود شخصي يومي على الآيباد يتقري من قارئ الباب، وكود الباب يتمسح من كاميرا الآيباد ----
    function attSecret(){state.center=state.center||{};if(!state.center.attSecret){state.center.attSecret=Math.random().toString(36).slice(2,12);persist()}return state.center.attSecret}
    function attSig(x){let h=2166136261;const s=attSecret()+"|"+x;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase()}
    function attYmd(){return localDateOf(new Date()).replace(/-/g,"")}
    function attStaffToken(s){const d=attYmd();return `AWN.${s.id}.${d}.${attSig(s.id+d)}`}
    function attDoorToken(){const d=attYmd();return `AWN.DOOR.${d}.${attSig("DOOR"+d)}`}
    function attParse(v){const raw=String(v||"").trim();if(!/^AWN\./i.test(raw))return null;const parts=raw.split(".");if(parts.length<4)return null;
      const sig=parts.pop().toUpperCase(),d=parts.pop(),id=parts.slice(1).join(".");const key=id.toUpperCase()==="DOOR"?"DOOR":id;
      if(d!==attYmd())return {bad:"الكود هذا مو حق اليوم"};if(attSig(key+d)!==sig)return {bad:"الكود هذا مو صحيح"};return {id:key}}
    const _attKiosk=kioskSubmit;kioskSubmit=function(e){const inp=e.target.querySelector("input");const v=(inp&&inp.value||"").trim();
      if(/^AWN\./i.test(v)){e.preventDefault();inp.value="";const r=attParse(v);const s=r&&!r.bad&&r.id!=="DOOR"?personById(r.id):null;
        if(!s){state.kioskMsg={ok:false,text:r&&r.bad?r.bad:"الكود هذا مو مسجل"};render();return}
        const nowIn=staffAttendanceMark(s,"QR الآيباد على الكيوسك");state.kioskMsg={ok:true,text:(nowIn?"أهلًا ":"مع السلامة ")+s.name+" — انسجل "+(nowIn?"حضورك":"انصرافك")+" الساعة "+localTimeOf(new Date())};persist();render();setTimeout(()=>{const i=document.getElementById("kiosk-input");if(i)i.focus()},30);return}
      return _attKiosk(e)};
    const _attBlock=kioskBlock;kioskBlock=function(big){const h=_attBlock(big);const qr=kxQR(attDoorToken(),big?240:150);
      return h.replace("</form>",`<div class="door-qr ${big?"big":""}">${qr}<div><b>QR الباب للنهارده</b><small>الموظف يفتح «حضور / انصراف» على آيباده ويمسح الكود هذا — أو يقرّب كوده الشخصي من قارئ الباب.</small></div></div></form>`)};
    // ---- طبقة إشعارات الآيباد ----
    const SPN={list:[],seen:{},snap:null,shift:null,first:true,sid:null};
    function spnKey(sid){return "awan-spn-"+sid}
    function spnLoad(sid){if(SPN.sid===sid)return;SPN.sid=sid;SPN.first=true;try{const o=JSON.parse(localStorage.getItem(spnKey(sid))||"{}");SPN.list=o.list||[];SPN.seen=o.seen||{};SPN.snap=o.snap||null;SPN.shift=o.shift||null}catch(_e){SPN.list=[];SPN.seen={};SPN.snap=null}}
    function spnSave(){if(!SPN.sid)return;try{const seen={};Object.keys(SPN.seen).slice(-400).forEach(k=>seen[k]=1);localStorage.setItem(spnKey(SPN.sid),JSON.stringify({list:SPN.list.slice(0,40),seen,snap:SPN.snap,shift:SPN.shift}))}catch(_e){}}
    const SPN_IC={pre:"⏰",start:"▶️",end:"⏹",add:"🆕",move:"🔁",cancel:"✖️",room:"🚪",task:"📌",msg:"💬",shift:"🕘",att:"✅"};
    function spnPush(n){n.id="n"+Date.now()+Math.random().toString(36).slice(2,5);n.at=Date.now();n.read=false;SPN.list.unshift(n);spnSave();
      try{if(typeof playNotificationTone==="function")playNotificationTone()}catch(_e){}try{if(navigator.vibrate)navigator.vibrate(n.sticky?[120,60,120]:80)}catch(_e){}
      let st=document.getElementById("spn-stack");if(!st){st=document.createElement("div");st.id="spn-stack";st.className="spn-stack";document.body.appendChild(st)}
      const el=document.createElement("div");el.className="spn-t k-"+n.kind+(n.sticky?" sticky":"");el.dataset.id=n.id;
      el.innerHTML=`<span class="spn-i">${SPN_IC[n.kind]||"🔔"}</span><div><b>${esc(n.title)}</b>${n.text?`<small>${esc(n.text)}</small>`:""}</div>${n.act?`<button class="btn btn-primary" onclick="spnAct('${n.id}')">${esc(n.act.label)}</button>`:""}<button class="spn-x" onclick="spnClose('${n.id}')" aria-label="إغلاق">✕</button>`;
      st.prepend(el);while(st.children.length>4)st.lastChild.remove();if(!n.sticky)setTimeout(()=>{el.classList.add("out");setTimeout(()=>el.remove(),400)},9000);spnBell()}
    function spnClose(id){const el=document.querySelector(`.spn-t[data-id="${id}"]`);if(el)el.remove();const n=SPN.list.find(x=>x.id===id);if(n){n.read=true;spnSave();spnBell()}}
    function spnAct(id){const n=SPN.list.find(x=>x.id===id);spnClose(id);spnPanel(false);if(!n||!n.act)return;try{(new Function(n.act.on))()}catch(_e){}}
    function spnBell(){const b=document.getElementById("spn-bell");const u=SPN.list.filter(x=>!x.read).length;if(b)b.innerHTML=`🔔${u?`<i>${u}</i>`:""}`}
    function spnPanel(open){let p=document.getElementById("spn-panel");if(open===false||(p&&open===undefined)){if(p)p.remove();return}
      SPN.list.forEach(x=>x.read=true);spnSave();spnBell();p=document.createElement("div");p.id="spn-panel";p.className="spn-panel";
      p.innerHTML=`<div class="spn-pbox"><div class="spn-ph"><b>الإشعارات</b><button class="btn btn-outline" onclick="spnClear()">مسح الكل</button><button class="spn-x" onclick="spnPanel(false)">✕</button></div>${SPN.list.length?SPN.list.slice(0,30).map(n=>`<div class="spn-row k-${n.kind}"><span class="spn-i">${SPN_IC[n.kind]||"🔔"}</span><div><b>${esc(n.title)}</b>${n.text?`<small>${esc(n.text)}</small>`:""}<em>${new Date(n.at).toLocaleTimeString("ar-SA-u-nu-latn",{hour:"numeric",minute:"2-digit"})}</em></div>${n.act?`<button class="btn btn-outline" onclick="spnAct('${n.id}')">${esc(n.act.label)}</button>`:""}</div>`).join(""):`<div class="empty">ما فيه إشعارات.</div>`}</div>`;
      p.addEventListener("click",ev=>{if(ev.target===p)spnPanel(false)});document.body.appendChild(p)}
    function spnClear(){SPN.list=[];spnSave();spnPanel(false);spnBell();document.querySelectorAll(".spn-t").forEach(e=>e.remove())}
    function spnSource(a,me){const lim=Date.now()-4*60000;const e=(state.auditLog||[]).find(x=>Date.parse(x.at)>=lim&&x.by!==me.name&&String(x.target||"").includes(a.patient));
      if(e)return "من "+(e.role||e.by);if(a.autoBooked)return "تلقائي من الاستقبال الذكي";if(a.agent||a.byAgent)return "من الإدارة الآلية";return ""}
    function spnMine(me){const today=localDateOf(new Date());return state.appointments.filter(a=>a.clinician===me.name&&a.date>=today)}
    function spnSnap(me){const o={};spnMine(me).forEach(a=>o[a.id]={d:a.date,t:a.time,st:a.status,p:a.patient,r:a.room||"",du:+a.duration||SIPAD_SLOT});return o}
    function spnWhen(d,t){const today=localDateOf(new Date());return (d===today?"اليوم":date(d))+" الساعة "+t}
    function spnTick(){
      if(!state.sipadMode||!state.sipad)return;const me=sipadStaff();if(!me)return;spnLoad(me.id);
      const today=localDateOf(new Date());const now=new Date();const nowM=now.getHours()*60+now.getMinutes();const L=dttLive();const first=SPN.first;SPN.first=false;
      // 1) تعديلات الجدول من الاستقبال/الإدارة/الإشراف/الإدارة الآلية
      const cur=spnSnap(me);const old=SPN.snap;
      if(old){Object.entries(cur).forEach(([id,c])=>{const o=old[id];const a=state.appointments.find(x=>x.id===id);if(!a)return;
          const src=spnSource(a,me);const mine=(state.auditLog||[]).find(x=>Date.parse(x.at)>=Date.now()-60000&&x.by===me.name&&String(x.target||"").includes(a.patient));
          if(!o){if(c.st!=="ملغي"&&!a.evHold&&!mine)spnPush({kind:"add",title:`طفل جديد في جدولك: ${a.patient}`,text:`${spnWhen(c.d,c.t)} · ${a.service||""}${src?" · "+src:""}`,act:c.d===today?{label:"عرض",on:"sipadTab('left')"}:null});return}
          if(mine)return;
          if(o.st!=="ملغي"&&c.st==="ملغي")spnPush({kind:"cancel",title:`انلغت جلسة ${a.patient}`,text:`${spnWhen(o.d,o.t)}${src?" · "+src:""}`});
          else if(o.d!==c.d||o.t!==c.t)spnPush({kind:"move",title:`جلسة ${a.patient} انتقلت`,text:`من ${spnWhen(o.d,o.t)} لـ ${spnWhen(c.d,c.t)}${src?" · "+src:""}`});
          else if(o.r!==c.r&&c.r)spnPush({kind:"room",title:`غرفة جلسة ${a.patient} تغيرت`,text:`صارت ${c.r} · ${spnWhen(c.d,c.t)}${src?" · "+src:""}`})});
        Object.entries(old).forEach(([id,o])=>{if(!cur[id]&&o.d>=today&&o.st!=="ملغي"&&o.st!=="مكتمل")spnPush({kind:"cancel",title:`جلسة ${o.p} انشالت من جدولك`,text:spnWhen(o.d,o.t)})})}
      SPN.snap=cur;
      // 2) تعديل الدوام أو البريك
      const sh=JSON.stringify([me.schedule||"",me.breakFrom||"",me.breakTo||""]);if(SPN.shift&&SPN.shift!==sh)spnPush({kind:"shift",title:"دوامك تعدّل",text:`الدوام ${me.schedule||"—"}${sipadBreak(me)?" · البريك "+sipadHM(sipadBreak(me)[0])+"–"+sipadHM(sipadBreak(me)[1]):""}`});SPN.shift=sh;
      // 3) مواعيد الجلسات: قبلها بـ5 دقايق، بدايتها، نهايتها
      state.appointments.filter(a=>a.clinician===me.name&&a.date===today&&a.status!=="ملغي"&&a.status!=="مكتمل").forEach(a=>{const f=sipadMin(a.time);if(f==null)return;const t=f+(+a.duration||SIPAD_SLOT);const live=L&&L.aptId===a.id&&!L.locked;const isEval=/تقييم/.test(a.service||"");
        const once=(k,fn)=>{const key=k+":"+a.id+":"+a.date+":"+a.time;if(SPN.seen[key])return;if(first&&k==="pre")return;SPN.seen[key]=1;fn()};
        if(nowM>=f-5&&nowM<f&&!live)once("pre",()=>spnPush({kind:"pre",title:`بعد ${f-nowM} دقايق: ${isEval?"تقييم":"جلسة"} ${a.patient}`,text:`${a.time} · ${a.room||""} · جهّز أدواتك`}));
        if(nowM>=f&&nowM<f+10&&!live)once("start",()=>spnPush({kind:"start",sticky:true,title:`وقت ${isEval?"تقييم":"جلسة"} ${a.patient} بدأ`,text:`${a.time} – ${sipadHM(t)} · ${a.room||""}`,act:{label:isEval?"ابدأ التقييم":"افتح الجلسة",on:`sipadTileOpen('${a.id}')`}}));
        if(nowM>=t-5&&nowM<t&&live)once("end5",()=>spnPush({kind:"pre",title:`باقي ${t-nowM} دقايق على نهاية جلسة ${a.patient}`,text:"ابدأ تقفل المحاولات وتكتب الملاحظة"}));
        if(nowM>=t&&nowM<t+30)once("end",()=>spnPush({kind:"end",sticky:true,title:`وقت جلسة ${a.patient} خلص`,text:live?"اقفل الجلسة عشان النتيجة تتسجل في ملف الطفل":"الجلسة للحين ما انفتحت — افتحها وسجّل أو بلّغ المشرف",act:live?{label:"اقفل الجلسة",on:"liveEndSession()"}:{label:"افتح الجلسة",on:`sipadTileOpen('${a.id}')`}}))});
      // 4) مهام ورسايل جديدة
      (state.dailyTasks||[]).filter(t=>t.staffId===me.id&&(t.status||"جديدة")==="جديدة").forEach(t=>{const k="task:"+t.id;if(SPN.seen[k])return;SPN.seen[k]=1;if(!first)spnPush({kind:"task",title:`مهمة جديدة${t.from?" من "+t.from:""}`,text:t.text+(t.kind==="إضافي"?" · تكليف إضافي":""),act:{label:"عرض",on:"document.querySelector('.tk-card')&&document.querySelector('.tk-card').scrollIntoView({behavior:'smooth'})"}})});
      (state.messages||[]).filter(m=>m.toId===me.id&&!m.read).forEach(m=>{const k="msg:"+m.id;if(SPN.seen[k])return;SPN.seen[k]=1;if(!first)spnPush({kind:"msg",title:`رسالة من ${m.fromName||"الإدارة"}`,text:String(m.text||"").slice(0,120)})});
      spnSave();spnBell();
    }
    setInterval(()=>{try{spnTick()}catch(_e){}},15000);
    window.addEventListener("storage",()=>setTimeout(()=>{try{spnTick()}catch(_e){}},400));
    const _spnLock=sipadLock;sipadLock=function(){document.querySelectorAll(".spn-t").forEach(e=>e.remove());spnPanel(false);attClose();return _spnLock()};
    // ---- شيت الحضور والانصراف على الآيباد ----
    const ATT={stream:null,timer:null};
    function attOpen(){const s=sipadStaff();if(!s)return;attClose();const p=document.createElement("div");p.id="att-sheet";p.className="spn-panel";
      const inT=!!s.present;const cam="BarcodeDetector" in window&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;
      p.innerHTML=`<div class="spn-pbox att-box"><div class="spn-ph"><b>الحضور والانصراف</b><button class="spn-x" onclick="attClose()">✕</button></div>
        <div class="att-st ${inT?"in":""}">${inT?(s.checkInAt&&localDateOf(s.checkInAt)===localDateOf(new Date())?`حاضر من ${localTimeOf(s.checkInAt)} ✓`:"حاضر ✓"):s.checkOutAt&&localDateOf(s.checkOutAt)===localDateOf(new Date())?`انصرفت ${localTimeOf(s.checkOutAt)}`:"للحين ما سجّلت حضور اليوم"}</div>
        <div class="att-qr">${kxQR(attStaffToken(s),230)}</div><p class="muted">قرّب الكود هذا من قارئ الـ QR على باب المركز — يسجل ${inT?"انصرافك":"حضورك"} على طول. الكود يتغير كل يوم.</p>
        ${cam?`<button class="btn btn-primary att-scan" onclick="attScan()">📷 أو امسح QR الباب بكاميرا الآيباد</button><video id="att-video" playsinline muted></video>`:""}<p class="att-msg" id="att-msg"></p></div>`;
      p.addEventListener("click",ev=>{if(ev.target===p)attClose()});document.body.appendChild(p)}
    function attClose(){if(ATT.timer){clearInterval(ATT.timer);ATT.timer=null}if(ATT.stream){ATT.stream.getTracks().forEach(t=>t.stop());ATT.stream=null}const p=document.getElementById("att-sheet");if(p)p.remove()}
    async function attScan(){const v=document.getElementById("att-video");const msg=document.getElementById("att-msg");try{const det=new BarcodeDetector({formats:["qr_code"]});ATT.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});v.srcObject=ATT.stream;v.style.display="block";await v.play();
        ATT.timer=setInterval(async()=>{try{const c=await det.detect(v);if(!c.length)return;const r=attParse(c[0].rawValue);if(!r||r.bad||r.id!=="DOOR"){if(msg)msg.textContent=r&&r.bad?r.bad:"هذا مو QR الباب";return}
          const s=sipadStaff();const nowIn=staffAttendanceMark(s,"آيباد (QR الباب)");persist();attClose();spnPush({kind:"att",title:nowIn?"انسجل حضورك ✓":"انسجل انصرافك ✓",text:"الساعة "+localTimeOf(new Date())});render()}catch(_e){}},350)}
      catch(_e){if(msg)msg.textContent="ما قدرت أفتح الكاميرا — استخدم الكود الشخصي على قارئ الباب"}}
    // زراير الجرس والحضور في شريط الآيباد
    const _spnScr=staffIpadScreen;staffIpadScreen=function(){const h=_spnScr();if(!state.sipad)return h;setTimeout(spnBell,0);
      return h.replace('<button class="ki-exit" onclick="sipadLock()">',`<button class="spn-top" onclick="attOpen()">🕘 حضور / انصراف</button><button class="spn-top spn-bell" id="spn-bell" onclick="spnPanel()">🔔</button><button class="ki-exit" onclick="sipadLock()">`)};
    Object.assign(window,{spnAct,spnClose,spnPanel,spnClear,attOpen,attClose,attScan,kioskSubmit,sipadLock});

