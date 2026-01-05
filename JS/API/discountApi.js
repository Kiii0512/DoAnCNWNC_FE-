const API_URL = "https://localhost:7155/api/discounts";

function authHeaders() {
  const token = localStorage.getItem("accesstoken");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function getAllDiscounts() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      }
    });
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    return json.data ?? [];
  } catch (e) {
    console.error("discountApi.getAllDiscounts error", e);
    return [];
  }
}

export async function getDiscountById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      }
    });
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    return json.data ?? null;
  } catch (e) {
    console.error("discountApi.getDiscountById error", e);
    return null;
  }
}

export async function createDiscount(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.success ?? true;
  } catch (e) {
    console.error("discountApi.createDiscount error", e);
    throw e;
  }
}

export async function updateDiscount(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.success ?? true;
  } catch (e) {
    console.error("discountApi.updateDiscount error", e);
    throw e;
  }
}

export async function deleteDiscount(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      }
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.success ?? true;
  } catch (e) {
    console.error("discountApi.deleteDiscount error", e);
    throw e;
  }
}