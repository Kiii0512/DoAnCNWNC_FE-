import { getOrderById } from '../../JS/API/orderAPI.js';
import { dinhVND } from '../../utils/format.js';
import { esc } from '../../utils/escape.js';
import { showToast } from '../../utils/toast.js';

class OrderDetailDrawer extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this.order = null;
  }

  connectedCallback() {
    if (this._inited) return;
    this._inited = true;

    this.innerHTML = `
      <div class="od-overlay" hidden></div>

      <aside class="od-drawer" aria-hidden="true">
        <div class="od-head">
          <div>
            <div class="od-title">Chi tiết đơn hàng</div>
            <div class="od-sub muted">—</div>
          </div>
          <button class="btn btn-ghost od-close" type="button">Đóng</button>
        </div>

        <div class="od-body">
          <div class="muted small">Chưa chọn đơn hàng</div>
        </div>
      </aside>
    `;

    this.$overlay = this.querySelector('.od-overlay');
    this.$drawer  = this.querySelector('.od-drawer');
    this.$close   = this.querySelector('.od-close');
    this.$sub     = this.querySelector('.od-sub');
    this.$body    = this.querySelector('.od-body');

    this.$close.onclick = () => this.close();
    this.$overlay.onclick = () => this.close();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) this.close();
    });
  }

  async open(orderId) {
    if (!orderId) return;

    this._open = true;
    this.$overlay.hidden = false;
    this.$drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    this.$sub.textContent = `Mã đơn: ${orderId}`;
    this.$body.innerHTML = `<div class="muted small">Đang tải...</div>`;

    try {
      const res = await getOrderById(orderId);

      const o = res?.data ?? res?.Data ?? res;

      this.order = o;

      if (!o) {
        this.$body.innerHTML = `<div class="muted small">Không tìm thấy đơn hàng</div>`;
        return;
      }

      const statusText = this.mapStatus(o.orderStatus);
      const created = this.formatDate(o.createdAt);
      const total = o.total ?? 0;

      this.$body.innerHTML = `
        <div class="kv">
          <div class="k">Trạng thái</div><div class="v">${esc(statusText)}</div>
          <div class="k">Ngày đặt</div><div class="v">${esc(created)}</div>
          <div class="k">Khách hàng</div><div class="v">${esc(o.customerId ?? '—')}</div>
          <div class="k">Địa chỉ</div><div class="v">${esc(o.shippingAddress ?? '—')}</div>
          <div class="k">Ghi chú</div><div class="v">${esc(o.note ?? '—')}</div>
          <div class="k">Tạm tính</div><div class="v">${dinhVND(o.subTotal ?? 0)}</div>
          <div class="k">Giảm giá</div><div class="v">${dinhVND(o.discountAmount ?? 0)}</div>
          <div class="k">Tổng tiền</div><div class="v"><strong>${dinhVND(total)}</strong></div>
        </div>

        <div class="divider"></div>

        <div class="detail-title">Sản phẩm</div>
        <div class="items">
          ${(o.items ?? []).map(it => `
            <div class="item">
              <div><strong>${esc(it.variationId)}</strong></div>
              <div class="muted small">SL: ${esc(String(it.quantity))}</div>
              <div class="muted small">Đơn giá: ${dinhVND(it.unitPrice ?? 0)}</div>
              <div class="muted small">Thành tiền: ${dinhVND(it.total ?? ((it.unitPrice ?? 0) * (it.quantity ?? 0)))}</div>
            </div>
          `).join('') || `<div class="muted small">Không có item</div>`}
        </div>
      `;
    } catch (e) {
      console.error(e);
      showToast('Không tải được chi tiết đơn hàng');
      this.$body.innerHTML = `<div class="muted small">Không tải được chi tiết đơn hàng</div>`;
    }
  }

  close() {
    this._open = false;
    this.$overlay.hidden = true;
    this.$drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  mapStatus(orderStatus) {
    const n = Number(orderStatus);
    if (n === 1) return 'PENDING';
    if (n === 2) return 'SHIPPED';
    if (n === 3) return 'DELIVERED';
    if (n === 4) return 'CANCELLED';
    return 'UNKNOWN';
  }

  formatDate(d) {
    if (!d) return '';
    return String(d);
  }
}

customElements.define('order-detail-drawer', OrderDetailDrawer);
export default OrderDetailDrawer;
