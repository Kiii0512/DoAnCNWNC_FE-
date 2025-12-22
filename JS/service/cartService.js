import { getProductById } from "../API/productApi.js";

let cart = [];

export function addToCart(id, qty = 1) {
  const product = getProductById(id);
  if (!product) return;

  const item = cart.find(i => i.id === id);
  if (item) item.qty += qty;
  else cart.push({ ...product, qty });
}

export function decreaseItem(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty--;
  if (item.qty <= 0)
    cart = cart.filter(i => i.id !== id);
}

export function getCartList() {
  return cart;
}

export function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}
