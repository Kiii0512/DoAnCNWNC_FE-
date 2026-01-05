import { apiFetch, apiFetchData } from "./http.js";

export async function getBrands() {
  const data = await apiFetchData("/brands");
  return data ?? [];
}

export async function createBrand(payload) {
  // giữ behavior: trả về full json (không chỉ data)
  return apiFetch("/brands", {
    method: "POST",
    body: payload,
  });
}

export async function updateBrand(payload) {
  // giữ behavior: trả về full json
  return apiFetch("/brands", {
    method: "PUT",
    body: payload,
  });
}

// Soft delete = set isActive false (khuyến nghị dùng update thay vì DELETE)
export async function setBrandActive(brand, isActive) {
  return updateBrand({
    brandId: brand.brandId,
    brandName: brand.brandName,
    brandDescription: brand.brandDescription,
    isActive,
  });
}