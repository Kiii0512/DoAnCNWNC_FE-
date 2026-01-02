import './discount-table.js';
import './discount-drawer.js';

class DiscountPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <div class="page-head">
          <h2>Quản lý khuyến mãi</h2>
        </div>

        <discount-table></discount-table>
      </section>

      <discount-drawer></discount-drawer>
    `;

    this.bindActions();
    this.bindHeaderSearch();
  }

  bindActions() {
    const drawer = document.querySelector('discount-drawer');
    // The create button is now in the table component
  }

  bindHeaderSearch() {
    document.addEventListener('header-search', (e) => {
      const keyword = e.detail.keyword;
      const table = this.querySelector('discount-table');
      if (table) {
        table.filterDiscounts(keyword);
      }
    });
  }
}
customElements.define('discount-page', DiscountPage);

export default DiscountPage;