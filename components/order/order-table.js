import {
  getOrders,
  updateOrderStatus,
  deleteOrder
} from '../../JS/API/orderAPI.js';

import { dinhVND } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';
import { esc } from '../../utils/escape.js';

class OrderTable extends HTMLElement {
  constructor() {
    super();
    this.orders = [];
    this._loaded = false;
  }

  async connectedCallback() {
    if (this._loaded) return;
    this._loaded = true;
    await this.load();
  }

  /* ================= LOAD ================= */
  async load() {
    try {
      const res = await getOrders();

      this.orders = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      this.render();
    } catch (e) {
      console.error(e);
      this.orders = [];
      this.innerHTML = `
        <div class="error small muted">
          Không tải được danh sách đơn hàng
        </div>
      `;
      showToast('Không tải được danh sách đơn hàng');
    }
  }

  /* ================= RENDER ================= */
  render() {
    this.innerHTML = `
      <div class="table-wrapper">
        <table id="bangDonHang">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${
              this.orders.length === 0
                ? `
                  <tr>
                    <td colspan="6" class="small muted" style="text-align:center">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                `
                : this.orders.map(o => `
                  <tr>
                    <td><strong>${esc(o.orderId)}</strong></td>
                    <td>${esc(o.customerName ?? '—')}</td>
                    <td>${esc(o.createdAt ?? '')}</td>
                    <td>${dinhVND(o.totalAmount ?? 0)}</td>
                    <td>
                      <span class="status status-${(o.status || '').toLowerCase()}">
                        ${esc(o.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        class="btn btn-ghost btn-detail"
                        data-id="${o.orderId}">
                        Chi tiết
                      </button>

                      <select
                        class="status-select"
                        data-id="${o.orderId}">
                        ${this.renderStatusOptions(o.status)}
                      </select>

                      <button
                        class="btn btn-ghost btn-delete"
                        data-id="${o.orderId}">
                        Xóa
                      </button>
                    </td>
                  </tr>
                `).join('')
            }
          </tbody>
        </table>

        <div class="small muted" style="margin-top:8px">
          Total: ${this.orders.length}
        </div>
      </div>
    `;

    this.bindActions();
  }

  renderStatusOptions(current) {
    const statuses = [
      'PENDING',
      'CONFIRMED',
      'PACKING',
      'SHIPPING',
      'COMPLETED',
      'CANCELLED'
    ];

    return statuses.map(s => `
      <option value="${s}" ${s === current ? 'selected' : ''}>
        ${s}
      </option>
    `).join('');
  }

  /* ================= ACTIONS ================= */
  bindActions() {

    // 👁 Xem chi tiết đơn
    const detailDrawer = document.querySelector('order-detail-drawer');

    this.querySelectorAll('.btn-detail').forEach(btn => {
      btn.onclick = () => {
        if (!detailDrawer) {
          console.error('❌ order-detail-drawer chưa tồn tại');
          return;
        }
        detailDrawer.open(btn.dataset.id);
      };
    });

    // 🔄 Cập nhật trạng thái
    this.querySelectorAll('.status-select').forEach(sel => {
      sel.onchange = async () => {
        const orderId = sel.dataset.id;
        const status = sel.value;

        try {
          await updateOrderStatus(orderId, status);
          showToast('Đã cập nhật trạng thái đơn hàng');
          await this.load();
        } catch (e) {
          console.error(e);
          showToast('Cập nhật trạng thái thất bại');
        }
      };
    });

    // ❌ Xóa / hủy đơn
    this.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Xóa đơn hàng này?')) return;

        try {
          await deleteOrder(btn.dataset.id);
          showToast('Đã xóa đơn hàng');
          await this.load();
        } catch (e) {
          console.error(e);
          showToast('Xóa đơn hàng thất bại');
        }
      };
    });
  }
}

customElements.define('order-table', OrderTable);
export default OrderTable;
