import { getBrands } from '../../JS/API/brandAPI.js';
import { getCategories } from '../../JS/API/categoryAPI.js';

class FilterPanel extends HTMLElement {
  constructor() {
    super();
    this.opened = false;
    this.categories = [];
    this.brands = [];
  }

  async connectedCallback() {
    await this.loadData();
    this.render();
    this.cache();
    this.bind();
  }

  async loadData() {
    try {
      const [categories, brands] = await Promise.all([
        getCategories(),
        getBrands()
      ]);
      this.categories = categories ?? [];
      this.brands = brands ?? [];
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    this.innerHTML = `
      <div class="backdrop" hidden></div>

      <aside class="drawer filter-drawer">
        <button class="close-btn" type="button">✖</button>
        <h3>Bộ lọc sản phẩm</h3>

        <div class="drawer-content">

          <section class="filter-section">
            <h4>Danh mục</h4>
            ${
              this.categories.map(c => `
                <label class="check">
                  <input type="checkbox" value="${c.categoryId}">
                  <span>${c.categoryName}</span>
                </label>
              `).join('')
            }
          </section>

          <section class="filter-section">
            <h4>Hãng</h4>
            ${
              this.brands.map(b => `
                <label class="check">
                  <input type="checkbox" value="${b.brandId}">
                  <span>${b.brandName}</span>
                </label>
              `).join('')
            }
          </section>

        </div>

        <div class="drawer-actions">
          <button class="btn btn-ghost" id="btnClear">Xóa</button>
          <button class="btn btn-primary" id="btnApply">Áp dụng</button>
        </div>
      </aside>
    `;
  }

  cache() {
    const $ = s => this.querySelector(s);
    this.backdrop = $('.backdrop');
    this.drawer = $('.filter-drawer');
    this.btnClose = $('.close-btn');
    this.btnApply = $('#btnApply');
    this.btnClear = $('#btnClear');
  }

  bind() {
    this.btnClose.onclick = () => this.close();
    this.backdrop.onclick = () => this.close();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });

    this.btnApply.onclick = () => {
      const categories = [...this.querySelectorAll(
        '.filter-section:first-of-type input:checked'
      )].map(i => i.value);

      const brands = [...this.querySelectorAll(
        '.filter-section:last-of-type input:checked'
      )].map(i => i.value);

      this.dispatchEvent(new CustomEvent('filter-apply', {
        bubbles: true,
        detail: { categories, brands }
      }));

      this.close();
    };

    this.btnClear.onclick = () => {
      this.querySelectorAll('input[type=checkbox]')
        .forEach(i => i.checked = false);

      this.dispatchEvent(new CustomEvent('filter-clear', { bubbles: true }));
      this.close();
    };
  }

  open() {
    this.backdrop.hidden = false;
    this.drawer.classList.add('open');
    this.opened = true;
  }

  close() {
    this.backdrop.hidden = true;
    this.drawer.classList.remove('open');
    this.opened = false;
  }

  toggle() {
    this.opened ? this.close() : this.open();
  }
}

customElements.define('filter-panel', FilterPanel);
export default FilterPanel;
