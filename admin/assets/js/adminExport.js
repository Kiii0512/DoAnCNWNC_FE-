/* adminExport.js
   Logic cho trang "Admin — Báo cáo / Export"
   - Dùng chung helpers: taiDon, luuDon, dinhVND, formatDisplayDate, todayISO, addDaysISO, tinhTongDon (nếu có)
   - Dùng drawChart từ bieuDo.js (nếu đã nạp)
   - Chú thích tiếng Việt, resilient nếu helper không có
*/
'use strict';

(function () {
  // ---------- Fallbacks / link tới helpers chung (duLieuUtils, giaoDienUtils, xuatUtils) ----------
  const _taiDon = (typeof window.taiDon === 'function') ? window.taiDon : function () {
    try { return JSON.parse(localStorage.getItem(window.KHOA_ADMIN || 'admin_donhang_demo')) || []; } catch (e) { return []; }
  };
  const _dinhVND = (typeof window.dinhVND === 'function') ? window.dinhVND : function (n) { return (Number(n) || 0).toLocaleString('vi-VN') + '₫'; };
  const _tinhTongDon = (typeof window.tinhTongDon === 'function') ? window.tinhTongDon : function (o) {
    if (!o || !Array.isArray(o.items)) return 0;
    return o.items.reduce((s, it) => {
      const price = Number(it.price ?? it.gia ?? 0) || 0;
      const qty = Number(it.qty ?? it.soLuong ?? 1) || 0;
      return s + price * qty;
    }, 0);
  };
  const _formatDisplayDate = (typeof window.formatDisplayDate === 'function') ? window.formatDisplayDate : function (s) { return (s || '').toString().slice(0, 10); };
  const _todayISO = (typeof window.todayISO === 'function') ? window.todayISO : function () { return (new Date()).toISOString().slice(0, 10); };
  const _addDaysISO = (typeof window.addDaysISO === 'function') ? window.addDaysISO : function (iso, days) {
    try { const d = new Date((iso || _todayISO()) + 'T00:00:00'); d.setDate(d.getDate() + Number(days)); return d.toISOString().slice(0, 10); } catch (e) { return null; }
  };

  const _showToast = (typeof window.showToast === 'function') ? window.showToast : function (m, ms) { try { console.log('TOAST:', m); } catch (e) {} };
  const _exportCSV = (typeof window.exportCSV === 'function') ? window.exportCSV : ((typeof window.xuatCSV === 'function') ? window.xuatCSV : null);
  const _exportPDFMock = (typeof window.exportPDFMock === 'function') ? window.exportPDFMock : ((typeof window.xuatPDFMock === 'function') ? window.xuatPDFMock : null);
  const _drawChart = (typeof window.drawChart === 'function') ? window.drawChart : null;

  // ---------- Helpers nội bộ ----------
  function parseDateISO(s) {
    if (!s) return null;
    try { return (typeof s === 'string' && s.length >= 10) ? s.slice(0, 10) : null; } catch (e) { return null; }
  }

  // Lấy đơn đã lọc theo ngày (sử dụng normalize/compare trong duLieuUtils nếu có)
  function filterTheoKhoangClient(orders, tu, den) {
    if (!orders || !Array.isArray(orders)) return [];
    if (!tu && !den) return orders.slice();
    const t = tu ? new Date(tu + 'T00:00:00').getTime() : -8640000000000000;
    const d = den ? new Date(den + 'T23:59:59').getTime() : 8640000000000000;
    return orders.filter(o => {
      const iso = (typeof window.orderDateISO === 'function') ? window.orderDateISO(o) : parseDateISO(o?.ngay);
      if (!iso) return false;
      const ms = new Date(iso + 'T00:00:00').getTime();
      return !isNaN(ms) && ms >= t && ms <= d;
    });
  }

  // Tính doanh thu theo ngày: trả về mảng {ngay: 'YYYY-MM-DD', total: number} sắp xếp tăng dần theo ngày
  function tinhDoanhThuTheoNgay(orders) {
    const map = Object.create(null);
    (orders || []).forEach(o => {
      const iso = (typeof window.orderDateISO === 'function') ? window.orderDateISO(o) : parseDateISO(o?.ngay) || 'unknown';
      const t = _tinhTongDon(o) || 0;
      if (!map[iso]) map[iso] = 0;
      map[iso] += t;
    });
    const keys = Object.keys(map).filter(k => k !== 'unknown').sort();
    const arr = keys.map(k => ({ ngay: k, total: map[k] }));
    if (map['unknown']) arr.push({ ngay: 'unknown', total: map['unknown'] });
    return arr;
  }

  // Cập nhật KPI (Doanh thu tổng, số đơn, giá trị trung bình)
  function capNhatKPI(orders) {
    const soDon = (orders || []).length;
    const tong = (orders || []).reduce((s, o) => s + (_tinhTongDon(o) || 0), 0);
    const tb = soDon ? Math.round(tong / soDon) : 0;
    const elTong = document.getElementById('baoCaoTongDoanhThu');
    const elSoDon = document.getElementById('baoCaoSoDon');
    const elDonTB = document.getElementById('baoCaoDonTB');
    if (elTong) elTong.textContent = _dinhVND(tong);
    if (elSoDon) elSoDon.textContent = String(soDon);
    if (elDonTB) elDonTB.textContent = _dinhVND(tb);
  }

  // Render bảng chi tiết (giới hạn 200 dòng để performance)
  function renderBangDon(orders) {
    const tbody = document.querySelector('#bangBaoCao tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const rows = (orders || []).slice(0, 200);
    rows.forEach(o => {
      const tr = document.createElement('tr');
      const total = _tinhTongDon(o);
      tr.innerHTML = `
        <td><strong>${o.id || '—'}</strong></td>
        <td class="small muted">${_formatDisplayDate(o.ngay)}</td>
        <td>${o.ten || '—'}<div class="small muted">${o.sdt || ''}</div></td>
        <td style="font-weight:700;text-align:right">${_dinhVND(total)}</td>
        <td class="small muted">${(o.trangThai ? (o.trangThai === 'dang-cho' ? 'Đang chờ' : (o.trangThai === 'da-xac-nhan' ? 'Đã xác nhận' : o.trangThai)) : '—')}</td>
      `;
      tbody.appendChild(tr);
    });
    if ((orders || []).length > 200) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" class="small muted">Hiển thị 200 đơn đầu (trong tổng ${(orders || []).length}).</td>`;
      tbody.appendChild(tr);
    }
  }

  // Lấy orders đã lọc theo input ngày
  function layDonDaLoc() {
    const arr = _taiDon() || [];
    const tu = document.getElementById('ngayBatDau')?.value || null;
    const den = document.getElementById('ngayKetThuc')?.value || null;
    const filtered = (typeof window.filterTheoKhoang === 'function') ? window.filterTheoKhoang(arr, tu, den) : filterTheoKhoangClient(arr, tu, den);
    // sort desc theo ngày (dùng helper nếu có)
    if (typeof window.sortOrdersByDateDesc === 'function') return window.sortOrdersByDateDesc(filtered);
    return filtered.slice().sort((a, b) => {
      const ai = (typeof window.orderDateISO === 'function') ? window.orderDateISO(a) : parseDateISO(a?.ngay);
      const bi = (typeof window.orderDateISO === 'function') ? window.orderDateISO(b) : parseDateISO(b?.ngay);
      const ta = ai ? new Date(ai + 'T00:00:00').getTime() : -8640000000000000;
      const tb = bi ? new Date(bi + 'T00:00:00').getTime() : -8640000000000000;
      return tb - ta;
    });
  }

  // Cập nhật toàn bộ báo cáo (KPI, bảng, biểu đồ)
  function capNhatBaoCao() {
    const arr = layDonDaLoc();
    capNhatKPI(arr);
    renderBangDon(arr);
    const data = tinhDoanhThuTheoNgay(arr);
    if (_drawChart) {
      try { _drawChart(data); } catch (e) { console.warn('drawChart lỗi', e); }
    } else {
      // Nếu không có drawChart, hiển thị thông báo trong canvas
      const canvas = document.getElementById('bieuDo');
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(100, rect.width || 600);
        const h = Math.max(120, rect.height || 220);
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#6b7280';
        ctx.font = '13px Inter, Arial';
        ctx.fillText('Biểu đồ không khả dụng (drawChart chưa được nạp)', 14, 40);
      }
    }
  }

  // ---------- Thiết lập ngày mặc định (30 ngày) ----------
  function khoiTaoNgayMacDinh() {
    const ketThuc = _todayISO();
    const batDau = _addDaysISO(ketThuc, -29);
    const elTu = document.getElementById('ngayBatDau');
    const elDen = document.getElementById('ngayKetThuc');
    if (elTu) elTu.value = batDau || '';
    if (elDen) elDen.value = ketThuc || '';
  }

  // ---------- Bind UI ----------

  // nút Áp dụng
  document.getElementById('nutLoc')?.addEventListener('click', () => {
    capNhatBaoCao();
  });

  // Nút làm mới
  document.getElementById('btnLamMoi')?.addEventListener('click', () => {
    renderFull();
    _showToast('Đã làm mới');
  });

  // Nút xuất toàn bộ CSV
  document.getElementById('btnXuatToanBoCSV')?.addEventListener('click', () => {
    const all = (typeof window.sortOrdersByDateDesc === 'function') ? window.sortOrdersByDateDesc(_taiDon()) : (_taiDon() || []);
    if (_exportCSV) _exportCSV(all, 'bao_cao_toan_bo.csv');
    else _showToast('Chức năng xuất CSV chưa sẵn sàng');
  });

  // Nút xuất filter CSV
  document.getElementById('btnXuatFilterCSV')?.addEventListener('click', () => {
    const arr = layDonDaLoc();
    if (_exportCSV) _exportCSV(arr, 'bao_cao_loc.csv');
    else _showToast('Chức năng xuất CSV chưa sẵn sàng');
  });

  // Nút xuất PDF (mock)
  document.getElementById('btnXuatPDF')?.addEventListener('click', () => {
    const arr = layDonDaLoc();
    if (_exportPDFMock) _exportPDFMock(arr, 'Báo cáo doanh thu (filter)');
    else _showToast('Chức năng xuất PDF chưa sẵn sàng');
  });

  // nút range nhanh (7,30,this-month,all)
  document.querySelectorAll('.filters button[data-range]').forEach(b => {
    b.addEventListener('click', () => {
      const v = b.dataset.range;
      const today = _todayISO();
      if (v === '7') {
        document.getElementById('ngayBatDau').value = _addDaysISO(today, -6);
        document.getElementById('ngayKetThuc').value = today;
      } else if (v === '30') {
        document.getElementById('ngayBatDau').value = _addDaysISO(today, -29);
        document.getElementById('ngayKetThuc').value = today;
      } else if (v === 'this-month') {
        const d = new Date();
        const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
        document.getElementById('ngayBatDau').value = first;
        document.getElementById('ngayKetThuc').value = today;
      } else {
        document.getElementById('ngayBatDau').value = '';
        document.getElementById('ngayKetThuc').value = '';
      }
      capNhatBaoCao();
    });
  });

  // Khi thay đổi ngày bằng tay -> cập nhật
  document.getElementById('ngayBatDau')?.addEventListener('change', capNhatBaoCao);
  document.getElementById('ngayKetThuc')?.addEventListener('change', capNhatBaoCao);

  // ---------- Render full (khởi tạo) ----------
  function renderFull() {
    // set ngày mặc định nếu chưa có
    try { if (document.getElementById('ngayBatDau') && document.getElementById('ngayKetThuc')) { khoiTaoNgayMacDinh(); } } catch (e) {}
    capNhatBaoCao();
  }

  // Resize observer / window resize -> redraw chart nếu có
  (function setupResizeHandling() {
    const canvas = document.getElementById('bieuDo');
    if (!canvas) return;
    window.addEventListener('resize', () => {
      try {
        const lastData = canvas._lastChartData || null;
        if (_drawChart && lastData) _drawChart(lastData, -1);
      } catch (e) { /* ignore */ }
    });
  })();

  // ---------- Khởi tạo ngay khi nạp file ----------
  try {
    renderFull();
  } catch (e) {
    console.warn('adminExport: lỗi khi khởi tạo', e);
  }

  // exposed for debugging / manual refresh
  window.__adminExport = {
    refresh: capNhatBaoCao,
    layDonDaLoc,
    tinhDoanhThuTheoNgay
  };

})();
