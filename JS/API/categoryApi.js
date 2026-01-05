const API_BASE = 'https://localhost:7155/api';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success: false, message: text }; }
}

export async function getCategories(activeOnly = true) {
  const res = await fetch(`${API_BASE}/categories${activeOnly ? '?isActive=true' : ''}`);
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
  return updateCategory({
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    categoryDescription: category.categoryDescription,
    isActive
  });
}
