import {
  loadProductsFromAPI,
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

    this.innerHTML = `
      <main class="container">
        <section id="products">
          <div class="products-header">
            <h2 id="title"></h2>

            <div class="sort-box">
              <label for="sort">Sắp xếp</label>
              <select id="sort">
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá: thấp → cao</option>
                <option value="price-desc">Giá: cao → thấp</option>
              </select>
            </div>
          </div>

          <div class="grid" id="grid"></div>
        </section>
      </main>
    `;

    this.grid = this.querySelector("#grid");
    this.sortSelect = this.querySelector("#sort");

    const categoryId = localStorage.getItem("categoryId");
    const categoryName = localStorage.getItem("categoryName");
    if (!categoryId) return;

    this.querySelector("#title").textContent = categoryName || "Danh mục";

    await loadProductsFromAPI(categoryId);
    this.currentList = [...products];
    this.renderCards(this.currentList);

    this.sortSelect.addEventListener("change", () => this.sortProducts());
    this.addEventListener("click", e => this.handleClick(e));
  }

  handleClick(e) {
    const addBtn = e.target.closest("[data-add]");
    const viewBtn = e.target.closest("[data-view]");

    // thêm giỏ
    if (addBtn) {
      addToCart(addBtn.dataset.add, 1);
      document.dispatchEvent(new Event("cart:update"));
      document.dispatchEvent(new Event("cart:open"));
      return;
    }

    // mở quick view
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
