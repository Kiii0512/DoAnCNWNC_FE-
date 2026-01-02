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

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

class OrderTable extends HTMLElement {
  constructor() {
    super();
    this._loaded = false;

    this.allOrders = [];
    this.viewOrders = [];

    this.keyword = '';
    this.statusFilter = 'all'; // all | 1 | 2 | 3 | 4
    this.selected = new Set(); // orderId
  }

  async connectedCallback() {
    if (this._loaded) return;
    this._loaded = true;
    await this.load();
  }

  setKeyword(keyword) {
    this.keyword = (keyword ?? '').trim();
    this.applyFilters();
    this.render();
  }

  setStatusFilter(val) {
    this.statusFilter = val;
    this.applyFilters();
    this.selected.clear();
    this.render();
  }

  applyFilters() {
    const kw = this.keyword.toLowerCase();

    this.viewOrders = (this.allOrders || []).filter(o => {
      const stOk = this.statusFilter === 'all'
        ? true
        : String(o.orderStatus) === String(this.statusFilter);

      if (!stOk) return false;

      if (!kw) return true;

      const orderId = String(o.orderId ?? '').toLowerCase();
      const customerId = String(o.customerId ?? '').toLowerCase();
      const customerName = String(o.customerName ?? '').toLowerCase(); // nếu backend trả
      return (
        orderId.includes(kw) ||
        customerId.includes(kw) ||
        customerName.includes(kw)
      );
    });
  }

  async load() {
    try {
      const list = await getOrders();
      this.allOrders = Array.isArray(list) ? list : [];
      this.applyFilters();
      this.selected.clear();
      this.render();
    } catch (e) {
      console.error(e);
      this.allOrders = [];
      this.viewOrders = [];
      this.selected.clear();
      this.innerHTML = `
        <div class="order-table">
          <div class="small muted">Không tải được danh sách đơn hàng</div>
        </div>
      `;
      showToast(e?.message || 'Không tải được danh sách đơn hàng');
    }
  }

  canTransition(from, to) {
    const f = Number(from), t = Number(to);
    if (f === t) return true;
    if (f === 1 && t === 2) return true; // confirm
    if (f === 2 && t === 3) return true; // ship -> delivered
    if ((f === 1 || f === 2) && t === 4) return true; // cancel
    return false;
  }

  async doTransition(orderId, fromStatus, toStatus) {
    const f = Number(fromStatus), t = Number(toStatus);
    if (f === t) return;

    if (!this.canTransition(f, t)) {
      showToast('Không thể chuyển trạng thái này theo backend hiện tại');
      return;
    }

    if (f === 1 && t === 2) await confirmOrder(orderId);
    else if (f === 2 && t === 3) await shipOrder(orderId);
    else if ((f === 1 || f === 2) && t === 4) await cancelOrder(orderId);

    showToast('Đã cập nhật trạng thái');
    await this.load();
  }

  getSelectedOrders() {
    const ids = this.selected;
    return this.viewOrders.filter(o => ids.has(String(o.orderId)));
  }

