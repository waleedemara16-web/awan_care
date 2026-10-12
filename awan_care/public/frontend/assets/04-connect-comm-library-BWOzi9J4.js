const e=`"use strict";
// أوان — الجزء 4 من 16: 04-connect-comm-library
// كل ملفات js/ هذي تشتغل كأنها ملف واحد بالترتيب — ما تغيّر ترتيبها في index.html
    // ==================== أوان كونكت — Oan Connect & Decision Hub ====================
    function meetingKindLabel(kind){return kind==="family"?"اجتماع مع أسرة":"اجتماع بين الأقسام"}
    function meetingStatusPill(status){const cls=status==="جارية"?"pill-blue":(status==="منتهية"?"pill-good":"pill-gold");return \`<span class="pill \${cls}">\${esc(status)}</span>\`}
    function decisionStatusPill(status){const cls=status==="معتمدة"?"pill-good":(status==="قيد التنفيذ"?"pill-blue":"pill-gold");return \`<span class="pill \${cls}">\${esc(status)}</span>\`}
    function currentSupervisorDepartment(){const person=getCurrentPerson();return (person&&person.department)?person.department:null}
    function decisionsScopedToCurrent(){
      if(state.role==="management") return state.decisions;
      const dept=currentSupervisorDepartment();
      return dept?state.decisions.filter(d=>d.department===dept):state.decisions;
    }
    function pendingDecisionsCount(){return decisionsScopedToCurrent().filter(d=>d.status==="قيد المراجعة").length}
    function canActOnDecision(d){
      if(state.role==="management") return true;
      if(state.role!=="supervisor") return false;
      const dept=currentSupervisorDepartment();
      return !dept||dept===d.department;
    }
    function setConnectTab(tab){state.connectTab=tab;persist();render()}
    function createMeeting(data){
      const patient=data.patientId?state.patients.find(x=>x.id===data.patientId):null;
      const kind=data.kind==="family"?"family":"department";
      const title=(data.title&&data.title.trim())?data.title.trim():(kind==="family"?("اجتماع مع أسرة "+(patient?patient.name:"")):"اجتماع بين الأقسام");
      const meeting={
        id:"mt-"+Date.now(),
        title,
        kind,
        departments:kind==="family"?[]:(data.departments||[]),
        patientId:patient?patient.id:null,
        participants:data.participants||[],
        status:"مجدولة",
        scheduledDate:data.scheduledDate||todayISO(),
        startedAt:null,
        endedAt:null,
        durationSeconds:0,
        notes:"",
        actionItems:[],
        summaryText:"",
        audience:kind==="family"?"family":"internal"
      };
      state.meetings.unshift(meeting);
      return meeting;
    }
    function startMeetingState(id){
      const m=state.meetings.find(x=>x.id===id);
      if(!m||m.status!=="مجدولة") return m;
      m.status="جارية";
      m.startedAt=new Date().toISOString();
      return m;
    }
    function createDecision(data){
      const decision={
        id:"dc-"+Date.now()+"-"+Math.floor(Math.random()*1000),
        meetingId:data.meetingId,
        text:data.text,
        department:data.department||null,
        ownerId:data.ownerId||null,
        ownerName:data.ownerName||"",
        dueDate:data.dueDate||"",
        status:"قيد المراجعة",
        createdDate:todayISO()
      };
      state.decisions.unshift(decision);
      return decision;
    }
    function updateDecisionStatus(id,status){
      const d=state.decisions.find(x=>x.id===id);
      if(!d) return d;
      d.status=status;
      return d;
    }
    function composeMeetingReportText(m){
      const patient=m.patientId?state.patients.find(p=>p.id===m.patientId):null;
      const attendees=(m.participants||[]).map(id=>personById(id)).filter(Boolean).map(p=>p.name);
      const deptNames=(m.departments||[]).map(id=>departmentLabel(id)).filter(Boolean);
      const durMin=Math.max(1,Math.round((m.durationSeconds||0)/60));
      const decisionsForMeeting=state.decisions.filter(d=>d.meetingId===m.id);
      const decisionsBlock=decisionsForMeeting.length
        ? decisionsForMeeting.map((d,i)=>\`\${i+1}. \${d.text} — المسؤول: \${d.ownerName||"—"}\${d.dueDate?\` — الموعد المستهدف: \${date(d.dueDate)}\`:""}\`).join("\\n")
        : "لم تُتخذ قرارات رسمية خلال هذا الاجتماع.";
      const actionsBlock=(m.actionItems||[]).length
        ? m.actionItems.map((a,i)=>\`\${i+1}. \${a.text} — المسؤول: \${a.ownerName||"—"}\${a.dueDate?\` — الموعد المستهدف: \${date(a.dueDate)}\`:""}\`).join("\\n")
        : "لا توجد بنود عمل مسجّلة.";
      if(m.kind==="family"){
        return \`تقرير رسمي — اجتماع أسرة (نسخة للمدير العام)
مركز: \${state.center.name}
عنوان الاجتماع: \${m.title}
الطفل: \${patient?patient.name:"—"}\${patient?" ("+patient.file+")":""}
ولي الأمر: \${patient?(patient.guardian||"—"):"—"}
التاريخ: \${date(m.scheduledDate)} · مدة الاجتماع: \${durMin} دقيقة
الحضور من فريق المركز: \${attendees.join("، ")||"—"}

ملخص النقاش مع الأسرة:
\${m.notes&&m.notes.trim()?m.notes.trim():"لم تُسجَّل ملاحظات نقاش."}

القرارات المتخذة خلال الاجتماع:
\${decisionsBlock}

بنود العمل (Action Items):
\${actionsBlock}

تنويه: هذا التقرير أُعدّ تلقائيًا من الملاحظات والقرارات المسجّلة أثناء الاجتماع داخل نظام أوان، وتم رفع القرارات أعلاه إلى لوحة القرارات لمراجعة الإدارة واعتمادها.
\${state.center.name}\`;
      }
      return \`محضر اجتماع — \${m.title}
نوع الاجتماع: تنسيقي بين الأقسام
الأقسام المشاركة: \${deptNames.join("، ")||"—"}
التاريخ: \${date(m.scheduledDate)} · المدة: \${durMin} دقيقة
الحضور: \${attendees.join("، ")||"—"}

ملخص النقاش:
\${m.notes&&m.notes.trim()?m.notes.trim():"لم تُسجَّل ملاحظات نقاش."}

القرارات المتخذة:
\${decisionsBlock}

بنود العمل (Action Items):
\${actionsBlock}

تم رفع القرارات أعلاه تلقائيًا إلى لوحة القرارات لمراجعة المشرفين المعنيين.

\${state.center.name}\`;
    }
    function endMeetingAndCompose(id){
      const m=state.meetings.find(x=>x.id===id);
      if(!m||m.status!=="جارية") return m;
      const elapsed=(m.durationSeconds||0)+(m.startedAt?Math.floor((Date.now()-new Date(m.startedAt).getTime())/1000):0);
      m.durationSeconds=elapsed;
      m.endedAt=new Date().toISOString();
      m.status="منتهية";
      m.summaryText=composeMeetingReportText(m);
      return m;
    }
    // =====================================================================
    // AWAN CONNECT API — INTEGRATION MOCKUP (future meeting/decision backend)
    // ---------------------------------------------------------------------
    // Same pattern as the billing module above: everything here runs against
    // local \`state\` for now. These async wrappers are shaped like the real
    // REST/WebSocket client this module will use once meetings are backed by
    // a real video SDK (e.g. Twilio/Agora/Zoom) and a real server — same
    // names/inputs/outputs, already awaited by the UI, so swapping the body
    // for a real network call later is a drop-in change, not a redesign.
    // Suggested endpoints for the production API:
    //   POST   /api/v1/centers/:centerId/meetings          -> apiScheduleMeeting
    //   POST   /api/v1/meetings/:meetingId/start           -> apiStartMeeting
    //   POST   /api/v1/meetings/:meetingId/end             -> apiEndMeeting (real transcription + AI summary would run server-side)
    //   POST   /api/v1/meetings/:meetingId/decisions       -> apiCreateDecision (server would also push a notification to the relevant department supervisor + general supervisor)
    //   PATCH  /api/v1/decisions/:decisionId/status        -> apiUpdateDecisionStatus
    // =====================================================================
    async function apiScheduleMeeting(payload){
      // future: return fetch(\`\${AWAN_API_BASE}/centers/\${state.centerId||"demo"}/meetings\`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json());
      return Promise.resolve(createMeeting(payload));
    }
    async function apiStartMeeting(meetingId){
      // future: return fetch(\`\${AWAN_API_BASE}/meetings/\${meetingId}/start\`,{method:"POST"}).then(r=>r.json());
      return Promise.resolve(startMeetingState(meetingId));
    }
    async function apiEndMeeting(meetingId){
      // future: return fetch(\`\${AWAN_API_BASE}/meetings/\${meetingId}/end\`,{method:"POST"}).then(r=>r.json());
      // In production, transcription + the AI summary below would be produced server-side from the real call recording.
      // For now composeMeetingReportText() builds the same structured report locally and transparently, from the notes/decisions/action items actually entered during the meeting — no fabricated content.
      return Promise.resolve(endMeetingAndCompose(meetingId));
    }
    async function apiCreateDecision(payload){
      // future: return fetch(\`\${AWAN_API_BASE}/meetings/\${payload.meetingId}/decisions\`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json());
      return Promise.resolve(createDecision(payload));
    }
    async function apiUpdateDecisionStatus(decisionId,status){
      // future: return fetch(\`\${AWAN_API_BASE}/decisions/\${decisionId}/status\`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}).then(r=>r.json());
      return Promise.resolve(updateDecisionStatus(decisionId,status));
    }
    let meetingTimerHandle=null;
    function startMeetingTimer(){
      stopMeetingTimer();
      const m=state.meetings.find(x=>x.id===state.activeMeetingId);
      if(!m||m.status!=="جارية"||!m.startedAt) return;
      meetingTimerHandle=setInterval(()=>{
        const el=document.getElementById("meeting-timer-display");
        if(!el){return;}
        const elapsed=(m.durationSeconds||0)+Math.floor((Date.now()-new Date(m.startedAt).getTime())/1000);
        const mm=String(Math.floor(elapsed/60)).padStart(2,"0");
        const ss=String(elapsed%60).padStart(2,"0");
        el.textContent=\`\${mm}:\${ss}\`;
      },1000);
    }
    function stopMeetingTimer(){if(meetingTimerHandle){clearInterval(meetingTimerHandle);meetingTimerHandle=null}}
    function openMeetingRoom(id){
      state.activeMeetingId=id;
      state.view="meetingRoom";
      persist();render();
      const m=state.meetings.find(x=>x.id===id);
      if(m&&m.status==="جارية") startMeetingTimer();
    }
    function backToConnect(){
      stopMeetingTimer();
      state.view="connect";
      state.activeMeetingId=null;
      persist();render();
    }
    async function startMeeting(id){
      await apiStartMeeting(id);
      persist();notify("بدأ الاجتماع");render();
      startMeetingTimer();
    }
    function saveMeetingNotes(id,value){
      const m=state.meetings.find(x=>x.id===id);
      if(!m) return;
      m.notes=value;
      persist();
    }
    async function addMeetingDecision(e,meetingId){
      e.preventDefault();
      const f=formData(e);
      const owner=state.staff.find(s=>s.id===f.ownerId);
      await apiCreateDecision({meetingId,text:f.text,department:f.department,ownerId:f.ownerId,ownerName:owner?owner.name:"",dueDate:f.dueDate});
      persist();notify("تمت إضافة القرار ورفعه للوحة القرارات لمراجعة المشرف المعني");render();
    }
    function addMeetingActionItem(e,meetingId){
      e.preventDefault();
      const f=formData(e);
      const m=state.meetings.find(x=>x.id===meetingId);
      if(!m) return;
      const owner=state.staff.find(s=>s.id===f.ownerId);
      m.actionItems.push({id:"ai-"+Date.now(),text:f.text,ownerId:f.ownerId||null,ownerName:owner?owner.name:"",dueDate:f.dueDate||"",done:false});
      persist();notify("تمت إضافة بند العمل");render();
    }
    function toggleActionItemDone(meetingId,itemId){
      const m=state.meetings.find(x=>x.id===meetingId);
      if(!m) return;
      const ai=(m.actionItems||[]).find(x=>x.id===itemId);
      if(!ai) return;
      ai.done=!ai.done;
      persist();render();
    }
    async function endAndAnalyzeMeeting(id){
      stopMeetingTimer();
      await apiEndMeeting(id);
      persist();notify("تم إنهاء الاجتماع، وتم إعداد المحضر تلقائيًا");render();
    }
    async function advanceDecision(id,newStatus){
      const d=state.decisions.find(x=>x.id===id);
      if(!d||!canActOnDecision(d)){notify("لا تملكين صلاحية اتخاذ إجراء على هذا القرار");return}
      await apiUpdateDecisionStatus(id,newStatus);
      persist();notify(newStatus==="معتمدة"?"تم اعتماد القرار":"تم بدء تنفيذ القرار");render();
    }
    async function confirmScheduleMeeting(e){
      e.preventDefault();
      const fd=new FormData(e.target);
      const f=Object.fromEntries(fd.entries());
      const kind=f.kind||"department";
      const departments=kind==="department"?fd.getAll("departments"):[];
      const participants=fd.getAll("participants");
      const patient=(kind==="family"&&f.patientId)?state.patients.find(x=>x.id===f.patientId):null;
      await apiScheduleMeeting({title:f.title,kind,departments,patientId:patient?patient.id:null,scheduledDate:f.scheduledDate,participants});
      persist();closeModal();notify("تم جدولة الاجتماع بنجاح");render();
    }
    function toggleMeetingKindFields(kind){
      const deptEl=document.getElementById("meeting-dept-fields");
      const famEl=document.getElementById("meeting-family-fields");
      if(!deptEl||!famEl) return;
      if(kind==="family"){deptEl.style.display="none";famEl.style.display="block"}
      else{deptEl.style.display="block";famEl.style.display="none"}
    }
    function meetingsListView(){
      const list=[...state.meetings].sort((a,b)=>(b.scheduledDate||"").localeCompare(a.scheduledDate||""));
      const rows=list.map(m=>{
        const deptNames=(m.departments||[]).map(id=>departmentLabel(id)).filter(Boolean).join(" · ");
        const patient=m.patientId?state.patients.find(p=>p.id===m.patientId):null;
        const scopeLine=m.kind==="family"?("اجتماع أسرة"+(patient?(" — "+esc(patient.name)):"")):(esc(deptNames)||"بدون أقسام محددة");
        const actionBtn=m.status==="منتهية"
          ?\`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="openMeetingRoom('\${m.id}')">عرض المحضر</button>\`
          :\`<button class="btn btn-primary" style="padding:6px 10px;font-size:11px" onclick="openMeetingRoom('\${m.id}')">\${m.status==="جارية"?"الدخول للغرفة":"بدء / دخول الغرفة"}</button>\`;
        return \`<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>\${esc(m.title)}</strong><small>\${meetingKindLabel(m.kind)} · \${scopeLine} · \${date(m.scheduledDate)}</small></div><div class="list-end">\${meetingStatusPill(m.status)}<br>\${actionBtn}</div></div>\`;
      }).join("");
      return \`<section class="card"><div class="card-head"><h2>الاجتماعات</h2><span class="muted">\${list.length} اجتماع</span></div><div class="list">\${rows||\`<div class="empty">لا توجد اجتماعات مجدولة بعد.</div>\`}</div></section>\`;
    }
    function decisionsBoard(){
      const scoped=decisionsScopedToCurrent();
      const cols=["قيد المراجعة","معتمدة","قيد التنفيذ"];
      const colHtml=cols.map(status=>{
        const items=scoped.filter(d=>d.status===status);
        const cards=items.map(d=>{
          const meeting=state.meetings.find(x=>x.id===d.meetingId);
          const canAct=canActOnDecision(d);
          let nextBtn="";
          if(canAct){
            if(status==="قيد المراجعة") nextBtn=\`<button class="btn btn-primary" style="padding:6px 10px;font-size:11px" onclick="advanceDecision('\${d.id}','معتمدة')">اعتماد</button>\`;
            else if(status==="معتمدة") nextBtn=\`<button class="btn btn-primary" style="padding:6px 10px;font-size:11px" onclick="advanceDecision('\${d.id}','قيد التنفيذ')">بدء التنفيذ</button>\`;
            else nextBtn=\`<span class="pill pill-good">منفّذ</span>\`;
          }
          return \`<div class="box-card" style="margin-bottom:12px"><p style="margin:0 0 8px;font-weight:700">\${esc(d.text)}</p><small class="muted" style="display:block;margin-bottom:6px">\${departmentLabel(d.department)} · المسؤول: \${esc(d.ownerName||"—")}\${d.dueDate?" · موعد التنفيذ: "+date(d.dueDate):""}</small>\${meeting?\`<small class="muted" style="display:block;margin-bottom:8px">من اجتماع: \${esc(meeting.title)}</small>\`:""}<div class="actions" style="margin-top:6px">\${nextBtn}</div></div>\`;
        }).join("");
        return \`<div class="card"><div class="card-head"><h2>\${status}</h2><span class="muted">\${items.length}</span></div>\${cards||\`<div class="empty">لا توجد قرارات هنا.</div>\`}</div>\`;
      }).join("");
      return \`<div class="section-grid-3">\${colHtml}</div>\`;
    }
    function connectView(){
      const tab=state.connectTab||"meetings";
      const totalMeetings=state.meetings.length;
      const liveMeetings=state.meetings.filter(m=>m.status==="جارية").length;
      const scoped=decisionsScopedToCurrent();
      const pendingCount=scoped.filter(d=>d.status==="قيد المراجعة").length;
      const inProgressCount=scoped.filter(d=>d.status==="قيد التنفيذ").length;
      const tabsBar=\`<div class="chips" style="margin-bottom:16px"><label class="chip \${tab==="meetings"?"checked":""}" onclick="setConnectTab('meetings')">\${ic("video",13)} الاجتماعات</label><label class="chip \${tab==="decisions"?"checked":""}" onclick="setConnectTab('decisions')">\${ic("check",13)} لوحة القرارات\${pendingCount>0?\` <span class="pill pill-red" style="margin-inline-start:4px">\${pendingCount}</span>\`:""}</label></div>\`;
      return head("أوان كونكت / 10","أوان كونكت ومركز اتخاذ القرار","غرف اجتماعات افتراضية بين الأقسام أو مع الأسر، مع تلخيص تلقائي للمحضر ولوحة متابعة قرارات معتمدة.", tab==="meetings"?\`<button class="btn btn-primary" onclick="openModal('scheduleMeeting')">＋ جدولة اجتماع</button>\`:"")
      +\`<section class="metric-grid">\${metric("video","إجمالي الاجتماعات",String(totalMeetings),"مجدولة ومنتهية")}\${metric("bell","جارية الآن",String(liveMeetings),"اجتماع نشط")}\${metric("star","قيد المراجعة",String(pendingCount),"قرارات بانتظار الاعتماد","gold")}\${metric("check","قيد التنفيذ",String(inProgressCount),"قرارات معتمدة وجارٍ تنفيذها")}</section>\`
      +tabsBar
      +(tab==="decisions"?decisionsBoard():meetingsListView());
    }
    function meetingRoomView(){
      const m=state.meetings.find(x=>x.id===state.activeMeetingId);
      if(!m){state.view="connect";return connectView()}
      const patient=m.patientId?state.patients.find(p=>p.id===m.patientId):null;
      const attendees=(m.participants||[]).map(id=>personById(id)).filter(Boolean);
      const deptNames=(m.departments||[]).map(id=>departmentLabel(id)).filter(Boolean);
      const isEnded=m.status==="منتهية";
      const isLive=m.status==="جارية";
      const elapsed=isLive?((m.durationSeconds||0)+(m.startedAt?Math.floor((Date.now()-new Date(m.startedAt).getTime())/1000):0)):(m.durationSeconds||0);
      const mm=String(Math.floor(elapsed/60)).padStart(2,"0");
      const ss=String(elapsed%60).padStart(2,"0");
      const startBtn=m.status==="مجدولة"?\`<button class="btn btn-primary" onclick="startMeeting('\${m.id}')">\${ic("video",14)} بدء الاجتماع</button>\`:"";
      const endBtn=isLive?\`<button class="btn btn-primary" onclick="endAndAnalyzeMeeting('\${m.id}')">\${ic("check",14)} إنهاء وتحليل الاجتماع</button>\`:"";
      const attendeesHtml=\`<div class="chips">\${attendees.map(p=>\`<span class="chip">\${esc(p.name)}</span>\`).join("")||\`<span class="muted">لا يوجد حضور مسجّل</span>\`}</div>\`;
      const notesBlock=isEnded
        ? \`<div class="notice" style="white-space:pre-line;line-height:2">\${esc(m.notes||"لا توجد ملاحظات مسجّلة لهذا الاجتماع.")}</div>\`
        : \`<textarea class="textarea" id="meeting-notes" placeholder="دوّني نقاط النقاش أثناء الاجتماع..." oninput="saveMeetingNotes('\${m.id}',this.value)" style="min-height:160px">\${esc(m.notes||"")}</textarea>\`;
      const decisionsForMeeting=state.decisions.filter(d=>d.meetingId===m.id);
      const decisionRows=decisionsForMeeting.map(d=>\`<div class="list-row"><div class="list-main"><strong>\${esc(d.text)}</strong><small>\${departmentLabel(d.department)} · المسؤول: \${esc(d.ownerName||"—")}\${d.dueDate?" · "+date(d.dueDate):""}</small></div><div class="list-end">\${decisionStatusPill(d.status)}</div></div>\`).join("");
      const decisionForm=isEnded?"":\`<form onsubmit="addMeetingDecision(event,'\${m.id}')" style="margin-top:10px"><div class="form-grid"><div class="field full"><label>نص القرار</label><input class="input" name="text" required placeholder="مثال: توحيد الجدول بين القسمين"></div><div class="field"><label>القسم المعني</label><select class="select" name="department">\${state.departments.map(d=>\`<option value="\${d.id}">\${esc(d.name)}</option>\`).join("")}</select></div><div class="field"><label>المسؤول عن التنفيذ</label><select class="select" name="ownerId">\${state.staff.map(s=>\`<option value="\${s.id}">\${esc(s.name)}</option>\`).join("")}</select></div><div class="field"><label>الموعد المستهدف</label><input class="input" type="date" name="dueDate"></div></div><div class="actions" style="margin-top:8px"><button class="btn btn-outline">＋ إضافة قرار</button></div></form>\`;
      const actionItemsRows=(m.actionItems||[]).map(ai=>\`<div class="list-row"><div class="list-main"><strong>\${ai.done?\`<s>\${esc(ai.text)}</s>\`:esc(ai.text)}</strong><small>المسؤول: \${esc(ai.ownerName||"—")}\${ai.dueDate?" · "+date(ai.dueDate):""}</small></div><div class="list-end">\${isEnded?(ai.done?\`<span class="pill pill-good">منجز</span>\`:\`<span class="pill pill-gold">قيد التنفيذ</span>\`):\`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="toggleActionItemDone('\${m.id}','\${ai.id}')">\${ai.done?"إلغاء الإنجاز":"تحديد كمنجز"}</button>\`}</div></div>\`).join("");
      const actionItemForm=isEnded?"":\`<form onsubmit="addMeetingActionItem(event,'\${m.id}')" style="margin-top:10px"><div class="form-grid"><div class="field full"><label>بند العمل (Action Item)</label><input class="input" name="text" required placeholder="مثال: إعداد جدول موحّد"></div><div class="field"><label>المسؤول</label><select class="select" name="ownerId">\${state.staff.map(s=>\`<option value="\${s.id}">\${esc(s.name)}</option>\`).join("")}</select></div><div class="field"><label>الموعد المستهدف</label><input class="input" type="date" name="dueDate"></div></div><div class="actions" style="margin-top:8px"><button class="btn btn-outline">＋ إضافة بند عمل</button></div></form>\`;
      const reportBlock=isEnded?\`<section class="card" style="margin-top:18px"><div class="card-head"><h2>\${m.audience==="family"?"التقرير الرسمي للمدير العام":"محضر الاجتماع"}</h2><button class="btn btn-outline" onclick="window.print()">\${ic("chart",14)} حفظ نسخة PDF</button></div><pre style="white-space:pre-wrap;font-family:inherit;line-height:2;font-size:12.5px;margin:0">\${esc(m.summaryText||"")}</pre></section>\`:"";
      return backBtn("backToConnect()","رجوع لأوان كونكت")+head("أوان كونكت / 10", m.title, \`\${meetingKindLabel(m.kind)}\${patient?" — "+patient.name:""}\${deptNames.length?" — "+deptNames.join(" · "):""}\`, "")
      +\`<div class="grid-2"><section class="card"><div class="card-head"><h2>غرفة الاجتماع</h2>\${meetingStatusPill(m.status)}</div><div class="notice-blue" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><b>\${ic("video",16)} \${isLive?"الاجتماع جارٍ الآن":isEnded?"انتهى الاجتماع":"لم يبدأ بعد"}</b><br><small>\${date(m.scheduledDate)}</small></div><div style="text-align:left"><span id="meeting-timer-display" style="font-size:22px;font-weight:800;color:var(--navy)">\${mm}:\${ss}</span><br><small class="muted">مدة الاجتماع</small></div></div><div style="margin-top:14px">\${startBtn}\${endBtn}</div><hr style="border:0;border-top:1px solid var(--line);margin:16px 0"><div class="muted" style="margin-bottom:8px">الحضور</div>\${attendeesHtml}<hr style="border:0;border-top:1px solid var(--line);margin:16px 0"><div class="muted" style="margin-bottom:8px">ملاحظات النقاش \${isEnded?"":"(تُحفظ تلقائيًا)"}</div>\${notesBlock}</section><section class="card"><div class="card-head"><h2>القرارات المتخذة</h2><span class="muted">\${decisionsForMeeting.length}</span></div><div class="list">\${decisionRows||\`<div class="empty">لم تُسجَّل قرارات بعد.</div>\`}</div>\${decisionForm}<hr style="border:0;border-top:1px solid var(--line);margin:16px 0"><div class="card-head"><h2>بنود العمل</h2><span class="muted">\${(m.actionItems||[]).length}</span></div><div class="list">\${actionItemsRows||\`<div class="empty">لا توجد بنود عمل بعد.</div>\`}</div>\${actionItemForm}</section></div>\`
      +reportBlock;
    }
    // ==================== نهاية أوان كونكت ====================
    // ==================== أوان تواصل — Oan Live Communication & Notification Hub ====================
    function commDeptLabel(id){
      if(!id) return "عام";
      if(id==="management") return "الإدارة العامة";
      if(id==="reception") return "الاستقبال";
      if(id==="family") return "بوابة الأهل";
      return departmentLabel(id);
    }
    function commDeptColor(id){
      if(!id) return {bg:"#f1f5f9",fg:"#475569"};
      if(id==="management") return {bg:"#eef2ff",fg:"#4338ca"};
      if(id==="reception") return {bg:"#fff7ed",fg:"#c2410c"};
      if(id==="family") return {bg:"#ecfdf5",fg:"#047857"};
      const palette=[{bg:"#e0f2fe",fg:"#0369a1"},{bg:"#fce7f3",fg:"#be185d"},{bg:"#fef9c3",fg:"#a16207"},{bg:"#ede9fe",fg:"#6d28d9"},{bg:"#dcfce7",fg:"#15803d"},{bg:"#ffe4e6",fg:"#be123c"}];
      let hash=0; for(let i=0;i<id.length;i++) hash=(hash*31+id.charCodeAt(i))>>>0;
      return palette[hash%palette.length];
    }
    function commTag(id){
      const c=commDeptColor(id);
      return \`<span class="comm-tag" style="background:\${c.bg};color:\${c.fg}">\${esc(commDeptLabel(id))}</span>\`;
    }
    function commStatusPill(status){
      const cls=status==="معتمدة"?"approved":(status==="قيد الاطلاع"?"seen":"sent");
      return \`<span class="comm-status \${cls}">\${esc(status)}</span>\`;
    }
    function currentCommIdentity(){
      const person=getCurrentPerson();
      if(person) return {id:person.id, dept:person.department||(person.roleCategory==="management"?"management":person.roleCategory==="reception"?"reception":null)};
      if(state.role==="management") return {id:null, dept:"management"};
      if(state.role==="reception") return {id:null, dept:"reception"};
      return {id:null, dept:null};
    }
    function commMessagesScopedToCurrent(){
      if(state.role==="management") return state.messages;
      const idn=currentCommIdentity();
      return state.messages.filter(m=>(m.toId&&m.toId===idn.id)||(m.fromId&&m.fromId===idn.id)||(idn.dept&&(m.toDept===idn.dept||m.fromDept===idn.dept)));
    }
    function pendingCommCount(){
      if(state.role==="management") return state.messages.filter(m=>m.status==="مُرسلة").length;
      const idn=currentCommIdentity();
      return state.messages.filter(m=>m.status==="مُرسلة"&&((m.toId&&m.toId===idn.id)||(idn.dept&&m.toDept===idn.dept))).length;
    }
    function canActOnComm(m){
      if(state.role==="management") return true;
      const idn=currentCommIdentity();
      return (m.toId&&m.toId===idn.id)||(idn.dept&&m.toDept===idn.dept);
    }
    function sendCommMessage(e){
      e.preventDefault();
      const f=formData(e);
      const person=getCurrentPerson();
      const idn=currentCommIdentity();
      const fromName=person?person.name:(state.role==="management"?"الإدارة":state.role==="reception"?"الاستقبال":"فريق المركز");
      const parts=(f.to||"").split(":");
      const mode=parts[0], val=parts[1];
      let toId=null,toName=null,toDept=null,patientId=null;
      if(mode==="person"){
        const rp=state.staff.find(s=>s.id===val);
        if(!rp){notify("اختر/ي جهة صحيحة");return}
        toId=rp.id; toName=rp.name; toDept=rp.department||(rp.roleCategory==="management"?"management":rp.roleCategory==="reception"?"reception":null);
      } else if(mode==="dept"){
        toDept=val;
      } else if(mode==="family"){
        const fp=state.patients.find(x=>x.id===val);
        if(!fp){notify("اختر/ي أسرة صحيحة");return}
        toDept="family"; patientId=fp.id; toName=(fp.guardian||fp.name)+" (أسرة "+fp.name.split(" ")[0]+")";
      } else {notify("اختر/ي جهة الإرسال أولاً");return}
      state.messages.unshift({id:"msg-"+Date.now(),fromId:person?person.id:null,fromName,fromDept:idn.dept,toId,toName,toDept,patientId,text:f.text,date:todayISO(),kind:f.kind||"رسالة",status:"مُرسلة",read:false});
      persist();notify(f.kind==="قرار"?"تم إرسال القرار":"تم إرسال الرسالة");render();
    }
    function markCommSeen(id){
      const m=state.messages.find(x=>x.id===id);
      if(!m||m.status!=="مُرسلة") return;
      m.status="قيد الاطلاع"; m.read=true;
      persist();render();
    }
    function approveCommItem(id){
      const m=state.messages.find(x=>x.id===id);
      if(!m) return;
      m.status="معتمدة"; m.read=true;
      persist();notify("تم اعتماد القرار");render();
    }
    // ↪ الدالة migrateLibrary انتقلت لملف js/01-core-seed.js عشان تكون جاهزة وقت التحميل
    function communicationHubView(){
      const feed=[...commMessagesScopedToCurrent()].sort((a,b)=>(b.date||"").localeCompare(a.date||"")||String(b.id||"").localeCompare(String(a.id||"")));
      const pendingCount=feed.filter(m=>m.status==="مُرسلة").length;
      const approvedCount=feed.filter(m=>m.status==="معتمدة").length;
      const idn=currentCommIdentity();
      const deptOptions=state.departments.map(d=>\`<option value="dept:\${d.id}">\${esc(d.name)} (قسم كامل)</option>\`).join("")+\`<option value="dept:management">الإدارة العامة</option><option value="dept:reception">الاستقبال</option>\`;
      const personOptions=state.staff.filter(s=>!idn.id||s.id!==idn.id).map(s=>\`<option value="person:\${s.id}">\${esc(s.name)} — \${esc((roles[s.roleCategory]&&roles[s.roleCategory].label)||"")}</option>\`).join("");
      const familyOptions=state.patients.filter(p=>!p.archived).map(p=>\`<option value="family:\${p.id}">\${esc(p.name)} — \${esc(p.guardian||"ولي الأمر")}</option>\`).join("");
      const composeForm=\`<form onsubmit="sendCommMessage(event)" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px"><div class="field" style="min-width:220px;margin:0"><label>إلى</label><select class="select" name="to"><optgroup label="أقسام">\${deptOptions}</optgroup><optgroup label="أفراد">\${personOptions}</optgroup><optgroup label="أسر">\${familyOptions}</optgroup></select></div><div class="field" style="min-width:150px;margin:0"><label>النوع</label><select class="select" name="kind"><option value="رسالة">رسالة</option><option value="قرار">قرار يحتاج اعتماد</option></select></div><div class="field" style="flex:1;min-width:220px;margin:0"><label>النص</label><input class="input" name="text" required placeholder="اكتب/ي رسالتك أو القرار هنا"></div><button class="btn btn-primary" type="submit">\${ic("commHub",14)} إرسال</button></form>\`;
      const rows=feed.map(m=>{
        const canAct=canActOnComm(m);
        const linkedPatient=m.patientId?state.patients.find(x=>x.id===m.patientId):null;
        let actionBtn="";
        if(canAct&&m.status==="مُرسلة") actionBtn=\`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="markCommSeen('\${m.id}')">تحديد كمُطّلع عليها</button>\`;
        else if(canAct&&m.kind==="قرار"&&m.status==="قيد الاطلاع") actionBtn=\`<button class="btn btn-primary" style="padding:6px 10px;font-size:11px" onclick="approveCommItem('\${m.id}')">اعتماد القرار</button>\`;
        return \`<div class="comm-feed-row"><div class="comm-feed-top"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">\${commTag(m.fromDept)}<span class="muted" style="font-size:11px">←</span>\${commTag(m.toDept)}\${linkedPatient?\`<small class="muted">(\${esc(linkedPatient.name)})</small>\`:""}\${m.kind==="قرار"?\`<span class="pill pill-gold">قرار</span>\`:""}</div><div style="display:flex;align-items:center;gap:8px">\${commStatusPill(m.status)}<small class="muted">\${date(m.date)}</small></div></div><div style="font-size:12.5px;line-height:1.8"><b>\${esc(m.fromName||"—")}</b>\${m.toName?" ← "+esc(m.toName):""}: \${esc(m.text)}</div>\${actionBtn?\`<div class="actions" style="margin-top:2px">\${actionBtn}</div>\`:""}</div>\`;
      }).join("");
      return head("أوان تواصل / 11","أوان تواصل ومركز الإشعارات الحي","تواصل فوري بين الاستقبال والأقسام والإشراف وبوابة الأهل، مع تتبع حالة كل رسالة أو قرار لحظة بلحظة.","")
      +\`<section class="metric-grid">\${metric("commHub","إجمالي الرسائل",String(feed.length),"في نطاقك الحالي")}\${metric("bell","بانتظار الاطلاع",String(pendingCount),"رسائل وقرارات جديدة","gold")}\${metric("check","معتمدة",String(approvedCount),"قرارات تم اعتمادها")}</section>\`
      +\`<section class="card">\${composeForm}<div>\${rows||\`<div class="empty">لا توجد رسائل ضمن نطاقك بعد.</div>\`}</div></section>\`;
    }
    function playNotificationTone(){
      try{
        const Ctx=window.AudioContext||window.webkitAudioContext;
        if(!Ctx) return;
        const ctx=new Ctx();
        const now=ctx.currentTime;
        [660,880].forEach((freq,i)=>{
          const osc=ctx.createOscillator();
          const gain=ctx.createGain();
          osc.type="sine";
          osc.frequency.value=freq;
          gain.gain.setValueAtTime(0,now+i*0.16);
          gain.gain.linearRampToValueAtTime(0.16,now+i*0.16+0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001,now+i*0.16+0.22);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now+i*0.16);
          osc.stop(now+i*0.16+0.24);
        });
        setTimeout(()=>{try{ctx.close()}catch(_e){}},700);
      }catch(_e){}
    }
    function dismissCommBanner(){
      const el=document.getElementById("comm-banner");
      if(!el) return;
      el.classList.remove("show");
      clearTimeout(el._hideTimer);
    }
    function showCommBanner(title,text){if(state.intakeKiosk||state.sipadMode)return;
      const el=document.getElementById("comm-banner");
      if(!el) return;
      ntPush("comm",title,text);playNotificationTone();
    }
    const announcedCommIds = new Set();
    const announcedPendingDecisionIds = new Set();
    // Simulates real-time delivery within a single browser/session: fires the
    // banner + audio cue the moment a render reveals a message/decision that
    // is newly addressed to whoever is currently viewing (by id or by
    // department scope) and hasn't been announced yet in this session.
    function announceNewCommIfNeeded(){
      if(state.view==="public"){
        if(state.portal==="parent"&&state.parentTab==="follow"&&state.familySession){
          const p=state.patients.find(x=>x.code===state.familySession.code);
          if(p){
            const freshReplies=state.messages.filter(m=>m.patientId===p.id&&m.fromDept!=="family"&&m.status==="مُرسلة"&&!announcedCommIds.has(m.id));
            freshReplies.forEach(m=>announcedCommIds.add(m.id));
            if(freshReplies.length) showCommBanner("رد جديد من المركز",freshReplies[0].text);
          }
        }
        return;
      }
      const idn=currentCommIdentity();
      const isManagement=state.role==="management";
      const candidates=state.messages.filter(m=>m.status==="مُرسلة"&&!(typeof cmMine==="function"&&cmMine(m))&&!m.agent&&m.ch!=="agent"&&(isManagement||(m.toId&&m.toId===idn.id)||(idn.dept&&m.toDept===idn.dept)));
      const fresh=candidates.filter(m=>!announcedCommIds.has(m.id));
      fresh.forEach(m=>announcedCommIds.add(m.id));
      if(fresh.length){
        const m=fresh[0];
        showCommBanner(m.kind==="قرار"?"قرار جديد بانتظار اعتمادك":"إشعار جديد", \`\${commDeptLabel(m.fromDept)}: «\${m.text}»\`,{msgId:m.id});
        return;
      }
      if(state.role==="management"||state.role==="supervisor"){
        const scopedDecisions=decisionsScopedToCurrent().filter(d=>d.status==="قيد المراجعة");
        const freshD=scopedDecisions.filter(d=>!announcedPendingDecisionIds.has(d.id));
        freshD.forEach(d=>announcedPendingDecisionIds.add(d.id));
        if(freshD.length) showCommBanner("قرار جديد بانتظار المراجعة", freshD[0].text,{decisionId:freshD[0].id});
      }
    }
    function sendFamilyCommMessage(e,patientId){
      e.preventDefault();
      const f=formData(e);
      const p=state.patients.find(x=>x.id===patientId);
      const guardianName=(p&&p.guardian)?p.guardian:(state.familySession?state.familySession.name:"ولي أمر");
      state.messages.unshift({id:"msg-"+Date.now(),fromId:null,fromName:\`\${guardianName}\${p?" (ولي أمر "+p.name.split(" ")[0]+")":""}\`,fromDept:"family",toId:null,toName:null,toDept:"reception",patientId:patientId||null,text:f.text,date:todayISO(),kind:"رسالة",status:"مُرسلة",read:false});
      persist();notify("تم إرسال رسالتك لفريق "+state.center.name);render();
    }
    function familyCommStatusLabel(status){
      if(status==="قيد الاطلاع"||status==="معتمدة") return "✅ اطّلع عليها المركز";
      return "⏳ بانتظار الاطلاع";
    }
    function familyCommThreadView(patientId){
      const thread=state.messages.filter(m=>m.patientId===patientId).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||String(a.id||"").localeCompare(String(b.id||"")));
      if(!thread.length) return \`<p class="muted" style="margin:10px 0 0">لا توجد رسائل سابقة بعد — ابدئي المحادثة من المربع أدناه.</p>\`;
      return \`<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">\${thread.map(m=>{
        const fromCenter=m.fromDept!=="family";
        return \`<div style="align-self:\${fromCenter?"flex-start":"flex-end"};max-width:85%;background:\${fromCenter?"rgba(8,145,178,.10)":"var(--teal-2)"};border-radius:12px;padding:10px 13px">
          <small class="muted" style="display:block;margin-bottom:4px">\${fromCenter?"🏥 رد من "+esc(commDeptLabel(m.fromDept)):"أنتِ/أنت"} · \${date(m.date)}</small>
          <div style="font-size:12.5px;line-height:1.8">\${esc(m.text)}</div>
          \${!fromCenter?\`<small style="display:block;margin-top:4px">\${familyCommStatusLabel(m.status)}</small>\`:""}
        </div>\`;
      }).join("")}</div>\`;
    }
    // ==================== نهاية أوان تواصل ====================
    // ==================== مكتبة أوان الذكية للإرشاد الأسري والتطبيقي ====================
    function patientPrimaryDepartment(patientId){
      const p=state.patients.find(x=>x.id===patientId);
      if(!p) return null;
      const apts=state.appointments.filter(a=>a.patient===p.name&&a.status!=="ملغي").slice().sort((a,b)=>((b.date||"")+(b.time||"")).localeCompare((a.date||"")+(a.time||"")));
      for(const a of apts){
        const cl=state.staff.find(s=>s.name===a.clinician);
        if(cl&&cl.department) return cl.department;
      }
      const prog=p.program||"";
      if(prog.indexOf("نطق")>-1) return "speech";
      if(prog.indexOf("علاج وظيفي")>-1) return "ot";
      if(prog.indexOf("علاج طبيعي")>-1) return "ot";
      if(prog.indexOf("تأهيل سلوكي")>-1) return "aba";
      if(prog.indexOf("دعم أكاديمي")>-1) return "inclusion";
      return null;
    }
    function articleMatchesPatient(article,patient){
      if(!patient) return false;
      const text=(patient.need||"")+" "+(patient.program||"")+" "+(patient.goal||"");
      return (article.tags||[]).some(tag=>text.indexOf(tag)>-1);
    }
    function recommendedArticlesForPatient(patientId){
      const p=state.patients.find(x=>x.id===patientId);
      if(!p) return [];
      return state.libraryArticles.filter(a=>a.audience==="family"&&articleMatchesPatient(a,p));
    }
    function libCategoryColor(cat){
      const map={
        "نطق ولغة":{bg:"#e0f2fe",fg:"#0369a1"},
        "علاج وظيفي":{bg:"#dcfce7",fg:"#15803d"},
        "علاج طبيعي":{bg:"#fef9c3",fg:"#a16207"},
        "تأهيل سلوكي":{bg:"#ede9fe",fg:"#6d28d9"},
        "دعم أكاديمي":{bg:"#fce7f3",fg:"#be185d"},
        "عام":{bg:"#f1f5f9",fg:"#475569"}
      };
      if(map[cat]) return map[cat];
      const palette=[{bg:"#e0f2fe",fg:"#0369a1"},{bg:"#fce7f3",fg:"#be185d"},{bg:"#fef9c3",fg:"#a16207"},{bg:"#ede9fe",fg:"#6d28d9"},{bg:"#dcfce7",fg:"#15803d"},{bg:"#ffe4e6",fg:"#be123c"}];
      let hash=0; const s=cat||"عام"; for(let i=0;i<s.length;i++) hash=(hash*31+s.charCodeAt(i))>>>0;
      return palette[hash%palette.length];
    }
    function libCategoryTag(cat){
      const c=libCategoryColor(cat);
      return \`<span class="comm-tag" style="background:\${c.bg};color:\${c.fg}">\${esc(cat||"عام")}</span>\`;
    }
    function libraryTypeIcon(type){
      if(type==="نشاط منزلي") return "heart";
      if(type==="فيديو تعليمي") return "video";
      return "book";
    }
    function libraryCard(a,patientId){
      const isVideo=a.type==="فيديو تعليمي";
      const applyBtn=patientId?\`<button class="btn btn-primary" style="margin-top:2px;width:100%;padding:8px 10px;font-size:11.5px" onclick="applyActivityAtHome('\${a.id}','\${patientId}')">\${ic("heart",13)} طبّقي هذا النشاط في المنزل</button>\`:"";
      return \`<div class="lib-card\${patientId?" lib-rec-card":""}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap">
          <span class="lib-card-type" style="background:\${isVideo?"#f1f5f9":"var(--gold-2)"};color:\${isVideo?"#475569":"var(--navy)"}">\${ic(libraryTypeIcon(a.type),12)} \${esc(a.type)}</span>
          \${libCategoryTag(a.category)}
        </div>
        <h4 style="margin:2px 0 0;font-size:13.5px;line-height:1.6">\${esc(a.title)}</h4>
        <p class="muted" style="margin:0;font-size:11.5px;line-height:1.7">\${esc(a.summary||"")}</p>
        \${isVideo?\`<span class="lib-video-badge">\${ic("video",11)} \${esc(a.videoStatus||"قريبًا")}</span>\`:""}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:6px;font-size:10.5px;color:var(--muted)">
          <span>\${esc(a.author||"—")}</span><span>\${date(a.publishDate)}</span>
        </div>
        <button type="button" class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="openModal('libraryArticle','\${a.id}')">قراءة المزيد</button>
        \${applyBtn}
      </div>\`;
    }
    function setLibraryTab(tab){state.libraryTab=tab;state.libraryFilter="الكل";persist();render()}
    function setLibraryFilter(cat){state.libraryFilter=cat;persist();render()}
    function libraryHubView(){
      const tab=state.libraryTab||"family";
      const filter=state.libraryFilter||"الكل";
      const list=state.libraryArticles.filter(a=>a.audience===tab);
      const categories=["الكل",...new Set(list.map(a=>a.category))];
      const filtered=filter==="الكل"?list:list.filter(a=>a.category===filter);
      const sorted=[...filtered].sort((a,b)=>(b.publishDate||"").localeCompare(a.publishDate||""));
      const canAdd=can('editPatients');
      const tabsHtml=\`<div class="lib-tabs"><button class="lib-tab-btn \${tab==="family"?"active":""}" onclick="setLibraryTab('family')">\${ic("team",13)} محتوى الأسر</button><button class="lib-tab-btn \${tab==="practitioner"?"active":""}" onclick="setLibraryTab('practitioner')">\${ic("medical",13)} محتوى الأخصائيين</button></div>\`;
      const filtersHtml=\`<div class="lib-filters">\${categories.map(c=>\`<button class="lib-filter-chip \${filter===c?"active":""}" onclick="setLibraryFilter('\${c}')">\${esc(c)}</button>\`).join("")}</div>\`;
      return head("أوان تواصل / 12","مكتبة أوان الذكية للإرشاد","محتوى تثقيفي وتطبيقي مصنّف حسب الفئة والقسم، مع مقالات وأنشطة وفيديوهات معتمدة من فريق المركز.",canAdd?\`<button class="btn btn-primary" onclick="openModal('newLibraryArticle')">\${ic("book",14)} ＋ إضافة محتوى</button>\`:"")
      +\`<section class="card">\${tabsHtml}\${filtersHtml}\${sorted.length?\`<div class="lib-grid">\${sorted.map(a=>libraryCard(a)).join("")}</div>\`:\`<div class="empty">لا يوجد محتوى ضمن هذا التصنيف بعد.</div>\`}</section>\`;
    }
    function familyLibraryView(patientId){
      const filter=state.libraryFilter||"الكل";
      const list=state.libraryArticles.filter(a=>a.audience==="family");
      const categories=["الكل",...new Set(list.map(a=>a.category))];
      const filtered=filter==="الكل"?list:list.filter(a=>a.category===filter);
      const sorted=[...filtered].sort((a,b)=>(b.publishDate||"").localeCompare(a.publishDate||""));
      const recommended=patientId?recommendedArticlesForPatient(patientId):[];
      const filtersHtml=\`<div class="lib-filters">\${categories.map(c=>\`<button class="lib-filter-chip \${filter===c?"active":""}" onclick="setLibraryFilter('\${c}')">\${esc(c)}</button>\`).join("")}</div>\`;
      const recSection=recommended.length?\`<div style="margin-bottom:20px"><h3 style="font-size:14px;margin:0 0 10px;display:flex;align-items:center;gap:6px"><span class="lib-badge sm">\${ic("idea",13)}</span>مقترح لكِ بناءً على هدف طفلك الحالي</h3><div class="lib-grid">\${recommended.map(a=>libraryCard(a,patientId)).join("")}</div></div>\`:"";
      return \`\${recSection}\${filtersHtml}\${sorted.length?\`<div class="lib-grid">\${sorted.map(a=>libraryCard(a,patientId)).join("")}</div>\`:\`<div class="empty">لا يوجد محتوى بعد.</div>\`}\`;
    }
    function applyActivityAtHome(articleId,patientId){
      const a=state.libraryArticles.find(x=>x.id===articleId);
      const p=state.patients.find(x=>x.id===patientId);
      if(!a||!p){notify("تعذر إتمام العملية");return}
      const dept=patientPrimaryDepartment(patientId);
      const guardianName=(p.guardian)?p.guardian:(state.familySession?state.familySession.name:"ولي الأمر");
      state.libraryApplications.unshift({id:"la-"+Date.now(),articleId:a.id,articleTitle:a.title,patientId:p.id,patientName:p.name,date:todayISO(),notifiedDept:dept});
      state.messages.unshift({id:"msg-"+Date.now(),fromId:null,fromName:\`\${guardianName} (ولي أمر \${p.name.split(" ")[0]})\`,fromDept:"family",toId:null,toName:null,toDept:dept||"reception",patientId:p.id,text:\`قامت الأسرة بتطبيق نشاط «\${a.title}» في المنزل مع \${p.name.split(" ")[0]} — يُفضّل المتابعة في الجلسة القادمة.\`,date:todayISO(),kind:"رسالة",status:"مُرسلة",read:false});
      persist();notify("👏 تم إرسال إشعار للمختص بتطبيقك للنشاط في المنزل");render();
    }
    function addLibraryArticle(e){
      e.preventDefault();
      if(!can('editPatients')){closeModal();notify("لا تملك صلاحية إضافة محتوى");return}
      const f=formData(e);
      const person=getCurrentPerson();
      state.libraryArticles.unshift({
        id:"lib-"+Date.now(),
        audience:f.audience||"family",
        category:f.category||"عام",
        type:f.type||"مقالة",
        title:f.title,
        summary:f.summary||"",
        body:f.body||"",
        tags:(f.tags||"").split(",").map(x=>x.trim()).filter(Boolean),
        author:person?person.name:"فريق "+state.center.name,
        authorRole:person?person.role:"",
        publishDate:todayISO(),
        videoStatus:f.type==="فيديو تعليمي"?"قريبًا":null
      });
      persist();closeModal();notify("تمت إضافة المحتوى للمكتبة");render();
    }
    // ==================== نهاية مكتبة أوان الذكية ====================
    const LICENSE_STATUSES=["لم يبدأ","قيد المراجعة","مكتملة"];
    function municipalLicense(){
      const ml=state.municipalLicense;
      const total=ml.steps.length;
      const done=ml.steps.filter(s=>s.status==="مكتملة").length;
      const readiness=total?Math.round((done/total)*100):0;
      const editBtn=\`<button class="btn btn-primary" onclick="openModal('licenseInfo')">تعديل بيانات الطلب</button>\`;
      const stepBoxes=ml.steps.map(s=>\`<div class="box-card"><div class="box-card-head"><h4>\${esc(s.label)}</h4>\${pill(s.status)}</div><div style="display:flex;gap:6px;align-items:center;margin-top:10px;flex-wrap:wrap"><select class="select" style="padding:6px;font-size:11px" onchange="updateLicenseStepStatus('\${s.id}',this.value)">\${LICENSE_STATUSES.map(st=>\`<option value="\${st}" \${s.status===st?"selected":""}>\${st}</option>\`).join("")}</select><button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="removeLicenseStep('\${s.id}')">حذف</button></div></div>\`).join("");
      return head("الترخيص البلدي","متابعة ترخيص بلدية جدة","تتبّع خطوات ومتطلبات ترخيص المركز لدى الجهة البلدية المختصة، أوّلاً بأول.",editBtn)
      +\`<section class="metric-grid" style="grid-template-columns:repeat(3,1fr)">\${metric("idcard","رقم الطلب البلدي",ml.requestNumber||"—","الرقم المرجعي للطلب")}\${metric("briefcase","الجهة التابعة",ml.authority||"—","الجهة المسؤولة عن الترخيص")}\${metric("check","مستوى الجاهزية",readiness+"%",\`\${done} من \${total} خطوة مكتملة\`,readiness===100?undefined:"gold")}</section>\`
      +\`<section class="card"><div class="card-head"><h2>خطوات ومراحل الإصدار</h2><button class="btn btn-outline" onclick="openModal('licenseStep')">＋ إضافة خطوة</button></div>\${total?\`<div class="box-grid">\${stepBoxes}</div>\`:\`<div class="empty">لا توجد خطوات مضافة بعد.</div>\`}</section>\`
      +\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>ملاحظات</h2></div><form onsubmit="saveLicenseNotes(event)"><textarea class="textarea" name="notes" rows="4" placeholder="أي متابعات أو ملاحظات خاصة بالترخيص...">\${esc(ml.notes||"")}</textarea><div class="actions" style="margin-top:12px"><button class="btn btn-primary">حفظ الملاحظات</button></div></form></section>\`;
    }
    function updateLicenseStepStatus(id,status){const s=state.municipalLicense.steps.find(x=>x.id===id);if(!s)return;s.status=status;persist();notify("تم تحديث حالة الخطوة");render()}
    function removeLicenseStep(id){state.municipalLicense.steps=state.municipalLicense.steps.filter(x=>x.id!==id);persist();notify("تم حذف الخطوة");render()}
    function addLicenseStep(e){e.preventDefault();const f=formData(e);state.municipalLicense.steps.push({id:"ml-"+Date.now(),label:f.label,status:"لم يبدأ"});persist();closeModal();notify("تمت إضافة الخطوة");render()}
    function saveLicenseInfo(e){e.preventDefault();const f=formData(e);state.municipalLicense.requestNumber=f.requestNumber;state.municipalLicense.authority=f.authority;persist();closeModal();notify("تم حفظ بيانات الطلب");render()}
    function saveLicenseNotes(e){e.preventDefault();const f=formData(e);state.municipalLicense.notes=f.notes;persist();notify("تم حفظ الملاحظات")}
    function govSupportView(){
      const gs=state.govSupport;
      const total=gs.steps.length;
      const done=gs.steps.filter(s=>s.status==="مكتملة").length;
      const readiness=total?Math.round((done/total)*100):0;
      const editBtn=\`<button class="btn btn-primary" onclick="openModal('govInfo')">تعديل بيانات البرنامج</button>\`;
      const stepBoxes=gs.steps.map(s=>\`<div class="box-card"><div class="box-card-head"><h4>\${esc(s.label)}</h4>\${pill(s.status)}</div><div style="display:flex;gap:6px;align-items:center;margin-top:10px;flex-wrap:wrap"><select class="select" style="padding:6px;font-size:11px" onchange="updateGovStepStatus('\${s.id}',this.value)">\${LICENSE_STATUSES.map(st=>\`<option value="\${st}" \${s.status===st?"selected":""}>\${st}</option>\`).join("")}</select><button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="removeGovStep('\${s.id}')">حذف</button></div></div>\`).join("");
      return head("دعم الدولة","التوافق مع مبادرات الدعم الحكومي","تتبّعي خطوات تسجيل المركز وتوافقه مع برامج دعم الدولة للتأهيل والتدخل المبكر، أولاً بأول.",editBtn)
      +\`<section class="metric-grid" style="grid-template-columns:repeat(3,1fr)">\${metric("shield","البرنامج",gs.programName||"—","اسم برنامج الدعم المستهدف")}\${metric("briefcase","الجهة المانحة",gs.authority||"—","الجهة الحكومية المسؤولة")}\${metric("check","مستوى الجاهزية",readiness+"%",\`\${done} من \${total} خطوة مكتملة\`,readiness===100?undefined:"gold")}</section>\`
      +\`<section class="card"><div class="card-head"><h2>خطوات التوافق والتسجيل</h2><button class="btn btn-outline" onclick="openModal('govStep')">＋ إضافة خطوة</button></div>\${total?\`<div class="box-grid">\${stepBoxes}</div>\`:\`<div class="empty">لا توجد خطوات مضافة بعد.</div>\`}</section>\`
      +\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>ملاحظات</h2></div><form onsubmit="saveGovNotes(event)"><textarea class="textarea" name="notes" rows="4" placeholder="أي متابعات أو ملاحظات خاصة بدعم الدولة...">\${esc(gs.notes||"")}</textarea><div class="actions" style="margin-top:12px"><button class="btn btn-primary">حفظ الملاحظات</button></div></form></section>\`;
    }
    function updateGovStepStatus(id,status){const s=state.govSupport.steps.find(x=>x.id===id);if(!s)return;s.status=status;persist();notify("تم تحديث حالة الخطوة");render()}
    function removeGovStep(id){state.govSupport.steps=state.govSupport.steps.filter(x=>x.id!==id);persist();notify("تم حذف الخطوة");render()}
    function addGovStep(e){e.preventDefault();const f=formData(e);state.govSupport.steps.push({id:"gs-"+Date.now(),label:f.label,status:"لم يبدأ"});persist();closeModal();notify("تمت إضافة الخطوة");render()}
    function saveGovInfo(e){e.preventDefault();const f=formData(e);state.govSupport.programName=f.programName;state.govSupport.authority=f.authority;persist();closeModal();notify("تم حفظ بيانات البرنامج");render()}
    function saveGovNotes(e){e.preventDefault();const f=formData(e);state.govSupport.notes=f.notes;persist();notify("تم حفظ الملاحظات")}
    function daysSince(dateStr){if(!dateStr)return Infinity;const d=Math.floor((Date.now()-new Date(dateStr).getTime())/86400000);return isNaN(d)?Infinity:d}
    function reviewEligible(p,rs){return !p.hasReviewed&&(p.reviewRequestedCount||0)<(rs.maxAttempts||3)&&daysSince(p.lastReviewRequestDate)>=(rs.intervalDays||14)}
    function reviewRequestsView(){
      const rs=state.reviewSettings;
      const consented=state.patients.filter(p=>p.consentReviewContact);
      const reviewed=consented.filter(p=>p.hasReviewed).length;
      const eligible=consented.filter(p=>reviewEligible(p,rs)).length;
      const totalSent=consented.reduce((sum,p)=>sum+(p.reviewRequestedCount||0),0);
      const editBtn=\`<button class="btn btn-primary" onclick="openModal('reviewSettings')">إعدادات الربط</button>\`;
      const rows=consented.map(p=>{
        const eligibleNow=reviewEligible(p,rs);
        const status=p.hasReviewed?"قيّم بالفعل":((p.reviewRequestedCount||0)>=(rs.maxAttempts||3)?"وصل للحد الأقصى":(eligibleNow?"جاهز للإرسال الآن":"بانتظار الموعد التالي"));
        return \`<div class="box-card"><div class="box-card-head"><h4>\${esc(p.name)}</h4>\${pill(status)}</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.9;margin-top:6px">
            <div>ولي الأمر: <b>\${esc(p.guardian||"—")}</b></div>
            <div>واتساب: <b>\${esc(toIntlWhatsapp(p.phone)||"—")}</b></div>
            <div>عدد مرات الإرسال: <b>\${p.reviewRequestedCount||0}</b> / \${rs.maxAttempts||3}</div>
            <div>آخر إرسال: <b>\${p.lastReviewRequestDate?date(p.lastReviewRequestDate):"لم يُرسل بعد"}</b></div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:10px;flex-wrap:wrap">
            <button class="btn btn-outline" style="padding:6px 10px;font-size:11px" \${p.hasReviewed?"disabled":""} onclick="markReviewSent('\${p.id}')">تسجيل إرسال الآن</button>
            <button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="toggleHasReviewed('\${p.id}')">\${p.hasReviewed?"إلغاء تحديد قيّم":"تحديد أنه قيّم"}</button>
          </div>
        </div>\`;
      }).join("");
      return head("طلب التقييمات الحقيقية","نظام طلب التقييمات عبر واتساب","بعد موافقة ولي الأمر، تُرسل بياناته تلقائيًا لنظام n8n ليطلب منه واتساب تقييم تجربته الحقيقية على خرائط جوجل كل فترة معينة.",editBtn)
      +\`<section class="metric-grid" style="grid-template-columns:repeat(4,1fr)">\${metric("team","عائلات موافقة",consented.length,"من إجمالي "+state.patients.length)}\${metric("star","قيّموا بالفعل",reviewed,"تقييمات حقيقية 100%")}\${metric("bell","جاهزون للإرسال الآن",eligible,"حسب إعدادات الفاصل الزمني","gold")}\${metric("chat","إجمالي الرسائل المرسلة",totalSent,"عبر واتساب")}</section>\`
      +\`<section class="card"><div class="card-head"><h2>إعدادات الربط بـ n8n وخرائط جوجل</h2></div><div class="list">
          <div class="float-row"><span>رابط Webhook</span><b style="word-break:break-all">\${esc(rs.webhookUrl||"—")}</b></div>
          <div class="float-row"><span>Place ID لخرائط جوجل</span><b>\${esc(rs.placeId||"—")}</b></div>
          <div class="float-row"><span>الفاصل بين كل رسالتين</span><b>\${esc(rs.intervalDays||14)} يوم</b></div>
          <div class="float-row"><span>الحد الأقصى لعدد المحاولات</span><b>\${esc(rs.maxAttempts||3)} محاولات</b></div>
        </div>
        <div class="notice-blue" style="margin-top:12px">هذه اللوحة تعرض حالة الربط وتتابعها فقط — الإرسال الفعلي والجدولة كل فترة يتوليّاها workflow التشغيل الآلي في n8n (awan_review_scheduler.json)، وهذه البيانات محلية على هذا الجهاز فقط في هذا العرض التجريبي.</div>
      </section>\`
      +\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>العائلات الموافقة على التواصل</h2></div>\${consented.length?\`<div class="box-grid">\${rows}</div>\`:\`<div class="empty">لا توجد عائلات وافقت على التواصل حتى الآن — الموافقة تُؤخذ تلقائيًا من نموذج «إضافة ملف مستفيد» أو «تسجيل حجز جديد».</div>\`}</section>\`;
    }
    function saveReviewSettings(e){e.preventDefault();const f=formData(e);state.reviewSettings.webhookUrl=f.webhookUrl||"";state.reviewSettings.placeId=f.placeId||"";state.reviewSettings.intervalDays=Number(f.intervalDays)||14;state.reviewSettings.maxAttempts=Number(f.maxAttempts)||3;persist();closeModal();notify("تم حفظ إعدادات نظام التقييمات");render()}
    function markReviewSent(id){const p=state.patients.find(x=>x.id===id);if(!p)return;p.reviewRequestedCount=(p.reviewRequestedCount||0)+1;p.lastReviewRequestDate=todayISO();persist();notify(\`تم تسجيل إرسال طلب تقييم لـ \${p.name}\`);render()}
    function toggleHasReviewed(id){const p=state.patients.find(x=>x.id===id);if(!p)return;p.hasReviewed=!p.hasReviewed;persist();notify(p.hasReviewed?\`تم تحديد أن \${p.name} قيّم بالفعل\`:"تم إلغاء التحديد");render()}
    function departments(){
      if(state.openDept){return departmentDetail(state.openDept)}
      const addBtn=can('editDepartments')?"<button class=\\"btn btn-primary\\" onclick=\\"openModal('department')\\">＋ إضافة قسم</button>":"";
      const permNote=can('editDepartments')?"":\`<div class="notice" style="margin-bottom:18px">العرض هنا للاطّلاع فقط. تعديل الأقسام وإضافتها متاح حصراً من لوحة الإدارة، ما لم تُمنح صلاحية إضافية من هناك.</div>\`;
      return head("الأقسام / الخدمات","الأقسام والخدمات","مساحة عمل موحدة للأقسام العلاجية والتعليمية، مع حالة جاهزية كل خدمة.",addBtn)+permNote+\`<div class="notice-blue" style="margin-bottom:18px">يمكن تخصيص الصلاحيات حسب الدور: الإشراف يرى كل الأقسام، الإدارة تتابع المؤشرات، الموظف يرى خدماته، والاستقبال يرى الخدمات المتاحة للحجز.</div><section class="section-grid">\${state.departments.map(d=>\`<article class="section-card"><div class="section-icon">\${ic(d.icon,22)}</div><h3>\${esc(d.name)}</h3><p>\${esc(d.desc)}</p><div style="margin-bottom:10px">\${pill(d.state)}</div><small style="display:block;color:var(--muted);font-size:10px">\${esc(d.services)}</small><button class="btn btn-outline" style="width:100%;margin-top:14px" onclick="openDepartmentDetail('\${d.id}')">فتح القسم</button></article>\`).join("")}</section>\`;
    }
    function openDepartmentDetail(id){state.openDept=id;render()}
    function closeDepartmentDetail(){state.openDept=null;render()}
    function departmentDetail(id){
      const d=state.departments.find(x=>x.id===id);
      if(!d){state.openDept=null;return departments()}
      const services=(d.services||"").split("·").map(s=>s.trim()).filter(Boolean);
      const editBtn=can('editDepartments')?\`<button class="btn btn-primary" onclick="openModal('editDepartment','\${d.id}')">تعديل بيانات القسم</button>\`:"";
      const person=getCurrentPerson();
      const deptStaff=state.staff.filter(s=>s.department===d.id);
      const supervisor=deptStaff.find(s=>s.roleCategory==="supervisor");
      const team=deptStaff.filter(s=>s.roleCategory==="staff");
      const deptStaffIds=deptStaff.map(s=>s.id);
      const deptStaffNames=deptStaff.map(s=>s.name);
      const deptAppts=state.appointments.filter(a=>deptStaffNames.includes(a.clinician));
      const completedAppts=deptAppts.filter(a=>a.status==="مكتمل");
      const patientNames=[...new Set(deptAppts.map(a=>a.patient))];
      const deptPatients=patientNames.map(n=>state.patients.find(p=>p.name===n)).filter(Boolean);
      const deptEvaluations=state.evaluations.filter(e=>deptStaffIds.includes(e.staffId));
      const deptPlans=state.plans.filter(p=>p.department===d.id);
      const deptAudits=state.qualityAudits.filter(a=>a.department===d.id);
      const isDeptSupervisor=!!(person&&supervisor&&person.id===supervisor.id);
      const isDeptStaffMember=!!(person&&team.some(s=>s.id===person.id));
      const isOtherSupervisor=!!(person&&person.roleCategory==="supervisor"&&person.department!==d.id);

      const canAssignSupervisor=can('editDepartments');
      const canAddMember=can('editDepartments')||isDeptSupervisor;
      const assignSupervisorBtn=canAssignSupervisor?\`<button class="btn btn-primary" style="padding:8px 14px;font-size:12px" onclick="openModal('staff','\${d.id}::supervisor')">\${ic("check",13)} \${supervisor?"تغيير المشرف/ة":"تعيين مشرف/ة"}</button>\`:"";
      const addMemberBtn=canAddMember?\`<button class="btn btn-outline" style="padding:8px 14px;font-size:12px" onclick="openModal('staff','\${d.id}::staff')">＋ إضافة عضو للفريق</button>\`:"";
      const supervisorBlock=supervisor?\`<div class="dept-supervisor-card"><div style="display:flex;align-items:center;gap:14px"><span class="dept-supervisor-avatar">\${ic("eye",24)}</span><div><span class="pill pill-gold" style="margin-bottom:6px;display:inline-block">مشرف/ة القسم</span><br><strong style="font-size:17px">\${esc(supervisor.name)}</strong><br><small style="color:var(--muted)">\${esc(supervisor.role)}\${supervisor.code?" · كود: "+esc(supervisor.code):""}</small></div></div>\${pill(supervisor.status)}</div>\`:\`<div class="dept-supervisor-card" style="justify-content:center;text-align:center"><small style="color:var(--muted);font-size:13px">لم يتم تعيين مشرف/ة لهذا القسم بعد.</small></div>\`;
      const memberBoxes=team.length?team.map(s=>\`<div class="box-card" style="display:flex;align-items:center;gap:12px"><span class="dept-member-avatar">\${ic("team",17)}</span><div style="min-width:0;flex:1"><strong style="display:block;font-size:13px">\${esc(s.name)}</strong><small>\${esc(s.role)}</small></div>\${pill(s.status)}</div>\`).join(""):\`<div class="empty">لا يوجد أخصائيون في هذا القسم بعد.</div>\`;
      const teamCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>المشرف والفريق</h2><div class="dept-actions-row">\${assignSupervisorBtn}\${addMemberBtn}</div></div>\${supervisorBlock}<div class="box-grid">\${memberBoxes}</div></section>\`;

      const teamThread=state.messages.filter(m=>deptStaffIds.includes(m.fromId)&&deptStaffIds.includes(m.toId)).slice(0,10);
      let teamRecipients=[];
      if(isDeptSupervisor) teamRecipients=team;
      else if(isDeptStaffMember&&supervisor) teamRecipients=[supervisor];
      const teamMsgForm=teamRecipients.length?\`<form onsubmit="sendInternalMessage(event)" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px"><div class="field" style="min-width:180px;margin:0"><label>إلى</label><select class="select" name="to">\${teamRecipients.map(r=>\`<option value="\${r.id}">\${esc(r.name)}</option>\`).join("")}</select></div><div class="field" style="flex:1;min-width:200px;margin:0"><label>الرسالة</label><input class="input" name="text" required placeholder="اكتب رسالتك هنا"></div><button class="btn btn-primary" type="submit">إرسال</button></form>\`:\`<div class="notice" style="margin-bottom:14px">\${person?"هذه القناة مخصصة لمشرف/ة القسم وأعضاء فريقه — سجّلي الدخول بكودك الشخصي إذا كنتِ من ضمنهم.":"سجّلي الدخول بكودك الشخصي لإرسال رسائل داخل القسم."}</div>\`;
      const teamMsgCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("chat",18)} تواصل المشرف مع فريق القسم</h2><span class="muted">قناة داخلية بين مشرف/ة القسم وأعضاء فريقه</span></div>\${teamMsgForm}<div class="list">\${teamThread.length?teamThread.map(m=>\`<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>\${esc(m.fromName)} ← \${esc(m.toName)}</strong><small>\${esc(m.text)}</small></div><div class="list-end">\${date(m.date)}</div></div>\`).join(""):\`<div class="empty">لا توجد رسائل بعد داخل هذا القسم.</div>\`}</div></section>\`;

      const allSupervisors=state.staff.filter(s=>s.roleCategory==="supervisor");
      const otherSupervisors=allSupervisors.filter(s=>s.department!==d.id);
      let crossRecipients=[];
      if(isDeptSupervisor) crossRecipients=otherSupervisors;
      else if(isOtherSupervisor&&supervisor) crossRecipients=[supervisor];
      const supervisorIds=allSupervisors.map(s=>s.id);
      const crossThread=supervisor?state.messages.filter(m=>supervisorIds.includes(m.fromId)&&supervisorIds.includes(m.toId)&&(m.fromId===supervisor.id||m.toId===supervisor.id)).slice(0,10):[];
      const crossMsgForm=crossRecipients.length?\`<form onsubmit="sendInternalMessage(event)" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px"><div class="field" style="min-width:200px;margin:0"><label>إلى</label><select class="select" name="to">\${crossRecipients.map(r=>\`<option value="\${r.id}">\${esc(r.name)} — \${esc(departmentLabel(r.department))}</option>\`).join("")}</select></div><div class="field" style="flex:1;min-width:200px;margin:0"><label>الرسالة</label><input class="input" name="text" required placeholder="نسّقي مع مشرف/ة القسم الآخر هنا"></div><button class="btn btn-primary" type="submit">إرسال</button></form>\`:\`<div class="notice" style="margin-bottom:14px">\${!supervisor?"لا يمكن التنسيق مع هذا القسم قبل تعيين مشرف/ة له.":"هذه القناة مخصصة للتواصل بين مشرفي/ات الأقسام المختلفة."}</div>\`;
      const crossMsgCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("chat",18)} تواصل مشرفي الأقسام</h2><span class="muted">لربط \${esc(d.name)} ببقية أقسام المركز</span></div>\${crossMsgForm}<div class="list">\${crossThread.length?crossThread.map(m=>\`<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>\${esc(m.fromName)} ← \${esc(m.toName)}</strong><small>\${esc(m.text)}</small></div><div class="list-end">\${date(m.date)}</div></div>\`).join(""):\`<div class="empty">لا توجد رسائل بعد بين مشرفي الأقسام حول \${esc(d.name)}.</div>\`}</div></section>\`;

      const assessBoxes=deptEvaluations.map(e=>{const s=personById(e.staffId);return \`<div class="box-card"><div class="box-card-head"><h4>\${esc(e.patient)}</h4>\${pill(e.status)}</div><small>\${esc(e.type)}</small><small>\${s?esc(s.name):"—"} · \${date(e.date)}</small></div>\`}).join("");
      const assessCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("eye",18)} التقييمات</h2><span class="muted">\${deptEvaluations.length} تقييم</span></div>\${deptEvaluations.length?\`<div class="box-grid">\${assessBoxes}</div>\`:\`<div class="empty">لا توجد تقييمات مسجّلة لهذا القسم بعد.</div>\`}</section>\`;

      const canManagePrograms=canManageDeptPrograms(d.id);
      const libNames=PROGRAM_LIBRARY[d.id]||[];
      const selectedPrograms=state.departmentPrograms[d.id]||[];
      const extraPrograms=selectedPrograms.filter(n=>!libNames.includes(n));
      const allProgramNames=[...libNames,...extraPrograms];
      const programChips=allProgramNames.length?\`<div class="chips">\${allProgramNames.map(n=>\`<label class="chip \${selectedPrograms.includes(n)?"checked":""}" \${canManagePrograms?\`onclick="toggleDeptProgram('\${d.id}','\${n.replace(/'/g,"\\\\'")}')"\`:""} style="\${canManagePrograms?"":"cursor:default"}">\${esc(n)}</label>\`).join("")}</div>\`:\`<div class="empty">لا توجد برامج معرّفة لهذا القسم بعد.</div>\`;
      const customProgramForm=canManagePrograms?\`<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><input class="input" id="custom-program-\${d.id}" style="flex:1;min-width:200px" placeholder="أضيفي برنامجاً غير موجود بالقائمة"><button type="button" class="btn btn-outline" style="width:auto;padding:9px 16px;white-space:nowrap" onclick="addCustomDeptProgram('\${d.id}')">＋ إضافة برنامج مخصص</button></div>\`:"";
      const libraryCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("blocks",18)} مكتبة البرامج العلاجية للقسم</h2><span class="muted">\${selectedPrograms.length} برنامج مفعّل</span></div><p class="muted" style="margin:-6px 0 14px">فعّلي البرامج التي يعمل بها \${esc(d.name)} فعليًا — وهذه هي البرامج التي ستظهر كخيار عند إسناد برنامج لملف أي مستفيد.\${canManagePrograms?"":" (العرض هنا للاطلاع فقط — التفعيل حصراً لمشرف/ة القسم أو الإدارة)"}</p>\${programChips}\${customProgramForm}</section>\`;

      const progBoxes=deptPatients.map(p=>{
        const patPrograms=(p.assignedPrograms||[]).filter(ap=>ap.department===d.id);
        const patProgramsHtml=patPrograms.length?\`<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">\${patPrograms.map(ap=>\`<span class="pill pill-good" style="font-size:10px">\${esc(ap.program)}</span>\`).join("")}</div>\`:"";
        return \`<div class="box-card"><div class="box-card-head"><h4>\${esc(p.name)}</h4>\${pill(p.status)}</div><small>\${esc(p.program)}</small><small>هدف الأسبوع: \${esc(p.goal)}</small>\${patProgramsHtml}</div>\`;
      }).join("");
      const progCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("target",18)} البرامج العلاجية للمستفيدين</h2><span class="muted">\${deptPatients.length} حالة نشطة</span></div>\${deptPatients.length?\`<div class="box-grid">\${progBoxes}</div>\`:\`<div class="empty">لا توجد حالات مرتبطة بهذا القسم حالياً.</div>\`}</section>\`;

      const reportCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("chart",18)} تقارير القسم</h2><span class="muted">نظرة سريعة على أداء \${esc(d.name)}</span></div><section class="metric-grid">\${metric("check","جلسات مكتملة",completedAppts.length,\`من \${deptAppts.length} موعد\`)}\${metric("patients","حالات مرتبطة",deptPatients.length,"مستفيد/ة")}\${metric("eye","تقييمات",deptEvaluations.length,"مسجّلة")}\${metric("book","خطط علاجية",deptPlans.length,"بكل الحالات")}</section></section>\`;

      const canReviewPlans=isDeptSupervisor||state.role==="management";
      const planBoxes=deptPlans.map(p=>{const s=personById(p.staffId);const actions=(canReviewPlans&&p.status==="معلقة")?\`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-outline" style="color:var(--teal);padding:6px 10px;font-size:11px" onclick="reviewPlan('\${p.id}','approve')">اعتماد</button><button class="btn btn-outline" style="color:var(--danger);padding:6px 10px;font-size:11px" onclick="reviewPlan('\${p.id}','return')">إرجاع</button></div>\`:"";return \`<div class="box-card"><div class="box-card-head"><h4>\${esc(p.title)}</h4>\${pill(p.status)}</div><small>\${esc(p.patient)}\${s?" · "+esc(s.name):""}</small><small>\${date(p.date)}\${p.note?" · "+esc(p.note):""}</small>\${actions}</div>\`}).join("");
      const plansCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("book",18)} الخطط العلاجية</h2><span class="muted">\${deptPlans.filter(p=>p.status==="معلقة").length} بانتظار الاعتماد</span></div>\${deptPlans.length?\`<div class="box-grid">\${planBoxes}</div>\`:\`<div class="empty">لا توجد خطط علاجية مسجّلة لهذا القسم بعد.</div>\`}</section>\`;

      const canAudit=isDeptSupervisor||state.role==="management";
      const auditBoxes=team.map(s=>{const audits=state.qualityAudits.filter(a=>a.staffId===s.id);const last=audits[0];const btn=canAudit?\`<button class="btn btn-outline" style="margin-top:10px;padding:6px 10px;font-size:11px;width:100%" onclick="openModal('qualityAudit','\${s.id}')">تسجيل جلسة إشرافية</button>\`:"";return \`<div class="box-card"><div class="box-card-head"><h4>\${esc(s.name)}</h4>\${last?pill(last.score+"/5"):""}</div><small>\${last?\`آخر جلسة: \${date(last.date)}\${last.notes?" · "+esc(last.notes):""}\`:"لا توجد جلسة إشرافية بعد"}</small>\${btn}</div>\`}).join("");
      const auditCard=\`<section class="card" style="margin-top:16px"><div class="card-head"><h2>\${ic("check",18)} الجلسات الإشرافية</h2><span class="muted">\${deptAudits.length} جلسة مسجّلة</span></div>\${team.length?\`<div class="box-grid">\${auditBoxes}</div>\`:\`<div class="empty">لا يوجد أخصائيون في هذا القسم بعد.</div>\`}</section>\`;

      return backBtn("closeDepartmentDetail()","العودة للأقسام")+head(esc(d.name),esc(d.name),esc(d.desc),\`<button class="btn btn-outline" onclick="setView('communicationHub')">\${ic("commHub",13)} أوان تواصل</button>\${editBtn}\`)+
        teamCard+
        \`<section class="card" style="margin-top:16px"><div class="card-head"><h2>نظرة عامة</h2><span>\${pill(d.state)}</span></div><div class="form-grid"><div class="field full"><label>الوصف</label><p>\${esc(d.desc)}</p></div></div></section>\`+
        \`<section class="card" style="margin-top:16px"><div class="card-head"><h2>الخدمات المقدمة</h2></div>\${services.length?\`<ul style="margin:0;padding-inline-start:20px;line-height:2">\${services.map(s=>\`<li>\${esc(s)}</li>\`).join("")}</ul>\`:\`<div class="empty">لا توجد خدمات مضافة بعد.</div>\`}</section>\`+
        teamMsgCard+
        crossMsgCard+
        assessCard+
        libraryCard+
        progCard+
        reportCard+
        plansCard+
        auditCard;
    }
    function settings(){return head("الإدارة / 06","إعدادات المركز","الهوية، الأدوار، بيانات التواصل، وروابط البوابات — في مكان واحد.","<span class=\\"pill pill-good\\">● يعمل محلياً</span>")+\`<div class="grid-2"><section class="card"><div class="card-head"><h2>ملف المركز</h2><span class="muted">يحفظ بعد إعادة التحميل</span></div><form onsubmit="saveSettings(event)"><div class="form-grid"><div class="field"><label>اسم المركز</label><input class="input" name="name" value="\${esc(state.center.name)}" required></div><div class="field"><label>المدينة</label><input class="input" name="city" value="\${esc(state.center.city)}" required></div><div class="field"><label>رقم التواصل</label><input class="input" name="phone" value="\${esc(state.center.phone)}"></div><div class="field"><label>البريد الإلكتروني</label><input class="input" name="email" value="\${esc(state.center.email)}"></div><div class="field full"><label>العنوان</label><input class="input" name="address" value="\${esc(state.center.address)}"></div><div class="field full"><label>اسم المشرف</label><input class="input" name="supervisor" value="\${esc(state.center.supervisor)}"></div></div><div class="actions"><button class="btn btn-primary" type="submit">حفظ التغييرات</button><button class="btn btn-outline" type="button" onclick="window.print()">حفظ البيانات PDF</button></div></form></section><section class="card"><div class="card-head"><h2>الأدوار والصلاحيات</h2><span class="muted">اختر مساحة العمل</span></div><div class="role-grid" style="grid-template-columns:1fr 1fr">\${Object.entries(roles).map(([key,r])=>\`<div class="role-card \${state.role===key?"selected":""}" onclick="changeRole('\${key}')"><span class="role-icon">\${ic(r.icon,20)}</span><b>\${r.label}</b><small>\${r.desc}</small></div>\`).join("")}</div><div class="notice" style="margin-top:16px">هذه نسخة HTML محلية. الصلاحيات هنا واجهة تشغيلية للتجربة على جهازك، وليست بديلاً عن مصادقة تجارية أو ربط هوية حقيقي.</div></section></div><section class="card" style="margin-top:18px"><div class="card-head"><h2>روابط البوابات العامة</h2><span class="muted">تعمل داخل الملف</span></div><div class="public-grid"><div class="portal-card" style="min-height:145px"><span class="portal-icon">\${ic("team",24)}</span><h3>بوابة الأسرة</h3><p>عرض ملف الطفل والتقدم والمواعيد.</p><button class="btn btn-outline" onclick="goPublic('parent')">فتح البوابة</button></div><div class="portal-card" style="min-height:145px"><span class="portal-icon">\${ic("medical",24)}</span><h3>بوابة الطبيب</h3><p>إرسال إحالة طبية للمركز.</p><button class="btn btn-outline" onclick="goPublic('doctor')">فتح البوابة</button></div><div class="portal-card" style="min-height:145px"><span class="portal-icon">\${ic("school",24)}</span><h3>بوابة المدرسة</h3><p>عرض الأهداف المصرح بها فقط.</p><button class="btn btn-outline" onclick="goPublic('school')">فتح البوابة</button></div><div class="portal-card" style="min-height:145px"><span class="portal-icon">\${ic("idcard",24)}</span><h3>كشك الحضور</h3><p>تسجيل حضور الفريق والزوار.</p><button class="btn btn-outline" onclick="goPublic('kiosk')">فتح الكشك</button></div></div></section>\${can('manageFamilyPortal')?\`<section class="card" style="margin-top:18px"><div class="card-head"><h2>خدمات بوابة الأسرة</h2><span class="muted">\${state.familyServices.length} خدمة</span></div><div class="notice-blue" style="margin-bottom:14px">فعّلي أو أوقفي أي خدمة تظهر للأسر في بوابتهم، أو أضيفي خدمة جديدة تظهر فورًا في البوابة.</div><div class="list">\${state.familyServices.map(s=>\`<div class="list-row"><div class="list-main"><strong>\${ic(s.icon,16)} \${esc(s.title)}</strong><small>\${esc(s.desc)}</small></div><div class="list-end" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end"><span class="pill \${s.enabled?"pill-good":"pill-grey"}">\${s.enabled?"مفعّلة":"موقوفة"}</span><button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="toggleFamilyService(\\'\${s.id}\\')">\${s.enabled?"إيقاف":"تفعيل"}</button>\${!s.builtin?\`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="removeFamilyService(\\'\${s.id}\\')">حذف</button>\`:""}</div></div>\`).join("")}</div><button class="btn btn-primary" style="margin-top:14px" onclick="openModal(\\'familyService\\')">＋ إضافة خدمة جديدة</button></section>\`:""}\${state.role==="management"?permissionsPanel()+staffCodesPanel():""}\`;
    }
    function permissionsPanel(){
      const editableRoles=["supervisor","reception","staff"];
      return \`<section class="card" style="margin-top:18px"><div class="card-head"><h2>صلاحيات الفريق</h2><span class="muted">حصرية للإدارة</span></div><div class="notice-blue" style="margin-bottom:14px">من هنا وحدها تتحكمين بحدود وصول الإشراف والاستقبال والموظفين — وسّعي صلاحية أي دور أو ضيّقيها في أي وقت.</div><div class="grid-2">\${editableRoles.map(roleKey=>{
        const r=roles[roleKey];
        const perms=state.rolePermissions[roleKey]||{};
        return \`<div class="list-row" style="flex-direction:column;align-items:stretch;gap:10px"><div class="list-main"><strong>\${ic(r.icon,16)} \${esc(r.label)}</strong><small>\${esc(r.desc)}</small></div><div class="list" style="gap:6px">\${Object.keys(permissionLabels).map(perm=>\`<div class="list-row" style="padding:8px 10px"><div class="list-main"><small>\${esc(permissionLabels[perm])}</small></div><div class="list-end"><span class="pill \${perms[perm]?"pill-good":"pill-grey"}">\${perms[perm]?"مفعّلة":"موقوفة"}</span><button class="btn btn-outline" style="padding:5px 9px;font-size:10px;margin-inline-start:6px" onclick="togglePermission('\${roleKey}','\${perm}')">\${perms[perm]?"سحب":"منح"}</button></div></div>\`).join("")}</div></div>\`;
      }).join("")}</div></section>\`;
    }
    function staffCodesPanel(){
      return \`<section class="card" style="margin-top:18px"><div class="card-head"><h2>إدارة أكواد الفريق</h2><span class="muted">\${state.staff.length} عضو</span></div><div class="notice-blue" style="margin-bottom:14px">كل عضو في الفريق يدخل بكوده الشخصي من صفحة اختيار الدور. عدّلي أي كود، غيّري فئة دخول أي شخص أو قسمه، أو أضيفي موظفاً جديداً من هنا.</div><div class="table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>الدور المهني</th><th>فئة الدخول</th><th>القسم</th><th>كود الدخول</th><th></th></tr></thead><tbody>\${state.staff.map(s=>\`<tr><td><b>\${esc(s.name)}</b></td><td>\${esc(s.role)}</td><td><select class="select" style="padding:6px;font-size:12px" onchange="updateStaffRoleCategory('\${s.id}',this.value)"><option value="supervisor" \${s.roleCategory==="supervisor"?"selected":""}>إشراف</option><option value="management" \${s.roleCategory==="management"?"selected":""}>إدارة</option><option value="staff" \${s.roleCategory==="staff"?"selected":""}>موظف</option><option value="reception" \${s.roleCategory==="reception"?"selected":""}>استقبال</option></select></td><td><select class="select" style="padding:6px;font-size:12px" onchange="updateStaffDepartment('\${s.id}',this.value)"><option value="">بدون قسم</option>\${state.departments.map(d=>\`<option value="\${d.id}" \${s.department===d.id?"selected":""}>\${esc(d.name)}</option>\`).join("")}</select></td><td style="white-space:nowrap"><input class="input" style="width:90px;display:inline-block;padding:6px 8px" value="\${esc(s.code||"")}" id="code-input-\${s.id}"></td><td><button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="updateStaffCode('\${s.id}', document.getElementById('code-input-\${s.id}').value)">حفظ الكود</button></td></tr>\`).join("")}</tbody></table></div><button class="btn btn-primary" style="margin-top:14px" onclick="openModal('staff')">＋ إضافة موظف جديد</button></section>\`;
    }
    function updateStaffCode(id,newCode){
      const code=(newCode||"").trim();
      if(!code){notify("اكتبي كوداً صحيحاً قبل الحفظ");return}
      const clash=state.staff.find(s=>s.id!==id&&s.code&&s.code.toLowerCase()===code.toLowerCase());
      if(clash){notify("هذا الكود مستخدم بالفعل لـ "+clash.name);return}
      const s=personById(id); if(!s)return;
      s.code=code;persist();notify("تم تحديث كود الدخول لـ "+s.name);render();
    }
    function updateStaffRoleCategory(id,cat){
      const s=personById(id); if(!s)return;
      s.roleCategory=cat; s.clinical = cat==="staff"||cat==="supervisor";
      persist();notify("تم تحديث فئة دخول "+s.name);render();
    }
    function updateStaffDepartment(id,dept){
      const s=personById(id); if(!s)return;
      s.department=dept||null;
      persist();notify("تم تحديث قسم "+s.name);render();
    }
    function rolePicker(){
      const person=getCurrentPerson();
      return \`<div class="muted" style="margin-bottom:10px">يمكن تغييره لاحقاً من إعدادات المركز</div><div class="role-grid">\${Object.entries(roles).map(([key,r])=>\`<div class="role-card \${state.role===key?"selected":""}" onclick="changeRole('\${key}');closeModal()"><span class="role-icon">\${ic(r.icon,22)}</span><b>\${r.label}</b><small>\${r.desc}</small></div>\`).join("")}</div><hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><div class="card-head" style="padding:0 0 10px"><h2 style="font-size:15px">دخول موظف بالكود الشخصي</h2><span class="muted">\${person?\`مسجّلة الدخول: \${esc(person.name)}\`:"كل موظف لديه كود دخول خاص به"}</span></div><form onsubmit="staffCodeLogin(event)" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end"><div class="field" style="flex:1;min-width:180px;margin:0"><label>الكود الشخصي</label><input class="input" name="code" id="staff-code-input" placeholder="مثال: ه1" required></div><button class="btn btn-primary" type="submit">دخول</button>\${person?\`<button type="button" class="btn btn-outline" onclick="staffLogout()">تسجيل الخروج</button>\`:""}</form>\`;
    }
`;export{e as default};
//# sourceMappingURL=04-connect-comm-library-BWOzi9J4.js.map
