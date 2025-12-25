const API_BASE = 'https://localhost:7155/api';

/* =========================
   PRODUCTS
========================= */
export async function getProducts(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products${q ? '?' + q : ''}`);
  if (!res.ok) throw new Error('Load products failed');
  return (await res.json()).data;
}

export async function getProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Load product failed');
  return (await res.json()).data;
}

export async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Create product failed');
  return (await res.json()).data; // { productId }
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Delete product failed');
}

/* =========================
   VARIATIONS
========================= */
export async function createVariation(payload) {
  const { productId, ...body } = payload;

  const res = await fetch(
    `${API_BASE}/products/${productId}/variations`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) throw new Error('Create variation failed');
}

/* =========================
   SPECIFICATIONS
========================= */
export async function createSpecifications(payload) {
  const { productId, specifications } = payload;

  const res = await fetch(
    `${API_BASE}/products/${productId}/specifications`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specifications })
    }
  );

  if (!res.ok) throw new Error('Create specifications failed');
}

/* =========================
   IMAGES
========================= */
export async function createImages(payload) {
  const { productId, images } = payload;

  const res = await fetch(
    `${API_BASE}/products/${productId}/images`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images })
    }
  );

  if (!res.ok) throw new Error('Create images failed');
}
