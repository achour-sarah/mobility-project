import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

// Génère les données de projection jusqu'en 2200
const generateProjectionData = (energySource, electricPercent) => {
  const data = [];
  
  for (let year = 2026; year <= 2200; year++) {
    // La transition prend environ 30 ans pour se stabiliser (d'ici 2056),
    // après quoi les politiques restent constantes.
    const progressRatio = Math.min(1.0, (year - 2026) / 30);
    
    // Impact Industriel
    let indPollution = 40;
    if (energySource === 'fossile') {
      indPollution += progressRatio * 25; // Monte à 65
    } else if (energySource === 'mixte') {
      indPollution -= progressRatio * 15; // Descend à 25
    } else { // solaire
      indPollution -= progressRatio * 34; // Descend à 6
    }
    
    // Impact Routier (basé sur l'électrification progressive)
    const currentElec = 5 + progressRatio * (electricPercent - 5);
    const trafPollution = 45 * (1 - currentElec / 100) + 5; // Descend à 5 si 100% élec
    
    // Après 2056, si le mix est solaire et l'élec est élevée, l'air s'assainit encore plus
    let naturalRecovery = 0;
    if (year > 2056) {
      const yearsPost = year - 2056;
      if (energySource === 'solaire' && electricPercent >= 70) {
        naturalRecovery = Math.min(10, yearsPost * 0.08);
      }
    }
    
    const totalPollution = Math.max(2, Math.round(indPollution + trafPollution - naturalRecovery));
    
    data.push({
      year: String(year),
      pollution: totalPollution,
      electrification: Math.round(currentElec)
    });
  }
  return data;
};

// Illustration animée de Paris dont le ciel réagit à la pollution
const ParisCityscape = ({ pollution, energySource }) => {
  let skyBackground = 'linear-gradient(to bottom, #0ea5e9, #bae6fd)';
  let smogOpacity = 0;
  let statusText = "Correct";
  let statusColor = "#22c55e";

  if (pollution <= 25) {
    skyBackground = 'linear-gradient(to bottom, #0284c7, #38bdf8)';
    smogOpacity = 0;
    statusText = "Excellent - Air Pur";
    statusColor = "#10b981";
  } else if (pollution <= 50) {
    skyBackground = 'linear-gradient(to bottom, #0ea5e9, #bae6fd)';
    smogOpacity = 0.15;
    statusText = "Correct - Ciel Clair";
    statusColor = "#22c55e";
  } else if (pollution <= 75) {
    skyBackground = 'linear-gradient(to bottom, #94a3b8, #fef08a)';
    smogOpacity = 0.45;
    statusText = "Moyen - Brume Légère";
    statusColor = "#eab308";
  } else if (pollution <= 100) {
    skyBackground = 'linear-gradient(to bottom, #64748b, #fed7aa)';
    smogOpacity = 0.75;
    statusText = "Médiocre - Pollution";
    statusColor = "#f97316";
  } else {
    skyBackground = 'linear-gradient(to bottom, #475569, #ca8a04)';
    smogOpacity = 0.95;
    statusText = "Alerte - Brouillard Toxique";
    statusColor = "#ef4444";
  }

  return (
    <div style={{ ...styles.cityContainer, background: skyBackground }}>
      {/* Effet Solaire */}
      {energySource === 'solaire' && (
        <div style={styles.sun} />
      )}

      {/* Usine polluante en fossile */}
      {energySource === 'fossile' && (
        <div style={styles.factory}>
          <div style={styles.chimney} />
          <div className="smoke-puff" style={{ ...styles.smokePuff, animationDelay: '0s', left: '15px' }} />
          <div className="smoke-puff" style={{ ...styles.smokePuff, animationDelay: '0.7s', left: '18px' }} />
        </div>
      )}

      {/* Nuage de pollution (smog) */}
      <div style={{ ...styles.smogOverlay, opacity: smogOpacity }} />

      {/* Silhouette vectorielle de Paris */}
      <svg viewBox="0 0 400 120" style={styles.skylineSvg}>
        {/* Tour Eiffel */}
        <path d="M180 120 l8-40 l4-30 l3-15 l2-15 l2 0 l2 15 l3 15 l4 30 l8 40 Z" fill="#1e293b" />
        <path d="M176 120 c8-6 16-6 24 0 Z" fill="#1e293b" />
        <rect x="187" y="50" width="4" height="2" fill="#1e293b" />
        <rect x="186" y="80" width="6" height="3" fill="#1e293b" />

        {/* Sacré Coeur dome silhouette */}
        <path d="M60 120 v-20 c0-5 5-10 10-10 s10 5 10 10 v20 Z" fill="#334155" />
        <path d="M65 90 v-15 c0-3 2-5 5-5 s5 2 5 5 v15 Z" fill="#334155" />
        <line x1="70" y1="70" x2="70" y2="65" stroke="#334155" strokeWidth="2" />

        {/* Arc de Triomphe silhouette */}
        <path d="M310 120 v-30 h30 v30 h-8 v-15 c0-4-6-4-6 0 v15 Z" fill="#334155" />

        {/* Immeubles */}
        <rect x="10" y="95" width="25" height="25" fill="#1e293b" />
        <rect x="30" y="85" width="20" height="35" fill="#334155" />
        <rect x="45" y="100" width="30" height="20" fill="#1e293b" />
        
        <rect x="90" y="90" width="35" height="30" fill="#1e293b" />
        <rect x="115" y="75" width="25" height="45" fill="#334155" />
        
        <rect x="215" y="80" width="30" height="40" fill="#1e293b" />
        <rect x="235" y="95" width="25" height="25" fill="#334155" />
        <rect x="270" y="85" width="35" height="35" fill="#1e293b" />
        
        <rect x="350" y="90" width="40" height="30" fill="#1e293b" />
      </svg>

      {/* Informations de la simulation */}
      <div style={styles.cityLabel}>
        <span>Qualité de l'Air : </span>
        <b style={{ color: statusColor }}>{statusText}</b>
      </div>
      <div style={styles.indexBadge}>
        Indice de pollution : <b>{pollution} / 100</b>
      </div>
    </div>
  );
};

