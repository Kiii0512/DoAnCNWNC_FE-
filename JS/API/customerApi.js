// ================================
// CUSTOMER API (COOKIE-BASED AUTH)
// ================================

const API_BASE = "https://localhost:7155/api/customers";

/**
 * ⚠️ QUAN TRỌNG
 * - AccessToken nằm trong HttpOnly cookie
 * - JS KHÔNG đọc được token
 * - PHẢI dùng credentials: "include"
 */

/* ================= GET CUSTOMER INFO ================= */
/**
 * Backend đã biết accountId từ token
 * => FE KHÔNG truyền accountId nữa
 */
export async function getCustomerInfo() {
  try {
    const response = await fetch(`${API_BASE}/by-account`, {
      method: "GET",
      credentials: "include", // 🔥 BẮT BUỘC
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
      }
      if (response.status === 404) {
        return null; // chưa có customer
      }
      const text = await response.text();
      throw new Error(text || "Không lấy được thông tin khách hàng");
    }

    return await response.json();
  } catch (error) {
    console.error("getCustomerInfo error:", error);
    throw error;
  }
}

/* ================= UPDATE CUSTOMER INFO ================= */
export async function updateCustomerInfo(customerData) {
  try {
    const response = await fetch(API_BASE, {
      method: "PUT",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Cập nhật thông tin thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("updateCustomerInfo error:", error);
    throw error;
  }
}

/* ================= CHANGE PASSWORD ================= */
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_BASE}/change-password`, {
      method: "POST",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || "Đổi mật khẩu thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("changePassword error:", error);
    throw error;
  }
}

/* ================= CREATE CUSTOMER INFO ================= */
export async function createCustomerInfo(customerData) {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      credentials: "include", // 🔥
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Tạo thông tin khách hàng thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("createCustomerInfo error:", error);
    throw error;
  }
}
