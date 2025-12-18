class TopHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      
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

      tkBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          accountMenu.style.display =
              accountMenu.style.display === "flex" ? "none" : "flex";
          accountMenu.style.flexDirection = "column";
      });

      document.addEventListener("click", (e) => {
          if (!tkBtn.contains(e.target) && !accountMenu.contains(e.target)) {
              accountMenu.style.display = "none";
          }
      });

      // SEARCH POPUP
      const searchIcon = document.getElementById("searchIcon");
      const popup = document.getElementById("searchPopup");

      if (searchIcon) {
        searchIcon.addEventListener("click", (ev) => {
            ev.stopPropagation();
            popup.style.display = popup.style.display === "block" ? "none":"block";
        });

        document.addEventListener("click", (e)=>{
            if (!searchIcon.contains(e.target) && !popup.contains(e.target)) {
                popup.style.display = "none";
            }
        });
      }

      // also wire the top search button to focus the input (progressive enhancement)
      const searchBtn = document.getElementById("searchBtn");
      const qInput = document.getElementById("q");
      if (searchBtn && qInput){
        searchBtn.addEventListener("click", ()=> qInput.focus());
      }
    `;
    this.appendChild(script);
  }
}
customElements.define("top-header", TopHeader);