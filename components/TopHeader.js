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
              <div class="logo">
                  <div class="mark">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-alipay" viewBox="0 0 16 16">
                      <path d="M2.541 0H13.5a2.55 2.55 0 0 1 2.54 2.563v8.297c-.006 0-.531-.046-2.978-.813-.412-.14-.916-.327-1.479-.536q-.456-.17-.957-.353a13 13 0 0 0 1.325-3.373H8.822V4.649h3.831v-.634h-3.83V2.121H7.26c-.274 0-.274.273-.274.273v1.621H3.11v.634h3.875v1.136h-3.2v.634H9.99c-.227.789-.532 1.53-.894 2.202-2.013-.67-4.161-1.212-5.51-.878-.864.214-1.42.597-1.746.998-1.499 1.84-.424 4.633 2.741 4.633 1.872 0 3.675-1.053 5.072-2.787 2.08 1.008 6.37 2.738 6.387 2.745v.105A2.55 2.55 0 0 1 13.5 16H2.541A2.55 2.55 0 0 1 0 13.437V2.563A2.55 2.55 0 0 1 2.541 0"/>
                      <path d="M2.309 9.27c-1.22 1.073-.49 3.034 1.978 3.034 1.434 0 2.868-.925 3.994-2.406-1.602-.789-2.959-1.353-4.425-1.207-.397.04-1.14.217-1.547.58Z"/>
                      </svg>
                  </div>
                  <div>Shop68IT1</div>
              </div>

              <div class="search">
                  <input id="q" placeholder="Tìm điện thoại, laptop, linh kiện..." />
                  <button class="icon-btn" id="searchBtn">Tìm kiếm</button>
              </div>

              <button class="icon-btn" id="searchIcon" style="display:none;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </button>

              <div class="nav-actions">
                  <button class="icon-btn" id="favBtn">Yêu thích</button>
                  <button class="icon-btn" id="cartBtn">
                      Giỏ hàng (<span id="cartCount">0</span>)
                  </button>
              </div>

              <div class="account-wrapper">
                  <button class="icon-btn" id="taikhoan">
                      <div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                          <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                          </svg>
                      </div>
                      Tài khoản
                  </button>

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

      <div class="search-popup" id="searchPopup">
          <input id="searchPopupInput" placeholder="Nhập từ khóa..." />
      </div>
    `;

    this.initUIEvents(); // chạy đoạn JS U/I thuần
    this.renderAuthState();

    // Lắng nghe khi login/logout từ trang khác
    window.addEventListener("authChanged", () => this.renderAuthState());
  }

   renderAuthState() {
    const token = localStorage.getItem("accesstoken");

    const topbar = this.querySelector(".topbar");

    const loginBtn = this.querySelector("#loginBtn");
    const registerBtn = this.querySelector("#registerBtn");

    const loginMenu = this.querySelector("#loginMenu");
    const registerMenu = this.querySelector("#registerMenu");
    const logoutMenu = this.querySelector("#logoutMenu");

    // Lấy toàn bộ link trong account menu
    const links = this.querySelectorAll("#accountMenu a");
    const infoMenu = links[2];   // Thông tin cá nhân
    const orderMenu = links[3];  // Đơn hàng

    if (token) {
      // ✅ ĐÃ ĐĂNG NHẬP
      topbar.style.display = "none";

      loginBtn.style.display = "none";
      registerBtn.style.display = "none";

      loginMenu.style.display = "none";
      registerMenu.style.display = "none";

      infoMenu.style.display = "block";
      orderMenu.style.display = "block";
      logoutMenu.style.display = "block";
    } else {
      // ❌ CHƯA ĐĂNG NHẬP
      topbar.style.display = "block";

      loginBtn.style.display = "block";
      registerBtn.style.display = "block";

      loginMenu.style.display = "block";
      registerMenu.style.display = "block";

      infoMenu.style.display = "none";
      orderMenu.style.display = "none";
      logoutMenu.style.display = "none";
    }
  }


  initUIEvents() {
    // ACCOUNT MENU TOGGLE
    const tkBtn = this.querySelector("#taikhoan");
    const accountMenu = this.querySelector("#accountMenu");

    tkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      accountMenu.style.display =
        accountMenu.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", () => {
      accountMenu.style.display = "none";
    });

    // LOGOUT
    const logoutMenu = this.querySelector("#logoutMenu");
    logoutMenu.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.dispatchEvent(new Event("authChanged"));
      location.href = "/index.html";
    });

    // RESPONSIVE SEARCH
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
  }
}

customElements.define("top-header", TopHeader);


