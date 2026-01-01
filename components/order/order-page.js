import './order-table.js';
import './order-detail-drawer.js';

class OrderPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <div class="page-head" style="position:relative">
          <h2>Quản lý đơn hàng</h2>
        </div>

        <order-table></order-table>
      </section>

      <order-detail-drawer></order-detail-drawer>
    `;
  }
}
customElements.define('order-page', OrderPage);

export default OrderPage;
