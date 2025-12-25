import './product-table.js';
import './product-drawer.js';

class ProductPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <div class="page-head">
          <h2>Quản lý sản phẩm</h2>
          <button id="btnTaoMoi" class="btn btn-primary">
            Tạo sản phẩm
          </button>
        </div>

        <!-- 🔥 BẢNG NẰM Ở ĐÂY -->
        <product-table></product-table>
      </section>

      <product-drawer></product-drawer>
    `;

    // mở drawer
    this.querySelector('#btnTaoMoi').onclick = () => {
      this.querySelector('product-drawer')?.open();
    };

    // reload table khi tạo xong
    this.addEventListener('product-created', () => {
      this.querySelector('product-table')?.load();
    });
  }
}

customElements.define('product-page', ProductPage);
