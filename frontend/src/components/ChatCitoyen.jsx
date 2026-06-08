import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const localAnalyze = (texte, auteur) => {
  const t = texte.toLowerCase();
  
  // 1. Détecter le type d'incident
  let type_incident = 'autre';
  if (t.includes('panne') || t.includes('bloqu') || t.includes('arrêt') || t.includes('stopp') || t.includes('incident')) {
    type_incident = 'panne';
  } else if (t.includes('accident') || t.includes('choc') || t.includes('collision') || t.includes('renvers')) {
    type_incident = 'accident';
  } else if (t.includes('travaux') || t.includes('chantier') || t.includes('ferme') || t.includes('barr')) {
    type_incident = 'travaux';
  } else if (t.includes('bouchon') || t.includes('embouteillage') || t.includes('ralent') || t.includes('charg') || t.includes('monde') || t.includes('satur')) {
    type_incident = 'embouteillage';
  } else if (t.includes('pollu') || t.includes('air') || t.includes('smog') || t.includes('respir')) {
    type_incident = 'pollution';
  }
  
  // 2. Détecter la gravité
  let gravite = 'moyen';
  if (t.includes('bloqué') || t.includes('critique') || t.includes('grave') || t.includes('accident') || t.includes('urgence')) {
    gravite = 'élevé';
  } else if (t.includes('interrompu') || t.includes('fermé') || t.includes('bloque complet')) {
    gravite = 'critique';
  } else if (t.includes('léger') || t.includes('retard de 5 min') || t.includes('un peu')) {
    gravite = 'faible';
  }
  
  // 3. Détecter la ligne concernée (RER A, M1, A1, etc.)
  let ligne = null;
  const matchLigne = texte.match(/(rer\s+[a-e]|métro\s+\d+|ligne\s+\d+|bus\s+\d+|a\d+|n\d+)/i);
  if (matchLigne) {
    ligne = matchLigne[0].toUpperCase();
  }
  
  // 4. Synthèse / Résumé IA
  let resume_ia = `Incident signalé par le citoyen. Type détecté : ${type_incident}.`;
  if (type_incident === 'panne') {
    resume_ia = `Perturbation ou arrêt technique signalé.`;
  } else if (type_incident === 'accident') {
    resume_ia = `Collision ou accident de la route détecté.`;
  } else if (type_incident === 'travaux') {
    resume_ia = `Zone de chantier ou restriction de voirie signalée.`;
  } else if (type_incident === 'embouteillage') {
    resume_ia = `Ralentissement important ou congestion routière détectée.`;
  } else if (type_incident === 'pollution') {
    resume_ia = `Signalement concernant la dégradation de la qualité de l'air ou des odeurs suspectes.`;
  }
  
  // 5. Recommandation
  let recommandation = "Soyez vigilant dans cette zone et suivez les indications locales.";
  if (ligne) {
    if (type_incident === 'panne' || type_incident === 'embouteillage') {
      recommandation = `Reportez-vous sur les itinéraires alternatifs pour contourner la ligne/axe ${ligne}.`;
    }
  }
  
  return {
    id: 'mock-' + Math.random().toString(36).substr(2, 9),
    texte,
    auteur,
    type: 'signalement',
    time: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
    analyse: {
      type_incident,
      gravite,
      ligne,
      resume_ia,
      recommandation,
      votes: 0
    }
  };
};

const GRAVITE_COLOR = {
  faible:   { bg:'#dcfce7', color:'#166534', border:'#22c55e' },
  moyen:    { bg:'#fef9c3', color:'#854d0e', border:'#f59e0b' },
  élevé:    { bg:'#fee2e2', color:'#991b1b', border:'#ef4444' },
  critique: { bg:'#fce7f3', color:'#9d174d', border:'#ec4899' },
};

const TYPE_ICON = {
  panne:         '⚡',
  accident:      '🚨',
  travaux:       '🚧',
  embouteillage: '🚗',
  pollution:     '🌫️',
  autre:         '📢',
};

const PSEUDOS = ['Marie_IDF','Thomas75','Kader_93','Julie_92','Ahmed_94','Sophie_Paris','Lucas_IDF','Fatou_75'];
const MESSAGES_DEMO = [
  "RER A en panne à Châtelet, je suis bloqué depuis 20 min",
  "Gros bouchon sur le périphérique nord direction Porte de la Chapelle",
  "M4 très chargée ce matin, galère pour monter dans le métro",
  "Accident sur l'A1 vers Paris, évitez !",
  "Qualité de l'air très mauvaise ce matin dans le 13e",
  "Travaux rue de Rivoli, circulation impossible",
  "RER B perturbé, pas d'annonce en gare",
  "Bus 62 en retard de 15 minutes, information appli incorrecte",
];

