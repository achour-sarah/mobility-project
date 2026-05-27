import React, { useState } from 'react';

export default function Header({ lastUpdate, alertes, meteo }) {
  const [showAlertes, setShowAlertes] = useState(false);
  const paris = meteo.find(m=>m.ville==='Paris') || {};
  const nbDanger = alertes.filter(a=>a.type==='danger').length;

  return (
    <div style={styles.header}>
      <div style={styles.left}>
        <div style={styles.live}><span style={styles.dot}/>LIVE</div>
        <span style={styles.update}>Mis à jour : {lastUpdate}</span>
      </div>
      <div style={styles.right}>
        {paris.temperature && (
          <div style={styles.meteo}>
            <span style={styles.meteoIcon}>🌡️</span>
            <span>Paris {paris.temperature}°C — {paris.description}</span>
          </div>
        )}
        <div style={{position:'relative'}}>
          <button onClick={()=>setShowAlertes(!showAlertes)} style={{
            ...styles.alertBtn,
            ...(nbDanger>0 ? styles.alertBtnDanger : {}),
          }}>
            🔔 Alertes {alertes.length>0 && <span style={styles.alertCount}>{alertes.length}</span>}
          </button>
          {showAlertes && (
            <div style={styles.alertPanel}>
              <div style={styles.alertTitle}>Alertes actives</div>
              {alertes.length===0
                ? <div style={styles.alertEmpty}>Aucune alerte</div>
                : alertes.map((a,i)=>(
                  <div key={i} style={{...styles.alertItem, borderLeft:`3px solid ${a.type==='danger'?'#ef4444':'#f59e0b'}`}}>
                    <div style={styles.alertMsg}>{a.msg}</div>
                    <div style={styles.alertTime}>{a.time}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  header:      { background:'#0d1117', borderBottom:'1px solid #1e293b', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  left:        { display:'flex', alignItems:'center', gap:'16px' },
  live:        { display:'flex', alignItems:'center', gap:'6px', color:'#22c55e', fontWeight:600, fontSize:'12px' },
  dot:         { width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', display:'inline-block' },
  update:      { fontSize:'12px', color:'#475569' },
  right:       { display:'flex', alignItems:'center', gap:'16px' },
  meteo:       { display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#94a3b8' },
  meteoIcon:   { fontSize:'16px' },
  alertBtn:    { padding:'6px 14px', borderRadius:'8px', border:'1px solid #1e293b', background:'#0f1117', color:'#94a3b8', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px' },
  alertBtnDanger:{ borderColor:'#ef4444', color:'#ef4444' },
  alertCount:  { background:'#ef4444', color:'#fff', borderRadius:'10px', padding:'1px 6px', fontSize:'10px', fontWeight:700 },
  alertPanel:  { position:'absolute', right:0, top:'40px', width:'320px', background:'#1e293b', borderRadius:'10px', border:'1px solid #334155', zIndex:1000, padding:'12px', maxHeight:'300px', overflow:'auto' },
  alertTitle:  { fontWeight:600, fontSize:'13px', marginBottom:'10px', color:'#f1f5f9' },
  alertEmpty:  { color:'#475569', fontSize:'12px', textAlign:'center', padding:'20px' },
  alertItem:   { background:'#0f1117', borderRadius:'6px', padding:'8px 12px', marginBottom:'6px' },
  alertMsg:    { fontSize:'12px', color:'#e2e8f0', marginBottom:'3px' },
  alertTime:   { fontSize:'10px', color:'#475569' },
};
