import api from "./api";

export function updatePrixForfaitaire(montant) {
  // Backend expects @RequestParam double montant
  return api.post("/api/data/prixforfaitaire", null, {
    params: { montant },
  });
}
