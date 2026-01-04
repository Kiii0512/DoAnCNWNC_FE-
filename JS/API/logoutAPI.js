// API for logout operations
const LOGOUT_API_BASE = "https://localhost:7155/api/auth/logout";

// AccessToken được browser tự động gửi từ HttpOnly cookie

// Logout - Backend sẽ xóa cookie HttpOnly
export async function logout() {
  try {
    const response = await fetch(`${LOGOUT_API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

// Helper function to get accountId from cookie
function getAccountId() {
  const name = "account_id=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Clear localStorage non-sensitive data (keep sensitive data in HttpOnly cookie)
export async function clearLocalStorageAuth() {
  // Xóa các thông tin đã lưu trong localStorage (trừ accesstoken và accountId vì chúng ở cookie)
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("customerId");
  localStorage.removeItem("justRegistered");
  localStorage.removeItem("pendingPhone");
  localStorage.removeItem("checkoutData");
  localStorage.removeItem("checkoutItems");
  localStorage.removeItem("recentSearches");
}

// Full logout process
export async function doLogout() {
  try {
    // Gọi API logout để backend xóa cookie
    await logout();
  } catch (error) {
    console.error("API logout error:", error);
    // Vẫn tiếp tục xóa localStorage ngay cả khi API thất bại
  }
  
  // Xóa localStorage
  clearLocalStorageAuth();
  
  // Dispatch auth changed event
  window.dispatchEvent(new Event("authChanged"));
  
  // Redirect to home
  window.location.href = "homePage.html";
}

