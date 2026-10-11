"use strict";
// أوان — الجزء 23: محطة الاستقبال — شغل الاستقبال الحقيقي حول المواعيد
// اليوم: كشوفات اليوم، تقييمات اليوم، الصالة (مين وصل وكم له ينتظر)، جلسات اليوم، والتحصيل.
// الجدول: الأخصائيين × الوقت — اضغط أي خانة فاضية واحجز فيها.
// الكشوفات / التقييمات: الجاية + اللي يحتاج حجز أو قرار. الاستفسارات: الواتساب والسوشيال والاتصال.
// الحجز: النوع أول (كشف/تقييم/جلسة/تعويض)، أسرة جديدة أو طفل مسجّل، الوقت والأخصائي يُقترح تلقائيًا، والسعر والدفع.

    const RS_T={
      kashf:{l:"كشف",ic:"🩺",c:"#2563eb",bg:"#dbeafe",dur:30,price:250},
      assess:{l:"تقييم",ic:"🧩",c:"#7c3aed",bg:"#ede9fe",dur:60,price:600},
      session:{l:"جلسة علاجية",ic:"🎯",c:"#0E8388",bg:"#ccfbf1",dur:40,price:0},
      comp:{l:"جلسة تعويضية",ic:"🔁",c:"#b45309",bg:"#fef3c7",dur:40,price:0}
    };
    const RS_PAY=["كاش","مدى","تحويل بنكي","تأمين"];
    function rsType(a){if(a.rsType)return a.rsType;const s=a.service||"";if(/كشف|استشارة/.test(s))return "kashf";if(/تقييم/.test(s))return "assess";if(/تعويض/.test(s))return "comp";return "session"}
    function rsPrice(a){return a.price!==undefined?+a.price:RS_T[rsType(a)].price}
    function rsDay(){return state.rsDate||rcToday()}
    function rsShift(n){const d=new Date(rsDay()+"T12:00:00");d.setDate(d.getDate()+n);state.rsDate=localDateOf(d);render()}
    function rsSt(a){
      if(a.status==="مكتمل")return ["done","خلص"];if(a.status==="غائب")return ["abs","غائب"];if(a.status==="ملغي")return ["abs","ملغي"];
      const today=rcToday();if(a.date>today)return a.confirmSent?["in","مؤكد"]:["up","قادم"];if(a.date<today)return ["abs","فات"];
      if(a.inRoomAt)return ["live","داخل"];if(rcVisit(a))return ["wait","في الصالة"];
      const m=sipadMin(a.time),now=rcNowM();if(now>m+10)return ["no","ما وصل"];if(now>m)return ["late","متأخر"];return ["up","قادم"];
    }
    function rsWaitMin(a){const v=rcVisit(a);return v?Math.max(0,Math.round((Date.now()-Date.parse(v.inAt))/60000)):0}
    function rsIsNew(a){const p=rcPatient(a);if(!p)return true;return !state.appointments.some(x=>x!==a&&x.patient===a.patient&&x.status==="مكتمل"&&x.date<a.date)}

    (function rsStyles(){
      const st=document.createElement("style");
      st.textContent=`.rs-top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.rs-top h1{margin:0;font-size:30px}.rs-top .muted{font-size:13px}
.rs-tabs{display:flex;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:5px;margin-bottom:16px;overflow-x:auto}
.rs-tabs button{all:unset;cursor:pointer;padding:9px 16px;border-radius:12px;font-weight:800;font-size:13px;color:var(--muted);white-space:nowrap;display:flex;gap:6px;align-items:center}
.rs-tabs button.on{background:var(--navy);color:#fff}.rs-tabs em{font-style:normal;background:#ef4444;color:#fff;border-radius:99px;font-size:10.5px;padding:1px 7px}
.rs-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px}
.rs-kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px}
.rs-kpi b{display:block;font-size:24px;line-height:1.2}.rs-kpi span{font-size:12px;font-weight:700}.rs-kpi small{display:block;font-size:11px;color:var(--muted)}
.rs-grid2{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px;align-items:start}
.rs-box{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px;margin-bottom:16px}
.rs-box>h2{margin:0 0 10px;font-size:16px;display:flex;align-items:center;gap:8px}.rs-box>h2 small{font-size:12px;color:var(--muted);font-weight:600;margin-inline-start:auto}
.rs-row{display:grid;grid-template-columns:58px minmax(0,1.3fr) minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:9px 6px;border-bottom:1px solid var(--line);font-size:13px;cursor:pointer}
.rs-row:hover{background:var(--cream-2)}.rs-row:last-child{border-bottom:0}
.rs-row time{font-weight:800;font-variant-numeric:tabular-nums}.rs-row small{display:block;color:var(--muted);font-size:11px}
.rs-new{font-size:10px;font-weight:800;color:#2563eb;background:#dbeafe;border-radius:99px;padding:1px 6px;margin-inline-start:4px}
.rs-pay{font-size:10.5px;font-weight:800;border-radius:99px;padding:3px 8px;white-space:nowrap}.rs-pay.ok{background:#dcfce7;color:#166534}.rs-pay.due{background:#fee2e2;color:#b91c1c}.rs-pay.pk{background:var(--cream-2);color:var(--muted)}
.rc-s.wait{background:#dbeafe;color:#1d4ed8}
.rs-wait{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;background:var(--cream-2);margin-bottom:6px;font-size:13px}
.rs-wait .m{font-weight:800;min-width:46px;text-align:center;border-radius:10px;padding:4px 6px;background:var(--card)}.rs-wait .m.long{color:#b91c1c}
.rs-wait .t{flex:1;min-width:0}.rs-wait .t small{display:block;color:var(--muted);font-size:11px}.rs-wait .btn{padding:6px 10px;font-size:11.5px}
.rs-hours{display:flex;flex-direction:column;gap:6px}.rs-hour{display:flex;gap:10px;align-items:flex-start}.rs-hour time{font-weight:800;min-width:48px;padding-top:4px;font-size:12.5px}
.rs-chips{display:flex;flex-wrap:wrap;gap:5px}.rs-chip{all:unset;cursor:pointer;font-size:11.5px;font-weight:700;border-radius:9px;padding:4px 8px;border:1px solid var(--line);background:var(--card)}
.rs-chip.done{opacity:.5}.rs-chip.wait,.rs-chip.live{border-color:#93c5fd;background:#eff6ff}.rs-chip.no{border-color:#fca5a5;background:#fef2f2}
.rs-cal-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}.rs-cal-nav b{font-size:15px;min-width:170px;text-align:center}
.rs-cal{overflow:auto;border:1px solid var(--line);border-radius:14px;max-height:72vh}
.rs-cal table{border-collapse:separate;border-spacing:0;font-size:11.5px;min-width:100%}
.rs-cal th,.rs-cal td{border-bottom:1px solid var(--line);border-inline-start:1px solid var(--line);padding:3px;vertical-align:top;min-width:118px;height:46px}
.rs-cal th{position:sticky;top:0;background:var(--card);z-index:2;font-size:11.5px;padding:6px;text-align:center}
.rs-cal th small{display:block;color:var(--muted);font-weight:600;font-size:10px}
.rs-cal td.tm,.rs-cal th.tm{position:sticky;inset-inline-start:0;background:var(--card);z-index:1;min-width:56px;font-weight:800;text-align:center}
.rs-cal th.tm{z-index:3}
.rs-ev{all:unset;cursor:pointer;display:block;border-radius:8px;padding:3px 6px;margin-bottom:2px;font-weight:700;line-height:1.35;border-inline-start:3px solid}
.rs-ev small{display:block;font-weight:600;opacity:.75;font-size:10px}.rs-ev.done{opacity:.55}.rs-ev.abs{opacity:.35;text-decoration:line-through}
.rs-add{all:unset;cursor:pointer;display:grid;place-items:center;width:100%;height:38px;border-radius:8px;color:transparent;font-weight:800}
.rs-add:hover{background:var(--cream-2);color:var(--navy)}
.rs-legend{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;margin-inline-start:auto}.rs-legend span{display:flex;gap:4px;align-items:center}.rs-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
.rs-types{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:6px 0 12px}
.rs-types button{all:unset;cursor:pointer;border:1px solid var(--line);border-radius:14px;padding:10px;text-align:center;font-weight:800;font-size:13px}
.rs-types button span{display:block;font-size:22px}.rs-types button small{display:block;font-weight:600;font-size:11px;color:var(--muted)}
.rs-types button.on{border-color:var(--navy);box-shadow:0 0 0 2px rgba(14,131,136,.18);background:var(--cream-2)}
.rs-seg{display:inline-flex;background:var(--cream-2);border-radius:12px;padding:3px;gap:3px;margin-bottom:8px}.rs-seg button{all:unset;cursor:pointer;padding:7px 14px;border-radius:9px;font-weight:700;font-size:12.5px;color:var(--muted)}.rs-seg button.on{background:var(--card);color:var(--ink);box-shadow:var(--shadow-sm)}
.rs-fixed{border:1px solid var(--navy);border-radius:12px;padding:10px 12px;margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
.rs-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.rs-acts .btn{justify-content:center}
.rs-kv{display:grid;grid-template-columns:110px 1fr;gap:6px 12px;font-size:13px;margin-top:10px}.rs-kv span{color:var(--muted)}
.rs-day{font-weight:800;font-size:13px;margin:12px 0 4px;color:var(--navy)}
@media (max-width:1200px){.rs-kpis{grid-template-columns:repeat(3,1fr)}.rs-grid2{grid-template-columns:1fr}}
@media (max-width:640px){.rs-kpis{grid-template-columns:repeat(2,1fr)}.rs-row{grid-template-columns:52px 1fr auto}.rs-row>:nth-child(3),.rs-row>:nth-child(4){display:none}.rs-types{grid-template-columns:repeat(2,1fr)}.rs-acts{grid-template-columns:1fr 1fr}}`;
      document.head.appendChild(st);
    })();

    // ---- صف موعد ----
    function rsRowHtml(a){
      const [k,l]=rsSt(a);const T=RS_T[rsType(a)];const pr=rsPrice(a);const dep=rcDeptOfStaff(a.clinician);
      const pay=pr?(a.paid?`<span class="rs-pay ok">مدفوع</span>`:`<span class="rs-pay due">${pr} ر.س</span>`):`<span class="rs-pay pk">باقة</span>`;
      return `<div class="rs-row" onclick="rsOpenApt('${a.id}')"><time>${esc(time(a.time))}</time><div><b>${esc(a.patient)}</b>${rsIsNew(a)?`<span class="rs-new">أول زيارة</span>`:""}<small>${T.ic} ${esc(a.service||T.l)}</small></div><div>${esc(a.clinician||"—")}<small>${esc(dep?deptName(dep):"")}${a.room?" · "+esc(a.room):""}</small></div><span class="rc-s ${k}">${l}${k==="wait"?" "+rsWaitMin(a)+"د":""}</span>${pay}</div>`;
    }
    function rsList(type,from,to){return state.appointments.filter(a=>a.status!=="ملغي"&&rsType(a)===type&&a.date>=from&&a.date<=to).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))}

    // ---- المهام (يحتاج منك) ----
    function rsAssessNeeded(){return (typeof fdList==="function"?fdList():[]).filter(p=>p.intake.stage==="assess"&&!state.appointments.some(a=>a.patient===p.name&&rsType(a)==="assess"&&a.status==="مجدول"))}
    function rsAfterKashf(){const today=rcToday();return state.appointments.filter(a=>rsType(a)==="kashf"&&a.status==="مكتمل"&&a.date>=localDateOf(new Date(Date.now()-14*864e5))&&!a.kashfDecided).filter(a=>{const p=rcPatient(a);return p&&!p.intake&&!p.smart})}
    function rsTasks(){
      const T=[];
      rsAssessNeeded().forEach(p=>{const s=fdDeptSup(p.intake.dept);T.push({p:3,ic:"🧩",t:`احجز موعد تقييم: ${p.name}`,d:`عند ${s?s.name:"مشرف "+deptName(p.intake.dept)} — حوّله المشرف العام ${fdAgo(p.intake.caseAt)}`,acts:[["احجز التقييم",`rsBookOpen({type:'assess',pid:'${p.id}',dept:'${p.intake.dept}',clin:'${s?s.id:""}'})`,1]]})});
      (typeof fdList==="function"?fdList():[]).filter(p=>p.intake.stage==="book").forEach(p=>T.push({p:3,ic:"📅",t:`احجز جلسات الخطة: ${p.name}`,d:`توجيه ${p.intake.direction&&p.intake.direction.by||"مشرف القسم"}: ${fdLinesText(p)}`,acts:[["احجز الجلسات",`fdOpen('book','${p.id}')`,1]]}));
      rsAfterKashf().forEach(a=>T.push({p:2,ic:"🩺",t:`بعد الكشف — وش الخطوة الجاية لـ${a.patient}؟`,d:`كشف ${date(a.date)} عند ${a.clinician}`,acts:[["قرار",`rsOpenApt('${a.id}')`,1]]}));
      state.appointments.filter(a=>a.date===rcToday()&&rsPrice(a)&&!a.paid&&a.status==="مكتمل").forEach(a=>T.push({p:2,ic:"💳",t:`تحصيل: ${a.patient} (${rsPrice(a)} ر.س)`,d:`${RS_T[rsType(a)].l} خلص ولم يُدفع`,acts:[["تحصيل",`rsPayOpen('${a.id}')`,1]]}));
      rcTasks().forEach(t=>{if(!/احجز مواعيد/.test(t.t))T.push(t)});
      return T.sort((a,b)=>b.p-a.p);
    }

    // ---- الشاشة ----
    function rsView(){
      rcSeed();rsSeed();const tab=state.rsTab||"today";const today=rcToday();
      const T=rsTasks();const newC=rcContacts().filter(c=>c.status==="new").length;
      const now=new Date();const clock=pad2(now.getHours())+":"+pad2(now.getMinutes());
      let h=`<div class="rs-top"><div><div class="eyebrow">الاستقبال</div><h1>محطة الاستقبال</h1><div class="muted">${esc(date(today))} · الساعة ${clock}</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline" onclick="rcOpen('contactNew')">＋ استفسار</button><button class="btn btn-outline" onclick="rsBookOpen({type:'kashf',mode:'new'})">🩺 حجز كشف</button><button class="btn btn-outline" onclick="rsBookOpen({type:'assess'})">🧩 حجز تقييم</button><button class="btn btn-primary" onclick="rsBookOpen({type:'session'})">＋ حجز جلسة</button></div></div>`;
      const tabs=[["today","🏠 اليوم",T.filter(t=>t.p>=3).length],["cal","🗓️ الجدول",0],["kashf","🩺 الكشوفات",rsAfterKashf().length],["assess","🧩 التقييمات",rsAssessNeeded().length],["contacts","💬 الاستفسارات",newC],["tasks","📋 يحتاج منك",T.length]];
      h+=`<div class="rs-tabs">${tabs.map(([k,l,n])=>`<button class="${tab===k?"on":""}" onclick="rsTabSet('${k}')">${l}${n?`<em>${n}</em>`:""}</button>`).join("")}</div>`;
      h+=tab==="today"?rsToday():tab==="cal"?rsCal():tab==="kashf"?rsTypeTab("kashf"):tab==="assess"?rsTypeTab("assess"):tab==="contacts"?rsContactsTab():rsTasksTab(T);
      return h+rsPopHtml()+rcPopHtml();
    }
    function rsTabSet(k){state.rsTab=k;render();window.scrollTo(0,0)}
    function rsToday(){
      const today=rcToday();const all=state.appointments.filter(a=>a.date===today&&a.status!=="ملغي");
      const K=all.filter(a=>rsType(a)==="kashf").sort((a,b)=>a.time.localeCompare(b.time)),A=all.filter(a=>rsType(a)==="assess").sort((a,b)=>a.time.localeCompare(b.time)),S=all.filter(a=>["session","comp"].includes(rsType(a)));
      const wait=all.filter(a=>rsSt(a)[0]==="wait").sort((a,b)=>rsWaitMin(b)-rsWaitMin(a));const inside=all.filter(a=>rsSt(a)[0]==="live");
      const paidToday=(state.invoices||[]).filter(i=>i.date===today&&i.fromReception).reduce((s,i)=>s+(+i.total||0),0);
      const due=all.filter(a=>rsPrice(a)&&!a.paid&&a.status!=="غائب");
      const kp=(b,l,s,c)=>`<div class="rs-kpi"><b style="${c?"color:"+c:""}">${b}</b><span>${l}</span><small>${s}</small></div>`;
      let h=`<div class="rs-kpis">${kp(K.length,"🩺 كشوفات اليوم",`خلص ${K.filter(a=>a.status==="مكتمل").length}`,RS_T.kashf.c)}${kp(A.length,"🧩 تقييمات اليوم",`خلص ${A.filter(a=>a.status==="مكتمل").length}`,RS_T.assess.c)}${kp(S.length,"🎯 جلسات اليوم",`خلص ${S.filter(a=>a.status==="مكتمل").length}`,RS_T.session.c)}${kp(wait.length,"🪑 في الصالة",`${inside.length} داخل الحين`,"#1d4ed8")}${kp(paidToday.toLocaleString("en"),"💳 تحصيل اليوم","ريال")}${kp(due.length,"⏳ غير مدفوع",due.reduce((s,a)=>s+rsPrice(a),0).toLocaleString("en")+" ريال",due.length?"#b91c1c":"")}</div>`;
      const lane=(title,list,type)=>`<section class="rs-box"><h2>${title}<small>${list.length} موعد</small></h2>${list.map(a=>rsRowHtml(a)).join("")||`<div class="fd-empty">ما فيه ${RS_T[type].l} اليوم — <button class="btn btn-outline" style="padding:5px 10px;font-size:12px" onclick="rsBookOpen({type:'${type}'${type==="kashf"?",mode:'new'":""}})">احجز ${RS_T[type].l}</button></div>`}</section>`;
      const hours={};S.forEach(a=>{const hh=a.time.slice(0,2)+":00";(hours[hh]=hours[hh]||[]).push(a)});
      const sess=`<section class="rs-box"><h2>🎯 جلسات اليوم<small>${S.length} جلسة · اضغط أي اسم</small></h2><div class="rs-hours">${Object.keys(hours).sort().map(hh=>`<div class="rs-hour"><time>${esc(time(hh))}</time><div class="rs-chips">${hours[hh].sort((a,b)=>a.time.localeCompare(b.time)).map(a=>{const k=rsSt(a)[0];return `<button class="rs-chip ${k}" onclick="rsOpenApt('${a.id}')" title="${esc(a.clinician)}">${esc(a.patient.split(" ").slice(0,2).join(" "))} <small class="muted">· ${esc((a.clinician||"").replace(/^(أ\.|د\.)\s*/,"").split(" ")[0])}</small></button>`}).join("")}</div></div>`).join("")||`<div class="fd-empty">ما فيه جلسات اليوم</div>`}</div></section>`;
      const waitBox=`<section class="rs-box"><h2>🪑 الصالة<small>وصلوا وينتظرون</small></h2>${wait.map(a=>{const m=rsWaitMin(a);return `<div class="rs-wait"><span class="m ${m>=15?"long":""}">${m}د</span><div class="t"><b>${esc(a.patient)}</b><small>${RS_T[rsType(a)].ic} ${esc(time(a.time))} عند ${esc(a.clinician)}</small></div><button class="btn btn-primary" onclick="rsAct('${a.id}','in')">دخّله</button></div>`}).join("")||`<div class="fd-empty">الصالة فاضية</div>`}
        ${inside.length?`<div style="margin-top:10px;font-weight:700;font-size:12px;color:var(--muted)">داخل الحين</div>${inside.map(a=>`<div class="rs-wait"><span class="m" style="color:#166534">●</span><div class="t"><b>${esc(a.patient)}</b><small>عند ${esc(a.clinician)}</small></div><button class="btn btn-outline" onclick="rsAct('${a.id}','done')">خلص</button></div>`).join("")}`:""}</section>`;
      const T=rsTasks().slice(0,6);
      const tasksBox=`<section class="rs-box"><h2>📋 يحتاج منك<small><button class="btn btn-outline" style="padding:4px 9px;font-size:11px" onclick="rsTabSet('tasks')">الكل</button></small></h2>${T.map(t=>`<div class="rc-task p${t.p}" style="margin-bottom:6px"><span class="ic">${t.ic}</span><div class="tx"><b>${esc(t.t)}</b><small>${esc(t.d)}</small></div><div class="acts">${t.acts.slice(0,1).map(([l,js])=>`<button class="btn btn-primary" onclick="${js}">${esc(l)}</button>`).join("")}</div></div>`).join("")||`<div class="fd-empty">✓ كل شي تمام</div>`}</section>`;
      return h+`<div class="rs-grid2"><div>${lane("🩺 كشوفات اليوم",K,"kashf")}${lane("🧩 تقييمات اليوم",A,"assess")}${sess}</div><div>${waitBox}${tasksBox}</div></div>`;
    }
    function rsCal(){
      const day=rsDay();const dep=state.rsCalDept||"all";
      const staff=state.staff.filter(s=>(s.clinical||s.roleCategory==="staff"||s.roleCategory==="supervisor")&&s.department&&(dep==="all"||s.department===dep));
      const apts=state.appointments.filter(a=>a.date===day&&a.status!=="ملغي");
      const isPast=t=>day<rcToday()||day===rcToday()&&sipadMin(t)+40<rcNowM();
      const cell=(s,t)=>{const m=sipadMin(t);const L=apts.filter(a=>a.clinician===s.name&&sipadMin(a.time)>=m&&sipadMin(a.time)<m+40);
        if(!L.length)return isPast(t)?"":`<button class="rs-add" onclick="rsBookOpen({type:'session',clin:'${s.id}',dept:'${s.department}',date:'${day}',time:'${t}'})" title="احجز ${esc(time(t))} عند ${esc(s.name)}">＋</button>`;
        return L.map(a=>{const T=RS_T[rsType(a)];const k=rsSt(a)[0];return `<button class="rs-ev ${k}" style="background:${T.bg};border-color:${T.c};color:#1f2937" onclick="rsOpenApt('${a.id}')">${T.ic} ${esc(a.patient.split(" ").slice(0,2).join(" "))}<small>${esc(time(a.time))} · ${esc(T.l)}</small></button>`}).join("")};
      return `<div class="rs-box"><div class="rs-cal-nav"><button class="btn btn-outline" onclick="rsShift(-1)">→</button><b>${esc(date(day))}</b><button class="btn btn-outline" onclick="rsShift(1)">←</button><button class="btn btn-outline" onclick="state.rsDate=null;render()">اليوم</button>
        <select class="select" style="max-width:200px" onchange="state.rsCalDept=this.value;render()"><option value="all">كل الأقسام</option>${state.departments.map(d=>`<option value="${d.id}" ${dep===d.id?"selected":""}>${esc(d.name)}</option>`).join("")}</select>
        <div class="rs-legend">${Object.values(RS_T).map(T=>`<span><i style="background:${T.c}"></i>${T.l}</span>`).join("")}<span style="color:var(--muted)">＋ = خانة فاضية، اضغطها واحجز</span></div></div>
        <div class="rs-cal"><table><thead><tr><th class="tm">الوقت</th>${staff.map(s=>`<th>${esc(s.name)}<small>${esc(deptName(s.department))}</small></th>`).join("")}</tr></thead><tbody>${FD_GRID.map(t=>`<tr><td class="tm">${esc(time(t))}</td>${staff.map(s=>`<td>${cell(s,t)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
    }
    function rsTypeTab(type){
      const T=RS_T[type];const today=rcToday();const to=localDateOf(new Date(Date.now()+14*864e5));const L=rsList(type,today,to);
      const byDay={};L.forEach(a=>{(byDay[a.date]=byDay[a.date]||[]).push(a)});
      let need="";
      if(type==="assess"){const N=rsAssessNeeded();need=`<section class="rs-box"><h2>⏳ يحتاج موعد تقييم<small>محوّلين من المشرف العام لمشرف القسم</small></h2>${N.map(p=>{const s=fdDeptSup(p.intake.dept);return `<div class="rc-task p3"><span class="ic">🧩</span><div class="tx"><b>${esc(p.name)}</b><small>${esc(deptName(p.intake.dept))} · عند ${esc(s?s.name:"مشرف القسم")} · ${esc(p.guardian||"")} ${esc(p.phone||"")}</small></div><div class="acts"><button class="btn btn-primary" onclick="rsBookOpen({type:'assess',pid:'${p.id}',dept:'${p.intake.dept}',clin:'${s?s.id:""}'})">احجز التقييم</button></div></div>`}).join("")||`<div class="fd-empty">✓ كل التقييمات المطلوبة محجوزة</div>`}</section>`}
      if(type==="kashf"){const N=rsAfterKashf();need=`<section class="rs-box"><h2>⏳ بعد الكشف — يحتاج قرار<small>وش الخطوة الجاية للطفل؟</small></h2>${N.map(a=>`<div class="rc-task p2"><span class="ic">🩺</span><div class="tx"><b>${esc(a.patient)}</b><small>كشف ${esc(date(a.date))} عند ${esc(a.clinician)}${a.kashfNote?" · "+esc(a.kashfNote):""}</small></div><div class="acts"><button class="btn btn-primary" onclick="rsKashfNext('${a.id}','normal')">حوّل للمشرف العام</button><button class="btn btn-outline" onclick="rsKashfNext('${a.id}','assess')">احجز تقييم مباشر</button><button class="btn btn-outline" onclick="rsKashfNext('${a.id}','none')">ما يحتاج</button></div></div>`).join("")||`<div class="fd-empty">✓ ما فيه كشوفات تنتظر قرار</div>`}</section>`}
      return need+`<section class="rs-box"><h2>${T.ic} ${T.l === "كشف"?"الكشوفات":"التقييمات"} الجاية<small>${L.length} خلال أسبوعين</small></h2>
        <div style="display:flex;justify-content:flex-end;margin-bottom:6px"><button class="btn btn-primary" onclick="rsBookOpen({type:'${type}'${type==="kashf"?",mode:'new'":""}})">＋ حجز ${T.l}</button></div>
        ${Object.keys(byDay).sort().map(d=>`<div class="rs-day">${d===today?"اليوم · ":d===rcTomorrow()?"بكرة · ":""}${esc(date(d))}</div>${byDay[d].map(a=>rsRowHtml(a)).join("")}`).join("")||`<div class="fd-empty">ما فيه ${T.l} محجوز</div>`}</section>`;
    }
    function rsContactsTab(){
      const C=rcContacts();const f=state.rcChF||"open";const CL=C.filter(c=>f==="all"?true:f==="open"?["new","contacted"].includes(c.status):c.ch===f).sort((a,b)=>b.at-a.at);
      const chips=[["open","المفتوحة"],["all","الكل"],...Object.entries(RC_CH).filter(([k])=>C.some(c=>c.ch===k)).map(([k,v])=>[k,v[0]+" "+v[1]])];
      return `<section class="rs-box"><h2>💬 الاستفسارات<small>واتساب وسوشيال واتصال — حوّل أي استفسار لكشف بضغطة</small></h2><div class="rc-chips">${chips.map(([k,l])=>`<button class="${f===k?"on":""}" onclick="state.rcChF='${k}';render()">${esc(l)}</button>`).join("")}</div>
        ${CL.map(c=>rcContactCard(c).replace('<div class="acts">',`<div class="acts">${["new","contacted"].includes(c.status)?`<button class="btn btn-primary" onclick="rsBookOpen({type:'kashf',mode:'new',contact:'${c.id}'})">🩺 احجز كشف</button>`:""}`).replace('class="btn btn-primary" onclick="rcOpen(\'contactAct\'','class="btn btn-outline" onclick="rcOpen(\'contactAct\'')).join("")||`<div class="fd-empty">ما فيه استفسارات هنا</div>`}</section>`;
    }
    function rsTasksTab(T){return `<section class="rs-box"><h2>📋 يحتاج منك<small>مرتبة بالأولوية</small></h2>${T.map(t=>`<div class="rc-task p${t.p}"><span class="ic">${t.ic}</span><div class="tx"><b>${esc(t.t)}</b><small>${esc(t.d)}</small></div><div class="acts">${t.acts.map(([l,js,pri])=>`<button class="btn ${pri?"btn-primary":"btn-outline"}" onclick="${js}">${esc(l)}</button>`).join("")}</div></div>`).join("")||`<div class="fd-empty">✓ ما عندك شي الحين</div>`}</section>`}

    // ---- نافذة الموعد: كل إجراءات الاستقبال على موعد واحد ----
    function rsOpenApt(id){state.rsPop={k:"apt",id};render()}
    function rsClose(){state.rsPop=null;state.rsBook=null;render()}
    function rsPopHtml(){
      const o=state.rsPop;if(!o)return "";const wrap=b=>`<div class="pl-scrim" onclick="if(event.target===this)rsClose()"><div class="pl-pop fd-pop">${b}</div></div>`;
      if(o.k==="book")return wrap(rsBookHtml());
      const a=state.appointments.find(x=>x.id===o.id);if(!a)return "";
      if(o.k==="pay"){const pr=rsPrice(a);return wrap(`<h3>💳 تحصيل — ${esc(a.patient)}</h3><p class="muted">${esc(a.service||"")} · ${esc(date(a.date))} ${esc(time(a.time))}</p><form onsubmit="rsPaySubmit(event,'${a.id}')"><div class="form-grid"><div class="field"><label>المبلغ (قبل الضريبة)</label><input class="input" name="amount" type="number" min="0" value="${pr}"></div><div class="field"><label>طريقة الدفع</label><select class="select" name="method">${RS_PAY.map(m=>`<option>${m}</option>`).join("")}</select></div></div><p class="muted" style="margin-top:8px">تنضاف ضريبة القيمة المضافة 15٪ وتطلع فاتورة في قسم المالية.</p><div class="fd-acts"><button type="button" class="btn btn-outline" onclick="rsOpenApt('${a.id}')">رجوع</button><button class="btn btn-primary">حصّل وأصدر الفاتورة</button></div></form>`)}
      const T=RS_T[rsType(a)];const [k,l]=rsSt(a);const p=rcPatient(a);const pr=rsPrice(a);const today=a.date===rcToday();
      const b=(lbl,js,pri)=>`<button class="btn ${pri?"btn-primary":"btn-outline"}" onclick="${js}">${lbl}</button>`;
      const acts=[];
      if(today&&["up","late","no"].includes(k))acts.push(b("✓ وصل",`rsAct('${a.id}','arrive')`,1));
      if(today&&["wait","up","late"].includes(k))acts.push(b("🚪 دخّله",`rsAct('${a.id}','in')`,k==="wait"));
      if(today&&["live","wait"].includes(k))acts.push(b("✔ خلص",`rsAct('${a.id}','done')`,k==="live"));
      if(pr&&!a.paid&&a.status!=="غائب")acts.push(b("💳 تحصيل "+pr+" ر.س",`rsPayOpen('${a.id}')`,a.status==="مكتمل"));
      if(!["done","abs"].includes(k)){acts.push(b("📅 تأجيل",`rsAct('${a.id}','move')`));if(today&&["late","no","up"].includes(k))acts.push(b("✕ غياب",`rsAct('${a.id}','absent')`));acts.push(b("🗑 إلغاء",`rsAct('${a.id}','cancel')`))}
      if(a.date>rcToday()&&!a.confirmSent)acts.push(b("✅ أرسل تأكيد",`rsAct('${a.id}','confirm')`));
      if(p)acts.push(b("💬 رسالة للأسرة",`setView('communicationHub');cmOpen('fam:${p.id}')`));
      if(p)acts.push(b("📁 الملف",`openPatient('${p.id}')`));
      const kdec=rsType(a)==="kashf"&&a.status==="مكتمل"&&p&&!p.intake&&!p.smart&&!a.kashfDecided;
      return wrap(`<h3>${T.ic} ${esc(T.l)} — ${esc(a.patient)}</h3><span class="rc-s ${k}">${l}${k==="wait"?" "+rsWaitMin(a)+" دقيقة":""}</span>
        <div class="rs-kv"><span>الموعد</span><b>${esc(date(a.date))} · ${esc(time(a.time))} (${+a.duration||T.dur} د)</b><span>عند</span><b>${esc(a.clinician||"—")}</b><span>الخدمة</span><b>${esc(a.service||"")}${a.room?" · "+esc(a.room):""}</b>
        ${p?`<span>ولي الأمر</span><b>${esc(p.guardian||"—")} · <span style="direction:ltr;unicode-bidi:isolate">${esc(p.phone||"")}</span></b><span>الملف</span><b>${esc(p.file||"")}${rsIsNew(a)?' <span class="rs-new">أول زيارة</span>':""}</b>`:""}
        <span>الدفع</span><b>${pr?(a.paid?`✓ مدفوع ${pr} ر.س`:`غير مدفوع — ${pr} ر.س`):"ضمن الباقة"}</b></div>
        ${kdec?`<div class="rc-task p2" style="margin-top:12px"><span class="ic">🩺</span><div class="tx"><b>بعد الكشف — وش الخطوة الجاية؟</b></div><div class="acts">${b("حوّل للمشرف العام",`rsKashfNext('${a.id}','normal')`,1)}${b("احجز تقييم",`rsKashfNext('${a.id}','assess')`)}${b("ما يحتاج",`rsKashfNext('${a.id}','none')`)}</div></div>`:""}
        <div class="rs-acts">${acts.join("")}</div><div class="fd-acts"><button class="btn btn-outline" onclick="rsClose()">إغلاق</button></div>`);
    }
    function rsAct(id,act){
      const a=state.appointments.find(x=>x.id===id);if(!a)return;const p=rcPatient(a);const who=auditActor().name;
      if(act==="arrive"){state.rsPop=null;return rcArrive(id)}
      if(act==="in"){if(!rcVisit(a)){state.childVisits=state.childVisits||[];state.childVisits.unshift({id:"cv-"+Date.now(),patientId:p?p.id:null,name:a.patient,date:a.date,inAt:new Date().toISOString(),aptId:a.id,by:"الاستقبال"})}a.inRoomAt=new Date().toISOString();audit(`دخول ${RS_T[rsType(a)].l}`,a.patient);notify(`${a.patient.split(" ")[0]} دخل عند ${a.clinician}`)}
      if(act==="done"){a.status="مكتمل";a.doneAt=new Date().toISOString();audit(`انتهاء ${RS_T[rsType(a)].l}`,a.patient);notify(rsPrice(a)&&!a.paid?`خلص — باقي تحصيل ${rsPrice(a)} ر.س`:"خلص")}
      if(act==="absent"){state.rsPop=null;return rcAbsent(id)}
      if(act==="cancel"){if(!confirm(`إلغاء موعد ${a.patient} ${date(a.date)} ${time(a.time)}؟`))return;a.status="ملغي";a.cancelledBy=who;if(p&&typeof cmSendTo==="function")cmSendTo("fam:"+p.id,`انلغى موعد ${a.patient.split(" ")[0]} ${date(a.date)} ${time(a.time)}. للحجز من جديد تواصلوا معنا 🌿`);audit("إلغاء موعد",a.patient);state.rsPop=null;notify("انلغى الموعد")}
      if(act==="confirm"){rcConfirmOne(id);return}
      if(act==="move"){const s=state.staff.find(x=>x.name===a.clinician);return rsBookOpen({type:rsType(a),pid:p?p.id:"",dept:rcDeptOfStaff(a.clinician)||"",clin:s?s.id:"",moveOf:a.id,price:a.price})}
      persist();render();
    }
    function rsPayOpen(id){state.rsPop={k:"pay",id};render()}
    function rsPaySubmit(e,id){
      e.preventDefault();const a=state.appointments.find(x=>x.id===id);if(!a)return;const f=new FormData(e.target);const amt=+f.get("amount")||0;const p=rcPatient(a);
      const inv=createInvoice({patientId:p?p.id:null,patientName:a.patient,type:RS_T[rsType(a)].l,label:`${a.service||RS_T[rsType(a)].l} — ${date(a.date)}`,amount:amt,taxRate:0.15,payment:f.get("method")});
      inv.fromReception=true;inv.aptId=a.id;a.paid=true;a.price=amt;a.invoiceId=inv.id;
      audit("تحصيل من الاستقبال",`${a.patient} · ${inv.total} ر.س · ${f.get("method")}`);state.rsPop=null;persist();notify(`انحصّل ${inv.total} ر.س وانصدرت الفاتورة`);render();
    }
    function rsKashfNext(id,what){
      const a=state.appointments.find(x=>x.id===id);const p=a&&rcPatient(a);if(!p)return;a.kashfDecided=what;
      if(what==="normal"){p.intake={source:"normal",stage:"case",regAt:new Date().toISOString(),regBy:auditActor().name,reason:p.need||a.kashfNote||"",ref:"بعد الكشف عند "+a.clinician};p.status="قيد التقييم";audit("بعد الكشف ← المشرف العام",p.name);notify(`${p.name.split(" ")[0]} انحوّل للمشرف العام لدراسة الحالة`)}
      if(what==="assess"){persist();state.rsPop=null;return rsBookOpen({type:"assess",pid:p.id,dept:rcDeptOfStaff(a.clinician)||""})}
      if(what==="none"){audit("بعد الكشف ← ما يحتاج متابعة",p.name);notify("تمام")}
      state.rsPop=null;persist();render();
    }

    // ---- الحجز ----
    function rsBookOpen(o){
      o=o||{};const T=RS_T[o.type||"session"];
      state.rsBook=Object.assign({type:"session",mode:o.pid?"existing":(o.type==="kashf"?"new":"existing"),pid:"",nf:{},dept:"",clin:"",date:"",time:"",from:rcToday(),pref:"any",pick:0,price:T.price,pay:"later",method:"كاش"},o);
      const b=state.rsBook;b.fixedSlot=!!(o.date&&o.time);if(o.price===undefined)b.price=RS_T[b.type].price;
      if(o.contact){const c=rcContacts().find(x=>x.id===o.contact);if(c)b.nf={child:c.child||"",age:c.age||"",guardian:c.guardian||"",phone:c.phone||"",reason:c.msg||""}}
      if(b.pid&&!b.dept)b.dept=rcPatientDept(state.patients.find(x=>x.id===b.pid));
      if(!b.dept)b.dept=(state.departments[0]||{}).id;
      state.rsPop={k:"book"};if(state.view!=="rcDesk"){state.view="rcDesk"}render();
    }
    function rsBookSet(k,v){const b=state.rsBook;if(!b)return;
      if(k.startsWith("nf."))b.nf[k.slice(3)]=v;else b[k]=["pick","price"].includes(k)?+v:v;
      if(k==="type"){b.price=RS_T[v].price;if(v==="kashf"&&!b.pid)b.mode="new"}
      if(k==="pid"){b.dept=rcPatientDept(state.patients.find(x=>x.id===v))||b.dept}
      if(["type","pid","dept","clin","from","pref","mode"].includes(k)){b.pick=0;if(k!=="clin"&&!b.fixedSlot){b.date="";b.time=""}}
      if(!k.startsWith("nf.")&&k!=="price"&&k!=="method"&&k!=="pay")render();}
    function rsPool(b){
      const all=state.staff.filter(s=>s.department===b.dept&&(s.clinical||s.roleCategory==="staff"||s.roleCategory==="supervisor"));
      const byLoad=L=>L.sort((x,y)=>fdLoad(x.name)-fdLoad(y.name));
      if(b.clin)return [personById(b.clin)].filter(Boolean);
      if(b.type==="assess"){const sup=fdDeptSup(b.dept);return [sup,...byLoad(all.filter(s=>s!==sup))].filter(Boolean)}
      if(b.type==="kashf"){const docs=all.filter(s=>/^د\./.test(s.name)||s.roleCategory==="supervisor");return docs.length?byLoad(docs):byLoad(all)}
      return byLoad(all.filter(s=>s.clinical||s.roleCategory==="staff"));
    }
    function rsSuggest(b){
      const name=b.mode==="new"?(b.nf.child||"__new__"):((state.patients.find(x=>x.id===b.pid)||{}).name||"__none__");
      const dur=RS_T[b.type].dur;const pool=rsPool(b);const out=[];const nowM=rcNowM()+10;
      if(b.date&&b.time){const s=pool[0];if(s)out.push({clin:s,date:b.date,time:b.time,dur,fixed:true,free:fdFree(s,name,b.date,b.time,dur,[])});return out}
      for(const d of fdWorkdays(b.from<rcToday()?rcToday():b.from,10)){for(const t of FD_GRID){if(b.pref==="am"&&t>="12:00"||b.pref==="pm"&&t<"12:00")continue;if(d===rcToday()&&sipadMin(t)<nowM)continue;
        for(const s of pool){if(out.some(o=>o.clin.id===s.id&&o.date===d))continue;if(fdFree(s,name,d,t,dur,[])){out.push({clin:s,date:d,time:t,dur});break}}if(out.length>=4)return out}}
      return out;
    }
    function rsBookHtml(){
      const b=state.rsBook;const T=RS_T[b.type];const P=state.patients.filter(p=>!p.archived).sort((x,y)=>x.name.localeCompare(y.name,"ar"));
      const sel=(k,opts,v)=>`<select class="select" onchange="rsBookSet('${k}',this.value)">${opts.map(([val,l])=>`<option value="${val}" ${String(v)===String(val)?"selected":""}>${esc(l)}</option>`).join("")}</select>`;
      const inp=(k,l,v,ph)=>`<div class="field"><label>${l}</label><input class="input" value="${esc(v||"")}" ${ph?`placeholder="${ph}"`:""} oninput="rsBookSet('nf.${k}',this.value)" ${k==="child"?'onchange="render()"':""}></div>`;
      const S=(b.mode==="new"&&!b.nf.child)||(b.mode==="existing"&&!b.pid)?[]:rsSuggest(b);
      const pool=state.staff.filter(s=>s.department===b.dept&&(s.clinical||s.roleCategory==="staff"||s.roleCategory==="supervisor"));
      return `<h3>${b.moveOf?"📅 تأجيل موعد":"حجز جديد"}</h3>
        <div class="rs-types">${Object.entries(RS_T).map(([k,t])=>`<button class="${b.type===k?"on":""}" onclick="rsBookSet('type','${k}')"><span>${t.ic}</span>${t.l}<small>${t.dur} د${t.price?" · "+t.price+" ر.س":" · ضمن الباقة"}</small></button>`).join("")}</div>
        <div class="rs-seg"><button class="${b.mode==="existing"?"on":""}" onclick="rsBookSet('mode','existing')">طفل مسجّل</button><button class="${b.mode==="new"?"on":""}" onclick="rsBookSet('mode','new')">أسرة جديدة</button></div>
        <div class="form-grid">${b.mode==="existing"?`<div class="field" style="grid-column:1/-1"><label>الطفل</label>${sel("pid",[["","اختر الطفل"],...P.map(p=>[p.id,`${p.name} · ${p.file||""} · ${p.guardian||""}`])],b.pid)}</div>`
          :`${inp("child","اسم الطفل",b.nf.child)}${inp("age","العمر",b.nf.age,"مثال: 4 سنوات")}${inp("guardian","ولي الأمر",b.nf.guardian)}${inp("phone","الجوال",b.nf.phone,"05xxxxxxxx")}<div class="field" style="grid-column:1/-1"><label>سبب الزيارة</label><input class="input" value="${esc(b.nf.reason||"")}" oninput="rsBookSet('nf.reason',this.value)"></div><div style="grid-column:1/-1"><button class="btn btn-outline" style="padding:6px 12px;font-size:12px" onclick="render()">ابحث عن وقت ←</button></div>`}
          <div class="field"><label>القسم</label>${sel("dept",state.departments.map(d=>[d.id,d.name]),b.dept)}</div>
          <div class="field"><label>${T.l==="كشف"?"الطبيب / الأخصائي":"الأخصائي"}</label>${sel("clin",[["","تلقائي — "+(b.type==="assess"?"مشرف القسم أول":b.type==="kashf"?"طبيب أو مشرف القسم":"الأقل ضغط")],...pool.map(s=>[s.id,`${s.name} (${fdLoad(s.name)} موعد)`])],b.clin)}</div>
          ${b.date&&b.time?"":`<div class="field"><label>من تاريخ</label><input class="input" type="date" value="${b.from}" onchange="rsBookSet('from',this.value)"></div><div class="field"><label>الوقت المفضل</label>${sel("pref",[["any","أي وقت"],["am","صباحي"],["pm","بعد الظهر"]],b.pref)}</div>`}</div>
        ${b.date&&b.time?`<div class="rs-fixed"><span>الموعد: <b>${esc(date(b.date))} · ${esc(time(b.time))}</b> عند <b>${esc((S[0]&&S[0].clin.name)||"—")}</b>${S[0]&&!S[0].free?' <span style="color:var(--danger)">— الوقت مو فاضي</span>':""}</span><button class="btn btn-outline" style="padding:5px 10px;font-size:12px" onclick="state.rsBook.date='';state.rsBook.time='';state.rsBook.fixedSlot=false;render()">اقترح وقت ثاني</button></div>`
          :S.length?`<div style="margin-top:12px;font-weight:700">أقرب الأوقات المتاحة</div><div class="rc-sug">${S.map((s,i)=>`<label class="${i===b.pick?"best":""}"><input type="radio" name="rspick" ${i===b.pick?"checked":""} onchange="rsBookSet('pick',${i})"><span><b>${esc(date(s.date))} · ${esc(time(s.time))}</b> عند <b>${esc(s.clin.name)}</b><br><small>${esc(deptName(b.dept))} · ${s.dur} دقيقة${i===0?" · ✨ المقترح":""}</small></span></label>`).join("")}</div>`
          :`<div class="fd-empty">${(b.mode==="new"&&!b.nf.child)||(b.mode==="existing"&&!b.pid)?"اختر الطفل أو اكتب اسمه عشان نطلّع الأوقات":"ما فيه وقت فاضي خلال أسبوعين — غيّر القسم أو الأخصائي"}</div>`}
        ${T.price||b.type==="assess"||b.type==="kashf"?`<div class="form-grid" style="margin-top:10px"><div class="field"><label>السعر (ر.س)</label><input class="input" type="number" min="0" value="${b.price}" oninput="rsBookSet('price',this.value)"></div><div class="field"><label>الدفع</label><select class="select" onchange="rsBookSet('pay',this.value)"><option value="later" ${b.pay==="later"?"selected":""}>عند الحضور</option><option value="now" ${b.pay==="now"?"selected":""}>دفع الحين</option></select></div><div class="field"><label>طريقة الدفع</label><select class="select" onchange="rsBookSet('method',this.value)">${RS_PAY.map(m=>`<option ${b.method===m?"selected":""}>${m}</option>`).join("")}</select></div></div>`:""}
        <div class="fd-acts"><button type="button" class="btn btn-outline" onclick="rsClose()">إلغاء</button><button class="btn btn-primary" ${S.length&&(!S[0].fixed||S[0].free)?"":"disabled"} onclick="rsBookConfirm()">${b.moveOf?"أجّل الموعد":"احجز"} وبلّغ الأسرة والأخصائي</button></div>`;
    }
    function rsBookConfirm(){
      const b=state.rsBook;const S=rsSuggest(b);const s=S[b.pick]||S[0];if(!s)return;const T=RS_T[b.type];
      let p=b.mode==="existing"?state.patients.find(x=>x.id===b.pid):null;
      if(b.mode==="new"){if(!b.nf.child||!b.nf.phone)return notify("اكتب اسم الطفل والجوال");
        const num=1000+state.patients.length+1;p={id:"p"+Date.now(),name:b.nf.child.trim(),file:"AWN-"+num,age:b.nf.age||"—",need:b.nf.reason||"",program:"",school:"",guardian:b.nf.guardian||"",phone:b.nf.phone,status:b.type==="kashf"?"كشف أولي":"قيد التقييم",notes:b.nf.reason?"سبب الزيارة: "+b.nf.reason:"",goal:"يُحدَّد بعد التقييم",next:"",code:"AWN-"+num,schoolCode:"",archived:false,assignedPrograms:[],consents:[]};
        if(typeof defaultHealth==="function")p.health=defaultHealth(p);state.patients.unshift(p);
        if(b.contact){const c=rcContacts().find(x=>x.id===b.contact);if(c)Object.assign(c,{status:"registered",pid:p.id})}}
      if(!p)return;
      const moved=b.moveOf&&state.appointments.find(x=>x.id===b.moveOf);if(moved){moved.status="ملغي";moved.movedTo=true}
      const svc=b.type==="kashf"?`كشف — ${deptName(b.dept)}`:b.type==="assess"?`تقييم أولي — ${deptName(b.dept)}`:`${deptName(b.dept)} — ${T.l}`;
      const a={id:"apt-"+Date.now()+"-rs",date:s.date,time:s.time,duration:s.dur,patient:p.name,service:svc,clinician:s.clin.name,room:b.type==="kashf"?"عيادة الكشف":b.type==="assess"?"غرفة التقييم":"غرفة "+deptName(b.dept).replace(/^قسم\s*/,""),status:"مجدول",newForStaff:true,bookedBy:"الاستقبال",rsType:b.type,price:T.price||b.type==="assess"||b.type==="kashf"?+b.price:0};
      if(moved&&moved.paid)Object.assign(a,{paid:true,invoiceId:moved.invoiceId,price:moved.price});
      state.appointments.push(a);
      if(a.price&&!a.paid&&b.pay==="now"){const inv=createInvoice({patientId:p.id,patientName:p.name,type:T.l,label:`${svc} — ${date(a.date)}`,amount:a.price,taxRate:0.15,payment:b.method});inv.fromReception=true;inv.aptId=a.id;a.paid=true;a.invoiceId=inv.id}
      if(b.compOf){const o=state.appointments.find(x=>x.id===b.compOf);if(o)o.compBooked=true}
      if(!p.next||p.next<a.date)p.next=a.date+"T"+a.time;
      if(typeof cmSendTo==="function"){cmSendTo("fam:"+p.id,`${b.moveOf?"انتقل":"انحجز"} موعد ${p.name.split(" ")[0]} 🌿 ${T.l}: ${date(a.date)} الساعة ${time(a.time)} عند ${a.clinician}${a.price&&!a.paid?` · الرسوم ${a.price} ر.س عند الحضور`:""}.`);cmSendTo("staff:"+s.clin.id,`📅 ${T.l} جديد في جدولك: ${p.name} ${date(a.date)} ${time(a.time)}.`)}
      audit(`${b.moveOf?"تأجيل":"حجز"} ${T.l} من الاستقبال`,`${p.name} · ${date(a.date)} ${time(a.time)} · ${a.clinician}`);
      state.rsPop=null;state.rsBook=null;persist();notify(`${b.moveOf?"انتقل الموعد":"انحجز "+T.l}: ${date(a.date)} ${time(a.time)} عند ${a.clinician}`);render();
    }

    // التقييم في الاستقبال العادي: مشرف القسم يقيّم في موعد محجوز، مو موعد وهمي
    const _rsApplyAssess=fdApplyAssess;
    fdApplyAssess=function(p,d,staff,at){
      const booked=state.appointments.find(a=>a.patient===p.name&&rsType(a)==="assess"&&a.status==="مجدول");
      const n=state.appointments.length;const out=_rsApplyAssess.apply(this,arguments);
      if(booked){booked.status="مكتمل";const added=state.appointments.slice(n).filter(a=>a.intakeId===p.id&&/تقييم/.test(a.service||""));state.appointments=state.appointments.filter(a=>!added.includes(a))}
      return out;
    };
    const _rsFdCard=fdCard;
    fdCard=function(p){const h=_rsFdCard.apply(this,arguments);if(p.intake.stage!=="assess")return h;
      const a=state.appointments.find(x=>x.patient===p.name&&rsType(x)==="assess"&&x.status==="مجدول");
      return h.replace('<div class="fd-row">',`<div class="fd-meta">${a?`🧩 موعد التقييم: <b>${esc(date(a.date))} ${esc(time(a.time))}</b>`:`<span style="color:var(--danger)">🧩 لسه ما انحجز موعد التقييم — عند الاستقبال</span>`}</div><div class="fd-row">`)};

    // ---- بيانات تجريبية: كشوفات وتقييمات اليوم والأيام الجاية ----
    function rsSeed(){
      if(state.rsSeeded)return;state.rsSeeded=true;const today=rcToday();const nowM=rcNowM();
      const docs=state.staff.filter(s=>/^د\./.test(s.name));const doc=i=>docs[i%docs.length]||state.staff[0];
      const mkP=(name,guardian,phone,age,need)=>{const num=1000+state.patients.length+1;const p={id:"p"+Date.now()+Math.floor(Math.random()*1000),name,file:"AWN-"+num,age,need,program:"",school:"",guardian,phone,status:"كشف أولي",notes:"سبب الزيارة: "+need,goal:"يُحدَّد بعد التقييم",next:"",code:"AWN-"+num,schoolCode:"",archived:false,assignedPrograms:[],consents:[]};if(typeof defaultHealth==="function")p.health=defaultHealth(p);state.patients.unshift(p);return p};
      const W=fdWorkdays(rcTomorrow(),4);
      const K=[["عمر فهد الدوسري","فهد الدوسري","0551002001","4 سنوات","تأخر كلام","09:00",0],["لمى سعد الحربي","سعد الحربي","0551002002","3 سنوات","ما تستجيب لاسمها","10:30",1],["يزيد ناصر القحطاني","ناصر القحطاني","0551002003","7 سنوات","تشتت وفرط حركة","12:00",0],["رزان علي الشهري","علي الشهري","0551002004","5 سنوات","صعوبة في الأكل والبلع","13:30",1],
        ["سارة محمد العنزي","محمد العنزي","0551002005","6 سنوات","صعوبات تعلم","W0-09:30",0],["تركي بندر المطيري","بندر المطيري","0551002006","2 سنتين","تأخر مشي","W1-11:00",1],["مشاعل خالد الغامدي","خالد الغامدي","0551002007","4 سنوات","تأتأة","W2-10:00",0]];
      K.forEach(([n,g,ph,age,need,tm,di],i)=>{const p=mkP(n,g,ph,age,need);let d=today,t=tm;if(/^W\d-/.test(tm)){d=W[+tm[1]];t=tm.slice(3)}
        const s=doc(di);const a={id:"apt-rsk-"+i,date:d,time:t,duration:30,patient:p.name,service:"كشف — "+deptName(s.department),clinician:s.name,room:"عيادة الكشف",status:"مجدول",rsType:"kashf",price:250,bookedBy:"الاستقبال"};
        if(d===today){const m=sipadMin(t);if(m+30<nowM){a.status="مكتمل";a.paid=true;a.kashfNote=need;state.childVisits=state.childVisits||[];state.childVisits.unshift({id:"cv-rsk"+i,patientId:p.id,name:p.name,date:d,inAt:new Date(Date.now()-((nowM-m)+8)*60000).toISOString(),aptId:a.id})}
          else if(m-25<nowM){state.childVisits=state.childVisits||[];state.childVisits.unshift({id:"cv-rsk"+i,patientId:p.id,name:p.name,date:d,inAt:new Date(Date.now()-12*60000).toISOString(),aptId:a.id})}}
        p.next=d+"T"+t;state.appointments.push(a)});
      // تقييمات: الأطفال المحوّلين لمشرف القسم في الاستقبال العادي + تقييم أسرة من الكشف
      (typeof fdList==="function"?fdList():[]).filter(p=>p.intake.stage==="assess").slice(0,1).forEach((p,i)=>{const s=fdDeptSup(p.intake.dept);if(s)state.appointments.push({id:"apt-rsa-"+i,date:today,time:"11:00",duration:60,patient:p.name,service:"تقييم أولي — "+deptName(p.intake.dept),clinician:s.name,room:"غرفة التقييم",status:"مجدول",rsType:"assess",price:600,bookedBy:"الاستقبال"})});
      const p2=mkP("هيفاء عبدالله الزهراني","عبدالله الزهراني","0551002009","5 سنوات","تقييم شامل بطلب المدرسة");p2.status="قيد التقييم";
      const s2=fdDeptSup("inclusion")||doc(0);state.appointments.push({id:"apt-rsa-x",date:W[0],time:"09:00",duration:60,patient:p2.name,service:"تقييم أولي — "+deptName(s2.department),clinician:s2.name,room:"غرفة التقييم",status:"مجدول",rsType:"assess",price:600,paid:true,bookedBy:"الاستقبال"});
      // جلسات اليوم: اللي وقتها قريب من الحين وصلوا للصالة
      state.appointments.filter(a=>a.date===today&&rsType(a)==="session"&&a.status==="مجدول"&&Math.abs(sipadMin(a.time)-nowM)<=25).slice(0,4).forEach((a,i)=>{state.childVisits=state.childVisits||[];if(!rcVisit(a))state.childVisits.unshift({id:"cv-rss"+i,patientId:(rcPatient(a)||{}).id||null,name:a.patient,date:today,inAt:new Date(Date.now()-(5+i*6)*60000).toISOString(),aptId:a.id})});
      persist();
    }

    // التعويض يفتح الحجز الجديد بنوع «جلسة تعويضية»
    rcComp=function(id){const a=state.appointments.find(x=>x.id===id);if(!a)return;const p=rcPatient(a);const s=state.staff.find(x=>x.name===a.clinician);
      rsBookOpen({type:"comp",pid:p?p.id:"",dept:rcDeptOfStaff(a.clinician)||"",clin:s?s.id:"",compOf:id})};
    // ---- ربط: المحطة تحل محل مكتب الاستقبال ----
    rcDeskView=rsView;
    Object.assign(window,{rcDeskView,rcComp,rsTabSet,rsShift,rsOpenApt,rsClose,rsAct,rsPayOpen,rsPaySubmit,rsKashfNext,rsBookOpen,rsBookSet,rsBookConfirm,fdApplyAssess,fdCard});
    if(state.view==="rcDesk")render();
