import { apiFetchData } from "./http.js";

export async function getOrders() {
  return apiFetchData("/orders");
}

export async function getOrderById(orderId) {
  return apiFetchData(`/orders/${encodeURIComponent(orderId)}`);
}

export async function deleteOrder(orderId) {
  return apiFetchData(`/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
}

export async function confirmOrder(orderId) {
  return apiFetchData("/orders/confirm", { method: "POST", body: { id: orderId } });
}

export async function shipOrder(orderId) {
  return apiFetchData("/orders/ship", { method: "POST", body: { id: orderId } });
}

export async function cancelOrder(orderId) {
  return apiFetchData("/orders/cancel", { method: "POST", body: { id: orderId } });
}