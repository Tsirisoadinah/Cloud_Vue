import api from "./api";

export function getPrix() {
  return api.get('/api/data/prixforfaitaire');
}