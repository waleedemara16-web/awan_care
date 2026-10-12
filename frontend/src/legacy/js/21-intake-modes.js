"use strict";
// أوان — الجزء 21: توحيد الاستقبال العادي والذكي في لوحة واحدة

    const IM_NORMAL=[["frontDesk","لوحة الاستقبال العادي"],["referrals","الإحالات"]];
    const IM_SMART=[["intakeAI","محرك الاستقبال الذكي"],["calls","الاستقبال الصوتي"]];
    function imMode(v){return v==="intakeHome"?"home":IM_NORMAL.some(x=>x[0]===v)?"normal":IM_SMART.some(x=>x[0]===v)?"smart":null}
    function imCan(k){return roles[state.role].nav.includes(k)}

    (function imStyles(){
      const st=document.createElement("style");
      st.textContent=`.im-pick{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:6px}
.im-card{border-radius:22px;padding:22px;display:flex;flex-direction:column;gap:14px;border:1px solid var(--line);background:var(--card);box-shadow:var(--shadow-sm)}
.im-card.smart{background:linear-gradient(150deg,#063A3E,#0E8388);color:#fff;border-color:transparent}
.im-card h2{margin:0;font-size:22px;display:flex;align-items:center;gap:10px}.im-card h2 span{font-size:26px}
.im-card .lead{margin:0;font-size:13.5px;line-height:1.8;opacity:.85}
.im-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;counter-reset:s}
.im-steps li{counter-increment:s;display:flex;gap:10px;align-items:center;font-size:13px;padding:8px 10px;border-radius:12px;background:var(--cream-2)}
.im-card.smart .im-steps li{background:rgba(255,255,255,.1)}
.im-steps li::before{content:counter(s);flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:11px;background:var(--navy);color:#fff}
.im-card.smart .im-steps li::before{background:#fff;color:#0E8388}
.im-steps li b{min-width:92px}.im-steps li small{opacity:.75}
.im-steps li.hu{outline:1px dashed #ECAE4A}
.im-nums{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.im-nums div{border-radius:12px;padding:8px;text-align:center;background:var(--cream-2)}.im-card.smart .im-nums div{background:rgba(255,255,255,.1)}
.im-nums b{display:block;font-size:20px}.im-nums small{font-size:10.5px;opacity:.8}
.im-card .btn{justify-content:center;padding:12px}
.im-card.smart .btn{background:#fff;color:#0B4F52;border-color:#fff}
.im-note{font-size:12px;opacity:.8}
.im-bar{gap:8px}.im-bar .im-t{font-weight:800;font-size:13px;padding:0 10px;white-space:nowrap;border-inline-end:1px solid var(--line)}
.im-bar.smart{background:linear-gradient(90deg,#063A3E,#0E8388);border-color:transparent}.im-bar.smart .im-t{color:#fff;border-color:rgba(255,255,255,.25)}
.im-bar.smart .hb-bar-l button{color:rgba(255,255,255,.75)}.im-bar.smart .hb-bar-l button.on{background:#fff;color:#0B4F52}
.im-bar .im-x{all:unset;cursor:pointer;font-size:12px;font-weight:700;color:var(--navy);padding:8px 12px;border-radius:11px;white-space:nowrap}
.im-bar.smart .im-x{color:#fff}
@media (max-width:900px){.im-pick{grid-template-columns:1fr}.im-nums{grid-template-columns:repeat(2,1fr)}}`;
      document.head.appendChild(st);
    })();

    function intakeHomeView(){
      return typeof rcDeskView==="function"?rcDeskView():head("الاستقبال","محطة الاستقبال","إدارة موحدة للاستقبال العادي والذكي.","");
    }

    // شريط علوي خاص بكل نوع بدل خلط الشاشات في شريط واحد
    const _imHubBar=hubBar;
    hubBar=function(){
      const m=imMode(state.view);if(!m)return _imHubBar.apply(this,arguments);if(m==="home")return "";
      const L=(m==="normal"?IM_NORMAL:IM_SMART).filter(([k])=>imCan(k));const other=m==="normal"?IM_SMART:IM_NORMAL;const to=(other.find(([k])=>imCan(k))||[])[0];
      return `<nav class="hb-bar im-bar ${m}"><button class="im-x" onclick="setView('intakeHome')">→ الاستقبال</button><span class="im-t">${m==="normal"?"👤 الاستقبال العادي":"🤖 الاستقبال الذكي"}</span><div class="hb-bar-l">${L.map(([k,l])=>`<button class="${state.view===k?"on":""}" onclick="setView('${k}')">${esc(l)}${orgBadge(k)}</button>`).join("")}</div>${to?`<button class="im-x" onclick="setView('${to}')">انتقل لل${m==="normal"?"ذكي":"عادي"} ←</button>`:""}</nav>`;
    };
    const _imHubGo=hubGo;
    hubGo=function(k){if(k==="intake"&&imCan("intakeHome"))return setView("intakeHome");return _imHubGo.apply(this,arguments)};
    const _imRoleHome=roleHome;
    roleHome=function(){return state.view==="intakeHome"&&imCan("intakeHome")?intakeHomeView():_imRoleHome.apply(this,arguments)};
    // عنوان لوحة العادي يوضح نوعها
    const _imFrontDesk=frontDeskView;
    frontDeskView=function(){return _imFrontDesk.apply(this,arguments).replace('<div class="eyebrow">الاستقبال</div><h1>الاستقبال العادي</h1>','<div class="eyebrow">الاستقبال العادي</div><h1>لوحة الاستقبال العادي</h1>')};

    (function imWire(){
      const hub=HUBS.find(h=>h.k==="intake");
      if(hub){hub.d="عادي أو ذكي";hub.views=[["intakeHome","الاستقبال"],...IM_NORMAL,...IM_SMART];const g=ORG_GROUPS.find(x=>x.k==="intake");if(g)g.keys=hub.views.map(v=>v[0])}
      if(!navItems.some(n=>n[0]==="intakeHome")){const i=navItems.findIndex(n=>n[0]==="frontDesk");navItems.splice(i>=0?i:1,0,["intakeHome","referrals"])}
      ["reception","supervisor","management"].forEach(r=>{const nav=roles[r].nav;if(!nav.includes("intakeHome"))nav.unshift("intakeHome")});
      if(!roles.reception.nav.includes("intakeAI"))roles.reception.nav.push("intakeAI");
    })();

    Object.assign(window,{intakeHomeView,hubBar,hubGo,roleHome,frontDeskView});
    if(imMode(state.view))render();
