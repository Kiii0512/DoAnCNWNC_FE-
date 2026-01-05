const API_BASE = 'https://localhost:7155/api';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success: false, message: text }; }
}

export async function getBrands(activeOnly = true) {
  const res = await fetch(`${API_BASE}/brands${activeOnly ? '?isActive=true' : ''}`);
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Load brands failed');
  return json.data ?? [];
}
