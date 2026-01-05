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

// SEARCH (DTO: ProductSearchRequest)
export async function searchProducts({
  CategoryIds = [],
  BrandIds = [],
  Keyword = '',
  Status = 'all' // all | active | inactive
}) {
  const params = new URLSearchParams();

  CategoryIds.forEach(id => params.append('CategoryIds', id));
  BrandIds.forEach(id => params.append('BrandIds', id));

  if (Keyword) params.append('Keyword', Keyword);
  if (Status && Status !== 'all') params.append('Status', Status);

  const url = `${API_BASE}/products/search?${params.toString()}`;
  console.log('🔍 SEARCH PRODUCTS:', url);

  const res = await fetch(url);
  if (!res.ok) throw new Error('Search products failed');

  return (await res.json()).data;
}

// CREATE 
export async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Create product failed');
  return (await res.json()).data;
}

// UPDATE 
export async function updateProductFull(payload) {
  if (!payload.productId) {
    throw new Error('Missing productId');
  }

  const res = await fetch(
    `${API_BASE}/products/${payload.productId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Update product failed');
  }

  return await res.json();
}


// DELETE
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) throw new Error('Delete product failed');
}
