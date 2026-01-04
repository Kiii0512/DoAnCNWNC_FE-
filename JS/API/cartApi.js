

const CART_API_BASE = "https://localhost:7155/api/cart";

async function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi ${response.status}`);
    }

    throw new Error(`Lỗi ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function getCart() {
  try {
    const response = await fetch(CART_API_BASE, {
      method: "GET",
      credentials: "include", // 🔥 BẮT BUỘC
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) return null;

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("getCart error:", error);
    throw error;
  }
}

export async function addToCart(variationId, quantity = 1) {
  try {
    const response = await fetch(`${CART_API_BASE}/items`, {
      method: "POST",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ variationId, quantity })
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("addToCart error:", error);
    throw error;
  }
}

export async function updateCartItem(variationId, quantity) {
  try {
    const response = await fetch(`${CART_API_BASE}/items/${variationId}`, {
      method: "PUT",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quantity })
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("updateCartItem error:", error);
    throw error;
  }
}

export async function removeFromCart(variationId) {
  try {
    const response = await fetch(`${CART_API_BASE}/items/${variationId}`, {
      method: "DELETE",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("removeFromCart error:", error);
    throw error;
  }
}

export async function clearCart() {
  try {
    const response = await fetch(`${CART_API_BASE}/clear`, {
      method: "DELETE",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("clearCart error:", error);
    throw error;
  }
}

export async function syncGuestCart(guestCartItems) {
  try {
    const response = await fetch(`${CART_API_BASE}/sync`, {
      method: "POST",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items: guestCartItems })
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("syncGuestCart error:", error);
    throw error;
  }
}

export async function getCartItemCount() {
  try {
    const cart = await getCart();
    if (!cart?.items) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("getCartItemCount error:", error);
    return 0;
  }
}
