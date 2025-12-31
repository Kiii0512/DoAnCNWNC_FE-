import {
  loadProductsFromAPI,
  loadProductsByBrand,
  loadProductsByCategoryAndBrand,
  searchProducts,
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
        <div class="grid-pagination"></div>
      </section>
    `;

    this.grid = this.querySelector(".grid");
    this.sortSelect = this.querySelector("#sort");  
    this.pager = this.querySelector('.grid-pagination');

    // paging
    this.page = 1;
    this.pageSize = 20;

    /* ===== LOAD DATA ===== */

    if (mode === "home") {
      if (!brandId) return;
      await loadProductsByBrand(brandId);
      this.currentList = products.slice(0, 8); // home chỉ lấy 8 sp
    }

    if (mode === "category") {
      const categoryId = localStorage.getItem("categoryId");
      const categoryName = localStorage.getItem("categoryName");
      const brandId = localStorage.getItem("brandId");
      const brandName = localStorage.getItem("brandName");
      const keyword = new URLSearchParams(window.location.search).get("keyword");

      // Build title based on category, brand, or keyword
      let titleText = 'Tất cả sản phẩm';
      if (keyword) {
        titleText = `Kết quả tìm kiếm: "${keyword}"`;
      } else if (categoryName) {
        titleText = categoryName;
        if (brandName) {
          titleText += ` - ${brandName}`;
        }
      } else if (brandName) {
        titleText = brandName;
      }
      
      // Update the title
      this.querySelector("h2").textContent = titleText;

      // If keyword is present, call searchProducts directly
      if (keyword) {
        await searchProducts({ keyword: keyword, status: "active" });
        this.currentList = [...products];
      } else {
        // Normal mode - load by category and/or brand
        await loadProductsByCategoryAndBrand(categoryId || undefined, brandId);
        this.currentList = [...products];
      }

      this.sortSelect && this.sortSelect.addEventListener("change", () => this.sortProducts());
    }

    // render first page
    this.renderPage();
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
    this.renderPage();
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

  renderPage() {
    const total = this.currentList.length || 0;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;

    const start = (this.page - 1) * this.pageSize;
    const pageItems = this.currentList.slice(start, start + this.pageSize);
    this.renderCards(pageItems);
    this.renderPagination(totalPages);
  }

  renderPagination(totalPages) {
    if (!this.pager) return;
    if (totalPages <= 1) {
      this.pager.innerHTML = '';
      return;
    }

    const buttons = [];
    buttons.push(`<button class="page-btn" data-page="${Math.max(1,this.page-1)}">‹</button>`);
    for (let i=1;i<=totalPages;i++) {
      buttons.push(`<button class="page-btn ${i===this.page? 'active' : ''}" data-page="${i}">${i}</button>`);
    }
    buttons.push(`<button class="page-btn" data-page="${Math.min(totalPages,this.page+1)}">›</button>`);

    this.pager.innerHTML = `<div class="pagination">${buttons.join('')}</div>`;

    this.pager.querySelectorAll('.page-btn').forEach(btn => {
      btn.onclick = () => {
        const p = Number(btn.dataset.page);
        if (!p || p === this.page) return;
        this.page = p;
        this.renderPage();
      };
    });
  }
}

customElements.define("product-grid", ProductGrid);
