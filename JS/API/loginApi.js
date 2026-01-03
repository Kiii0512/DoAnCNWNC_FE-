document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("loginForm");

  // Helper function to check if customer info exists
  async function checkCustomerInfo(accountId) {
    try {
      const response = await fetch(`https://localhost:7155/api/customers/by-account/${accountId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accesstoken")}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Check customer response status:", response.status);
      
      if (response.status === 404) {
        // Customer does not exist
        return false;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log("Check customer response data:", data);
        const customerData = data.data || data;
        // Check if customerId exists in the response
        const hasCustomerId = !!(customerData && (customerData.customerId || customerData.CustomerId || customerData.id || customerData.Id));
        console.log("Has customer ID:", hasCustomerId);
        return hasCustomerId;
      }
      return false;
    } catch (error) {
      console.error("Error checking customer info:", error);
      return false;
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // chặn reload trang

      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;

      try {
        const response = await fetch("https://localhost:7155/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: username,
            password: password
          })
        });

        if (!response.ok) {
          throw new Error("Sai tài khoản hoặc mật khẩu");
        }

        const responseData = await response.json();
        
        // Debug: log the full response
        console.log("Login API response:", responseData);
        
        // Handle nested response structure (success: true, data: {...})
        const data = responseData.data || responseData;
        
        // Handle different possible field names for the token
        const accessToken = data.accessToken || data.access_token || data.token;
        
        if (!accessToken) {
          console.error("No token found in response! Response data:", responseData);
          throw new Error("Đăng nhập thất bại: Không nhận được token từ server");
        }
        
        console.log("Using token:", accessToken.substring(0, 20) + "...");

        //  Lưu JWT - verify it's not undefined
        localStorage.setItem("accesstoken", accessToken);
        const accountId = data.accountId || data.id || data.userId || "";
        localStorage.setItem("accountId", accountId);
        localStorage.setItem("username", data.name || data.userName || data.username || username);
        localStorage.setItem("role", data.role || data.roles || "user");

        // Verify storage
        console.log("localStorage after login:", {
          accesstoken: localStorage.getItem("accesstoken"),
          accountId: localStorage.getItem("accountId"),
          username: localStorage.getItem("username"),
          role: localStorage.getItem("role")
        });

        // Dispatch auth changed event to update UI
        window.dispatchEvent(new Event("authChanged"));

        // Check if customer info exists
        const hasCustomerInfo = await checkCustomerInfo(accountId);
        
        if (hasCustomerInfo) {
          // Customer info exists, go to home page
          alert("Đăng nhập thành công!");
          window.location.href = "homePage.html";
        } else {
          // No customer info, redirect to userInfoPage to fill in information
          localStorage.setItem("justRegistered", "true");
          // Store the phone for pre-fill on userInfo page
          localStorage.setItem("pendingPhone", username);
          alert("Đăng nhập thành công! Vui lòng hoàn thiện thông tin cá nhân.");
          window.location.href = "userInfoPage.html";
        }

      } catch (error) {
        console.error("Login error:", error);
        alert(error.message);
      }
    });
  }
});

