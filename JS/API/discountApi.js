import { apiFetch, apiFetchData } from "./http.js";

/* =========================
   GET ALL
========================= */
export async function getAllDiscounts() {
  try {
    const data = await apiFetchData("/discounts");
    return data ?? [];
  } catch (e) {
    console.error("discountApi.getAllDiscounts error", e);
    return [];
  }
}

/* =========================
   GET BY ID
========================= */
export async function getDiscountById(id) {
  try {
    const data = await apiFetchData(`/discounts/${encodeURIComponent(id)}`);
    return data ?? null;
  } catch (e) {
    console.error("discountApi.getDiscountById error", e);
    return null;
  }
}

export async function findDiscountsByName(name) {
  try {
    if (!name || !name.trim()) return [];

    const data = await apiFetchData(
      `/discounts/name?name=${encodeURIComponent(name)}`
    );

    return data ?? [];
  } catch (e) {
    console.error("discountApi.findDiscountsByName error", e);
    return [];
  }
}

/* =========================
   CREATE
========================= */
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

/* =========================
   UPDATE
========================= */
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

/* =========================
   DELETE
========================= */
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
