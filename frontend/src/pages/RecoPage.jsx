import React, { useState, useEffect } from 'react';
import { searchStops, calculateRoute } from '../api';

export default function RecoPage({ trafic, transports, air, meteo }) {
  // Recherche d'arrêts
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  
  // Calcul et résultats
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Gamification (State local persistant simulé)
  const [userXp, setUserXp] = useState(() => {
    return parseInt(localStorage.getItem('eco_user_xp') || '120', 10);
  });
  const [userLevel, setUserLevel] = useState(() => {
    return parseInt(localStorage.getItem('eco_user_level') || '2', 10);
  });
  const [showXpAnim, setShowXpAnim] = useState(false);

  // Sauvegarder l'état de la gamification
  useEffect(() => {
    localStorage.setItem('eco_user_xp', userXp.toString());
    localStorage.setItem('eco_user_level', userLevel.toString());
  }, [userXp, userLevel]);

  // Autocomplete Suggestions départ
  useEffect(() => {
    if (fromQuery.length < 2) {
      setFromSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      searchStops(fromQuery).then(res => {
        setFromSuggestions(res.data.data);
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fromQuery]);

  // Autocomplete Suggestions arrivée
  useEffect(() => {
    if (toQuery.length < 2) {
      setToSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      searchStops(toQuery).then(res => {
        setToSuggestions(res.data.data);
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [toQuery]);

  // Lancer le calcul
  const handleCalculate = async () => {
    if (!selectedFrom || !selectedTo) {
      setError("Veuillez sélectionner un arrêt de départ et un arrêt d'arrivée dans la liste des suggestions.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await calculateRoute(selectedFrom.id, selectedTo.id);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors du calcul de l'itinéraire.");
    } finally {
      setLoading(false);
    }
  };

  // Simuler la validation du trajet éco
  const handleConfirmEcoTrip = (co2Saved) => {
    setShowXpAnim(true);
    const xpGained = Math.round(co2Saved * 50) + 15;
    let newXp = userXp + xpGained;
    let newLevel = userLevel;
    
    // Level up tous les 200 XP
    if (newXp >= 200) {
      newXp = newXp - 200;
      newLevel += 1;
    }
    
    setUserXp(newXp);
    setUserLevel(newLevel);
    
    setTimeout(() => {
      setShowXpAnim(false);
      alert(`🎉 Félicitations ! Trajet éco validé. Vous gagnez +${xpGained} XP pour votre comportement éco-responsable !`);
    }, 1200);
  };

  const getHealthyColor = (score) => {
    if (score >= 80) return '#10b981'; // Vert
    if (score >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  return (
    <div style={styles.container}>
      {/* Profil Éco-Citoyen */}
      <div style={styles.profileCard}>
        <div style={styles.profileLeft}>
          <div style={styles.avatarBox}>🌱</div>
          <div>
            <div style={styles.profileTitle}>Mon Profil Éco-Citoyen</div>
            <div style={styles.profileSubtitle}>Niveau {userLevel} — Voyageur Responsable</div>
          </div>
        </div>
        <div style={styles.xpWrapper}>
          <div style={styles.xpText}><b>{userXp}</b> / 200 XP</div>
          <div style={styles.xpBar}>
            <div style={{...styles.xpBarFill, width: `${(userXp/200)*100}%`}} />
          </div>
          {showXpAnim && <span style={styles.xpAnim}>+XP 🌿</span>}
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Formulaire de Recherche */}
        <div style={styles.searchSection}>
          <h2 style={styles.sectionTitle}>Calculateur d'Itinéraire Multimodal & Healthy</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>📍 Arrêt de Départ</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Ex: Gare de Lyon, Châtelet..."
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setSelectedFrom(null);
                }}
                style={styles.input}
              />
              {selectedFrom && <span style={styles.selectedCheck}>✓</span>}
            </div>
            {fromSuggestions.length > 0 && !selectedFrom && (
              <ul style={styles.suggestionsList}>
                {fromSuggestions.map(st => (
                  <li key={st.id} onClick={() => {
                    setSelectedFrom(st);
                    setFromQuery(st.name);
                    setFromSuggestions([]);
                  }} style={styles.suggestionItem}>
                    🚇 {st.name} <span style={styles.stopCoord}>({st.lat.toFixed(4)}, {st.lon.toFixed(4)})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>🏁 Arrêt d'Arrivée</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Ex: Saint-Lazare, Gare du Nord..."
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setSelectedTo(null);
                }}
                style={styles.input}
              />
              {selectedTo && <span style={styles.selectedCheck}>✓</span>}
            </div>
            {toSuggestions.length > 0 && !selectedTo && (
              <ul style={styles.suggestionsList}>
                {toSuggestions.map(st => (
                  <li key={st.id} onClick={() => {
                    setSelectedTo(st);
                    setToQuery(st.name);
                    setToSuggestions([]);
                  }} style={styles.suggestionItem}>
                    🚇 {st.name} <span style={styles.stopCoord}>({st.lat.toFixed(4)}, {st.lon.toFixed(4)})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <button onClick={handleCalculate} disabled={loading} style={styles.calculateBtn}>
            {loading ? 'Analyse de la base GTFS...' : '🔍 Calculer l\'itinéraire'}
          </button>
        </div>

        {/* Section Résultats */}
        <div style={styles.resultsSection}>
          {loading && (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{fontWeight:600, color:'#475569'}}>Recherche de liaisons directes dans les 8,6 millions d'horaires d'Île-de-France...</p>
            </div>
          )}

          {!result && !loading && (
            <div style={styles.emptyState}>
              <span style={{fontSize:'48px'}}>🗺️</span>
              <p style={styles.emptyText}>Entrez des gares ou arrêts pour calculer le meilleur trajet</p>
              <p style={styles.emptySub}>Le calculateur analysera les horaires théoriques GTFS en direct et calculera l'impact carbone et santé.</p>
            </div>
          )}

          {result && !loading && (
            <div style={styles.resultsWrapper}>
              <h3 style={styles.resultTitle}>
                De <b>{result.from_stop}</b> à <b>{result.to_stop}</b> ({result.distance_km} km)
              </h3>

              {/* Liaisons Directes GTFS trouvées */}
              <div style={styles.gtfsBox}>
                <div style={styles.gtfsHeader}>🎫 Liaisons Directes (Horaires réels GTFS)</div>
                {result.direct_transit && result.direct_transit.length > 0 ? (
                  <div style={styles.gtfsList}>
                    {result.direct_transit.map((t, idx) => (
                      <div key={idx} style={styles.gtfsItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={styles.gtfsLine}>
                            <span style={styles.gtfsTypeBadge}>{t.type}</span>
                            <b style={styles.gtfsLineName}>{t.ligne}</b>
                          </div>
                          <div style={styles.gtfsRouteDesc}>Direction : {t.direction}</div>
                          <div style={styles.gtfsTimes}>
                            🕒 <b>{t.depart}</b> → <b>{t.arrivee}</b>
                          </div>
                        </div>
                        {t.perturbation && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 14px',
                            background: '#fee2e2',
                            borderLeft: '4px solid #ef4444',
                            borderRadius: '6px',
                            color: '#991b1b',
                            fontSize: '11.5px',
                            lineHeight: '1.4',
                            width: '100%',
                            textAlign: 'left',
                            boxSizing: 'border-box'
                          }}>
                            ⚠️ <b>Alerte perturbation ({t.perturbation.statut.toUpperCase()}) :</b> {t.perturbation.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.noGtfs}>
                    ℹ️ Aucune liaison ferroviaire directe (RER/Métro) trouvée pour ce trajet dans la base GTFS.
                    <br/><span style={{fontSize:'12px', color:'#64748b'}}>Proposition d'itinéraires alternatifs par la route ou réseau bus.</span>
                  </div>
                )}
              </div>

              {/* Comparaison des Options de Routage */}
              <div style={styles.optionsGrid}>
                {/* Option 1: Voiture */}
                <div style={styles.optionCard}>
                  <div style={styles.optHeader}>
                    <span style={styles.optIcon}>🚗</span>
                    <span style={styles.optMode}>{result.options.voiture.mode}</span>
                  </div>
                  <div style={styles.optTime}>{result.options.voiture.temps_minutes} min</div>
                  <div style={styles.optCarbon}>CO₂ rejeté : <b>{result.options.voiture.co2_kg} kg</b></div>
                  
                  {/* Score Santé */}
                  <div style={styles.scoreRow}>
                    <span style={styles.scoreLabel}>Score Santé :</span>
                    <span style={{...styles.scoreValue, color: getHealthyColor(result.options.voiture.healthy_score)}}>
                      {result.options.voiture.healthy_score}/100
                    </span>
                  </div>
                  <div style={styles.scoreIndicator}>
                    <div style={{...styles.scoreIndicatorFill, width: `${result.options.voiture.healthy_score}%`, background: getHealthyColor(result.options.voiture.healthy_score)}} />
                  </div>
                </div>

                {/* Option 2: Transports / Éco */}
                <div style={{...styles.optionCard, borderColor:'#10b98150', background:'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'}}>
                  <div style={styles.optHeader}>
                    <span style={styles.optIcon}>🚇</span>
                    <span style={{...styles.optMode, color:'#15803d'}}>{result.options.transit.mode}</span>
                  </div>
                  <div style={styles.optTime}>{result.options.transit.temps_minutes} min</div>
                  <div style={styles.optCarbon}>CO₂ rejeté : <b>{result.options.transit.co2_kg} kg</b></div>
                  
                  {/* Score Santé */}
                  <div style={styles.scoreRow}>
                    <span style={styles.scoreLabel}>Score Santé :</span>
                    <span style={{...styles.scoreValue, color: getHealthyColor(result.options.transit.healthy_score)}}>
                      {result.options.transit.healthy_score}/100
                    </span>
                  </div>
                  <div style={styles.scoreIndicator}>
                    <div style={{...styles.scoreIndicatorFill, width: `${result.options.transit.healthy_score}%`, background: getHealthyColor(result.options.transit.healthy_score)}} />
                  </div>

                  {/* Bouton de validation Éco-trajet */}
                  <button
                    onClick={() => handleConfirmEcoTrip(result.options.voiture.co2_kg - result.options.transit.co2_kg)}
                    style={styles.confirmEcoBtn}
                  >
                    🌿 Valider ce trajet vert
                  </button>
                  <div style={{fontSize:'10px', color:'#166534', marginTop:'6px', fontWeight:600}}>
                    Gagnez de l'XP et économisez {round(result.options.voiture.co2_kg - result.options.transit.co2_kg, 1)} kg de CO₂ !
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function round(val, dec) {
  return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
}

const styles = {
  container: { paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  profileCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  profileLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  avatarBox: { width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  profileTitle: { fontSize: '15px', fontWeight: 800, color: '#0f172a' },
  profileSubtitle: { fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' },
  xpWrapper: { position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' },
  xpText: { fontSize: '12px', fontWeight: 700, color: '#1e293b', textAlign: 'right' },
  xpBar: { height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  xpBarFill: { height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.5s ease-out' },
  xpAnim: { position: 'absolute', right: 0, top: '-20px', color: '#10b981', fontWeight: 800, animation: 'floatUp 1s ease-out', fontSize: '12px' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' },
  searchSection: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  sectionTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' },
  label: { fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inputWrapper: { position: 'relative' },
  input: { width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', paddingRight: '30px', borderRadius: '10px', fontSize: '13px', outline: 'none', color: '#0f172a', boxSizing: 'border-box' },
  selectedCheck: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: 800, fontSize: '14px' },
  suggestionsList: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderTop: 'none', listStyle: 'none', padding: 0, margin: 0, borderRadius: '0 0 10px 10px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  suggestionItem: { padding: '10px 14px', fontSize: '12px', color: '#0f172a', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' },
  stopCoord: { fontSize: '10px', color: '#94a3b8' },
  errorBox: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 },
  calculateBtn: { width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px' },
  resultsSection: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  emptyState: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#64748b' },
  emptyText: { fontSize: '15px', fontWeight: 700, color: '#1e293b' },
  emptySub: { fontSize: '12px', color: '#64748b', maxWidth: '350px', lineHeight: 1.6 },
  loadingBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  resultsWrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' },
  resultTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', margin: 0 },
  gtfsBox: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px' },
  gtfsHeader: { fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  gtfsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  gtfsItem: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' },
  gtfsLine: { display: 'flex', alignItems: 'center', gap: '8px' },
  gtfsTypeBadge: { fontSize: '10px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 },
  gtfsLineName: { fontSize: '14px', color: '#0f172a' },
  gtfsRouteDesc: { fontSize: '12px', color: '#64748b', flex: 1, minWidth: '150px' },
  gtfsTimes: { fontSize: '13px', color: '#1e293b' },
  noGtfs: { fontSize: '13px', color: '#475569', textAlign: 'center', lineHeight: 1.6, padding: '10px 0' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  optionCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' },
  optHeader: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  optIcon: { fontSize: '24px' },
  optMode: { fontSize: '13px', fontWeight: 700, color: '#475569' },
  optTime: { fontSize: '32px', fontWeight: 800, color: '#0f172a' },
  optCarbon: { fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginTop: '8px' },
  scoreLabel: { color: '#64748b' },
  scoreValue: { fontSize: '13px' },
  scoreIndicator: { height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  scoreIndicatorFill: { height: '100%', borderRadius: '3px' },
  confirmEcoBtn: { width: '100%', background: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginTop: '10px' }
};
