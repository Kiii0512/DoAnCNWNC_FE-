  class MainNav extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <style>
            nav.main-nav {
            background: #fff;
            border-top: 1px solid #eef2f7;
            border-bottom: 1px solid #eef2f7
            }
            .menu {
            display: flex;
            gap: 18px;
            padding: 10px 0
            }
            .menu a {
            color: #111;
            text-decoration: none;
            padding: 8px 10px;
            border-radius: 6px
            }
            .menu a:hover { color: #000000; background: #e5e1e1 }
        </style>

        <nav class="main-nav">
          <div class="container menu">
            <a href="#">Điện thoại</a>
            <a href="#">Laptop</a>
            <a href="#">PC</a>
            <a href="#">Phụ kiện</a>
            <a href="#">Khuyến mãi</a>
          </div>
        </nav>
      `;
    }
  }
  customElements.define('main-nav', MainNav);