export default function SimulationPage() {
  const [energySource, setEnergySource] = useState('mixte'); // 'fossile', 'mixte', 'solaire'
  const [electricPercent, setElectricPercent] = useState(40); // 0 à 100 %
  const [selectedYear, setSelectedYear] = useState(2026); // 2026 à 2036
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef(null);

  // Génération des données de projection 10 ans
  const data = generateProjectionData(energySource, electricPercent);

  // Pollution de l'année sélectionnée
  const currentYearData = data.find(d => d.year === String(selectedYear)) || data[0];
  const currentPollution = currentYearData.pollution;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSelectedYear(y => {
          if (y >= 2200) {
            setIsPlaying(false);
            return 2026;
          }
          return Math.min(2200, y + 5);
        });
      }, 400); // 400ms pour un défilement rapide et fluide
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  return (
    <div style={styles.container}>
      {/* Styles d'animation CSS */}
      <style>{`
        @keyframes puff {
          0% { transform: translateY(0) scale(0.8); opacity: 0.8; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-45px) scale(1.6); opacity: 0; }
        }
        .smoke-puff {
          animation: puff 2s infinite linear;
        }
      `}</style>

      {/* En-tête simplifié */}
      <div style={styles.header}>
        <h2 style={styles.title}>🌱 Simulateur de Transition Énergétique & Qualité de l'Air</h2>
        <p style={styles.subtitle}>
          Visualisez l'impact de nos choix énergétiques et du taux de voitures électriques sur la pollution de Paris de 2026 à 2200.
        </p>
      </div>

      <div style={styles.mainGrid}>
        
        {/* SECTION GAUCHE : LES ACTIONS POLITIQUES */}
        <div style={styles.leftPane}>
          <div style={styles.card}>
            <div style={styles.stepTitle}>Étape 1 : Choisir la source d'énergie</div>
            <p style={styles.stepDesc}>Sélectionnez l'origine de l'électricité alimentant les foyers et les bornes de recharge.</p>
            
            <div style={styles.optionsContainer}>
              {/* Option Charbon */}
              <button 
                onClick={() => { setEnergySource('fossile'); setIsPlaying(false); }}
                style={{
                  ...styles.optionCard,
                  borderColor: energySource === 'fossile' ? '#ef4444' : '#e2e8f0',
                  background: energySource === 'fossile' ? '#fef2f2' : '#ffffff'
                }}
              >
                <span style={styles.optionEmoji}>🛢️</span>
                <div>
                  <b style={styles.optionName}>Charbon & Gaz</b>
                  <p style={styles.optionDesc}>Énergies fossiles à forte émission de CO₂ et de particules.</p>
                </div>
              </button>

              {/* Option Mixte */}
              <button 
                onClick={() => { setEnergySource('mixte'); setIsPlaying(false); }}
                style={{
                  ...styles.optionCard,
                  borderColor: energySource === 'mixte' ? '#2563eb' : '#e2e8f0',
                  background: energySource === 'mixte' ? '#eff6ff' : '#ffffff'
                }}
              >
                <span style={styles.optionEmoji}>⚡</span>
                <div>
                  <b style={styles.optionName}>Mix Électrique Actuel</b>
                  <p style={styles.optionDesc}>Combinaison de nucléaire, d'énergies renouvelables et d'appoint gaz.</p>
                </div>
              </button>

              {/* Option Solaire */}
              <button 
                onClick={() => { setEnergySource('solaire'); setIsPlaying(false); }}
                style={{
                  ...styles.optionCard,
                  borderColor: energySource === 'solaire' ? '#10b981' : '#e2e8f0',
                  background: energySource === 'solaire' ? '#f0fdf4' : '#ffffff'
                }}
              >
                <span style={styles.optionEmoji}>☀️</span>
                <div>
                  <b style={styles.optionName}>Solaire & Éolien (100% Vert)</b>
                  <p style={styles.optionDesc}>Zéro émission lors de la production de l'électricité francilienne.</p>
                </div>
              </button>
            </div>

            <div style={styles.stepDivider} />

            <div style={styles.stepTitle}>Étape 2 : Électrification des transports</div>
            <p style={styles.stepDesc}>Définissez la part de voitures électriques en circulation en Île-de-France d'ici 2200.</p>

            <div style={styles.sliderBox}>
              <div style={styles.sliderHeader}>
                <span>Part des Véhicules Électriques :</span>
                <b style={{ color: '#2563eb', fontSize: '15px' }}>{electricPercent} %</b>
              </div>
              <input 
                type="range" min={5} max={100} step={5}
                value={electricPercent} onChange={e => { setElectricPercent(+e.target.value); setIsPlaying(false); }}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}>
                <span>5% (Aujourd'hui)</span>
                <span>50%</span>
                <span>100% (Zéro Emission)</span>
              </div>
            </div>

            <div style={styles.stepDivider} />

            <div style={styles.stepTitle}>Étape 3 : Voyager dans le temps</div>
            <p style={styles.stepDesc}>Faites défiler les années pour observer la trajectoire de pollution.</p>

            <div style={styles.chronoBox}>
              <div style={styles.chronoControls}>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ ...styles.playBtn, background: isPlaying ? '#ef4444' : '#10b981' }}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Lancer la Transition'}
                </button>
                <span style={styles.yearDisplay}>
                  Année : <b style={{ color: '#2563eb', fontSize: '16px' }}>{selectedYear}</b>
                </span>
              </div>
              <input 
                type="range" min={2026} max={2200} step={1}
                value={selectedYear} onChange={e => { setSelectedYear(+e.target.value); setIsPlaying(false); }}
                style={styles.slider}
              />
            </div>
          </div>
        </div>

        {/* SECTION DROITE : RÉSULTATS SIMULATION & GRAPHIC */}
        <div style={styles.rightPane}>
          {/* Cadran Ciel Paris */}
          <ParisCityscape pollution={currentPollution} energySource={energySource} />

          {/* Graphique d'Évolution 10 ans */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Évolution de l'Indice de Pollution (2026 - 2200)</h3>
              <span style={styles.chartTip}>Indice de 0 (Parfait) à 100 (Critique)</span>
            </div>
            
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pollutionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                  />
                  <Area 
                    name="Indice de pollution" 
                    type="monotone" 
                    dataKey="pollution" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#pollutionGradient)" 
                  />
                  {/* Ligne indiquant l'année sélectionnée */}
                  <ReferenceLine x={String(selectedYear)} stroke="#eab308" strokeWidth={2.5} label={{ value: 'Sélection', position: 'top', fill: '#eab308', fontSize: 10, fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.summaryBox}>
              💡 <b>Analyse de la transition :</b> En <b>{selectedYear}</b>, en utilisant une énergie {' '}
              <b>{energySource === 'solaire' ? 'Solaire 100% Verte' : energySource === 'mixte' ? 'Mixte Actuelle' : 'Fossile (Charbon/Gaz)'}</b> {' '}
              et <b>{currentYearData.electrification}%</b> de véhicules électriques en circulation, la pollution de Paris s'établit à {' '}
              <b style={{ color: currentPollution <= 50 ? '#10b981' : currentPollution <= 75 ? '#eab308' : '#ef4444' }}>
                {currentPollution} / 100
              </b>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' },
  header: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  title: { fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500, lineHeight: 1.4 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '20px' },
  leftPane: { display: 'flex', flexDirection: 'column' },
  rightPane: { display: 'flex', flexDirection: 'column', gap: '20px' },
  
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  stepTitle: { fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.3px' },
  stepDesc: { fontSize: '11px', color: '#64748b', margin: '4px 0 12px 0', lineHeight: 1.3 },
  stepDivider: { height: '1px', background: '#f1f5f9', margin: '16px 0' },

  // Boutons options énergie
  optionsContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', outline: 'none', width: '100%' },
  optionEmoji: { fontSize: '24px' },
  optionName: { fontSize: '12.5px', fontWeight: 700, color: '#1e293b', display: 'block' },
  optionDesc: { fontSize: '10px', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.2 },

  // Sliders
  sliderBox: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, color: '#475569' },
  slider: { width: '100%', cursor: 'pointer' },
  sliderTicks: { display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' },

  // Chrono controls
  chronoBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' },
  chronoControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' },
  playBtn: { color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', minWidth: '120px', transition: 'all 0.2s' },
  yearDisplay: { fontSize: '12.5px', fontWeight: 700, color: '#475569' },

  // Ciel de Paris Box
  cityContainer: { height: '170px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', transition: 'background 0.6s ease' },
  skylineSvg: { width: '100%', zIndex: 10, display: 'block', fill: '#1e293b' },
  smogOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, #d97706, #78350f)', mixBlendMode: 'multiply', transition: 'opacity 0.6s ease', zIndex: 5 },
  sun: { position: 'absolute', width: '32px', height: '32px', background: '#fbbf24', borderRadius: '50%', top: '20px', right: '35px', boxShadow: '0 0 16px #fbbf24, 0 0 32px #f59e0b', zIndex: 2 },
  
  // Cheminée usine
  factory: { position: 'absolute', left: '30px', bottom: '20px', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  chimney: { width: '10px', height: '30px', background: '#475569', borderTop: '2px stroke #0f172a' },
  smokePuff: { width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', position: 'absolute', top: '-10px', opacity: 0 },

  cityLabel: { position: 'absolute', top: '12px', left: '16px', fontSize: '11.5px', fontWeight: 700, color: '#1e293b', background: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: '20px', zIndex: 12 },
  indexBadge: { position: 'absolute', top: '12px', right: '16px', fontSize: '11.5px', fontWeight: 700, color: '#1e293b', background: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: '20px', zIndex: 12 },

  // Graphe
  chartCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  chartTitle: { fontSize: '12.5px', fontWeight: 800, color: '#0f172a', margin: 0 },
  chartTip: { fontSize: '10px', color: '#94a3b8', fontWeight: 500 },
  chartWrapper: { background: '#ffffff', padding: '6px 0 0 0' },
  
  summaryBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginTop: '12px', fontSize: '11.5px', color: '#334155', lineHeight: 1.4 }
};
