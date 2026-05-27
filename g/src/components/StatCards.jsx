import React from 'react';

export default function StatCards({ stats }) {
  const cards = [
    { label:'Vitesse moyenne',   value:`${stats.trafic.vitesse_moyenne} km/h`,  sub:`${stats.trafic.total_mesures} mesures/heure`, color:'#3b82f6', icon:'🚗' },
    { label:'Occupation réseau', value:`${stats.trafic.occupation_moyenne}%`,   sub:`Libre: ${stats.trafic.repartition.libre} | Dense: ${stats.trafic.repartition.dense}`, color:'#f59e0b', icon:'🛣️' },
    { label:'Indice qualité air',value:`${stats.air.indice_moyen}/10`,          sub:stats.air.indice_moyen<=3?'Bon':stats.air.indice_moyen<=6?'Moyen':'Mauvais', color:stats.air.indice_moyen<=3?'#22c55e':stats.air.indice_moyen<=6?'#f59e0b':'#ef4444', icon:'🌿' },
    { label:'Lignes perturbées', value:`${stats.transports.perturbees+stats.transports.interrompues}`, sub:`Sur ${stats.transports.total_lignes} lignes`, color:'#ef4444', icon:'🚇' },
  ];
  return (
    <div style={styles.grid}>
      {cards.map((c,i) => (
        <div key={i} style={styles.card}>
          <div style={styles.iconBox}><span style={{fontSize:'24px'}}>{c.icon}</span></div>
          <div>
            <div style={styles.label}>{c.label}</div>
            <div style={{...styles.value, color:c.color}}>{c.value}</div>
            <div style={styles.sub}>{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' },
  card:    { background:'#fff', borderRadius:'12px', padding:'16px', display:'flex', gap:'14px', alignItems:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  iconBox: { width:'48px', height:'48px', background:'#f0f2f5', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' },
  label:   { fontSize:'12px', color:'#888', marginBottom:'4px' },
  value:   { fontSize:'22px', fontWeight:700 },
  sub:     { fontSize:'11px', color:'#aaa', marginTop:'2px' },
};
