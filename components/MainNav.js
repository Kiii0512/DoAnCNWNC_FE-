  class mainNav extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <nav class="main-nav">
          <div class="container menu">
            <a href="/categoryPage/laptop">Laptop</a>
            <a href="/categoryPage/dien-thoai">Điện thoại</a>
            <a href="/categoryPage/pc">PC</a>
            <a href="/categoryPage/phu-kien">Phụ kiện</a>
          </div>
        </nav>
      `;
    }
  }
  customElements.define('main-nav', mainNav);