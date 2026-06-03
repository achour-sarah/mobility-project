import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const SCENARIOS = [
  { id: 'normal',    label: 'Transit Fluide',          icon: '🟢', descr: 'Flux régulier sous contrôle de l\'IA de régulation.' },
  { id: 'pointe',    label: 'Heure d\'Affluence',       icon: '⚡', descr: 'Pic de connexions physiques 7h-9h et 17h-19h.' },
  { id: 'evenement', label: 'Hyper-Rassemblement',     icon: '🏟️', descr: 'Forte concentration locale pour congrès.' },
  { id: 'incident',  label: 'Alerte Système',          icon: '⚠️', descr: 'Panne temporaire de sustentation.' },
  { id: 'meteo',     label: 'Météo Perturbée',         icon: '🌧️', descr: 'Averses ioniques imposant une régulation.' },
  { id: 'travaux',   label: 'Maintenance Réseau',      icon: '🔧', descr: 'Reconfiguration des voies.' },
];

function simulerBaseline(scenario, nbVehicules, heure) {
  const base = { normal: 75, pointe: 35, evenement: 25, incident: 15, meteo: 55, travaux: 40 };
  const vitesseBase = base[scenario] * (1 - (nbVehicules - 500) / 5000);
  const data = [];

  for (let h = 0; h <= 23; h++) {
    let v = vitesseBase;
    if (scenario === 'pointe' && ((h >= 7 && h <= 9) || (h >= 17 && h <= 19))) {
      v *= 0.4;
    } else if (scenario === 'evenement' && h >= 19 && h <= 23) {
      v *= 0.3;
    } else if (h >= 22 || h <= 5) {
      v = Math.min(v * 1.4, 120);
    }
    
    const seed = Math.sin(h) * 5;
    v = Math.max(5, Math.min(130, v + seed));
    const occ = Math.max(5, Math.min(99, 100 - v * 0.7 + seed));
    const co2 = (occ / 100) * 2.2;

    data.push({
      heure: `${String(h).padStart(2, '0')}:00`,
      vitesse: Math.round(v * 10) / 10,
      occupation: Math.round(occ * 10) / 10,
      co2: Math.round(co2 * 100) / 100,
      solar: 0
    });
  }
  return data;
}

function simuler2200(scenario, nbVehicules, heure, projects) {
  const base = { normal: 75, pointe: 35, evenement: 25, incident: 15, meteo: 55, travaux: 40 };
  
  let volMultiplier = 1.0;
  let speedMultiplier = 1.0;
  let co2Multiplier = 1.0;

  if (projects.maglev) {
    volMultiplier *= 0.25;
    speedMultiplier *= 5.8;
    co2Multiplier *= 0.05;
  }
  if (projects.drones) {
    volMultiplier *= 0.4;
    speedMultiplier *= 2.5;
    co2Multiplier *= 0.08;
  }
  if (projects.fusion) {
    co2Multiplier *= 0.005;
    speedMultiplier *= 1.15;
  }

  const vitesseBase = base[scenario] * speedMultiplier * (1 - (nbVehicules * volMultiplier - 500) / 15000);
  const data = [];

  for (let h = 0; h <= 23; h++) {
    let v = vitesseBase;
    if (scenario === 'pointe' && ((h >= 7 && h <= 9) || (h >= 17 && h <= 19))) {
      v *= projects.maglev ? 0.95 : 0.65;
    } else if (scenario === 'evenement' && h >= 19 && h <= 23) {
      v *= projects.maglev ? 0.9 : 0.55;
    } else if (h >= 22 || h <= 5) {
      v = Math.min(v * 1.35, projects.maglev ? 580 : 250);
    }

    const seed = Math.sin(h) * (projects.maglev ? 15 : 4);
    v = Math.max(20, Math.min(600, v + seed));
    const occ = Math.max(1, Math.min(99, (100 - v * 0.75 * volMultiplier + seed) * volMultiplier));
    const co2 = (occ / 100) * co2Multiplier * (projects.fusion ? 0.02 : 1.2);

    let solarEff = 0;
    if (projects.maglev && h >= 6 && h <= 18) {
      solarEff = Math.round(Math.sin((h - 6) / 12 * Math.PI) * 100);
    }

    data.push({
      heure: `${String(h).padStart(2, '0')}:00`,
      vitesse: Math.round(v * 10) / 10,
      occupation: Math.round(occ * 10) / 10,
      co2: Math.round(co2 * 1000) / 1000,
      solar: solarEff
    });
  }
  return data;
}

