// ---------- DATA ----------
export let products = [];
export let cart = {};


// ---------- API ----------
export async function loadProductsFromAPI() {
  try {
    const res = await fetch("YOUR_API/products");
    const data = await res.json();
    products = data;
    return products;
  } catch (err) {
    console.error("Load API lỗi:", err);
    return [];
  }
}


// ---------- CART ----------
export function addToCart(id, qty = 1) {
  if (!cart[id]) cart[id] = 0;
  cart[id] += qty;
}

export function decreaseItem(id) {
  if (!cart[id]) return;
  cart[id]--;
  if (cart[id] <= 0) delete cart[id];
}

export function getCartList() {
  return Object.keys(cart).map(id => ({
    ...products.find(p => p.id == id),
    qty: cart[id]
  }));
}

export function getTotal() {
  return getCartList().reduce((sum, p) => sum + p.price * p.qty, 0);
}


// ---------- QUICK VIEW ----------
export function getProductById(id) {
  return products.find(p => p.id == id);
}
