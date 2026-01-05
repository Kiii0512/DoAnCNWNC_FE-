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
        credentials: "include", 
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
      window.location.href = "homePage.html";

    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Đăng nhập thất bại");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  function normalizeRole(role) {
    const r = String(role || "").trim().toLowerCase();
    if (r === "admin") return "Admin";
    if (r === "staff" || r === "employee") return "Staff";
    if (r === "customer" || r === "user") return "Customer";
    return "";
  }

  function redirectByRole(role) {
    const r = normalizeRole(role);

    // Bạn có thể đổi các trang đích theo ý bạn ở đây
    const map = {
      Admin: "adminEmployee.html",
      Staff: "adminDashboard.html",
      Customer: "userInfoPage.html"
    };

    const target = map[r] || "adminDashboard.html";
    window.location.href = target;
  }

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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: username, password })
      });

      if (!response.ok) throw new Error("Sai tài khoản hoặc mật khẩu");

      const responseData = await response.json();
      const data = responseData?.data || responseData;

      const role = normalizeRole(data?.role);

      // UI info
      localStorage.setItem(
        "username",
        data?.name || data?.userName || data?.username || username
      );
      localStorage.setItem("role", role || "Customer"); // fallback

      window.dispatchEvent(new Event("authChanged"));

      alert("Đăng nhập thành công!");
      redirectByRole(role);

    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Đăng nhập thất bại");
    }
  });
});
