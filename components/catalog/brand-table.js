import { getBrands, setBrandActive } from '../../JS/API/brandAPI.js';

class BrandTable extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<div class="note">Đang tải thương hiệu...</div>`;
    await this.load();
  }

  async load() {
    try {
      this.brands = await getBrands();
      this.render();
    } catch (e) {
      this.innerHTML = `<div class="note">Lỗi: ${e.message}</div>`;
    }
  }

  render() {
    const rows = (this.brands || []).map(b => {
      const checked = b.isActive === false ? '' : 'checked';
      return `
        <tr>
          <td class="col-id">${b.brandId ?? ''}</td>
          <td><div style="font-weight:700">${b.brandName ?? ''}</div></td>
          <td>${b.brandDescription ?? ''}</td>
          <td class="col-status">
            <label class="sw" title="Bật/tắt (soft delete)">
              <input type="checkbox" data-id="${b.brandId}" ${checked} />
              <span class="track"><span class="thumb"></span></span>
            </label>
          </td>
          <td class="col-actions">
            <button class="btn btn-small btn-ghost" data-action="edit" data-id="${b.brandId}">Sửa</button>
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
          ${rows || `<tr><td colspan="5" class="note">Chưa có thương hiệu</td></tr>`}
        </tbody>
      </table>
    `;

    this.querySelectorAll('button[data-action="edit"]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const brand = this.brands.find(x => x.brandId === id);
        this.dispatchEvent(new CustomEvent('brand-edit', { bubbles: true, detail: brand }));
      };
    });

    this.querySelectorAll('input[type="checkbox"][data-id]').forEach(input => {
      input.onchange = async () => {
        const id = input.dataset.id;
        const brand = this.brands.find(x => x.brandId === id);
        const next = input.checked;

        input.disabled = true;
        try {
          await setBrandActive(brand, next);
          this.dispatchEvent(new CustomEvent('brand-toggled', { bubbles: true }));
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

customElements.define('brand-table', BrandTable);
export default BrandTable;
