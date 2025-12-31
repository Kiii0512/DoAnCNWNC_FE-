import { callLogoutAPI } from "../JS/API/logoutAPI.js";

class TopHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="topbar">
        <div class="topbar-inner container"
             style="display:flex; justify-content:center; align-items:center;">
          <div style="display:flex; align-items:center; gap:5px;">
            <div>Giao hàng nhanh — Support: 1900 1009</div>
            <button class="login" id="loginBtn">Đăng nhập</button>
            <button class="login" id="registerBtn">Đăng ký</button>
          </div>
        </div>
      </div>

      <header>
        <div class="container head-main">
          <a href="homePage.html" class="logo">
            <div class="mark">💳</div>
            <div class="logo-text">Electronic Store</div>
          </a>

          <div class="search">
            <input id="q" placeholder="Tìm điện thoại, laptop, linh kiện..." />
            <button class="icon-btn" id="searchBtn">Tìm kiếm</button>
          </div>

          <button class="icon-btn" id="searchIcon" style="display:none;">🔍</button>

          <div class="nav-actions">
            <button class="icon-btn">Yêu thích</button>
            <button class="icon-btn">Giỏ hàng (<span id="cartCount">0</span>)</button>
          </div>

          <div class="account-wrapper">
            <button class="icon-btn" id="taikhoan">Tài khoản</button>

            <div id="accountMenu" class="account-menu">
              <a href="#" id="loginMenu">Đăng nhập</a>
              <a href="#" id="registerMenu">Đăng ký</a>
              <a href="#">Thông tin cá nhân</a>
              <a href="#">Đơn hàng của tôi</a>
              <a href="#" id="logoutMenu">Đăng xuất</a>
            </div>
          </div>
        </div>
      </header>
    `;

    this.initUIEvents();
    this.renderAuthState();

    window.addEventListener("authChanged", () => this.renderAuthState());
  }

  /* ================= AUTH UI ================= */
  renderAuthState() {
    const token = localStorage.getItem("accesstoken");

    const topbar = this.querySelector(".topbar");
    const header = this.querySelector("header");

    const loginBtn = this.querySelector("#loginBtn");
    const registerBtn = this.querySelector("#registerBtn");

    const loginMenu = this.querySelector("#loginMenu");
    const registerMenu = this.querySelector("#registerMenu");
    const logoutMenu = this.querySelector("#logoutMenu");

    const links = this.querySelectorAll("#accountMenu a");
    const infoMenu = links[2];
    const orderMenu = links[3];

    if (token) {
      topbar.style.display = "none";
      header.style.top = "0";

      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      loginMenu.style.display = "none";
      registerMenu.style.display = "none";

      infoMenu.style.display = "block";
      orderMenu.style.display = "block";
      logoutMenu.style.display = "block";
    } else {
      topbar.style.display = "block";
      header.style.top = "40px";

      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      loginMenu.style.display = "block";
      registerMenu.style.display = "block";

      infoMenu.style.display = "none";
      orderMenu.style.display = "none";
      logoutMenu.style.display = "none";
    }
  }

  /* ================= EVENTS ================= */
  initUIEvents() {
    // Toggle account menu
    const tkBtn = this.querySelector("#taikhoan");
    const accountMenu = this.querySelector("#accountMenu");

    tkBtn.addEventListener("click", e => {
      e.stopPropagation();
      accountMenu.style.display =
        accountMenu.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", () => {
      accountMenu.style.display = "none";
    });

    // Login / Register
    this.querySelectorAll("#loginBtn, #loginMenu").forEach(btn => {
      btn?.addEventListener("click", e => {
        e.preventDefault();
        location.href = "/login.html?mode=login";
      });
    });

    this.querySelectorAll("#registerBtn, #registerMenu").forEach(btn => {
      btn?.addEventListener("click", e => {
        e.preventDefault();
        location.href = "/login.html?mode=register";
      });
    });

    // Logout
    this.querySelector("#logoutMenu")?.addEventListener("click", async e => {
      e.preventDefault();

      await callLogoutAPI();
      localStorage.clear();

      window.dispatchEvent(new Event("authChanged"));
      location.href = "/homePage.html";
    });

    // Responsive search
    const searchBox = this.querySelector(".search");
    const searchIcon = this.querySelector("#searchIcon");

    const checkResponsive = () => {
      if (window.innerWidth < 768) {
        searchBox.style.display = "none";
        searchIcon.style.display = "inline-block";
      } else {
        searchBox.style.display = "flex";
        searchIcon.style.display = "none";
      }
    };

    window.addEventListener("resize", checkResponsive);
    checkResponsive();

    // Search
    const searchInput = this.querySelector("#q");
    const searchBtn = this.querySelector("#searchBtn");

    const performSearch = () => {
      const keyword = searchInput.value.trim();
      if (keyword) {
        location.href = `/categoryPage.html?keyword=${encodeURIComponent(keyword)}`;
      }
    };

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") performSearch();
    });
  }
}

customElements.define("top-header", TopHeader);
