import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

const MONUMENTS = [
  {
    id: 'eiffel',
    name: 'Tour Eiffel',
    visitors: '7.1 M / an',
    height: '330m',
    desc: 'Symbole emblématique de Paris, construite par Gustave Eiffel pour l\'Exposition universelle de 1889. Située sur le Champ de Mars.',
    ecoTransit: '🚇 RER C (Champ de Mars), M6 (Bir-Hakeim), M9 (Trocadéro)',
    co2Impact: '0.01 kg CO₂ (via M6) vs 0.8 kg en voiture',
    pos: { x: -6, y: 0.5, z: 3, lat: 48.858370, lon: 2.294481 },
    color: '#fbbf24',
    touristNote: 'Visitez le premier étage pour marcher sur le plancher de verre transparent à 57 mètres du sol.'
  },
  {
    id: 'louvre',
    name: 'Musée du Louvre',
    visitors: '9.6 M / an',
    height: '21m (Pyramide)',
    desc: 'Le plus grand musée d\'art du monde, installé dans l\'ancien palais royal du Louvre. Célèbre pour la Joconde.',
    ecoTransit: '🚇 Ligne 1, Ligne 7 (Palais Royal - Musée du Louvre)',
    co2Impact: '0.005 kg CO₂ (via M1) vs 0.4 kg en voiture',
    pos: { x: -2, y: 0.2, z: -1.5, lat: 48.860611, lon: 2.335455 },
    color: '#06b6d4',
    touristNote: 'Admirez la pyramide de verre conçue par l\'architecte Ieoh Ming Pei dans la cour Napoléon.'
  },
  {
    id: 'notredame',
    name: 'Cathédrale Notre-Dame',
    visitors: '12.0 M / an',
    height: '69m (Tours)',
    desc: 'Chef-d\'œuvre de l\'architecture gothique situé sur l\'Île de la Cité, au cœur historique de Paris.',
    ecoTransit: '🚇 M4 (Cité), RER B/C (Saint-Michel Notre-Dame)',
    co2Impact: '0.008 kg CO₂ (via RER B) vs 0.5 kg en voiture',
    pos: { x: 2, y: 0.4, z: 1.0, lat: 48.852968, lon: 2.349902 },
    color: '#f97316',
    touristNote: 'Chef-d\'œuvre gothique célèbre pour ses gargouilles, ses vitraux en rose et ses grandes cloches.'
  },
  {
    id: 'triomphe',
    name: 'Arc de Triomphe',
    visitors: '3.2 M / an',
    height: '50m',
    desc: 'Monument célébrant les victoires impériales, situé au centre de la place de l\'Étoile et au sommet des Champs-Élysées.',
    ecoTransit: '🚇 RER A, Ligne 1, Ligne 2, Ligne 6 (Charles de Gaulle - Étoile)',
    co2Impact: '0.012 kg CO₂ (via RER A) vs 0.9 kg en voiture',
    pos: { x: -10, y: 0.4, z: -4, lat: 48.873792, lon: 2.295028 },
    color: '#ec4899',
    touristNote: 'Profitez de la terrasse supérieure pour une vue à 360° sur les 12 avenues rayonnantes.'
  },
  {
    id: 'sacrecoeur',
    name: 'Basilique du Sacré-Cœur',
    visitors: '11.0 M / an',
    height: '83m',
    desc: 'Édifice religieux en pierre blanche, culminant au sommet de la colline de Montmartre.',
    ecoTransit: '🚇 Ligne 2 (Anvers + Funiculaire), Ligne 12 (Abbesses)',
    co2Impact: '0.015 kg CO₂ (via M12) vs 1.1 kg en voiture',
    pos: { x: 1, y: 1.6, z: -10, lat: 48.886705, lon: 2.343023 },
    color: '#8b5cf6',
    touristNote: 'Le parvis de la basilique offre l\'un des plus beaux panoramas gratuits sur tout Paris.'
  },
  {
    id: 'garelyon',
    name: 'Gare de Lyon',
    visitors: '110 M / an',
    height: '64m (Horloge)',
    desc: 'L\'une des principales gares ferroviaires parisiennes, célèbre pour son horloge monumentale et son restaurant Le Train Bleu.',
    ecoTransit: '🚇 RER A, RER D, Ligne 1, Ligne 14 (Gare de Lyon)',
    co2Impact: '0.003 kg CO₂ (via M14) vs 0.3 kg en voiture',
    pos: { x: 8, y: 0.4, z: 4, lat: 48.844304, lon: 2.374372 },
    color: '#10b981',
    touristNote: 'Plaque tournante pour les TGV Sud-Est vers Lyon, Marseille, Nice, Genève et l\'Italie.'
  },
  {
    id: 'chatelet',
    name: 'Châtelet - Les Halles',
    visitors: '150 M / an',
    height: 'Souterrain',
    desc: 'La plus grande gare souterraine du monde, connectant 3 lignes de RER et 5 lignes de métro en plein centre de Paris.',
    ecoTransit: '🚇 RER A, B, D, Métro 1, 4, 7, 11, 14',
    co2Impact: '0.002 kg CO₂ (Hub Central)',
    pos: { x: 0, y: -0.1, z: -0.5, lat: 48.861720, lon: 2.346120 },
    color: '#3b82f6',
    touristNote: 'Surplombée en surface par la Canopée des Halles, un immense centre de shopping et culturel.'
  }
];

const TRANSIT_LINES = [
  {
    name: 'RER A',
    color: '#e11d48',
    stops: ['triomphe', 'chatelet', 'garelyon'],
    speed: 0.012
  },
  {
    name: 'Métro 14',
    color: '#a855f7',
    stops: ['chatelet', 'garelyon'],
    speed: 0.016
  },
  {
    name: 'Métro 1',
    color: '#facc15',
    stops: ['triomphe', 'louvre', 'chatelet', 'garelyon'],
    speed: 0.01
  }
];

