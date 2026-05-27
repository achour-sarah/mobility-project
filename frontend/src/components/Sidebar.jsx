import React from 'react';

const NAV = [
  { id:'dashboard',       label:'Dashboard',        icon:'▦' },
  { id:'carte',           label:'Carte thermique',  icon:'🗺' },
  { id:'simulation',      label:'Simulation',       icon:'⚙' },
  { id:'recommandations', label:'Recommandations',  icon:'💡' },
];

export default function Sidebar({ page, setPage, alertes }) {
  const nbAlertes = alertes.filter(a=>a.type==='danger').length;
  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>M</div>
        <div>
          <div style={styles.logoTitle}>MobiIA</div>
          <div style={styles.logoSub}>Plateforme urbaine</div>
        </div>
      </div>
      <nav style={styles.nav}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>setPage(n.id)} style={{
            ...styles.navBtn,
            ...(page===n.id ? styles.navBtnActive : {}),
          }}>
            <span style={styles.navIcon}>{n.icon}</span>
            <span>{n.label}</span>
            {n.id==='dashboard' && nbAlertes>0 && (
              <span style={styles.badge}>{nbAlertes}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={styles.footer}>
        <div style={styles.footerDot}></div>
        <span style={styles.footerText}>Pipeline actif</span>
      </div>
    </div>
  );
}

const styles = {
  sidebar:       { width:'220px', background:'#0d1117', borderRight:'1px solid #1e293b', display:'flex', flexDirection:'column', padding:'20px 0' },
  logo:          { display:'flex', alignItems:'center', gap:'12px', padding:'0 20px 24px', borderBottom:'1px solid #1e293b' },
  logoIcon:      { width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'18px' },
  logoTitle:     { fontWeight:700, fontSize:'15px', color:'#f1f5f9' },
  logoSub:       { fontSize:'10px', color:'#475569' },
  nav:           { flex:1, padding:'16px 12px', display:'flex', flexDirection:'column', gap:'4px' },
  navBtn:        { display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', border:'none', background:'transparent', color:'#64748b', cursor:'pointer', fontSize:'13px', fontWeight:500, textAlign:'left', width:'100%', position:'relative' },
  navBtnActive:  { background:'#1e293b', color:'#f1f5f9' },
  navIcon:       { fontSize:'16px', width:'20px', textAlign:'center' },
  badge:         { marginLeft:'auto', background:'#ef4444', color:'#fff', fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'10px' },
  footer:        { padding:'16px 20px', borderTop:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'8px' },
  footerDot:     { width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e' },
  footerText:    { fontSize:'11px', color:'#475569' },
};
