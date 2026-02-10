import api from "./api";

export function getPrixForfaitaire() {
  return api.get("/api/data/prixforfaitaire");
}

export function updatePrixForfaitaire(montant) {
  // Backend expects @RequestParam double montant
  return api.post("/api/data/prixforfaitaire", null, {
    params: { montant },
  });
}
