  import './product-table.js';
  import './product-drawer.js';
  import './filter-panel.js';

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
      `;

      const table = this.querySelector('product-table');
      const panel = this.querySelector('filter-panel');

      // mở / đóng panel
      this.querySelector('#btnFilter').onclick = e => {
        e.stopPropagation(); // 🔥 QUAN TRỌNG
        panel.toggle();
      };

      // áp dụng filter
      this.addEventListener('filter-apply', e => {
        table.loadWithFilter(e.detail);
      });

      // clear filter
      this.addEventListener('filter-clear', () => {
        table.load();
      });

      // tạo mới
      this.querySelector('#btnTaoMoi').onclick = () => {
        this.querySelector('product-drawer')?.open();
      };

      this.addEventListener('product-created', () => {
        table.load();
      });
    }
  }

  customElements.define('product-page', ProductPage);
  export default ProductPage;
