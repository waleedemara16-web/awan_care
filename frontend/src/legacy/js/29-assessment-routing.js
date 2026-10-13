"use strict";
// أوان — إرسال حجوزات التقييم وملاحظات الأسرة مباشرة للمختص
    const arKnownAppointments=new Set((state.appointments||[]).map(a=>a.id).filter(Boolean));
    const _arPersist=persist;
    persist=function(){
      _arPersist();
      let changed=false;
      (state.appointments||[]).forEach(a=>{
        if(!a||!a.id||arKnownAppointments.has(a.id))return;
        const isAssessment=a.rsType==="assess"||/تقييم/.test(a.service||"");
        if(!isAssessment){arKnownAppointments.add(a.id);return}
        if(a.assessmentNoticeSentAt){arKnownAppointments.add(a.id);return}
        const specialist=state.staff.find(s=>s.name===a.clinician);
        if(!specialist)return;
        const p=state.patients.find(x=>x.name===a.patient);
        const fields=(p&&p.caseStudy&&p.caseStudy.fields)||{};
        const note=String(a.familyNote||a.parentNote||a.guardianNote||a.notes||fields.parentNote||fields.guardianNote||fields.reason||(p&&p.intake&&p.intake.reason)||(p&&p.need)||"").trim();
        a.newForStaff=true;
        a.assessmentNoticeSentAt=new Date().toISOString();
        arKnownAppointments.add(a.id);
        const msg=`🧩 تقييم جديد في جدولك: ${a.patient} — ${date(a.date)} ${time(a.time)}.${note?`\n📝 ملاحظات ولي الأمر: ${note}`:"\nلا توجد ملاحظات إضافية من ولي الأمر."}`;
        cmSendTo("staff:"+specialist.id,msg);
        changed=true;
      });
      if(changed)_arPersist();
    };
