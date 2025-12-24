const API_URL = "https://localhost:7155/api/products";

export let products = [];

const DEFAULT_IMAGE = "/assets/images/no-image.jpg";

/**
 * LOAD THEO CATEGORY (TRANG CATEGORY)
 */
export async function loadProductsFromAPI(categoryId) {
  if (!categoryId) {
    products = [];
    return;
  }

  try {
    const url = `${API_URL}/category/${categoryId}`;
    console.log("CALL API:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const data = json.data ?? [];

    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: p.imageUrl || DEFAULT_IMAGE,   // 🔥 ưu tiên ảnh từ BE
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""
    }));

  } catch (e) {
    console.error("API ERROR:", e);
    products = [];
  }
}

/**
 * LOAD THEO BRAND (HOMEPAGE)
 */
export async function loadProductsByBrand(brandId) {
  if (!brandId) {
    products = [];
    return;
  }

  try {
    const url = `${API_URL}/brand/${brandId}`;
    console.log("CALL API:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const data = json.data ?? [];

    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: p.imageUrl || DEFAULT_IMAGE,
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""
    }));

  } catch (e) {
    console.error("API ERROR:", e);
    products = [];
  }
}

/**
 * DÙNG CHO QUICK VIEW / CART
 */
export function getProductById(id) {
  return products.find(p => p.id == id);
}
