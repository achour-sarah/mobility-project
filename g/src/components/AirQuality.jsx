import React from 'react';

const INDICE_LABEL = (v) => {
  if (v<=2) return { label:'Très bon',     color:'#22c55e' };
  if (v<=4) return { label:'Bon',          color:'#84cc16' };
  if (v<=6) return { label:'Moyen',        color:'#f59e0b' };
  if (v<=8) return { label:'Mauvais',      color:'#f97316' };
  return           { label:'Très mauvais', color:'#ef4444' };
};

export default function AirQuality({ data }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Qualité de l'air — Stations</h2>
      <div style={styles.grid}>
        {data.slice(0,6).map((st,i)=>{
          const {label,color} = INDICE_LABEL(st.indice_atmo);
          return (
            <div key={i} style={styles.stationCard}>
              <div style={styles.stationHeader}>
                <div style={styles.stationNom}>{st.station_nom}</div>
                <span style={{...styles.indice, background:color+'22', color}}>{label} ({st.indice_atmo}/10)</span>
              </div>
              <div style={styles.polluants}>
                {Object.entries(st.polluants||{}).map(([pol,info])=>(
                  <div key={pol} style={styles.polluant}>
                    <span style={styles.polName}>{pol}</span>
                    <span style={styles.polVal}>{info.valeur} {info.unite}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card:         { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' },
  title:        { margin:'0 0 16px', fontSize:'15px', fontWeight:600, color:'#1a1f3c' },
  grid:         { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' },
  stationCard:  { background:'#f8faff', borderRadius:'10px', padding:'14px' },
  stationHeader:{ marginBottom:'10px' },
  stationNom:   { fontWeight:600, fontSize:'12px', color:'#1a1f3c', marginBottom:'6px' },
  indice:       { fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px' },
  polluants:    { display:'flex', flexDirection:'column', gap:'4px' },
  polluant:     { display:'flex', justifyContent:'space-between', fontSize:'12px' },
  polName:      { color:'#888' },
  polVal:       { fontWeight:600, color:'#333' },
};
