const API_BASE = 'https://localhost:7155/api';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success: false, message: text }; }
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Load categories failed');
  return json.data ?? [];
}

export async function createCategory(payload) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Create category failed');
  return json;
}

export async function updateCategory(payload) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Update category failed');
  return json;
}

export async function setCategoryActive(category, isActive) {
  const res = await fetch(`${API_BASE}/categories/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: category.categoryId,
      isActive: isActive
    })
  });

  const json = await readJson(res);
  if (!res.ok) throw new Error(json?.message || 'Update category status failed');
  return json;
}

