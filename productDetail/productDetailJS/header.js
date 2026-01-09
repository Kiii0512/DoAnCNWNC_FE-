/* Top header component: defines <top-header> custom element and its behaviors */
class TopHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="topbar">
        <div class="container" style="display:flex;justify-content:space-between;align-items:center;">
            <div>Giao hàng nhanh — Support: 1900 1009 </div>
            <div>
                <button class="login" id="loginBtn">Đăng nhập</button>
                <button class="login" id="registerBtn">Đăng ký</button>
            </div>
        </div>
    </div>

    <header>
        <div class="container head-main">
            <a class="logo" href="../home1/homee.html" aria-label="Về trang chủ">
                <div class="mark">
                    <!-- svg -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.541 0H13.5a2.55 2.55 0 0 1 2.54 2.563v8.297c-.006 0-.531-.046-2.978-.813-.412-.14-.916-.327-1.479-.536q-.456-.17-.957-.353a13 13 0 0 0 1.325-3.373H8.822V4.649h3.831v-.634h-3.83V2.121H7.26c-.274 0-.274.273-.274.273v1.621H3.11v.634h3.875v1.136h-3.2v.634H9.99c-.227.789-.532 1.53-.894 2.202-2.013-.67-4.161-1.212-5.51-.878-.864.214-1.42.597-1.746.998-1.499 1.84-.424 4.633 2.741 4.633 1.872 0 3.675-1.053 5.072-2.787 2.08 1.008 6.37 2.738 6.387 2.745v.105A2.55 2.55 0 0 1 13.5 16H2.541A2.55 2.55 0 0 1 0 13.437V2.563A2.55 2.55 0 0 1 2.541 0"/></svg>
                </div>
                <div>Shop68IT1</div>
            </a>

            <div class="search">
                <input id="q" placeholder="Tìm điện thoại, laptop, linh kiện..." />
                <button class="icon-btn" id="searchBtn">Tìm kiếm</button>
            </div>

            <!-- search icon (svg) để responsive -->
            <button class="icon-btn" id="searchIcon" style="display:none;" aria-label="Mở tìm kiếm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </button>

            <div class="nav-actions">
                <button class="icon-btn" id="favBtn">Yêu thích</button>

                <!-- giữ id cartBtn + cartCount span -->
                <button class="icon-btn" id="cartBtn">
                    Giỏ hàng (<span id="cartCount">0</span>)
                </button>
            </div>

            <div class="account-wrapper">
                <!-- phục hồi icon trong nút tài khoản -->
                <button class="icon-btn" id="taikhoan" aria-haspopup="true" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                      <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                    </svg>
                    <span style="margin-left:6px">Tài khoản</span>
                </button>

                <div id="accountMenu" class="account-menu" role="menu" aria-hidden="true">
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
    this.initUIEvents();
  }

  initUIEvents() {
    const tkBtn = this.querySelector("#taikhoan");
    const accountMenu = this.querySelector("#accountMenu");

    tkBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = accountMenu.style.display === "flex";
      accountMenu.style.display = isOpen ? "none" : "flex";
      tkBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener("click", (e) => {
      if (!tkBtn.contains(e.target) && !accountMenu.contains(e.target)) {
        accountMenu.style.display = "none";
        tkBtn.setAttribute('aria-expanded', 'false');
      }
    });

    const searchIcon = this.querySelector("#searchIcon");
    const popup = this.querySelector("#searchPopup");

    searchIcon?.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.style.display = popup.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!searchIcon?.contains(e.target) && !popup?.contains(e.target)) {
        popup.style.display = "none";
      }
    });

    const searchBox = this.querySelector(".search");
    const checkResponsive = () => {
      if (window.innerWidth < 768) {
        searchBox.style.display = "none";
        searchIcon.style.display = "block";
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
