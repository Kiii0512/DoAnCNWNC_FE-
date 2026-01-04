// API for order operations
const ORDER_API_BASE = "https://localhost:7155/api/orders";

// AccessToken được browser tự động gửi từ HttpOnly cookie
// Không cần thêm Authorization header

// Create order
export async function createOrder(request) {
  try {
    const response = await fetch(`${ORDER_API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

// Get all orders (staff)
export async function getAllOrders() {
  try {
    const response = await fetch(`${ORDER_API_BASE}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

// Get order by ID
export async function getOrderById(id) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

// Update order
export async function updateOrder(id, request) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to update order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

// Delete order (soft)
export async function deleteOrder(id) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

// Confirm order
export async function confirmOrder(id) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ Id: id }),
    });

    if (!response.ok) {
      throw new Error("Failed to confirm order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
}

// Ship order
export async function shipOrder(id) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/ship`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ Id: id }),
    });

    if (!response.ok) {
      throw new Error("Failed to ship order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error shipping order:", error);
    throw error;
  }
}

// Cancel order
export async function cancelOrder(id) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ Id: id }),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
}

// Get orders by customer - use accountId from cookie
export async function getOrdersByCustomer(accountId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/customer/${accountId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

// Get order details by order ID
export async function getOrderDetails(orderId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${orderId}/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

// Reorder - add items from old order to cart
export async function reorder(orderId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${orderId}/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to reorder");
    }

    return await response.json();
  } catch (error) {
    console.error("Error reordering:", error);
    throw error;
  }
}

