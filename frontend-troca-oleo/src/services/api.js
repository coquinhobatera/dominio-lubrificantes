import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Altere a porta/URL conforme seu servidor backend
});