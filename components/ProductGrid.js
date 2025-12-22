import {
  loadProductsFromAPI,
  getProductsByCategory,
  getProductById
} from "../JS/API/productApi.js";

import {
  addToCart,
  decreaseItem,
  getCartList,
  getTotal
} from "../JS/service/cartService.js";

class ProductGrid extends HTMLElement {

  async connectedCallback() {
    this.innerHTML = `
      <main class="container">
        <section id="products">
          <div style="display:flex;justify-content:space-between;margin-top:14px">
            <h2 id="title">Danh mục sản phẩm</h2>

            <select id="sort">
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: thấp → cao</option>
              <option value="price-desc">Giá: cao → thấp</option>
            </select>
          </div>

          <div class="grid" id="grid"></div>
        </section>
      </main>
    `;

    this.grid = this.querySelector("#grid");
    this.sortSelect = this.querySelector("#sort");

    // ✅ Load data 1 lần
    await loadProductsFromAPI();

    // ✅ Lấy category từ attribute
    const category = this.getAttribute("category");

    if (category) {
      this.setTitle(category);
      this.currentList = getProductsByCategory(category);
    } else {
      this.currentList = getProductsByCategory();
    }

    this.renderCards(this.currentList);

    // Events
    this.sortSelect.addEventListener("change", () => this.sortProducts());
    this.addEventListener("click", e => this.handleClick(e));
  }

  /* =========================
     PUBLIC API
  ========================= */
  setTitle(text) {
    const titleEl = this.querySelector("#title");
    if (titleEl) titleEl.textContent = text;
  }

  setProducts(list) {
    this.currentList = [...list];
    this.renderCards(this.currentList);
  }

  /* =========================
     EVENTS
  ========================= */
  handleClick(e) {
    const add = e.target.dataset.add;
    const view = e.target.dataset.view;
    const inc = e.target.dataset.inc;
    const dec = e.target.dataset.dec;

    if (add) {
      addToCart(add, 1);
      this.renderCartPanel();
    }

    if (inc) {
      addToCart(inc, 1);
      this.renderCartPanel();
    }

    if (dec) {
      decreaseItem(dec);
      this.renderCartPanel();
    }

    if (view) {
      this.renderQuickView(view);
    }
  }

  sortProducts() {
    const type = this.sortSelect.value;

    if (type === "price-asc") {
      this.currentList.sort((a, b) => a.price - b.price);
    }

    if (type === "price-desc") {
      this.currentList.sort((a, b) => b.price - a.price);
    }

    this.renderCards(this.currentList);
  }

  /* =========================
     RENDER
  ========================= */
  renderCards(list) {
    this.grid.innerHTML = "";

    if (!list.length) {
      this.grid.innerHTML = "<p>Không có sản phẩm</p>";
      return;
    }

    list.forEach(p => {
      this.grid.innerHTML += `
        <div class="card">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:13px;color:#5b6b76">
              ${p.title.split(" ").slice(0, 3).join(" ")}...
            </span>
            <span class="badge">
              -${Math.round((1 - p.price / p.old) * 100)}%
            </span>
          </div>

          <img src="${p.img}" alt="${p.title}">

          <div>
            <div style="min-height:40px">${p.title}</div>

            <div class="actions">
              <button class="icon-btn" data-view="${p.id}">Xem</button>
              <button class="btn" data-add="${p.id}">Thêm</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  renderQuickView(id) {
    const p = getProductById(id);
    const modal = document.getElementById("modal");
    if (!modal || !p) return;

    modal.querySelector("#modalImg").src = p.img;
    modal.querySelector("#modalTitle").textContent = p.title;
    modal.querySelector("#modalPrice").textContent =
      p.price.toLocaleString("vi-VN") + "₫";
    modal.querySelector("#modalOld").textContent =
      p.old.toLocaleString("vi-VN") + "₫";

    modal.classList.add("open");
  }

  renderCartPanel() {
    const cartEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    if (!cartEl || !totalEl) return;

    const list = getCartList();

    cartEl.innerHTML = list.map(p => `
      <div class="cart-item">
        <img src="${p.img}" width="56">
        <div style="flex:1">
          ${p.title}<br>
          ${p.price.toLocaleString("vi-VN")} × ${p.qty}
        </div>
        <div>
          <button data-inc="${p.id}">+</button>
          <button data-dec="${p.id}">-</button>
        </div>
      </div>
    `).join("");

    totalEl.textContent =
      getTotal().toLocaleString("vi-VN") + "₫";
  }
}

customElements.define("product-grid", ProductGrid);
