import React from 'react';

const STATUT_COLOR = {
  normal:      { bg:'#dcfce7', color:'#166534' },
  perturbé:    { bg:'#fef9c3', color:'#854d0e' },
  interrompu:  { bg:'#fee2e2', color:'#991b1b' },
  information: { bg:'#dbeafe', color:'#1e40af' },
};

export default function Transports({ data }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Transports en commun</h2>
      <div style={styles.list}>
        {data.map((t,i)=>{
          const c = STATUT_COLOR[t.statut]||STATUT_COLOR.normal;
          return (
            <div key={i} style={styles.row}>
              <div style={styles.left}>
                <span style={styles.ligne}>{t.ligne}</span>
                <span style={styles.type}>{t.type_transport}</span>
              </div>
              <span style={{...styles.badge, background:c.bg, color:c.color}}>{t.statut}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card:  { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  title: { margin:'0 0 14px', fontSize:'15px', fontWeight:600, color:'#1a1f3c' },
  list:  { display:'flex', flexDirection:'column', gap:'6px' },
  row:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderRadius:'8px', background:'#fafafa' },
  left:  { display:'flex', gap:'10px', alignItems:'center' },
  ligne: { fontWeight:600, fontSize:'13px', color:'#1a1f3c' },
  type:  { fontSize:'11px', color:'#888' },
  badge: { fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px' },
};
