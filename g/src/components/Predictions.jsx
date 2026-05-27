import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPredictions } from '../api';

const SEGMENTS = ['A1-001','A3-001','A4-001','A6-001','A13-001','BD-001','BD-002','N118-001'];

export default function Predictions() {
  const [segment, setSegment] = useState('A1-001');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPred = async (seg) => {
    setLoading(true);
    try {
      const res = await getPredictions(seg);
      setData(res.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchPred(segment); }, [segment]);

  const chartData = data?.modeles?.gradient_boosting?.predictions_future
    ?.map((v,i) => ({ minute:`+${i+1}min`, vitesse:Math.round(v*10)/10 })) || [];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Prédictions trafic</h2>
        <select value={segment} onChange={e=>setSegment(e.target.value)} style={styles.select}>
          {SEGMENTS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading && <p style={styles.loading}>Calcul en cours...</p>}
      {data && !loading && (
        <>
          <div style={styles.metriques}>
            {['arima','gradient_boosting'].map(m=>{
              const mod = data.modeles[m];
              if (!mod||mod.error) return null;
              return (
                <div key={m} style={styles.metrique}>
                  <div style={styles.modName}>{m==='arima'?'ARIMA':'GradientBoosting'}</div>
                  <div style={styles.kpis}>
                    <span>MAE : <b>{mod.mae}</b></span>
                    <span>RMSE : <b>{mod.rmse}</b></span>
                    {mod.mape&&<span>MAPE : <b>{mod.mape}%</b></span>}
                  </div>
                </div>
              );
            })}
          </div>
          {chartData.length>0&&(
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5"/>
                <XAxis dataKey="minute" tick={{fontSize:11}}/>
                <YAxis domain={['auto','auto']} tick={{fontSize:11}} unit=" km/h"/>
                <Tooltip formatter={v=>[`${v} km/h`,'Vitesse prédite']}/>
                <Legend/>
                <Line type="monotone" dataKey="vitesse" stroke="#3b82f6" strokeWidth={2} dot={{r:4}} name="Vitesse prédite"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  card:      { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'16px' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' },
  title:     { margin:0, fontSize:'15px', fontWeight:600, color:'#1a1f3c' },
  select:    { padding:'6px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px', background:'#f8faff', cursor:'pointer' },
  loading:   { color:'#888', fontSize:'13px' },
  metriques: { display:'flex', gap:'12px', marginBottom:'16px' },
  metrique:  { background:'#f8faff', borderRadius:'10px', padding:'12px 16px', flex:1 },
  modName:   { fontWeight:600, fontSize:'13px', marginBottom:'6px' },
  kpis:      { display:'flex', gap:'16px', fontSize:'12px', color:'#555' },
};
