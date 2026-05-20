const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options);
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
    return request(`/calendar${qs ? "?" + qs : ""}`);
  },

  getRates: () => request("/rates/"),

  calcSalary: (body) =>
    request("/calculator/salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
