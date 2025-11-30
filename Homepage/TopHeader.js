class TopHeader extends HTMLElement {
    connectedCallback() {
      // Insert HTML + CSS (JS appended separately so it executes)
      this.innerHTML = `
        <style>
            .topbar {
            background: #0f1724;
            color: #fff;
            padding: 6px 16px;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: center
            }
            .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 16px
            }
            .login{
            margin-left:5px;padding:5px 10px;border-radius:8px;border:0;background:#fcfcfc;color:#000000
            }
            .login:hover{
            background:#340303;
            color: #ffffff;
            }
            header {
            background: #fff;
            box-shadow: 0 1px 4px rgba(16, 24, 40, .06);
            position: sticky;
            top: 0;
            z-index: 50
            }
            .head-main {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 0
            }
            .logo {
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            font-size: 20px;
            color: #111
            }
            .logo .mark {
            text-decoration: none;
            background: linear-gradient(90deg, #0000009d, #051017);
            color: #fff;
            padding: 8px 10px;
            border-radius: 6px
            }
            .search { flex: 1; display:flex }
            .search input {
            flex: 1;
            padding: 12px 14px;
            border-radius: 8px;
            border: 1px solid #e6e9ee
            }
            .search button {
            margin-left: 8px;
            padding: 12px 14px;
            border-radius: 8px;
            border: 0;
            background: #0f1724;
            color: #fff
            }
            .nav-actions { display:flex; gap:10px; align-items:center }
            .icon-btn {
            background: transparent;
            border: 1px solid #e6e9ee;
            padding: 8px 10px;
            border-radius: 8px;
            cursor: pointer
            }
            .icon-btn:hover { background: #9c9d9e; color: #fff }
            .account-menu {
            position: absolute;
            right: 120px;
            top: 80px;
            background: #fff;
            border: 1px solid #e6e9ee;
            border-radius: 10px;
            width: 180px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            z-index: 100;
            }
            .account-menu a { padding: 12px; text-decoration:none; color:#111; font-size:14px; border-bottom:1px solid #f1f5f9}
            .account-menu a:last-child { border-bottom:none; }
            .account-menu a:hover { background:#f3f4f6; }
        </style>

        <div class="topbar">
          <div class="container" style="display:flex;justify-content:space-between;align-items:center;">
            <div>Giao hàng nhanh — Support: 1900 1009 </div>
            <div>
              <button class="login">Đăng nhập</button>
              <button class="login">Đăng ký</button>
            </div>
          </div>
        </div>

        <header>
          <div class="container head-main">
            <div class="logo"><div class="mark"><a href="#"></a>SH</div></a><div>Shop68IT1</div></div>

            <div class="search">
              <input id="q" placeholder="Tìm điện thoại, laptop, linh kiện..." />
              <button class="icon-btn" id="searchBtn">Tìm kiếm</button>
            </div>

            <div class="nav-actions">
              <button class="icon-btn" id="favBtn">Yêu thích</button>
              <button class="icon-btn" id="cartBtn">Giỏ hàng (<span id="cartCount">0</span>)</button>
            </div>

            <button class="icon-btn" id="taikhoan">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     class="bi bi-person-circle" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fill-rule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242
                        11.226 4.805 10.5 8 10.5s4.757.726 5.468 1.87A7 7 0 0 0 8 1z"/>
                </svg>
              </div>
              Tài khoản
            </button>

            <div id="accountMenu" class="account-menu">
              <a href="#">Đăng nhập</a>
              <a href="#">Đăng ký</a>
              <a href="#">Thông tin cá nhân</a>
              <a href="#">Đơn hàng của tôi</a>
              <a href="#">Đăng xuất</a>
            </div>
          </div>
        </header>
      `;

      // Append JS (so it executes). JS logic kept identical to original (menu toggle).
      const script = document.createElement('script');
      script.textContent = `
        // MENU TÀI KHOẢN (giữ nguyên)
        const tkBtn = document.getElementById("taikhoan");
        const accountMenu = document.getElementById("accountMenu");

        if (tkBtn) {
          tkBtn.addEventListener("click", () => {
            accountMenu.style.display =
              accountMenu.style.display === "flex" ? "none" : "flex";
          });
        }

        // Ẩn menu khi click ra ngoài
        document.addEventListener("click", (e) => {
          if (!tkBtn.contains(e.target) && !accountMenu.contains(e.target)) {
            accountMenu.style.display = "none";
          }
        });
      `;
      this.appendChild(script);
    }
  }
  customElements.define('top-header', TopHeader);