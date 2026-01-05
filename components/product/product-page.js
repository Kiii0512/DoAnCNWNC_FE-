import './product-table.js';
import './product-drawer.js';
import './filter-panel.js';

/* ===============================
   GLOBAL FILTER STATE
=============================== */
const productFilterState = {
  CategoryIds: [],
  BrandIds: [],
  Status: 'all',
  Keyword: ''
};

class ProductPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <div class="page-head" style="position:relative">
          <h2>Quản lý sản phẩm</h2>

          <div class="page-actions">
            <button id="btnFilter" class="btn btn-ghost">Bộ lọc</button>
            <button id="btnTaoMoi" class="btn btn-primary">Tạo sản phẩm</button>
          </div>
        </div>

        <product-table></product-table>
      </section>

      <filter-panel></filter-panel>
      <product-drawer></product-drawer>
      <product-detail-drawer></product-detail-drawer>
    `;

    const table  = this.querySelector('product-table');
    const panel  = this.querySelector('filter-panel');
    const drawer = this.querySelector('product-drawer');

    /* ===============================
       OPEN / CLOSE FILTER PANEL
    =============================== */
    this.querySelector('#btnFilter').onclick = e => {
      e.stopPropagation(); // 🔥 tránh click lan
      panel.toggle();
    };

    /* ===============================
       FILTER PANEL APPLY
    =============================== */
    this.addEventListener('filter-apply', e => {
      Object.assign(productFilterState, e.detail);
      table.applyFilter(productFilterState);
    });

    /* ===============================
       FILTER PANEL CLEAR
    =============================== */
    this.addEventListener('filter-clear', () => {
      productFilterState.CategoryIds = [];
      productFilterState.BrandIds = [];
      productFilterState.Status = 'all';
      productFilterState.Keyword = '';
      table.load();
    });

    /* ===============================
       HEADER SEARCH (KEYWORD)
    =============================== */
    document.addEventListener('header-search', e => {
      productFilterState.Keyword = e.detail.keyword ?? '';
      table.applyFilter(productFilterState);
    });

    /* ===============================
       CREATE PRODUCT
    =============================== */
    this.querySelector('#btnTaoMoi').onclick = () => {
      drawer.open(); // CREATE MODE
    };

    /* ===============================
       EDIT PRODUCT (FROM DETAIL DRAWER)
    =============================== */
    this.addEventListener('product-edit-request', e => {
      drawer.openEdit(e.detail); // EDIT MODE
    });

    /* ===============================
       AFTER CREATE / EDIT → RELOAD TABLE
    =============================== */
    this.addEventListener('product-saved', () => {
      if (
        productFilterState.CategoryIds.length ||
        productFilterState.BrandIds.length ||
        productFilterState.Status !== 'all' ||
        productFilterState.Keyword
      ) {
        table.applyFilter(productFilterState);
      } else {
        table.load();
      }
    });
  }
}

customElements.define('product-page', ProductPage);
export default ProductPage;
