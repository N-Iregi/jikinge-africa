// src/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken   = ()      => localStorage.getItem("jikinge_token");
export const setToken   = (token) => localStorage.setItem("jikinge_token", token);
export const clearToken = ()      => localStorage.removeItem("jikinge_token");

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  auth: {
    register:  (b) => request("POST", "/auth/register", b),
    login:     (b) => request("POST", "/auth/login", b),
    verifyMfa: (b) => request("POST", "/auth/verify-mfa", b),
    me:        ()  => request("GET",  "/auth/me"),
  },
  modules: {
    list:       ()      => request("GET",    "/modules"),
    get:        (id)    => request("GET",    `/modules/${id}`),
    create:     (b)     => request("POST",   "/modules", b),
    update:     (id, b) => request("PUT",    `/modules/${id}`, b),
    deactivate: (id)    => request("DELETE", `/modules/${id}`),
  },
  progress: {
    get:  ()           => request("GET",  "/progress"),
    save: (moduleId, b) => request("POST", `/progress/${moduleId}`, b),
  },
  incidents: {
    list:         ()          => request("GET",    "/incidents"),
    stats:        ()          => request("GET",    "/incidents/stats"),
    report:       (b)         => request("POST",   "/incidents", b),
    updateStatus: (id, status) => request("PATCH",  `/incidents/${id}/status`, { status }),
    delete:       (id)        => request("DELETE", `/incidents/${id}`),
  },
  admin: {
    users:     ()         => request("GET",   "/admin/users"),
    analytics: ()         => request("GET",   "/admin/analytics"),
    auditLog:  ()         => request("GET",   "/admin/audit-log"),
    setRole:   (id, role) => request("PATCH", `/admin/users/${id}/role`, { role }),
  },
};
