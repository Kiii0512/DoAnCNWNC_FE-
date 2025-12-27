import { getProducts, deleteProduct } from '../../JS/API/productAPI.js';
import { dinhVND } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';
import { esc } from '../../utils/escape.js';

class ProductTable extends HTMLElement {
  constructor() {
    super();
    this.products = [];
    this._loaded = false;
  }

  async connectedCallback() {
    if (this._loaded) return;
    this._loaded = true;
    await this.load();
  }

  async load() {
    try {
      const res = await getProducts();

      this.products = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      this.render();
    } catch (e) {
      console.error(e);
      this.products = [];
      this.innerHTML = `
        <div class="error small muted">
          Không tải được danh sách sản phẩm
        </div>
      `;
      showToast('Không tải được danh sách sản phẩm');
    }
  }

  render() {
  this.innerHTML = `
    <div class="table-wrapper">
      <table id="bangSanPham">
        <thead>
          <tr>
            <th>Hình</th>
            <th>Mã / Tên</th>
            <th>Danh mục / Hãng</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th> <!-- 🔴 THÊM -->
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${
            this.products.length === 0
              ? `
                <tr>
                  <td colspan="7" class="small muted" style="text-align:center">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              `
              : this.products.map(p => {
                  const thumb =
                    p.images?.find(i => i.isMain)?.imageUrl ||
                    p.thumbnailUrl ||
                    '';

                  const active = p.isActive !== false; // mặc định true

                  return `
                    <tr class="${active ? '' : 'row-inactive'}">
                      <td>
                        <img
                          class="thumb"
                          src="${esc(thumb)}"
                          alt="${esc(p.productName || '')}"
                          onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'"
                        >
                      </td>
                      <td>
                        <strong>${esc(p.productId)}</strong>
                        <div class="small muted">${esc(p.productName)}</div>
                      </td>
                      <td>
                        <div>${esc(p.categoryName ?? '')}</div>
                        <div class="small muted">${esc(p.brandName ?? '')}</div>
                      </td>
                      <td>${dinhVND(p.productPrice)}</td>
                      <td>${p.totalStock ?? 0}</td>

                      <!-- 🔴 CỘT ACTIVE -->
                      <td>
                        <span class="status-badge ${active ? 'active' : 'inactive'}">
                          ${active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      <td>
                        <button
                          class="btn btn-ghost btn-detail btn-allow"
                          data-id="${p.productId}">
                          Chi tiết
                        </button>


                        ${
                          active
                            ? `
                              <button
                                class="btn btn-ghost btn-delete"
                                data-id="${p.productId}">
                                Xóa
                              </button>
                            `
                            : `
                              <span class="small muted">Đã ẩn</span>
                            `
                        }
                      </td>
                    </tr>
                  `;
                }).join('')
          }
        </tbody>
      </table>

      <div class="small muted" style="margin-top:8px">
        Total: ${this.products.length}
      </div>
    </div>
  `;

  this.bindActions();
}

  bindActions() {
    // ❌ Xóa
    this.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Xóa sản phẩm này?')) return;

        try {
          await deleteProduct(btn.dataset.id);
          showToast('Đã xóa sản phẩm');
          await this.load();
        } catch (e) {
          console.error(e);
          showToast('Xóa thất bại');
        }
      };
    });

    // 👁 Chi tiết
    const detailDrawer = document.querySelector('product-detail-drawer');

    this.querySelectorAll('.btn-detail').forEach(btn => {
      btn.onclick = () => {
        if (!detailDrawer) {
          console.error('❌ product-detail-drawer chưa tồn tại trong DOM');
          return;
        }
        detailDrawer.open(btn.dataset.id);
      };
    });
  }
}

customElements.define('product-table', ProductTable);
export default ProductTable;
