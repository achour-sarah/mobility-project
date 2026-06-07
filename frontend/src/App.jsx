import React, { useState, useEffect, useRef } from 'react';
import { getTrafic, getTransports, getAir, getMeteo, getStats } from './api';
import DashboardPage  from './pages/DashboardPage';
import CartePage      from './pages/CartePage';
import SimulationPage from './pages/SimulationPage';
import RecoPage       from './pages/RecoPage';
import Simulation3DPage from './pages/Simulation3DPage';
import AboutPage      from './pages/AboutPage';
import ChatCitoyen    from './components/ChatCitoyen';
import AccessibilitePanel from './components/AccessibilitePanel';
import './index.css';

const REFRESH = 10000; // 10s

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21h18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M5 21V12a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9" fill="#ffffff" fillOpacity="0.4" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M10 21V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9" fill="#ffffff" fillOpacity="0.7" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M15 21V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9" fill="#ffffff" fillOpacity="0.5" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M7 11C10 7.5 13 4 17.5 4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="17.5" cy="4" r="2.5" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
  </svg>
);

const DashboardIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="17" x2="9" y2="9" />
    <line x1="13" y1="17" x2="13" y2="12" />
    <line x1="17" y1="17" x2="17" y2="10" />
    <line x1="5" y1="17" x2="5" y2="7" />
  </svg>
);

const RecoIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a8.5 8.5 0 0 1-9 10Z" />
    <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
  </svg>
);

const SimulationIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12" />
    <path d="M9 3v5.4A6 6 0 0 0 5 13.6V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6.4a6 6 0 0 0-4-5.2V3" />
    <path d="M6 14h12" />
  </svg>
);

const Simulation3DIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polygon points="12 12 2 17 12 22 22 17 12 12" />
    <line x1="2" y1="7" x2="2" y2="17" />
    <line x1="12" y1="12" x2="12" y2="22" />
    <line x1="22" y1="7" x2="22" y2="17" />
  </svg>
);

const AboutIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const TABS = [
  // Espace Citoyens
  { id: 'reco',       renderIcon: (c) => <RecoIcon color={c} />, label: 'Mon Trajet Vert', group: 'citoyen' },
  { id: '3d',         renderIcon: (c) => <Simulation3DIcon color={c} />, label: 'Paris 3D & Tourisme', group: 'citoyen' },
  // Espace Gestionnaires
  { id: 'dashboard',  renderIcon: (c) => <DashboardIcon color={c} />, label: 'Dashboard', group: 'gestionnaire' },
  { id: 'simulation', renderIcon: (c) => <SimulationIcon color={c} />, label: 'Lab Urbain 2200', group: 'gestionnaire' },
  // Info
  { id: 'about',      renderIcon: (c) => <AboutIcon color={c} />, label: 'Équipe & Projet', group: 'info' },
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
  const parisMeteo = d.meteo?.find(m => m.ville.toLowerCase() === 'paris') || d.stats?.meteo_paris;

  return (
    <div style={styles.appContainer}>
      {/* HEADER PROFESSIONNEL (LIGHT MODE) */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBox}>
            <LogoIcon />
          </div>
          <div>
            <h1 style={styles.appTitle}>SmartMobility IDF</h1>
            <div style={styles.appSubtitle}>Supervision Globale & Aide à la Décision</div>
          </div>
        </div>

        <div style={styles.navContainer}>
          {/* Espace Citoyens */}
          <div style={styles.navGroup}>
            <div style={styles.navGroupTitle}>Citoyens</div>
            <div style={styles.navGroupContent}>
              {TABS.filter(t => t.group === 'citoyen').map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  ...styles.navBtn,
                  ...(activeTab === t.id ? styles.navBtnActive : {})
                }}>
                  <span style={styles.navIcon}>{t.renderIcon(activeTab === t.id ? '#2563eb' : '#64748b')}</span>
                  <span style={{...styles.navLabel, color: activeTab === t.id ? '#1e40af' : '#64748b'}}>{t.label}</span>
                  {activeTab === t.id && <div style={styles.activeIndicator} />}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.navDivider} />

          {/* Espace Gestionnaires */}
          <div style={styles.navGroup}>
            <div style={styles.navGroupTitle}>Gestionnaires Urbains</div>
            <div style={styles.navGroupContent}>
              {TABS.filter(t => t.group === 'gestionnaire').map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  ...styles.navBtn,
                  ...(activeTab === t.id ? styles.navBtnActive : {})
                }}>
                  <span style={styles.navIcon}>{t.renderIcon(activeTab === t.id ? '#2563eb' : '#64748b')}</span>
                  <span style={{...styles.navLabel, color: activeTab === t.id ? '#1e40af' : '#64748b'}}>{t.label}</span>
                  {activeTab === t.id && <div style={styles.activeIndicator} />}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.navDivider} />

          {/* Projet */}
          <div style={styles.navGroup}>
            <div style={styles.navGroupTitle}>Projet</div>
            <div style={styles.navGroupContent}>
              {TABS.filter(t => t.group === 'info').map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  ...styles.navBtn,
                  ...(activeTab === t.id ? styles.navBtnActive : {})
                }}>
                  <span style={styles.navIcon}>{t.renderIcon(activeTab === t.id ? '#2563eb' : '#64748b')}</span>
                  <span style={{...styles.navLabel, color: activeTab === t.id ? '#1e40af' : '#64748b'}}>{t.label}</span>
                  {activeTab === t.id && <div style={styles.activeIndicator} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          {parisMeteo ? (
            <div style={styles.meteoBox}>
              <span style={{fontSize:'16px'}}>📍 Paris 🌡️</span>
              <span style={{fontWeight:700, color:'#0f172a'}}>{parisMeteo.temperature}°C</span>
              <span style={{fontSize:'11px', color:'#64748b'}}>{parisMeteo.description}</span>
            </div>
          ) : (
            <div style={styles.meteoBox}>
              <span style={{fontSize:'16px'}}>📍 Paris 🌡️</span>
              <span style={{fontSize:'11px', color:'#64748b'}}>Chargement...</span>
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
        {d.stats && activeTab === 'dashboard'  && <DashboardPage stats={d.stats} trafic={d.trafic} transports={d.transports} air={d.air} alertes={alertes} meteo={d.meteo} />}
        {d.stats && activeTab === 'simulation' && <SimulationPage />}
        {d.stats && activeTab === 'reco'       && <RecoPage trafic={d.trafic} transports={d.transports} air={d.air} meteo={d.meteo} />}
        {d.stats && activeTab === '3d'         && <Simulation3DPage meteo={d.meteo} air={d.air} trafic={d.trafic} />}
        {d.stats && activeTab === 'about'      && <AboutPage />}
      </main>

      {/* CHAT CITOYEN */}
      <ChatCitoyen onNouveauSignalement={fetchAll} />

      {/* ACCESSIBILITÉ HANDICAP */}
      <AccessibilitePanel />
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
  navContainer:    { display: 'flex', alignItems: 'center', gap: '12px' },
  navGroup:        { display: 'flex', flexDirection: 'column', gap: '4px' },
  navGroupTitle:   { fontSize: '9px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', paddingLeft: '4px' },
  navGroupContent: { display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  navDivider:      { width: '1px', height: '36px', background: '#cbd5e1', alignSelf: 'flex-end', margin: '0 4px 4px 4px' },
  navBtn:          { position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, transition: 'all 0.2s' },
  navBtnActive:   { background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  navIcon:        { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  activeIndicator:{ position: 'absolute', bottom: '-4px', left: '20%', width: '60%', height: '3px', background: '#2563eb', borderRadius: '3px' },
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