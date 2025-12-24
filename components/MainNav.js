class mainNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="main-nav">
        <div class="container menu">
          <a href="#" data-category="CAT0001" data-name="Laptop">Laptop</a>
          <a href="#" data-category="CAT0002" data-name="Điện thoại">Điện thoại</a>
          <a href="#" data-category="CAT0003" data-name="PC">PC</a>
          <a href="#" data-category="CAT0004" data-name="Phụ kiện">Phụ kiện</a>
        </div>
      </nav>
    `;

    this.querySelectorAll("a[data-category]").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();

        const categoryId = link.dataset.category;
        const categoryName = link.dataset.name; // ✅ TÊN DANH MỤC

        // ✅ LƯU CẢ ID + NAME
        localStorage.setItem("categoryId", categoryId);
        localStorage.setItem("categoryName", categoryName);

        // ✅ CHUYỂN TRANG
        window.location.href = "categoryPage.html";
      });
    });
  }
}

customElements.define("main-nav", mainNav);
