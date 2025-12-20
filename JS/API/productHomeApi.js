const API_URL = "https://localhost:7155/api/products";

export let products = [];
let cart = [];

// Ảnh mặc định khi chưa có imageUrl
const DEFAULT_IMAGE = "assets/images/no-image.jpg";

/* =============================
   LOAD PRODUCTS
============================= */
export async function loadProductsFromAPI() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }

    const json = await res.json();

    // Trường hợp API trả mảng trực tiếp
    const data = json.data ?? json;

    products = data.map(p => ({
      id: p.productId,
      title: p.productName,
      price: Number(p.productPrice),
      old: Math.round(Number(p.productPrice) * 1.2),
      img: DEFAULT_IMAGE,
      stock: p.stockQuantity ?? 0,
      description: p.productDescription ?? "",
      category: p.categoryName ?? "",
      brand: p.brandName ?? ""
    }));

  } catch (err) {
    console.error("❌ Load product API error:", err);
    products = [];
  }
}

/* =============================
   PRODUCT
============================= */
export function getProductById(id) {
  return products.find(p => p.id == id);
}

/* =============================
   CART
============================= */
export function addToCart(id, qty = 1) {
  const product = getProductById(id);
  if (!product) return;

  const item = cart.find(i => i.id === id);

  if (item) {
    item.qty += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      img: product.img,
      qty
    });
  }
}

export function decreaseItem(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty--;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
}

export function getCartList() {
  return cart;
}

export function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}
