"use strict";
// أوان — الجزء 27: بيانات تجريبية للاختبار — 5 أطفال في كل قسم
// كل طفل: أخصائي أساسي، جدول أسبوعي ثابت (2–3 جلسات)، 4 أسابيع جلسات سابقة بنتائج أهداف تتحسن،
// تسجيلات من البيت، أهداف وخطة معتمدة، باقة وفاتورة، وتقرير تقدم شهري — ومواعيد جاية 3 أسابيع.
// يشتغل مرة وحدة على «مركز الرعاية النموذجي» ويوقف مولّد الأيام القديم (الجزء 15).

    const DS_VER="v41";
    const DS_KIDS={
      speech:[["علي ناصر القحطاني","ALI-1001"],["خالد سعود المطيري"],["لين محمد الغامدي"],["منيرة عبدالعزيز الدوسري"],["ريان عبدالله الزهراني"]],
      skills:[["يزن علي الدوسري"],["رهف ناصر المالكي"],["غلا تركي السبيعي"],["مهند سامي العمري"],["تالا ماجد القحطاني"]],
      aba:[["حمزة يوسف البقمي"],["دانة صالح الجهني"],["عمر وليد الحارثي"],["ميار خالد الرشيدي"],["سعد بندر المطيري"]],
      psych:[["تميم سلطان القرني"],["شهد ماجد العسيري"],["إياد حسن العتيبي"],["لمى هشام المطيري"],["فيصل حمد الشمري"]],
      ot:[["ريما إبراهيم السهلي"],["زياد مشعل الحربي"],["أسيل عادل الغامدي"],["نواف فهد الشمراني"],["جنى أحمد العنزي"]],
      vocational:[["معاذ رائد الدوسري"],["سارا نايف القحطاني"],["بدر سعيد الزهراني"],["ليان عمر الزهراني"],["عبدالرحمن سعد الحربي"]],
      inclusion:[["هيا فارس الشهري"],["ركان عبدالعزيز العنزي"],["وتين مازن الحربي"],["جود فهد الشهري"],["سلمان خالد العتيبي"]],
      classrooms:[["ريتاج منصور العمري"],["أنس طلال القحطاني"],["جوان فيصل الدوسري"],["مازن خالد السهلي"],["لجين بندر الحربي"]]
    };
    const DS_GOALS={
      speech:["يطلب 10 أشياء مفضلة بكلمة واحدة","ينفذ أمرًا من خطوتين في 4 من 5 فرص","يسمّي 20 صورة لأشياء مألوفة","ينطق صوت /س/ في بداية الكلمة بدقة 80%","يكوّن جملة من 3 كلمات لوصف صورة"],
      skills:["يغسل يديه باستقلالية بخطوات صحيحة","يلبس الحذاء باستقلالية","يرتب أدواته بعد النشاط","يأكل بالملعقة دون انسكاب","يطوي ملابسه البسيطة"],
      aba:["يجلس على الطاولة لمهمة منظمة 5 دقائق","يستجيب لاسمه بالنظر في 4 من 5 فرص","يقلد 10 حركات كبيرة عند النمذجة","يطلب الاستراحة بكارت بدل السلوك المعيق","يطابق 10 صور متطابقة"],
      psych:["يسمّي 4 مشاعر من الصور","يستخدم التنفس العميق عند الغضب","يتبادل الحديث مع زميل 3 دورات","ينتظر دوره في لعبة جماعية","يعبّر عن رفضه بكلمة بدل البكاء"],
      ot:["يمسك القلم بمسكة ثلاثية لنسخ خطوط","يقص على خط مستقيم 10 سم","يتحمل الأرجوحة 3 دقائق بدون انسحاب","يزرر 3 أزرار كبيرة باستقلالية","يركّب بازل من 6 قطع"],
      vocational:["ينجز مهمة فرز من 20 قطعة","يلتزم بجدول مهام مصوّر 15 دقيقة","يدفع ثمن شراء بسيط بالنقود","يجهّز وجبة خفيفة بخطوات مصوّرة","يرد على الهاتف بعبارة مناسبة"],
      inclusion:["يقرأ كلمات من 3 حروف بدقة 80%","يكتب اسمه من الذاكرة","يجمع أعدادًا ضمن 10","يرفع يده قبل الكلام في الحصة","يكمل ورقة عمل 10 دقائق بدون تذكير"],
      classrooms:["يجلس في الحلقة 10 دقائق","يتبع روتين الصباح المصوّر","يشارك زميله في لعبة","يختار نشاطه من لوحة الاختيار","ينتقل بين الأنشطة بدون نوبة"]
    };
    const DS_NEED={speech:"تأخر لغوي",skills:"احتياج لمهارات الاستقلالية",aba:"اضطراب طيف التوحد",psych:"صعوبات انفعالية وانتباه",ot:"صعوبات حسية حركية",vocational:"تأهيل مهني",inclusion:"صعوبات تعلم",classrooms:"دعم صفي"};
    const DS_AGE={speech:[3,6],skills:[5,9],aba:[3,7],psych:[6,11],ot:[4,8],vocational:[13,17],inclusion:[6,10],classrooms:[5,8]};
    const DS_PATS=[[0,2,4],[1,3],[0,3],[1,2,4],[2,4]]; // أيام الأسبوع (الأحد=0)

    function dsIsDemo(){return state.center&&state.center.name==="مركز الرعاية النموذجي"}
    function dsDateAdd(d,n){const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return localDateOf(x)}
    function dsDow(d){return new Date(d+"T12:00:00").getDay()}
    function dsPct(ki,gi,w){return Math.min(96,30+((ki*7+gi*13)%30)+w*11+((ki+gi+w)%3)*3)}
    function dsRes(p){return p>=80?"نجاح كامل":p>=50?"نجاح جزئي":"لم ينجح بعد"}
    function dsSvc(d){return (typeof EV_SERVICE!=="undefined"&&EV_SERVICE[d])||("جلسة "+deptName(d).replace(/^قسم\s*/,""))}
    function dsClin(d){return state.staff.filter(s=>s.department===d&&(s.clinical||s.roleCategory==="staff"))}

    // موعد يوم محدد لطفل من خطته الأسبوعية
    function dsApt(p,slot,day,status){
      return {id:`apt-d-${p.id}-${day}-${slot.time.replace(":","")}`,date:day,time:slot.time,duration:40,patient:p.name,service:dsSvc(p.dept),clinician:slot.clin,room:slot.room,status,demo:true};
    }
    function dsLogs(p,day,clin,w,ki){
      const s=state.staff.find(x=>x.name===clin)||{};
      goalsOf(p).filter(g=>g.status==="معتمد").slice(0,2).forEach((g,gi)=>{const pc=dsPct(ki,gi,w);
        state.sessionLogs.unshift({id:`sl-d-${p.id}-${day}-${gi}`,patientId:p.id,date:day,goalText:g.text,result:dsRes(pc),notes:`${pc}% صحيح مستقل في 10 محاولات.`,staffId:s.id||null,staffName:clin,source:"dtt"})});
    }

    function dsBuild(){
      const today=rcToday();const start=dsDateAdd(today,-28);
      const oldNames=new Set(state.patients.map(p=>p.name));
      // ---- تنظيف بيانات الأطفال القديمة ----
      ["patients","appointments","sessionLogs","homeLogs","progressReports","plans","childVisits","smartIntakes","standardizedAssessments","newEvals","packagePurchases","invoices","sessionBookings","registrations","smartDigests","dayReports","auditLog","evaluations"].forEach(k=>{if(Array.isArray(state[k]))state[k]=[]});
      state.liveBoard={};state.liveFeed=[];state.liveSession=null;if(state.ap){state.ap.queue=[];state.ap.log=[]}
      state.messages=(state.messages||[]).filter(m=>!m.patientId&&!(m.text&&[...oldNames].some(n=>m.text.includes(n))));
      (state.referrals||[]).forEach(r=>{if(r.patientId){r.patientId=null;r.stage="new";r.status="جديدة"}});
      state.rcContacts=[];
      Object.assign(state,{fdSeeded:false,smSeeded:false,rsSeeded:false,rcSeeded:false,demoAuditSeeded:false,saSeeded:true,lvKids:true,demoAuto:false,demoDays:{}});
      // ---- 5 أطفال لكل قسم ----
      let ki=0,num=2001;
      state.departments.forEach(dep=>{
        const kids=DS_KIDS[dep.id]||[];const clin=dsClin(dep.id);if(!clin.length)return;
        const used={};// clin|dow|time
        kids.forEach(([name,code],i)=>{
          const fam=name.split(" ").slice(1).join(" ");const father=name.split(" ")[1];const [a0,a1]=DS_AGE[dep.id]||[4,9];const age=a0+((ki*3)%(a1-a0+1));
          const p={id:`p-d-${dep.id}-${i+1}`,name,file:"AWN-"+num,age:age+" سنوات",gender:/^(لين|منيرة|رهف|غلا|تالا|دانة|ميار|شهد|لمى|ريما|أسيل|جنى|سارا|ليان|هيا|وتين|جود|ريتاج|جوان|لجين)/.test(name)?"أنثى":"ذكر",
            need:DS_NEED[dep.id],program:dep.name.replace(/^قسم\s*/,""),school:age>=6?"مدرسة ابتدائية":"",status:"نشط",notes:"",goal:"",next:"",code:code||("AWN-"+num),schoolCode:"",
            guardian:`${father} ${fam.split(" ").slice(-1)[0]}`,phone:"05"+String(50000000+ki*1237).slice(0,8),archived:false,assignedPrograms:[{id:"ap-d-"+ki,department:dep.id,program:"برنامج "+dep.name.replace(/^قسم\s*/,""),date:start,addedBy:"الخطة المعتمدة"}],
            goals:[],dept:dep.id,visitsBefore:6+((ki*11)%24),fileLog:[],
            consents:["treatment","whatsapp","recording"].map((k,j)=>({id:`cs-d-${ki}-${j}`,type:k,version:"1.0",text:(CONSENT_TYPES.find(t=>t.k===k)||{}).text||"",grantedAt:new Date(start+"T09:00:00").toISOString(),by:"ولي الأمر",method:"توقيع بالإصبع على جهاز المركز",recordedBy:"الاستقبال",expires:null}))};
          num++;if(typeof defaultHealth==="function")p.health=defaultHealth(p);
          const bank=DS_GOALS[dep.id];[0,1,2].forEach(k=>p.goals.push({id:`g-d-${ki}-${k}`,text:bank[(i+k)%bank.length],dept:dep.id,domain:deptName(dep.id),source:"الخطة المعتمدة",status:"معتمد",approvedBy:(fdDeptSup(dep.id)||{}).name||"مشرف القسم",approvedAt:new Date(start+"T10:00:00").toISOString()}));
          p.goal=p.goals[0].text;
          // الخطة الأسبوعية: أخصائي أساسي + أيام + وقت ثابت بدون تعارض
          const s=clin[i%clin.length];const days=DS_PATS[(ki+i)%DS_PATS.length];let t=null;
          for(let k=0;k<FD_GRID.length&&!t;k++){const tt=FD_GRID[(ki*2+k)%FD_GRID.length];if(tt>="12:00"&&tt<"12:40")continue;if(days.every(d=>!used[s.name+"|"+d+"|"+tt]))t=tt}
          t=t||FD_GRID[0];days.forEach(d=>used[s.name+"|"+d+"|"+t]=1);
          const room=(typeof evRoomOf==="function"&&evRoomOf(s.name)!=="غرفة العلاج")?evRoomOf(s.name):"غرفة "+(1+ki%6);
          p.demoPlan={clin:s.name,days,time:t,room};
          state.patients.push(p);
          // دراسة الحالة + التقييم الأولي عند مشرف القسم (قبل بداية الخطة)
          const sup=fdDeptSup(dep.id)||s;const ts=(d,h)=>new Date(d+"T"+h+":00").toISOString();
          const csF={child:name,age:p.age,guardian:p.guardian,phone:p.phone,reason:DS_NEED[dep.id]};
          p.caseStudy={fields:csF,analysis:analyzeIntake(csF),at:ts(dsDateAdd(start,-3),"10:30"),by:"الإشراف",source:"دراسة الحالة — المشرف العام",sup:{reason:DS_NEED[dep.id]}};
          state.appointments.push({id:`apt-d-${p.id}-as`,date:dsDateAdd(start,-2),time:"10:00",duration:60,patient:name,service:"تقييم أولي — "+deptName(dep.id),clinician:sup.name,room:"غرفة التقييم",status:"مكتمل",rsType:"assess",price:600,paid:true});
          const FL=[];const fl=(at,t,d,by,role,kind)=>FL.push({id:"fl-d-"+p.id+"-"+FL.length,at,t,d:d||"",by,role,kind:kind||"action"});
          fl(ts(dsDateAdd(start,-5),"09:15"),"تسجيل أسرة جديدة","سبب المراجعة: "+DS_NEED[dep.id],"الاستقبال","الاستقبال");
          fl(ts(dsDateAdd(start,-3),"10:30"),"دراسة الحالة ← تحويل لمشرف القسم","","الإشراف","الإشراف");
          fl(ts(dsDateAdd(start,-2),"11:00"),"نتيجة تقييم: يحتاج برنامج علاجي — "+deptName(dep.id),`${days.length} جلسات بالأسبوع`,sup.name,"الأخصائي","outcome");
          fl(ts(start,"09:00"),"اعتماد الخطة العلاجية",p.goals.map(g=>g.text).join("، "),sup.name,"الإشراف");
          fl(ts(start,"09:20"),"شراء باقة 12 جلسة","","الاستقبال","الاستقبال");
          // 4 أسابيع سابقة + اليوم
          let done=0;
          for(let d=start;d<=today;d=dsDateAdd(d,1)){if(!days.includes(dsDow(d)))continue;
            const w=Math.floor((Date.parse(d)-Date.parse(start))/(7*864e5));const past=d<today||sipadMin(t)+40<=rcNowM();
            const abs=past&&d<today&&(ki+w+dsDow(d))%13===0;
            state.appointments.push(dsApt(p,{clin:s.name,time:t,room},d,!past?"مجدول":abs?"غائب":"مكتمل"));
            if(past&&!abs){dsLogs(p,d,s.name,w,ki);done++;fl(ts(d,t),`حضور جلسة (الزيارة رقم ${p.visitsBefore+done})`,p.goals.slice(0,2).map((g,gi)=>`${g.text}: ${dsPct(ki,gi,w)}%`).join(" · "),s.name,"الأخصائي")}
            if(abs)fl(ts(d,t),"غياب عن جلسة","انرسلت رسالة للأسرة","الاستقبال","الاستقبال");
            if(past&&!abs&&dsDow(d)===days[0]&&ki%2===0)state.homeLogs=state.homeLogs||[],state.homeLogs.unshift({id:`hl-d-${p.id}-${d}`,patientId:p.id,date:d,goalText:p.goals[0].text,result:dsRes(dsPct(ki,0,w)-10),notes:"طبّقناه في البيت وقت اللعب.",loggedBy:"parent"});
          }
          // باقة وفاتورة
          const pk=(state.packages||[])[0]||{id:"growth",name:"باقة 12 جلسة",price:1380};
          state.packagePurchases.push({id:"PK-d-"+ki,patientId:p.id,patientName:p.name,package:pk.name||"باقة 12 جلسة",packageId:pk.id||"growth",sessionsTotal:12,sessionsUsed:Math.min(12,done),price:+pk.price||1380,payment:["مدى","كاش","تحويل بنكي"][ki%3],date:start});
          if(typeof createInvoice==="function"){const inv=createInvoice({patientId:p.id,patientName:p.name,type:"باقة",label:`${pk.name||"باقة 12 جلسة"} — ${p.name}`,amount:+pk.price||1380,taxRate:0.15,payment:["مدى","كاش","تحويل بنكي"][ki%3]});inv.date=start;if(inv.payments)inv.payments.forEach(x=>x.date=start)}
          // الخطة المعتمدة + تقرير شهري
          state.plans.push({id:"pl-d-"+ki,staffId:s.id,department:dep.id,patient:p.name,title:`الخطة العلاجية — ${dep.name.replace(/^قسم\s*/,"")}`,status:"معتمدة",date:start,note:""});
          const lines=p.goals.map((g,gi)=>`• ${g.text}: ${dsPct(ki,gi,3)}%`).join("\n");const avg=p.goals.reduce((a,g,gi)=>a+dsPct(ki,gi,3),0)/p.goals.length;
          state.progressReports.push({id:"pr-d-"+ki,patientId:p.id,patientName:p.name,date:dsDateAdd(today,-7),level:avg>=75?"تقدم ملحوظ":avg>=55?"تقدم تدريجي":"يحتاج دعم إضافي",achievedGoals:p.goals.filter((g,gi)=>dsPct(ki,gi,3)>=80).map(g=>g.text).join("، "),
            notes:avg>=75?"نوصي بنقل الأهداف المتحققة للبيت والمدرسة.":"نكمّل على نفس الأهداف مع زيادة التطبيق في البيت.",reportType:"family",summaryText:`تقرير تقدم شهري — ${p.name}\nآخر 4 أسابيع (${done} جلسة):\n${lines}`,staffId:s.id,staffName:s.name,shared:ki%2===0});
          fl(ts(dsDateAdd(today,-7),"13:00"),"إصدار تقرير تقدم شهري",state.progressReports[state.progressReports.length-1].level,s.name,"الأخصائي");
          p.fileLog=FL.sort((a,b)=>b.at.localeCompare(a.at));
          if(i===0)state.plans.push({id:"pl-d-u"+ki,staffId:s.id,department:dep.id,patient:p.name,title:"تحديث أهداف الشهر الجاي",status:"معلقة",date:dsDateAdd(today,-1)});
          ki++;
        });
      });
      dsExtend();
      state.demoSet=DS_VER;state.demoSetFresh=true;
      // عيّنات مسارات الاستقبال (العادي والذكي) فوق الأطفال الجدد
      try{if(typeof fdSeed==="function")fdSeed()}catch(_e){}try{if(typeof smSeed==="function")smSeed()}catch(_e){}
      persist();
    }
    // مواعيد جاية 3 أسابيع من الخطة الأسبوعية + إقفال الأيام اللي فاتت (عشان العرض يكمل كل يوم)
    function dsExtend(){
      const today=rcToday();const until=dsDateAdd(today,21);const ids=new Set(state.appointments.map(a=>a.id));let ch=0;
      state.patients.filter(p=>p.demoPlan&&!p.archived).forEach((p,ki)=>{const P=p.demoPlan;
        for(let d=dsDateAdd(today,1);d<=until;d=dsDateAdd(d,1)){if(!P.days.includes(dsDow(d)))continue;const a=dsApt(p,{clin:P.clin,time:P.time,room:P.room},d,"مجدول");if(!ids.has(a.id)){state.appointments.push(a);ids.add(a.id);ch++}}
        const next=state.appointments.filter(a=>a.patient===p.name&&a.status==="مجدول"&&a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];if(next)p.next=next.date+"T"+next.time});
      state.appointments.filter(a=>a.demo&&a.status==="مجدول"&&a.date<today).forEach(a=>{const p=state.patients.find(x=>x.name===a.patient);a.status="مكتمل";if(p)dsLogs(p,a.date,a.clinician,3,state.patients.indexOf(p));ch++});
      if(ch)persist();
    }

    if(dsIsDemo()){if(state.demoSet!==DS_VER)dsBuild();else dsExtend();}
    // «إعادة البيانات التجريبية» ترجع لنفس الـ40 طفل
    const _dsReset=resetData;
    resetData=function(){const r=_dsReset.apply(this,arguments);if(dsIsDemo()&&state.demoSet!==DS_VER){dsBuild();render()}return r};
    if(window.resetData===_dsReset)window.resetData=resetData;
    Object.assign(window,{dsBuild});
    render();
