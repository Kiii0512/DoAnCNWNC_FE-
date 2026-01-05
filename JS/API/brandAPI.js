const API_BASE = 'https://localhost:7155/api';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success: false, message: text }; }
}

export async function getBrands() {
  const res = await fetch(`${API_BASE}/brands`);
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Load brands failed');
  return json.data ?? [];
}

export async function createBrand(payload) {
  const res = await fetch(`${API_BASE}/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Create brand failed');
  return json;
}

export async function updateBrand(payload) {
  const res = await fetch(`${API_BASE}/brands`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Update brand failed');
  return json;
}

// Soft delete = set isActive false (khuyến nghị dùng update thay vì DELETE)
export async function setBrandActive(brand, isActive) {
  return updateBrand({
    brandId: brand.brandId,
    brandName: brand.brandName,
    brandDescription: brand.brandDescription,
    isActive
  });
}
