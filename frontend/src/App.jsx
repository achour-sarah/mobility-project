import React, { useState, useEffect, useRef } from 'react';
import { getTrafic, getTransports, getAir, getMeteo, getStats } from './api';
import DashboardPage  from './pages/DashboardPage';
import CartePage      from './pages/CartePage';
import SimulationPage from './pages/SimulationPage';
import RecoPage       from './pages/RecoPage';
import Simulation3DPage from './pages/Simulation3DPage';
import AboutPage      from './pages/AboutPage';
import ChatCitoyen    from './components/ChatCitoyen';
import './index.css';

const REFRESH = 10000; // 10s

const TABS = [
  { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
  { id: 'reco',       icon: '🌿', label: 'Mon Trajet Vert' },
  { id: 'simulation', icon: '🧪', label: 'Lab Urbain 2200' },
  { id: '3d',         icon: '🗼', label: 'Paris 3D & Tourisme' },
  { id: 'about',      icon: '🎓', label: 'Équipe & Projet' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    trafic: [], transports: [], meteo: [], air: [], stats: null
  });
  const [alertes, setAlertes] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const mapRef = useRef(null);

  const fetchAll = async () => {
    setSyncing(true);
    try {
      const [traf, trans, ai, met, st] = await Promise.all([
        getTrafic(), getTransports(), getAir(), getMeteo(), getStats(),
      ]);
      const tData = traf.data.data;
      const trData = trans.data.data;
      const aData = ai.data.data;
      
      setData({
        trafic: tData,
        transports: trData,
        meteo: met.data.data,
        air: aData,
        stats: st.data.kpis
      });
      setLastUpdate(new Date());
      setError(null);

      // --- Logique de génération des alertes pour les lignes perturbées ---
      const nouvellesAlertes = [];
      tData.forEach(seg => {
        if (seg.fluidite === 'bloqué')
          nouvellesAlertes.push({ type:'danger', msg:`Blocage trafic: ${seg.nom_segment} (${seg.vitesse_kmh} km/h)`, time: new Date().toLocaleTimeString('fr-FR') });
      });
      trData.forEach(l => {
        if (l.statut === 'interrompu' || l.statut === 'ralenti')
          nouvellesAlertes.push({ type:(l.statut==='interrompu'?'danger':'warning'), msg:`Ligne ${l.ligne} : Trafic ${l.statut}`, time: new Date().toLocaleTimeString('fr-FR') });
      });
      aData.forEach(st => {
        if (st.indice_atmo >= 7)
          nouvellesAlertes.push({ type:'warning', msg:`Pic pollution: ${st.station_nom} (Indice ${st.indice_atmo}/10)`, time: new Date().toLocaleTimeString('fr-FR') });
      });
      setAlertes(nouvellesAlertes.slice(0, 8)); // Conserver les 8 plus récentes

    } catch(e) { 
      setError('Erreur de synchronisation backend');
      console.error(e); 
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, REFRESH);
    return () => clearInterval(iv);
  }, []);

  const d = data;

  return (
    <div style={styles.appContainer}>
      {/* HEADER PROFESSIONNEL (LIGHT MODE) */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBox}>
            <span style={styles.logoIcon}>🏙️</span>
          </div>
          <div>
            <h1 style={styles.appTitle}>SmartMobility IDF</h1>
            <div style={styles.appSubtitle}>Supervision Globale & Aide à la Décision</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              ...styles.navBtn,
              ...(activeTab === t.id ? styles.navBtnActive : {})
            }}>
              <span style={styles.navIcon}>{t.icon}</span>
              <span style={{...styles.navLabel, color: activeTab === t.id ? '#1e40af' : '#64748b'}}>{t.label}</span>
              {activeTab === t.id && <div style={styles.activeIndicator} />}
            </button>
          ))}
        </nav>

        <div style={styles.headerRight}>
          {d.meteo && d.meteo.length > 0 && (
            <div style={styles.meteoBox}>
              <span style={{fontSize:'16px'}}>🌡️</span>
              <span style={{fontWeight:700, color:'#0f172a'}}>{d.meteo[0].temperature}°C</span>
              <span style={{fontSize:'11px', color:'#64748b'}}>{d.meteo[0].description}</span>
            </div>
          )}
          {error && <div style={styles.errorBadge}>⚠️ {error}</div>}
          <div style={styles.statusBox}>
            <div style={{...styles.statusDot, background: syncing ? '#f59e0b' : '#10b981', boxShadow: `0 0 8px ${syncing ? '#f59e0b' : '#10b981'}80`}} />
            <div style={styles.statusText}>
              <div>{syncing ? 'Synchro...' : 'Direct'}</div>
              <div style={styles.timeText}>{lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : '--:--:--'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main style={styles.main}>
        {!d.stats && !error && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p>Chargement des données franciliennes...</p>
          </div>
        )}
        {d.stats && activeTab === 'dashboard'  && <DashboardPage stats={d.stats} trafic={d.trafic} transports={d.transports} air={d.air} alertes={alertes} />}
        {d.stats && activeTab === 'simulation' && <SimulationPage />}
        {d.stats && activeTab === 'reco'       && <RecoPage trafic={d.trafic} transports={d.transports} air={d.air} meteo={d.meteo} />}
        {d.stats && activeTab === '3d'         && <Simulation3DPage meteo={d.meteo} air={d.air} trafic={d.trafic} />}
        {d.stats && activeTab === 'about'      && <AboutPage />}
      </main>

      {/* CHAT CITOYEN */}
      <ChatCitoyen onNouveauSignalement={fetchAll} />
    </div>
  );
}

const styles = {
  appContainer:   { minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  header:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 },
  headerLeft:     { display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' },
  logoBox:        { width: '44px', height: '44px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' },
  logoIcon:       { fontSize: '24px' },
  appTitle:       { fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#0f172a' },
  appSubtitle:    { fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' },
  nav:            { display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  navBtn:         { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' },
  navBtnActive:   { background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  navIcon:        { fontSize: '16px' },
  activeIndicator:{ position: 'absolute', bottom: '-6px', left: '20%', width: '60%', height: '3px', background: '#2563eb', borderRadius: '3px' },
  headerRight:    { display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', justifyContent: 'flex-end' },
  meteoBox:       { display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '30px', border: '1px solid #e2e8f0' },
  statusBox:      { display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '30px', border: '1px solid #e2e8f0' },
  statusDot:      { width: '8px', height: '8px', borderRadius: '50%' },
  statusText:     { fontSize: '11px', fontWeight: 600, color: '#64748b' },
  timeText:       { fontSize: '13px', fontWeight: 700, color: '#0f172a' },
  errorBadge:     { background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid #fca5a5' },
  main:           { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
  loadingContainer:{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#64748b' },
  spinner:        { width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' },
};