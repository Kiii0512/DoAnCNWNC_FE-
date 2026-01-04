document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    try {
      const response = await fetch("https://localhost:7155/api/auth/login", {
        method: "POST",
        credentials: "include", // 🔥 BẮT BUỘC để cookie HttpOnly được lưu
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
      console.log("Login API response:", responseData);

      const data = responseData.data || responseData;

      // ✅ CHỈ LƯU THÔNG TIN PHỤC VỤ UI (KHÔNG TOKEN, KHÔNG accountId)
      localStorage.setItem(
        "username",
        data.name || data.userName || data.username || username
      );
      localStorage.setItem("role", data.role || data.roles || "user");

      console.log("localStorage after login:", {
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role")
      });

      // Thông báo cho header / app biết đã login
      window.dispatchEvent(new Event("authChanged"));

      alert("Đăng nhập thành công!");
      window.location.href = "adminEmployee.html";

    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Đăng nhập thất bại");
    }
  });
});