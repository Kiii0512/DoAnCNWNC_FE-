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

      const data = await response.json();

      // 👉 Lưu JWT
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      alert("Đăng nhập thành công!");

      // 👉 Điều hướng
      window.location.href = "index.html";

    } catch (error) {
      alert(error.message);
    }
  });
});
