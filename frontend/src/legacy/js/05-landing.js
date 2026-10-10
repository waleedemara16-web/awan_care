"use strict";
// أوان — الجزء 5 من 16: 05-landing
// كل ملفات js/ دي بتشتغل كأنها ملف واحد بالترتيب — ما تغيّرش ترتيبها في index.html
    // ===================== AWAN — Landing v2 (واجهة عالمية تفاعلية) =====================
    const LX={
      ar:{
        nav:["المميزات","عقل أوان","كيف تبدأ","الخصوصية"], login:"تسجيل الدخول", demo:"جرّب لوحة الإدارة",
        pillNew:"جديد", pill:"عقل أوان: إدارة مركزك بالذكاء الاصطناعي",
        h1a:"لكل طفل وقته،", h1b:"ولكل طفل", h1em:"طريقه.",
        rotPre:"منصة وحدة تدير", rot:["مراكز التأهيل","عيادات التخاطب","مراكز التوحد وABA","أقسام المستشفيات","المدارس الدامجة"],
        lede:"أوان تعطي إدارة المركز صورة كاملة ولحظية: من أول اتصال من الأسرة، لين الجلسة والتقرير والفاتورة — وكل خطوة موثّقة وتوصلك على طول.",
        cta1:"جرّب لوحة الإدارة", cta2:"تسجيل الدخول",
        checks:["عربي وإنجليزي","يشتغل على الجوال والآيباد","صلاحيات تتحكم فيها الإدارة"],
        mockUrl:"أوان · مركز القيادة", mockHi:"صباح الخير، د. فيصل", mockSub:"12 جلسة اليوم · 3 قرارات تنتظرك", mockTag:"مباشر",
        kpis:[["جلسات اليوم","12"],["حضور الفريق","86%"],["أهداف متحققة","78%"]],
        rows:[["علي ناصر","نطق ولغة · 09:00"],["سعود ماجد","علاج طبيعي · 10:30"],["فهد تركي","علاج وظيفي · 11:15"]],
        f1:["مطالبة تأمين جاهزة","تدقّقت قبل الإرسال ✓"], f2:["تنبيه تعميم","أداء البيت أقل من المركز"], f3:["مكالمة جديدة","انحجز تقييم أولي تلقائيًا"],
        marq:["عقل أوان","الإدارة الآلية","المراقبة الحية","الاستقبال الذكي","الاستقبال الصوتي","رحلة الطفل","الكاتب الذكي","محرك تعميم المهارات","مطالبات التأمين","الفوترة والباقات","أوان كونكت","سجل التدقيق","الترخيص البلدي","دعم الدولة"],
        stats:[[9,"محاور تشغيل","من الاستقبال لين الحوكمة"],[24,"ساعة رد على المكالمات","استقبال صوتي ذكي على رقم المركز"],[3,"صيغ تقرير بنقرة","للأسرة والمدرسة والتأمين"],[100,"٪ بدون ورق","من باب المركز لين الجلسة"]],
        fEy:"كل اللي يحتاجه مركزك", fH:"منصة وحدة بدال <em>عشر أدوات</em> متفرقة", fSub:"من أول مكالمة مع الأسرة لين آخر فاتورة — كل خطوة موثّقة ومربوطة باللي قبلها واللي بعدها.",
        gapC:"المركز", gapH:"البيت",
        feats:[
          {ic:"pulse",cls:"w2 dark",badge:"حصري في أوان",t:"محرك تعميم المهارات",d:"يقارن أداء الطفل في جلسات المركز باللي تسجّله الأسرة في البيت لنفس الهدف، وينبّه الأخصائي على طول إذا فيه فجوة — عشان المهارة تثبت فعلًا برّا المركز.",gap:true},
          {ic:"target",t:"رحلة الطفل",d:"كل طفل على مسار واحد من الاستقبال لين تقرير الثلاث شهور، وكل خطوة تنقفل تنقله للي بعدها تلقائيًا."},
          {ic:"schedule",t:"جدولة بدون تعارض",d:"اسحب الجلسة لوقت أو أخصائي ثاني، والنظام يكشف أي تعارض، والتعديل يوصل لآيباد الأخصائي في نفس اللحظة."},
          {ic:"book",t:"الكاتب الذكي",d:"الأخصائي يسجّل الجلسة صوت بموافقة الأسرة أو يكتب سطرين، والكاتب يطلّع ملاحظة SOAP كاملة — وما ينحفظ شي بدون توقيعه."},
          {ic:"idcard",cls:"w2",t:"مطالبات التأمين",d:"كل جلسة مكتملة لطفل مؤمَّن تتحول لمطالبة، وتتدقّق ضد أسباب الرفض قبل ما تطلع. الناقص يوصل للمسؤول عنه، والنظام يتعلّم من كل رفض — رفض أقل وتحصيل أسرع."},
          {ic:"chart",t:"تقرير تقدم بنقرة",d:"ملاحظات الجلسة نفسها تطلع بثلاث صيغ: مبسّطة للأسرة، رسمية للمدرسة، وسريرية للتأمين."},
          {ic:"video",t:"أوان كونكت",d:"اجتماعات بين الأقسام ومع الأسر، ومحضر ينكتب تلقائيًا، ولوحة قرارات تتابع التنفيذ."},
          {ic:"invoice",t:"الفوترة والباقات",d:"فواتير بضريبة القيمة المضافة، ودفعات جزئية، وباقات جلسات، وذمم مستحقة واضحة."},
          {ic:"shield",t:"الحوكمة والامتثال",d:"سجل تدقيق ثابت، ومتابعة الترخيص البلدي، وخطوات التوافق مع برامج دعم الدولة — في مكان واحد."},
          {ic:"team",t:"الفريق والحضور",d:"كود دخول شخصي لكل موظف، وكشك حضور، وجلسات إشرافية لمتابعة أداء الأخصائيين."}
        ],
        aEy:"عقل أوان", aH:"إدارة ذكية <em>تشتغل معك</em> طول اليوم", aSub:"وكلاء أذكياء يتابعون المركز لحظة بلحظة، يجهّزون الإجراءات، ويرفعون لك بس القرارات اللي تحتاجك.",
        ai:[
          {ic:"idea",t:"مركز القيادة",d:"كل اللي يحتاج قرارك في شاشة وحدة.",items:["ملخص يومي تلقائي من بيانات المركز","قرارات معلّقة مرتبة حسب الأولوية","تنبيه على الملفات الناقصة والموافقات"]},
          {ic:"settings",t:"الإدارة الآلية",d:"وكلاء ينجزون الشغل الروتيني عنك.",items:["تحليل دراسة الحالة وحجز التقييم الأولي","إشعار المشرف والأخصائي في وقتها","تقرير يومي جاهز للمدير"]},
          {ic:"pulse",t:"المراقبة الحية",d:"شوف مركزك كامل لحظة بلحظة.",items:["كل آيبادات الفريق على شاشة وحدة","الوصول والخروج من الباب لين الجلسة","تنبيهات فورية إذا صار شي يحتاج تدخل"]},
          {ic:"chat",t:"الاستقبال الذكي والصوتي",d:"ولا مكالمة ولا إحالة تضيع.",items:["رد آلي على مكالمات المركز في أي وقت","دراسة الحالة تنعبّى من الجوال أو الآيباد","فتح الملف وحجز التقييم تلقائيًا"]}
        ],
        aBtn:"جرّب لوحة الإدارة",
        hEy:"كيف تبدأ", hH:"مركزك على أوان في <em>ثلاث خطوات</em>",
        steps:[["سجّل مركزك","اسم المركز وشعاره — ويطلع جنب شعار أوان في كل شاشة."],["أضف أقسامك وفريقك","كل موظف ياخذ كود دخول شخصي، والإدارة تحدد صلاحياته."],["شغّل مركزك وتابع من لوحتك","الجلسات تتوثّق لحظتها، والتقارير والمطالبات تجهز تلقائيًا، وأنت تتابع كل شي من مكان واحد."]],
        tEy:"الخصوصية أولًا", tH:"بيانات الأطفال <em>أمانة</em>", tSub:"أوان مصممة بحيث ما تطلع أي معلومة إلا للي له حق يشوفها.",
        trust:[["صلاحيات تحددها الإدارة","أنت تحدد بالضبط وش يشوف الإشراف والاستقبال والأخصائي."],["سجل تدقيق ثابت","كل فتح أو تعديل لملف ينسجّل باسم الشخص والوقت، وما أحد يقدر يعدّله أو يمسحه."],["مشاركة بموافقة","الملف الصحي ما يطلع لأي جهة خارجية إلا بتفعيل صريح."],["موافقات موثّقة","موافقة ولي الأمر على العلاج والتواصل تنحفظ داخل الملف."]],
        finH:"جاهز تشوف أوان شغّالة في مركزك؟", finSub:"جرّب لوحة الإدارة الحين بالبيانات النموذجية — بدون تسجيل.",
        foot:"منصة تشغيل مراكز الرعاية والتأهيل", rights:"© 2026 أوان. جميع الحقوق محفوظة."
      },
      en:{
        nav:["Features","AWAN Brain","Get started","Privacy"], login:"Log in", demo:"Try the admin dashboard",
        pillNew:"New", pill:"AWAN Brain: AI-powered center management",
        h1a:"Every child has their time,", h1b:"and their own", h1em:"path.",
        rotPre:"One platform to run", rot:["rehab centers","speech clinics","autism & ABA centers","hospital departments","inclusive schools"],
        lede:"AWAN gives center management a complete, real-time picture: from a family's first call, to the session, the report and the invoice — every step documented and in front of you instantly.",
        cta1:"Try the admin dashboard", cta2:"Log in",
        checks:["Arabic & English","Works on phone and iPad","Permissions controlled by management"],
        mockUrl:"AWAN · Command center", mockHi:"Good morning, Dr. Faisal", mockSub:"12 sessions today · 3 decisions waiting", mockTag:"Live",
        kpis:[["Sessions today","12"],["Team present","86%"],["Goals met","78%"]],
        rows:[["Ali Nasser","Speech · 09:00"],["Saud Majed","Physio · 10:30"],["Fahad Turki","OT · 11:15"]],
        f1:["Insurance claim ready","Checked before sending ✓"], f2:["Generalization alert","Home lags behind center"], f3:["New call","Initial assessment booked automatically"],
        marq:["AWAN Brain","Autopilot admin","Live operations","Smart intake","Voice reception","Child journey","AI scribe","Generalization engine","Insurance claims","Billing & packages","AWAN Connect","Audit log","Municipal license","Government support"],
        stats:[[9,"Operating hubs","From intake to governance"],[24,"Hour call answering","AI voice reception on the center's number"],[3,"One-click report formats","Family, school and insurance"],[100,"% paperless","From the front door to the session"]],
        fEy:"Everything your center needs", fH:"One platform instead of <em>ten scattered tools</em>", fSub:"From the first call with a family to the last invoice — every step documented and linked to what came before and after.",
        gapC:"Center", gapH:"Home",
        feats:[
          {ic:"pulse",cls:"w2 dark",badge:"Only in AWAN",t:"Skill-generalization engine",d:"Compares a child's performance in center sessions with what the family records at home for the same goal, and alerts the specialist instantly when there's a gap — so skills truly hold outside the center.",gap:true},
          {ic:"target",t:"Child journey",d:"Every child follows one connected path from intake to the 3-month report; closing a step moves them to the next automatically."},
          {ic:"schedule",t:"Conflict-free scheduling",d:"Drag a session to another time or specialist; conflicts are caught and changes reach the specialist's iPad instantly."},
          {ic:"book",t:"AI scribe",d:"Record the session by voice (with family consent) or type two lines, and get a full SOAP note — nothing is saved without the specialist's signature."},
          {ic:"idcard",cls:"w2",t:"Insurance claims",d:"Every completed session for an insured child becomes a claim, checked against rejection reasons before it goes out. Gaps go to whoever owns them, and every rejection teaches the system — fewer rejections, faster collection."},
          {ic:"chart",t:"One-click progress reports",d:"The same session notes become three formats: simple for families, formal for schools, clinical for insurers."},
          {ic:"video",t:"AWAN Connect",d:"Cross-department and family meetings, auto-written minutes, and a decision board that tracks follow-through."},
          {ic:"invoice",t:"Billing & packages",d:"VAT invoices, partial payments, session packages and clear receivables."},
          {ic:"shield",t:"Governance & compliance",d:"A tamper-proof audit log, municipal license tracking, and government-support program readiness — in one place."},
          {ic:"team",t:"Team & attendance",d:"Personal login codes, an attendance kiosk, and supervision sessions to follow specialist performance."}
        ],
        aEy:"AWAN Brain", aH:"Smart management <em>working with you</em> all day", aSub:"AI agents watch the center moment by moment, prepare the actions, and bring you only the decisions that need you.",
        ai:[
          {ic:"idea",t:"Command center",d:"Everything that needs your decision on one screen.",items:["Automatic daily summary from center data","Pending decisions ranked by priority","Alerts on incomplete files and consents"]},
          {ic:"settings",t:"Autopilot admin",d:"Agents that handle routine work for you.",items:["Case-study analysis and first-assessment booking","Timely notifications to supervisors and specialists","A daily report ready for the director"]},
          {ic:"pulse",t:"Live operations",d:"See your whole center moment by moment.",items:["All team iPads on one screen","Arrivals and exits from door to session","Instant alerts when something needs attention"]},
          {ic:"chat",t:"Smart & voice intake",d:"No call or referral slips through.",items:["AI answers the center's calls any time","Case studies filled on phone or iPad","File opened and assessment booked automatically"]}
        ],
        aBtn:"Try the admin dashboard",
        hEy:"Get started", hH:"Your center on AWAN in <em>three steps</em>",
        steps:[["Register your center","Your name and logo — shown next to AWAN's on every screen."],["Add departments and team","Each employee gets a personal login code; management sets their permissions."],["Run your center from your dashboard","Sessions are documented as they happen, reports and claims are prepared automatically, and you follow everything from one place."]],
        tEy:"Privacy first", tH:"Children's data is <em>a trust</em>", tSub:"AWAN is designed so no information reaches anyone who isn't entitled to see it.",
        trust:[["Permissions set by management","You decide exactly what supervisors, front desk and specialists can see."],["Tamper-proof audit log","Every file opened or edited is logged with the person and time, and no one can edit or delete it."],["Consent-based sharing","The health record never reaches an outside party without explicit activation."],["Documented consents","Guardian consent for treatment and communication is stored in the file."]],
        finH:"Ready to see AWAN running in your center?", finSub:"Try the admin dashboard now with sample data — no sign-up needed.",
        foot:"Operations platform for care & rehab centers", rights:"© 2026 AWAN. All rights reserved."
      }
    };
    function lxL(){return LX[state.lang]||LX.ar}
    function landingHome(){
      const L=lxL();
      const chk=ic("check",14,2.6);
      const arrow=`<span class="lx-arrow">${ic("chevronLeft",16,2.4)}</span>`;
      const secIds=["lx-features","lx-ai","lx-how","lx-trust"];
      const nav=`<nav class="lx-nav"><div class="lx-wrap lx-nav-in">
        <button type="button" class="lx-brand" onclick="lxGo('lx-top')"><span class="lx-brand-mark">${mark(30)}</span><span><b>${esc(t("brandName"))}</b><small>${esc(t("brandTag"))}</small></span></button>
        <div class="lx-links">${secIds.map((id,i)=>`<button type="button" onclick="lxGo('${id}')">${esc(L.nav[i])}</button>`).join("")}</div>
        <div class="lx-actions"><button type="button" class="lx-btn lx-btn-ghost lx-btn-sm" onclick="toggleLang()">${ic("globe",14)} ${esc(t("langToggle"))}</button><button type="button" class="lx-btn lx-btn-ghost lx-btn-sm lx-hide-sm" onclick="openModal('entryGate')">${ic("lock",14)} ${esc(L.login)}</button><button type="button" class="lx-btn lx-btn-primary lx-btn-sm" onclick="lxEnter('management')">${esc(L.demo)}</button></div>
      </div></nav>`;
      const mock=`<div class="lx-stage">
        <div class="lx-mock"><div class="lx-mock-bar"><i></i><i></i><i></i><span>${ic("lock",10)} ${esc(L.mockUrl)}</span></div>
          <div class="lx-mock-body"><div class="lx-mock-side"><span class="lg">${mark(24)}</span><b class="on"></b><b></b><b></b><b></b><b></b><b></b></div>
            <div class="lx-mock-main">
              <div class="lx-mock-head"><div><strong>${esc(L.mockHi)}</strong><br><small>${esc(L.mockSub)}</small></div><span class="lx-tag">● ${esc(L.mockTag)}</span></div>
              <div class="lx-kpis">${L.kpis.map(k=>`<div class="lx-kpi"><small>${esc(k[0])}</small><b>${esc(k[1])}</b></div>`).join("")}</div>
              <div class="lx-chart">${[46,68,55,86,62,94,74,82].map((h,i)=>`<i style="--h:${h}%;animation-delay:${.5+i*.07}s"></i>`).join("")}</div>
              <div class="lx-rows">${L.rows.map((r,i)=>`<div class="lx-row"><span class="av ${i%2?"t":""}"></span><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div>`).join("")}</div>
            </div></div></div>
        <div class="lx-float f1" data-depth="-30"><div class="lx-float-in"><span class="ico">${ic("chart",17)}</span><div>${esc(L.f1[0])}<small>${esc(L.f1[1])}</small></div></div></div>
        <div class="lx-float f2" data-depth="38"><div class="lx-float-in"><span class="ico">${ic("pulse",17)}</span><div>${esc(L.f2[0])}<small>${esc(L.f2[1])}</small></div></div></div>
        <div class="lx-float f3" data-depth="-20"><div class="lx-float-in"><span class="ico">${ic("chat",17)}</span><div>${esc(L.f3[0])}<small>${esc(L.f3[1])}</small></div></div></div>
      </div>`;
      const hero=`<header class="lx-hero" id="lx-top"><span class="lx-orb a"></span><span class="lx-orb b"></span><span class="lx-orb c"></span>
        <div class="lx-wrap lx-hero-grid">
          <div class="lx-hero-copy">
            <span class="lx-pill"><i>${esc(L.pillNew)}</i>${esc(L.pill)}</span>
            <h1 class="lx-h1">${esc(L.h1a)}<br>${esc(L.h1b)} <em>${esc(L.h1em)}</em></h1>
            <p class="lx-lede"><span class="lx-lede-top">${esc(L.rotPre)} <span class="lx-rot" id="lx-rot" data-i="0">${esc(L.rot[0])}</span></span>${esc(L.lede)}</p>
            <div class="lx-cta"><button type="button" class="lx-btn lx-btn-primary lx-mag" onclick="lxEnter('management')">${esc(L.cta1)} ${arrow}</button><button type="button" class="lx-btn lx-btn-ghost lx-mag" onclick="openModal('entryGate')">${ic("lock",15)} ${esc(L.cta2)}</button></div>
            <div class="lx-checks">${L.checks.map(c=>`<span>${chk}${esc(c)}</span>`).join("")}</div>
          </div>
          ${mock}
        </div></header>`;
      const marq=`<div class="lx-marq" aria-hidden="true"><div class="lx-marq-track">${[...L.marq,...L.marq].map(m=>`<span>${esc(m)}</span>`).join("")}</div></div>`;
      const stats=`<section class="lx-wrap"><div class="lx-stats lx-rv">${L.stats.map(s=>`<div class="lx-stat"><b data-count="${s[0]}">${s[0]}</b><span>${esc(s[1])}</span><small>${esc(s[2])}</small></div>`).join("")}</div></section>`;
      const gapViz=`<div class="lx-gap"><div><i style="--h:85%;background:linear-gradient(180deg,#5FD3C6,#0E8388)"></i>${esc(L.gapC)} · 85%</div><div><i style="--h:45%;background:linear-gradient(180deg,#F7C77A,#F5795F)"></i>${esc(L.gapH)} · 45%</div></div>`;
      const feats=`<section class="lx-sec" id="lx-features"><div class="lx-wrap"><div class="lx-center lx-rv"><span class="lx-eyebrow">${ic("star",13)} ${esc(L.fEy)}</span><h2 class="lx-h2">${L.fH}</h2><p class="lx-sub">${esc(L.fSub)}</p></div>
        <div class="lx-bento">${L.feats.map((f,i)=>`<article class="lx-card lx-rv ${f.cls||""}" style="--d:${(i%4)*80}ms">${f.badge?`<span class="lx-badge-new">${esc(f.badge)}</span>`:""}<span class="lx-ic">${ic(f.ic,23)}</span><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p>${f.chips?`<div class="lx-chips">${f.chips.map(c=>`<span>${esc(c)}</span>`).join("")}</div>`:""}${f.gap?gapViz:""}</article>`).join("")}</div></div></section>`;
      const aiSec=`<section class="lx-sec lx-alt" id="lx-ai"><div class="lx-wrap"><div class="lx-center lx-rv"><span class="lx-eyebrow">${ic("idea",13)} ${esc(L.aEy)}</span><h2 class="lx-h2">${L.aH}</h2><p class="lx-sub">${esc(L.aSub)}</p></div>
        <div class="lx-portals">${L.ai.map((p,i)=>`<article class="lx-card lx-portal lx-rv" style="--d:${i*90}ms"><span class="lx-ic">${ic(p.ic,23)}</span><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p><ul>${p.items.map(x=>`<li>${chk}<span>${esc(x)}</span></li>`).join("")}</ul><button type="button" class="lx-btn lx-btn-dark" onclick="lxEnter('management')">${esc(L.aBtn)} ${arrow}</button></article>`).join("")}</div></div></section>`;
      const how=`<section class="lx-sec" id="lx-how"><div class="lx-wrap"><div class="lx-center lx-rv"><span class="lx-eyebrow">${ic("target",13)} ${esc(L.hEy)}</span><h2 class="lx-h2">${L.hH}</h2></div>
        <div class="lx-steps">${L.steps.map((s,i)=>`<div class="lx-step lx-rv" style="--d:${i*100}ms"><span class="lx-step-n">0${i+1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div>`).join("")}</div></div></section>`;
      const trust=`<section class="lx-wrap" id="lx-trust"><div class="lx-trust lx-rv"><div><span class="lx-eyebrow">${ic("shield",13)} ${esc(L.tEy)}</span><h2 class="lx-h2">${L.tH}</h2><p class="lx-sub">${esc(L.tSub)}</p></div>
        <div class="lx-trust-list">${L.trust.map(x=>`<div class="lx-trust-item"><b>${ic("shield",16)} ${esc(x[0])}</b>${esc(x[1])}</div>`).join("")}</div></div></section>`;
      const final=`<section class="lx-wrap" style="margin-top:90px"><div class="lx-final lx-rv"><h2 class="lx-h2">${esc(L.finH)}</h2><p class="lx-sub">${esc(L.finSub)}</p><div class="lx-cta"><button type="button" class="lx-btn lx-btn-light lx-mag" onclick="lxEnter('management')">${esc(L.cta1)} ${arrow}</button><button type="button" class="lx-btn lx-btn-ghost lx-mag" onclick="openModal('entryGate')">${ic("lock",15)} ${esc(L.cta2)}</button></div></div></section>`;
      const footer=`<footer class="lx-footer"><div class="lx-wrap lx-foot-in"><div class="lx-brand"><span class="lx-brand-mark">${mark(28)}</span><span><b>${esc(t("brandName"))}</b><small>${esc(L.foot)}</small></span></div><div class="lx-foot-links">${secIds.map((id,i)=>`<button type="button" onclick="lxGo('${id}')">${esc(L.nav[i])}</button>`).join("")}<button type="button" onclick="openModal('about')">${esc(t("navAbout"))}</button></div><span class="lx-foot-copy">${esc(L.rights)}</span></div></footer>`;
      return `<div class="lx">${nav}${hero}${marq}${stats}${feats}${aiSec}${how}${trust}${final}${footer}</div>`;
    }
    function lxGo(id){const el=document.getElementById(id);if(!el)return;const y=el.getBoundingClientRect().top+window.scrollY-(id==="lx-top"?0:80);window.scrollTo({top:Math.max(0,y),behavior:"smooth"})}
    function lxEnter(role){state.role=role;state.currentStaffId=null;state.staffSection=null;state.view="dashboard";delete state.portal;persist();render();window.scrollTo(0,0)}
    function lxCount(el){
      const to=+el.dataset.count||0;const t0=performance.now();const dur=1500;
      el.textContent="0";
      (function step(tm){const p=Math.min(1,(tm-t0)/dur);el.textContent=String(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step)})(t0);
    }
    function initLanding(){
      const root=document.querySelector(".lx");if(!root)return;
      const n=root.querySelector(".lx-nav");if(n)n.classList.toggle("scrolled",window.scrollY>30);
      const items=root.querySelectorAll(".lx-rv");
      const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduce||!("IntersectionObserver" in window)){items.forEach(x=>x.classList.add("in"));return}
      const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;en.target.classList.add("in");en.target.querySelectorAll("[data-count]").forEach(lxCount);io.unobserve(en.target)}),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
      items.forEach(x=>io.observe(x));
    }
    (function lxInteractions(){
      const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let raf=null,last=null;
      function move(e){
        const hero=document.querySelector(".lx-hero");
        if(hero){
          const r=hero.getBoundingClientRect();
          if(e.clientY>=r.top&&e.clientY<=r.bottom){
            hero.style.setProperty("--mx",(e.clientX-r.left)+"px");hero.style.setProperty("--my",(e.clientY-r.top)+"px");
            if(!reduce){
              const nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
              const mock=hero.querySelector(".lx-mock");
              if(mock){mock.style.setProperty("--ry",(nx*18)+"deg");mock.style.setProperty("--rx",(-ny*14)+"deg")}
              hero.querySelectorAll("[data-depth]").forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate(${nx*d}px,${ny*d}px)`});
            }
          }
        }
        const fin=e.target.closest&&e.target.closest(".lx-final");
        if(fin){const r=fin.getBoundingClientRect();fin.style.setProperty("--mx",(e.clientX-r.left)+"px");fin.style.setProperty("--my",(e.clientY-r.top)+"px")}
        const card=e.target.closest&&e.target.closest(".lx-card");
        if(card){const r=card.getBoundingClientRect();card.style.setProperty("--x",(e.clientX-r.left)+"px");card.style.setProperty("--y",(e.clientY-r.top)+"px")}
        if(!reduce){
          document.querySelectorAll(".lx-mag").forEach(b=>{const r=b.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.hypot(dx,dy)<110){b.style.transform=`translate(${dx*.22}px,${dy*.3}px)`}else if(b.style.transform){b.style.transform=""}});
        }
      }
      document.addEventListener("pointermove",e=>{if(e.pointerType==="touch")return;last=e;if(raf)return;raf=requestAnimationFrame(()=>{raf=null;move(last)})},{passive:true});
      window.addEventListener("scroll",()=>{const n=document.querySelector(".lx-nav");if(n)n.classList.toggle("scrolled",window.scrollY>30)},{passive:true});
      setInterval(()=>{
        const el=document.getElementById("lx-rot");if(!el)return;
        const words=lxL().rot;const i=((+el.dataset.i||0)+1)%words.length;
        el.classList.add("out");
        setTimeout(()=>{el.textContent=words[i];el.dataset.i=String(i);el.classList.remove("out")},350);
      },2600);
    })();
    function portals(kind){
      if(kind && kind!=="home") return portalPage(kind);
      return landingHome();
    }
    function waLink(text){return "https://wa.me/?text="+encodeURIComponent(text)}
    function friendlyStatus(p){
      if(p.status==="نشط") return {emoji:"✅",label:"مستمر ويتقدم بشكل جيد"};
      if(p.status==="متوقف مؤقتاً") return {emoji:"⏸️",label:"متوقف مؤقتًا"};
      return {emoji:"🔵",label:p.status};
    }
    function homePracticeTips(program){
      const tips=[];
      const has=(k)=>(program||"").indexOf(k)>-1;
      if(has("نطق")) tips.push("تكلمي مع طفلك عن الأشياء اللي بيشوفها في البيت بجملة قصيرة، وكرري نفس الكلمة الجديدة في أكثر من موقف خلال اليوم.");
      if(has("علاج وظيفي")) tips.push("خصصي 10 دقائق يوميًا لنشاط يستخدم فيه يده (تلوين، قص، تركيب مكعبات) تحت إشرافك.");
      if(has("علاج طبيعي")) tips.push("شجعي طفلك على الحركة الحرة في مكان آمن 15 دقيقة يوميًا (مشي، صعود ونزول درج بمساعدة).");
      if(has("تأهيل سلوكي")) tips.push("استخدمي جدول صور بسيط لخطوات الروتين اليومي، وامدحي فورًا أي التزام صغير منه.");
      if(has("دعم أكاديمي")) tips.push("اقرئي مع طفلك قصة قصيرة يوميًا واسأليه بعدها سؤالين بسيطين عنها.");
      if(!tips.length) tips.push("استمري في تشجيع طفلك بكلمات إيجابية، وتابعي توصيات الأخصائي بعد كل جلسة.");
      return tips;
    }
    function familyPortal(back){
      const tab = state.parentTab||"menu";
      const head = `<div class="public-head" style="margin:0 0 20px"><div class="brand"><span class="brand-mark">${mark(22,"#a7c2b3","#e4aa54")}</span><span><strong>بوابة الأسرة</strong><small>${esc(state.center.name)}</small></span></div></div>`;
      const backNav = tab==="menu" ? back : `<button class="back-link back-link-top" onclick="setParentTab('menu')"><span class="back-link-arrow">${ic("chevronLeft",14,2.4)}</span>رجوع لخيارات الأسرة</button>`;
      if(tab==="menu") return `<div class="public-shell"><div class="gate card" style="max-width:1000px">${head}${backNav}<h2 style="margin-top:18px">أهلاً بك في بوابة الأسرة</h2><p class="muted">اختاري الخدمة التي تحتاجينها الآن.</p><div class="public-grid" style="margin-top:20px">${state.familyServices.filter(s=>s.enabled).map(s=>`<div class="portal-card"><span class="portal-icon">${ic(s.icon,24)}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p><button class="btn btn-primary" onclick="setParentTab('${s.builtin?s.id:"custom:"+s.id}')">${esc(s.cta||"التفاصيل")}</button></div>`).join("")}</div></div></div>`;
      if(tab&&tab.indexOf("custom:")===0){
        const svc=state.familyServices.find(x=>x.id===tab.slice(7));
        if(!svc||!svc.enabled) return `<div class="public-shell"><div class="gate card">${head}${backNav}<div class="empty">هذه الخدمة لم تعد متاحة حالياً.</div></div></div>`;
        return `<div class="public-shell"><div class="gate card">${head}${backNav}<h2 style="margin-top:18px">${esc(svc.title)}</h2><p class="muted">${esc(svc.desc)}</p><form onsubmit="submitCustomServiceRequest(event,'${svc.id}')"><div class="form-grid"><div class="field"><label>اسمك</label><input class="input" name="name" required></div><div class="field"><label>رقم التواصل</label><input class="input" type="tel" name="phone" required placeholder="05xxxxxxxx"></div><div class="field full"><label>تفاصيل الطلب <small class="hint">(اختياري)</small></label><textarea class="textarea" name="message" placeholder="أي تفاصيل تحبي تضيفيها"></textarea></div></div><button class="btn btn-primary" style="width:100%;margin-top:18px">إرسال الطلب</button></form><div id="portal-result" style="margin-top:18px"></div></div></div>`;
      }
      if(tab==="question") return `<div class="public-shell"><div class="gate card">${head}${backNav}<h2 style="margin-top:18px">عندي سؤال</h2><p class="muted">اكتبي سؤالك وهيوصل لفريق ${esc(state.center.name)} مباشرة.</p><form onsubmit="submitQuestion(event)"><div class="form-grid"><div class="field"><label>اسمك</label><input class="input" name="name" required></div><div class="field"><label>رقم التواصل</label><input class="input" type="tel" name="phone" required placeholder="05xxxxxxxx"></div><div class="field full"><label>سؤالك</label><textarea class="textarea" name="question" required placeholder="اكتبي سؤالك هنا..."></textarea></div></div><button class="btn btn-primary" style="width:100%;margin-top:18px">إرسال السؤال</button></form><div id="portal-result" style="margin-top:18px"></div></div></div>`;
      if(tab==="follow"){
        if(state.familySession){
          const p=state.patients.find(x=>x.code===state.familySession.code);
          let progressCard="",tipsCard="";
          if(p){
            const fs=friendlyStatus(p);
            const waMsg=`تذكير: موعد ${p.name} القادم في ${esc(state.center.name)} يوم ${date(p.next.split("T")[0])} الساعة ${time(p.next.split("T")[1])}.`;
            progressCard=`<div class="notice-blue" style="margin-top:16px;line-height:1.9"><strong>${fs.emoji} كيف يتقدم ${esc(p.name.split(" ")[0])} هذا الأسبوع؟</strong><br>الحالة: ${esc(fs.label)}<br>هدف الأسبوع بالكلام البسيط: ${esc(p.goal)}<br><a class="btn btn-outline" style="margin-top:10px;display:inline-flex" target="_blank" rel="noopener" href="${waLink(waMsg)}">${ic("chat",14)} إرسال تذكير الموعد عبر واتساب</a></div>`;
            tipsCard=`<div class="notice" style="margin-top:14px;line-height:1.9"><strong>💡 نشاط بسيط في البيت هذا الأسبوع</strong><br>${homePracticeTips(p.program).map(esc).join("<br>")}</div>`;
          }
          let libRecSection="";
          if(p){
            const recs=recommendedArticlesForPatient(p.id).slice(0,2);
            if(recs.length) libRecSection=`<div style="margin-top:16px"><h3 style="font-size:14px;margin:0 0 10px;display:flex;align-items:center;gap:6px"><span class="lib-badge sm">${ic("idea",13)}</span>مقترح من مكتبة أوان بناءً على هدف ${esc(p.name.split(" ")[0])} الحالي</h3><div class="lib-grid">${recs.map(a=>libraryCard(a,p.id)).join("")}</div><button class="btn btn-outline" style="margin-top:10px;width:100%" onclick="setParentTab('library')">${ic("book",13)} تصفّح مكتبة الإرشاد كاملة</button></div>`;
          }
          const sharedReports=p?state.progressReports.filter(r=>r.patientId===p.id&&r.shared):[];
          const reportsSection=sharedReports.length?`<h3 style="font-size:14px;margin:20px 0 10px">${ic("chart",15)} تقارير التقدم</h3><div class="box-grid">${sharedReports.map(r=>`<div class="box-card"><div class="box-card-head"><h4>${date(r.date)}</h4>${pill(r.level)}</div><small style="white-space:pre-line">${esc((r.summaryText||"").split("\n\n")[1]||"")}</small><button class="btn btn-outline" style="margin-top:10px;width:100%;padding:6px 10px;font-size:11px" onclick="viewProgressReport('${r.id}')">قراءة التقرير كاملاً</button></div>`).join("")}</div>`:"";
          let healthSection="";
          if(p&&p.health&&p.health.sharedWithFamily){
            const h=p.health;
            const neuroLines=h.neuroReports.length?h.neuroReports.map(r=>`• ${date(r.date)} — ${esc(r.facility||"")}${r.doctorName?" ("+esc(r.doctorName)+")":""}`).join("<br>"):"";
            healthSection=`<h3 style="font-size:14px;margin:20px 0 10px">${ic("shield",15)} الملف الصحي الموحد</h3><div class="notice" style="line-height:1.9">${h.birthDate?`تاريخ الميلاد: ${date(h.birthDate)}<br>`:""}فحص السمع: ${pill(h.hearingScreening.status)}<br>${neuroLines?`تقارير المخ والأعصاب:<br>${neuroLines}<br>`:""}${h.linkedFacility.name?`الجهة الصحية المرتبطة: ${esc(h.linkedFacility.name)} (${pill(h.linkedFacility.status)})`:""}</div>`;
          }
          let commFamilySection="";
          if(p){
            commFamilySection=`<div class="notice" style="margin-top:16px;border-color:var(--comm-1)"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span class="comm-badge sm">${ic("commHub",14)}</span><b>تواصل مباشر مع المركز</b></div>${familyCommThreadView(p.id)}<form onsubmit="sendFamilyCommMessage(event,'${p.id}')" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:12px"><div class="field" style="flex:1;min-width:200px;margin:0"><label>رسالة جديدة للمركز</label><input class="input" name="text" required placeholder="مثال: هل يمكن تأجيل موعد الغد؟"></div><button class="btn btn-primary" type="submit">${ic("commHub",13)} إرسال</button></form></div>`;
          }
          let genSection="";
          if(p){
            const gs=computeGeneralizationStats(p.id);
            const myHomeLogs=gs.homes.slice(0,4);
            const tip=gs.status==="gap"?`<div class="notice" style="margin-top:10px">🌱 نصيحة: جربوا نفس الهدف («${esc(p.goal)}») في البيت هذا الأسبوع بنفس طريقة المركز — هذا يساعد ${esc(p.name.split(" ")[0])} يثبّت المهارة أكثر.</div>`:"";
            genSection=`<h3 style="font-size:14px;margin:20px 0 10px">${ic("pulse",15)} سجل المنزل</h3><p class="muted" style="margin-top:-6px">سجّلي هنا كيف كان أداء ${esc(p.name.split(" ")[0])} مع نفس الهدف العلاجي وأنتم في البيت — هذا يساعد فريق المركز يعرف هل المهارة ثابتة عنده خارج المركز أيضًا.</p><form onsubmit="submitHomeLog(event,'${p.id}')" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:10px"><div class="field" style="flex:2;min-width:200px;margin:0"><label>الهدف</label><input class="input" name="goalText" value="${esc(p.goal)}"></div><div class="field" style="flex:1;min-width:180px;margin:0"><label>كيف قدر يعملها؟</label><select class="select" name="result"><option value="نجاح كامل">قدر يعملها لوحده</option><option value="نجاح جزئي" selected>قدرها لكن احتاج مساعدة</option><option value="لم ينجح بعد">لسه محتاجين نتمرن عليها</option></select></div><input type="hidden" name="date" value="${todayISO()}"><button class="btn btn-primary">إضافة تسجيل</button></form>${tip}${myHomeLogs.length?`<div class="box-grid" style="margin-top:12px">${myHomeLogs.map(l=>`<div class="box-card"><div class="box-card-head"><h4>${date(l.date)}</h4>${genResultPill(l.result)}</div><small>${esc(l.goalText||"")}</small></div>`).join("")}</div>`:""}`;
          }
          return `<div class="public-shell"><div class="gate card" style="max-width:900px">${head}${backNav}<h2 style="margin-top:18px">أهلاً، ${esc(state.familySession.name)}</h2>${p?`<div class="list" style="margin-top:14px"><div class="list-row"><div class="list-main"><strong>الملف</strong><small>${esc(p.file)}</small></div></div><div class="list-row"><div class="list-main"><strong>البرنامج العلاجي</strong><small>${esc(p.program)}</small></div></div><div class="list-row"><div class="list-main"><strong>الموعد القادم</strong><small>${date(p.next.split("T")[0])} · ${time(p.next.split("T")[1])}</small></div></div><div class="list-row"><div class="list-main"><strong>هدف الأسبوع</strong><small>${esc(p.goal)}</small></div></div></div>`:""}${progressCard}${tipsCard}${libRecSection}${reportsSection}${healthSection}${genSection}${commFamilySection}${p?familyCaseStudySection(p)+consentFamilySection(p):""}<h3 style="font-size:14px;margin:20px 0 10px">حجوزاتي</h3>${myBookingsView()}<div class="actions"><button class="btn btn-primary" onclick="setParentTab('sessionBooking')">حجز جلسة جديدة</button><button class="btn btn-outline" onclick="logoutFamily()">تسجيل الخروج</button></div></div></div>`;
        }
        return `<div class="public-shell"><div class="gate card">${head}${backNav}<h2 style="margin-top:18px">متابعة طفلي</h2><p class="muted">أدخلي اسم الطفل وكود الوصول الذي شاركه المركز.</p><form onsubmit="parentLogin(event)"><div class="field"><label>اسم الطفل</label><input class="input" id="parent-name" required placeholder="مثال: عبدالله محمد الحربي"></div><div class="field" style="margin-top:12px"><label>كود الوصول</label><input class="input" id="parent-code" required placeholder="مثال: ALI-1001"></div><button class="btn btn-primary" style="width:100%;margin-top:18px">التحقق من الملف</button></form><div id="portal-result" style="margin-top:18px"></div></div></div>`;
      }
      if(tab==="library"){
        const lp=state.familySession?state.patients.find(x=>x.code===state.familySession.code):null;
        return `<div class="public-shell"><div class="gate card" style="max-width:1100px">${head}${backNav}<h2 style="margin-top:18px">مكتبة أوان الذكية للإرشاد الأسري</h2><p class="muted">مقالات وأنشطة وفيديوهات تثقيفية من فريق ${esc(state.center.name)}، تقترح لكِ المحتوى الأنسب بناءً على هدف طفلك الحالي.</p><div style="margin-top:16px">${familyLibraryView(lp?lp.id:null)}</div></div></div>`;
      }
      if(tab==="sessionBooking") return `<div class="public-shell"><div class="gate card" style="max-width:940px">${head}${backNav}<h2 style="margin-top:18px">حجز جلسة علاجية</h2><p class="muted">اختاري ما يناسبكم وسيتأكد الحجز فورًا.</p>${sessionBookingView()}</div></div>`;
      if(tab==="packages") return `<div class="public-shell"><div class="gate card" style="max-width:1040px">${head}${backNav}<h2 style="margin-top:18px">الباقات العلاجية</h2><p class="muted">اختاري الباقة الأنسب لاحتياج طفلك.</p><div style="margin-top:16px">${packagesView()}</div></div></div>`;
      if(tab==="insurance") return `<div class="public-shell"><div class="gate card" style="max-width:900px">${head}${backNav}<h2 style="margin-top:18px">التأمين وطرق الدفع</h2><p class="muted">مرجع سريع لشركات التأمين وما تغطيه، وطرق الدفع المتاحة للجزء غير المغطى.</p><div style="margin-top:16px">${insuranceView()}</div></div></div>`;
      if(tab==="addons") return `<div class="public-shell"><div class="gate card" style="max-width:940px">${head}${backNav}<h2 style="margin-top:18px">خدمات مكمّلة</h2><p class="muted">خدمات إضافية تدعم رحلة طفلك خارج جلسات المركز.</p><div style="margin-top:16px">${addonsView()}</div></div></div>`;
      if(tab==="myBookings") return `<div class="public-shell"><div class="gate card" style="max-width:900px">${head}${backNav}<h2 style="margin-top:18px">حجوزاتي</h2><p class="muted">كل حجوزاتك في مكان واحد — تقدرين تأجلي أو تلغي أي حجز.</p><div style="margin-top:16px">${myBookingsView()}</div></div></div>`;
      if(tab==="case") return `<div class="public-shell"><div class="gate card" style="max-width:840px">${head}${backNav}<h2 style="margin-top:18px">دراسة حالة إلكترونية</h2><p class="muted">عبّئي البيانات التالية بدقة قدر الإمكان — كل ما تحتاجينه الآن هو المعلومات المتوفرة لديكِ، وسيتواصل معك فريق ${esc(state.center.name)} خلال يومي عمل لاستكمال ما تبقى.</p><form onsubmit="intakeSubmit(event)" oninput="intakeTyping(this)" onchange="intakeTyping(this)" autocomplete="off"><div class="ai-progress-wrap"><div class="spread-row"><b>اكتمال دراسة الحالة</b><span id="ai-progress-lab">0%</span></div><div class="ai-prog"><i id="ai-progress" style="width:0%"></i></div><small class="muted">كل إجابة بتتحفظ لحظة بلحظة وبتوصل لفريق المركز، ومش محتاجين أي ورق.</small></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">1</span>بيانات الطفل</div><div class="form-grid"><div class="field"><label>اسم الطفل</label><input class="input" name="child" required></div><div class="field"><label>تاريخ الميلاد أو العمر</label><input class="input" name="age" required placeholder="مثال: 5 سنوات"></div><div class="field"><label>الجنس</label><select class="select" name="gender" required><option value="">اختر</option><option>ذكر</option><option>أنثى</option></select></div><div class="field"><label>الجنسية</label><input class="input" name="nationality" placeholder="مثال: سعودي"></div></div></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">2</span>بيانات ولي الأمر</div><div class="form-grid"><div class="field"><label>اسم ولي الأمر</label><input class="input" name="guardian" required></div><div class="field"><label>صلة القرابة</label><select class="select" name="relation" required><option value="">اختر</option><option>الأب</option><option>الأم</option><option>ولي أمر آخر</option></select></div><div class="field"><label>رقم التواصل (جوال)</label><input class="input" type="tel" name="phone" required placeholder="05xxxxxxxx"></div><div class="field"><label>البريد الإلكتروني <small class="hint">(اختياري)</small></label><input class="input" type="email" name="email"></div></div></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">3</span>الحمل والولادة</div><div class="form-grid"><div class="field"><label>نوع الولادة</label><select class="select" name="birthType"><option value="">اختر</option><option>طبيعية</option><option>قيصرية</option><option>لا أعلم</option></select></div><div class="field"><label>مضاعفات أثناء الحمل أو الولادة <small class="hint">(إن وجدت)</small></label><input class="input" name="birthNotes" placeholder="اتركيه فارغاً إن لم توجد"></div></div></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">4</span>التاريخ التطوري</div><div class="form-grid"><div class="field"><label>عمر الجلوس بدون مساعدة</label><input class="input" name="milestoneSitting" placeholder="بالأشهر"></div><div class="field"><label>عمر المشي</label><input class="input" name="milestoneWalking" placeholder="بالأشهر"></div><div class="field"><label>عمر أول كلمة</label><input class="input" name="milestoneFirstWord" placeholder="بالأشهر"></div><div class="field"><label>عمر تكوين جملة من كلمتين</label><input class="input" name="milestoneSentence" placeholder="بالأشهر"></div></div></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">5</span>الحالة الصحية</div><div class="form-grid"><div class="field"><label>فحص السمع</label><select class="select" name="hearingChecked"><option value="">اختر</option><option>تم — لا توجد ملاحظات</option><option>تم — توجد ملاحظات</option><option>لم يتم بعد</option></select></div><div class="field"><label>فحص البصر</label><select class="select" name="visionChecked"><option value="">اختر</option><option>تم — لا توجد ملاحظات</option><option>تم — توجد ملاحظات</option><option>لم يتم بعد</option></select></div><div class="field"><label>أمراض مزمنة أو حساسية <small class="hint">(إن وجدت)</small></label><input class="input" name="chronic"></div><div class="field"><label>أدوية حالية <small class="hint">(إن وجدت)</small></label><input class="input" name="medications"></div></div></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">6</span>التاريخ الأسري ومصدر التحويل</div><div class="form-grid"><div class="field"><label>هل توجد حالات مشابهة في العائلة؟</label><select class="select" name="familyHistory"><option value="">اختر</option><option>نعم</option><option>لا</option></select></div><div class="field"><label>هل سبق عمل تقييم في مركز آخر؟</label><select class="select" name="priorEval"><option value="">اختر</option><option>نعم</option><option>لا</option></select></div><div class="field full"><label>تفاصيل التقييم السابق <small class="hint">(إن وجد)</small></label><input class="input" name="priorEvalDetails" placeholder="اسم المركز والتقييم الذي تم، إن وجد"></div><div class="field full"><label>كيف سمعتم عن المركز؟</label><select class="select" name="referralSource"><option value="">اختر</option><option>توصية طبيب</option><option>توصية مدرسة أو روضة</option><option>صديق أو قريب</option><option>وسائل التواصل الاجتماعي</option><option>بحث في جوجل</option><option>أخرى</option></select></div></div></div><div class="form-section"><div class="form-section-title"><span class="form-section-num">7</span>وصف الحالة الحالية</div><div class="form-grid"><div class="field full"><label>وصف الحالة / الاحتياج</label><textarea class="textarea" name="reason" required placeholder="مثال: تأخر في النطق، صعوبة في التواصل..."></textarea></div></div></div>${intakeFormHtml()}<div class="form-section"><div class="form-section-title"><span class="form-section-num">9</span>التواصل والموافقة</div><div class="form-grid"><div class="field"><label>الوقت المفضل للتواصل</label><select class="select" name="contactTime"><option value="">اختر</option><option>صباحاً (٩–١٢)</option><option>ظهراً (١٢–٣)</option><option>مساءً (٣–٦)</option></select></div><div class="field"><label>طريقة التواصل المفضلة</label><select class="select" name="contactMethod"><option value="">اختر</option><option>اتصال هاتفي</option><option>واتساب</option></select></div></div><label class="consent-row" style="margin-top:14px"><input type="checkbox" required><span>أقر بأن البيانات المدخلة صحيحة، وأوافق على مشاركتها مع فريق ${esc(state.center.name)} لغرض دراسة الحالة والتواصل معي بخصوصها فقط، وفق سياسة خصوصية المركز.</span></label></div><button class="btn btn-primary" style="width:100%;margin-top:18px">إرسال الدراسة</button></form><div id="portal-result" style="margin-top:18px"></div></div></div>`;
      if(tab==="booking") return `<div class="public-shell"><div class="gate card">${head}${backNav}<h2 style="margin-top:18px">حجز كشف استشارة</h2><p class="muted">اختاري الموعد المناسب وسنؤكده خلال يوم عمل عبر رقم التواصل.</p><form onsubmit="submitConsultation(event)"><div class="form-grid"><div class="field"><label>اسم الطفل</label><input class="input" name="child" required></div><div class="field"><label>اسم ولي الأمر</label><input class="input" name="guardian" required></div><div class="field"><label>رقم التواصل</label><input class="input" name="phone" required></div><div class="field"><label>التاريخ المفضل</label><input class="input" type="date" name="date" required></div><div class="field"><label>الوقت المفضل</label><input class="input" type="time" name="time" required></div></div><button class="btn btn-primary" style="width:100%;margin-top:18px">إرسال طلب الحجز</button></form><div id="portal-result" style="margin-top:18px"></div></div></div>`;
    }
    function portalPage(kind){
      const back=`<button class="back-link back-link-top" onclick="goPublic()"><span class="back-link-arrow">${ic("chevronLeft",14,2.4)}</span>العودة للصفحة الرئيسية</button>`;
      if(kind==="parent") return familyPortal(back);
      if(kind==="facility") return facilityHub(back);
      if(kind==="school") return `<div class="public-shell"><div class="gate card"><div class="public-head" style="margin:0 0 20px"><div class="brand"><span class="brand-mark">${mark(22,"#a7c2b3","#e4aa54")}</span><span><strong>بوابة المدرسة</strong><small>الأهداف المصرح بها فقط</small></span></div></div>${back}<h2 style="margin-top:18px">دخول المدرسة</h2><p class="muted">استخدم اسم الطفل وكود المدرسة المشارك من المركز.</p><form onsubmit="schoolLogin(event)"><div class="field"><label>اسم الطفل</label><input class="input" id="school-name" required placeholder="مثال: عبدالله محمد الحربي"></div><div class="field" style="margin-top:12px"><label>كود المدرسة</label><input class="input" id="school-code" required placeholder="SCHOOL-1001"></div><button class="btn btn-primary" style="width:100%;margin-top:18px">عرض الأهداف</button></form><div id="portal-result" style="margin-top:18px"></div></div></div>`;
      if(kind==="doctor") return `<div class="public-shell"><div class="gate card"><div class="public-head" style="margin:0 0 20px"><div class="brand"><span class="brand-mark">${mark(22,"#a7c2b3","#e4aa54")}</span><span><strong>بوابة الطبيب</strong><small>إحالة أولية وربط ملفات صحية</small></span></div></div>${back}<h2 style="margin-top:18px">إرسال إحالة طبية</h2><p class="muted">لطفل غير مسجل لدينا بعد — ستصل الإحالة إلى صندوق المراجعة الداخلي، ولا ينشأ ملف تلقائياً.</p><form onsubmit="publicReferral(event)"><div class="form-grid"><div class="field"><label>اسم الطفل</label><input class="input" name="child" required></div><div class="field"><label>اسم الطبيب / الجهة</label><input class="input" name="person" required></div><div class="field full"><label>سبب الإحالة</label><textarea class="textarea" name="reason" required></textarea></div></div><button class="btn btn-primary" style="margin-top:18px">إرسال الإحالة</button></form><div id="portal-result" style="margin-top:18px"></div><hr style="border:0;border-top:1px solid var(--line);margin:26px 0"><h2 style="margin-top:0">إرفاق تقرير طبي بملف مسجّل</h2><p class="muted">لطفل مسجّل بالفعل لدينا — استخدم رمز الربط الطبي الذي يشاركه ولي الأمر أو المركز معك (مثال: AWN-SRC-1001-MED) لإرسال نتيجة فحص سمع أو تقرير مخ وأعصاب، وستراجعه إدارة المركز قبل إلحاقه بالملف الصحي الموحد للطفل.</p><form onsubmit="submitMedicalLinkReport(event)"><div class="form-grid"><div class="field"><label>اسم الطفل</label><input class="input" name="child" required></div><div class="field"><label>رمز الربط الطبي</label><input class="input" name="linkCode" required placeholder="AWN-SRC-1001-MED"></div><div class="field"><label>نوع التقرير</label><select class="select" name="category"><option value="hearing">فحص سمع</option><option value="neuro">تقرير مخ وأعصاب</option></select></div><div class="field"><label>الجهة / المستشفى</label><input class="input" name="facility" required></div><div class="field"><label>اسم الطبيب</label><input class="input" name="doctorName"></div><div class="field full"><label>ملخص التقرير أو النتيجة</label><textarea class="textarea" name="summary" required></textarea></div></div><button class="btn btn-primary" style="margin-top:18px">إرسال التقرير للمراجعة</button></form><div id="med-link-result" style="margin-top:18px"></div></div></div>`;
      if(kind==="kiosk") return `<div class="public-shell"><div class="gate card"><div class="public-head" style="margin:0 0 20px"><div class="brand"><span class="brand-mark">${mark(22,"#a7c2b3","#e4aa54")}</span><span><strong>كشك الحضور</strong><small>${esc(state.center.name)}</small></span></div></div>${back}<h2 style="margin-top:18px">تسجيل حضور الفريق</h2><p class="muted">اختر اسم الموظف لتسجيل حضوره اليوم.</p><div class="list">${state.staff.map((s,i)=>`<div class="list-row"><div class="list-main"><strong>${esc(s.name)}</strong><small>${esc(s.role)} · ${esc(s.schedule)}</small></div><button class="btn ${s.present?"btn-outline":"btn-primary"}" onclick="markAttendance(${i})">${s.present?"حاضر ✓":"تسجيل الحضور"}</button></div>`).join("")}</div><div id="portal-result" style="margin-top:18px"></div></div></div>`;
    }
    function render(){
      {const _R=roles[state.role];if(_R&&state.view!=="public"&&state.view!=="patient-detail"&&["dashboard","license","govSupport"].includes(state.view)){const _h=navItems.find(n=>_R.nav.includes(n[0]));if(_h)state.view=_h[0]}}
      document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==="ar"?"rtl":"ltr";
      if(state.theme==="dark"&&state.view!=="public") document.documentElement.setAttribute("data-theme","dark"); else document.documentElement.removeAttribute("data-theme");
      const app=document.getElementById("app");
      if(state.sipadMode&&!state.intakeKiosk&&state.view!=="public"){const _cb=document.getElementById("comm-banner");if(_cb)_cb.classList.remove("show");app.innerHTML=staffIpadScreen();return;}
    if(state.intakeKiosk&&state.view!=="public") {const _cb=document.getElementById("comm-banner");if(_cb)_cb.classList.remove("show");app.innerHTML=kioskIntakeScreen();setTimeout(()=>{if(document.getElementById("ki-form"))kiShow(0)},0);return;}
      if(state.view==="public") app.innerHTML=portals(state.portal||"home");
      else if(state.view==="patient-detail") app.innerHTML=shell(patientDetail(state.patientId)||patients());
      else app.innerHTML=shell(state.view==="myIpad"?myIpadView():state.view==="staffPage"?staffPageView():state.view==="server"?(["management"].includes(state.role)?svView():roleHome()):state.view==="calls"?(state.role!=="staff"?svCallsView():roleHome()):state.view==="claims"?(state.role!=="staff"?clView():roleHome()):state.view==="scribe"?(state.role!=="reception"?scView():roleHome()):state.view==="ebnak"?((state.role==="reception")?roleHome():ebView()):state.view==="assessments"?asView():state.view==="videoLab"?((state.role==="reception")?roleHome():videoLabView()):state.view==="digital"?((state.role==="management"||state.role==="supervisor"||state.role==="reception")?digitalView():roleHome()):state.view==="deptPlan"?((state.role==="management"||state.role==="supervisor")?deptPlanView():roleHome()):state.view==="ipads"?((state.role==="management"||state.role==="supervisor")?ipadsView():roleHome()):state.view==="liveOps"?((state.role==="management"||state.role==="supervisor")?liveOpsView():roleHome()):state.view==="agents"?(state.role==="management"?agentsView():roleHome()):state.view==="intakeAI"?((state.role==="management"||state.role==="supervisor")?intakeAIView():roleHome()):state.view==="audit"?((state.role==="management"||state.role==="supervisor")?auditView():roleHome()):state.view==="dashboard"?roleHome():state.view==="patients"?patients():state.view==="schedule"?schedule():state.view==="referrals"?referrals():state.view==="team"?team():state.view==="departments"?departments():state.view==="settings"?(state.role==="management"?settings():dashboard()):state.view==="attendance"?attendanceView():state.view==="reports"?(state.role==="management"?reportsView():roleHome()):state.view==="invoices"?(state.role==="management"?invoicesView():roleHome()):state.view==="connect"?((state.role==="management"||state.role==="supervisor"||state.role==="staff")?connectView():roleHome()):state.view==="meetingRoom"?((state.role==="management"||state.role==="supervisor"||state.role==="staff")?meetingRoomView():roleHome()):state.view==="communicationHub"?communicationHubView():state.view==="library"?libraryHubView():state.view==="license"?(state.role==="management"?municipalLicense():roleHome()):state.view==="govSupport"?(state.role==="management"?govSupportView():roleHome()):state.view==="reviewRequests"?(state.role==="management"?reviewRequestsView():roleHome()):roleHome());
      setupScrollReveal();
      initLanding();
      announceNewChildIfNeeded();
      announceNewCommIfNeeded();
    }
    function setupScrollReveal(){
      const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduceMotion) return;
      const app=document.getElementById("app");
      if(!app) return;
      const els=app.querySelectorAll(".section-card, .portal-card, .value-card, .metric, .role-card, .landing-trustbar, .landing-footer");
      if(!els.length) return;
      const groups=new Map();
      els.forEach(el=>{
        const p=el.parentElement;
        if(!groups.has(p)) groups.set(p,[]);
        groups.get(p).push(el);
      });
      groups.forEach(list=>{
        list.forEach((el,i)=>{
          el.classList.add("reveal-on-scroll");
          el.style.transitionDelay=Math.min(i*70,420)+"ms";
        });
      });
      if(!("IntersectionObserver" in window)){ els.forEach(el=>el.classList.add("is-visible")); return }
      const io=new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },{threshold:0.12,rootMargin:"0px 0px -30px 0px"});
      els.forEach(el=>io.observe(el));
    }
    function goPublic(kind){state.view="public";state.portal=kind||"home";if(kind==="parent")state.parentTab=null;if(kind==="facility")state.facilityTab=null;persist();render()}
    function goApp(){state.view="dashboard";delete state.portal;persist();render()}
    function toggleLang(){state.lang=state.lang==="ar"?"en":"ar";persist();notify(state.lang==="ar"?"تم التبديل إلى العربية":"English mode is ready");render()}
    function toggleTheme(){state.theme=state.theme==="dark"?"light":"dark";persist();notify(state.theme==="dark"?"تم تفعيل الوضع الليلي":"تم تفعيل الوضع النهاري");render()}
    function changeRole(role){state.role=role;state.currentStaffId=null;state.staffSection=null;if(!roles[role].nav.includes(state.view))state.view="dashboard";persist();notify(`تم التبديل إلى دور ${roles[role].label}`);render()}
    function resetData(){if(confirm("سيتم حذف تعديلات هذا الملف وإعادة البيانات التجريبية. هل تريد المتابعة؟")){localStorage.removeItem(KEY);state=clone(seed);render();notify("تمت إعادة البيانات التجريبية")}}
    function saveSettings(e){e.preventDefault();const f=new FormData(e.target);state.center=Object.fromEntries(["name","city","phone","email","address","supervisor"].map(k=>[k,f.get(k)]));persist();notify("تم حفظ بيانات المركز — ستبقى بعد إعادة التحميل");render()}
    function openPatient(id){state.patientId=id;state.view="patient-detail";persist();render()}
    function openModal(type,id){
      const m=document.getElementById("modal");let title="",body="";
      if(type==="patient"){title="إضافة ملف مستفيد";body=`<form onsubmit="addPatient(event)"><div class="form-grid"><div class="field"><label>اسم المستفيد</label><input class="input" name="name" required></div><div class="field"><label>العمر</label><input class="input" name="age" required placeholder="7 سنوات"></div><div class="field"><label>الاحتياج الأساسي</label><input class="input" name="need" required></div><div class="field"><label>المدرسة</label><input class="input" name="school"></div><div class="field"><label>ولي الأمر</label><input class="input" name="guardian" required></div><div class="field"><label>رقم تواصل ولي الأمر</label><input class="input" name="phone" type="tel" required placeholder="05xxxxxxxx"></div><div class="field full"><label>البرنامج</label><input class="input" name="program" value="نطق ولغة"></div><div class="field"><label>حالة الملف</label><select class="select" name="status"><option>نشط</option><option>متوقف مؤقتاً</option></select></div></div><label class="consent-row" style="margin-top:4px"><input type="checkbox" name="consentReviewContact"><span>أوافق على تواصل المركز مع ولي الأمر عبر واتساب لطلب تقييم لتجربتهم لاحقًا على خرائط جوجل</span></label><div class="actions"><button class="btn btn-primary">حفظ الملف</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="appointment"){
        const activePatients=state.patients.filter(p=>!p.archived);
        const a=id?state.appointments.find(x=>x.id===id):null;
        const patientOptions=[...activePatients];
        if(a&&!patientOptions.find(p=>p.name===a.patient)){const historic=state.patients.find(p=>p.name===a.patient);patientOptions.push(historic||{name:a.patient,phone:a.phone||""})}
        const services=["جلسة نطق ولغة","علاج وظيفي","علاج طبيعي","تأهيل سلوكي","تقييم أولي"];
        title=a?"تعديل الموعد":"حجز جلسة";
        body=`<form onsubmit="${a?`saveAppointment(event,'${id}')`:`addAppointment(event)`}"><div class="form-grid"><div class="field"><label>المستفيد</label><select class="select" name="patient" id="apt-patient" onchange="document.getElementById('apt-phone').value=aptPhoneFor(this.value)">${patientOptions.map(p=>`<option ${a&&a.patient===p.name?"selected":""}>${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>رقم تواصل ولي الأمر</label><input class="input" id="apt-phone" name="phone" type="tel" value="${esc(a?(a.phone||aptPhoneFor(a.patient)||""):(activePatients[0]?.phone||""))}" required></div><div class="field"><label>الخدمة</label><select class="select" name="service">${services.map(s=>`<option ${a&&a.service===s?"selected":""}>${esc(s)}</option>`).join("")}</select></div><div class="field"><label>التاريخ</label><input class="input" type="date" name="date" value="${esc(a?a.date:"2026-09-08")}" required></div><div class="field"><label>الوقت</label><input class="input" type="time" name="time" value="${esc(a?a.time:"09:00")}" required></div><div class="field"><label>المعالج</label><select class="select" name="clinician">${state.staff.filter(s=>s.clinical!==false).map(s=>`<option ${a&&a.clinician===s.name?"selected":""}>${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label>الغرفة</label><input class="input" name="room" value="${esc(a?a.room:"غرفة 2")}"></div></div><div class="actions"><button class="btn btn-primary">${a?"حفظ التعديلات":"حفظ الموعد"}</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="compensation"){
        const orig=state.appointments.find(x=>x.id===id);
        if(!orig){title="تعذر إيجاد الموعد";body=`<div class="empty">هذا الموعد لم يعد موجودًا.</div>`;}
        else{
          title="جدولة جلسة تعويض";
          body=`<p class="muted">تعويض عن: <b>${esc(orig.patient)}</b> — ${esc(orig.service)} (الموعد الأصلي: ${date(orig.date)} · ${time(orig.time)})</p><form onsubmit="confirmCompensation(event,'${id}')"><div class="form-grid"><div class="field"><label>التاريخ الجديد</label><input class="input" type="date" name="date" value="${esc(orig.date)}" required></div><div class="field"><label>الوقت الجديد</label><input class="input" type="time" name="time" value="${esc(orig.time)}" required></div><div class="field"><label>المعالج</label><select class="select" name="clinician">${state.staff.filter(s=>s.clinical!==false).map(s=>`<option ${orig.clinician===s.name?"selected":""}>${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label>الغرفة</label><input class="input" name="room" value="${esc(orig.room)}"></div></div><div class="actions"><button class="btn btn-primary">تأكيد التعويض</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="referral"){title="تسجيل إحالة";body=`<form onsubmit="addReferral(event)"><div class="form-grid"><div class="field"><label>عنوان الطلب</label><input class="input" name="name" required></div><div class="field"><label>الجهة / الشخص</label><input class="input" name="person" required></div><div class="field"><label>النوع</label><select class="select" name="type"><option>عام</option><option>طبية</option><option>مدرسة</option></select></div><div class="field"><label>الأولوية</label><select class="select" name="priority"><option>متوسطة</option><option>عالية</option><option>منخفضة</option></select></div></div><div class="actions"><button class="btn btn-primary">إضافة للصندوق</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="staff"){
        const presetParts=(id||"").split("::");
        const presetDept=presetParts[0]||"";
        const presetRole=presetParts[1]||"staff";
        const presetDeptInfo=presetDept?state.departments.find(x=>x.id===presetDept):null;
        title=presetRole==="supervisor"?`تعيين مشرف/ة${presetDeptInfo?" — "+esc(presetDeptInfo.name):""}`:(presetDept?`إضافة عضو للفريق — ${esc(presetDeptInfo?presetDeptInfo.name:"")}`:"إضافة موظف");
        body=`<form onsubmit="addStaff(event)"><div class="form-grid"><div class="field"><label>الاسم</label><input class="input" name="name" required></div><div class="field"><label>الدور المهني</label><input class="input" name="role" required placeholder="${presetRole==="supervisor"?"مثال: مشرف/ة "+esc(presetDeptInfo?presetDeptInfo.name:"القسم"):""}"></div><div class="field"><label>فئة الدخول</label><select class="select" name="roleCategory"><option value="staff" ${presetRole==="staff"?"selected":""}>موظف</option><option value="reception" ${presetRole==="reception"?"selected":""}>استقبال</option><option value="supervisor" ${presetRole==="supervisor"?"selected":""}>إشراف</option><option value="management" ${presetRole==="management"?"selected":""}>إدارة</option></select></div><div class="field"><label>القسم</label><select class="select" name="department"><option value="" ${!presetDept?"selected":""}>بدون قسم محدد</option>${state.departments.map(d=>`<option value="${d.id}" ${presetDept===d.id?"selected":""}>${esc(d.name)}</option>`).join("")}</select></div><div class="field"><label>ساعات الدوام</label><input class="input" name="schedule" value="08:00 — 16:00"></div></div><div class="notice" style="margin-bottom:14px">سيحصل الموظف على كود دخول شخصي تلقائياً (أول حرف من الاسم + رقم) يظهر في صفحة الفريق.</div><div class="actions"><button class="btn btn-primary">حفظ ${presetRole==="supervisor"?"المشرف/ة":"الموظف"}</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="returnPlan"){
        const p=state.plans.find(x=>x.id===id);
        if(!p){title="تعذر إيجاد الخطة";body=`<div class="empty">هذه الخطة لم تعد موجودة.</div>`;}
        else{
          title="إرجاع الخطة للتعديل";
          body=`<p class="muted">${esc(p.title)} — ${esc(p.patient)}</p><form onsubmit="confirmReturnPlan(event,'${id}')"><div class="field"><label>ملاحظات للأخصائي</label><textarea class="textarea" name="note" required placeholder="وضّحي سبب الإرجاع والتعديلات المطلوبة"></textarea></div><div class="actions"><button class="btn btn-primary">إرجاع مع الملاحظات</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="qualityAudit"){
        const s=personById(id);
        title="تقييم أداء "+(s?esc(s.name):"");
        body=`<form onsubmit="submitQualityAudit(event,'${id}')"><div class="field"><label>التقييم (من 5)</label><select class="select" name="score"><option value="5">5 — ممتاز</option><option value="4">4 — جيد جدًا</option><option value="3">3 — جيد</option><option value="2">2 — يحتاج تحسين</option><option value="1">1 — ضعيف</option></select></div><div class="field"><label>ملاحظات وتوجيهات</label><textarea class="textarea" name="notes" required placeholder="نقاط القوة، وما يحتاج تطويراً"></textarea></div><div class="actions"><button class="btn btn-primary">حفظ التقييم</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="rejectConsultation"){
        const c=state.consultationReviews.find(x=>x.id===id);
        title="رفض الاستشارة مع ملاحظة";
        body=`<p class="muted">${esc(c?c.patientName:"")}</p><form onsubmit="confirmRejectConsultation(event,'${id}')"><div class="field"><label>سبب الرفض / ملاحظات</label><textarea class="textarea" name="note" required></textarea></div><div class="actions"><button class="btn btn-primary">تأكيد الرفض</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="newBooking"){
        const activePatients=state.patients.filter(p=>!p.archived);
        const clinicalOptions=state.staff.filter(s=>s.clinical!==false);
        const svcOptions=["جلسة نطق ولغة","علاج وظيفي","علاج طبيعي","تأهيل سلوكي","تقييم أولي"];
        const activePkgList=state.packagePurchases.filter(pp=>(pp.sessionsTotal-pp.sessionsUsed)>0);
        title="تسجيل حجز جديد";
        body=`<form onsubmit="submitNewBooking(event)">
          <div class="form-grid"><div class="field full"><label>الطفل</label><select class="select" name="patientId"><option value="__new__">➕ طفل جديد (تسجيل الآن)</option>${activePatients.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div></div>
          <div class="notice" style="margin:10px 0">إذا اخترتِ «طفل جديد» أعلاه، عبّئي بياناته في الحقول التالية:</div>
          <div class="form-grid"><div class="field"><label>اسم الطفل الجديد</label><input class="input" name="newName"></div><div class="field"><label>العمر</label><input class="input" name="newAge" placeholder="مثال: 6 سنوات"></div><div class="field"><label>الاحتياج الأساسي</label><input class="input" name="newNeed"></div><div class="field"><label>ولي الأمر</label><input class="input" name="newGuardian"></div><div class="field full"><label>رقم تواصل ولي الأمر</label><input class="input" name="newPhone" type="tel"></div></div>
          <label class="consent-row" style="margin:6px 0 10px"><input type="checkbox" name="newConsentReviewContact"><span>أوافق على تواصل المركز مع ولي الأمر عبر واتساب لطلب تقييم لتجربتهم لاحقًا (عند تسجيل طفل جديد فقط)</span></label>
          <div class="form-grid"><div class="field"><label>نوع الحجز</label><select class="select" name="bookingType"><option value="جلسة علاجية أساسية">جلسة علاجية أساسية</option><option value="استشارة مبدئية">استشارة مبدئية</option><option value="جلسة تعويضية">جلسة تعويضية</option></select></div><div class="field"><label>الخدمة</label><select class="select" name="service">${svcOptions.map(s=>`<option>${esc(s)}</option>`).join("")}</select></div><div class="field"><label>الأخصائي</label><select class="select" name="clinician">${clinicalOptions.map(s=>`<option>${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label>الغرفة</label><input class="input" name="room" value="غرفة 2"></div><div class="field"><label>التاريخ</label><input class="input" type="date" name="date" value="2026-09-08" required></div><div class="field"><label>الوقت</label><input class="input" type="time" name="time" value="09:00" required></div></div>
          <div class="notice-blue" style="margin:10px 0">الأطفال ممن لديهم رصيد باقة متاح حالياً: ${activePkgList.length?activePkgList.map(pp=>`${esc(pp.patientName)} (${pp.sessionsTotal-pp.sessionsUsed} متبقية)`).join('، '):"لا يوجد حالياً"}</div>
          <div class="form-grid"><div class="field"><label>قيمة الفاتورة (ر.س)</label><input class="input" type="number" name="amount" value="150"></div><div class="field"><label>طريقة الدفع</label><select class="select" name="payment"><option>كاش</option><option>مدى</option><option>تحويل</option><option value="آجل">آجل (ذمم)</option><option value="من الباقة">خصم من رصيد الباقة</option></select></div></div>
          <div class="actions"><button class="btn btn-primary">تأكيد الحجز والفاتورة</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div>
        </form>`;
      }
      if(type==="assignPackage"){
        title="إسناد باقة لطفل";
        body=`<form onsubmit="confirmAssignPackage(event)"><div class="form-grid"><div class="field full"><label>الطفل</label><select class="select" name="patientId">${state.patients.filter(p=>!p.archived).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div><div class="field full"><label>الباقة</label><select class="select" name="package">${state.packages.map(pk=>`<option value="${pk.id}">${esc(pk.name)} — ${pk.sessions} جلسة — ${pk.price} ر.س</option>`).join("")}</select></div><div class="field"><label>طريقة الدفع</label><select class="select" name="payment"><option>كاش</option><option>مدى</option><option>تحويل</option><option value="آجل">آجل (ذمم)</option></select></div></div><div class="actions"><button class="btn btn-primary">تأكيد الإسناد والفاتورة</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="viewInvoice"){
        const inv=state.invoices.find(x=>x.id===id);
        if(!inv){title="تعذر إيجاد الفاتورة";body=`<div class="empty">هذه الفاتورة لم تعد موجودة.</div>`;}
        else{
          const balance=invoiceBalance(inv);
          const itemRows=(inv.items||[]).map(it=>`<tr><td>${esc(it.description||"")}</td><td>${esc(String(it.qty||1))}</td><td>${(it.unitPrice||0).toLocaleString("ar-SA")} ر.س</td><td>${(it.total||0).toLocaleString("ar-SA")} ر.س</td></tr>`).join("");
          const payRows=(inv.payments||[]).map(p=>`<tr><td>${date(p.date)}</td><td>${esc(p.method||"—")}</td><td>${(p.amount||0).toLocaleString("ar-SA")} ر.س</td><td>${esc(p.note||"—")}</td></tr>`).join("");
          title=(inv.taxAmount>0?"فاتورة ضريبية":"فاتورة")+" — "+esc(inv.id);
          body=`<div id="invoice-print-area">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px">
              <div><b style="font-size:16px">${esc(inv.centerName||state.center.name)}</b><br><small class="muted">${esc(state.center.city||"")} · ${esc(state.center.phone||"")}</small></div>
              <div style="text-align:left">${invoiceStatusPill(inv.status)}<br><small class="muted">${date(inv.date)}</small></div>
            </div>
            <div class="notice" style="margin-bottom:14px">العميل: <b>${esc(inv.patientName||"—")}</b>${inv.guardianName?` · ولي الأمر: ${esc(inv.guardianName)}`:""}${inv.guardianPhone?` · ${esc(inv.guardianPhone)}`:""}</div>
            <div class="table-wrap"><table class="data-table"><thead><tr><th>الوصف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${itemRows}</tbody></table></div>
            <div style="margin-top:14px;display:flex;flex-direction:column;gap:4px;align-items:flex-end">
              <small>الإجمالي الفرعي: ${(inv.subtotal||0).toLocaleString("ar-SA")} ر.س</small>
              ${inv.taxAmount?`<small>الضريبة (${Math.round((inv.taxRate||0)*100)}%): ${inv.taxAmount.toLocaleString("ar-SA")} ر.س</small>`:""}
              ${inv.discountAmount?`<small>الخصم: -${inv.discountAmount.toLocaleString("ar-SA")} ر.س</small>`:""}
              <b style="font-size:15px">الإجمالي المستحق: ${(inv.total||0).toLocaleString("ar-SA")} ر.س</b>
              ${balance>0?`<small style="color:var(--danger)">المتبقي: ${balance.toLocaleString("ar-SA")} ر.س</small>`:`<small style="color:var(--teal)">✓ مسددة بالكامل</small>`}
            </div>
            ${payRows?`<h4 style="margin:16px 0 8px;font-size:13px">سجل الدفعات</h4><div class="table-wrap"><table class="data-table"><thead><tr><th>التاريخ</th><th>الطريقة</th><th>المبلغ</th><th>ملاحظة</th></tr></thead><tbody>${payRows}</tbody></table></div>`:""}
          </div>
          <div class="actions" style="margin-top:16px">${(balance>0&&inv.status!=="مسودة"&&inv.status!=="ملغاة")?`<button type="button" class="btn btn-primary" onclick="closeModal();openModal('recordPayment','${inv.id}')">تسجيل دفعة</button>`:""}<button type="button" class="btn btn-outline" onclick="window.print()">${ic("chart",14)} حفظ نسخة PDF</button><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`;
        }
      }
      if(type==="recordPayment"){
        const inv=state.invoices.find(x=>x.id===id);
        if(!inv){title="تعذر إيجاد الفاتورة";body=`<div class="empty">هذه الفاتورة لم تعد موجودة.</div>`;}
        else{
          const balance=invoiceBalance(inv);
          title="تسجيل دفعة — "+esc(inv.patientName||inv.id);
          body=`<div class="notice-blue" style="margin-bottom:12px">المتبقي على هذه الفاتورة: <b>${balance.toLocaleString("ar-SA")} ر.س</b></div><form onsubmit="submitRecordPayment(event,'${inv.id}')"><div class="form-grid"><div class="field"><label>المبلغ المدفوع (ر.س)</label><input class="input" type="number" name="amount" step="0.01" max="${balance}" value="${balance}" required></div><div class="field"><label>طريقة الدفع</label><select class="select" name="method"><option>نقدي</option><option>شبكة (مدى/بطاقة)</option><option>تحويل بنكي</option></select></div><div class="field full"><label>ملاحظة (اختياري)</label><input class="input" name="note" placeholder="مثال: دفعة جزئية من ولي الأمر"></div></div><div class="actions" style="margin-top:14px"><button class="btn btn-primary">تسجيل الدفعة</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="newInvoice"){
        title="إصدار فاتورة يدوية";
        body=`<form onsubmit="confirmNewInvoice(event)"><div class="form-grid"><div class="field full"><label>الطفل</label><select class="select" name="patientId"><option value="">بدون تحديد (زائر)</option>${state.patients.filter(p=>!p.archived).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>نوع العملية</label><select class="select" name="type"><option>جلسة منفردة</option><option>استشارة</option><option>باقة</option><option>أخرى</option></select></div><div class="field full"><label>الوصف</label><input class="input" name="label" required placeholder="مثال: جلسة علاج وظيفي"></div><div class="field"><label>المبلغ قبل الضريبة والخصم (ر.س)</label><input class="input" type="number" name="amount" required value="150"></div><div class="field"><label>الخصم (ر.س)</label><input class="input" type="number" name="discountAmount" value="0"></div><div class="field"><label>طريقة الدفع</label><select class="select" name="payment"><option>كاش</option><option>مدى</option><option>تحويل</option><option value="آجل">آجل (ذمم)</option></select></div><div class="field"><label>حالة الفاتورة</label><select class="select" name="status"><option value="مُصدرة">إصدار مباشر</option><option value="مسودة">حفظ كمسودة (بدون إصدار الآن)</option></select></div></div><label class="consent-row" style="margin-top:4px"><input type="checkbox" name="applyTax" ${state.billingSettings.taxEnabled?"checked":""}><span>تطبيق ${esc(Math.round(state.billingSettings.taxRate*100))}% ضريبة قيمة مضافة</span></label><div class="actions" style="margin-top:14px"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="scheduleMeeting"){
        title="جدولة اجتماع جديد";
        body=`<form onsubmit="confirmScheduleMeeting(event)"><div class="form-grid"><div class="field full"><label>عنوان الاجتماع</label><input class="input" name="title" required placeholder="مثال: اجتماع تنسيقي بين قسمي التخاطب والعلاج الوظيفي"></div><div class="field"><label>نوع الاجتماع</label><select class="select" name="kind" onchange="toggleMeetingKindFields(this.value)"><option value="department">اجتماع بين الأقسام</option><option value="family">اجتماع مع أسرة</option></select></div><div class="field"><label>تاريخ الاجتماع</label><input class="input" type="date" name="scheduledDate" value="${todayISO()}" required></div></div><div id="meeting-dept-fields" class="field full" style="margin-top:10px"><label>الأقسام المشاركة</label><div class="chips">${state.departments.map(d=>`<label class="chip"><input type="checkbox" name="departments" value="${d.id}" style="margin-inline-end:6px">${esc(d.name)}</label>`).join("")}</div></div><div id="meeting-family-fields" class="field full" style="display:none;margin-top:10px"><label>الطفل / الأسرة</label><select class="select" name="patientId">${state.patients.filter(p=>!p.archived).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div><div class="field full" style="margin-top:10px"><label>الحضور من فريق المركز</label><div class="chips">${state.staff.map(s=>`<label class="chip"><input type="checkbox" name="participants" value="${s.id}" style="margin-inline-end:6px">${esc(s.name)}</label>`).join("")}</div></div><div class="actions" style="margin-top:14px"><button class="btn btn-primary">جدولة الاجتماع</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      if(type==="department"){title="إضافة قسم أو خدمة";body=`<form onsubmit="addDepartment(event)"><div class="form-grid"><div class="field"><label>اسم القسم</label><input class="input" name="name" required></div><div class="field"><label>الأيقونة</label><input class="input" name="icon" value="✨"></div><div class="field full"><label>الوصف</label><textarea class="textarea" name="desc"></textarea></div><div class="field full"><label>الخدمات</label><input class="input" name="services"></div></div><div class="actions"><button class="btn btn-primary">حفظ القسم</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="editDepartment"){
        const d=state.departments.find(x=>x.id===id);
        if(!d){title="تعذر إيجاد القسم";body=`<div class="empty">هذا القسم لم يعد موجودًا.</div>`;}
        else{
          title="تعديل بيانات القسم";
          body=`<form onsubmit="saveDepartmentInfo(event,'${id}')"><div class="form-grid"><div class="field"><label>اسم القسم</label><input class="input" name="name" value="${esc(d.name)}" required></div><div class="field"><label>الحالة</label><select class="select" name="state"><option ${d.state==="نشط"?"selected":""}>نشط</option><option ${d.state==="جاهز"?"selected":""}>جاهز</option><option ${d.state==="قريباً"?"selected":""}>قريباً</option></select></div><div class="field full"><label>الوصف</label><textarea class="textarea" name="desc">${esc(d.desc)}</textarea></div><div class="field full"><label>الخدمات (افصل بينها بـ ·)</label><input class="input" name="services" value="${esc(d.services||"")}"></div></div><div class="actions"><button class="btn btn-primary">حفظ التعديلات</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="licenseStep"){title="إضافة خطوة جديدة";body=`<form onsubmit="addLicenseStep(event)"><div class="field"><label>وصف الخطوة</label><input class="input" name="label" required placeholder="مثال: استكمال مستندات الدفاع المدني"></div><div class="actions"><button class="btn btn-primary">إضافة</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="licenseInfo"){const ml=state.municipalLicense;title="تعديل بيانات الطلب";body=`<form onsubmit="saveLicenseInfo(event)"><div class="form-grid"><div class="field"><label>رقم الطلب البلدي</label><input class="input" name="requestNumber" value="${esc(ml.requestNumber||"")}"></div><div class="field"><label>الجهة التابعة</label><input class="input" name="authority" value="${esc(ml.authority||"")}"></div></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="govStep"){title="إضافة خطوة جديدة";body=`<form onsubmit="addGovStep(event)"><div class="field"><label>وصف الخطوة</label><input class="input" name="label" required placeholder="مثال: استكمال مستندات منصة إحسان"></div><div class="actions"><button class="btn btn-primary">إضافة</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="govInfo"){const gs=state.govSupport;title="تعديل بيانات البرنامج";body=`<form onsubmit="saveGovInfo(event)"><div class="form-grid"><div class="field"><label>اسم برنامج الدعم</label><input class="input" name="programName" value="${esc(gs.programName||"")}"></div><div class="field"><label>الجهة المانحة</label><input class="input" name="authority" value="${esc(gs.authority||"")}"></div></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="reviewSettings"){const rs=state.reviewSettings;title="إعدادات نظام طلب التقييمات";body=`<div class="notice-blue" style="margin-bottom:14px">هذه البيانات تُستخدم عند إرسال بيانات كل عائلة موافقة إلى نظام n8n لبدء رحلة طلب التقييم عبر واتساب.</div><form onsubmit="saveReviewSettings(event)"><div class="form-grid"><div class="field full"><label>رابط Webhook (من n8n)</label><input class="input" name="webhookUrl" value="${esc(rs.webhookUrl||"")}" placeholder="https://YOUR-N8N-DOMAIN/webhook/awan-new-family"></div><div class="field full"><label>Place ID لمركزكم على خرائط جوجل</label><input class="input" name="placeId" value="${esc(rs.placeId||"")}" placeholder="PUT_YOUR_PLACE_ID"></div><div class="field"><label>الفاصل بين كل رسالتين (أيام)</label><input class="input" type="number" min="1" name="intervalDays" value="${esc(rs.intervalDays||14)}"></div><div class="field"><label>الحد الأقصى لعدد المحاولات</label><input class="input" type="number" min="1" name="maxAttempts" value="${esc(rs.maxAttempts||3)}"></div></div><div class="actions"><button class="btn btn-primary">حفظ الإعدادات</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="sessionLog"){
        const p=state.patients.find(x=>x.id===id);
        if(!p){title="تعذر إيجاد الملف";body=`<div class="empty">هذا الملف لم يعد موجودًا.</div>`;}
        else{
          title="تسجيل أداء جلسة — "+p.name;
          body=`<div class="notice-blue" style="margin-bottom:12px">${ic("mic",14)} <b>مساعد الفني الصوتي:</b> اضغطي «ابدأ التسجيل الصوتي» وتحدثي عن أداء ${esc(p.name.split(" ")[0])} في الهدف الحالي، أو اكتبي ملاحظتك مباشرة في المربع، ثم اضغطي «تحليل وتعبئة النموذج». التعرف الصوتي يعمل محليًا داخل متصفحك فقط، بدون رفع أي تسجيل صوتي لأي خادم خارجي (وقد لا يكون مدعومًا في كل المتصفحات).</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button type="button" class="btn btn-outline" onclick="startVoiceCapture()">${ic("mic",13)} ابدأ التسجيل الصوتي</button><button type="button" class="btn btn-outline" onclick="stopVoiceCapture()">إيقاف</button><button type="button" class="btn btn-outline" onclick="analyzeVoiceNote('${p.id}')">تحليل النص وتعبئة النموذج</button></div><textarea class="textarea" id="voice-transcript" placeholder="سيظهر النص هنا أثناء التسجيل الصوتي، أو اكتبي/ي هنا مباشرة" style="margin-bottom:14px"></textarea><form onsubmit="submitSessionLog(event,'${p.id}')"><div class="form-grid"><div class="field"><label>تاريخ الجلسة</label><input class="input" type="date" name="date" value="${todayISO()}" required></div><div class="field"><label>النتيجة</label><select class="select" name="result"><option value="نجاح كامل">نجاح كامل</option><option value="نجاح جزئي" selected>نجاح جزئي</option><option value="لم ينجح بعد">لم ينجح بعد</option></select></div><div class="field full"><label>الهدف المستهدف</label><input class="input" name="goalText" value="${esc(p.goal)}" required></div><div class="field full"><label>ملاحظات الأخصائي/ة</label><textarea class="textarea" name="notes" placeholder="تفاصيل الأداء خلال الجلسة"></textarea></div></div><div class="actions" style="margin-top:14px"><button class="btn btn-primary">حفظ التسجيل</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="generateReport"){
        const p=state.patients.find(x=>x.id===id);
        if(!p){title="تعذر إيجاد الملف";body=`<div class="empty">هذا الملف لم يعد موجودًا.</div>`;}
        else{
          title="توليد تقرير تقدم — "+p.name;
          body=`<div class="notice-blue" style="margin-bottom:14px">أدخلي ملاحظات الجلسة مرة واحدة، واختاري الجهة المستلمة — وسيتم تركيبها تلقائيًا في تقرير جاهز بصياغة مناسبة لتلك الجهة (بدون اتصال بالإنترنت — تركيب ذكي محلي وليس نموذج ذكاء اصطناعي خارجي).</div><form onsubmit="generateProgressReport(event,'${p.id}')"><div class="form-grid"><div class="field full"><label>الجهة المستلمة للتقرير</label><select class="select" name="reportType"><option value="family">الأسرة (تقرير مبسّط)</option><option value="school">المدرسة (تقرير رسمي)</option><option value="insurance">جهة التأمين (تقرير سريري رسمي)</option></select></div><div class="field"><label>تاريخ الجلسة</label><input class="input" type="date" name="date" value="${todayISO()}" required></div><div class="field"><label>المستوى العام للتقدم</label><select class="select" name="level"><option>ممتاز</option><option selected>جيد جدًا</option><option>جيد</option><option>يحتاج دعمًا إضافيًا</option></select></div><div class="field full"><label>أبرز ما تحقق (افصلي بين النقاط بفاصلة)</label><input class="input" name="achievedGoals" placeholder="مثال: نطق 5 مفردات جديدة، تحسّن التواصل البصري"></div><div class="field full"><label>ملاحظات الأخصائي/ة على الجلسة</label><textarea class="textarea" name="notes" required placeholder="صفي أداء الطفل خلال الجلسة بإيجاز"></textarea></div></div><label class="consent-row" style="margin-top:4px"><input type="checkbox" name="shared" checked><span>مشاركة التقرير فورًا مع بوابة الأسرة (إن كان تقرير الأسرة)</span></label><div class="actions" style="margin-top:14px"><button class="btn btn-primary">توليد التقرير</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="newStdAssessment"){
        const p=state.patients.find(x=>x.id===id);
        if(!p){title="تعذر إيجاد الملف";body=`<div class="empty">هذا الملف لم يعد موجودًا.</div>`;}
        else{
          const firstKey=Object.keys(ASSESSMENT_INSTRUMENTS)[0];
          title="تقييم قياسي جديد — "+p.name;
          body=`<div class="notice-blue" style="margin-bottom:14px">اختاري الأداة وأدخلي درجة كل مجال حسب نسختكم المرخّصة من الأداة (المجالات هنا فئات عامة للتنظيم فقط، وليست بنود الأداة التفصيلية).</div><form onsubmit="saveStdAssessment(event,'${p.id}')"><div class="form-grid"><div class="field"><label>الأداة</label><select class="select" name="instrument" onchange="renderStdAssessDomains(this.value)">${Object.keys(ASSESSMENT_INSTRUMENTS).map(k=>`<option value="${esc(k)}">${esc(k)}</option>`).join("")}</select></div><div class="field"><label>تاريخ التقييم</label><input class="input" type="date" name="date" value="${todayISO()}" required></div></div><div id="stdAssessDomainsBox" style="margin-top:12px">${stdAssessDomainsHtml(firstKey)}</div><div class="field" style="margin-top:12px"><label>إضافة مجال مخصص <small class="hint">(اختياري)</small></label><div style="display:flex;gap:8px"><input class="input" id="stdAssessCustomDomainName" placeholder="مثال: مهارات التواصل غير اللفظي"><button type="button" class="btn btn-outline" style="width:auto;padding:9px 16px;white-space:nowrap" onclick="addCustomAssessDomain()">＋ إضافة</button></div></div><div class="field full" style="margin-top:12px"><label>ملاحظات عامة</label><textarea class="textarea" name="notes" placeholder="ملخص عام عن نتيجة هذا التقييم"></textarea></div><div class="actions" style="margin-top:14px"><button class="btn btn-primary">حفظ التقييم</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
        }
      }
      if(type==="viewStdAssessment"){
        const a=state.standardizedAssessments.find(x=>x.id===id);
        const p=a&&state.patients.find(x=>x.id===a.patientId);
        if(!a||!p){title="تعذر إيجاد التقييم";body=`<div class="empty">هذا التقييم لم يعد موجودًا.</div>`;}
        else{
          title=esc(a.instrument)+" — "+esc(p.name);
          const rows=(a.domains||[]).map(d=>`<div class="float-row"><span>${esc(d.name)}</span><b>${esc(ASSESSMENT_LEVELS[d.score]||d.score)}</b></div>`).join("");
          body=`<div class="float-row"><span>تاريخ التقييم</span><b>${date(a.date)}</b></div><div class="float-row"><span>الأخصائي/ة</span><b>${esc((personById(a.staffId)||{}).name||"—")}</b></div><div style="margin:14px 0"><div class="muted" style="margin-bottom:6px">النسبة الإجمالية</div><div style="height:9px;border-radius:99px;background:#ece4d8"><div style="height:100%;width:${assessPctOf(a)}%;background:var(--navy);border-radius:99px"></div></div><div style="text-align:end;font-weight:800;color:var(--navy);margin-top:4px">${assessPctOf(a)}%</div></div><div class="list">${rows||`<div class="empty">لا توجد مجالات مسجّلة.</div>`}</div>${a.notes?`<div class="notice" style="margin-top:14px;white-space:pre-line">${esc(a.notes)}</div>`:""}<div class="actions" style="margin-top:16px"><button type="button" class="btn btn-outline" onclick="window.print()">حفظ PDF</button><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`;
        }
      }
      if(type==="assignProgram"){
        const p=state.patients.find(x=>x.id===id);
        if(!p){title="تعذر إيجاد الملف";body=`<div class="empty">هذا الملف لم يعد موجودًا.</div>`;}
        else{
          const availableDepts=state.departments.filter(d=>(state.departmentPrograms[d.id]||[]).length>0);
          title="إسناد برنامج علاجي — "+p.name;
          if(!availableDepts.length){
            body=`<div class="empty">لا يوجد أي قسم فعّل برامج من مكتبة البرامج بعد. اطلبي من مشرف/ة القسم تفعيل البرامج أولاً من صفحة القسم.</div><div class="actions" style="margin-top:14px"><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`;
          } else {
            const firstDept=availableDepts[0].id;
            body=`<div class="notice-blue" style="margin-bottom:14px">تظهر هنا فقط البرامج التي فعّلها مشرف/ة كل قسم من مكتبة البرامج.</div><form onsubmit="saveAssignProgram(event,'${p.id}')"><div class="form-grid"><div class="field"><label>القسم</label><select class="select" name="department" onchange="renderAssignProgramOptions(this.value)">${availableDepts.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join("")}</select></div><div class="field"><label>البرنامج</label><select class="select" name="program" id="assignProgramSelect">${(state.departmentPrograms[firstDept]||[]).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("")}</select></div></div><div class="actions" style="margin-top:14px"><button class="btn btn-primary">إسناد البرنامج</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
          }
        }
      }
      if(type==="viewReport"){
        const r=state.progressReports.find(x=>x.id===id);
        if(!r){title="تعذر إيجاد التقرير";body=`<div class="empty">هذا التقرير لم يعد موجودًا.</div>`;}
        else{
          const typeLabel={family:"تقرير الأسرة",school:"تقرير المدرسة",insurance:"تقرير التأمين"}[r.reportType||"family"]||"تقرير الأسرة";
          title="تقرير تقدم — "+date(r.date);
          body=`<div style="margin-bottom:10px">${pill(typeLabel)}</div><div class="notice-blue" id="report-print-area" style="white-space:pre-line;line-height:2">${esc(r.summaryText)}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn btn-primary" onclick="window.print()">${ic("chart",14)} حفظ نسخة PDF</button><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`;
        }
      }
      if(type==="notes"){const p=state.patients.find(x=>x.id===id);title="تعديل الملاحظات السريرية";body=`<form onsubmit="saveNotes(event,'${id}')"><div class="field"><label>الملاحظات</label><textarea class="textarea" name="notes" required>${esc(p.notes)}</textarea></div><div class="actions"><button class="btn btn-primary">حفظ الملاحظات</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="editPatient"){const p=state.patients.find(x=>x.id===id);title="تعديل بيانات الملف";body=`<form onsubmit="savePatientInfo(event,'${id}')"><div class="form-grid"><div class="field"><label>اسم المستفيد</label><input class="input" name="name" value="${esc(p.name)}" required></div><div class="field"><label>العمر</label><input class="input" name="age" value="${esc(p.age)}" required></div><div class="field"><label>الاحتياج الأساسي</label><input class="input" name="need" value="${esc(p.need)}" required></div><div class="field full"><label>البرنامج</label><input class="input" name="program" value="${esc(p.program)}"></div><div class="field"><label>حالة الملف</label><select class="select" name="status"><option ${p.status==="نشط"?"selected":""}>نشط</option><option ${p.status==="متوقف مؤقتاً"?"selected":""}>متوقف مؤقتاً</option></select></div><div class="field"><label>المدرسة</label><input class="input" name="school" value="${esc(p.school)}"></div><div class="field"><label>ولي الأمر</label><input class="input" name="guardian" value="${esc(p.guardian||"")}" required></div><div class="field"><label>رقم تواصل ولي الأمر</label><input class="input" name="phone" type="tel" value="${esc(p.phone||"")}" required></div><div class="field"><label>كود وصول الأسرة</label><input class="input" name="code" value="${esc(p.code)}" required></div><div class="field"><label>كود المدرسة</label><input class="input" name="schoolCode" value="${esc(p.schoolCode||"")}"></div></div><div class="actions"><button class="btn btn-primary">حفظ التعديلات</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="editHealthBirth"){const p=state.patients.find(x=>x.id===id);const h=p.health;title="بيانات الولادة";body=`<form onsubmit="saveHealthBirth(event,'${id}')"><div class="form-grid"><div class="field"><label>تاريخ الميلاد</label><input class="input" type="date" name="birthDate" value="${esc(h.birthDate||"")}"></div><div class="field"><label>نوع الولادة</label><select class="select" name="birthType"><option value="">اختر</option><option ${h.birthType==="طبيعية"?"selected":""}>طبيعية</option><option ${h.birthType==="قيصرية"?"selected":""}>قيصرية</option><option ${h.birthType==="لا أعلم"?"selected":""}>لا أعلم</option></select></div><div class="field full"><label>مضاعفات أثناء الحمل أو الولادة</label><input class="input" name="birthNotes" value="${esc(h.birthNotes||"")}" placeholder="اتركيه فارغاً إن لم توجد"></div></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="editHearing"){const p=state.patients.find(x=>x.id===id);const hs=p.health.hearingScreening;title="فحص السمع";body=`<form onsubmit="saveHearing(event,'${id}')"><div class="form-grid"><div class="field full"><label>الحالة</label><select class="select" name="status"><option value="لم يتم بعد" ${hs.status==="لم يتم بعد"?"selected":""}>لم يتم بعد</option><option value="تم — لا توجد ملاحظات" ${hs.status==="تم — لا توجد ملاحظات"?"selected":""}>تم — لا توجد ملاحظات</option><option value="تم — توجد ملاحظات" ${hs.status==="تم — توجد ملاحظات"?"selected":""}>تم — توجد ملاحظات</option></select></div><div class="field"><label>تاريخ الفحص</label><input class="input" type="date" name="date" value="${esc(hs.date||"")}"></div><div class="field"><label>الجهة الفاحصة</label><input class="input" name="facility" value="${esc(hs.facility||"")}" placeholder="مثال: مستشفى الملك فهد"></div><div class="field full"><label>ملاحظات</label><input class="input" name="notes" value="${esc(hs.notes||"")}"></div></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="addNeuroReport"){const p=state.patients.find(x=>x.id===id);title="إضافة تقرير مخ وأعصاب — "+esc(p.name);body=`<form onsubmit="saveNeuroReport(event,'${id}')"><div class="form-grid"><div class="field"><label>تاريخ التقرير</label><input class="input" type="date" name="date" value="${todayISO()}" required></div><div class="field"><label>الجهة / المستشفى</label><input class="input" name="facility" required placeholder="مثال: مستشفى الملك عبدالعزيز"></div><div class="field full"><label>اسم الطبيب</label><input class="input" name="doctorName" placeholder="مثال: د. منى الشريف"></div><div class="field full"><label>ملخص التقرير</label><textarea class="textarea" name="summary" required placeholder="نتيجة الفحص أو التقرير التشخيصي بإيجاز"></textarea></div></div><div class="actions"><button class="btn btn-primary">إضافة التقرير</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="editPriorRehab"){const p=state.patients.find(x=>x.id===id);const pr=p.health.priorRehab;title="التأهيل قبل الالتحاق بالمركز";body=`<form onsubmit="savePriorRehab(event,'${id}')"><label class="consent-row" style="margin-bottom:10px"><input type="checkbox" name="had" ${pr.had?"checked":""}><span>الطفل تلقّى تأهيلاً قبل الالتحاق بمركزنا</span></label><div class="form-grid"><div class="field"><label>الجهة السابقة</label><input class="input" name="provider" value="${esc(pr.provider||"")}"></div><div class="field"><label>المدة</label><input class="input" name="duration" value="${esc(pr.duration||"")}" placeholder="مثال: 8 أشهر"></div><div class="field full"><label>تفاصيل</label><textarea class="textarea" name="details">${esc(pr.details||"")}</textarea></div></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="editHealthLink"){const p=state.patients.find(x=>x.id===id);const lf=p.health.linkedFacility;title="الجهة الصحية المرتبطة";body=`<div class="notice-blue" style="margin-bottom:14px">شارك رمز الربط الطبي <b>${esc(p.health.linkCode)}</b> مع المستشفى أو الطبيب المعالج ليتمكن من إرسال تقارير عبر بوابة الطبيب في أوان.</div><form onsubmit="saveHealthLink(event,'${id}')"><div class="form-grid"><div class="field"><label>اسم الجهة (مستشفى / عيادة)</label><input class="input" name="name" value="${esc(lf.name||"")}" placeholder="مثال: مستشفى الملك فهد"></div><div class="field"><label>نوع الجهة</label><select class="select" name="type"><option ${lf.type==="مستشفى"?"selected":""}>مستشفى</option><option ${lf.type==="عيادة"?"selected":""}>عيادة</option><option ${lf.type==="جهة أخرى"?"selected":""}>جهة أخرى</option></select></div><div class="field full"><label>حالة الربط</label><select class="select" name="status"><option ${lf.status==="غير مرتبط"?"selected":""}>غير مرتبط</option><option ${lf.status==="قيد الربط"?"selected":""}>قيد الربط</option><option ${lf.status==="مرتبط"?"selected":""}>مرتبط</option></select></div></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="medReferral"){const r=state.referrals[id];const p=r&&r.patientId?state.patients.find(x=>x.id===r.patientId):null;title="تقرير طبي وارد";const rows=[["الطفل",p?p.name:r&&r.name],["نوع التقرير",r&&r.category==="hearing"?"فحص سمع":"تقرير مخ وأعصاب"],["الجهة / المستشفى",r&&r.facility],["اسم الطبيب",r&&r.doctorName],["الملخص",r&&r.summary],["التاريخ",r&&r.date?date(r.date):""],["الحالة",r&&r.status]];body=`<div class="list">${rows.filter(x=>x[1]).map(x=>`<div class="float-row"><span>${x[0]}</span><b>${esc(String(x[1]))}</b></div>`).join("")}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`}
      if(type==="editSchoolNote"){const p=state.patients.find(x=>x.id===id);title="ملاحظة صحية للمدرسة";body=`<div class="notice" style="margin-bottom:14px">تظهر هذه الملاحظة للمدرسة فقط عند تفعيل خيار «مشاركة مع المدرسة» أعلاه — اكتبي ما يحتاجه المعلم فقط (حساسية، احتياجات خاصة) وليس تفاصيل طبية حساسة.</div><form onsubmit="saveSchoolNote(event,'${id}')"><div class="field"><label>الملاحظة</label><textarea class="textarea" name="schoolNote" rows="4">${esc(p.health.schoolNote||"")}</textarea></div><div class="actions"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="registration"){const r=state.registrations[id];title="تفاصيل دراسة الحالة";const rows=[["الطفل",r.child],["تاريخ الميلاد / العمر",r.age],["الجنس",r.gender],["الجنسية",r.nationality],["ولي الأمر",r.guardian],["صلة القرابة",r.relation],["رقم التواصل",r.phone],["البريد الإلكتروني",r.email],["نوع الولادة",r.birthType],["مضاعفات الحمل / الولادة",r.birthNotes],["عمر الجلوس بدون مساعدة",r.milestoneSitting],["عمر المشي",r.milestoneWalking],["عمر أول كلمة",r.milestoneFirstWord],["عمر تكوين الجملة",r.milestoneSentence],["فحص السمع",r.hearingChecked],["فحص البصر",r.visionChecked],["أمراض مزمنة / حساسية",r.chronic],["أدوية حالية",r.medications],["حالات مشابهة في العائلة",r.familyHistory],["تقييم سابق في مركز آخر",r.priorEval],["تفاصيل التقييم السابق",r.priorEvalDetails],["مصدر التحويل",r.referralSource],["وصف الحالة / الاحتياج",r.reason],["الوقت المفضل للتواصل",r.contactTime],["طريقة التواصل المفضلة",r.contactMethod],["حالة الطلب",r.status],["تاريخ الطلب",r.date?date(r.date):""]];body=`<div class="list">${rows.filter(x=>x[1]).map(x=>`<div class="float-row"><span>${x[0]}</span><b>${esc(String(x[1]))}</b></div>`).join("")}</div><div class="actions" style="margin-top:16px"><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`}
      if(type==="reschedule"){const b=state.sessionBookings.find(x=>x.id===id);title="تأجيل الحجز";body=`<p class="muted">${esc(b.specialist)} · السعر ${b.price} ر.س (لن يتغيّر)</p><form onsubmit="confirmReschedule(event,'${id}')"><div class="form-grid"><div class="field"><label>التاريخ الجديد</label><input class="input" type="date" name="day" value="${b.day}" required></div><div class="field"><label>الوقت الجديد</label><input class="input" type="time" name="time" value="${b.time}" required></div></div><div class="actions"><button class="btn btn-primary">تأكيد التأجيل</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="about"){title=t("aboutTitle");body=`<p class="muted" style="line-height:1.9">${esc(t("aboutBody"))}</p><div class="actions" style="margin-top:14px"><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`}
      if(type==="support"){title=t("supportTitle");body=`<p class="muted" style="line-height:1.9">${esc(t("supportBody"))}</p><div class="list" style="margin-top:10px"><div class="list-row"><div class="list-main"><strong>${ic("idcard",14)} ${esc(state.center.phone)}</strong></div></div><div class="list-row"><div class="list-main"><strong>${ic("bell",14)} ${esc(state.center.email)}</strong></div></div></div><div class="actions" style="margin-top:14px"><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`}
      if(type==="package"){const pkg=state.packages.find(x=>x.id===id);title="تأكيد شراء "+pkg.name;body=`<p class="muted">${pkg.sessions} جلسة · ${pkg.price} ر.س (${Math.round(pkg.price/pkg.sessions)} ر.س للجلسة)</p><form onsubmit="confirmPackagePurchase(event,'${id}')"><div class="field"><label>طريقة الدفع</label><select class="select" name="payment"><option>Apple Pay</option><option>مدى</option><option>تابي</option><option>تمارا</option></select></div><div class="actions"><button class="btn btn-primary">تأكيد الشراء والدفع</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="roleSwitcher"){title="اختيار الدور وتسجيل الدخول";body=rolePicker();}
      if(type==="familyService"){title="إضافة خدمة جديدة لبوابة الأسرة";body=`<form onsubmit="addFamilyService(event)"><div class="form-grid"><div class="field full"><label>اسم الخدمة</label><input class="input" name="title" required placeholder="مثال: ورشة تدريب أولياء الأمور"></div><div class="field full"><label>وصف مختصر يظهر للأسرة</label><textarea class="textarea" name="desc" required placeholder="مثال: جلسة شهرية تدرّب فيها أولياء الأمور على أساليب التعامل مع طفلهم في البيت."></textarea></div><div class="field"><label>الأيقونة</label><select class="select" name="icon"><option value="heart">قلب</option><option value="idea">فكرة</option><option value="medical">طبي</option><option value="book">كتاب</option><option value="question">سؤال</option><option value="bell">جرس</option><option value="globe">عام</option><option value="speech">تواصل</option></select></div><div class="field"><label>نص زر الطلب</label><input class="input" name="cta" placeholder="إرسال الطلب"></div></div><div class="actions"><button class="btn btn-primary">إضافة الخدمة</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`}
      if(type==="entryGate"){
        title="";
        body=`<div style="display:flex;flex-wrap:wrap;margin:-18px -23px -23px;border-radius:0 0 18px 18px;overflow:hidden;min-height:320px">
          <div style="flex:1 1 240px;background:linear-gradient(160deg,var(--navy),#0a5a61);color:#fff;padding:30px 26px;display:flex;flex-direction:column;justify-content:center;gap:16px">
            <div style="display:flex;align-items:center;gap:10px">${mark(34)}<div><strong style="font-size:16px;display:block">${esc(t("brandName"))}</strong><small style="color:rgba(255,255,255,.72)">${esc(t("brandTag"))}</small></div></div>
            <div style="font-size:12.5px;line-height:1.8;color:rgba(255,255,255,.85)">منظومة متابعة وتأهيل متكاملة — لكل مركز ولكل أسرة.</div>
            <ul style="list-style:none;padding:0;margin:6px 0 0;display:flex;flex-direction:column;gap:11px;font-size:12.5px">
              <li style="display:flex;align-items:center;gap:8px">${ic("check",14)} جدول مواعيد وحضور موحد</li>
              <li style="display:flex;align-items:center;gap:8px">${ic("check",14)} فريقكم المختص معكم خطوة بخطوة</li>
              <li style="display:flex;align-items:center;gap:8px">${ic("check",14)} تقارير وخطط رقمية بتوصل للأسرة على البوابة</li>
            </ul>
          </div>
          <div style="flex:1.3 1 300px;background:#fff;padding:30px 26px;display:flex;flex-direction:column;justify-content:center;gap:13px">
            <div style="margin-bottom:2px"><h3 style="margin:0 0 4px;font-size:16px">اختاري طريقة الدخول</h3><p class="muted" style="margin:0">من هنا تقدري تدخلي بوابة الأسرة أو تسجّلي مركزك.</p></div>
            <div class="role-card" onclick="closeModal();goPublic('parent')" style="cursor:pointer">
              <span class="role-icon">${ic("team",20)}</span>
              <b>أوان الأسرة</b>
              <small>متابعة ملف طفلك والحجوزات والتواصل مع المركز</small>
            </div>
            <div class="role-card" onclick="openModal('entryGateOrg')" style="cursor:pointer">
              <span class="role-icon">${ic("briefcase",20)}</span>
              <b>أوان الأعمال</b>
              <small>دخول فريق المركز أو المؤسسة إلى لوحة التحكم</small>
            </div>
          </div>
        </div>`;
      }
      if(type==="entryGateOrg"){
        const draft=state.orgProfileDraft||{};
        const fp=state.featuredPartner;
        const logo=draft.logo!==undefined?draft.logo:(fp?fp.logo:null);
        title="";
        body=`<div style="display:flex;flex-wrap:wrap;margin:-18px -23px -23px;border-radius:0 0 18px 18px;overflow:hidden;min-height:380px">
          <div style="flex:1 1 240px;background:linear-gradient(160deg,var(--navy),#0a5a61);color:#fff;padding:30px 26px;display:flex;flex-direction:column;justify-content:center;gap:16px">
            <div style="display:flex;align-items:center;gap:10px">${mark(34)}<div><strong style="font-size:16px;display:block">${esc(t("brandName"))}</strong><small style="color:rgba(255,255,255,.72)">أوان الأعمال</small></div></div>
            <div style="font-size:12.5px;line-height:1.8;color:rgba(255,255,255,.85)">بيانات مركزك وشعاره هيظهروا جنب شعار أوان، عشان تتأكدي إن مركزك مسجّل معانا.</div>
          </div>
          <div style="flex:1.3 1 300px;background:#fff;padding:30px 26px;display:flex;flex-direction:column;justify-content:center;gap:13px;max-height:74vh;overflow:auto">
            <h3 style="margin:0 0 4px;font-size:16px">بيانات مركزك</h3>
            <form onsubmit="bizEnterOrg(event)">
              <div class="field"><label>اسم المركز / المستشفى</label><input class="input" name="orgName" required value="${esc(fp?fp.orgName:"")}"></div>
              <div class="field" style="margin-top:10px"><label>نوع المؤسسة</label><select class="select" name="orgType">${["مركز","عيادة","مستشفى","مدرسة"].map(t2=>`<option ${(fp?fp.orgType:"مركز")===t2?"selected":""}>${t2}</option>`).join("")}</select></div>
              <div class="field" style="margin-top:10px"><label>الموقع / المدينة</label><input class="input" name="location" value="${esc((fp&&fp.location)||"")}" placeholder="مثال: جدة"></div>
              <div class="field" style="margin-top:10px">
                <label>شعار المركز <small class="hint">(اختياري)</small></label>
                <input class="input" type="file" accept="image/*" onchange="bizPreviewLogo(this)">
                <div id="bizLogoPreview" style="margin-top:10px;display:flex;align-items:center;gap:10px">${logo?`<img src="${logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;border:1px solid var(--line)"><button type="button" class="btn btn-outline" style="width:auto;padding:6px 12px;font-size:11px" onclick="bizClearLogo()">إزالة الشعار</button>`:""}</div>
              </div>
              <div class="actions"><button class="btn btn-primary">حفظ والدخول للوحة القيادة</button><button type="button" class="btn btn-outline" onclick="openModal('entryGate')">رجوع</button></div>
            </form>
            <div id="admin-result"></div>
          </div>
        </div>`;
      }
      if(type==="libraryArticle"){
        const a=state.libraryArticles.find(x=>x.id===id);
        if(!a){title="تعذر إيجاد المحتوى";body=`<div class="empty">هذا المحتوى لم يعد موجودًا.</div>`;}
        else{
          title=a.title;
          const isVideo=a.type==="فيديو تعليمي";
          body=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${libCategoryTag(a.category)}<span class="lib-card-type" style="background:#f1f5f9;color:#475569">${ic(libraryTypeIcon(a.type),12)} ${esc(a.type)}</span></div>${isVideo?`<div class="notice" style="margin-bottom:14px">${ic("video",14)} <b>فيديو قيد الإعداد:</b> هذا المحتوى سيكون متاحًا كفيديو قريبًا — في الوقت الحالي، الملخص النصي التالي متاح للاستفادة الفورية.</div>`:""}<p style="line-height:1.9;white-space:pre-line">${esc(a.body||a.summary||"")}</p><div class="float-row" style="margin-top:14px"><span>الكاتب/ة</span><b>${esc(a.author||"—")}${a.authorRole?" — "+esc(a.authorRole):""}</b></div><div class="float-row"><span>تاريخ النشر</span><b>${date(a.publishDate)}</b></div><div class="actions" style="margin-top:16px"><button type="button" class="btn btn-outline" onclick="closeModal()">إغلاق</button></div>`;
        }
      }
      if(type==="newLibraryArticle"){
        title="إضافة محتوى جديد للمكتبة";
        body=`<form onsubmit="addLibraryArticle(event)"><div class="form-grid"><div class="field"><label>الفئة المستهدفة</label><select class="select" name="audience"><option value="family">الأسر</option><option value="practitioner">الأخصائيين</option></select></div><div class="field"><label>نوع المحتوى</label><select class="select" name="type"><option value="مقالة">مقالة</option><option value="نشاط منزلي">نشاط منزلي</option><option value="فيديو تعليمي">فيديو تعليمي</option></select></div><div class="field full"><label>عنوان المحتوى</label><input class="input" name="title" required></div><div class="field"><label>التصنيف</label><input class="input" name="category" required placeholder="مثال: نطق ولغة"></div><div class="field"><label>الكلمات الدالة (افصل بينها بفاصلة)</label><input class="input" name="tags" placeholder="مثال: نطق, تسمية, جمل"></div><div class="field full"><label>ملخص قصير</label><input class="input" name="summary" placeholder="سطر أو سطرين يظهران في البطاقة"></div><div class="field full"><label>المحتوى الكامل</label><textarea class="textarea" name="body" required placeholder="النص الكامل للمقالة أو خطوات النشاط"></textarea></div></div><div class="notice" style="margin:10px 0">سيُنسب هذا المحتوى تلقائيًا باسمك، وإن كان فيديو سيظهر بحالة «قريبًا» حتى يتم رفعه فعليًا.</div><div class="actions"><button class="btn btn-primary">حفظ ونشر</button><button type="button" class="btn btn-outline" onclick="closeModal()">إلغاء</button></div></form>`;
      }
      const modalWideStyle=(type==="entryGate"||type==="entryGateOrg")?" style=\"width:min(880px,100%)\"":"";
      m.innerHTML=`<div class="modal"${modalWideStyle}><div class="modal-head"><h2>${title}</h2><button class="close" onclick="closeModal()">×</button></div>${body}</div>`;m.classList.add("open")
    }
    function closeModal(){document.getElementById("modal").classList.remove("open")}
    function aptPhoneFor(name){const p=state.patients.find(x=>x.name===name);return p?p.phone||"":""}
    function formData(e){return Object.fromEntries(new FormData(e.target).entries())}
    // One-click institutional reporting: same session data, composed into a
    // different structure/tone per recipient — a simplified update for
    // families, a formal classroom-facing note for schools, or a structured
    // clinical summary for insurers — all generated locally in one click.
    function composeProgressReportText(patient,staff,data){
      const type=data.reportType||"family";
      const levelPhrase={"ممتاز":"تقدمًا ملحوظًا ومتسارعًا","جيد جدًا":"تقدمًا جيدًا جدًا وثباتًا واضحًا في الأداء","جيد":"تقدمًا جيدًا ومقبولًا خلال هذه الفترة","يحتاج دعمًا إضافيًا":"تقدمًا أبطأ من المتوقع ويحتاج دعمًا إضافيًا وتكثيفًا في التمارين المنزلية"}[data.level]||"تقدمًا ملموسًا";
      const staffLine=staff?staff.name+(staff.role?" — "+staff.role:""):"فريق "+state.center.name;
      if(type==="school"){
        const opener=`تقرير متابعة مدرسي — ${patient.name}\nالمدرسة: ${patient.school||"—"} · التاريخ: ${date(data.date)}`;
        const body=`بصفة ${state.center.name} الجهة المشرفة على البرنامج العلاجي لـ${patient.name} (${patient.need||"—"})، نفيدكم بأن أداء الطالب/ة داخل جلسات المركز خلال هذه الفترة كان ${levelPhrase}.`;
        const goalsLine=data.achievedGoals?`من أبرز ما تحقق: ${data.achievedGoals}.`:"";
        const classNote=`توصيات للتعامل داخل الفصل الدراسي: ${data.notes||"الاستمرار في نفس أسلوب الدعم الحالي داخل الفصل، مع التواصل مع المركز عند ملاحظة أي تغيّر."}`;
        const closing=`نرحب بالتنسيق المباشر مع الكادر التعليمي لأي استفسار.\n\nمُعد/ة التقرير: ${staffLine}\n${state.center.name}`;
        return [opener,body,goalsLine,classNote,closing].filter(Boolean).join("\n\n");
      }
      if(type==="insurance"){
        const opener=`تقرير علاجي — لأغراض التأمين\nاسم المستفيد: ${patient.name} · رقم الملف: ${patient.file||"—"}\nالتاريخ: ${date(data.date)}`;
        const diagLine=`الاحتياج/التشخيص: ${patient.need||"—"}\nالبرنامج العلاجي المعتمد: ${patient.program||"—"}`;
        const body=`بناءً على المتابعة السريرية المستمرة، أظهر/ت المستفيد/ة خلال فترة هذا التقرير ${levelPhrase}، ضمن خطة علاجية معتمدة ومبنية على أسس تحليل السلوك التطبيقي (ABA) ومقاييس التطور اللغوي (Speech-Map).`;
        const goalsLine=data.achievedGoals?`نتائج مُحقّقة خلال الفترة: ${data.achievedGoals}.`:"";
        const notesLine=data.notes?`ملاحظات إكلينيكية: ${data.notes}`:"";
        const closing=`التوصية: الاستمرار في تغطية جلسات البرنامج العلاجي الحالي وفق الخطة المعتمدة.\n\nمُعد/ة التقرير: ${staffLine}\n${state.center.name}${state.municipalLicense&&state.municipalLicense.requestNumber?" — رقم الترخيص/الطلب: "+state.municipalLicense.requestNumber:""}`;
        return [opener,diagLine,body,goalsLine,notesLine,closing].filter(Boolean).join("\n\n");
      }
      // family (default) — simplified, warm tone
      const opener=`تقرير متابعة تقدم — ${patient.name}\nالتاريخ: ${date(data.date)} · البرنامج: ${patient.program||"—"}`;
      const body=`أظهر/ت ${patient.name} خلال هذه الفترة ${levelPhrase}، وذلك في إطار الخطة العلاجية المعتمدة والمبنية على أسس تحليل السلوك التطبيقي (ABA) ومقاييس التطور اللغوي (Speech-Map).`;
      const goalsLine=data.achievedGoals?`من أبرز ما تحقق خلال هذه الفترة: ${data.achievedGoals}.`:"";
      const notesLine=data.notes?`ملاحظات الأخصائي/ة: ${data.notes}`:"";
      const closing=`نوصي بالاستمرار على نفس الخطة العلاجية الحالية مع المتابعة الدورية، وسيتم تحديثكم بأي تطورات إضافية أولًا بأول.\n\nمُعد/ة التقرير: ${staffLine}`;
      return [opener,body,goalsLine,notesLine,closing].filter(Boolean).join("\n\n");
    }
    function generateProgressReport(e,patientId){
      e.preventDefault();
      const f=formData(e);
      const patient=state.patients.find(x=>x.id===patientId);
      if(!patient)return;
      const staff=getCurrentPerson();
      const data={date:f.date,level:f.level,achievedGoals:f.achievedGoals,notes:f.notes,reportType:f.reportType||"family"};
      const summaryText=composeProgressReportText(patient,staff,data);
      state.progressReports.unshift({id:"pr-"+Date.now(),patientId,patientName:patient.name,date:data.date,level:data.level,achievedGoals:data.achievedGoals,notes:data.notes,reportType:data.reportType,summaryText,staffId:staff?staff.id:null,staffName:staff?staff.name:null,shared:!!f.shared});
      persist();closeModal();notify("تم توليد تقرير التقدم بنجاح");render();
    }
    function toggleReportShare(id){const r=state.progressReports.find(x=>x.id===id);if(!r)return;r.shared=!r.shared;persist();notify(r.shared?"تمت مشاركة التقرير مع الأسرة":"تم إخفاء التقرير عن الأسرة");render()}
    // ---- Predictive Generalization Engine: log handlers ----
    function submitSessionLog(e,patientId){
      e.preventDefault();
      const f=formData(e);
      const staff=getCurrentPerson();
      state.sessionLogs.unshift({id:"sl-"+Date.now(),patientId,date:f.date,goalText:f.goalText,result:f.result,notes:f.notes||"",staffId:staff?staff.id:null,staffName:staff?staff.name:(state.role==="management"?"الإدارة":"فريق "+state.center.name)});
      persist();closeModal();notify("تم تسجيل أداء الجلسة");render();
    }
    function submitHomeLog(e,patientId){
      e.preventDefault();
      const f=formData(e);
      state.homeLogs.unshift({id:"hl-"+Date.now(),patientId,date:f.date||todayISO(),goalText:f.goalText,result:f.result,notes:f.notes||"",loggedBy:"parent"});
      persist();notify("تم تسجيل ملاحظتكم، شكرًا لمتابعتكم!");render();
    }
    // ---- Voice-to-Data Assistant (field technician quick-log) ----
    // Uses the browser's built-in Web Speech API when available (runs locally
    // in the browser, no audio is uploaded anywhere); falls back to plain
    // typing in the same textarea when unsupported. The "analyze" step is a
    // small, transparent keyword parser — not an external AI call — that
    // pre-fills the result field from the transcript so the specialist can
    // review and correct it before saving.
    let _voiceRecognition=null;
    function startVoiceCapture(){
      const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!Rec){notify("التعرف الصوتي غير مدعوم في هذا المتصفح — يمكنك الكتابة يدويًا في المربع");return;}
      try{
        _voiceRecognition=new Rec();
        _voiceRecognition.lang="ar-SA";
        _voiceRecognition.continuous=true;
        _voiceRecognition.interimResults=true;
        _voiceRecognition.onresult=(ev)=>{
          let text="";
          for(let i=0;i<ev.results.length;i++) text+=ev.results[i][0].transcript;
          const ta=document.getElementById("voice-transcript");
          if(ta) ta.value=text;
        };
        _voiceRecognition.onerror=()=>{notify("تعذّر التقاط الصوت — تحقّقي من إذن الميكروفون");};
        _voiceRecognition.start();
        notify("🎤 جارِ الاستماع... تحدثي الآن");
      }catch(err){notify("تعذّر بدء التسجيل الصوتي في هذا المتصفح");}
    }
    function stopVoiceCapture(){
      if(_voiceRecognition){ try{_voiceRecognition.stop();}catch(err){} _voiceRecognition=null; notify("تم إيقاف التسجيل الصوتي"); }
    }
    function analyzeVoiceNote(patientId){
      const ta=document.getElementById("voice-transcript");
      const text=(ta?ta.value:"").trim();
      const notesEl=document.querySelector('#modal [name=notes]');
      const resultEl=document.querySelector('#modal [name=result]');
      if(notesEl) notesEl.value=text;
      if(resultEl && text){
        let guess="نجاح جزئي";
        if(/لم ينجح|ما قدرش|ما استطاع|رفض|صعوبة كبيرة|لم يستطع/.test(text)) guess="لم ينجح بعد";
        else if(/نجح بالكامل|بدون مساعدة|بمفرده|بثقة|كامل/.test(text)) guess="نجاح كامل";
        else if(/نجح|قدر|استطاع|تحسن/.test(text)) guess="نجاح جزئي";
        resultEl.value=guess;
      }
      notify(text?"تم تحليل النص وتعبئة النموذج — راجعي النتيجة قبل الحفظ":"لم يتم تسجيل أي نص بعد");
    }
    function viewProgressReport(id){openModal('viewReport',id)}
    // ==== نظام "طلب تقييمات حقيقية" (أوان × n8n × واتساب × جوجل ماب) ====
    // استبدلي الرابط ده برابط Webhook الفعلي من n8n (نود الـ Webhook فى awan_intake_webhook.json)
    const AWAN_REVIEW_WEBHOOK_URL = "https://YOUR-N8N-DOMAIN/webhook/awan-new-family";
    function toIntlWhatsapp(phone){
      let d=String(phone||"").replace(/[^0-9]/g,"");
      if(!d) return "";
      if(d.startsWith("966")) return d;
      if(d.startsWith("0")) return "966"+d.slice(1);
      return "966"+d;
    }
    function sendFamilyToReviewQueue(patient){
      // اتصل بيه فقط لو ولي الأمر وافق صراحة على التواصل
      if(!patient||!patient.consentReviewContact) return;
      const webhookUrl=(state.reviewSettings&&state.reviewSettings.webhookUrl)||AWAN_REVIEW_WEBHOOK_URL;
      fetch(webhookUrl,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          child_id:patient.id,
          child_name:patient.name,
          parent_name:patient.guardian||"",
          whatsapp_number:toIntlWhatsapp(patient.phone), // بصيغة 9665xxxxxxxx بدون +
          center_name:state.center&&state.center.name?state.center.name:"",
          enrollment_date:todayISO(),
          consent:true
        })
      }).catch(function(err){ console.warn("تعذّر إرسال بيانات ولي الأمر لنظام التقييمات:", err); });
    }
    function addPatient(e){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية إضافة الملفات");return}const f=formData(e),id="p"+Date.now();const newPatient={id,name:f.name,file:"AWN-"+String(1000+state.patients.length+1),age:f.age,need:f.need,program:f.program,school:f.school,guardian:f.guardian,phone:f.phone,status:f.status||"نشط",notes:"لم تتم إضافة ملاحظات بعد.",goal:"سيتم تحديد الهدف بعد التقييم الأولي.",next:"2026-09-08T09:00",code:"LOCAL-"+id.slice(-4),archived:false,consentReviewContact:!!f.consentReviewContact,reviewRequestedCount:0,lastReviewRequestDate:null,hasReviewed:false};newPatient.health=defaultHealth(newPatient);state.patients.unshift(newPatient);sendFamilyToReviewQueue(newPatient);persist();closeModal();notify("تمت إضافة الملف بنجاح");render()}
    function findAppointmentConflict(dateVal,timeVal,clinician,room,excludeId){return state.appointments.find(a=>a.id!==excludeId&&a.date===dateVal&&a.time===timeVal&&a.status!=="ملغي"&&(a.clinician===clinician||a.room===room))}
    function addAppointment(e){e.preventDefault();if(!can('editAppointments')){closeModal();notify("لا تملكين صلاحية حجز المواعيد");return}const f=formData(e);const conflict=findAppointmentConflict(f.date,f.time,f.clinician,f.room,null);if(conflict){notify(`⚠️ تعارض في الجدول: ${conflict.clinician===f.clinician?"المعالج/ة "+f.clinician:"الغرفة "+f.room} محجوز/ة بالفعل في نفس الموعد مع ${conflict.patient} — عدّلي الوقت أو الغرفة`);return}state.appointments.push({id:"apt-"+Date.now(),...f,status:"مجدول",newForStaff:true});persist();closeModal();notify("تم حجز الجلسة");render()}
    function saveAppointment(e,id){e.preventDefault();if(!can('editAppointments')){closeModal();notify("لا تملكين صلاحية تعديل المواعيد");return}const f=formData(e);const conflict=findAppointmentConflict(f.date,f.time,f.clinician,f.room,id);if(conflict){notify(`⚠️ تعارض في الجدول: ${conflict.clinician===f.clinician?"المعالج/ة "+f.clinician:"الغرفة "+f.room} محجوز/ة بالفعل في نفس الموعد مع ${conflict.patient} — عدّلي الوقت أو الغرفة`);return}const a=state.appointments.find(x=>x.id===id);if(a){Object.assign(a,f);persist();closeModal();notify("تم تحديث الموعد");render()}}
    function deleteAppointment(id){if(!can('editAppointments')){notify("لا تملكين صلاحية حذف المواعيد");return}const a=state.appointments.find(x=>x.id===id);if(a&&confirm(`سيتم حذف موعد ${a.patient} يوم ${date(a.date)} نهائيًا. هل أنتِ متأكدة؟`)){state.appointments=state.appointments.filter(x=>x.id!==id);persist();notify("تم حذف الموعد");render()}}
    function confirmCompensation(e,origId){e.preventDefault();if(!can('editAppointments')){closeModal();notify("لا تملكين صلاحية جدولة التعويضات");return}const f=formData(e);const orig=state.appointments.find(x=>x.id===origId);if(!orig)return;state.appointments.push({id:"apt-"+Date.now(),date:f.date,time:f.time,patient:orig.patient,service:orig.service,clinician:f.clinician,room:f.room,phone:orig.phone||"",status:"مجدول",compensationFor:origId,newForStaff:true});orig.compensated=true;persist();closeModal();notify("تم جدولة جلسة التعويض بنجاح");render()}

    function addReferral(e){e.preventDefault();const f=formData(e);state.referrals.unshift({...f,status:"جديدة",date:"2026-09-02"});persist();closeModal();notify("أضيفت الإحالة إلى الصندوق");render()}
    function addStaff(e){e.preventDefault();const f=formData(e);const id="st-"+Date.now();const roleCategory=f.roleCategory||"staff";const code=genStaffCode(f.name);const clinical=roleCategory==="staff"||roleCategory==="supervisor";state.staff.push({...f,id,code,roleCategory,clinical,department:f.department||null,status:"متاح",present:false});persist();closeModal();notify(`تمت إضافة الموظف — كود الدخول: ${code}`);render()}
    function addDepartment(e){e.preventDefault();if(!can('editDepartments')){closeModal();notify("لا تملكين صلاحية إضافة الأقسام");return}const f=formData(e);state.departments.push({id:"local-"+Date.now(),icon:f.icon||"✨",name:f.name,desc:f.desc,state:"جاهز",services:f.services||"تخصيص الخدمات لاحقاً"});persist();closeModal();notify("تمت إضافة القسم");render()}
    function saveDepartmentInfo(e,id){e.preventDefault();if(!can('editDepartments')){closeModal();notify("لا تملكين صلاحية تعديل الأقسام");return}const f=formData(e);const d=state.departments.find(x=>x.id===id);if(d){Object.assign(d,{name:f.name,desc:f.desc,state:f.state,services:f.services});persist();closeModal();notify("تم تحديث بيانات القسم");render()}}
    function saveNotes(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملاحظات");return}const p=state.patients.find(x=>x.id===id);p.notes=new FormData(e.target).get("notes");persist();closeModal();notify("تم حفظ الملاحظات السريرية");render()}
    function savePatientInfo(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملفات");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(p){Object.assign(p,{name:f.name,age:f.age,need:f.need,program:f.program,school:f.school,guardian:f.guardian,phone:f.phone,status:f.status,code:f.code,schoolCode:f.schoolCode});persist();closeModal();notify("تم حفظ تعديلات الملف");render()}}
    function saveHealthBirth(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملف الصحي");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(!p)return;Object.assign(p.health,{birthDate:f.birthDate||"",birthType:f.birthType||"",birthNotes:f.birthNotes||""});persist();closeModal();notify("تم حفظ بيانات الولادة");render()}
    function saveHearing(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملف الصحي");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(!p)return;p.health.hearingScreening={status:f.status,date:f.date||"",facility:f.facility||"",notes:f.notes||""};persist();closeModal();notify("تم حفظ بيانات فحص السمع");render()}
    function saveNeuroReport(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملف الصحي");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(!p)return;p.health.neuroReports.unshift({id:"nr-"+Date.now(),date:f.date,facility:f.facility,doctorName:f.doctorName||"",summary:f.summary});persist();closeModal();notify("تمت إضافة التقرير");render()}
    function deleteNeuroReport(patientId,reportId){if(!can('editPatients')){notify("لا تملكين صلاحية تعديل الملف الصحي");return}const p=state.patients.find(x=>x.id===patientId);if(!p)return;p.health.neuroReports=p.health.neuroReports.filter(r=>r.id!==reportId);persist();notify("تم حذف التقرير");render()}
    function savePriorRehab(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملف الصحي");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(!p)return;p.health.priorRehab={had:!!f.had,provider:f.provider||"",duration:f.duration||"",details:f.details||""};persist();closeModal();notify("تم حفظ بيانات التأهيل السابق");render()}
    function saveHealthLink(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملف الصحي");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(!p)return;p.health.linkedFacility={name:f.name||"",type:f.type||"مستشفى",status:f.status||"غير مرتبط"};persist();closeModal();notify("تم حفظ بيانات الجهة المرتبطة");render()}
    function toggleHealthShare(id,field,checked){const p=state.patients.find(x=>x.id===id);if(!p)return;p.health[field]=!!checked;persist();notify(checked?"تم تفعيل المشاركة":"تم إيقاف المشاركة");render()}
    function saveSchoolNote(e,id){e.preventDefault();if(!can('editPatients')){closeModal();notify("لا تملكين صلاحية تعديل الملف الصحي");return}const f=formData(e);const p=state.patients.find(x=>x.id===id);if(!p)return;p.health.schoolNote=f.schoolNote||"";persist();closeModal();notify("تم حفظ ملاحظة المدرسة");render()}
    function archivePatient(id){if(!can('editPatients')){notify("لا تملكين صلاحية أرشفة الملفات");return}const p=state.patients.find(x=>x.id===id);if(p){p.archived=true;persist();notify(`تم نقل ملف ${p.name} إلى الأرشيف`);render()}}
    function restorePatient(id){if(!can('editPatients')){notify("لا تملكين صلاحية استعادة الملفات");return}const p=state.patients.find(x=>x.id===id);if(p){p.archived=false;persist();notify(`تمت استعادة ملف ${p.name} من الأرشيف`);render()}}
