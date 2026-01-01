document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

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
      localStorage.setItem("username", data.name || data.userName || data.username || username);
      localStorage.setItem("role", data.role || data.roles || "user");

      // Verify storage
      console.log("localStorage after login:", {
        accesstoken: localStorage.getItem("accesstoken"),
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role")
      });

      alert("Đăng nhập thành công!");
      window.dispatchEvent(new Event("authChanged"));
      // Điều hướng
      window.location.href = "homePage.html";

    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  });
});

