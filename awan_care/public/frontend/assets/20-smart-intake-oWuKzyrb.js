const t=`"use strict";
// أوان — معالجة دراسة الحالة الإلكترونية
// ١ دراسة الحالة الإلكترونية ← يفتح الملف، يحدد القسم، يحجز التقييم في جدول الأخصائي ويبلّغه — بدون الإدارة.
// ٢ نتيجة التقييم ← يحط البرنامج المناسب في كل الأقسام، ينزّل الجداول للأخصائيين، يرسل الخطة للأهل،
//    ويجهّز خطة كل قسم ويرسلها لمشرف القسم يعتمدها.
// ٣ بعد الاعتماد ← يجمع بيانات الطفل طول فترة الاشتراك ويرسلها للمشرف العام ومشرفين الأقسام كل أسبوع.
// التدخل البشري الوحيد: الأخصائي يسجّل التقييم، ومشرف القسم يعتمد خطة قسمه.

    const SM_STAGES=[
      {k:"assess",l:"التقييم محجوز",d:"عند الأخصائي — المحرك ينتظر النتيجة"},
      {k:"approve",l:"البرنامج والجداول نزلت",d:"خطط الأقسام عند المشرفين للاعتماد"},
      {k:"active",l:"متابعة مستمرة",d:"تقرير أسبوعي للمشرف العام ومشرفين الأقسام"}
    ];
    const SM_DIGEST_DAYS=7;

    (function smStyles(){
      const st=document.createElement("style");
      st.textContent=\`.sm-hero{background:linear-gradient(135deg,#063A3E,#0E8388);color:#fff;border-radius:20px;padding:20px 22px;margin-bottom:16px}
.sm-hero h2{margin:0 0 6px;font-size:20px}.sm-hero p{margin:0;opacity:.85;font-size:13px;line-height:1.8}
.sm-chain{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:14px}
.sm-chain div{background:rgba(255,255,255,.1);border-radius:12px;padding:8px 10px;font-size:11.5px;line-height:1.6}
.sm-chain div b{display:block;font-size:12px}.sm-chain .hu{background:rgba(236,174,74,.25)}
.sm-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:start;margin-bottom:22px}
.sm-log{list-style:none;margin:0;padding:0;font-size:11.5px;line-height:1.7;color:var(--muted)}
.sm-log li::before{content:"🤖 ";}.sm-log li.hu::before{content:"👤 ";}
.sm-wait{font-size:12px;font-weight:700;color:#8a5a12;background:var(--gold-2);border-radius:10px;padding:6px 9px}
.sm-dg{font-size:12px;line-height:1.8}.sm-dg b{color:var(--navy)}
@media (max-width:1100px){.sm-chain{grid-template-columns:repeat(3,1fr)}.sm-board{grid-template-columns:1fr}}\`;
      document.head.appendChild(st);
    })();

    // رسائل المحرك تطلع باسمه، مو باسم المستخدم الحالي
    function smSend(th,text){const m=cmSendTo(th,text);if(m){m.fromId=null;m.fromDept=null;m.fromName="الاستقبال";if(th==="dept:supervision"){m.toName="المشرف العام";m.ch="agent"}}return m}
    function smList(){return state.patients.filter(p=>p.smart&&!p.archived)}
    function smLog(p,t,human){p.smart.log=p.smart.log||[];p.smart.log.push({at:new Date().toISOString(),t,hu:!!human})}
    function smPlans(p){return (state.plans||[]).filter(x=>x.smartPid===p.id)}
    function smSupervisors(p){return [...new Set((p.smart.lines||[]).map(l=>l.dept))].map(d=>fdDeptSup(d)).filter(Boolean)}

    // ---- ١ دراسة الحالة وصلت: الأصلي يفتح الملف ويحجز التقييم؛ هنا نكمّل التبليغ ونسجّل المسار ----
    const _smIntakeSubmit=intakeSubmit;
    intakeSubmit=function(e){
      const bp=new Set(state.patients.map(p=>p.id));
      const out=_smIntakeSubmit.apply(this,arguments);
      const p=state.patients.find(x=>!bp.has(x.id));
      if(p)smStart(p);
      return out;
    };
    function smStart(p){
      const rec=(state.smartIntakes||[]).find(r=>r.patientId===p.id);
      const apt=rec&&state.appointments.find(a=>a.id===rec.aptId);
      p.smart={stage:"assess",at:new Date().toISOString(),dept:rec&&rec.dept,aptId:apt&&apt.id,log:[]};
      if(rec){rec.status="approved";rec.byEngine=true;rec.draftProgs=rec.draftProgs||((rec.analysis&&rec.analysis.progs)||[]).map(x=>x.prog);rec.draftGoals=rec.draftGoals||((rec.analysis&&rec.analysis.goals)||[]).map(x=>x.text)}
      smLog(p,\`استلم دراسة الحالة الإلكترونية وفتح ملف \${p.file}\`);
      smLog(p,\`حدد القسم: \${deptName(p.smart.dept)}\`);
      if(apt){
        smLog(p,\`حجز التقييم \${date(apt.date)} \${time(apt.time)} في جدول \${apt.clinician}\`);
        const s=state.staff.find(x=>x.name===apt.clinician);
        if(s&&typeof smSend==="function"&&!apt.assessmentNoticeSentAt){smSend("staff:"+s.id,\`🆕 تقييم أولي جديد في جدولك: \${p.name} — \${date(apt.date)} \${time(apt.time)}. دراسة الحالة جاهزة في ملفه.\`);smLog(p,\`بلّغ \${s.name}\`)}
      }
      persist();
    }

    // ---- ٢ نتيجة التقييم ← برنامج + جداول + خطة للأهل + خطط الأقسام ----
    function smLinesFor(p){
      const an=(caseStudyOf(p)||{}).analysis||{};
      const primary=p.smart.dept||an.primary||"speech";
      const others=(an.depts||[]).filter(d=>d.id!==primary&&d.sc>=1&&state.departments.some(x=>x.id===d.id)).slice(0,2).map(d=>d.id);
      return [{dept:primary,perWeek:3,minutes:40},...others.map(d=>({dept:d,perWeek:2,minutes:40}))];
    }
    function smAfterAssess(p,by){
      if(!p.smart||p.smart.stage!=="assess")return;
      const an=(caseStudyOf(p)||{}).analysis||{};const today=localDateOf(new Date());
      if(by)smLog(p,\`\${by} سجّل نتيجة التقييم\`,true);
      const lines=smLinesFor(p);p.smart.lines=lines;
      // البرامج في كل الأقسام المطلوبة
      p.assignedPrograms=p.assignedPrograms||[];
      lines.forEach((l,i)=>{const pr=(an.progs||[]).filter(x=>x.dept===l.dept).map(x=>x.prog);(pr.length?pr:["برنامج "+deptName(l.dept).replace(/^قسم\\s*/,"")]).forEach((prog,j)=>{if(!p.assignedPrograms.some(a=>a.program===prog))p.assignedPrograms.push({id:"ap-"+Date.now()+"-"+i+j,department:l.dept,program:prog,date:today,addedBy:"الاستقبال"})})});
      smLog(p,\`حط البرامج: \${p.assignedPrograms.map(a=>a.program).join("، ")}\`);
      // الجداول
      const plan=fdPlan(p,{start:fdNextWorkday(),weeks:4,pref:"any",picks:{}},lines);
      plan.list.forEach((a,i)=>state.appointments.push(Object.assign({id:"apt-"+Date.now()+"-sm"+i,service:deptName(a.dept)+" — جلسة علاجية",room:"غرفة "+deptName(a.dept).replace(/^قسم\\s*/,""),newForStaff:true,bookedBy:"الاستقبال",smartPid:p.id},a)));
      const byClin={};plan.list.forEach(a=>{byClin[a.clinician]=(byClin[a.clinician]||0)+1});
      Object.entries(byClin).forEach(([n,c])=>{const s=state.staff.find(x=>x.name===n);if(s&&typeof smSend==="function")smSend("staff:"+s.id,\`📅 \${p.name} انضاف لجدولك: \${c} جلسة خلال 4 أسابيع.\`)});
      smLog(p,\`نزّل الجداول: \${plan.list.length} جلسة عند \${Object.keys(byClin).join("، ")}\`);
      const first=plan.list[0];p.status="نشط";p.next=first?first.date+"T"+first.time:"";p.program=lines.map(l=>deptName(l.dept)).join(" · ");
      // الخطة للأهل
      const goals=goalsOf(p).filter(g=>g.status!=="مرفوض").map(g=>g.text);
      if(typeof smSend==="function")smSend("fam:"+p.id,\`أهلًا 🌿 هذي الخطة العلاجية لـ\${p.name.split(" ")[0]}:\\n• \${lines.map(l=>\`\${deptName(l.dept)}: \${l.perWeek} جلسات بالأسبوع\`).join("\\n• ")}\\nالأهداف: \${goals.slice(0,4).join("، ")||"تتحدد مع الأخصائي"}.\\nأول جلسة \${first?date(first.date)+" الساعة "+time(first.time)+" مع "+first.clinician:"—"}.\`);
      smLog(p,"أرسل الخطة العلاجية للأهل");
      // خطط الأقسام للمشرفين
      lines.forEach(l=>{
        if(smPlans(p).some(x=>x.department===l.dept))return;
        const spec=state.staff.find(x=>x.name===(plan.list.find(a=>a.dept===l.dept)||{}).clinician);
        const g=goalsOf(p).filter(x=>x.dept===l.dept&&x.status!=="مرفوض").map(x=>x.text);
        state.plans.unshift({id:"pl-"+Date.now()+"-"+l.dept,staffId:spec?spec.id:null,department:l.dept,patient:p.name,title:\`خطة \${deptName(l.dept)} — \${l.perWeek} جلسات/أسبوع (جهّزها أوان)\`,status:"معلقة",date:today,smartPid:p.id,goals:g});
        const sup=fdDeptSup(l.dept);if(sup&&typeof smSend==="function")smSend("staff:"+sup.id,\`📝 خطة \${deptName(l.dept)} لـ\${p.name} جاهزة وبانتظار اعتمادك.\`);
      });
      smLog(p,\`جهّز خطط الأقسام وأرسلها للمشرفين: \${smSupervisors(p).map(s=>s.name).join("، ")||"—"}\`);
      p.smart.stage="approve";p.smart.assessAt=new Date().toISOString();
      audit("الاستقبال: تجهيز البرنامج والجداول والخطة",p.name);persist();
    }
    // التقييم من آيباد الأخصائي
    const _smEvSubmit=evSubmit;
    evSubmit=function(){const r=evById(EVUI.w);const p=r&&evPatient(r);const s=sipadStaff();const out=_smEvSubmit.apply(this,arguments);if(p&&p.smart)smAfterAssess(p,s&&s.name);return out};
    // للعرض: محاكاة إن الأخصائي خلّص التقييم
    function smSimAssess(pid){
      const p=state.patients.find(x=>x.id===pid);if(!p||!p.smart)return;
      const apt=state.appointments.find(a=>a.id===p.smart.aptId);if(apt)apt.status="مكتمل";
      const an=(caseStudyOf(p)||{}).analysis||{};const g=goalsOf(p);
      (an.goals||[]).forEach(x=>{if(!g.some(y=>y.text===x.text))g.push({id:"g-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),text:x.text,dept:x.dept,domain:deptName(x.dept),source:"تقييم "+(apt?apt.clinician:"الأخصائي"),status:"مقترح"})});
      smAfterAssess(p,apt?apt.clinician:"الأخصائي");notify(\`المحرك جهّز برنامج وجداول \${p.name.split(" ")[0]} وأرسل الخطط للمشرفين\`);render();
    }

    // ---- ٣ اعتماد خطط الأقسام ← متابعة مستمرة ----
    const _smReviewPlan=reviewPlan;
    reviewPlan=function(id,decision){
      const pl=(state.plans||[]).find(x=>x.id===id);const p=pl&&pl.smartPid&&state.patients.find(x=>x.id===pl.smartPid);
      if(p&&decision==="approve"){const who=(getCurrentPerson()||{}).name||auditActor().name;
        goalsOf(p).forEach(g=>{if(g.dept===pl.department&&g.status==="مقترح"){g.status="معتمد";g.approvedBy=who;g.approvedAt=new Date().toISOString()}});
        smLog(p,\`\${who} اعتمد خطة \${deptName(pl.department)}\`,true)}
      return _smReviewPlan.apply(this,arguments);
    };
    function smTick(){
      smList().forEach(p=>{
        const S=p.smart;
        if(S.stage==="approve"){const P=smPlans(p);if(P.length&&P.every(x=>x.status==="معتمدة")){
          S.stage="active";S.activeAt=new Date().toISOString();S.lastDigest=S.activeAt;
          const first=goalsOf(p).find(g=>g.status==="معتمد");if(first)p.goal=first.text;
          smLog(p,"كل خطط الأقسام انعتمدت — بدأت المتابعة المستمرة");
          if(typeof smSend==="function")smSend("fam:"+p.id,\`✅ المشرفين اعتمدوا خطة \${p.name.split(" ")[0]}. بنرسل لكم ملخص تقدّمه أول بأول.\`);
        }}
        if(S.stage==="active"&&Date.now()-Date.parse(S.lastDigest||S.activeAt)>=SM_DIGEST_DAYS*864e5)smDigest(p);
      });
    }
    // يجمع بيانات الطفل من آخر تقرير ويرسلها للمشرف العام ومشرفين الأقسام
    function smDigest(p,manual){
      const S=p.smart;const from=(S.lastDigestFrom||S.activeAt||S.assessAt||S.at).slice(0,10);const to=localDateOf(new Date());
      const apts=state.appointments.filter(a=>a.patient===p.name&&a.date>=from&&a.date<=to&&!/تقييم/.test(a.service||""));
      const done=apts.filter(a=>a.status==="مكتمل").length,abs=apts.filter(a=>/غياب|غائب/.test(a.status||"")).length;
      const past=apts.filter(a=>a.date<to).length;const att=past?Math.round(done/past*100):null;
      const logs=(state.sessionLogs||[]).filter(l=>l.patientId===p.id&&l.date>=from);
      const goals=goalsOf(p).filter(g=>g.status==="معتمد").map(g=>{const L=logs.filter(l=>l.goalText===g.text);return {t:g.text,ok:L.filter(l=>l.result==="نجاح كامل").length,part:L.filter(l=>l.result==="نجاح جزئي").length,no:L.filter(l=>l.result==="لم ينجح بعد").length}});
      const home=(state.homeLogs||[]).filter(h=>h.patientId===p.id&&(h.date||"")>=from).length;
      const flags=[];if(att!==null&&att<75)flags.push(\`الحضور \${att}٪\`);goals.forEach(g=>{if(g.no>=3&&!g.ok)flags.push(\`«\${g.t}» ما تقدم\`)});if(!home)flags.push("ما فيه تسجيل من البيت");
      const d={id:"dg-"+Date.now(),pid:p.id,at:new Date().toISOString(),from,to,att,done,abs,goals,home,flags};
      state.smartDigests=state.smartDigests||[];state.smartDigests.unshift(d);S.lastDigest=d.at;S.lastDigestFrom=to;
      const txt=\`📊 متابعة \${p.name} (\${date(from)} – \${date(to)}): حضور \${att===null?"—":att+"٪"} · \${done} جلسة مكتملة · \${logs.length} تسجيل هدف · \${home} تسجيل من البيت\${flags.length?" · ⚠️ "+flags.join("، "):""}\`;
      if(typeof smSend==="function"){smSend("dept:supervision",txt);smSupervisors(p).forEach(s=>smSend("staff:"+s.id,txt))}
      smLog(p,\`أرسل تقرير المتابعة للمشرف العام و\${smSupervisors(p).length} مشرف قسم\`);
      persist();if(manual){notify("انرسل تقرير المتابعة للمشرفين");render()}
      return d;
    }

    // ---- الشاشة ----
    function smCard(p){
      const S=p.smart;const ini=esc((p.name||"?").charAt(0));const P=smPlans(p);
      const wait=S.stage==="assess"?(()=>{const a=state.appointments.find(x=>x.id===S.aptId);return \`ينتظر: \${a?esc(a.clinician)+" يسجّل التقييم ("+esc(date(a.date))+")":"تسجيل التقييم"}\`})()
        :S.stage==="approve"?\`ينتظر اعتماد: \${P.filter(x=>x.status!=="معتمدة").map(x=>esc(deptName(x.department))+(x.status==="معادة للتعديل"?" (معادة)":"")).join("، ")||"—"}\`
        :\`التقرير الأسبوعي الجاي: \${esc(date(localDateOf(new Date(Date.parse(S.lastDigest||S.activeAt)+SM_DIGEST_DAYS*864e5))))}\`;
      const dg=(state.smartDigests||[]).find(x=>x.pid===p.id);
      const act=S.stage==="assess"?\`<button class="btn btn-outline" onclick="smSimAssess('\${p.id}')">محاكاة: الأخصائي سجّل نتيجة التقييم</button>\`
        :S.stage==="approve"?\`<button class="btn btn-outline" onclick="setView('\${state.role==="management"||state.role==="supervisor"?"brain":"schedule"}')">\${state.role==="management"||state.role==="supervisor"?"افتح صندوق القرارات":"المواعيد"}</button>\`
        :\`<button class="btn btn-outline" onclick="smDigest(state.patients.find(x=>x.id==='\${p.id}'),1)">اجمع البيانات وأرسلها الحين</button>\`;
      return \`<article class="fd-card"><div class="fd-card-h"><span class="fd-av">\${ini}</span><div><b>\${esc(p.name)}</b><small>\${esc(p.age||"")} · \${esc(p.program||deptName(S.dept))}</small></div></div>
        \${dg&&S.stage==="active"?\`<div class="sm-dg">آخر تقرير: حضور <b>\${dg.att===null?"—":dg.att+"٪"}</b> · \${dg.done} جلسة · \${dg.home} من البيت\${dg.flags.length?\`<br><span style="color:var(--danger)">⚠️ \${esc(dg.flags.join("، "))}</span>\`:""}</div>\`:""}
        <div class="sm-wait">\${wait}</div>
        <details><summary style="cursor:pointer;font-size:12px;font-weight:700">وش سوّى المحرك (\${(S.log||[]).length})</summary><ul class="sm-log">\${(S.log||[]).map(l=>\`<li class="\${l.hu?"hu":""}">\${esc(l.t)}</li>\`).join("")}</ul></details>
        \${act}<button class="btn btn-outline" onclick="openPatient('\${p.id}')">فتح الملف</button></article>\`;
    }
    function smBoardHtml(){
      smSeed();smTick();const all=smList();
      const chain=[["دراسة الحالة","الأسرة تعبّيها من الجوال أو آيباد الاستقبال",0],["فتح الملف وحجز التقييم","في جدول أخصائي القسم + تبليغه",0],["نتيجة التقييم","الأخصائي يسجّلها على آيباده",1],["البرامج والجداول","في كل الأقسام المطلوبة + الخطة للأهل",0],["اعتماد خطط الأقسام","مشرف كل قسم يعتمد خطته",1],["متابعة مستمرة","تقرير أسبوعي للمشرف العام والأقسام",0]];
      return \`<section class="sm-hero"><h2>📋 دراسة الحالة الإلكترونية</h2><p>من استلام بيانات الأسرة إلى تجهيز الملف والتقييم والمتابعة — الخانات الذهبية هي بس اللي تحتاج تدخل الفريق.</p>
        <div class="sm-chain">\${chain.map(([b,d,h])=>\`<div class="\${h?"hu":""}"><b>\${h?"👤":"🤖"} \${esc(b)}</b>\${esc(d)}</div>\`).join("")}</div></section>
        <div class="sm-board">\${SM_STAGES.map(s=>{const L=all.filter(p=>p.smart.stage===s.k);return \`<section class="fd-col"><div class="fd-col-h"><div><b>\${esc(s.l)}</b><small>\${esc(s.d)}</small></div><em>\${L.length}</em></div>\${L.map(smCard).join("")||\`<div class="fd-empty">ما فيه ملفات هنا</div>\`}</section>\`}).join("")}</div>\`;
    }
    const _smIntakeAIView=intakeAIView;
    intakeAIView=function(){return smBoardHtml()+_smIntakeAIView.apply(this,arguments)};

    // صندوق القرارات: خطط الأطفال الآليين تطلع مرة وحدة (كخطة قسم)، بدون تكرار «أهداف مقترحة»
    const _smBrDecisions=brDecisions;
    brDecisions=function(){const ids=new Set(smList().filter(p=>p.smart.stage==="approve").map(p=>p.id));
      return _smBrDecisions.apply(this,arguments).filter(d=>!(d.src==="الأهداف"&&[...ids].some(id=>(d.acts||[]).some(a=>String(a[1]).includes(id)))))};

    // ---- بيانات تجريبية: طفل في كل مرحلة ----
    function smFields(depts,extra){const f=Object.assign({},extra);INTAKE_QS.forEach(q=>{f[q.id]=depts.includes(q.dept)?q.bad:(q.bad==="لا"?"نعم":"لا")});return f}
    function smMake(child,guardian,phone,age,reason,depts,hoursAgo){
      const f=smFields(depts,{child,guardian,phone,age,reason,relation:"الأب",gender:"ذكر"});const an=analyzeIntake(f);
      const dept=an.primary||depts[0];const clin=fdClinicians(dept).sort((a,b)=>fdLoad(a.name)-fdLoad(b.name))[0];const slot=intakeNextSlot(clin?clin.name:"");
      const num=1000+state.patients.length+1;const pid="p-"+Date.now()+Math.floor(Math.random()*90);
      const p={id:pid,name:child,file:"AWN-SRC-"+num,age,need:reason,program:deptName(dept),school:"",status:"قيد التقييم",notes:"ملف انفتح تلقائيًا من دراسة الحالة الإلكترونية.",goal:"يُحدَّد بعد التقييم الأولي",next:slot.date+"T"+slot.time,code:"AWN-"+num,schoolCode:"",guardian,phone,archived:false,assignedPrograms:[],consents:[]};
      if(typeof defaultHealth==="function")p.health=defaultHealth(p);
      p.caseStudy={fields:f,analysis:an,at:new Date(Date.now()-hoursAgo*36e5).toISOString(),by:guardian,source:"دراسة الحالة الإلكترونية"};
      state.patients.unshift(p);csSyncSuggestions(p);
      const apt={id:"apt-"+Date.now()+"-si"+num,date:slot.date,time:slot.time,patient:child,service:"تقييم أولي — "+(INTAKE_INSTRUMENTS[dept]||"تقييم شامل"),clinician:clin?clin.name:"",room:"غرفة التقييم",status:"مجدول",newForStaff:true,autoBooked:true};
      state.appointments.push(apt);
      state.smartIntakes=state.smartIntakes||[];state.smartIntakes.unshift({id:"si-"+Date.now()+num,fields:f,analysis:an,status:"draft",draftProgs:an.progs.map(x=>x.prog),draftGoals:an.goals.map(x=>x.text),submittedAt:p.caseStudy.at,patientId:pid,aptId:apt.id,clinician:apt.clinician,dept});
      smStart(p);p.smart.at=p.caseStudy.at;return p;
    }
    function smSeed(){
      if(state.smSeeded||smList().length)return;state.smSeeded=true;
      smMake("ليان سعود القحطاني","سعود القحطاني","0551110001","3 سنوات","ما تتكلم إلا كلمات قليلة وما تفهم الأوامر",["speech"],2);
      const b=smMake("نواف حمد العتيبي","حمد العتيبي","0551110002","5 سنوات","نوبات غضب وصعوبة في التركيز وتأخر في الكلام",["aba","speech"],50);
      smSimAssessQuiet(b);
      const c=smMake("رهف ماجد الشهري","ماجد الشهري","0551110003","6 سنوات","صعوبة في مسك القلم والتوازن",["ot"],400);
      smSimAssessQuiet(c);smPlans(c).forEach(x=>{x.status="معتمدة"});goalsOf(c).forEach(g=>{if(g.status==="مقترح"){g.status="معتمد";g.approvedBy="مشرف القسم";g.approvedAt=new Date().toISOString()}});
      smTick();c.smart.activeAt=new Date(Date.now()-8*864e5).toISOString();c.smart.lastDigest=c.smart.activeAt;
      const g=goalsOf(c).filter(x=>x.status==="معتمد");const spec=(state.appointments.find(a=>a.smartPid===c.id)||{}).clinician||"";
      [7,5,3,1].forEach((d,i)=>{const dt=localDateOf(new Date(Date.now()-d*864e5));state.appointments.push({id:"apt-sm-past-"+i,date:dt,time:"09:20",duration:40,patient:c.name,service:"قسم العلاج الوظيفي — جلسة علاجية",clinician:spec,room:"غرفة العلاج الوظيفي",status:i===2?"غياب":"مكتمل",smartPid:c.id});
        if(i!==2&&g[0])state.sessionLogs.unshift({id:"sl-sm-"+i,patientId:c.id,date:dt,goalText:g[i%g.length].text,result:["نجاح جزئي","نجاح كامل","","نجاح جزئي"][i]||"نجاح جزئي",notes:"",staffName:spec})});
      smDigest(c);persist();
    }
    function smSimAssessQuiet(p){const apt=state.appointments.find(a=>a.id===p.smart.aptId);if(apt)apt.status="مكتمل";smAfterAssess(p,apt?apt.clinician:"الأخصائي")}

    // ملفات قديمة من نسخة سابقة كانت تصنّف بعض الأطفال ضمن المصدر الخطأ
    state.patients.forEach(p=>{if(p.intake&&p.intake.source==="smart")p.intake.source="normal"});

    const _smRender=render;
    render=function(){try{if(smList().length)smTick()}catch(_e){}return _smRender.apply(this,arguments)};
    smSeed();
    Object.assign(window,{intakeSubmit,evSubmit,reviewPlan,intakeAIView,brDecisions,render,smSimAssess,smDigest});
`;export{t as default};
//# sourceMappingURL=20-smart-intake-oWuKzyrb.js.map
