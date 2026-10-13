const e=`"use strict";
// أوان — الجزء 21: توحيد نقطة دخول الاستقبال

    function intakeHomeView(){
      return typeof rcDeskView==="function"?rcDeskView():head("الاستقبال","محطة الاستقبال","تسجيل الأسر ومتابعة المواعيد ودراسة الحالة في مكان واحد.","");
    }
    function imCan(view){const role=roles[state.role];return !!role&&role.nav.includes(view)}

    const _imHubBar=hubBar;
    hubBar=function(){
      if(!["intakeHome","frontDesk","intakeAI"].includes(state.view))return _imHubBar.apply(this,arguments);
      if(state.view==="intakeHome")return "";
      return \`<nav class="hb-bar"><button class="btn btn-outline" onclick="setView('intakeHome')">→ الاستقبال</button><span style="font-weight:800;padding:0 10px">\${state.view==="frontDesk"?"تسجيل الأسرة":"دراسة الحالة"}</span></nav>\`;
    };
    const _imHubGo=hubGo;
    hubGo=function(k){if(k==="intake"&&imCan("intakeHome"))return setView("intakeHome");return _imHubGo.apply(this,arguments)};
    const _imRoleHome=roleHome;
    roleHome=function(){return state.view==="intakeHome"&&imCan("intakeHome")?intakeHomeView():_imRoleHome.apply(this,arguments)};
    (function imWire(){
      const hub=HUBS.find(h=>h.k==="intake");
      if(hub){hub.d="تسجيل الأسر ودراسة الحالة والإحالات";hub.views=[["intakeHome","الاستقبال"],["frontDesk","تسجيل الأسرة"],["intakeAI","دراسة الحالة"],["referrals","الإحالات"],["calls","الاستقبال الصوتي"]];const g=ORG_GROUPS.find(x=>x.k==="intake");if(g)g.keys=hub.views.map(v=>v[0])}
      if(!navItems.some(n=>n[0]==="intakeHome")){const i=navItems.findIndex(n=>n[0]==="frontDesk");navItems.splice(i>=0?i:1,0,["intakeHome","referrals"])}
      ["reception","supervisor","management"].forEach(r=>{const nav=roles[r].nav;if(!nav.includes("intakeHome"))nav.unshift("intakeHome")});
      Object.values(roles).forEach(role=>{role.nav=role.nav.filter(k=>k!=="frontDesk"&&k!=="intakeAI")});
    })();

    Object.assign(window,{intakeHomeView,hubBar,hubGo,roleHome});
    if(["intakeHome","frontDesk","intakeAI"].includes(state.view))render();
`;export{e as default};
//# sourceMappingURL=21-intake-modes-Bbadol2u.js.map
