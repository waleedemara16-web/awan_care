const e=`"use strict";
// أوان — الجزء 17: تجهيز العرض التجريبي
// يملأ الشاشات اللي تطلع فاضية في العرض (آيبادي، المراقبة الحية، سجل التدقيق) للإدارة والإشراف.
// ما يغيّر أي بيانات حقيقية: المحاكاة في الذاكرة بس، وسجل التدقيق يتعبّى مرة وحدة لو كان فاضي.

    (function demoStyles(){
      const st=document.createElement("style");
      st.textContent=\`.demo-note{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 18px;padding:12px 16px;border-radius:14px;background:#E8F6F4;border:1px solid #BFE6E1;color:#0B4F52;font-size:13px}
.demo-note>span{flex:1;min-width:220px;display:flex;align-items:center;gap:8px}
.demo-note form{display:flex;gap:8px}.demo-note .input{min-width:150px}
[data-theme="dark"] .demo-note{background:#0f3a3c;border-color:#1d5c5f;color:#d6f3ef}\`;
      document.head.appendChild(st);
    })();

    // ---- آيبادي: المشرف بدون كود يشوف آيباد مشرف تجريبي بدل شاشة فاضية ----
    function demoSupervisor(){
      return state.staff.find(s=>ipOwnerEligible(s)&&(s.roleCategory==="supervisor"||/مشرف/.test(s.role||"")))||state.staff.find(s=>ipOwnerEligible(s));
    }
    const _demoMyIpad=myIpadView;
    myIpadView=function(){
      if(getCurrentPerson()||state.role!=="supervisor")return _demoMyIpad();
      const s=demoSupervisor();if(!s)return _demoMyIpad();
      ensureAllIpads();
      return \`<div class="demo-note"><span>\${ic("tablet",16)} عرض تجريبي: هذا آيباد \${esc(s.name)}. عشان تشوف آيبادك أنت، سجّل دخولك بكودك.</span><form onsubmit="staffCodeLogin(event)"><input class="input" name="code" placeholder="كود الموظف" required><button class="btn btn-primary">دخول</button></form></div>\`+staffPageHtml(s,true);
    };

    // ---- سجل التدقيق: حركات نموذجية لو السجل شبه فاضي (أقدم من أي حركة حقيقية) ----
    function demoSeedAudit(){
      ensureOpsState();if(state.demoAuditSeeded||state.auditLog.length>=10)return;
      const clin=state.staff.filter(s=>s.clinical);if(!clin.length)return;
      const sups=clin.filter(s=>s.roleCategory==="supervisor"||/مشرف/.test(s.role||""));
      const kids=state.patients.filter(p=>!p.archived);
      const label=r=>(roles[r]&&roles[r].label)||"";
      const acts=[["فتح ملف",1,0],["توقيع ملاحظة جلسة",1,0],["تسجيل حضور",0,0],["اعتماد خطة علاجية",1,1],["تحديث أهداف الجلسة",1,0],["تسجيل موافقة ولي الأمر",1,0],["مراجعة تقرير ٣ شهور",1,1],["تسجيل انصراف",0,0]];
      const now=Date.now();
      for(let i=0;i<28;i++){
        const [action,withKid,bySup]=acts[i%acts.length];
        const who=bySup&&sups.length?sups[i%sups.length]:clin[(i*5)%clin.length];
        const kid=withKid&&kids.length?kids[(i*3)%kids.length]:null;
        state.auditLog.push({id:"au-demo-"+i,at:new Date(now-(i*41+6)*60000).toISOString(),by:who.name,role:label(bySup?"supervisor":"staff"),action,target:kid?kid.name:""});
      }
      state.demoAuditSeeded=true;persist();
    }

    // ---- المراقبة الحية وآيبادات الفريق: تشغيل محاكاة الآيبادات تلقائيًا ----
    let demoSimOff=false;
    const _demoSimStop=ipSimStop;
    ipSimStop=function(){demoSimOff=true;return _demoSimStop.apply(this,arguments)};

    const _demoRender=render;
    render=function(){
      const lead=state.role==="management"||state.role==="supervisor";
      if(lead&&state.view==="audit")demoSeedAudit();
      const out=_demoRender.apply(this,arguments);
      if(lead&&!ipSim&&!demoSimOff&&!state.sipadMode&&(state.view==="liveOps"||state.view==="ipads"))
        setTimeout(()=>{if(!ipSim&&!demoSimOff)ipSimStart()},0);
      return out;
    };
    Object.assign(window,{myIpadView,ipSimStop,render});
`;export{e as default};
//# sourceMappingURL=17-demo-showcase-CFWAsEYp.js.map
