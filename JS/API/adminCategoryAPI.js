import { apiFetch, apiFetchData } from "./http.js";

export async function getCategories() {
  const data = await apiFetchData("/categories");
  return data ?? [];
}

export async function createCategory(payload) {
  return apiFetch("/categories", {
    method: "POST",
    body: payload,
  });
}

export async function updateCategory(payload) {
  return apiFetch("/categories", {
    method: "PUT",
    body: payload,
  });
}

export async function setCategoryActive(category, isActive) {
  return apiFetch("/categories/status", {
    method: "PATCH",
    body: {
      categoryId: category.categoryId,
      isActive: isActive,
    },
  });
}