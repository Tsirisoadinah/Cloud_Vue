import api from "./api";

function unwrapApiResponse(resData) {
  if (typeof resData === 'string') {
    try {
      return JSON.parse(resData)
    } catch {
      return null
    }
  }
  return resData
}

export async function getSignalements() {
  const res = await api.get("/signalements");
  const payload = unwrapApiResponse(res.data)
  return payload?.data || []
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
  // Must use this endpoint (permitAll) for dashboard stats
  const res = await api.get('/api/data/routeprobleme/dashboard');
  const payload = unwrapApiResponse(res.data)
  return payload?.data || null
}

export function getPhotosBySignalement(id) {
  return api.get(`/signalements/${id}/photos`);
}
