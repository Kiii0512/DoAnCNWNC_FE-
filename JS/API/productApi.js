import { apiFetch, apiFetchData } from "./http.js";

/* =========================
   PRODUCTS
========================= */

// GET ALL
export async function getProducts() {
  return apiFetchData("/products");
}

// GET BY ID
export async function getProductById(id) {
  return apiFetchData(`/products/${encodeURIComponent(id)}`);
}

// SEARCH (DTO: ProductSearchRequest)
export async function searchProducts({
  CategoryIds = [],
  BrandIds = [],
  Keyword = "",
  Status = "all", // all | active | inactive
}) {
  const params = new URLSearchParams();

  CategoryIds.forEach((id) => params.append("CategoryIds", id));
  BrandIds.forEach((id) => params.append("BrandIds", id));

  if (Keyword) params.append("Keyword", Keyword);
  if (Status && Status !== "all") params.append("Status", Status);

  const path = `/products/search?${params.toString()}`;
  console.log("🔍 SEARCH PRODUCTS:", path);

  return apiFetchData(path);
}

// CREATE
export async function createProduct(payload) {
  return apiFetchData("/products", {
    method: "POST",
    body: payload,
  });
}

// UPDATE
export async function updateProductFull(payload) {
  if (!payload.productId) throw new Error("Missing productId");

  // giữ behavior: bạn đang return full json ở hàm này
  return apiFetch(`/products/${encodeURIComponent(payload.productId)}`, {
    method: "PUT",
    body: payload,
  });
}

// DELETE
export async function deleteProduct(id) {
  await apiFetch(`/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
