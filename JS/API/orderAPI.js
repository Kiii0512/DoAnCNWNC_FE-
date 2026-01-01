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

export async function getOrders() {
  const res = await request('/api/orders');
  return res?.data ?? res?.Data ?? res;
}

export async function deleteOrder(orderId) {
  return request(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
}

export async function confirmOrder(orderId) {
  return request('/api/orders/confirm', { method: 'POST', body: { id: orderId } });
}

export async function shipOrder(orderId) {
  return request('/api/orders/ship', { method: 'POST', body: { id: orderId } });
}

export async function cancelOrder(orderId) {
  return request('/api/orders/cancel', { method: 'POST', body: { id: orderId } });
}
export async function getOrderById(orderId) {
  const res = await request(`/api/orders/${encodeURIComponent(orderId)}`);
  return res?.data ?? res?.Data ?? res;
}
