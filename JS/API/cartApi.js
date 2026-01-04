// API for cart operations
const CART_API_BASE = "https://localhost:7155/api/cart";

// AccessToken được browser tự động gửi từ HttpOnly cookie
// Không cần thêm Authorization header

// Helper function to handle response errors safely
async function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
    } else {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

// Get cart
export async function getCart() {
  try {
    const response = await fetch(`${CART_API_BASE}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (response.status === 404) {
      return null;
    }

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

// Add item to cart
export async function addToCart(variationId, quantity = 1) {
  try {
    const response = await fetch(`${CART_API_BASE}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        variationId,
        quantity,
      }),
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItem(variationId, quantity) {
  try {
    const response = await fetch(`${CART_API_BASE}/items/${variationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quantity,
      }),
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(variationId) {
  try {
    const response = await fetch(`${CART_API_BASE}/items/${variationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

// Clear all items from cart
export async function clearCart() {
  try {
    const response = await fetch(`${CART_API_BASE}/clear`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

// Sync guest cart to user cart after login
export async function syncGuestCart(guestCartItems) {
  try {
    const response = await fetch(`${CART_API_BASE}/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: guestCartItems,
      }),
    });

    const result = await handleResponse(response);
    return result?.data || result;
  } catch (error) {
    console.error("Error syncing cart:", error);
    throw error;
  }
}

// Get cart item count
export async function getCartItemCount() {
  try {
    const cart = await getCart();
    if (!cart || !cart.items) return 0;
    
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}

