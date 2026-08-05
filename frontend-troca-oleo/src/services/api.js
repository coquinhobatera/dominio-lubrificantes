import axios from 'axios';

// 1. API Principal do Sistema (Spring Boot / Backend)
export const api = axios.create({
  baseURL: 'https://dominio-lubrificantes-production.up.railway.app/api', 
  // Nota: Se as suas rotas no Java começarem com /api (ex: /api/clientes), 
  // altere para: 'https://dominio-lubrificantes-production.up.railway.app/api'
});

// 2. API do WhatsApp
export const whatsappApi = axios.create({
  baseURL: 'https://easygoing-warmth-production.up.railway.app/api',
});