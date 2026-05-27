import React from 'react';

const DESC_ICON = { 'ciel dégagé':'☀️','nuageux':'☁️','pluie légère':'🌦️','brouillard':'🌫️','partiellement nuageux':'⛅' };

export default function MeteoCard({ data }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Météo</h2>
      <div style={styles.grid}>
        {data.map((v,i)=>(
          <div key={i} style={styles.ville}>
            <div style={styles.villeHeader}>
              <span style={styles.villeName}>{v.ville}</span>
              <span style={{fontSize:'20px'}}>{DESC_ICON[v.description]||'🌡️'}</span>
            </div>
            <div style={styles.temp}>{v.temperature}°C</div>
            <div style={styles.details}>
              <span>💧 {v.humidite}%</span>
              <span>💨 {v.vent_vitesse} km/h</span>
            </div>
            <div style={styles.desc}>{v.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card:        { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  title:       { margin:'0 0 14px', fontSize:'15px', fontWeight:600, color:'#1a1f3c' },
  grid:        { display:'flex', flexDirection:'column', gap:'10px' },
  ville:       { background:'#f8faff', borderRadius:'10px', padding:'12px 14px' },
  villeHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' },
  villeName:   { fontWeight:600, fontSize:'13px', color:'#1a1f3c' },
  temp:        { fontSize:'26px', fontWeight:700, color:'#3b82f6' },
  details:     { display:'flex', gap:'12px', fontSize:'12px', color:'#666', margin:'4px 0' },
  desc:        { fontSize:'11px', color:'#aaa' },
};
