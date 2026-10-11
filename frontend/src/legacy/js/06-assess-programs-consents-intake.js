"use strict";
// أوان — الجزء 6 من 16: 06-assess-programs-consents-intake
// كل ملفات js/ هذي تشتغل كأنها ملف واحد بالترتيب — ما تغيّر ترتيبها في index.html
    // ===== أدوات التقييم القياسية (VB-MAPP / ABLLS-R / PEP-3 / ASQ / AFLS / PEAK) =====
    function stdAssessDomainsHtml(instrumentKey, existingDomains){
      const names=(ASSESSMENT_INSTRUMENTS[instrumentKey]||[]).slice();
      (existingDomains||[]).forEach(d=>{ if(!names.includes(d.name)) names.push(d.name); });
      const scoreOf=name=>{ const found=(existingDomains||[]).find(d=>d.name===name); return found?found.score:2; };
      if(!names.length) return `<div class="empty">هذه الأداة بدون مجالات جاهزة — أضيفي مجالاتك يدويًا من الحقل أدناه.</div>`;
      return `<div class="form-grid">${names.map(n=>`<div class="field" data-assess-domain-field><label>${esc(n)}</label><select class="select assess-domain-select" data-domain="${esc(n)}">${ASSESSMENT_LEVELS.map((lvl,i)=>`<option value="${i}" ${i===scoreOf(n)?"selected":""}>${esc(lvl)}</option>`).join("")}</select></div>`).join("")}</div>`;
    }
    function renderStdAssessDomains(instrumentKey){
      const box=document.getElementById("stdAssessDomainsBox");
      if(box) box.innerHTML=stdAssessDomainsHtml(instrumentKey);
    }
    function addCustomAssessDomain(){
      const input=document.getElementById("stdAssessCustomDomainName");
      const name=(input&&input.value||"").trim();
      if(!name) return;
      const box=document.getElementById("stdAssessDomainsBox");
      if(!box) return;
      if(box.querySelector(`[data-domain="${CSS.escape(name)}"]`)){ notify("هذا المجال مضاف بالفعل"); return }
      const wasEmpty=!box.querySelector("[data-assess-domain-field]");
      const rowHtml=`<div class="field" data-assess-domain-field><label>${esc(name)}</label><select class="select assess-domain-select" data-domain="${esc(name)}">${ASSESSMENT_LEVELS.map((lvl,i)=>`<option value="${i}" ${i===2?"selected":""}>${esc(lvl)}</option>`).join("")}</select></div>`;
      if(wasEmpty){ box.innerHTML=`<div class="form-grid">${rowHtml}</div>` }
      else { const grid=box.querySelector(".form-grid"); if(grid) grid.insertAdjacentHTML("beforeend", rowHtml); }
      input.value="";
    }
    function assessPctOf(rec){ return (rec.domains&&rec.domains.length) ? Math.round(rec.domains.reduce((s,d)=>s+(d.score||0),0)/(rec.domains.length*4)*100) : 0 }
    function saveStdAssessment(e,patientId){
      e.preventDefault();
      if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية إضافة تقييمات لهذا الملف");return}
      const f=formData(e);
      const selects=Array.from(e.target.querySelectorAll(".assess-domain-select"));
      const domains=selects.map(sel=>({name:sel.getAttribute("data-domain"), score:Number(sel.value)}));
      const person=getCurrentPerson();
      state.standardizedAssessments.unshift({id:"sa-"+Date.now(), patientId, staffId:person?person.id:(state.staff[0]&&state.staff[0].id), instrument:f.instrument, date:f.date||todayISO(), domains, notes:f.notes||""});
      persist();closeModal();notify("تم حفظ التقييم القياسي");render();
    }
    function deleteStdAssessment(id,patientId){
      if(!can('editPatients')){notify("لا تملكين صلاحية حذف التقييمات");return}
      state.standardizedAssessments=state.standardizedAssessments.filter(a=>a.id!==id);
      persist();notify("تم حذف التقييم");render();
    }
    // ===== مكتبة البرامج العلاجية (اختيار على مستوى القسم + إسناد على مستوى الملف) =====
    function canManageDeptPrograms(deptId){
      if(can('editDepartments')) return true;
      const person=getCurrentPerson();
      if(!person) return false;
      const supervisor=state.staff.find(s=>s.department===deptId&&s.roleCategory==="supervisor");
      return !!(supervisor&&person.id===supervisor.id);
    }
    function toggleDeptProgram(deptId,name){
      if(!canManageDeptPrograms(deptId)){notify("لا تملكين صلاحية تعديل برامج هذا القسم");return}
      if(!Array.isArray(state.departmentPrograms[deptId])) state.departmentPrograms[deptId]=[];
      const list=state.departmentPrograms[deptId];
      const i=list.indexOf(name);
      if(i>=0) list.splice(i,1); else list.push(name);
      persist();notify(i>=0?"تم إيقاف البرنامج لهذا القسم":"تم تفعيل البرنامج لهذا القسم");render();
    }
    function addCustomDeptProgram(deptId){
      if(!canManageDeptPrograms(deptId)){notify("لا تملكين صلاحية تعديل برامج هذا القسم");return}
      const input=document.getElementById("custom-program-"+deptId);
      const name=(input&&input.value||"").trim();
      if(!name) return;
      if(!Array.isArray(state.departmentPrograms[deptId])) state.departmentPrograms[deptId]=[];
      if(state.departmentPrograms[deptId].includes(name)){notify("هذا البرنامج مضاف بالفعل");return}
      state.departmentPrograms[deptId].push(name);
      persist();notify("تمت إضافة البرنامج");render();
    }
    function renderAssignProgramOptions(deptId){
      const sel=document.getElementById("assignProgramSelect");
      if(!sel) return;
      const names=state.departmentPrograms[deptId]||[];
      sel.innerHTML=names.length?names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join(""):`<option value="">لا توجد برامج مفعّلة لهذا القسم</option>`;
    }
    function saveAssignProgram(e,patientId){
      e.preventDefault();
      if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية إسناد برامج لهذا الملف");return}
      const f=formData(e);
      if(!f.department||!f.program){closeModal();notify("اختاري القسم والبرنامج");return}
      const p=state.patients.find(x=>x.id===patientId);
      if(!p) return;
      if(!Array.isArray(p.assignedPrograms)) p.assignedPrograms=[];
      const person=getCurrentPerson();
      p.assignedPrograms.unshift({id:"ap-"+Date.now(),department:f.department,program:f.program,date:todayISO(),addedBy:person?person.name:""});
      persist();closeModal();notify("تم إسناد البرنامج للملف");render();
    }
    function removeAssignedProgram(patientId,apId){
      if(!can('editPatients')){notify("لا تملكين صلاحية تعديل برامج هذا الملف");return}
      const p=state.patients.find(x=>x.id===patientId);
      if(!p) return;
      p.assignedPrograms=(p.assignedPrograms||[]).filter(a=>a.id!==apId);
      persist();notify("تم إزالة البرنامج من الملف");render();
    }
    function deletePatientPermanently(id){if(!can('editPatients')){notify("لا تملكين صلاحية حذف الملفات نهائيًا");return}const p=state.patients.find(x=>x.id===id);if(p&&confirm(`سيتم حذف ملف ${p.name} نهائيًا ولا يمكن التراجع عن هذا الإجراء. هل أنتِ متأكدة؟`)){state.patients=state.patients.filter(x=>x.id!==id);persist();notify("تم الحذف النهائي للملف");render()}}

    function advanceReferral(i){const flow=["جديدة","قيد الفرز","تم التواصل","مقبولة"];const r=state.referrals[i];r.status=flow[(flow.indexOf(r.status)+1)%flow.length];persist();notify("تم تحديث حالة الإحالة");render()}
    function advanceRegistration(i){const flow=["قيد المراجعة","تم التواصل","مقبول للمراجعة التالية"];const r=state.registrations[i];r.status=flow[(flow.indexOf(r.status)+1)%flow.length];persist();notify("تم تحديث طلب التسجيل");render()}
    function markAttendance(i){state.staff[i].present=true;state.staff[i].status="حاضر";persist();document.getElementById("portal-result").innerHTML=`<div class="notice-blue">تم تسجيل حضور ${esc(state.staff[i].name)} بنجاح.</div>`;render()}
    function setParentTab(tab){state.parentTab=tab;persist();render()}
    function submitCaseStudy(e){e.preventDefault();const f=formData(e);state.registrations.unshift({...f,status:"قيد المراجعة",date:"2026-09-04"});persist();e.target.reset();document.getElementById("portal-result").innerHTML=`<div class="notice-blue">تم استلام دراسة حالة <b>${esc(f.child)}</b> — سيتواصل معك فريق ${esc(state.center.name)} خلال يومي عمل.</div>`}
    function submitConsultation(e){e.preventDefault();const f=formData(e);state.referrals.unshift({name:`طلب حجز كشف استشارة — ${f.child} (${date(f.date)} · ${time(f.time)})`,person:`${f.guardian} · ${f.phone}`,type:"استشارة",priority:"عالية",status:"جديدة",date:"2026-09-04"});persist();e.target.reset();document.getElementById("portal-result").innerHTML=`<div class="notice-blue">تم إرسال طلب الحجز — سنؤكد الموعد عبر التواصل معكِ على <b>${esc(f.phone)}</b>.</div>`}
    function submitQuestion(e){e.preventDefault();const f=formData(e);state.referrals.unshift({name:`سؤال من ${f.name}`,person:`${f.name} · ${f.phone}`,type:"عام",priority:"منخفضة",status:"جديدة",date:"2026-09-04",note:f.question});persist();e.target.reset();document.getElementById("portal-result").innerHTML=`<div class="notice-blue">تم استلام سؤالك — سيتواصل معك فريق ${esc(state.center.name)} على <b>${esc(f.phone)}</b> قريباً.</div>`}
    function submitCustomServiceRequest(e,svcId){e.preventDefault();const f=formData(e);const svc=state.familyServices.find(s=>s.id===svcId);state.referrals.unshift({name:`طلب خدمة: ${svc?svc.title:svcId} — ${f.name}`,person:`${f.name} · ${f.phone}`,type:"عام",priority:"متوسطة",status:"جديدة",date:new Date().toISOString().slice(0,10),note:f.message||""});persist();e.target.reset();document.getElementById("portal-result").innerHTML=`<div class="notice-blue">تم استلام طلبك — سيتواصل معك فريق ${esc(state.center.name)} على <b>${esc(f.phone)}</b> قريباً.</div>`}
    function toggleFamilyService(id){const s=state.familyServices.find(x=>x.id===id);if(s){s.enabled=!s.enabled;persist();notify(s.enabled?`تم تفعيل خدمة "${s.title}" في بوابة الأسرة`:`تم إيقاف خدمة "${s.title}" من بوابة الأسرة`);render()}}
    function addFamilyService(e){e.preventDefault();const f=formData(e);const id="custom-"+Date.now();state.familyServices.push({id,icon:f.icon||"heart",title:f.title,desc:f.desc,cta:f.cta&&f.cta.trim()?f.cta.trim():"إرسال الطلب",enabled:true,builtin:false});persist();closeModal();notify(`تمت إضافة "${f.title}" — ستظهر الآن في بوابة الأسرة`);render()}
    function removeFamilyService(id){const s=state.familyServices.find(x=>x.id===id);if(s&&!s.builtin&&confirm(`هل تريدين حذف خدمة "${s.title}" نهائياً؟`)){state.familyServices=state.familyServices.filter(x=>x.id!==id);persist();notify("تم حذف الخدمة");render()}}

    function parentLogin(e){e.preventDefault();const name=document.getElementById("parent-name").value.trim(),code=document.getElementById("parent-code").value.trim().toUpperCase(),p=state.patients.find(x=>x.name===name&&x.code.toUpperCase()===code);if(p){state.familySession={name:p.name,code:p.code};persist();render();}else{document.getElementById("portal-result").innerHTML=`<div class="notice" style="background:var(--danger-2);border-color:#fecaca;color:var(--danger)">لم يتم العثور على الملف. تحقق من الاسم وكود الوصول.</div>`;}}
    function logoutFamily(){state.familySession=null;state.parentTab="menu";persist();render()}
    function schoolLogin(e){e.preventDefault();const name=document.getElementById("school-name").value.trim(),code=document.getElementById("school-code").value.trim().toUpperCase(),p=state.patients.find(x=>x.name===name&&x.schoolCode===code),r=document.getElementById("portal-result");const schoolHealthNote=(p&&p.health&&p.health.sharedWithSchool&&p.health.schoolNote)?`<div class="notice" style="margin-top:12px"><b>ملاحظة صحية مهمة للمدرسة</b><br>${esc(p.health.schoolNote)}</div>`:"";r.innerHTML=p?`<div class="notice-blue"><b>الأهداف المصرح بها لـ ${esc(p.name)}</b><br><br>• ${esc(p.goal)}<br>• الانتقال بين الأنشطة مع دعم بصري<br>• المشاركة في نشاط جماعي لمدة 5 دقائق</div>${schoolHealthNote}`:`<div class="notice" style="background:var(--danger-2);border-color:#fecaca;color:var(--danger)">تحقق من اسم الطفل وكود المدرسة المستقل.</div>`}
    function publicReferral(e){e.preventDefault();const f=formData(e);state.referrals.unshift({name:"إحالة طبية — "+f.child,person:f.person,type:"طبية",priority:"عالية",status:"جديدة",date:"2026-09-02"});persist();e.target.reset();document.getElementById("portal-result").innerHTML=`<div class="notice-blue">تم استلام الإحالة وإرسالها إلى صندوق مراجعة ${esc(state.center.name)}. رقم المتابعة: MR-${Date.now().toString().slice(-6)}.</div>`}
    function submitMedicalLinkReport(e){
      e.preventDefault();const f=formData(e);const r=document.getElementById("med-link-result");
      const childName=(f.child||"").trim(),linkCode=(f.linkCode||"").trim().toUpperCase();
      const p=state.patients.find(x=>x.name.trim()===childName && x.health && (x.health.linkCode||"").toUpperCase()===linkCode);
      if(!p){r.innerHTML=`<div class="notice" style="background:var(--danger-2);border-color:#fecaca;color:var(--danger)">تعذر العثور على ملف مطابق لاسم الطفل ورمز الربط الطبي. تأكد من الرمز مع الأسرة أو المركز، أو استخدم نموذج الإحالة الأولية أعلاه إذا كان الطفل غير مسجل بعد.</div>`;return}
      state.referrals.unshift({name:"تقرير طبي — "+p.name,person:f.facility+(f.doctorName?" — "+f.doctorName:""),type:"تقرير طبي",priority:"عالية",status:"جديدة",date:todayISO(),patientId:p.id,category:f.category,facility:f.facility,doctorName:f.doctorName||"",summary:f.summary});
      persist();e.target.reset();
      r.innerHTML=`<div class="notice-blue">تم استلام التقرير وإرساله لمراجعة فريق ${esc(state.center.name)} قبل إلحاقه بالملف الصحي الموحد لـ${esc(p.name)}. رقم المتابعة: MR-${Date.now().toString().slice(-6)}.</div>`;
    }
    function attachMedicalReport(i){
      if(!can('editPatients')){notify("لا تملكين صلاحية إلحاق التقارير الطبية");return}
      const r=state.referrals[i];
      if(!r||!r.patientId){notify("هذا الطلب لا يحتوي على ملف مرتبط");return}
      const p=state.patients.find(x=>x.id===r.patientId);
      if(!p){notify("تعذر إيجاد الملف المرتبط");return}
      if(!p.health) p.health=defaultHealth(p);
      if(r.category==="hearing"){
        p.health.hearingScreening={status:"تم — توجد ملاحظات",date:r.date||"",facility:r.facility||"",notes:r.summary||""};
      } else {
        p.health.neuroReports.unshift({id:"nr-"+Date.now(),date:r.date||"",facility:r.facility||"",doctorName:r.doctorName||"",summary:r.summary||""});
      }
      r.status="أُلحق بالملف الصحي";
      persist();notify("تم إلحاق التقرير بالملف الصحي الموحد للطفل");render();
    }
    // =================== الموافقات الإلكترونية + سجل التدقيق + كيوسك الحضور ===================
    // كل هذا يتحفظ في نفس state المحلي. سجل التدقيق يحفظ «مين عمل وش ومتى وعلى أي ملف» بس،
    // وما ينسخ أي محتوى سريري (ملاحظات، نتائج) جواه.
    function ensureOpsState(){
      if(!Array.isArray(state.auditLog)) state.auditLog=[];
      if(!Array.isArray(state.attendanceLog)) state.attendanceLog=[];
    }
    function pad2(n){return String(n).padStart(2,"0")}
    function localDateOf(d){d=d instanceof Date?d:new Date(d);return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())}
    function localTimeOf(d){d=d instanceof Date?d:new Date(d);return pad2(d.getHours())+":"+pad2(d.getMinutes())}
    function auditActor(){
      if(state.view==="public"){const fs=state.familySession;return {name:fs?("ولي الأمر"+(fs.name?" · "+fs.name:"")):"زائر",role:"بوابة الأسرة"}}
      const p=getCurrentPerson()||(state.role==="staff"&&typeof lsPerson==="function"?lsPerson():null);const r=roles[state.role];
      return {name:p?p.name:(r?r.label:"—"),role:r?r.label:""};
    }
    function audit(action,target){
      ensureOpsState();const a=auditActor();
      state.auditLog.unshift({id:"au-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),at:new Date().toISOString(),by:a.name,role:a.role,action,target:target||""});
      if(state.auditLog.length>3000) state.auditLog.length=3000;
    }
    function auditView(){
      ensureOpsState();
      const f=state.auditFilter||{who:"",what:""};
      const people=[...new Set(state.auditLog.map(x=>x.by))];
      const actions=[...new Set(state.auditLog.map(x=>x.action.split(":")[0]))];
      const rows=state.auditLog.filter(x=>(!f.who||x.by===f.who)&&(!f.what||x.action.split(":")[0]===f.what)).slice(0,300);
      return head("الرقابة","سجل التدقيق","كل فتح أو تعديل لملف، وكل حضور وانصراف وموافقة، يتسجل باسم الشخص والوقت.","")
      +`<section class="card"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">
        <div class="field" style="min-width:200px;margin:0"><label>الشخص</label><select class="select" onchange="setAuditFilter('who',this.value)"><option value="">الكل</option>${people.map(n=>`<option ${f.who===n?"selected":""}>${esc(n)}</option>`).join("")}</select></div>
        <div class="field" style="min-width:200px;margin:0"><label>نوع الإجراء</label><select class="select" onchange="setAuditFilter('what',this.value)"><option value="">الكل</option>${actions.map(n=>`<option ${f.what===n?"selected":""}>${esc(n)}</option>`).join("")}</select></div>
        <span class="muted">${rows.length} إجراء${state.auditLog.length>rows.length?` من ${state.auditLog.length}`:""}</span></div>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>التاريخ</th><th>الوقت</th><th>الشخص</th><th>الدور</th><th>الإجراء</th><th>الملف / الهدف</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td>${date(localDateOf(x.at))}</td><td><b>${localTimeOf(x.at)}</b></td><td>${esc(x.by)}</td><td>${esc(x.role)}</td><td>${esc(x.action)}</td><td>${esc(x.target)}</td></tr>`).join(""):`<tr><td colspan="6"><div class="empty">للحين ما فيه إجراءات مسجلة. أي فتح ملف أو تعديل أو حضور من الحين بيظهر هنا.</div></td></tr>`}</tbody></table></div>
        <p class="muted" style="margin-top:10px;font-size:11.5px">السجل ما يقدر حد يعدّله أو يمسحه من الواجهة، وما ينسخ محتوى الملاحظات السريرية. في النسخة الكاملة يتحفظ على السيرفر.</p></section>`;
    }
    function goAudit(){state.auditFilter={who:"",what:""};setView("audit")}
    function csCloseSig(){state.csSigView=null;render()}
    function famOtpCancel(){state.famOtp=null;render()}
    function setAuditFilter(k,v){state.auditFilter=Object.assign({who:"",what:""},state.auditFilter||{},{[k]:v});render()}
    function patientAuditCard(p){
      if(!(state.role==="management"||state.role==="supervisor")) return "";
      ensureOpsState();const rows=state.auditLog.filter(x=>x.target===p.name).slice(0,8);
      return `<section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("shield",18)} آخر الإجراءات على الملف</h2><button class="back-link" onclick="goAudit()">سجل التدقيق كامل ←</button></div><div class="list">${rows.length?rows.map(x=>`<div class="list-row"><div class="list-main"><strong>${esc(x.action)}</strong><small>${esc(x.by)} · ${esc(x.role)}</small></div><div class="list-end"><b style="font-size:12px">${localTimeOf(x.at)}</b><small style="display:block;color:var(--muted);font-size:10px">${date(localDateOf(x.at))}</small></div></div>`).join(""):`<div class="empty">ما فيه إجراءات مسجلة على الملف هذا للحين.</div>`}</div></section>`;
    }

    // ---- الموافقات ----
    const CONSENT_TYPES=[
      {k:"treatment",l:"التقييم والعلاج",v:"1.0",text:"أوافق على تقييم طفلي وتقديم الجلسات العلاجية حسب الخطة المعتمدة من المركز."},
      {k:"recording",l:"تسجيل عينات صوتية أو مرئية قصيرة",v:"1.0",days:365,text:"أوافق على تسجيل عينات قصيرة من كلام طفلي أثناء الجلسات للمتابعة الإكلينيكية فقط. التسجيلات تُحفظ داخل ملفه ولا تُشارك خارج الفريق المعالج."},
      {k:"school",l:"مشاركة التقارير مع المدرسة",v:"1.0",text:"أوافق على مشاركة تقارير التقدم مع مدرسة طفلي المسجلة في الملف."},
      {k:"whatsapp",l:"التواصل عبر واتساب",v:"1.0",text:"أوافق على تواصل المركز معي عبر واتساب بخصوص المواعيد والتقارير."}];
    function consentsOf(p){if(!Array.isArray(p.consents))p.consents=[];return p.consents}
    function consentStatus(p,k){
      const list=consentsOf(p).filter(c=>c.type===k);const last=list[list.length-1];
      if(!last) return {st:"none"};
      if(last.withdrawnAt) return {st:"withdrawn",c:last};
      if(last.expires&&last.expires<localDateOf(new Date())) return {st:"expired",c:last};
      return {st:"active",c:last};
    }
    function consentPill(s){
      if(s.st==="active") return `<span class="pill pill-good">سارية</span>`;
      if(s.st==="withdrawn") return `<span class="pill pill-red">مسحوبة</span>`;
      if(s.st==="expired") return `<span class="pill pill-gold">منتهية</span>`;
      return `<span class="pill pill-grey">غير ممنوحة</span>`;
    }
    function consentDetail(s){
      if(!s.c) return "";
      const c=s.c;
      if(s.st==="withdrawn") return `سُحبت ${date(localDateOf(c.withdrawnAt))} ${localTimeOf(c.withdrawnAt)} · ${esc(c.withdrawnBy||"")}`;
      return `${esc(c.method)} · ${esc(c.by||"")} · ${date(localDateOf(c.grantedAt))} ${localTimeOf(c.grantedAt)}${c.expires?` · تنتهي ${date(c.expires)}`:""} · نص الموافقة إصدار ${esc(c.version)}`;
    }
    function canManageConsents(){return state.role==="management"||state.role==="reception"||state.role==="supervisor"}
    function consentsCard(p){
      const manage=canManageConsents();const signing=state.consentSignFor===p.id;
      const pendingTypes=CONSENT_TYPES.filter(t=>consentStatus(p,t.k).st!=="active");
      let h=`<section class="card jr-consents" style="margin-top:16px"><div class="card-head"><h2>${ic("check",18)} الموافقات</h2>${manage&&!signing&&pendingTypes.length?`<button class="btn btn-primary" onclick="csOpen('${p.id}')">توقيع ولي الأمر على الجهاز</button>`:""}</div>
        <div class="list">${CONSENT_TYPES.map(t=>{const s=consentStatus(p,t.k);const conf=state.csConfirm===p.id+"|"+t.k;
          return `<div class="list-row"><div class="list-main"><strong>${esc(t.l)}</strong><small>${consentDetail(s)||"ولي الأمر يقدر يوافق من بوابة الأسرة أو بالتوقيع هنا"}</small></div><div class="list-end" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${consentPill(s)}${s.st==="active"&&s.c.sig?`<button class="btn btn-outline" style="padding:4px 8px;font-size:11px" onclick="csShowSig('${p.id}','${t.k}')">التوقيع</button>`:""}${manage&&s.st==="active"?`<button class="btn ${conf?"btn-danger":"btn-outline"}" style="padding:4px 8px;font-size:11px" onclick="csWithdraw('${p.id}','${t.k}')">${conf?"تأكيد السحب":"سحب بطلب ولي الأمر"}</button>`:""}</div></div>`}).join("")}</div>`;
      if(state.csSigView&&state.csSigView.pid===p.id){const c=consentStatus(p,state.csSigView.k).c;if(c&&c.sig)h+=`<div class="notice" style="margin-top:12px"><b>توقيع ${esc(c.by||"ولي الأمر")}</b><br><img src="${c.sig}" alt="توقيع ولي الأمر" style="max-width:100%;background:#fff;border:1px solid var(--line);border-radius:10px;margin-top:8px"><div class="muted" style="margin-top:6px">«${esc(c.text)}»</div><button class="btn btn-outline" style="margin-top:8px" onclick="csCloseSig()">إغلاق</button></div>`}
      if(signing){
        h+=`<div class="cs-sign"><h3 style="margin:0 0 8px;font-size:15px">توقيع ولي الأمر</h3>
          <div class="field" style="margin:0 0 10px"><label>اسم ولي الأمر</label><input class="input" id="cs-guardian" value="${esc(p.guardian||"")}"></div>
          ${pendingTypes.map(t=>`<label class="consent-row" style="margin:6px 0"><input type="checkbox" name="cs-type" value="${t.k}" checked><span><b>${esc(t.l)}</b><br>${esc(t.text)}</span></label>`).join("")}
          <div class="muted" style="margin:10px 0 6px">وقّع بصباعك في المربع:</div>
          <canvas id="cs-canvas" class="cs-canvas" width="720" height="220" onpointerdown="csStart(event)" onpointermove="csMove(event)" onpointerup="csEnd()" onpointerleave="csEnd()"></canvas>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-primary" onclick="csSave('${p.id}')">حفظ الموافقة</button><button class="btn btn-outline" onclick="csClear()">مسح التوقيع</button><button class="btn btn-outline" onclick="csCancel()">إلغاء</button></div></div>`;
      }
      return h+`</section>`;
    }
    let _sig=null;
    function csOpen(pid){state.consentSignFor=pid;state.csSigView=null;_sig=null;render()}
    function csCancel(){state.consentSignFor=null;_sig=null;render()}
    function csPt(e,c){const r=c.getBoundingClientRect();return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]}
    function csStart(e){const c=e.currentTarget;const ctx=c.getContext("2d");_sig={c,ctx,drawing:true,has:(_sig&&_sig.c===c)?_sig.has:false};ctx.lineWidth=3.2;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#20302E";const [x,y]=csPt(e,c);ctx.beginPath();ctx.moveTo(x,y);try{c.setPointerCapture(e.pointerId)}catch(_e){}e.preventDefault()}
    function csMove(e){if(!_sig||!_sig.drawing)return;const [x,y]=csPt(e,_sig.c);_sig.ctx.lineTo(x,y);_sig.ctx.stroke();_sig.has=true;e.preventDefault()}
    function csEnd(){if(_sig)_sig.drawing=false}
    function csClear(){const c=document.getElementById("cs-canvas");if(c)c.getContext("2d").clearRect(0,0,c.width,c.height);_sig=null}
    function csSave(pid){
      const p=state.patients.find(x=>x.id===pid);if(!p)return;
      const types=[...document.querySelectorAll('input[name="cs-type"]:checked')].map(x=>x.value);
      const guardian=(document.getElementById("cs-guardian").value||"").trim();
      if(!types.length){notify("اختاري موافقة واحدة على الأقل");return}
      if(!guardian){notify("اكتبي اسم ولي الأمر");return}
      if(!_sig||!_sig.has){notify("محتاجين توقيع ولي الأمر في المربع");return}
      const src=document.getElementById("cs-canvas");const small=document.createElement("canvas");small.width=360;small.height=110;const sc=small.getContext("2d");sc.fillStyle="#fff";sc.fillRect(0,0,360,110);sc.drawImage(src,0,0,360,110);
      const sig=small.toDataURL("image/jpeg",0.7);const now=new Date();const rec=auditActor();
      types.forEach(k=>{const t=CONSENT_TYPES.find(x=>x.k===k);const exp=t.days?localDateOf(new Date(now.getTime()+t.days*864e5)):null;
        consentsOf(p).push({id:"cs-"+Date.now()+"-"+k,type:k,version:t.v,text:t.text,grantedAt:now.toISOString(),by:guardian,method:"توقيع بالإصبع على جهاز المركز",recordedBy:rec.name,sig,expires:exp})});
      audit("توقيع موافقة: "+types.map(k=>CONSENT_TYPES.find(x=>x.k===k).l).join("، "),p.name);
      state.consentSignFor=null;_sig=null;persist();notify("انحفظت الموافقة بالتوقيع والتاريخ والوقت");render();
    }
    function csShowSig(pid,k){state.csSigView={pid,k};render()}
    function csWithdraw(pid,k){
      const key=pid+"|"+k;
      if(state.csConfirm!==key){state.csConfirm=key;render();setTimeout(()=>{if(state.csConfirm===key){state.csConfirm=null;render()}},4000);return}
      state.csConfirm=null;const p=state.patients.find(x=>x.id===pid);const s=consentStatus(p,k);if(s.st!=="active")return;
      s.c.withdrawnAt=new Date().toISOString();s.c.withdrawnBy=auditActor().name+" (بطلب ولي الأمر)";
      audit("سحب موافقة: "+CONSENT_TYPES.find(x=>x.k===k).l,p.name);persist();notify("انسجل سحب الموافقة");render();
    }
    // بوابة الأسرة
    function consentFamilySection(p){
      const otp=state.famOtp&&state.famOtp.pid===p.id?state.famOtp:null;
      return `<div class="notice" style="margin-top:16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><b>الموافقات</b><span class="muted">تقدري توافقي أو تسحبي أي موافقة في أي وقت، وكل خطوة تتسجل بالتاريخ والوقت.</span></div>
        ${CONSENT_TYPES.map(t=>{const s=consentStatus(p,t.k);const conf=state.famConfirm===p.id+"|"+t.k;const isOtp=otp&&otp.k===t.k;
          return `<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>${esc(t.l)}</strong><small>${esc(t.text)}</small>${s.c?`<small style="display:block;margin-top:4px">${consentDetail(s)}</small>`:""}
            ${isOtp?`<form onsubmit="famConsentVerify(event,'${p.id}')" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center"><input class="input" name="code" inputmode="numeric" maxlength="4" required placeholder="رمز التحقق" style="max-width:140px"><button class="btn btn-primary" type="submit">تأكيد الموافقة</button><button type="button" class="btn btn-outline" onclick="famOtpCancel()">إلغاء</button><span class="muted" style="font-size:11px">انرسل رمز على جوال ولي الأمر المسجل. في النسخة التجريبية الرمز هو <b>${otp.code}</b>.</span></form>`:""}</div>
            <div class="list-end" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${consentPill(s)}${s.st==="active"?`<button class="btn ${conf?"btn-danger":"btn-outline"}" style="padding:5px 10px;font-size:11px" onclick="famConsentWithdraw('${p.id}','${t.k}')">${conf?"تأكيد السحب":"سحب"}</button>`:(isOtp?"":`<button class="btn btn-primary" style="padding:5px 10px;font-size:11px" onclick="famConsentStart('${p.id}','${t.k}')">أوافق</button>`)}</div></div>`}).join("")}</div>`;
    }
    function famConsentStart(pid,k){state.famOtp={pid,k,code:String(1000+Math.floor(Math.random()*9000))};render()}
    function famConsentVerify(e,pid){
      e.preventDefault();const code=(new FormData(e.target).get("code")||"").trim();const o=state.famOtp;
      if(!o||o.pid!==pid||code!==o.code){notify("الرمز مو صحيح، جربي ثاني");return}
      const p=state.patients.find(x=>x.id===pid);const t=CONSENT_TYPES.find(x=>x.k===o.k);const now=new Date();
      consentsOf(p).push({id:"cs-"+Date.now(),type:t.k,version:t.v,text:t.text,grantedAt:now.toISOString(),by:p.guardian||auditActor().name,method:"رمز تحقق من بوابة الأسرة",recordedBy:"بوابة الأسرة",expires:t.days?localDateOf(new Date(now.getTime()+t.days*864e5)):null});
      audit("موافقة من بوابة الأسرة: "+t.l,p.name);state.famOtp=null;persist();notify("انسجلت موافقتك، شكرًا");render();
    }
    function famConsentWithdraw(pid,k){
      const key=pid+"|"+k;
      if(state.famConfirm!==key){state.famConfirm=key;render();setTimeout(()=>{if(state.famConfirm===key){state.famConfirm=null;render()}},4000);return}
      state.famConfirm=null;const p=state.patients.find(x=>x.id===pid);const s=consentStatus(p,k);if(s.st!=="active")return;
      s.c.withdrawnAt=new Date().toISOString();s.c.withdrawnBy=p.guardian||"ولي الأمر";
      audit("سحب موافقة من بوابة الأسرة: "+CONSENT_TYPES.find(x=>x.k===k).l,p.name);persist();notify("انسجل سحب الموافقة");render();
    }

    // ---- كيوسك الحضور ----
    function staffAttendanceMark(s,method){
      ensureOpsState();const now=new Date();const nowIn=!s.present;
      s.present=nowIn;s.status=nowIn?"حاضر":"غير حاضر";
      if(nowIn){s.checkInAt=now.toISOString();s.checkOutAt=null}else{s.checkOutAt=now.toISOString()}
      state.attendanceLog.unshift({id:"at-"+Date.now(),staffId:s.id,name:s.name,type:nowIn?"in":"out",at:now.toISOString(),method});
      if(state.attendanceLog.length>2000)state.attendanceLog.length=2000;
      audit(nowIn?"تسجيل حضور":"تسجيل انصراف",s.name+" · "+method);
      return nowIn;
    }
    function kioskSubmit(e){
      e.preventDefault();const inp=e.target.querySelector("input");const code=(inp.value||"").trim().toLowerCase();
      const s=state.staff.find(x=>(x.code||"").toString().trim().toLowerCase()===code);
      if(!s){state.kioskMsg={ok:false,text:"الكود هذا مو مسجل. جربي ثاني أو كلمي الاستقبال."};render();return}
      const nowIn=staffAttendanceMark(s,"كيوسك (كود/QR)");
      state.kioskMsg={ok:true,text:(nowIn?"أهلًا ":"مع السلامة ")+s.name+" — انسجل "+(nowIn?"حضورك":"انصرافك")+" الساعة "+localTimeOf(new Date())};
      persist();render();
      setTimeout(()=>{const i=document.getElementById("kiosk-input");if(i)i.focus()},30);
    }
    function kioskFull(on){state.kioskFull=!!on;state.kioskMsg=null;render();setTimeout(()=>{const i=document.getElementById("kiosk-input");if(i)i.focus()},30)}
    function kioskBlock(big){
      const m=state.kioskMsg;
      return `<form class="kiosk ${big?"kiosk-big":""}" onsubmit="kioskSubmit(event)" autocomplete="off"><div><b>${big?"أهلًا بيكي في "+esc(state.center.name):"كيوسك الحضور"}</b><div class="muted">اكتبي كودك الشخصي أو امسحي كارت الـ QR، واضغطي تسجيل. نفس الكود يسجل الحضور الصبح والانصراف آخر اليوم.</div></div>
        <div class="kiosk-row"><input class="input" id="kiosk-input" placeholder="الكود الشخصي" required><button class="btn btn-primary" type="submit">تسجيل</button></div>
        ${m?`<div class="kiosk-msg ${m.ok?"ok":"bad"}">${esc(m.text)}</div>`:""}</form>`;
    }
    const _attendanceViewOrig=attendanceView;
    attendanceView=function(){
      ensureOpsState();
      if(state.kioskFull) return `<div class="kiosk-wrap">${kioskBlock(true)}<button class="btn btn-outline" style="margin-top:14px" onclick="kioskFull(false)">خروج من وضع الكيوسك</button></div>`;
      const present=state.staff.filter(s=>s.present).length;const today=localDateOf(new Date());
      const log=state.attendanceLog.filter(x=>localDateOf(x.at)===today).slice(0,8);
      return head("الحضور / 07","الحضور والغياب","الموظف يسجل حضوره بنفسه من الكيوسك، أو الاستقبال يسجله من الجدول.",`<button class="btn btn-primary" onclick="kioskFull(true)">فتح وضع الكيوسك</button>`)
        +`<section class="card" style="margin-bottom:16px">${kioskBlock(false)}${log.length?`<div class="list" style="margin-top:12px">${log.map(x=>`<div class="list-row"><div class="list-main"><strong>${esc(x.name)}</strong><small>${esc(x.method)}</small></div><div class="list-end">${x.type==="in"?pill("حاضر"):pill("انصراف")} <b style="margin-inline-start:6px">${localTimeOf(x.at)}</b></div></div>`).join("")}</div>`:""}</section>`
        +`<section class="card"><div class="card-head"><h2>حالة الحضور اليوم</h2><span class="muted">${present} من ${state.staff.length} حاضر</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>الدور المهني</th><th>القسم</th><th>الكود</th><th>الحضور</th><th>الانصراف</th><th>الحالة</th><th></th></tr></thead><tbody>${state.staff.map((s,i)=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td>${esc(departmentLabel(s.department))}</td><td><code style="background:#f2ece0;padding:2px 7px;border-radius:6px">${esc(s.code||"—")}</code></td><td>${s.checkInAt&&localDateOf(s.checkInAt)===today?localTimeOf(s.checkInAt):"—"}</td><td>${s.checkOutAt&&localDateOf(s.checkOutAt)===today?localTimeOf(s.checkOutAt):"—"}</td><td>${s.present?pill("حاضر"):pill("غير حاضر")}</td><td><button class="btn ${s.present?"btn-outline":"btn-primary"}" onclick="toggleStaffPresence(${i})">${s.present?"تسجيل انصراف":"تسجيل حضور"}</button></td></tr>`).join("")}</tbody></table></div>
        <p class="muted" style="margin-top:10px;font-size:11.5px">أجهزة قراءة الـ QR تكتب الكود في الخانة لوحدها وتضغط Enter. عشان كذا الأفضل تكون أكواد الموظفين بحروف إنجليزي وأرقام.</p></section>`;
    };
    toggleStaffPresence=function(i){const s=state.staff[i];if(!s)return;const nowIn=staffAttendanceMark(s,"من جدول الحضور");persist();notify(nowIn?`تم تسجيل حضور ${s.name}`:`تم تسجيل انصراف ${s.name}`);render()};

    // ---- ربط سجل التدقيق بالإجراءات الموجودة ----
    // ---- ربط سجل التدقيق بالإجراءات الموجودة (بيلف الدالة الأصلية من غير ما يغيّرها) ----
    const _auditCurName=()=>{const p=state.patients.find(x=>x.id===state.patientId);return p?p.name:""};
    const _auditByArg=a=>{const id=a.find(x=>typeof x==="string"&&state.patients.some(p=>p.id===x));const p=state.patients.find(x=>x.id===id);return p?p.name:_auditCurName()};
    function _auditWrap(orig,label,target){
      return function(...a){const r=orig.apply(this,a);try{audit(label,target?target(a):_auditByArg(a));persist()}catch(_e){}return r};
    }
    openPatient=_auditWrap(openPatient,"فتح ملف");
    savePatientInfo=_auditWrap(savePatientInfo,"تعديل بيانات الملف");
    saveNotes=_auditWrap(saveNotes,"تعديل الملاحظات السريرية");
    archivePatient=_auditWrap(archivePatient,"أرشفة ملف");
    restorePatient=_auditWrap(restorePatient,"استرجاع ملف من الأرشيف");
    deletePatientPermanently=_auditWrap(deletePatientPermanently,"حذف ملف نهائيًا");
    reviewPlan=_auditWrap(reviewPlan,"مراجعة خطة علاجية",a=>{const pl=state.plans.find(x=>x.id===a[0]);return pl?pl.patient:_auditCurName()});
    generateProgressReport=_auditWrap(generateProgressReport,"توليد تقرير تقدم");
    toggleReportShare=_auditWrap(toggleReportShare,"تغيير مشاركة تقرير مع الأسرة",a=>{const r=state.progressReports.find(x=>x.id===a[0]);const p=r&&state.patients.find(x=>x.id===r.patientId);return p?p.name:""});
    saveStdAssessment=_auditWrap(saveStdAssessment,"حفظ تقييم مقنن");
    deleteStdAssessment=_auditWrap(deleteStdAssessment,"حذف تقييم مقنن");
    submitSessionLog=_auditWrap(submitSessionLog,"تسجيل أداء جلسة");
    saveAssignProgram=_auditWrap(saveAssignProgram,"إسناد برنامج علاجي");
    removeAssignedProgram=_auditWrap(removeAssignedProgram,"إزالة برنامج علاجي");
    staffCodeLogin=_auditWrap(staffCodeLogin,"دخول موظف بالكود",()=>"");
    const _staffLogoutOrig=staffLogout;
    staffLogout=function(...a){try{audit("خروج موظف","")}catch(_e){}return _staffLogoutOrig.apply(this,a)};

    // =================== الاستقبال الذكي (محرك أوان) ===================
    // ولي الأمر يملا دراسة الحالة من الآيباد/الجوال ← كل حرف يتحفظ لحظيًا ويظهر للمشرف ←
    // المحرك يحلل كل نقطة ويطلع: القسم، البرنامج، الأهداف المبدئية، والإحالات الطبية ←
    // تلقائيًا: فتح ملف «قيد التقييم» + حجز تقييم أولي + إبلاغ المشرف ←
    // الخطة والبرامج تفضل «مسودة» لين ما المشرف يعتمدها بضغطة (قرار إكلينيكي لأخصائي مرخّص).
    const INTAKE_QS=[
      {id:"q_words",t:"يقول كلمات مفهومة؟",bad:"لا",dept:"speech",area:"اللغة التعبيرية",prog:"برنامج تنمية اللغة الاستقبالية والتعبيرية",goal:"يستخدم 20 كلمة وظيفية للطلب والتسمية"},
      {id:"q_sent",t:"يتكلم بجمل من كلمتين أو أكثر؟",bad:"لا",dept:"speech",area:"اللغة التعبيرية",prog:"برنامج تنمية اللغة الاستقبالية والتعبيرية",goal:"يكوّن جملة من كلمتين في 4 من 5 فرص"},
      {id:"q_understand",t:"يفهم أوامر بسيطة زي «هات» و«تعالى»؟",bad:"لا",dept:"speech",area:"اللغة الاستقبالية",prog:"برنامج تنمية اللغة الاستقبالية والتعبيرية",goal:"ينفذ أمرًا من خطوة واحدة في 4 من 5 فرص"},
      {id:"q_clear",t:"كلامه واضح للناس الغريبة؟",bad:"لا",dept:"speech",area:"النطق",prog:"برنامج تعديل اضطرابات النطق والأصوات",goal:"ينطق الأصوات المستهدفة في بداية الكلمة بدقة 80%"},
      {id:"q_stutter",t:"يحصل عنده تقطيع أو تكرار في أول الكلام؟",bad:"نعم",dept:"speech",area:"الطلاقة",prog:"برنامج الطلاقة اللفظية (التأتأة)",goal:"يستخدم أسلوب البدء السهل في جمل قصيرة بنجاح 80%"},
      {id:"q_name",t:"بيبص لك لما تناديه باسمه؟",bad:"لا",dept:"aba",area:"الانتباه المشترك",prog:"برنامج التدريب في البيئة الطبيعية (NET)",goal:"يستجيب لاسمه بالنظر في 4 من 5 فرص"},
      {id:"q_play",t:"يلعب مع أطفال ثانيين؟",bad:"لا",dept:"skills",area:"المهارات الاجتماعية",prog:"برنامج المهارات الاجتماعية",goal:"يشارك في لعب تبادلي مع طفل آخر لمدة 3 دقائق"},
      {id:"q_tantrum",t:"عنده نوبات غضب أو صريخ متكررة؟",bad:"نعم",dept:"aba",area:"السلوك",prog:"برنامج الدعم السلوكي الإيجابي (PBS)",goal:"يطلب الاستراحة بطريقة مقبولة بدل نوبة الغضب"},
      {id:"q_attention",t:"يقدر يركز في نشاط واحد 5 دقايق؟",bad:"لا",dept:"aba",area:"الانتباه",prog:"برنامج التدريب بالتجارب المنفصلة (DTT)",goal:"يجلس وينتبه لمهمة منظمة لمدة 5 دقائق"},
      {id:"q_sensory",t:"يتضايق جدًا من الأصوات العالية أو ملمس الأشياء؟",bad:"نعم",dept:"ot",area:"المعالجة الحسية",prog:"برنامج التكامل الحسي (Sensory Integration)",goal:"يتحمل مثيرًا حسيًا مستهدفًا لمدة 5 دقائق بدون انسحاب"},
      {id:"q_fine",t:"يمسك القلم أو يقفل الزراير حسب سنه؟",bad:"لا",dept:"ot",area:"المهارات الحركية الدقيقة",prog:"برنامج المهارات الحركية الدقيقة",goal:"يمسك القلم بمسكة ثلاثية ويرسم خطوطًا وأشكالًا بسيطة"},
      {id:"q_adl",t:"ياكل ويلبس ويغسل إيده لوحده حسب سنه؟",bad:"لا",dept:"skills",area:"المهارات الحياتية",prog:"برنامج المهارات الحياتية اليومية (ADL)",goal:"يغسل يديه باستقلالية في 4 من 5 مرات"},
      {id:"q_school",t:"عنده صعوبة في القراءة أو الكتابة في المدرسة؟",bad:"نعم",dept:"inclusion",area:"المهارات الأكاديمية",prog:"برنامج الدمج الأكاديمي والتكيّف الصفي",goal:"يقرأ كلمات من 3 حروف بدقة 80%"},
      {id:"q_regress",t:"فقد كلام أو مهارات كان يعملها قبل كذا؟",bad:"نعم",dept:"speech",area:"تراجع في المهارات",red:"تراجع في مهارات كانت موجودة: إحالة لطبيب أعصاب أطفال قبل بدء البرنامج",urgent:true}
    ];
    const INTAKE_KEYWORDS=[
      {re:/تأتأ|تهته|تلعثم/,dept:"speech",area:"الطلاقة",prog:"برنامج الطلاقة اللفظية (التأتأة)"},
      {re:/نطق|مخارج|لدغ/,dept:"speech",area:"النطق",prog:"برنامج تعديل اضطرابات النطق والأصوات"},
      {re:/تأخر.{0,6}(كلام|لغ)|ما بيتكلم|ما يتكلم|مش بيتكلم|ما يتكلم|لا يتكلم/,dept:"speech",area:"اللغة التعبيرية",prog:"برنامج تنمية اللغة الاستقبالية والتعبيرية"},
      {re:/توحد|طيف/,dept:"aba",area:"التواصل الاجتماعي",prog:"نموذج دنفر للتدخل المبكر (ESDM)"},
      {re:/فرط|حركة زايدة|تشتت/,dept:"aba",area:"الانتباه",prog:"برنامج التدريب بالتجارب المنفصلة (DTT)"},
      {re:/عصب|سلوك|عدوان|يضرب/,dept:"aba",area:"السلوك",prog:"برنامج الدعم السلوكي الإيجابي (PBS)"},
      {re:/كتابة|قراءة|صعوبات تعلم|مدرسة/,dept:"inclusion",area:"المهارات الأكاديمية",prog:"برنامج الدمج الأكاديمي والتكيّف الصفي"},
      {re:/حسي|أصوات عالية|ملمس/,dept:"ot",area:"المعالجة الحسية",prog:"برنامج التكامل الحسي (Sensory Integration)"}
    ];
    const INTAKE_INSTRUMENTS={speech:"تقييم لغوي شامل (PLS-4 / Speech-Map)",aba:"VB-MAPP أو ABLLS-R",ot:"تقييم حسي حركي",skills:"قائمة المهارات الحياتية (AFLS)",inclusion:"تقييم المهارات الأكاديمية",psych:"تقييم نفسي"};
    function ensureIntakeState(){if(!Array.isArray(state.smartIntakes))state.smartIntakes=[]}
    function deptName(id){const d=state.departments.find(x=>x.id===id);return d?d.name:id}
    function analyzeIntake(f){
      const flags=[],red=[];const score={};let answered=0;
      const add=(dept,w)=>{score[dept]=(score[dept]||0)+w};
      INTAKE_QS.forEach(q=>{const a=f[q.id];if(!a)return;answered++;
        const hit=a===q.bad?1:(a==="أحيانًا"?0.5:0);if(!hit)return;
        if(q.red)red.push({text:q.red,urgent:!!q.urgent,from:q.t+" ← "+a});
        add(q.dept,hit*(q.red?2:1));
        flags.push({from:q.t,answer:a,dept:q.dept,area:q.area,prog:q.prog||null,goal:q.goal||null,weight:hit})});
      const n=v=>{const x=parseFloat(String(v||"").replace(/[^\d.]/g,""));return isNaN(x)?null:x};
      const fw=n(f.milestoneFirstWord),wk=n(f.milestoneWalking),sn=n(f.milestoneSentence);
      if(fw!==null&&fw>18){add("speech",1);flags.push({from:"عمر أول كلمة",answer:fw+" شهر",dept:"speech",area:"اللغة التعبيرية",prog:"برنامج تنمية اللغة الاستقبالية والتعبيرية",goal:null,weight:1})}
      if(sn!==null&&sn>30){add("speech",0.5);flags.push({from:"عمر أول جملة من كلمتين",answer:sn+" شهر",dept:"speech",area:"اللغة التعبيرية",prog:null,goal:null,weight:0.5})}
      if(wk!==null&&wk>18){add("ot",1);flags.push({from:"عمر المشي",answer:wk+" شهر",dept:"ot",area:"المهارات الحركية الكبرى",prog:"برنامج العلاج الطبيعي — التوازن والمشي",goal:"يمشي على خط مستقيم لمسافة 3 أمتار",weight:1})}
      if(f.hearingChecked==="لم يتم بعد")red.push({text:"فحص سمع قبل التقييم اللغوي",urgent:false,from:"فحص السمع ← لم يتم بعد"});
      if(f.hearingChecked==="تم — توجد ملاحظات")red.push({text:"مراجعة تقرير السمع مع أخصائي سمعيات",urgent:false,from:"فحص السمع ← توجد ملاحظات"});
      if(f.visionChecked==="تم — توجد ملاحظات")red.push({text:"مراجعة تقرير البصر",urgent:false,from:"فحص البصر ← توجد ملاحظات"});
      if(/تشنج|صرع/.test(f.chronic||""))red.push({text:"تاريخ تشنجات: تنسيق مع الطبيب المعالج",urgent:true,from:"أمراض مزمنة ← "+f.chronic});
      const txt=(f.reason||"")+" "+(f.priorEvalDetails||"");
      INTAKE_KEYWORDS.forEach(k=>{if(k.re.test(txt)&&!flags.some(x=>x.area===k.area&&x.from.startsWith("وصف"))){add(k.dept,0.5);flags.push({from:"وصف الحالة",answer:"«"+(txt.match(k.re)||[""])[0]+"»",dept:k.dept,area:k.area,prog:k.prog,goal:null,weight:0.5})}});
      const depts=Object.entries(score).sort((a,b)=>b[1]-a[1]).map(([id,sc])=>({id,sc}));
      const progs=[];flags.forEach(x=>{if(x.prog&&!progs.some(p=>p.prog===x.prog))progs.push({dept:x.dept,prog:x.prog})});
      const goals=[];flags.forEach(x=>{if(x.goal&&!goals.some(g=>g.text===x.goal))goals.push({dept:x.dept,text:x.goal})});
      const total=INTAKE_QS.length;
      const req=["child","age","guardian","phone","reason"];const filledReq=req.filter(k=>(f[k]||"").trim()).length;
      const progress=Math.round(((answered/total)*0.6+(filledReq/req.length)*0.4)*100);
      const missing=[];if(f.hearingChecked===undefined||f.hearingChecked==="")missing.push("فحص السمع");if(!(f.reason||"").trim())missing.push("وصف الحالة");if(answered<total)missing.push(`${total-answered} سؤال من مؤشرات النمو`);
      return {flags,red,depts,progs:progs.slice(0,5),goals:goals.slice(0,6),progress,missing,urgent:red.some(r=>r.urgent),primary:depts[0]?depts[0].id:null};
    }
    // ---- جهة ولي الأمر ----
    let _intakeTimer=null;
    function intakeFormHtml(){
      const opt=(q)=>["نعم","أحيانًا","لا"].map(v=>`<label class="ai-opt"><input type="radio" name="${q.id}" value="${v}" required><span>${v}</span></label>`).join("");
      return `<div class="form-section"><div class="form-section-title"><span class="form-section-num">8</span>مؤشرات النمو الحالية</div><p class="muted" style="margin:0 0 10px">اختاري الإجابة الأقرب لطفلك الحين. ما فيه إجابة صح أو غلط.</p>
        <div class="ai-qs">${INTAKE_QS.map(q=>`<div class="ai-q"><span>${esc(q.t)}</span><div class="ai-opts">${opt(q)}</div></div>`).join("")}</div></div>`;
    }
    function intakeTyping(form){
      clearTimeout(_intakeTimer);
      _intakeTimer=setTimeout(()=>{
        ensureIntakeState();
        let id=form.getAttribute("data-draft");
        if(!id){id="si-"+Date.now();form.setAttribute("data-draft",id)}
        const f=Object.fromEntries(new FormData(form).entries());
        let rec=state.smartIntakes.find(x=>x.id===id);
        if(!rec){rec={id,startedAt:new Date().toISOString(),status:"live"};state.smartIntakes.unshift(rec)}
        rec.fields=f;rec.updatedAt=new Date().toISOString();rec.analysis=analyzeIntake(f);
        persist();
        const bar=document.getElementById("ai-progress");if(bar)bar.style.width=rec.analysis.progress+"%";
        const lab=document.getElementById("ai-progress-lab");if(lab)lab.textContent=rec.analysis.progress+"%";
      },350);
    }
    function intakeNextSlot(staffName){
      const d=new Date();d.setDate(d.getDate()+1);
      for(let k=0;k<21;k++){
        const day=new Date(d.getTime()+k*864e5);if(day.getDay()===5||day.getDay()===6)continue;
        const ds=localDateOf(day);
        for(const hr of ["09:00","10:00","11:00","12:00","13:00","14:00"]){
          const busy=state.appointments.some(a=>a.date===ds&&a.status!=="ملغي"&&(a.clinician===staffName)&&a.time.slice(0,2)===hr.slice(0,2));
          if(!busy)return {date:ds,time:hr};
        }
      }
      return {date:localDateOf(new Date(Date.now()+864e5)),time:"09:00"};
    }
    function intakeSubmit(e){
      e.preventDefault();ensureIntakeState();clearTimeout(_intakeTimer);
      const form=e.target;let id=form.getAttribute("data-draft")||("si-"+Date.now());
      const f=Object.fromEntries(new FormData(form).entries());const an=analyzeIntake(f);
      let rec=state.smartIntakes.find(x=>x.id===id);if(!rec){rec={id,startedAt:new Date().toISOString()};state.smartIntakes.unshift(rec)}
      Object.assign(rec,{fields:f,analysis:an,status:"draft",submittedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
      // 1) فتح ملف «قيد التقييم»
      const dept=an.primary||"speech";
      const pool=state.staff.filter(s=>s.clinical&&s.department===dept);
      const clin=(pool.length?pool:state.staff.filter(s=>s.clinical)).slice().sort((a,b)=>state.appointments.filter(x=>x.clinician===a.name).length-state.appointments.filter(x=>x.clinician===b.name).length)[0];
      const pid="p-"+Date.now();const num=1000+state.patients.length+1;
      const code=((f.child||"CH").trim().split(" ")[0].replace(/[^A-Za-z]/g,"").toUpperCase()||"AWN")+"-"+num;
      const slot=intakeNextSlot(clin?clin.name:"");
      const pt={id:pid,name:(f.child||"").trim(),file:"AWN-SRC-"+num,age:f.age||"—",need:an.flags.slice(0,3).map(x=>x.area).filter((v,i,a)=>a.indexOf(v)===i).join("، ")||"قيد التقييم",program:an.depts.slice(0,2).map(d=>deptName(d.id)).join(" · ")||"قيد التقييم",school:"",status:"قيد التقييم",notes:"ملف انفتح تلقائيًا من دراسة الحالة الإلكترونية. الوصف: "+(f.reason||""),goal:"يُحدَّد بعد التقييم الأولي",next:slot.date+"T"+slot.time,code,schoolCode:"",guardian:f.guardian||"",phone:f.phone||"",archived:false,assignedPrograms:[],consents:[]};
      pt.health=typeof defaultHealth==="function"?defaultHealth(pt):undefined;
      if(pt.health&&f.hearingChecked)pt.health.hearingScreening.status=f.hearingChecked;
      if(pt.health&&f.birthType)pt.health.birthType=f.birthType;
      pt.caseStudy={fields:f,analysis:an,at:new Date().toISOString(),by:f.guardian||"ولي الأمر",source:"دراسة الحالة الإلكترونية"};
      state.patients.unshift(pt);csSyncSuggestions(pt);
      // 2) حجز تقييم أولي
      const apt={id:"apt-"+Date.now(),date:slot.date,time:slot.time,patient:pt.name,service:"تقييم أولي — "+(INTAKE_INSTRUMENTS[dept]||"تقييم شامل"),clinician:clin?clin.name:"",room:"غرفة التقييم",status:"مجدول",newForStaff:true,autoBooked:true};
      state.appointments.push(apt);
      // 3) إبلاغ المشرف
      const sups=state.staff.filter(s=>s.roleCategory==="supervisor"&&(s.department===dept||!s.department));
      (sups.length?sups:state.staff.filter(s=>s.roleCategory==="management")).slice(0,2).forEach(s=>state.messages.unshift({id:"msg-"+Date.now()+"-"+s.id,fromId:null,fromName:"محرك أوان",toId:s.id,toName:s.name,text:`${an.urgent?"🔴 عاجل — ":""}دراسة حالة جديدة: ${pt.name} · مسودة خطة جاهزة للاعتماد (${an.progs.length} برامج، ${an.goals.length} أهداف)`,date:todayISO(),read:false}));
      rec.patientId=pid;rec.aptId=apt.id;rec.clinician=clin?clin.name:"";rec.dept=dept;
      rec.draftProgs=an.progs.map(p=>p.prog);rec.draftGoals=an.goals.map(g=>g.text);
      state.registrations.unshift({child:pt.name,guardian:f.guardian,phone:f.phone,reason:f.reason,status:"مسودة خطة بانتظار الاعتماد",date:localDateOf(new Date())});
      audit("دراسة حالة إلكترونية ← فتح ملف وحجز تقييم تلقائي",pt.name);
      persist();
      form.reset();form.removeAttribute("data-draft");
      const res=document.getElementById("portal-result");
      if(res)res.innerHTML=`<div class="notice-blue" style="line-height:2">وصلتنا دراسة حالة <b>${esc(pt.name)}</b>، وما فيه أي ورق محتاجينه منكم.<br>
        ✓ انفتح ملف لطفلك<br>✓ انحجز له تقييم أولي يوم <b>${date(slot.date)}</b> الساعة <b>${time(slot.time)}</b>${clin?` مع <b>${esc(clin.name)}</b>`:""}<br>
        ✓ كود متابعة طفلك: <b style="direction:ltr;unicode-bidi:isolate">${esc(code)}</b> (تقدري تدخلي بيه من «متابعة طفلي»)<br>
        ${an.red.length?`<span style="color:var(--danger)">قبل التقييم محتاجين: ${an.red.map(r=>esc(r.text)).join("، ")}</span><br>`:""}
        الخطة المبدئية يراجعها المشرف ويعتمدها، ويوصلك إشعار أول ما تتعتمد.</div>`;
      notify("انرسلت دراسة الحالة");
    }
    // ---- جهة المشرف ----
    function aiAgo(iso){const s=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/1000));return s<60?`من ${s} ثانية`:s<3600?`من ${Math.round(s/60)} دقيقة`:`${date(localDateOf(iso))} ${localTimeOf(iso)}`}
    function aiDeptBars(an){const max=Math.max(1,...an.depts.map(d=>d.sc));return an.depts.length?`<div class="ai-bars">${an.depts.map(d=>`<div class="ai-bar"><span>${esc(deptName(d.id))}</span><div><i style="width:${d.sc/max*100}%"></i></div><b>${d.sc}</b></div>`).join("")}</div>`:`<div class="muted">للحين ما فيه مؤشرات كفاية.</div>`}
    function aiFlagTable(an){return an.flags.length?`<div class="table-wrap"><table class="data-table ai-table"><thead><tr><th>النقطة في دراسة الحالة</th><th>الإجابة</th><th>القسم</th><th>البرنامج المقترح</th><th>الهدف المبدئي</th></tr></thead><tbody>${an.flags.map(x=>`<tr><td>${esc(x.from)}</td><td><b>${esc(x.answer)}</b></td><td>${esc(deptName(x.dept))}</td><td>${esc(x.prog||"—")}</td><td>${esc(x.goal||"يحدده التقييم")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">للحين ما فيه نقاط تحتاج تدخل.</div>`}
    function intakeAIView(){
      ensureIntakeState();
      const live=state.smartIntakes.filter(x=>x.status==="live"&&x.fields&&Object.values(x.fields).some(v=>String(v).trim()));
      const drafts=state.smartIntakes.filter(x=>x.status==="draft");
      const done=state.smartIntakes.filter(x=>x.status==="approved"||x.status==="info").slice(0,6);
      let h=head("الاستقبال الذكي","من أول تواصل لين أول جلسة — بدون ورق","ولي الأمر يملا دراسة الحالة من جواله أو آيباد الاستقبال، والمحرك يحللها وهي تتكتب. الملف والتقييم الأولي يتعملوا تلقائي، والخطة تستنى اعتمادك.",`<button class="btn btn-outline" onclick="goPublic('parent');setParentTab('case')">فتح دراسة الحالة (للآيباد)</button>`);
      h+=`<section class="ai-flow">${["ولي الأمر يملا دراسة الحالة","المحرك يحلل كل نقطة لحظيًا","فتح ملف + حجز تقييم تلقائي","المشرف يعتمد الخطة بضغطة","الطفل يظهر في جدول الأخصائي"].map((t,i)=>`<div class="ai-step ${i===3?"human":""}"><b>${i+1}</b><span>${t}</span></div>`).join("")}</section>`;
      h+=`<section class="card" style="margin-top:16px"><div class="card-head"><h2><span class="ai-live-dot"></span> يتكتب الآن</h2><span class="muted">${live.length?live.length+" دراسة حالة مفتوحة":"ما فيه حد يكتب الحين"}</span></div>
        ${live.length?`<div class="ai-live-grid">${live.map(r=>{const an=r.analysis||analyzeIntake(r.fields||{});return `<div class="ai-live"><div class="spread-row"><b>${esc((r.fields.child||"طفل بدون اسم للحين").trim())}</b><span class="muted">${aiAgo(r.updatedAt)}</span></div>
          <div class="ai-prog"><i style="width:${an.progress}%"></i></div><small class="muted">اكتمال ${an.progress}% ${an.missing.length?"· ناقص: "+esc(an.missing.join("، ")):""}</small>
          ${an.red.length?`<div class="ai-red">${an.red.map(x=>esc(x.text)).join("<br>")}</div>`:""}
          ${aiDeptBars(an)}
          ${an.flags.length?`<div class="ai-chips">${an.flags.slice(-6).map(x=>`<span>${esc(x.area)}</span>`).join("")}</div>`:""}</div>`}).join("")}</div>`:`<div class="empty">أول ما ولي أمر يبدأ يكتب في دراسة الحالة بتظهر هنا لحظة بلحظة.</div>`}</section>`;
      h+=`<section class="card" style="margin-top:16px"><div class="card-head"><h2>مسودات جاهزة لاعتمادك</h2><span class="muted">${drafts.length}</span></div>${drafts.length?drafts.map(r=>aiDraftCard(r)).join(""):`<div class="empty">ما فيه مسودات بانتظار الاعتماد.</div>`}</section>`;
      if(done.length)h+=`<section class="card" style="margin-top:16px"><div class="card-head"><h2>تعاملت معها مؤخرًا</h2></div><div class="list">${done.map(r=>`<div class="list-row"><div class="list-main"><strong>${esc(r.fields.child||"")}</strong><small>${r.status==="approved"?"اعتُمدت ودخل البرنامج":"انطلبت معلومات إضافية من ولي الأمر"} · ${aiAgo(r.decidedAt||r.updatedAt)}</small></div><div class="list-end">${r.status==="approved"?`<button class="btn btn-outline" onclick="openPatient('${r.patientId}')">فتح الملف</button>`:pill("معلقة")}</div></div>`).join("")}</div></section>`;
      h+=`<p class="muted" style="font-size:11.5px;margin-top:12px">المحرك في النسخة هذي يشتغل بقواعد مكتوبة وواضحة (كل اقتراح مكتوب جنبه النقطة اللي طلع منها). ممكن يتضاف بعدين نموذج ذكاء اصطناعي يقرأ الوصف الحر بشكل أعمق، وقرار الخطة يفضل عند المشرف المرخّص.</p>`;
      return h;
    }
    function aiDraftCard(r){
      const an=r.analysis;const f=r.fields;const apt=state.appointments.find(a=>a.id===r.aptId);
      const allProgs=[...new Set([...(an.progs||[]).map(p=>p.prog),...(r.draftProgs||[])])];
      return `<div class="ai-draft ${an.urgent?"urgent":""}"><div class="spread-row"><div><b style="font-size:17px">${esc(f.child||"")}</b> <span class="muted">· ${esc(f.age||"")} · ولي الأمر ${esc(f.guardian||"")} ${esc(f.phone||"")}</span></div>${an.urgent?`<span class="pill pill-red">عاجل</span>`:""}</div>
        <div class="ai-auto"><span>✓ الملف انفتح (قيد التقييم)</span><span>✓ تقييم أولي ${apt?`${date(apt.date)} ${time(apt.time)} · ${esc(apt.clinician)}`:""}</span><span>✓ المشرف تبلّغ</span><span class="wait">⏳ الخطة بانتظارك</span></div>
        ${an.red.length?`<div class="ai-red"><b>قبل البدء:</b><br>${an.red.map(x=>`${x.urgent?"🔴 ":""}${esc(x.text)} <small class="muted">(${esc(x.from)})</small>`).join("<br>")}</div>`:""}
        ${f.reason?`<div class="notice" style="margin:10px 0"><b>وصف ولي الأمر:</b> ${esc(f.reason)}</div>`:""}
        <div class="ai-cols"><div><h4>الأقسام حسب المؤشرات</h4>${aiDeptBars(an)}</div>
          <div><h4>البرامج المقترحة</h4>${allProgs.length?allProgs.map(p=>`<label class="ai-check"><input type="checkbox" ${r.draftProgs.includes(p)?"checked":""} onchange="aiToggle('${r.id}','prog',this.value,this.checked)" value="${esc(p)}"><span>${esc(p)}</span></label>`).join(""):`<div class="muted">ما فيه</div>`}</div>
          <div><h4>الأهداف المبدئية</h4>${(an.goals||[]).length?an.goals.map(g=>`<label class="ai-check"><input type="checkbox" ${r.draftGoals.includes(g.text)?"checked":""} onchange="aiToggle('${r.id}','goal',this.value,this.checked)" value="${esc(g.text)}"><span>${esc(g.text)}</span></label>`).join(""):`<div class="muted">تتحدد بعد التقييم</div>`}</div></div>
        <details class="ai-why"><summary>ليش المحرك اقترح كذا؟ (${an.flags.length} نقطة)</summary>${aiFlagTable(an)}</details>
        <div class="ai-actions"><button class="btn btn-primary" onclick="aiApprove('${r.id}')">اعتماد وإدخال الطفل البرنامج</button><button class="btn btn-outline" onclick="aiAskInfo('${r.id}')">طلب معلومات من ولي الأمر</button>${r.patientId?`<button class="btn btn-outline" onclick="openPatient('${r.patientId}')">فتح الملف</button>`:""}</div></div>`;
    }
    function aiToggle(id,kind,val,on){const r=state.smartIntakes.find(x=>x.id===id);if(!r)return;const k=kind==="prog"?"draftProgs":"draftGoals";r[k]=on?[...new Set([...(r[k]||[]),val])]:(r[k]||[]).filter(x=>x!==val);persist()}
    function aiApprove(id){
      const r=state.smartIntakes.find(x=>x.id===id);if(!r)return;const p=state.patients.find(x=>x.id===r.patientId);if(!p){notify("الملف مو موجود");return}
      const who=auditActor().name;const d=localDateOf(new Date());
      const progDept=prog=>{for(const [dep,list] of Object.entries(PROGRAM_LIBRARY)){if(list.includes(prog))return dep}return r.dept};
      p.assignedPrograms=p.assignedPrograms||[];
      (r.draftProgs||[]).forEach((prog,i)=>{if(!p.assignedPrograms.some(a=>a.program===prog))p.assignedPrograms.push({id:"ap-"+Date.now()+"-"+i,department:progDept(prog),program:prog,date:d,addedBy:"اعتماد "+who})});
      if((r.draftGoals||[]).length)p.goal=r.draftGoals[0];
      {const who2=auditActor().name;goalsOf(p).forEach(g=>{if((r.draftGoals||[]).includes(g.text)){g.status="معتمد";g.approvedBy=who2;g.approvedAt=new Date().toISOString()}else if(g.status==="مقترح"&&g.source==="دراسة الحالة"){g.status="مرفوض"}})}
      p.status="نشط";
      if(!state.departmentPrograms)state.departmentPrograms={};
      (r.draftProgs||[]).forEach(prog=>{const dep=progDept(prog);state.departmentPrograms[dep]=state.departmentPrograms[dep]||[];if(!state.departmentPrograms[dep].includes(prog))state.departmentPrograms[dep].push(prog)});
      const clin=state.staff.find(s=>s.name===r.clinician);
      state.plans.unshift({id:"pl-"+Date.now(),staffId:clin?clin.id:null,department:r.dept,patient:p.name,title:"خطة أولية — من دراسة الحالة الإلكترونية",status:"معتمدة",date:d,note:(r.draftGoals||[]).join(" · ")});
      state.messages.unshift({id:"msg-"+Date.now(),fromId:null,fromName:state.center.name,fromDept:"reception",toId:null,toName:null,toDept:"family",patientId:p.id,text:`خطة ${p.name} المبدئية اعتُمدت. أول خطوة: التقييم الأولي في موعده، وبعدها البرامج: ${(r.draftProgs||[]).join("، ")||"تتحدد بعد التقييم"}.`,date:todayISO(),kind:"رسالة",status:"مُرسلة",read:false});
      const reg=state.registrations.find(x=>x.child===p.name&&x.status==="مسودة خطة بانتظار الاعتماد");if(reg)reg.status="معتمدة";
      r.status="approved";r.decidedAt=new Date().toISOString();r.decidedBy=who;
      audit("اعتماد خطة من دراسة الحالة ("+(r.draftProgs||[]).length+" برامج)",p.name);
      persist();notify("اعتُمدت الخطة ودخل "+p.name+" البرنامج");render();
    }
    function aiAskInfo(id){
      const r=state.smartIntakes.find(x=>x.id===id);if(!r)return;
      const miss=(r.analysis.missing||[]).join("، ")||"تفاصيل إضافية عن الحالة";
      if(r.patientId)state.messages.unshift({id:"msg-"+Date.now(),fromId:null,fromName:state.center.name,fromDept:"reception",toId:null,toName:null,toDept:"family",patientId:r.patientId,text:`محتاجين منكم نكمل دراسة حالة ${r.fields.child}: ${miss}. تقدروا تردوا من هنا.`,date:todayISO(),kind:"رسالة",status:"مُرسلة",read:false});
      r.status="info";r.decidedAt=new Date().toISOString();audit("طلب معلومات إضافية من ولي الأمر",r.fields.child||"");persist();notify("انرسل الطلب لولي الأمر على البوابة");render();
    }
    function smartIntakeBanner(){
      ensureIntakeState();
      const live=state.smartIntakes.filter(x=>x.status==="live"&&x.fields&&Object.values(x.fields).some(v=>String(v).trim())).length;
      const drafts=state.smartIntakes.filter(x=>x.status==="draft");const urgent=drafts.filter(x=>x.analysis&&x.analysis.urgent).length;
      if(!live&&!drafts.length)return "";
      return `<section class="ai-banner" onclick="setView('intakeAI')" role="button" tabindex="0"><span class="ai-live-dot"></span><div><b>الاستقبال الذكي</b><small>${live?live+" دراسة حالة تتكتب الآن · ":""}${drafts.length} مسودة خطة بانتظار اعتمادك${urgent?` · ${urgent} عاجلة`:""}</small></div><span class="btn btn-primary">افتح</span></section>`;
    }
    // مزامنة لحظية بين التابات/الشاشات على نفس الجهاز (في النسخة الكاملة تصير عبر السيرفر)
    window.addEventListener("storage",ev=>{
      if(ev.key!==KEY||!ev.newValue)return;
      if(state.view==="public")return;
      const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;
      try{const fresh=load();const keep={view:state.view,role:state.role,currentStaffId:state.currentStaffId,staffSection:state.staffSection,patientId:state.patientId,liveSession:state.liveSession,intakeKiosk:state.intakeKiosk,kiDone:state.kiDone,kiExitArm:state.kiExitArm,dgShare:state.dgShare,sipadMode:state.sipadMode,sipad:state.sipad,sipadPick:state.sipadPick,sipadErr:state.sipadErr,sipadExitArm:state.sipadExitArm,ipMirror:state.ipMirror,ipQ:state.ipQ,ipF:state.ipF,ipTab:state.ipTab,ipEdit:state.ipEdit,ipTl:state.ipTl,devMsg:state.devMsg,devDelArm:state.devDelArm,sipadBanner:state.sipadBanner,plPop:state.plPop,planDay:state.planDay,planDept:state.planDept,ipDept:state.ipDept,deptTab:state.deptTab,deptMode:state.deptMode,deptMsgTo:state.deptMsgTo,openDept:state.openDept};state=fresh;Object.assign(state,keep);render()}catch(_e){}
    });
    setInterval(()=>{if(state.view==="intakeAI"){const ae=document.activeElement;if(!(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)))render()}},15000);

    // =================== دراسة الحالة جوه ملف الطفل ← أهداف تلقائية ===================
    // دراسة الحالة تتحفظ على الطفل نفسه (p.caseStudy)، وكل ما تتحفظ أو تتعدل المحرك يطلع
    // أهداف وبرامج مقترحة. الأهداف اللي تتعتمد تدخل p.goals، ومنها تتسحب لشاشة جلسة DTT.
    function caseStudyOf(p){
      if(!p)return null;
      if(p.caseStudy)return p.caseStudy;
      ensureIntakeState();
      const r=state.smartIntakes.find(x=>x.patientId===p.id&&x.fields);
      if(r){p.caseStudy={fields:r.fields,analysis:r.analysis||analyzeIntake(r.fields),at:r.submittedAt||r.updatedAt,by:(r.fields.guardian||"ولي الأمر"),source:"دراسة الحالة الإلكترونية"}}
      return p.caseStudy||null;
    }
    function goalsOf(p){if(!Array.isArray(p.goals))p.goals=[];return p.goals}
    function csFieldsHtml(pid,f,prefix){
      f=f||{};const v=k=>esc(f[k]||"");const sel=(k,opts)=>`<select class="select" name="${k}"><option value="">اختر</option>${opts.map(o=>`<option ${f[k]===o?"selected":""}>${o}</option>`).join("")}</select>`;
      return `<form class="cs-form" onsubmit="csCaseSubmit(event,'${pid}','${prefix}')" autocomplete="off">
        <div class="form-grid">
          <div class="field"><label>عمر أول كلمة (بالأشهر)</label><input class="input" name="milestoneFirstWord" inputmode="numeric" value="${v("milestoneFirstWord")}"></div>
          <div class="field"><label>عمر أول جملة من كلمتين (بالأشهر)</label><input class="input" name="milestoneSentence" inputmode="numeric" value="${v("milestoneSentence")}"></div>
          <div class="field"><label>عمر المشي (بالأشهر)</label><input class="input" name="milestoneWalking" inputmode="numeric" value="${v("milestoneWalking")}"></div>
          <div class="field"><label>نوع الولادة</label>${sel("birthType",["طبيعية","قيصرية","لا أعلم"])}</div>
          <div class="field"><label>فحص السمع</label>${sel("hearingChecked",["تم — لا توجد ملاحظات","تم — توجد ملاحظات","لم يتم بعد"])}</div>
          <div class="field"><label>فحص البصر</label>${sel("visionChecked",["تم — لا توجد ملاحظات","تم — توجد ملاحظات","لم يتم بعد"])}</div>
          <div class="field full"><label>أمراض مزمنة أو أدوية (إن وجدت)</label><input class="input" name="chronic" value="${v("chronic")}"></div>
          <div class="field full"><label>وصف الحالة بكلام ولي الأمر</label><textarea class="textarea" name="reason" placeholder="مثال: تأخر في الكلام وعصبية لما حد يقاطعه">${v("reason")}</textarea></div>
        </div>
        <h4 style="margin:14px 0 8px">مؤشرات النمو الحالية</h4>
        <div class="ai-qs">${INTAKE_QS.map(q=>`<div class="ai-q"><span>${esc(q.t)}</span><div class="ai-opts">${["نعم","أحيانًا","لا"].map(o=>`<label class="ai-opt"><input type="radio" name="${q.id}" value="${o}" ${f[q.id]===o?"checked":""}><span>${o}</span></label>`).join("")}</div></div>`).join("")}</div>
        <div class="ai-actions" style="margin-top:14px"><button class="btn btn-primary" type="submit">حفظ دراسة الحالة وتوليد الأهداف</button>${prefix==="staff"?`<button type="button" class="btn btn-outline" onclick="csCaseCancel()">إلغاء</button>`:""}</div></form>`;
    }
    function csCaseSubmit(e,pid,source){
      e.preventDefault();const p=state.patients.find(x=>x.id===pid);if(!p)return;
      const f=Object.fromEntries(new FormData(e.target).entries());
      const old=caseStudyOf(p);const merged=Object.assign({},old?old.fields:{},f,{child:p.name,age:p.age,guardian:p.guardian,phone:p.phone});
      const an=analyzeIntake(merged);const who=source==="family"?(p.guardian||"ولي الأمر"):auditActor().name;
      p.caseStudy={fields:merged,analysis:an,at:new Date().toISOString(),by:who,source:source==="family"?"بوابة الأسرة":"ملف الطفل (مع ولي الأمر)"};
      p.caseStudyRequested=false;
      if(p.health&&merged.hearingChecked)p.health.hearingScreening.status=merged.hearingChecked;
      csSyncSuggestions(p);
      state.csEditFor=null;
      audit(old?"تعديل دراسة الحالة":"إضافة دراسة الحالة",p.name);
      if(source==="family")state.staff.filter(s=>s.roleCategory==="supervisor").slice(0,2).forEach(s=>state.messages.unshift({id:"msg-"+Date.now()+"-"+s.id,fromId:null,fromName:"محرك أوان",toId:s.id,toName:s.name,text:`ولي أمر ${p.name} كمّل دراسة الحالة · ${an.goals.length} أهداف مقترحة بانتظار الاعتماد`,date:todayISO(),read:false}));
      persist();notify(`انحفظت دراسة الحالة · ${an.goals.length} أهداف مقترحة`);render();
    }
    // يحدّث قائمة المقترحات من التحليل من غير ما يلمس الأهداف المعتمدة أو اللي المشرف رفضها
    function csSyncSuggestions(p){
      const cs=caseStudyOf(p);if(!cs)return;const g=goalsOf(p);
      (cs.analysis.goals||[]).forEach(x=>{if(!g.some(y=>y.text===x.text))g.push({id:"g-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),text:x.text,dept:x.dept,domain:(cs.analysis.flags.find(f=>f.goal===x.text)||{}).area||deptName(x.dept),source:"دراسة الحالة",status:"مقترح"})});
    }
    function csCaseEdit(pid){state.csEditFor=pid;render()}
    function csCaseCancel(){state.csEditFor=null;render()}
    function csRequestFamily(pid){
      const p=state.patients.find(x=>x.id===pid);if(!p)return;p.caseStudyRequested=true;
      state.messages.unshift({id:"msg-"+Date.now(),fromId:null,fromName:state.center.name,fromDept:"reception",toId:null,toName:null,toDept:"family",patientId:p.id,text:`نرجو استكمال دراسة حالة ${p.name} من بوابة الأسرة (متابعة طفلي) بالكود ${p.code}. تاخذ حوالي 5 دقايق ومحتاجينها عشان نجهز أهداف طفلك.`,date:todayISO(),kind:"رسالة",status:"مُرسلة",read:false});
      audit("طلب دراسة الحالة من ولي الأمر",p.name);persist();notify("انرسل الطلب لولي الأمر على البوابة");render();
    }
    function csGoalSet(pid,gid,status){
      const p=state.patients.find(x=>x.id===pid);if(!p)return;const g=goalsOf(p).find(x=>x.id===gid);if(!g)return;
      g.status=status;if(status==="معتمد"){g.approvedBy=auditActor().name;g.approvedAt=new Date().toISOString();if(!p.goal||/يُحدَّد|يحدد/.test(p.goal))p.goal=g.text}
      audit((status==="معتمد"?"اعتماد هدف":status==="مرفوض"?"استبعاد هدف":"إرجاع هدف للمقترحات")+": "+g.text,p.name);persist();render();
    }
    function csApproveAll(pid){
      const p=state.patients.find(x=>x.id===pid);if(!p)return;const who=auditActor().name;let n=0;
      goalsOf(p).forEach(g=>{if(g.status==="مقترح"){g.status="معتمد";g.approvedBy=who;g.approvedAt=new Date().toISOString();n++}});
      const first=goalsOf(p).find(g=>g.status==="معتمد");if(first&&(!p.goal||/يُحدَّد|يحدد/.test(p.goal)))p.goal=first.text;
      const cs=caseStudyOf(p);const d=localDateOf(new Date());p.assignedPrograms=p.assignedPrograms||[];
      if(cs)(cs.analysis.progs||[]).forEach((x,i)=>{if(!p.assignedPrograms.some(a=>a.program===x.prog))p.assignedPrograms.push({id:"ap-"+Date.now()+"-"+i,department:x.dept,program:x.prog,date:d,addedBy:"اعتماد "+who})});
      if(p.status==="قيد التقييم")p.status="نشط";
      audit(`اعتماد ${n} أهداف من دراسة الحالة`,p.name);persist();notify(`اعتُمد ${n} هدف انتضافوا لجلسات الطفل`);render();
    }
    function patientCaseStudyCard(p){
      const cs=caseStudyOf(p);const canEdit=can('editPatients')||state.role==="supervisor"||state.role==="staff";
      const canApprove=state.role==="management"||state.role==="supervisor";
      let h=`<section class="card cs-card" style="margin-top:16px"><div class="card-head"><h2>${ic("clipboardCheck",18)} دراسة الحالة والأهداف</h2>${cs&&canEdit&&state.csEditFor!==p.id?`<button class="btn btn-outline" onclick="csCaseEdit('${p.id}')">تعديل دراسة الحالة</button>`:""}</div>`;
      if(state.csEditFor===p.id){return h+`<p class="muted" style="margin-top:0">املّي مع ولي الأمر على الآيباد. أي إجابة تتغير تغيّر الأهداف المقترحة، والأهداف المعتمدة تفضل زي ما هي.</p>${csFieldsHtml(p.id,cs?cs.fields:{},"staff")}</section>`}
      if(!cs){
        return h+`<div class="cs-empty"><b>ما فيه دراسة حالة على الملف هذا.</b><p class="muted">من غير دراسة الحالة المنصة ما بتقدر تطلع أهداف تلقائي للطفل.</p><div class="ai-actions">${canEdit?`<button class="btn btn-primary" onclick="csCaseEdit('${p.id}')">املّيها الحين مع ولي الأمر</button>`:""}${canEdit?`<button class="btn btn-outline" onclick="csRequestFamily('${p.id}')">${p.caseStudyRequested?"انطلبت من ولي الأمر · أرسل تذكير":"اطلبها من ولي الأمر على البوابة"}</button>`:""}</div></div></section>`;
      }
      const an=cs.analysis;const f=cs.fields;const g=goalsOf(p);
      const sugg=g.filter(x=>x.status==="مقترح"),appr=g.filter(x=>x.status==="معتمد"),rej=g.filter(x=>x.status==="مرفوض");
      const answered=INTAKE_QS.filter(q=>f[q.id]);
      h+=`<div class="cs-meta"><span>${esc(cs.source)}</span><span>${esc(cs.by)}</span><span>${date(localDateOf(cs.at))} ${localTimeOf(cs.at)}</span><span>اكتمال ${an.progress}%</span></div>`;
      if(an.red.length)h+=`<div class="ai-red" style="margin-top:10px"><b>قبل البدء:</b><br>${an.red.map(x=>`${x.urgent?"🔴 ":""}${esc(x.text)}`).join("<br>")}</div>`;
      h+=`<div class="cs-grid"><div><h4>ملخص دراسة الحالة</h4><div class="cs-facts">
          ${f.reason?`<div class="cs-fact full"><small>وصف ولي الأمر</small><b>${esc(f.reason)}</b></div>`:""}
          ${[["أول كلمة","milestoneFirstWord","شهر"],["أول جملة","milestoneSentence","شهر"],["المشي","milestoneWalking","شهر"],["فحص السمع","hearingChecked",""],["فحص البصر","visionChecked",""],["نوع الولادة","birthType",""]].filter(x=>f[x[1]]).map(x=>`<div class="cs-fact"><small>${x[0]}</small><b>${esc(f[x[1]])}${x[2]?" "+x[2]:""}</b></div>`).join("")}</div>
          ${answered.length?`<div class="cs-answers">${answered.map(q=>{const hit=f[q.id]===q.bad?"bad":f[q.id]==="أحيانًا"?"mid":"";return `<div class="cs-ans ${hit}"><span>${esc(q.t)}</span><b>${esc(f[q.id])}</b></div>`}).join("")}</div>`:""}
          <h4 style="margin-top:14px">الأقسام حسب المؤشرات</h4>${aiDeptBars(an)}</div>
        <div><h4>الأهداف المقترحة تلقائيًا <span class="muted" style="font-weight:500">(${sugg.length})</span></h4>
          ${sugg.length?sugg.map(x=>`<div class="cs-goal"><div><b>${esc(x.text)}</b><small>${x.source==="OpenAI"?`<span class="pill pill-blue" style="font-size:10px">OpenAI</span> `:""}${esc(x.domain)} · ${esc(deptName(x.dept))}${x.why?` · ${esc(x.why)}`:""}</small></div>${canApprove?`<div class="cs-goal-act"><button class="btn btn-primary" onclick="csGoalSet('${p.id}','${x.id}','معتمد')">اعتماد</button><button class="btn btn-outline" onclick="csGoalSet('${p.id}','${x.id}','مرفوض')">استبعاد</button></div>`:""}</div>`).join(""):`<div class="muted">ما فيه مقترحات جديدة.</div>`}
          ${canApprove?`<button class="btn btn-outline" style="margin-top:10px;width:100%" onclick="aiCaseGoals('${p.id}')" ${state.aiBusy===p.id?"disabled":""}>${state.aiBusy===p.id?"الذكاء الاصطناعي يحلل...":"اقتراحات إضافية بالذكاء الاصطناعي (OpenAI)"}</button>`:""}${canApprove&&sugg.length>1?`<button class="btn btn-primary" style="margin-top:10px;width:100%" onclick="csApproveAll('${p.id}')">اعتماد كل المقترح (${sugg.length}) + البرامج</button>`:""}
          ${!canApprove&&sugg.length?`<p class="muted" style="font-size:11.5px">الاعتماد يكون من المشرف أو الإدارة.</p>`:""}
          <h4 style="margin-top:16px">أهداف الخطة المعتمدة <span class="muted" style="font-weight:500">(${appr.length})</span></h4>
          ${appr.length?appr.map(x=>`<div class="cs-goal ok"><div><b>${esc(x.text)}</b><small>${esc(x.domain)} · اعتمدها ${esc(x.approvedBy||"")}</small></div>${canApprove?`<div class="cs-goal-act"><button class="btn btn-outline" onclick="csGoalSet('${p.id}','${x.id}','مقترح')">إرجاع</button></div>`:""}</div>`).join(""):`<div class="muted">للحين ما فيه أهداف معتمدة. أول ما تتعتمد تظهر للأخصائي في شاشة الجلسة.</div>`}
          ${rej.length?`<details style="margin-top:10px"><summary class="muted">مستبعدة (${rej.length})</summary>${rej.map(x=>`<div class="cs-goal off"><div><b>${esc(x.text)}</b></div>${canApprove?`<div class="cs-goal-act"><button class="btn btn-outline" onclick="csGoalSet('${p.id}','${x.id}','مقترح')">إرجاع</button></div>`:""}</div>`).join("")}</details>`:""}
        </div></div>
        <details class="ai-why" style="margin-top:12px"><summary>ليش المحرك اقترح الأهداف هذي؟ (${an.flags.length} نقطة)</summary>${aiFlagTable(an)}</details>`;
      return h+`</section>`;
    }
    function familyCaseStudySection(p){
      const cs=caseStudyOf(p);
      if(cs&&!p.caseStudyRequested)return `<div class="notice" style="margin-top:16px"><b>دراسة الحالة</b> ✓ وصلت للمركز ${date(localDateOf(cs.at))}. الأهداف تتجهز بناءً عليها.</div>`;
      return `<div class="notice" style="margin-top:16px;border-color:var(--navy)"><b>${p.caseStudyRequested?"المركز محتاج منكم دراسة الحالة":"دراسة الحالة"}</b><p class="muted" style="margin:4px 0 12px">5 دقايق من جوالك، ومن غيرها ما نقدر نجهز أهداف ${esc(p.name.split(" ")[0])}.</p>${csFieldsHtml(p.id,cs?cs.fields:{},"family")}</div>`;
    }

    // ↩ منقولة من js/16-profile-journey-brain.js (لازم تكون متعرّفة هنا قبل ما تتستخدم وقت التحميل)
    function confirmReschedule(e,id){e.preventDefault();const f=formData(e);const b=state.sessionBookings.find(x=>x.id===id);if(b){b.day=f.day;b.time=f.time;b.status="مؤجّلة";persist()}closeModal();notify("تم تعديل موعد الحجز");render()}
    // ↩ منقولة من js/16-profile-journey-brain.js (لازم تكون متعرّفة هنا قبل ما تتستخدم وقت التحميل)
    function cancelBooking(id){const b=state.sessionBookings.find(x=>x.id===id);if(b){b.status="ملغي";persist();notify("تم إلغاء الحجز، نتمنى نشوفك قريب");render()}}
