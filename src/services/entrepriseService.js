import api from "./api";

export function getEntreprises() {
  return api.get("/entreprises");
}
