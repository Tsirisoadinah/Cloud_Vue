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
