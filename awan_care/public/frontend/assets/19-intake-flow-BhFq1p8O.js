const e=`"use strict";
// أوان — الجزء 19: الاستقبال — مسار الأسرة من أول زيارة لين جداول الأخصائيين
// الاستقبال يسجّل ← المشرف العام يعمل دراسة الحالة ويحدد القسم ← مشرف القسم يقيّم ويكتب التوجيه بالخطة
// ← الاستقبال يحجز المواعيد حسب التوجيه ← الطفل يدخل جداول الأخصائيين.
// الإحالات ودراسة الحالة الإلكترونية تدخل نفس مسار الاستقبال.
// كل خطوة تكتب في نفس البيانات اللي تقراها رحلة الطفل: دراسة الحالة، موعد التقييم، الأهداف المعتمدة، الموافقة، المواعيد.

    const FD_STAGES=[
      {k:"case",l:"دراسة الحالة",who:"المشرف العام",ic:"book"},
      {k:"assess",l:"التقييم والتوجيه",who:"مشرف القسم",ic:"target"},
      {k:"book",l:"حجز المواعيد",who:"الاستقبال",ic:"schedule"},
      {k:"done",l:"في الجدول",who:"الأخصائيين",ic:"check"}
    ];
    const FD_SRC={normal:"استقبال عادي",smart:"استقبال ذكي",referral:"إحالة"};
    const FD_GRID=["08:00","08:40","09:20","10:00","10:40","11:20","12:00","12:40","13:20","14:00","14:40","15:20"];
    const FD_SPREAD=[[0],[0,2],[0,2,4],[0,1,3,4],[0,1,2,3,4]];

    (function fdStyles(){
      const st=document.createElement("style");
      st.textContent=\`.fd-flow{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:4px 0 18px}
.fd-step{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;position:relative}
.fd-step b{font-size:13px}.fd-step small{color:var(--muted);font-size:11px}
.fd-step .n{position:absolute;top:8px;left:10px;font-weight:800;color:var(--navy);font-size:18px}
.fd-step.me{border-color:var(--navy);box-shadow:0 0 0 2px rgba(14,131,136,.15)}
.fd-turn{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;background:#E8F6F4;border:1px solid #BFE6E1;color:#0B4F52;margin-bottom:16px;font-size:13px}
[data-theme="dark"] .fd-turn{background:#0f3a3c;border-color:#1d5c5f;color:#d6f3ef}
.fd-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:start}
.fd-col{background:var(--cream-2);border-radius:16px;padding:10px;min-height:120px}
.fd-col-h{display:flex;align-items:center;justify-content:space-between;padding:4px 6px 10px}
.fd-col-h b{font-size:13px}.fd-col-h small{display:block;color:var(--muted);font-size:11px;font-weight:600}
.fd-col-h em{font-style:normal;background:var(--card);border-radius:99px;padding:2px 9px;font-weight:800;font-size:12px}
.fd-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:8px;display:flex;flex-direction:column;gap:8px}
.fd-card-h{display:flex;gap:10px;align-items:center}
.fd-av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--gold-2);color:#8a5a12;font-weight:800;flex:none}
.fd-card-h b{font-size:13px;display:block}.fd-card-h small{color:var(--muted);font-size:11px}
.fd-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.fd-src{font-style:normal;font-size:10px;font-weight:800;border-radius:99px;padding:3px 8px;background:#eef2ff;color:#4338ca;white-space:nowrap}
.fd-src.smart{background:#ecfeff;color:#0e7490}.fd-src.referral{background:#fff7ed;color:#c2410c}
.fd-meta{font-size:12px;color:var(--ink);line-height:1.7}
.fd-wait{font-size:11px;color:var(--muted)}.fd-wait.late{color:var(--danger);font-weight:700}
.fd-owner{font-size:11px;color:var(--muted);display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap}
.fd-owner button{background:none;border:0;color:var(--navy);font-weight:700;font-size:11px;cursor:pointer;padding:0}
.fd-card .btn{width:100%;justify-content:center}
.fd-empty{color:var(--muted);font-size:12px;text-align:center;padding:14px 6px}
.fd-pop{width:min(760px,100%)}
.fd-pop h3{margin:0 0 4px}.fd-pop .form-grid{margin-top:12px}
.fd-lines{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}
.fd-lines td,.fd-lines th{padding:7px 6px;border-bottom:1px solid var(--line);text-align:start}
.fd-lines th{font-size:11px;color:var(--muted);font-weight:700}
.fd-prev{max-height:240px;overflow:auto;border:1px solid var(--line);border-radius:12px;margin-top:10px}
.fd-ok{display:flex;gap:8px;align-items:flex-start;margin-top:12px;font-size:13px}
.fd-acts{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
@media (max-width:1100px){.fd-board{grid-template-columns:repeat(2,minmax(0,1fr))}.fd-flow{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.fd-board,.fd-flow{grid-template-columns:1fr}}\`;
      document.head.appendChild(st);
    })();

    // ---- مين يتصرف في كل خطوة ----
    function fdMe(){return getCurrentPerson()}
    function fdIsDeptSup(s){return !!s&&s.roleCategory==="supervisor"&&!!s.department}
    function fdDeptSup(dep){return state.staff.find(s=>s.roleCategory==="supervisor"&&s.department===dep)||null}
    function fdIsGeneralSup(){return state.role==="supervisor"&&!fdIsDeptSup(fdMe())}
    function fdCan(stage,p){
      if(state.role==="management")return true;
      if(stage==="register"||stage==="book")return state.role==="reception";
      if(stage==="case")return fdIsGeneralSup();
      if(stage==="assess"){const me=fdMe();return fdIsDeptSup(me)&&(!p||me.department===p.intake.dept)}
      return false;
    }
    function fdMine(p){return p.intake.stage!=="done"&&fdCan(p.intake.stage,p)&&state.role!=="management"}

    function fdList(){return state.patients.filter(p=>p.intake&&!p.archived)}
    function fdNow(){return new Date().toISOString()}
    function fdStageAt(p){const i=p.intake;return i.stage==="case"?i.regAt:i.stage==="assess"?i.caseAt:i.stage==="book"?i.assessAt:i.bookedAt}
    function fdAgo(iso){const m=Math.max(0,Math.round((Date.now()-Date.parse(iso||0))/60000));if(m<60)return m<=1?"الحين":\`من \${m} دقيقة\`;const h=Math.round(m/60);if(h<24)return \`من \${h} ساعة\`;const d=Math.round(h/24);return d===1?"من أمس":\`من \${d} أيام\`}
    function fdLate(p){return p.intake.stage!=="done"&&Date.now()-Date.parse(fdStageAt(p)||0)>2*864e5}
    function fdLines(p){const d=p.intake.direction;return d&&d.lines?d.lines:[]}
    function fdLinesText(p){return fdLines(p).map(l=>\`\${deptName(l.dept)} \${l.perWeek}/أسبوع\`).join(" · ")}

    // ---- إنشاء ملف ودخول المسار ----
    function fdCreate(o){
      const num=1000+state.patients.length+1;const pid="p"+Date.now()+Math.floor(Math.random()*90+10);
      const p={id:pid,name:String(o.child||"").trim(),file:"AWN-"+num,age:o.age||"—",gender:o.gender||"",need:o.reason||"",program:"قيد دراسة الحالة",school:o.school||"",
        guardian:o.guardian||"",phone:o.phone||"",status:"قيد التقييم",notes:o.reason?"سبب المراجعة: "+o.reason:"",goal:"يُحدَّد بعد التقييم",next:"",
        code:"AWN-"+num,schoolCode:"",archived:false,assignedPrograms:[],consents:[],
        intake:{source:o.source||"normal",stage:"case",regAt:o.at||fdNow(),regBy:o.by||auditActor().name,reason:o.reason||"",ref:o.ref||""}};
      if(typeof defaultHealth==="function")p.health=defaultHealth(p);
      state.patients.unshift(p);
      return p;
    }

    // ---- المشرف العام: دراسة الحالة ----
    const FD_CASE_FIELDS=[["reason","الشكوى الرئيسية / سبب المراجعة",1],["dev","التاريخ النمائي (الحمل والولادة ومراحل النمو)"],["medical","التاريخ الطبي والأدوية والفحوصات"],
      ["comm","التواصل واللغة"],["behavior","السلوك والتفاعل الاجتماعي"],["skills","الاستقلالية والمهارات الحالية"],["school","الوضع الدراسي"],["expect","توقعات الأسرة"]];
    function fdApplyCase(p,f,by,at){
      const old=caseStudyOf(p);
      const fields=Object.assign({},old?old.fields:{},{child:p.name,age:p.age,guardian:p.guardian,phone:p.phone});
      FD_CASE_FIELDS.forEach(([k])=>{if(f[k])fields["sup_"+k]=f[k]});if(f.reason&&!fields.reason)fields.reason=f.reason;
      p.caseStudy={fields,analysis:analyzeIntake(fields),at:at||fdNow(),by,source:"دراسة الحالة — المشرف العام",sup:Object.fromEntries(FD_CASE_FIELDS.map(([k])=>[k,f[k]||""]))};
      p.caseStudyRequested=false;
      Object.assign(p.intake,{stage:"assess",dept:f.dept,caseBy:by,caseAt:at||fdNow(),caseNote:f.note||""});
      p.program=deptName(f.dept);if(f.reason)p.need=f.reason;
    }
    function fdCaseSubmit(e,pid){
      e.preventDefault();const p=state.patients.find(x=>x.id===pid);if(!p)return;
      const f=Object.fromEntries(new FormData(e.target).entries());if(!f.dept)return notify("اختر القسم المحوّل له");
      const by=auditActor().name;fdApplyCase(p,f,by);
      const sup=fdDeptSup(f.dept);
      if(sup&&typeof cmSendTo==="function")cmSendTo("staff:"+sup.id,\`📋 \${p.name} محوّل لك للتقييم وكتابة التوجيه بالخطة العلاجية — دراسة الحالة جاهزة في «الاستقبال».\`);
      audit("دراسة حالة ← تحويل لمشرف القسم",p.name);state.fdOpen=null;persist();
      notify(\`انحفظت دراسة الحالة وانحوّل \${p.name.split(" ")[0]} لـ\${sup?sup.name:deptName(f.dept)}\`);render();
    }

    // ---- مشرف القسم (السينيور): التقييم والتوجيه بالخطة ----
    function fdApplyAssess(p,d,staff,at){
      const when=at||fdNow();const dt=new Date(when);
      const lines=d.lines.filter(l=>l.dept&&+l.perWeek>0).map(l=>({dept:l.dept,perWeek:+l.perWeek,minutes:+l.minutes||40}));
      const goals=String(d.goals||"").split("\\n").map(x=>x.trim()).filter(Boolean);
      p.intake.direction={lines,goals,summary:d.summary||"",level:d.level||"",notes:d.notes||"",by:staff.name,at:when};
      Object.assign(p.intake,{stage:"book",assessBy:staff.name,assessAt:when});
      state.appointments.push({id:"apt-"+Date.now()+"-as",date:localDateOf(dt),time:pad2(dt.getHours())+":"+pad2(dt.getMinutes()),duration:45,patient:p.name,
        service:"تقييم أولي — "+deptName(p.intake.dept),clinician:staff.name,room:"غرفة التقييم",status:"مكتمل",intakeId:p.id});
      const g=goalsOf(p);for(let i=g.length-1;i>=0;i--)if(g[i].status==="مقترح")g.splice(i,1);
      goals.forEach((t,i)=>g.push({id:"g-"+Date.now()+"-"+i,text:t,dept:p.intake.dept,domain:deptName(p.intake.dept),source:"توجيه مشرف القسم",status:"معتمد",approvedAt:when,approvedBy:staff.name}));
      if(goals[0])p.goal=goals[0];if(d.summary)p.need=d.summary;
      p.program=lines.map(l=>deptName(l.dept)).join(" · ")||p.program;
    }
    function fdAssessSubmit(e,pid){
      e.preventDefault();const p=state.patients.find(x=>x.id===pid);if(!p)return;
      const fd=new FormData(e.target);const lines=state.departments.map(d=>({dept:fd.get("on_"+d.id)?d.id:null,perWeek:fd.get("pw_"+d.id),minutes:fd.get("mn_"+d.id)}));
      const d={summary:fd.get("summary"),level:fd.get("level"),goals:fd.get("goals"),notes:fd.get("notes"),lines};
      if(!lines.some(l=>l.dept))return notify("حدد قسم واحد على الأقل في التوجيه");
      const staff=fdMe()||fdDeptSup(p.intake.dept)||{name:auditActor().name};
      fdApplyAssess(p,d,staff);
      if(typeof cmSendTo==="function")cmSendTo("dept:reception",\`✅ \${p.name} جاهز للحجز: \${fdLinesText(p)}.\`);
      audit("تقييم وتوجيه بالخطة ← تحويل للاستقبال",p.name);state.fdOpen=null;persist();
      notify(\`انحفظ التوجيه، و\${p.name.split(" ")[0]} صار عند الاستقبال للحجز\`);render();
    }

    // ---- الاستقبال: حجز المواعيد حسب التوجيه ----
    function fdWorkdays(fromISO,n){const out=[];const d=new Date(fromISO+"T12:00:00");while(out.length<n){if(d.getDay()<=4)out.push(localDateOf(d));d.setDate(d.getDate()+1)}return out}
    function fdNextWorkday(){const d=new Date();d.setDate(d.getDate()+1);while(d.getDay()>4)d.setDate(d.getDate()+1);return localDateOf(d)}
    function fdClinicians(dep){return state.staff.filter(s=>s.department===dep&&(s.clinical||s.roleCategory==="staff"))}
    function fdLoad(name){const t=localDateOf(new Date());return state.appointments.filter(a=>a.clinician===name&&a.status!=="ملغي"&&a.date>=t).length}
    function fdFree(clin,pname,date,t,dur,extra){
      const s=sipadMin(t),e=s+dur;
      const hit=a=>a.date===date&&a.status!=="ملغي"&&(a.clinician===clin.name||a.patient===pname)&&(()=>{const as=sipadMin(a.time),ae=as+(+a.duration||40);return s<ae&&as<e})();
      const sh=sipadShift(clin);if(sh&&(s<sh[0]||e>sh[1]))return false;
      return !state.appointments.some(hit)&&!extra.some(hit);
    }
    function fdPlan(p,cfg,lines){
      const out=[],miss=[];
      (lines||fdLines(p)).forEach(l=>{
        const clin=personById(cfg.picks[l.dept])||fdClinicians(l.dept).sort((a,b)=>fdLoad(a.name)-fdLoad(b.name))[0];
        if(!clin){miss.push(deptName(l.dept));return}
        for(let w=0;w<cfg.weeks;w++){
          const days=fdWorkdays(fdWorkdays(cfg.start,1+w*5)[w*5],5);
          const want=FD_SPREAD[Math.min(5,l.perWeek)-1];const used=new Set();let got=0;
          const order=[...want,...[0,1,2,3,4].filter(i=>!want.includes(i))];
          for(const i of order){if(got>=l.perWeek)break;if(used.has(i))continue;
            const times=FD_GRID.filter(t=>cfg.pref==="am"?t<"12:00":cfg.pref==="pm"?t>="12:00":true);
            const t=times.find(t=>fdFree(clin,p.name,days[i],t,l.minutes,out));
            if(t){out.push({dept:l.dept,clinician:clin.name,patient:p.name,date:days[i],time:t,duration:l.minutes,status:"مجدول"});used.add(i);got++}}
          if(got<l.perWeek)miss.push(\`\${deptName(l.dept)} (أسبوع \${w+1})\`);
        }
      });
      return {list:out.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),miss};
    }
    function fdBookCfg(p){
      const c=state.fdBook&&state.fdBook.pid===p.id?state.fdBook:{pid:p.id,start:fdNextWorkday(),weeks:4,pref:"any",picks:{}};
      fdLines(p).forEach(l=>{if(!c.picks[l.dept]){const s=fdClinicians(l.dept).sort((a,b)=>fdLoad(a.name)-fdLoad(b.name))[0];if(s)c.picks[l.dept]=s.id}});
      state.fdBook=c;return c;
    }
    function fdBookSet(k,v,dep){const c=state.fdBook;if(!c)return;if(k==="pick")c.picks[dep]=v;else c[k]=k==="weeks"?+v:v;render()}
    function fdApplyBook(p,plan,by,at){
      const when=at||fdNow();
      plan.list.forEach((a,i)=>state.appointments.push(Object.assign({id:"apt-"+Date.now()+"-"+i,service:deptName(a.dept)+" — جلسة علاجية",room:"غرفة "+deptName(a.dept).replace(/^قسم\\s*/,""),newForStaff:true,bookedBy:by,intakeId:p.id},a)));
      const T=CONSENT_TYPES.find(t=>t.k==="treatment");
      if(T&&!(typeof consentStatus==="function"&&consentStatus(p,"treatment").st==="active"))consentsOf(p).push({id:"cs-"+Date.now(),type:"treatment",version:T.v,text:T.text,grantedAt:when,by:p.guardian||"ولي الأمر",method:"توقيع في الاستقبال",recordedBy:by,expires:null});
      const first=plan.list[0];
      Object.assign(p.intake,{stage:"done",bookedBy:by,bookedAt:when,aptCount:plan.list.length});
      p.status="نشط";p.next=first?first.date+"T"+first.time:"";
    }
    function fdBookSubmit(e,pid){
      e.preventDefault();const p=state.patients.find(x=>x.id===pid);if(!p)return;
      if(!new FormData(e.target).get("consent"))return notify("لازم موافقة ولي الأمر على الخطة قبل الحجز");
      const plan=fdPlan(p,fdBookCfg(p));if(!plan.list.length)return notify("ما لقينا أوقات فاضية — غيّر الأخصائي أو تاريخ البداية");
      fdApplyBook(p,plan,auditActor().name);
      const first=plan.list[0];
      if(typeof cmSendTo==="function"){
        cmSendTo("fam:"+p.id,\`أهلًا 🌿 اكتملت خطة \${p.name.split(" ")[0]} وانحجزت مواعيده: \${fdLinesText(p)}. أول جلسة \${date(first.date)} الساعة \${time(first.time)} مع \${first.clinician}.\`);
        [...new Set(plan.list.map(a=>a.clinician))].forEach(n=>{const s=state.staff.find(x=>x.name===n);if(s)cmSendTo("staff:"+s.id,\`🆕 \${p.name} انضاف لجدولك (\${plan.list.filter(a=>a.clinician===n).length} جلسة) حسب توجيه \${p.intake.direction.by}.\`)});
      }
      audit("حجز مواعيد الخطة العلاجية",\`\${p.name} · \${plan.list.length} جلسة\`);state.fdOpen=null;state.fdBook=null;persist();
      notify(\`انحجزت \${plan.list.length} جلسة لـ\${p.name.split(" ")[0]} ودخل جداول الأخصائيين\`);render();
    }

    // ---- التسجيل في الاستقبال ----
    function fdRegisterSubmit(e){
      e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());
      if(!String(f.child||"").trim())return notify("اكتب اسم الطفل");
      const p=fdCreate({child:f.child,age:f.age,gender:f.gender,guardian:f.guardian,phone:f.phone,reason:f.reason,ref:f.ref,school:f.school,source:"normal"});
      audit("تسجيل أسرة جديدة ← تحويل للمشرف العام",p.name);state.fdOpen=null;persist();
      notify(\`انفتح ملف \${p.name.split(" ")[0]} (\${p.file}) وانحوّل للمشرف العام لدراسة الحالة\`);render();
    }

    // ---- التنقل ----
    function fdOpen(k,pid){state.fdOpen={k,pid:pid||null};if(k!=="book")state.fdBook=null;if(state.view!=="frontDesk"){state.view="frontDesk";persist()}render()}
    function fdClose(){state.fdOpen=null;state.fdBook=null;render()}
    // للعرض التجريبي: ادخل بدور صاحب الخطوة مباشرة
    function fdActAs(stage,pid){
      const p=pid&&state.patients.find(x=>x.id===pid);
      if(stage==="case"){state.role="supervisor";state.currentStaffId=null}
      else if(stage==="assess"){const s=p&&fdDeptSup(p.intake.dept);if(!s)return notify("ما فيه مشرف متعيّن لهذا القسم");state.role="supervisor";state.currentStaffId=s.id}
      else{state.role="reception";state.currentStaffId=null}
      state.view="frontDesk";persist();notify(stage==="assess"?\`أنت الحين \${personById(state.currentStaffId).name}\`:\`أنت الحين \${roles[state.role].label}\${stage==="case"?" (المشرف العام)":""}\`);render();window.scrollTo(0,0);
    }

    // ---- الشاشة ----
    function fdCard(p){
      const i=p.intake;const st=i.stage;const ini=esc((p.name||"?").charAt(0));
      const meta=st==="case"?\`سبب المراجعة: \${esc(i.reason||p.need||"—")}\`
        :st==="assess"?\`القسم: <b>\${esc(deptName(i.dept))}</b>\${i.caseNote?\`<br>ملاحظة المشرف: \${esc(i.caseNote)}\`:""}\`
        :st==="book"?\`التوجيه: <b>\${esc(fdLinesText(p))}</b>\`
        :\`\${i.aptCount||0} جلسة · أول موعد \${p.next?esc(date(p.next.slice(0,10)))+" "+esc(time(p.next.slice(11,16))):"—"}\`;
      const ownerName=st==="case"?"المشرف العام":st==="assess"?((fdDeptSup(i.dept)||{}).name||"مشرف القسم"):st==="book"?"الاستقبال":"";
      const act={case:["ابدأ دراسة الحالة","case"],assess:["التقييم والتوجيه بالخطة","assess"],book:["احجز المواعيد","book"]}[st];
      const foot=st==="done"?\`<button class="btn btn-outline" onclick="openPatient('\${p.id}')">فتح الملف</button>\`
        :fdCan(st,p)?\`<button class="btn btn-primary" onclick="fdOpen('\${act[1]}','\${p.id}')">\${act[0]}</button>\`
        :\`<div class="fd-owner"><span>بانتظار \${esc(ownerName)}</span><button onclick="fdActAs('\${st}','\${p.id}')">ادخل باسم \${esc(ownerName)} ←</button></div>\`;
      return \`<article class="fd-card"><div class="fd-card-h"><span class="fd-av">\${ini}</span><div><b>\${esc(p.name)}</b><small>\${esc(p.age||"")}\${p.guardian?" · "+esc(p.guardian):""}</small></div></div>
        <div class="fd-meta">\${meta}</div><div class="fd-row"><em class="fd-src \${i.source}">\${esc(FD_SRC[i.source]||"")}</em><span class="fd-wait \${fdLate(p)?"late":""}">\${st==="done"?"انحجز "+fdAgo(i.bookedAt):"وصل "+fdAgo(fdStageAt(p))}\${fdLate(p)?" — متأخر":""}</span></div>\${foot}</article>\`;
    }
    function frontDeskView(){
      fdSeed();const all=fdList();const by=k=>all.filter(p=>p.intake.stage===k).sort((a,b)=>String(fdStageAt(a)).localeCompare(String(fdStageAt(b))));
      const myStage=state.role==="reception"?"reception":fdIsGeneralSup()?"case":fdIsDeptSup(fdMe())?"assess":null;
      const mine=all.filter(fdMine);
      const flow=[["الاستقبال","يسجّل الأسرة ويفتح الملف","reception"],["المشرف العام","دراسة الحالة وتحديد القسم","case"],["مشرف القسم","التقييم والتوجيه بالخطة","assess"],["الاستقبال","حجز المواعيد حسب التوجيه","reception"],["الأخصائيين","الطفل في جداولهم","done"]];
      let h=head("الاستقبال","الاستقبال","من تسجيل الأسرة إلى دراسة الحالة والتقييم وحجز المواعيد — كل الخطوات مترابطة.",fdCan("register")?\`<button class="btn btn-primary" onclick="fdOpen('register')">＋ تسجيل أسرة جديدة</button>\`:"");
      h+=\`<div class="fd-flow">\${flow.map(([w,d,k],i)=>\`<div class="fd-step \${myStage===k?"me":""}"><span class="n">\${i+1}</span><b>\${esc(w)}</b><small>\${esc(d)}</small></div>\`).join("")}</div>\`;
      if(mine.length)h+=\`<div class="fd-turn">\${ic("bell",16)}<span>عندك <b>\${mine.length}</b> \${mine.length===1?"ملف ينتظرك":"ملفات تنتظرك"} — \${esc(mine.slice(0,3).map(p=>p.name).join("، "))}</span></div>\`;
      h+=\`<div class="fd-board">\${FD_STAGES.map(s=>{let L=by(s.k);if(s.k==="done")L=L.sort((a,b)=>String(b.intake.bookedAt).localeCompare(String(a.intake.bookedAt))).slice(0,8);
        return \`<section class="fd-col"><div class="fd-col-h"><div><b>\${esc(s.l)}</b><small>عند \${esc(s.who)}</small></div><em>\${by(s.k).length}</em></div>\${L.map(fdCard).join("")||\`<div class="fd-empty">ما فيه ملفات هنا</div>\`}</section>\`}).join("")}</div>\`;
      return h+fdPopHtml();
    }
    function fdPopHtml(){
      const o=state.fdOpen;if(!o)return "";const p=o.pid&&state.patients.find(x=>x.id===o.pid);
      const wrap=(body)=>\`<div class="pl-scrim" onclick="if(event.target===this)fdClose()"><div class="pl-pop fd-pop">\${body}</div></div>\`;
      const field=(n,l,v,ex)=>\`<div class="field \${ex&&ex.full?"full":""}" \${ex&&ex.full?'style="grid-column:1/-1"':""}><label>\${l}</label>\${ex&&ex.area?\`<textarea class="textarea" name="\${n}" rows="\${ex.rows||2}" \${ex.req?"required":""}>\${esc(v||"")}</textarea>\`:\`<input class="input" name="\${n}" value="\${esc(v||"")}" \${ex&&ex.req?"required":""} \${ex&&ex.ph?\`placeholder="\${esc(ex.ph)}"\`:""}>\`}</div>\`;
      if(o.k==="register")return wrap(\`<h3>تسجيل أسرة جديدة</h3><p class="muted">بيانات أساسية بس — دراسة الحالة يكمّلها المشرف العام.</p><form onsubmit="fdRegisterSubmit(event)"><div class="form-grid">
        \${field("child","اسم الطفل الرباعي","",{req:1})}\${field("age","العمر","",{ph:"مثال: 4 سنوات"})}
        <div class="field"><label>الجنس</label><select class="select" name="gender"><option value="">—</option><option>ذكر</option><option>أنثى</option></select></div>
        \${field("guardian","ولي الأمر","",{req:1})}\${field("phone","رقم الجوال","",{req:1,ph:"05xxxxxxxx"})}\${field("ref","مصدر التحويل","",{ph:"مثال: مستشفى، مدرسة، معرفة"})}
        \${field("school","المدرسة / الروضة","")}\${field("reason","سبب المراجعة كما ذكرته الأسرة","",{area:1,full:1,req:1})}
        </div><div class="fd-acts"><button type="button" class="btn btn-outline" onclick="fdClose()">إلغاء</button><button class="btn btn-primary">سجّل وحوّل للمشرف العام</button></div></form>\`);
      if(!p||!p.intake)return "";
      if(o.k==="case"){const cs=caseStudyOf(p);const pf=cs&&cs.fields||{};const sug=cs&&cs.analysis&&cs.analysis.primary||(typeof rfDept==="function"?rfDept({name:p.need,note:p.intake.reason}):"");
        return wrap(\`<h3>دراسة الحالة — \${esc(p.name)}</h3><p class="muted">\${esc(p.age||"")} · ولي الأمر: \${esc(p.guardian||"—")}</p>
          <form onsubmit="fdCaseSubmit(event,'\${p.id}')"><div class="form-grid">
          \${field("reason","أهم ملاحظة من الأسرة",p.intake.reason||pf.reason||p.need||"",{area:1,full:1,req:1,rows:3})}
          <div class="field" style="grid-column:1/-1"><label>القسم المقترح للتقييم</label><select class="select" name="dept" required><option value="">اختاري القسم</option>\${state.departments.map(d=>\`<option value="\${d.id}" \${sug===d.id?"selected":""}>\${esc(d.name)}\${fdDeptSup(d.id)?" — "+esc(fdDeptSup(d.id).name):""}</option>\`).join("")}</select><small class="muted">الاقتراح مبني على ملاحظة الأسرة؛ تقدري تغيّريه.</small></div>
          </div><details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">إضافة تفاصيل أخرى (اختياري)</summary><div class="form-grid" style="margin-top:10px">
          \${FD_CASE_FIELDS.filter(([k])=>k!=="reason").map(([k,l])=>field(k,l,pf["sup_"+k]||pf[k]||"",{area:1,full:1,rows:2})).join("")}
          \${field("note","ملاحظة لمشرف القسم",p.intake.caseNote||"",{area:1,full:1,rows:2})}
          </div></details><div class="fd-acts"><button type="button" class="btn btn-outline" onclick="fdClose()">إلغاء</button><button class="btn btn-primary">حفظ وتحويل للتقييم</button></div></form>\`)}
      if(o.k==="assess"){const cs=caseStudyOf(p);const sup=cs&&cs.sup||{};const own=p.intake.dept;const an=cs&&cs.analysis||{};const suggestedGoals=(an.goals||[]).map(g=>g.text).filter(Boolean);
        const deptRow=d=>\`<tr><td><input type="checkbox" name="on_\${d.id}" \${d.id===own?"checked":""}></td><td>\${esc(d.name)}</td><td><select class="select" name="pw_\${d.id}">\${[1,2,3,4,5].map(n=>\`<option \${n===(d.id===own?3:2)?"selected":""}>\${n}</option>\`).join("")}</select></td><td><select class="select" name="mn_\${d.id}">\${[30,40,45,60].map(n=>\`<option value="\${n}" \${n===40?"selected":""}>\${n} دقيقة</option>\`).join("")}</select></td></tr>\`;
        return wrap(\`<h3>التقييم والتوجيه بالخطة — \${esc(p.name)}</h3><p class="muted">\${esc(deptName(own))} · دراسة الحالة من \${esc(p.intake.caseBy||"المشرف العام")}</p>
          <details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700">ملخص دراسة الحالة</summary><div class="fd-meta" style="margin-top:8px">\${FD_CASE_FIELDS.filter(([k])=>sup[k]).map(([k,l])=>\`<b>\${esc(l)}:</b> \${esc(sup[k])}\`).join("<br>")||"—"}\${p.intake.caseNote?\`<br><b>ملاحظة المشرف:</b> \${esc(p.intake.caseNote)}\`:""}</div></details>
          <form onsubmit="fdAssessSubmit(event,'\${p.id}')"><div class="form-grid">
          \${field("summary","نتيجة التقييم (عدّلي الملخص المقترح)",p.intake.caseNote||p.intake.reason||p.need||sup.reason||"",{area:1,full:1,req:1,rows:3})}
          <div class="field"><label>شدة الاحتياج</label><select class="select" name="level"><option>بسيط</option><option selected>متوسط</option><option>شديد</option></select></div>
          </div>
          <div style="margin-top:12px;font-weight:700">التوجيه بالخطة العلاجية</div>
          <p class="muted" style="margin:3px 0 8px">القسم المحوّل إليه محدد مسبقًا. أضيفي أقسامًا أخرى فقط إذا احتاج الطفل.</p>
          <table class="fd-lines"><thead><tr><th></th><th>القسم</th><th>جلسات أسبوعيًا</th><th>مدة الجلسة</th></tr></thead><tbody>
          \${state.departments.filter(d=>d.id===own).map(deptRow).join("")}
          </tbody></table>
          <details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700">إضافة أقسام أخرى للخطة (اختياري)</summary><div style="overflow:auto"><table class="fd-lines"><thead><tr><th></th><th>القسم</th><th>جلسات أسبوعيًا</th><th>مدة الجلسة</th></tr></thead><tbody>\${state.departments.filter(d=>d.id!==own).map(deptRow).join("")}</tbody></table></div></details>
          <div class="form-grid">\${field("goals","الأهداف المقترحة — راجعيها وعدّليها",suggestedGoals.join("\\n"),{area:1,full:1,req:1,rows:3})}\${field("notes","توصيات إضافية (اختياري)","",{area:1,full:1,rows:2})}</div>
          <div class="fd-acts"><button type="button" class="btn btn-outline" onclick="fdClose()">إلغاء</button><button class="btn btn-primary">اعتمد التوجيه وحوّل للاستقبال</button></div></form>\`)}
      if(o.k==="book"){const c=fdBookCfg(p);const plan=fdPlan(p,c);const d=p.intake.direction||{};
        return wrap(\`<h3>حجز المواعيد — \${esc(p.name)}</h3><p class="muted">توجيه \${esc(d.by||"مشرف القسم")}: <b>\${esc(fdLinesText(p))}</b>\${d.notes?" · "+esc(d.notes):""}</p>
          <table class="fd-lines"><thead><tr><th>القسم</th><th>الجلسات</th><th>الأخصائي</th></tr></thead><tbody>
          \${fdLines(p).map(l=>\`<tr><td>\${esc(deptName(l.dept))}</td><td>\${l.perWeek}/أسبوع · \${l.minutes} د</td><td><select class="select" onchange="fdBookSet('pick',this.value,'\${l.dept}')">\${fdClinicians(l.dept).map(s=>\`<option value="\${s.id}" \${c.picks[l.dept]===s.id?"selected":""}>\${esc(s.name)} (\${fdLoad(s.name)} موعد قادم)</option>\`).join("")}</select></td></tr>\`).join("")}
          </tbody></table>
          <div class="form-grid"><div class="field"><label>تاريخ البداية</label><input class="input" type="date" value="\${c.start}" onchange="fdBookSet('start',this.value)"></div>
          <div class="field"><label>المدة</label><select class="select" onchange="fdBookSet('weeks',this.value)">\${[4,8,12].map(n=>\`<option value="\${n}" \${c.weeks===n?"selected":""}>\${n} أسابيع</option>\`).join("")}</select></div>
          <div class="field"><label>الوقت المفضل للأسرة</label><select class="select" onchange="fdBookSet('pref',this.value)">\${[["any","أي وقت"],["am","صباحي"],["pm","بعد الظهر"]].map(([v,l])=>\`<option value="\${v}" \${c.pref===v?"selected":""}>\${l}</option>\`).join("")}</select></div></div>
          <div style="margin-top:12px;font-weight:700">المواعيد المقترحة (\${plan.list.length} جلسة)</div>
          \${plan.miss.length?\`<div class="fd-wait late" style="margin-top:4px">ما لقينا وقت فاضي كامل لـ: \${esc(plan.miss.slice(0,4).join("، "))}\${plan.miss.length>4?"…":""}</div>\`:""}
          <div class="fd-prev"><table class="fd-lines"><tbody>\${plan.list.slice(0,40).map(a=>\`<tr><td>\${esc(date(a.date))}</td><td>\${esc(time(a.time))}</td><td>\${esc(deptName(a.dept))}</td><td>\${esc(a.clinician)}</td></tr>\`).join("")}</tbody></table></div>
          <form onsubmit="fdBookSubmit(event,'\${p.id}')"><label class="fd-ok"><input type="checkbox" name="consent"><span>ولي الأمر (\${esc(p.guardian||"—")}) وافق على الخطة العلاجية والمواعيد</span></label>
          <div class="fd-acts"><button type="button" class="btn btn-outline" onclick="fdClose()">إلغاء</button><button class="btn btn-primary" \${plan.list.length?"":"disabled"}>احجز \${plan.list.length} جلسة</button></div></form>\`)}
      return "";
    }

    // ---- ربط الشاشة بالمنصة ----
    (function fdWire(){
      const hub=HUBS.find(h=>h.k==="intake");
      if(hub){hub.l="الاستقبال";hub.d="تسجيل الأسر ودراسة الحالة والإحالات";hub.views=[["frontDesk","تسجيل الأسرة"],["intakeAI","دراسة الحالة"],["calls","الاستقبال الصوتي"],["referrals","الإحالات"]];
        const g=ORG_GROUPS.find(x=>x.k==="intake");if(g)g.keys=hub.views.map(v=>v[0])}
      if(!navItems.some(n=>n[0]==="frontDesk"))navItems.splice(1,0,["frontDesk","referrals"]);
      ["reception","supervisor","management"].forEach(r=>{const nav=roles[r].nav;if(!nav.includes("frontDesk"))nav.unshift("frontDesk")});
    })();
    const _fdRoleHome=roleHome;
    roleHome=function(){return state.view==="frontDesk"&&roles[state.role].nav.includes("frontDesk")?frontDeskView():_fdRoleHome.apply(this,arguments)};
    const _fdOrgBadge=orgBadge;
    orgBadge=function(k){if(k==="frontDesk"){const n=fdList().filter(fdMine).length;return n?\`<em class="og-b red">\${n}</em>\`:""}return _fdOrgBadge.apply(this,arguments)};
    const _fdBrDecisions=brDecisions;
    brDecisions=function(){
      const out=_fdBrDecisions.apply(this,arguments);if(state.role!=="supervisor")return out;
      fdList().filter(fdMine).forEach(p=>{const s=p.intake.stage;
        out.push(s==="case"?{cat:"kids",sev:2,ic:"book",src:"الاستقبال",t:\`دراسة حالة جديدة: \${p.name}\`,d:\`سبب المراجعة: \${p.intake.reason||"—"}\`,acts:[["ابدأ دراسة الحالة",\`fdOpen('case','\${p.id}')\`,1]]}
          :{cat:"kids",sev:2,ic:"target",src:"الاستقبال",t:\`تقييم وتوجيه: \${p.name}\`,d:\`محوّل من \${p.intake.caseBy||"المشرف العام"}\`,acts:[["قيّم واكتب التوجيه",\`fdOpen('assess','\${p.id}')\`,1]]})});
      return out.sort((a,b)=>b.sev-a.sev);
    };

    // ---- الإحالات: التحويل يدخل السلسلة عند المشرف العام ----
    const _fdRfCard=rfCard;
    rfCard=function(r){return _fdRfCard.apply(this,arguments).split("حوّل لملف واحجز تقييم").join("حوّل للمشرف العام").split("حوّل لملف مباشرة").join("حوّل للمشرف العام")};
    const _fdRfConvertHtml=rfConvertHtml;
    rfConvertHtml=function(){return _fdRfConvertHtml.apply(this,arguments).split("تحويل الإحالة لملف + حجز تقييم").join("تحويل الإحالة للمشرف العام (دراسة حالة)").split(">حوّل واحجز<").join(">افتح ملف وحوّل<")};
    rfConvert=function(e,id){
      e.preventDefault();const r=rfById(id);if(!r)return;const f=new FormData(e.target);
      const p=fdCreate({child:f.get("child"),age:f.get("age"),guardian:f.get("guardian"),phone:f.get("phone"),reason:f.get("need")||r.note||r.need||"",source:"referral",ref:r.name});
      p.referralId=r.id;Object.assign(r,{stage:"done",status:"مقبولة",patientId:p.id,childName:p.name,phone:p.phone,guardian:p.guardian});
      state.rfConvert=null;audit("تحويل إحالة للاستقبال العادي",p.name);persist();notify(\`انفتح ملف \${p.name.split(" ")[0]} وانحوّل للمشرف العام لدراسة الحالة\`);render();
    };

    // ---- بيانات تجريبية: ملفات في كل خطوة عشان العرض ----
    function fdSeed(){
      if(state.fdSeeded||fdList().length)return;state.fdSeeded=true;
      const ago=h=>new Date(Date.now()-h*3600000).toISOString();
      const mk=(o,h)=>fdCreate(Object.assign({at:ago(h),by:o.source==="smart"?"ولي الأمر (دراسة الحالة الإلكترونية)":"الاستقبال"},o));
      mk({child:"تميم سلطان العمري",age:"4 سنوات",gender:"ذكر",guardian:"سلطان العمري",phone:"0551234870",reason:"تأخر في الكلام، يستخدم كلمات قليلة وما يركّب جمل",source:"normal"},3);
      mk({child:"جوري ماجد الدوسري",age:"6 سنوات",gender:"أنثى",guardian:"ماجد الدوسري",phone:"0559087731",reason:"صعوبة في التركيز والجلوس في الصف",source:"normal"},20);
      const cs=(p,dept,h,txt)=>fdApplyCase(p,Object.assign({dept,note:""},txt),"الإشراف",ago(h));
      const a1=mk({child:"عبدالعزيز نايف الشمري",age:"3 سنوات",gender:"ذكر",guardian:"نايف الشمري",phone:"0503321456",reason:"ما يستجيب لاسمه، تواصل بصري ضعيف",source:"referral",ref:"مستشفى الملك فهد"},50);
      cs(a1,"aba",30,{reason:"ما يستجيب لاسمه، تواصل بصري ضعيف",comm:"كلمات مفردة قليلة، يشير أحيانًا",behavior:"يرفرف بيديه عند الحماس، يحب الروتين"});
      const a2=mk({child:"ريتال خالد المطيري",age:"5 سنوات",gender:"أنثى",guardian:"خالد المطيري",phone:"0548876120",reason:"ضعف في مسك القلم والتوازن",source:"normal"},40);
      cs(a2,"ot",8,{reason:"ضعف في مسك القلم والتوازن",skills:"تحتاج مساعدة في الأزرار واللبس",school:"روضة — المعلمة لاحظت صعوبة في الرسم"});
      const as=(p,lines,goals,h)=>{const s=fdDeptSup(p.intake.dept)||{name:"مشرف القسم"};fdApplyAssess(p,{summary:"نتيجة التقييم الأولي تدعم الاحتياج المذكور في دراسة الحالة.",level:"متوسط",goals:goals.join("\\n"),notes:"",lines},s,ago(h))};
      const b1=mk({child:"سلطان بدر الزهراني",age:"5 سنوات",gender:"ذكر",guardian:"بدر الزهراني",phone:"0567712093",reason:"تأتأة واضحة وصعوبة في بعض الأصوات",source:"normal"},90);
      cs(b1,"speech",70,{reason:"تأتأة واضحة وصعوبة في بعض الأصوات",comm:"جمل كاملة مع تكرار في بداية الكلمات"});
      as(b1,[{dept:"speech",perWeek:2,minutes:40},{dept:"psych",perWeek:1,minutes:40}],["يقلل التكرار في بداية الكلمات في المحادثة","ينطق صوت الراء في بداية الكلمة"],5);
      const b2=mk({child:"دانة عمر الغامدي",age:"4 سنوات",gender:"أنثى",guardian:"عمر الغامدي",phone:"0532209874",reason:"نوبات غضب متكررة وصعوبة في اتباع التعليمات",source:"normal"},120);
      cs(b2,"aba",96,{reason:"نوبات غضب متكررة وصعوبة في اتباع التعليمات",behavior:"نوبات عند الانتقال بين الأنشطة"});
      as(b2,[{dept:"aba",perWeek:3,minutes:40}],["تتبع تعليمة من خطوة وحدة بدون مساعدة","تطلب المساعدة بدل نوبة الغضب"],26);
      const d1=mk({child:"مازن علي السبيعي",age:"6 سنوات",gender:"ذكر",guardian:"علي السبيعي",phone:"0581123344",reason:"ضعف في المهارات الحركية الدقيقة",source:"normal"},200);
      cs(d1,"ot",180,{reason:"ضعف في المهارات الحركية الدقيقة"});
      as(d1,[{dept:"ot",perWeek:2,minutes:40}],["يمسك القلم بمسكة ثلاثية","يقص على خط مستقيم"],150);
      const plan=fdPlan(d1,{start:fdNextWorkday(),weeks:4,pref:"any",picks:{}});fdApplyBook(d1,plan,"الاستقبال",ago(140));
      persist();
    }
    fdSeed();

    Object.assign(window,{frontDeskView,fdOpen,fdClose,fdActAs,fdRegisterSubmit,fdCaseSubmit,fdAssessSubmit,fdBookSubmit,fdBookSet,roleHome,orgBadge,brDecisions,rfCard,rfConvertHtml,rfConvert});
    if(state.view==="frontDesk")render();
`;export{e as default};
//# sourceMappingURL=19-intake-flow-BhFq1p8O.js.map
