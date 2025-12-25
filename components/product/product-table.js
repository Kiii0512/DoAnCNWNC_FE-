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

      // ✅ BẮT BUỘC normalize dữ liệu
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
      <div style="overflow:auto">
        <table id="bangSanPham">
          <thead>
            <tr>
              <th>Hình</th>
              <th>Mã / Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${
              this.products.length === 0
                ? `
                  <tr>
                    <td colspan="5" class="small muted" style="text-align:center">
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                `
                : this.products.map(p => `
                  <tr>
                    <td>
                      <img
                        class="thumb"
                        src="${esc(p.thumbnailUrl || '')}"
                        alt="${esc(p.productName || '')}"
                        onerror="this.src='https://via.placeholder.com/120x80?text=No+Image'"
                      >
                    </td>
                    <td>
                      <strong>${esc(p.productId)}</strong>
                      <div class="small muted">${esc(p.productName)}</div>
                    </td>
                    <td>${dinhVND(p.productPrice)}</td>
                    <td>${p.productStockQuantity ?? 0}</td>
                    <td>
                      <button
                        class="btn btn-ghost btn-detail"
                        data-id="${p.productId}">
                        Chi tiết
                      </button>
                      <button
                        class="btn btn-ghost btn-delete"
                        data-id="${p.productId}">
                        Xóa
                      </button>
                    </td>
                  </tr>
                `).join('')
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

    // 👁 Chi tiết → page xử lý
    this.querySelectorAll('.btn-detail').forEach(btn => {
      btn.onclick = () => {
        this.dispatchEvent(
          new CustomEvent('product-view', {
            detail: { productId: btn.dataset.id },
            bubbles: true
          })
        );
      };
    });
  }
}

customElements.define('product-table', ProductTable);
