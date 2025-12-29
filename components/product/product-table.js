import {
  getProducts,
  deleteProduct,
  searchProducts
} from '../../JS/API/productAPI.js';

import { dinhVND } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';
import { esc } from '../../utils/escape.js';

class ProductTable extends HTMLElement {
  constructor() {
    super();
    this.products = [];
    this._loaded = false;

    // 🔴 Pagination state
    this.currentPage = 1;
    this.pageSize = 10;

    // 🔎 Filter state
    this.isFiltering = false;
    this.lastSearchDto = null;
  }

  async connectedCallback() {
    if (this._loaded) return;
    this._loaded = true;
    await this.load();
  }

  /* ================= LOAD ALL ================= */
  async load() {
    try {
      this.isFiltering = false;
      this.lastSearchDto = null;

      const res = await getProducts();

      this.products = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      this.currentPage = 1;
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

  /* ================= APPLY FILTER ================= */
  async applyFilter(searchDto) {
    try {
      this.isFiltering = true;
      this.lastSearchDto = searchDto;

      const res = await searchProducts(searchDto);

      this.products = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      this.currentPage = 1;
      this.render();
    } catch (e) {
      console.error(e);
      showToast('Lọc sản phẩm thất bại');
    }
  }

  /* ================= PAGINATION ================= */
  getPagedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  renderPagination() {
    const totalPages = Math.ceil(this.products.length / this.pageSize);
    if (totalPages <= 1) return '';

    return `
      <div class="pagination">
        <button
          class="page-btn"
          ${this.currentPage === 1 ? 'disabled' : ''}
          data-page="${this.currentPage - 1}">
          ‹
        </button>

        ${Array.from({ length: totalPages }, (_, i) => `
          <button
            class="page-btn ${this.currentPage === i + 1 ? 'active' : ''}"
            data-page="${i + 1}">
            ${i + 1}
          </button>
        `).join('')}

        <button
          class="page-btn"
          ${this.currentPage === totalPages ? 'disabled' : ''}
          data-page="${this.currentPage + 1}">
          ›
        </button>
      </div>
    `;
  }

  bindPagination() {
    this.querySelectorAll('.page-btn').forEach(btn => {
      btn.onclick = () => {
        const page = Number(btn.dataset.page);
        if (!page) return;
        this.currentPage = page;
        this.render();
      };
    });
  }

  /* ================= RENDER ================= */
  render() {
    const paged = this.getPagedProducts();

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
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${
              paged.length === 0
                ? `
                  <tr>
                    <td colspan="7" class="small muted" style="text-align:center">
                      ${this.isFiltering ? 'Không có sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                    </td>
                  </tr>
                `
                : paged.map(p => {
                    const thumb =
                      p.images?.find(i => i.isMain)?.imageUrl ||
                      p.thumbnailUrl ||
                      '';

                    const active = p.isActive !== false;

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
                              : `<span class="small muted">Đã ẩn</span>`
                          }
                        </td>
                      </tr>
                    `;
                  }).join('')
            }
          </tbody>
        </table>

        ${this.renderPagination()}

        <div class="small muted" style="margin-top:8px">
          Total: ${this.products.length}
        </div>
      </div>
    `;

    this.bindActions();
    this.bindPagination();
  }

  /* ================= ACTIONS ================= */
  bindActions() {
    // ❌ DELETE
    this.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Xóa sản phẩm này?')) return;

        try {
          await deleteProduct(btn.dataset.id);
          showToast('Đã xóa sản phẩm');

          // nếu đang lọc → lọc lại
          if (this.isFiltering && this.lastSearchDto) {
            await this.applyFilter(this.lastSearchDto);
          } else {
            await this.load();
          }
        } catch (e) {
          console.error(e);
          showToast('Xóa thất bại');
        }
      };
    });

    // 👁 DETAIL
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
