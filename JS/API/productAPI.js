const API_BASE = 'https://localhost:7155/api';

/* =========================
   PRODUCTS
========================= */

// GET ALL
export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Load products failed');
  return (await res.json()).data;
}

// GET BY ID
export async function getProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Load product failed');
  return (await res.json()).data;
}

// CREATE (FULL)
// CREATE FULL PRODUCT (JSON + IMAGES)
export async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Create product failed');
  return (await res.json()).data;
}

// UPDATE (FULL – đúng JSON bạn gửi)
export async function updateProduct(productId, payload) {
  const res = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Update product failed');
  return await res.json();
}

// DELETE
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) throw new Error('Delete product failed');
}

//upload image
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/products/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error('Upload image failed');
  }

  // ⚠️ backend PHẢI trả JSON
  const json = await res.json();
  return json.imageUrl;
}