import {
  getOrders,
  confirmOrder,
  shipOrder,
  cancelOrder,
  deleteOrder
} from '../../JS/API/orderAPI.js';

import { dinhVND } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';
import { esc } from '../../utils/escape.js';

const STATUS = {
  Pending: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: 4
};

function statusMeta(code) {
  const n = Number(code);
  if (n === 1) return { label: 'Pending', cls: 'pending' };
  if (n === 2) return { label: 'Shipped', cls: 'shipped' };
  if (n === 3) return { label: 'Delivered', cls: 'delivered' };
  if (n === 4) return { label: 'Cancelled', cls: 'cancelled' };
  return { label: String(code ?? ''), cls: 'pending' };
}

function dateOnly(v) {
  if (!v) return '';
  return String(v);
}

function allowedTargets(current) {
  const c = Number(current);
  if (c === STATUS.Pending) return [STATUS.Pending, STATUS.Shipped, STATUS.Cancelled];
  if (c === STATUS.Shipped) return [STATUS.Shipped, STATUS.Delivered, STATUS.Cancelled];
  if (c === STATUS.Delivered) return [STATUS.Delivered];
  if (c === STATUS.Cancelled) return [STATUS.Cancelled];
  return [c];
}

function statusLabel(code) {
  const n = Number(code);
  if (n === 1) return 'Pending';
  if (n === 2) return 'Shipped';
  if (n === 3) return 'Delivered';
  if (n === 4) return 'Cancelled';
  return String(code ?? '');
}

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

  async load() {
    try {
      const list = await getOrders();
      this.orders = Array.isArray(list) ? list : [];
      this.render();
    } catch (e) {
      console.error(e);
      this.orders = [];
      this.innerHTML = `
        <div class="order-table">
          <div class="small muted">Không tải được danh sách đơn hàng</div>
        </div>
      `;
      showToast(e?.message || 'Không tải được danh sách đơn hàng');
    }
  }

  renderStatusSelect(o) {
    const cur = Number(o.orderStatus);
    const id = esc(o.orderId);
    const options = allowedTargets(cur);

    const disabled = options.length === 1 ? 'disabled' : '';
    return `
      <select class="status-select" data-id="${id}" data-current="${cur}" ${disabled}>
        ${options.map(v => `
          <option value="${v}" ${v === cur ? 'selected' : ''}>
            ${esc(statusLabel(v))}
          </option>
        `).join('')}
      </select>
    `;
  }

  render() {
    this.innerHTML = `
      <div class="order-table">
        <div class="order-table__head">
          <div>
            <div class="order-table__title">Danh sách đơn hàng</div>
            <div class="order-table__hint">Total: ${this.orders.length}</div>
          </div>
        </div>

        <div class="order-table__wrap">
          <table>
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
                      <td colspan="6" class="muted" style="text-align:center">
                        Chưa có đơn hàng nào
                      </td>
                    </tr>
                  `
                  : this.orders.map(o => {
                      const s = statusMeta(o.orderStatus);
                      return `
                        <tr>
                          <td><strong>${esc(o.orderId)}</strong></td>
                          <td>${esc(o.customerId ?? '—')}</td>
                          <td>${esc(dateOnly(o.createdAt))}</td>
                          <td>${dinhVND(o.total ?? 0)}</td>
                          <td>
                            <span class="badge badge--${s.cls}">${esc(s.label)}</span>
                          </td>
                          <td class="actions">
                            <a class="link act-detail" href="#" data-id="${esc(o.orderId)}">Chi tiết</a>
                            ${this.renderStatusSelect(o)}
                            <button class="btn act-delete" data-id="${esc(o.orderId)}">Xóa</button>
                          </td>
                        </tr>
                      `;
                    }).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindActions();
  }

  bindActions() {
    const detail = document.querySelector('order-detail-drawer');

    this.querySelectorAll('.act-detail').forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        if (!detail) {
          showToast('Chưa có order-detail-drawer');
          return;
        }
        detail.open(a.dataset.id);
      };
    });

    this.querySelectorAll('.status-select').forEach(sel => {
      sel.onchange = async () => {
        const orderId = sel.dataset.id;
        const current = Number(sel.dataset.current);
        const target = Number(sel.value);

        try {
          if (target === current) return;

          // Map chuyển trạng thái theo backend
          if (current === STATUS.Pending && target === STATUS.Shipped) {
            await confirmOrder(orderId);
          } else if (current === STATUS.Shipped && target === STATUS.Delivered) {
            await shipOrder(orderId);
          } else if ((current === STATUS.Pending || current === STATUS.Shipped) && target === STATUS.Cancelled) {
            await cancelOrder(orderId);
          } else {
            // không hợp lệ → reset về current
            sel.value = String(current);
            showToast('Không hỗ trợ chuyển trạng thái này');
            return;
          }

          showToast('Đã cập nhật trạng thái');
          await this.load();
        } catch (e) {
          console.error(e);
          sel.value = String(current);
          showToast(e?.message || 'Cập nhật trạng thái thất bại');
        }
      };
    });

    this.querySelectorAll('.act-delete').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Xóa đơn hàng này?')) return;
        try {
          await deleteOrder(btn.dataset.id);
          showToast('Đã xóa đơn');
          await this.load();
        } catch (e) {
          console.error(e);
          showToast(e?.message || 'Xóa thất bại');
        }
      };
    });
  }
}

customElements.define('order-table', OrderTable);
export default OrderTable;
