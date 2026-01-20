import api from "./api";

/**
 * Récupérer les utilisateurs bloqués
 */
export function getBlockedUsers() {
  return api.get("/admin/users/blocked");
}

/**
 * Débloquer un utilisateur
 */
export function unblockUser(userId) {
  return api.post(`/admin/users/${userId}/unblock`);
}