const getClosestAirStation = (monument, airStations) => {
  if (!airStations || airStations.length === 0) return null;
  let closest = null;
  let minDist = Infinity;
  airStations.forEach(st => {
    const dx = st.lat - monument.pos.lat;
    const dy = st.lon - monument.pos.lon;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closest = st;
    }
  });
  return closest;
};

export default function Simulation3DPage({ meteo, air, trafic }) {
  const mountRef = useRef(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState(MONUMENTS[0]);
  const [viewMode, setViewMode] = useState('satellite'); // 'satellite', 'streetview', 'maquette'
  const [isNight, setIsNight] = useState(true);
  const [showRain, setShowRain] = useState(false);
  const [trafficSpeed, setTrafficSpeed] = useState(1);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simProgress, setSimProgress] = useState(0);

  // Charger Three.js et OrbitControls pour le mode maquette
  useEffect(() => {
    if (viewMode !== 'maquette') return;
    if (window.THREE && window.THREE.OrbitControls) {
      setThreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => {
      const controlsScript = document.createElement('script');
      controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
      controlsScript.async = true;
      controlsScript.onload = () => {
        setThreeLoaded(true);
      };
      document.body.appendChild(controlsScript);
    };
    document.body.appendChild(script);
  }, [viewMode]);

  // Détecter la météo réelle de Paris
  useEffect(() => {
    if (meteo && meteo.length > 0) {
      const parisMeteo = meteo.find(m => m.ville.toLowerCase() === 'paris') || meteo[0];
      const desc = parisMeteo.description.toLowerCase();
      if (desc.includes('pluie') || desc.includes('averse') || desc.includes('bruine') || desc.includes('orage')) {
        setShowRain(true);
      }
    }
  }, [meteo]);

  // Références Three.js
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const eiffelSearchlightRef = useRef(null);
  const eiffelTargetRef = useRef(null);
  const rainSystemRef = useRef(null);
  const carsRef = useRef([]);
  const ripplesRef = useRef([]);

  // Smooth Camera Fly-To (Pour la maquette vectorielle)
  const flyTo = (targetPos, lookAtPos) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    
    const startX = cam.position.x;
    const startY = cam.position.y;
    const startZ = cam.position.z;
    
    const endX = targetPos.x + 2.5;
    const endY = targetPos.y + 2.5;
    const endZ = targetPos.z + 4.5;

    const startTargetX = ctrl.target.x;
    const startTargetY = ctrl.target.y;
    const startTargetZ = ctrl.target.z;

    const duration = 60;
    let frame = 0;

    const animateFly = () => {
      frame++;
      const t = frame / duration;
      const ease = 1 - Math.pow(1 - t, 2);

      cam.position.x = startX + (endX - startX) * ease;
      cam.position.y = startY + (endY - startY) * ease;
      cam.position.z = startZ + (endZ - startZ) * ease;

      ctrl.target.x = startTargetX + (targetPos.x - startTargetX) * ease;
      ctrl.target.y = startTargetY + (targetPos.y - startTargetY) * ease;
      ctrl.target.z = startTargetZ + (targetPos.z - startTargetZ) * ease;
      
      ctrl.update();

      if (frame < duration) {
        requestAnimationFrame(animateFly);
      }
    };

    animateFly();
  };

  const handleSelectMonument = (monument) => {
    setSelectedMonument(monument);
    if (viewMode === 'maquette') {
      flyTo(monument.pos, monument.pos);
    }
  };

  const runTripSimulation = (type) => {
    setViewMode('maquette');
    setActiveSimulation(type);
    setSimProgress(0);
    // Délai pour laisser le temps à Three.js de charger et initialiser
    setTimeout(() => {
      if (cameraRef.current && controlsRef.current) {
        flyTo({ x: 0, y: 2, z: 0 }, { x: 0, y: 0, z: 0 });
      }
    }, 100);
  };

  // Mettre à jour l'ambiance lumineuse Jour/Nuit (Maquette)
  useEffect(() => {
    if (viewMode !== 'maquette' || !rendererRef.current || !sceneRef.current) return;
    const scene = sceneRef.current;
    
    const bgColor = isNight ? 0x070b19 : 0xe0f2fe;
    rendererRef.current.setClearColor(bgColor);
    scene.background = new window.THREE.Color(bgColor);
    scene.fog.color = new window.THREE.Color(bgColor);

    scene.traverse((child) => {
      if (child.isAmbientLight) {
        child.intensity = isNight ? 0.15 : 0.75;
      }
      if (child.isDirectionalLight) {
        child.intensity = isNight ? 0.15 : 1.3;
        child.color.setHex(isNight ? 0x1e293b : 0xffffff);
      }
      if (child.name === 'windowsMesh') {
        child.material.emissiveIntensity = isNight ? 0.8 : 0.05;
      }
      if (child.name === 'eiffelSearchlight' || child.name === 'eiffelBeam') {
        child.visible = isNight;
      }
      if (child.name === 'roadLine') {
        child.material.opacity = isNight ? 0.9 : 0.3;
      }
    });

  }, [isNight, viewMode]);

  // Pluie 3D (Maquette)
  useEffect(() => {
    if (viewMode !== 'maquette' || !sceneRef.current || !threeLoaded) return;
    const scene = sceneRef.current;

    if (showRain) {
      const particleCount = 3000;
      const geometry = new window.THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 35;
        positions[i * 3 + 1] = Math.random() * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
        velocities.push(0.12 + Math.random() * 0.15);
      }

      geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));
      
      const material = new window.THREE.PointsMaterial({
        color: 0x60a5fa,
        size: 0.06,
        transparent: true,
        opacity: 0.5
      });

      const rainSystem = new window.THREE.Points(geometry, material);
      rainSystem.userData = { velocities };
      scene.add(rainSystem);
      rainSystemRef.current = rainSystem;
    } else {
      if (rainSystemRef.current) {
        scene.remove(rainSystemRef.current);
        rainSystemRef.current.geometry.dispose();
        rainSystemRef.current.material.dispose();
        rainSystemRef.current = null;
      }
    }
  }, [showRain, threeLoaded, viewMode]);

  // Texture Haussmannienne
  const createHaussmannTexture = (THREE) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f1ece1';
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.strokeStyle = '#d7cebf';
    ctx.lineWidth = 1;
    for (let y = 16; y < 128; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    const cols = 4;
    const rows = 5;
    const wWidth = 14;
    const wHeight = 16;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 12 + c * 28;
        const y = 8 + r * 24;
        ctx.fillRect(x, y, wWidth, wHeight);
        ctx.strokeRect(x, y, wWidth, wHeight);
        if (r === 1 || r === 3) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(x - 2, y + wHeight - 4, wWidth + 4, 4);
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Initialisation du rendu Three.js (Maquette uniquement)
  useEffect(() => {
    if (viewMode !== 'maquette' || !threeLoaded || !mountRef.current) return;

    const THREE = window.THREE;
    const OrbitControls = THREE.OrbitControls;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = isNight ? 0x070b19 : 0xe0f2fe;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.04);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(-8, 8, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 2.5;
    controls.maxDistance = 20;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, isNight ? 0.15 : 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isNight ? 0.15 : 1.3);
    dirLight.position.set(10, 16, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Sol & Seine
    const groundGeom = new THREE.PlaneGeometry(35, 35);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const seineGeom = new THREE.BoxGeometry(36, 0.05, 4.0);
    const seineMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.1, metalness: 0.7 });
    const seine = new THREE.Mesh(seineGeom, seineMat);
    seine.position.set(0, 0.01, 1.5);
    seine.rotation.y = -0.15;
    scene.add(seine);

    const citeGeom = new THREE.BoxGeometry(4.0, 0.08, 1.8);
    const citeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const cite = new THREE.Mesh(citeGeom, citeMat);
    cite.position.set(2, 0.04, 1.2);
    cite.rotation.y = -0.15;
    scene.add(cite);

    // Ponts
    const bridges = [
      { x: -7, z: 2.6 }, { x: -2, z: 1.8 }, { x: 1.8, z: 1.5 }, { x: 4.2, z: 1.1 }, { x: 7.5, z: 0.3 }
    ];
    bridges.forEach(b => {
      const brGeom = new THREE.BoxGeometry(0.8, 0.15, 4.2);
      const brMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
      const br = new THREE.Mesh(brGeom, brMat);
      br.position.set(b.x, 0.08, b.z);
      br.rotation.y = -0.15;
      scene.add(br);
    });

    // Parcs
    const parks = [
      { x: -6, z: 5, w: 2.5, h: 4.5 }, { x: -6, z: 1.2, w: 2.0, h: 1.8 }, { x: -3.8, z: -1.5, w: 2.8, h: 2 }
    ];
    parks.forEach(p => {
      const parkGeom = new THREE.PlaneGeometry(p.w, p.h);
      const parkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
      const park = new THREE.Mesh(parkGeom, parkMat);
      park.rotation.x = -Math.PI / 2;
      park.position.set(p.x, 0.02, p.z);
      scene.add(park);
      
      for (let i = 0; i < 6; i++) {
        const treeGroup = new THREE.Group();
        const trunkGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 4);
        const trunk = new THREE.Mesh(trunkGeom, new THREE.MeshStandardMaterial({ color: 0x78350f }));
        trunk.position.y = 0.125;
        treeGroup.add(trunk);
        const leavesGeom = new THREE.SphereGeometry(0.18, 5, 5);
        const leaves = new THREE.Mesh(leavesGeom, new THREE.MeshStandardMaterial({ color: 0x166534 }));
        leaves.position.y = 0.28;
        treeGroup.add(leaves);
        treeGroup.position.set(p.x + (Math.random() - 0.5) * (p.w - 0.4), 0.02, p.z + (Math.random() - 0.5) * (p.h - 0.4));
        scene.add(treeGroup);
      }
    });

    // Rues
    const roads = [
      { x: 0, z: -4, w: 35, d: 0.8, rot: 0 },
      { x: 0, z: 3.8, w: 35, d: 0.5, rot: -0.15 },
      { x: 1.8, z: 0, w: 0.6, d: 35, rot: 1.4 }
    ];
    roads.forEach(r => {
      const roadGeom = new THREE.PlaneGeometry(r.w, r.d);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const road = new THREE.Mesh(roadGeom, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = r.rot;
      road.position.set(r.x, 0.02, r.z);
      road.name = 'roadLine';
      scene.add(road);
    });

    // Immeubles
    const wallTexture = createHaussmannTexture(THREE);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.8, metalness: 0.1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });

    const step = 2.5;
    for (let x = -16; x <= 16; x += step) {
      for (let z = -16; z <= 16; z += step) {
        if (Math.abs(z - 1.5 + x * 0.15) < 2.0) continue;
        if (Math.abs(x - 2) < 2.2 && Math.abs(z - 1.2) < 1.1) continue;
        if (Math.abs(z + 4) < 1.0) continue;
        if (Math.abs(x - 1.8) < 1.0) continue;
        if (Math.abs(x + 6) < 2.5 && z > 0) continue;
        if (Math.abs(x - 1) < 2.0 && z < -8) continue;
        
        const offsetX = (Math.random() - 0.5) * 0.5;
        const offsetZ = (Math.random() - 0.5) * 0.5;
        const bW = 0.8 + Math.random() * 0.4;
        const bD = 0.8 + Math.random() * 0.4;
        const bH = 1.2 + Math.random() * 1.0;

        const bGroup = new THREE.Group();
        bGroup.position.set(x + offsetX, bH / 2 + 0.02, z + offsetZ);

        const sideMat = wallMat.clone();
        sideMat.map = wallTexture.clone();
        sideMat.map.repeat.set(Math.round(bW * 2), Math.round(bH * 3));
        sideMat.map.needsUpdate = true;
        sideMat.emissive = new THREE.Color(0xfef08a);
        sideMat.emissiveIntensity = isNight ? 0.8 : 0.05;
        
        const facadeMesh = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), sideMat);
        facadeMesh.name = 'windowsMesh';
        facadeMesh.castShadow = true;
        facadeMesh.receiveShadow = true;
        bGroup.add(facadeMesh);

        const roofHeight = 0.25;
        const roofMesh = new THREE.Mesh(new THREE.CylinderGeometry(bW * 0.7, bW * 0.95, roofHeight, 4, 1, false, Math.PI/4), roofMat);
        roofMesh.position.y = bH / 2 + roofHeight / 2;
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.scale.set(1, 1, bD / bW);
        bGroup.add(roofMesh);

        for (let i = 0; i < 2; i++) {
          const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 4), chimneyMat);
          chimney.position.set((Math.random() - 0.5) * (bW * 0.4), bH / 2 + roofHeight + 0.04, (Math.random() - 0.5) * (bD * 0.4));
          bGroup.add(chimney);
        }
        scene.add(bGroup);
      }
    }

    // Eiffel
    const eiffelGroup = new THREE.Group();
    eiffelGroup.position.set(MONUMENTS[0].pos.x, 0, MONUMENTS[0].pos.z);
    const eiffelGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.9, wireframe: true });
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.6, 4), eiffelGoldMat);
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      leg.position.set(Math.cos(angle) * 0.4, 0.3, Math.sin(angle) * 0.4);
      leg.rotation.x = Math.sin(angle) * 0.3;
      leg.rotation.z = -Math.cos(angle) * 0.3;
      eiffelGroup.add(leg);
    }
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.9), eiffelGoldMat);
    p1.position.y = 0.6;
    eiffelGroup.add(p1);
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 0.8, 4), eiffelGoldMat);
    s2.position.y = 1.0;
    eiffelGroup.add(s2);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.55), eiffelGoldMat);
    p2.position.y = 1.4;
    eiffelGroup.add(p2);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.8, 4), eiffelGoldMat);
    spire.position.y = 2.3;
    eiffelGroup.add(spire);

    const eiffelLight = new THREE.SpotLight(0xfef08a, 10, 20, Math.PI / 10, 0.5, 1);
    eiffelLight.position.set(0, 3.2, 0);
    eiffelLight.castShadow = true;
    eiffelLight.name = 'eiffelSearchlight';
    eiffelLight.visible = isNight;
    const targetObj = new THREE.Object3D();
    targetObj.position.set(10, 1.0, 0);
    eiffelGroup.add(targetObj);
    eiffelLight.target = targetObj;
    eiffelGroup.add(eiffelLight);
    eiffelSearchlightRef.current = eiffelLight;
    eiffelTargetRef.current = targetObj;

    const beamGeom = new THREE.ConeGeometry(2.0, 15, 16, 1, true);
    beamGeom.translate(0, -7.5, 0);
    const beam = new THREE.Mesh(beamGeom, new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
    beam.name = 'eiffelBeam';
    beam.position.set(0, 3.2, 0);
    beam.rotation.x = Math.PI / 2;
    beam.visible = isNight;
    eiffelGroup.add(beam);
    scene.add(eiffelGroup);

    // Louvre
    const louvreGroup = new THREE.Group();
    louvreGroup.position.set(MONUMENTS[1].pos.x, 0, MONUMENTS[1].pos.z);
    const pool = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.02, 2.6), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.1 }));
    pool.position.y = 0.01;
    louvreGroup.add(pool);
    const pyrGeom = new THREE.ConeGeometry(1.0, 0.7, 4);
    const pyrMat = new THREE.MeshPhysicalMaterial({ color: 0x22d3ee, transmission: 0.85, transparent: true, roughness: 0.1 });
    const pyr = new THREE.Mesh(pyrGeom, pyrMat);
    pyr.position.y = 0.36;
    pyr.rotation.y = Math.PI / 4;
    louvreGroup.add(pyr);
    const pyrWire = new THREE.Mesh(pyrGeom, new THREE.MeshBasicMaterial({ color: 0x0891b2, wireframe: true }));
    pyrWire.position.y = 0.365;
    pyrWire.rotation.y = Math.PI / 4;
    pyrWire.scale.set(1.01, 1.01, 1.01);
    louvreGroup.add(pyrWire);
    scene.add(louvreGroup);

    // Arc
    const arcGroup = new THREE.Group();
    arcGroup.position.set(MONUMENTS[3].pos.x, 0, MONUMENTS[3].pos.z);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.75, 0.6), stoneMat);
    pillarL.position.set(-0.35, 0.375, 0);
    arcGroup.add(pillarL);
    const pillarR = pillarL.clone();
    pillarR.position.x = 0.35;
    arcGroup.add(pillarR);
    const topMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.6), stoneMat);
    topMesh.position.y = 0.9;
    arcGroup.add(topMesh);
    const archMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12, 1, false, 0, Math.PI), stoneMat);
    archMesh.rotation.z = Math.PI / 2;
    archMesh.rotation.y = Math.PI / 2;
    archMesh.position.set(0, 0.75, 0);
    arcGroup.add(archMesh);
    scene.add(arcGroup);

    // Notre-Dame
    const ndGroup = new THREE.Group();
    ndGroup.position.set(MONUMENTS[2].pos.x, 0, MONUMENTS[2].pos.z);
    ndGroup.rotation.y = -0.15;
    const ndStoneMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });
    const ndBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.6), ndStoneMat);
    ndBody.position.set(0, 0.3, -0.3);
    ndGroup.add(ndBody);
    const towerL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.36), ndStoneMat);
    towerL.position.set(-0.25, 0.5, 0.6);
    ndGroup.add(towerL);
    const towerR = towerL.clone();
    towerR.position.x = 0.25;
    ndGroup.add(towerR);
    const rose = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 24), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
    rose.position.set(0, 0.5, 0.79);
    ndGroup.add(rose);
    const ndSpire = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.9, 4), ndStoneMat);
    ndSpire.position.set(0, 1.0, -0.4);
    ndGroup.add(ndSpire);
    scene.add(ndGroup);

    // Sacré-Cœur
    const scGroup = new THREE.Group();
    scGroup.position.set(MONUMENTS[4].pos.x, 0, MONUMENTS[4].pos.z);
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI*2, 0, Math.PI/3), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
    hill.position.y = -1.1;
    scGroup.add(hill);
    const scWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const scBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 1.1), scWhiteMat);
    scBase.position.y = 0.225;
    scGroup.add(scBase);
    const mainDome = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI*2, 0, Math.PI/2), scWhiteMat);
    mainDome.position.y = 0.45;
    scGroup.add(mainDome);
    scene.add(scGroup);

    // Gare de Lyon
    const gdGroup = new THREE.Group();
    gdGroup.position.set(MONUMENTS[5].pos.x, 0, MONUMENTS[5].pos.z);
    const gdHall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.9), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }));
    gdHall.position.y = 0.2;
    gdGroup.add(gdHall);
    const glassRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.58, 8, 1, false, 0, Math.PI), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, transparent: true }));
    glassRoof.rotation.z = Math.PI / 2;
    glassRoof.position.set(0, 0.4, 0);
    gdGroup.add(glassRoof);
    const clockTower = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.2, 0.22), gdStoneMat);
    clockTower.position.set(-0.6, 0.6, 0.3);
    gdGroup.add(clockTower);
    scene.add(gdGroup);

    // Châtelet
    const chatGroup = new THREE.Group();
    chatGroup.position.set(MONUMENTS[6].pos.x, 0, MONUMENTS[6].pos.z);
    const canopee = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 0.15, 5, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xfef08a, transmission: 0.9, transparent: true }));
    canopee.position.y = 0.085;
    chatGroup.add(canopee);
    scene.add(chatGroup);

    // Pinpoint cones
    MONUMENTS.forEach(mon => {
      const pt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), new THREE.MeshBasicMaterial({ color: mon.color }));
      pt.position.set(mon.pos.x, mon.id === 'sacrecoeur' ? 2.5 : 2.1, mon.pos.z);
      pt.rotation.x = Math.PI;
      scene.add(pt);
      const monLight = new THREE.PointLight(mon.color, 0.6, 1.8);
      monLight.position.set(mon.pos.x, 1.2, mon.pos.z);
      scene.add(monLight);
    });

    // Splines & Trains
    const lineObjects = {};
    TRANSIT_LINES.forEach(line => {
      const points = line.stops.map(stopId => {
        const mon = MONUMENTS.find(m => m.id === stopId);
        return new THREE.Vector3(mon.pos.x, 0.16, mon.pos.z);
      });
      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(50);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: line.color, linewidth: 4, transparent: true, opacity: isNight ? 0.95 : 0.4 });
      const lineMesh = new THREE.Line(lineGeom, lineMat);
      scene.add(lineMesh);
      lineObjects[line.name] = { mesh: lineMesh, curve };
    });

    const trainParticles = [];
    TRANSIT_LINES.forEach((line) => {
      const curve = lineObjects[line.name].curve;
      for (let tIdx = 0; tIdx < 2; tIdx++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: line.color }));
        const trainLight = new THREE.PointLight(line.color, 1.5, 1.2);
        mesh.add(trainLight);
        scene.add(mesh);
        trainParticles.push({ mesh, curve, progress: tIdx * 0.5, speed: line.speed, lineName: line.name });
      }
    });

    // Voitures
    const cars = [];
    const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0xffffff, 0xf59e0b];
    for (let i = 0; i < 25; i++) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.08), new THREE.MeshStandardMaterial({ color: carColors[Math.floor(Math.random() * carColors.length)], roughness: 0.3 }));
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      hl.position.set(0.09, 0, 0.03);
      car.add(hl);
      scene.add(car);
      const road = roads[Math.floor(Math.random() * roads.length)];
      cars.push({ mesh: car, road, progress: Math.random() * 35 - 17.5, speed: (0.04 + Math.random() * 0.04) * (road.rot > 1.0 ? 1 : 1.3), direction: Math.random() > 0.5 ? 1 : -1 });
    }
    carsRef.current = cars;

    // Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      controls.update();

      if (eiffelSearchlightRef.current && eiffelTargetRef.current) {
        eiffelTargetRef.current.position.x = Math.cos(time * 1.5) * 10;
        eiffelTargetRef.current.position.z = Math.sin(time * 1.5) * 10;
        const beam = scene.getObjectByName('eiffelBeam');
        if (beam) beam.rotation.y = -time * 1.5 - Math.PI / 2;
      }

      trainParticles.forEach(tp => {
        tp.progress += tp.speed * 0.2 * trafficSpeed;
        if (tp.progress > 1.0) tp.progress = 0.0;
        const pos = tp.curve.getPointAt(tp.progress);
        tp.mesh.position.copy(pos);
        tp.mesh.lookAt(pos.clone().add(tp.curve.getTangentAt(tp.progress)));
      });

      carsRef.current.forEach(c => {
        c.progress += c.speed * c.direction * trafficSpeed;
        if (c.progress > 17.5) c.progress = -17.5;
        else if (c.progress < -17.5) c.progress = 17.5;

        if (c.road.rot === 0) {
          c.mesh.position.set(c.progress, 0.05, c.road.z + (c.direction * 0.15));
          c.mesh.rotation.y = c.direction > 0 ? 0 : Math.PI;
        } else if (c.road.rot === -0.15) {
          const angle = -0.15;
          c.mesh.position.set(c.progress * Math.cos(angle), 0.05, c.road.z + c.progress * Math.sin(angle) + (c.direction * 0.12));
          c.mesh.rotation.y = c.direction > 0 ? angle : angle + Math.PI;
        } else {
          c.mesh.position.set(c.road.x + (c.direction * 0.12), 0.05, c.progress);
          c.mesh.rotation.y = c.direction > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
      });

      if (rainSystemRef.current) {
        const positions = rainSystemRef.current.geometry.attributes.position.array;
        const velocities = rainSystemRef.current.userData.velocities;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] -= velocities[i] * 1.6;
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 12 + Math.random() * 3;
            const rx = positions[i * 3];
            const rz = positions[i * 3 + 2];
            if (Math.abs(rz - 1.5 + rx * 0.15) < 2.0 && Math.random() < 0.02 && ripplesRef.current.length < 8) {
              const rp = new THREE.Mesh(new THREE.RingGeometry(0.01, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
              rp.rotation.x = Math.PI / 2;
              rp.position.set(rx, 0.03, rz);
              scene.add(rp);
              ripplesRef.current.push({ mesh: rp, scale: 1.0, opacity: 0.6 });
            }
          }
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      ripplesRef.current.forEach((r, idx) => {
        r.scale += 0.08;
        r.opacity -= 0.025;
        r.mesh.scale.set(r.scale, r.scale, 1);
        r.mesh.material.opacity = r.opacity;
        if (r.opacity <= 0) {
          scene.remove(r.mesh);
          r.mesh.geometry.dispose();
          r.mesh.material.dispose();
          ripplesRef.current.splice(idx, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [threeLoaded, viewMode]);

  // Simulation active progress
  useEffect(() => {
    if (!activeSimulation) return;
    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setActiveSimulation(null);
            alert(`🏁 Simulation de trajet terminée ! Trajet vert accompli avec brio.`);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeSimulation]);

  // Générer les URLs d'intégration Google Maps
  const getGoogleMapsUrl = (mon) => {
    // Mode Satellite / Hybrid avec coordonnées exactes
    return `https://maps.google.com/maps?q=${mon.pos.lat},${mon.pos.lon}&z=18&t=k&output=embed`;
  };

  const getStreetViewUrl = (mon) => {
    // Mode Street View basé sur le nom du monument pour assurer une fiabilité à 100%
    return `https://maps.google.com/maps?q=${encodeURIComponent(mon.name)}+Paris&layer=c&output=embed`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.dashboardGrid}>
        
        {/* Rendu Principal (WebGL ou Iframe Google Maps) */}
        <div style={styles.canvasContainer}>
          <div style={styles.canvasOverlay}>
            <div style={styles.controlHeader}>
              <h2 style={styles.title3D}>🗼 {selectedMonument.name} — Visualisation Réaliste</h2>
              
              {/* Onglets de Rendu (Satellite, StreetView, Maquette, Environnement) */}
              <div style={styles.tabButtons}>
                <button 
                  onClick={() => setViewMode('satellite')} 
                  style={{...styles.tabBtn, ...(viewMode === 'satellite' ? styles.tabBtnActive : {})}}
                >
                  🛰️ Vue Satellite
                </button>
                <button 
                  onClick={() => setViewMode('streetview')} 
                  style={{...styles.tabBtn, ...(viewMode === 'streetview' ? styles.tabBtnActive : {})}}
                >
                  📸 Street View
                </button>
                <button 
                  onClick={() => setViewMode('env')} 
                  style={{...styles.tabBtn, ...(viewMode === 'env' ? styles.tabBtnActive : {})}}
                >
                  🌱 Transit & Air
                </button>
                <button 
                  onClick={() => setViewMode('maquette')} 
                  style={{...styles.tabBtn, ...(viewMode === 'maquette' ? styles.tabBtnActive : {})}}
                >
                  🕹️ Maquette
                </button>
              </div>
            </div>
            
            {/* Toggles pour la Maquette uniquement */}
            {viewMode === 'maquette' && (
              <div style={styles.controlsRow}>
                <button 
                  onClick={() => setIsNight(!isNight)} 
                  style={{...styles.toggleBtn, background: isNight ? '#3b82f6' : '#ffffff', color: isNight ? '#ffffff' : '#0f172a'}}
                >
                  {isNight ? '🌙 Mode Nuit (Néons)' : '☀️ Mode Jour (Sleek)'}
                </button>

                <button 
                  onClick={() => setShowRain(!showRain)} 
                  style={{...styles.toggleBtn, background: showRain ? '#10b981' : '#ffffff', color: showRain ? '#ffffff' : '#0f172a'}}
                >
                  💧 Pluie 3D : {showRain ? 'Actif' : 'Inactif'}
                </button>

                <div style={styles.sliderGroup}>
                  <span style={styles.sliderLabel}>Flux : {trafficSpeed}x</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="0.5" 
                    value={trafficSpeed} 
                    onChange={(e) => setTrafficSpeed(parseFloat(e.target.value))}
                    style={styles.slider}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rendu conditionnel selon l'onglet */}
          {/* Rendu conditionnel selon l'onglet */}
          {viewMode === 'satellite' && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <iframe
                title="Google Maps Satellite 3D"
                src={getGoogleMapsUrl(selectedMonument)}
                style={styles.iframe}
                allowFullScreen=""
                loading="lazy"
              />
              {/* Ambiance pollution subtile (overlay coloré) */}
              {(() => {
                const closestAir = getClosestAirStation(selectedMonument, air);
                if (!closestAir) return null;
                const color = closestAir.indice_atmo <= 4 ? '#10b981' : closestAir.indice_atmo <= 7 ? '#f59e0b' : '#ef4444';
                return (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: color,
                    opacity: 0.08,
                    pointerEvents: 'none',
                    zIndex: 5
                  }} />
                );
              })()}

              {/* Badge flottant qualité de l'air */}
              {(() => {
                const closestAir = getClosestAirStation(selectedMonument, air);
                if (!closestAir) return null;
                const color = closestAir.indice_atmo <= 4 ? '#10b981' : closestAir.indice_atmo <= 7 ? '#f59e0b' : '#ef4444';
                const label = closestAir.indice_atmo <= 4 ? 'Bon' : closestAir.indice_atmo <= 7 ? 'Moyen' : 'Mauvais';
                return (
                  <div style={{
                    position: 'absolute',
                    top: '75px',
                    right: '20px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${color}`,
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    zIndex: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    maxWidth: '220px'
                  }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🍃 Air Proximité : {closestAir.station_nom}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {closestAir.indice_atmo}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>
                        ATMO : {label}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {viewMode === 'streetview' && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <iframe
                title="Google Maps Street View"
                src={getStreetViewUrl(selectedMonument)}
                style={styles.iframe}
                allowFullScreen=""
                loading="lazy"
              />
              {/* Ambiance pollution subtile (overlay coloré) */}
              {(() => {
                const closestAir = getClosestAirStation(selectedMonument, air);
                if (!closestAir) return null;
                const color = closestAir.indice_atmo <= 4 ? '#10b981' : closestAir.indice_atmo <= 7 ? '#f59e0b' : '#ef4444';
                return (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: color,
                    opacity: 0.08,
                    pointerEvents: 'none',
                    zIndex: 5
                  }} />
                );
              })()}

              {/* Badge flottant qualité de l'air */}
              {(() => {
                const closestAir = getClosestAirStation(selectedMonument, air);
                if (!closestAir) return null;
                const color = closestAir.indice_atmo <= 4 ? '#10b981' : closestAir.indice_atmo <= 7 ? '#f59e0b' : '#ef4444';
                const label = closestAir.indice_atmo <= 4 ? 'Bon' : closestAir.indice_atmo <= 7 ? 'Moyen' : 'Mauvais';
                return (
                  <div style={{
                    position: 'absolute',
                    top: '75px',
                    right: '20px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${color}`,
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    zIndex: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    maxWidth: '220px'
                  }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🍃 Air Proximité : {closestAir.station_nom}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {closestAir.indice_atmo}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>
                        ATMO : {label}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {viewMode === 'env' && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <MapContainer 
                center={[selectedMonument.pos.lat, selectedMonument.pos.lon]} 
                zoom={14} 
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <ChangeView center={[selectedMonument.pos.lat, selectedMonument.pos.lon]} zoom={14} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                />
                
                {/* Marqueur du Monument */}
                <Marker 
                  position={[selectedMonument.pos.lat, selectedMonument.pos.lon]} 
                  icon={L.divIcon({
                    html: `<div style="font-size:20px; background:#ffffff; border:2px solid ${selectedMonument.color}; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.25);">${
                      selectedMonument.id === 'eiffel' ? '🗼' :
                      selectedMonument.id === 'louvre' ? '🏛️' :
                      selectedMonument.id === 'notredame' ? '⛪' :
                      selectedMonument.id === 'triomphe' ? '🏛️' :
                      selectedMonument.id === 'sacrecoeur' ? '⛪' :
                      selectedMonument.id === 'garelyon' ? '🚉' : '🚇'
                    }</div>`,
                    className: 'custom-monument-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                  })}
                >
                  <Popup>
                    <div style={{ padding: '4px', minWidth: '150px' }}>
                      <b style={{ fontSize: '13px', color: '#0f172a' }}>{selectedMonument.name}</b>
                      <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0', lineHeight: 1.4 }}>{selectedMonument.desc}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Capteurs de Qualité de l'Air */}
                {air && air.map((st, idx) => {
                  const color = st.indice_atmo <= 4 ? '#10b981' : st.indice_atmo <= 7 ? '#f59e0b' : '#ef4444';
                  return (
                    <React.Fragment key={`air-3d-${idx}`}>
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
                          <div style={{ fontSize: '11px', color: '#0f172a' }}>
                            <b>Station Air : {st.station_nom}</b><br/>
                            Indice ATMO : {st.indice_atmo}/10 ({st.polluant_majoritaire})
                          </div>
                        </Tooltip>
                      </Marker>
                    </React.Fragment>
                  );
                })}

                {/* Lignes de trafic routier */}
                {trafic && trafic.map((t, idx) => {
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
                      key={`traf-3d-${idx}`}
                      positions={positions}
                      pathOptions={{
                        color: t.fluidite === 'bloqué' ? '#ef4444' : t.fluidite === 'dense' ? '#f59e0b' : '#94a3b8',
                        weight: t.fluidite === 'bloqué' ? 4 : 2,
                        opacity: 0.7
                      }}
                    >
                      <Tooltip sticky>
                        <div style={{ fontSize: '11px', color: '#0f172a' }}>
                          <b>{t.nom_segment}</b><br/>
                          Vitesse : {t.vitesse_kmh} km/h ({t.fluidite})
                        </div>
                      </Tooltip>
                    </Polyline>
                  );
                })}
              </MapContainer>

              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                zIndex: 1000,
                fontSize: '10px',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '3px' }}>Légende Environnement</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Air : Bon (ATMO 1-4)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Air : Moyen (ATMO 5-7)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Air : Mauvais (ATMO 8-10)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '12px', height: '2px', background: '#ef4444' }} /> Circulation : Bloquée</div>
              </div>
            </div>
          )}

          {viewMode === 'maquette' && (
            <>
              {!threeLoaded ? (
                <div style={styles.loader}>
                  <div style={styles.spinner} />
                  <p style={{fontWeight:600}}>Génération des volumes urbains parisiens...</p>
                </div>
              ) : (
                <div ref={mountRef} style={styles.canvas} />
              )}

              {/* Légende en bas à gauche */}
              <div style={styles.legendBox}>
                <div style={styles.legendTitle}>Lignes de transport</div>
                <div style={styles.legendList}>
                  <div style={styles.legendItem}><span style={{...styles.dot, background: '#e11d48'}} /> RER A (Grandes lignes)</div>
                  <div style={styles.legendItem}><span style={{...styles.dot, background: '#a855f7'}} /> Métro 14 (Express)</div>
                  <div style={styles.legendItem}><span style={{...styles.dot, background: '#facc15'}} /> Métro 1 (Périphérique)</div>
                </div>
              </div>
            </>
          )}

          {/* Simulateur actif */}
          {activeSimulation && viewMode === 'maquette' && (
            <div style={styles.simProgressCard}>
              <div style={styles.simProgressHeader}>
                <span>🚇 Transit 3D : {activeSimulation === 'lyon_chatelet' ? 'Gare de Lyon ➔ Châtelet' : 'Étoile ➔ Gare de Lyon'}</span>
                <b>{simProgress}%</b>
              </div>
              <div style={styles.simProgressBar}>
                <div style={{...styles.simProgressBarFill, width: `${simProgress}%`}} />
              </div>
            </div>
          )}
        </div>

        {/* Panneau Latéral : Tourisme & Données */}
        <div style={styles.sidebar}>
          
          {/* Liste des Monuments */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🗺️ Monuments & Gares</h3>
            <div style={styles.monumentList}>
              {MONUMENTS.map(mon => (
                <button 
                  key={mon.id} 
                  onClick={() => handleSelectMonument(mon)}
                  style={{
                    ...styles.monumentItem,
                    borderColor: selectedMonument.id === mon.id ? mon.color : '#e2e8f0',
                    background: selectedMonument.id === mon.id ? `${mon.color}0a` : '#ffffff',
                    borderLeftWidth: selectedMonument.id === mon.id ? '5px' : '1px'
                  }}
                >
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <b style={{fontSize:'13px', color:'#0f172a'}}>{mon.name}</b>
                    <span style={{fontSize:'10px', color:'#64748b', fontWeight:600}}>{mon.visitors}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fiche Détails */}
          {selectedMonument && (
            <div style={styles.detailsCard}>
              <div style={{...styles.detailsHeader, borderLeftColor: selectedMonument.color}}>
                <h4 style={styles.detailsTitle}>{selectedMonument.name}</h4>
                <span style={{...styles.detailsTag, background: `${selectedMonument.color}15`, color: selectedMonument.color}}>{selectedMonument.visitors}</span>
              </div>
              
              <p style={styles.detailsDesc}>{selectedMonument.desc}</p>
              
              {/* Infos Clés */}
              <div style={styles.statsRow}>
                <div style={styles.statCol}>
                  <div style={styles.statVal}>{selectedMonument.height}</div>
                  <div style={styles.statLabel}>Dimension</div>
                </div>
                <div style={styles.statCol}>
                  <div style={styles.statVal}>🌍 Réel 3D</div>
                  <div style={styles.statLabel}>Photogrammétrie</div>
                </div>
              </div>

              {/* Desserte Écologique */}
              <div style={styles.ecoSection}>
                <div style={styles.ecoTitle}>🚇 Accès Éco-Responsable</div>
                <div style={styles.ecoValue}>{selectedMonument.ecoTransit}</div>
                <div style={styles.ecoCO2}>Bilan : <b>{selectedMonument.co2Impact}</b></div>
              </div>

              {/* Note Touristique */}
              <div style={styles.touristNoteBox}>
                💡 <b>Conseil :</b> {selectedMonument.touristNote}
              </div>

              {/* Lancer un Trajet de Simulation */}
              {selectedMonument.id === 'garelyon' && (
                <button 
                  onClick={() => runTripSimulation('lyon_chatelet')} 
                  disabled={activeSimulation !== null}
                  style={styles.simBtn}
                >
                  ⚡ Simuler le trajet vers Châtelet (RER A / M14)
                </button>
              )}

              {selectedMonument.id === 'triomphe' && (
                <button 
                  onClick={() => runTripSimulation('etoile_lyon')} 
                  disabled={activeSimulation !== null}
                  style={styles.simBtn}
                >
                  ⚡ Simuler le trajet vers Gare de Lyon (RER A / M1)
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '20px' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', minHeight: '620px' },
  canvasContainer: { position: 'relative', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', background: '#070b19', display: 'flex', flexDirection: 'column', height: '620px', boxShadow: '0 4px 20px rgba(15,23,42,0.08)' },
  canvasOverlay: { position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', zIndex: 10, background: 'linear-gradient(to bottom, rgba(7,11,25,0.85) 0%, rgba(7,11,25,0) 100%)', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' },
  controlHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  title3D: { fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 },
  tabButtons: { display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '8px' },
  tabBtn: { background: 'transparent', border: 'none', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  tabBtnActive: { background: '#2563eb', color: '#ffffff' },
  controlsRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  toggleBtn: { border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  sliderGroup: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(7,11,25,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '10px' },
  sliderLabel: { fontSize: '11px', color: '#cbd5e1', fontWeight: 700 },
  slider: { width: '80px', cursor: 'pointer' },
  canvas: { width: '100%', height: '100%', cursor: 'grab' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block', background: '#000' },
  loader: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #1e293b', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  legendBox: { position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(7,11,25,0.85)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', zIndex: 10 },
  legendTitle: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  legendList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', fontWeight: 600 },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  simProgressCard: { position: 'absolute', bottom: '20px', right: '20px', width: '320px', background: 'rgba(7,11,25,0.92)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
  simProgressHeader: { display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontSize: '12px', fontWeight: 700 },
  simProgressBar: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' },
  simProgressBarFill: { height: '100%', background: '#a855f7', transition: 'width 0.1s linear' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px', height: '620px', overflowY: 'auto' },
  section: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionTitle: { fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 },
  monumentList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' },
  monumentItem: { width: '100%', border: '1px solid #cbd5e1', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' },
  detailsCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 },
  detailsHeader: { borderLeft: '4px solid #3b82f6', paddingLeft: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  detailsTitle: { fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 },
  detailsTag: { fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' },
  detailsDesc: { fontSize: '12px', color: '#475569', lineHeight: 1.6, margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0' },
  statCol: { textAlign: 'center' },
  statVal: { fontSize: '14px', fontWeight: 800, color: '#0f172a' },
  statLabel: { fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '2px' },
  ecoSection: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  ecoTitle: { fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  ecoValue: { fontSize: '12px', color: '#1e293b', fontWeight: 600 },
  ecoCO2: { fontSize: '11px', color: '#15803d', background: '#dcfce7', width: 'fit-content', padding: '2px 8px', borderRadius: '6px' },
  touristNoteBox: { fontSize: '11px', color: '#1e3a8a', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 12px', borderRadius: '10px', lineHeight: 1.5 },
  simBtn: { width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }
};
