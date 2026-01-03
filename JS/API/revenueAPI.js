const BASE_URL = 'https://localhost:7155';

function getToken() {
  return localStorage.getItem('accessToken') || '';
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = data?.message || data?.Message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function pickTotal(res) {
  const root = res?.data ?? res?.Data ?? res;
  const total = root?.total ?? root?.Total;
  return Number(total ?? 0);
}

export async function getRevenueByDay(dayISO) {
  const res = await request(`/api/revenue/day?day=${encodeURIComponent(dayISO)}`);
  return pickTotal(res);
}

export async function getRevenueByMonth(year, month) {
  const res = await request(`/api/revenue/month?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`);
  return pickTotal(res);
}
