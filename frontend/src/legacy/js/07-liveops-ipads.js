"use strict";
// أوان — الجزء 7 من 16: 07-liveops-ipads
// كل ملفات js/ هذي تشتغل كأنها ملف واحد بالترتيب — ما تغيّر ترتيبها في index.html
    // =================== المراقبة الحية + الوكلاء (Agents) + OpenAI ===================
    function ensureOps2(){if(!Array.isArray(state.liveFeed))state.liveFeed=[];if(!state.liveBoard||typeof state.liveBoard!=="object")state.liveBoard={};if(!state.agents)state.agents={intake:true,booking:true,notify:true,parentSummary:true,daily:true,alerts:true};if(!state.ai)state.ai={key:"",model:"gpt-4o-mini",enabled:false}}
    const FEED_KINDS={door:"الباب",session:"الجلسات",intake:"التسجيل والأهداف",staff:"الموظفين",system:"النظام"};
    function feedKind(a){if(/وصول طفل|خروج طفل/.test(a))return "door";if(/جلسة|محاول|هدف ·|خلص هدف|مساعدة عاجل/.test(a))return "session";if(/حضور|انصراف|دخول موظف|خروج موظف/.test(a))return "staff";if(/دراسة الحالة|ملف|هدف|خطة|برنامج|تقييم|موافقة|إحالة|موعد|حجز/.test(a))return "intake";return "system"}
    function pushFeed(action,target,who){ensureOps2();state.liveFeed.unshift({id:"f-"+Date.now()+"-"+Math.random().toString(36).slice(2,5),at:new Date().toISOString(),kind:feedKind(action),who:who||auditActor().name,text:action,target:target||""});if(state.liveFeed.length>800)state.liveFeed.length=800}
    const _auditBase=audit;
    audit=function(action,target){_auditBase(action,target);try{pushFeed(action,target)}catch(_e){}};
    // ---- لوحة آيبادات الأخصائيين: كل ضغطة تتحدث هنا ----
    function syncBoard(){
      ensureOps2();const L=dttLive();if(!L)return;
      const t=L.targets[L.cur]||L.targets[0];const person=state.staff.find(s=>s.id===L.staffId)||lsPerson();
      const tr=t?t.trials:[];
      state.liveBoard[L.staffId]={staffId:L.staffId,staff:person?person.name:"",patient:L.patient,room:L.room,target:t?t.text:"",targetNo:L.cur+1,targets:L.targets.length,trial:tr.length,pct:dttPct(tr),last:tr.slice(-10).map(x=>x.r),startedAt:L.startedAt,updatedAt:Date.now(),locked:!!L.locked,done:L.targets.filter(x=>x.trials.length>=DTT_BLOCK).length,panic:!!(L.panicArm===0&&L._panicSent)};
      const _apt=state.appointments.find(x=>x.id===L.aptId);const _prev=state.liveBoard[L.staffId];
      state.liveBoard[L.staffId].detail={aptId:L.aptId,service:L.service||"",cur:L.cur,note:L.note||"",sched:_apt?Date.parse(_apt.date+"T"+_apt.time):null,targets:L.targets.map(x=>({text:x.text,domain:x.domain,trials:x.trials.map(y=>({r:y.r,at:y.at}))}))};
    }
    const _st=startLiveSession;startLiveSession=function(...a){const r=_st.apply(this,a);syncBoard();persist();return r};
    const _tr=liveTrial;liveTrial=function(k){const L=dttLive();const idx=L?L.cur:0;const before=L&&L.targets[idx]?L.targets[idx].trials.length:0;const r=_tr.call(this,k);const L2=dttLive();
      if(L2&&before===DTT_BLOCK-1&&L2.targets[idx]&&L2.targets[idx].trials.length===DTT_BLOCK){const tt=L2.targets[idx];pushFeed(`خلص هدف «${tt.text}» · ${dttPct(tt.trials)}% I`,L2.patient,lsPerson().name)}
      syncBoard();persist();return r};
    const _un=liveUndo;liveUndo=function(...a){const r=_un.apply(this,a);syncBoard();persist();return r};
    const _sel=liveSelectGoal;liveSelectGoal=function(...a){const r=_sel.apply(this,a);syncBoard();persist();return r};
    const _end=liveEndSession;liveEndSession=function(...a){
      const L=dttLive();const r=_end.apply(this,a);const L2=dttLive();
      if(L2&&L2.locked){syncBoard();
        if(state.agents.parentSummary&&L2.patientId){const parts=L2.targets.filter(x=>x.trials.length).map(x=>`• ${x.text}: ${dttPct(x.trials)}% استجابة مستقلة`);
          state.messages.unshift({id:"msg-"+Date.now()+"-ps",fromId:null,fromName:state.center.name+" (ملخص آلي)",fromDept:"reception",toId:null,toName:null,toDept:"family",patientId:L2.patientId,text:`جلسة ${L2.patient.split(" ")[0]} اليوم مع ${lsPerson().name} خلصت.\n${parts.join("\n")||"اشتغلنا على أهداف الخطة."}\nتقدروا تتابعوا التقدم من البوابة.`,date:todayISO(),kind:"رسالة",status:"مُرسلة",read:false});
          pushFeed("ملخص الجلسة انرسل لولي الأمر تلقائيًا",L2.patient,"وكيل ولي الأمر")}
        persist()}
      return r};
    const _pn=livePanic;livePanic=function(...a){const L=dttLive();const armed=L&&L.panicArm&&Date.now()-L.panicArm<4000;const r=_pn.apply(this,a);if(armed&&L){ensureOps2();const b=state.liveBoard[L.staffId];if(b){b.panicAt=Date.now()}persist()}return r};
    // ---- الباب: الطفل يسجل وصوله بكود الأسرة في نفس الكيوسك ----
    const _kiosk=kioskSubmit;
    kioskSubmit=function(e){
      const inp=e.target.querySelector("input");const code=(inp.value||"").trim().toLowerCase();
      const p=state.patients.find(x=>(x.code||"").toLowerCase()===code);
      if(!p||state.staff.some(s=>(s.code||"").toString().trim().toLowerCase()===code))return _kiosk.call(this,e);
      e.preventDefault();ensureOps2();
      const today=localDateOf(new Date());const now=new Date();
      const apt=state.appointments.filter(a=>a.patient===p.name&&a.date===today&&a.status!=="ملغي").sort((a,b)=>a.time.localeCompare(b.time))[0];
      const visits=state.childVisits||(state.childVisits=[]);
      let v=visits.find(x=>x.patientId===p.id&&x.date===today&&!x.outAt);
      let msg;
      if(!v){v={id:"cv-"+Date.now(),patientId:p.id,name:p.name,date:today,inAt:now.toISOString(),aptId:apt?apt.id:null};visits.unshift(v);if(apt)apt.arrivedAt=now.toISOString();
        audit("وصول طفل"+(apt?` · موعد ${time(apt.time)} مع ${apt.clinician}`:" · بدون موعد اليوم"),p.name);
        const th=apt&&state.staff.find(s=>s.name===apt.clinician);
        if(th&&state.agents.notify)state.messages.unshift({id:"msg-"+Date.now()+"-arr",fromId:null,fromName:"الاستقبال (آلي)",toId:th.id,toName:th.name,text:`${p.name} وصل المركز الساعة ${localTimeOf(now)} · جلستك ${time(apt.time)} · ${apt.room}`,date:todayISO(),read:false});
        msg=`أهلًا بـ ${p.name.split(" ")[0]} 👋 انسجل وصوله الساعة ${localTimeOf(now)}${apt?` · جلسته ${time(apt.time)} مع ${apt.clinician}`:""}`;
      }else{v.outAt=now.toISOString();audit("خروج طفل",p.name);msg=`مع السلامة ${p.name.split(" ")[0]} · انسجل خروجه الساعة ${localTimeOf(now)}`}
      state.kioskMsg={ok:true,text:msg};persist();render();setTimeout(()=>{const i=document.getElementById("kiosk-input");if(i)i.focus()},30);
    };
    // ---- تسجيل باقي الحركات في السجل والبث الحي ----
    addPatient=_auditWrap(addPatient,"إضافة ملف مستفيد",()=>{const p=state.patients[0];return p?p.name:""});
    addAppointment=_auditWrap(addAppointment,"إضافة موعد",()=>{const a=state.appointments[state.appointments.length-1];return a?a.patient:""});
    saveAppointment=_auditWrap(saveAppointment,"تعديل موعد");
    deleteAppointment=_auditWrap(deleteAppointment,"حذف موعد");
    addStaff=_auditWrap(addStaff,"إضافة موظف",()=>{const s=state.staff[state.staff.length-1];return s?s.name:""});
    addReferral=_auditWrap(addReferral,"إضافة إحالة",()=>"");
    advanceReferral=_auditWrap(advanceReferral,"تحديث حالة إحالة",()=>"");
    submitNewBooking=_auditWrap(submitNewBooking,"حجز جديد من بوابة الأسرة",()=>"");
    confirmReschedule=_auditWrap(confirmReschedule,"تغيير موعد",()=>"");
    cancelBooking=_auditWrap(cancelBooking,"إلغاء حجز",()=>"");

    // ---- شاشة المراقبة الحية ----
    function _liveOpsViewOld(){
      ensureOps2();const today=localDateOf(new Date());const now=Date.now();
      const boards=Object.values(state.liveBoard).filter(b=>!b.locked||now-b.updatedAt<15*60000).sort((a,b)=>b.updatedAt-a.updatedAt);
      const running=boards.filter(b=>!b.locked);
      const visits=(state.childVisits||[]).filter(v=>v.date===today);
      const todayFeed=state.liveFeed.filter(f=>localDateOf(f.at)===today);
      const cnt=re=>todayFeed.filter(f=>re.test(f.text)).length;
      const kf=state.opsFilter||"all";
      const feed=state.liveFeed.filter(f=>kf==="all"||f.kind===kf).slice(0,80);
      const present=state.staff.filter(s=>s.present).length;
      let h=head("مباشر","المراقبة الحية","كل ضغطة على آيباد أخصائي، وكل دخول وخروج من الباب، وكل تسجيل أو هدف — يظهر هنا لحظتها.",`<button class="btn btn-outline" onclick="opsDaily()">${ic("chart",14)} ملخص اليوم</button>`);
      h+=`<section class="metric-grid ops-kpis">${metric("team","موظفين في المركز",present,"من "+state.staff.length)}${metric("patients","أطفال في المركز الآن",visits.filter(v=>!v.outAt).length,visits.length+" وصلوا اليوم")}${metric("target","جلسات شغالة الآن",running.length,"على آيبادات الأخصائيين")}${metric("check","جلسات انقفلت اليوم",cnt(/^قفل جلسة/),"")}${metric("clipboardCheck","دراسات حالة اليوم",cnt(/دراسة الحالة/),"")}${metric("star","أهداف اعتُمدت اليوم",cnt(/اعتماد (هدف|\d+ أهداف|خطة)/),"")}</section>`;
      if(state.opsDaily)h+=`<section class="card" style="margin-top:14px"><div class="card-head"><h2>${ic("chart",16)} ملخص اليوم ${state.opsDaily.ai?`<span class="pill pill-blue">OpenAI</span>`:`<span class="pill pill-grey">قواعد</span>`}</h2><button class="btn btn-outline" onclick="opsDailyClose()">إغلاق</button></div><div style="white-space:pre-wrap;line-height:2">${esc(state.opsDaily.text)}</div></section>`;
      h+=`<section class="card" style="margin-top:14px"><div class="card-head"><h2><span class="ai-live-dot"></span> آيبادات الأخصائيين الآن</h2><span class="muted">${running.length?"تتحدث مع كل ضغطة":"ما فيه جلسة مفتوحة الحين"}</span></div>
        ${boards.length?`<div class="ops-boards">${boards.map(b=>{const ago=Math.round((now-b.updatedAt)/1000);const panic=b.panicAt&&now-b.panicAt<10*60000;
          return `<div class="ops-board ${b.locked?"done":""} ${panic?"panic":""}"><div class="spread-row"><b>${esc(b.staff)}</b><span class="muted">${b.locked?"انقفلت":ago<60?"آخر ضغطة من "+ago+" ث":"من "+Math.round(ago/60)+" د"}</span></div>
            <div class="ops-child">${esc(b.patient)} <span class="muted">· ${esc(b.room||"")}</span></div>
            ${panic?`<div class="ai-red">🔴 طلب مساعدة عاجل</div>`:""}
            <div class="ops-target"><small>الهدف ${b.targetNo} من ${b.targets} · خلص ${b.done}</small><b>${esc(b.target)}</b></div>
            <div class="ai-prog"><i style="width:${Math.min(b.trial,DTT_BLOCK)/DTT_BLOCK*100}%"></i></div>
            <div class="spread-row"><div class="dt-dots">${(b.last||[]).map(c=>`<span class="dt-dot ${(DTT_CODES.find(x=>x.k===c)||{}).c}" style="width:26px;height:26px;font-size:10px">${c}</span>`).join("")||`<span class="muted">للحين ما فيه محاولات</span>`}</div><b class="ops-pct">${b.pct==null?"—":b.pct+"%"}</b></div>
            <small class="muted">المحاولة ${b.trial}/${DTT_BLOCK} · من ${Math.round((now-b.startedAt)/60000)} دقيقة</small></div>`}).join("")}</div>`:`<div class="empty">أول ما أخصائي يفتح جلسة على الآيباد بتظهر هنا، وكل ضغطة I / C / P / NR تتحدث لحظتها.</div>`}</section>`;
      h+=`<div class="grid-2" style="margin-top:14px"><section class="card"><div class="card-head"><h2>من الباب للجلسة · اليوم</h2><span class="muted">${visits.length} طفل</span></div>
        <div class="list">${visits.length?visits.map(v=>{const a=state.appointments.find(x=>x.id===v.aptId);const b=Object.values(state.liveBoard).find(x=>x.patient===v.name);return `<div class="list-row"><div class="list-main"><strong>${esc(v.name)}</strong><small>وصل ${localTimeOf(v.inAt)}${a?` · موعد ${time(a.time)} مع ${esc(a.clinician)}`:""}${b?` · ${b.locked?"الجلسة خلصت":"في الجلسة الآن"}`:""}${v.outAt?` · خرج ${localTimeOf(v.outAt)}`:""}</small></div><div class="list-end">${v.outAt?pill("خرج"):b&&!b.locked?`<span class="pill pill-good">في الجلسة</span>`:`<span class="pill pill-gold">في المركز</span>`}</div></div>`}).join(""):`<div class="empty">الطفل يسجل وصوله بكود الأسرة على كيوسك الحضور، بيظهر هنا.</div>`}</div></section>
        <section class="card"><div class="card-head"><h2>البث الحي للأحداث</h2></div><div class="ops-filters">${[["all","الكل"],...Object.entries(FEED_KINDS)].map(([k,l])=>`<button class="${kf===k?"on":""}" onclick="opsFilter('${k}')">${l}</button>`).join("")}</div>
        <div class="ops-feed">${feed.length?feed.map(f=>`<div class="ops-ev k-${f.kind}"><time>${localTimeOf(f.at)}</time><div><b>${esc(f.text)}</b>${f.target?` · ${esc(f.target)}`:""}<small>${esc(f.who)} · ${FEED_KINDS[f.kind]||""}</small></div></div>`).join(""):`<div class="empty">للحين ما فيه أحداث.</div>`}</div></section></div>`;
      return h;
    }
    function opsFilter(k){state.opsFilter=k;render()}
    function liveOpsStrip(){
      ensureOps2();const now=Date.now();const running=Object.values(state.liveBoard).filter(b=>!b.locked).length;const today=localDateOf(new Date());
      const inC=(state.childVisits||[]).filter(v=>v.date===today&&!v.outAt).length;const last=state.liveFeed[0];
      return `<section class="ai-banner ops-strip" onclick="setView('liveOps')" role="button" tabindex="0"><span class="ai-live-dot"></span><div><b>مباشر من المركز</b><small>${running} جلسة شغالة · ${inC} طفل في المركز · ${state.staff.filter(s=>s.present).length} موظف حاضر${last?` · آخر حدث ${localTimeOf(last.at)}: ${esc(last.text)}${last.target?" ("+esc(last.target)+")":""}`:""}</small></div><span class="btn btn-primary">المراقبة الحية</span></section>`;
    }

    // ---- OpenAI ----
    function aiReady(){ensureOps2();return !!(state.ai.enabled&&state.ai.key)}
    async function openaiJSON(system,user){
      const res=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+state.ai.key},
        body:JSON.stringify({model:state.ai.model||"gpt-4o-mini",temperature:0.2,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:user}]})});
      if(!res.ok){const t=await res.text();throw new Error("OpenAI "+res.status+": "+t.slice(0,160))}
      const j=await res.json();return JSON.parse(j.choices[0].message.content);
    }
    // تجهيل: ما فيه أسماء ولا أرقام ولا أكواد تطلع برا الجهاز
    function deidentify(text,p){let t=String(text||"");[p&&p.name,p&&p.guardian,p&&p.phone,p&&p.code,p&&p.file].filter(Boolean).forEach(x=>{x.split(" ").filter(w=>w.length>2).forEach(w=>{t=t.split(w).join("[مُخفى]")})});return t.replace(/05\d{8}/g,"[رقم]").replace(/\b\d{9,}\b/g,"[رقم]")}
    async function aiCaseGoals(pid){
      const p=state.patients.find(x=>x.id===pid);const cs=caseStudyOf(p);if(!p||!cs)return;
      if(!aiReady()){notify("فعّل ربط OpenAI من «الوكلاء الأذكياء» الأول");return}
      state.aiBusy=pid;render();
      try{
        const f=cs.fields;const answers=INTAKE_QS.filter(q=>f[q.id]).map(q=>`${q.t} → ${f[q.id]}`).join("\n");
        const user=`عمر الطفل: ${deidentify(f.age||p.age,p)}\nأول كلمة (شهور): ${f.milestoneFirstWord||"؟"}\nأول جملة (شهور): ${f.milestoneSentence||"؟"}\nالمشي (شهور): ${f.milestoneWalking||"؟"}\nفحص السمع: ${f.hearingChecked||"؟"}\nوصف ولي الأمر: ${deidentify(f.reason,p)}\nإجابات مؤشرات النمو:\n${answers}\nالأهداف المقترحة حاليًا من القواعد:\n${goalsOf(p).map(g=>"- "+g.text).join("\n")}`;
        const sys=`أنت مساعد لأخصائيي التخاطب وتحليل السلوك في مركز سعودي. من دراسة الحالة اقترح حتى 4 أهداف مبدئية قابلة للقياس (SMART) مختلفة عن الموجودة، بالعربي، مع المجال والسبب من دراسة الحالة. هذا اقتراح لمسودة يراجعها أخصائي مرخّص، مو تشخيص. رجّع JSON فقط بالشكل: {"goals":[{"text":"...","domain":"...","why":"..."}],"flags":["..."]}`;
        const out=await openaiJSON(sys,user);
        let n=0;(out.goals||[]).slice(0,4).forEach(g=>{if(g&&g.text&&!goalsOf(p).some(y=>y.text===g.text)){goalsOf(p).push({id:"g-ai-"+Date.now()+"-"+n,text:String(g.text).slice(0,160),domain:String(g.domain||"").slice(0,60),dept:(caseStudyOf(p).analysis.primary)||"speech",source:"OpenAI",why:String(g.why||"").slice(0,240),status:"مقترح"});n++}});
        audit(`وكيل الاستقبال (OpenAI) اقترح ${n} أهداف`,p.name);persist();notify(`الذكاء الاصطناعي اقترح ${n} أهداف جديدة بانتظار الاعتماد`);
      }catch(err){notify("ما قدرت أوصل لـ OpenAI: "+err.message.slice(0,80))}
      state.aiBusy=null;render();
    }
    function dailyRulesText(){
      ensureOps2();const today=localDateOf(new Date());const F=state.liveFeed.filter(f=>localDateOf(f.at)===today);const c=re=>F.filter(f=>re.test(f.text)).length;
      const visits=(state.childVisits||[]).filter(v=>v.date===today);
      const boards=Object.values(state.liveBoard).filter(b=>localDateOf(new Date(b.updatedAt))===today);
      const lines=[`ملخص يوم ${date(today)}`,"",`• الموظفين: ${c(/تسجيل حضور/)} حضور · ${c(/تسجيل انصراف/)} انصراف · حاضر الآن ${state.staff.filter(s=>s.present).length}`,`• الأطفال: ${visits.length} وصلوا · ${visits.filter(v=>v.outAt).length} خرجوا`,`• الجلسات: ${c(/^بدء جلسة/)} بدأت · ${c(/^قفل جلسة/)} انقفلت · ${c(/خلص هدف/)} هدف خلص بلوك الـ 10 محاولات`,`• دراسات الحالة: ${c(/دراسة الحالة/)} · أهداف اعتُمدت: ${c(/اعتماد/)}`,`• طلبات مساعدة عاجلة: ${c(/مساعدة عاجل/)}`,`• ملفات انفتحت: ${c(/^فتح ملف/)} · تعديلات: ${c(/^تعديل/)}`];
      if(boards.length){lines.push("","متوسط الاستجابة المستقلة في الجلسات:");boards.forEach(b=>lines.push(`- ${b.staff}: ${b.pct==null?"—":b.pct+"%"} (${b.patient.split(" ")[0]})`))}
      return lines.join("\n");
    }
    async function opsDaily(){
      ensureOps2();const base=dailyRulesText();state.opsDaily={text:base,ai:false};render();
      if(aiReady()&&state.agents.daily){
        try{const stats=base.split("\n").map(l=>l.replace(/\(([^)]+)\)$/,"")).join("\n");
          const out=await openaiJSON(`أنت مساعد إداري لمدير مركز تأهيل في السعودية. اكتب ملخص يوم قصير بالعربي للمدير: أهم 3 ملاحظات، وأي شيء يحتاج تدخله، من الأرقام فقط. رجّع JSON: {"summary":"..."}`,stats);
          if(out.summary){state.opsDaily={text:out.summary+"\n\n—\n"+base,ai:true};pushFeed("وكيل التقرير اليومي جهّز ملخص اليوم","","OpenAI")}}
        catch(err){state.opsDaily.text+="\n\n(ما قدرت أوصل لـ OpenAI، هذا ملخص القواعد)"}
        persist();render();
      }
    }
    function opsDailyClose(){state.opsDaily=null;render()}
    // ---- شاشة الوكلاء ----
    function agentsView(){
      ensureOps2();const A=state.agents;
      const list=[
        ["intake","وكيل الاستقبال","يحلل دراسة الحالة وهي تتكتب، ويطلع الأقسام والبرامج والأهداف المقترحة والإحالات الطبية.","قواعد"+(aiReady()?" + OpenAI":"")],
        ["booking","وكيل الحجز","يفتح ملف الطفل ويحجز التقييم الأولي مع الأخصائي الأقل مواعيد في أول وقت فاضي.","تلقائي",1],
        ["notify","وكيل الإشعارات","يبلغ المشرف بدراسات الحالة الجديدة، والأخصائي بوصول طفله للمركز، والمشرف بطلبات المساعدة.","تلقائي"],
        ["parentSummary","وكيل ولي الأمر","أول ما الجلسة تتقفل يرسل لولي الأمر ملخص بالأهداف ونسبها على البوابة.","تلقائي"],
        ["daily","وكيل التقرير اليومي","يجهز ملخص اليوم للمدير من كل الحركات المسجلة.","قواعد"+(aiReady()?" + OpenAI":"")],
        ["alerts","وكيل المتابعة","سجل التدقيق والبث الحي لكل حركة، والتنبيهات للمشرف والمدير.","تلقائي",1]];
      return head("الوكلاء الأذكياء","المنظومة تشتغل لوحدها","كل وكيل يعمل شغلانة كان يعملها موظف أو ورقة. الإنسان يتدخل في حاجتين بس: اعتماد الخطة، والرد على طلب المساعدة.","")
      +`<section class="agents-grid">${list.map(([k,t,d,mode,fixed])=>`<div class="agent ${fixed||A[k]?"on":""}"><div class="spread-row"><b>${t}</b>${fixed?"":`<label class="switch"><input type="checkbox" ${A[k]?"checked":""} onchange="agentToggle('${k}',this.checked)"><span></span></label>`}</div><p class="muted">${d}</p><span class="pill ${fixed||A[k]?"pill-good":"pill-grey"}">${fixed?"شغال دايمًا":A[k]?"شغال":"متوقف"} · ${mode}</span></div>`).join("")}</section>`
      +`<section class="card" style="margin-top:16px"><div class="card-head"><h2>ربط OpenAI</h2>${aiReady()?`<span class="pill pill-good">متصل</span>`:`<span class="pill pill-grey">غير مفعّل</span>`}</div>
        <form onsubmit="aiSave(event)" class="form-grid" autocomplete="off"><div class="field"><label>مفتاح API</label><input class="input" type="password" name="key" value="${esc(state.ai.key||"")}" placeholder="sk-..." style="direction:ltr"></div><div class="field"><label>النموذج</label><input class="input" name="model" value="${esc(state.ai.model||"gpt-4o-mini")}" style="direction:ltr"></div>
        <label class="consent-row full" style="grid-column:1/-1"><input type="checkbox" name="enabled" ${state.ai.enabled?"checked":""}><span>تفعيل الذكاء الاصطناعي في وكيل الاستقبال ووكيل التقرير اليومي. البيانات تنرسل مُجهّلة: من غير اسم الطفل أو ولي الأمر أو رقم الجوال أو الكود.</span></label>
        <div class="ai-actions" style="grid-column:1/-1"><button class="btn btn-primary" type="submit">حفظ</button><button class="btn btn-outline" type="button" onclick="aiTest()">اختبار الاتصال</button><span class="muted" id="ai-test-res"></span></div></form>
        <div class="notice" style="margin-top:12px;line-height:1.9"><b>قبل التشغيل الفعلي:</b><br>• المفتاح هنا محفوظ على الجهاز هذا بس. في النسخة الكاملة لازم يكون على السيرفر ومحد يشوفه.<br>• بيانات الأطفال الصحية «بيانات حساسة» في نظام حماية البيانات الشخصية، وإرسالها لخوادم برا المملكة لها ضوابط. عشان كذا التجهيل شغال دايمًا، والأفضل في التشغيل الفعلي خدمة ذكاء اصطناعي مستضافة داخل المملكة أو اتفاقية معالجة بيانات واضحة.<br>• الذكاء الاصطناعي يقترح بس. الخطة والأهداف تتعتمد من المشرف المرخّص.</div></section>`;
    }
    function agentToggle(k,on){ensureOps2();state.agents[k]=on;audit((on?"تشغيل ":"إيقاف ")+"وكيل: "+k,"");persist();render()}
    function aiSave(e){e.preventDefault();ensureOps2();const f=new FormData(e.target);state.ai.key=(f.get("key")||"").trim();state.ai.model=(f.get("model")||"gpt-4o-mini").trim();state.ai.enabled=!!f.get("enabled");audit("تعديل إعدادات OpenAI","");persist();notify("انحفظت إعدادات الذكاء الاصطناعي");render()}
    async function aiTest(){const el=document.getElementById("ai-test-res");if(!state.ai.key){if(el)el.textContent="اكتب المفتاح واحفظ الأول";return}if(el)el.textContent="بجرّب...";try{const out=await openaiJSON('رجّع JSON: {"ok":true}',"اختبار");if(el)el.textContent=out.ok?"✓ الاتصال شغال":"رد غير متوقع"}catch(err){if(el)el.textContent="✗ "+err.message.slice(0,120)}}

    // =================== الإدارة الرقمية (التاب الجديدة) + آيباد الاستقبال ===================
    function digitalView(){
      ensureIntakeState();ensureOps2();const today=localDateOf(new Date());const now=Date.now();
      const live=state.smartIntakes.filter(x=>x.status==="live"&&x.fields&&Object.values(x.fields).some(v=>String(v).trim()));
      const drafts=state.smartIntakes.filter(x=>x.status==="draft");
      const booked=state.appointments.filter(a=>a.autoBooked&&a.status==="مجدول"&&a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      const visits=(state.childVisits||[]).filter(v=>v.date===today);const inC=visits.filter(v=>!v.outAt);
      const boards=Object.values(state.liveBoard);const running=boards.filter(b=>!b.locked);const closed=boards.filter(b=>b.locked&&localDateOf(new Date(b.updatedAt))===today);
      const isClin=state.role==="management"||state.role==="supervisor";
      const P=state.patients.filter(p=>!p.archived);const pc=n=>P.length?Math.round(n/P.length*100):0;
      const withCS=P.filter(p=>caseStudyOf(p)).length;
      const withConsent=P.filter(p=>typeof consentStatus==="function"&&consentStatus(p,"treatment").st==="active").length;
      const withGoals=P.filter(p=>(p.goals||[]).some(g=>g.status==="معتمد")).length;
      const attKiosk=(state.attendanceLog||[]).filter(x=>localDateOf(x.at)===today);const attK=attKiosk.filter(x=>/كيوسك/.test(x.method)).length;
      const score=Math.round((pc(withCS)+pc(withConsent)+pc(withGoals)+(attKiosk.length?Math.round(attK/attKiosk.length*100):0))/4);
      const tile=(icon,title,desc,onclick,primary)=>`<button class="dg-tile ${primary?"primary":""}" onclick="${onclick}"><span class="dg-ico">${ic(icon,26)}</span><b>${title}</b><small>${desc}</small></button>`;
      let h=head("الإدارة الرقمية","مركز بلا ورق — من الباب للجلسة","كل خطوة في رحلة الطفل تتعمل على الآيباد، بتتسجل لحظتها، بتوصل للمشرف والمدير.","");
      h+=`<section class="dg-tiles">
        ${tile("clipboardCheck","دراسة حالة على آيباد الاستقبال","سلّمي الآيباد لولي الأمر: شاشة كاملة بخطوات بسيطة، والمحرك يحلل وهو يكتب","openIntakeKiosk()",true)}
        ${tile("pulse","آيباد الأخصائيين","كل أخصائية تدخل بكودها: جدول اليوم بالاستراحة والتقارير، وDTT بضغطة","openStaffIpad()")}
        ${tile("idcard","كيوسك الباب","الموظف بكوده، والطفل بكود الأسرة: حضور ووصول وخروج","setView('attendance');kioskFull(true)")}
        ${tile("chat","أرسلي دراسة الحالة لولي الأمر","رابط يملاه من جواله قبل ما ييجي المركز","dgShareLink()")}
        ${isClin?tile("pulse","المراقبة الحية","آيبادات الأخصائيين والباب وكل حركة لحظة بلحظة","setView('liveOps')"):""}
        ${isClin?tile("idea","مسودات الخطط","دراسات الحالة اللي المحرك حللها بتستنى اعتماد","setView('intakeAI')"):""}
        ${state.role==="management"?tile("bell","الوكلاء الأذكياء","وش اللي يشتغل لوحده، وربط OpenAI","setView('agents')"):""}
      </section>`;
      if(state.dgShare)h+=`<section class="card" style="margin-top:14px"><div class="card-head"><h2>رابط دراسة الحالة لولي الأمر</h2><button class="btn btn-outline" onclick="dgShareClose()">إغلاق</button></div><p class="muted" style="margin-top:0">ولي الأمر يفتح الرابط من جواله ويملا دراسة الحالة، بتوصلكم لحظتها. الرابط هذا يشاور على نسخة المنصة اللي عندك؛ لما المنصة تترفع على دومين أوان بيصير رابط ثابت.</p><div class="dg-link"><code id="dg-link">${esc(state.dgShare)}</code><button class="btn btn-primary" onclick="dgCopy()">نسخ الرابط</button><a class="btn btn-outline" target="_blank" rel="noopener" href="${waLink("أهلاً بحضرتك 🌿 عشان نجهز لطفلك من أول زيارة، نرجو تعبئة دراسة الحالة الإلكترونية (5 دقايق): "+state.dgShare)}">${ic("chat",14)} إرسال واتساب</a></div></section>`;
      h+=`<section class="card" style="margin-top:14px"><div class="card-head"><h2>رحلة اليوم من الباب للجلسة</h2><span class="muted">تتحدث لوحدها</span></div><div class="dg-pipe">
        ${[["دراسات تتكتب الآن",live.length,live.slice(0,4).map(r=>esc((r.fields.child||"بدون اسم للحين").trim())),"setView('"+(isClin?"intakeAI":"digital")+"')"],
          ["خطط تستنى الاعتماد",drafts.length,drafts.slice(0,4).map(r=>esc(r.fields.child||"")),isClin?"setView('intakeAI')":""],
          ["تقييمات انحجزت آلي",booked.length,booked.slice(0,4).map(a=>`${esc(a.patient)} · ${date(a.date)}`),""],
          ["أطفال في المركز",inC.length,inC.slice(0,4).map(v=>`${esc(v.name)} · ${localTimeOf(v.inAt)}`),""],
          ["جلسات شغالة",running.length,running.slice(0,4).map(b=>`${esc(b.patient)} · ${b.trial}/10`),isClin?"setView('liveOps')":""],
          ["جلسات انقفلت اليوم",closed.length,closed.slice(0,4).map(b=>`${esc(b.patient)} · ${b.pct==null?"—":b.pct+"%"}`),""]]
          .map(([t,n,items,go],i)=>`<div class="dg-stage" ${go?`onclick="${go}" role="button" tabindex="0"`:""}><div class="dg-n">${n}</div><b>${t}</b><div class="dg-items">${items.length?items.map(x=>`<span>${x}</span>`).join(""):`<span class="muted">—</span>`}</div>${i<5?`<i class="dg-arrow">←</i>`:""}</div>`).join("")}
      </div></section>`;
      if(isClin)h+=`<section class="card" style="margin-top:14px"><div class="card-head"><h2>مؤشر الرقمنة</h2><span class="dg-score">${score}%</span></div><div class="dg-meters">
        ${[["ملفات عليها دراسة حالة رقمية",withCS],["ملفات عليها موافقة علاج إلكترونية",withConsent],["ملفات عليها أهداف معتمدة من دراسة الحالة",withGoals]].map(([l,n])=>`<div class="dg-meter"><div class="spread-row"><span>${l}</span><b>${n} من ${P.length}</b></div><div class="ai-prog"><i style="width:${pc(n)}%"></i></div></div>`).join("")}
        <div class="dg-meter"><div class="spread-row"><span>حضور اليوم من الكيوسك</span><b>${attK} من ${attKiosk.length}</b></div><div class="ai-prog"><i style="width:${attKiosk.length?Math.round(attK/attKiosk.length*100):0}%"></i></div></div></div>
        <p class="muted" style="font-size:11.5px;margin-top:10px">المؤشر يوصل 100% لما كل ملف يصير عليه دراسة حالة وموافقة وأهداف معتمدة، وكل الحضور يتسجل من الكيوسك.</p></section>`;
      return h;
    }
    function dgShareLink(){state.dgShare=location.href.split("#")[0]+"#case";audit("مشاركة رابط دراسة الحالة","");render()}
    function dgShareClose(){state.dgShare=null;render()}
    function dgCopy(){const t=state.dgShare||"";const fb=()=>{const r=document.createRange();r.selectNodeContents(document.getElementById("dg-link"));const g=getSelection();g.removeAllRanges();g.addRange(r);notify("الرابط متحدد، انسخيه")};try{navigator.clipboard.writeText(t).then(()=>notify("انتسخ الرابط"),fb)}catch(_e){fb()}}
    // ---- آيباد الاستقبال: دراسة الحالة بشاشة كاملة وبخطوات ----
    const KI_STEPS=["الطفل وولي الأمر","الصحة والنمو","مؤشرات النمو","وصف الحالة والموافقة"];
    function openIntakeKiosk(){state.intakeKiosk=true;try{sessionStorage.setItem("awan-kiosk","1")}catch(_e){}state.kiDone=null;audit("فتح دراسة الحالة على آيباد الاستقبال","");persist();render();window.scrollTo(0,0);dttWake(true)}
    function closeIntakeKiosk(){if(!state.kiExitArm||Date.now()-state.kiExitArm>4000){state.kiExitArm=Date.now();render();setTimeout(()=>{if(state.kiExitArm){state.kiExitArm=0;render()}},4100);return}state.kiExitArm=0;state.intakeKiosk=false;try{sessionStorage.removeItem("awan-kiosk")}catch(_e){}state.kiDone=null;dttWake(false);persist();render()}
    function kioskIntakeScreen(){
      const exitArm=state.kiExitArm&&Date.now()-state.kiExitArm<4000;
      const top=`<header class="ki-top"><div class="ki-brand"><span class="ki-mark">${typeof mark==="function"?mark(26,"#a7c2b3","#e4aa54"):""}</span><div><b>${esc(state.center.name)}</b><small>دراسة الحالة الإلكترونية</small></div></div><button class="ki-exit ${exitArm?"arm":""}" onclick="closeIntakeKiosk()">${exitArm?"اضغطي ثاني للخروج":"خروج الموظف"}</button></header>`;
      if(state.kiDone)return `<div class="ki">${top}<main class="ki-main"><div class="ki-done"><div class="dt-done-mark">✓</div><h1>شكرًا لكم 🌿</h1><div id="portal-result">${state.kiDone}</div><p class="muted">سلّموا الآيباد للاستقبال لو سمحتم.</p><button class="btn btn-primary ki-big" onclick="kiNew()">دراسة حالة لطفل ثاني</button></div></main></div>`;
      const opt=(q)=>["نعم","أحيانًا","لا"].map(v=>`<label class="ai-opt"><input type="radio" name="${q.id}" value="${v}" required><span>${v}</span></label>`).join("");
      const sel=(n,opts,req)=>`<select class="select" name="${n}" ${req?"required":""}><option value="">اختاري</option>${opts.map(o=>`<option>${o}</option>`).join("")}</select>`;
      return `<div class="ki">${top}<main class="ki-main">
        <div class="ki-progress"><div class="ki-steps">${KI_STEPS.map((s,i)=>`<span class="ki-dot" data-i="${i}"><b>${i+1}</b>${s}</span>`).join("")}</div><div class="ai-prog"><i id="ai-progress" style="width:0%"></i></div><small class="muted">اكتمال <span id="ai-progress-lab">0%</span> · كل إجابة تتحفظ لحظتها</small></div>
        <form id="ki-form" onsubmit="kiSubmit(event)" oninput="intakeTyping(this)" onchange="intakeTyping(this)" autocomplete="off" novalidate>
          <section class="ki-step" data-step="0"><h2>بيانات الطفل وولي الأمر</h2><div class="form-grid">
            <div class="field"><label>اسم الطفل</label><input class="input" name="child" required></div>
            <div class="field"><label>العمر</label><input class="input" name="age" required placeholder="مثال: 4 سنوات"></div>
            <div class="field"><label>الجنس</label>${sel("gender",["ذكر","أنثى"],1)}</div>
            <div class="field"><label>اسم ولي الأمر</label><input class="input" name="guardian" required></div>
            <div class="field"><label>صلة القرابة</label>${sel("relation",["الأب","الأم","ولي أمر آخر"],1)}</div>
            <div class="field"><label>رقم الجوال</label><input class="input" type="tel" name="phone" inputmode="tel" required placeholder="05xxxxxxxx" style="direction:ltr;text-align:right"></div></div></section>
          <section class="ki-step" data-step="1" hidden><h2>الصحة والنمو</h2><div class="form-grid">
            <div class="field"><label>نوع الولادة</label>${sel("birthType",["طبيعية","قيصرية","لا أعلم"])}</div>
            <div class="field"><label>فحص السمع</label>${sel("hearingChecked",["تم — لا توجد ملاحظات","تم — توجد ملاحظات","لم يتم بعد"],1)}</div>
            <div class="field"><label>فحص البصر</label>${sel("visionChecked",["تم — لا توجد ملاحظات","تم — توجد ملاحظات","لم يتم بعد"])}</div>
            <div class="field"><label>عمر أول كلمة (بالشهور)</label><input class="input" name="milestoneFirstWord" inputmode="numeric"></div>
            <div class="field"><label>عمر أول جملة من كلمتين (بالشهور)</label><input class="input" name="milestoneSentence" inputmode="numeric"></div>
            <div class="field"><label>عمر المشي (بالشهور)</label><input class="input" name="milestoneWalking" inputmode="numeric"></div>
            <div class="field full"><label>أمراض مزمنة أو أدوية (لو فيه)</label><input class="input" name="chronic"></div></div></section>
          <section class="ki-step" data-step="2" hidden><h2>مؤشرات النمو</h2><p class="muted">اختاروا الأقرب لطفلكم الحين. ما فيه إجابة صح أو غلط.</p><div class="ai-qs">${INTAKE_QS.map(q=>`<div class="ai-q"><span>${esc(q.t)}</span><div class="ai-opts">${opt(q)}</div></div>`).join("")}</div></section>
          <section class="ki-step" data-step="3" hidden><h2>احكولنا عن طفلكم</h2><div class="form-grid">
            <div class="field full"><label>وش اللي مقلقكم أو محتاجين نساعد فيه؟</label><textarea class="textarea" name="reason" required rows="5" placeholder="مثال: تأخر في الكلام وعصبية لما حد يقاطعه"></textarea></div>
            <div class="field"><label>الوقت المفضل للتواصل</label>${sel("contactTime",["صباحاً (٩–١٢)","ظهراً (١٢–٣)","مساءً (٣–٦)"])}</div>
            <div class="field"><label>طريقة التواصل</label>${sel("contactMethod",["اتصال هاتفي","واتساب"])}</div></div>
            <label class="consent-row" style="margin-top:14px"><input type="checkbox" name="agree" required><span>أقر بصحة البيانات، وأوافق على استخدامها في دراسة حالة طفلي والتواصل معي بخصوصها فقط، حسب سياسة خصوصية ${esc(state.center.name)}.</span></label></section>
          <div class="ki-nav"><button type="button" class="btn btn-outline ki-big" id="ki-prev" onclick="kiStep(-1)" hidden>السابق</button><button type="button" class="btn btn-primary ki-big" id="ki-next" onclick="kiStep(1)">التالي</button><button type="submit" class="btn btn-primary ki-big" id="ki-send" hidden>إرسال دراسة الحالة</button></div>
          <div id="portal-result"></div>
        </form></main></div>`;
    }
    let _kiCur=0;
    function kiShow(i){const f=document.getElementById("ki-form");if(!f)return;_kiCur=i;f.querySelectorAll(".ki-step").forEach(s=>s.hidden=+s.dataset.step!==i);document.querySelectorAll(".ki-dot").forEach(d=>{d.classList.toggle("on",+d.dataset.i===i);d.classList.toggle("done",+d.dataset.i<i)});
      document.getElementById("ki-prev").hidden=i===0;document.getElementById("ki-next").hidden=i===KI_STEPS.length-1;document.getElementById("ki-send").hidden=i!==KI_STEPS.length-1;window.scrollTo({top:0,behavior:"smooth"})}
    function kiValid(i){const f=document.getElementById("ki-form");const sec=f.querySelector(`.ki-step[data-step="${i}"]`);const bad=[...sec.querySelectorAll("input,select,textarea")].filter(el=>!el.checkValidity());
      if(bad.length){const el=bad[0];const box=el.closest(".ai-q")||el.closest(".field")||el.closest(".consent-row");if(box){box.classList.add("ki-miss");box.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>box.classList.remove("ki-miss"),1800)}notify(el.type==="radio"?"فيه سؤال للحين ما انجاوب":"فيه خانة مطلوبة للحين فاضية");return false}return true}
    function kiStep(d){if(d>0&&!kiValid(_kiCur))return;kiShow(Math.max(0,Math.min(KI_STEPS.length-1,_kiCur+d)))}
    function kiSubmit(e){e.preventDefault();if(!kiValid(_kiCur))return;intakeSubmit(e);const r=document.getElementById("portal-result");state.kiDone=r?r.innerHTML:"وصلتنا دراسة الحالة.";persist();render();window.scrollTo(0,0)}
    function kiNew(){state.kiDone=null;_kiCur=0;render();setTimeout(()=>kiShow(0),0)}

    // =================== آيباد الأخصائيين: شاشة كاملة بالكود + جدول اليوم + DTT ===================
    const SIPAD_SLOT=40, SIPAD_IDLE=10*60*1000;
    function sipadStaff(){return state.sipad?personById(state.sipad):null}
    function sipadMin(t){const m=/^(\d{1,2}):(\d{2})/.exec(t||"");return m?(+m[1])*60+(+m[2]):null}
    function sipadHM(n){return pad2(Math.floor(n/60)%24)+":"+pad2(n%60)}
    function sipadShift(s){const m=String(s&&s.schedule||"").match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/);return m?[sipadMin(m[1]),sipadMin(m[2])]:null}
    function sipadGreet(){const h=new Date().getHours();return h<12?"صباح الخير":"مساء الخير"}
    function sipadSetSS(k,v){try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(_e){}}
    function openStaffIpad(){state.sipadMode=true;state.sipad=null;state.sipadPick=null;state.sipadErr="";sipadSetSS("awan-sipad-mode","1");sipadSetSS("awan-sipad",null);audit("تشغيل وضع آيباد الأخصائيين","");persist();render();window.scrollTo(0,0)}
    function closeStaffIpad(){if(!state.sipadExitArm||Date.now()-state.sipadExitArm>4000){state.sipadExitArm=Date.now();render();setTimeout(()=>{if(state.sipadExitArm){state.sipadExitArm=0;render()}},4100);return}
      state.sipadExitArm=0;state.sipadMode=false;state.sipad=null;state.sipadPick=null;sipadSetSS("awan-sipad-mode",null);sipadSetSS("awan-sipad",null);dttWake(false);persist();render()}
    function sipadPick(id){state.sipadPick=id;state.sipadErr="";render();setTimeout(()=>{const i=document.getElementById("sp-code");if(i)i.focus()},30)}
    function sipadLogin(e){e.preventDefault();const s=personById(state.sipadPick);const code=(new FormData(e.target).get("code")||"").trim();
      if(!s)return;
      if(!code||String(s.code||"").trim()!==code){state.sipadErr="الكود مو مضبوط، جربي ثاني";render();setTimeout(()=>{const i=document.getElementById("sp-code");if(i)i.focus()},30);return}
      state.sipad=s.id;state.sipadPick=null;state.sipadErr="";state.staffSection=null;sipadSetSS("awan-sipad",s.id);
      let msg="";if(!s.present&&sipadPerm("attendance")&&typeof staffAttendanceMark==="function"){staffAttendanceMark(s,"آيباد الأخصائي");msg=" · انسجل حضورك"}
      audit("دخول آيباد الأخصائي",s.name);persist();render();window.scrollTo(0,0);notify(`أهلاً ${s.name}${msg}`)}
    function sipadLock(){const s=sipadStaff();if(s)audit("قفل آيباد الأخصائي",s.name);state.sipad=null;state.sipadPick=null;state.staffSection=null;sipadSetSS("awan-sipad",null);dttWake(false);persist();render();window.scrollTo(0,0)}
    function sipadOpen(id){startLiveSession(id)}
    function sipadRows(s,dayOverride){
      const today=localDateOf(new Date());const blocksAll=(state.timeBlocks||[]).filter(b=>b.staffId===s.id);
      let day=dayOverride||(state.sipadMode&&!sipadPerm("otherDays")?today:dttPickDay(s));
      if(!day&&blocksAll.some(b=>b.date===today))day=today;
      if(!day)return {day:null,rows:[],apts:[]};
      const apts=state.appointments.filter(a=>a.clinician===s.name&&a.date===day&&a.status!=="ملغي").sort((x,y)=>x.time.localeCompare(y.time));
      const ev=[];apts.forEach(a=>{const st=sipadMin(a.time);if(st!=null)ev.push({kind:"session",from:st,to:st+(+a.duration||SIPAD_SLOT),a})});
      blocksAll.filter(b=>b.date===day).forEach(b=>{const f=sipadMin(b.from),t=sipadMin(b.to);if(f!=null&&t!=null)ev.push({kind:"block",from:f,to:t,label:b.label,b})});
      ev.sort((x,y)=>x.from-y.from);
      const rows=[];let prevEnd=null;
      ev.forEach(e=>{if(prevEnd!=null&&e.from-prevEnd>=15)rows.push({kind:"break",from:prevEnd,to:e.from});rows.push(e);prevEnd=Math.max(prevEnd||0,e.to)});
      const sh=sipadShift(s);const repFrom=prevEnd!=null?prevEnd:(sh?sh[0]:null);
      const repTo=sh&&sh[1]>repFrom?sh[1]:(repFrom!=null?repFrom+60:null);
      if(repFrom!=null&&!ev.some(e=>e.kind==="block"&&/تقارير/.test(e.label)))rows.push({kind:"reports",from:repFrom,to:repTo});
      return {day,rows,apts};
    }
    function sipadHome(s){
      const {day,rows,apts}=sipadRowsFull(s);const today=localDateOf(new Date());const L=dttLive();
      const done=(apts||[]).filter(a=>a.status==="مكتمل").length;const total=(apts||[]).length;
      const nowM=new Date().getHours()*60+new Date().getMinutes();
      const next=(apts||[]).find(a=>a.status!=="مكتمل");
      const sh=sipadShift(s);
      const late=day===today?(apts||[]).filter(a=>a.status!=="مكتمل"&&sipadMin(a.time)+SIPAD_SLOT<=nowM).length:0;
      let h=`<section class="sp-hello"><div><h1>${sipadGreet()}، ${esc(s.name)}</h1><p>${day===today?"جدولك اليوم":"أقرب يوم في جدولك: "+date(day||today)}${sh?` · يوم العمل: ${sipadHM(sh[0])} – ${sipadHM(sh[1])}`:""}</p></div>
        <div class="sp-stats"><div><b>${total}</b><small>جلسات</small></div><div><b>${done}</b><small>خلصت</small></div><div><b>${Math.max(0,total-done)}</b><small>باقي</small></div></div></section>`;
      if(L&&L.staffId===s.id&&!L.locked)h+=`<button class="sp-resume" onclick="dttResume()"><span>عندك جلسة مفتوحة مع <b>${esc(L.patient)}</b></span><span class="btn btn-primary">كمّلي الجلسة</span></button>`;
      if(!day){return h+`<section class="card"><div class="empty">ما فيه مواعيد في جدولك.</div></section>`}
      h+=`<section class="card sp-tl"><div class="card-head"><h2>${ic("schedule",18)} Timeline اليوم</h2><span class="muted">${day===today?`الساعة الحين <b id="sp-clock">${sipadHM(nowM)}</b>`:date(day)}</span></div>`+sipadSlotSummary(s);
      h+=rows.map(r=>{const tm=`<div class="sp-time">${sipadHM(r.from)} – ${sipadHM(r.to)}</div>`;
        if(r.kind==="block")return `<div class="sp-row brk">${tm}<div class="sp-main"><strong>${esc(r.label)}</strong><span>فترة محددة من الإدارة</span></div></div>`;
        if(r.kind==="free")return sipadFreeRow(r,tm,day===today,nowM);if(r.kind==="brk")return sipadBrkRow(r,tm,day===today,nowM);if(r.kind==="break")return `<div class="sp-row brk">${tm}<div class="sp-main"><strong>استراحة</strong><span>${r.to-r.from} دقيقة</span></div></div>`;
        if(r.kind==="reports")return `<div class="sp-row rep">${tm}<div class="sp-main"><strong>التقارير</strong><span>مراجعة وإنهاء تقارير اليوم${late?` · <b class="sp-warn">${late} جلسة عدّى وقتها وللحين ما انقفلت</b>`:""}</span></div></div>`;
        const a=r.a;const isDone=a.status==="مكتمل";const live=L&&L.aptId===a.id&&!L.locked;const isNext=next&&next.id===a.id;
        const nowIn=day===today&&nowM>=r.from&&nowM<r.to;
        return `<div class="sp-row ${isDone?"done":""} ${isNext?"next":""} ${nowIn?"now":""}">${tm}<div class="sp-main"><strong>${esc(a.patient)}</strong><span>${esc(a.service)} · ${esc(a.room||"")}</span></div>
          <div class="sp-end">${isDone?`<span class="pill pill-good">تمت ✓</span>`:live?`<button class="btn btn-primary sp-big" onclick="dttResume()">كمّلي</button>`:`<button class="btn ${isNext?"btn-primary":"btn-outline"} sp-big" onclick="sipadOpen('${a.id}')">فتح الجلسة</button>`}</div></div>`}).join("");
      return h+`</section>`;
    }
    function sipadLockScreen(){
      const list=sipadAllowedStaff();
      const pick=state.sipadPick&&personById(state.sipadPick);
      if(pick)return `<section class="sp-lock"><button class="back-link" onclick="sipadPick(null)">← رجوع للأسماء</button><div class="sp-av big">${esc((pick.name.replace(/^(أ\.|د\.)\s*/,"")||"?").charAt(0))}</div><h1>${esc(pick.name)}</h1><p class="muted">${esc(pick.role||"")}</p>
        <form class="sp-code" onsubmit="sipadLogin(event)" autocomplete="off"><input id="sp-code" class="input" name="code" placeholder="اكتبي كودك" aria-label="كود الموظف" autocomplete="off"><button class="btn btn-primary sp-big" type="submit">دخول</button></form>
        ${state.sipadErr?`<p class="sp-err">${esc(state.sipadErr)}</p>`:`<p class="muted" style="font-size:12.5px">نفس الكود اللي تسجلي بيه حضورك على كيوسك الباب.</p>`}</section>`;
      return `<section class="sp-lock"><h1>مين بيستخدم الآيباد؟</h1><p class="muted">اختاري اسمك وادخلي بكودك. أول دخول في اليوم يسجل حضورك.</p>
        <div class="sp-people">${list.map(x=>`<button class="sp-person" onclick="sipadPick('${x.id}')"><span class="sp-av">${esc((x.name.replace(/^(أ\.|د\.)\s*/,"")||"?").charAt(0))}</span><b>${esc(x.name)}</b><small>${esc(x.role||"")}</small>${x.present?`<i class="sp-in">${x.gender==="ذكر"?"موجود":"موجودة"}</i>`:""}</button>`).join("")}</div></section>`;
    }
    function staffIpadScreen(){
      ensureDevices();sipadCmdCheck();const _dv=sipadDevice();
      if(_dv&&_dv.disabled)return `<div class="ki sp"><header class="ki-top"><div class="ki-brand"><div><b>${esc(state.center.name)}</b><small>${esc(_dv.name)}</small></div></div></header><main class="ki-main"><div class="sp-off"><div class="ip-scr-lock">${ic("lock",34)}</div><h1>الجهاز هذا موقوف من الإدارة</h1><p class="muted">كلم المشرف أو الإدارة عشان يشغلوه ثاني.</p></div></main></div>`;
      if(state.sipad&&_dv&&!sipadAllowedStaff().some(x=>x.id===state.sipad)){state.sipad=null;sipadSetSS("awan-sipad",null)}
      const s=sipadStaff();const arm=state.sipadExitArm&&Date.now()-state.sipadExitArm<4000;
      const L=dttLive();const inSession=s&&state.staffSection==="session"&&L&&L.staffId===s.id;
      const right=s?`<button class="ki-exit" onclick="sipadLock()">${ic("idcard",14)} قفل الآيباد</button>`:`<button class="ki-exit ${arm?"arm":""}" onclick="closeStaffIpad()">${arm?"اضغطي ثاني للخروج":"خروج الإدارة"}</button>`;
      const top=`<header class="ki-top"><div class="ki-brand"><span class="ki-mark">${typeof mark==="function"?mark(26,"#a7c2b3","#e4aa54"):""}</span><div><b>${esc(state.center.name)}</b><small>${s?esc(s.name)+" · ":""}${_dv?esc(_dv.name):"آيباد الأخصائي"}</small></div></div>${right}</header>`;
      const body=!s?sipadLockScreen():inSession?`<div class="layout-lite">${liveSessionView()}</div>`:sipadHome(s);
      const noP=DEV_PERMS.filter(([k])=>!sipadPerm(k)).map(([k])=>"no-"+k).join(" ");
      return `<div class="ki sp ${inSession?"sp-sess":""} ${noP}">${top}<main class="ki-main">${s?sipadBannerHtml():""}${body}</main></div>`;
    }
    setInterval(()=>{const el=document.getElementById("sp-clock");if(el){const d=new Date();el.textContent=sipadHM(d.getHours()*60+d.getMinutes())}},20000);
    let _spLast=Date.now();["pointerdown","keydown"].forEach(ev=>document.addEventListener(ev,()=>{_spLast=Date.now()},true));
    setInterval(()=>{if(!state.sipadMode||!state.sipad)return;const L=dttLive();if(L&&L.staffId===state.sipad&&!L.locked)return;if(Date.now()-_spLast>sipadIdleMs()){sipadLock();notify("الآيباد انقفل لوحده بعد ١٠ دقايق من غير استخدام")}},30000);

    // =================== أوان يعرف وش التالي: محرك الخطوة التالية لرحلة الطفل ===================
    const NX_STAGES=["تواصل أول","دراسة حالة","تقييم","اعتماد الخطة","موافقات","جلسات","مراجعة دورية","تسليم الأثر"];
    const NX_RULES={gapDays:14,supGapDays:21,streak:3,reportEvery:12,reportDays:30};
    function nxDays(a,b){return Math.floor((Date.parse(b)-Date.parse(a))/864e5)}
    function nxGoalStreaks(logs){
      const by={};logs.forEach(l=>{if(!l.goalText)return;(by[l.goalText]=by[l.goalText]||[]).push(l)});
      const out={stuck:null,mastered:null};
      Object.entries(by).forEach(([g,arr])=>{const last=arr.slice(0,NX_RULES.streak);if(last.length<NX_RULES.streak)return;
        if(!out.stuck&&last.every(l=>l.result==="لم ينجح بعد"))out.stuck=g;
        if(!out.mastered&&last.every(l=>l.result==="نجاح كامل"))out.mastered=g});
      return out;
    }
    function awanNext(p){
      const today=localDateOf(new Date());const id=p.id;const open=`openPatient('${id}')`;
      const cs=typeof caseStudyOf==="function"?caseStudyOf(p):null;
      const apts=state.appointments.filter(a=>a.patient===p.name&&a.status!=="ملغي");
      const done=apts.filter(a=>a.status==="مكتمل");
      const upcoming=apts.filter(a=>a.status!=="مكتمل"&&a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      const assess=apts.find(a=>/تقييم/.test(a.service||""));
      const logs=(state.sessionLogs||[]).filter(l=>l.patientId===id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      const goals=goalsOf(p);const approved=goals.some(g=>g.status==="معتمد")||(!!p.goal&&p.status==="نشط"&&!goals.length);
      const consent=typeof consentStatus==="function"?consentStatus(p,"treatment").st==="active":true;
      const lastDates=[...done.map(a=>a.date),...logs.map(l=>l.date)].filter(Boolean).sort();const last=lastDates[lastDates.length-1]||null;
      const reports=(state.progressReports||[]).filter(r=>r.patientId===id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      const lastRep=reports[0]?reports[0].date:null;const logsSince=logs.filter(l=>!lastRep||l.date>lastRep).length;
      const st=nxGoalStreaks(logs);
      const R=(stage,text,why,owner,urg,sup,go)=>({stage,text,why,owner,urg,sup:!!sup,go:go||open,pid:id,name:p.name});
      const liveB=Object.values(state.liveBoard||{}).find(b=>b.patient===p.name&&!b.locked);
      if(liveB)return R(5,"في جلسة الحين",`مع ${liveB.staff} · المحاولة ${liveB.trial}/${DTT_BLOCK}`,"الأخصائي",0);
      if(p.transferRequest)return R(7,"جهّز حزمة النقل الرقمية","الأسرة طلبت نقل الطفل"+(p.transferRequest.to?" إلى "+p.transferRequest.to:""),"المشرف",3,true);
      if(approved&&last&&!upcoming.length){const gap=nxDays(last,today);
        if(gap>=NX_RULES.gapDays)return R(5,gap>=NX_RULES.supGapDays?"انقطاع طويل: قرار من المشرف":"انقطاع: كلّم الأسرة واحجز جلسة",`آخر جلسة من ${gap} يوم وما فيه موعد جاي`,gap>=NX_RULES.supGapDays?"المشرف":"الاستقبال",gap>=NX_RULES.supGapDays?3:2,gap>=NX_RULES.supGapDays)}
      if(st.stuck)return R(6,`راجع الهدف «${st.stuck}»`,`آخر ${NX_RULES.streak} جلسات عليه «لم ينجح بعد»: غيّر المساعدة أو قسّم الهدف`,"المشرف",3,true);
      if(!cs&&!approved)return R(1,"أرسل رابط دراسة الحالة للأسرة","الملف مفتوح وما فيه دراسة حالة","الاستقبال",1,false,"setView('digital');dgShareLink()");
      if(!approved&&!assess)return R(2,"احجز تقييم أولي","دراسة الحالة وصلت وما فيه موعد تقييم","الاستقبال",2);
      if(!approved&&assess&&assess.status!=="مكتمل"&&assess.date>=today)return R(2,`التقييم ${assess.date===today?"اليوم":"يوم "+date(assess.date)} ${time(assess.time)}`,`مع ${assess.clinician}`,"الأخصائي",0);
      if(!approved)return R(3,"اعتمد الخطة والأهداف",goals.length?`${goals.length} أهداف مقترحة بانتظار توقيعك`:"التقييم خلص وما فيه أهداف معتمدة","المشرف",2,true);
      if(!consent)return R(4,"توقيع موافقة العلاج إلكترونيًا","الخطة معتمدة بس ما فيه موافقة سارية","الاستقبال",2);
      if(!upcoming.length&&!last)return R(5,"جدول الجلسات","الخطة والموافقة جاهزين وما فيه مواعيد","الاستقبال",2);
      if(st.mastered)return R(6,`الهدف «${st.mastered}» تحقق`,`آخر ${NX_RULES.streak} جلسات «نجاح كامل»: اعتمد هدف جديد`,"الأخصائي ← المشرف",1,false);
      if(logsSince>=NX_RULES.reportEvery||(logsSince>0&&(!lastRep||nxDays(lastRep,today)>=NX_RULES.reportDays)&&logs.length>=4))return R(6,"تقرير تقدم للأسرة",`${logsSince} نتيجة جلسة من غير تقرير${lastRep?" من "+nxDays(lastRep,today)+" يوم":""}`,"الأخصائي",1,false);
      if(!cs)return R(5,"استكمل دراسة الحالة الرقمية","الطفل شغال بخطة قديمة من غير دراسة حالة على أوان","الاستقبال",1,false,"setView('digital');dgShareLink()");
      const nx=upcoming[0];return R(5,"ماشي حسب الخطة",nx?`الجلسة الجاية ${nx.date===today?"اليوم":date(nx.date)} ${time(nx.time)} مع ${nx.clinician}`:"بانتظار الموعد الجاي","—",0);
    }
    function awanNextAll(){return state.patients.filter(p=>!p.archived).map(awanNext).sort((a,b)=>b.urg-a.urg||(b.sup-a.sup))}
    const NX_URG=["ماشي","عادي","مهم","عاجل"];
    function awanNextCard(p){
      const n=awanNext(p);
      return `<section class="card nx-card u${n.urg}"><div class="card-head"><h2>${ic("idea",18)} أوان يعرف وش التالي</h2>${n.sup?`<span class="nx-sup">يحتاج تدخل مشرف</span>`:`<span class="pill ${n.urg>=2?"pill-gold":n.urg?"pill-blue":"pill-good"}">${NX_URG[n.urg]}</span>`}</div>
        <ol class="nx-steps">${NX_STAGES.map((s,i)=>`<li class="${i<n.stage?"done":i===n.stage?"on":""}"><i></i><span>${s}</span></li>`).join("")}</ol>
        <div class="nx-now"><div><small>الخطوة الجاية · المسؤول: ${esc(n.owner)}</small><b>${esc(n.text)}</b><span>${esc(n.why)}</span></div>${n.go&&n.go!==`openPatient('${p.id}')`?`<button class="btn btn-primary" onclick="${n.go}">نفّذ</button>`:""}</div></section>`;
    }
    // =================== غرفة المراقبة الحية (بديل liveOpsView): زجاج + حركة + تحديث في مكانه ===================
    const MX_STATIONS=[["wait","وصل وبانتظار"],["in","في الجلسة"],["done","خلص الجلسة"],["out","خرج"]];
    function mxSec(ms){const s=Math.max(0,Math.round(ms/1000));return s<60?s+" ث":s<3600?Math.floor(s/60)+" د":Math.floor(s/3600)+" س"}
    function mxClockStr(){const d=new Date();return pad2(d.getHours())+":"+pad2(d.getMinutes())+":"+pad2(d.getSeconds())}
    function mxData(){
      ensureOps2();const today=localDateOf(new Date());const now=Date.now();
      const recs=ipRecords();
      const boards=recs.filter(r=>r.sess&&(!r.sess.locked||now-r.sess.updatedAt<20*60000)).map(r=>{const S=r.sess,m=r.m,t=m.cur||{trials:[]};const tr=t.trials;return {k:r.id,staff:r.name,patient:S.patient,room:S.room,target:t.text||"",targetNo:S.cur+1,targets:S.targets.length,done:m.doneT,trial:tr.length,pct:tr.length?Math.round(tr.filter(x=>x.r==="I").length/tr.length*100):null,last:tr.map(x=>x.r),startedAt:S.startedAt,updatedAt:S.updatedAt,locked:S.locked,panicAt:S.panicAt,sim:r.sim}}).sort((a,b)=>(a.locked-b.locked)||(b.updatedAt-a.updatedAt));
      const visits=(state.childVisits||[]).filter(v=>v.date===today);
      const todayFeed=state.liveFeed.filter(f=>localDateOf(f.at)===today);
      const byPatient={};Object.values(state.liveBoard).forEach(b=>{if(!byPatient[b.patient]||b.updatedAt>byPatient[b.patient].updatedAt)byPatient[b.patient]=b});
      const lane=visits.map(v=>{const b=byPatient[v.name];const st=v.outAt?"out":b&&!b.locked&&b.updatedAt>Date.parse(v.inAt)?"in":b&&b.locked&&b.updatedAt>Date.parse(v.inAt)?"done":"wait";return {v,st,b}});
      const next=awanNextAll().filter(n=>n.urg>0);
      const buckets=Array(24).fill(0);todayFeed.forEach(f=>{const i=23-Math.floor((now-Date.parse(f.at))/(5*60000));if(i>=0&&i<24)buckets[i]++});
      return {today,now,recs,boards,running:boards.filter(b=>!b.locked),visits,lane,todayFeed,next,buckets,
        present:state.staff.filter(s=>s.present),closed:todayFeed.filter(f=>/^قفل جلسة/.test(f.text)).length,
        taps:todayFeed.filter(f=>f.kind==="session").length};
    }
    function liveOpsView(){
      const D=mxData();
      return `<div class="mx" id="mx-room" data-role="${esc(state.role)}">
        <div class="mx-aurora" aria-hidden="true"><i></i><i></i><i></i></div><div class="mx-grid" aria-hidden="true"></div><div class="mx-scan" aria-hidden="true"></div>
        <header class="mx-head"><div><div class="mx-live"><span class="mx-dot"></span>مباشر</div><h1>غرفة المراقبة الحية</h1><p>كل ضغطة على آيباد، وكل دخول وخروج، وكل خطوة جاية لكل طفل — لحظة بلحظة.</p></div>
          <div class="mx-head-r"><div class="mx-clock" id="mx-clock">${mxClockStr()}</div><small id="mx-last">${state.liveFeed[0]?"آخر حدث من "+mxSec(D.now-Date.parse(state.liveFeed[0].at)):"بانتظار أول حدث"}</small>
          <div class="mx-actions"><button class="mx-btn ${ipSim?"on":""}" onclick="mxSim()">${ic("tablet",14)} ${ipSim?"إيقاف المحاكاة":"محاكاة ٣٠ آيباد"}</button><button class="mx-btn" onclick="opsDaily()">${ic("chart",14)} ملخص اليوم</button><button class="mx-btn" onclick="mxFull()">${ic("pulse",14)} شاشة كاملة</button></div></div></header>
        <div id="mx-daily"></div>
        <section class="mx-kpis" id="mx-kpis"></section>
        <section class="mx-top">
          <div class="mx-glass mx-radarbox"><div class="mx-h"><h2><span class="mx-dot"></span> رادار المركز</h2><span class="mx-sub" id="mx-radar-sub"></span></div>
            <div class="mx-rdr" id="mx-rdr"><div class="mx-rdr-grid"></div><div class="mx-rdr-sweep" style="animation-delay:-${(Date.now()%4000)/1000}s"></div><div id="mx-blips"></div><div class="mx-rdr-center" id="mx-rdr-c"></div>
              <span class="mx-rdr-lab l1">تنبيهات</span><span class="mx-rdr-lab l2">جلسات</span><span class="mx-rdr-lab l3">متصل</span></div>
            <div class="mx-rdr-legend"><span class="k-p">طلب مساعدة</span><span class="k-w">تنبيه</span><span class="k-s">في جلسة</span><span class="k-h">متصل</span></div></div>
          <div class="mx-glass mx-alerts"><div class="mx-h"><h2>${ic("bell",16)} تنبيهات الحين</h2><button class="mx-btn" id="mx-snd" onclick="mxSound()">${state.mxSound?"🔔 الصوت شغال":"🔕 الصوت مقفول"}</button></div><div id="mx-alerts"></div></div>
        </section>
        <div class="mx-main">
          <div class="mx-col">
            <section class="mx-glass"><div class="mx-h"><h2><span class="mx-dot"></span> آيبادات الأخصائيين</h2><span id="mx-ipad-sub" class="mx-sub"></span></div><div class="mx-boards" id="mx-boards"></div></section>
            <section class="mx-glass"><div class="mx-h"><h2>من الباب للجلسة</h2><span class="mx-sub" id="mx-lane-sub"></span></div>
              <div class="mx-lane">${MX_STATIONS.map(([k,l])=>`<div class="mx-st st-${k}"><b>${l} <em id="mx-n-${k}">0</em></b><div class="mx-chips" id="mx-st-${k}"></div></div>`).join("")}</div></section>
          </div>
          <div class="mx-col">
            <section class="mx-glass mx-next"><div class="mx-h"><h2>${ic("idea",16)} أوان يعرف وش التالي</h2><span class="mx-sub" id="mx-next-sub"></span></div><div id="mx-next"></div></section>
            <section class="mx-glass"><div class="mx-h"><h2>البث الحي</h2></div><div class="mx-filters" id="mx-filters"></div><div class="mx-feed" id="mx-feed"></div></section>
          </div>
        </div></div>`;
    }
    // تحديث بالمفاتيح: العنصر اللي ما تغيّر يفضل زي ما هو (والأنيميشن حقه ما يتعاد)
    function mxKeyed(box,items){
      if(!box)return;const have=new Map([...box.children].filter(c=>c.dataset&&c.dataset.k).map(c=>[c.dataset.k,c]));const keep=new Set(items.map(i=>i.k));
      have.forEach((el,k)=>{if(!keep.has(k)&&!el.classList.contains("mx-leave")){el.classList.add("mx-leave");setTimeout(()=>el.remove(),450)}});
      let prev=null;items.forEach(it=>{let el=have.get(it.k);
        if(el&&el.dataset.sig!==it.sig){const t=document.createElement("div");t.innerHTML=it.html.trim();const n=t.firstElementChild;n.dataset.k=it.k;n.dataset.sig=it.sig;n.classList.add("mx-upd");el.replaceWith(n);el=n}
        else if(!el){const t=document.createElement("div");t.innerHTML=it.html.trim();el=t.firstElementChild;el.dataset.k=it.k;el.dataset.sig=it.sig;el.classList.add("mx-enter");}
        const want=prev?prev.nextElementSibling:box.firstElementChild;if(el!==want)box.insertBefore(el,want);prev=el});
    }
    function mxCount(el,to){if(!el)return;const from=+el.dataset.v||0;el.dataset.v=to;if(from===to){el.textContent=to;return}
      el.classList.remove("mx-bump");void el.offsetWidth;el.classList.add("mx-bump");const t0=performance.now();const step=t=>{const p=Math.min(1,(t-t0)/600);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
    function mxSpark(b){const w=220,h=44,max=Math.max(1,...b);const pts=b.map((v,i)=>[i*(w/23),h-4-(v/max)*(h-10)]);const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("");
      return `<svg class="mx-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="mxg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5eead4" stop-opacity=".45"/><stop offset="1" stop-color="#5eead4" stop-opacity="0"/></linearGradient></defs><path d="${d}L${w} ${h}L0 ${h}Z" fill="url(#mxg)"/><path d="${d}" fill="none" stroke="#5eead4" stroke-width="2" stroke-linejoin="round"/><circle cx="${pts[23][0]}" cy="${pts[23][1]}" r="3.5" fill="#5eead4" class="mx-spark-dot"/></svg>`}
    function mxRing(p){const r=26,c=2*Math.PI*r;return `<svg class="mx-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="bg"/><circle cx="32" cy="32" r="${r}" class="fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-p)).toFixed(1)}"/></svg>`}
    let _mxFilterPainted=null;
    function opsPaint(){
      const room=document.getElementById("mx-room");if(!room)return;const D=mxData();
      // KPIs
      const kp=document.getElementById("mx-kpis");
      if(!kp.dataset.built){kp.dataset.built=1;kp.innerHTML=[["staff","موظفين حاضرين","team"],["kids","أطفال في المركز","patients"],["run","جلسات شغالة","target"],["closed","جلسات انقفلت","check"],["sup","محتاج مشرف","bell"]].map(([k,l,i])=>`<div class="mx-kpi k-${k}"><span class="mx-kpi-ic">${ic(i,16)}</span><b id="mx-k-${k}" data-v="0">0</b><small>${l}</small><em id="mx-k-${k}-sub"></em></div>`).join("")+`<div class="mx-kpi mx-pulse"><small>نبض المركز · آخر ساعتين</small><div id="mx-spark"></div><em id="mx-k-rate"></em></div>`}
      mxCount(document.getElementById("mx-k-staff"),D.present.length);document.getElementById("mx-k-staff-sub").textContent="من "+state.staff.length;
      mxCount(document.getElementById("mx-k-kids"),D.visits.filter(v=>!v.outAt).length);document.getElementById("mx-k-kids-sub").textContent=D.visits.length+" وصلوا اليوم";
      mxCount(document.getElementById("mx-k-run"),D.running.length);document.getElementById("mx-k-run-sub").textContent=D.taps+" ضغطة اليوم";
      mxCount(document.getElementById("mx-k-closed"),D.closed);document.getElementById("mx-k-closed-sub").textContent="اليوم";
      const supN=D.next.filter(n=>n.sup).length;mxCount(document.getElementById("mx-k-sup"),supN);room.querySelector(".k-sup").classList.toggle("hot",supN>0);document.getElementById("mx-k-sup-sub").textContent=D.next.length+" خطوة بانتظار";
      const sg=D.buckets.join(",");const sp=document.getElementById("mx-spark");if(sp.dataset.sig!==sg){sp.dataset.sig=sg;sp.innerHTML=mxSpark(D.buckets)}
      document.getElementById("mx-k-rate").textContent=D.buckets.slice(-3).reduce((a,b)=>a+b,0)+" حدث آخر ربع ساعة";
      mxRadarPaint(D);
      // الآيبادات
      document.getElementById("mx-ipad-sub").textContent=D.running.length?D.running.length+" جلسة مفتوحة · تتحدث مع كل ضغطة":"ما فيه جلسة مفتوحة الحين";
      const bb=document.getElementById("mx-boards");
      if(!D.boards.length){if(!bb.querySelector(".mx-radar"))bb.innerHTML=`<div class="mx-radar"><div class="mx-radar-sweep"></div><span>بانتظار أول أخصائي يفتح جلسة على الآيباد</span></div>`}
      else{const r=bb.querySelector(".mx-radar");if(r)r.remove();
        mxKeyed(bb,D.boards.map(b=>{const panic=b.panicAt&&D.now-b.panicAt<10*60000;const p=Math.min(b.trial||0,DTT_BLOCK)/DTT_BLOCK;
          const sig=[b.trial,b.targetNo,b.done,b.locked,panic,(b.last||[]).join(""),b.pct].join("|");
          return {k:b.k,sig,html:`<div onclick="ipOpen('${b.k}')" class="mx-card ${b.locked?"done":""} ${panic?"panic":""}" data-t="${b.updatedAt}">
            <div class="mx-card-top"><div class="mx-who"><span class="mx-av">${esc((b.staff||"?").replace(/^(أ\.|د\.)\s*/,"").charAt(0))}</span><div><b>${esc(b.staff)}</b><small>${esc(b.patient)} · ${esc(b.room||"")}</small></div></div>
              <div class="mx-ringbox">${mxRing(p)}<b>${b.pct==null?"—":b.pct+"%"}</b></div></div>
            ${panic?`<div class="mx-panic">طلب مساعدة عاجل · روح للغرفة</div>`:""}
            <div class="mx-target"><small>الهدف ${b.targetNo} من ${b.targets} · خلص ${b.done}</small><b>${esc(b.target)}</b></div>
            <div class="mx-trials">${Array.from({length:DTT_BLOCK},(_,i)=>{const c=(b.last||[])[i];return c?`<span class="t t-${c}" style="animation-delay:${i===(b.last.length-1)?0:0}ms">${c}</span>`:`<span class="t e"></span>`}).join("")}</div>
            <div class="mx-card-foot"><span>${b.locked?"الجلسة انقفلت":`المحاولة ${b.trial}/${DTT_BLOCK} · من ${Math.round((D.now-b.startedAt)/60000)} د`}</span><span class="mx-ago">${b.locked?"":"آخر ضغطة من "+mxSec(D.now-b.updatedAt)}</span></div></div>`}}));
      }
      // الممر
      const n={wait:0,in:0,done:0,out:0};
      MX_STATIONS.forEach(([k])=>{const items=D.lane.filter(x=>x.st===k);n[k]=items.length;
        mxKeyed(document.getElementById("mx-st-"+k),items.map(({v,b})=>({k:v.id||v.name+v.inAt,sig:k+(b?b.trial:""),html:`<div class="mx-chip"><span class="mx-av sm">${esc(v.name.charAt(0))}</span><div><b>${esc(v.name.split(" ").slice(0,2).join(" "))}</b><small>${k==="out"?"خرج "+localTimeOf(v.outAt):k==="in"&&b?esc(b.staff)+" · "+b.trial+"/"+DTT_BLOCK:"وصل "+localTimeOf(v.inAt)}</small></div></div>`})));
        const em=document.getElementById("mx-n-"+k);if(em)em.textContent=n[k]});
      document.getElementById("mx-lane-sub").textContent=D.visits.length?D.visits.length+" طفل اليوم":"أول ما طفل يسجل بكود الأسرة على كيوسك الباب بيظهر هنا";
      // الخطوة التالية
      document.getElementById("mx-next-sub").textContent=D.next.length?`${D.next.length} طفل · ${supN} محتاج مشرف`:"كل الأطفال ماشيين حسب الخطة";
      mxKeyed(document.getElementById("mx-next"),D.next.slice(0,8).map(x=>({k:x.pid,sig:x.text+x.urg,html:`<button class="mx-nx u${x.urg} ${x.sup?"sup":""}" onclick="${x.go}"><span class="mx-nx-bar"></span><div><small>${esc(x.name)} · ${esc(NX_STAGES[x.stage])}</small><b>${esc(x.text)}</b><span>${esc(x.why)}</span></div><em>${x.sup?"مشرف":esc(x.owner)}</em></button>`})));
      if(!D.next.length)document.getElementById("mx-next").innerHTML=`<div class="mx-empty">ما فيه شي بانتظار حد. 👌</div>`;
      else{const e=document.querySelector("#mx-next .mx-empty");if(e)e.remove()}
      // الفلاتر + البث
      const kf=state.opsFilter||"all";const fl=document.getElementById("mx-filters");
      if(fl.dataset.f!==kf){fl.dataset.f=kf;fl.innerHTML=[["all","الكل"],...Object.entries(FEED_KINDS)].map(([k,l])=>`<button class="${kf===k?"on":""}" onclick="opsFilter('${k}')">${l}</button>`).join("")}
      const fe=document.getElementById("mx-feed");if(_mxFilterPainted!==kf){fe.innerHTML="";_mxFilterPainted=kf}
      const feed=state.liveFeed.filter(f=>kf==="all"||f.kind===kf).slice(0,40);
      mxKeyed(fe,feed.map(f=>({k:f.id,sig:"1",html:`<div class="mx-ev k-${f.kind}"><time>${localTimeOf(f.at)}</time><div><b>${esc(f.text)}</b>${f.target?` <span>· ${esc(f.target)}</span>`:""}<small>${esc(f.who)} · ${FEED_KINDS[f.kind]||""}</small></div></div>`})));
      if(!feed.length&&!fe.querySelector(".mx-empty"))fe.innerHTML=`<div class="mx-empty">للحين ما فيه أحداث.</div>`;
      // ملخص اليوم
      const dl=document.getElementById("mx-daily");const ds=state.opsDaily?state.opsDaily.text:"";if(dl.dataset.s!==ds){dl.dataset.s=ds;dl.innerHTML=ds?`<section class="mx-glass mx-sum mx-enter"><div class="mx-h"><h2>${ic("chart",16)} ملخص اليوم ${state.opsDaily.ai?"· OpenAI":"· قواعد"}</h2><button class="mx-btn" onclick="opsDailyClose()">إغلاق</button></div><div style="white-space:pre-wrap;line-height:2">${esc(ds)}</div></section>`:""}
    }
    function mxTick(){const room=document.getElementById("mx-room");if(!room)return;const c=document.getElementById("mx-clock");if(c)c.textContent=mxClockStr();
      const now=Date.now();const l=document.getElementById("mx-last");if(l&&state.liveFeed[0])l.textContent="آخر حدث من "+mxSec(now-Date.parse(state.liveFeed[0].at));
      room.querySelectorAll(".mx-card[data-t]").forEach(el=>{const t=+el.dataset.t;const a=el.querySelector(".mx-ago");if(a&&!el.classList.contains("done"))a.textContent="آخر ضغطة من "+mxSec(now-t);el.classList.toggle("hot",!el.classList.contains("done")&&now-t<4000)})}
    setInterval(mxTick,1000);
    setInterval(()=>{if(state.view==="liveOps")opsPaint()},4000);
    function mxFull(){const r=document.getElementById("mx-room");if(!r)return;document.body.classList.toggle("mx-fs");try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});else if(document.fullscreenElement)document.exitFullscreen()}catch(_e){}}
    document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement)document.body.classList.remove("mx-fs")});

    const _renderBase=render;
    render=function(){
      if(state.view==="liveOps"&&!state.intakeKiosk&&!state.sipadMode){const r=document.getElementById("mx-room");if(r&&r.dataset.role===state.role){opsPaint();return}}
      _renderBase();if(state.view==="liveOps"&&document.getElementById("mx-room"))opsPaint();
    };
    // =================== آيبادات الفريق: كل آيباد في المركز + الدخول على أي واحد لحظيًا ===================
    const IP_KEY="awan-ipads-v1", IP_IDLE=3*60000, IP_ONLINE=35000;
    function ipHBRead(){try{return JSON.parse(localStorage.getItem(IP_KEY)||"{}")||{}}catch(_e){return {}}}
    function ipHB(staffId,status,extra){if(!staffId)return;try{const m=ipHBRead();let dv=null;try{dv=sessionStorage.getItem("awan-dev")}catch(_e){}m[staffId]={...(m[staffId]||{}),status,at:Date.now(),dev:state.sipadMode?dv:null,...(extra||{})};localStorage.setItem(IP_KEY,JSON.stringify(m))}catch(_e){}}
    setInterval(()=>{if(state.sipadMode&&state.sipad){const L=dttLive();ipHB(state.sipad,L&&L.staffId===state.sipad&&!L.locked&&state.staffSection==="session"?"session":"home")}},10000);
    // ---- محاكاة يوم شغل (في الذاكرة بس، ما تتحفظ في بيانات المركز) ----
    const IP_DEMO_NAMES=["أ. ريم الشهري","أ. سارة القرني","أ. منى العمري","أ. نوف الزهراني","أ. أمل الغامدي","أ. هيفاء المالكي","أ. دانة الحربي","أ. جود السبيعي","أ. لمى الشمري","أ. رهف العنزي","أ. غادة البقمي","أ. وعد الجهني","أ. أسماء الرشيدي","أ. بشاير الثبيتي","أ. شهد المطيري","أ. ندى العتيبي","أ. ريوف الدوسري","أ. عبير القحطاني","أ. تهاني السلمي","أ. مها الخالدي","أ. روان الزهراني","أ. أريج الشهراني","أ. فاطمة الأحمدي","أ. خلود الحارثي"];
    const IP_DEMO_KIDS=["يوسف","سارة","آدم","ليان","ملك","نور","عمر","ياسمين","سلمى","حمد","جنى","فيصل","تالين","زياد","ريان","لانا","مالك","هيا","راكان","دانة","سعود","لين","تركي","غلا"];
    const IP_DEMO_TG=[["أن يسمي تفاحة","اللغة التعبيرية"],["أن يشير إلى شعر","اللغة الاستقبالية"],["أن يقلد التصفيق","التقليد"],["أن يطلب بكلمة","الطلب"],["أن ينفذ أمر من خطوتين","الفهم"],["أن يقلد صوت الباء","التقليد الصوتي"],["أن يتواصل بصريًا 3 ث","التواصل الاجتماعي"],["أن يرد على اسمه","الانتباه"]];
    let ipSim=null,_ipSimT=null;
    function ipSimStart(){const now=Date.now();const R=n=>Math.floor(Math.random()*n);
      ipSim={};IP_DEMO_NAMES.forEach((name,i)=>{const id="sim-"+i;const st=i%8===5?"offline":i%8===6?"home":i%8===7?"locked":"session";
        const tg=[0,1,2,3,4].map(j=>IP_DEMO_TG[(i+j*3)%IP_DEMO_TG.length]);
        const s={id,name,role:i%3?"أخصائية نطق ولغة":"أخصائية تعديل سلوك",sim:true,status:st,hbAt:now-(st==="offline"?40*60000:R(8000))};
        if(st==="session"){const start=now-(5+R(30))*60000;let t=start;const targets=tg.map(([text,domain])=>({text,domain,trials:[]}));const filled=R(3);
          for(let k=0;k<=filled;k++){const n=k<filled?10:R(9);for(let x=0;x<n;x++)targets[k].trials.push({r:ipSimPick(i),at:0})}
          t=now-2000-R(20000)-(i%7===3?4*60000:0);const flat=targets.flatMap(x=>x.trials);for(let x=flat.length-1;x>=0;x--){flat[x].at=Math.max(start+5000,t);t-=12000+R(30000)}
          s.sess={patient:IP_DEMO_KIDS[i]+" "+["أحمد","محمد","خالد","علي"][i%4],room:"غرفة "+(1+i%12),service:i%3?"جلسة نطق ولغة":"جلسة تعديل سلوك",startedAt:start,sched:start-(i%5===0?14:R(4))*60000,targets,cur:filled,note:i%4===0?"الطفل متعاون، نقلل المساعدة تدريجي.":"",updatedAt:(()=>{const f=targets.flatMap(x=>x.trials);return f.length?f[f.length-1].at:start})(),locked:false,panicAt:i===9?now-40000:0}}
        ipSim[id]=s});
      clearInterval(_ipSimT);_ipSimT=setInterval(ipSimStep,2200);audit("تشغيل محاكاة آيبادات الفريق","");render()}
    function ipSimPick(i){const r=Math.random();const lvl=(i%5)/5;return r<0.45+lvl*0.35?"I":r<0.7+lvl*0.2?"C":r<0.92?"P":"NR"}
    function ipSimStop(){clearInterval(_ipSimT);ipSim=null;if(state.ipMirror&&String(state.ipMirror).startsWith("sim-"))state.ipMirror=null;render()}
    function ipSimStep(){if(!ipSim)return;const now=Date.now();Object.values(ipSim).forEach((s,i)=>{const S=s.sess;if(s.status!=="session"||!S||S.locked)return;s.hbAt=now;
      if(i%7===3)return; // جهاز خامل عشان يبان تنبيه الخمول
      if(Math.random()<0.45){const t=S.targets[S.cur];if(!t)return;t.trials.push({r:ipSimPick(i),at:now});S.updatedAt=now;
        if(t.trials.length>=DTT_BLOCK){const nx=S.targets.findIndex(x=>x.trials.length<DTT_BLOCK);if(nx>=0)S.cur=nx;else{S.locked=true}}}});
      if(state.view==="ipads")ipPaint();if(state.view==="liveOps")opsPaint()}
    // ---- تجميع كل الأجهزة ----
    function ipRecords(){
      ensureOps2();const hb=ipHBRead();const now=Date.now();
      const real=state.staff.filter(s=>s.clinical||s.roleCategory==="staff").map(s=>{const h=hb[s.id];const b=state.liveBoard[s.id];
        const live=b&&b.detail&&(!b.locked||now-b.updatedAt<10*60000);
        const sess=live?{patient:b.patient,room:b.room,service:b.detail.service||"",startedAt:b.startedAt,sched:b.detail.sched||null,targets:b.detail.targets,cur:b.detail.cur,note:b.detail.note||"",updatedAt:b.updatedAt,locked:b.locked,panicAt:b.panicAt||0}:null;
        let status=h?(now-h.at<IP_ONLINE?(h.status==="locked"?"locked":h.status):"offline"):"offline";
        if(sess&&!sess.locked)status="session";
        return {id:s.id,name:s.name,role:s.role||"",dept:s.department||"",present:!!s.present,status,hbAt:h?h.at:null,sess}});
      const sim=ipSim?Object.values(ipSim).map(s=>({id:s.id,name:s.name,role:s.role,dept:"",present:s.status!=="offline",status:s.sess&&s.sess.locked?"home":s.status,hbAt:s.hbAt,sess:s.sess||null,sim:true})):[];
      return [...real,...sim].map(r=>{r.m=r.sess?ipMetrics(r.sess):null;r.alerts=ipAlerts(r);r.rank=ipRank(r);return r}).sort((a,b)=>b.rank-a.rank||a.name.localeCompare(b.name,"ar"));
    }
    function ipMetrics(S){
      const all=[];S.targets.forEach((t,ti)=>t.trials.forEach(x=>all.push({...x,ti})));all.sort((a,b)=>a.at-b.at);
      const n=all.length,c=k=>all.filter(x=>x.r===k).length;const gaps=all.slice(1).map((x,i)=>(x.at-all[i].at)/1000);
      const now=Date.now();const lastAt=all.length?all[all.length-1].at:S.startedAt;
      let nrRun=0;for(let i=all.length-1;i>=0&&all[i].r==="NR";i--)nrRun++;
      const pct=v=>n?Math.round(v/n*100):null;
      return {n,I:c("I"),C:c("C"),P:c("P"),NR:c("NR"),indep:pct(c("I")),prompt:pct(c("P")+c("C")),nr:pct(c("NR")),
        avgGap:gaps.length?Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length):null,maxGap:gaps.length?Math.round(Math.max(...gaps)):null,
        idle:S.locked?0:now-lastAt,elapsed:(S.locked?S.updatedAt:now)-S.startedAt,perMin:n?+(n/Math.max(1,((S.locked?S.updatedAt:now)-S.startedAt)/60000)).toFixed(1):0,
        late:S.sched&&Math.abs(S.startedAt-S.sched)<4*3600000?Math.round((S.startedAt-S.sched)/60000):null,nrRun,all,
        cur:S.targets[S.cur]||S.targets[0],doneT:S.targets.filter(t=>t.trials.length>=DTT_BLOCK).length};
    }
    function ipAlerts(r){const a=[];const m=r.m;const S=r.sess;const now=Date.now();
      if(S&&S.panicAt&&now-S.panicAt<10*60000)a.push({lvl:3,t:"طلب مساعدة عاجل"});
      if(m&&!S.locked&&m.idle>IP_IDLE)a.push({lvl:2,t:`ما فيه ضغطة من ${Math.floor(m.idle/60000)} د`});
      if(m&&m.nrRun>=3)a.push({lvl:2,t:`${m.nrRun} مرات NR ورا بعض`});
      if(m&&m.n>=6&&m.prompt>=60)a.push({lvl:1,t:`اعتماد على المساعدة ${m.prompt}%`});
      if(m&&m.late!=null&&m.late>=10)a.push({lvl:1,t:`بدأت متأخرة ${m.late} د`});
      return a}
    function ipRank(r){const top=r.alerts.reduce((x,a)=>Math.max(x,a.lvl),0);return top*100+(r.status==="session"?30:r.status==="home"?20:r.status==="locked"?10:0)}
    const IP_ST={session:["في جلسة","s"],home:["فاتح الجدول","h"],locked:["مقفول","l"],offline:["مو متصل","o"]};
    // ---- العرض ----
    function ipadsView(){
      if(!state.ipMirror&&state.ipTab==="devices")return devicesView();
      if(state.ipMirror){const P=ipMirrorParts();return `<div class="ip-room" id="ip-room" data-mirror="${esc(state.ipMirror)}" data-role="${esc(state.role)}">${P.nav}<div id="ip-who">${P.who}</div>${P.ok?`<div class="ip-mgrid"><div class="ip-frame"><div class="ip-bezel"><div class="ip-cam"></div><div class="ip-screen" id="ip-screen">${P.screen}</div></div></div><div class="ip-side"><div id="ip-stats">${P.stats}</div>${ipCtlHtml()}${ipActHtml()}</div></div>`:""}</div>`}
      const q=state.ipQ||"";const f=state.ipF||"all";
      return `<div class="ip-room" id="ip-room" data-mirror="" data-tab="live" data-role="${esc(state.role)}">`+head("مباشر","آيبادات الفريق","كل آيباد في المركز على شاشة واحدة. اضغط على أي أخصائي تدخل على الآيباد حقه وتشوف كل ضغطة لحظتها.",
        `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline" onclick="ipSetTab('devices');ipDevEdit('new')">＋ إضافة آيباد</button>${ipSim?`<button class="btn btn-outline" onclick="ipSimStop()">إيقاف المحاكاة</button>`:`<button class="btn btn-outline" onclick="ipSimStart()">${ic("pulse",14)} محاكاة ٣٠ آيباد</button>`}<button class="btn btn-primary" onclick="setView('liveOps')">غرفة المراقبة</button></div>`)
        +ipSeg()+(state.ipDept?`<span class="ip-deptchip">${esc((state.departments.find(x=>x.id===state.ipDept)||{}).name||"")} <button onclick="ipDeptClear()" aria-label="كل الأقسام">✕</button></span>`:"")+(ipSim?`<div class="ip-simnote">وضع المحاكاة شغال: ${IP_DEMO_NAMES.length} جهاز تجريبي في الذاكرة بس عشان تشوف الشكل مع فريق كبير. ما فيه شي منهم تتحفظ في بيانات المركز.</div>`:"")
        +`<section class="ip-kpis" id="ip-kpis"></section>
        <div class="ip-tools"><input class="input" id="ip-q" placeholder="ابحث باسم الأخصائي أو الطفل" value="${esc(q)}" oninput="ipSearch(this.value)" autocomplete="off">
          <div class="ipd-size" role="group" aria-label="حجم الأجهزة">${[["sm","صغير"],["md","متوسط"],["lg","كبير"]].map(([k,l])=>`<button class="${(state.ipSize||"md")===k?"on":""}" onclick="ipSize('${k}')">${l}</button>`).join("")}</div><div class="ip-chips" id="ip-chips">${[["all","الكل"],["alert","عليها تنبيه"],["session","في جلسة"],["home","فاتح الجدول"],["locked","مقفول"],["offline","مو متصل"]].map(([k,l])=>`<button class="${f===k?"on":""}" onclick="ipFilter('${k}')">${l} <em data-c="${k}"></em></button>`).join("")}</div></div>
        <div class="ip-grid" id="ip-grid"></div></div>`;
    }
    function ipTile(r){const [lab,cls]=IP_ST[r.status];const m=r.m;const S=r.sess;const top=r.alerts[0];
      const panic=r.alerts.some(a=>a.lvl>=3);const now=new Date();const hm=pad2(now.getHours())+":"+pad2(now.getMinutes());
      const bar=`<div class="ipd-bar"><span data-clock>${hm}</span><span class="ipd-bat"><i></i></span></div>`;
      let scr;
      if(S&&!S.locked){const t=m.cur;const tr=t?t.trials:[];const last=tr[tr.length-1];const fresh=last&&Date.now()-last.at<1600;
        scr=`${bar}<div class="ipd-head"><small>جلسة الطفل</small><b>${esc(S.patient)}</b><span>${esc(S.room||"")}</span></div>
          ${panic?`<div class="ipd-panic">طلب مساعدة</div>`:""}
          <div class="ipd-tg"><small>الهدف ${S.cur+1} من ${S.targets.length}</small><b>${esc(t?t.text:"")}</b></div>
          <div class="ipd-prog"><i style="width:${tr.length/DTT_BLOCK*100}%"></i></div>
          <div class="ipd-btns">${["I","C","P","NR"].map(k=>`<span class="k-${k} ${last&&last.r===k?"lit":""} ${fresh&&last.r===k?"tap":""}">${k}</span>`).join("")}</div>
          <div class="ipd-dots">${Array.from({length:DTT_BLOCK},(_,i)=>{const x=tr[i];return `<i class="${x?"r-"+x.r:""} ${x&&Date.now()-x.at<1600?"new":""}"></i>`}).join("")}</div>
          <div class="ipd-log">${m.all.slice(-4).reverse().map(x=>`<div><em class="r-${x.r}">${x.r}</em><span>${esc(S.targets[x.ti].text)}</span><time>${localTimeOf(new Date(x.at))}</time></div>`).join("")}</div>
          <div class="ipd-foot"><b>${m.indep==null?"—":m.indep+"%"}</b><span data-ago="${S.updatedAt}">${ipAgo(S.updatedAt)}</span></div>`}
      else if(r.status==="home"){let rows=[];if(!r.sim){const s=personById(r.id);if(s){try{rows=sipadRows(s).rows.filter(x=>x.kind==="session").slice(0,3)}catch(_e){}}}
        scr=`${bar}<div class="ipd-hello"><small>${new Date().getHours()<12?"صباح الخير":"مساء الخير"}</small><b>${esc(r.name)}</b></div><div class="ipd-tl">${rows.length?rows.map(x=>`<div><em>${sipadHM(x.from)}</em><span>${esc(x.a.patient.split(" ").slice(0,2).join(" "))}</span></div>`).join(""):`<div><em>—</em><span>فاتح جدول اليوم</span></div><div class="ph"></div><div class="ph"></div>`}</div>`}
      else if(r.status==="locked")scr=`<div class="ipd-lock"><b data-clock>${hm}</b><small>${new Date().toLocaleDateString("ar-SA",{weekday:"long",day:"numeric",month:"long"})}</small><span>${ic("lock",14)} مقفول</span></div>`;
      else scr=`<div class="ipd-off"><span>${ic("tablet",20)}</span><small>مو متصل</small>${r.hbAt?`<em>آخر ظهور من ${ipAgo(r.hbAt,true)}</em>`:""}</div>`;
      return `<button class="ip-dev st-${cls} ${panic?"panic":top&&top.lvl>=2?"warn":""}" onclick="ipOpen('${r.id}')" aria-label="${esc(r.name)} · ${lab}">
        <div class="ipd-bezel"><i class="ipd-cam"></i><div class="ipd-scr ${r.status==="offline"?"dark":""}">${scr}</div></div>
        <div class="ipd-cap"><span class="ip-dot"></span><b>${esc(r.name)}</b>${r.sim?`<em class="ipd-sim">تجريبي</em>`:""}</div>
        <div class="ipd-sub">${esc(r.role)} · ${lab}</div>
        ${top?`<div class="ip-alert l${top.lvl}">${esc(top.t)}${r.alerts.length>1?` <em>+${r.alerts.length-1}</em>`:""}</div>`:`<div class="ipd-ok">${r.status==="session"?"ماشي تمام":""}</div>`}</button>`}
    function ipTileSig(r){const S=r.sess;const t=r.m&&r.m.cur;return [r.status,S&&!S.locked?S.patient+S.cur+(t?t.trials.map(x=>x.r).join(""):""):"",r.alerts.map(a=>a.t.replace(/\d+/g,"#")).join("|"),r.m?r.m.indep:""].join("~")}
    setInterval(()=>{if(state.view!=="ipads")return;const now=new Date();const hm=pad2(now.getHours())+":"+pad2(now.getMinutes());document.querySelectorAll("#ip-grid [data-clock]").forEach(e=>e.textContent=hm);document.querySelectorAll("#ip-grid [data-ago]").forEach(e=>e.textContent=ipAgo(+e.dataset.ago))},1000);
    function ipAgo(t,bare){const s=Math.max(0,Math.round((Date.now()-t)/1000));const v=s<60?s+" ث":s<3600?Math.floor(s/60)+" د":Math.floor(s/3600)+" س";return bare?v:"آخر ضغطة من "+v}
    function ipPaint(){
      const room=document.getElementById("ip-room");if(!room)return;
      if(!state.ipMirror&&state.ipTab==="devices"){document.querySelectorAll("[data-devst]").forEach(el=>{const d=devById(el.dataset.devst);if(d){const st=devStatus(d);el.textContent=st.t;const icn=el.closest(".dv-card").querySelector(".dv-ic");if(icn)icn.className="dv-ic st-"+st.k}});return}
      const recs=ipRecords();
      if(state.ipMirror){const P=ipMirrorParts(recs);[["ip-who",P.who],["ip-screen",P.screen],["ip-stats",P.stats]].forEach(([id,h])=>{const el=document.getElementById(id);if(el&&el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}});return}
      const cnt={all:recs.length,alert:recs.filter(r=>r.alerts.length).length,session:0,home:0,locked:0,offline:0};recs.forEach(r=>cnt[r.status]++);
      document.getElementById("ip-kpis").innerHTML=[["الأجهزة",cnt.all,""],["متصلة الآن",cnt.all-cnt.offline,"on"],["في جلسة",cnt.session,"s"],["عليها تنبيه",cnt.alert,cnt.alert?"warn":""],["مو متصلة",cnt.offline,"o"]].map(([l,v,c])=>`<div class="ip-kpi ${c}"><b>${v}</b><small>${l}</small></div>`).join("");
      document.querySelectorAll("#ip-chips em").forEach(e=>e.textContent=cnt[e.dataset.c]);
      const q=(state.ipQ||"").trim();const f=state.ipF||"all";
      const list=recs.filter(r=>(!state.ipDept||r.dept===state.ipDept)&&(f==="all"||(f==="alert"?r.alerts.length:r.status===f))&&(!q||r.name.includes(q)||(r.sess&&r.sess.patient.includes(q))));
      const g=document.getElementById("ip-grid");g.className="ip-grid ipd-grid sz-"+(state.ipSize||"md");
      if(!list.length){g.innerHTML=`<div class="empty">ما فيه أجهزة بالفلتر هذا.</div>`}else{const e=g.querySelector(".empty");if(e)e.remove();mxKeyed(g,list.map(r=>({k:r.id,sig:ipTileSig(r),html:ipTile(r)})))}
    }
    function ipSize(k){state.ipSize=k;document.querySelectorAll(".ipd-size button").forEach(b=>b.classList.toggle("on",b.getAttribute("onclick")===`ipSize('${k}')`));ipPaint()}
    function ipSearch(v){state.ipQ=v;ipPaint()}
    function ipFilter(k){state.ipF=k;document.querySelectorAll("#ip-chips button").forEach(b=>b.classList.toggle("on",b.getAttribute("onclick")===`ipFilter('${k}')`));ipPaint()}
    function ipOpen(id){state.ipMirror=id;state.view="ipads";const r=ipRecords().find(x=>x.id===id);if(r&&!r.sim)audit("دخول على آيباد أخصائي (عرض)",r.name);render();window.scrollTo(0,0)}
    function ipClose(){state.ipMirror=null;render();window.scrollTo(0,0)}
    function ipStep(d){const recs=ipRecords();const i=recs.findIndex(r=>r.id===state.ipMirror);if(i<0)return;const r=recs[(i+d+recs.length)%recs.length];ipOpen(r.id)}
    function ipMsg(e){e.preventDefault();const txt=(new FormData(e.target).get("m")||"").trim();if(!txt)return;const r=ipRecords().find(x=>x.id===state.ipMirror);if(!r)return;
      if(r.sim){notify("هذا جهاز تجريبي، الرسالة ما تنرسل");e.target.reset();return}
      const me=getCurrentPerson();state.messages.unshift({id:"msg-"+Date.now()+"-ip",fromId:me?me.id:null,fromName:me?me.name:"المشرف",toId:r.id,toName:r.name,text:txt,date:todayISO(),read:false});
      audit("رسالة من المشرف لآيباد أخصائي",r.name);persist();notify("الرسالة وصلت للأخصائي");e.target.reset()}
    function ipMirrorParts(recs){
      recs=recs||ipRecords();const i=recs.findIndex(r=>r.id===state.ipMirror);const r=recs[i];
      const nav=`<div class="ip-mnav"><button class="btn btn-outline" onclick="ipClose()">← كل الآيبادات</button><div class="ip-mnav-r"><button class="btn btn-outline" onclick="ipStep(-1)" aria-label="الجهاز اللي قبله">‹</button><span>${i+1} من ${recs.length}</span><button class="btn btn-outline" onclick="ipStep(1)" aria-label="الجهاز اللي بعده">›</button></div></div>`;
      if(!r)return {ok:false,nav,who:`<div class="empty">الجهاز هذا مو موجود.</div>`,screen:"",stats:""};
      const [lab,cls]=IP_ST[r.status];const S=r.sess;const m=r.m;
      const who=`<div class="ip-mhead"><span class="ip-av big">${esc(r.name.replace(/^(أ\.|د\.)\s*/,"").charAt(0))}<i class="ip-dot st-${cls}"></i></span><div><h1>${esc(r.name)}</h1><p>${esc(r.role)} · <b class="ip-stl st-${cls}">${lab}</b>${r.sim?" · جهاز تجريبي":""}</p></div><span class="ip-watch"><span class="ai-live-dot"></span> تشوف الآيباد هذا لحظة بلحظة · عرض فقط</span></div>`;
      let screen;
      if(S){const t=m.cur;const tr=t.trials;const p=tr.length?Math.round(tr.filter(x=>x.r==="I").length/tr.length*100):null;const secs=Math.floor(m.elapsed/1000);
        screen=`<div class="ip-scr-head"><div><small>جلسة الطفل</small><b>${esc(S.patient)}</b><span>${esc(S.service)} · ${esc(S.room||"")} · ${S.targets.length} أهداف</span></div><div class="ip-timer">${pad2(Math.floor(secs/60))}:${pad2(secs%60)}</div></div>
          ${S.panicAt&&Date.now()-S.panicAt<10*60000?`<div class="ip-panic">طلب مساعدة عاجل من الغرفة</div>`:""}
          <div class="ip-scr-tg">${S.targets.map((x,j)=>{const pp=x.trials.length?Math.round(x.trials.filter(y=>y.r==="I").length/x.trials.length*100):null;return `<div class="${x.trials.length>=DTT_BLOCK?"done":j===S.cur&&!S.locked?"on":""}"><small>الهدف ${j+1}</small><b>${esc(x.text)}</b><span>${x.trials.length>=DTT_BLOCK?"تم ✓ · "+pp+"%":x.trials.length?"جاري · "+x.trials.length+"/"+DTT_BLOCK:"لم يبدأ"}</span></div>`}).join("")}</div>
          ${S.locked?`<div class="ip-scr-cur"><small>الجلسة</small><h2>انقفلت ✓</h2></div>`:`<div class="ip-scr-cur"><small>${esc(t.domain||"")}</small><h2>${esc(t.text)}</h2></div>
          <div class="ip-scr-bar"><i style="width:${tr.length/DTT_BLOCK*100}%"></i></div>
          <div class="ip-scr-btns">${DTT_CODES.map(c=>`<span class="dt-btn ${c.c} ${tr.length&&tr[tr.length-1].r===c.k&&Date.now()-tr[tr.length-1].at<1600?"flash":""}"><span class="dt-code">${c.k}</span><small>${c.d}</small></span>`).join("")}</div>`}
          <div class="ip-scr-dots">${Array.from({length:DTT_BLOCK},(_,k)=>{const x=tr[k];return x?`<span class="d r-${x.r} ${Date.now()-x.at<1600?"new":""}" title="${localTimeOf(new Date(x.at))}">${x.r}<small>${localTimeOf(new Date(x.at))}</small></span>`:`<span class="d e">${k+1}</span>`}).join("")}<b class="ip-scr-p">${p==null?"—":p+"%"}</b></div>
          ${S.note?`<div class="ip-scr-note"><small>ملاحظة الجلسة (تتكتب الحين)</small>${esc(S.note)}</div>`:""}`;
      }else if(!r.sim&&(r.status==="home")){const s=personById(r.id);const {rows}=s?sipadRows(s):{rows:[]};
        screen=`<div class="ip-scr-cur"><small>على الآيباد الحين</small><h2>جدول اليوم</h2></div><div class="ip-scr-tl">${rows.map(x=>`<div class="${x.kind}"><b>${sipadHM(x.from)}</b><span>${x.kind==="session"?esc(x.a.patient)+" · "+esc(x.a.service):x.kind==="break"?"استراحة":x.kind==="block"?esc(x.label):"التقارير"}</span>${x.kind==="session"?`<em>${x.a.status==="مكتمل"?"تمت ✓":""}</em>`:""}</div>`).join("")||`<div class="empty">ما فيه مواعيد.</div>`}</div>`;
      }else screen=`<div class="ip-scr-off"><div class="ip-scr-lock">${ic(r.status==="locked"?"lock":"idcard",34)}</div><h2>${r.status==="locked"?"الآيباد مقفول":r.status==="home"?"فاتح الجدول":"الآيباد مو متصل"}</h2><p>${r.hbAt?(r.status==="offline"?"آخر ظهور من ":"من ")+ipAgo(r.hbAt,true):"للحين ما دخل على آيباد الأخصائي اليوم"}</p></div>`;
      const stats=m?`<section class="card ip-stats"><div class="card-head"><h2>تحليل الجلسة لحظيًا</h2><span class="muted">${m.n} محاولة</span></div>
        <div class="ip-sgrid">${[["استقلالية (I)",m.indep==null?"—":m.indep+"%","g"],["اعتماد على المساعدة (P+C)",m.prompt==null?"—":m.prompt+"%",m.prompt>=60?"w":""],["ما فيه استجابة (NR)",m.nr==null?"—":m.nr+"%",m.nr>=30?"w":""],["متوسط الوقت بين المحاولات",m.avgGap==null?"—":m.avgGap+" ث",""],["أطول توقف",m.maxGap==null?"—":ipDur(m.maxGap),m.maxGap>180?"w":""],["محاولات في الدقيقة",m.perMin,""],["من آخر ضغطة",S.locked?"—":ipDur(Math.round(m.idle/1000)),m.idle>IP_IDLE?"w":""],["بداية الجلسة",m.late==null?"—":m.late<=0?"في الميعاد":"متأخرة "+m.late+" د",m.late>=10?"w":""]].map(([l,v,c])=>`<div class="ip-s ${c}"><b>${v}</b><small>${l}</small></div>`).join("")}</div>
        <div class="ip-mix"><i class="r-I" style="flex:${m.I||0.0001}"></i><i class="r-C" style="flex:${m.C||0.0001}"></i><i class="r-P" style="flex:${m.P||0.0001}"></i><i class="r-NR" style="flex:${m.NR||0.0001}"></i></div>
        <div class="ip-mix-l"><span>I ${m.I}</span><span>C ${m.C}</span><span>P ${m.P}</span><span>NR ${m.NR}</span></div>
        ${r.alerts.length?`<div class="ip-alerts">${r.alerts.map(a=>`<div class="ip-alert l${a.lvl}">${esc(a.t)}</div>`).join("")}</div>`:""}</section>
        <section class="card"><div class="card-head"><h2>سجل الضغطات</h2><span class="muted">الأحدث فوق</span></div><div class="table-wrap ip-log"><table class="data-table"><thead><tr><th>#</th><th>الوقت</th><th>الهدف</th><th>النتيجة</th><th>من اللي قبلها</th></tr></thead><tbody>
          ${m.all.slice().reverse().slice(0,40).map((x,k,arr)=>{const prev=arr[k+1];return `<tr class="${Date.now()-x.at<1600?"new":""}"><td>${m.all.length-k}</td><td>${localTimeOf(new Date(x.at))}</td><td>${esc(S.targets[x.ti].text)}</td><td><span class="ip-r r-${x.r}">${x.r}</span></td><td>${prev?Math.round((x.at-prev.at)/1000)+" ث":"—"}</td></tr>`}).join("")||`<tr><td colspan="5" class="muted">للحين ما فيه ضغطات.</td></tr>`}</tbody></table></div></section>`:"";
      return {ok:true,nav,who,screen,stats};
    }
    function ipActHtml(){return `<section class="card"><div class="card-head"><h2>رسالة للأخصائي</h2></div><form class="ip-msg" onsubmit="ipMsg(event)"><input class="input" name="m" placeholder="مثال: قللي المساعدة في الهدف هذا" maxlength="200"><button class="btn btn-primary" type="submit">إرسال</button></form>
        <div class="ip-quick">${["ممتاز، كمّلي كذا","قللي المساعدة تدريجي","غيّري المعزز","خدي استراحة قصيرة للطفل","أنا جاي الغرفة"].map(t=>`<button class="btn btn-outline" onclick="this.closest('.card').querySelector('input').value='${t}'">${t}</button>`).join("")}</div></section>`}
    function ipDur(s){return s<60?s+" ث":Math.floor(s/60)+" د "+(s%60?s%60+" ث":"")}
    setInterval(()=>{if(state.view==="ipads")ipPaint()},1500);
    window.addEventListener("storage",ev=>{if(ev.key===IP_KEY&&state.view==="ipads")ipPaint()});

    let _ipNoteT=null;const _ni=liveNoteInput;liveNoteInput=function(v){_ni(v);clearTimeout(_ipNoteT);_ipNoteT=setTimeout(()=>{syncBoard();persist()},700)};
    const _spl=sipadLogin;sipadLogin=function(e){_spl(e);if(state.sipad)ipHB(state.sipad,"home")};
    const _spk=sipadLock;sipadLock=function(){const id=state.sipad;_spk();if(id)ipHB(id,"locked")};
    const _sls=startLiveSession;startLiveSession=function(...a){const r=_sls.apply(this,a);if(state.sipadMode&&state.sipad)ipHB(state.sipad,"session");return r};
    const _renderMx=render;
    render=function(){
      if(state.view==="ipads"&&!state.intakeKiosk&&!state.sipadMode){const r=document.getElementById("ip-room");if(r&&r.dataset.role===state.role&&r.dataset.mirror===(state.ipMirror||"")&&(state.ipMirror||(r.dataset.tab||"live")===(state.ipTab||"live"))&&state.ipTab!=="devices"){ipPaint();return}}
      _renderMx();if(state.view==="ipads")ipPaint();
    };
    // =================== إدارة أجهزة الآيباد: تسجيل جهاز، صلاحيات، تحكم عن بعد، وتعديل الجدول ===================
    const DEV_PERMS=[["sessions","فتح الجلسات وتسجيل المحاولات"],["addGoal","إضافة هدف جديد أثناء الجلسة"],["undo","التراجع عن آخر محاولة"],["notes","كتابة ملاحظة الجلسة"],["dictate","الإملاء الصوتي"],["panic","زر طلب المساعدة"],["otherDays","عرض أيام ثانية غير اليوم"],["attendance","تسجيل الحضور تلقائي عند الدخول"]];
    const DEV_ROLES=["أخصائية نطق ولغة","أخصائي نطق ولغة","أخصائية تعديل سلوك","أخصائي تعديل سلوك","أخصائية علاج وظيفي","أخصائي علاج وظيفي","أخصائية علاج طبيعي","أخصائية تربية خاصة"];
    function ensureDevices(){if(!Array.isArray(state.devices))state.devices=[];if(!Array.isArray(state.timeBlocks))state.timeBlocks=[]}
    function devById(id){ensureDevices();return state.devices.find(d=>d.id===id)}
    function devDefaultPerms(){const p={};DEV_PERMS.forEach(([k])=>p[k]=true);return p}
    // ---- جهة الآيباد ----
    function sipadDevId(){try{return sessionStorage.getItem("awan-dev")}catch(_e){return null}}
    function sipadDevice(){const id=sipadDevId();return id?devById(id):null}
    function sipadPerm(k){if(!state.sipadMode)return true;const d=sipadDevice();return !d||!d.perms||d.perms[k]!==false}
    function sipadIdleMs(){const d=sipadDevice();const m=d&&d.autolock!=null?+d.autolock:10;return m>0?m*60000:Infinity}
    function sipadAllowedStaff(){const d=sipadDevice();const all=state.staff.filter(x=>x.roleCategory==="staff"||x.clinical);if(!d)return all;
      if(d.mode==="personal")return state.staff.filter(x=>x.id===d.staffId);const al=d.allowed||[];return al.length?state.staff.filter(x=>al.includes(x.id)):all}
    function sipadDenied(){notify("الصلاحية هذي مقفولة على الآيباد هذا من الإدارة")}
    function sipadCmdCheck(){const d=sipadDevice();if(!d||!d.cmd)return;let done="";try{done=sessionStorage.getItem("awan-dev-cmd")||""}catch(_e){}
      if(done===d.cmd.id)return;try{sessionStorage.setItem("awan-dev-cmd",d.cmd.id)}catch(_e){}
      if(Date.now()-d.cmd.at>90000)return;
      if(d.cmd.type==="lock"){setTimeout(()=>{if(state.sipad){sipadLock();notify("الإدارة قفلت الآيباد")}},0)}
      if(d.cmd.type==="msg"){state.sipadBanner={text:d.cmd.text,from:d.cmd.from||"الإدارة",at:d.cmd.at}}}
    function sipadBannerClose(){state.sipadBanner=null;render()}
    function sipadBannerHtml(){const b=state.sipadBanner;return b?`<div class="sp-banner"><span class="ai-live-dot"></span><div><small>رسالة من ${esc(b.from)} · ${localTimeOf(new Date(b.at))}</small><b>${esc(b.text)}</b></div><button class="btn btn-primary" onclick="sipadBannerClose()">تمام</button></div>`:""}
    setInterval(()=>{if(!state.sipadMode)return;const id=sipadDevId();if(!id)return;try{const m=ipHBRead();m["dev:"+id]={at:Date.now(),staffId:state.sipad||null};localStorage.setItem(IP_KEY,JSON.stringify(m))}catch(_e){}},8000);
    // ---- جهة الإدارة ----
    function devStatus(d){const h=ipHBRead()["dev:"+d.id];const on=h&&Date.now()-h.at<25000;const who=on&&h.staffId?personById(h.staffId):null;
      return d.disabled?{k:"off",t:"موقوف من الإدارة"}:!on?{k:"o",t:h?"مو متصل · آخر ظهور من "+ipAgo(h.at,true):"للحين ما انربط"}:who?{k:"s",t:"شغال · "+who.name,who}:{k:"l",t:"متصل · على شاشة الدخول"}}
    function devLink(d){return location.href.split("#")[0]+"#ipad="+d.id}
    function ipSeg(){const t=state.ipTab||"live";return `<div class="ip-seg"><button class="${t==="live"?"on":""}" onclick="ipSetTab('live')">${ic("pulse",14)} المتابعة اللحظية</button><button class="${t==="devices"?"on":""}" onclick="ipSetTab('devices')">${ic("tablet",14)} إدارة الأجهزة <em>${(state.devices||[]).length}</em></button></div>`}
    function ipSetTab(t){state.ipMirror=null;state.ipTab=t;state.ipEdit=null;render();window.scrollTo(0,0)}
    function devicesView(){ensureDevices();const E=state.ipEdit;const TL=state.ipTl;
      let h=`<div class="ip-room" id="ip-room" data-mirror="" data-tab="devices" data-role="${esc(state.role)}">`+head("مباشر","آيبادات الفريق","سجّل كل آيباد في المركز، حدد مين يستخدمه ووش المسموح عليه، انتحكم فيه وفي جدوله من هنا.",`<button class="btn btn-primary" onclick="ipDevEdit('new')">＋ إضافة آيباد</button>`)+ipSeg();
      if(E)h+=devEditorHtml(E==="new"?null:devById(E));
      if(TL)h+=devTimelineHtml();
      h+=state.devices.length?`<div class="dv-grid">${state.devices.map(devCard).join("")}</div>`:`<section class="card"><div class="empty">للحين ما فيه أجهزة متسجلة. اضغط «إضافة آيباد» وسجّل أول جهاز باسم الأخصائي اللي بيستخدمه.</div></section>`;
      return h+`</div>`}
    function devCard(d){const st=devStatus(d);const on=DEV_PERMS.filter(([k])=>d.perms[k]!==false).length;const arm=state.devDelArm===d.id;
      const owner=d.mode==="personal"?(personById(d.staffId)||{}).name||"—":(d.allowed&&d.allowed.length?d.allowed.length+" موظفين":"كل الأخصائيين");
      return `<article class="card dv-card ${d.disabled?"off":""}"><div class="dv-top"><span class="dv-ic st-${st.k}">${ic("tablet",22)}<i></i></span><div><h3>${esc(d.name)}</h3><small data-devst="${d.id}">${esc(st.t)}</small></div></div>
        <div class="dv-meta"><span><b>${d.mode==="personal"?"مخصص لـ":"مشترك بين"}</b> ${esc(owner)}</span><span><b>الصلاحيات</b> ${on} من ${DEV_PERMS.length}</span><span><b>القفل التلقائي</b> ${+d.autolock?d.autolock+" د":"مقفول"}</span>${d.mode==="personal"&&personById(d.staffId)?`<span><b>كود الدخول</b> ${esc(codeLabel(personById(d.staffId)))}</span>`:""}</div>
        <div class="dv-perms">${DEV_PERMS.map(([k,l])=>`<span class="${d.perms[k]!==false?"on":""}" title="${l}">${d.perms[k]!==false?"✓":"✕"} ${l}</span>`).join("")}</div>
        <div class="dv-acts">
          <button class="btn btn-outline" onclick="ipDevEdit('${d.id}')">الإعدادات والصلاحيات</button>
          <button class="btn btn-outline" onclick="ipTlOpen('${d.mode==="personal"?d.staffId:(st.who?st.who.id:"")}','${d.id}')">جدول الآيباد</button>
          <button class="btn btn-outline" onclick="ipDevCmd('${d.id}','lock')" ${st.k!=="s"?"disabled":""}>قفل الآن</button>
          <button class="btn btn-outline" onclick="ipDevMsgAsk('${d.id}')">رسالة على الشاشة</button>
          <button class="btn btn-outline" onclick="ipDevToggle('${d.id}')">${d.disabled?"تشغيل الجهاز":"إيقاف الجهاز"}</button>
          <button class="btn btn-outline" onclick="ipDevOpen('${d.id}')">فتح الجهاز</button>
          <button class="btn btn-outline dv-del ${arm?"arm":""}" onclick="ipDevDel('${d.id}')">${arm?"اضغط ثاني للحذف":"حذف"}</button></div>
        ${state.devMsg===d.id?`<form class="ip-msg" style="margin-top:10px" onsubmit="ipDevMsgSend(event,'${d.id}')"><input class="input" name="m" required maxlength="160" placeholder="الرسالة بتظهر على شاشة الآيباد فورًا"><button class="btn btn-primary">اعرضها</button></form>`:""}
        <div class="dv-link"><small>رابط الربط:</small><code>${esc(devLink(d))}</code><button class="btn btn-outline" onclick="ipDevCopy('${d.id}')">نسخ</button></div></article>`}
    function devEditorHtml(d){const isNew=!d;d=d||{name:"",mode:"personal",staffId:"",allowed:[],perms:devDefaultPerms(),autolock:10};
      const clin=state.staff.filter(x=>x.roleCategory==="staff"||x.clinical);
      return `<section class="card dv-edit"><div class="card-head"><h2>${isNew?"إضافة آيباد جديد":"إعدادات "+esc(d.name)}</h2><button class="btn btn-outline" onclick="ipDevEdit(null)">إلغاء</button></div>
        <form id="dv-form" onsubmit="ipDevSave(event,'${isNew?"":d.id}')" onchange="ipDevFormSync(this)" autocomplete="off"><div class="form-grid">
          <div class="field"><label>اسم الجهاز</label><input class="input" name="name" required maxlength="40" value="${esc(d.name)}" placeholder="مثال: آيباد غرفة 3"></div>
          <div class="field"><label>نوع الاستخدام</label><select class="select" name="mode"><option value="personal" ${d.mode==="personal"?"selected":""}>مخصص لموظف واحد</option><option value="shared" ${d.mode==="shared"?"selected":""}>مشترك بين أكثر من موظف</option></select></div>
          <div class="field dv-personal"><label>الموظف</label><select class="select" name="staffId"><option value="">اختر</option>${clin.map(s=>`<option value="${s.id}" ${d.staffId===s.id?"selected":""}>${esc(s.name)}</option>`).join("")}<option value="__new">＋ موظف جديد</option></select></div>
          <div class="field"><label>القفل التلقائي لو محد لمسه</label><select class="select" name="autolock">${[[5,"5 دقايق"],[10,"10 دقايق"],[15,"15 دقيقة"],[30,"30 دقيقة"],[0,"ما يقفل لوحده"]].map(([v,l])=>`<option value="${v}" ${+d.autolock===v?"selected":""}>${l}</option>`).join("")}</select></div></div>
          <fieldset class="dv-new" hidden><legend>بيانات الموظف الجديد</legend><div class="form-grid">
            <div class="field"><label>الاسم</label><input class="input" name="nName" maxlength="40" placeholder="مثال: أ. ريم الشهري"></div>
            <div class="field"><label>الوظيفة</label><select class="select" name="nRole">${DEV_ROLES.map(r=>`<option>${r}</option>`).join("")}</select></div>
            <div class="field"><label>القسم</label><select class="select" name="nDept">${(state.departments||[]).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></div>
            <div class="field"><label>النوع</label><select class="select" name="nGender"><option>أنثى</option><option>ذكر</option></select></div>
            <div class="field"><label>بداية الدوام</label><input class="input" type="time" name="nFrom" value="08:00"></div>
            <div class="field"><label>نهاية الدوام</label><input class="input" type="time" name="nTo" value="15:00"></div></div>
            <p class="muted" style="font-size:12px;margin:8px 0 0">المنصة بتعمل له كود دخول تلقائي، ويستخدمه على الآيباد وكيوسك الباب.</p></fieldset>
          <fieldset class="dv-shared" hidden><legend>مين يقدر يدخل على الجهاز هذا؟ (لو ما اخترت حد، كل الأخصائيين)</legend><div class="dv-checks">${clin.map(s=>`<label><input type="checkbox" name="allowed" value="${s.id}" ${(d.allowed||[]).includes(s.id)?"checked":""}> ${esc(s.name)}</label>`).join("")}</div></fieldset>
          <fieldset><legend>الصلاحيات على الجهاز</legend><div class="dv-checks">${DEV_PERMS.map(([k,l])=>`<label class="dv-sw"><input type="checkbox" name="p_${k}" ${d.perms[k]!==false?"checked":""}><span></span> ${l}</label>`).join("")}</div></fieldset>
          <div class="dt-actions" style="margin-top:14px"><button class="btn btn-primary" type="submit">${isNew?"تسجيل الجهاز":"حفظ"}</button></div></form></section>`}
    function ipDevFormSync(f){if(!f)return;const mode=f.mode.value;f.querySelector(".dv-personal").hidden=mode!=="personal";f.querySelector(".dv-shared").hidden=mode!=="shared";f.querySelector(".dv-new").hidden=!(mode==="personal"&&f.staffId.value==="__new")}
    function ipDevEdit(id){state.ipEdit=id;state.ipTl=null;render();setTimeout(()=>{ipDevFormSync(document.getElementById("dv-form"));const f=document.getElementById("dv-form");if(f)f.scrollIntoView({block:"start",behavior:"smooth"})},0)}
    function devNewCode(name){const base=(name.replace(/^(أ\.|د\.)\s*/,"").trim().charAt(0))||"م";const used=new Set(state.staff.map(s=>String(s.code||"")));for(let i=1;i<100;i++){const c=base+i;if(!used.has(c))return c}return base+Date.now()%1000}
    function ipDevSave(e,id){e.preventDefault();ensureDevices();const f=e.target;const fd=new FormData(f);const mode=fd.get("mode");let staffId=fd.get("staffId")||"";let created=null;
      if(mode==="personal"&&staffId==="__new"){const nm=(fd.get("nName")||"").trim();if(!nm){notify("اكتب اسم الموظف الجديد");return}
        created={id:"st-"+Date.now(),name:nm,role:fd.get("nRole"),schedule:`${fd.get("nFrom")||"08:00"} — ${fd.get("nTo")||"15:00"}`,status:"متاحة",present:false,gender:fd.get("nGender"),code:devNewCode(nm),roleCategory:"staff",clinical:true,department:fd.get("nDept")||""};
        state.staff.push(created);staffId=created.id;audit("إضافة موظف جديد من إدارة الأجهزة",nm)}
      if(mode==="personal"&&!staffId){notify("اختار الموظف اللي بيستخدم الجهاز");return}
      const perms={};DEV_PERMS.forEach(([k])=>perms[k]=!!fd.get("p_"+k));
      const data={name:(fd.get("name")||"").trim(),mode,staffId:mode==="personal"?staffId:"",allowed:mode==="shared"?fd.getAll("allowed"):[],perms,autolock:+fd.get("autolock")};
      let d=id&&devById(id);if(d)Object.assign(d,data);else{d={id:"dev-"+Date.now().toString(36),createdAt:new Date().toISOString(),disabled:false,cmd:null,...data};state.devices.push(d)}
      audit(id?"تعديل إعدادات وصلاحيات آيباد":"تسجيل آيباد جديد",d.name);state.ipEdit=null;persist();render();
      notify(created?`انسجل ${d.name} لـ ${created.name} · كود الدخول: ${created.code}`:id?"انحفظت إعدادات الجهاز بتوصله فورًا":`انسجل ${d.name}. افتح رابط الربط على الآيباد نفسه`)}
    function ipDevCmd(id,type,text){const d=devById(id);if(!d)return;const me=getCurrentPerson();d.cmd={id:"c-"+Date.now(),type,text:text||"",at:Date.now(),from:me?me.name:"الإدارة"};audit(type==="lock"?"قفل آيباد عن بعد":"رسالة على شاشة آيباد",d.name);persist();notify(type==="lock"?"انرسل أمر القفل للجهاز":"الرسالة ظهرت على الجهاز");render()}
    function ipDevMsgAsk(id){state.devMsg=state.devMsg===id?null:id;render();setTimeout(()=>{const i=document.querySelector(`form[onsubmit*="${id}"] input`);if(i)i.focus()},0)}
    function ipDevMsgSend(e,id){e.preventDefault();const t=(new FormData(e.target).get("m")||"").trim();if(!t)return;state.devMsg=null;ipDevCmd(id,"msg",t)}
    function ipDevToggle(id){const d=devById(id);if(!d)return;d.disabled=!d.disabled;audit(d.disabled?"إيقاف آيباد":"تشغيل آيباد",d.name);persist();render()}
    function ipDevDel(id){if(state.devDelArm!==id){state.devDelArm=id;render();setTimeout(()=>{if(state.devDelArm===id){state.devDelArm=null;render()}},4000);return}
      const d=devById(id);state.devices=state.devices.filter(x=>x.id!==id);state.devDelArm=null;audit("حذف آيباد",d?d.name:"");persist();render()}
    function ipDevCopy(id){const d=devById(id);if(!d)return;const t=devLink(d);try{navigator.clipboard.writeText(t).then(()=>notify("انتسخ رابط الربط"),()=>notify(t))}catch(_e){notify(t)}}
    function ipDevOpen(id){const d=devById(id);if(!d)return;window.open(devLink(d),"_blank","noopener")}
    // ---- جدول الآيباد (التايم لاين) ----
    function ipTlOpen(staffId,devId){state.ipMirror=null;state.ipTab="devices";state.ipEdit=null;state.ipTl={staffId:staffId||"",day:localDateOf(new Date()),devId:devId||""};render();setTimeout(()=>{const c=document.querySelector(".dv-tl");if(c)c.scrollIntoView({block:"start",behavior:"smooth"})},0)}
    function ipTlClose(){state.ipTl=null;render()}
    function ipTlPick(k,v){state.ipTl[k]=v;render()}
    function devTimelineHtml(){const T=state.ipTl;const s=T.staffId&&personById(T.staffId);const clin=state.staff.filter(x=>x.roleCategory==="staff"||x.clinical);
      let h=`<section class="card dv-tl"><div class="card-head"><h2>${ic("schedule",18)} جدول الآيباد${s?" · "+esc(s.name):""}</h2><button class="btn btn-outline" onclick="ipTlClose()">إغلاق</button></div>
        <div class="dv-tl-bar"><div class="field"><label>الموظف</label><select class="select" onchange="ipTlPick('staffId',this.value)"><option value="">اختر</option>${clin.map(x=>`<option value="${x.id}" ${x.id===T.staffId?"selected":""}>${esc(x.name)}</option>`).join("")}</select></div>
        <div class="field"><label>اليوم</label><input class="input" type="date" value="${T.day}" onchange="ipTlPick('day',this.value)"></div></div>`;
      if(!s)return h+`<div class="empty">اختار الموظف اللي يبي تعدل جدوله.</div></section>`;
      const sh=sipadShift(s)||[480,900];
      const {rows}=sipadRows(s,T.day);const pts=state.patients.filter(p=>!p.archived);
      h+=`<form class="dv-hours" onsubmit="ipTlHours(event)"><b>يوم العمل</b><input class="input" type="time" name="f" value="${sipadHM(sh[0])}"><span>لـ</span><input class="input" type="time" name="t" value="${sipadHM(sh[1])}"><b>البريك</b><input class="input" type="time" name="bf" value="${(()=>{const b=sipadBreak(s);return b?sipadHM(b[0]):""})()}"><span>لـ</span><input class="input" type="time" name="bt" value="${(()=>{const b=sipadBreak(s);return b?sipadHM(b[1]):""})()}"><button class="btn btn-outline">حفظ الدوام</button></form>
        <p class="muted" style="font-size:12.5px">أي تعديل هنا يوصل للآيباد لحظتها. الاستراحات الفاضية تتحسب لوحدها، وتقدر تضيف فترات ثابتة زي اجتماع أو تدريب.</p>
        <div class="dv-rows">${rows.length?rows.map(r=>{const tm=`<span class="dv-t">${sipadHM(r.from)} – ${sipadHM(r.to)}</span>`;
          if(r.kind==="session"){const a=r.a;return `<form class="dv-row ses ${a.status==="مكتمل"?"done":""}" onsubmit="ipTlSaveApt(event,'${a.id}')">${tm}
            <input class="input" type="time" name="time" value="${esc(a.time)}" aria-label="الوقت"><select class="select" name="dur" aria-label="المدة">${[30,40,45,60].map(v=>`<option value="${v}" ${(+a.duration||SIPAD_SLOT)===v?"selected":""}>${v} د</option>`).join("")}</select>
            <select class="select" name="patient" aria-label="الطفل">${pts.map(p=>`<option ${p.name===a.patient?"selected":""}>${esc(p.name)}</option>`).join("")}${pts.some(p=>p.name===a.patient)?"":`<option selected>${esc(a.patient)}</option>`}</select>
            <input class="input" name="room" value="${esc(a.room||"")}" aria-label="الغرفة" placeholder="الغرفة">
            <span class="dv-st">${a.status==="مكتمل"?"تمت ✓":esc(a.status||"")}</span><button class="btn btn-outline" type="submit">حفظ</button><button class="btn btn-outline dv-del" type="button" onclick="ipTlCancelApt('${a.id}')">إلغاء الجلسة</button></form>`}
          if(r.kind==="block")return `<div class="dv-row blk">${tm}<b>${esc(r.label)}</b><span class="muted">فترة ثابتة من الإدارة</span><button class="btn btn-outline dv-del" onclick="ipTlDelBlock('${r.b.id}')">حذف</button></div>`;
          return `<div class="dv-row auto">${tm}<b>${r.kind==="break"?"استراحة":"التقارير"}</b><span class="muted">تتحسب لوحدها</span></div>`}).join(""):`<div class="empty">ما فيه شي في اليوم هذا.</div>`}</div>
        <div class="dv-add"><form onsubmit="ipTlAddApt(event)"><b>＋ جلسة</b><select class="select" name="patient" required><option value="">الطفل</option>${pts.map(p=>`<option>${esc(p.name)}</option>`).join("")}</select><input class="input" type="time" name="time" required><select class="select" name="dur">${[30,40,45,60].map(v=>`<option value="${v}" ${v===40?"selected":""}>${v} د</option>`).join("")}</select><input class="input" name="room" placeholder="الغرفة"><input class="input" name="service" placeholder="نوع الجلسة" value="جلسة نطق ولغة"><button class="btn btn-primary">إضافة</button></form>
          <form onsubmit="ipTlAddBlock(event)"><b>＋ فترة ثابتة</b><select class="select" name="label">${["استراحة","اجتماع","تدريب","تقارير","إشراف","تقييم"].map(x=>`<option>${x}</option>`).join("")}</select><input class="input" type="time" name="from" required><span>لـ</span><input class="input" type="time" name="to" required><button class="btn btn-primary">إضافة</button></form></div></section>`;
      return h}
    function ipTlStaff(){return personById(state.ipTl&&state.ipTl.staffId)}
    function ipTlOverlap(s,day,from,dur,skipId){return state.appointments.some(a=>a.id!==skipId&&a.clinician===s.name&&a.date===day&&a.status!=="ملغي"&&(()=>{const f=sipadMin(a.time),t=f+(+a.duration||SIPAD_SLOT);return from<t&&from+dur>f})())}
    function ipTlSaveApt(e,id){e.preventDefault();const a=state.appointments.find(x=>x.id===id);const s=ipTlStaff();if(!a||!s)return;const fd=new FormData(e.target);const tm=fd.get("time"),dur=+fd.get("dur");
      if(ipTlOverlap(s,a.date,sipadMin(tm),dur,id))notify("تنبيه: الوقت هذا متداخل مع جلسة ثانية");
      Object.assign(a,{time:tm,duration:dur,patient:fd.get("patient"),room:fd.get("room")});audit("تعديل جلسة في جدول آيباد",s.name+" · "+a.patient);persist();render();notify("الجدول تحدث على الآيباد")}
    function ipTlCancelApt(id){const a=state.appointments.find(x=>x.id===id);if(!a)return;a.status="ملغي";audit("إلغاء جلسة من جدول آيباد",a.patient);persist();render()}
    function ipTlAddApt(e){e.preventDefault();const s=ipTlStaff();if(!s)return;const fd=new FormData(e.target);const day=state.ipTl.day;const tm=fd.get("time"),dur=+fd.get("dur");
      if(ipTlOverlap(s,day,sipadMin(tm),dur,null))notify("تنبيه: الوقت هذا متداخل مع جلسة ثانية");
      state.appointments.push({id:"apt-"+Date.now(),date:day,time:tm,duration:dur,patient:fd.get("patient"),service:(fd.get("service")||"جلسة").trim(),clinician:s.name,room:(fd.get("room")||"").trim()||"—",status:"مجدول",newForStaff:true});
      audit("إضافة جلسة لجدول آيباد",s.name+" · "+fd.get("patient"));persist();render();notify("الجلسة ظهرت على الآيباد")}
    function ipTlAddBlock(e){e.preventDefault();const s=ipTlStaff();if(!s)return;ensureDevices();const fd=new FormData(e.target);if(fd.get("to")<=fd.get("from")){notify("وقت النهاية لازم يكون بعد البداية");return}
      state.timeBlocks.push({id:"tb-"+Date.now(),staffId:s.id,date:state.ipTl.day,from:fd.get("from"),to:fd.get("to"),label:fd.get("label")});audit("إضافة فترة لجدول آيباد",s.name+" · "+fd.get("label"));persist();render()}
    function ipTlDelBlock(id){ensureDevices();state.timeBlocks=state.timeBlocks.filter(b=>b.id!==id);persist();render()}
    function ipTlHours(e){e.preventDefault();const s=ipTlStaff();if(!s)return;const fd=new FormData(e.target);s.schedule=`${fd.get("f")} — ${fd.get("t")}`;audit("تعديل دوام موظف من جدول الآيباد",s.name);persist();render();notify("الدوام تحدث")}
    // لوحة التحكم جوه عرض آيباد الموظف
    function ipCtlHtml(){const r=state.ipMirror&&!String(state.ipMirror).startsWith("sim-")?personById(state.ipMirror):null;if(!r)return "";
      const h=ipHBRead()[r.id];const dev=h&&h.dev?devById(h.dev):null;const onDev=dev&&h&&Date.now()-h.at<IP_ONLINE&&h.status!=="locked";
      return `<section class="card"><div class="card-head"><h2>التحكم في الآيباد</h2><span class="muted">${dev?esc(dev.name):"مو على جهاز متسجل"}</span></div><div class="dv-acts">
        <button class="btn btn-outline" onclick="ipDevCmd('${dev?dev.id:""}','lock')" ${onDev?"":"disabled"}>قفل الآيباد الآن</button>
        <button class="btn btn-outline" onclick="ipCtlMsg()" ${dev?"":"disabled"}>اعرض رسالة على شاشته</button>
        <button class="btn btn-outline" onclick="ipTlOpen('${r.id}','${dev?dev.id:""}')">تعديل جدوله</button>
        ${dev?`<button class="btn btn-outline" onclick="ipSetTab('devices');ipDevEdit('${dev.id}')">صلاحيات الجهاز</button>`:""}</div></section>`}
    function ipCtlMsg(){const i=document.querySelector(".ip-msg input");const t=i&&i.value.trim();if(!t){notify("اكتب الرسالة في خانة «رسالة للأخصائي» الأول");if(i)i.focus();return}const h=ipHBRead()[state.ipMirror];if(h&&h.dev)ipDevCmd(h.dev,"msg",t)}

    const _gU=liveUndo;liveUndo=function(...a){if(!sipadPerm("undo"))return sipadDenied();return _gU.apply(this,a)};
    const _gA=liveAddGoal;liveAddGoal=function(e){if(!sipadPerm("addGoal")){if(e)e.preventDefault();return sipadDenied()}return _gA.call(this,e)};
    const _gD=liveDictate;liveDictate=function(...a){if(!sipadPerm("dictate"))return sipadDenied();return _gD.apply(this,a)};
    const _gP=livePanic;livePanic=function(...a){if(!sipadPerm("panic"))return sipadDenied();return _gP.apply(this,a)};
    const _gO=sipadOpen;sipadOpen=function(...a){if(!sipadPerm("sessions"))return sipadDenied();return _gO.apply(this,a)};
