import './brand-table.js';
import './brand-drawer.js';
import './category-table.js';
import './category-drawer.js';

class CatalogPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="catalog-grid">
        <section class="card catalog-card">
          <div class="page-head">
            <h2>Quản lý danh mục</h2>
            <div class="page-actions">
              <button class="btn btn-primary" id="btnNewCategory">Tạo danh mục</button>
            </div>
          </div>
          <category-table></category-table>
        </section>
 <div class="catalog-divider" aria-hidden="true"></div>
        <section class="card catalog-card">
          <div class="page-head">
            <h2>Quản lý thương hiệu</h2>
            <div class="page-actions">
              <button class="btn btn-primary" id="btnNewBrand">Tạo thương hiệu</button>
            </div>
          </div>
          <brand-table></brand-table>
        </section>
      </div>

      <category-drawer></category-drawer>
      <brand-drawer></brand-drawer>
    `;

    const catDrawer = this.querySelector('category-drawer');
    const brandDrawer = this.querySelector('brand-drawer');
    const catTable = this.querySelector('category-table');
    const brandTable = this.querySelector('brand-table');

    this.querySelector('#btnNewCategory').onclick = () => catDrawer.openCreate();
    this.querySelector('#btnNewBrand').onclick = () => brandDrawer.openCreate();

    this.addEventListener('category-edit', (e) => catDrawer.openEdit(e.detail));
    this.addEventListener('brand-edit', (e) => brandDrawer.openEdit(e.detail));

    // CẬP NHẬT NGAY UI (không reload trang): chỉ reload table (fetch lại) là thấy ngay
    this.addEventListener('category-saved', () => catTable.load());
    this.addEventListener('brand-saved', () => brandTable.load());

    this.addEventListener('category-toggled', () => catTable.load());
    this.addEventListener('brand-toggled', () => brandTable.load());
  }
}

customElements.define('catalog-page', CatalogPage);
export default CatalogPage;
