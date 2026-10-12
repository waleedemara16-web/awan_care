const t=`"use strict";
// أوان — الجزء 26: حضور الجلسة من تايم لاين الأخصائي يوصل للاستقبال تلقائي
// الأخصائي يفتح الجلسة (أو يضغط «حضر») ← الموعد يصير «داخل»، ينكتب في سجل الطفل، والاستقبال يتبلّغ.
// يقفل الجلسة ← «خلص» عند الاستقبال. «ما حضر» ← غياب + مهمة تعويض عند الاستقبال.
// صفحة المواعيد ومحطة الاستقبال تعرض «آخر الحضور» لحظة بلحظة.

    (function saStyles(){
      const st=document.createElement("style");
      st.textContent=\`.sa-next{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 12px;padding:12px 14px;border-radius:14px;background:#E8F6F4;border:1px solid #BFE6E1;font-size:13px}
[data-theme="dark"] .sa-next{background:#0f3a3c;border-color:#1d5c5f}
.sa-next .tx{flex:1;min-width:200px}.sa-next .tx b{font-size:15px}.sa-next .tx small{display:block;color:var(--muted)}
.sa-next .btn{padding:9px 14px}
.sa-feed{display:flex;gap:8px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px}
.sa-feed span{flex:none;font-size:12px;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:6px 11px;white-space:nowrap}
.sa-feed span.in{border-color:#86efac;background:#f0fdf4}.sa-feed span.out{border-color:#93c5fd;background:#eff6ff}.sa-feed span.abs{border-color:#fca5a5;background:#fef2f2}
.sa-feed b{font-weight:800}\`;
      document.head.appendChild(st);
    })();

    function saStaff(a){return (typeof lsPerson==="function"&&lsPerson())||getCurrentPerson()||state.staff.find(x=>x.name===a.clinician)||{name:a.clinician}}
    function saTell(s,text,info){if(typeof cmSendTo!=="function")return;const m=cmSendTo("dept:reception",text);if(m){m.fromId=s.id||null;m.fromName=s.name;m.fromDept=s.department||null;m.info=!!info;m.sa=true}}
    function saIn(a){
      const s=saStaff(a);const p=rcPatient(a);const now=new Date();
      state.childVisits=state.childVisits||[];if(!rcVisit(a))state.childVisits.unshift({id:"cv-"+Date.now(),patientId:p?p.id:null,name:a.patient,date:a.date,inAt:now.toISOString(),aptId:a.id,by:s.name});
      a.inRoomAt=a.inRoomAt||now.toISOString();a.attendBy=s.name;a.attendAt=now.toISOString();
      const n=rsVisitNo(a);a.visitNo=n;
      audit(\`حضور \${RS_T[rsType(a)].l} (الزيارة رقم \${n}) — سجّله \${s.name}\`,a.patient);
      saTell(s,\`✅ \${a.patient} دخل \${RS_T[rsType(a)].l} عند \${s.name} الساعة \${localTimeOf(now)} — الزيارة رقم \${n}\`,true);
      persist();
    }
    // فتح الجلسة/التقييم من التايم لاين = تسجيل حضور
    const _saStart=startLiveSession;
    startLiveSession=function(id){const a=state.appointments.find(x=>x.id===id);const first=a&&!a.attendAt&&a.status==="مجدول";const r=_saStart.apply(this,arguments);if(first)saIn(a);return r};
    const _saEval=evStartApt;
    evStartApt=function(id){const a=state.appointments.find(x=>x.id===id);const first=a&&!a.attendAt&&a.status==="مجدول";const r=_saEval.apply(this,arguments);if(first)saIn(a);return r};
    // قفل الجلسة = خلص عند الاستقبال
    const _saEnd=liveEndSession;
    liveEndSession=function(){const L=dttLive();const a=L&&state.appointments.find(x=>x.id===L.aptId);const was=a&&a.status;const r=_saEnd.apply(this,arguments);
      if(a&&was!=="مكتمل"&&a.status==="مكتمل"){a.doneAt=new Date().toISOString();saTell(saStaff(a),\`✔ \${a.patient} خلص جلسته عند \${a.clinician} — جاهز يطلع لأهله\`,true);persist()}return r};
    // «ما حضر» من التايم لاين
    function saAbsent(id){const a=state.appointments.find(x=>x.id===id);if(!a)return;const s=saStaff(a);
      if(!confirm(\`تسجيل \${a.patient} ما حضر جلسة \${time(a.time)}؟\`))return;
      scAbsent(id);saTell(s,\`✕ \${a.patient} ما حضر جلسة \${time(a.time)} عند \${s.name} — احجزوا تعويض\`,false);persist();render()}
    // شريط «الطفل الجاي» فوق التايم لاين
    function saNextStrip(s){
      const today=rcToday();const nowM=rcNowM();
      const L=state.appointments.filter(a=>a.clinician===s.name&&a.date===today&&a.status==="مجدول"&&!a.attendAt&&sipadMin(a.time)+(+a.duration||40)>nowM-10).sort((a,b)=>a.time.localeCompare(b.time));
      const a=L[0];if(!a)return "";const v=rcVisit(a);const wait=v?Math.max(0,Math.round((Date.now()-Date.parse(v.inAt))/60000)):null;
      return \`<div class="sa-next"><div class="tx"><small>الطفل الجاي · \${esc(time(a.time))}</small><b>\${esc(a.patient)}</b> <span class="rs-new" style="background:var(--card);color:var(--ink)">\${rsVisitNo(a)===1?"أول زيارة":"الزيارة رقم "+rsVisitNo(a)}</span><small>\${v?\`🟢 وصل الاستقبال \${wait<1?"الحين":"من "+wait+" د"}\`:"⏳ للحين ما وصل الاستقبال"}</small></div>
        <button class="btn btn-primary" onclick="sipadTileOpen('\${a.id}')">✓ حضر — ابدأ \${/تقييم/.test(a.service||"")?"التقييم":"الجلسة"}</button><button class="btn btn-outline" onclick="saAbsent('\${a.id}')">✕ ما حضر</button></div>\`;
    }
    // الشريط فوق في شاشة الآيباد، تحت التحية مباشرة
    const _saHome=sipadHome;
    sipadHome=function(s){const h=_saHome.apply(this,arguments);const strip=s?saNextStrip(s):"";if(!strip)return h;const i=h.indexOf('<section');return i>=0?h.slice(0,i)+strip+h.slice(i):strip+h};

    // «آخر الحضور» عند الاستقبال
    function saFeed(){
      const today=rcToday();const ev=[];
      state.appointments.filter(a=>a.date===today).forEach(a=>{
        if(a.attendAt)ev.push({at:a.attendAt,c:"in",t:\`<b>\${esc(a.patient.split(" ").slice(0,2).join(" "))}</b> دخل عند \${esc(a.attendBy)}\`});
        if(a.doneAt&&a.status==="مكتمل")ev.push({at:a.doneAt,c:"out",t:\`<b>\${esc(a.patient.split(" ").slice(0,2).join(" "))}</b> خلص\`});
        if(a.status==="غائب"&&a.absentAt)ev.push({at:a.absentAt,c:"abs",t:\`<b>\${esc(a.patient.split(" ").slice(0,2).join(" "))}</b> ما حضر\`})});
      const L=ev.sort((x,y)=>String(y.at).localeCompare(String(x.at))).slice(0,12);
      return L.length?\`<div class="sa-feed" title="آخر الحضور — يتحدث لحاله من آيبادات الأخصائيين">\${L.map(e=>\`<span class="\${e.c}">\${esc(localTimeOf(new Date(e.at)))} · \${e.t}</span>\`).join("")}</div>\`:"";
    }
    const _saAbs=scAbsent;scAbsent=function(id){const a=state.appointments.find(x=>x.id===id);const r=_saAbs.apply(this,arguments);if(a&&a.status==="غائب")a.absentAt=a.absentAt||new Date().toISOString();return r};
    const _saSched=schedule;
    schedule=function(){const h=_saSched.apply(this,arguments);const f=apDay()===rcToday()?saFeed():"";if(!f)return h;const i=h.indexOf('<div class="ap-stats">');return i>=0?h.slice(0,i)+f+h.slice(i):h};
    const _saDesk=rcDeskView;
    rcDeskView=function(){const h=_saDesk.apply(this,arguments);if((state.rsTab||"today")!=="today")return h;const f=saFeed();if(!f)return h;const i=h.indexOf('<div class="rs-kpis">');return i>=0?h.slice(0,i)+f+h.slice(i):h};
    // رسايل الحضور معلومات بس — ما تصير مهام «تم» عند الاستقبال
    const _saRcMsgs=rcMsgs;rcMsgs=function(){return _saRcMsgs.apply(this,arguments).filter(m=>!m.info)};

    // البيانات التجريبية: الأطفال اللي كانوا يجون قبل أوان لهم عدد زيارات سابق (كأنه مستورد)
    (function saSeed(){if(state.saSeeded)return;state.saSeeded=true;
      state.patients.forEach(p=>{if(p.visitsBefore!==undefined||p.intake||p.smart||/^p-?\\d{13}/.test(p.id)||p.status!=="نشط")return;let h=0;for(const c of p.id)h=(h*31+c.charCodeAt(0))%997;p.visitsBefore=4+h%28});persist()})();
    Object.assign(window,{startLiveSession,evStartApt,liveEndSession,saAbsent,sipadHome,scAbsent,schedule,rcDeskView,rcMsgs});
`;export{t as default};
//# sourceMappingURL=26-session-attend-B8WYhwvw.js.map
