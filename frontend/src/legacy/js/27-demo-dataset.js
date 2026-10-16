"use strict";
// أوان — الجزء 27: يسجل المركز بيانات الأطفال بنفسه، من دون بيانات تجريبية.

    const DS_VER="v45";

    function dsIsDemo(){return state.center&&state.center.name==="مركز الرعاية النموذجي"}
    function dsDateAdd(d,n){const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return localDateOf(x)}
    function dsClearPatientData(){
      const patients=Array.isArray(state.patients)?state.patients:[];
      const ids=new Set(patients.map(p=>p&&p.id).filter(Boolean));
      const tokens=patients.flatMap(p=>[p&&p.id,p&&p.name,p&&p.file,p&&p.code,p&&p.schoolCode,p&&p.health&&p.health.linkCode]).filter(v=>typeof v==="string"&&v.length>1);
      const refers=(value,seen=new Set())=>{
        if(typeof value==="string")return tokens.some(token=>value.includes(token));
        if(!value||typeof value!=="object"||seen.has(value))return false;
        seen.add(value);
        return Object.entries(value).some(([key,nested])=>ids.has(key)||tokens.some(token=>key.includes(token))||refers(nested,seen));
      };
      const scrub=value=>{
        if(Array.isArray(value)){value=value.filter(item=>!refers(item));value.forEach(scrub);return value}
        if(!value||typeof value!=="object")return value;
        Object.entries(value).forEach(([key,nested])=>{
          if(ids.has(key)||tokens.some(token=>key.includes(token))||typeof nested==="string"&&refers(nested))delete value[key];
          else if(nested&&typeof nested==="object")scrub(nested);
        });
        return value;
      };
      state.patients=[];
      Object.entries(state).forEach(([key,value])=>{
        if(key==="patients")return;
        if(Array.isArray(value))state[key]=scrub(value);
        else if(value&&typeof value==="object")state[key]=scrub(value);
        else if(typeof value==="string"&&refers(value))delete state[key];
      });
      ["referrals","registrations","smartIntakes","sessionBookings","rcContacts"].forEach(key=>{if(Array.isArray(state[key]))state[key]=[]});
      Object.assign(state,{patientId:null,focusPid:null,jrCtx:null,fdSeeded:true,smSeeded:true,rsSeeded:true,rcSeeded:true,lvKids:true,demoAuto:false,demoDays:{}});
      if(typeof GD_UNDO!=="undefined")GD_UNDO.length=0;
      if(typeof NT!=="undefined")NT.length=0;
      localStorage.removeItem("awan-undo");
      localStorage.removeItem("awan-notifs");
      if(typeof ntPaint==="function")ntPaint();
      if(state.view==="patient-detail")state.view="patients";
    }

    function dsBuild(){
      dsClearPatientData();
      state.liveBoard={};state.liveFeed=[];state.liveSession=null;
      if(state.ap){state.ap.queue=[];state.ap.log=[]}
      Object.assign(state,{demoAuditSeeded:false,saSeeded:true,demoSet:DS_VER,demoSetFresh:true});
      persist();
    }

    if(dsIsDemo()&&state.demoSet!==DS_VER)dsBuild();
    const _dsReset=resetData;
    resetData=function(){const r=_dsReset.apply(this,arguments);if(dsIsDemo()&&state.demoSet!==DS_VER){dsBuild();render()}return r};
    if(window.resetData===_dsReset)window.resetData=resetData;
    Object.assign(window,{dsBuild});
    render();
