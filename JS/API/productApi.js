const API_URL = "https://localhost:7155/api/products";

export let products = [];

const DEFAULT_IMAGE = "/assets/images/no-image.jpg";

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
      img: DEFAULT_IMAGE,
      stock: p.stockQuantity ?? 0,
      category: p.categoryName ?? "",
      brand: p.brandName ?? "",
      description: p.productDescription ?? ""  // ✅ thêm description
    }));

  } catch (e) {
    console.error("API ERROR:", e);
    products = [];
  }
}


export function getProductById(id) {
  return products.find(p => p.id == id);
}
