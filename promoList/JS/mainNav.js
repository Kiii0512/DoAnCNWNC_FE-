  class mainNav extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <nav class="main-nav">
          <div class="container menu">
            <a href="#">Điện thoại</a>
            <a href="#">Laptop</a>
            <a href="#">PC</a>
            <a href="#">Phụ kiện</a>
            <a href="promoList.html">Khuyến mãi</a>
          </div>
        </nav>
      `;
    }
  }
  customElements.define('main-nav', mainNav);