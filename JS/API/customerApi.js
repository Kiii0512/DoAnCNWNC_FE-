// API for customer operations
const API_BASE = "https://localhost:7155/api/customers";

// Get customer info by account ID
export async function getCustomerInfo(accountId) {
  try {
    console.log("Fetching customer info for account ID:", accountId);
    console.log("API URL:", `${API_BASE}/by-account/${accountId}`);
    
    const response = await fetch(`${API_BASE}/by-account/${accountId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      let errorMessage = "Failed to fetch customer info";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Response is not JSON
        errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log("API response data:", data);
    return data;
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

// Create new customer info (for newly registered users)
export async function createCustomerInfo(customerData) {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to create customer info";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating customer info:", error);
    throw error;
  }
}

