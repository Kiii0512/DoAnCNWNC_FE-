import { getAllDiscounts, deleteDiscount, updateDiscount } from '../../JS/API/discountApi.js';
import { showToast } from '../../utils/toast.js';

class DiscountTable extends HTMLElement {
  constructor() {
    super();
    this.discounts = [];
  }

  connectedCallback() {
    if (this._inited) return;
    this._inited = true;

    this.render();
    this.load();
  }

  async load() {
    try {
      this.discounts = await getAllDiscounts();
      this.renderTable();
    } catch (e) {
      console.error(e);
      showToast('Không tải được danh sách giảm giá');
    }
  }

  render() {
    this.innerHTML = `
      <div class="discount-table">
        <div class="discount-table__head">
          <div>
            <h3 class="discount-table__title">Danh sách khuyến mãi</h3>
            <p class="discount-table__hint">Quản lý và theo dõi các chương trình khuyến mãi</p>
          </div>
          <div class="discount-table__tools">
            <button class="btn btn--primary act-create">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Tạo mới
            </button>
          </div>
        </div>

        <div class="discount-table__wrap">
          <table class="discount-table">
            <thead>
              <tr>
                <th>Tên khuyến mãi</th>
                <th>Mã khuyến mãi</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Hành động</th>
                <th>Kích hoạt</th>
              </tr>
            </thead>
            <tbody class="dt-tbody">
              <!-- Rows will be inserted here -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTable() {
    const tbody = this.querySelector('.dt-tbody');
    if (!tbody) return;

    if (this.discounts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="dt-empty">Không có giảm giá nào</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.discounts.map(discount => `
      <tr data-id="${discount.discountId}">
        <td>${discount.discountName}</td>
        <td><code>${discount.discountCode}</code></td>
        <td>${this.getDiscountTypeLabel(discount.discountType)}</td>
        <td>${this.formatDiscountValue(discount)}</td>
        <td>
          <button class="btn btn--ghost act-view" data-id="${discount.discountId}">Xem chi tiết</button>
          <button class="btn btn--ghost act-edit" data-id="${discount.discountId}">Sửa</button>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" class="status-toggle" data-id="${discount.discountId}" ${discount.isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
      </tr>
    `).join('');

    this.bindRowEvents();
  }

  getDiscountTypeLabel(type) {
    const labels = {
      0: 'Phần trăm',
      1: 'Số tiền cố định',
      2: 'Miễn phí vận chuyển'
    };
    return labels[type] || 'Không xác định';
  }

  formatDiscountValue(discount) {
    if (discount.discountType === 0) {
      return `${discount.discountValue}%`;
    } else if (discount.discountType === 1) {
      return `${discount.discountValue.toLocaleString()} VND`;
    } else {
      return 'Miễn phí';
    }
  }

  bindEvents() {
    // Create button - always bind this regardless of table state
    const createBtn = this.querySelector('.act-create');
    if (createBtn) {
      createBtn.onclick = () => {
        const drawer = document.querySelector('discount-drawer');
        if (drawer) drawer.open();
      };
    }

    const searchInput = this.querySelector('.dt-search-input');
    const refreshBtn = this.querySelector('.dt-refresh');

    if (searchInput) {
      searchInput.oninput = () => this.filterDiscounts(searchInput.value);
    }

    if (refreshBtn) {
      refreshBtn.onclick = () => this.load();
    }
  }

  bindRowEvents() {
    // View Details buttons
    this.querySelectorAll('.act-view').forEach(btn => {
      btn.onclick = () => {
        const discountId = btn.dataset.id;
        const drawer = document.querySelector('discount-drawer');
        if (drawer) drawer.openView(discountId);
      };
    });

    // Edit buttons
    this.querySelectorAll('.act-edit').forEach(btn => {
      btn.onclick = () => {
        const discountId = btn.dataset.id;
        const drawer = document.querySelector('discount-drawer');
        if (drawer) drawer.openEdit(discountId);
      };
    });

    // Status toggle
    this.querySelectorAll('.status-toggle').forEach(checkbox => {
      checkbox.onchange = async () => {
        const discountId = checkbox.dataset.id;
        const newStatus = checkbox.checked;
        try {
          const discount = this.discounts.find(d => d.discountId === discountId);
          if (!discount) {
            showToast('Không tìm thấy giảm giá');
            return;
          }

          const updatedDiscount = { ...discount, isActive: newStatus };
          await updateDiscount(updatedDiscount);
          showToast(newStatus ? 'Đã kích hoạt khuyến mãi' : 'Đã vô hiệu hóa khuyến mãi');
          await this.load();
        } catch (e) {
          console.error(e);
          showToast(e?.message || 'Cập nhật thất bại');
          // Revert the checkbox state on error
          checkbox.checked = !newStatus;
        }
      };
    });
  }

  filterDiscounts(query) {
    const filtered = this.discounts.filter(discount =>
      discount.discountName.toLowerCase().includes(query.toLowerCase()) ||
      discount.discountCode.toLowerCase().includes(query.toLowerCase())
    );
    this.renderFilteredTable(filtered);
  }

  renderFilteredTable(filteredDiscounts) {
    const tbody = this.querySelector('.dt-tbody');
    if (!tbody) return;

    if (filteredDiscounts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="dt-empty">Không tìm thấy giảm giá nào</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredDiscounts.map(discount => `
      <tr data-id="${discount.discountId}">
        <td>${discount.discountName}</td>
        <td><code>${discount.discountCode}</code></td>
        <td>${this.getDiscountTypeLabel(discount.discountType)}</td>
        <td>${this.formatDiscountValue(discount)}</td>
        <td>
          <label class="switch">
            <input type="checkbox" class="status-toggle" data-id="${discount.discountId}" ${discount.isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="btn btn--ghost act-view" data-id="${discount.discountId}">Xem chi tiết</button>
          <button class="btn btn--ghost act-edit" data-id="${discount.discountId}">Sửa</button>
        </td>
      </tr>
    `).join('');

    this.bindRowEvents();
  }
}

customElements.define('discount-table', DiscountTable);
export default DiscountTable;