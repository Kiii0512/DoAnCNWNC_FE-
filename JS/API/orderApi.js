// API for order operations
const ORDER_API_BASE = "https://localhost:7155/api/orders";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
  };
}

// Create order
export async function createOrder(request) {
  try {
    const response = await fetch(`${ORDER_API_BASE}`, {
      method: "POST",
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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

