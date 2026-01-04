const ORDER_API_BASE = "https://localhost:7155/api/orders";

/* ===============================
   HANDLE RESPONSE
================================ */
async function handleResponse(response) {
  if (response.status === 401) {
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  const text = await response.text();
  const result = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(result?.message || "Request failed");
  }

  // API của bạn đang trả { success, message, data }
  return result?.data ?? result;
}

/* ===============================
   CREATE ORDER
================================ */
export async function createOrder(payload) {
  const response = await fetch(ORDER_API_BASE, {
    method: "POST",
    credentials: "include", // ✅ BẮT BUỘC
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

/* ===============================
   GET MY ORDERS (JWT)
================================ */
export async function getOrdersByCustomer() {
  const response = await fetch(`${ORDER_API_BASE}/my-orders`, {
    method: "GET",
    credentials: "include", // ✅
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
}

/* ===============================
   GET ORDER BY ID
================================ */
export async function getOrderById(orderId) {
  const response = await fetch(`${ORDER_API_BASE}/${orderId}`, {
    method: "GET",
    credentials: "include", // ✅
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
}

/* ===============================
   CANCEL ORDER
================================ */
export async function cancelOrder(orderId) {
  const response = await fetch(`${ORDER_API_BASE}/${orderId}/cancel`, {
    method: "POST",
    credentials: "include", // ✅
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
}

/* ===============================
   CONFIRM ORDER
================================ */
export async function confirmOrder(orderId) {
  const response = await fetch(`${ORDER_API_BASE}/${orderId}/confirm`, {
    method: "POST",
    credentials: "include", // ✅
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
}

/* ===============================
   SHIP ORDER
================================ */
export async function shipOrder(orderId) {
  const response = await fetch(`${ORDER_API_BASE}/${orderId}/ship`, {
    method: "POST",
    credentials: "include", // ✅
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
}

/* ===============================
   REORDER
================================ */
export async function reorder(orderId) {
  const response = await fetch(`${ORDER_API_BASE}/${orderId}/reorder`, {
    method: "POST",
    credentials: "include", // ✅
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
}
