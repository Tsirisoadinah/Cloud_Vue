import api from "./api";

export async function getSignalements() {
  const res = await api.get("/signalements");
  return res.data.data; // tableau backend
}

export function assignEntreprise(id, data) {
  return api.put(`/signalements/${id}/assign`, data);
}

export function updateSignalementStatus(id, data) {
  return api.put(`/admin/route-status/change/${id}`, data);
}

export function getHistoriqueStatus(id, params = {}) {
  return api.get(`signalements/${id}/historique-status`, { params });
}

export async function getRouteProblemeDashboard() {
  const res = await api.get('/api/data/routeprobleme/dashboard');
  return res.data.data;
}
