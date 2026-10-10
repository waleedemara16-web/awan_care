"use strict";
// أوان — الجزء 8 من 16: 08-depts-patients-comm
// كل ملفات js/ دي بتشتغل كأنها ملف واحد بالترتيب — ما تغيّرش ترتيبها في index.html
    // =================== جدول القسم: المشرف يرتب تايم لاين كل آيبادات قسمه بالسحب ===================
    const PL_SNAP=5;let plUndo=[];let plDrag=null;
    function plDept(){const me=getCurrentPerson();return state.planDept||(me&&me.department)||"speech"}
    function plDay(){return state.planDay||localDateOf(new Date())}
    function plStaff(){const d=plDept();return state.staff.filter(s=>(s.clinical||s.roleCategory==="staff")&&s.department===d)}
    function plRange(staff){let a=Infinity,b=-Infinity;staff.forEach(s=>{const sh=sipadShift(s);if(sh){a=Math.min(a,sh[0]);b=Math.max(b,sh[1])}});
      if(!isFinite(a)){a=480;b=1020}a=Math.floor(Math.min(a,480)/60)*60;b=Math.ceil(Math.max(b,a+360)/60)*60;return [a,b]}
    function plApts(s,day){return state.appointments.filter(a=>a.clinician===s.name&&a.date===day&&a.status!=="ملغي")}
    function plBlocks(s,day){return (state.timeBlocks||[]).filter(b=>b.staffId===s.id&&b.date===day)}
    function plSnap(){plUndo.push(JSON.stringify({a:state.appointments,b:state.timeBlocks||[]}));if(plUndo.length>30)plUndo.shift()}
    function plUndoLast(){const x=plUndo.pop();if(!x){notify("مفيش حاجة ترجعها");return}const o=JSON.parse(x);state.appointments=o.a;state.timeBlocks=o.b;audit("تراجع عن تعديل في جدول القسم","");persist();render();notify("رجعنا خطوة")}
    function plConflict(s,day,from,dur,skipId){return plApts(s,day).some(a=>a.id!==skipId&&(()=>{const f=sipadMin(a.time),t=f+(+a.duration||SIPAD_SLOT);return from<t&&from+dur>f})())}
    function plNeedy(){const today=localDateOf(new Date());return state.patients.filter(p=>!p.archived&&p.status!=="مؤرشف").filter(p=>!state.appointments.some(a=>a.patient===p.name&&a.status!=="ملغي"&&a.status!=="مكتمل"&&a.date>=today))}
    function deptPlanView(){ensureDevices();const staff=plStaff();const day=plDay();const [a,b]=plRange(staff);const span=b-a;const today=localDateOf(new Date());
      const pos=m=>((m-a)/span*100);const now=new Date();const nowM=now.getHours()*60+now.getMinutes();
      const depts=(state.departments||[]);const dn=(depts.find(x=>x.id===plDept())||{}).name||plDept();
      const shift=d=>{const t=new Date(day+"T12:00");t.setDate(t.getDate()+d);return localDateOf(t)};
      const hours=[];for(let m=a;m<=b;m+=60)hours.push(m);
      let h=`<div class="pl-room" id="pl-room">`+head("إشراف القسم","جدول القسم",`اسحب أي جلسة لوقت تاني أو لأخصائي تاني، اضغط على مكان فاضي عشان تضيف، واسحب طفل من «محتاجين مواعيد» على صف الأخصائي. أي تعديل بيوصل لآيباده في ساعتها.`,
        `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline" onclick="plUndoLast()" ${plUndo.length?"":"disabled"}>↶ تراجع</button><button class="btn btn-outline" onclick="plPopOpen({kind:'copy'})">نسخ يوم تاني</button><button class="btn btn-primary" onclick="setView('ipads')">${ic("tablet",14)} آيبادات الفريق</button></div>`);
      h+=`<div class="pl-bar"><div class="pl-days"><button class="btn btn-outline" onclick="plSetDay('${shift(-1)}')" aria-label="اليوم اللي قبله">›</button><input class="input" type="date" value="${day}" onchange="plSetDay(this.value)"><button class="btn btn-outline" onclick="plSetDay('${shift(1)}')" aria-label="اليوم اللي بعده">‹</button>${day!==today?`<button class="btn btn-outline" onclick="plSetDay('${today}')">النهارده</button>`:`<span class="pill pill-good">النهارده</span>`}</div>
        ${state.role==="management"?`<select class="select pl-dept" onchange="plSetDept(this.value)">${depts.map(x=>`<option value="${x.id}" ${x.id===plDept()?"selected":""}>${esc(x.name)}</option>`).join("")}</select>`:`<b class="pl-dname">${esc(dn)}</b>`}
        <div class="pl-legend"><span class="lg s">مجدولة</span><span class="lg r">شغالة دلوقتي</span><span class="lg l">عدّى وقتها</span><span class="lg d">خلصت</span><span class="lg b">فترة ثابتة</span></div></div>`;
      const noDev=staff.filter(s=>!(state.devices||[]).some(d=>d.mode==="personal"&&d.staffId===s.id));
      if(staff.length<3||noDev.length)h+=`<div class="pl-setup">${staff.length<3?`<span>القسم فيه ${staff.length} ${staff.length===1?"أخصائي":"أخصائيين"} بس.</span><button class="btn btn-outline" onclick="plDemoStaff()">＋ أضف 4 أخصائيين تجريبيين بآيباداتهم</button>`:""}${noDev.length?`<span>${noDev.length} أخصائي من غير آيباد متسجل.</span><button class="btn btn-outline" onclick="plLinkAll()">سجّل آيباد لكل واحد</button>`:""}</div>`;
      h+=`<div class="pl-wrap"><div class="pl-board" id="pl-board" style="--span:${span}">
        <div class="pl-axis"><div class="pl-lab"></div><div class="pl-track">${hours.map(m=>`<span style="right:${pos(m)}%">${sipadHM(m)}</span>`).join("")}</div></div>`;
      staff.forEach(s=>{const sh=sipadShift(s)||[a,b];const dv=(state.devices||[]).find(d=>d.mode==="personal"&&d.staffId===s.id);const st=dv?devStatus(dv):null;
        const apts=plApts(s,day);const blocks=plBlocks(s,day);const lb=state.liveBoard&&state.liveBoard[s.id];const running=lb&&!lb.locked&&day===today?lb:null;
        h+=`<div class="pl-row" data-staff="${s.id}"><div class="pl-lab" onclick="plPopOpen({kind:'lane',staffId:'${s.id}'})" role="button" tabindex="0"><span class="pl-av">${esc(s.name.replace(/^(أ\.|د\.)\s*/,"").charAt(0))}<i class="st-${st?st.k:"none"}"></i></span><div><b>${esc(s.name)}</b><small>${apts.length} جلسات · ${sipadHM(sh[0])}–${sipadHM(sh[1])}${s.demo?" · تجريبي":""}</small><small class="pl-dev">${dv?esc(dv.name)+" · "+esc(st.t):"من غير آيباد"}</small></div></div>
          <div class="pl-track pl-lane" data-staff="${s.id}">${hours.map(m=>`<i class="pl-hr" style="right:${pos(m)}%"></i>`).join("")}
            ${sh[0]>a?`<div class="pl-off" style="right:0;width:${pos(sh[0])}%"></div>`:""}${sh[1]<b?`<div class="pl-off" style="right:${pos(sh[1])}%;left:0"></div>`:""}
            ${blocks.map(x=>{const f=sipadMin(x.from),t=sipadMin(x.to);return `<div class="pl-blk blk" data-block="${x.id}" data-from="${f}" data-dur="${t-f}" style="right:${pos(f)}%;width:${(t-f)/span*100}%"><b>${esc(x.label)}</b><small>${x.from}–${x.to}</small><span class="pl-rsz"></span></div>`}).join("")}
            ${apts.map(x=>{const f=sipadMin(x.time),d=+x.duration||SIPAD_SLOT;const done=x.status==="مكتمل";const run=running&&running.patient===x.patient;const late=!done&&!run&&day===today&&f+d<nowM;
              return `<div class="pl-blk ${done?"done":run?"run":late?"late":"ses"}" data-apt="${x.id}" data-from="${f}" data-dur="${d}" style="right:${pos(f)}%;width:${d/span*100}%" title="${esc(x.patient)} · ${x.time}"><b>${esc(x.patient.split(" ").slice(0,2).join(" "))}</b><small>${x.time} · ${d}د${x.room&&x.room!=="—"?" · "+esc(x.room):""}</small>${run?`<em class="pl-live">${running.trial}/${DTT_BLOCK} · ${running.pct==null?"—":running.pct+"%"}</em>`:""}${done?"":`<span class="pl-rsz"></span>`}</div>`}).join("")}
            ${day===today&&nowM>a&&nowM<b?`<div class="pl-now" style="right:${pos(nowM)}%"><span>${sipadHM(nowM)}</span></div>`:""}</div></div>`});
      if(!staff.length)h+=`<div class="empty">مفيش أخصائيين في القسم ده.</div>`;
      h+=`</div></div>`;
      const needy=plNeedy();
      h+=`<section class="card pl-needy"><div class="card-head"><h2>محتاجين مواعيد <span class="muted">(${needy.length})</span></h2><span class="muted">اسحب الطفل على صف الأخصائي في الوقت اللي عاوزه</span></div><div class="pl-chips">${needy.slice(0,40).map(p=>`<span class="pl-chip" data-patient="${esc(p.name)}">${esc(p.name.split(" ").slice(0,2).join(" "))}<small>${esc((p.program||"").split("·")[0])}</small></span>`).join("")||`<span class="muted">كل الأطفال عندهم مواعيد جاية.</span>`}</div></section>`;
      if(state.plPop)h+=plPopHtml();
      return h+`</div>`;
    }
    function plSetDay(d){if(!d)return;state.planDay=d;state.plPop=null;render()}
    function plSetDept(d){state.planDept=d;state.plPop=null;render()}
    // ---- السحب واللمس ----
    function plMinAt(track,x){const r=track.getBoundingClientRect();const staff=plStaff();const [a,b]=plRange(staff);const m=a+(r.right-x)/r.width*(b-a);return Math.round(m/PL_SNAP)*PL_SNAP}
    document.addEventListener("pointerdown",e=>{if(state.view!=="deptPlan")return;const blk=e.target.closest(".pl-blk");const chip=e.target.closest(".pl-chip");const lane=e.target.closest(".pl-lane");
      if(chip){e.preventDefault();const g=chip.cloneNode(true);g.classList.add("pl-ghost");document.body.appendChild(g);plDrag={type:"chip",patient:chip.dataset.patient,g,x0:e.clientX,y0:e.clientY,moved:false};plGhost(e);return}
      if(blk){if(blk.classList.contains("done")){plDrag={type:"tap",el:blk,x0:e.clientX,y0:e.clientY};return}
        e.preventDefault();blk.setPointerCapture&&blk.setPointerCapture(e.pointerId);const lane0=blk.closest(".pl-lane");
        plDrag={type:e.target.classList.contains("pl-rsz")?"resize":"move",el:blk,lane0,x0:e.clientX,y0:e.clientY,from:+blk.dataset.from,dur:+blk.dataset.dur,moved:false,w0:lane0.getBoundingClientRect().width};return}
      if(lane){plDrag={type:"empty",lane,x0:e.clientX,y0:e.clientY}}});
    function plGhost(e){if(plDrag&&plDrag.g){plDrag.g.style.left=(e.clientX+12)+"px";plDrag.g.style.top=(e.clientY+12)+"px"}}
    document.addEventListener("pointermove",e=>{if(!plDrag||state.view!=="deptPlan")return;const dx=e.clientX-plDrag.x0,dy=e.clientY-plDrag.y0;if(Math.abs(dx)+Math.abs(dy)>5)plDrag.moved=true;
      document.querySelectorAll(".pl-lane.hover").forEach(l=>l.classList.remove("hover"));
      if(plDrag.type==="chip"){plGhost(e);const ln=document.elementFromPoint(e.clientX,e.clientY);const lane=ln&&ln.closest(".pl-lane");if(lane)lane.classList.add("hover");return}
      if(plDrag.type==="move"&&plDrag.moved){const el=plDrag.el;el.classList.add("drag");el.style.transform=`translate(${dx}px,${dy}px)`;const [a,b]=plRange(plStaff());const nm=Math.round((plDrag.from-dx/plDrag.w0*(b-a))/PL_SNAP)*PL_SNAP;el.querySelector("small").textContent=sipadHM(nm)+" · "+plDrag.dur+"د";
        el.style.pointerEvents="none";const under=document.elementFromPoint(e.clientX,e.clientY);el.style.pointerEvents="";const lane=under&&under.closest(".pl-lane");if(lane)lane.classList.add("hover")}
      if(plDrag.type==="resize"&&plDrag.moved){const [a,b]=plRange(plStaff());const nd=Math.max(15,Math.round((plDrag.dur-dx/plDrag.w0*(b-a))/PL_SNAP)*PL_SNAP);plDrag.el.style.width=(nd/(b-a)*100)+"%";plDrag.nd=nd;plDrag.el.querySelector("small").textContent=sipadHM(plDrag.from)+" · "+nd+"د"}});
    document.addEventListener("pointerup",e=>{if(!plDrag||state.view!=="deptPlan")return;const D=plDrag;plDrag=null;document.querySelectorAll(".pl-lane.hover").forEach(l=>l.classList.remove("hover"));
      if(D.g)D.g.remove();
      const day=plDay();
      if(D.type==="chip"){const ln=document.elementFromPoint(e.clientX,e.clientY);const lane=ln&&ln.closest(".pl-lane");if(!lane)return;const s=personById(lane.dataset.staff);const m=plMinAt(lane,e.clientX);plPopOpen({kind:"new",staffId:s.id,from:m,patient:D.patient});return}
      if(D.type==="empty"){if(Math.abs(e.clientX-D.x0)+Math.abs(e.clientY-D.y0)>6)return;const m=plMinAt(D.lane,e.clientX);plPopOpen({kind:"new",staffId:D.lane.dataset.staff,from:Math.floor(m/15)*15});return}
      const el=D.el;const aptId=el.dataset.apt,blockId=el.dataset.block;
      if(D.type==="tap"||!D.moved){plPopOpen(aptId?{kind:"apt",id:aptId}:{kind:"block",id:blockId});return}
      const [a,b]=plRange(plStaff());
      if(D.type==="resize"){const nd=D.nd||D.dur;plSnap();if(aptId){const x=state.appointments.find(y=>y.id===aptId);const s=state.staff.find(y=>y.name===x.clinician);if(s&&plConflict(s,day,D.from,nd,aptId)){plUndo.pop();notify("المدة دي هتدخل في جلسة تانية");render();return}x.duration=nd;audit("تغيير مدة جلسة من جدول القسم",x.patient)}
        else{const bl=state.timeBlocks.find(y=>y.id===blockId);bl.to=sipadHM(D.from+nd)}persist();render();plToast(aptId);return}
      const dx=e.clientX-D.x0;const nm=Math.max(a,Math.min(b-D.dur,Math.round((D.from-dx/D.w0*(b-a))/PL_SNAP)*PL_SNAP));
      el.style.pointerEvents="none";const under=document.elementFromPoint(e.clientX,e.clientY);el.style.pointerEvents="";const lane=(under&&under.closest(".pl-lane"))||D.lane0;const to=personById(lane.dataset.staff);
      plSnap();
      if(aptId){const x=state.appointments.find(y=>y.id===aptId);if(plConflict(to,day,nm,D.dur,aptId)){plUndo.pop();notify(`${to.name} عنده جلسة في الوقت ده`);render();return}
        const moved=x.clinician!==to.name;x.time=sipadHM(nm);x.clinician=to.name;x.newForStaff=true;audit(moved?"نقل جلسة لأخصائي تاني من جدول القسم":"تغيير وقت جلسة من جدول القسم",x.patient+" · "+to.name+" "+x.time)}
      else{const bl=state.timeBlocks.find(y=>y.id===blockId);const d=sipadMin(bl.to)-sipadMin(bl.from);bl.from=sipadHM(nm);bl.to=sipadHM(nm+d);bl.staffId=to.id}
      persist();render();plToast(aptId)});
    function plToast(aptId){const x=aptId&&state.appointments.find(y=>y.id===aptId);notify(x?`اتحدث على آيباد ${x.clinician} · ${x.patient} ${x.time}`:"اتحدث على الآيباد")}
    // ---- النوافذ السريعة ----
    function plPopOpen(p){state.plPop=p;render();setTimeout(()=>{const f=document.querySelector(".pl-pop select,.pl-pop input");if(f)f.focus()},30)}
    function plPopClose(){state.plPop=null;render()}
    function plPopHtml(){const P=state.plPop;const day=plDay();const pts=state.patients.filter(p=>!p.archived);const staff=plStaff();
      const durs=(cur)=>[30,40,45,60].map(v=>`<label class="pl-dur"><input type="radio" name="dur" value="${v}" ${v===cur?"checked":""}><span>${v} د</span></label>`).join("");
      let body="";
      if(P.kind==="new"){const s=personById(P.staffId);body=`<h3>إضافة لجدول ${esc(s?s.name:"")}</h3><form onsubmit="plPopSave(event)"><div class="pl-tabs"><label><input type="radio" name="k" value="apt" checked onchange="this.form.classList.remove('isblk')"><span>جلسة</span></label><label><input type="radio" name="k" value="blk" onchange="this.form.classList.add('isblk')"><span>فترة ثابتة</span></label></div>
        <div class="form-grid"><div class="field"><label>الوقت</label><input class="input" type="time" name="time" value="${sipadHM(P.from)}" required></div>
        <div class="field only-apt"><label>الطفل</label><select class="select" name="patient"><option value="">اختر</option>${pts.map(p=>`<option ${p.name===P.patient?"selected":""}>${esc(p.name)}</option>`).join("")}</select></div>
        <div class="field only-blk"><label>النوع</label><select class="select" name="label">${["استراحة","اجتماع","تدريب","إشراف","تقارير","تقييم"].map(x=>`<option>${x}</option>`).join("")}</select></div>
        <div class="field only-apt"><label>الغرفة</label><input class="input" name="room" placeholder="مثال: غرفة 2"></div></div>
        <div class="pl-durs">${durs(40)}</div><div class="dt-actions"><button class="btn btn-primary">إضافة</button><button type="button" class="btn btn-outline" onclick="plPopClose()">إلغاء</button></div></form>`}
      else if(P.kind==="apt"){const x=state.appointments.find(y=>y.id===P.id);if(!x)return "";const done=x.status==="مكتمل";
        body=`<h3>${esc(x.patient)}</h3><p class="muted">${esc(x.service||"")} · ${esc(x.clinician)}${done?" · خلصت ✓":""}</p>${done?`<div class="dt-actions"><button class="btn btn-outline" onclick="plPopClose()">إغلاق</button></div>`:`<form onsubmit="plPopSave(event)"><div class="form-grid">
          <div class="field"><label>الوقت</label><input class="input" type="time" name="time" value="${x.time}" required></div>
          <div class="field"><label>الأخصائي</label><select class="select" name="staff">${staff.map(s=>`<option value="${s.id}" ${s.name===x.clinician?"selected":""}>${esc(s.name)}</option>`).join("")}</select></div>
          <div class="field"><label>الطفل</label><select class="select" name="patient">${pts.map(p=>`<option ${p.name===x.patient?"selected":""}>${esc(p.name)}</option>`).join("")}${pts.some(p=>p.name===x.patient)?"":`<option selected>${esc(x.patient)}</option>`}</select></div>
          <div class="field"><label>الغرفة</label><input class="input" name="room" value="${esc(x.room&&x.room!=="—"?x.room:"")}"></div></div>
          <div class="pl-durs">${durs(+x.duration||SIPAD_SLOT)}</div><div class="dt-actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline dv-del" onclick="plCancelApt('${x.id}')">إلغاء الجلسة</button><button type="button" class="btn btn-outline" onclick="plPopClose()">رجوع</button></div></form>`}`}
      else if(P.kind==="block"){const x=(state.timeBlocks||[]).find(y=>y.id===P.id);if(!x)return "";body=`<h3>${esc(x.label)} · ${x.from}–${x.to}</h3><div class="dt-actions"><button class="btn btn-outline dv-del" onclick="plDelBlock('${x.id}')">حذف الفترة</button><button class="btn btn-outline" onclick="plPopClose()">رجوع</button></div>`}
      else if(P.kind==="lane"){const s=personById(P.staffId);const n=plApts(s,day).filter(a=>a.status!=="مكتمل").length;const sh=sipadShift(s)||[480,900];
        body=`<h3>${esc(s.name)}</h3><form class="dv-hours" onsubmit="plHours(event)"><b>الدوام</b><input class="input" type="time" name="f" value="${sipadHM(sh[0])}"><span>لـ</span><input class="input" type="time" name="t" value="${sipadHM(sh[1])}"><button class="btn btn-outline">حفظ</button></form>
          <div class="pl-cover"><b>غايب النهارده؟</b><span class="muted">وزّع جلساته (${n}) على باقي القسم في نفس الأوقات، واللي مش هيلاقي مكان هيفضل عنده ويتعلّم.</span><button class="btn btn-primary" onclick="plCover('${s.id}')" ${n?"":"disabled"}>وزّع جلساته</button></div>
          <div class="dt-actions"><button class="btn btn-outline" onclick="state_plGoIpad('${s.id}')">صلاحيات وتحكم الآيباد</button><button class="btn btn-outline" onclick="plPopClose()">رجوع</button></div>`}
      else if(P.kind==="copy"){const y=new Date(day+"T12:00");y.setDate(y.getDate()-7);
        body=`<h3>انسخ جدول يوم تاني لـ ${date(day)}</h3><p class="muted">بيتنسخ جدول كل أخصائيين القسم (الجلسات والفترات الثابتة)، وأي جلسة موجودة في نفس الوقت مش هتتكرر.</p><form onsubmit="plCopy(event)"><div class="field"><label>انسخ من يوم</label><input class="input" type="date" name="src" value="${localDateOf(y)}" required></div><div class="dt-actions"><button class="btn btn-primary">انسخ</button><button type="button" class="btn btn-outline" onclick="plPopClose()">إلغاء</button></div></form>`}
      return `<div class="pl-scrim" onclick="if(event.target===this)plPopClose()"><div class="pl-pop" role="dialog" aria-modal="true">${body}</div></div>`}
    function plPopSave(e){e.preventDefault();const P=state.plPop;const fd=new FormData(e.target);const day=plDay();const tm=fd.get("time");const dur=+(fd.get("dur")||40);const m=sipadMin(tm);
      if(P.kind==="new"){const s=personById(P.staffId);if(fd.get("k")==="blk"){plSnap();ensureDevices();state.timeBlocks.push({id:"tb-"+Date.now(),staffId:s.id,date:day,from:tm,to:sipadHM(m+dur),label:fd.get("label")});audit("إضافة فترة من جدول القسم",s.name)}
        else{const p=fd.get("patient");if(!p){notify("اختار الطفل");return}if(plConflict(s,day,m,dur,null)){notify(`${s.name} عنده جلسة في الوقت ده`);return}plSnap();
          state.appointments.push({id:"apt-"+Date.now(),date:day,time:tm,duration:dur,patient:p,service:"جلسة "+(((state.departments||[]).find(x=>x.id===plDept())||{}).name||"").replace("قسم ",""),clinician:s.name,room:(fd.get("room")||"").trim()||"—",status:"مجدول",newForStaff:true});audit("إضافة جلسة من جدول القسم",p+" · "+s.name)}}
      if(P.kind==="apt"){const x=state.appointments.find(y=>y.id===P.id);const s=personById(fd.get("staff"));if(plConflict(s,x.date,m,dur,x.id)){notify(`${s.name} عنده جلسة في الوقت ده`);return}plSnap();Object.assign(x,{time:tm,duration:dur,clinician:s.name,patient:fd.get("patient"),room:(fd.get("room")||"").trim()||"—",newForStaff:true});audit("تعديل جلسة من جدول القسم",x.patient)}
      state.plPop=null;persist();render();notify("اتحفظ ووصل للآيباد")}
    function plCancelApt(id){const x=state.appointments.find(y=>y.id===id);if(!x)return;plSnap();x.status="ملغي";audit("إلغاء جلسة من جدول القسم",x.patient);state.plPop=null;persist();render()}
    function plDelBlock(id){plSnap();state.timeBlocks=state.timeBlocks.filter(b=>b.id!==id);state.plPop=null;persist();render()}
    function plHours(e){e.preventDefault();const s=personById(state.plPop.staffId);const fd=new FormData(e.target);s.schedule=`${fd.get("f")} — ${fd.get("t")}`;audit("تعديل دوام من جدول القسم",s.name);persist();render()}
    function plCover(id){const s=personById(id);const day=plDay();const others=plStaff().filter(x=>x.id!==id);let moved=0,left=0;plSnap();
      plApts(s,day).filter(a=>a.status!=="مكتمل").forEach(a=>{const m=sipadMin(a.time),d=+a.duration||SIPAD_SLOT;const to=others.find(o=>{const sh=sipadShift(o);return (!sh||(m>=sh[0]&&m+d<=sh[1]))&&!plConflict(o,day,m,d,a.id)});
        if(to){a.clinician=to.name;a.newForStaff=true;moved++}else{a.needsCover=true;left++}});
      audit(`توزيع جلسات أخصائي غايب (${moved} اتنقلت)`,s.name);state.plPop=null;persist();render();notify(`اتوزعت ${moved} جلسة${left?` · ${left} مالقتش حد فاضي`:""}`)}
    function plCopy(e){e.preventDefault();const src=new FormData(e.target).get("src");const day=plDay();if(src===day){notify("اختار يوم مختلف");return}let n=0;plSnap();ensureDevices();
      plStaff().forEach(s=>{plApts(s,src).forEach(a=>{if(plApts(s,day).some(x=>x.time===a.time))return;state.appointments.push({...a,id:"apt-"+Date.now()+"-"+(n++),date:day,status:"مجدول",arrivedAt:undefined,newForStaff:true})});
        plBlocks(s,src).forEach(b=>{if(!plBlocks(s,day).some(x=>x.from===b.from))state.timeBlocks.push({...b,id:"tb-"+Date.now()+"-"+(n++),date:day})})});
      audit(`نسخ جدول القسم من ${src}`,"");state.plPop=null;persist();render();notify(`اتنسخ ${n} عنصر للجدول`)}
    function plLinkAll(){ensureDevices();let n=0;plStaff().forEach(s=>{if(!state.devices.some(d=>d.mode==="personal"&&d.staffId===s.id)){state.devices.push({id:"dev-"+Date.now().toString(36)+n,name:"آيباد "+s.name.replace(/^(أ\.|د\.)\s*/,""),mode:"personal",staffId:s.id,allowed:[],perms:devDefaultPerms(),autolock:10,disabled:false,cmd:null,createdAt:new Date().toISOString()});n++}});
      audit(`تسجيل ${n} آيباد لأخصائيين القسم`,"");persist();render();notify(`اتسجل ${n} آيباد · روابط الربط في «إدارة الأجهزة»`)}
    function plDemoStaff(){const dept=plDept();const names=["أ. ريم الشهري","أ. سارة القرني","أ. منى العمري","أ. نوف الزهراني"];const day=plDay();const pts=state.patients.filter(p=>!p.archived);let k=0;
      names.forEach((nm,i)=>{if(state.staff.some(s=>s.name===nm))return;const s={id:"st-demo-"+Date.now()+i,name:nm,role:dept==="aba"?"أخصائية تعديل سلوك":dept==="ot"?"أخصائية علاج وظيفي":"أخصائية نطق ولغة",schedule:i%2?"09:00 — 16:00":"08:00 — 15:00",status:"متاحة",present:true,gender:"أنثى",code:devNewCode(nm),roleCategory:"staff",clinical:true,department:dept,demo:true};state.staff.push(s);
        const st=i%2?540:480;[0,1,2,4,5].forEach((j,q)=>{const p=pts[(i*3+q)%pts.length];if(!p)return;state.appointments.push({id:"apt-demo-"+Date.now()+"-"+(k++),date:day,time:sipadHM(st+j*50),duration:40,patient:p.name,service:"جلسة تجريبية",clinician:nm,room:"غرفة "+(3+i),status:"مجدول",demo:true})});
        ensureDevices();state.timeBlocks.push({id:"tb-demo-"+Date.now()+i,staffId:s.id,date:day,from:sipadHM(st+150),to:sipadHM(st+180),label:"استراحة"})});
      plLinkAll();audit("إضافة أخصائيين تجريبيين لجدول القسم","")}
    setInterval(()=>{if(state.view==="deptPlan"&&!plDrag&&!state.plPop){const ae=document.activeElement;if(!(ae&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName)))render()}},30000);
    function state_plGoIpad(id){state.plPop=null;state.view="ipads";ipTlOpen(id)}

    const _renderPl=render;render=function(){if(state.view==="deptPlan"&&plDrag)return;_renderPl()};
    // =================== الأقسام والخدمات: مركز عملي لكل قسم بمشرفه وأخصائييه ===================
    const DEPT_TEAMS={
      speech:{sup:null,staff:[["أ. عائشة الزهراني","أخصائية نطق ولغة","أنثى"],["أ. هيا الدوسري","أخصائية نطق ولغة","أنثى"]]},
      skills:{sup:["أ. خالد العمري","مشرف قسم تنمية المهارات","ذكر"],staff:[["أ. أفنان السبيعي","أخصائية تنمية مهارات","أنثى"],["أ. رزان المالكي","أخصائية تربية خاصة","أنثى"]]},
      aba:{sup:null,staff:[["أ. ياسمين الغامدي","أخصائية تحليل سلوك","أنثى"]]},
      psych:{sup:["د. عبدالله القحطاني","مشرف القسم النفسي","ذكر"],staff:[["أ. شيماء الحارثي","أخصائية نفسية","أنثى"]]},
      ot:{sup:null,staff:[]},
      vocational:{sup:["أ. فهد الشمري","مشرف قسم التأهيل المهني","ذكر"],staff:[["أ. ماجد العنزي","أخصائي تأهيل مهني","ذكر"]]},
      inclusion:{sup:["أ. نجلاء البقمي","مشرفة قسم الدمج المدرسي","أنثى"],staff:[["أ. سلمى الجهني","أخصائية دمج","أنثى"],["أ. وجدان الرشيدي","أخصائية دمج","أنثى"]]},
      classrooms:{sup:["أ. أروى الثبيتي","مشرفة قسم الفصول","أنثى"],staff:[["أ. حنان العتيبي","معلمة تربية خاصة","أنثى"],["أ. ندى الشهراني","معلمة تربية خاصة","أنثى"]]}};
    function deptSeedTeams(){if(state.deptSeeded)return;const used=new Set(state.staff.map(s=>String(s.code||"")));const code=nm=>{const b=nm.replace(/^(أ\.|د\.)\s*/,"").charAt(0)||"م";for(let i=1;i<100;i++){if(!used.has(b+i)){used.add(b+i);return b+i}}return b+Date.now()%1000};
      let n=0;Object.entries(DEPT_TEAMS).forEach(([dep,T])=>{if(!state.departments.some(d=>d.id===dep))return;const has=state.staff.filter(s=>s.department===dep);
        if(T.sup&&!has.some(s=>s.roleCategory==="supervisor")&&!state.staff.some(s=>s.name===T.sup[0])){state.staff.push({id:"st-d-"+dep+"-s",name:T.sup[0],role:T.sup[1],schedule:"08:00 — 16:00",status:"متاح"+(T.sup[2]==="أنثى"?"ة":""),present:true,gender:T.sup[2],code:code(T.sup[0]),roleCategory:"supervisor",clinical:false,department:dep});n++}
        T.staff.forEach(([nm,role,g],i)=>{if(state.staff.some(s=>s.name===nm))return;state.staff.push({id:"st-d-"+dep+"-"+i,name:nm,role,schedule:i%2?"09:00 — 16:00":"08:00 — 15:00",status:g==="أنثى"?"متاحة":"متاح",present:i%3!==2,gender:g,code:code(nm),roleCategory:"staff",clinical:true,department:dep});n++})});
      state.deptSeeded=true;if(n)persist()}
    deptSeedTeams();
    function deptStats(d){const today=localDateOf(new Date());const staff=state.staff.filter(s=>s.department===d.id);const sup=staff.find(s=>s.roleCategory==="supervisor");const team=staff.filter(s=>s!==sup);
      const names=new Set(staff.map(s=>s.name));const apts=state.appointments.filter(a=>names.has(a.clinician)&&a.status!=="ملغي");
      const todayA=apts.filter(a=>a.date===today);const kids=[...new Set(apts.map(a=>a.patient))].map(n=>state.patients.find(p=>p.name===n)).filter(Boolean);
      const ids=new Set(staff.map(s=>s.id));const running=Object.values(state.liveBoard||{}).filter(b=>ids.has(b.staffId)&&!b.locked);
      const devs=(state.devices||[]).filter(x=>x.mode==="personal"&&ids.has(x.staffId));const online=devs.filter(x=>{const k=devStatus(x).k;return k==="s"||k==="l"}).length;
      const nexts=kids.map(awanNext).filter(x=>x.urg>0);
      return {staff,sup,team,todayA,done:todayA.filter(a=>a.status==="مكتمل").length,kids,running,devs,online,nexts,sup_n:nexts.filter(x=>x.sup).length,present:staff.filter(s=>s.present).length}}
    function deptCan(k){const r=state.role;return k==="plan"||k==="ipads"?(r==="management"||r==="supervisor"):true}
    function deptActs(d,big){const a=[
      ["schedule","جدول القسم",`deptGo('${d.id}','plan')`,"plan"],["tablet","آيبادات القسم",`deptGo('${d.id}','ipads')`,"ipads"],["team","الفريق",`deptGo('${d.id}','team')`,"all"],
      ["patients","الأطفال",`deptGo('${d.id}','kids')`,"all"],["check","مواعيد النهارده",`deptGo('${d.id}','today')`,"all"],["chat","تواصل القسم",`deptGo('${d.id}','chat')`,"all"]].filter(x=>x[3]==="all"||deptCan(x[3]));
      return `<div class="dh-acts ${big?"big":""}">${a.map(([i,l,f])=>`<button class="dh-act" onclick="event.stopPropagation();${f}" title="${l}" aria-label="${l}">${ic(i,big?20:16)}<span>${l}</span></button>`).join("")}</div>`}
    function deptGo(id,what){state.openDept=id;if(what==="plan"){state.planDept=id;state.openDept=null;setView("deptPlan");return}
      if(what==="ipads"){state.ipDept=id;state.ipTab="live";state.ipMirror=null;state.openDept=null;setView("ipads");return}
      if(what==="chat"){state.openDept=null;setView("communicationHub");return}
      state.deptTab=what;state.view="departments";render();setTimeout(()=>{const el=document.getElementById("dh-tabs");if(el)el.scrollIntoView({behavior:"smooth",block:"start"})},0)}
    function deptAv(s,cls){return `<span class="dh-av ${cls||""} ${s.present?"on":""}" title="${esc(s.name)}">${esc(s.name.replace(/^(أ\.|د\.)\s*/,"").charAt(0))}</span>`}
    function deptHubView(){const addBtn=can('editDepartments')?`<button class="btn btn-primary" onclick="openModal('department')">＋ إضافة قسم</button>`:"";const mode=state.deptMode||"cards";
      const all=state.departments.map(d=>({d,S:deptStats(d)}));const tot=k=>all.reduce((x,y)=>x+(typeof y.S[k]==="number"?y.S[k]:y.S[k].length),0);
      let h=head("الأقسام / الخدمات","الأقسام والخدمات","كل قسم بمشرفه وأخصائييه وأرقامه النهارده. كل أيقونة بتفتح الحاجة نفسها على طول.",`<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="ip-seg" style="margin:0"><button class="${mode==="cards"?"on":""}" onclick="deptMode('cards')">${ic("departments",14)} الأقسام</button><button class="${mode==="org"?"on":""}" onclick="deptMode('org')">${ic("team",14)} الهيكل</button></div>${addBtn}</div>`);
      h+=`<section class="dh-kpis">${[["الأقسام",all.length],["المشرفين",all.filter(x=>x.S.sup).length],["الأخصائيين",all.reduce((a,x)=>a+x.S.team.length,0)],["جلسات النهارده",tot("todayA")],["شغالة دلوقتي",tot("running")],["محتاج مشرف",tot("sup_n")]].map(([l,v],i)=>`<div class="dh-kpi ${i===5&&v?"warn":""}"><b>${v}</b><small>${l}</small></div>`).join("")}</section>`;
      if(mode==="org")return h+deptOrg(all);
      h+=`<section class="dh-grid">${all.map(({d,S})=>`<article class="dh-card st-${d.state==="نشط"?"on":d.state==="قريباً"?"soon":"ready"}" onclick="openDepartmentDetail('${d.id}')" role="button" tabindex="0" aria-label="${esc(d.name)}">
        <div class="dh-top"><span class="dh-ic">${ic(d.icon,22)}</span><div class="dh-tt"><h3>${esc(d.name)}</h3><small>${esc(d.services||"")}</small></div>${pill(d.state)}</div>
        <div class="dh-sup">${S.sup?`${deptAv(S.sup,"lg")}<div><small>المشرف</small><b>${esc(S.sup.name)}</b></div>`:`<span class="dh-av lg empty">؟</span><div><small>المشرف</small><b class="muted">مش متعين</b></div>`}${can('editDepartments')?`<button class="btn btn-outline dh-mini" onclick="event.stopPropagation();openModal('staff','${d.id}::supervisor')">${S.sup?"تغيير":"تعيين"}</button>`:""}</div>
        <div class="dh-team">${S.team.length?S.team.map(s=>`<span class="dh-chip">${deptAv(s)}${esc(s.name.replace(/^(أ\.|د\.)\s*/,""))}</span>`).join(""):`<span class="muted" style="font-size:12px">مفيش أخصائيين لسه</span>`}</div>
        <div class="dh-nums"><div><b>${S.kids.length}</b><small>طفل</small></div><div><b>${S.done}/${S.todayA.length}</b><small>جلسات النهارده</small></div><div class="${S.running.length?"live":""}"><b>${S.running.length}</b><small>شغالة</small></div><div><b>${S.online}/${S.devs.length}</b><small>آيباد متصل</small></div>${S.sup_n?`<div class="warn"><b>${S.sup_n}</b><small>محتاج مشرف</small></div>`:""}</div>
        ${deptActs(d)}</article>`).join("")}</section>`;
      return h}
    function deptOrg(all){const dir=state.staff.filter(s=>s.roleCategory==="management");
      return `<section class="card dh-org"><div class="dh-org-root"><span class="dh-ic">${ic("home",20)}</span><div><b>${esc(state.center.name)}</b><small>${dir.map(s=>esc(s.name)+" · "+esc(s.role)).join(" — ")||"الإدارة"}</small></div></div>
        <div class="dh-org-row">${all.map(({d,S})=>`<div class="dh-org-col"><button class="dh-org-dept" onclick="openDepartmentDetail('${d.id}')">${ic(d.icon,16)} ${esc(d.name)}</button>
          <div class="dh-org-sup">${S.sup?`${deptAv(S.sup)}<div><b>${esc(S.sup.name)}</b><small>${esc(S.sup.role)}</small></div>`:`<div class="muted">مشرف مش متعين</div>`}</div>
          <ul>${S.team.map(s=>`<li>${deptAv(s)}<div><b>${esc(s.name)}</b><small>${esc(s.role)}${" · "+esc(codeLabel(s))}</small></div></li>`).join("")||`<li class="muted">—</li>`}</ul></div>`).join("")}</div></section>`}
    function deptMode(m){state.deptMode=m;render()}
    function deptDetailTop(d){const S=deptStats(d);const tab=state.deptTab||"team";const today=localDateOf(new Date());
      let h=`<section class="card dh-hero"><div class="dh-top"><span class="dh-ic big">${ic(d.icon,28)}</span><div class="dh-tt"><h3>${esc(d.name)}</h3><small>${esc(d.desc||"")}</small></div>${pill(d.state)}</div>
        <div class="dh-nums big"><div><b>${S.staff.length}</b><small>في الفريق · ${S.present} حاضر</small></div><div><b>${S.kids.length}</b><small>طفل</small></div><div><b>${S.done}/${S.todayA.length}</b><small>جلسات النهارده</small></div><div class="${S.running.length?"live":""}"><b>${S.running.length}</b><small>شغالة دلوقتي</small></div><div><b>${S.online}/${S.devs.length}</b><small>آيباد متصل</small></div><div class="${S.sup_n?"warn":""}"><b>${S.nexts.length}</b><small>خطوة مستنية · ${S.sup_n} مشرف</small></div></div>
        ${deptActs(d,true)}</section>`;
      h+=`<div class="ip-seg" id="dh-tabs">${[["team","الفريق"],["kids","الأطفال"],["today","مواعيد النهارده"],["next","الخطوات الجاية"]].map(([k,l])=>`<button class="${tab===k?"on":""}" onclick="deptTab('${k}')">${l}</button>`).join("")}</div>`;
      if(tab==="team"){const all=[S.sup,...S.team].filter(Boolean);
        h+=`<section class="dh-people">${all.map(s=>{const dv=(state.devices||[]).find(x=>x.mode==="personal"&&x.staffId===s.id);const st=dv?devStatus(dv):null;const tA=S.todayA.filter(a=>a.clinician===s.name);const run=S.running.find(b=>b.staffId===s.id);
          return `<article class="card dh-person ${s===S.sup?"sup":""}">${s===S.sup?`<span class="pill pill-gold">مشرف القسم</span>`:""}<div class="dh-sup">${deptAv(s,"lg")}<div><b>${esc(s.name)}</b><small>${esc(s.role)}</small></div></div>
            <div class="dh-meta"><span>${s.present?"حاضر":"مش حاضر"}</span><span>الدوام ${esc(s.schedule||"—")}</span><span>${esc(codeLabel(s))}</span><span>${tA.length} جلسات النهارده</span><span>${dv?esc(st.t):"من غير آيباد"}</span></div>
            ${run?`<div class="dh-run">في جلسة مع ${esc(run.patient)} · ${run.trial}/${DTT_BLOCK} · ${run.pct==null?"—":run.pct+"%"}</div>`:""}
            ${state.deptMsgTo===s.id?`<form class="ip-msg dh-msg" onsubmit="deptMsgSend(event,'${s.id}')"><input class="input" name="m" required maxlength="200" placeholder="اكتب الرسالة لـ ${esc(s.name)}"><button class="btn btn-primary">إرسال</button></form>`:""}
            <div class="dh-acts">${deptCan("ipads")?`<button class="dh-act" onclick="ipOpen('${s.id}')">${ic("eye",15)}<span>شوف آيباده</span></button>`:""}${deptCan("plan")?`<button class="dh-act" onclick="deptGo('${d.id}','plan')">${ic("schedule",15)}<span>جدوله</span></button>`:""}<button class="dh-act" onclick="deptMsg('${s.id}')">${ic("chat",15)}<span>رسالة</span></button>${deptCan("ipads")&&!dv?`<button class="dh-act" onclick="deptLinkOne('${s.id}')">${ic("tablet",15)}<span>سجّل آيباد</span></button>`:""}</div></article>`}).join("")}
          ${can('editDepartments')?`<button class="card dh-add" onclick="openModal('staff','${d.id}::staff')">＋ إضافة أخصائي للقسم</button>`:""}</section>`}
      if(tab==="kids")h+=`<section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>الطفل</th><th>البرنامج</th><th>الأخصائي</th><th>الخطوة الجاية</th><th></th></tr></thead><tbody>${S.kids.map(p=>{const n=awanNext(p);const last=state.appointments.filter(a=>a.patient===p.name&&S.staff.some(s=>s.name===a.clinician)).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))[0];
          return `<tr><td><b>${esc(p.name)}</b><br><small class="muted">${esc(p.age||"")}</small></td><td>${esc(p.program||"")}</td><td>${esc(last?last.clinician:"—")}</td><td><span class="dh-nx u${n.urg}">${esc(n.text)}</span></td><td><button class="btn btn-outline dh-mini" onclick="openPatient('${p.id}')">الملف</button></td></tr>`}).join("")||`<tr><td colspan="5" class="muted">مفيش أطفال مرتبطين بالقسم لسه.</td></tr>`}</tbody></table></div></section>`;
      if(tab==="today"){const rows=S.todayA.slice().sort((a,b)=>a.time.localeCompare(b.time));
        h+=`<section class="card"><div class="card-head"><h2>مواعيد ${date(today)}</h2>${deptCan("plan")?`<button class="btn btn-primary" onclick="deptGo('${d.id}','plan')">رتّب في جدول القسم</button>`:""}</div><div class="list">${rows.map(a=>{const run=S.running.find(b=>b.patient===a.patient);return `<div class="list-row"><div class="list-main"><strong>${time(a.time)} · ${esc(a.patient)}</strong><small>${esc(a.clinician)} · ${esc(a.service||"")} · ${esc(a.room||"")}</small></div>${run?`<span class="pill pill-blue">شغالة ${run.trial}/${DTT_BLOCK}</span>`:pill(a.status)}</div>`}).join("")||`<div class="empty">مفيش مواعيد للقسم النهارده.${deptCan("plan")?" افتح جدول القسم وضيف.":""}</div>`}</div></section>`}
      if(tab==="next")h+=`<section class="card"><div class="list">${S.nexts.sort((a,b)=>b.urg-a.urg).map(x=>`<button class="mx-nx-lite u${x.urg}" onclick="${x.go}"><b>${esc(x.name)}</b><span>${esc(x.text)}</span><small>${esc(x.why)} · ${x.sup?"مشرف":esc(x.owner)}</small></button>`).join("")||`<div class="empty">كل أطفال القسم ماشيين حسب الخطة.</div>`}</div></section>`;
      return h}
    function deptTab(k){state.deptTab=k;render()}
    function deptMsg(id){state.deptMsgTo=state.deptMsgTo===id?null:id;render();setTimeout(()=>{const i=document.querySelector(".dh-msg input");if(i)i.focus()},0)}
    function deptMsgSend(e,id){e.preventDefault();const t=(new FormData(e.target).get("m")||"").trim();if(!t)return;const s=personById(id);const me=getCurrentPerson();
      state.messages.unshift({id:"msg-"+Date.now()+"-dh",fromId:me?me.id:null,fromName:me?me.name:({management:"الإدارة",supervisor:"الإشراف",reception:"الاستقبال"}[state.role]||"المركز"),toId:s.id,toName:s.name,text:t,date:todayISO(),read:false});
      audit("رسالة لأخصائي من صفحة القسم",s.name);state.deptMsgTo=null;persist();render();notify("الرسالة وصلت لـ "+s.name)}
    function deptLinkOne(id){ensureDevices();const s=personById(id);if(!s)return;state.devices.push({id:"dev-"+Date.now().toString(36),name:"آيباد "+s.name.replace(/^(أ\.|د\.)\s*/,""),mode:"personal",staffId:s.id,allowed:[],perms:devDefaultPerms(),autolock:10,disabled:false,cmd:null,createdAt:new Date().toISOString()});audit("تسجيل آيباد من صفحة القسم",s.name);persist();render();notify("اتسجل الآيباد · رابط الربط في «إدارة الأجهزة»")}
    function ipDeptClear(){state.ipDept=null;render()}

    const _deptsOrig=departments;departments=function(){if(state.openDept)return departmentDetail(state.openDept);return deptHubView()};
    const _deptDetOrig=departmentDetail;departmentDetail=function(id){const d=state.departments.find(x=>x.id===id);let h=_deptDetOrig(id);if(!d)return h;
      h=h.replace(/<section class="card" style="margin-top:16px"><div class="card-head"><h2>المشرف والفريق<\/h2>[\s\S]*?<\/section>/,"");
      const i=h.indexOf("<section");return i<0?h+deptDetailTop(d):h.slice(0,i)+deptDetailTop(d)+h.slice(i)};
    // =================== ملفات المستفيدين: شاشة ذكية بالأولويات والرحلة ===================
    const PT_SEGS=[["all","الكل"],["sup","محتاج مشرف"],["urgent","عاجل ومهم"],["gap","انقطاع"],["today","عنده جلسة النهارده"],["inC","في المركز دلوقتي"],["noCS","من غير دراسة حالة"],["noConsent","من غير موافقة"],["report","تقرير مستحق"],["data","بيانات ناقصة"]];
    const PT_RES={"نجاح كامل":2,"نجاح جزئي":1,"لم ينجح بعد":0};
    function ptDigits(v){return String(v||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d))}
    function ptAge(p){const bd=p.health&&p.health.birthDate;const raw=ptDigits(p.age).trim();
      const yrs=d=>{const t=Date.parse(d);if(isNaN(t))return null;const y=(Date.now()-t)/(365.25*864e5);return y>=0&&y<40?y:null};
      let y=bd?yrs(bd):null;if(y==null&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw))y=yrs(raw);
      if(y!=null)return y<2?Math.round(y*12)+" شهر":Math.floor(y)+" سنوات";
      if(/^\d{1,2}$/.test(raw))return raw+" سنوات";return p.age||"—"}
    function ptBad(p){const n=String(p.name||"").trim();return n.length<4||/^(.)\1+$/.test(n.replace(/\s/g,""))||!p.phone||!/\d{9,}/.test(ptDigits(p.phone))}
    function ptInfo(p){const today=localDateOf(new Date());const n=awanNext(p);
      const apts=state.appointments.filter(a=>a.patient===p.name&&a.status!=="ملغي");const done=apts.filter(a=>a.status==="مكتمل").sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
      const up=apts.filter(a=>a.status!=="مكتمل"&&a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      const past=apts.filter(a=>a.date<today);const att=past.length?Math.round(past.filter(a=>a.status==="مكتمل").length/past.length*100):null;
      const logs=(state.sessionLogs||[]).filter(l=>l.patientId===p.id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      const last6=logs.slice(0,6).reverse();const sc=l=>PT_RES[l.result]??1;const a3=logs.slice(0,3),b3=logs.slice(3,6);
      const trend=a3.length&&b3.length?(a3.reduce((x,l)=>x+sc(l),0)/a3.length)-(b3.reduce((x,l)=>x+sc(l),0)/b3.length):null;
      const cnt={};apts.forEach(a=>cnt[a.clinician]=(cnt[a.clinician]||0)+1);const clin=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      const inC=(state.childVisits||[]).some(v=>v.patientId===p.id&&v.date===today&&!v.outAt);
      const cs=!!(typeof caseStudyOf==="function"&&caseStudyOf(p));const consent=typeof consentStatus==="function"?consentStatus(p,"treatment").st==="active":true;
      const running=Object.values(state.liveBoard||{}).find(b=>b.patient===p.name&&!b.locked);
      return {p,n,done,up,att,logs,last6,trend,clin:clin?clin[0]:null,inC,cs,consent,running,today:up.some(a=>a.date===today),bad:ptBad(p),age:ptAge(p),depts:String(p.program||"").split("·").map(x=>x.trim()).filter(Boolean)}}
    function ptMatch(I,seg){const n=I.n;switch(seg){case "sup":return n.sup;case "urgent":return n.urg>=2;case "gap":return /انقطاع/.test(n.text);case "today":return I.today;case "inC":return I.inC;case "noCS":return !I.cs;case "noConsent":return !I.consent;case "report":return /تقرير/.test(n.text);case "data":return I.bad;default:return true}}
    function ptSearchHit(I,q){if(!q)return true;q=ptDigits(q).toLowerCase();const p=I.p;return [p.name,p.file,p.guardian,ptDigits(p.phone),p.need,p.program,p.code,p.school,I.clin,I.n.text].join(" ").toLowerCase().includes(q)}
    function ptSort(list,k){const by={prio:(a,b)=>b.n.urg-a.n.urg||(b.n.sup-a.n.sup)||a.p.name.localeCompare(b.p.name,"ar"),name:(a,b)=>a.p.name.localeCompare(b.p.name,"ar"),
      last:(a,b)=>String((b.done[0]||{}).date||"").localeCompare(String((a.done[0]||{}).date||"")),next:(a,b)=>String((a.up[0]||{date:"9999"}).date+(a.up[0]||{}).time).localeCompare(String((b.up[0]||{date:"9999"}).date+(b.up[0]||{}).time)),
      newest:(a,b)=>String(b.p.id).localeCompare(String(a.p.id))};return list.sort(by[k]||by.prio)}
    function ptView(){const tab=state.patientsTab||"active";const act=state.patients.filter(p=>!p.archived).length,arc=state.patients.filter(p=>p.archived).length;
      const view=state.ptView||"cards",seg=state.ptSeg||"all",sort=state.ptSort||"prio";
      const add=(tab==="archived"||!can('editPatients'))?"":`<button class="btn btn-primary" onclick="openModal('patient')">＋ ملف جديد</button>`;
      let h=head("سجل الحالات / 02","ملفات المستفيدين","كل طفل ومكانه في الرحلة والخطوة الجاية ليه. الأهم بيطلع فوق لوحده.",`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline" onclick="ptExport()">${ic("chart",14)} تصدير Excel</button>${add}</div>`);
      h+=`<div class="pt-top"><div class="ip-seg" style="margin:0"><button class="${tab==="active"?"on":""}" onclick="setPatientsTab('active')">النشطة <em>${act}</em></button><button class="${tab==="archived"?"on":""}" onclick="setPatientsTab('archived')">الأرشيف <em>${arc}</em></button></div>
        ${tab==="active"?`<div class="ip-seg" style="margin:0">${[["cards","كروت","blocks"],["table","جدول","chart"],["board","الرحلة","pulse"]].map(([k,l,i])=>`<button class="${view===k?"on":""}" onclick="ptSet('ptView','${k}')">${ic(i,14)} ${l}</button>`).join("")}</div>`:""}</div>`;
      if(tab==="active"){h+=`<div class="pt-segs" id="pt-segs"></div>
        <div class="pt-tools"><div class="pt-search">${ic("patients",16)}<input class="input" id="pt-q" placeholder="ابحث بالاسم، رقم الملف، ولي الأمر، الجوال، الأخصائي، أو «انقطاع»" value="${esc(state.ptQ||"")}" oninput="ptSearch(this.value)" autocomplete="off"></div>
        <label class="pt-sort">ترتيب <select class="select" onchange="ptSet('ptSort',this.value)">${[["prio","الأولوية"],["next","الموعد الجاي"],["last","آخر جلسة"],["name","الاسم"],["newest","الأحدث"]].map(([k,l])=>`<option value="${k}" ${sort===k?"selected":""}>${l}</option>`).join("")}</select></label></div>`}
      h+=`<div id="pt-body"></div>`;return h}
    function ptPaint(){const body=document.getElementById("pt-body");if(!body)return;const tab=state.patientsTab||"active";
      if(tab==="archived"){const rows=state.patients.filter(p=>p.archived);body.innerHTML=rows.length?`<section class="pt-grid">${rows.map(p=>`<article class="card pt-card arch"><div class="pt-head">${ptAv(p)}<div><b>${esc(p.name)}</b><small>${esc(p.file||"")} · ${esc(ptAge(p))}</small></div></div><div class="pt-acts">${can('editPatients')?`<button class="btn btn-outline" onclick="restorePatient('${p.id}')">استعادة</button>`:""}<button class="btn btn-outline" onclick="openPatient('${p.id}')">فتح الملف</button></div></article>`).join("")}</section>`:`<div class="card"><div class="empty">الأرشيف فاضي.</div></div>`;return}
      const all=state.patients.filter(p=>!p.archived).map(ptInfo);const seg=state.ptSeg||"all";const q=(state.ptQ||"").trim();
      const segs=document.getElementById("pt-segs");if(segs)segs.innerHTML=PT_SEGS.map(([k,l])=>{const c=all.filter(I=>ptMatch(I,k)).length;return (k==="all"||c)?`<button class="pt-seg s-${k} ${seg===k?"on":""}" onclick="ptSet('ptSeg','${k}')">${l}<em>${c}</em></button>`:""}).join("");
      const list=ptSort(all.filter(I=>ptMatch(I,seg)&&ptSearchHit(I,q)),state.ptSort||"prio");const view=state.ptView||"cards";
      if(!list.length){body.innerHTML=`<div class="card"><div class="empty">مفيش ملفات مطابقة${q?` لـ «${esc(q)}»`:""}.</div></div>`;return}
      body.innerHTML=view==="table"?ptTable(list):view==="board"?ptBoard(list):`<section class="pt-grid">${list.map(ptCard).join("")}</section>`}
    function ptAv(p){const n=String(p.name||"?").trim();const hue=[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%360;return `<span class="pt-av" style="--h:${hue}">${esc(n.charAt(0))}</span>`}
    function ptTrend(I){if(!I.last6.length)return `<span class="pt-none">لسه مفيش نتايج جلسات</span>`;const col=["r","a","g"];
      return `<span class="pt-spark" title="آخر ${I.last6.length} نتايج">${I.last6.map(l=>`<i class="${col[PT_RES[l.result]??1]}" style="height:${6+(PT_RES[l.result]??1)*6}px"></i>`).join("")}</span>${I.trend==null?"":I.trend>0.3?`<b class="pt-up">↑ بيتحسن</b>`:I.trend<-0.3?`<b class="pt-down">↓ بيتراجع</b>`:`<b class="pt-flat">ثابت</b>`}`}
    function ptWa(p,text){const ph=typeof toIntlWhatsapp==="function"?toIntlWhatsapp(p.phone):"";return ph?`https://wa.me/${ph}?text=${encodeURIComponent(text)}`:waLink(text)}
    function ptCard(I){const p=I.p,n=I.n;const nx=I.up[0];
      return `<article class="card pt-card u${n.urg} ${n.sup?"sup":""}" onclick="ptOpen(event,'${p.id}')" role="button" tabindex="0" aria-label="${esc(p.name)}">
        <div class="pt-head">${ptAv(p)}<div class="pt-id"><b>${esc(p.name)}</b><small>${esc(p.file||"")} · ${esc(I.age)}${p.guardian?" · "+esc(p.guardian):""}</small></div>
          <div class="pt-flags">${I.running?`<span class="pt-flag live">في جلسة ${I.running.trial}/${DTT_BLOCK}</span>`:I.inC?`<span class="pt-flag in">في المركز</span>`:""}${I.bad?`<span class="pt-flag bad" title="الاسم أو رقم الجوال محتاجين مراجعة">بيانات ناقصة</span>`:""}</div></div>
        <div class="pt-tags">${I.depts.map(d=>`<span>${esc(d)}</span>`).join("")}${p.need?`<span class="need">${esc(p.need)}</span>`:""}</div>
        <ol class="pt-journey" title="${esc(NX_STAGES[n.stage])}">${NX_STAGES.map((s,i)=>`<li class="${i<n.stage?"d":i===n.stage?"on":""}"></li>`).join("")}</ol>
        <div class="pt-stage"><small>المرحلة: ${esc(NX_STAGES[n.stage])}</small></div>
        <div class="pt-next u${n.urg}"><div><small>الخطوة الجاية · ${n.sup?"<b>محتاج مشرف</b>":esc(n.owner)}</small><b>${esc(n.text)}</b><span>${esc(n.why)}</span></div>${n.go&&n.go!==`openPatient('${p.id}')`?`<button class="btn btn-primary" onclick="event.stopPropagation();${n.go}">نفّذ</button>`:""}</div>
        <div class="pt-stats"><div><small>الجلسات</small><b>${I.done.length}</b></div><div><small>الحضور</small><b>${I.att==null?"—":I.att+"%"}</b></div><div><small>الجاي</small><b>${nx?(nx.date===localDateOf(new Date())?"النهارده ":date(nx.date)+" ")+time(nx.time):"مفيش"}</b></div><div class="w"><small>الأداء</small><div>${ptTrend(I)}</div></div></div>
        <div class="pt-foot"><span>${I.clin?`${ic("team",13)} ${esc(I.clin)}`:"لسه ملوش أخصائي"}</span><span class="pt-ok">${I.cs?`<i class="y">دراسة حالة</i>`:`<i class="n">دراسة حالة</i>`}${I.consent?`<i class="y">موافقة</i>`:`<i class="n">موافقة</i>`}</span></div>
        <div class="pt-acts"><button class="btn btn-outline" onclick="event.stopPropagation();openPatient('${p.id}')">فتح الملف</button><button class="btn btn-outline" onclick="event.stopPropagation();ptBook('${p.id}')">احجز</button><a class="btn btn-outline" target="_blank" rel="noopener" onclick="event.stopPropagation()" href="${ptWa(p,`أهلاً ${p.guardian||""}، معاكم ${state.center.name} بخصوص ${p.name.split(" ")[0]}`)}">واتساب</a>${can('editPatients')?`<button class="btn btn-outline pt-del ${state.ptDelArm===p.id?"arm":""}" onclick="event.stopPropagation();ptArchive('${p.id}')">${state.ptDelArm===p.id?"تأكيد الأرشفة":"أرشفة"}</button>`:""}</div></article>`}
    function ptTable(list){return `<section class="card"><div class="table-wrap"><table class="data-table pt-table"><thead><tr><th>المستفيد</th><th>العمر</th><th>البرنامج</th><th>المرحلة</th><th>الخطوة الجاية</th><th>الجاي</th><th>الأداء</th><th></th></tr></thead><tbody>${list.map(I=>{const p=I.p,n=I.n,nx=I.up[0];
      return `<tr class="u${n.urg}"><td><div class="pt-head sm">${ptAv(p)}<div><b>${esc(p.name)}</b><small>${esc(p.file||"")}${I.bad?` · <span class="pt-flag bad">ناقصة</span>`:""}</small></div></div></td><td>${esc(I.age)}</td><td class="wrap">${esc(p.program||"")}</td><td>${esc(NX_STAGES[n.stage])}</td><td><span class="dh-nx u${n.urg}">${esc(n.text)}</span>${n.sup?` <span class="pt-flag sup">مشرف</span>`:""}</td><td>${nx?date(nx.date)+" "+time(nx.time):"—"}</td><td>${ptTrend(I)}</td><td style="white-space:nowrap"><button class="btn btn-outline dh-mini" onclick="openPatient('${p.id}')">فتح</button> <button class="btn btn-outline dh-mini" onclick="ptBook('${p.id}')">احجز</button></td></tr>`}).join("")}</tbody></table></div></section>`}
    function ptBoard(list){return `<section class="pt-board">${NX_STAGES.map((s,i)=>{const col=list.filter(I=>I.n.stage===i);return `<div class="pt-col"><div class="pt-col-h"><b>${esc(s)}</b><em>${col.length}</em></div>${col.map(I=>`<button class="pt-mini u${I.n.urg}" onclick="openPatient('${I.p.id}')">${ptAv(I.p)}<div><b>${esc(I.p.name)}</b><small>${esc(I.n.text)}</small></div>${I.n.sup?`<i class="pt-flag sup">مشرف</i>`:""}</button>`).join("")||`<div class="pt-col-e">—</div>`}</div>`}).join("")}</section>`}
    function ptSet(k,v){state[k]=v;if(k==="ptView")render();else ptPaint()}
    function ptSearch(v){state.ptQ=v;ptPaint()}
    function ptOpen(e,id){if(e.target.closest("a,button"))return;openPatient(id)}
    function ptBook(id){const p=state.patients.find(x=>x.id===id);if(!p)return;openModal("appointment");setTimeout(()=>{const s=document.querySelector('#modal select[name="patient"]');if(s){[...s.options].forEach(o=>{if(o.value===p.name||o.textContent.trim()===p.name)s.value=o.value});s.dispatchEvent(new Event("change",{bubbles:true}))}},30)}
    function ptArchive(id){if(state.ptDelArm!==id){state.ptDelArm=id;ptPaint();setTimeout(()=>{if(state.ptDelArm===id){state.ptDelArm=null;ptPaint()}},4000);return}state.ptDelArm=null;archivePatient(id)}
    function ptExport(){const rows=state.patients.filter(p=>!p.archived).map(ptInfo);const head=["الاسم","رقم الملف","العمر","ولي الأمر","الجوال","البرنامج","الاحتياج","المرحلة","الخطوة الجاية","المسؤول","محتاج مشرف","الجلسات المكتملة","نسبة الحضور","الموعد الجاي","الأخصائي"];
      const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;const csv="﻿"+[head,...rows.map(I=>[I.p.name,I.p.file,I.age,I.p.guardian,I.p.phone,I.p.program,I.p.need,NX_STAGES[I.n.stage],I.n.text,I.n.owner,I.n.sup?"نعم":"لا",I.done.length,I.att==null?"":I.att+"%",I.up[0]?I.up[0].date+" "+I.up[0].time:"",I.clin||""])].map(r=>r.map(q).join(",")).join("\n");
      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="awan-patients-"+localDateOf(new Date())+".csv";document.body.appendChild(a);a.click();a.remove();audit("تصدير ملفات المستفيدين","");notify("اتنزل ملف Excel")}

    patients=ptView;
    const _renderPt=render;render=function(){_renderPt();if(state.view==="patients"&&document.getElementById("pt-body"))ptPaint()};

    // ---- رادار المركز + التنبيهات ----
    const MX_SWEEP=4;let _mxSeen=new Set(),_mxAudio=null;
    function mxHash(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h}
    function mxRadarPaint(D){const box=document.getElementById("mx-blips");if(!box)return;const now=Date.now();
      const recs=D.recs.filter(r=>r.status!=="offline");const run=recs.filter(r=>r.status==="session").length;const al=recs.filter(r=>r.alerts.length);
      document.getElementById("mx-radar-sub").textContent=`${recs.length} جهاز متصل · ${run} في جلسة · ${al.length} عليها تنبيه`;
      document.getElementById("mx-rdr-c").innerHTML=`<b>${run}</b><small>جلسة شغالة</small>`;
      const cat=r=>{const top=r.alerts.reduce((x,a)=>Math.max(x,a.lvl),0);return top>=3?"p":top>=2?"w":r.status==="session"?"s":"h"};
      const groups={a:[],s:[],h:[]};recs.slice().sort((x,y)=>String(x.id).localeCompare(String(y.id))).forEach(r=>{const k=cat(r);groups[k==="p"||k==="w"?"a":k].push(r)});
      const RING={a:0.36,s:0.63,h:0.87},OFF={a:20,s:0,h:10};const pos={};
      Object.entries(groups).forEach(([g,arr])=>arr.forEach((r,i)=>{pos[r.id]={ring:RING[g],a:(OFF[g]+i*360/Math.max(arr.length,1))%360}}));
      mxKeyed(box,recs.map(r=>{const k=cat(r);const {ring,a}=pos[r.id];const rad=a*Math.PI/180;
        const x=50+50*ring*Math.sin(rad),y=50-50*ring*Math.cos(rad);
        const delay=(a/360*MX_SWEEP-(now%(MX_SWEEP*1000))/1000).toFixed(2);const nm=r.name.replace(/^(أ\.|د\.)\s*/,"");
        return {k:r.id,sig:[k,Math.round(x),Math.round(y)].join("|"),html:`<button class="mx-blip k-${k}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--d:${delay}s" onclick="ipOpen('${r.id}')"><i></i><span>${esc(nm.charAt(0))}</span>${k==="p"||k==="w"?`<em>${esc(nm.split(" ")[0])}</em>`:""}</button>`}}));
      recs.forEach(r=>{const el=box.querySelector(`[data-k="${r.id}"]`);if(!el)return;const tr=r.m&&r.m.cur?r.m.cur.trials.length:0;
        const tip=`${r.name}${r.sess&&!r.sess.locked?" · "+r.sess.patient+" · "+tr+"/"+DTT_BLOCK:""}${r.alerts[0]?" · "+r.alerts[0].t:""}`;el.title=tip;el.setAttribute("aria-label",tip);
        const key=r.sess?r.sess.updatedAt:0;if(el.dataset.tap&&el.dataset.tap!==String(key)){el.classList.remove("tap");void el.offsetWidth;el.classList.add("tap")}el.dataset.tap=String(key)});
      // التنبيهات
      const list=[];D.recs.forEach(r=>r.alerts.forEach(a=>list.push({r,a})));list.sort((x,y)=>y.a.lvl-x.a.lvl);
      const ab=document.getElementById("mx-alerts");
      if(!list.length){if(!ab.querySelector(".mx-allok"))ab.innerHTML=`<div class="mx-allok"><span>✓</span><b>كله تمام</b><small>مفيش أي تنبيه على الأجهزة دلوقتي</small></div>`}
      else{const ok=ab.querySelector(".mx-allok");if(ok)ok.remove();
        mxKeyed(ab,list.slice(0,12).map(({r,a})=>({k:r.id+"|"+a.t.replace(/\d+/g,"#"),sig:a.t,html:`<button class="mx-al l${a.lvl}" onclick="ipOpen('${r.id}')"><span class="mx-al-dot"></span><div><b>${esc(a.t)}</b><small>${esc(r.name)}${r.sess?" · "+esc(r.sess.patient)+" · "+esc(r.sess.room||""):""}</small></div><em>افتح</em></button>`})))}
      let fresh=false;list.forEach(({r,a})=>{const key=r.id+"|"+a.t.replace(/\d+/g,"#");if(a.lvl>=2&&!_mxSeen.has(key)){_mxSeen.add(key);fresh=fresh||a.lvl}});
      if(fresh&&state.mxSound)mxBeep(fresh>=3)}
    function mxBeep(urgent){try{_mxAudio=_mxAudio||new (window.AudioContext||window.webkitAudioContext)();const c=_mxAudio;[0,0.22,urgent?0.44:null].filter(x=>x!=null).forEach(t=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=urgent?880:660;g.gain.setValueAtTime(0.0001,c.currentTime+t);g.gain.exponentialRampToValueAtTime(0.25,c.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+0.18);o.connect(g).connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+0.2)})}catch(_e){}}
    function mxSound(){state.mxSound=!state.mxSound;const b=document.getElementById("mx-snd");if(b)b.textContent=state.mxSound?"🔔 الصوت شغال":"🔕 الصوت مقفول";if(state.mxSound)mxBeep(false)}
    function mxSim(){if(ipSim)ipSimStop();else ipSimStart()}
    // =================== أوان تواصل الجديدة: محادثات موحدة (الوكيل، الأقسام، الأسر، الآيبادات، الفريق) + أوان كونكت ===================
    function cmMe(){const p=getCurrentPerson();const idn=currentCommIdentity();return {id:p?p.id:null,name:p?p.name:({management:"الإدارة",supervisor:"الإشراف",reception:"الاستقبال",staff:"فريق المركز"}[state.role]||"المركز"),dept:idn.dept||(state.role==="supervisor"?"supervision":null)}}
    function cmAt(m){return m.at||Date.parse(m.date||0)||0}
    function cmThreadOf(m){if(m.ch)return m.ch;if(m.patientId&&(m.fromDept==="family"||m.toDept==="family"))return "fam:"+m.patientId;
      const me=cmMe();if(m.toId&&m.toId!==me.id)return "staff:"+m.toId;if(m.fromId&&m.fromId!==me.id&&!m.toDept)return "staff:"+m.fromId;
      const d=(m.toDept&&m.toDept!==me.dept)?m.toDept:(m.fromDept||m.toDept);return d?"dept:"+d:"dept:management"}
    function cmMine(m){const me=cmMe();return m.mine||(m.fromId&&m.fromId===me.id)||(!m.fromId&&m.fromDept&&m.fromDept===me.dept&&m.fromDept!=="family"&&!m.agent)}
    function cmThreads(){ensureDevices();const by={};(state.messages||[]).forEach(m=>{const t=cmThreadOf(m);(by[t]=by[t]||[]).push(m)});const reads=state.cmRead||{};
      const mk=(id,group,name,sub,av,extra)=>{const ms=(by[id]||[]).slice().sort((a,b)=>cmAt(a)-cmAt(b));const last=ms[ms.length-1];const unread=ms.filter(m=>!cmMine(m)&&!m.agentMe&&cmAt(m)>(reads[id]||0)).length;return {id,group,name,sub,av,ms,last,unread,...(extra||{})}};
      const L=[];const nx=awanNextAll();const sup=nx.filter(x=>x.sup).length;const ipAl=ipRecords().filter(r=>r.alerts.length).length;
      L.push(mk("agent","agent","وكيل أوان الذكي",sup||ipAl?`${sup} محتاج مشرف · ${ipAl} آيباد عليه تنبيه`:"اسألني عن أي حاجة في المركز","🤖",{pinned:true,badge:sup+ipAl}));
      state.departments.forEach(d=>{const staff=state.staff.filter(s=>s.department===d.id);L.push(mk("dept:"+d.id,"dept",d.name,`${staff.filter(s=>s.present).length} حاضر من ${staff.length}`,ic(d.icon,18)))});
      L.push(mk("dept:management","dept","الإدارة العامة","الإدارة والتشغيل",ic("chart",18)));L.push(mk("dept:reception","dept","الاستقبال","المواعيد والأسر",ic("bell",18)));
      (state.devices||[]).forEach(dv=>{const st=devStatus(dv);const s=dv.mode==="personal"?personById(dv.staffId):null;L.push(mk("dev:"+dv.id,"dev",dv.name,(s?s.name+" · ":"")+st.t,ic("tablet",18),{online:st.k==="s"||st.k==="l",devId:dv.id}))});
      state.patients.filter(p=>!p.archived).forEach(p=>L.push(mk("fam:"+p.id,"fam","أسرة "+p.name.split(" ").slice(0,2).join(" "),p.guardian||"ولي الأمر",esc(p.name.charAt(0)),{pid:p.id})));
      state.staff.forEach(s=>{if(s.id===cmMe().id)return;L.push(mk("staff:"+s.id,"staff",s.name,s.role||"",esc(s.name.replace(/^(أ\.|د\.)\s*/,"").charAt(0)),{online:!!s.present,sid:s.id}))});
      return L}
    const CM_GROUPS=[["all","الكل"],["unread","غير مقروء"],["dept","الأقسام"],["fam","الأسر"],["dev","الآيبادات"],["staff","الفريق"]];
    function cmView(){const L=cmThreads();const cur=state.cmTh||"agent";const T=L.find(t=>t.id===cur)||L[0];const g=state.cmG||"all";const q=(state.cmQ||"").trim();
      const shown=L.filter(t=>t.pinned||((g==="all"||(g==="unread"?t.unread:t.group===g))&&(!q||(t.name+" "+t.sub).includes(q)))).sort((a,b)=>(b.pinned-a.pinned)||(b.unread-a.unread)||((b.last?cmAt(b.last):0)-(a.last?cmAt(a.last):0)));
      const lim=q||g!=="all"?shown:shown.filter(t=>t.pinned||t.last||t.group==="dept"||t.group==="dev");
      const totalUnread=L.reduce((a,t)=>a+t.unread,0);
      const meet=(state.meetings||[]).filter(m=>m.status==="جارية"||(m.status==="مجدولة"&&m.scheduledDate===todayISO()));
      let h=`<div class="cm ${state.cmOpen?"open":""}" id="cm-room">
        <aside class="cm-list"><div class="cm-list-h"><h2>أوان تواصل ${totalUnread?`<em>${totalUnread}</em>`:""}</h2><button class="btn btn-outline dh-mini" onclick="setView('connect')">${ic("video",13)} كونكت</button></div>
          <div class="cm-search">${ic("patients",15)}<input id="cm-q" placeholder="دوّر على قسم، أسرة، آيباد، أو زميل" value="${esc(q)}" oninput="cmSearch(this.value)" autocomplete="off"></div>
          <div class="cm-groups">${CM_GROUPS.map(([k,l])=>`<button class="${g===k?"on":""}" onclick="cmSet('cmG','${k}')">${l}</button>`).join("")}</div>
          ${meet.length?`<div class="cm-meet">${meet.map(m=>`<button onclick="openMeetingRoom('${m.id}')"><span class="ai-live-dot"></span><div><b>${esc(m.title)}</b><small>${m.status==="جارية"?"شغال دلوقتي · ادخل":"النهارده"}</small></div></button>`).join("")}</div>`:""}
          <div class="cm-items">${lim.map(t=>`<button class="cm-item ${t.id===T.id?"on":""} g-${t.group}" onclick="cmOpen('${t.id}')"><span class="cm-av g-${t.group}">${t.av}${t.online?`<i></i>`:""}</span><div class="cm-it"><div><b>${esc(t.name)}</b><time>${t.last?cmTime(cmAt(t.last)):""}</time></div><small>${t.last?esc((cmMine(t.last)?"إنت: ":"")+t.last.text):esc(t.sub)}</small></div>${t.unread?`<em class="cm-badge">${t.unread}</em>`:t.badge?`<em class="cm-badge warn">${t.badge}</em>`:""}</button>`).join("")||`<div class="empty">مفيش نتايج.</div>`}</div></aside>
        <section class="cm-chat">${cmChatHtml(T)}</section>
        <aside class="cm-ctx">${cmCtxHtml(T)}</aside></div>`;
      return h}
    function cmTime(t){const d=new Date(t);const today=localDateOf(new Date());return localDateOf(d)===today?pad2(d.getHours())+":"+pad2(d.getMinutes()):date(localDateOf(d))}
    function cmChatHtml(T){const hdrAct=[];
      if(T.group!=="agent")hdrAct.push(`<button class="cm-hbtn" onclick="cmMeet('${T.id}')" title="اجتماع أوان كونكت">${ic("video",16)}<span>اجتماع</span></button>`);
      if(T.group==="fam"){const p=state.patients.find(x=>x.id===T.pid);if(p)hdrAct.push(`<a class="cm-hbtn" target="_blank" rel="noopener" href="${ptWa(p,"")}">${ic("chat",16)}<span>واتساب</span></a>`)}
      if(T.group==="dev")hdrAct.push(`<button class="cm-hbtn" onclick="ipDevCmd('${T.devId}','lock')">${ic("lock",16)}<span>قفل</span></button>`);
      const tpl={agent:["مين محتاج مشرف؟","جلسات النهارده","أي آيباد عليه تنبيه؟","مين غايب النهارده؟","لخص اليوم","الأطفال المنقطعين"],fam:["نأكد موعد الجلسة الجاية؟","طفلكم عمل مجهود حلو النهارده 🌿","محتاجين توقيع الموافقة الإلكترونية","تقرير التقدم الشهري جاهز"],dept:["محتاجين اجتماع قصير النهارده","ياريت تحديث الخطط قبل الخميس","فيه طفل جديد محتاج تقييم"],dev:["ابدأي الجلسة الجاية","خدي استراحة 5 دقايق","قللي المساعدة تدريجي","أنا جاي الغرفة"],staff:["ممكن نتكلم دقيقة؟","شكرًا على مجهودك 🌿","ياريت تقفلي تقارير النهارده"]}[T.group]||[];
      const msgs=T.group==="agent"?cmAgentFeed(T):T.ms;
      let body=msgs.length?"":`<div class="cm-empty"><span class="cm-av big g-${T.group}">${T.av}</span><b>${esc(T.name)}</b><small>${T.group==="agent"?"اسألني بالعربي عادي، أو اختار سؤال من تحت.":"ابدأ المحادثة — الرسالة بتوصل فورًا."}</small></div>`;
      let lastDay="";msgs.forEach(m=>{const d=localDateOf(new Date(cmAt(m)));if(d!==lastDay){body+=`<div class="cm-day"><span>${d===localDateOf(new Date())?"النهارده":date(d)}</span></div>`;lastDay=d}body+=cmBubble(m,T)});
      return `<header class="cm-chat-h"><button class="cm-back" onclick="cmSet('cmOpen',false)" aria-label="رجوع">‹</button><span class="cm-av g-${T.group}">${T.av}${T.online?`<i></i>`:""}</span><div class="cm-ht"><b>${esc(T.name)}</b><small>${esc(T.sub)}</small></div><div class="cm-hacts">${hdrAct.join("")}</div></header>
        <div class="cm-msgs" id="cm-msgs">${body}</div>
        <div class="cm-tpl">${tpl.map(t=>`<button onclick="cmQuick(${JSON.stringify(t).replace(/"/g,"&quot;")})">${esc(t)}</button>`).join("")}</div>
        <form class="cm-compose" onsubmit="cmSend(event)" autocomplete="off">
          ${T.group==="dept"||T.group==="staff"?`<label class="cm-opt" title="هيظهر كقرار محتاج اعتماد"><input type="checkbox" name="decision"><span>قرار</span></label>`:""}
          ${T.group==="dev"?`<label class="cm-opt on" title="الرسالة هتظهر على شاشة الآيباد"><input type="checkbox" name="screen" checked><span>على الشاشة</span></label>`:""}
          <input class="input" name="t" id="cm-input" placeholder="${T.group==="agent"?"اسأل الوكيل… مثلًا: ابعت لأسرة خالد إن الجلسة اتأجلت":"اكتب رسالة…"}" required maxlength="500">
          ${T.group==="agent"&&("webkitSpeechRecognition" in window||"SpeechRecognition" in window)?`<button type="button" class="cm-mic" onclick="cmDictate()" aria-label="إملاء صوتي">🎙</button>`:""}
          <button class="cm-send" aria-label="إرسال">${ic("chevronLeft",18,2.4)}</button></form>`}
    function cmBubble(m,T){const mine=cmMine(m)||m.agentMe;const isAgent=m.agent;const dec=m.kind==="قرار";const canAct=typeof canActOnComm==="function"&&canActOnComm(m);
      return `<div class="cm-b ${mine?"me":"them"} ${isAgent?"agent":""} ${dec?"dec":""}"><div class="cm-bb">${!mine&&T.group!=="staff"&&!isAgent?`<small class="cm-from">${esc(m.fromName||"")}</small>`:""}${dec?`<span class="pill pill-gold">قرار</span> `:""}${m.screen?`<span class="cm-scr">${ic("tablet",11)} ظهرت على الشاشة</span> `:""}
        <div class="cm-tx">${m.html||esc(m.text)}</div>${m.acts&&m.acts.length?`<div class="cm-acts">${m.acts.map(a=>`<button onclick="${a.js}">${esc(a.l)}</button>`).join("")}</div>`:""}
        <div class="cm-meta"><time>${cmTime(cmAt(m))}</time>${mine&&!isAgent&&!m.agentMe?`<span class="cm-st">${m.status==="معتمدة"?"✓✓ اتعتمد":m.status==="قيد الاطلاع"?"✓✓ اتقرت":"✓ اتبعتت"}</span>`:""}${!mine&&dec&&canAct&&m.status!=="معتمدة"?`<button class="cm-appr" onclick="approveCommItem('${m.id}')">اعتمد القرار</button>`:""}</div></div></div>`}
    function cmCtxHtml(T){let h="";
      if(T.group==="agent"){const nx=awanNextAll().filter(x=>x.urg>0).slice(0,5);const al=ipRecords().filter(r=>r.alerts.length).slice(0,5);
        h=`<div class="cm-ctx-h">${ic("idea",16)} الإدارة الذكية دلوقتي</div><div class="cm-ctx-sec"><small>محتاجين خطوة</small>${nx.map(x=>`<button class="cm-ctx-row u${x.urg}" onclick="${x.go}"><b>${esc(x.name)}</b><span>${esc(x.text)}</span></button>`).join("")||`<span class="muted">كله ماشي</span>`}</div>
          <div class="cm-ctx-sec"><small>تنبيهات الآيبادات</small>${al.map(r=>`<button class="cm-ctx-row u2" onclick="ipOpen('${r.id}')"><b>${esc(r.name)}</b><span>${esc(r.alerts[0].t)}</span></button>`).join("")||`<span class="muted">مفيش تنبيهات</span>`}</div>
          <div class="cm-ctx-sec"><small>الوكيل يقدر</small><ul class="cm-cap"><li>يرد على أسئلة عن المركز لحظيًا</li><li>يبعت رسائل للأسر والأقسام والآيبادات</li><li>يجدول اجتماع أوان كونكت</li><li>يلخص اليوم ويطلع المنقطعين</li></ul><small class="muted">${aiReady()?"متوصل بـ OpenAI للأسئلة المفتوحة":"شغال بالقواعد · تقدر توصله بـ OpenAI من «الوكلاء الأذكياء»"}</small></div>`}
      else if(T.group==="fam"){const p=state.patients.find(x=>x.id===T.pid);if(p){const I=ptInfo(p);const nx=I.up[0];
        h=`<div class="cm-ctx-h">${ptAv(p)} ${esc(p.name)}</div><div class="cm-ctx-sec"><small>ولي الأمر</small><b>${esc(p.guardian||"—")}</b><span class="muted" style="direction:ltr">${esc(p.phone||"")}</span></div>
          <div class="cm-ctx-sec"><small>الخطوة الجاية</small><div class="pt-next u${I.n.urg}"><div><b>${esc(I.n.text)}</b><span>${esc(I.n.why)}</span></div></div></div>
          <div class="cm-ctx-sec"><small>الموعد الجاي</small><b>${nx?date(nx.date)+" · "+time(nx.time):"مفيش"}</b>${nx?`<span class="muted">${esc(nx.clinician)}</span>`:""}</div><div class="cm-ctx-sec"><small>الأداء</small>${ptTrend(I)}</div>
          <div class="cm-ctx-btns"><button class="btn btn-outline" onclick="openPatient('${p.id}')">فتح الملف</button><button class="btn btn-outline" onclick="ptBook('${p.id}')">احجز</button></div>
          <p class="muted" style="font-size:11.5px">الرسايل هنا بتظهر لولي الأمر في بوابة الأسرة، ولو محتاج توصل أسرع ابعتها واتساب من فوق.</p>`}}
      else if(T.group==="dept"){const id=T.id.slice(5);const d=state.departments.find(x=>x.id===id);if(d){const S=deptStats(d);
        h=`<div class="cm-ctx-h">${ic(d.icon,16)} ${esc(d.name)}</div><div class="dh-nums"><div><b>${S.present}/${S.staff.length}</b><small>حاضر</small></div><div><b>${S.done}/${S.todayA.length}</b><small>جلسات</small></div><div class="${S.running.length?"live":""}"><b>${S.running.length}</b><small>شغالة</small></div></div>
          <div class="cm-ctx-sec"><small>الفريق</small>${[S.sup,...S.team].filter(Boolean).map(s=>`<button class="cm-ctx-row" onclick="cmOpen('staff:${s.id}')">${deptAv(s)}<b>${esc(s.name)}</b><span>${s===S.sup?"المشرف":esc(s.role)}</span></button>`).join("")}</div>
          <div class="cm-ctx-btns"><button class="btn btn-outline" onclick="openDepartmentDetail('${d.id}');setView('departments')">صفحة القسم</button>${deptCan("plan")?`<button class="btn btn-outline" onclick="deptGo('${d.id}','plan')">جدول القسم</button>`:""}</div>`}
        else h=`<div class="cm-ctx-h">${esc(T.name)}</div><p class="muted">قناة ${esc(T.name)} لكل الفريق.</p>`}
      else if(T.group==="dev"){const dv=devById(T.devId);if(dv){const st=devStatus(dv);const s=dv.mode==="personal"?personById(dv.staffId):st.who;const r=s?ipRecords().find(x=>x.id===s.id):null;
        h=`<div class="cm-ctx-h">${ic("tablet",16)} ${esc(dv.name)}</div><div class="cm-ctx-sec"><small>الحالة</small><b>${esc(st.t)}</b></div>${r&&r.sess&&!r.sess.locked?`<div class="cm-ctx-sec"><small>الجلسة دلوقتي</small><b>${esc(r.sess.patient)}</b><span class="muted">${esc(r.m.cur?r.m.cur.text:"")} · ${r.m.cur?r.m.cur.trials.length:0}/${DTT_BLOCK} · ${r.m.indep==null?"—":r.m.indep+"%"}</span></div>`:""}
          ${r&&r.alerts.length?`<div class="cm-ctx-sec">${r.alerts.map(a=>`<div class="ip-alert l${a.lvl}">${esc(a.t)}</div>`).join("")}</div>`:""}
          <div class="cm-ctx-btns">${s?`<button class="btn btn-outline" onclick="ipOpen('${s.id}')">شوف الآيباد</button>`:""}<button class="btn btn-outline" onclick="state_plGoIpad('${s?s.id:""}')">الجدول والصلاحيات</button></div>`}}
      else if(T.group==="staff"){const s=personById(T.sid);if(s){const d=state.departments.find(x=>x.id===s.department);const run=Object.values(state.liveBoard||{}).find(b=>b.staffId===s.id&&!b.locked);
        h=`<div class="cm-ctx-h">${deptAv(s,"lg")} ${esc(s.name)}</div><div class="cm-ctx-sec"><small>الوظيفة</small><b>${esc(s.role||"")}</b><span class="muted">${d?esc(d.name):""}</span></div><div class="cm-ctx-sec"><small>النهارده</small><b>${s.present?"حاضر":"مش حاضر"}</b><span class="muted">الدوام ${esc(s.schedule||"—")}</span></div>
          ${run?`<div class="dh-run">في جلسة مع ${esc(run.patient)} · ${run.trial}/${DTT_BLOCK}</div>`:""}<div class="cm-ctx-btns">${deptCan("ipads")?`<button class="btn btn-outline" onclick="ipOpen('${s.id}')">شوف آيباده</button>`:""}</div>`}}
      return h}
    // ---- الإرسال ----
    function cmOpen(id){state.cmTh=id;state.cmOpen=true;(state.cmRead=state.cmRead||{})[id]=Date.now();persist();render();cmScroll()}
    function cmScroll(){setTimeout(()=>{const b=document.getElementById("cm-msgs");if(b)b.scrollTop=b.scrollHeight;const i=document.getElementById("cm-input");if(i&&window.innerWidth>700)i.focus()},20)}
    function cmSet(k,v){state[k]=v;render();cmScroll()}
    function cmSearch(v){state.cmQ=v;render();const i=document.getElementById("cm-q");if(i){i.focus();i.setSelectionRange(v.length,v.length)}}
    function cmQuick(t){const i=document.getElementById("cm-input");if(!i)return;i.value=t;if((state.cmTh||"agent")==="agent")document.querySelector(".cm-compose").requestSubmit();else i.focus()}
    function cmPush(o){const me=cmMe();const m={id:"msg-"+Date.now()+"-"+Math.random().toString(36).slice(2,5),fromId:me.id,fromName:me.name,fromDept:me.dept,date:todayISO(),at:Date.now(),status:"مُرسلة",read:false,kind:"رسالة",...o};state.messages.unshift(m);return m}
    function cmSendTo(th,text,opt){opt=opt||{};const me=cmMe();
      if(th.startsWith("dept:")){const d=th.slice(5);return cmPush({toDept:d,toName:commDeptLabel(d),kind:opt.decision?"قرار":"رسالة",text})}
      if(th.startsWith("staff:")){const s=personById(th.slice(6));return cmPush({toId:s.id,toName:s.name,toDept:s.department||null,kind:opt.decision?"قرار":"رسالة",text})}
      if(th.startsWith("fam:")){const p=state.patients.find(x=>x.id===th.slice(4));return cmPush({toDept:"family",patientId:p.id,toName:(p.guardian||p.name)+" (أسرة "+p.name.split(" ")[0]+")",text})}
      if(th.startsWith("dev:")){const dv=devById(th.slice(4));const s=dv&&dv.mode==="personal"?personById(dv.staffId):null;if(opt.screen!==false&&dv)ipDevCmd(dv.id,"msg",text);return cmPush({ch:th,toId:s?s.id:null,toName:dv?dv.name:"",screen:opt.screen!==false,text})}
    }
    function cmSend(e){e.preventDefault();const fd=new FormData(e.target);const text=(fd.get("t")||"").trim();if(!text)return;const th=state.cmTh||"agent";
      if(th==="agent"){cmPush({ch:"agent",agentMe:true,mine:true,text,status:"معتمدة"});(state.cmRead=state.cmRead||{}).agent=Date.now();persist();render();cmScroll();cmAgent(text);return}
      cmSendTo(th,text,{decision:!!fd.get("decision"),screen:fd.get("screen")?true:th.startsWith("dev:")?false:undefined});audit("رسالة من أوان تواصل",th);(state.cmRead=state.cmRead||{})[th]=Date.now();persist();render();cmScroll()}
    function cmMeet(th){const me=cmMe();let title="اجتماع سريع",kind="department",deps=[],parts=[],pid=null;
      if(th.startsWith("dept:")){const d=th.slice(5);title="اجتماع "+commDeptLabel(d);deps=state.departments.some(x=>x.id===d)?[d]:[];parts=state.staff.filter(s=>s.department===d).map(s=>s.id)}
      else if(th.startsWith("fam:")){const p=state.patients.find(x=>x.id===th.slice(4));kind="family";pid=p.id;title="اجتماع مع أسرة "+p.name.split(" ")[0]}
      else if(th.startsWith("staff:")){const s=personById(th.slice(6));title="اجتماع مع "+s.name;parts=[s.id]}
      else if(th.startsWith("dev:")){const dv=devById(th.slice(4));if(dv&&dv.staffId){parts=[dv.staffId];title="اجتماع مع "+(personById(dv.staffId)||{}).name}}
      if(me.id&&!parts.includes(me.id))parts.push(me.id);
      const m={id:"mt-"+Date.now(),title,kind,departments:deps,patientId:pid,participants:parts,status:"مجدولة",scheduledDate:todayISO(),startedAt:null,endedAt:null,durationSeconds:0,notes:"",actionItems:[],summaryText:"",audience:kind==="family"?"family":"internal"};
      state.meetings.unshift(m);if(th!=="agent")cmSendTo(th,`📹 دعوة لاجتماع أوان كونكت: «${title}» — ادخل من أوان تواصل أو كونكت.`,{screen:true});audit("بدء اجتماع من أوان تواصل",title);persist();
      if(state.role==="management"||state.role==="supervisor")openMeetingRoom(m.id);else{render();notify("اتعمل الاجتماع واتبعتت الدعوة")}}
    function cmDictate(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;const r=new SR();r.lang="ar-SA";r.onresult=ev=>{const i=document.getElementById("cm-input");if(i){i.value=ev.results[0][0].transcript;i.focus()}};r.start();notify("اتكلم دلوقتي…")}
    // ---- الوكيل ----
    function cmAgentFeed(T){const live={id:"agent-live",agent:true,at:Date.now(),text:"",html:cmAgentBrief(),acts:[{l:"افتح غرفة المراقبة",js:"setView('liveOps')"},{l:"الملفات حسب الأولوية",js:"state_ptSeg('sup')"}]};return [live,...T.ms]}
    function cmAgentBrief(){const nx=awanNextAll();const sup=nx.filter(x=>x.sup).length;const recs=ipRecords();const run=recs.filter(r=>r.status==="session").length;const al=recs.filter(r=>r.alerts.length).length;
      const today=localDateOf(new Date());const ap=state.appointments.filter(a=>a.date===today&&a.status!=="ملغي");const unread=cmThreads().filter(t=>t.id!=="agent").reduce((a,t)=>a+t.unread,0);
      return `<b>${new Date().getHours()<12?"صباح الخير":"مساء الخير"} 🌿 ده الوضع دلوقتي:</b><ul><li>${run} جلسة شغالة على الآيبادات${al?` · <b>${al} آيباد عليه تنبيه</b>`:""}</li><li>${ap.length} موعد النهارده، خلص منهم ${ap.filter(a=>a.status==="مكتمل").length}</li><li>${sup?`<b>${sup} طفل محتاج قرار مشرف</b>`:"مفيش أطفال محتاجين تدخل مشرف"}</li><li>${unread?`${unread} رسالة مش مقروءة في المحادثات`:"كل الرسايل مقروءة"}</li></ul>`}
    function state_ptSeg(k){state.ptSeg=k;setView("patients")}
    function cmFindPatient(t){const ps=state.patients.filter(p=>!p.archived);let best=null,score=0;ps.forEach(p=>{p.name.split(" ").forEach((w,i)=>{if(w.length>2&&t.includes(w)){const s=i===0?3:1;if(s>score){score=s;best=p}}})});return best}
    function cmFindDept(t){return state.departments.find(d=>t.includes(d.name.replace("قسم ","").replace("القسم ","")))||(/إدار/.test(t)?{id:"management",name:"الإدارة العامة"}:/استقبال/.test(t)?{id:"reception",name:"الاستقبال"}:null)}
    function cmReply(html,acts){const m=cmPush({ch:"agent",agent:true,fromId:null,fromName:"وكيل أوان",fromDept:null,text:html.replace(/<[^>]+>/g," "),html,acts:acts||[]});m.status="معتمدة";persist();render();cmScroll()}
    function cmList(items,f){return `<ul>${items.map(f).join("")}</ul>`}
    async function cmAgent(t){const x=t.replace(/[؟?!.]/g," ").trim();const today=localDateOf(new Date());
      const typing=document.getElementById("cm-msgs");if(typing)typing.insertAdjacentHTML("beforeend",`<div class="cm-b them agent" id="cm-typing"><div class="cm-bb"><span class="cm-dots"><i></i><i></i><i></i></span></div></div>`),cmScroll();
      await new Promise(r=>setTimeout(r,450));
      // أوامر الإرسال
      let mm=x.match(/^(ابعت|ارسل|أرسل|بلغ|بلّغ)\s+(.+?)\s*[:،,]\s*(.+)$/)||x.match(/^(ابعت|ارسل|أرسل|بلغ|بلّغ)\s+(ل\S+\s+\S+(?:\s+\S+)?)\s+(إن|ان|بأن)\s+(.+)$/);
      if(mm){const target=mm[2];const msg=(mm[4]||mm[3]).trim();const p=/أسر|أهل|ولي/.test(target)?cmFindPatient(target):null;const d=!p?cmFindDept(target):null;const s=!p&&!d?state.staff.find(y=>target.includes(y.name.replace(/^(أ\.|د\.)\s*/,"").split(" ")[0])):null;
        const dv=!p&&!d&&!s&&/آيباد/.test(target)?(state.devices||[]).find(v=>target.includes(v.name.replace("آيباد ","").split(" ")[0])):null;
        const th=p?"fam:"+p.id:d?"dept:"+d.id:s?"staff:"+s.id:dv?"dev:"+dv.id:null;
        if(th){cmSendTo(th,msg,{screen:true});audit("الوكيل بعت رسالة",th);cmReply(`تمام ✓ بعت «${esc(msg)}» لـ <b>${esc(p?"أسرة "+p.name:d?d.name:s?s.name:dv.name)}</b>${p?" وهتظهر لهم في بوابة الأسرة":dv?" وظهرت على شاشة الآيباد":""}.`,[{l:"افتح المحادثة",js:`cmOpen('${th}')`},...(p?[{l:"ابعتها واتساب كمان",js:`window.open('${ptWa(p,msg).replace(/'/g,"\\'")}','_blank')`}]:[])]);return}
        cmReply("مش لاقي الجهة دي. جرّب مثلًا: <b>ابعت لأسرة خالد: الجلسة اتأجلت لبكرة</b> أو <b>ابعت لقسم التخاطب: اجتماع الساعة 2</b>");return}
      if(/اجتماع|ميتنج|كونكت/.test(x)){const d=cmFindDept(x),p=cmFindPatient(x),s=state.staff.find(y=>x.includes(y.name.replace(/^(أ\.|د\.)\s*/,"").split(" ")[0]));const th=p&&/أسر|أهل/.test(x)?"fam:"+p.id:d?"dept:"+d.id:s?"staff:"+s.id:null;
        if(th){cmReply(`هعمل اجتماع أوان كونكت مع <b>${esc(p&&th.startsWith("fam")?"أسرة "+p.name:d?d.name:s.name)}</b> وأبعت الدعوة.`,[{l:"ابدأ الاجتماع دلوقتي",js:`cmMeet('${th}')`}]);return}}
      if(/مشرف|قرار|تدخل/.test(x)){const L=awanNextAll().filter(n=>n.sup);cmReply(L.length?`<b>${L.length} طفل محتاج قرار مشرف:</b>`+cmList(L,n=>`<li><b>${esc(n.name)}</b> — ${esc(n.text)}</li>`):"مفيش أطفال محتاجين تدخل مشرف دلوقتي ✓",L.slice(0,3).map(n=>({l:"افتح "+n.name.split(" ")[0],js:n.go})));return}
      if(/انقطا|منقطع|غياب طويل/.test(x)){const L=awanNextAll().filter(n=>/انقطاع/.test(n.text));cmReply(L.length?`<b>${L.length} طفل منقطع:</b>`+cmList(L,n=>`<li><b>${esc(n.name)}</b> — ${esc(n.why)}</li>`):"مفيش أطفال منقطعين ✓",[{l:"شوفهم في الملفات",js:"state_ptSeg('gap')"},...L.slice(0,2).map(n=>({l:"ابعت لأسرة "+n.name.split(" ")[0],js:`cmOpen('fam:${n.pid}')`}))]);return}
      if(/آيباد|ايباد|جهاز|أجهزة|تنبيه/.test(x)){const R=ipRecords();const al=R.filter(r=>r.alerts.length);const run=R.filter(r=>r.status==="session").length;
        cmReply(`<b>${R.filter(r=>r.status!=="offline").length} جهاز متصل، ${run} في جلسة.</b>`+(al.length?cmList(al.slice(0,8),r=>`<li><b>${esc(r.name)}</b> — ${esc(r.alerts[0].t)}</li>`):"<br>مفيش تنبيهات على الأجهزة ✓"),[{l:"غرفة المراقبة",js:"setView('liveOps')"},...al.slice(0,2).map(r=>({l:"افتح آيباد "+r.name.replace(/^(أ\.|د\.)\s*/,"").split(" ")[0],js:`ipOpen('${r.id}')`}))]);return}
      if(/غايب|غياب|حاضر|حضور/.test(x)){const ab=state.staff.filter(s=>!s.present&&(s.clinical||s.roleCategory==="staff"));cmReply(ab.length?`<b>${ab.length} من الفريق مش حاضرين:</b>`+cmList(ab,s=>`<li>${esc(s.name)} — ${esc(s.role||"")}</li>`):"الفريق كله حاضر ✓",ab.length&&deptCan("plan")?[{l:"وزّع جلساتهم من جدول القسم",js:`deptGo('${ab[0].department||"speech"}','plan')`}]:[]);return}
      if(/النهارده|جلسات|مواعيد|جدول/.test(x)){const ap=state.appointments.filter(a=>a.date===today&&a.status!=="ملغي").sort((a,b)=>a.time.localeCompare(b.time));cmReply(ap.length?`<b>${ap.length} موعد النهارده:</b>`+cmList(ap.slice(0,12),a=>`<li>${time(a.time)} · <b>${esc(a.patient)}</b> مع ${esc(a.clinician)}${a.status==="مكتمل"?" ✓":""}</li>`):"مفيش مواعيد النهارده.",deptCan("plan")?[{l:"جدول القسم",js:"setView('deptPlan')"}]:[{l:"المواعيد",js:"setView('schedule')"}]);return}
      if(/لخص|ملخص|تقرير اليوم/.test(x)){let txt="";try{txt=dailyRulesText()}catch(_e){}cmReply(`<div style="white-space:pre-wrap">${esc(txt||"مفيش بيانات كفاية للملخص.")}</div>`,[{l:"ملخص اليوم في غرفة المراقبة",js:"setView('liveOps');opsDaily()"}]);return}
      const p=cmFindPatient(x);if(p){const I=ptInfo(p);const nx=I.up[0];cmReply(`<b>${esc(p.name)}</b> · ${esc(I.age)} · ${esc(p.program||"")}<ul><li>المرحلة: ${esc(NX_STAGES[I.n.stage])}</li><li>الخطوة الجاية: <b>${esc(I.n.text)}</b> (${esc(I.n.owner)})</li><li>الموعد الجاي: ${nx?date(nx.date)+" "+time(nx.time)+" مع "+esc(nx.clinician):"مفيش"}</li><li>جلسات مكتملة: ${I.done.length}${I.att!=null?" · الحضور "+I.att+"%":""}</li></ul>`,[{l:"فتح الملف",js:`openPatient('${p.id}')`},{l:"راسل الأسرة",js:`cmOpen('fam:${p.id}')`},{l:"احجز",js:`ptBook('${p.id}')`}]);return}
      if(aiReady()){try{const ctx=`مركز تأهيل. عدد الأطفال ${state.patients.filter(p=>!p.archived).length}. محتاجين مشرف ${awanNextAll().filter(n=>n.sup).length}. جلسات شغالة ${ipRecords().filter(r=>r.status==="session").length}. مواعيد النهارده ${state.appointments.filter(a=>a.date===today).length}.`;
        const out=await openaiJSON("أنت وكيل إدارة ذكي لمركز تأهيل في السعودية. رد باللهجة المصرية البسيطة وباختصار. متقدمش تشخيص طبي. رجّع JSON: {\"reply\":\"...\"}",ctx+"\nالسؤال: "+deidentify(x,null));cmReply(esc(out.reply||"…"));return}catch(err){}}
      cmReply(`ممكن تسألني مثلًا:<ul><li>مين محتاج مشرف؟</li><li>أي آيباد عليه تنبيه؟</li><li>جلسات النهارده</li><li>الأطفال المنقطعين</li><li>ابعت لأسرة خالد: الجلسة اتأجلت</li><li>اعمل اجتماع مع قسم التخاطب</li><li>أو اكتب اسم أي طفل</li></ul>`)}

    communicationHubView=cmView;
    const _svCm=setView;setView=function(v,...r){if(v==="communicationHub")state.cmOpen=false;return _svCm(v,...r)};
    const _renderCm=render;render=function(){_renderCm();if(state.view==="communicationHub"){const b=document.getElementById("cm-msgs");if(b)b.scrollTop=b.scrollHeight}};
    const _connectOrig=connectView;connectView=function(){return `<div class="cm-connect-bar"><div><b>${ic("chat",16)} أوان كونكت بقى جوه أوان تواصل</b><small>ابدأ اجتماع من أي محادثة (قسم، أسرة، آيباد، زميل) بزرار «اجتماع»، والقرارات بتتعتمد من المحادثة نفسها.</small></div><button class="btn btn-primary" onclick="setView('communicationHub')">افتح أوان تواصل</button></div>`+_connectOrig()};
    // =================== الإحالات + المواعيد + الفريق: مربوطين بالإدارة الرقمية ===================
    const RF_STAGES=[["new","جديدة","ابعت رابط دراسة الحالة أو اتصل"],["triage","قيد الفرز","حدد القسم المناسب"],["sent","اتبعت رابط دراسة الحالة","مستنيين الأسرة تملا"],["case","دراسة الحالة وصلت","حوّلها لملف واحجز تقييم"],["done","اتحولت لملف","المحرك بيتابع الطفل"]];
    const RF_LEGACY={"جديدة":"new","قيد الفرز":"triage","تم التواصل":"sent","مقبولة":"case","أُلحق بالملف الصحي":"done"};
    function rfEnsure(){(state.referrals||[]).forEach((r,i)=>{if(!r.id)r.id="rf-"+i+"-"+(Date.parse(r.date)||0);if(!r.stage)r.stage=r.patientId&&r.type!=="تقرير طبي"?"done":(RF_LEGACY[r.status]||"new");if(!r.receivedAt)r.receivedAt=Date.parse(r.date)||Date.now()})}
    function rfDept(r){const t=[r.name,r.note,r.type,r.need].join(" ");return /سلوك|توحد|ABA|نوبات|عدوان/.test(t)?"aba":/نطق|كلام|لغة|تأتأة|تخاطب|سمع/.test(t)?"speech":/حرك|حسي|يد|كتابة|وظيفي/.test(t)?"ot":/مدرس|دمج|تعلم|أكاديمي/.test(t)?"inclusion":/نفس|قلق|انتباه/.test(t)?"psych":"speech"}
    function rfAge(r){return Math.floor((Date.now()-(r.receivedAt||Date.now()))/864e5)}
    function rfCaseLink(){return location.href.split("#")[0]+"#case"}
    function referralsSmart(){rfEnsure();const R=state.referrals.filter(r=>r.type!=="تقرير طبي"&&r.stage!=="archived");const med=state.referrals.filter(r=>r.type==="تقرير طبي");
      const over=R.filter(r=>r.stage==="new"&&rfAge(r)>=2).length;const done=R.filter(r=>r.stage==="done").length;const conv=R.length?Math.round(done/R.length*100):0;
      const drafts=(state.smartIntakes||[]).filter(x=>x.status==="draft").length;
      let h=head("الإحالات / 04","مسار الإحالات","كل إحالة ماشية في مسار لحد ما تبقى ملف وتقييم محجوز. القسم المقترح بيتحدد لوحده، والمتأخر بيتعلّم.",`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline" onclick="rfCopyLink()">${ic("chat",14)} رابط دراسة الحالة</button><button class="btn btn-primary" onclick="openModal('referral')">＋ إحالة جديدة</button></div>`);
      h+=`<section class="dh-kpis">${[["إحالات مفتوحة",R.filter(r=>r.stage!=="done").length,""],["متأخرة أكتر من يومين",over,over?"warn":""],["اتحولت لملفات",done,""],["نسبة التحويل",conv+"%",""],["دراسات حالة مستنية اعتماد",drafts,drafts?"warn":""],["تقارير طبية",med.length,""]].map(([l,v,c])=>`<div class="dh-kpi ${c}"><b>${v}</b><small>${l}</small></div>`).join("")}</section>`;
      h+=`<section class="rf-board">${RF_STAGES.map(([k,l,hint])=>{const col=R.filter(r=>r.stage===k);return `<div class="rf-col s-${k}"><div class="rf-col-h"><b>${l}</b><em>${col.length}</em></div><small class="rf-hint">${hint}</small>${col.map(rfCard).join("")||`<div class="pt-col-e">—</div>`}</div>`}).join("")}</section>`;
      if(state.rfConvert)h+=rfConvertHtml();
      if(med.length)h+=`<section class="card" style="margin-top:14px"><div class="card-head"><h2>${ic("medical",16)} تقارير طبية واردة</h2></div><div class="list">${med.map(r=>{const i=state.referrals.indexOf(r);return `<div class="list-row"><div class="list-main"><strong>${esc(r.name)}</strong><small>${esc(r.person||"")} · ${date(r.date)} · ${esc(r.status)}</small></div>${r.patientId?`<button class="btn btn-outline dh-mini" onclick="openModal('medReferral',${i})">عرض</button>${r.status==="أُلحق بالملف الصحي"?"":`<button class="btn btn-primary dh-mini" onclick="attachMedicalReport(${i})">إلحاق بالملف الصحي</button>`}`:`<span class="muted" style="font-size:11px">مفيش ملف مطابق</span>`}</div>`}).join("")}</div></section>`;
      return h}
    function rfCard(r){const age=rfAge(r);const d=state.departments.find(x=>x.id===(r.dept||rfDept(r)));const p=r.patientId&&state.patients.find(x=>x.id===r.patientId);const late=r.stage==="new"&&age>=2;
      const acts={new:[["ابعت رابط دراسة الحالة",`rfSend('${r.id}')`,1],["فرز",`rfStage('${r.id}','triage')`]],triage:[["ابعت رابط دراسة الحالة",`rfSend('${r.id}')`,1],["حوّل لملف مباشرة",`rfConvertOpen('${r.id}')`]],sent:[["وصلت دراسة الحالة",`rfStage('${r.id}','case')`,1],["ابعت تذكير",`rfSend('${r.id}',1)`]],case:[["حوّل لملف واحجز تقييم",`rfConvertOpen('${r.id}')`,1]],done:p?[["فتح الملف",`openPatient('${p.id}')`,1],["راسل الأسرة",`setView('communicationHub');cmOpen('fam:${p.id}')`]]:[]}[r.stage]||[];
      return `<article class="rf-card ${late?"late":""} pr-${r.priority==="عالية"?"h":r.priority==="متوسطة"?"m":"l"}"><div class="rf-top"><b>${esc(r.childName||r.name)}</b>${pill(r.priority||"عادية")}</div>
        <small>${esc(r.person||"")} · ${esc(r.type||"")}</small>${r.note?`<small class="muted">${esc(r.note)}</small>`:""}
        <div class="rf-meta"><span>${ic(d?d.icon:"departments",12)} ${esc(d?d.name:"")}<i>${r.dept?"":" · مقترح"}</i></span><span class="${late?"rf-late":""}">${age===0?"النهارده":age===1?"امبارح":"من "+age+" يوم"}</span></div>
        ${p?`<div class="rf-next"><small>الخطوة الجاية من المحرك</small><b>${esc(awanNext(p).text)}</b></div>`:""}
        <div class="rf-acts">${acts.map(([l,js,pri])=>`<button class="btn ${pri?"btn-primary":"btn-outline"} dh-mini" onclick="${js}">${l}</button>`).join("")}${r.stage!=="done"?`<button class="btn btn-outline dh-mini rf-x" onclick="rfStage('${r.id}','archived')" title="أرشفة">✕</button>`:""}</div></article>`}
    function rfById(id){rfEnsure();return state.referrals.find(r=>r.id===id)}
    function rfStage(id,st){const r=rfById(id);if(!r)return;r.stage=st;r.status={new:"جديدة",triage:"قيد الفرز",sent:"تم التواصل",case:"مقبولة",done:"مقبولة",archived:"مؤرشفة"}[st]||r.status;audit("تحديث مسار إحالة",(r.childName||r.name)+" ← "+st);persist();render()}
    function rfSend(id,reminder){const r=rfById(id);if(!r)return;const msg=`${reminder?"تذكير: ":""}أهلاً بحضرتك 🌿 معاكم ${state.center.name}. وصلتنا إحالة ${r.childName?"لـ "+r.childName:"لطفلكم"}، ونرجو تعبئة دراسة الحالة الإلكترونية (5 دقايق) عشان نحجز التقييم: ${rfCaseLink()}`;
      const ph=r.phone&&typeof toIntlWhatsapp==="function"?toIntlWhatsapp(r.phone):"";window.open(ph?`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`:waLink(msg),"_blank","noopener");r.stage="sent";r.status="تم التواصل";r.sentAt=Date.now();audit("إرسال رابط دراسة الحالة لإحالة",r.childName||r.name);persist();render();notify("اتفتح واتساب بالرسالة · الإحالة اتنقلت لـ «اتبعت الرابط»")}
    function rfCopyLink(){const t=rfCaseLink();try{navigator.clipboard.writeText(t).then(()=>notify("اتنسخ رابط دراسة الحالة"),()=>notify(t))}catch(_e){notify(t)}}
    function rfConvertOpen(id){state.rfConvert=id;render();setTimeout(()=>{const f=document.querySelector(".rf-conv input");if(f){f.focus();f.scrollIntoView({block:"center",behavior:"smooth"})}},30)}
    function rfConvertHtml(){const r=rfById(state.rfConvert);if(!r)return "";const dep=r.dept||rfDept(r);
      return `<div class="pl-scrim" onclick="if(event.target===this){state_rfClose()}"><div class="pl-pop rf-conv"><h3>تحويل الإحالة لملف + حجز تقييم</h3><p class="muted">${esc(r.name)} · ${esc(r.person||"")}</p><form onsubmit="rfConvert(event,'${r.id}')"><div class="form-grid">
        <div class="field"><label>اسم الطفل</label><input class="input" name="child" required value="${esc(r.childName||"")}"></div><div class="field"><label>العمر</label><input class="input" name="age" placeholder="مثال: 5 سنوات"></div>
        <div class="field"><label>ولي الأمر</label><input class="input" name="guardian" value="${esc(r.guardian||"")}"></div><div class="field"><label>الجوال</label><input class="input" name="phone" value="${esc(r.phone||"")}" placeholder="05xxxxxxxx" style="direction:ltr;text-align:right"></div>
        <div class="field"><label>القسم</label><select class="select" name="dept">${state.departments.map(d=>`<option value="${d.id}" ${d.id===dep?"selected":""}>${esc(d.name)}</option>`).join("")}</select></div><div class="field"><label>الاحتياج</label><input class="input" name="need" value="${esc(r.need||r.type||"")}"></div></div>
        <p class="muted" style="font-size:12px">المنصة هتفتح الملف، وتحجز تقييم أولي في أقرب موعد فاضي لأخصائي القسم، وتبعت تأكيد للأسرة في أوان تواصل.</p>
        <div class="dt-actions"><button class="btn btn-primary">حوّل واحجز</button><button type="button" class="btn btn-outline" onclick="state_rfClose()">إلغاء</button></div></form></div></div>`}
    function state_rfClose(){state.rfConvert=null;render()}
    function rfConvert(e,id){e.preventDefault();const r=rfById(id);const f=new FormData(e.target);const dep=f.get("dept");const pid="p"+Date.now();
      const p={id:pid,name:f.get("child").trim(),file:"AWN-"+String(1000+state.patients.length+1),age:f.get("age")||"",need:f.get("need")||"",program:(state.departments.find(d=>d.id===dep)||{}).name||"",school:"",guardian:f.get("guardian")||"",phone:f.get("phone")||"",status:"نشط",notes:"اتحول من إحالة: "+r.name,goal:"سيتحدد بعد التقييم الأولي.",next:"",code:"REF-"+pid.slice(-4),archived:false,referralId:r.id};p.health=defaultHealth(p);state.patients.unshift(p);
      const staff=state.staff.filter(s=>s.department===dep&&(s.clinical||s.roleCategory==="staff"));const pick=staff.map(s=>({s,slot:intakeNextSlot(s.name)})).sort((a,b)=>(a.slot.date+a.slot.time).localeCompare(b.slot.date+b.slot.time))[0];
      let apt=null;if(pick){apt={id:"apt-"+Date.now(),date:pick.slot.date,time:pick.slot.time,duration:45,patient:p.name,service:"تقييم أولي",clinician:pick.s.name,room:"غرفة التقييم",status:"مجدول",autoBooked:true,newForStaff:true};state.appointments.push(apt)}
      Object.assign(r,{stage:"done",status:"مقبولة",patientId:pid,childName:p.name,dept:dep,phone:p.phone,guardian:p.guardian});
      if(apt&&typeof cmSendTo==="function")cmSendTo("fam:"+pid,`أهلاً بحضرتك 🌿 اتفتح ملف ${p.name.split(" ")[0]} في ${state.center.name}، وموعد التقييم الأولي ${date(apt.date)} الساعة ${time(apt.time)} مع ${apt.clinician}.`);
      audit("تحويل إحالة لملف وحجز تقييم",p.name);state.rfConvert=null;persist();render();notify(apt?`اتفتح الملف واتحجز تقييم ${date(apt.date)} ${time(apt.time)} مع ${apt.clinician}`:"اتفتح الملف · مفيش أخصائي في القسم للحجز")}
    // ---- المواعيد ----
    function scheduleSmart(){const today=localDateOf(new Date());const now=new Date();const nowM=now.getHours()*60+now.getMinutes();
      const ap=state.appointments.filter(a=>a.date===today&&a.status!=="ملغي").sort((a,b)=>a.time.localeCompare(b.time));
      const visits=(state.childVisits||[]).filter(v=>v.date===today);const recs=ipRecords();
      const live=a=>recs.find(r=>r.sess&&!r.sess.locked&&r.sess.patient===a.patient);const arrived=a=>visits.find(v=>v.name===a.patient);
      const st=a=>{const m=sipadMin(a.time),d=+a.duration||SIPAD_SLOT;if(a.status==="مكتمل")return "done";if(a.status==="غائب")return "absent";if(live(a))return "live";if(nowM>m+15&&!arrived(a))return "noshow";if(nowM>m+5)return "late";return "up"};
      const S={up:0,live:0,done:0,late:0,noshow:0,absent:0};ap.forEach(a=>S[st(a)]++);
      const conf=scConflicts();const needy=awanNextAll().filter(n=>/جدول|انقطاع|احجز/.test(n.text)).slice(0,8);
      let h=`<section class="dh-kpis sc-kpis">${[["مواعيد النهارده",ap.length,""],["وصلوا الباب",ap.filter(a=>arrived(a)).length,""],["شغالة على الآيباد",S.live,S.live?"live":""],["خلصت",S.done,""],["متأخرة",S.late,S.late?"warn":""],["مجوش",S.noshow+S.absent,S.noshow?"bad":""]].map(([l,v,c])=>`<div class="dh-kpi ${c}"><b>${v}</b><small>${l}</small></div>`).join("")}</section>`;
      h+=`<div class="sc-grid"><section class="card"><div class="card-head"><h2>${ic("pulse",16)} النهارده لحظة بلحظة</h2><div style="display:flex;gap:6px">${deptCan("plan")?`<button class="btn btn-outline dh-mini" onclick="setView('deptPlan')">جدول القسم بالسحب</button>`:""}<button class="btn btn-outline dh-mini" onclick="setView('liveOps')">غرفة المراقبة</button></div></div>
        <div class="sc-list">${ap.map(a=>{const s=st(a);const L=live(a);const v=arrived(a);const p=state.patients.find(x=>x.name===a.patient);
          return `<div class="sc-row s-${s}"><time>${time(a.time)}</time><div class="sc-main"><b>${esc(a.patient)}</b><small>${esc(a.clinician)} · ${esc(a.service||"")} · ${esc(a.room||"")}</small></div>
            <div class="sc-state">${s==="live"?`<span class="sc-tag live">على الآيباد ${L.m.cur?L.m.cur.trials.length:0}/${DTT_BLOCK}</span>`:s==="done"?`<span class="sc-tag done">خلصت ✓</span>`:s==="absent"?`<span class="sc-tag bad">غياب</span>`:s==="noshow"?`<span class="sc-tag bad">مجاش لسه</span>`:s==="late"?`<span class="sc-tag warn">${v?"وصل · الجلسة لسه ما بدأتش":"متأخر"}</span>`:`<span class="sc-tag">${v?"وصل الباب ✓":"جاي"}</span>`}</div>
            <div class="sc-acts">${s==="live"&&L?`<button class="btn btn-outline dh-mini" onclick="ipOpen('${L.id}')">شوف الآيباد</button>`:""}${s==="noshow"?`<button class="btn btn-primary dh-mini" onclick="scAbsent('${a.id}')">سجّل غياب + بلّغ الأسرة</button>`:""}${s==="absent"&&!a.compBooked?`<button class="btn btn-outline dh-mini" onclick="scCompensate('${a.id}')">احجز تعويضي</button>`:""}${p?`<button class="btn btn-outline dh-mini" onclick="setView('communicationHub');cmOpen('fam:${p.id}')">راسل</button>`:""}</div></div>`}).join("")||`<div class="empty">مفيش مواعيد النهارده.${deptCan("plan")?" رتّبها من «جدول القسم».":""}</div>`}</div></section>
        <div class="sc-side"><section class="card"><div class="card-head"><h2>${ic("idea",16)} محتاجين موعد</h2><span class="muted">من محرك «إيه التالي»</span></div>${needy.map(n=>`<div class="sc-need"><div><b>${esc(n.name)}</b><small>${esc(n.why)}</small></div><button class="btn btn-primary dh-mini" onclick="scAutoBook('${n.pid}')">احجز تلقائي</button></div>`).join("")||`<div class="empty" style="padding:14px">كل الأطفال عندهم مواعيد ✓</div>`}</section>
          <section class="card"><div class="card-head"><h2>${ic("bell",16)} تعارضات</h2><span class="muted">${conf.length}</span></div>${conf.slice(0,6).map(c=>`<div class="sc-conf"><b>${esc(c.who)}</b><small>${date(c.date)} ${time(c.a.time)} · ${esc(c.a.patient)} و ${esc(c.b.patient)}</small></div>`).join("")||`<div class="empty" style="padding:14px">مفيش تعارضات ✓</div>`}${conf.length&&deptCan("plan")?`<button class="btn btn-outline dh-mini" onclick="setView('deptPlan')">حلّها في جدول القسم</button>`:""}</section></div></div>`;
      return h}
    function scConflicts(){const today=localDateOf(new Date());const ap=state.appointments.filter(a=>a.date>=today&&a.status!=="ملغي"&&a.status!=="مكتمل");const out=[];const span=a=>[sipadMin(a.time),sipadMin(a.time)+(+a.duration||SIPAD_SLOT)];
      for(let i=0;i<ap.length;i++)for(let j=i+1;j<ap.length;j++){const a=ap[i],b=ap[j];if(a.date!==b.date)continue;const [a1,a2]=span(a),[b1,b2]=span(b);if(!(a1<b2&&b1<a2))continue;
        if(a.clinician===b.clinician)out.push({who:a.clinician,date:a.date,a,b});else if(a.patient===b.patient)out.push({who:"الطفل محجوز مرتين",date:a.date,a:{...a,patient:a.patient+" مع "+a.clinician},b:{...b,patient:b.clinician}});else if(a.room&&a.room===b.room&&a.room!=="—")out.push({who:a.room,date:a.date,a,b})}return out}
    function scAbsent(id){const a=state.appointments.find(x=>x.id===id);if(!a)return;a.status="غائب";const p=state.patients.find(x=>x.name===a.patient);
      if(p&&typeof cmSendTo==="function")cmSendTo("fam:"+p.id,`أهلاً بحضرتك، ${p.name.split(" ")[0]} كان عنده جلسة النهارده الساعة ${time(a.time)} ولم يحضر. هل نحجز له جلسة تعويضية؟ 🌿`);
      audit("تسجيل غياب وتبليغ الأسرة",a.patient);persist();render();notify("اتسجل الغياب واتبعتت رسالة للأسرة")}
    function scCompensate(id){const a=state.appointments.find(x=>x.id===id);if(!a)return;const sl=intakeNextSlot(a.clinician);const n={id:"apt-"+Date.now(),date:sl.date,time:sl.time,duration:+a.duration||SIPAD_SLOT,patient:a.patient,service:a.service,clinician:a.clinician,room:a.room,status:"مجدول",compensationFor:a.id,newForStaff:true};state.appointments.push(n);a.compBooked=true;
      const p=state.patients.find(x=>x.name===a.patient);if(p&&typeof cmSendTo==="function")cmSendTo("fam:"+p.id,`اتحجزت جلسة تعويضية لـ ${p.name.split(" ")[0]} يوم ${date(n.date)} الساعة ${time(n.time)} مع ${n.clinician}.`);
      audit("حجز جلسة تعويضية",a.patient);persist();render();notify(`اتحجز تعويضي ${date(n.date)} ${time(n.time)}`)}
    function scAutoBook(pid){const p=state.patients.find(x=>x.id===pid);if(!p)return;const cnt={};state.appointments.filter(a=>a.patient===p.name).forEach(a=>cnt[a.clinician]=(cnt[a.clinician]||0)+1);let clin=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];clin=clin?clin[0]:(state.staff.find(s=>s.clinical&&s.roleCategory==="staff")||{}).name;
      if(!clin){notify("مفيش أخصائي متاح");return}const sl=intakeNextSlot(clin);const n={id:"apt-"+Date.now(),date:sl.date,time:sl.time,duration:SIPAD_SLOT,patient:p.name,service:"جلسة متابعة",clinician:clin,room:"—",status:"مجدول",autoBooked:true,newForStaff:true};state.appointments.push(n);
      if(typeof cmSendTo==="function")cmSendTo("fam:"+p.id,`اتحجزت جلسة لـ ${p.name.split(" ")[0]} يوم ${date(n.date)} الساعة ${time(n.time)} مع ${clin}. نتشرف بيكم 🌿`);
      audit("حجز تلقائي من محرك إيه التالي",p.name);persist();render();notify(`اتحجز ${date(n.date)} ${time(n.time)} مع ${clin} واتبلغت الأسرة`)}
    // ---- الفريق ----
    function teamSmart(){const q=(state.tmQ||"").trim();const dep=state.tmDept||"all";const today=localDateOf(new Date());const recs=ipRecords();
      const all=state.staff.filter(s=>(dep==="all"||s.department===dep||(dep==="none"&&!s.department))&&(!q||(s.name+" "+(s.role||"")).includes(q)));
      const info=s=>{const sh=sipadShift(s);const shiftMin=sh?sh[1]-sh[0]:480;const ap=state.appointments.filter(a=>a.clinician===s.name&&a.date===today&&a.status!=="ملغي");const mins=ap.reduce((x,a)=>x+(+a.duration||SIPAD_SLOT),0);
        const logs=(state.sessionLogs||[]).filter(l=>l.staffId===s.id).slice(0,30);const ind=logs.map(l=>{const m=/(\d+)% صحيح مستقل/.exec(l.notes||"");return m?+m[1]:null}).filter(x=>x!=null);
        const dv=(state.devices||[]).find(d=>d.mode==="personal"&&d.staffId===s.id);const r=recs.find(x=>x.id===s.id);const inLog=(state.attendanceLog||[]).find(x=>x.staffId===s.id&&localDateOf(new Date(x.at))===today&&x.type==="in");
        return {ap,done:ap.filter(a=>a.status==="مكتمل").length,util:Math.round(mins/shiftMin*100),ind:ind.length?Math.round(ind.reduce((a,b)=>a+b,0)/ind.length):null,dv,st:dv?devStatus(dv):null,r,inLog}};
      const I=all.map(s=>({s,...info(s)}));const clin=I.filter(x=>x.s.clinical||x.s.roleCategory==="staff");
      let h=head("الفريق / 05","فريق الرعاية","مين حاضر، ومين في جلسة على الآيباد، وحمل كل واحد النهارده، وأداؤه. وكل حاجة بضغطة.",`<button class="btn btn-primary" onclick="openModal('staff')">＋ إضافة موظف</button>`);
      h+=`<section class="dh-kpis">${[["حاضرين",I.filter(x=>x.s.present).length+"/"+I.length,""],["في جلسة دلوقتي",I.filter(x=>x.r&&x.r.status==="session").length,"live"],["حمل عالي (+90%)",clin.filter(x=>x.util>90).length,clin.some(x=>x.util>90)?"warn":""],["حمل قليل (-40%)",clin.filter(x=>x.s.present&&x.util<40).length,""],["من غير آيباد",clin.filter(x=>!x.dv).length,""],["عليهم تنبيه",I.filter(x=>x.r&&x.r.alerts.length).length,I.some(x=>x.r&&x.r.alerts.length)?"warn":""]].map(([l,v,c])=>`<div class="dh-kpi ${c}"><b>${v}</b><small>${l}</small></div>`).join("")}</section>`;
      h+=`<div class="pt-tools"><div class="pt-search">${ic("team",16)}<input class="input" id="tm-q" placeholder="دوّر باسم الموظف أو وظيفته" value="${esc(q)}" oninput="tmSearch(this.value)" autocomplete="off"></div></div>
        <div class="pt-segs">${[["all","الكل"],...state.departments.map(d=>[d.id,d.name.replace("قسم ","")]),["none","الإدارة والاستقبال"]].map(([k,l])=>`<button class="pt-seg ${dep===k?"on":""}" onclick="tmDept('${k}')">${esc(l)}</button>`).join("")}</div>`;
      h+=`<section class="tm-grid">${I.map(x=>{const s=x.s;const d=state.departments.find(y=>y.id===s.department);const isClin=s.clinical||s.roleCategory==="staff";const i=state.staff.indexOf(s);const run=x.r&&x.r.sess&&!x.r.sess.locked?x.r:null;
        return `<article class="card tm-card ${run?"run":""} ${x.r&&x.r.alerts.length?"warn":""}"><div class="dh-sup">${deptAv(s,"lg")}<div><b>${esc(s.name)}</b><small>${esc(s.role||"")}${d?" · "+esc(d.name):""}</small></div>${s.roleCategory==="supervisor"?`<span class="pill pill-gold">مشرف</span>`:""}</div>
          <div class="dh-meta"><span>${s.present?`✓ حاضر${x.inLog?" من "+localTimeOf(new Date(x.inLog.at))+" · "+esc((x.inLog.method||"").split(" ")[0]):""}`:"مش حاضر"}</span><span>الدوام ${esc(s.schedule||"—")}</span><span>${esc(codeLabel(s))}</span></div>
          ${run?`<div class="dh-run">على الآيباد مع ${esc(run.sess.patient)} · ${run.m.cur?run.m.cur.trials.length:0}/${DTT_BLOCK} · ${run.m.indep==null?"—":run.m.indep+"%"}</div>`:""}${x.r&&x.r.alerts[0]?`<div class="ip-alert l${x.r.alerts[0].lvl}">${esc(x.r.alerts[0].t)}</div>`:""}
          ${isClin?`<div class="tm-load"><div class="spread-row"><small>حمل النهارده · ${x.done}/${x.ap.length} جلسة</small><b class="${x.util>90?"hi":x.util<40?"lo":""}">${x.util}%</b></div><div class="ai-prog"><i style="width:${Math.min(100,x.util)}%"></i></div></div>
          <div class="tm-stats"><div><small>متوسط الاستقلالية</small><b>${x.ind==null?"—":x.ind+"%"}</b></div><div><small>الآيباد</small><b class="tm-dev st-${x.st?x.st.k:"none"}">${x.dv?esc(x.st.t.split("·")[0]):"مش متسجل"}</b></div></div>`:""}
          <div class="dh-acts"><button class="dh-act" onclick="setView('communicationHub');cmOpen('staff:${s.id}')">${ic("chat",14)}<span>رسالة</span></button>${isClin&&deptCan("ipads")?`<button class="dh-act" onclick="ipOpen('${s.id}')">${ic("eye",14)}<span>آيباده</span></button>`:""}${isClin&&deptCan("plan")&&s.department?`<button class="dh-act" onclick="deptGo('${s.department}','plan')">${ic("schedule",14)}<span>جدوله</span></button>`:""}${isClin&&deptCan("ipads")&&!x.dv?`<button class="dh-act" onclick="deptLinkOne('${s.id}')">${ic("tablet",14)}<span>سجّل آيباد</span></button>`:""}${typeof toggleStaffPresence==="function"&&can('editDepartments')?`<button class="dh-act" onclick="toggleStaffPresence(${i})">${ic("idcard",14)}<span>${s.present?"انصراف":"حضور"}</span></button>`:""}</div></article>`}).join("")||`<div class="empty">مفيش موظفين بالفلتر ده.</div>`}</section>`;
      return h}
    function tmSearch(v){state.tmQ=v;render();const i=document.getElementById("tm-q");if(i){i.focus();i.setSelectionRange(v.length,v.length)}}
    function tmDept(k){state.tmDept=k;render()}

    const _refOrig=referrals;referrals=function(){const o=_refOrig();const i=o.indexOf('<section class="card" style="margin-top:18px">');return referralsSmart()+(i>=0?o.slice(i):"")};
    const _schOrig=schedule;schedule=function(){const o=_schOrig();if(state.role==="staff")return o;const mk='<section class="card"><div class="card-head"><h2>جدول المواعيد</h2>';const i=o.indexOf(mk);return i<0?o+scheduleSmart():o.slice(0,i)+scheduleSmart()+o.slice(i).replace("<h2>جدول المواعيد</h2>","<h2>كل المواعيد</h2>")};
    const _teamOrig=team;team=function(){const o=_teamOrig();const i=o.indexOf("<section");return teamSmart()+(i>=0?`<details class="card tm-old"><summary>جدول الأكواد وساعات الدوام</summary>${o.slice(i)}</details>`:"")};
