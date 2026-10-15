const e=`"use strict";
// أوان — الجزء 21: نقطة دخول الاستقبال الموحدة

    function intakeHomeView(){
      return typeof rcDeskView==="function"?rcDeskView():head("الاستقبال","محطة الاستقبال","تسجيل الأسر ومتابعة المواعيد ودراسة الحالة في مكان واحد.","");
    }

    const _imHubBar=hubBar;
    hubBar=function(){
      if(!["intakeHome","frontDesk","intakeAI"].includes(state.view))return _imHubBar.apply(this,arguments);
      return "";
    };
    const _imHubGo=hubGo;
    hubGo=function(k){if(k==="intake")return setView("rcDesk");return _imHubGo.apply(this,arguments)};
    const _imRoleHome=roleHome;
    roleHome=function(){return ["intakeHome","frontDesk"].includes(state.view)?intakeHomeView():_imRoleHome.apply(this,arguments)};
    (function imWire(){
      const hub=HUBS.find(h=>h.k==="intake");
      if(hub){hub.d="تسجيل الأسر ومتابعة المواعيد والاستفسارات";hub.views=[["rcDesk","الاستقبال"],["referrals","الإحالات"],["calls","الاستقبال الصوتي"]];const g=ORG_GROUPS.find(x=>x.k==="intake");if(g)g.keys=hub.views.map(v=>v[0])}
      navItems.splice(0,navItems.length,...navItems.filter(n=>!["intakeHome","frontDesk","intakeAI"].includes(n[0])));
      Object.values(roles).forEach(role=>{role.nav=role.nav.filter(k=>!["intakeHome","frontDesk","intakeAI"].includes(k))});
    })();

    Object.assign(window,{intakeHomeView,hubBar,hubGo,roleHome});
    if(["intakeHome","frontDesk"].includes(state.view)){state.view="rcDesk";render()}
`;export{e as default};
//# sourceMappingURL=21-intake-modes-DFDkXHMV.js.map
