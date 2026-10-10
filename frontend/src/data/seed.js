// Generated from awancare_مدمجة_محدثة_1 (1).html
export const seed = {
      center:{name:"مركز الرعاية النموذجي", city:"الرياض", phone:"0500000000", email:"info@yourcenter.sa", address:"حي النموذج، الرياض", supervisor:"د. فيصل السالم"},
      role:"supervisor", view:"public", lang:"ar", theme:"light", hubLast:{},
      patients:[
        {id:"p1",name:"علي ناصر القحطاني",file:"AWN-SRC-1001",age:"7 سنوات",need:"اضطراب طيف التوحد",program:"نطق ولغة · علاج وظيفي",school:"مدارس الأفق",status:"نشط",notes:"تحسن واضح في المبادرة بالتواصل واستخدام الجمل من كلمتين. يوصى بالاستمرار على تمارين الطلب الوظيفي.",goal:"استخدام جمل من كلمتين في 4 من 5 فرص",next:"2026-09-02T09:00",code:"ALI-1001",schoolCode:"SCHOOL-1001",guardian:"ناصر القحطاني",phone:"0500003333"},
        {id:"p2",name:"خالد سعود المطيري",file:"AWN-SRC-1002",age:"5 سنوات",need:"تأخر لغوي",program:"نطق ولغة",school:"روضة البدايات",status:"نشط",notes:"يستجيب للتعليمات المكونة من خطوة واحدة.",goal:"تسمية 20 مفردة وظيفية",next:"2026-09-03T10:00",code:"KHALID-1002",schoolCode:"SCHOOL-1002",guardian:"سعود المطيري",phone:"0500004444"},
        {id:"p3",name:"فهد تركي البقمي",file:"AWN-SRC-1003",age:"9 سنوات",need:"صعوبات تعلم",program:"علاج وظيفي · دعم أكاديمي",school:"مدارس المعرفة",status:"نشط",notes:"بحاجة إلى متابعة التآزر البصري الحركي وخطة الدمج.",goal:"إكمال نشاط كتابي لمدة 10 دقائق",next:"2026-09-04T11:15",code:"FAHAD-1003",schoolCode:"SCHOOL-1003",guardian:"تركي البقمي",phone:"0500005555"},
        {id:"p4",name:"سعود ماجد العنزي",file:"AWN-SRC-1004",age:"6 سنوات",need:"تأخر نمائي",program:"علاج طبيعي",school:"روضة النور",status:"نشط",notes:"تقدم في التوازن والانتقال بين الوضعيات.",goal:"المشي على خط مستقيم لمسافة 3 أمتار",next:"2026-09-02T10:30",code:"SAUD-1004",schoolCode:"SCHOOL-1004",guardian:"ماجد العنزي",phone:"0500006666"},
        {id:"p5",name:"منيرة عبدالعزيز الدوسري",file:"AWN-SRC-1005",age:"11 سنة",need:"احتياج سلوكي",program:"تأهيل سلوكي",school:"مدارس الريادة",status:"متوقف مؤقتاً",notes:"إجازة أسرية — تتم مراجعة الخطة عند العودة.",goal:"استخدام استراتيجية التهدئة الذاتية",next:"2026-09-07T09:30",code:"MUNIRA-1005",schoolCode:"SCHOOL-1005",guardian:"عبدالعزيز الدوسري",phone:"0500007777"}
      ],
      appointments:[
        {date:"2026-09-02",time:"09:00",patient:"علي ناصر القحطاني",service:"جلسة نطق ولغة",clinician:"أ. هند العتيبي",room:"غرفة 2",status:"مجدول"},
        {date:"2026-09-02",time:"10:30",patient:"سعود ماجد العنزي",service:"علاج طبيعي",clinician:"أ. لمياء الحربي",room:"صالة الحركة",status:"مجدول"},
        {date:"2026-09-02",time:"11:15",patient:"خالد سعود المطيري",service:"تقييم أولي",clinician:"د. فيصل السالم",room:"غرفة التقييم",status:"مكتمل"},
        {date:"2026-09-03",time:"10:00",patient:"خالد سعود المطيري",service:"جلسة نطق ولغة",clinician:"أ. هند العتيبي",room:"غرفة 2",status:"مجدول"},
        {date:"2026-09-04",time:"11:15",patient:"فهد تركي البقمي",service:"علاج وظيفي",clinician:"أ. عمر الدوسري",room:"غرفة 4",status:"مجدول"},
        {date:"2026-09-07",time:"09:30",patient:"منيرة عبدالعزيز الدوسري",service:"تأهيل سلوكي",clinician:"أ. نورة السهلي",room:"غرفة 1",status:"ملغي"}
      ],
      referrals:[
        {name:"إحالة من مستشفى الملك فهد",person:"د. سلمى الأحمدي",type:"طبية",priority:"عالية",status:"جديدة",date:"2026-09-01"},
        {name:"طلب تقييم مدرسي — فهد",person:"أ. ريم القحطاني",type:"مدرسة",priority:"متوسطة",status:"قيد الفرز",date:"2026-08-31"},
        {name:"استفسار أسرة جديدة",person:"هيا الزهراني",type:"عام",priority:"منخفضة",status:"تم التواصل",date:"2026-08-29"}
      ],
      staff:[
        {name:"د. فيصل السالم",role:"مدير طبي وأخصائي نطق",schedule:"08:00 — 16:00",status:"متاح",present:true,premium:true},
        {name:"أ. هند العتيبي",role:"أخصائية نطق ولغة",schedule:"08:00 — 15:00",status:"متاحة",present:true,premium:true},
        {name:"أ. عمر الدوسري",role:"أخصائي علاج وظيفي",schedule:"09:00 — 17:00",status:"في جلسة",present:false},
        {name:"أ. لمياء الحربي",role:"أخصائية علاج طبيعي",schedule:"08:30 — 16:30",status:"متاحة",present:true},
        {name:"أ. نورة السهلي",role:"أخصائية تأهيل سلوكي",schedule:"09:00 — 17:00",status:"إجازة",present:false}
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
      sessionPrice: 150,
      familySession: null,
      bookingDraft: null,
      sessionBookings: [],
      packagePurchases: [],
      facilityTab: null,
      facilitySession: null,
      packages: [
        {id:"starter", name:"باقة البداية", sessions:4, price:520, badge:"", desc:"لتجربة البرنامج العلاجي على مدار أسبوعين."},
        {id:"growth", name:"باقة التقدم", sessions:12, price:1380, badge:"الأكثر طلبًا", desc:"الأنسب لمتابعة شهرية متكاملة بخصم عن سعر الجلسة الفردية."},
        {id:"pro", name:"باقة الاستمرارية", sessions:24, price:2500, badge:"أفضل قيمة", desc:"لخطة علاجية طويلة المدى بأقل سعر للجلسة."}
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
        {type:"مركز", icon:"briefcase", label:"مركز الرعاية النموذجي", code:"CENTER-1001", tagline:"دخول كامل لنظام إدارة المركز.", services:["تقييم وتشخيص شامل","علاج تخاطب","علاج وظيفي","تعديل سلوك","برنامج تدخل مبكر","إدارة الفواتير والتأمين"]},
        {type:"عيادة", icon:"medical", label:"عيادة شريكة", code:"CLINIC-2001", tagline:"خدمات علاجية مركّزة.", services:["كشف تقييم سريع","جلسات علاج تخاطب فردية","تحويل للمركز عند الحاجة لبرنامج شامل"]},
        {type:"مستشفى", icon:"pulse", label:"قسم شريك بمستشفى", code:"HOSPITAL-3001", tagline:"تنسيق إحالات وتقارير.", services:["استقبال إحالات القسم","تقارير تشخيصية للأطباء المحوّلين","تنسيق برنامج علاجي بعد الخروج"]},
        {type:"مدرسة", icon:"school", label:"مدرسة شريكة", code:"SCHOOL-2001", tagline:"متابعة أهداف الطلاب.", services:["عرض الأهداف العلاجية المصرح بها للمعلمين","متابعة تقدم الطالب داخل الفصل","تنسيق خطة الدمج مع المركز"]}
      ]
    };

// Final role permissions after all awan_8 patches (01-core-seed + 15-staff-roles + 16-journey-brain)
export const roles = {
      supervisor:{label:"الإشراف",icon:"eye",desc:"الإشراف على التشغيل والملفات والفريق",nav:["brain","myIpad","scribe","claims","calls","digital","journey","patients","assessments","videoLab","schedule","referrals","team","departments","attendance","connect","communicationHub","library","liveOps","ipads","deptPlan","intakeAI","audit"]},
      management:{label:"الإدارة",icon:"chart",desc:"لوحة التحكم الأم — الأقسام وبوابة الأسرة وصلاحيات الفريق وإعدادات المركز",nav:["brain","scribe","claims","calls","server","digital","journey","patients","assessments","videoLab","ebnak","schedule","referrals","team","departments","attendance","reports","invoices","connect","communicationHub","library","reviewRequests","liveOps","ipads","deptPlan","intakeAI","agents","audit","settings"]},
      staff:{label:"الموظفون",icon:"medical",desc:"ملفات الجلسات والخطة اليومية",nav:["myIpad","schedule","journey","patients","connect"]},
      reception:{label:"الاستقبال",icon:"bell",desc:"المواعيد والتسجيل والإحالات",nav:["claims","calls","digital","journey","patients","assessments","schedule","referrals","attendance","communicationHub"]}
    };

export const navItems = [
      ["brain","idea"],["myIpad","tablet"],["digital","clipboardCheck"],["journey","target"],["patients","patients"],["assessments","target"],["videoLab","video"],["ebnak","heart"],["scribe","book"],["claims","idcard"],["calls","chat"],["server","globe"],["schedule","schedule"],["referrals","referrals"],
      ["team","team"],["departments","departments"],["attendance","idcard"],["reports","chart"],["invoices","invoice"],["connect","video"],["communicationHub","commHub"],["library","book"],["reviewRequests","star"],["liveOps","pulse"],["ipads","tablet"],["deptPlan","schedule"],["intakeAI","idea"],["agents","bell"],["audit","shield"],["settings","settings"]
    ];

// The sidebar's 9 hubs (16-profile-journey-brain.js → HUBS); each hub shows a tab strip of its views
export const HUBS = [
      {k:"brain",l:"عقل أوان",d:"القيادة بالذكاء الاصطناعي",ic:"idea",views:[["brain","مركز القيادة"],["agents","الإدارة الآلية"],["liveOps","المراقبة الحية"],["digital","لوحة الرقمنة"]]},
      {k:"my",l:"آيبادي",d:"يومي وجلساتي",ic:"tablet",views:[["myIpad","آيبادي"],["staffPage","صفحتي"]]},
      {k:"intake",l:"الاستقبال",d:"إحالات ودراسة حالة",ic:"referrals",views:[["referrals","الإحالات"],["intakeAI","الاستقبال الذكي"],["calls","الاستقبال الصوتي"]]},
      {k:"kids",l:"الأطفال",d:"الرحلة والملفات والتقييم",ic:"patients",views:[["journey","رحلة الطفل"],["patients","الملفات"],["assessments","التقييمات"],["videoLab","التقييم بالفيديو"]]},
      {k:"sessions",l:"الجلسات",d:"المواعيد والجداول",ic:"schedule",views:[["schedule","المواعيد"],["deptPlan","جدول القسم"],["scribe","الكاتب الذكي"],["ipads","آيبادات الفريق"]]},
      {k:"family",l:"الأسرة والتواصل",d:"رسائل واجتماعات وإرشاد",ic:"heart",views:[["communicationHub","أوان تواصل"],["connect","أوان كونكت"],["ebnak","ابنك ابني"],["library","مكتبة الإرشاد"]]},
      {k:"team",l:"الفريق والأقسام",d:"الموظفين والحضور",ic:"team",views:[["team","الفريق"],["departments","الأقسام"],["attendance","الحضور والغياب"]]},
      {k:"money",l:"المالية",d:"فواتير وتأمين وتقارير",ic:"invoice",views:[["invoices","الفواتير"],["claims","مطالبات التأمين"],["reports","التقارير"]]},
      {k:"gov",l:"الحوكمة والإعدادات",d:"امتثال وتدقيق وضبط",ic:"shield",views:[["audit","سجل التدقيق"],["reviewRequests","طلب التقييمات"],["license","الترخيص البلدي"],["govSupport","دعم الدولة"],["server","السيرفر والحسابات"],["settings","إعدادات المركز"]]}
    ];

// Views every signed-in role may open even though they are not in its nav
export const ALWAYS_ALLOWED = ["license","govSupport"];

export function canOpen(role, view) {
  return ALWAYS_ALLOWED.includes(view) || (view === "staffPage" && role === "staff") || roles[role].nav.includes(view);
}

export function hubViews(hub, role) {
  return hub.views.filter(([k]) => canOpen(role, k));
}

export function hubOf(view) {
  if (view === "patient") return HUBS.find((h) => h.k === "kids");
  return HUBS.find((h) => h.views.some(([k]) => k === view)) || null;
}

// First view a role lands on (the original sent "dashboard" to the first allowed nav item)
export function roleHome(role) {
  return navItems.find(([k]) => roles[role].nav.includes(k))[0];
}
