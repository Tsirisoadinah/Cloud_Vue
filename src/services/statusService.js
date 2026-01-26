import api from "./api";

export async function getStatus() {
  const res = await api.get("/admin/route-status");
  return res.data.data; 
}