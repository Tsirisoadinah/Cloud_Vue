import api from "./api";

/**
 * Récupérer les utilisateurs bloqués
 */
export async function getBlockedUsers() {
  const res = await api.get("/admin/users/blocked");
  return res.data.data; //  retourne directement le tableau
}

/**
 * Débloquer un utilisateur
 */
export function unblockUser(userId) {
  return api.post(`/admin/users/${userId}/unblock`);
}

export function getAllUsers() {
  return api.get("/admin/users");
}

export function getUsers() {
  return api.get("/admin/users");
}

export function updateUser(userId, data) {
  return api.put(`/admin/users/${userId}`, data);
}