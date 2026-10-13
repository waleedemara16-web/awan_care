const t=`"use strict";
// أوان — الجزء 22: مكتب الاستقبال — الصفحة الأولى لموظف الاستقبال
// ١ مهامي الحين: كل اللي مطلوب منه مرتّب بالأولوية وزر واحد لكل مهمة
// ٢ التواصل الجديد: الحالات اللي تواصلت من الواتساب والسوشيال والاتصال
// ٣ مواعيد اليوم/بكرة بالوقت وعند مين، وحجز موعد جديد يختار الوقت والأخصائي تلقائيًا

    const RC_CH={whatsapp:["💬","واتساب"],instagram:["📸","إنستجرام"],snapchat:["👻","سناب شات"],tiktok:["🎵","تيك توك"],x:["✖️","X"],call:["📞","اتصال"],web:["🌐","الموقع"],walkin:["🚪","زيارة للمركز"]};
    const RC_PLATFORM={
      whatsapp:["WA","واتساب","#25D366","#effcf3"],
      instagram:["◎","إنستجرام","#d9468f","#fff1f7"],
      snapchat:["👻","سناب شات","#b39b00","#fffde7"],
      tiktok:["♪","تيك توك","#111827","#f3f4f6"],
      x:["X","X","#111827","#f3f4f6"],
      call:["☎","اتصال","#2563eb","#eff6ff"],
      web:["↗","الموقع","#0e8388","#ecfdfb"],
      walkin:["↗","زيارة للمركز","#8a5a12","#fff8e8"]
    };
    const RC_ST={new:["جديد","red"],contacted:["تم التواصل","gold"],registered:["انسجّل","good"],converted:["انحجز تقييم","good"],link:["انرسل الرابط","good"],lost:["غير مهتم","muted"]};
    const RC_TYPES=[["جلسة علاجية",40],["تقييم أولي",45],["جلسة تعويضية",40],["استشارة أسرية",30]];

    (function rcStyles(){
      const st=document.createElement("style");
      st.textContent=\`.rc-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.rc-kpi{all:unset;cursor:pointer;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:2px}
.rc-kpi b{font-size:26px;color:var(--navy)}.rc-kpi span{font-weight:700;font-size:13px}.rc-kpi small{color:var(--muted);font-size:11px}
.rc-kpi.hot b{color:var(--danger)}
.rc-sec{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:16px}
.rc-sec>h2{margin:0 0 4px;font-size:17px;display:flex;align-items:center;gap:8px}.rc-sec>p{margin:0 0 12px;color:var(--muted);font-size:12px}
.rc-task{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);margin-bottom:6px}
.rc-task .ic{font-size:18px;flex:none;width:28px;text-align:center}.rc-task .tx{flex:1;min-width:0}.rc-task .tx b{display:block;font-size:13px}.rc-task .tx small{color:var(--muted);font-size:11.5px}
.rc-task.p3{border-color:#fca5a5;background:var(--danger-2)}.rc-task.p2{border-color:#f5d48b;background:var(--gold-2)}
.rc-task .acts{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.rc-task .btn{padding:7px 12px;font-size:12px}
.rc-cols{display:grid;grid-template-columns:1fr 1.25fr;gap:16px;align-items:start}
.rc-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.rc-chips button{all:unset;cursor:pointer;font-size:12px;font-weight:700;padding:6px 11px;border-radius:99px;background:var(--cream-2);color:var(--muted)}.rc-chips button.on{background:var(--navy);color:#fff}
.rc-ct{border:1px solid var(--line);border-radius:16px;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px;background:var(--card)}
.rc-ct-h{display:flex;align-items:center;gap:8px}.rc-ct-h .ch{display:none}.rc-ct-h b{font-size:13px}.rc-ct-h small{color:var(--muted);font-size:11px;display:block}
.rc-ct-platform{display:inline-flex;align-items:center;gap:6px;width:max-content;max-width:100%;border-radius:99px;padding:4px 9px 4px 5px;background:var(--platform-bg);color:var(--platform-color);font-size:11px;font-weight:800}
.rc-ct-platform .mark{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:var(--platform-color);color:#fff;font-size:11px;font-weight:900;line-height:1}
.rc-ct-chat{display:flex;justify-content:flex-start}
.rc-ct .msg{position:relative;max-width:min(100%,520px);font-size:12.5px;background:var(--bubble-bg,var(--cream-2));border:1px solid color-mix(in srgb,var(--platform-color,#94a3b8) 25%,transparent);border-inline-start:3px solid var(--platform-color,#94a3b8);border-radius:16px 16px 16px 4px;padding:9px 12px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
.rc-ct-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rc-ct-meta small{color:var(--muted);font-size:11px}
.rc-ct .acts{display:flex;gap:6px;flex-wrap:wrap}.rc-ct .btn{padding:6px 10px;font-size:11.5px}
.rc-pill{margin-inline-start:auto;font-size:10.5px;font-weight:800;border-radius:99px;padding:3px 8px}
.rc-pill.red{background:#fee2e2;color:#b91c1c}.rc-pill.gold{background:var(--gold-2);color:#8a5a12}.rc-pill.good{background:#dcfce7;color:#166534}.rc-pill.muted{background:var(--cream-2);color:var(--muted)}
.rc-ap{width:100%;border-collapse:collapse;font-size:12.5px}.rc-ap td,.rc-ap th{padding:8px 6px;border-bottom:1px solid var(--line);text-align:start;vertical-align:middle}
.rc-ap th{font-size:11px;color:var(--muted)}.rc-ap time{font-weight:800;font-variant-numeric:tabular-nums}
.rc-ap .btn{padding:5px 9px;font-size:11px}
.rc-s{font-size:10.5px;font-weight:800;border-radius:99px;padding:3px 8px;white-space:nowrap}
.rc-s.up{background:var(--cream-2);color:var(--muted)}.rc-s.in{background:#dbeafe;color:#1d4ed8}.rc-s.live{background:#dcfce7;color:#166534}.rc-s.done{background:#ecfdf5;color:#047857}.rc-s.late{background:var(--gold-2);color:#8a5a12}.rc-s.no{background:#fee2e2;color:#b91c1c}.rc-s.abs{background:#f3f4f6;color:#6b7280}
.rc-sug{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.rc-sug label{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px 12px;cursor:pointer;font-size:13px}
.rc-sug label.best{border-color:var(--navy);box-shadow:0 0 0 2px rgba(14,131,136,.15)}
.rc-sug small{color:var(--muted)}
.rc-flows{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rc-flow{all:unset;cursor:pointer;border-radius:16px;padding:14px 16px;border:1px solid var(--line);background:var(--card);display:flex;flex-direction:column;gap:4px}
.rc-flow.smart{background:linear-gradient(135deg,#063A3E,#0E8388);color:#fff;border-color:transparent}
.rc-flow b{font-size:14px}.rc-flow small{opacity:.8;font-size:12px}
@media (max-width:1100px){.rc-cols,.rc-flows{grid-template-columns:1fr}.rc-kpis{grid-template-columns:repeat(2,1fr)}}\`;
      document.head.appendChild(st);
    })();

    function rcContacts(){if(!Array.isArray(state.rcContacts))state.rcContacts=[];return state.rcContacts}
    function rcToday(){return localDateOf(new Date())}
    function rcTomorrow(){const d=new Date();d.setDate(d.getDate()+1);return localDateOf(d)}
    function rcNowM(){const d=new Date();return d.getHours()*60+d.getMinutes()}
    function rcIntl(ph){const d=String(ph||"").replace(/\\D/g,"");return d.startsWith("05")?"966"+d.slice(1):d.startsWith("5")?"966"+d:d}
    function rcWa(ph,text){return "https://wa.me/"+rcIntl(ph)+"?text="+encodeURIComponent(text)}
    function rcPatient(a){return state.patients.find(p=>p.name===a.patient)}
    function rcDeptOfStaff(name){const s=state.staff.find(x=>x.name===name);return s?s.department:null}
    function rcVisit(a){return (state.childVisits||[]).find(v=>v.date===a.date&&(v.aptId===a.id||v.name===a.patient))}
    function rcStatus(a){
      if(a.status==="مكتمل")return ["done","خلصت"];if(a.status==="غائب")return ["abs","غائب"];if(a.status==="ملغي")return ["abs","ملغي"];
      if(a.date!==rcToday())return a.confirmSent?["in","انرسل تأكيد"]:["up","قادم"];
      const m=sipadMin(a.time),now=rcNowM(),v=rcVisit(a),d=+a.duration||40;
      if(v&&now>=m&&now<m+d)return ["live","في الجلسة"];if(v)return ["in","وصل"];
      if(now>m+10)return ["no","ما وصل"];if(now>m)return ["late","متأخر"];return ["up","قادم"];
    }
    function rcDayApts(day){return state.appointments.filter(a=>a.date===day&&a.status!=="ملغي").sort((a,b)=>a.time.localeCompare(b.time))}

    // ---- مهامي ----
    function rcTasks(){
      const T=[];const today=rcToday();
      const no=rcDayApts(today).filter(a=>rcStatus(a)[0]==="no");
      no.slice(0,5).forEach(a=>T.push({p:3,ic:"⏰",t:\`ما وصل: \${a.patient}\`,d:\`موعده \${time(a.time)} مع \${a.clinician}\`,acts:[["وصل",\`rcArrive('\${a.id}')\`,1],["غياب + تعويض",\`rcAbsent('\${a.id}')\`]]}));
      if(no.length>5)T.push({p:3,ic:"⏰",t:\`و\${no.length-5} أطفال ثانيين ما وصلوا\`,d:"تحت في مواعيد اليوم",acts:[["اعرضهم",\`rcSet('rcApF','no')\`,1]]});
      rcContacts().filter(c=>c.status==="new").sort((a,b)=>a.at-b.at).forEach(c=>{const h=(Date.now()-c.at)/36e5;T.push({p:h>2?3:2,ic:RC_CH[c.ch][0],t:\`رد على \${c.guardian||c.phone} (\${RC_CH[c.ch][1]})\`,d:\`\${c.child?c.child+" · ":""}\${fdAgo(new Date(c.at).toISOString())}\`,acts:[["تواصل",\`rcOpen('contactAct','\${c.id}')\`,1]]})});
      rcContacts().filter(c=>c.status==="contacted"&&c.follow&&c.follow<=today).forEach(c=>T.push({p:2,ic:"↩️",t:\`تابع \${c.guardian}\`,d:\`متفقين نتواصل \${date(c.follow)}\${c.note?" · "+c.note:""}\`,acts:[["تواصل",\`rcOpen('contactAct','\${c.id}')\`,1]]}));
      (typeof fdList==="function"?fdList():[]).filter(p=>p.intake.stage==="book").forEach(p=>T.push({p:2,ic:"📅",t:\`احجز مواعيد \${p.name}\`,d:\`توجيه \${p.intake.direction&&p.intake.direction.by||"مشرف القسم"}: \${fdLinesText(p)}\`,acts:[["احجز المواعيد",\`fdOpen('book','\${p.id}')\`,1]]}));
      (state.sessionBookings||[]).filter(b=>!b.seen&&b.status!=="ملغي").forEach(b=>T.push({p:2,ic:"🌐",t:\`طلب حجز من بوابة الأسرة: \${b.patientName}\`,d:\`\${b.day||""} \${b.time||""} · \${b.specialist||""}\`,acts:[["تم الاطلاع",\`markBookingSeen('\${b.id}')\`,1]]}));
      state.appointments.filter(a=>a.status==="غائب"&&a.date>=localDateOf(new Date(Date.now()-3*864e5))&&!a.compBooked).slice(0,5).forEach(a=>T.push({p:1,ic:"🔁",t:\`احجز تعويض لـ\${a.patient}\`,d:\`غاب \${date(a.date)} \${time(a.time)} عند \${a.clinician}\`,acts:[["احجز تعويض",\`rcComp('\${a.id}')\`,1]]}));
      const tm=rcDayApts(rcTomorrow()).filter(a=>!a.confirmSent);
      if(tm.length)T.push({p:1,ic:"✅",t:\`أكّد مواعيد بكرة (\${tm.length})\`,d:"رسالة تذكير لكل أسرة بالوقت واسم الأخصائي",acts:[["أرسل التذكيرات",\`rcConfirmTomorrow()\`,1]]});
      return T.sort((a,b)=>b.p-a.p);
    }

    // ---- الشاشة ----
    function rcDeskView(){
      rcSeed();
      const T=rcTasks();const C=rcContacts();const newC=C.filter(c=>c.status==="new").length;
      const day=state.rcDay==="tomorrow"?rcTomorrow():rcToday();const A=rcDayApts(day);const todayA=rcDayApts(rcToday());
      const arrived=todayA.filter(a=>["in","live","done"].includes(rcStatus(a)[0])).length;const tm=rcDayApts(rcTomorrow());
      let h=head("الاستقبال","محطة الاستقبال","تسجيل الأسر والتواصل معها ومتابعة مواعيد الأطفال — كل شيء في مكان واحد.",\`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline" onclick="rcOpen('contactNew')">＋ تواصل جديد</button><button class="btn btn-primary" onclick="typeof rsQuickOpen==='function'?rsQuickOpen():rcOpen('book')">＋ تسجيل أسرة</button><button class="btn btn-outline" onclick="rcOpen('book')">＋ حجز موعد</button></div>\`);
      h+=\`<div class="rc-kpis">
        <button class="rc-kpi \${T.some(t=>t.p===3)?"hot":""}" onclick="document.getElementById('rc-tasks').scrollIntoView({behavior:'smooth'})"><b>\${T.length}</b><span>مهامي الحين</span><small>\${T.filter(t=>t.p===3).length} عاجلة</small></button>
        <button class="rc-kpi \${newC?"hot":""}" onclick="document.getElementById('rc-contacts').scrollIntoView({behavior:'smooth'})"><b>\${newC}</b><span>تواصل جديد</span><small>واتساب وسوشيال واتصال</small></button>
        <button class="rc-kpi" onclick="rcSet('rcDay','today')"><b>\${todayA.length}</b><span>مواعيد اليوم</span><small>وصل \${arrived}</small></button>
        <button class="rc-kpi" onclick="rcSet('rcDay','tomorrow')"><b>\${tm.length}</b><span>مواعيد بكرة</span><small>\${tm.filter(a=>!a.confirmSent).length} بانتظار تأكيد</small></button></div>\`;
      h+=\`<section class="rc-sec" id="rc-tasks"><h2>📋 مهامي الحين</h2><p>مرتبة بالأولوية — الأحمر أول.</p>\${T.length?T.map(t=>\`<div class="rc-task p\${t.p}"><span class="ic">\${t.ic}</span><div class="tx"><b>\${esc(t.t)}</b><small>\${esc(t.d)}</small></div><div class="acts">\${t.acts.map(([l,js,pri])=>\`<button class="btn \${pri?"btn-primary":"btn-outline"}" onclick="\${js}">\${esc(l)}</button>\`).join("")}</div></div>\`).join(""):\`<div class="fd-empty">✓ ما عندك مهام الحين</div>\`}</section>\`;
      // التواصل
      const f=state.rcChF||"open";const CL=C.filter(c=>f==="all"?true:f==="open"?["new","contacted"].includes(c.status):c.ch===f).sort((a,b)=>b.at-a.at);
      const chips=[["open","المفتوحة"],["all","الكل"],...Object.entries(RC_CH).filter(([k])=>C.some(c=>c.ch===k)).map(([k,v])=>[k,v[0]+" "+v[1]])];
      const contacts=\`<section class="rc-sec" id="rc-contacts"><h2>💬 التواصل الجديد</h2><p>الحالات اللي تواصلت من الواتساب والسوشيال والاتصال.</p>
        <div class="rc-chips">\${chips.map(([k,l])=>\`<button class="\${f===k?"on":""}" onclick="rcSet('rcChF','\${k}')">\${esc(l)}</button>\`).join("")}</div>
        \${CL.map(rcContactCard).join("")||\`<div class="fd-empty">ما فيه تواصل هنا</div>\`}</section>\`;
      // المواعيد
      const af=state.rcApF||"open";const AL=A.filter(a=>{const s=rcStatus(a)[0];return af==="all"?true:af==="open"?!["done","abs"].includes(s):af==="no"?["no","late"].includes(s):s===af});
      const apts=\`<section class="rc-sec" id="rc-apts"><h2>🗓️ مواعيد \${state.rcDay==="tomorrow"?"بكرة":"اليوم"} <small style="font-size:12px;color:var(--muted);font-weight:600">\${esc(date(day))}</small></h2><p>بالوقت وعند مين — سجّل الوصول أو الغياب من هنا.</p>
        <div class="rc-chips">\${[["today","اليوم"],["tomorrow","بكرة"]].map(([k,l])=>\`<button class="\${(state.rcDay||"today")===k?"on":""}" onclick="rcSet('rcDay','\${k}')">\${l}</button>\`).join("")}<span style="width:12px"></span>\${[["open","الجاية والحالية"],["no","متأخر وما وصل"],["done","خلصت"],["all","الكل"]].map(([k,l])=>\`<button class="\${af===k?"on":""}" onclick="rcSet('rcApF','\${k}')">\${l}</button>\`).join("")}</div>
        <div class="table-wrap"><table class="rc-ap"><thead><tr><th>الوقت</th><th>الطفل</th><th>الأخصائي</th><th>القسم / الخدمة</th><th>الحالة</th><th></th></tr></thead><tbody>
        \${AL.slice(0,state.rcApAll?999:25).map(a=>{const [k,l]=rcStatus(a);const dep=rcDeptOfStaff(a.clinician);return \`<tr><td><time>\${esc(time(a.time))}</time></td><td><b>\${esc(a.patient)}</b></td><td>\${esc(a.clinician||"—")}</td><td>\${esc(dep?deptName(dep):"")}<br><small class="muted">\${esc(a.service||"")} · \${esc(a.room||"")}</small></td><td><span class="rc-s \${k}">\${l}</span></td>
          <td style="white-space:nowrap">\${day===rcToday()&&["up","late","no"].includes(k)?\`<button class="btn btn-primary" onclick="rcArrive('\${a.id}')">وصل</button> \`:""}\${day===rcToday()&&["late","no"].includes(k)?\`<button class="btn btn-outline" onclick="rcAbsent('\${a.id}')">غياب</button>\`:""}\${day!==rcToday()&&!a.confirmSent?\`<button class="btn btn-outline" onclick="rcConfirmOne('\${a.id}')">تأكيد</button>\`:""}</td></tr>\`}).join("")||\`<tr><td colspan="6" class="fd-empty">ما فيه مواعيد هنا</td></tr>\`}
        </tbody></table></div>\${AL.length>25&&!state.rcApAll?\`<button class="btn btn-outline" style="margin-top:8px;width:100%" onclick="rcSet('rcApAll',1)">اعرض الكل (\${AL.length})</button>\`:""}</section>\`;
      h+=\`<div class="rc-cols">\${contacts}\${apts}</div>\`;
      h+=\`<section class="rc-sec"><h2>👤 استقبال الأسرة</h2><p>سجّلي بيانات الأسرة أو أرسلي لها رابط دراسة الحالة، وتابعي الملف والموعد من هنا.</p><button class="btn btn-primary" onclick="typeof rsQuickOpen==='function'?rsQuickOpen():setView('frontDesk')">تسجيل سريع وحجز تقييم</button></section>\`;
      return h+rcPopHtml();
    }
    function rcContactCard(c){
      const [st,cls]=RC_ST[c.status]||["جديد","red"];const p=c.pid&&state.patients.find(x=>x.id===c.pid);
      const platform=RC_PLATFORM[c.ch]||["•","منصة أخرى","#64748b","#f1f5f9"];
      const [mark,label,color,bg]=platform;
      const open=["new","contacted"].includes(c.status);
      return \`<article class="rc-ct" style="--platform-color:\${color};--platform-bg:\${bg};--bubble-bg:\${bg}"><div class="rc-ct-h"><div><b>\${esc(c.guardian||"—")}\${c.child?\` · \${esc(c.child)}\${c.age?" ("+esc(c.age)+")":""}\`:""}</b><div class="rc-ct-meta"><small>\${esc(c.phone||"")} · \${fdAgo(new Date(c.at).toISOString())}</small><span class="rc-ct-platform"><span class="mark">\${esc(mark)}</span>\${esc(label)}</span></div></div><span class="rc-pill \${cls}">\${st}</span></div>
        \${c.msg?\`<div class="rc-ct-chat"><div class="msg">\${esc(c.msg)}</div></div>\`:""}\${c.note?\`<small class="muted">📝 \${esc(c.note)}\${c.follow?" · متابعة "+esc(date(c.follow)):""}</small>\`:""}
        <div class="acts">\${open?\`<button class="btn btn-primary" onclick="rsQuickOpen('\${c.id}')">تسجيل وحجز تقييم</button><button class="btn btn-outline" onclick="rcOpen('contactAct','\${c.id}')">متابعة</button><a class="btn btn-outline" target="_blank" rel="noopener" href="\${esc(rcWa(c.phone,\`السلام عليكم \${c.guardian||""}، معك استقبال \${state.center.name} 🌿\`))}" onclick="rcTouched('\${c.id}')">واتساب</a>\`:""}\${p?\`<button class="btn btn-outline" onclick="openPatient('\${p.id}')">فتح الملف</button>\`:""}</div></article>\`;
    }

    // ---- النوافذ ----
    function rcOpen(k,id){state.rcOpen={k,id:id||null};if(k==="book")state.rcBook=Object.assign({pid:"",dept:"",type:0,from:rcToday(),pref:"any",clin:"",pick:0},id?{pid:id}:{});render()}
    function rcClose(){state.rcOpen=null;render()}
    function rcSet(k,v){state[k]=v;if(k==="rcDay")state.rcApAll=0;render();if(k==="rcApF"||k==="rcDay")setTimeout(()=>{const e=document.getElementById("rc-apts");if(e)e.scrollIntoView({behavior:"smooth"})},30)}
    function rcPopHtml(){
      const o=state.rcOpen;if(!o)return "";
      const wrap=b=>\`<div class="pl-scrim" onclick="if(event.target===this)rcClose()"><div class="pl-pop fd-pop">\${b}</div></div>\`;
      if(o.k==="contactNew")return wrap(\`<h3>تواصل جديد</h3><p class="muted">سجّل أي أسرة تواصلت — واتساب أو سوشيال أو اتصال.</p><form onsubmit="rcContactSave(event)"><div class="form-grid">
        <div class="field"><label>القناة</label><select class="select" name="ch">\${Object.entries(RC_CH).map(([k,v])=>\`<option value="\${k}">\${v[0]} \${v[1]}</option>\`).join("")}</select></div>
        <div class="field"><label>اسم ولي الأمر</label><input class="input" name="guardian" required></div><div class="field"><label>الجوال</label><input class="input" name="phone" required placeholder="05xxxxxxxx"></div>
        <div class="field"><label>اسم الطفل</label><input class="input" name="child"></div><div class="field"><label>العمر</label><input class="input" name="age"></div>
        <div class="field" style="grid-column:1/-1"><label>وش يبون؟ (نص الرسالة)</label><textarea class="textarea" name="msg" rows="2"></textarea></div></div>
        <div class="fd-acts"><button type="button" class="btn btn-outline" onclick="rcClose()">إلغاء</button><button class="btn btn-primary">احفظ</button></div></form>\`);
      if(o.k==="contactAct"){const c=rcContacts().find(x=>x.id===o.id);if(!c)return "";
        return wrap(\`<h3>\${RC_CH[c.ch][0]} \${esc(c.guardian||"")} — \${esc(RC_CH[c.ch][1])}</h3><p class="muted">\${esc(c.phone)} · \${fdAgo(new Date(c.at).toISOString())}</p>\${c.msg?\`<div class="rc-ct"><div class="msg">\${esc(c.msg)}</div></div>\`:""}
          <form onsubmit="rcContactAct(event,'\${c.id}')"><div class="form-grid"><div class="field"><label>اسم الطفل</label><input class="input" name="child" value="\${esc(c.child||"")}"></div><div class="field"><label>العمر</label><input class="input" name="age" value="\${esc(c.age||"")}"></div>
          <div class="field" style="grid-column:1/-1"><label>ملاحظة</label><input class="input" name="note" value="\${esc(c.note||"")}"></div></div>
          <div style="margin-top:12px;font-weight:700">الخطوة التالية</div><div class="rc-sug">
          <label class="best"><input type="radio" name="act" value="register" checked><span><b>👤 تسجيل الأسرة</b><br><small>يفتح ملفًا ويتحوّل للمشرف العام لاستكمال دراسة الحالة</small></span></label>
          <label style="display:block"><input type="checkbox" name="sendLink" value="1"> أرسل للأسرة رابط دراسة الحالة على واتساب</label>
          <label><input type="radio" name="act" value="follow"><span><b>↩️ تواصلت — أتابع معهم لاحقًا</b><br><small>تاريخ المتابعة: <input type="date" name="follow" value="\${rcTomorrow()}" onclick="event.stopPropagation()"></small></span></label>
          <label><input type="radio" name="act" value="lost"><span><b>✕ غير مهتم</b></span></label></div>
          <div class="fd-acts"><button type="button" class="btn btn-outline" onclick="rcClose()">إلغاء</button><button class="btn btn-primary">نفّذ</button></div></form>\`)}
      if(o.k==="book")return wrap(rcBookHtml());
      return "";
    }
    function rcContactSave(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());rcContacts().unshift({id:"rc-"+Date.now(),at:Date.now(),status:"new",...f});audit("تسجيل تواصل جديد",\`\${f.guardian} (\${RC_CH[f.ch][1]})\`);state.rcOpen=null;persist();notify("انحفظ التواصل");render()}
    function rcTouched(id){const c=rcContacts().find(x=>x.id===id);if(c&&c.status==="new"){c.status="contacted";persist();setTimeout(render,300)}}
    function rcContactAct(e,id){
      e.preventDefault();const c=rcContacts().find(x=>x.id===id);if(!c)return;const f=Object.fromEntries(new FormData(e.target).entries());
      Object.assign(c,{child:f.child||c.child,age:f.age||c.age,note:f.note||c.note});
      if(f.act==="register"){if(!c.child)return notify("اكتب اسم الطفل قبل التسجيل");
        const p=fdCreate({child:c.child,age:c.age,guardian:c.guardian,phone:c.phone,reason:c.msg||c.note||"",ref:RC_CH[c.ch][1],source:"normal"});
        Object.assign(c,{status:"registered",pid:p.id});audit("تواصل ← استقبال",p.name);
        if(f.sendLink){const link=location.origin+location.pathname.replace(/\\/app.*$/,"")+"#case";window.open(rcWa(c.phone,\`أهلًا \${c.guardian||""} 🌿 هذا رابط دراسة الحالة الإلكترونية في \${state.center.name}:\\n\${link}\`),"_blank")}
        notify(\`انفتح ملف \${p.name.split(" ")[0]} وانحوّل للمشرف العام\`)}
      else if(f.act==="follow"){c.status="contacted";c.follow=f.follow||rcTomorrow();notify("تمام — بتطلع لك مهمة متابعة "+date(c.follow))}
      else{c.status="lost";notify("انقفل التواصل")}
      state.rcOpen=null;persist();render();
    }

    // ---- المواعيد ----
    function rcArrive(id){
      const a=state.appointments.find(x=>x.id===id);if(!a)return;const p=rcPatient(a);const now=new Date();
      state.childVisits=state.childVisits||[];if(!rcVisit(a))state.childVisits.unshift({id:"cv-"+Date.now(),patientId:p?p.id:null,name:a.patient,date:a.date,inAt:now.toISOString(),aptId:a.id,by:"الاستقبال"});
      a.arrivedAt=now.toISOString();audit(\`وصول طفل · موعد \${time(a.time)} مع \${a.clinician}\`,a.patient);
      const s=state.staff.find(x=>x.name===a.clinician);if(s&&typeof cmSendTo==="function")cmSendTo("staff:"+s.id,\`\${a.patient} وصل المركز الساعة \${localTimeOf(now)} · جلستك \${time(a.time)} · \${a.room||""}\`);
      persist();notify(\`انسجل وصول \${a.patient.split(" ")[0]} وتبلّغ \${a.clinician}\`);render();
    }
    function rcAbsent(id){scAbsent(id)} // مهمة «احجز تعويض» تطلع تلقائيًا في مهامي
    function rcComp(id){const a=state.appointments.find(x=>x.id===id);if(!a)return;const p=rcPatient(a);const dep=rcDeptOfStaff(a.clinician);
      state.rcOpen={k:"book"};state.rcBook={pid:p?p.id:"",dept:dep||"",type:2,from:rcToday(),pref:"any",clin:"",pick:0,compOf:id};render()}
    function rcConfirmOne(id,quiet){const a=state.appointments.find(x=>x.id===id);if(!a)return;const p=rcPatient(a);
      if(p&&typeof cmSendTo==="function")cmSendTo("fam:"+p.id,\`تذكير 🌿 موعد \${a.patient.split(" ")[0]} \${date(a.date)} الساعة \${time(a.time)} مع \${a.clinician}\${a.room?" · "+a.room:""}. لو فيه أي تغيير ردوا علينا.\`);
      a.confirmSent=true;if(!quiet){persist();notify("انرسل التذكير للأسرة");render()}}
    function rcConfirmTomorrow(){const L=rcDayApts(rcTomorrow()).filter(a=>!a.confirmSent);L.forEach(a=>rcConfirmOne(a.id,1));audit("تذكير مواعيد بكرة",\`\${L.length} موعد\`);persist();notify(\`انرسل \${L.length} تذكير لأسر مواعيد بكرة\`);render()}

    // ---- حجز موعد: الوقت والأخصائي تلقائي ----
    function rcPatientDept(p){if(!p)return "";const l=(p.intake&&p.intake.direction&&p.intake.direction.lines)||(p.smart&&p.smart.lines);if(l&&l[0])return l[0].dept;
      const a=state.appointments.filter(x=>x.patient===p.name).map(x=>rcDeptOfStaff(x.clinician)).filter(Boolean);if(a.length)return a[a.length-1];
      const d=state.departments.find(x=>(p.program||"").includes(x.name.replace(/^قسم\\s*/,"")));return d?d.id:(state.departments[0]||{}).id}
    function rcSuggest(b){
      const p=state.patients.find(x=>x.id===b.pid);if(!p||!b.dept)return [];
      const dur=RC_TYPES[b.type][1];const pool=(b.clin?[personById(b.clin)]:fdClinicians(b.dept).sort((x,y)=>fdLoad(x.name)-fdLoad(y.name))).filter(Boolean);
      const out=[];const days=fdWorkdays(b.from<rcToday()?rcToday():b.from,10);const nowM=rcNowM()+15;
      for(const d of days){for(const t of FD_GRID){if(b.pref==="am"&&t>="12:00"||b.pref==="pm"&&t<"12:00")continue;if(d===rcToday()&&sipadMin(t)<nowM)continue;
        for(const s of pool){if(out.some(o=>o.clin.id===s.id&&o.date===d))continue;if(fdFree(s,p.name,d,t,dur,[])){out.push({clin:s,date:d,time:t,dur});break}}
        if(out.length>=4)return out}}
      return out;
    }
    function rcBookSet(k,v){const b=state.rcBook;b[k]=k==="type"||k==="pick"?+v:v;if(k==="pid"){const p=state.patients.find(x=>x.id===v);b.dept=rcPatientDept(p)}if(k!=="pick")b.pick=0;render()}
    function rcBookHtml(){
      const b=state.rcBook;const P=state.patients.filter(p=>!p.archived).sort((x,y)=>x.name.localeCompare(y.name,"ar"));
      if(b.pid&&!b.dept)b.dept=rcPatientDept(state.patients.find(x=>x.id===b.pid));
      const S=rcSuggest(b);const sel=(k,opts,v)=>\`<select class="select" onchange="rcBookSet('\${k}',this.value)">\${opts.map(([val,l])=>\`<option value="\${val}" \${String(v)===String(val)?"selected":""}>\${esc(l)}</option>\`).join("")}</select>\`;
      return \`<h3>\${b.compOf?"حجز جلسة تعويضية":"حجز موعد"}</h3><p class="muted">اختر الطفل والقسم — الوقت والأخصائي يتحددون تلقائيًا (أقرب وقت فاضي عند الأقل ضغط)، وتقدر تغيّر.</p>
        <div class="form-grid"><div class="field" style="grid-column:1/-1"><label>الطفل</label>\${sel("pid",[["","اختر الطفل"],...P.map(p=>[p.id,p.name+(p.file?" · "+p.file:"")])],b.pid)}</div>
        <div class="field"><label>القسم</label>\${sel("dept",state.departments.map(d=>[d.id,d.name]),b.dept)}</div>
        <div class="field"><label>نوع الموعد</label>\${sel("type",RC_TYPES.map((t,i)=>[i,\`\${t[0]} · \${t[1]} د\`]),b.type)}</div>
        <div class="field"><label>من تاريخ</label><input class="input" type="date" value="\${b.from}" onchange="rcBookSet('from',this.value)"></div>
        <div class="field"><label>الوقت المفضل</label>\${sel("pref",[["any","أي وقت"],["am","صباحي"],["pm","بعد الظهر"]],b.pref)}</div>
        <div class="field" style="grid-column:1/-1"><label>الأخصائي</label>\${sel("clin",[["","تلقائي — الأقل ضغط"],...(b.dept?fdClinicians(b.dept):[]).map(s=>[s.id,\`\${s.name} (\${fdLoad(s.name)} موعد قادم)\`])],b.clin)}</div></div>
        \${b.pid?\`<div style="margin-top:12px;font-weight:700">أقرب المواعيد المتاحة</div><div class="rc-sug">\${S.map((s,i)=>\`<label class="\${i===b.pick?"best":""}"><input type="radio" name="rcpick" \${i===b.pick?"checked":""} onchange="rcBookSet('pick',\${i})"><span><b>\${esc(date(s.date))} · \${esc(time(s.time))}</b> مع <b>\${esc(s.clin.name)}</b><br><small>\${esc(deptName(b.dept))} · \${s.dur} دقيقة\${i===0?" · ✨ المقترح":""}</small></span></label>\`).join("")||\`<div class="fd-empty">ما فيه وقت فاضي خلال أسبوعين — غيّر القسم أو الأخصائي</div>\`}</div>\`:""}
        <div class="fd-acts"><button type="button" class="btn btn-outline" onclick="rcClose()">إلغاء</button><button class="btn btn-primary" \${S.length?"":"disabled"} onclick="rcBookConfirm()">احجز وبلّغ الأسرة والأخصائي</button></div>\`;
    }
    function rcBookConfirm(){
      const b=state.rcBook;const S=rcSuggest(b);const s=S[b.pick]||S[0];const p=state.patients.find(x=>x.id===b.pid);if(!s||!p)return;
      const t=RC_TYPES[b.type][0];
      const a={id:"apt-"+Date.now()+"-rc",date:s.date,time:s.time,duration:s.dur,patient:p.name,service:\`\${deptName(b.dept)} — \${t}\`,clinician:s.clin.name,room:t==="تقييم أولي"?"غرفة التقييم":"غرفة "+deptName(b.dept).replace(/^قسم\\s*/,""),status:"مجدول",newForStaff:true,bookedBy:"الاستقبال"};
      state.appointments.push(a);if(b.compOf){const o=state.appointments.find(x=>x.id===b.compOf);if(o)o.compBooked=true}
      if(typeof cmSendTo==="function"){cmSendTo("fam:"+p.id,\`انحجز موعد \${p.name.split(" ")[0]} 🌿 \${date(a.date)} الساعة \${time(a.time)} مع \${a.clinician} (\${t}).\`);cmSendTo("staff:"+s.clin.id,\`📅 موعد جديد في جدولك: \${p.name} \${date(a.date)} \${time(a.time)} — \${t}.\`)}
      if(!p.next||p.next<a.date)p.next=a.date+"T"+a.time;
      audit("حجز موعد من مكتب الاستقبال",\`\${p.name} · \${date(a.date)} \${time(a.time)} · \${a.clinician}\`);
      state.rcOpen=null;state.rcBook=null;persist();notify(\`انحجز \${date(a.date)} \${time(a.time)} مع \${a.clinician}\`);render();
    }

    // ---- بيانات تجريبية للتواصل ----
    function rcSeed(){
      if(state.rcSeeded)return;state.rcSeeded=true;const m=x=>Date.now()-x*60000;
      rcContacts().push(
        {id:"rc-s1",ch:"whatsapp",at:m(25),status:"new",guardian:"أم فيصل",phone:"0551239876",child:"فيصل",age:"3 سنوات",msg:"السلام عليكم، ولدي عمره 3 سنوات وما يتكلم إلا كم كلمة، عندكم تقييم نطق؟ وكم السعر؟"},
        {id:"rc-s2",ch:"instagram",at:m(140),status:"new",guardian:"نورة العتيبي",phone:"0539981122",child:"",age:"",msg:"شفت إعلانكم عن برنامج ABA، بنتي عندها نوبات غضب كثير، ممكن تفاصيل؟"},
        {id:"rc-s3",ch:"call",at:m(55),status:"new",guardian:"خالد الحربي",phone:"0507712345",child:"سلطان",age:"6 سنوات",msg:"المدرسة طلبت تقييم لصعوبات التعلم والتركيز"},
        {id:"rc-s4",ch:"snapchat",at:m(300),status:"new",guardian:"أبو ريان",phone:"0566610091",child:"ريان",age:"4 سنوات",msg:"عندكم علاج وظيفي؟ ولدي ما يمسك القلم زين"},
        {id:"rc-s5",ch:"tiktok",at:m(900),status:"contacted",guardian:"منيرة السبيعي",phone:"0545520014",child:"جود",age:"5 سنوات",msg:"أبي أعرف عن الدمج المدرسي",note:"تبي تشاور زوجها",follow:rcToday()},
        {id:"rc-s6",ch:"whatsapp",at:m(1500),status:"lost",guardian:"سارا القحطاني",phone:"0558830027",child:"",age:"",msg:"كم سعر الجلسة؟",note:"السعر ما ناسبها"}
      );persist();
    }

    // ---- ربط الشاشة ----
    (function rcWire(){
      const hub=HUBS.find(h=>h.k==="intake");if(hub&&!hub.views.some(v=>v[0]==="rcDesk")){hub.views.unshift(["rcDesk","مكتب الاستقبال"]);const g=ORG_GROUPS.find(x=>x.k==="intake");if(g)g.keys=hub.views.map(v=>v[0])}
      if(!navItems.some(n=>n[0]==="rcDesk")){const i=navItems.findIndex(n=>n[0]==="intakeHome");navItems.splice(i>=0?i:1,0,["rcDesk","bell"])}
      ["reception","management"].forEach(r=>{const nav=roles[r].nav;if(!nav.includes("rcDesk"))nav.unshift("rcDesk")});
    })();
    const _rcRoleHome=roleHome;
    roleHome=function(){return state.view==="rcDesk"&&roles[state.role].nav.includes("rcDesk")?rcDeskView():_rcRoleHome.apply(this,arguments)};
    const _rcHubGo=hubGo;
    hubGo=function(k){if(k==="intake"&&state.role==="reception")return setView("rcDesk");return _rcHubGo.apply(this,arguments)};
    const _rcHubBar=hubBar;
    hubBar=function(){if(state.view==="rcDesk")return "";const h=_rcHubBar.apply(this,arguments);
      return state.role==="reception"?h.split(\`onclick="setView('intakeHome')">→ الاستقبال<\`).join(\`onclick="setView('rcDesk')">→ مكتب الاستقبال<\`):h};
    const _rcOrgBadge=orgBadge;
    orgBadge=function(k){if(k==="rcDesk"){const n=rcTasks().filter(t=>t.p>=2).length;return n?\`<em class="og-b red">\${n}</em>\`:""}return _rcOrgBadge.apply(this,arguments)};
    Object.assign(window,{rcDeskView,rcOpen,rcClose,rcSet,rcContactSave,rcContactAct,rcTouched,rcArrive,rcAbsent,rcComp,rcConfirmOne,rcConfirmTomorrow,rcBookSet,rcBookConfirm,roleHome,hubGo,hubBar,orgBadge});
    if(state.view==="rcDesk")render();
`;export{t as default};
//# sourceMappingURL=22-reception-desk-g25uQdYp.js.map
