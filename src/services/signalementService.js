import api from "./api";

export async function getSignalements() {
  const res = await api.get("/signalements");
  return res.data.data; // tableau backend
}