export default function ChatCitoyen({ onNouveauSignalement }) {
  const [messages,   setMessages]   = useState([]);
  const [texte,      setTexte]      = useState('');
  const [auteur,     setAuteur]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [open,       setOpen]       = useState(false);
  const [nbNouveaux, setNbNouveaux] = useState(0);
  const messagesEndRef = useRef(null);

  // Charger signalements existants
  const chargerSignalements = async () => {
    try {
      const res = await axios.get(`${BASE}/signalements?limite=30`);
      const msgs = res.data.data.map(s => ({
        id:        s.id,
        texte:     s.texte,
        auteur:    s.auteur,
        analyse:   s,
        type:      'signalement',
        time:      new Date(s.collecte_at).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
      }));
      setMessages(msgs.reverse());
    } catch(e) { 
      console.error(e);
      // Fallback : chargement de données de démo locales si le serveur est inaccessible
      const initialMocks = [
        localAnalyze("RER A en panne à Châtelet, je suis bloqué depuis 20 min", "Marie_IDF"),
        localAnalyze("Gros bouchon sur le périphérique nord direction Porte de la Chapelle", "Thomas75"),
        localAnalyze("Accident sur l'A1 vers Paris, évitez !", "Ahmed_94")
      ];
      setMessages(initialMocks);
    }
  };

  // Générer des signalements démo automatiquement
  const genererSignalementDemo = async () => {
    const texteDemo = MESSAGES_DEMO[Math.floor(Math.random() * MESSAGES_DEMO.length)];
    const auteurDemo = PSEUDOS[Math.floor(Math.random() * PSEUDOS.length)];
    try {
      await axios.post(`${BASE}/signalements`, { texte: texteDemo, auteur: auteurDemo });
      await chargerSignalements();
      setNbNouveaux(n => n + 1);
      if (onNouveauSignalement) onNouveauSignalement();
    } catch(e) {
      // Si le serveur est inaccessible, on génère un faux message de démo localement
      const mockMsg = localAnalyze(texteDemo, auteurDemo);
      setMessages(prev => [...prev, mockMsg]);
      setNbNouveaux(n => n + 1);
      if (onNouveauSignalement) onNouveauSignalement();
    }
  };

  useEffect(() => {
    chargerSignalements();
    // Génère un signalement démo toutes les 45 secondes
    const iv = setInterval(genererSignalementDemo, 45000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (open) {
      setNbNouveaux(0);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    }
  }, [open, messages]);

  const envoyer = async () => {
    if (!texte.trim() || loading) return;
    setLoading(true);
    const nom = auteur.trim() || 'Anonyme';
    try {
      const res = await axios.post(`${BASE}/signalements`, {
        texte: texte.trim(),
        auteur: nom,
      });
      setTexte('');
      await chargerSignalements();
      if (onNouveauSignalement) onNouveauSignalement();
    } catch(e) {
      console.warn("Backend error, using client-side analysis fallback:", e);
      const mockMsg = localAnalyze(texte.trim(), nom);
      setMessages(prev => [...prev, mockMsg]);
      setTexte('');
      if (onNouveauSignalement) onNouveauSignalement();
    }
    setLoading(false);
  };

  const voter = async (id) => {
    try {
      if (id.toString().startsWith('mock-')) {
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, analyse: { ...m.analyse, votes: (m.analyse.votes||0)+1 } } : m
        ));
      } else {
        await axios.post(`${BASE}/signalements/${id}/vote`);
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, analyse: { ...m.analyse, votes: (m.analyse.votes||0)+1 } } : m
        ));
      }
    } catch(e) {}
  };

  const graviteStyle = (g) => GRAVITE_COLOR[g] || GRAVITE_COLOR.moyen;

  return (
    <>
      {/* Bouton flottant */}
      <button onClick={() => setOpen(!open)} style={styles.fab}>
        {open ? '✕' : '💬'}
        {!open && nbNouveaux > 0 && (
          <span style={styles.fabBadge}>{nbNouveaux}</span>
        )}
      </button>

      {/* Panel chat */}
      {open && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelTitle}>Signalements citoyens</div>
              <div style={styles.panelSub}>Analysés par IA en temps réel</div>
            </div>
            <div style={styles.liveChip}>
              <span style={styles.liveDot}/>LIVE
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.length === 0 && (
              <div style={styles.empty}>
                Aucun signalement pour l'instant.<br/>
                Soyez le premier à signaler un incident !
              </div>
            )}
            {messages.map((msg, i) => {
              const gs = graviteStyle(msg.analyse?.gravite);
              return (
                <div key={i} style={styles.msgCard}>
                  {/* Auteur + heure */}
                  <div style={styles.msgTop}>
                    <div style={styles.msgAvatar}>
                      {(msg.auteur||'A')[0].toUpperCase()}
                    </div>
                    <div style={styles.msgMeta}>
                      <span style={styles.msgAuteur}>{msg.auteur}</span>
                      <span style={styles.msgTime}>{msg.time}</span>
                    </div>
                    <span style={{
                      ...styles.graviteBadge,
                      background: gs.bg,
                      color:      gs.color,
                      border:     `1px solid ${gs.border}`,
                    }}>
                      {TYPE_ICON[msg.analyse?.type_incident] || '📢'} {msg.analyse?.gravite}
                    </span>
                  </div>

                  {/* Texte original */}
                  <div style={styles.msgTexte}>"{msg.texte}"</div>

                  {/* Analyse IA */}
                  {msg.analyse?.resume_ia && (
                    <div style={styles.iaBox}>
                      <div style={styles.iaLabel}>🤖 Analyse IA</div>
                      <div style={styles.iaResume}>{msg.analyse.resume_ia}</div>
                      {msg.analyse.ligne && (
                        <div style={styles.iaLigne}>
                          Ligne concernée : <b style={{color:'#f59e0b'}}>{msg.analyse.ligne}</b>
                        </div>
                      )}
                      {msg.analyse.recommandation && (
                        <div style={styles.iaReco}>
                          💡 {msg.analyse.recommandation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vote */}
                  <div style={styles.msgFooter}>
                    <button onClick={() => voter(msg.id)} style={styles.voteBtn}>
                      👍 Utile ({msg.analyse?.votes || 0})
                    </button>
                    {msg.analyse?.type_incident && (
                      <span style={styles.typeChip}>
                        {msg.analyse.type_incident}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}/>
          </div>

          {/* Formulaire */}
          <div style={styles.form}>
            <input
              placeholder="Votre pseudo (optionnel)"
              value={auteur}
              onChange={e => setAuteur(e.target.value)}
              style={styles.inputAuteur}
            />
            <div style={styles.inputRow}>
              <textarea
                placeholder="Signalez un incident : panne RER A, bouchon A1, accident..."
                value={texte}
                onChange={e => setTexte(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(); }}}
                style={styles.textarea}
                rows={2}
                maxLength={500}
              />
              <button onClick={envoyer} disabled={loading || !texte.trim()} style={{
                ...styles.sendBtn,
                ...(loading || !texte.trim() ? styles.sendBtnDisabled : {}),
              }}>
                {loading ? '⏳' : '→'}
              </button>
            </div>
            <div style={styles.formHint}>
              {texte.length}/500 — Analysé par IA automatiquement
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position:'fixed', bottom:'24px', right:'24px',
    width:'56px', height:'56px', borderRadius:'50%',
    background:'linear-gradient(135deg,#2563eb,#3b82f6)',
    border:'none', color:'#fff', fontSize:'24px',
    cursor:'pointer', zIndex:1000,
    boxShadow:'0 4px 20px rgba(37,99,235,0.4)',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  fabBadge: {
    position:'absolute', top:'-4px', right:'-4px',
    background:'#ef4444', color:'#fff',
    borderRadius:'50%', width:'20px', height:'20px',
    fontSize:'11px', fontWeight:700,
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  panel: {
    position:'fixed', bottom:'90px', right:'24px',
    width:'380px', height:'580px',
    background:'#ffffff', border:'1px solid #e2e8f0',
    borderRadius:'16px', zIndex:999,
    display:'flex', flexDirection:'column',
    overflow:'hidden',
    boxShadow:'0 20px 40px rgba(0,0,0,0.15)',
  },
  panelHeader: {
    padding:'16px 20px', borderBottom:'1px solid #e2e8f0',
    background:'#f8fafc',
    display:'flex', justifyContent:'space-between', alignItems:'center',
  },
  panelTitle:  { fontSize:'14px', fontWeight:700, color:'#0f172a' },
  panelSub:    { fontSize:'11px', color:'#64748b', marginTop:'2px' },
  liveChip: {
    display:'flex', alignItems:'center', gap:'5px',
    background:'#dcfce7', border:'1px solid #22c55e',
    borderRadius:'20px', padding:'4px 10px',
    fontSize:'11px', color:'#166534', fontWeight:600,
  },
  liveDot: {
    width:'6px', height:'6px', borderRadius:'50%',
    background:'#22c55e', display:'inline-block',
  },
  messages: {
    flex:1, overflow:'auto', padding:'12px',
    display:'flex', flexDirection:'column', gap:'10px',
    background:'#f1f5f9',
  },
  empty: {
    textAlign:'center', color:'#64748b',
    fontSize:'13px', padding:'40px 20px', lineHeight:1.8,
  },
  msgCard: {
    background:'#ffffff', borderRadius:'10px',
    padding:'12px', border:'1px solid #e2e8f0',
    boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
  },
  msgTop: {
    display:'flex', alignItems:'center',
    gap:'8px', marginBottom:'8px',
  },
  msgAvatar: {
    width:'28px', height:'28px', borderRadius:'50%',
    background:'linear-gradient(135deg,#2563eb,#3b82f6)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'12px', fontWeight:700, color:'#fff', flexShrink:0,
  },
  msgMeta:   { flex:1 },
  msgAuteur: { fontSize:'12px', fontWeight:600, color:'#0f172a', display:'block' },
  msgTime:   { fontSize:'10px', color:'#64748b' },
  graviteBadge: {
    fontSize:'10px', fontWeight:600,
    padding:'2px 8px', borderRadius:'20px',
    flexShrink:0,
  },
  msgTexte: {
    fontSize:'13px', color:'#334155',
    marginBottom:'8px',
    lineHeight:1.5,
  },
  iaBox: {
    background:'#f0fdf4', borderRadius:'8px',
    padding:'10px 12px', marginBottom:'8px',
    border:'1px solid #bbf7d0',
  },
  iaLabel:  { fontSize:'10px', color:'#15803d', fontWeight:700, marginBottom:'4px' },
  iaResume: { fontSize:'12px', color:'#166534', marginBottom:'4px', lineHeight:1.5 },
  iaLigne:  { fontSize:'11px', color:'#166534', marginBottom:'3px' },
  iaReco: {
    fontSize:'11px', color:'#15803d',
    background:'#dcfce7', borderRadius:'6px',
    padding:'6px 8px', marginTop:'4px',
  },
  msgFooter: {
    display:'flex', alignItems:'center',
    justifyContent:'space-between',
  },
  voteBtn: {
    background:'none', border:'1px solid #cbd5e1',
    borderRadius:'6px', padding:'4px 10px',
    fontSize:'11px', color:'#475569', cursor:'pointer',
    transition:'all 0.2s',
  },
  typeChip: {
    fontSize:'10px', color:'#475569',
    background:'#f1f5f9', borderRadius:'20px',
    padding:'2px 8px', border:'1px solid #e2e8f0',
  },
  form: {
    padding:'12px', borderTop:'1px solid #e2e8f0',
    background:'#ffffff',
  },
  inputAuteur: {
    width:'100%', marginBottom:'8px',
    background:'#f8fafc', border:'1px solid #cbd5e1',
    borderRadius:'8px', padding:'8px 12px',
    fontSize:'12px', color:'#0f172a',
    outline:'none', boxSizing:'border-box',
  },
  inputRow: { display:'flex', gap:'8px', marginBottom:'4px' },
  textarea: {
    flex:1, background:'#f8fafc',
    border:'1px solid #cbd5e1', borderRadius:'8px',
    padding:'8px 12px', fontSize:'12px',
    color:'#0f172a', outline:'none', resize:'none',
    fontFamily:'Segoe UI, sans-serif',
  },
  sendBtn: {
    width:'44px', borderRadius:'8px',
    border:'none', background:'#2563eb',
    color:'#fff', fontSize:'18px', cursor:'pointer',
    fontWeight:700,
  },
  sendBtnDisabled: { background:'#e2e8f0', color:'#94a3b8', cursor:'not-allowed' },
  formHint: { fontSize:'10px', color:'#64748b', textAlign:'right' },
};