// 🚅 COMPOSANT VISUEL DE L'HYPERLOOP
function HyperloopSimulator({ vitesse, isMaglev, isDrones }) {
  const animationDuration = vitesse > 400 ? '0.4s' : vitesse > 200 ? '0.9s' : '3s';
  const color = isMaglev ? '#10b981' : '#3b82f6';
  
  return (
    <div style={styles.hyperloopContainer}>
      <div style={styles.hyperloopTrack}>
        <div style={{
          ...styles.hyperloopLaser,
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          boxShadow: `0 0 15px ${color}`
        }} />
        
        {/* Capsule 1 */}
        <div className="animate-capsule" style={{
          ...styles.hyperloopCapsule,
          animationDuration: animationDuration,
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}>
          <span style={{ fontSize: '11px' }}>{isMaglev ? '🚅' : '🚗'}</span>
        </div>

        {/* Capsule 2 */}
        <div className="animate-capsule" style={{
          ...styles.hyperloopCapsule,
          animationDuration: animationDuration,
          animationDelay: '0.8s',
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}>
          <span style={{ fontSize: '11px' }}>{isMaglev ? '🚅' : '🚗'}</span>
        </div>

        {/* Capsule Drones Volants */}
        {isDrones && (
          <div className="animate-drone" style={{
            ...styles.hyperloopCapsule,
            background: '#a855f7',
            boxShadow: '0 0 12px #a855f7',
          }}>
            <span style={{ fontSize: '10px' }}>🛸</span>
          </div>
        )}
      </div>
      <div style={styles.hyperloopStatus}>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Flux de transit simulé :</span>
        <b style={{ color: color }}>
          {vitesse > 400 ? '⚡ VITESSE SUB-QUANTIQUE' : vitesse > 200 ? '🚀 RAPIDE' : '🚗 RALENTI'} ({vitesse} km/h)
        </b>
      </div>
    </div>
  );
}

// ⏱️ CADRAN TACHYMÈTRE CIRCULAIRE
function Speedometer({ value, label, max = 600, color = '#10b981' }) {
  const percentage = Math.min(100, (value / max) * 100);
  const strokeDashoffset = 220 - (220 * percentage) / 100;
  
  return (
    <div style={styles.gaugeCard}>
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="6"
                strokeDasharray="220" strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
      </svg>
      <div style={styles.gaugeValue}>{Math.round(value)}</div>
      <div style={styles.gaugeUnit}>km/h</div>
      <div style={styles.gaugeLabel}>{label}</div>
    </div>
  );
}

// 🌱 CADRAN DE PURETÉ DE L'ATMOSPHÈRE
function AirPurityGauge({ co2Value, isFusion }) {
  const maxCO2 = 2.5;
  const purity = Math.max(0.1, Math.min(99.9, 100 - (co2Value / maxCO2) * 100));
  const strokeDashoffset = 220 - (220 * purity) / 100;
  const color = purity > 90 ? '#10b981' : purity > 60 ? '#f59e0b' : '#ef4444';
  
  return (
    <div style={styles.gaugeCard}>
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="6"
                strokeDasharray="220" strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
      </svg>
      <div style={styles.gaugeValue}>{purity.toFixed(1)}%</div>
      <div style={styles.gaugeUnit}>Pureté Air</div>
      <div style={styles.gaugeLabel}>{isFusion ? '⚛️ Fusion Propre' : 'Filtres Statiques'}</div>
    </div>
  );
}

// ☀️ COMPOSANT CHARGE SOLAIRE
function SolarChargeWidget({ efficiency, isMaglev }) {
  const color = isMaglev ? '#fbbf24' : '#475569';
  return (
    <div style={styles.chargeWidgetCard}>
      <div style={styles.chargeHeader}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>☀️ ALIMENTATION SOLAIRE ORBITALE</span>
        <b style={{ color: color, fontSize: '12px' }}>{isMaglev ? `${efficiency}%` : 'INACTIVE'}</b>
      </div>
      <div style={styles.chargeBarOuter}>
        <div style={{
          ...styles.chargeBarInner,
          width: `${efficiency}%`,
          backgroundColor: color,
          boxShadow: isMaglev ? '0 0 8px #fbbf24' : 'none',
          transition: 'width 0.4s ease'
        }} />
      </div>
      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
        {isMaglev ? (
          efficiency > 70 ? '☀️ Production optimale : le Maglev fonctionne en autonomie photovoltaïque pure.' :
          efficiency > 30 ? '⛅ Couvert nuageux : relais automatique assuré par batteries de stockage.' :
          '🌙 Nuit : le Maglev utilise le réseau électrique de fusion stationnaire.'
        ) : (
          'Le réseau ferroviaire actuel n\'est pas connecté aux collecteurs solaires orbitaux.'
        )}
      </div>
    </div>
  );
}

// 🖥️ TERMINAL DE CONTRÔLE QUANTIQUE
function QuantumTerminal({ scenario, projects, heure }) {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const fetchFuturisticMessage = () => {
      const systemAlerts = {
        normal: ['Régulation IA : Flux quantique stabilisé à 100%.', 'Aucune fluctuation gravitationnelle signalée sur les tronçons.'],
        pointe: ['Pic d\'affluence physique : Activation des aéro-couloirs de délestage.', 'Réseau terrestre à 78% de saturation aux abords de la Seine.'],
        evenement: ['Hyper-Rassemblement : Redirection des navettes de téléportation locale.', 'Régulation des tunnels Maglev pour éviter toute surtension.'],
        incident: ['Alerte Incident : Déviation automatique des aéro-pods.', 'Reconstruction de la matrice des rails en cours.'],
        meteo: ['Averse ionique détectée : Vitesse de sécurité activée sur le Maglev.', 'Index de glissement magnétique compensé.'],
        travaux: ['Maintenance holographique active : Voie 4 temporairement déconnectée.', 'Mise en place de corridors de sustentation temporaires.']
      };

      const messages = [...systemAlerts[scenario]];
      if (projects.maglev) {
        messages.push('🚅 Hyper-Maglev Solaire : Propulsion supraconductrice opérationnelle.');
        messages.push(`⚡ Captage photovoltaïque orbital stable à ${heure >= 7 && heure <= 17 ? 'haut rendement' : 'stockage stationnaire'}.`);
      }
      if (projects.drones) {
        messages.push('🛸 Drones-Pods : Altitude de croisière ajustée à 250m au-dessus de la Seine.');
      }
      if (projects.fusion) {
        messages.push('⚛️ Micro-Fusion : Bilan carbone nul — réacteurs stationnaires à 100%.');
      }
      
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toLocaleTimeString('fr-FR');
      
      setLogs(prev => [`[${timestamp}] ${randomMsg}`, ...prev].slice(0, 4));
    };

    fetchFuturisticMessage();
    const interval = setInterval(fetchFuturisticMessage, 3000);
    return () => clearInterval(interval);
  }, [scenario, projects, heure]);

  return (
    <div style={styles.terminalContainer}>
      <div style={styles.terminalHeader}>
        <span style={styles.terminalDot} />
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>CONSOLE QUANTIQUE - PARIS 2200</span>
      </div>
      <div style={styles.terminalBody}>
        {logs.map((log, i) => (
          <div key={i} style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: i === 0 ? '#10b981' : '#94a3b8',
            opacity: i === 0 ? 1 : 1 - i * 0.22,
            lineHeight: 1.4,
            transition: 'all 0.3s'
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const [scenario, setScenario] = useState('normal');
  const [nbVehicules, setNbVehicules] = useState(1200);
  const [heure, setHeure] = useState(8);
  const [chartMetric, setChartMetric] = useState('vitesse'); // 'vitesse' or 'co2'
  
  // Activation projets 2200
  const [projects, setProjects] = useState({
    maglev: true,  
    fusion: true,  
    drones: false   
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); 
  const timerRef = useRef(null);

  const [simBaseline, setSimBaseline] = useState(null);
  const [simFuture, setSimFuture] = useState(null);
  const [results, setResults] = useState(null);

  const recalculerSimulation = useCallback(() => {
    const baseData = simulerBaseline(scenario, nbVehicules, heure);
    const futData = simuler2200(scenario, nbVehicules, heure, projects);
    
    setSimBaseline(baseData);
    setSimFuture(futData);

    const moy = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    setResults({
      baseline: {
        vitesseMoy: Math.round(moy(baseData.map(d => d.vitesse)) * 10) / 10,
        occupationMoy: Math.round(moy(baseData.map(d => d.occupation)) * 10) / 10,
        co2Total: Math.round(baseData.reduce((a, d) => a + d.co2, 0) * 10) / 10,
        tempsTrajet: Math.round(30 / (moy(baseData.map(d => d.vitesse)) / 60) * 10) / 10,
      },
      future: {
        vitesseMoy: Math.round(moy(futData.map(d => d.vitesse)) * 10) / 10,
        occupationMoy: Math.round(moy(futData.map(d => d.occupation)) * 10) / 10,
        co2Total: Math.round(futData.reduce((a, d) => a + d.co2, 0) * 100) / 100,
        tempsTrajet: Math.round(30 / (moy(futData.map(d => d.vitesse)) / 60) * 10) / 10,
      }
    });
  }, [scenario, nbVehicules, heure, projects]);

  useEffect(() => {
    recalculerSimulation();
  }, [recalculerSimulation]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = playSpeed === 5 ? 200 : playSpeed === 2 ? 500 : 1000;
      timerRef.current = setInterval(() => {
        setHeure(h => (h + 1) % 24);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed]);

  const toggleProject = (name) => {
    setProjects(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const currentFutureMetrics = simFuture ? simFuture[heure] : { vitesse: 0, co2: 0, solar: 0 };

  // Préparation des données pour le graphe de 24h
  const getChartData = () => {
    if (!simBaseline || !simFuture) return [];
    return simBaseline.map((b, i) => ({
      heure: b.heure,
      baseline: b[chartMetric],
      future: simFuture[i][chartMetric],
    }));
  };

  const deltaVitesse = results ? Math.round(((results.future.vitesseMoy - results.baseline.vitesseMoy) / results.baseline.vitesseMoy) * 100) : 0;
  const deltaCo2 = results ? Math.round(((results.future.co2Total - results.baseline.co2Total) / results.baseline.co2Total) * 100) : 0;
  const deltaOccupation = results ? Math.round(((results.future.occupationMoy - results.baseline.occupationMoy) / results.baseline.occupationMoy) * 100) : 0;
  const deltaTemps = results ? Math.round(((results.future.tempsTrajet - results.baseline.tempsTrajet) / results.baseline.tempsTrajet) * 100) : 0;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fly-capsule {
          0% { left: -10%; }
          100% { left: 110%; }
        }
        @keyframes fly-drone {
          0% { left: -10%; top: 8px; }
          50% { top: -6px; }
          100% { left: 110%; top: 8px; }
        }
        .animate-capsule {
          animation: fly-capsule linear infinite;
        }
        .animate-drone {
          animation: fly-drone linear infinite;
          animation-duration: 2.2s;
          position: absolute;
        }
      `}</style>

      {/* HEADER DE LA STATION DE SIMULATION */}
      <div style={styles.workstationHeader}>
        <div style={styles.wHeaderLeft}>
          <div style={styles.badgeSim}>PROTOTYPE LAB</div>
          <h2 style={styles.wTitle}>Cockpit de Simulation Éco-Futuriste</h2>
          <p style={styles.wSubtitle}>Modélisation prédictive multicouche & optimisation IA des flux de transit parisiens pour l'an 2200.</p>
        </div>
        <div style={styles.wHeaderRight}>
          <div style={styles.serverStatusCard}>
            <div style={styles.serverDot} />
            <div>
              <div style={styles.serverLabel}>NOYAU PRED-IA</div>
              <div style={styles.serverStatus}>EN LIGNE (2200hz)</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        
        {/* COLONNE GAUCHE: CONTRÔLEURS DE FLUX ET DIRECTIVES */}
        <div style={styles.leftPane}>
          
          {/* PANEL 1: SITUATION DU RÉSEAU & CHRONO-VILLE */}
          <div style={styles.controlCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderNumber}>01</div>
              <div>
                <h3 style={styles.cardHeaderTitle}>Contexte & Matrice Temporelle</h3>
                <p style={styles.cardHeaderSubtitle}>Choisissez le contexte d'affluence et pilotez le temps</p>
              </div>
            </div>

            {/* Scénarios */}
            <div style={styles.scenarioLabel}>Scénarios Urbains Actifs</div>
            <div style={styles.scenariosGrid}>
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  style={{
                    ...styles.scenarioBtn,
                    ...(scenario === s.id ? styles.scenarioBtnActive : {})
                  }}
                >
                  <span style={styles.scIcon}>{s.icon}</span>
                  <div style={styles.scText}>
                    <b style={{color: scenario === s.id ? '#1e3a8a' : '#1e293b'}}>{s.label}</b>
                    <span style={styles.scDesc}>{s.descr}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Curseur de flux */}
            <div style={styles.sliderGroup}>
              <div style={styles.sliderLabel}>
                <span>Volume de Voyageurs Terrestres :</span>
                <b style={{color:'#2563eb'}}>{nbVehicules.toLocaleString()} u/min</b>
              </div>
              <input
                type="range" min={100} max={3000} step={100}
                value={nbVehicules} onChange={e => setNbVehicules(+e.target.value)}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}><span>100 (Fluide)</span><span>3 000 (Saturation)</span></div>
            </div>

            {/* Lecteur Temporel */}
            <div style={styles.chronoBox}>
              <div style={styles.chronoTitle}>⏳ Matrice Chrono-Ville (24 Heures)</div>
              <div style={styles.chronoControls}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{...styles.playBtn, background: isPlaying ? '#ef4444' : '#10b981'}}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Lancer 24h'}
                </button>
                <div style={styles.speedWrapper}>
                  {[1, 2, 5].map(s => (
                    <button
                      key={s} onClick={() => setPlaySpeed(s)}
                      style={{...styles.speedBtn, ...(playSpeed === s ? styles.speedBtnActive : {})}}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <div style={styles.timeDisplay}>
                  Heure : <b style={{color:'#6366f1', fontFamily:'monospace', fontSize:'14px'}}>{String(heure).padStart(2, '0')}:00</b>
                </div>
              </div>
              <input
                type="range" min={0} max={23} step={1}
                value={heure} onChange={e => { setHeure(+e.target.value); setIsPlaying(false); }}
                style={styles.slider}
              />
            </div>
          </div>

          {/* PANEL 2: TECHNOLOGIES ET DIRECTIVES DE L'AN 2200 */}
          <div style={styles.controlCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderNumber}>02</div>
              <div>
                <h3 style={styles.cardHeaderTitle}>Directives Technologiques 2200</h3>
                <p style={styles.cardHeaderSubtitle}>Activez les technologies d'anticipation pour la transition</p>
              </div>
            </div>

            <div style={styles.projectsList}>
              {/* Maglev */}
              <div style={{...styles.projectRow, borderColor: projects.maglev ? '#10b981' : '#e2e8f0', background: projects.maglev ? '#f0fdf4' : '#ffffff'}}>
                <div style={styles.projectInfo}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={styles.projectEmoji}>🚅</span>
                    <b style={styles.projTitle}>Hyper-Maglev Solaire (Induction Orbitale)</b>
                  </div>
                  <p style={styles.projDesc}>Réseau à sustentation magnétique à vitesse supersonique, alimenté par photovoltaïque orbital.</p>
                </div>
                <button 
                  onClick={() => toggleProject('maglev')} 
                  style={{...styles.toggleBtn, background: projects.maglev ? '#10b981' : '#cbd5e1'}}
                >
                  <div style={{...styles.toggleIndicator, transform: projects.maglev ? 'translateX(22px)' : 'translateX(2px)'}} />
                </button>
              </div>

              {/* Drones */}
              <div style={{...styles.projectRow, borderColor: projects.drones ? '#2563eb' : '#e2e8f0', background: projects.drones ? '#eff6ff' : '#ffffff'}}>
                <div style={styles.projectInfo}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={styles.projectEmoji}>🛸</span>
                    <b style={styles.projTitle}>Aéro-Pods Autonomes (Corridors 3D)</b>
                  </div>
                  <p style={styles.projDesc}>Utilisation des corridors aériens à 250m de hauteur pour le transit rapide individuel.</p>
                </div>
                <button 
                  onClick={() => toggleProject('drones')} 
                  style={{...styles.toggleBtn, background: projects.drones ? '#2563eb' : '#cbd5e1'}}
                >
                  <div style={{...styles.toggleIndicator, transform: projects.drones ? 'translateX(22px)' : 'translateX(2px)'}} />
                </button>
              </div>

              {/* Fusion */}
              <div style={{...styles.projectRow, borderColor: projects.fusion ? '#8b5cf6' : '#e2e8f0', background: projects.fusion ? '#f5f3ff' : '#ffffff'}}>
                <div style={styles.projectInfo}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={styles.projectEmoji}>⚛️</span>
                    <b style={styles.projTitle}>Micro-Fusion & Auto-Alimentation</b>
                  </div>
                  <p style={styles.projDesc}>Micro-centrales nucléaires propres et récupération thermique pour éliminer le bilan CO₂.</p>
                </div>
                <button 
                  onClick={() => toggleProject('fusion')} 
                  style={{...styles.toggleBtn, background: projects.fusion ? '#8b5cf6' : '#cbd5e1'}}
                >
                  <div style={{...styles.toggleIndicator, transform: projects.fusion ? 'translateX(22px)' : 'translateX(2px)'}} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* COLONNE DROITE: TÉLÉMÉTRIE EN TEMPS RÉEL (MISSION CONTROL) */}
        <div style={styles.rightPane}>
          
          {/* LAB MISSION CONTROL: GAUGES, TERMINAL & SIMULATEUR */}
          <div style={styles.telemetryWorkspace}>
            <div style={styles.telemetryHeader}>
              <div style={styles.telHeaderDot} />
              <span style={styles.telHeaderTitle}>PUPITRE DE CONTRÔLE RÉSEAU QUANTIQUE</span>
            </div>

            {/* Hyperloop Simulator */}
            <div style={{padding:'20px'}}>
              <HyperloopSimulator 
                vitesse={currentFutureMetrics.vitesse} 
                isMaglev={projects.maglev} 
                isDrones={projects.drones} 
              />
            </div>

            {/* Gauges & Solaire Grid */}
            <div style={styles.telemetryGrid}>
              <div style={styles.telemetryCol}>
                <div style={styles.gaugesContainer}>
                  <Speedometer 
                    value={currentFutureMetrics.vitesse} 
                    label="Vitesse Transit" 
                    max={600} 
                    color={projects.maglev ? '#10b981' : '#3b82f6'} 
                  />
                  <AirPurityGauge 
                    co2Value={currentFutureMetrics.co2} 
                    isFusion={projects.fusion} 
                  />
                </div>
              </div>
              <div style={styles.telemetryCol}>
                <SolarChargeWidget 
                  efficiency={currentFutureMetrics.solar} 
                  isMaglev={projects.maglev} 
                />
              </div>
            </div>

            {/* Quantum terminal at bottom of control panel */}
            <div style={{padding:'0 20px 20px 20px'}}>
              <QuantumTerminal 
                scenario={scenario} 
                projects={projects} 
                heure={heure} 
              />
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 4: COMPARATEUR DE RENDEMENT ET ANALYSEURS GRAPHIQUES */}
      <div style={styles.analyticsSection}>
        <div style={styles.analyticsTitleCard}>
          <h3 style={styles.analyticsSectionTitle}>📈 Rapport d'Évaluation d'Impact Environnemental et Fluides</h3>
          <p style={styles.analyticsSectionSubtitle}>Comparaison scientifique entre le modèle de référence actuel (2026) et le modèle optimisé (2200)</p>
        </div>

        <div style={styles.analyticsGrid}>
          
          {/* LISTE DES COMPARAISONS TECHNIQUES */}
          <div style={styles.kpisPane}>
            <h4 style={styles.paneMiniTitle}>Indicateurs Clés de Rendement (Moyenne 24H)</h4>
            
            <div style={styles.kpisVerticalList}>
              {/* KPI 1 */}
              <div style={styles.kpiItemCard}>
                <div style={styles.kpiMeta}>
                  <span style={styles.kpiName}>Vitesse de transit moyenne</span>
                  <span style={{...styles.kpiDeltaBadge, background:'#dcfce7', color:'#15803d'}}>
                    +{deltaVitesse}%
                  </span>
                </div>
                <div style={styles.kpiComparisonRow}>
                  <div>
                    <span style={styles.cmpLabel}>Modèle Actuel</span>
                    <b style={styles.cmpValue}>{results?.baseline.vitesseMoy} km/h</b>
                  </div>
                  <div style={styles.cmpArrow}>➔</div>
                  <div>
                    <span style={styles.cmpLabel}>Horizon 2200</span>
                    <b style={{...styles.cmpValue, color:'#10b981'}}>{results?.future.vitesseMoy} km/h</b>
                  </div>
                </div>
              </div>

              {/* KPI 2 */}
              <div style={styles.kpiItemCard}>
                <div style={styles.kpiMeta}>
                  <span style={styles.kpiName}>Émissions Carbone (CO₂)</span>
                  <span style={{...styles.kpiDeltaBadge, background:deltaCo2 < 0 ? '#dcfce7' : '#fee2e2', color: deltaCo2 < 0 ? '#15803d' : '#b91c1c'}}>
                    {deltaCo2}%
                  </span>
                </div>
                <div style={styles.kpiComparisonRow}>
                  <div>
                    <span style={styles.cmpLabel}>Modèle Actuel</span>
                    <b style={styles.cmpValue}>{results?.baseline.co2Total} t/h</b>
                  </div>
                  <div style={styles.cmpArrow}>➔</div>
                  <div>
                    <span style={styles.cmpLabel}>Horizon 2200</span>
                    <b style={{...styles.cmpValue, color:'#10b981'}}>{results?.future.co2Total} t/h</b>
                  </div>
                </div>
              </div>

              {/* KPI 3 */}
              <div style={styles.kpiItemCard}>
                <div style={styles.kpiMeta}>
                  <span style={styles.kpiName}>Saturation Moyenne au Sol</span>
                  <span style={{...styles.kpiDeltaBadge, background:'#dcfce7', color:'#15803d'}}>
                    {deltaOccupation}%
                  </span>
                </div>
                <div style={styles.kpiComparisonRow}>
                  <div>
                    <span style={styles.cmpLabel}>Modèle Actuel</span>
                    <b style={styles.cmpValue}>{results?.baseline.occupationMoy}%</b>
                  </div>
                  <div style={styles.cmpArrow}>➔</div>
                  <div>
                    <span style={styles.cmpLabel}>Horizon 2200</span>
                    <b style={{...styles.cmpValue, color:'#10b981'}}>{results?.future.occupationMoy}%</b>
                  </div>
                </div>
              </div>

              {/* KPI 4 */}
              <div style={styles.kpiItemCard}>
                <div style={styles.kpiMeta}>
                  <span style={styles.kpiName}>Temps de Trajet (Arc de 30km)</span>
                  <span style={{...styles.kpiDeltaBadge, background:'#dcfce7', color:'#15803d'}}>
                    {deltaTemps}%
                  </span>
                </div>
                <div style={styles.kpiComparisonRow}>
                  <div>
                    <span style={styles.cmpLabel}>Modèle Actuel</span>
                    <b style={styles.cmpValue}>{results?.baseline.tempsTrajet} min</b>
                  </div>
                  <div style={styles.cmpArrow}>➔</div>
                  <div>
                    <span style={styles.cmpLabel}>Horizon 2200</span>
                    <b style={{...styles.cmpValue, color:'#10b981'}}>{results?.future.tempsTrajet} min</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRAPHIQUE PRÉDICTIF RECHARTS */}
          <div style={styles.chartPane}>
            <div style={styles.chartPaneHeader}>
              <h4 style={styles.paneMiniTitle}>Courbe Prédictive Temporelle (24 Heures)</h4>
              <div style={styles.metricTabs}>
                <button 
                  onClick={() => setChartMetric('vitesse')}
                  style={{...styles.metricTabBtn, ...(chartMetric === 'vitesse' ? styles.metricTabBtnActive : {})}}
                >
                  Vitesses
                </button>
                <button 
                  onClick={() => setChartMetric('co2')}
                  style={{...styles.metricTabBtn, ...(chartMetric === 'co2' ? styles.metricTabBtnActive : {})}}
                >
                  CO₂ Émis
                </button>
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="heure" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Area 
                    name={chartMetric === 'vitesse' ? "Réseau Actuel (km/h)" : "Réseau Actuel (t/h)"} 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBaseline)" 
                  />
                  <Area 
                    name={chartMetric === 'vitesse' ? "Horizon 2200 (km/h)" : "Horizon 2200 (t/h)"} 
                    type="monotone" 
                    dataKey="future" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorFuture)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p style={styles.chartTip}>
              * Le modèle Horizon 2200 amortit totalement les pics de saturation de 08h00 et 18h00 grâce à la gestion décentralisée des corridors et de la propulsion magnétique.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' },
  
  // Workstation Header
  workstationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  wHeaderLeft: { display: 'flex', flexDirection: 'column' },
  badgeSim: { background: '#f5f3ff', color: '#7c3aed', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '30px', width: 'fit-content', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' },
  wTitle: { fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 },
  wSubtitle: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 },
  wHeaderRight: {},
  serverStatusCard: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '12px' },
  serverDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },
  serverLabel: { fontSize: '9px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px' },
  serverStatus: { fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '1px' },

  // Grille principale
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' },
  leftPane: { display: 'flex', flexDirection: 'column', gap: '24px' },
  rightPane: { display: 'flex', flexDirection: 'column' },

  // Cartes de contrôle
  controlCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', gap: '14px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' },
  cardHeaderNumber: { fontSize: '18px', fontWeight: 900, color: '#cbd5e1', fontFamily: 'monospace' },
  cardHeaderTitle: { fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0 },
  cardHeaderSubtitle: { fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' },

  // Scénarios
  scenarioLabel: { fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
  scenariosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  scenarioBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', outline: 'none' },
  scenarioBtnActive: { border: '1px solid #2563eb', background: '#eff6ff', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' },
  scIcon: { fontSize: '20px' },
  scText: { display: 'flex', flexDirection: 'column' },
  scDesc: { fontSize: '9px', color: '#64748b', marginTop: '1px', lineHeight: 1.2 },

  // Sliders
  sliderGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' },
  sliderLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: '#475569' },
  slider: { width: '100%', cursor: 'pointer' },
  sliderTicks: { display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#94a3b8', fontWeight: 500 },

  // Chrono box
  chronoBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginTop: '16px' },
  chronoTitle: { fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '10px' },
  chronoControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' },
  playBtn: { color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', minWidth: '95px', transition: 'all 0.2s' },
  speedWrapper: { display: 'flex', gap: '2px', background: '#e2e8f0', padding: '2px', borderRadius: '6px' },
  speedBtn: { border: 'none', background: 'transparent', padding: '3px 6px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', color: '#64748b', borderRadius: '4px' },
  speedBtnActive: { background: '#ffffff', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  timeDisplay: { fontSize: '11.5px', fontWeight: 700, color: '#475569' },

  // Technologies
  projectsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  projectRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.3s' },
  projectInfo: { display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '12px' },
  projectEmoji: { fontSize: '18px' },
  projTitle: { fontSize: '12px', fontWeight: 800, color: '#0f172a' },
  projDesc: { fontSize: '10px', color: '#64748b', margin: 0, lineHeight: 1.3 },
  toggleBtn: { width: '40px', height: '20px', borderRadius: '30px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', padding: 0 },
  toggleIndicator: { width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff', position: 'absolute', top: '2px', transition: 'transform 0.2s' },

  // Telemetry (Mission control panel dark)
  telemetryWorkspace: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column', flex: 1, boxShadow: '0 4px 20px rgba(15,23,42,0.15)', overflow: 'hidden' },
  telemetryHeader: { background: '#070b19', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b' },
  telHeaderDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' },
  telHeaderTitle: { fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.8px' },
  
  telemetryGrid: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px', padding: '0 20px 20px 20px' },
  telemetryCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  gaugesContainer: { display: 'flex', gap: '14px', width: '100%' },

  hyperloopContainer: { background: '#070b19', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  hyperloopTrack: { height: '36px', background: '#030712', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', border: '1px solid #111827' },
  hyperloopLaser: { position: 'absolute', left: 0, right: 0, height: '1.5px', top: '17px' },
  hyperloopCapsule: { position: 'absolute', width: '26px', height: '16px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hyperloopStatus: { display: 'flex', justifyContent: 'space-between', fontSize: '11px' },

  gaugeCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#070b19', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', position: 'relative', flex: 1, minHeight: '125px' },
  gaugeValue: { position: 'absolute', top: '38px', fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' },
  gaugeUnit: { position: 'absolute', top: '62px', fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' },
  gaugeLabel: { fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '10px', textAlign: 'center' },

  chargeWidgetCard: { background: '#070b19', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' },
  chargeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chargeBarOuter: { height: '8px', background: '#030712', borderRadius: '4px', overflow: 'hidden', marginTop: '10px', border: '1px solid #111827' },
  chargeBarInner: { height: '100%', borderRadius: '4px' },

  terminalContainer: { background: '#070b19', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' },
  terminalHeader: { background: '#0b1329', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b' },
  terminalDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' },
  terminalBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '92px' },

  // SECTION COMPARAISONS & GRAPHIQUE
  analyticsSection: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  analyticsTitleCard: { borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' },
  analyticsSectionTitle: { fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 },
  analyticsSectionSubtitle: { fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' },

  analyticsGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' },
  
  kpisPane: { display: 'flex', flexDirection: 'column' },
  paneMiniTitle: { fontSize: '12px', fontWeight: 800, color: '#475569', margin: '0 0 14px 0' },
  
  kpisVerticalList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  kpiItemCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' },
  kpiMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  kpiName: { fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' },
  kpiDeltaBadge: { fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' },
  kpiComparisonRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  cmpLabel: { fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', display: 'block' },
  cmpValue: { fontSize: '14px', fontWeight: 700, color: '#1e293b' },
  cmpArrow: { color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' },

  chartPane: { display: 'flex', flexDirection: 'column' },
  chartPaneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  metricTabs: { display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px' },
  metricTabBtn: { border: 'none', background: 'transparent', padding: '4px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', color: '#64748b', borderRadius: '4px' },
  metricTabBtnActive: { background: '#ffffff', color: '#2563eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  chartWrapper: { background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 4px 4px 4px' },
  chartTip: { fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '10px', textAlign: 'right', margin: '8px 0 0 0' }
};
