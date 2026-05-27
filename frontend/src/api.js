import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

export const getTrafic      = () => axios.get(`${BASE}/trafic`);
export const getTransports  = () => axios.get(`${BASE}/transports`);
export const getAir         = () => axios.get(`${BASE}/air`);
export const getMeteo       = () => axios.get(`${BASE}/meteo`);
export const getStats       = () => axios.get(`${BASE}/stats`);
export const getPredictions = (seg='A1-001') => axios.get(`${BASE}/predictions/trafic?segment_id=${seg}`);
export const getHistorique  = (seg,limit=50) => axios.get(`${BASE}/trafic/historique/${seg}?limite=${limit}`);
export const searchStops    = (q) => axios.get(`${BASE}/stops/search?q=${q}`);
export const calculateRoute = (fromId, toId) => axios.get(`${BASE}/route/calculate?from=${fromId}&to=${toId}`);
