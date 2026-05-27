import React from 'react';

const FLUIDITE_COLOR = { libre:'#22c55e', dense:'#f59e0b', 'bloqué':'#ef4444', inconnu:'#aaa' };

export default function TraficTable({ data }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Trafic temps réel — Axes IDF</h2>
      <table style={styles.table}>
        <thead>
          <tr>{['Segment','Vitesse','Fluidité','Occupation','Charge'].map(h=>(
            <th key={h} style={styles.th}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {data.map((r,i)=>(
            <tr key={i} style={i%2===0?styles.trEven:{}}>
              <td style={styles.td}>{r.nom_segment}</td>
              <td style={{...styles.td, fontWeight:600}}>{r.vitesse_kmh} km/h</td>
              <td style={styles.td}>
                <span style={{...styles.pill, background:FLUIDITE_COLOR[r.fluidite]+'22', color:FLUIDITE_COLOR[r.fluidite]}}>{r.fluidite}</span>
              </td>
              <td style={styles.td}>{r.taux_occupation}%</td>
              <td style={{...styles.td, width:'100px'}}>
                <div style={styles.barBg}>
                  <div style={{...styles.barFill, width:`${r.taux_occupation}%`, background:r.taux_occupation>70?'#ef4444':r.taux_occupation>40?'#f59e0b':'#22c55e'}}/>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  card:    { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  title:   { margin:'0 0 16px', fontSize:'15px', fontWeight:600, color:'#1a1f3c' },
  table:   { width:'100%', borderCollapse:'collapse' },
  th:      { textAlign:'left', padding:'8px 10px', fontSize:'11px', color:'#888', borderBottom:'1px solid #f0f2f5', fontWeight:500 },
  td:      { padding:'10px', fontSize:'13px', color:'#333' },
  trEven:  { background:'#fafafa' },
  pill:    { padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600 },
  barBg:   { background:'#f0f2f5', borderRadius:'4px', height:'6px', overflow:'hidden' },
  barFill: { height:'100%', borderRadius:'4px', transition:'width 0.3s' },
};
