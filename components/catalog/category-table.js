import { getCategories, setCategoryActive } from '../../JS/API/categoryAPI.js';

class CategoryTable extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<div class="note">Đang tải danh mục...</div>`;
    await this.load();
  }

  async load() {
    try {
      this.categories = await getCategories();
      this.render();
    } catch (e) {
      this.innerHTML = `<div class="note">Lỗi: ${e.message}</div>`;
    }
  }

  render() {
    const rows = (this.categories || []).map(c => {
      const checked = c.isActive === false ? '' : 'checked';
      return `
        <tr>
          <td class="col-id">${c.categoryId ?? ''}</td>
          <td><div style="font-weight:700">${c.categoryName ?? ''}</div></td>
          <td>${c.categoryDescription ?? ''}</td>
          <td class="col-status">
            <label class="sw" title="Bật/tắt (soft delete)">
              <input type="checkbox" data-id="${c.categoryId}" ${checked} />
              <span class="track"><span class="thumb"></span></span>
            </label>
          </td>
          <td class="col-actions">
            <button class="btn btn-small btn-ghost" data-action="edit" data-id="${c.categoryId}">Sửa</button>
          </td>
        </tr>
      `;
    }).join('');

    this.innerHTML = `
      <table class="tbl">
        <thead>
          <tr>
            <th class="col-id">Mã</th>
            <th>Tên</th>
            <th>Mô tả</th>
            <th class="col-status">Trạng thái</th>
            <th class="col-actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="5" class="note">Chưa có danh mục</td></tr>`}
        </tbody>
      </table>
    `;

    this.querySelectorAll('button[data-action="edit"]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const category = this.categories.find(x => x.categoryId === id);
        this.dispatchEvent(new CustomEvent('category-edit', { bubbles: true, detail: category }));
      };
    });

    this.querySelectorAll('input[type="checkbox"][data-id]').forEach(input => {
      input.onchange = async () => {
        const id = input.dataset.id;
        const category = this.categories.find(x => x.categoryId === id);
        const next = input.checked;

        input.disabled = true;
        try {
          await setCategoryActive(category, next);
          this.dispatchEvent(new CustomEvent('category-toggled', { bubbles: true }));
        } catch (e) {
          input.checked = !next;
          alert(e.message);
        } finally {
          input.disabled = false;
        }
      };
    });
  }
}

customElements.define('category-table', CategoryTable);
export default CategoryTable;
