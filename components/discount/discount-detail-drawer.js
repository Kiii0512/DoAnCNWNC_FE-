import { getDiscountById } from '../../JS/API/discountApi.js';
import { showToast } from '../../utils/toast.js';
import { esc } from '../../utils/escape.js';

class DiscountDetailDrawer extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this.discount = null;
  }

  connectedCallback() {
    if (this._inited) return;
    this._inited = true;

    this.innerHTML = `
      <div class="dd-overlay" hidden></div>

      <aside class="dd-drawer" aria-hidden="true">
        <div class="dd-head">
          <div>
            <div class="dd-title">Chi tiết khuyến mãi</div>
            <div class="dd-sub muted">—</div>
          </div>
          <button class="btn btn-ghost dd-close" type="button">Đóng</button>
        </div>

        <div class="dd-body">
          <div class="muted small">Chưa chọn khuyến mãi</div>
        </div>
      </aside>
    `;

    this.$overlay = this.querySelector('.dd-overlay');
    this.$drawer  = this.querySelector('.dd-drawer');
    this.$close   = this.querySelector('.dd-close');
    this.$sub     = this.querySelector('.dd-sub');
    this.$body    = this.querySelector('.dd-body');

    this.$close.onclick = () => this.close();
    this.$overlay.onclick = () => this.close();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) this.close();
    });
  }

  async open(discountId) {
    if (!discountId) return;

    this._open = true;
    this.$overlay.hidden = false;
    this.$drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    this.$sub.textContent = `Mã khuyến mãi: ${discountId}`;
    this.$body.innerHTML = `<div class="muted small">Đang tải...</div>`;

    try {
      const discount = await getDiscountById(discountId);

      this.discount = discount;

      if (!discount) {
        this.$body.innerHTML = `<div class="muted small">Không tìm thấy khuyến mãi</div>`;
        return;
      }

      const typeText = this.getDiscountTypeLabel(discount.discountType);
      const valueText = this.formatDiscountValue(discount);
      const statusText = discount.isActive ? 'Hoạt động' : 'Không hoạt động';
      const created = this.formatDate(discount.createdAt);
      const updated = this.formatDate(discount.updatedAt);

      this.$body.innerHTML = `
        <div class="kv">
          <div class="k">Tên khuyến mãi</div><div class="v">${esc(discount.discountName ?? '—')}</div>
          <div class="k">Mã khuyến mãi</div><div class="v"><code>${esc(discount.discountCode ?? '—')}</code></div>
          <div class="k">Loại</div><div class="v">${esc(typeText)}</div>
          <div class="k">Giá trị</div><div class="v">${esc(valueText)}</div>
          <div class="k">Trạng thái</div><div class="v">${esc(statusText)}</div>
          <div class="k">Ngày tạo</div><div class="v">${esc(created)}</div>
          <div class="k">Ngày cập nhật</div><div class="v">${esc(updated)}</div>
          <div class="k">Mô tả</div><div class="v">${esc(discount.description ?? '—')}</div>
          <div class="k">Điều kiện áp dụng</div><div class="v">${esc(discount.conditions ?? '—')}</div>
        </div>

        <div class="divider"></div>

        <div class="detail-title">Thống kê sử dụng</div>
        <div class="kv">
          <div class="k">Số lần sử dụng</div><div class="v">${esc(String(discount.usageCount ?? 0))}</div>
          <div class="k">Giới hạn sử dụng</div><div class="v">${esc(discount.usageLimit ? String(discount.usageLimit) : 'Không giới hạn')}</div>
          <div class="k">Ngày bắt đầu</div><div class="v">${esc(this.formatDate(discount.startDate))}</div>
          <div class="k">Ngày kết thúc</div><div class="v">${esc(this.formatDate(discount.endDate))}</div>
        </div>
      `;
    } catch (e) {
      console.error(e);
      showToast('Không tải được chi tiết khuyến mãi');
      this.$body.innerHTML = `<div class="muted small">Không tải được chi tiết khuyến mãi</div>`;
    }
  }

  close() {
    this._open = false;
    this.$overlay.hidden = true;
    this.$drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
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

  formatDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('vi-VN');
    } catch {
      return String(d);
    }
  }
}

customElements.define('discount-detail-drawer', DiscountDetailDrawer);
export default DiscountDetailDrawer;