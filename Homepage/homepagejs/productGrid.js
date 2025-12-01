import { 
  loadProductsFromAPI,
  products,
  addToCart,
  decreaseItem,
  getCartList,
  getTotal,
  getProductById
} from "./product-grid.api.js";

class productGrid extends HTMLElement {
  connectedCallback() {

    // HTML gốc giữ nguyên
    this.innerHTML = `
      <main class="container">
        <section id="products">
          <div style="display:flex;justify-content:space-between;margin-top:14px">
            <h2>Sản phẩm nổi bật</h2>
            <select id="sort">
              <option value="popular">Phổ biến</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
            </select>
          </div>

          <div class="grid" id="grid"></div>
        </section>
      </main>
    `;

    const grid = this.querySelector("#grid");

    // Load API
    loadProductsFromAPI().then(() => {
      this.renderCards(products);
    });

    // Click handler
    this.addEventListener("click", (e) => {
      const btnAdd = e.target.dataset.add;
      const btnView = e.target.dataset.view;

      if (btnAdd) {
        addToCart(btnAdd, 1);
        this.renderCartPanel();
      }

      if (btnView) {
        this.renderQuickView(btnView);
      }
    });
  }


  // ------------------------
  // RENDER UI
  // ------------------------

  renderCards(list) {
    const grid = this.querySelector("#grid");
    grid.innerHTML = "";

    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;">
          <div style="font-size:13px;color:#5b6b76">${p.title.split(" ").slice(0, 3).join(" ")}...</div>
          <div class="badge">-${Math.round((1 - p.price / p.old) * 100)}%</div>
        </div>

        <img src="${p.img}" alt="${p.title}">

        <div>
          <div style="min-height:40px">${p.title}</div>

          <div class="actions">
            <button class="icon-btn" data-view="${p.id}">Xem</button>
            <button class="btn" data-add="${p.id}">Thêm</button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }


  renderQuickView(id) {
    const p = getProductById(id);
    const modal = document.getElementById("modal");
    
    modal.querySelector("#modalImg").src = p.img;
    modal.querySelector("#modalTitle").textContent = p.title;
    modal.querySelector("#modalPrice").textContent = p.price.toLocaleString("vi-VN") + "₫";
    modal.querySelector("#modalOld").textContent = p.old.toLocaleString("vi-VN") + "₫";

    modal.classList.add("open");
  }


  renderCartPanel() {
    const cartEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");

    const list = getCartList();

    cartEl.innerHTML = list.map(p => `
      <div class="cart-item">
        <img src="${p.img}" style="width:56px;height:56px">
        <div style="flex:1">${p.title}<br>${(p.price).toLocaleString("vi-VN")} × ${p.qty}</div>
        <div>
          <button class="icon-btn" data-inc="${p.id}">+</button>
          <button class="icon-btn" data-dec="${p.id}">-</button>
        </div>
      </div>
    `).join("");

    totalEl.textContent = getTotal().toLocaleString("vi-VN") + "₫";
  }
}

customElements.define("product-grid", productGrid);
