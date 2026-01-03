import './employee-table.js';
import './employee-drawer.js';

class EmployeePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <div class="page-head">
          <h2>Quản lý nhân viên</h2>
        </div>

        <employee-table></employee-table>
      </section>

      <employee-drawer></employee-drawer>
    `;

    this.bindActions();
    this.bindHeaderSearch();
  }

  bindActions() {
    const drawer = document.querySelector('employee-drawer');
    // The create button is now in the table component
  }

  bindHeaderSearch() {
    document.addEventListener('header-search', (e) => {
      const keyword = e.detail.keyword;
      const table = this.querySelector('employee-table');
      if (table) {
        table.filterEmployees(keyword);
      }
    });
  }
}

customElements.define('employee-page', EmployeePage);
export default EmployeePage;
