import {
  loadProductsFromAPI,
  loadProductsByBrand,
  products
} from "../JS/API/productApi.js";

import { addToCart } from "../JS/service/cartService.js";

class ProductGrid extends HTMLElement {

  constructor() {
    super();
    this._loaded = false;
  }

  async connectedCallback() {
    if (this._loaded) return;
    this._loaded = true;

    const mode = this.getAttribute("mode") || "category";
    const title = this.getAttribute("title") || "Sản phẩm";
    const brandId = this.getAttribute("brand-id");

    this.innerHTML = `
      <section class="product-section">
        <div class="products-header">
          <h2>${title}</h2>

          ${
            mode === "category"
              ? `
            <div class="sort-box">
              <label>Sắp xếp</label>
              <select id="sort">
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá ↑</option>
                <option value="price-desc">Giá ↓</option>
              </select>
            </div>
          `
              : `<a class="view-all" href="brand.html?id=${brandId}">Xem tất cả</a>`
          }
        </div>

        <div class="grid"></div>
      </section>
    `;

    this.grid = this.querySelector(".grid");
    this.sortSelect = this.querySelector("#sort");  

    /* ===== LOAD DATA ===== */

    if (mode === "home") {
      if (!brandId) return;
      await loadProductsByBrand(brandId);
      this.currentList = products.slice(0, 8); // home chỉ lấy 8 sp
    }

    if (mode === "category") {
      const categoryId = localStorage.getItem("categoryId");
      const categoryName = localStorage.getItem("categoryName");
      if (!categoryId) return;

      this.querySelector("h2").textContent = categoryName || title;

      await loadProductsFromAPI(categoryId);
      this.currentList = [...products];

      this.sortSelect.addEventListener("change", () => this.sortProducts());
    }

    this.renderCards(this.currentList);
    this.addEventListener("click", e => this.handleClick(e));
  }

  handleClick(e) {
    const addBtn = e.target.closest("[data-add]");
    const viewBtn = e.target.closest("[data-view]");

    if (addBtn) {
      addToCart(addBtn.dataset.add, 1);
      document.dispatchEvent(new Event("cart:update"));
      document.dispatchEvent(new Event("cart:open"));
    }

    if (viewBtn) {
      document.dispatchEvent(
        new CustomEvent("quickview:open", {
          detail: { id: viewBtn.dataset.view }
        })
      );
    }
  }

  sortProducts() {
    const type = this.sortSelect.value;
    if (type === "price-asc") this.currentList.sort((a,b)=>a.price-b.price);
    if (type === "price-desc") this.currentList.sort((a,b)=>b.price-a.price);
    this.renderCards(this.currentList);
  }

  renderCards(list) {
    this.grid.innerHTML = list.map(p => `
      <div class="card">
        <img src="${p.img}">
        <h4>${p.title}</h4>
        <span>${p.price.toLocaleString("vi-VN")}₫</span>

        <div class="actions">
          <button data-add="${p.id}">Thêm</button>
          <button data-view="${p.id}">Xem</button>
        </div>
      </div>
    `).join("");
  }
}

customElements.define("product-grid", ProductGrid);
