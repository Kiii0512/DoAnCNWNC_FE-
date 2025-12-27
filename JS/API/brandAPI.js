const API_BASE = 'https://localhost:7155/api';

export async function getBrands() {
  const res = await fetch(`${API_BASE}/brands`);
  if (!res.ok) throw new Error('Load brands failed');
  return (await res.json()).data;
}

export async function createBrand(payload) {
  const res = await fetch(`${API_BASE}/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Create brand failed');
}
