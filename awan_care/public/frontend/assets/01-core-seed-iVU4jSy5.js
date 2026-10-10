const e=`"use strict";
// أوان — الجزء 1 من 16: 01-core-seed
// كل ملفات js/ دي بتشتغل كأنها ملف واحد بالترتيب — ما تغيّرش ترتيبها في index.html
    const KEY = "awan-care-offline-v2";
    const announcedApptIds = new Set();
    function reportUnexpectedError(err){
      try{
        console.error("Awan unexpected error:", err);
        const t=document.getElementById("toast");
        if(window.ntPush){window.ntPush("err","حصل خطأ غير متوقع",((err&&err.message)||err)+" — جرّبي تاني، وإذا استمر ابعتيلنا لقطة شاشة من هنا.");return}if(t){t.textContent="حصل خطأ غير متوقع: "+((err&&err.message)||err)+" — جرّبي تاني، وإذا استمر ابعتيلنا لقطة شاشة من هنا.";t.classList.remove("show");void t.offsetWidth;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),6000)}
      }catch(_e){}
    }
    window.addEventListener("error",(e)=>reportUnexpectedError(e.error||e.message));
    window.addEventListener("unhandledrejection",(e)=>reportUnexpectedError(e.reason));
    const seed = {
      center:{name:"مركز الرعاية النموذجي", city:"الرياض", phone:"0500000000", email:"info@yourcenter.sa", address:"حي النموذج، الرياض", supervisor:"د. فيصل السالم"},
      /* الصفحة الرئيسية تظهر أولًا — زر «جرّب المنصة» يدخل لوحة الإدارة مباشرة */
      role:"management", view:"public", lang:"ar", theme:"light",
      patients:[
        {id:"p1",name:"علي ناصر القحطاني",file:"AWN-SRC-1001",age:"7 سنوات",need:"اضطراب طيف التوحد",program:"نطق ولغة · علاج وظيفي",school:"مدارس الأفق",status:"نشط",notes:"تحسن واضح في المبادرة بالتواصل واستخدام الجمل من كلمتين. يوصى بالاستمرار على تمارين الطلب الوظيفي.",goal:"استخدام جمل من كلمتين في 4 من 5 فرص",next:"2026-09-02T09:00",code:"ALI-1001",schoolCode:"SCHOOL-1001",guardian:"ناصر القحطاني",phone:"0500003333",archived:false,health:{linkCode:"AWN-SRC-1001-MED",birthDate:"2019-03-14",birthType:"طبيعية",birthNotes:"",hearingScreening:{status:"تم — لا توجد ملاحظات",date:"2019-03-20",facility:"مستشفى الملك فهد",notes:""},neuroReports:[{id:"nr-1",date:"2024-02-10",facility:"مستشفى الملك فهد",doctorName:"د. سلمى الأحمدي",summary:"لا توجد مؤشرات عضوية على الأشعة، التأخر التطوري يتوافق مع صورة طيف التوحد ويستدعي متابعة سلوكية وتخاطبية."}],priorRehab:{had:false,provider:"",duration:"",details:""},linkedFacility:{name:"مستشفى الملك فهد",type:"مستشفى",status:"مرتبط"},sharedWithFamily:true,sharedWithSchool:false},assignedPrograms:[{id:"ap-1",department:"speech",program:"برنامج تنمية اللغة الاستقبالية والتعبيرية",date:"2026-08-25",addedBy:"أ. هند العتيبي"}]},
        {id:"p2",name:"خالد سعود المطيري",file:"AWN-SRC-1002",age:"5 سنوات",need:"تأخر لغوي",program:"نطق ولغة",school:"روضة البدايات",status:"نشط",notes:"يستجيب للتعليمات المكونة من خطوة واحدة.",goal:"تسمية 20 مفردة وظيفية",next:"2026-09-03T10:00",code:"KHALID-1002",schoolCode:"SCHOOL-1002",guardian:"سعود المطيري",phone:"0500004444",archived:false,health:{linkCode:"AWN-SRC-1002-MED",birthDate:"2021-01-10",birthType:"قيصرية",birthNotes:"",hearingScreening:{status:"لم يتم بعد",date:"",facility:"",notes:""},neuroReports:[],priorRehab:{had:false,provider:"",duration:"",details:""},linkedFacility:{name:"",type:"مستشفى",status:"غير مرتبط"},sharedWithFamily:false,sharedWithSchool:false}},
        {id:"p3",name:"فهد تركي البقمي",file:"AWN-SRC-1003",age:"9 سنوات",need:"صعوبات تعلم",program:"علاج وظيفي · دعم أكاديمي",school:"مدارس المعرفة",status:"نشط",notes:"بحاجة إلى متابعة التآزر البصري الحركي وخطة الدمج.",goal:"إكمال نشاط كتابي لمدة 10 دقائق",next:"2026-09-04T11:15",code:"FAHAD-1003",schoolCode:"SCHOOL-1003",guardian:"تركي البقمي",phone:"0500005555",archived:false,health:{linkCode:"AWN-SRC-1003-MED",birthDate:"2017-05-02",birthType:"طبيعية",birthNotes:"",hearingScreening:{status:"تم — لا توجد ملاحظات",date:"2017-05-08",facility:"مستشفى الملك عبدالعزيز",notes:""},neuroReports:[],priorRehab:{had:true,provider:"مركز التنمية الأولى",duration:"8 أشهر",details:"تأهيل حسي حركي قبل الالتحاق بمركزنا."},linkedFacility:{name:"",type:"مستشفى",status:"غير مرتبط"},sharedWithFamily:false,sharedWithSchool:true,schoolNote:"لا توجد حساسية معروفة. يستخدم دعامة كتابة خاصة أثناء الأنشطة الصفية، ويحتاج وقتاً إضافياً بسيطاً للانتقال بين الأنشطة."}},
        {id:"p4",name:"سعود ماجد العنزي",file:"AWN-SRC-1004",age:"6 سنوات",need:"تأخر نمائي",program:"علاج طبيعي",school:"روضة النور",status:"نشط",notes:"تقدم في التوازن والانتقال بين الوضعيات.",goal:"المشي على خط مستقيم لمسافة 3 أمتار",next:"2026-09-02T10:30",code:"SAUD-1004",schoolCode:"SCHOOL-1004",guardian:"ماجد العنزي",phone:"0500006666",archived:false,health:{linkCode:"AWN-SRC-1004-MED",birthDate:"2020-06-20",birthType:"طبيعية",birthNotes:"",hearingScreening:{status:"تم — توجد ملاحظات",date:"2020-06-26",facility:"مستشفى الملك عبدالعزيز",notes:"ضعف سمع خفيف بالأذن اليسرى، يوصى بالمتابعة الدورية."},neuroReports:[{id:"nr-2",date:"2025-11-02",facility:"مستشفى الملك عبدالعزيز",doctorName:"د. منى الشريف",summary:"تقرير أشعة رنين مغناطيسي طبيعي، التأخر النمائي وظيفي وليس عضوياً."}],priorRehab:{had:false,provider:"",duration:"",details:""},linkedFacility:{name:"مستشفى الملك عبدالعزيز",type:"مستشفى",status:"قيد الربط"},sharedWithFamily:true,sharedWithSchool:false}},
        {id:"p5",name:"منيرة عبدالعزيز الدوسري",file:"AWN-SRC-1005",age:"11 سنة",need:"احتياج سلوكي",program:"تأهيل سلوكي",school:"مدارس الريادة",status:"متوقف مؤقتاً",notes:"إجازة أسرية — تتم مراجعة الخطة عند العودة.",goal:"استخدام استراتيجية التهدئة الذاتية",next:"2026-09-07T09:30",code:"MUNIRA-1005",schoolCode:"SCHOOL-1005",guardian:"عبدالعزيز الدوسري",phone:"0500007777",archived:false,health:{linkCode:"AWN-SRC-1005-MED",birthDate:"2015-02-11",birthType:"طبيعية",birthNotes:"",hearingScreening:{status:"لم يتم بعد",date:"",facility:"",notes:""},neuroReports:[],priorRehab:{had:false,provider:"",duration:"",details:""},linkedFacility:{name:"",type:"مستشفى",status:"غير مرتبط"},sharedWithFamily:false,sharedWithSchool:false}}
      ],
      appointments:[
        {id:"apt-1",date:"2026-09-02",time:"09:00",patient:"علي ناصر القحطاني",service:"جلسة نطق ولغة",clinician:"أ. هند العتيبي",room:"غرفة 2",status:"مجدول"},
        {id:"apt-2",date:"2026-09-02",time:"10:30",patient:"سعود ماجد العنزي",service:"علاج طبيعي",clinician:"أ. لمياء الحربي",room:"صالة الحركة",status:"مجدول"},
        {id:"apt-3",date:"2026-09-02",time:"11:15",patient:"خالد سعود المطيري",service:"تقييم أولي",clinician:"د. فيصل السالم",room:"غرفة التقييم",status:"مكتمل"},
        {id:"apt-4",date:"2026-09-03",time:"10:00",patient:"خالد سعود المطيري",service:"جلسة نطق ولغة",clinician:"أ. هند العتيبي",room:"غرفة 2",status:"مجدول"},
        {id:"apt-5",date:"2026-09-04",time:"11:15",patient:"فهد تركي البقمي",service:"علاج وظيفي",clinician:"أ. عمر الدوسري",room:"غرفة 4",status:"مجدول"},
        {id:"apt-6",date:"2026-09-07",time:"09:30",patient:"منيرة عبدالعزيز الدوسري",service:"تأهيل سلوكي",clinician:"أ. نورة السهلي",room:"غرفة 1",status:"ملغي"}
      ],
      referrals:[
        {name:"إحالة من مستشفى الملك فهد",person:"د. سلمى الأحمدي",type:"طبية",priority:"عالية",status:"جديدة",date:"2026-09-01"},
        {name:"طلب تقييم مدرسي — فهد",person:"أ. ريم القحطاني",type:"مدرسة",priority:"متوسطة",status:"قيد الفرز",date:"2026-08-31"},
        {name:"استفسار أسرة جديدة",person:"هيا الزهراني",type:"عام",priority:"منخفضة",status:"تم التواصل",date:"2026-08-29"}
      ],
      staff:[
        {id:"st-1",name:"د. فيصل السالم",role:"مدير طبي وأخصائي نطق",schedule:"08:00 — 16:00",status:"متاح",present:true,premium:true,gender:"ذكر",code:"ف1",roleCategory:"supervisor",clinical:true,department:"speech"},
        {id:"st-2",name:"أ. هند العتيبي",role:"أخصائية نطق ولغة",schedule:"08:00 — 15:00",status:"متاحة",present:true,premium:true,gender:"أنثى",code:"ه1",roleCategory:"staff",clinical:true,department:"speech"},
        {id:"st-3",name:"أ. عمر الدوسري",role:"أخصائي علاج وظيفي",schedule:"09:00 — 17:00",status:"في جلسة",present:false,gender:"ذكر",code:"ع1",roleCategory:"staff",clinical:true,department:"ot"},
        {id:"st-4",name:"أ. لمياء الحربي",role:"أخصائية علاج طبيعي",schedule:"08:30 — 16:30",status:"متاحة",present:true,gender:"أنثى",code:"ل1",roleCategory:"staff",clinical:true,department:"ot"},
        {id:"st-5",name:"أ. نورة السهلي",role:"أخصائية تأهيل سلوكي",schedule:"09:00 — 17:00",status:"إجازة",present:false,gender:"أنثى",code:"ن1",roleCategory:"staff",clinical:true,department:"aba"},
        {id:"st-6",name:"أ. سارة المطيري",role:"مديرة تشغيل",schedule:"08:00 — 16:00",status:"متاحة",present:true,gender:"أنثى",code:"س1",roleCategory:"management",clinical:false,department:null},
        {id:"st-7",name:"أ. ريم الحربي",role:"موظفة استقبال",schedule:"08:00 — 16:00",status:"متاحة",present:true,gender:"أنثى",code:"ر1",roleCategory:"reception",clinical:false,department:null},
        {id:"st-8",name:"أ. بندر الشهري",role:"مشرف قسم العلاج الوظيفي",schedule:"08:00 — 16:00",status:"متاح",present:true,gender:"ذكر",code:"ب1",roleCategory:"supervisor",clinical:false,department:"ot"},
        {id:"st-9",name:"أ. مها القرني",role:"مشرفة قسم ABA",schedule:"08:00 — 16:00",status:"متاحة",present:true,gender:"أنثى",code:"م1",roleCategory:"supervisor",clinical:false,department:"aba"}
      ],
      registrations:[
        {child:"عبدالله يوسف الشمري",guardian:"يوسف الشمري",phone:"0500001111",reason:"تأخر في النطق",status:"قيد المراجعة",date:"2026-09-01"},
        {child:"جواهر خالد العنزي",guardian:"خالد العنزي",phone:"0500002222",reason:"طلب تقييم شامل",status:"تم التواصل",date:"2026-08-30"}
      ],
      departments:[
        {id:"speech",icon:"speech",name:"قسم التخاطب",desc:"تقييم اللغة والكلام ومخارج الأصوات والخطة العلاجية.",state:"نشط",services:"تقييم · جلسات فردية · تمارين منزلية"},
        {id:"skills",icon:"blocks",name:"قسم تنمية المهارات",desc:"برامج الاستقلالية والمهارات الحياتية والاجتماعية.",state:"جاهز",services:"مهارات يومية · تواصل اجتماعي"},
        {id:"aba",icon:"target",name:"قسم ABA",desc:"تحليل السلوك التطبيقي وجمع بيانات البرامج السلوكية.",state:"جاهز",services:"ABC · خطط تعديل السلوك"},
        {id:"psych",icon:"idea",name:"القسم النفسي",desc:"التقييم والدعم النفسي للطفل والأسرة.",state:"قريباً",services:"تقييم نفسي · إرشاد أسري"},
        {id:"ot",icon:"pulse",name:"قسم العلاج الوظيفي",desc:"التكامل الحسي والمهارات الحركية الدقيقة والوظيفية.",state:"نشط",services:"تكامل حسي · مهارات دقيقة"},
        {id:"vocational",icon:"briefcase",name:"قسم التأهيل المهني",desc:"إعداد اليافعين لسوق العمل والاستقلالية.",state:"جاهز",services:"تقييم مهني · تدريب عملي"},
        {id:"inclusion",icon:"school",name:"قسم الدمج المدرسي",desc:"متابعة خطة الدمج والتنسيق مع المدرسة والمعلمين.",state:"جاهز",services:"خطة دمج · تقارير مدرسية"},
        {id:"classrooms",icon:"book",name:"قسم الفصول",desc:"إدارة الفصول التعليمية وتوزيع الأطفال عليها.",state:"قريباً",services:"جداول الفصول · الحضور"}
      ],
      departmentPrograms: {
        speech: ["برنامج تنمية اللغة الاستقبالية والتعبيرية","التواصل بالتبادل الصوري (PECS)"],
        ot: ["برنامج التكامل الحسي (Sensory Integration)","برنامج المهارات الحركية الدقيقة"],
        aba: ["برنامج التدريب بالتجارب المنفصلة (DTT)"],
        psych: [],
        skills: ["برنامج المهارات الحياتية اليومية (ADL)"],
        vocational: [],
        inclusion: [],
        classrooms: []
      },
      sessionPrice: 150,
      patientsTab: "active",
      openDept: null,
      rolePermissions: {
        supervisor:{editDepartments:false, manageFamilyPortal:false, editAppointments:true, editPatients:true},
        staff:{editDepartments:false, manageFamilyPortal:false, editAppointments:false, editPatients:true},
        reception:{editDepartments:false, manageFamilyPortal:false, editAppointments:true, editPatients:true}
      },
      currentStaffId: null,
      staffSection: null,
      staffScheduleFilter: "all",
      evaluations:[
        {id:"ev-1",staffId:"st-2",patient:"خالد سعود المطيري",type:"تقييم أولي",date:"2026-09-03",status:"مجدول"},
        {id:"ev-2",staffId:"st-2",patient:"علي ناصر القحطاني",type:"تقييم دوري",date:"2026-09-10",status:"قادم"},
        {id:"ev-3",staffId:"st-3",patient:"فهد تركي البقمي",type:"تقييم حسي حركي",date:"2026-09-04",status:"مجدول"},
        {id:"ev-4",staffId:"st-4",patient:"سعود ماجد العنزي",type:"تقييم حركي",date:"2026-09-06",status:"مكتمل"},
        {id:"ev-5",staffId:"st-5",patient:"منيرة عبدالعزيز الدوسري",type:"تقييم سلوكي",date:"2026-09-07",status:"مجدول"}
      ],
      dailyTasks:[
        {id:"tk-1",staffId:"st-2",text:"جلسة نطق مع خالد الساعة 10:00",done:false},
        {id:"tk-2",staffId:"st-2",text:"توثيق تقدم علي في ملفه",done:false},
        {id:"tk-3",staffId:"st-3",text:"تحضير أدوات التكامل الحسي لجلسة فهد",done:false},
        {id:"tk-4",staffId:"st-3",text:"جلسة فهد الساعة 11:15",done:false},
        {id:"tk-5",staffId:"st-4",text:"جلسة سعود الساعة 10:30",done:false},
        {id:"tk-6",staffId:"st-4",text:"متابعة تمارين التوازن اليومية",done:false},
        {id:"tk-7",staffId:"st-5",text:"مراجعة خطة منيرة السلوكية",done:false}
      ],
      workshops:[
        {id:"wk-1",title:"ورشة تنمية اللغة عند الأطفال",date:"2026-09-15",staffId:"st-2",audience:"أولياء الأمور",status:"قادمة"},
        {id:"wk-2",title:"ورشة التكامل الحسي للأهالي",date:"2026-09-18",staffId:"st-3",audience:"أولياء الأمور",status:"قادمة"},
        {id:"wk-3",title:"ورشة الوعي الحركي",date:"2026-09-20",staffId:"st-4",audience:"الفريق",status:"تحضير"},
        {id:"wk-4",title:"ورشة تعديل السلوك للأهل",date:"2026-09-22",staffId:"st-5",audience:"أولياء الأمور",status:"قادمة"}
      ],
      complaints:[
        {id:"cp-1",staffId:"st-3",from:"ولي أمر فهد",subject:"تأخر بدء الجلسة 10 دقائق",date:"2026-08-28",status:"قيد المراجعة"}
      ],
      courses:[
        {id:"cr-1",staffId:"st-2",title:"تحليل اضطرابات النطق المتقدم",provider:"أكاديمية أوان",progress:60,status:"قيد التقدم"},
        {id:"cr-2",staffId:"st-3",title:"العلاج الوظيفي المتقدم للأطفال",provider:"أكاديمية أوان",progress:30,status:"قيد التقدم"},
        {id:"cr-3",staffId:"st-4",title:"العلاج الطبيعي لاضطرابات النمو",provider:"أكاديمية أوان",progress:80,status:"قيد التقدم"},
        {id:"cr-4",staffId:"st-5",title:"تحليل السلوك التطبيقي — المستوى الثاني",provider:"أكاديمية أوان",progress:45,status:"قيد التقدم"}
      ],
      plans:[
        {id:"pl-1",staffId:"st-2",department:"speech",patient:"خالد سعود المطيري",title:"خطة علاجية شهرية — نطق ولغة",status:"معلقة",date:"2026-09-05"},
        {id:"pl-2",staffId:"st-2",department:"speech",patient:"علي ناصر القحطاني",title:"تحديث خطة الأهداف اللغوية",status:"معتمدة",date:"2026-08-30",note:"ممتازة، استمري على نفس الخطة."},
        {id:"pl-3",staffId:"st-3",department:"ot",patient:"فهد تركي البقمي",title:"خطة تكامل حسي",status:"معلقة",date:"2026-09-04"},
        {id:"pl-4",staffId:"st-5",department:"aba",patient:"منيرة عبدالعزيز الدوسري",title:"خطة تعديل سلوك",status:"معلقة",date:"2026-09-03"}
      ],
      progressReports: [],
      sessionLogs:[
        {id:"sl-1",patientId:"p1",date:"2026-08-25",goalText:"استخدام جمل من كلمتين في 4 من 5 فرص",result:"نجاح كامل",notes:"استخدم الجملة بثبات خلال الجلسة مع تلقين بسيط.",staffId:"st-2",staffName:"أ. هند العتيبي"},
        {id:"sl-2",patientId:"p1",date:"2026-08-28",goalText:"استخدام جمل من كلمتين في 4 من 5 فرص",result:"نجاح كامل",notes:"تكرر الأداء دون الحاجة لتلقين.",staffId:"st-2",staffName:"أ. هند العتيبي"},
        {id:"sl-3",patientId:"p4",date:"2026-08-26",goalText:"المشي على خط مستقيم لمسافة 3 أمتار",result:"نجاح جزئي",notes:"يحتاج دعمًا بسيطًا للتوازن في النصف الثاني من المسافة.",staffId:"st-4",staffName:"أ. لمياء الحربي"}
      ],
      homeLogs:[
        {id:"hl-1",patientId:"p1",date:"2026-08-27",goalText:"استخدام جمل من كلمتين في 4 من 5 فرص",result:"لم ينجح بعد",notes:"بيستخدم كلمة واحدة غالبًا في البيت.",loggedBy:"parent"},
        {id:"hl-2",patientId:"p4",date:"2026-08-29",goalText:"المشي على خط مستقيم لمسافة 3 أمتار",result:"نجاح جزئي",notes:"",loggedBy:"parent"}
      ],
      qualityAudits:[
        {id:"qa-1",staffId:"st-2",department:"speech",date:"2026-08-20",score:5,notes:"التزام ممتاز بخطة الجلسة وتوثيق دقيق."}
      ],
      messages:[
        {id:"msg-1",fromId:"st-1",fromName:"د. فيصل السالم",toId:"st-2",toName:"أ. هند العتيبي",text:"الرجاء مراجعة خطة خالد قبل نهاية الأسبوع.",date:"2026-09-04",read:true},
        {id:"msg-2",fromId:"st-2",fromName:"أ. هند العتيبي",toId:"st-1",toName:"د. فيصل السالم",text:"تم يا دكتور، هرفعها اليوم بإذن الله.",date:"2026-09-04",read:true},
        {id:"msg-3",fromId:"st-6",fromName:"أ. سارة المطيري",fromDept:"management",toId:null,toName:null,toDept:"ot",text:"يرجى تزويدي بتحديث سريع عن سعة قسم العلاج الوظيفي هذا الأسبوع.",date:"2026-09-09",kind:"رسالة",status:"قيد الاطلاع",read:true},
        {id:"msg-4",fromId:null,fromName:"تركي البقمي (ولي أمر فهد)",fromDept:"family",toId:null,toName:null,toDept:"reception",patientId:"p3",text:"هل يمكن تأجيل موعد الغد لظرف طارئ من فضلكم؟",date:"2026-09-11",kind:"رسالة",status:"مُرسلة",read:false},
        {id:"msg-5",fromId:"st-7",fromName:"أ. ريم الحربي",fromDept:"reception",toId:null,toName:null,toDept:"family",patientId:"p3",text:"تم يا فندم، رجّلنا الموعد لبعد بكرة الساعة 10 صباحاً — بالتوفيق ✅",date:"2026-09-11",kind:"رسالة",status:"مُرسلة",read:false}
      ],
      familySession: null,
      bookingDraft: null,
      sessionBookings: [],
      packagePurchases: [
        {id:"PK-000001",patientId:"p1",patientName:"علي ناصر القحطاني",package:"باقة التقدم",packageId:"growth",sessionsTotal:12,sessionsUsed:11,price:1380,payment:"مدى",date:"2026-08-20"}
      ],
      consultationReviews: [],
      municipalLicense: {
        requestNumber: "9482016",
        authority: "أمانة محافظة جدة",
        steps: [
          {id:"ml-1",label:"الموافقة المبدئية للموقع والمساحة",status:"مكتملة"},
          {id:"ml-2",label:"استيفاء اشتراطات كود البناء السعودي لذوي الاحتياجات الخاصة",status:"مكتملة"},
          {id:"ml-3",label:"تقرير السلامة الصادر من الدفاع المدني",status:"قيد المراجعة"},
          {id:"ml-4",label:"سداد الرسوم النهائية وإصدار رخصة النشاط التجاري",status:"لم يبدأ"}
        ],
        notes: ""
      },
      govSupport: {
        programName: "برنامج دعم مراكز التأهيل والتدخل المبكر",
        authority: "وزارة الموارد البشرية والتنمية الاجتماعية",
        steps: [
          {id:"gs-1",label:"تسجيل المركز كمنشأة مرخصة على منصة إحسان للجمعيات والمؤسسات",status:"قيد المراجعة"},
          {id:"gs-2",label:"استيفاء معايير الاعتماد الصحي لمراكز التأهيل والتدخل المبكر",status:"لم يبدأ"},
          {id:"gs-3",label:"الربط الإلكتروني مع برنامج الكشف المبكر عن ضعف السمع لدى المواليد",status:"لم يبدأ"},
          {id:"gs-4",label:"التقديم على دعم صندوق تنمية الموارد البشرية (هدف)",status:"لم يبدأ"}
        ],
        notes: "قائمة استرشادية لمتابعة توافق المركز مع مبادرات وبرامج دعم الدولة للتأهيل والتدخل المبكر — عدّلي الخطوات لتناسب البرامج الفعلية التي تتقدمون لها."
      },
      reviewSettings: {
        webhookUrl: "https://YOUR-N8N-DOMAIN/webhook/awan-new-family",
        placeId: "PUT_YOUR_PLACE_ID",
        intervalDays: 14,
        maxAttempts: 3
      },
      invoices: [
        {id:"inv-seed-1",patientId:"p1",patientName:"علي ناصر القحطاني",type:"جلسة منفردة",label:"جلسة نطق ولغة",amount:150,payment:"مدى",date:"2026-09-02",paid:true},
        {id:"inv-seed-2",patientId:"p4",patientName:"سعود ماجد العنزي",type:"جلسة منفردة",label:"علاج طبيعي",amount:150,payment:"آجل",date:"2026-09-02",paid:false},
        {id:"inv-seed-3",patientId:"p3",patientName:"فهد تركي البقمي",guardianName:"تركي البقمي",guardianPhone:"0500005555",centerName:"مركز الرعاية النموذجي",type:"باقة",label:"باقة التقدم — 12 جلسة",items:[{description:"باقة التقدم — 12 جلسة",qty:1,unitPrice:1380,total:1380}],subtotal:1380,taxRate:0.15,taxAmount:207,discountAmount:100,total:1487,amount:1487,payment:"تحويل",payments:[{id:"pay-seed-1",date:"2026-08-30",amount:800,method:"تحويل بنكي",note:"دفعة أولى"}],status:"مسدد جزئياً",paid:false,date:"2026-08-30"}
      ],
      billingSettings: {taxRate:0.15, taxEnabled:false},
      libraryArticles: [
        {id:"lib-1",audience:"family",category:"نطق ولغة",type:"نشاط منزلي",title:"٥ أفكار عملية لتشجيع طفلك على تكوين جمل أطول في البيت",summary:"أنشطة يومية بسيطة تساعد طفلك يتكلم بجمل أطول أثناء اللعب والروتين اليومي.",body:"أثناء اللعب أو الأكل أو الاستحمام، صفي بصوت عالٍ ما يفعله طفلك بجملة قصيرة وواضحة (مثال: أنت تغسل يدك). كرري نفس الجملة بصياغات مختلفة في أكثر من موقف خلال اليوم، وأعطيه وقتًا كافيًا للرد قبل أن تكملي عنه. إذا قال كلمة واحدة، وسّعيها لجملة كاملة بدل تصحيحه مباشرة (قال: ماء، فتقولين: أنا بدي ماء). اجعلي هذه الأنشطة قصيرة (5 دقائق) ومتكررة بدل جلسة طويلة مرة واحدة في اليوم.",tags:["نطق ولغة","تسمية","جمل من كلمتين"],author:"أ. هند العتيبي",authorRole:"أخصائية نطق ولغة",publishDate:"2026-08-20",videoStatus:null},
        {id:"lib-2",audience:"family",category:"علاج وظيفي",type:"مقالة",title:"كيف تدعمين طفلك في أنشطة المهارات الحركية الدقيقة بالمنزل",summary:"أفكار بسيطة لتقوية عضلات اليد الدقيقة عبر أنشطة يومية غير مكلفة.",body:"خصصي 10 دقائق يوميًا لنشاط يستخدم فيه طفلك يده بدقة، مثل التلوين داخل الحدود، أو قص الورق بمقص آمن، أو تركيب المكعبات الصغيرة. ابدئي بأنشطة أسهل ثم زيدي الصعوبة تدريجيًا مع تقدمه. استخدمي أدوات منزلية بسيطة (ملقط، خرز كبير، معجون) بدل شراء أدوات مكلفة. راقبي طريقة إمساكه للقلم أو الأداة وصححيها بلطف دون انتقاد.",tags:["علاج وظيفي","مهارات دقيقة"],author:"أ. عمر الدوسري",authorRole:"أخصائي علاج وظيفي",publishDate:"2026-08-15",videoStatus:null},
        {id:"lib-3",audience:"family",category:"علاج طبيعي",type:"نشاط منزلي",title:"خطوات عملية لتحسين توازن طفلك وثقته أثناء المشي",summary:"تمارين توازن وحركة بسيطة وآمنة يمكن ممارستها في البيت يوميًا.",body:"شجعي طفلك على المشي على خط وهمي (شريط لاصق على الأرض) لمسافة قصيرة مع مراقبتك القريبة، وزيدي المسافة تدريجيًا كل أسبوع. أتيحي له 15 دقيقة يوميًا من الحركة الحرة الآمنة (مشي، صعود ونزول درج بمساعدة). تجنبي حمله باستمرار في المسافات التي يقدر يمشيها بنفسه، فهذا يقوي عضلاته وثقته تدريجيًا. امدحيه فور أي محاولة ولو لم تكتمل.",tags:["علاج طبيعي","المشي","توازن"],author:"أ. لمياء الحربي",authorRole:"أخصائية علاج طبيعي",publishDate:"2026-08-18",videoStatus:null},
        {id:"lib-4",audience:"family",category:"تأهيل سلوكي",type:"مقالة",title:"دعم التنظيم الذاتي والسلوك اليومي في المنزل",summary:"أساليب بسيطة تساعد طفلك على تنظيم انفعالاته واتباع روتين يومي واضح.",body:"استخدمي جدول صور بسيط يوضح خطوات الروتين اليومي (الاستيقاظ، الفطور، اللبس)، وامدحي فورًا أي التزام صغير به. عند ملاحظة بداية انفعال، وجّهي طفلك لنشاط هادئ بديل بدل الانتظار حتى يتصاعد الموقف. حافظي على نفس التوقيت اليومي للأنشطة الأساسية (نوم، أكل) قدر الإمكان لأن الروتين الثابت يقلل من نوبات الانفعال. تجنبي كثرة الأوامر المتتالية، واعطي تعليمة واحدة واضحة في كل مرة.",tags:["تأهيل سلوكي","تنظيم ذاتي","سلوك"],author:"أ. نورة السهلي",authorRole:"أخصائية تأهيل سلوكي",publishDate:"2026-08-22",videoStatus:null},
        {id:"lib-5",audience:"family",category:"دعم أكاديمي",type:"مقالة",title:"كيف تقرئين قصة لطفلك بطريقة تدعم الفهم والتذكر",summary:"خطوات بسيطة تحوّل وقت القصة اليومي إلى تمرين حقيقي للفهم والتركيز.",body:"اقرئي مع طفلك قصة قصيرة يوميًا، وتوقفي عند صورة أو حدث لتسأليه سؤالين بسيطين عنه (مثال: ماذا حصل بعدين؟ ليش صار كذا؟). أعيدي قراءة نفس القصة أكثر من مرة خلال الأسبوع فهذا يرسّخ المفردات والفهم أكثر من قصة جديدة كل يوم. اطلبي منه أن يعيد الحدث الرئيسي بكلماته الخاصة بعد الانتهاء، حتى لو كانت الإجابة بسيطة.",tags:["دعم أكاديمي","صعوبات تعلم","قراءة"],author:"أ. بندر الشهري",authorRole:"مشرف قسم العلاج الوظيفي",publishDate:"2026-08-11",videoStatus:null},
        {id:"lib-6",audience:"family",category:"تأهيل سلوكي",type:"مقالة",title:"نصائح عملية للتعامل مع نوبات الغضب والانفعال عند الأطفال",summary:"خطوات هادئة وثابتة للتعامل مع لحظة الانفعال دون تصعيدها.",body:"حافظي على هدوء صوتك ونبرتك أثناء نوبة الغضب — رد الفعل الهادئ يساعد الطفل يهدأ أسرع من الصراخ المقابل. لا تحاولي شرح أو تفاوض أثناء ذروة الانفعال، انتظري حتى يهدأ ثم تحدثي معه بجملة قصيرة عن الموقف. ثبّتي نفس القواعد في كل مرة (نفس الحدود، نفس النتيجة) لأن التذبذب يربك الطفل ويطيل مدة النوبات. امدحيه بشكل خاص عندما يهدأ بنفسه أو يطلب المساعدة بدل الانفعال.",tags:["تأهيل سلوكي","غضب","انفعال"],author:"أ. مها القرني",authorRole:"مشرفة قسم ABA",publishDate:"2026-08-10",videoStatus:null},
        {id:"lib-7",audience:"family",category:"علاج وظيفي",type:"نشاط منزلي",title:"تمارين تآزر بصري-حركي بسيطة لتحسين الكتابة",summary:"أنشطة يومية قصيرة تقوي التآزر بين العين واليد قبل التركيز على شكل الحروف.",body:"قبل الطلب من طفلك الكتابة مباشرة، دربيه على تتبع خطوط متعرجة أو دوائر مرسومة بقلم عريض لمدة دقائق قليلة يوميًا. استخدمي أنشطة مثل الوصل بين النقاط أو التلوين داخل أشكال كبيرة قبل الانتقال لأشكال أصغر. اجعلي مدة النشاط الكتابي قصيرة (5-10 دقائق) مع استراحات، لأن التعب يزيد من ضعف التحكم بالقلم.",tags:["علاج وظيفي","نشاط كتابي","تآزر بصري"],author:"أ. عمر الدوسري",authorRole:"أخصائي علاج وظيفي",publishDate:"2026-08-25",videoStatus:null},
        {id:"lib-8",audience:"family",category:"علاج طبيعي",type:"فيديو تعليمي",title:"فيديو تعليمي: خطوات تمرين المشي على خط مستقيم في المنزل",summary:"فيديو قصير يوضح خطوات تمرين توازن آمن يمكن تطبيقه في البيت.",body:"هذا المحتوى مخصص ليكون فيديو مصورًا يوضح خطوة بخطوة كيفية تنفيذ تمرين المشي على خط مستقيم بأمان في المنزل، بإشراف أخصائية العلاج الطبيعي. سيتم رفع الفيديو الفعلي فور تصويره واعتماده من فريق أوان.",tags:["علاج طبيعي","المشي","توازن"],author:"أ. لمياء الحربي",authorRole:"أخصائية علاج طبيعي",publishDate:"2026-09-01",videoStatus:"قريبًا"},
        {id:"lib-9",audience:"practitioner",category:"نطق ولغة",type:"مقالة",title:"بروتوكول تقييم اللغة التعبيرية والاستقبالية — دليل داخلي",summary:"دليل مرجعي داخلي لخطوات تقييم اللغة عند حالات جديدة أو المراجعة الدورية.",body:"يبدأ التقييم بمراجعة التاريخ التطوري للغة (عمر أول كلمة، عمر الجملة المكونة من كلمتين)، يليه تقييم اللغة الاستقبالية عبر تعليمات من خطوة وخطوتين، ثم تقييم اللغة التعبيرية عبر عد المفردات الوظيفية المستخدمة تلقائيًا. وثّقي النتائج في نموذج التقييم الموحد مع أمثلة فعلية من كلام الطفل وليس فقط تقديرات عامة، لتسهيل مقارنة التقدم في التقييمات اللاحقة.",tags:["تقييم","نطق ولغة"],author:"د. فيصل السالم",authorRole:"مدير طبي وأخصائي نطق",publishDate:"2026-07-28",videoStatus:null},
        {id:"lib-10",audience:"practitioner",category:"تأهيل سلوكي",type:"مقالة",title:"معايير توثيق برامج ABC وجمع البيانات السلوكية",summary:"إرشادات داخلية لتوثيق دقيق ومتسق لبيانات السلوك بين الأخصائيين.",body:"وثّقي كل حادثة سلوكية بصيغة ABC كاملة: المُحفّز (Antecedent) قبل السلوك مباشرة، وصف السلوك نفسه بشكل قابل للملاحظة والقياس دون تفسير شخصي، ثم النتيجة (Consequence) التي تلت السلوك. سجّلي التكرار والمدة الزمنية بأرقام فعلية وليس بتقدير عام (كثير/قليل)، لأن هذا ما يسمح بمقارنة موضوعية بين الجلسات ومراجعة فعالية خطة تعديل السلوك بدقة.",tags:["ABA","توثيق","بيانات سلوكية"],author:"أ. مها القرني",authorRole:"مشرفة قسم ABA",publishDate:"2026-08-02",videoStatus:null},
        {id:"lib-11",audience:"practitioner",category:"علاج وظيفي",type:"مقالة",title:"دليل التكامل الحسي: أدوات القياس والمتابعة الدورية",summary:"مرجع داخلي لأدوات قياس الاستجابة الحسية ومتابعة التقدم في خطة التكامل الحسي.",body:"استخدمي نفس أداة القياس الحسي في كل مراجعة دورية (كل 4-6 أسابيع) لضمان قابلية المقارنة بين النتائج. وثّقي استجابة الطفل لكل مثير حسي (لمس، حركة، صوت) على حدة بدل تقييم عام واحد، لأن أنماط الحساسية غالبًا تختلف من حاسة لأخرى. راجعي خطة التكامل الحسي مع المشرف كل شهر لتعديل الأنشطة حسب التقدم الفعلي الموثق.",tags:["تكامل حسي","علاج وظيفي"],author:"أ. بندر الشهري",authorRole:"مشرف قسم العلاج الوظيفي",publishDate:"2026-08-05",videoStatus:null},
        {id:"lib-12",audience:"practitioner",category:"عام",type:"فيديو تعليمي",title:"فيديو تدريبي: تقنيات التعامل مع مقاومة الطفل أثناء الجلسة",summary:"فيديو تدريبي داخلي لأساليب عملية للتعامل مع رفض الطفل المشاركة في الجلسة.",body:"هذا المحتوى مخصص ليكون فيديو تدريبيًا داخليًا يعرض مواقف حقيقية (مع موافقة الأسر) لأساليب التعامل مع مقاومة الطفل بداية الجلسة، وسيتم تصويره واعتماده من الإدارة قبل إتاحته للفريق.",tags:["تدريب","إدارة الجلسة"],author:"أ. سارة المطيري",authorRole:"مديرة تشغيل",publishDate:"2026-08-12",videoStatus:"قريبًا"}
      ],
      libraryApplications: [],
      libraryTab: "family",
      libraryFilter: "الكل",
      invoiceFilter: "all",
      meetings: [
        {id:"mt-1", title:"اجتماع تنسيقي أسبوعي — قسمي التخاطب والعلاج الوظيفي", kind:"department", departments:["speech","ot"], patientId:null, participants:["st-1","st-2","st-4","st-6"], status:"منتهية", scheduledDate:"2026-09-08", startedAt:"2026-09-08T09:00:00", endedAt:"2026-09-08T09:34:00", durationSeconds:2040, notes:"ناقشنا تأخر التنسيق بين قسم التخاطب والعلاج الوظيفي في حالة خالد سعود المطيري، واتفقنا على توحيد جدول جلساته الأسبوعية بين القسمين، ومراجعة سعة قسم العلاج الوظيفي للأسبوع القادم.", actionItems:[{id:"ai-1",text:"إعداد جدول جلسات موحّد لخالد بين القسمين",ownerId:"st-2",ownerName:"أ. هند العتيبي",dueDate:"2026-09-15",done:false}], summaryText:"محضر اجتماع — اجتماع تنسيقي أسبوعي — قسمي التخاطب والعلاج الوظيفي\\nنوع الاجتماع: تنسيقي بين الأقسام\\nالتاريخ: 8 سبتمبر 2026 · المدة: 34 دقيقة\\nالحضور: د. فيصل السالم، أ. هند العتيبي، أ. لمياء الحربي، أ. سارة المطيري\\n\\nملخص النقاش:\\nناقشنا تأخر التنسيق بين قسم التخاطب والعلاج الوظيفي في حالة خالد سعود المطيري، واتفقنا على توحيد جدول جلساته الأسبوعية بين القسمين، ومراجعة سعة قسم العلاج الوظيفي للأسبوع القادم.\\n\\nالقرارات المتخذة:\\n1. توحيد جدول جلسات خالد سعود المطيري بين قسمي التخاطب والعلاج الوظيفي — المسؤول: أ. هند العتيبي — الموعد المستهدف: 15 سبتمبر 2026\\n2. مراجعة سعة قسم العلاج الوظيفي للأسبوع القادم — المسؤول: أ. لمياء الحربي — الموعد المستهدف: 12 سبتمبر 2026\\n\\nبنود العمل (Action Items):\\n1. إعداد جدول جلسات موحّد لخالد بين القسمين — المسؤول: أ. هند العتيبي — الموعد المستهدف: 15 سبتمبر 2026\\n\\nتم رفع القرارات أعلاه تلقائيًا إلى لوحة القرارات لمراجعة المشرفين المعنيين.\\n\\nمركز الرعاية النموذجي", audience:"internal"},
        {id:"mt-2", title:"اجتماع مع أسرة الطفل فهد تركي البقمي", kind:"family", departments:[], patientId:"p3", participants:["st-1","st-8"], status:"مجدولة", scheduledDate:"2026-09-16", startedAt:null, endedAt:null, durationSeconds:0, notes:"", actionItems:[], summaryText:"", audience:"family"}
      ],
      decisions: [
        {id:"dc-1", meetingId:"mt-1", text:"توحيد جدول جلسات خالد سعود المطيري بين قسمي التخاطب والعلاج الوظيفي", department:"speech", ownerId:"st-2", ownerName:"أ. هند العتيبي", dueDate:"2026-09-15", status:"قيد التنفيذ", createdDate:"2026-09-08"},
        {id:"dc-2", meetingId:"mt-1", text:"مراجعة سعة قسم العلاج الوظيفي للأسبوع القادم", department:"ot", ownerId:"st-4", ownerName:"أ. لمياء الحربي", dueDate:"2026-09-12", status:"معتمدة", createdDate:"2026-09-08"},
        {id:"dc-3", meetingId:"mt-1", text:"إضافة جلسة تكامل حسي أسبوعية إضافية لخالد بعد مراجعة التقدم", department:"ot", ownerId:"st-4", ownerName:"أ. لمياء الحربي", dueDate:"2026-09-20", status:"قيد المراجعة", createdDate:"2026-09-08"}
      ],
      connectTab: "meetings",
      activeMeetingId: null,
      familyServices: [
        {id:"follow", icon:"eye", title:"متابعة طفلي وحجوزاتي", desc:"عرض ملف طفلك، التقدم في الأهداف، الموعد القادم، وكل حجوزاتك.", cta:"متابعة الملف", enabled:true, builtin:true},
        {id:"sessionBooking", icon:"schedule", title:"حجز جلسة علاجية", desc:"اختاري الأخصائي واليوم والوقت، مع عروض الحجز الذهبي.", cta:"احجزي الآن", enabled:true, builtin:true},
        {id:"packages", icon:"target", title:"الباقات العلاجية", desc:"باقات جلسات بسعر أوفر من الحجز الفردي.", cta:"عرض الباقات", enabled:true, builtin:true},
        {id:"insurance", icon:"idcard", title:"التأمين وطرق الدفع", desc:"شركات التأمين المتعاملة، ما تغطيه، وطرق الدفع الإلكتروني.", cta:"التفاصيل", enabled:true, builtin:true},
        {id:"addons", icon:"heart", title:"خدمات مكمّلة", desc:"متابعة منزلية أو شادو تيتشر داخل المدرسة، بأسعارها.", cta:"استكشفي الخدمات", enabled:true, builtin:true},
        {id:"case", icon:"book", title:"دراسة حالة إلكترونية", desc:"سجّلي بيانات طفلك الأولية ليقوم فريق المركز بدراسة حالته والتواصل معك.", cta:"بدء الدراسة", enabled:true, builtin:true},
        {id:"booking", icon:"schedule", title:"حجز كشف استشارة", desc:"احجزي موعد الكشف الأولي مع أحد مختصي المركز.", cta:"حجز موعد", enabled:true, builtin:true},
        {id:"question", icon:"question", title:"عندي سؤال", desc:"عندك استفسار سريع؟ ابعتيه وفريق المركز يرد عليك.", cta:"إرسال سؤال", enabled:true, builtin:true},
        {id:"library", icon:"book", title:"مكتبة الإرشاد الأسري", desc:"مقالات وأنشطة وفيديوهات تثقيفية، مقترحة بناءً على هدف طفلك الحالي.", cta:"استكشفي المكتبة", enabled:true, builtin:true}
      ],
      facilityTab: null,
      facilitySession: null,
      packages: [
        {id:"starter", name:"باقة البداية", sessions:4, price:520, badge:"", desc:"لتجربة البرنامج العلاجي على مدار أسبوعين."},
        {id:"growth", name:"باقة التقدم", sessions:12, price:1380, badge:"الأكثر طلبًا", desc:"الأنسب لمتابعة شهرية متكاملة بخصم عن سعر الجلسة الفردية."},
        {id:"pro", name:"باقة الاستمرارية", sessions:24, price:2500, badge:"أفضل قيمة", desc:"لخطة علاجية طويلة المدى بأقل سعر للجلسة."},
        {id:"monthly", name:"الاشتراك الشهري", sessions:8, price:1450, badge:"اشتراك متجدد", desc:"8 جلسات أسبوعية موزعة على الشهر بفاتورة واحدة، بدل الدفع لكل جلسة على حدة.", billingNote:"يتجدد شهريًا تلقائيًا ما لم يتم الإلغاء"},
        {id:"daily", name:"الباقة اليومية", sessions:3, price:420, badge:"ليوم واحد", desc:"3 جلسات مكثّفة في نفس اليوم — مناسبة للأسر القادمة من خارج المدينة أو قبل السفر.", billingNote:"صالحة ليوم واحد فقط"}
      ],
      addonServices: [
        {id:"homevisit", name:"متابعة منزلية", desc:"زيارة أخصائي لمنزل الأسرة لمتابعة تطبيق الخطة العلاجية في البيئة المنزلية.", price:250, unit:"للزيارة"},
        {id:"shadow", name:"شادو تيتشر (معلم ظل)", desc:"مرافقة متخصصة للطفل داخل المدرسة لدعم الاندماج والانتباه.", price:180, unit:"لليوم"}
      ],
      goldenOffers: [
        {id:"early", name:"الفترة الذهبية", type:"discount", value:15, desc:"احجزي في الفترة الصباحية المبكرة (٨–١٠ص) واحصلي على خصم 15%."},
        {id:"specialist", name:"الأخصائي المميز", type:"bonus", value:1, desc:"عند الحجز مع أخصائي مميز ⭐، تحصلين على جلسة إضافية مجانية بعد كل 5 حجوزات."},
        {id:"newprogram", name:"جرّبي برنامجًا جديدًا", type:"discount", value:10, desc:"أول حجز في برنامج علاجي جديد لطفلك بخصم 10%."}
      ],
      insuranceCompanies: [
        {name:"بوبا العربية (Bupa Arabia)", covers:["تقييم وتشخيص","علاج تخاطب","علاج وظيفي"], notCovers:["تعديل سلوك"], copay:20, note:"تغطية التدخل المبكر لمن هم أقل من 6 سنوات ضمن بوالص المنشآت فقط."},
        {name:"التعاونية (Tawuniya)", covers:["تقييم وتشخيص","علاج تخاطب","علاج وظيفي","تعديل سلوك"], notCovers:[], copay:15, note:"التغطية مرتبطة بتشخيص طيف التوحد رسميًا."},
        {name:"ميدغلف (MedGulf)", covers:["تقييم وتشخيص","علاج تخاطب"], notCovers:["علاج وظيفي","تعديل سلوك"], copay:25, note:"تغطية تقديرية لحالات غير التوحد كالتأخر اللغوي."},
        {name:"والاء (Walaa)", covers:["تقييم وتشخيص"], notCovers:["علاج تخاطب","علاج وظيفي","تعديل سلوك"], copay:100, note:"تغطية التأهيل غير متوفرة حاليًا في أغلب البوالص الفردية."}
      ],
      facilities: [
        {id:"center-demo", type:"مركز", icon:"briefcase", label:"مركز الرعاية النموذجي", code:"CENTER-1001", username:"center-team", password:"1234", tagline:"دخول كامل لنظام إدارة المركز.", services:["تقييم وتشخيص شامل","علاج تخاطب","علاج وظيفي","تعديل سلوك","برنامج تدخل مبكر","إدارة الفواتير والتأمين"]},
        {id:"clinic-demo", type:"عيادة", icon:"medical", label:"عيادة شريكة", code:"CLINIC-2001", username:"clinic-team", password:"1234", tagline:"خدمات علاجية مركّزة.", services:["كشف تقييم سريع","جلسات علاج تخاطب فردية","تحويل للمركز عند الحاجة لبرنامج شامل"]},
        {id:"hospital-demo", type:"مستشفى", icon:"pulse", label:"قسم شريك بمستشفى", code:"HOSPITAL-3001", username:"hospital-team", password:"1234", tagline:"تنسيق إحالات وتقارير.", services:["استقبال إحالات القسم","تقارير تشخيصية للأطباء المحوّلين","تنسيق برنامج علاجي بعد الخروج"]},
        {id:"school-demo", type:"مدرسة", icon:"school", label:"مدرسة شريكة", code:"SCHOOL-2001", username:"school-team", password:"1234", tagline:"متابعة أهداف الطلاب.", services:["عرض الأهداف العلاجية المصرح بها للمعلمين","متابعة تقدم الطالب داخل الفصل","تنسيق خطة الدمج مع المركز"]}
      ],
      adminAccounts: [],
      adminSession: null,
      featuredPartner: null,
      orgProfileDraft: null,
      standardizedAssessments: [
        {id:"sa-1", patientId:"p1", staffId:"st-2", instrument:"VB-MAPP", date:"2026-08-20", domains:[
          {name:"المخاطبة (Mand)", score:3}, {name:"التسمية (Tact)", score:2}, {name:"الاستجابة السمعية (Listener Responding)", score:3},
          {name:"التقليد الحركي (Motor Imitation)", score:4}, {name:"التقليد الصوتي / الإيكويك (Echoic)", score:2},
          {name:"المطابقة البصرية (Visual Perceptual / MTS)", score:3}, {name:"اللعب المستقل (Independent Play)", score:2},
          {name:"مهارات المجموعة والصف (Group Skills)", score:1}, {name:"التركيب اللغوي (Linguistic Structure)", score:2}
        ], notes:"تقدّم واضح في المخاطبة والتقليد الحركي مقارنة بالتقييم السابق. يحتاج دعمًا إضافيًا في مهارات المجموعة."}
      ]
    };
    const roles = {
      supervisor:{label:"الإشراف",icon:"eye",desc:"الإشراف على التشغيل والملفات والفريق",nav:["myIpad","scribe","claims","calls","digital","patients","assessments","videoLab","ebnak","schedule","referrals","team","departments","attendance","connect","communicationHub","library","liveOps","ipads","deptPlan","intakeAI","audit"]},
      management:{label:"الإدارة",icon:"chart",desc:"لوحة التحكم الأم — الأقسام وبوابة الأسرة وصلاحيات الفريق وإعدادات المركز",nav:["scribe","claims","calls","server","digital","patients","assessments","videoLab","ebnak","schedule","referrals","team","departments","attendance","reports","invoices","connect","communicationHub","library","reviewRequests","liveOps","ipads","deptPlan","intakeAI","agents","audit","settings"]},
      staff:{label:"الموظفون",icon:"medical",desc:"ملفات الجلسات والخطة اليومية",nav:["myIpad","scribe","patients","assessments","videoLab","ebnak","schedule","departments","communicationHub","library"]},
      reception:{label:"الاستقبال",icon:"bell",desc:"المواعيد والتسجيل والإحالات",nav:["claims","calls","digital","patients","assessments","schedule","referrals","departments","attendance","communicationHub"]}
    };
    const navItems = [
      ["myIpad","tablet"],["digital","clipboardCheck"],["patients","patients"],["assessments","target"],["videoLab","video"],["ebnak","heart"],["scribe","book"],["claims","idcard"],["calls","chat"],["server","globe"],["schedule","schedule"],["referrals","referrals"],
      ["team","team"],["departments","departments"],["attendance","idcard"],["reports","chart"],["invoices","invoice"],["connect","video"],["communicationHub","commHub"],["library","book"],["reviewRequests","star"],["liveOps","pulse"],["ipads","tablet"],["deptPlan","schedule"],["intakeAI","idea"],["agents","bell"],["audit","shield"],["settings","settings"]
    ];
    // ↩ منقولة من js/04-connect-comm-library.js (لازم تكون متعرّفة هنا قبل ما تتستخدم وقت التحميل)
    function migrateLibrary(st){
      if(!Array.isArray(st.libraryArticles)) st.libraryArticles=[];
      if(!Array.isArray(st.libraryApplications)) st.libraryApplications=[];
      if(!st.libraryTab) st.libraryTab="family";
      if(!st.libraryFilter) st.libraryFilter="الكل";
      st.libraryArticles.forEach(a=>{
        if(!Array.isArray(a.tags)) a.tags=[];
        if(a.videoStatus===undefined) a.videoStatus=(a.type==="فيديو تعليمي")?"قريبًا":null;
      });
    }
`;export{e as default};
//# sourceMappingURL=01-core-seed-iVU4jSy5.js.map
