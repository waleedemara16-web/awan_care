const t=`"use strict";
// أوان — الجزء 25: صفحة «المواعيد» العملية (بدل «إيقاع اليوم»)
// يوم واحد في كل مرة (أمس/اليوم/بكرة)، بحث بالاسم، فلترة بالقسم والنوع والحالة،
// قائمة مجمّعة بالساعة مع زر الإجراء الجاي على كل موعد، أو عرض جدول الأخصائيين،
// والتعارضات الحقيقية بس (أخصائي أو طفل محجوز مرتين في نفس الوقت).

    (function apStyles(){
      const st=document.createElement("style");
      st.textContent=\`.ap-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.ap-date{display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:5px}
.ap-date b{min-width:190px;text-align:center;font-size:15px}.ap-date .btn{padding:7px 12px}
.ap-stats{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.ap-stats button{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;padding:8px 13px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-weight:700;font-size:13px}
.ap-stats button b{font-size:16px}.ap-stats button.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.ap-stats button.red b{color:#b91c1c}.ap-stats button.on.red b{color:#fff}
.ap-filters{display:grid;grid-template-columns:minmax(0,2fr) repeat(3,minmax(0,1fr)) auto;gap:8px;margin-bottom:14px;align-items:center}
.ap-view{display:inline-flex;background:var(--cream-2);border-radius:12px;padding:3px;gap:3px}.ap-view button{all:unset;cursor:pointer;padding:8px 14px;border-radius:9px;font-weight:700;font-size:12.5px;color:var(--muted)}.ap-view button.on{background:var(--card);color:var(--ink);box-shadow:var(--shadow-sm)}
.ap-hour{display:flex;align-items:center;gap:10px;margin:14px 0 4px;font-weight:800;color:var(--navy)}.ap-hour small{color:var(--muted);font-weight:600}
.ap-hour::after{content:"";flex:1;height:1px;background:var(--line)}
.ap-list .rs-row{grid-template-columns:58px minmax(0,1.3fr) minmax(0,1fr) auto auto auto;background:var(--card)}
.ap-go{padding:6px 11px!important;font-size:12px!important;white-space:nowrap}
.ap-warn{border:1px solid #fca5a5;background:var(--danger-2);border-radius:14px;padding:10px 14px;margin-bottom:12px;font-size:13px}
.ap-warn summary{cursor:pointer;font-weight:800;color:#b91c1c}
.ap-empty{text-align:center;color:var(--muted);padding:30px 10px}
@media (max-width:1000px){.ap-filters{grid-template-columns:1fr 1fr}.ap-list .rs-row{grid-template-columns:52px 1fr auto auto}.ap-list .rs-row>:nth-child(3),.ap-list .rs-row>:nth-child(5){display:none}}\`;
      document.head.appendChild(st);
    })();

    function apDay(){return state.apDate||rcToday()}
    function apShift(n){const d=new Date(apDay()+"T12:00:00");d.setDate(d.getDate()+n);state.apDate=localDateOf(d);state.apSt="all";render()}
    function apSet(k,v){state[k]=v;render()}
    function apMe(){return state.role==="staff"||state.role==="supervisor"?getCurrentPerson():null}
    // الحالة بكلمة واضحة + الإجراء الجاي
    function apStatusKey(a){const k=rsSt(a)[0];return k==="up"||k==="in"?"up":k==="late"||k==="no"?"late":k==="wait"||k==="live"?"here":k==="done"?"done":k==="abs"&&a.status==="ملغي"?"cancel":"abs"}
    const AP_ST=[["all","الكل"],["up","الجاية"],["here","وصلوا / داخل"],["late","متأخر أو ما وصل",1],["done","خلصت"],["abs","غياب"],["cancel","ملغي"]];
    function apNext(a){
      const k=rsSt(a)[0];const today=a.date===rcToday();const recv=state.role!=="staff";
      if(today&&recv&&["up","late","no"].includes(k))return [\`rsAct('\${a.id}','arrive')\`,"✓ وصل"];
      if(today&&k==="wait")return [\`rsAct('\${a.id}','in')\`,"🚪 دخّله"];
      if(today&&k==="live")return [\`rsAct('\${a.id}','done')\`,"✔ خلص"];
      if(recv&&a.date>rcToday()&&!a.confirmSent)return [\`rsAct('\${a.id}','confirm')\`,"✅ تأكيد"];
      return null;
    }
    function apConflicts(L){
      const out=[];const live=L.filter(a=>!["ملغي","غائب"].includes(a.status));
      const ov=(a,b)=>{const s1=sipadMin(a.time),s2=sipadMin(b.time);return s1<s2+(+b.duration||40)&&s2<s1+(+a.duration||40)};
      for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],b=live[j];if(!ov(a,b))continue;
        if(a.clinician&&a.clinician===b.clinician)out.push({w:a.clinician,t:\`\${time(a.time)} \${a.patient} + \${time(b.time)} \${b.patient}\`,id:b.id});
        else if(a.patient===b.patient)out.push({w:a.patient,t:\`\${time(a.time)} عند \${a.clinician} + \${time(b.time)} عند \${b.clinician}\`,id:b.id})}
      return out;
    }

    function apView(){
      const day=apDay();const me=apMe();
      const mine=state.apMine!==undefined?state.apMine:!!(me&&state.role==="staff");
      const dep=state.apDept||(me&&state.role==="supervisor"&&me.department?me.department:"all");
      const ty=state.apType||"all";const sf=state.apSt||"all";const mode=state.apMode||"list";
      let L=state.appointments.filter(a=>a.date===day);
      if(mine&&me)L=L.filter(a=>a.clinician===me.name);
      if(dep!=="all")L=L.filter(a=>rcDeptOfStaff(a.clinician)===dep);
      if(ty!=="all")L=L.filter(a=>ty==="session"?["session","comp"].includes(rsType(a)):rsType(a)===ty);
      const cnt={};AP_ST.forEach(([k])=>cnt[k]=k==="all"?L.filter(a=>a.status!=="ملغي").length:L.filter(a=>apStatusKey(a)===k).length);
      const shown=L.filter(a=>sf==="all"?a.status!=="ملغي":apStatusKey(a)===sf).sort((a,b)=>a.time.localeCompare(b.time)||a.clinician.localeCompare(b.clinician));
      const conf=apConflicts(L);const dl=day===rcToday()?"اليوم":day===rcTomorrow()?"بكرة":day===localDateOf(new Date(Date.now()-864e5))?"أمس":"";
      let h=head("الجلسات","المواعيد",me&&state.role==="staff"?"مواعيدك بالوقت — وتقدر تشوف مواعيد المركز كله.":"كل مواعيد اليوم بالوقت وعند مين — دوّر، فلتر، وسجّل الحضور من هنا.",state.role!=="staff"?\`<button class="btn btn-primary" onclick="rsBookOpen({type:'session',date:'',from:'\${day<rcToday()?rcToday():day}'})">＋ حجز موعد</button>\`:"");
      h+=\`<div class="ap-bar"><div class="ap-date"><button class="btn btn-outline" onclick="apShift(-1)" title="اليوم اللي قبل">→</button><b>\${dl?dl+" · ":""}\${esc(date(day))}</b><button class="btn btn-outline" onclick="apShift(1)" title="اليوم اللي بعد">←</button></div>
        \${day!==rcToday()?\`<button class="btn btn-outline" onclick="state.apDate=null;state.apSt='all';render()">ارجع لليوم</button>\`:""}<input class="input" type="date" value="\${day}" style="max-width:170px" onchange="state.apDate=this.value;state.apSt='all';render()">
        <div class="ap-view" style="margin-inline-start:auto"><button class="\${mode==="list"?"on":""}" onclick="apSet('apMode','list')">☰ قائمة</button><button class="\${mode==="grid"?"on":""}" onclick="apSet('apMode','grid')">▦ جدول الأخصائيين</button></div></div>\`;
      h+=\`<div class="ap-stats">\${AP_ST.filter(([k])=>k!=="cancel"||cnt.cancel).map(([k,l,red])=>\`<button class="\${sf===k?"on":""} \${red&&cnt[k]?"red":""}" onclick="apSet('apSt','\${k}')"><b>\${cnt[k]}</b>\${l}</button>\`).join("")}</div>\`;
      h+=\`<div class="ap-filters"><input class="input" id="ap-q" placeholder="🔎 دوّر باسم الطفل أو الأخصائي" oninput="apFilter(this.value)" value="\${esc(state.apQ||"")}">
        <select class="select" onchange="apSet('apDept',this.value)"><option value="all">كل الأقسام</option>\${state.departments.map(d=>\`<option value="\${d.id}" \${dep===d.id?"selected":""}>\${esc(d.name)}</option>\`).join("")}</select>
        <select class="select" onchange="apSet('apType',this.value)">\${[["all","كل الأنواع"],["kashf","🩺 كشوفات"],["assess","🧩 تقييمات"],["session","🎯 جلسات"]].map(([v,l])=>\`<option value="\${v}" \${ty===v?"selected":""}>\${l}</option>\`).join("")}</select>
        \${me?\`<select class="select" onchange="apSet('apMine',this.value==='1')"><option value="1" \${mine?"selected":""}>مواعيدي أنا</option><option value="0" \${!mine?"selected":""}>كل المركز</option></select>\`:\`<span></span>\`}
        \${sf!=="all"||dep!=="all"||ty!=="all"?\`<button class="btn btn-outline" onclick="state.apSt='all';state.apDept='all';state.apType='all';render()">مسح الفلاتر</button>\`:"<span></span>"}</div>\`;
      if(conf.length)h+=\`<details class="ap-warn"><summary>⚠️ \${conf.length} تعارض في هذا اليوم — أخصائي أو طفل محجوز مرتين بنفس الوقت</summary><div style="margin-top:8px">\${conf.slice(0,12).map(c=>\`<div style="padding:4px 0">• <b>\${esc(c.w)}</b>: \${esc(c.t)} <button class="btn btn-outline" style="padding:3px 9px;font-size:11px" onclick="rsOpenApt('\${c.id}')">عدّل</button></div>\`).join("")}</div></details>\`;
      if(mode==="grid"){state.rsDate=day;state.rsCalDept=dep;return h+rsCal().replace(/<div class="rs-cal-nav">[\\s\\S]*?<div class="rs-legend">/,'<div class="rs-cal-nav"><div class="rs-legend">')+rsPopHtml()}
      const hours={};shown.forEach(a=>{const hh=a.time.slice(0,2);(hours[hh]=hours[hh]||[]).push(a)});
      h+=\`<div class="ap-list" id="ap-list">\${Object.keys(hours).sort().map(hh=>\`<div class="ap-grp"><div class="ap-hour">\${esc(time(hh+":00"))}<small>\${hours[hh].length} موعد</small></div>\${hours[hh].map(a=>{const n=apNext(a);
          return rsRowHtml(a).replace('<div class="rs-row"',\`<div class="rs-row" data-q="\${esc((a.patient+" "+a.clinician+" "+(a.service||"")).toLowerCase())}"\`).replace(/<\\/div>$/,\`\${n?\`<button class="btn btn-primary ap-go" onclick="event.stopPropagation();\${n[0]}">\${n[1]}</button>\`:\`<span></span>\`}</div>\`)}).join("")}</div>\`).join("")||\`<div class="ap-empty">ما فيه مواعيد \${sf!=="all"?"بهذي الحالة":""} في \${esc(date(day))}\${state.role!=="staff"?\`<br><button class="btn btn-primary" style="margin-top:10px" onclick="rsBookOpen({type:'session',from:'\${day<rcToday()?rcToday():day}'})">＋ حجز موعد</button>\`:""}</div>\`}</div>\`;
      if(state.apQ)setTimeout(()=>apFilter(state.apQ),0);
      return h+rsPopHtml();
    }
    // البحث يخفي الصفوف بدون إعادة رسم (عشان ما يضيع المؤشر وأنت تكتب)
    function apFilter(q){state.apQ=q;q=String(q||"").trim().toLowerCase();document.querySelectorAll("#ap-list .ap-grp").forEach(g=>{let n=0;g.querySelectorAll(".rs-row").forEach(r=>{const ok=!q||r.dataset.q.includes(q);r.style.display=ok?"":"none";if(ok)n++});g.style.display=n?"":"none"})}

    schedule=apView;
    // الحجز من صفحة المواعيد يفتح هنا بدل ما ينقل لمحطة الاستقبال
    const _apBookOpen=rsBookOpen;
    rsBookOpen=function(o){const v=state.view;const r=_apBookOpen.apply(this,arguments);if(v==="schedule"&&state.view!=="schedule"){state.view="schedule";render()}return r};
    Object.assign(window,{schedule,apShift,apSet,apFilter,rsBookOpen});
    if(state.view==="schedule")render();
`;export{t as default};
//# sourceMappingURL=25-appointments-98AIb8TZ.js.map
