import { getRevenueByDay } from '../../JS/API/revenueAPI.js';
import { getOrders } from '../../JS/API/orderAPI.js';
import { dinhVND, offsetDateISO } from '../../utils/format.js';
import { showToast } from '../../utils/toast.js';

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODateOnly(iso) {
  // iso: 'YYYY-MM-DD'
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function isBetweenISO(dateISO, fromISO, toISO) {
  const t = parseISODateOnly(dateISO).getTime();
  const a = parseISODateOnly(fromISO).getTime();
  const b = parseISODateOnly(toISO).getTime();
  return t >= a && t <= b;
}

function addDaysISO(iso, days) {
  const d = parseISODateOnly(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function daysInRange(fromISO, toISO) {
  const out = [];
  let cur = fromISO;
  while (parseISODateOnly(cur).getTime() <= parseISODateOnly(toISO).getTime()) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return out;
}

function formatDM(iso) {
  const d = parseISODateOnly(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

function orderStatusLabel(status) {
  // EnumOrderStatus: 1 Pending, 2 Shipped, 3 Delivered, 4 Cancelled
  switch (Number(status)) {
    case 1: return { text: 'Đang chờ', cls: 'st-pending' };
    case 2: return { text: 'Đã gửi', cls: 'st-shipped' };
    case 3: return { text: 'Đã giao', cls: 'st-delivered' };
    case 4: return { text: 'Đã hủy', cls: 'st-cancelled' };
    default: return { text: `#${status}`, cls: 'st-unknown' };
  }
}

function downloadCsv(filename, rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const csv = rows.map(r => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Giới hạn concurrency để gọi nhiều ngày không quá “dồn”
async function pMap(items, limit, mapper) {
  const ret = new Array(items.length);
  let idx = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      ret[cur] = await mapper(items[cur], cur);
    }
  });

  await Promise.all(workers);
  return ret;
}

class ReportPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="report-wrap">
        <div class="card">
          <div class="page-head">
            <div class="page-title">
              <h2>Admin — Báo cáo / Export</h2>
              <div class="small">Báo cáo doanh thu cơ bản, lọc theo ngày, xuất CSV / PDF (mock)</div>
            </div>

            <div class="head-actions">
              <button class="btn btn-ghost" id="btnRefresh">Làm mới</button>
              <button class="btn btn-ghost" id="btnExportAll">Xuất CSV (toàn bộ)</button>
            </div>
          </div>

          <div class="filters">
            <div class="field">
              <label>Từ</label>
              <input type="date" id="fromDate" />
            </div>
            <div class="field">
              <label>Đến</label>
              <input type="date" id="toDate" />
            </div>

            <button class="btn btn-primary" id="btnApply">Áp dụng</button>

            <div class="presets" role="group" aria-label="Presets">
              <button class="btn btn-chip" data-preset="7">7 ngày</button>
              <button class="btn btn-chip" data-preset="30">30 ngày</button>
              <button class="btn btn-chip" data-preset="month">Tháng này</button>
              <button class="btn btn-chip" data-preset="all">Tất cả</button>
            </div>
          </div>

          <div class="kpi-grid" aria-label="KPI doanh thu">
            <div class="kpi">
              <div class="kpi-value" id="kpiRevenue">—</div>
              <div class="kpi-label">Doanh thu trong khoảng</div>
            </div>
            <div class="kpi">
              <div class="kpi-value" id="kpiOrders">—</div>
              <div class="kpi-label">Số đơn</div>
            </div>
            <div class="kpi">
              <div class="kpi-value" id="kpiAvg">—</div>
              <div class="kpi-label">Giá trị trung bình / đơn</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <section class="card chart-card">
            <div class="chart-head">
              <div>
                <strong>Doanh thu theo ngày</strong>
                <div class="small" id="chartHint">—</div>
              </div>
              <div class="chart-actions">
                <select id="rangeSelect" class="select">
                  <option value="7">7 ngày</option>
                  <option value="30" selected>30 ngày</option>
                </select>
              </div>
            </div>

            <div class="chart-box">
              <canvas id="revChart" height="120"></canvas>
            </div>
          </section>

          <aside class="card table-card">
            <div class="table-head">
              <div>
                <strong>Chi tiết đơn</strong>
              </div>
              <div class="table-actions">
                <button class="btn btn-ghost" id="btnExportFilter">Xuất CSV (filter)</button>
                <button class="btn btn-ghost" id="btnPdfMock">Xuất PDF (mock)</button>
              </div>
            </div>

            <div class="table-wrap">
              <table class="tbl">
                <thead>
                  <tr>
                    <th style="width:120px">Mã đơn</th>
                    <th style="width:110px">Ngày</th>
                    <th>Khách</th>
                    <th class="right" style="width:140px">Tổng</th>
                    <th style="width:140px">Trạng thái</th>
                  </tr>
                </thead>
                <tbody id="ordersBody">
                  <tr><td colspan="5" class="note">—</td></tr>
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </div>
    `;

    this.$from = this.querySelector('#fromDate');
    this.$to = this.querySelector('#toDate');

    this.$kpiRevenue = this.querySelector('#kpiRevenue');
    this.$kpiOrders = this.querySelector('#kpiOrders');
    this.$kpiAvg = this.querySelector('#kpiAvg');

    this.$ordersBody = this.querySelector('#ordersBody');
    this.$chartHint = this.querySelector('#chartHint');
    this.$rangeSelect = this.querySelector('#rangeSelect');

    this.$btnApply = this.querySelector('#btnApply');
    this.$btnRefresh = this.querySelector('#btnRefresh');
    this.$btnExportAll = this.querySelector('#btnExportAll');
    this.$btnExportFilter = this.querySelector('#btnExportFilter');
    this.$btnPdfMock = this.querySelector('#btnPdfMock');

    // Default: 30 ngày gần nhất
    const today = offsetDateISO(0);
    this.$to.value = today;
    this.$from.value = addDaysISO(today, -29);

    this.allOrders = [];
    this.filteredOrders = [];
    this.chart = null;

    this.$btnApply.onclick = () => this.apply();
    this.$btnRefresh.onclick = () => this.refresh();
    this.$btnExportAll.onclick = () => this.exportAllCsv();
    this.$btnExportFilter.onclick = () => this.exportFilterCsv();
    this.$btnPdfMock.onclick = () => showToast('PDF mock: hiện chưa triển khai');

    this.querySelectorAll('button[data-preset]').forEach(btn => {
      btn.onclick = () => this.applyPreset(btn.dataset.preset);
    });

    this.$rangeSelect.onchange = () => {
      // đổi nhanh range (7/30) dựa trên ngày "Đến"
      const to = this.$to.value || offsetDateISO(0);
      const n = Number(this.$rangeSelect.value || 30);
      this.$from.value = addDaysISO(to, -(n - 1));
      this.apply();
    };

    this.apply();
  }

  async refresh() {
    // reload orders + revenue theo filter hiện tại
    await this.apply(true);
  }

  applyPreset(preset) {
    const today = offsetDateISO(0);

    if (preset === '7') {
      this.$to.value = today;
      this.$from.value = addDaysISO(today, -6);
      this.$rangeSelect.value = '7';
    } else if (preset === '30') {
      this.$to.value = today;
      this.$from.value = addDaysISO(today, -29);
      this.$rangeSelect.value = '30';
    } else if (preset === 'month') {
      const d = new Date();
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      this.$from.value = toISODate(first);
      this.$to.value = today;
    } else if (preset === 'all') {
      // “Tất cả”: vẫn cần 1 khoảng để vẽ chart, nhưng table sẽ là all orders
      // ta set from rất xa, rồi khi filter sẽ show all.
      this.$from.value = '2000-01-01';
      this.$to.value = today;
    }

    this.apply();
  }

  getRange() {
    const from = (this.$from.value || '').trim();
    const to = (this.$to.value || '').trim();
    return { from, to };
  }

  validateRange(from, to) {
    if (!from || !to) return 'Vui lòng chọn đủ Từ/Đến';
    if (parseISODateOnly(from).getTime() > parseISODateOnly(to).getTime()) return 'Ngày "Từ" không được lớn hơn "Đến"';
    return '';
  }

  async apply(silent = false) {
    const { from, to } = this.getRange();
    const err = this.validateRange(from, to);
    if (err) { if (!silent) showToast(err); return; }

    this.setLoading(true);
    try {
      await this.loadOrders();
      this.filterOrders(from, to);
      this.renderOrdersTable();
      this.renderKPIs();

      await this.loadChartRevenue(from, to);
    } catch (e) {
      if (!silent) showToast(e?.message || 'Lỗi tải báo cáo');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    this.$btnApply.disabled = isLoading;
    this.$btnRefresh.disabled = isLoading;
    this.$btnExportAll.disabled = isLoading;
    this.$btnExportFilter.disabled = isLoading;
  }

  async loadOrders() {
    // lấy tất cả orders để filter client-side
    this.allOrders = await getOrders();
    if (!Array.isArray(this.allOrders)) this.allOrders = [];
  }

  filterOrders(from, to) {
    this.filteredOrders = this.allOrders
      .filter(o => o?.createdAt && isBetweenISO(o.createdAt, from, to))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  renderKPIs() {
    const sum = this.filteredOrders.reduce((acc, o) => acc + Number(o?.total ?? 0), 0);
    const cnt = this.filteredOrders.length;
    const avg = cnt > 0 ? (sum / cnt) : 0;

    this.$kpiRevenue.textContent = dinhVND(sum);
    this.$kpiOrders.textContent = String(cnt);
    this.$kpiAvg.textContent = dinhVND(avg);
  }

  renderOrdersTable() {
    if (!this.filteredOrders.length) {
      this.$ordersBody.innerHTML = `<tr><td colspan="5" class="note">Không có đơn trong khoảng ngày đã chọn</td></tr>`;
      return;
    }

    this.$ordersBody.innerHTML = this.filteredOrders.slice(0, 50).map(o => {
      const st = orderStatusLabel(o.orderStatus);
      const customer = o.customerId || '—'; // BE hiện chỉ có CustomerId
      return `
        <tr>
          <td class="mono" style="font-weight:800">${o.orderId ?? '—'}</td>
          <td class="small">${o.createdAt ?? '—'}</td>
          <td class="small">${customer}</td>
          <td class="right" style="font-weight:900">${dinhVND(o.total ?? 0)}</td>
          <td><span class="badge ${st.cls}">${st.text}</span></td>
        </tr>
      `;
    }).join('');
  }

  async loadChartRevenue(from, to) {
    // Chart chỉ nên vẽ tối đa ~30 ngày để nhẹ
    const maxDays = 30;
    let list = daysInRange(from, to);

    if (list.length > maxDays) {
      list = list.slice(list.length - maxDays);
      this.$chartHint.textContent = `${formatDM(list[0])} – ${formatDM(list[list.length - 1])} (tối đa ${maxDays} ngày để vẽ chart)`;
    } else {
      this.$chartHint.textContent = `${formatDM(from)} – ${formatDM(to)}`;
    }

    const labels = list.map(formatDM);

    // gọi /api/revenue/day cho từng ngày
    const totals = await pMap(list, 6, async (day) => {
      try {
        const v = await getRevenueByDay(day);
        return Number(v || 0);
      } catch {
        return 0;
      }
    });

    this.renderChart(labels, totals);
  }

  renderChart(labels, values) {
    const ctx = this.querySelector('#revChart');
    if (!ctx || !window.Chart) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.chart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Doanh thu',
            data: values,
            borderRadius: 10
          },
          {
            type: 'line',
            label: 'Trend',
            data: values,
            tension: 0.35,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${dinhVND(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => (Number(v) === 0 ? '0đ' : `${Number(v).toLocaleString('vi-VN')}đ`)
            },
            grid: { drawBorder: false }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  exportAllCsv() {
    if (!this.allOrders.length) { showToast('Không có dữ liệu để export'); return; }

    const rows = [
      ['OrderId', 'CreatedAt', 'CustomerId', 'Total', 'OrderStatus'],
      ...this.allOrders.map(o => [o.orderId, o.createdAt, o.customerId, o.total, o.orderStatus])
    ];

    downloadCsv('orders_all.csv', rows);
  }

  exportFilterCsv() {
    if (!this.filteredOrders.length) { showToast('Không có dữ liệu trong filter'); return; }
    const { from, to } = this.getRange();

    const rows = [
      ['OrderId', 'CreatedAt', 'CustomerId', 'Total', 'OrderStatus'],
      ...this.filteredOrders.map(o => [o.orderId, o.createdAt, o.customerId, o.total, o.orderStatus])
    ];

    downloadCsv(`orders_${from}_to_${to}.csv`, rows);
  }
}

customElements.define('report-page', ReportPage);
export default ReportPage;
