import React, { useState, useEffect, useCallback, useRef } from 'react';

const SCENARIOS = [
  { id: 'normal',    label: 'Transit Fluide',          icon: '🟢', descr: 'Flux régulier sous contrôle de l\'IA de régulation.' },
  { id: 'pointe',    label: 'Heure d\'Affluence',       icon: '⚡', descr: 'Pic de connexions physiques 7h-9h et 17h-19h.' },
  { id: 'evenement', label: 'Hyper-Rassemblement',     icon: '🏟️', descr: 'Forte concentration locale pour congrès inter-planétaires.' },
  { id: 'incident',  label: 'Alerte Système',          icon: '⚠️', descr: 'Panne temporaire de bouclier magnétique d\'un axe.' },
  { id: 'meteo',     label: 'Météo Perturbée',         icon: '🌧️', descr: 'Averses ioniques imposant une régulation de vitesse.' },
  { id: 'travaux',   label: 'Maintenance Réseau',      icon: '🔧', descr: 'Reconfiguration holographique des voies.' },
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
        messages.push('⚛️ Micro-Fusion : Rendement énergétique propre à 99.997%. Aucun déchet émis.');
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
  
  // Activation projets 2200
  const [projects, setProjects] = useState({
    maglev: false,  
    fusion: false,  
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

  return (
    <div style={styles.container}>
      
      {/* SECTION 1: CONFIGURATION & SCENARIOS */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🧬 Laboratoire Urbain 2200 — Simulation Éco-Futuriste de Paris</h2>
        <div style={styles.grid}>
          {/* Colonne Gauche: Scénarios et Sliders */}
          <div style={styles.col}>
            <div style={styles.subTitle}>1. Situation Globale</div>
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
                    <b>{s.label}</b>
                    <span style={styles.scDesc}>{s.descr}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div style={styles.sliderGroup}>
              <div style={styles.sliderLabel}>
                <span>Flux de Voyageurs Simulé :</span>
                <b style={{color:'#3b82f6'}}>{nbVehicules.toLocaleString()} unités/minute</b>
              </div>
              <input
                type="range" min={100} max={3000} step={100}
                value={nbVehicules} onChange={e => setNbVehicules(+e.target.value)}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}><span>100 (Fluide)</span><span>3 000 (Saturé)</span></div>
            </div>
          </div>

          {/* Colonne Droite: Horizon 2200 & Chrono-Ville */}
          <div style={styles.col}>
            {/* Horizon 2200 Projects */}
            <div style={styles.subTitle}>🚀 Horizon 2200 (Technologies Éco-Futuristes)</div>
            <div style={styles.projectsWrapper}>
              <button
                onClick={() => toggleProject('maglev')}
                style={{
                  ...styles.projectToggle, 
                  ...(projects.maglev ? styles.projectToggleActive : {}),
                  background: projects.maglev ? 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)' : '#0f172a',
                  color: '#ffffff',
                  borderColor: projects.maglev ? '#10b981' : '#334155'
                }}
              >
                <div style={{...styles.toggleDot, background: projects.maglev ? '#ffffff' : '#cbd5e1'}} />
                <div>
                  <div style={{...styles.projectTitle, color: '#ffffff'}}>🚅 Hyper-Maglev Solaire (Vitesse Orbitale)</div>
                  <div style={{...styles.projectDesc, color: projects.maglev ? '#d1fae5' : '#94a3b8'}}>
                    Trains supraconducteurs à lévitation magnétique, alimentés par induction solaire orbitale (+450% de vitesse, zéro frottement)
                  </div>
                </div>
              </button>

              <button
                onClick={() => toggleProject('drones')}
                style={{
                  ...styles.projectToggle, 
                  ...(projects.drones ? styles.projectToggleActive : {}),
                  background: projects.drones ? 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' : '#0f172a',
                  color: '#ffffff',
                  borderColor: projects.drones ? '#3b82f6' : '#334155'
                }}
              >
                <div style={{...styles.toggleDot, background: projects.drones ? '#ffffff' : '#cbd5e1'}} />
                <div>
                  <div style={{...styles.projectTitle, color: '#ffffff'}}>🛸 Drones Autonomes & Aéro-Pods (3D Transit)</div>
                  <div style={{...styles.projectDesc, color: projects.drones ? '#dbeafe' : '#94a3b8'}}>
                    Véhicules volants individuels intelligents à propulsion ionique verte (-60% de trafic terrestre au sol)
                  </div>
                </div>
              </button>

              <button
                onClick={() => toggleProject('fusion')}
                style={{
                  ...styles.projectToggle, 
                  ...(projects.fusion ? styles.projectToggleActive : {}),
                  background: projects.fusion ? 'linear-gradient(135deg, #a855f7 0%, #581c87 100%)' : '#0f172a',
                  color: '#ffffff',
                  borderColor: projects.fusion ? '#a855f7' : '#334155'
                }}
              >
                <div style={{...styles.toggleDot, background: projects.fusion ? '#ffffff' : '#cbd5e1'}} />
                <div>
                  <div style={{...styles.projectTitle, color: '#ffffff'}}>⚛️ Micro-Fusion & Réseau Auto-Alimenté</div>
                  <div style={{...styles.projectDesc, color: projects.fusion ? '#f3e8ff' : '#94a3b8'}}>
                    Intégration de micro-réacteurs nucléaires propres et de capteurs de flux thermique pour un bilan carbone nul
                  </div>
                </div>
              </button>
            </div>

            {/* Lecteur Chrono-Ville */}
            <div style={styles.chronoBox}>
              <div style={styles.subTitle}>⏳ Chrono-Ville — Voyage dans le temps (24H)</div>
              <div style={styles.chronoControls}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{...styles.playBtn, background: isPlaying ? '#ef4444' : '#10b981'}}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
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
                  Heure simulée : <b style={{color:'#8b5cf6'}}>{String(heure).padStart(2, '0')}:00</b>
                </div>
              </div>
              <input
                type="range" min={0} max={23} step={1}
                value={heure} onChange={e => { setHeure(+e.target.value); setIsPlaying(false); }}
                style={styles.slider}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPARATIF DES RÉSULTATS (KPIs) */}
      {results && (
        <div style={styles.kpiRow}>
          {[
            { label: 'Vitesse de Transit Moyenne', baseline: `${results.baseline.vitesseMoy} km/h`, future: `${results.future.vitesseMoy} km/h`, better: results.future.vitesseMoy > results.baseline.vitesseMoy },
            { label: 'CO₂ Total Rejeté (Réseau)', baseline: `${results.baseline.co2Total} t/h`, future: `${results.future.co2Total} t/h`, better: results.future.co2Total < results.baseline.co2Total },
            { label: 'Saturation des Axes (Sol)', baseline: `${results.baseline.occupationMoy}%`, future: `${results.future.occupationMoy}%`, better: results.future.occupationMoy < results.baseline.occupationMoy },
            { label: 'Temps de trajet (Monuments - 30km)', baseline: `${results.baseline.tempsTrajet} min`, future: `${results.future.tempsTrajet} min`, better: results.future.tempsTrajet < results.baseline.tempsTrajet }
          ].map((r, i) => (
            <div key={i} style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{r.label}</div>
              <div style={styles.kpiValuesGrid}>
                <div style={styles.kpiValItem}>
                  <span style={styles.valTag}>Présent</span>
                  <span style={styles.valText}>{r.baseline}</span>
                </div>
                <div style={styles.kpiValDivider} />
                <div style={styles.kpiValItem}>
                  <span style={{...styles.valTag, background: r.better ? '#dcfce7' : '#fee2e2', color: r.better ? '#15803d' : '#b91c1c'}}>2200</span>
                  <span style={{...styles.valText, color: r.better ? '#10b981' : '#ef4444', fontWeight:800}}>{r.future}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: PUPITRE DE CONTRÔLE QUANTIQUE */}
      <h3 style={styles.consoleTitle}>🎛️ Pupitre de Contrôle Réseau (Simulation Directe)</h3>
      <div style={styles.consoleGrid}>
        
        {/* Style d'animation injecté */}
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
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>

        {/* Colonne Gauche: Hyperloop & Terminal */}
        <div style={styles.consoleLeftCol}>
          <HyperloopSimulator 
            vitesse={currentFutureMetrics.vitesse} 
            isMaglev={projects.maglev} 
            isDrones={projects.drones} 
          />
          <QuantumTerminal 
            scenario={scenario} 
            projects={projects} 
            heure={heure} 
          />
        </div>

        {/* Colonne Droite: Gauges & Solar Charge */}
        <div style={styles.consoleRightCol}>
          <div style={styles.gaugesRow}>
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
          <SolarChargeWidget 
            efficiency={currentFutureMetrics.solar} 
            isMaglev={projects.maglev} 
          />
        </div>

      </div>

    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' },
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  col: { display: 'flex', flexDirection: 'column', gap: '20px' },
  subTitle: { fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  scenariosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  scenarioBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  scenarioBtnActive: { border: '1px solid #2563eb', background: '#eff6ff', boxShadow: '0 0 10px rgba(37,99,235,0.08)' },
  scIcon: { fontSize: '24px' },
  scText: { display: 'flex', flexDirection: 'column' },
  scDesc: { fontSize: '10px', color: '#64748b', marginTop: '2px' },
  sliderGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' },
  sliderLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#1e293b' },
  slider: { width: '100%', cursor: 'pointer' },
  sliderTicks: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' },
  projectsWrapper: { display: 'flex', flexDirection: 'column', gap: '10px' },
  projectToggle: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' },
  projectToggleActive: { border: '1px solid #10b981', background: '#f0fdf4' },
  toggleDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1', border: '2px solid #ffffff', boxShadow: '0 0 0 1px #cbd5e1', flexShrink: 0, transition: 'all 0.2s' },
  projectTitle: { fontSize: '12px', fontWeight: 700, color: '#0f172a' },
  projectDesc: { fontSize: '10px', color: '#64748b', marginTop: '2px' },
  chronoBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginTop: '10px' },
  chronoControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' },
  playBtn: { color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', minWidth: '80px', transition: 'all 0.2s' },
  speedWrapper: { display: 'flex', gap: '4px', background: '#e2e8f0', padding: '2px', borderRadius: '6px' },
  speedBtn: { border: 'none', background: 'transparent', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#64748b', borderRadius: '4px' },
  speedBtnActive: { background: '#ffffff', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  timeDisplay: { fontSize: '12px', fontWeight: 700, color: '#475569' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  kpiCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  kpiLabel: { fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' },
  kpiValuesGrid: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  kpiValItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  valTag: { fontSize: '9px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', fontWeight: 700 },
  valText: { fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '2px' },
  kpiValDivider: { width: '1px', height: '30px', background: '#e2e8f0' },
  
  // Nouveaux styles pour le pupitre quantique 2200
  consoleTitle: { fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '20px 0 0 0' },
  consoleGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '10px' },
  consoleLeftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  consoleRightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  gaugesRow: { display: 'flex', gap: '20px', justifyContent: 'space-between' },
  
  hyperloopContainer: { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  hyperloopTrack: { height: '50px', background: '#070b19', borderRadius: '10px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', border: '1px solid #1e293b' },
  hyperloopLaser: { position: 'absolute', left: 0, right: 0, height: '2px', top: '24px' },
  hyperloopCapsule: { position: 'absolute', width: '32px', height: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hyperloopStatus: { display: 'flex', justifyContent: 'space-between', fontSize: '12px' },
  
  gaugeCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', position: 'relative', flex: 1, minHeight: '135px' },
  gaugeValue: { position: 'absolute', top: '42px', fontSize: '20px', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' },
  gaugeUnit: { position: 'absolute', top: '68px', fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' },
  gaugeLabel: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginTop: '14px', textAlign: 'center' },
  
  chargeWidgetCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '20px' },
  chargeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chargeBarOuter: { height: '10px', background: '#070b19', borderRadius: '5px', overflow: 'hidden', marginTop: '10px', border: '1px solid #1e293b' },
  chargeBarInner: { height: '100%', borderRadius: '5px' },
  
  terminalContainer: { background: '#070b19', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' },
  terminalHeader: { background: '#0f172a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b' },
  terminalDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },
  terminalBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '112px' }
};