  exportCsv(selectedOnly = false) {
    const rows = selectedOnly ? this.getSelectedOrders() : this.viewOrders;

    if (!rows.length) {
      showToast(selectedOnly ? 'Chưa chọn đơn hàng nào' : 'Không có dữ liệu để xuất');
      return;
    }

    const header = [
      'OrderId', 'CustomerId', 'CustomerName', 'CreatedAt', 'Status', 'SubTotal', 'Discount', 'Total', 'ShippingAddress'
    ];

    const lines = [header.join(',')];

    rows.forEach(o => {
      const s = statusMeta(o.orderStatus).label;
      lines.push([
        csvEscape(o.orderId),
        csvEscape(o.customerId),
        csvEscape(o.customerName ?? ''),
        csvEscape(dateOnly(o.createdAt)),
        csvEscape(s),
        csvEscape(o.subTotal ?? ''),
        csvEscape(o.discountAmount ?? ''),
        csvEscape(o.total ?? ''),
        csvEscape(o.shippingAddress ?? '')
      ].join(','));
    });

    const bom = '\uFEFF';
    const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = selectedOnly ? 'orders_selected.csv' : 'orders.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  print(selectedOnly = false) {
    const rows = selectedOnly ? this.getSelectedOrders() : this.viewOrders;

    if (!rows.length) {
      showToast(selectedOnly ? 'Chưa chọn đơn hàng nào' : 'Không có dữ liệu để in');
      return;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Orders</title>
          <style>
            body{font-family: Arial, sans-serif; padding: 14px;}
            h2{margin:0 0 10px}
            table{width:100%; border-collapse:collapse; font-size:12px;}
            th,td{border:1px solid #ddd; padding:8px; text-align:left; vertical-align:middle;}
            th{background:#f5f5f5;}
          </style>
        </head>
        <body>
          <h2>Danh sách đơn hàng (${rows.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(o => {
                const s = statusMeta(o.orderStatus).label;
                return `
                  <tr>
                    <td>${esc(o.orderId)}</td>
                    <td>${esc(o.customerName ?? o.customerId ?? '—')}</td>
                    <td>${esc(dateOnly(o.createdAt))}</td>
                    <td>${esc(s)}</td>
                    <td>${esc(String(o.total ?? 0))}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    const w = window.open('', '_blank');
    if (!w) {
      showToast('Không mở được cửa sổ in (bị chặn popup)');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  render() {
    const orders = this.viewOrders;
    const allCount = orders.length;

    const checkedCount = Array.from(this.selected).filter(id =>
      orders.some(o => String(o.orderId) === String(id))
    ).length;

    const allChecked = allCount > 0 && checkedCount === allCount;

    this.innerHTML = `
      <div class="order-table">
        <div class="order-table__head">
          <div>
            <div class="order-table__title">Danh sách đơn hàng</div>
            <div class="order-table__hint">
              Total: ${allCount}
              ${this.keyword ? `• Keyword: "${esc(this.keyword)}"` : ''}
            </div>
          </div>

          <div class="order-table__tools">
            <select class="tool-select" id="stFilter" title="Lọc theo trạng thái">
              <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
              <option value="1" ${String(this.statusFilter) === '1' ? 'selected' : ''}>Pending</option>
              <option value="2" ${String(this.statusFilter) === '2' ? 'selected' : ''}>Shipped</option>
              <option value="3" ${String(this.statusFilter) === '3' ? 'selected' : ''}>Delivered</option>
              <option value="4" ${String(this.statusFilter) === '4' ? 'selected' : ''}>Cancelled</option>
            </select>

            <button class="btn" id="btnReload">Làm mới</button>
            <button class="btn" id="btnCsv">Xuất CSV</button>
            <button class="btn" id="btnPrint">${this.selected.size ? 'In chọn' : 'In'}</button>
            <button class="btn" id="btnCsvSelected" ${this.selected.size ? '' : 'disabled'}>Xuất chọn</button>
          </div>
        </div>

        <div class="order-table__wrap">
          <table>
            <thead>
              <tr>
                <th style="width:44px">
                  <input type="checkbox" id="chkAll" ${allChecked ? 'checked' : ''} />
                </th>
                <th>Mã đơn</th>
                <th>Khách</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${
                orders.length === 0
                  ? `
                    <tr>
                      <td colspan="7" class="muted" style="text-align:center">
                        Không có đơn hàng phù hợp
                      </td>
                    </tr>
                  `
                  : orders.map(o => {
                      const s = statusMeta(o.orderStatus);
                      const id = esc(o.orderId);
                      const isChecked = this.selected.has(String(o.orderId));

                      const customerText = o.customerName ?? o.customerId ?? '—';

                      return `
                        <tr>
                          <td>
                            <input class="chkRow" type="checkbox" data-id="${id}" ${isChecked ? 'checked' : ''} />
                          </td>

                          <td><strong>${id}</strong></td>
                          <td>${esc(customerText)}</td>
                          <td>${esc(dateOnly(o.createdAt))}</td>
                          <td>${dinhVND(o.total ?? 0)}</td>

                          <td>
                            <div class="status-cell">
                              <span class="badge badge--${s.cls}">${esc(s.label)}</span>

                              <select class="status-select" data-id="${id}" data-current="${esc(String(o.orderStatus))}">
                                <option value="1" ${Number(o.orderStatus)===1?'selected':''}>Pending</option>
                                <option value="2" ${Number(o.orderStatus)===2?'selected':''}>Shipped</option>
                                <option value="3" ${Number(o.orderStatus)===3?'selected':''}>Delivered</option>
                                <option value="4" ${Number(o.orderStatus)===4?'selected':''}>Cancelled</option>
                              </select>
                            </div>
                          </td>

                          <td class="actions">
                            <a class="link act-detail" href="#" data-id="${id}">Chi tiết</a>
                            <button class="btn act-delete" data-id="${id}">Xóa</button>
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

    this.querySelector('#btnReload').onclick = () => this.load();

    this.querySelector('#btnCsv').onclick = () => this.exportCsv(false);
    this.querySelector('#btnCsvSelected').onclick = () => this.exportCsv(true);

    this.querySelector('#btnPrint').onclick = () => {
      if (this.selected.size) this.print(true);
      else this.print(false);
    };

    this.querySelector('#stFilter').onchange = (e) => {
      this.setStatusFilter(e.target.value);
    };

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

    const chkAll = this.querySelector('#chkAll');
    chkAll.onchange = () => {
      if (chkAll.checked) {
        this.viewOrders.forEach(o => this.selected.add(String(o.orderId)));
      } else {
        this.viewOrders.forEach(o => this.selected.delete(String(o.orderId)));
      }
      this.render();
    };

    this.querySelectorAll('.chkRow').forEach(chk => {
      chk.onchange = () => {
        const id = String(chk.dataset.id);
        if (chk.checked) this.selected.add(id);
        else this.selected.delete(id);
        this.render();
      };
    });

    this.querySelectorAll('.status-select').forEach(sel => {
      sel.onchange = async () => {
        const orderId = sel.dataset.id;
        const fromStatus = sel.dataset.current;
        const toStatus = sel.value;

        try {
          await this.doTransition(orderId, fromStatus, toStatus);
        } catch (e) {
          console.error(e);
          showToast(e?.message || 'Cập nhật thất bại');
          await this.load();
        }
      };
    });
  }
}

customElements.define('order-table', OrderTable);
export default OrderTable;
