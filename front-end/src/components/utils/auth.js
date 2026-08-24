// utils/auth.js
export function authHeaders() {
  const token = localStorage.getItem("cookeye_token");

  if (!token) return {};

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}