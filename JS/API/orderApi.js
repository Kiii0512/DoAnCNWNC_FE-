// API for order operations
const ORDER_API_BASE = "https://localhost:7155/api/order";

// Get orders by customer account ID
export async function getOrdersByCustomer(accountId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/customer/${accountId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
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

// Get single order by ID
export async function getOrderById(orderId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
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

// Cancel order
export async function cancelOrder(orderId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      },
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

// Reorder
export async function reorder(orderId) {
  try {
    const response = await fetch(`${ORDER_API_BASE}/${orderId}/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
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

