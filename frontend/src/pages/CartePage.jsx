import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FLUIDITE_COLOR = {
  libre: '#94a3b8',   // Slate-400
  dense: '#f59e0b',   // Amber-500
  'bloqué': '#ef4444',// Red-500
  inconnu: '#cbd5e1'  // Slate-300
};

const AIR_COLOR = (indice) => {
  if (indice <= 4) return '#10b981'; // Green-500
  if (indice <= 7) return '#f59e0b'; // Amber-500
  return '#ef4444'; // Red-500
};

// Hubs majeurs injectés pour la cartographie
const MOCK_STATIONS = [
  { id: 'st1', nom: 'Gare de Lyon', lat: 48.8443, lon: 2.3744, lignes: ['RER A', 'RER D', 'Ligne 1', 'Ligne 14'], flux: 'Très fort' },
  { id: 'st2', nom: 'Châtelet-Les Halles', lat: 48.8619, lon: 2.3470, lignes: ['RER A', 'RER B', 'RER D', 'Ligne 4'], flux: 'Saturé' },
  { id: 'st3', nom: 'Gare du Nord', lat: 48.8809, lon: 2.3553, lignes: ['RER B', 'RER D', 'Ligne 4', 'Ligne 5'], flux: 'Fort' },
  { id: 'st4', nom: 'La Défense', lat: 48.8920, lon: 2.2373, lignes: ['RER A', 'Ligne 1'], flux: 'Moyen' },
  { id: 'st5', nom: 'Montparnasse', lat: 48.8412, lon: 2.3204, lignes: ['Ligne 4', 'Ligne 6', 'Ligne 12', 'Ligne 13'], flux: 'Fort' },
  { id: 'st6', nom: 'Saint-Lazare', lat: 48.8753, lon: 2.3250, lignes: ['Ligne 3', 'Ligne 12', 'Ligne 13', 'Ligne 14'], flux: 'Fort' },
];

