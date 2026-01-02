import { createCategory, updateCategory } from '../../JS/API/categoryAPI.js';

class CategoryDrawer extends HTMLElement {
  connectedCallback() {
    this.mode = 'create';
    this.current = null;

    this.innerHTML = `
      <div class="drawer-backdrop"></div>
      <aside class="drawer" aria-hidden="true">
        <div class="head">
          <div style="font-weight:800" id="title">Tạo danh mục</div>
          <button class="btn btn-small btn-ghost" id="btnClose">Đóng</button>
        </div>

        <div class="body">
          <div class="fg">
            <label>Tên danh mục</label>
            <input id="name" placeholder="VD: Điện thoại" />

            <label>Mô tả</label>
            <textarea id="desc" placeholder="VD: Các sản phẩm điện thoại"></textarea>

            <div class="note">Tắt trạng thái bằng switch ở bảng để soft delete.</div>
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
    this.querySelector('#title').textContent = 'Tạo danh mục';
    this.querySelector('#name').value = '';
    this.querySelector('#desc').value = '';
    this.open();
  }

  openEdit(category) {
    this.mode = 'edit';
    this.current = category;
    this.querySelector('#title').textContent = `Sửa danh mục (${category?.categoryId || ''})`;
    this.querySelector('#name').value = category?.categoryName || '';
    this.querySelector('#desc').value = category?.categoryDescription || '';
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
    const categoryName = this.querySelector('#name').value.trim();
    const categoryDescription = this.querySelector('#desc').value.trim();

    if (!categoryName) return alert('Vui lòng nhập tên danh mục');

    const btn = this.querySelector('#btnSave');
    btn.disabled = true;

    try {
      if (this.mode === 'create') {
        await createCategory({ categoryName, categoryDescription });
      } else {
        await updateCategory({
          categoryId: this.current.categoryId,
          categoryName,
          categoryDescription,
          isActive: this.current.isActive !== false
        });
      }

      this.dispatchEvent(new CustomEvent('category-saved', { bubbles: true }));
      this.close();
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false;
    }
  }
}

customElements.define('category-drawer', CategoryDrawer);
export default CategoryDrawer;
