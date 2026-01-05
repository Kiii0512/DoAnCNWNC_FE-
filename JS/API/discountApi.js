import { apiFetch, apiFetchData } from "./http.js";

export async function getAllDiscounts() {
  try {
    const data = await apiFetchData("/discounts");
    return data ?? [];
  } catch (e) {
    console.error("discountApi.getAllDiscounts error", e);
    return [];
  }
}

export async function getDiscountById(id) {
  try {
    const data = await apiFetchData(`/discounts/${encodeURIComponent(id)}`);
    return data ?? null;
  } catch (e) {
    console.error("discountApi.getDiscountById error", e);
    return null;
  }
}

export async function createDiscount(payload) {
  try {
    const json = await apiFetch("/discounts", {
      method: "POST",
      body: payload,
    });
    return json?.success ?? true;
  } catch (e) {
    console.error("discountApi.createDiscount error", e);
    throw e;
  }
}

export async function updateDiscount(payload) {
  try {
    const json = await apiFetch("/discounts", {
      method: "PUT",
      body: payload,
    });
    return json?.success ?? true;
  } catch (e) {
    console.error("discountApi.updateDiscount error", e);
    throw e;
  }
}

export async function deleteDiscount(id) {
  try {
    const json = await apiFetch(`/discounts/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return json?.success ?? true;
  } catch (e) {
    console.error("discountApi.deleteDiscount error", e);
    throw e;
  }
}