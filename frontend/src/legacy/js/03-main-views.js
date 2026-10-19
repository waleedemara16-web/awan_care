"use strict";
// أوان — الجزء 3 من 16: 03-main-views
// كل ملفات js/ هذي تشتغل كأنها ملف واحد بالترتيب — ما تغيّر ترتيبها في index.html
    // =====================================================================
    const AWAN_API_BASE = "https://api.awan.sa"; // placeholder base URL for the future production billing server
    function genStaffCode(name){
      const clean=(name||"").replace(/^(د\.|أ\.)\s*/,"").trim();
      const letter=clean.charAt(0)||"م";
      const used=new Set(state.staff.map(s=>s.code).filter(Boolean));
      let n=1; while(used.has(letter+n)) n++;
      return letter+n;
    }
    function staffCodeLogin(e){
      e.preventDefault();
      const f=formData(e);
      const code=(f.code||"").trim();
      const person=state.staff.find(s=>s.code&&s.code.toLowerCase()===code.toLowerCase());
      if(!person){notify("كود الدخول غير صحيح — تأكدي منه مع الإدارة");return}
      state.currentStaffId=person.id;
      state.role=person.roleCategory||"staff";
      state.staffSection=null;
      if(!roles[state.role].nav.includes(state.view))state.view="dashboard";
      persist();notify("مرحباً "+person.name);closeModal();render();
    }
    function staffLogout(){state.currentStaffId=null;state.staffSection=null;state.view="public";state.portal="home";persist();notify("تم تسجيل الخروج");render()}
    function roleHome(){if(state.role==="management")return managementDashboard();if(state.role==="staff")return staffDashboard();if(state.role==="supervisor")return supervisorDashboard();if(state.role==="reception")return receptionDashboard();return dashboard()}
    function ackNewChildAppt(id){const a=state.appointments.find(x=>x.id===id);if(a){a.newForStaff=false;persist();render()}}
    function ackAllNewChildAppts(){const person=getCurrentPerson()||state.staff.find(s=>s.roleCategory==="staff");if(!person)return;state.appointments.filter(a=>a.clinician===person.name).forEach(a=>a.newForStaff=false);persist();notify("تم الاطلاع على كل التحديثات الجديدة");render()}
    function announceNewChildIfNeeded(){
      if(state.role!=="staff") return;
      const person=getCurrentPerson()||state.staff.find(s=>s.roleCategory==="staff");
      if(!person) return;
      const fresh=state.appointments.filter(a=>a.clinician===person.name && a.newForStaff && !announcedApptIds.has(a.id));
      if(!fresh.length) return;
      fresh.forEach(a=>announcedApptIds.add(a.id));
      try{
        if("speechSynthesis" in window && window.speechSynthesis){
          const msg=fresh.length>1?"يوجد أطفال جدد في جدولك":"طفل جديد في جدولك";
          const u=new SpeechSynthesisUtterance(msg);
          u.lang="ar-SA";u.volume=1;u.rate=0.95;u.pitch=1.05;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      }catch(_e){}
    }
    function setView(view){state.view=view;persist();render()}
    function topbar(){
      const canSeeBookingAlerts=state.role==="management"||state.role==="reception";
      const nb=canSeeBookingAlerts?newBookingsCount():0;
      const bell=nb>0?`<button class="notif-bell" title="حجوزات جديدة من الأسرة" onclick="setView('schedule')">${ic("bell",15)} حجز جديد<span class="notif-count">${nb}</span></button>`:"";
      const person=getCurrentPerson();
      const personDeptName=person&&person.department?departmentLabel(person.department):null;
      const chipLabel=person?`${esc(person.name)} — ${esc(person.role)}${personDeptName?" · "+esc(personDeptName):""}`:esc(roles[state.role].label);
      const logoutBtn=person?`<button onclick="staffLogout()" title="تسجيل الخروج">${ic("lock",13)} خروج</button>`:"";
      const partnerBadge=state.featuredPartner?`<span class="topbar-partner-badge"><span class="topbar-partner-sep">×</span>${state.featuredPartner.logo?`<img src="${state.featuredPartner.logo}" alt="">`:`<span class="topbar-partner-mark">${ic("briefcase",12)}</span>`}<span>${esc(state.featuredPartner.orgName)}</span></span>`:"";
      return `<header class="topbar"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><button class="brand" style="border:0;background:none;color:#fff;text-align:right;padding:0" onclick="goPublic()"><span class="brand-mark">${mark(24,"#a7c2b3","#e4aa54")}</span><span><strong>${esc(t("brandFull"))}</strong><small>${esc(t("brandSub"))}</small></span></button>${partnerBadge}</div><div class="top-actions">${bell}<button type="button" class="role-chip role-switch" onclick="openModal('roleSwitcher')" title="تبديل الدور / دخول بالكود" aria-label="الدور الحالي: ${esc(roles[state.role].label)} — اضغط للتبديل"><span class="live-dot" aria-hidden="true"></span>${ic(roles[state.role].icon,14)} ${chipLabel}<span class="role-caret" aria-hidden="true">${ic("chevronDown",13,2.4)}</span></button>${logoutBtn}<button onclick="toggleTheme()" title="الوضع الليلي / النهاري">${state.theme==="dark"?"☀️":"🌙"}</button><button onclick="toggleLang()">${esc(t("langToggle"))}</button></div></header>`;
    }
    function sidebar(){const allowed=roles[state.role].nav; const labelKey={dashboard:"navHome",patients:"navPatients",schedule:"navSchedule",referrals:"navReferrals",team:"navTeam",departments:"navDepartments",attendance:"navAttendance",reports:"navReports",invoices:"navInvoices",connect:"navConnect",communicationHub:"navCommHub",library:"navLibrary",journey:"navJourney",license:"navLicense",govSupport:"navGovSupport",reviewRequests:"navReviewRequests",audit:"navAudit",intakeAI:"navIntakeAI",liveOps:"navLiveOps",videoLab:"navVideoLab",assessments:"navAssess",ebnak:"navEbnak",scribe:"navScribe",claims:"navClaims",calls:"navCalls",server:"navServer",myIpad:"navMyIpad",staffPage:"navMyIpad",ipads:"navIpads",deptPlan:"navDeptPlan",agents:"navAgents",digital:"navDigital",settings:"navSettings"};const canSeeBookingAlerts=state.role==="management"||state.role==="reception";const nb=canSeeBookingAlerts?newBookingsCount():0;const pdCount=(state.role==="management"||state.role==="supervisor")?pendingDecisionsCount():0;const commCount=pendingCommCount();return `<aside class="sidebar"><div class="side-kicker">${esc(t("workspaceLabel"))} · ${esc(roles[state.role].label)}</div><nav class="side-nav">${navItems.filter(n=>allowed.includes(n[0])).map(n=>`<button class="${state.view===n[0]?"active":""}" onclick="setView('${n[0]}')"><span class="nav-icon">${ic(n[1],16)}</span>${esc(t(labelKey[n[0]]))}${n[0]==="schedule"&&nb>0?'<span class="nav-dot-red"></span>':""}${n[0]==="connect"&&pdCount>0?'<span class="nav-dot-red"></span>':""}${n[0]==="communicationHub"&&commCount>0?'<span class="nav-dot-red"></span>':""}</button>`).join("")}</nav><div class="side-footer"><b>${esc(state.center.name)}</b><br>${esc(state.center.city)}<br><span style="color:#22c55e">● ${esc(t("dataLocal"))}</span><br><button class="btn btn-outline" style="margin-top:10px;width:100%;font-size:10px" onclick="resetData()">${esc(t("resetSample"))}</button></div></aside>`}
    function shell(body){return `${topbar()}<div class="layout">${sidebar()}<main class="content">${body}</main></div>`}
    function head(eyebrow,title,desc,action=""){return `<div class="page-head"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${desc?`<div class="muted">${esc(desc)}</div>`:""}</div>${action}</div>`}
    // زر عودة موحّد وملفت — يُعرض دايمًا في مكان ثابت ومنفصل أعلى محتوى الصفحة، مو مدسوس بين أزرار ثانية
    function backBtn(onclick,label){return `<button type="button" class="back-link-top page-back" onclick="${onclick}"><span class="back-link-arrow">${ic("chevronLeft",14,2.4)}</span>${esc(label)}</button>`}
    function metric(icon,label,value,detail,theme){return `<div class="metric"><div class="metric-top"><span class="metric-icon${theme==="gold"?" gold":""}">${ic(icon,18)}</span>${pill(t("updatedToday"))}</div><b>${esc(value)}</b><small>${esc(label)} · ${esc(detail)}</small></div>`}
    function svgBarChart(data,opts={}){
      const w=opts.width||520,h=opts.height||190,pad=30;
      const max=Math.max(1,...data.map(d=>d.value));
      const gap=(w-pad*2)/Math.max(data.length,1);
      const barW=Math.min(38,gap*0.56);
      const color=opts.color||"var(--teal)";
      const bars=data.map((d,i)=>{
        const bh=Math.round((d.value/max)*(h-pad*2-14));
        const x=pad+i*gap+(gap-barW)/2;
        const y=h-pad-bh;
        return `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(bh,2)}" rx="6" fill="${color}"></rect><text x="${x+barW/2}" y="${h-pad+16}" text-anchor="middle" font-size="10" fill="var(--muted)">${esc(d.label)}</text><text x="${x+barW/2}" y="${y-6}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--navy)">${d.value}</text>`;
      }).join("");
      return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;max-width:${w}px" preserveAspectRatio="xMidYMid meet">${bars}</svg>`;
    }
    function svgDonutChart(data,opts={}){
      const size=opts.size||150,stroke=opts.stroke||20,r=(size-stroke)/2,cx=size/2,cy=size/2;
      const total=data.reduce((s,d)=>s+d.value,0);
      const circumference=2*Math.PI*r;
      if(!total) return `<svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"></circle></svg>`;
      let offset=0;
      const segs=data.filter(d=>d.value>0).map(d=>{
        const frac=d.value/total;
        const dash=frac*circumference;
        const seg=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${circumference-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"></circle>`;
        offset+=dash;
        return seg;
      }).join("");
      return `<svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px">${segs}</svg>`;
    }
    function chartLegend(data){return `<div style="display:flex;flex-direction:column;gap:8px">${data.map(d=>`<div style="display:flex;align-items:center;gap:8px;font-size:11.5px"><span style="width:10px;height:10px;border-radius:3px;background:${d.color};flex-shrink:0"></span><span style="flex:1;color:var(--muted)">${esc(d.label)}</span><b style="color:var(--navy)">${d.value}</b></div>`).join("")}</div>`}
    function dashboard(){
      const active=state.patients.filter(p=>p.status==="نشط").length, today=state.appointments.filter(a=>a.date==="2026-09-02"&&a.status!=="ملغي").length;
      const upcoming=state.appointments.filter(a=>a.status==="مجدول").slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
      const needsReview=state.referrals.filter(r=>r.status==="جديدة"||r.status==="قيد الفرز").length;
      return head(t("dashEyebrow"),t("dashTitle"),t("dashWelcome")(state.center.name,state.center.city),`<button class="btn btn-primary" onclick="openModal('appointment')">${esc(t("bookSession"))}</button>`)
      +`<section class="hero"><div class="hero-inner"><div><div style="color:#93c5fd;font-size:12px">● ${esc(t("heroDate"))}</div><h2>${esc(t("heroLine1"))}<br><span>${esc(t("heroLine2"))}</span></h2><div style="color:rgba(255,255,255,.68);font-size:12px">${esc(t("heroSub"))}</div></div><div class="hero-stats"><div class="hero-stat"><b>${today}</b><small>${esc(t("heroStat1"))}</small></div><div class="hero-stat"><b>${Math.round(state.staff.filter(s=>s.present).length/Math.max(state.staff.length,1)*100)}%</b><small>${esc(t("heroStat2"))}</small></div></div></div></section>`
      +`<section class="metric-grid">${metric("patients",t("metricActive"),active,t("metricActiveDetail")(state.patients.length))}${metric("schedule",t("metricSessions"),state.appointments.filter(a=>a.status==="مجدول").length,t("metricSessionsDetail"))}${metric("check",t("metricGoals"),"7 / 9",t("metricGoalsDetail"))}${metric("referrals",t("metricReferrals"),needsReview,t("metricReferralsDetail"),"gold")}</section>`
      +`<div class="grid-2"><section class="card"><div class="card-head"><h2>${esc(t("upcomingAppts"))}</h2><button class="back-link" onclick="setView('schedule')">${esc(t("viewSchedule"))}</button></div><div class="list">${upcoming.map(a=>`<div class="list-row"><div class="list-main"><strong>${esc(a.patient)}</strong><small>${esc(a.service)} · ${esc(a.clinician)} · ${esc(a.room)}</small></div><div class="list-end"><b style="font-size:13px;color:var(--navy)">${time(a.time)}</b><small style="display:block;color:var(--muted);font-size:10px">${date(a.date)}</small></div></div>`).join("")}</div></section><section class="card"><div class="card-head"><h2>${esc(t("quickActions"))}</h2><span class="muted">${esc(t("quickByRole"))}</span></div><div class="list"><button class="list-row" onclick="openModal('patient')" style="text-align:start;border:1px solid var(--line);cursor:pointer"><span style="color:var(--teal)">${ic("patients",18)}</span> <span class="list-main"><strong>${esc(t("addFileTitle"))}</strong><small>${esc(t("addFileDetail"))}</small></span>＋</button><button class="list-row" onclick="setView('referrals')" style="text-align:start;border:1px solid var(--line);cursor:pointer"><span style="color:var(--gold)">${ic("referrals",18)}</span> <span class="list-main"><strong>${esc(t("reviewReferralsTitle"))}</strong><small>${esc(t("reviewReferralsDetail")(state.referrals.length))}</small></span>→</button><button class="list-row" onclick="setView('departments')" style="text-align:start;border:1px solid var(--line);cursor:pointer"><span style="color:var(--navy)">${ic("departments",18)}</span> <span class="list-main"><strong>${esc(t("deptsTitle"))}</strong><small>${esc(t("deptsDetail"))}</small></span>→</button></div></section></div>`;
    }
    function managementDashboard(){
      const active=state.patients.filter(p=>p.status==="نشط").length, today=state.appointments.filter(a=>a.date==="2026-09-02"&&a.status!=="ملغي").length;
      const needsReview=state.referrals.filter(r=>r.status==="جديدة"||r.status==="قيد الفرز").length;
      const pendingBookings=state.sessionBookings.filter(b=>!b.seen&&b.status!=="ملغي").length;
      const controlCards=[
        {icon:"departments",title:"الأقسام والخدمات",desc:"إضافة وتعديل الأقسام العلاجية وخدماتها",view:"departments"},
        {icon:"team",title:"بوابة الأسرة",desc:"تفعيل أو إضافة خدمات تظهر للأسر مباشرة",view:"settings"},
        {icon:"eye",title:"صلاحيات الفريق",desc:"تحديد حدود وصول الإشراف والاستقبال والموظفين",view:"settings"},
        {icon:"settings",title:"إعدادات المركز",desc:"الهوية وبيانات التواصل وروابط البوابات",view:"settings"}
      ];
      const last7=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const iso=d.toISOString().slice(0,10);const count=state.appointments.filter(a=>a.date===iso).length;const label=new Intl.DateTimeFormat(state.lang==="ar"?"ar-SA":"en-US",{weekday:"short"}).format(d);return{label,value:count}});
      const statusDist=[{label:"نشط",value:state.patients.filter(p=>p.status==="نشط"&&!p.archived).length,color:"var(--teal)"},{label:"متوقف مؤقتاً",value:state.patients.filter(p=>p.status==="متوقف مؤقتاً"&&!p.archived).length,color:"var(--gold)"}];
      return head("لوحة التحكم الأم","مرحباً بك في لوحة إدارة "+state.center.name,"هذه هي المساحة الوحيدة التي يمكن منها التحكم بكل ما يظهر للفريق وللأسر — الأقسام، بوابة الأسرة، وحدود صلاحيات كل دور.",`<button class="btn btn-primary" onclick="setView('settings')">إدارة الصلاحيات والإعدادات</button>`)
      +liveOpsStrip()+smartIntakeBanner()
      +(pendingBookings>0?`<div class="notice-blue" style="margin-bottom:18px">🔴 لديك ${pendingBookings} حجز جديد من بوابة الأسرة بانتظار المراجعة — <a class="back-link" onclick="setView('schedule')">اذهبي للجدول</a></div>`:"")
      +`<section class="metric-grid">${metric("patients",t("metricActive"),active,t("metricActiveDetail")(state.patients.length))}${metric("schedule",t("metricSessions"),state.appointments.filter(a=>a.status==="مجدول").length,t("metricSessionsDetail"))}${metric("team",t("heroStat2")||"نسبة الحضور",Math.round(state.staff.filter(s=>s.present).length/Math.max(state.staff.length,1)*100)+"%","نسبة حضور الفريق اليوم")}${metric("referrals",t("metricReferrals"),needsReview,t("metricReferralsDetail"),"gold")}</section>`
      +`<section class="card" style="margin-bottom:18px"><div class="card-head"><h2>نظرة تحليلية</h2><span class="muted">آخر 7 أيام</span></div><div class="grid-2"><div><div class="muted" style="margin-bottom:10px;font-size:11px">عدد الجلسات يوميًا</div>${svgBarChart(last7)}</div><div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div>${svgDonutChart(statusDist)}</div><div style="flex:1;min-width:140px"><div class="muted" style="margin-bottom:10px;font-size:11px">توزيع حالات الملفات</div>${chartLegend(statusDist)}</div></div></div></section>`
      +`<section class="card" style="margin-bottom:18px"><div class="card-head"><h2>التحكم الكامل بالمنصة</h2><span class="muted">حصريًا من هنا</span></div><div class="section-grid">${controlCards.map(c=>`<article class="section-card"><div class="section-icon">${ic(c.icon,22)}</div><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><button class="btn btn-outline" style="width:100%;margin-top:14px" onclick="setView('${c.view}')">فتح</button></article>`).join("")}</div></section>`
      +`<div class="grid-2"><section class="card"><div class="card-head"><h2>${esc(t("upcomingAppts"))}</h2><button class="back-link" onclick="setView('schedule')">${esc(t("viewSchedule"))}</button></div><div class="list">${state.appointments.filter(a=>a.status==="مجدول").slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5).map(a=>`<div class="list-row"><div class="list-main"><strong>${esc(a.patient)}</strong><small>${esc(a.service)} · ${esc(a.clinician)} · ${esc(a.room)}</small></div><div class="list-end"><b style="font-size:13px;color:var(--navy)">${time(a.time)}</b><small style="display:block;color:var(--muted);font-size:10px">${date(a.date)}</small></div></div>`).join("")}</div></section><section class="card"><div class="card-head"><h2>الفريق</h2><span class="muted">${state.staff.filter(s=>s.present).length} حاضر الآن</span></div><div class="list">${state.staff.slice(0,5).map(s=>`<div class="list-row"><div class="list-main"><strong>${esc(s.name)}</strong><small>${esc(s.role)}</small></div><div class="list-end">${s.present?pill("حاضر"):pill("غير حاضر")}</div></div>`).join("")}</div></section></div>`;
    }
    function patients(){
      const tab=state.patientsTab||"active";
      const activeCount=state.patients.filter(p=>!p.archived).length;
      const archivedCount=state.patients.filter(p=>p.archived).length;
      const rows=state.patients.filter(p=>tab==="archived"?p.archived:!p.archived);
      return head("سجل الحالات / 02","ملفات المستفيدين",tab==="archived"?"الملفات المؤرشفة — يمكن استعادتها في أي وقت.":"ملفات الرعاية النشطة، مرتبة لتصل إلى ما تحتاجه في ثوانٍ.",(tab==="archived"||!can('editPatients'))?"":"<button class=\"btn btn-primary\" onclick=\"openModal('patient')\">＋ إضافة ملف</button>")+`<div class="chips" style="margin-bottom:14px"><label class="chip ${tab==="active"?"checked":""}" onclick="setPatientsTab('active')">الملفات النشطة (${activeCount})</label><label class="chip ${tab==="archived"?"checked":""}" onclick="setPatientsTab('archived')">الأرشيف (${archivedCount})</label></div><section class="card"><div class="searchbar"><input class="input" id="patient-search" oninput="filterPatients()" placeholder="ابحث بالاسم أو رقم الملف أو الاحتياج"><select class="select" id="patient-status" onchange="filterPatients()" style="max-width:180px"><option value="">كل الحالات</option><option>نشط</option><option>متوقف مؤقتاً</option></select></div><div class="table-wrap"><table class="data-table"><thead><tr><th>المستفيد</th><th>رقم الملف</th><th>العمر</th><th>الاحتياج</th><th>البرنامج</th><th>الحالة</th><th></th></tr></thead><tbody id="patients-body">${patientRows(rows,tab==="archived")}</tbody></table></div></section>`;
    }
    function setPatientsTab(tab){state.patientsTab=tab;persist();render()}
    function patientRows(rows,archivedMode){if(!rows.length)return`<tr><td colspan="7"><div class="empty">${archivedMode?"لا توجد ملفات في الأرشيف.":"لا توجد ملفات مطابقة للبحث."}</div></td></tr>`;return rows.map(p=>`<tr><td><b>${esc(p.name)}</b><small style="display:block;color:var(--muted)">${esc(p.school)}</small></td><td>${esc(p.file)}</td><td>${esc(p.age)}</td><td class="wrap">${esc(p.need)}</td><td class="wrap">${esc(p.program)}</td><td>${pill(p.status)}</td><td style="white-space:nowrap"><button class="btn btn-outline" onclick="openPatient('${p.id}')">فتح الملف</button> ${can('editPatients')?(archivedMode?`<button class="btn btn-outline" onclick="restorePatient('${p.id}')">استعادة</button>`:`<button class="btn btn-outline" style="color:var(--danger)" onclick="archivePatient('${p.id}')">حذف</button>`):""}</td></tr>`).join("")}
    function filterPatients(){const q=(document.getElementById("patient-search")?.value||"").toLowerCase(), s=document.getElementById("patient-status")?.value||"";const tab=state.patientsTab||"active";document.getElementById("patients-body").innerHTML=patientRows(state.patients.filter(p=>(tab==="archived"?p.archived:!p.archived)&&(!s||p.status===s)&&(!q||[p.name,p.file,p.need,p.school].join(" ").toLowerCase().includes(q))),tab==="archived")}
    function patientProfileHeader(p,actions){
      const center=state.center||{},location=[center.city,center.country].filter(Boolean).join(" · ");
      const initial=String(p.name||"?").trim().charAt(0)||"?";
      return `<div class="page-head pt-profile-head"><div class="pt-profile-main"><span class="pt-profile-avatar" aria-hidden="true">${esc(initial)}</span><div class="pt-profile-title"><span class="pt-profile-kicker">${ic("shield",14)} ملف المستفيد الموحد</span><h1>${esc(p.name)}</h1><div class="pt-profile-meta"><span>${ic("idcard",13)} رقم الملف <b dir="ltr">${esc(p.file||"—")}</b></span>${p.age?`<span>${ic("calendar",13)} ${esc(p.age)}</span>`:""}${p.need?`<span>${ic("heart",13)} ${esc(p.need)}</span>`:""}</div></div><div class="pt-profile-status">${p.archived?`<span class="pill pill-red">مؤرشف</span>`:pill(p.status)}</div></div><div class="pt-profile-context"><div><small>جهة الرعاية الحالية</small><b>${esc(center.name||"—")}</b></div>${location?`<div><small>المدينة / الدولة</small><b>${esc(location)}</b></div>`:""}<div><small>ولي الأمر</small><b>${esc(p.guardian||"—")}</b></div><div><small>المدرسة</small><b>${esc(p.school||"—")}</b></div><div class="pt-profile-actions">${actions}</div></div></div>`;
    }
    function patientDetail(id){const p=state.patients.find(x=>x.id===id);if(!p)return;const canEditP=can('editPatients');const patientReports=state.progressReports.filter(r=>r.patientId===p.id);const reportsCard=`<section class="card jr-reports" style="margin-top:16px"><div class="card-head"><h2>${ic("chart",18)} تقارير التقدم</h2>${canEditP?`<button class="btn btn-outline" onclick="openModal('generateReport','${p.id}')">＋ توليد تقرير تقدم</button>`:""}</div>${patientReports.length?`<div class="box-grid">${patientReports.map(r=>`<div class="box-card"><div class="box-card-head"><h4>${date(r.date)}</h4><span style="display:flex;gap:4px;flex-wrap:wrap">${pill(r.level)}${pill({family:"الأسرة",school:"المدرسة",insurance:"التأمين",quarterly:"تقرير ٣ شهور"}[r.reportType||"family"]||"الأسرة")}</span></div><small>${esc(r.staffName||"—")}</small><small style="white-space:pre-line">${esc((r.summaryText||"").slice(0,140))}${(r.summaryText||"").length>140?"…":""}</small><div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="viewProgressReport('${r.id}')">عرض كامل</button>${canEditP?`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px;${r.shared?"color:var(--teal)":""}" onclick="toggleReportShare('${r.id}')">${r.shared?"✓ مُشارَك مع الأسرة":"مشاركة مع الأسرة"}</button>`:""}</div></div>`).join("")}</div>`:`<div class="empty">لا توجد تقارير تقدم مولّدة بعد.</div>`}</section>`;
      const stdAssessments = state.standardizedAssessments.filter(a=>a.patientId===p.id).slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
      const assessPct = rec => (rec.domains&&rec.domains.length) ? Math.round(rec.domains.reduce((s,d)=>s+(d.score||0),0)/(rec.domains.length*4)*100) : 0;
      const stdAssessCard = `<section class="card jr-std" style="margin-top:16px"><div class="card-head"><h2>${ic("clipboardCheck",18)} أدوات التقييم القياسية</h2>${canEditP?`<button class="btn btn-outline" onclick="openModal('newStdAssessment','${p.id}')">＋ تقييم قياسي جديد</button>`:""}</div><p class="muted" style="margin:-6px 0 14px">سجلي نتائج ${esc((p.name||"").split(" ")[0])} على أدوات التقييم القياسية (VB-MAPP، ABLLS-R، PEP-3، ASQ، AFLS، PEAK) حسب نسختكم المرخّصة من كل أداة، وتابعي تطور الدرجات بمرور الوقت.</p>${stdAssessments.length?`<div class="box-grid">${stdAssessments.map(a=>`<div class="box-card"><div class="box-card-head"><h4>${esc(a.instrument)}</h4>${pill(assessPct(a)+"%")}</div><small>${date(a.date)}</small><small>${esc((personById(a.staffId)||{}).name||"—")}</small>${a.notes?`<small style="white-space:pre-line">${esc(a.notes.slice(0,100))}${a.notes.length>100?"…":""}</small>`:""}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="openModal('viewStdAssessment','${a.id}')">عرض التفاصيل</button>${canEditP?`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="deleteStdAssessment('${a.id}','${p.id}')">حذف</button>`:""}</div></div>`).join("")}</div>`:`<div class="empty">لا توجد تقييمات بأدوات قياسية مسجّلة بعد.</div>`}</section>`;
      const assignedPrograms=(p.assignedPrograms||[]).slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
      const assignedProgramsCard=`<section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("blocks",18)} البرامج العلاجية المخصصة للملف</h2>${canEditP?`<button class="btn btn-outline" onclick="openModal('assignProgram','${p.id}')">＋ إسناد برنامج</button>`:""}</div><p class="muted" style="margin:-6px 0 14px">برامج من مكتبة البرامج التي فعّلها كل قسم، مُسندة تحديدًا لملف ${esc((p.name||"").split(" ")[0])}.</p>${assignedPrograms.length?`<div class="box-grid">${assignedPrograms.map(ap=>`<div class="box-card"><div class="box-card-head"><h4>${esc(ap.program)}</h4>${pill(departmentLabel(ap.department))}</div><small>${date(ap.date)}${ap.addedBy?" · "+esc(ap.addedBy):""}</small>${canEditP?`<div style="margin-top:8px"><button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="removeAssignedProgram('${p.id}','${ap.id}')">إزالة</button></div>`:""}</div>`).join("")}</div>`:`<div class="empty">لا توجد برامج مسندة لهذا الملف بعد من مكتبة البرامج.</div>`}</section>`;
      const genStats=computeGeneralizationStats(p.id);
      const genChart=(genStats.centerScore!==null||genStats.homeScore!==null)?svgBarChart([{label:"المركز",value:Math.round((genStats.centerScore||0)*100)},{label:"المنزل",value:Math.round((genStats.homeScore||0)*100)}],{height:150,color:"var(--teal)"}):"";
      const genAlert=genStats.status==="gap"?`<div class="notice" style="background:var(--danger-2);border-color:#fecaca;color:var(--danger)">⚠ يُلاحظ تراجع في تعميم الهدف الحالي إلى المنزل — أداء المركز أعلى بوضوح من الأداء المنزلي. يُنصح بتكثيف نفس التمرين في البيت ومناقشة السبب مع الأسرة.</div>`:genStats.status==="homeAhead"?`<div class="notice-blue">ملحوظ: الأداء في المنزل أعلى من أداء الجلسات المسجلة داخل المركز — قد يفيد مراجعة أسلوب التدريب على هذا الهدف داخل المركز.</div>`:genStats.status==="aligned"?`<div class="notice">✓ أداء متقارب بين المركز والمنزل — تعميم جيد للمهارة حاليًا.</div>`:`<div class="empty">تحتاجين تسجيلات من المركز ومن المنزل معًا لقياس التعميم — سجّلي أداء جلسة، واطلبي من الأسرة تسجيل ملاحظة من المنزل عبر بوابتهم.</div>`;
      const recentGenLogs=[...genStats.recentSessions.map(l=>({...l,source:"المركز"})),...genStats.recentHomes.map(l=>({...l,source:"المنزل"}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
      const genCard=(state.role!=="reception")?`<section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("pulse",18)} محرك تعميم المهارات</h2>${canEditP?`<button class="btn btn-outline" onclick="openModal('sessionLog','${p.id}')">＋ تسجيل أداء جلسة</button>`:""}</div><p class="muted" style="margin:-6px 0 14px">يقارن أداء ${esc((p.name||"").split(" ")[0])} داخل جلسات المركز مع ما تسجله الأسرة في المنزل لنفس الهدف، وينبّه عند وجود فجوة تعميم.</p>${genChart?`<div class="grid-2" style="align-items:center"><div>${genChart}</div><div>${genAlert}</div></div>`:genAlert}${recentGenLogs.length?`<div class="box-grid" style="margin-top:14px">${recentGenLogs.map(l=>`<div class="box-card"><div class="box-card-head"><h4>${date(l.date)}</h4>${pill(l.source)}</div>${genResultPill(l.result)}<small style="white-space:pre-line">${esc((l.goalText||"").slice(0,80))}</small>${l.notes?`<small style="white-space:pre-line">${esc(l.notes.slice(0,100))}</small>`:""}</div>`).join("")}</div>`:""}</section>`:"";
      const headActions=`<div style="display:flex;gap:8px;flex-wrap:wrap">${canEditP?(p.archived?`<button class="btn btn-outline" onclick="restorePatient('${p.id}')">استعادة من الأرشيف</button><button class="btn btn-outline" style="color:var(--danger)" onclick="deletePatientPermanently('${p.id}')">حذف نهائي</button>`:`<button class="btn btn-outline" style="color:var(--danger)" onclick="archivePatient('${p.id}')">حذف (نقل للأرشيف)</button>`):""}</div>`;
      const canSeeHealth=state.role!=="reception";
      let healthCard="";
      if(canSeeHealth){
        const h=p.health||defaultHealth(p);
        const neuroBoxes=h.neuroReports.map(r=>`<div class="box-card"><div class="box-card-head"><h4>${esc(r.facility||"—")}</h4>${pill(date(r.date))}</div><small>${esc(r.doctorName||"—")}</small><small style="white-space:pre-line">${esc((r.summary||"").slice(0,120))}${(r.summary||"").length>120?"…":""}</small>${canEditP?`<button class="btn btn-outline" style="margin-top:8px;padding:6px 10px;font-size:11px;color:var(--danger)" onclick="deleteNeuroReport('${p.id}','${r.id}')">حذف</button>`:""}</div>`).join("");
        healthCard=`<section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("shield",18)} الملف الصحي الموحد</h2>${canEditP?`<label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);cursor:pointer"><input type="checkbox" ${h.sharedWithFamily?"checked":""} onchange="toggleHealthShare('${p.id}','sharedWithFamily',this.checked)"> مشاركة مع الأسرة</label><label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);cursor:pointer;margin-inline-start:12px"><input type="checkbox" ${h.sharedWithSchool?"checked":""} onchange="toggleHealthShare('${p.id}','sharedWithSchool',this.checked)"> مشاركة مع المدرسة</label>`:""}</div><p class="muted" style="margin:-6px 0 14px">سجل سحابي واحد لبيانات ${esc((p.name||"").split(" ")[0])} الصحية من الولادة وحتى اليوم — يجمع بيانات الولادة وفحص السمع وتقارير المخ والأعصاب والتأهيل السابق، مع إمكانية ربطه بالجهات الصحية الخارجية.</p><div class="box-grid"><div class="box-card"><div class="box-card-head"><h4>بيانات الولادة</h4>${canEditP?`<button class="btn btn-outline" style="padding:4px 8px;font-size:10px" onclick="openModal('editHealthBirth','${p.id}')">تعديل</button>`:""}</div><small>تاريخ الميلاد: ${h.birthDate?date(h.birthDate):"—"}</small><small>نوع الولادة: ${esc(h.birthType||"—")}</small>${h.birthNotes?`<small>${esc(h.birthNotes)}</small>`:""}</div><div class="box-card"><div class="box-card-head"><h4>فحص السمع</h4>${canEditP?`<button class="btn btn-outline" style="padding:4px 8px;font-size:10px" onclick="openModal('editHearing','${p.id}')">تعديل</button>`:""}</div>${pill(h.hearingScreening.status)}<small>${esc(h.hearingScreening.facility||"—")}${h.hearingScreening.date?" · "+date(h.hearingScreening.date):""}</small>${h.hearingScreening.notes?`<small>${esc(h.hearingScreening.notes)}</small>`:""}</div><div class="box-card"><div class="box-card-head"><h4>التأهيل قبل الالتحاق</h4>${canEditP?`<button class="btn btn-outline" style="padding:4px 8px;font-size:10px" onclick="openModal('editPriorRehab','${p.id}')">تعديل</button>`:""}</div>${h.priorRehab.had?`<small>الجهة: ${esc(h.priorRehab.provider||"—")}</small><small>المدة: ${esc(h.priorRehab.duration||"—")}</small>${h.priorRehab.details?`<small>${esc(h.priorRehab.details)}</small>`:""}`:`<small class="muted">لم يتلقَّ تأهيلاً قبل الالتحاق بالمركز.</small>`}</div><div class="box-card"><div class="box-card-head"><h4>الجهة الصحية المرتبطة</h4>${canEditP?`<button class="btn btn-outline" style="padding:4px 8px;font-size:10px" onclick="openModal('editHealthLink','${p.id}')">تعديل</button>`:""}</div>${pill(h.linkedFacility.status)}<small>${esc(h.linkedFacility.name||"لا توجد جهة مرتبطة بعد")}</small><small>رمز الربط الطبي: <b>${esc(h.linkCode)}</b></small></div><div class="box-card"><div class="box-card-head"><h4>ملاحظة صحية للمدرسة</h4>${canEditP?`<button class="btn btn-outline" style="padding:4px 8px;font-size:10px" onclick="openModal('editSchoolNote','${p.id}')">تعديل</button>`:""}</div>${h.schoolNote?`<small style="white-space:pre-line">${esc(h.schoolNote)}</small>`:`<small class="muted">لا توجد ملاحظات مشاركة مع المدرسة بعد.</small>`}</div></div><div class="card-head" style="margin-top:18px"><h3 style="margin:0;font-size:14px">تقارير المخ والأعصاب</h3>${canEditP?`<button class="btn btn-outline" onclick="openModal('addNeuroReport','${p.id}')">＋ إضافة تقرير</button>`:""}</div>${h.neuroReports.length?`<div class="box-grid">${neuroBoxes}</div>`:`<div class="empty">لا توجد تقارير مخ وأعصاب مضافة بعد.</div>`}<div class="notice" style="margin-top:14px">شارك رمز الربط الطبي أعلاه مع المستشفى أو الطبيب المعالج ليتمكن من إرسال تقارير (فحص سمع / مخ وأعصاب) عبر بوابة الطبيب، وتصل هذه التقارير أولاً إلى صندوق الإحالات للمراجعة قبل إلحاقها بالملف.</div></section>`;
      }
      let libraryAppliedCard="";
      {
        const apps=state.libraryApplications.filter(x=>x.patientId===p.id);
        if(apps.length) libraryAppliedCard=`<section class="card" style="margin-top:16px"><div class="card-head"><h2>${ic("book",18)} أنشطة المكتبة المطبّقة في المنزل</h2></div><div class="box-grid">${apps.map(a=>`<div class="box-card"><div class="box-card-head"><h4>${date(a.date)}</h4></div><small>${esc(a.articleTitle)}</small></div>`).join("")}</div></section>`;
      }
      return backBtn("setView('patients')","العودة للملفات")+patientProfileHeader(p,headActions)+`<div class="grid-2"><section class="card"><div class="card-head"><h2>بيانات المستفيد</h2><div style="display:flex;gap:8px;align-items:center">${p.archived?`<span class="pill pill-red">مؤرشف</span>`:""}${pill(p.status)}${canEditP?`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="openModal('editPatient','${p.id}')">تعديل البيانات</button>`:""}</div></div><div class="form-grid"><div><span class="muted">رقم الملف</span><b style="display:block">${esc(p.file)}</b></div><div><span class="muted">العمر</span><b style="display:block">${esc(p.age)}</b></div><div><span class="muted">المدرسة</span><b style="display:block">${esc(p.school)}</b></div><div><span class="muted">كود الأسرة</span><b style="display:block">${esc(p.code)}</b></div><div><span class="muted">ولي الأمر</span><b style="display:block">${esc(p.guardian||"—")}</b></div><div><span class="muted">رقم تواصل ولي الأمر</span><b style="display:block">${esc(p.phone||"—")}</b></div></div><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><div class="card-head"><h2>الملاحظات السريرية</h2>${canEditP?`<button class="btn btn-outline" onclick="openModal('notes','${p.id}')">تعديل</button>`:""}</div><p class="muted" style="line-height:2">${esc(p.notes)}</p></section><section class="card"><div class="card-head"><h2>الخطة العلاجية</h2>${jrPlanPill(p)}</div><div class="notice-blue"><b>الهدف الحالي</b><br>${esc(p.goal)}</div><div style="margin-top:20px"><div class="muted">الموعد القادم</div>${jrNextHtml(p)}</div><div style="margin-top:20px"><div class="muted">التقدم في الأهداف</div>${jrProgHtml(p)}</div></section></div>`+awanNextCard(p)+patientCaseStudyCard(p)+reportsCard+stdAssessCard+assignedProgramsCard+genCard+healthCard+libraryAppliedCard+consentsCard(p)+patientAuditCard(p);
    }
    function familyBookingsAlertSection(){
      const rows=state.sessionBookings.filter(b=>b.status!=="ملغي");
      if(!rows.length) return "";
      const unseenCount=rows.filter(b=>!b.seen).length;
      return `<section class="card" style="margin-bottom:16px">
        <div class="card-head"><h2>${unseenCount>0?"🔴 ":""}حجوزات الأسرة عبر بوابة الأسرة</h2><span class="muted">${rows.length} حجز${unseenCount>0?` · ${unseenCount} جديد`:""}</span></div>
        ${unseenCount>0?`<div class="actions" style="margin-bottom:10px"><button class="btn btn-outline" onclick="markAllBookingsSeen()">تحديد الكل كمقروء</button></div>`:""}
        <div class="list">${rows.map(b=>`<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>${!b.seen?`<span class="pill pill-red" style="margin-inline-end:6px">جديد</span>`:""}${esc(b.patientName)}</strong><small>${date(b.day)} · ${time(b.time)} — ${esc(b.specialist)}</small></div><div class="list-end">${pillFor(b.status)}${!b.seen?`<button class="btn btn-outline" style="margin-top:8px;padding:6px 10px;font-size:11px" onclick="markBookingSeen('${b.id}')">تم الاطلاع</button>`:""}</div></div>`).join("")}</div>
      </section>`;
    }
    function appointmentActionsCell(a){
      if(!can('editAppointments')) return `<td></td>`;
      const editBtn=`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="openModal('appointment','${a.id}')">تعديل</button>`;
      const delBtn=`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--danger)" onclick="deleteAppointment('${a.id}')">حذف</button>`;
      let compBtn="";
      if(a.status==="ملغي"){
        compBtn=a.compensated?`<span class="pill pill-good" style="margin-inline-start:4px">تم التعويض ✓</span>`:`<button class="btn btn-outline" style="padding:6px 10px;font-size:11px;color:var(--teal)" onclick="openModal('compensation','${a.id}')">جدولة تعويض</button>`;
      }
      return `<td style="white-space:nowrap"><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${editBtn}${delBtn}${compBtn}</div></td>`;
    }
    function todayISO(){return new Date().toISOString().slice(0,10)}
    function filterApptsByRange(rows,filter){
      const todayStr=todayISO();
      if(filter==="today") return rows.filter(a=>a.date===todayStr);
      if(filter==="week"){const start=new Date(todayStr+"T00:00:00");const end=new Date(start);end.setDate(end.getDate()+7);return rows.filter(a=>{const d=new Date(a.date+"T00:00:00");return d>=start&&d<end});}
      if(filter==="month"){const ym=todayStr.slice(0,7);return rows.filter(a=>(a.date||"").startsWith(ym));}
      if(filter==="comp") return rows.filter(a=>a.compensationFor);
      return rows;
    }
    function setStaffScheduleFilter(f){state.staffScheduleFilter=f;persist();render()}
    function schedule(){
      const addApptBtn=can('editAppointments')?"<button class=\"btn btn-primary\" onclick=\"openModal('appointment')\">＋ حجز جلسة</button>":"";
      const person=state.role==="staff"?(getCurrentPerson()||state.staff.find(s=>s.roleCategory==="staff")):null;
      const ownRows=person?state.appointments.filter(a=>a.clinician===person.name):state.appointments;
      const newCount=person?ownRows.filter(a=>a.newForStaff).length:0;
      const activeFilter=person?(state.staffScheduleFilter||"all"):"all";
      const rows=person?filterApptsByRange(ownRows,activeFilter):ownRows;
      const scopeNote=person?`<div class="notice-blue" style="margin-bottom:16px">${newCount>0?"🔴 ":""}هذا جدولك الشخصي كـ${esc(person.role)} — توزّعه إدارة الاستقبال.${newCount>0?` لديك ${newCount} إضافة جديدة.`:""}${newCount>0?` <a class="back-link" onclick="ackAllNewChildAppts()">تحديد الكل كمقروء</a>`:""}</div>`:"";
      const filterChips=person?`<div class="chips" style="margin-bottom:14px">${[["all","📋 الكل"],["today","📅 جدول اليوم"],["week","🗓️ جدول الأسبوع"],["month","📆 جدول الشهر"],["comp","🔄 الجلسات التعويضية"]].map(([key,label])=>`<label class="chip ${activeFilter===key?"checked":""}" onclick="setStaffScheduleFilter('${key}')">${label}</label>`).join("")}</div>`:"";
      return head("الجدول / 03","إيقاع اليوم",person?"جلساتك المجدولة اليوم وقادمًا.":"نظرة هادئة على الجلسات القادمة وتوزيع الغرف والفريق.",addApptBtn)+familyBookingsAlertSection()+scopeNote+filterChips+`<section class="card"><div class="card-head"><h2>جدول المواعيد</h2><span class="muted">${rows.length} مواعيد محفوظة</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>التاريخ</th><th>الوقت</th><th>المستفيد</th><th>الخدمة</th><th>المعالج</th><th>الغرفة</th><th>الحالة</th><th></th></tr></thead><tbody>${rows.length?rows.map(a=>{return `<tr><td>${date(a.date)}</td><td><b>${time(a.time)}</b></td><td>${esc(a.patient)}</td><td>${esc(a.service)}</td><td>${esc(a.clinician)}</td><td>${esc(a.room)}</td><td>${pill(a.status)}${a.compensationFor?` <span class="pill pill-blue">🔄 تعويض</span>`:""}${a.newForStaff?` <span class="pill pill-red">جديد</span> <button class="btn btn-outline" style="padding:4px 8px;font-size:10px" onclick="ackNewChildAppt('${a.id}')">تم الاطلاع</button>`:""}</td>${appointmentActionsCell(a)}</tr>`}).join(""):`<tr><td colspan="8"><div class="empty">${activeFilter==="all"?"لا توجد مواعيد في جدولك حاليًا.":"لا توجد مواعيد ضمن هذا الفلتر."}</div></td></tr>`}</tbody></table></div></section>`;
    }
    function referrals(){return head("الإحالات / 04","صندوق الإحالات","حوّل طلبات التعاون الجديدة إلى مسارات رعاية واضحة، دون أن يفوتك أي طلب.","<button class=\"btn btn-primary\" onclick=\"openModal('referral')\">＋ تسجيل إحالة</button>")+`<section class="card"><div class="notice" style="margin-bottom:17px">الإحالة العامة أو الطبية تدخل الصندوق الداخلي أولاً للمراجعة. لا يتم إنشاء ملف مستفيد تلقائياً قبل موافقة المركز.</div><div class="table-wrap"><table class="data-table"><thead><tr><th>الطلب</th><th>الجهة / الشخص</th><th>النوع</th><th>الأولوية</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead><tbody>${state.referrals.map((r,i)=>`<tr><td class="wrap"><b>${esc(r.name)}</b>${r.note?`<br><small class="muted">${esc(r.note)}</small>`:""}</td><td>${esc(r.person)}</td><td>${esc(r.type)}</td><td>${pill(r.priority)}</td><td>${date(r.date)}</td><td>${pill(r.status)}</td><td>${r.type==="تقرير طبي"?(r.patientId?`<button class="btn btn-outline" style="margin-left:6px" onclick="openModal('medReferral',${i})">عرض</button>${r.status==="أُلحق بالملف الصحي"?"":`<button class="btn btn-primary" onclick="attachMedicalReport(${i})">إلحاق بالملف الصحي</button>`}`:`<span class="muted" style="font-size:11px">لا يوجد ملف مطابق</span>`):`<button class="btn btn-outline" onclick="advanceReferral(${i})">تحديث</button>`}</td></tr>`).join("")}</tbody></table></div></section><section class="card" style="margin-top:18px"><div class="card-head"><h2>طلبات تسجيل أولية</h2><span class="muted">لا تنشئ ملفاً تلقائياً</span></div><div class="list">${state.registrations.map((r,i)=>`<div class="list-row"><div class="list-main"><strong>${esc(r.child)}</strong><small>ولي الأمر: ${esc(r.guardian||"—")} · ${esc(r.phone||"—")} · ${esc((r.reason||"").slice(0,60))}${(r.reason||"").length>60?"…":""}</small></div><div class="list-end">${pill(r.status)}<button class="btn btn-outline" style="margin-right:7px" onclick="openModal('registration',${i})">عرض التفاصيل</button><button class="btn btn-outline" style="margin-right:7px" onclick="advanceRegistration(${i})">تحديث</button></div></div>`).join("")}</div></section>`;
    }
    function team(){return head("الفريق / 05","فريق الرعاية","وازن الأحمال، واحمِ وقت الفريق، وامنح كل حالة التخصص الذي تحتاجه.","<button class=\"btn btn-primary\" onclick=\"openModal('staff')\">＋ إضافة موظف</button>")+`<section class="card"><div class="card-head"><h2>الفريق وساعات الدوام</h2><span class="muted">${state.staff.filter(s=>s.present).length} حاضر الآن</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>الموظف</th><th>الدور</th><th>القسم</th><th>فئة الدخول</th><th>كود الدخول</th><th>ساعات الدوام</th><th>الحضور</th><th>الحالة</th></tr></thead><tbody>${state.staff.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td>${esc(departmentLabel(s.department))}</td><td>${esc((roles[s.roleCategory]&&roles[s.roleCategory].label)||"موظف")}</td><td><code style="background:#f2ece0;padding:3px 8px;border-radius:6px;font-weight:700">${esc(s.code||"—")}</code></td><td>${esc(s.schedule)}</td><td>${s.present?pill("حاضر"):pill("غير حاضر")}</td><td>${pill(s.status)}</td></tr>`).join("")}</tbody></table></div></section>`;
    }
    function receptionDashboard(){
      const todayStr=todayISO();
      const todayAppts=state.appointments.filter(a=>a.date===todayStr);
      const pendingConsults=state.consultationReviews.filter(c=>c.status==="بانتظار المراجعة");
            const commPending=pendingCommCount();
const todayDeptIds=new Set(todayAppts.map(a=>{const s=state.staff.find(x=>x.name===a.clinician);return s&&s.department}).filter(Boolean));
      return head("الاستقبال / 09","الاستقبال والحجوزات","سجّلي حجزاً جديداً وتابعي مواعيد اليوم — كل شيء من هنا.",`<button class="btn btn-primary" onclick="openModal('newBooking')">＋ تسجيل حجز جديد</button>`)
      +`<section class="metric-grid">${metric("schedule","مواعيد اليوم",todayAppts.length,"على جدول اليوم")}${metric("check","استشارات بانتظار المراجعة",pendingConsults.length,"لدى الإشراف الفني","gold")}${metric("departments","الجدول موزّع على الأقسام",todayDeptIds.size,"من "+state.departments.length+" قسم بالمركز")}</section>`
            +`<section class="card" style="margin-top:18px;border-color:var(--comm-1)"><div class="card-head"><h2><span class="comm-badge sm" style="margin-inline-end:8px;vertical-align:middle">${ic("commHub",14)}</span>أوان تواصل</h2>${commPending>0?`<span class="pill pill-red">${commPending} جديد</span>`:`<span class="muted">لا يوجد جديد</span>`}</div><p class="muted" style="margin:0 0 12px">مركز تواصل حي بين الاستقبال والأقسام والإشراف وبوابة الأهل — رسائل وقرارات وحالتها لحظيًا.</p><button class="btn btn-primary" onclick="setView('communicationHub')">فتح أوان تواصل</button></section>`
+`<section class="card" style="margin-top:18px"><div class="card-head"><h2>حجوزات اليوم</h2><button class="back-link" onclick="setView('schedule')">عرض الجدول الكامل ←</button></div><div class="list">${todayAppts.length?todayAppts.map(a=>`<div class="list-row"><div class="list-main"><strong>${esc(a.patient)}</strong><small>${esc(a.service)} · ${esc(a.clinician)} · ${esc(a.room)}${a.bookingType?" · "+esc(a.bookingType):""}</small></div><div class="list-end"><b style="font-size:13px;color:var(--navy)">${time(a.time)}</b>${pill(a.status)}</div></div>`).join(""):`<div class="empty">لا توجد مواعيد مسجّلة اليوم بعد.</div>`}</div></section>`;
    }
    function submitNewBooking(e){
      e.preventDefault();
      const f=formData(e);
      let patient;
      if(f.patientId==="__new__"){
        if(!f.newName||!f.newGuardian||!f.newPhone){notify("أكملي بيانات الطفل الجديد (الاسم، ولي الأمر، رقم التواصل) أولاً");return}
        const id="p"+Date.now();
        patient={id,name:f.newName,file:"AWN-"+String(1000+state.patients.length+1),age:f.newAge||"—",need:f.newNeed||"—",program:f.service||"—",school:"",status:"نشط",notes:"لم تتم إضافة ملاحظات بعد.",goal:"سيتم تحديد الهدف بعد التقييم الأولي.",next:(f.date||"2026-09-08")+"T"+(f.time||"09:00"),code:"LOCAL-"+id.slice(-4),guardian:f.newGuardian,phone:f.newPhone,archived:false,consentReviewContact:!!f.newConsentReviewContact,reviewRequestedCount:0,lastReviewRequestDate:null,hasReviewed:false};
        patient.health=defaultHealth(patient);
        state.patients.unshift(patient);
        sendFamilyToReviewQueue(patient);
      } else {
        patient=state.patients.find(x=>x.id===f.patientId);
        if(!patient){notify("تعذر إيجاد ملف الطفل المحدد");return}
      }
      const specialist=state.staff.find(s=>s.name===f.clinician);
      const isConsultation=f.bookingType==="استشارة مبدئية";
      if(isConsultation){
        state.consultationReviews.unshift({id:"cv-"+Date.now(),patientId:patient.id,patientName:patient.name,department:specialist?specialist.department:null,specialistName:f.clinician,date:f.date,time:f.time,room:f.room,guardian:patient.guardian,phone:patient.phone,status:"بانتظار المراجعة",note:""});
      }
      state.appointments.push({id:"apt-"+Date.now(),date:f.date,time:f.time,patient:patient.name,service:f.service,clinician:f.clinician,room:f.room,status:"مجدول",bookingType:f.bookingType,newForStaff:true});
      persist();closeModal();
      notify(isConsultation?`تم تسجيل الاستشارة وترحيلها للإشراف الفني للمراجعة قبل اعتماد جدول ثابت لـ ${patient.name}`:`تم تسجيل الحجز لـ ${patient.name} بنجاح`);
      render();
    }
    function reviewConsultation(id,decision){
      const c=state.consultationReviews.find(x=>x.id===id); if(!c)return;
      if(decision==="approve"){
        c.status="معتمدة";
        state.plans.unshift({id:"pl-"+Date.now(),staffId:(state.staff.find(s=>s.name===c.specialistName)||{}).id,department:c.department,patient:c.patientName,title:"اعتماد جدول ثابت بعد الاستشارة المبدئية",status:"معتمدة",date:todayISO(),note:"تم الاعتماد بعد المراجعة الفنية"});
        persist();notify("تم اعتماد الجدول الثابت لـ "+c.patientName);render();return;
      }
      openModal('rejectConsultation',id);
    }
    function confirmRejectConsultation(e,id){
      e.preventDefault();
      const f=formData(e);
      const c=state.consultationReviews.find(x=>x.id===id); if(!c)return;
      c.status="مرفوضة";c.note=f.note||"";
      persist();closeModal();notify("تم إرجاع الاستشارة مع الملاحظات");render();
    }
    function staffDashboard(){
      if(state.staffSection){return staffSectionDetail(state.staffSection)}
      const person=getCurrentPerson()||state.staff.find(s=>s.roleCategory==="staff")||state.staff[0];
      if(!person) return dashboard();
      const myAppts=state.appointments.filter(a=>a.clinician===person.name);
      const upcoming=myAppts.filter(a=>a.status==="مجدول").slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4);
      const newCount=myAppts.filter(a=>a.newForStaff).length;
      const myEval=state.evaluations.filter(x=>x.staffId===person.id);
      const myTasks=state.dailyTasks.filter(x=>x.staffId===person.id);
      const myWorkshops=state.workshops.filter(x=>x.staffId===person.id);
      const myComplaints=state.complaints.filter(x=>x.staffId===person.id);
      const myCourses=state.courses.filter(x=>x.staffId===person.id);
      const openTasks=myTasks.filter(x=>!x.done).length;
      const liveOpen=state.liveSession&&Array.isArray(state.liveSession.targets)&&state.liveSession.staffId===person.id&&!state.liveSession.locked;
      const cards=[
        {key:"session",icon:"target",title:"جلساتي DTT",count:liveOpen?1:myAppts.filter(a=>a.status!=="مكتمل"&&a.status!=="ملغي").length,detail:liveOpen?"عندك جلسة مفتوحة — كمّليها":"تسجيل المحاولات I · C · P · NR"},
        {key:"schedule",icon:"schedule",title:"الجدول",count:myAppts.length,detail:`${upcoming.length} موعد قادم`},
        {key:"evaluations",icon:"check",title:"التقييمات",count:myEval.length,detail:"تقييمات مرتبطة بملفك"},
        {key:"tasks",icon:"target",title:"مهام اليوم",count:openTasks,detail:`${myTasks.length} مهمة إجمالاً`},
        {key:"workshops",icon:"idea",title:"ورش العمل",count:myWorkshops.length,detail:"ورش مسندة إليك"},
        {key:"complaints",icon:"question",title:"الشكاوى",count:myComplaints.length,detail:"شكاوى تخص عملك"},
        {key:"courses",icon:"book",title:"الكورسات",count:myCourses.length,detail:"تدريبك المستمر"}
      ];
      return head("مساحتي الشخصية","أهلاً "+person.name,person.role+" · "+person.schedule,"")
      +(newCount>0?`<div class="notice" style="margin-bottom:16px;border-color:var(--danger);color:var(--danger)">🔴 لديك ${newCount} طفل جديد أُضيف إلى جدولك — <a class="back-link" onclick="setView('schedule')">افتحي الجدول</a></div>`:"")
      +dttTodayCard(person)+`<section class="section-grid">${cards.map(c=>`<article class="section-card" style="cursor:pointer" onclick="${c.key==='schedule'?"setView('schedule')":`openStaffSection('${c.key}')`}"><div class="section-icon">${ic(c.icon,22)}</div><h3>${esc(c.title)}</h3><p>${esc(c.detail)}</p><div style="margin-top:10px"><span class="pill pill-good">${c.count}</span></div></article>`).join("")}</section>`
      +`<section class="card" style="margin-top:18px"><div class="card-head"><h2>مواعيدي القادمة</h2><button class="back-link" onclick="setView('schedule')">عرض الجدول الكامل ←</button></div><div class="list">${upcoming.length?upcoming.map(a=>`<div class="list-row"><div class="list-main"><strong>${a.newForStaff?`<span class="pill pill-red" style="margin-inline-end:6px">جديد</span>`:""}${esc(a.patient)}</strong><small>${esc(a.service)} · ${esc(a.room)}</small></div><div class="list-end"><b style="font-size:13px;color:var(--navy)">${time(a.time)}</b><small style="display:block;color:var(--muted);font-size:10px">${date(a.date)}</small></div></div>`).join(""):`<div class="empty">لا توجد مواعيد قادمة حالياً.</div>`}</div></section>`;
    }
    function openStaffSection(kind){state.staffSection=kind;render()}
    function closeStaffSection(){state.staffSection=null;render()}
    function staffSectionDetail(kind){
      const person=getCurrentPerson()||state.staff.find(s=>s.roleCategory==="staff")||state.staff[0];
      const back=backBtn("closeStaffSection()","العودة لمساحتي");
      if(kind==="session") return liveSessionView();
      if(kind==="evaluations"){
        const rows=state.evaluations.filter(x=>x.staffId===person.id);
        return back+head("مساحتي / التقييمات","التقييمات","تقييمات المستفيدين المسندة إليك.","")+`<section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>المستفيد</th><th>نوع التقييم</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>${rows.length?rows.map(e=>`<tr><td><b>${esc(e.patient)}</b></td><td>${esc(e.type)}</td><td>${date(e.date)}</td><td>${pill(e.status)}</td></tr>`).join(""):`<tr><td colspan="4"><div class="empty">لا توجد تقييمات مسندة إليك حالياً.</div></td></tr>`}</tbody></table></div></section>`;
      }
      if(kind==="tasks"){
        const rows=state.dailyTasks.filter(x=>x.staffId===person.id);
        return back+head("مساحتي / مهام اليوم","مهام اليوم","مهامك لليوم — حدّثي حالتها فور الإنجاز.","")+`<section class="card"><div class="list">${rows.length?rows.map(x=>`<div class="list-row"><div class="list-main"><strong style="${x.done?"text-decoration:line-through;color:var(--muted)":""}">${esc(x.text)}</strong></div><div class="list-end"><button class="btn btn-outline" onclick="toggleStaffTask('${x.id}')">${x.done?"إعادة فتح":"تم الإنجاز ✓"}</button></div></div>`).join(""):`<div class="empty">لا توجد مهام اليوم.</div>`}</div></section>`;
      }
      if(kind==="workshops"){
        const rows=state.workshops.filter(x=>x.staffId===person.id);
        return back+head("مساحتي / ورش العمل","ورش العمل","ورش العمل التي تقدّمينها أو تشاركين فيها.","")+`<section class="card"><div class="list">${rows.length?rows.map(w=>`<div class="list-row"><div class="list-main"><strong>${esc(w.title)}</strong><small>${esc(w.audience)} · ${date(w.date)}</small></div><div class="list-end">${pill(w.status)}</div></div>`).join(""):`<div class="empty">لا توجد ورش عمل مسندة إليك حالياً.</div>`}</div></section>`;
      }
      if(kind==="complaints"){
        const rows=state.complaints.filter(x=>x.staffId===person.id);
        return back+head("مساحتي / الشكاوى","الشكاوى","الشكاوى المرتبطة بعملك — للمتابعة والرد.","")+`<section class="card"><div class="list">${rows.length?rows.map(c=>`<div class="list-row"><div class="list-main"><strong>${esc(c.subject)}</strong><small>من: ${esc(c.from)} · ${date(c.date)}</small></div><div class="list-end">${pill(c.status)}</div></div>`).join(""):`<div class="empty">لا توجد شكاوى مسجلة عليك — أحسنتِ! 🌿</div>`}</div></section>`;
      }
      if(kind==="courses"){
        const rows=state.courses.filter(x=>x.staffId===person.id);
        return back+head("مساحتي / الكورسات","الكورسات","تدريبك المستمر وتطوير مهاراتك المهنية.","")+`<section class="card"><div class="list">${rows.length?rows.map(c=>`<div class="list-row"><div class="list-main"><strong>${esc(c.title)}</strong><small>${esc(c.provider)}</small></div><div class="list-end" style="min-width:160px"><div style="height:8px;border-radius:99px;background:#ece4d8"><div style="height:100%;width:${c.progress}%;background:var(--teal);border-radius:99px"></div></div><small class="muted">${c.progress}% مكتمل</small></div></div>`).join(""):`<div class="empty">لا توجد كورسات مسجلة حالياً.</div>`}</div></section>`;
      }
      state.staffSection=null; return staffDashboard();
    }
    // ---- جلسة DTT للأخصائي (تابلت وموبايل) ----
    // مبنية على Awan_Dashboard_DTT: جدول اليوم ← فتح الجلسة ← الأهداف ← 10 محاولات لكل هدف بأكواد I / C / P / NR.
    // النتيجة تتكتب في state.sessionLogs (نفس سجل أداء الجلسات في ملف الطفل) والموعد يتحول «مكتمل».
    const DTT_CODES=[
      {k:"I",d:"صح بدون مساعدة",c:"dt-i"},
      {k:"C",d:"صح بعد المساعدة",c:"dt-c"},
      {k:"P",d:"مساعدة كاملة",c:"dt-p"},
      {k:"NR",d:"ما فيه استجابة",c:"dt-nr"}];
    const DTT_BLOCK=10;
    function lsPerson(){return (state.sipadMode&&state.sipad&&personById(state.sipad))||getCurrentPerson()||state.staff.find(s=>s.roleCategory==="staff")||state.staff[0]}
    function dttPct(tr){return tr.length?Math.round(tr.filter(x=>x.r==="I").length/tr.length*100):null}
    function dttResult(p){return p==null?null:p>=80?"نجاح كامل":p>=50?"نجاح جزئي":"لم ينجح بعد"}
    function dttCount(tr,k){return tr.filter(x=>x.r===k).length}
    function dttLive(){const L=state.liveSession;return (L&&Array.isArray(L.targets))?L:null}
    function dttDomainOf(pt,a){const src=(pt&&pt.program)||(a&&a.service)||"";return (src.split("·")[0]||"").trim()||"مهارات عامة"}
    function dttTargetsFor(pt,a){
      const list=[];const seen=new Set();const dom=dttDomainOf(pt,a);
      const add=t=>{t=(t||"").trim();if(t&&!seen.has(t)){seen.add(t);list.push({text:t,domain:dom,allowNR:true,trials:[]})}};
      if(pt&&Array.isArray(pt.goals))pt.goals.filter(g=>g.status==="معتمد").forEach(g=>{const t=(g.text||"").trim();if(t&&!seen.has(t)){seen.add(t);list.push({text:t,domain:g.domain||dom,allowNR:true,trials:[]})}});
      if(pt){add(pt.goal);state.sessionLogs.filter(l=>l.patientId===pt.id).forEach(l=>add(l.goalText))}
      return list.slice(0,6);
    }
    // اليوم اللي بيتعرض في الجدول: اليوم لو فيه مواعيد، وإلا أقرب يوم جاي، وإلا آخر يوم فات
    function dttDays(person){return [...new Set(state.appointments.filter(a=>a.clinician===person.name&&a.status!=="ملغي").map(a=>a.date))].sort()}
    function dttPickDay(person){
      const days=dttDays(person);if(!days.length)return null;
      if(state.dttDay&&days.includes(state.dttDay))return state.dttDay;
      const today=localDateOf(new Date());if(days.includes(today))return today;
      return days.find(d=>d>today)||days[days.length-1];
    }
    function dttTimeline(person,compact){
      const days=dttDays(person);const day=dttPickDay(person);const L=dttLive();
      if(!day) return `<div class="empty">ما فيه مواعيد في جدولك.</div>`;
      const rows=state.appointments.filter(a=>a.clinician===person.name&&a.date===day&&a.status!=="ملغي").sort((x,y)=>x.time.localeCompare(y.time));
      const nextId=(rows.find(a=>a.status!=="مكتمل")||{}).id;
      const today=localDateOf(new Date());
      return `${days.length>1?`<div class="dt-days">${days.map(d=>`<button class="${d===day?"on":""}" onclick="dttSetDay('${d}')">${d===today?"اليوم":date(d)}</button>`).join("")}</div>`:""}
        <div class="dt-tl">${rows.map(a=>{const live=L&&L.aptId===a.id&&!L.locked;const done=a.status==="مكتمل";const isNext=a.id===nextId;
          return `<div class="dt-slot ${done?"done":""} ${isNext?"next":""}"><div class="dt-slot-time">${time(a.time)}</div><div class="dt-slot-main"><strong>${esc(a.patient)}</strong><small>${esc(a.service)} · ${esc(a.room)}</small></div>
            <div class="dt-slot-end">${done?`<span class="pill pill-good">تمت ✓</span>`:live?`<button class="btn btn-primary" onclick="dttResume()">كمّلي الجلسة</button>`:`<button class="btn ${isNext?"btn-primary":"btn-outline"}" onclick="startLiveSession('${a.id}')">فتح الجلسة</button>`}</div></div>`}).join("")}</div>`;
    }
    function dttSetDay(d){state.dttDay=d;render()}
    function dttResume(){state.staffSection="session";render();window.scrollTo(0,0)}
    function dttTodayCard(person){
      const L=dttLive();const openLive=L&&L.staffId===person.id&&!L.locked;
      return `<section class="card dt-today"><div class="card-head"><h2>${ic("schedule",18)} جدول اليوم</h2><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-outline" onclick="openStaffIpad()">وضع الآيباد</button>${openLive?`<button class="btn btn-primary" onclick="dttResume()">عندك جلسة مفتوحة · كمّلي</button>`:""}</div></div>${dttTimeline(person,true)}</section>`;
    }
    function liveSessionView(){
      const person=lsPerson();const back=backBtn("closeStaffSection()",state.sipadMode?"رجوع لجدول اليوم":"العودة لمساحتي");const L=dttLive();
      if(!L||L.staffId!==person.id){
        return back+head("مساحتي / الجلسات","جلساتي","افتحي الجلسة من الجدول. كل ضغطة تتسجل فورًا، ولما تقفلي الجلسة النتيجة تتضاف لملف الطفل.","")
          +`<section class="card">${dttTimeline(person)}</section>`;
      }
      const pt=state.patients.find(x=>x.id===L.patientId);const cs=pt&&typeof consentStatus==="function"?consentStatus(pt,"recording"):null;
      const armed=L.panicArm&&Date.now()-L.panicArm<4000;
      const n=L.targets.length;const t=L.targets[L.cur]||L.targets[0];
      const allDone=L.targets.every(x=>x.trials.length>=DTT_BLOCK);
      let h=`<div class="dt-head card"><div class="dt-head-main"><div class="dt-kicker">جلسة الطفل</div><h2>${esc(L.patient)}</h2><div class="dt-meta"><span>${esc(L.service)}</span><span>${esc(L.room)}</span><span>${n} أهداف</span><span class="dt-timer" id="dt-timer">${dttClock(L)}</span></div>
          ${cs?`<div class="dt-consent ${cs.st==="active"?"ok":""}">${cs.st==="active"?"تسجيل عينة كلام: مسموح بموافقة ولي الأمر":"تسجيل عينة كلام: مو مسموح، ما فيه موافقة سارية"}</div>`:""}</div>
        ${L.locked?`<span class="pill pill-good">مقفولة</span>`:`<button class="dt-panic ${armed?"arm":""}" onclick="livePanic()">${armed?"اضغطي ثاني للتأكيد":"طلب مساعدة"}</button>`}</div>`;
      h+=`<div class="dt-targets" role="tablist">${L.targets.map((x,i)=>{const p=dttPct(x.trials);const st=x.trials.length>=DTT_BLOCK?"done":i===L.cur&&!L.locked?"active":"";
        return `<button class="dt-target ${st}" onclick="liveSelectGoal(${i})" role="tab" aria-selected="${i===L.cur}"><span class="dt-tn">الهدف ${i+1}</span><b>${esc(x.text)}</b><span class="dt-td">${esc(x.domain)}</span><span class="dt-ts">${x.trials.length>=DTT_BLOCK?`تم ✓ · ${p}%`:x.trials.length?`جاري · ${x.trials.length}/${DTT_BLOCK}`:"لم يبدأ"}</span></button>`}).join("")}</div>`;
      if(L.locked){
        h+=`<section class="card dt-complete"><div class="dt-done-mark">✓</div><h2>الجلسة انقفلت</h2><p class="muted">النتايج انضافت لسجل أداء الجلسات في ملف ${esc(L.patient)}.</p>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>الهدف</th><th>I</th><th>C</th><th>P</th><th>NR</th><th>النسبة</th><th>النتيجة</th></tr></thead><tbody>${L.targets.map(x=>{const p=dttPct(x.trials);return `<tr><td><b>${esc(x.text)}</b><br><small class="muted">${esc(x.domain)}</small></td><td>${dttCount(x.trials,"I")}</td><td>${dttCount(x.trials,"C")}</td><td>${dttCount(x.trials,"P")}</td><td>${dttCount(x.trials,"NR")}</td><td><b>${p==null?"—":p+"%"}</b></td><td>${p==null?"—":genResultPill(dttResult(p))}</td></tr>`}).join("")}</tbody></table></div>
          ${L.note?`<div class="notice" style="margin-top:12px;white-space:pre-wrap">${esc(L.note)}</div>`:""}
          <div class="dt-actions">${L.patientId?`<button class="btn btn-outline" onclick="liveOpenPatient()">افتحي ملف الطفل</button>`:""}<button class="btn btn-primary" onclick="liveCloseSession()">رجوع للجدول</button></div></section>`;
        return `<div class="ls-live dt">`+back+h+`</div>`;
      }
      const tr=t.trials;const p=dttPct(tr);const full=tr.length>=DTT_BLOCK;
      h+=`<section class="card dt-card"><div class="dt-top"><b>الهدف ${L.cur+1} من ${n}</b><b>${full?"البلوك خلص":`المحاولة ${tr.length+1} من ${DTT_BLOCK}`}</b></div>
        <div class="dt-progress"><i style="width:${Math.min(tr.length,DTT_BLOCK)/DTT_BLOCK*100}%"></i></div>
        <div class="dt-current"><small>${esc(t.domain)}</small><h2>${esc(t.text)}</h2></div>
        <div class="dt-resp ${t.allowNR?"":"no-nr"}">${DTT_CODES.filter(c=>c.k!=="NR"||t.allowNR).map((c,i)=>`<button class="dt-btn ${c.c}" onclick="liveTrial('${c.k}')" ${full?"disabled":""} aria-label="${c.k} — ${c.d}"><span class="dt-code">${c.k}</span><small>${c.d}</small><kbd>${i+1}</kbd></button>`).join("")}</div>
        <div class="dt-foot"><div class="dt-dots">${Array.from({length:DTT_BLOCK},(_,i)=>{const x=tr[i];return x?`<span class="dt-dot ${DTT_CODES.find(c=>c.k===x.r).c}" title="محاولة ${i+1}: ${x.r}">${x.r}</span>`:`<span class="dt-dot empty">${i+1}</span>`}).join("")}</div>
          <div class="dt-score"><b>${p==null?"—":p+"%"}</b><small>I من المحاولات</small>${tr.length?`<button class="back-link" onclick="liveUndo()">تراجع عن آخر محاولة</button>`:""}</div></div>
        ${allDone?`<div class="dt-alldone">خلصت كل الأهداف. راجعي الملاحظة واقفلي الجلسة.</div>`:""}</section>`;
      h+=`<details class="card dt-add"><summary>إضافة هدف للجلسة</summary><form onsubmit="liveAddGoal(event)" class="dt-add-form"><input class="input" name="g" placeholder="الهدف، مثال: أن يسمي بطة" required maxlength="120"><input class="input" name="d" placeholder="المجال، مثال: اللغة التعبيرية" maxlength="60"><label class="dt-chk"><input type="checkbox" name="nr" checked> مسموح NR</label><button class="btn btn-outline" type="submit">إضافة</button></form></details>`;
      h+=`<section class="card dt-note"><div class="card-head"><h2>ملاحظة الجلسة</h2><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-outline" onclick="liveSoap()">قالب SOAP</button><button class="btn btn-outline dt-dict" onclick="liveDictate()">إملاء صوتي</button></div></div>
        <textarea class="input" id="ls-note" rows="4" oninput="liveNoteInput(this.value)" placeholder="اكتبي أو أملي ملاحظة قصيرة">${esc(L.note||"")}</textarea></section>`;
      h+=`<div class="dt-end-row"><button class="btn btn-primary dt-end ${allDone?"pulse":""}" onclick="liveEndSession()">إنهاء وقفل الجلسة</button><span class="muted">النتيجة بتتضاف لملف ${esc(L.patient)}.</span></div>`;
      return `<div class="ls-live dt">`+back+h+`</div>`;
    }
    function dttClock(L){const s=Math.max(0,Math.floor(((L.endedAt||Date.now())-L.startedAt)/1000));return pad2(Math.floor(s/60))+":"+pad2(s%60)}
    setInterval(()=>{const el=document.getElementById("dt-timer");const L=dttLive();if(el&&L)el.textContent=dttClock(L)},1000);
    let _wake=null;
    async function dttWake(on){try{if(on&&"wakeLock" in navigator&&!_wake){_wake=await navigator.wakeLock.request("screen");_wake.addEventListener("release",()=>{_wake=null})}if(!on&&_wake){await _wake.release();_wake=null}}catch(_e){_wake=null}}
    document.addEventListener("visibilitychange",()=>{const L=dttLive();if(document.visibilityState==="visible"&&L&&!L.locked&&state.staffSection==="session")dttWake(true)});
    function dttBuzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(_e){}}
    function startLiveSession(aptId){
      const a=state.appointments.find(x=>x.id===aptId);if(!a)return;
      const person=lsPerson();const pt=state.patients.find(p=>p.name===a.patient);
      const targets=dttTargetsFor(pt,a);
      if(!targets.length)targets.push({text:"هدف الجلسة",domain:dttDomainOf(pt,a),allowNR:true,trials:[]});
      state.liveSession={aptId,staffId:person.id,patient:a.patient,patientId:pt?pt.id:null,service:a.service,room:a.room,startedAt:Date.now(),targets,cur:0,note:"",locked:false};
      state.staffSection="session";
      audit("بدء جلسة",a.patient);persist();render();window.scrollTo(0,0);dttWake(true);
    }
    function liveSelectGoal(i){const L=dttLive();if(!L)return;L.cur=i;persist();render()}
    function liveAddGoal(e){e.preventDefault();const f=new FormData(e.target);const t=(f.get("g")||"").trim();if(!t)return;const L=dttLive();
      L.targets.push({text:t,domain:(f.get("d")||"").trim()||dttDomainOf(state.patients.find(x=>x.id===L.patientId),null),allowNR:!!f.get("nr"),trials:[]});L.cur=L.targets.length-1;persist();render()}
    let _dttAdvance=null;
    function liveTrial(k){
      const L=dttLive();if(!L||L.locked)return;const t=L.targets[L.cur];if(!t||t.trials.length>=DTT_BLOCK)return;
      if(k==="NR"&&!t.allowNR)return;
      t.trials.push({r:k,at:Date.now()});dttBuzz(k==="I"?12:k==="NR"?[8,40,8]:18);
      persist();render();
      if(t.trials.length===DTT_BLOCK){
        const p=dttPct(t.trials);notify(`خلص الهدف · ${p}% مستقل`);
        clearTimeout(_dttAdvance);
        _dttAdvance=setTimeout(()=>{const L2=dttLive();if(!L2||L2.locked)return;const nx=L2.targets.findIndex(x=>x.trials.length<DTT_BLOCK);if(nx>=0&&L2.targets[L2.cur].trials.length>=DTT_BLOCK){L2.cur=nx;persist();render()}},450);
      }
    }
    function liveUndo(){const L=dttLive();if(!L)return;const t=L.targets[L.cur];if(t&&t.trials.length){t.trials.pop();dttBuzz(6);persist();render()}}
    function liveNoteInput(v){const L=dttLive();if(L){L.note=v;persist()}}
    function liveSoap(){const L=dttLive();L.note=(L.note?L.note+"\n":"")+"S (ملاحظة ذاتية): \nO (ملاحظة موضوعية): \nA (تقييم): \nP (الخطة): ";persist();render()}
    function liveDictate(){
      const R=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!R){notify("الإملاء الصوتي مو مدعوم في المتصفح هذا — جربي Chrome أو Safari");return}
      try{const r=new R();r.lang="ar-SA";r.interimResults=false;r.onresult=ev=>{const L=dttLive();if(!L)return;L.note=(L.note?L.note+" ":"")+ev.results[0][0].transcript;persist();render()};r.onerror=()=>notify("ما قدرت أوصل للميكروفون");r.start();notify("تكلمي الحين...")}catch(err){notify("ما قدرت أشغّل الإملاء")}
    }
    function livePanic(){
      const L=dttLive();const person=lsPerson();if(!L)return;
      if(L.panicArm&&Date.now()-L.panicArm<4000){
        L.panicArm=0;
        const sups=state.staff.filter(s=>s.roleCategory==="supervisor"&&(!person.department||s.department===person.department));
        const to=(sups.length?sups:state.staff.filter(s=>s.roleCategory==="supervisor"||s.roleCategory==="management")).slice(0,2);
        to.forEach(s=>state.messages.unshift({id:"msg-"+Date.now()+"-"+s.id,fromId:person.id,fromName:person.name,toId:s.id,toName:s.name,text:`🔴 طلب مساعدة عاجل — ${L.room} · جلسة ${L.patient}`,date:todayISO(),read:false}));
        audit("طلب مساعدة عاجل",L.patient);dttBuzz([30,60,30]);
        persist();notify(to.length?"انرسل طلب المساعدة لـ "+to.map(s=>s.name).join(" و "):"ما فيه مشرف مسجل لإرسال الطلب");render();
      }else{L.panicArm=Date.now();render();setTimeout(()=>{const L2=dttLive();if(L2&&L2.panicArm)render()},4100)}
    }
    function liveEndSession(){
      const L=dttLive();const person=lsPerson();if(!L||L.locked)return;
      const d=localDateOf(new Date());
      L.targets.forEach((t,i)=>{const p=dttPct(t.trials);if(p==null||!L.patientId)return;
        state.sessionLogs.unshift({id:"sl-"+Date.now()+"-"+i,patientId:L.patientId,date:d,goalText:t.text,result:dttResult(p),notes:`${p}% صحيح مستقل في ${t.trials.length} محاولات (I ${dttCount(t.trials,"I")} · C ${dttCount(t.trials,"C")} · P ${dttCount(t.trials,"P")} · NR ${dttCount(t.trials,"NR")}).${L.note?" "+L.note:""}`,staffId:person.id,staffName:person.name,source:"dtt"})});
      const a=state.appointments.find(x=>x.id===L.aptId);if(a){a.status="مكتمل";a.newForStaff=false}
      L.locked=true;L.endedAt=Date.now();audit("قفل جلسة",L.patient);dttWake(false);dttBuzz(20);
      persist();notify("الجلسة انقفلت والنتيجة انضافت لملف الطفل");render();window.scrollTo(0,0);
    }
    function liveCloseSession(){state.liveSession=null;dttWake(false);persist();render()}
    function liveOpenPatient(){if(state.sipadMode){liveCloseSession();return}const L=dttLive();const id=L&&L.patientId;state.liveSession=null;state.staffSection=null;persist();if(id)openPatient(id);else render()}
    // اختصارات لوحة المفاتيح لآيباد بكيبورد: 1-4 للأكواد، Backspace للتراجع
    document.addEventListener("keydown",e=>{
      const L=dttLive();if(!L||L.locked||state.role!=="staff"||state.staffSection!=="session")return;
      const tag=(e.target&&e.target.tagName)||"";if(/INPUT|TEXTAREA|SELECT/.test(tag))return;
      const t=L.targets[L.cur];if(!t)return;const codes=DTT_CODES.filter(c=>c.k!=="NR"||t.allowNR);
      const n=parseInt(e.key,10);if(n>=1&&n<=codes.length){e.preventDefault();liveTrial(codes[n-1].k)}
      else if(e.key==="Backspace"){e.preventDefault();liveUndo()}
    });
    function toggleStaffTask(id){const x=state.dailyTasks.find(t=>t.id===id);if(!x)return;x.done=!x.done;persist();render()}
    function supervisorDashboard(){
      const person=getCurrentPerson();
      const dept=(person&&person.roleCategory==="supervisor")?person.department:null;
      const deptInfo=dept?state.departments.find(d=>d.id===dept):null;
      const team=dept?state.staff.filter(s=>s.department===dept&&s.roleCategory==="staff"):state.staff.filter(s=>s.roleCategory==="staff");
      const teamNames=team.map(s=>s.name);
      const deptAppts=state.appointments.filter(a=>teamNames.includes(a.clinician));
      const completed=deptAppts.filter(a=>a.status==="مكتمل").length;
      const pendingPlans=state.plans.filter(p=>(!dept||p.department===dept)&&p.status==="معلقة");
      const reviewedPlans=state.plans.filter(p=>(!dept||p.department===dept)&&p.status!=="معلقة");
      const needsReview=state.referrals.filter(r=>r.status==="جديدة"||r.status==="قيد الفرز").length;
      const pendingConsults=state.consultationReviews.filter(c=>(!dept||c.department===dept)&&c.status==="بانتظار المراجعة");
      const recipients=[...team.filter(s=>!person||s.id!==person.id),...state.staff.filter(s=>s.roleCategory==="management"),...state.staff.filter(s=>s.roleCategory==="reception")];
      const myMessages=person?state.messages.filter(m=>m.toId===person.id||m.fromId===person.id).slice(0,12):[];
      const unreadCount=person?state.messages.filter(m=>m.toId===person.id&&!m.read).length:0;
      const scopeTitle=deptInfo?("مركز إشراف "+deptInfo.name):"مركز الإشراف العام";
      const scopeDesc=deptInfo?`مشرف/ة ${deptInfo.name} — تتابعين ${team.length} أخصائي/ة.`:`إشراف عام على ${team.length} أخصائي/ة عبر كل الأقسام.`;
      const messagingForm=person?`<form onsubmit="sendInternalMessage(event)" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px"><div class="field" style="min-width:180px;margin:0"><label>إلى</label><select class="select" name="to">${recipients.map(r=>`<option value="${r.id}">${esc(r.name)} — ${esc((roles[r.roleCategory]&&roles[r.roleCategory].label)||"")}</option>`).join("")}</select></div><div class="field" style="flex:1;min-width:200px;margin:0"><label>الرسالة</label><input class="input" name="text" id="msg-text-input" required placeholder="اكتبي توجيهك هنا"></div><button class="btn btn-primary" type="submit">إرسال</button></form>`:`<div class="notice" style="margin-bottom:14px">سجّلي الدخول بكودك الشخصي من صفحة اختيار الدور لإرسال واستقبال الرسائل.</div>`;
      return head(person?("أهلاً "+person.name):"مركز الإشراف",scopeTitle,scopeDesc,"")
      +liveOpsStrip()+smartIntakeBanner()+`<section class="metric-grid">${metric("check","جلسات مكتملة",completed,`من أصل ${deptAppts.length} موعد`)}${metric("book","خطط بانتظار الاعتماد",pendingPlans.length,"تحتاج مراجعتك","gold")}${metric("referrals","إحالات عامة تنتظر الفرز",needsReview,"على مستوى المركز")}${metric("team","أخصائيو القسم",team.length,"في فريقك")}</section>`
      +`<section class="card" style="margin-top:18px"><div class="card-head"><h2>استشارات مبدئية بانتظار اعتماد الجدول الثابت</h2><span class="muted">${pendingConsults.length} بانتظار المراجعة</span></div><div class="list">${pendingConsults.length?pendingConsults.map(c=>`<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>${esc(c.patientName)}</strong><small>مع ${esc(c.specialistName)} · ${date(c.date)} ${time(c.time)} · ولي الأمر: ${esc(c.guardian||"—")}</small></div><div class="list-end" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn btn-outline" style="color:var(--teal)" onclick="reviewConsultation('${c.id}','approve')">اعتماد الجدول الثابت</button><button class="btn btn-outline" style="color:var(--danger)" onclick="reviewConsultation('${c.id}','reject')">رفض مع ملاحظة</button></div></div>`).join(""):`<div class="empty">لا توجد استشارات بانتظار المراجعة حالياً.</div>`}</div></section>`
      +`<section class="card" style="margin-top:18px"><div class="card-head"><h2>اعتماد الخطط العلاجية</h2><span class="muted">${pendingPlans.length} بانتظار الاعتماد</span></div><div class="list">${pendingPlans.length?pendingPlans.map(p=>{const s=personById(p.staffId);return `<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>${esc(p.title)}</strong><small>${esc(p.patient)} · ${s?esc(s.name):""} · ${date(p.date)}</small></div><div class="list-end" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn btn-outline" style="color:var(--teal)" onclick="reviewPlan('${p.id}','approve')">اعتماد</button><button class="btn btn-outline" style="color:var(--danger)" onclick="reviewPlan('${p.id}','return')">إرجاع مع ملاحظة</button></div></div>`}).join(""):`<div class="empty">لا توجد خطط بانتظار الاعتماد حالياً.</div>`}</div>${reviewedPlans.length?`<div class="card-head" style="margin-top:16px"><h2>خطط تمت مراجعتها</h2></div><div class="list">${reviewedPlans.map(p=>`<div class="list-row"><div class="list-main"><strong>${esc(p.title)}</strong><small>${esc(p.patient)}${p.note?" · "+esc(p.note):""}</small></div><div class="list-end">${pill(p.status)}</div></div>`).join("")}</div>`:""}</section>`
      +`<section class="card" style="margin-top:18px"><div class="card-head"><h2>تقييم أداء الأخصائيين</h2><span class="muted">${state.qualityAudits.filter(a=>!dept||a.department===dept).length} تقييم مسجّل</span></div><div class="list">${team.length?team.map(s=>{const audits=state.qualityAudits.filter(a=>a.staffId===s.id);const last=audits[0];return `<div class="list-row"><div class="list-main"><strong>${esc(s.name)}</strong><small>${last?`آخر تقييم: ${last.score}/5 — ${date(last.date)}`:"لا يوجد تقييم بعد"}</small></div><div class="list-end"><button class="btn btn-outline" onclick="openModal('qualityAudit','${s.id}')">تقييم الأداء</button></div></div>`}).join(""):`<div class="empty">لا يوجد أخصائيون في هذا القسم بعد.</div>`}</div></section>`
      +`<section class="card" style="margin-top:18px"><div class="card-head"><h2>${unreadCount>0?"🔴 ":""}مركز المراسلات الداخلي</h2><div style="display:flex;align-items:center;gap:8px"><span class="muted">${unreadCount>0?unreadCount+" رسالة غير مقروءة":"كل الرسائل مقروءة"}</span><button class="btn btn-outline" style="padding:5px 10px;font-size:10.5px" onclick="setView('communicationHub')">${ic("commHub",12)} أوان تواصل الكامل</button></div></div>${messagingForm}<div class="list">${myMessages.length?myMessages.map(m=>`<div class="list-row" style="align-items:flex-start"><div class="list-main"><strong>${m.fromId===person.id?"↩️ إلى "+esc(m.toName):"📩 من "+esc(m.fromName)}${(!m.read&&m.toId===person.id)?` <span class="pill pill-red" style="margin-inline-start:6px">جديدة</span>`:""}</strong><small>${esc(m.text)}</small></div><div class="list-end">${date(m.date)}${(!m.read&&m.toId===person.id)?`<button class="btn btn-outline" style="margin-top:6px;padding:5px 9px;font-size:10px" onclick="markMessageRead('${m.id}')">تحديد كمقروءة</button>`:""}</div></div>`).join(""):`<div class="empty">لا توجد رسائل بعد.</div>`}</div></section>`;
    }
    function reviewPlan(id,decision){
      const p=state.plans.find(x=>x.id===id); if(!p)return;
      if(decision==="approve"){p.status="معتمدة";p.note="";persist();notify("تم اعتماد الخطة");render();return}
      openModal('returnPlan',id);
    }
    function confirmReturnPlan(e,id){
      e.preventDefault();
      const f=formData(e);
      const p=state.plans.find(x=>x.id===id); if(!p)return;
      p.status="معادة للتعديل";p.note=f.note||"";persist();closeModal();notify("تم إرجاع الخطة مع الملاحظات");render();
    }
    function submitQualityAudit(e,staffId){
      e.preventDefault();
      const f=formData(e);
      const person=getCurrentPerson();
      const s=personById(staffId);
      state.qualityAudits.unshift({id:"qa-"+Date.now(),staffId,department:s?s.department:null,date:todayISO(),score:Number(f.score),notes:f.notes,supervisorId:person?person.id:null});
      persist();closeModal();notify("تم حفظ تقييم الأداء");render();
    }
    function sendInternalMessage(e){
      e.preventDefault();
      const f=formData(e);
      const person=getCurrentPerson();
      if(!person){notify("سجّلي الدخول بكودك الشخصي أولاً لإرسال رسالة");return}
      const toPerson=personById(f.to);
      if(!toPerson){notify("اختاري جهة صحيحة");return}
      state.messages.unshift({id:"msg-"+Date.now(),fromId:person.id,fromName:person.name,toId:f.to,toName:toPerson.name,text:f.text,date:todayISO(),read:false});
      persist();notify("تم إرسال الرسالة");render();
    }
    function markMessageRead(id){const m=state.messages.find(x=>x.id===id);if(m){m.read=true;persist();render()}}
    function toggleStaffPresence(i){
      const s=state.staff[i]; if(!s)return;
      s.present=!s.present;
      persist();notify(s.present?`تم تسجيل حضور ${s.name}`:`تم تسجيل انصراف/غياب ${s.name}`);render();
    }
    function attendanceView(){
      const present=state.staff.filter(s=>s.present).length;
      return head("الحضور / 07","الحضور والغياب","سجّلي حضور الفريق أو حدّثي حالته في أي وقت.","")+`<section class="card"><div class="card-head"><h2>حالة الحضور اليوم</h2><span class="muted">${present} من ${state.staff.length} حاضر</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>الدور المهني</th><th>القسم</th><th>الحالة</th><th></th></tr></thead><tbody>${state.staff.map((s,i)=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td>${esc(departmentLabel(s.department))}</td><td>${s.present?pill("حاضر"):pill("غير حاضر")}</td><td><button class="btn ${s.present?"btn-outline":"btn-primary"}" onclick="toggleStaffPresence(${i})">${s.present?"تسجيل انصراف":"تسجيل حضور"}</button></td></tr>`).join("")}</tbody></table></div></section>`;
    }
    function reportsView(){
      const totalAppts=state.appointments.length;
      const completed=state.appointments.filter(a=>a.status==="مكتمل").length;
      const scheduled=state.appointments.filter(a=>a.status==="مجدول").length;
      const byClinician={};
      state.appointments.forEach(a=>{byClinician[a.clinician]=(byClinician[a.clinician]||0)+1});
      const byDept={};
      state.staff.forEach(s=>{if(s.department){const n=state.appointments.filter(a=>a.clinician===s.name).length;byDept[s.department]=(byDept[s.department]||0)+n}});
      const activePatients=state.patients.filter(p=>!p.archived).length;
      const pendingReferrals=state.referrals.filter(r=>r.status==="جديدة"||r.status==="قيد الفرز").length;
      const deptPalette=["var(--teal)","var(--gold)","var(--sage)","var(--purple)","var(--navy-2)","#E4A6C5","#7FB3D5","#C9A66B"];
      const deptChartData=Object.entries(byDept).map(([dept,n],i)=>({label:departmentLabel(dept),value:n,color:deptPalette[i%deptPalette.length]}));
      return head("التقارير / 08","تقارير الأداء العامة","نظرة عامة سريعة على أداء المركز — للاطّلاع، بدون الشي لتصدير خارجي.","")
      +`<section class="metric-grid">${metric("schedule","إجمالي المواعيد",totalAppts,"كل المواعيد المسجلة")}${metric("check","جلسات مكتملة",completed,scheduled+" مجدولة")}${metric("referrals","إحالات بانتظار المراجعة",pendingReferrals,"تحتاج إجراء","gold")}${metric("patients","ملفات نشطة",activePatients,"من إجمالي "+state.patients.length)}</section>`
      +(deptChartData.length?`<section class="card"><div class="card-head"><h2>توزيع المواعيد على الأقسام</h2><span class="muted">رسم بياني تفاعلي</span></div><div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap"><div>${svgDonutChart(deptChartData)}</div><div style="flex:1;min-width:180px">${chartLegend(deptChartData)}</div></div></section>`:"")
      +`<div class="grid-2" style="margin-top:18px"><section class="card"><div class="card-head"><h2>المواعيد حسب المعالج</h2></div><div class="list">${Object.keys(byClinician).length?Object.entries(byClinician).sort((a,b)=>b[1]-a[1]).map(([name,n])=>`<div class="list-row"><div class="list-main"><strong>${esc(name)}</strong></div><div class="list-end"><b>${n}</b></div></div>`).join(""):`<div class="empty">لا توجد بيانات كافية.</div>`}</div></section><section class="card"><div class="card-head"><h2>المواعيد حسب القسم</h2></div><div class="list">${Object.keys(byDept).length?Object.entries(byDept).map(([dept,n])=>`<div class="list-row"><div class="list-main"><strong>${esc(departmentLabel(dept))}</strong></div><div class="list-end"><b>${n}</b></div></div>`).join(""):`<div class="empty">لا توجد بيانات كافية.</div>`}</div></section></div>`;
    }
