// Generated from awan_8/js/02-server-state-notify.js
export const ICONS = {
      tablet:'<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
      home:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
      patients:'<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.5-3.6 3.3-6 6.5-6s6 2.4 6.5 6"/>',
      schedule:'<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3.2 2"/>',
      referrals:'<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
      team:'<circle cx="9" cy="8.5" r="2.8"/><path d="M3.8 19c.4-3 2.6-5 5.2-5s4.8 2 5.2 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 14.3c2.1.4 3.7 2.1 4 4.7"/>',
      departments:'<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
      settings:'<line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="11" cy="17" r="2"/>',
      check:'<path d="M5 13l4.5 4.5L19 7"/>',
      chat:'<path d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.4 0 2.4 1.3 4.6 3.4 6l-.9 3.6 3.8-1.7c.7.15 1.4.2 2.2.2 4.7 0 8.5-3.3 8.5-7.4S16.7 3.5 12 3.5Z"/><circle cx="8.7" cy="10.9" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="10.9" r=".9" fill="currentColor" stroke="none"/><circle cx="15.3" cy="10.9" r=".9" fill="currentColor" stroke="none"/>',
      heart:'<path d="M12 20s-7.2-4.4-9.4-8.9C1 7.6 3 4.5 6.3 4.5c1.9 0 3.4 1 4.7 2.6C12.3 5.5 13.8 4.5 15.7 4.5c3.3 0 5.3 3.1 3.7 6.6C19.2 15.6 12 20 12 20Z"/>',
      lock:'<rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
      speech:'<path d="M4.5 5.5h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H10l-4.2 3.4V15.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"/>',
      blocks:'<rect x="4" y="4" width="8" height="8" rx="1.6"/><rect x="12" y="12" width="8" height="8" rx="1.6"/><rect x="4" y="12" width="8" height="8" rx="1.6" opacity=".45"/>',
      target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
      idea:'<circle cx="12" cy="10" r="5.5"/><line x1="12" y1="15.5" x2="12" y2="18"/><line x1="9.5" y1="20" x2="14.5" y2="20"/>',
      pulse:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
      briefcase:'<rect x="3.5" y="8" width="17" height="11" rx="1.8"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="3.5" y1="13" x2="20.5" y2="13"/>',
      school:'<path d="M12 3 3 8v2h18V8Z"/><rect x="5" y="10" width="14" height="9"/><line x1="9" y1="19" x2="9" y2="14"/><line x1="15" y1="19" x2="15" y2="14"/>',
      book:'<path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0Z"/><path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0Z"/>',
      medical:'<circle cx="12" cy="12" r="8.5"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
      idcard:'<rect x="3.5" y="6" width="17" height="12" rx="2"/><circle cx="9" cy="12" r="2"/><line x1="13.5" y1="10.5" x2="18" y2="10.5"/><line x1="13.5" y1="13.5" x2="18" y2="13.5"/>',
      eye:'<path d="M2.5 12c2.4-3.6 5.8-5.5 9.5-5.5s7.1 1.9 9.5 5.5c-2.4 3.6-5.8 5.5-9.5 5.5S4.9 15.6 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
      chart:'<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="13" width="3" height="7"/><rect x="11" y="9" width="3" height="11"/><rect x="16" y="5" width="3" height="15"/>',
      bell:'<path d="M12 4a5 5 0 0 0-5 5v3.5L5 16h14l-2-3.5V9a5 5 0 0 0-5-5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
      question:'<circle cx="12" cy="12" r="8.5"/><path d="M9.3 9.6a2.7 2.7 0 0 1 5.3.7c0 1.8-2.6 2.1-2.6 3.9"/><circle cx="12" cy="17.1" r=".25" fill="currentColor" stroke="none"/>',
      chevronDown:'<path d="M5 9l7 7 7-7"/>',
      globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.3 4 5.3 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.3-4-8.5s1.4-6.2 4-8.5Z"/>',
      star:'<path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.7 1.1-5.9-4.3-4.1 5.9-.7Z"/>',
      chevronLeft:'<path d="M15 6l-6 6 6 6"/>',
      shield:'<path d="M12 3.5 19 6.3v5.4c0 5-3.2 8.4-7 9.8-3.8-1.4-7-4.8-7-9.8V6.3Z"/><path d="M9 12l2 2 4-4.5"/>'
      ,mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 11.5a6 6 0 0 0 12 0"/><line x1="12" y1="17.5" x2="12" y2="20.5"/><line x1="8.5" y1="20.5" x2="15.5" y2="20.5"/>'
      ,invoice:'<path d="M6 3.5h12v17l-2.2-1.4-2 1.4-1.8-1.4-1.8 1.4-2-1.4L6 20.5Z"/><line x1="8.5" y1="8" x2="15.5" y2="8"/><line x1="8.5" y1="11.5" x2="15.5" y2="11.5"/><line x1="8.5" y1="15" x2="13" y2="15"/>'
      ,video:'<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="M15.5 10.2 21 7.5v9l-5.5-2.7Z"/>'
      ,commHub:'<path d="M4 5.5h12a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H9.5L6 17v-3H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"/><path d="M16.6 4.2a4.6 4.6 0 0 1 3 4.3"/><path d="M18.3 2.7a7.3 7.3 0 0 1 4.4 6.7" opacity=".55"/><circle cx="19.7" cy="8.6" r="1" fill="currentColor" stroke="none"/>'
      ,clipboardCheck:'<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 12.5l2 2 4-4.5"/>'
    };
