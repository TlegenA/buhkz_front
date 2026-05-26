const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const url = BASE + "/api" + path;
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getDeadlines: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/calendar/${qs ? "?" + qs : ""}`);
  },

  getRates: () => request("/rates/"),

  calcSalary: (body) =>
    request("/calculator/salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  calcReverse: (body) =>
    request("/calculator/reverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  calcVacation: (body) =>
    request("/calculator/vacation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  calcSickLeave: (body) =>
    request("/calculator/sick-leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  calcIp: (body) =>
    request("/calculator/ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  getAllRates: () => request("/rates/all"),
};
