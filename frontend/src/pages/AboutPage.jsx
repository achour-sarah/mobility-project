import React from 'react';

const TEAM_MEMBERS = [
  {
    name: 'Romain VIGNARD',
    role: 'Ingénieur Données & API',
    desc: 'Conception de l\'architecture backend, intégration des API tierces temps réel, flux de données trafic et routage GTFS optimal.',
    color: '#3b82f6',
    icon: '⚙️'
  },
  {
    name: 'Sarah ACHOUR',
    role: 'Data Scientist & Base de Données',
    desc: 'Modélisation relationnelle de la base de données PostgreSQL, traitement des données complexes ATMO (Air) et analyses de prédictions.',
    color: '#10b981',
    icon: '📊'
  },
  {
    name: 'Shamcya MOHAMED ELECTON',
    role: 'Data Analyst & Expert JS',
    desc: 'Développement de l\'interface utilisateur sous React, intégrations cartographiques interactives Leaflet et moteur 3D volumétrique Three.js.',
    color: '#f97316',
    icon: '💻'
  }
];

const TECHS = [
  { category: '🎨 Frontend & UI', items: ['React.js (Architecture SPA)', 'Three.js (Visualisation 3D interactive)', 'Leaflet & OpenStreetMap (Cartographie)', 'Recharts (Analyses temporelles)', 'CSS Glassmorphism & Néon'] },
  { category: '⚙️ Backend & API', items: ['Python & Flask', 'Routage GTFS Direct', 'Calculs de distance (Haversine)', 'API Météo temps réel', 'Collecte des indices ATMO (Air)'] },
  { category: '🗄️ Données & Stockage', items: ['PostgreSQL Relatif', 'Données GTFS Île-de-France Mobilités', '8,6 Millions de lignes d\'horaires intégrées', 'Qualité de l\'air de proximité'] }
];

export default function AboutPage() {
  return (
    <div style={styles.container}>
      {/* En-tête de la présentation */}
      <div style={styles.heroCard}>
        <div style={styles.heroGlow} />
        <span style={styles.heroTag}>🎓 Sup de Vinci — M2 Big Data & IA</span>
        <h2 style={styles.heroTitle}>SmartMobility IDF : Présentation du Projet</h2>
        <p style={styles.heroDesc}>
          Une plateforme intelligente de supervision et d'aide à la décision pour les mobilités douces en Île-de-France. 
          SmartMobility IDF couple le transit ferroviaire GTFS, les flux de trafic routier et la qualité de l'air en temps réel 
          pour concevoir la ville verte de demain.
        </p>
      </div>

      <div style={styles.grid}>
        {/* Colonne Gauche : Membres de l'équipe */}
        <div style={styles.col}>
          <h3 style={styles.sectionTitle}>👥 Équipe de Réalisation</h3>
          <div style={styles.teamList}>
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} style={{ ...styles.memberCard, borderLeftColor: member.color }}>
                <div style={styles.memberHeader}>
                  <div style={{ ...styles.memberAvatar, background: `${member.color}15`, color: member.color }}>
                    {member.icon}
                  </div>
                  <div>
                    <h4 style={styles.memberName}>{member.name}</h4>
                    <span style={{ ...styles.memberRole, color: member.color }}>{member.role}</span>
                  </div>
                </div>
                <p style={styles.memberDesc}>{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite : Architecture technique */}
        <div style={styles.col}>
          <h3 style={styles.sectionTitle}>🛠️ Stack Technique & Données</h3>
          <div style={styles.techWrapper}>
            {TECHS.map((tech, idx) => (
              <div key={idx} style={styles.techCard}>
                <h4 style={styles.techCategory}>{tech.category}</h4>
                <div style={styles.techBadgeContainer}>
                  {tech.items.map((item, itemIdx) => (
                    <span key={itemIdx} style={styles.techBadge}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '30px' },
  heroCard: { position: 'relative', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px 40px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  heroGlow: { position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 70%)', pointerEvents: 'none' },
  heroTag: { fontSize: '11px', fontWeight: 800, background: '#2563eb', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' },
  heroTitle: { fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0', letterSpacing: '-0.5px' },
  heroDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0, maxWidth: '850px' },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' },
  col: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' },
  teamList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  memberCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #cbd5e1', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' },
  memberHeader: { display: 'flex', alignItems: 'center', gap: '14px' },
  memberAvatar: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  memberName: { fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 },
  memberRole: { fontSize: '12px', fontWeight: 700, marginTop: '2px', display: 'inline-block' },
  memberDesc: { fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 },
  techWrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
  techCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' },
  techCategory: { fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 },
  techBadgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  techBadge: { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px' }
};
