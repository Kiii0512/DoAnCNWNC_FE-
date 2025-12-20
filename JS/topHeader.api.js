document.addEventListener("DOMContentLoaded", () => {

  // ===== SEARCH API =====
  document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const keyword = document.getElementById("q").value.trim();
    if (!keyword) return alert("Nhập từ khóa!");

    try {
      const res = await fetch(`https://api.example.com/search?q=${keyword}`);
      const data = await res.json();

      console.log("Kết quả tìm:", data);

      // chuyển trang
      window.location.href = `/search.html?q=${keyword}`;
    } catch {
      alert("Không thể kết nối API tìm kiếm");
    }
  });

  // ===== LOGIN =====
  document.getElementById("loginBtn")?.addEventListener("click", () => {
    window.location.href = "/login.html";
  });

  // ===== REGISTER =====
  document.getElementById("registerBtn")?.addEventListener("click", () => {
    window.location.href = "/register.html";
  });

  // ===== LOGOUT =====
  document.getElementById("logoutMenu")?.addEventListener("click", async () => {
    try {
      await fetch("https://api.example.com/logout", { method: "POST" });
      alert("Đã đăng xuất!");
      location.reload();
    } catch {
      alert("Lỗi đăng xuất API!");
    }
  });
});
