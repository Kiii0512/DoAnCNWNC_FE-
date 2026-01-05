document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  /* =========================
     HELPER FUNCTIONS
  ========================= */

  // Chuẩn hóa role từ backend
  function normalizeRole(role) {
    const r = String(role || "").trim().toLowerCase();
    if (r === "admin") return "Admin";
    if (r === "staff" || r === "employee") return "Staff";
    if (r === "customer" || r === "user") return "Customer";
    return "Customer"; // fallback an toàn
  }

  // Điều hướng theo role
  function redirectByRole(role) {
    const map = {
      Admin: "adminEmployee.html",
      Staff: "adminDashboard.html",
      Customer: "homePage.html"
    };

    const target = map[role] || "homePage.html";
    window.location.href = target;
  }

  /* =========================
     SUBMIT LOGIN
  ========================= */

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    try {
      const response = await fetch("https://localhost:7155/api/auth/login", {
        method: "POST",
        credentials: "include", // dùng HttpOnly Cookie
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
      const data = responseData?.data || responseData;

      const role = normalizeRole(data?.role);

      // ✅ Chỉ lưu thông tin phục vụ UI
      localStorage.setItem(
        "username",
        data?.name || data?.userName || data?.username || username
      );
      localStorage.setItem("role", role);

      console.log("Login success:", {
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role")
      });

      // Thông báo cho header / app biết đã login
      window.dispatchEvent(new Event("authChanged"));

      alert("Đăng nhập thành công!");
      redirectByRole(role);

    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Đăng nhập thất bại");
    }
  });
});
