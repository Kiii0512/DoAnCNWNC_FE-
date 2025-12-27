class OrderPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="page">
        <h2>Quản lý đơn hàng</h2>
        <order-table></order-table>
      </section>
    `;
  }
}
customElements.define('order-page', OrderPage);
