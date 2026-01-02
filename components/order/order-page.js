import './order-table.js';
import './order-detail-drawer.js';

class OrderPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="page">
        <h2>Quản lý đơn hàng</h2>
        <order-table></order-table>
      </section>
    `;

    const table = this.querySelector('order-table');

    document.addEventListener('header-search', (e) => {
      const keyword = (e?.detail?.keyword ?? '').trim();
      table?.setKeyword?.(keyword);
    });
  }
}

customElements.define('order-page', OrderPage);
export default OrderPage;

