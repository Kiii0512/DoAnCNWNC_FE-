import { createBrand, updateBrand } from '../../JS/API/brandAPI.js';

class BrandDrawer extends HTMLElement {
  connectedCallback() {
    this.mode = 'create';
    this.current = null;

    this.innerHTML = `
      <div class="drawer-backdrop"></div>
      <aside class="drawer" aria-hidden="true">
        <div class="head">
          <div style="font-weight:800" id="title">Tạo thương hiệu</div>
          <button class="btn btn-small btn-ghost" id="btnClose">Đóng</button>
        </div>

        <div class="body">
          <div class="fg">
            <label>Tên thương hiệu</label>
            <input id="name" placeholder="VD: Apple" />

            <label>Mô tả</label>
            <textarea id="desc" placeholder="VD: Hãng điện thoại"></textarea>

            <div class="note">Gợi ý: tắt trạng thái bằng switch ở bảng để soft delete.</div>
          </div>
        </div>

        <div class="foot">
          <button class="btn btn-ghost" id="btnCancel">Huỷ</button>
          <button class="btn btn-primary" id="btnSave">Lưu</button>
        </div>
      </aside>
    `;

    this.backdrop = this.querySelector('.drawer-backdrop');
    this.drawer = this.querySelector('.drawer');

    this.querySelector('#btnClose').onclick = () => this.close();
    this.querySelector('#btnCancel').onclick = () => this.close();
    this.backdrop.onclick = () => this.close();

    this.querySelector('#btnSave').onclick = () => this.save();
  }

  openCreate() {
    this.mode = 'create';
    this.current = null;
    this.querySelector('#title').textContent = 'Tạo thương hiệu';
    this.querySelector('#name').value = '';
    this.querySelector('#desc').value = '';
    this.open();
  }

  openEdit(brand) {
    this.mode = 'edit';
    this.current = brand;
    this.querySelector('#title').textContent = `Sửa thương hiệu (${brand?.brandId || ''})`;
    this.querySelector('#name').value = brand?.brandName || '';
    this.querySelector('#desc').value = brand?.brandDescription || '';
    this.open();
  }

  open() {
    this.backdrop.classList.add('open');
    this.drawer.classList.add('open');
    this.drawer.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.backdrop.classList.remove('open');
    this.drawer.classList.remove('open');
    this.drawer.setAttribute('aria-hidden', 'true');
  }

  async save() {
    const brandName = this.querySelector('#name').value.trim();
    const brandDescription = this.querySelector('#desc').value.trim();

    if (!brandName) return alert('Vui lòng nhập tên thương hiệu');

    const btn = this.querySelector('#btnSave');
    btn.disabled = true;

    try {
      if (this.mode === 'create') {
        await createBrand({ brandName, brandDescription });
      } else {
        await updateBrand({
          brandId: this.current.brandId,
          brandName,
          brandDescription,
          isActive: this.current.isActive !== false // giữ trạng thái hiện tại
        });
      }

      this.dispatchEvent(new CustomEvent('brand-saved', { bubbles: true }));
      this.close();
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false;
    }
  }
}

customElements.define('brand-drawer', BrandDrawer);
export default BrandDrawer;
