import React, { useState, useEffect } from 'react';

export default function AccessibilitePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(() => localStorage.getItem('a11y_text_size') || 'normal'); // 'normal', 'large', 'xlarge'
  const [contrast, setContrast] = useState(() => localStorage.getItem('a11y_contrast') || 'normal'); // 'normal', 'high'
  const [dyslexic, setDyslexic] = useState(() => localStorage.getItem('a11y_dyslexic') === 'true');
  const [audioReader, setAudioReader] = useState(() => localStorage.getItem('a11y_audio') === 'true');

  // Sauvegarder les préférences dans LocalStorage
  useEffect(() => {
    localStorage.setItem('a11y_text_size', textSize);
    localStorage.setItem('a11y_contrast', contrast);
    localStorage.setItem('a11y_dyslexic', dyslexic.toString());
    localStorage.setItem('a11y_audio', audioReader.toString());
  }, [textSize, contrast, dyslexic, audioReader]);

  // Gestion de la synthèse vocale au survol
  useEffect(() => {
    if (!audioReader) {
      window.speechSynthesis.cancel();
      return;
    }

    let speechTimeout;

    const handleMouseOver = (e) => {
      const target = e.target;
      // Ne lire que les éléments textuels pertinents pour éviter la cacophonie
      const tag = target.tagName;
      const validTags = ['BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'B', 'STRONG', 'LABEL', 'INPUT', 'TEXTAREA'];
      
      if (!validTags.includes(tag)) return;

      const textToRead = target.innerText || target.placeholder || target.alt || target.ariaLabel;
      if (textToRead && textToRead.trim().length > 0) {
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(() => {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToRead.trim().slice(0, 150));
          utterance.lang = 'fr-FR';
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }, 150); // Petit délai pour éviter de lire lors d'un passage rapide
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      clearTimeout(speechTimeout);
      window.speechSynthesis.cancel();
    };
  }, [audioReader]);

  // Générer le CSS dynamique injecté dans le document
  const getAccessibilityStyles = () => {
    let css = '';

    // 1. Taille du texte
    if (textSize === 'large') {
      css += `
        html, body, p, span, button, input, select, textarea, h1, h2, h3, h4, b, a, li, td, th {
          font-size: 112% !important;
        }
      `;
    } else if (textSize === 'xlarge') {
      css += `
        html, body, p, span, button, input, select, textarea, h1, h2, h3, h4, b, a, li, td, th {
          font-size: 125% !important;
        }
      `;
    }

    // 2. Police Confort Dyslexie
    if (dyslexic) {
      css += `
        html, body, p, span, button, input, select, textarea, h1, h2, h3, h4, b, a, li, td, th {
          font-family: 'Courier New', 'Comic Sans MS', sans-serif !important;
          line-height: 1.8 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.22em !important;
        }
      `;
    }

    // 3. Contraste Élevé (Noir et Jaune néon pour une visibilité maximale)
    if (contrast === 'high') {
      css += `
        body, #root, div, header, main, section, footer, form, ul, li, table, tr, td, th {
          background-color: #000000 !important;
          color: #ffff00 !important;
          background-image: none !important;
          border-color: #ffff00 !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        p, span, h1, h2, h3, h4, b, a, li, td, th, svg, path {
          color: #ffff00 !important;
          fill: #ffff00 !important;
          stroke: #ffff00 !important;
        }
        a {
          text-decoration: underline !important;
        }
        button, input, select, textarea {
          background-color: #000000 !important;
          color: #ffff00 !important;
          border: 2.5px solid #ffff00 !important;
          border-radius: 4px !important;
        }
        button:hover, button:focus, input:focus, textarea:focus {
          background-color: #ffff00 !important;
          color: #000000 !important;
          outline: 3px solid #ffff00 !important;
        }
        .nude-card, .topCard, .lightCard, .stationCard, .alertItem, .optCarbon {
          background-color: #000000 !important;
          border: 2px dashed #ffff00 !important;
          box-shadow: none !important;
        }
      `;
    }

    return css;
  };

  return (
    <>
      {/* Balise de style dynamique injectée */}
      <style>{getAccessibilityStyles()}</style>

      {/* Bouton d'accès flottant (à gauche pour équilibrer avec le chat citoyen à droite) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={styles.fab}
        title="Options d'Accessibilité"
        aria-label="Options d'Accessibilité"
      >
        ♿
      </button>

      {/* Panneau des options */}
      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <div style={styles.panelTitle}>♿ Espace Accessibilité</div>
              <div style={styles.panelSub}>Conformité RGAA / Inclusion handicap</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.content}>
            {/* 1. Taille du texte */}
            <div style={styles.optionSection}>
              <div style={styles.optionLabel}>📏 Taille de police :</div>
              <div style={styles.btnGroup}>
                <button 
                  onClick={() => setTextSize('normal')}
                  style={{...styles.optionBtn, ...(textSize === 'normal' ? styles.optionBtnActive : {})}}
                >
                  Normal (A)
                </button>
                <button 
                  onClick={() => setTextSize('large')}
                  style={{...styles.optionBtn, ...(textSize === 'large' ? styles.optionBtnActive : {})}}
                >
                  Grand (A+)
                </button>
                <button 
                  onClick={() => setTextSize('xlarge')}
                  style={{...styles.optionBtn, ...(textSize === 'xlarge' ? styles.optionBtnActive : {})}}
                >
                  Max (A++)
                </button>
              </div>
            </div>

            {/* 2. Contrastes */}
            <div style={styles.optionSection}>
              <div style={styles.optionLabel}>🎨 Contraste visuel :</div>
              <div style={styles.btnGroup}>
                <button 
                  onClick={() => setContrast('normal')}
                  style={{...styles.optionBtn, ...(contrast === 'normal' ? styles.optionBtnActive : {})}}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setContrast('high')}
                  style={{...styles.optionBtn, ...(contrast === 'high' ? styles.optionBtnActive : {})}}
                >
                  Contraste Élevé
                </button>
              </div>
            </div>

            {/* 3. Police Dyslexie */}
            <div style={styles.optionSection}>
              <div style={styles.optionLabel}>✍️ Police d'aide à la lecture (Dyslexie) :</div>
              <div style={styles.btnGroup}>
                <button 
                  onClick={() => setDyslexic(false)}
                  style={{...styles.optionBtn, ...(!dyslexic ? styles.optionBtnActive : {})}}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setDyslexic(true)}
                  style={{...styles.optionBtn, ...(dyslexic ? styles.optionBtnActive : {})}}
                >
                  OpenDyslexic
                </button>
              </div>
            </div>

            {/* 4. Lecteur Vocal */}
            <div style={styles.optionSection}>
              <div style={styles.optionLabel}>🔊 Synthèse vocale de survol (Lecteur d'Écran) :</div>
              <div style={styles.btnGroup}>
                <button 
                  onClick={() => setAudioReader(false)}
                  style={{...styles.optionBtn, ...(!audioReader ? styles.optionBtnActive : {})}}
                >
                  Désactivé
                </button>
                <button 
                  onClick={() => setAudioReader(true)}
                  style={{...styles.optionBtn, ...(audioReader ? styles.optionBtnActive : {})}}
                >
                  Activé 🔊
                </button>
              </div>
              <div style={styles.helpText}>
                * Lorsque activé, passez votre souris sur n'importe quel texte pour l'entendre prononcé à voix haute.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4b5563, #1f2937)',
    border: 'none',
    color: '#ffffff',
    fontSize: '24px',
    cursor: 'pointer',
    zIndex: 1001,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  panel: {
    position: 'fixed',
    bottom: '90px',
    left: '24px',
    width: '350px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    zIndex: 1000,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
  },
  panelSub: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  optionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
  },
  btnGroup: {
    display: 'flex',
    gap: '8px',
  },
  optionBtn: {
    flex: 1,
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionBtnActive: {
    background: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
  },
  helpText: {
    fontSize: '10px',
    color: '#64748b',
    lineHeight: 1.3,
    marginTop: '2px',
  }
};
