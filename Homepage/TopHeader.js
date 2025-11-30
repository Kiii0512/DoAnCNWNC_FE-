class TopHeader extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <style>
            .topbar {
              background: #0f1724;
              color: #fff;
              padding: 6px 16px;
              font-size: 13px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 16px;
            }

            .login{
              margin-left:5px;
              padding:5px 10px;
              border-radius:8px;
              border:0;
              background:#fcfcfc;
              color:#000000
            }
            .login:hover{
              background:#340303;
              color:#ffffff;
            }

            header {
              background: #fff;
              box-shadow: 0 1px 4px rgba(16,24,40,.06);
              position: sticky;
              top: 0;
              z-index: 50;
            }

            .head-main {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 14px 0;
            }

            .logo {
              text-decoration: none;
              display: flex;
              align-items: center;
              gap: 10px;
              font-weight: 700;
              font-size: 20px;
              color: #111;
            }

            .logo .mark {
              text-decoration:none;
              background: linear-gradient(90deg,#0000009d,#051017);
              color:#fff;
              padding:8px 10px;
              border-radius:6px;
            }

            .search {
                flex: 1;
                display: flex;
            }
            .search input {
                flex: 1;
                padding: 12px 14px;
                border-radius: 8px;
                border: 1px solid #e6e9ee;
            }
            .search button {
                margin-left: 8px;
                padding: 12px 14px;
                border-radius: 8px;
                border: 0;
                background: #0f1724;
                color: #fff;
            }

            .nav-actions { 
                display:flex; 
                gap:10px; 
                align-items:center;
            }

            .icon-btn {
              background: transparent;
              border: 1px solid #e6e9ee;
              padding: 8px 10px;
              border-radius: 8px;
              cursor: pointer;
            }
            .icon-btn:hover { background: #9c9d9e; color:#fff; }

            /* MENU ACCOUNT */
            .account-wrapper {
             position: relative;
            }

          .account-menu {
            position: absolute;
            top: 100%;   /* nằm ngay dưới nút */
            right: 0;    /* căn mép phải với nút */
            margin-top: 8px;

            background: #fff;
            border: 1px solid #e6e9ee;
            border-radius: 10px;
            width: 180px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            z-index: 200;
          }

            .account-menu a {
              padding: 12px;
              text-decoration:none;
              color:#111;
              font-size:14px;
              border-bottom:1px solid #f1f5f9;
            }
            .account-menu a { padding: 12px; text-decoration:none; color:#111; font-size:14px; border-bottom:1px solid #f1f5f9; }
            .account-menu a:last-child { border-bottom:none; }
            .account-menu a:hover { background:#f1f5f9; }

            /* Ẩn ô search khi màn nhỏ */
            @media (max-width: 600px) {
                .search {
                    display: none !important;
                }
                #searchIcon {
                    display: inline-flex !important;
                }
            }

            /* Search overlay popup */
            .search-popup {
                display: none;
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                background: #fff;
                padding: 10px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 9999;
            }
            .search-popup input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ccc;
                border-radius: 8px;
            }
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

            <div class="logo"><div class="mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
            <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
            <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
            </svg>
            </div><div>Shop68IT1</div></div>

            <div class="search">
              <input id="q" placeholder="Tìm điện thoại, laptop, linh kiện..." />
              <button class="icon-btn" id="searchBtn">Tìm kiếm</button>
            </div>

            <button class="icon-btn" id="searchIcon" style="display:none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search-heart" viewBox="0 0 16 16">
                <path d="M6.5 4.482c1.664-1.673 5.825 1.254 0 5.018-5.825-3.764-1.664-6.69 0-5.018"/>
                <path d="M13 6.5a6.47 6.47 0 0 1-1.258 3.844q.06.044.115.098l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1-.1-.115h.002A6.5 6.5 0 1 1 13 6.5M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11"/>
                </svg>
            </button>

            <div class="nav-actions">
              <button class="icon-btn" id="favBtn">Yêu thích</button>
              <button class="icon-btn" id="cartBtn">Giỏ hàng (<span id="cartCount">0</span>)</button>
            </div>

            <div class="account-wrapper">
              <button class="icon-btn" id="taikhoan">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      class="bi bi-person-circle" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path fill-rule="evenodd"
                          d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 
                          11.37C3.242 11.226 4.805 10.5 8 10.5s4.757.726 
                          5.468 1.87A7 7 0 0 0 8 1z"/>
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


          </div>
        </header>

        <div class="search-popup" id="searchPopup">
            <input placeholder="Nhập từ khóa..." />
        </div>
      `;

      /* ================= JS ================= */
      const script = document.createElement("script");
      script.textContent = `
        // ACCOUNT MENU
        const tkBtn = document.getElementById("taikhoan");
        const accountMenu = document.getElementById("accountMenu");

        tkBtn.addEventListener("click", () => {
            accountMenu.style.display =
                accountMenu.style.display === "flex" ? "none" : "flex";
        });

        document.addEventListener("click", (e) => {
            if (!tkBtn.contains(e.target) && !accountMenu.contains(e.target)) {
                accountMenu.style.display = "none";
            }
        });

        // SEARCH POPUP
        const searchIcon = document.getElementById("searchIcon");
        const popup = document.getElementById("searchPopup");

        searchIcon.addEventListener("click", () => {
            popup.style.display = popup.style.display === "block" ? "none":"block";
        });

        document.addEventListener("click", (e)=>{
            if (!searchIcon.contains(e.target) && !popup.contains(e.target)) {
                popup.style.display = "none";
            }
        });
      `;
      this.appendChild(script);
    }
}
customElements.define("top-header", TopHeader);
