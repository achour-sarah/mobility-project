import React, { useState, useEffect } from 'react';
import { getTrafic, getTransports, getAir, getMeteo, getStats } from './api';
import StatCards   from './components/StatCards';
import TraficTable from './components/TraficTable';
import AirQuality  from './components/AirQuality';
import MeteoCard   from './components/MeteoCard';
import Transports  from './components/Transports';
import Predictions from './components/Predictions';

const REFRESH = 30000;

export default function App() {
  const [trafic,     setTrafic]     = useState([]);
  const [transports, setTransports] = useState([]);
  const [air,        setAir]        = useState([]);
  const [meteo,      setMeteo]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading,    setLoading]    = useState(true);

  const fetchAll = async () => {
    try {
      const [t, tr, a, m, s] = await Promise.all([
        getTrafic(), getTransports(), getAir(),
        getMeteo(),  getStats(),
      ]);
      setTrafic(t.data.data);
      setTransports(tr.data.data);
      setAir(a.data.data);
      setMeteo(m.data.data);
      setStats(s.data.kpis);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
      setLoading(false);
    } catch (e) {
      console.error('Erreur fetch:', e);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={styles.loading}>Chargement des données...</div>
  );

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Plateforme Mobilité Urbaine</h1>
          <p style={styles.subtitle}>Tableau de bord temps réel — IDF</p>
        </div>
        <div style={styles.liveBox}>
          <span style={styles.dot}></span>
          <span style={styles.liveText}>LIVE</span>
          <span style={styles.updateTime}>Mis à jour : {lastUpdate}</span>
        </div>
      </div>
      {stats && <StatCards stats={stats} />}
      <div style={styles.grid}>
        <div style={styles.col2}><TraficTable data={trafic} /></div>
        <div style={styles.col1}>
          <MeteoCard data={meteo} />
          <Transports data={transports} />
        </div>
      </div>
      <AirQuality data={air} />
      <Predictions />
    </div>
  );
}

const styles = {
  app:      { fontFamily:'Segoe UI,sans-serif', background:'#f0f2f5', minHeight:'100vh', padding:'20px' },
  loading:  { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:'18px', color:'#666' },
  header:   { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a1f3c', borderRadius:'12px', padding:'20px 28px', marginBottom:'20px', color:'#fff' },
  title:    { margin:0, fontSize:'22px', fontWeight:600 },
  subtitle: { margin:'4px 0 0', fontSize:'13px', color:'#aab' },
  liveBox:  { display:'flex', alignItems:'center', gap:'8px' },
  dot:      { width:'10px', height:'10px', borderRadius:'50%', background:'#4ade80' },
  liveText: { color:'#4ade80', fontWeight:600, fontSize:'14px' },
  updateTime:{ color:'#aab', fontSize:'12px' },
  grid:     { display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px', marginBottom:'16px' },
  col2:     {},
  col1:     { display:'flex', flexDirection:'column', gap:'16px' },
};
