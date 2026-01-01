// API for customer operations
const API_BASE = "https://localhost:7155/api/customer";

// Get customer info by account ID
export async function getCustomerInfo(accountId) {
  try {
    const response = await fetch(`${API_BASE}/account/${accountId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer info");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching customer info:", error);
    throw error;
  }
}

// Update customer info
export async function updateCustomerInfo(customerData) {
  try {
    const response = await fetch(API_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error("Failed to update customer info");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating customer info:", error);
    throw error;
  }
}

// Change password
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_BASE}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change password");
    }

    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

