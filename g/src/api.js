import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const getTrafic      = () => axios.get(`${BASE}/trafic`);
export const getTransports  = () => axios.get(`${BASE}/transports`);
export const getAir         = () => axios.get(`${BASE}/air`);
export const getMeteo       = () => axios.get(`${BASE}/meteo`);
export const getStats       = () => axios.get(`${BASE}/stats`);
export const getPredictions = (segment_id = 'A1-001') =>
  axios.get(`${BASE}/predictions/trafic?segment_id=${segment_id}`);