const stationIcon = L.divIcon({
  html: '<div style="font-size:16px; background:#ffffff; border:2px solid #0f172a; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.3);">🚇</div>',
  className: 'custom-station-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function CartePage({ trafic, air, transports, meteo }) {
  const [filter, setFilter] = useState('all');
  
  // Génère une "histoire" combinant les réseaux pour la station
  const getStationStory = (st) => {
    let myLinesKo = [];
    if (transports && transports.length > 0) {
      myLinesKo = transports.filter(t => st.lignes.includes(t.ligne) && (t.statut === 'perturbé' || t.statut === 'interrompu' || t.statut === 'ralenti'));
    }
    
    const avgAir = air && air.length ? Math.round(air.reduce((acc, a) => acc + a.indice_atmo, 0) / air.length) : 5;
    const airText = avgAir <= 4 ? "L'air ambiant y est d'excellente qualité" : avgAir <= 7 ? "La qualité de l'air est moyenne aux abords" : "La zone est actuellement touchée par un pic de pollution";

    if (myLinesKo.length > 0) {
      return `Le hub multimodal de ${st.nom} est sous forte pression : les usagers de ${myLinesKo.map(l=>l.ligne).join(', ')} rencontrent des difficultés. ${airText} (Indice ATMO ${avgAir}). Le report vers des mobilités alternatives est conseillé.`;
    } else {
      return `À la gare de ${st.nom}, les correspondances (${st.lignes.join(', ')}) s'opèrent normalement malgré le flux ${st.flux} habituel. ${airText} (Indice ATMO ${avgAir}). C'est une excellente option pour contourner le trafic routier.`;
    }
  };

  return (
    <div style={styles.carteWrapper}>
      <div style={styles.topBar}>
        <div style={styles.filtersBox}>
          <div style={styles.filterTitle}>Analyse Narrative du Réseau :</div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={styles.select}>
            <option value="all">Vue globale (Trafic + Air + Stations)</option>
            <option value="bloqué">Points critiques uniquement (Trafic bloqué)</option>
          </select>
        </div>
      </div>

      <MapContainer center={[48.8566, 2.3522]} zoom={12} style={styles.map}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        {/* MOCK STATIONS */}
        {(filter === 'all') && MOCK_STATIONS.map(st => (
          <Marker key={st.id} position={[st.lat, st.lon]} icon={stationIcon}>
            <Popup>
              <div style={styles.popupCard}>
                <div style={styles.popupTitle}>Gare de {st.nom}</div>
                <div style={styles.popupStory}>{getStationStory(st)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* TRAFIC */}
        {trafic.filter(t => {
          if (filter === 'bloqué') return t.fluidite === 'bloqué';
          return true;
        }).map((t, idx) => {
          const coords = t.geo_shape?.coordinates;
          if (!coords) return null;
          let positions = [];
          if (t.geo_shape.type === 'LineString') {
            positions = coords.map(c => [c[1], c[0]]);
          } else if (t.geo_shape.type === 'MultiLineString') {
            positions = coords.map(line => line.map(c => [c[1], c[0]]));
          }
          return (
            <Polyline
              key={`tr-${idx}`}
              positions={positions}
              pathOptions={{
                color: FLUIDITE_COLOR[t.fluidite] || FLUIDITE_COLOR.inconnu,
                weight: t.fluidite === 'bloqué' ? 5 : 3,
                opacity: t.fluidite === 'libre' ? 0.3 : 0.9 // Rendre fluide très transparent
              }}
            >
              <Tooltip sticky>
                <div style={styles.tooltipCard}>
                  <div style={styles.tooltipTitle}>{t.nom_segment}</div>
                  <div style={styles.tooltipRow}><span>Vitesse mesurée:</span> <b>{t.vitesse_kmh} km/h</b></div>
                  <div style={styles.tooltipStory}>
                    {t.fluidite === 'bloqué' ? "Cet axe majeur est complètement paralysé, générant d'importantes nuisances." : 
                     t.fluidite === 'dense' ? "La circulation y est particulièrement dense et en accordéon." : "Trafic régulier, peu d'impact sur l'environnement immédiat."}
                  </div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* AIR QUALITY */}
        {(filter === 'all') && air.map((st, idx) => {
          const color = AIR_COLOR(st.indice_atmo);
          return (
            <React.Fragment key={`air-${idx}`}>
              {/* Halo de couleur sur toute la zone */}
              <Circle
                center={[st.lat, st.lon]}
                radius={3000}
                pathOptions={{
                  fillColor: color,
                  color: 'transparent',
                  fillOpacity: 0.12,
                  interactive: false
                }}
              />
              {/* Petit marqueur précis avec valeur ATMO au centre */}
              <Marker
                position={[st.lat, st.lon]}
                icon={L.divIcon({
                  html: `<div style="background-color:${color}; color:#ffffff; border:2px solid #ffffff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; box-shadow:0 2px 6px rgba(0,0,0,0.3);">${st.indice_atmo}</div>`,
                  className: 'custom-air-value-icon',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
              >
                <Tooltip>
                  <div style={styles.tooltipCard}>
                    <div style={styles.tooltipTitle}>Station Capteur : {st.station_nom}</div>
                    <div style={styles.tooltipStory}>
                      L'indice ATMO localisés relève une note de <b>{st.indice_atmo}/10</b> (polluant majeur : <b>{st.polluant_majoritaire}</b>). 
                      {st.indice_atmo > 6 ? " La qualité de l'air est mauvaise. Déconseillé aux personnes sensibles." : " Idéal pour les piétons et les cyclistes."}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

const styles = {
  carteWrapper: { position: 'relative', width: '100%', height: 'calc(100vh - 120px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  topBar:       { position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000, display: 'flex', justifyContent: 'center', pointerEvents: 'none' },
  filtersBox:   { background: '#ffffff', padding: '12px 24px', borderRadius: '30px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  filterTitle:  { fontSize: '13px', fontWeight: 700, color: '#0f172a' },
  select:       { background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', outline: 'none', fontWeight: 600, cursor: 'pointer' },
  map:          { width: '100%', height: '100%', zIndex: 0 },
  tooltipCard:  { background: '#ffffff', padding: '8px', borderRadius: '8px', color: '#0f172a', minWidth: '220px', border: 'none', boxShadow: 'none' },
  tooltipTitle: { fontSize: '14px', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px', color: '#0f172a' },
  tooltipRow:   { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' },
  tooltipStory: { fontSize: '12px', color: '#475569', lineHeight: 1.5, marginTop: '8px' },
  popupCard:    { padding: '6px', minWidth: '240px' },
  popupTitle:   { fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' },
  popupStory:   { fontSize: '13px', color: '#475569', lineHeight: 1.6 }
};
