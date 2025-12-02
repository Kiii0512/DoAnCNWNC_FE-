/* xuatUtils.js
   Hàm xuất CSV và mock PDF (dùng chung cho adminOrder & adminExport)
   - Bao gồm: exportCSV (tên vi: xuatCSV) và exportPDFMock (tên vi: xuatPDFMock)
   - Các hàm dùng chung như dinhVND, formatDisplayDate, tinhTongDon được lấy từ duLieuUtils.js (nếu tồn tại)
   - Bình luận/ghi chú bằng tiếng Việt
*/
(function () {
  'use strict';

  // Helper: escape CSV cell (quote if cần, gộp dấu " thành "")
  function csvCell(v) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    // nếu chứa dấu " thì thay bằng ""
    const escaped = s.replace(/"/g, '""');
    // nếu chứa dấu phẩy, xuống dòng hoặc dấu ngoặc kép -> bọc trong ""
    if (/[",\r\n]/.test(s)) return `"${escaped}"`;
    return escaped;
  }

  // Helper: tạo chuỗi mô tả các sản phẩm trong order (ví dụ: "iPhone x1 | Cáp x2")
  function itemsToText(items) {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.map(it => {
      const title = it.title || it.name || it.productName || '';
      const qty = (it.qty ?? it.soLuong ?? it.quantity ?? 1);
      return `${title} x${qty}`;
    }).join(' | ');
  }

  // Export CSV chính (tên JS: exportCSV). alias xuatCSV để tương thích tiếng Việt
  // rows: mảng object order
  // tenfile: tên file mặc định 'bao_cao.csv'
  function exportCSV(rows, tenfile = 'bao_cao.csv') {
    try {
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        // nếu có showToast thì dùng, nếu không dùng alert
        if (window.showToast) window.showToast('Không có dữ liệu để xuất');
        else alert('Không có dữ liệu để xuất');
        return;
      }

      // header mặc định (bạn có thể thay đổi theo yêu cầu)
      const keys = ['id', 'ten', 'sdt', 'phuongThuc', 'diaChi', 'ngay', 'trangThai', 'tong', 'items'];
      const header = ['Mã', 'Khách', 'SĐT', 'Hình thức', 'Địa chỉ', 'Ngày', 'Trạng thái', 'Tổng', 'Sản phẩm'];

      const lines = [];
      lines.push(header.map(csvCell).join(','));

      const computeTotal = (r) => {
        if (typeof window.tinhTongDon === 'function') return window.tinhTongDon(r);
        // fallback: tính thủ công
        if (!r || !Array.isArray(r.items)) return 0;
        return r.items.reduce((s, it) => {
          const price = Number(it.price ?? it.gia ?? it.priceVN ?? 0) || 0;
          const qty = Number(it.qty ?? it.soLuong ?? it.quantity ?? 1) || 0;
          return s + price * qty;
        }, 0);
      };

      rows.forEach(r => {
        const total = computeTotal(r);
        const items = itemsToText(r.items);
        // format ngày nếu có formatDisplayDate
        const ngay = (typeof window.formatDisplayDate === 'function') ? window.formatDisplayDate(r.ngay) : (r.ngay || '');
        const lineArr = [
          r.id || '',
          r.ten || '',
          r.sdt || '',
          r.phuongThuc || r.hinhThuc || '',
          r.diaChi || '',
          ngay,
          r.trangThai || '',
          String(total),
          items
        ];
        lines.push(lineArr.map(csvCell).join(','));
      });

      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tenfile || 'export.csv';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.showToast) window.showToast('Đã xuất CSV');
    } catch (err) {
      console.error('exportCSV error', err);
      if (window.showToast) window.showToast('Lỗi khi xuất CSV');
      else alert('Lỗi khi xuất CSV');
    }
  }

  // alias tiếng Việt
  function xuatCSV(rows, tenfile) { return exportCSV(rows, tenfile); }

  // Export PDF "mock" (mở cửa sổ in) - dùng cho demo
  function exportPDFMock(rows, title = 'Báo cáo') {
    try {
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        if (window.showToast) window.showToast('Không có dữ liệu để xuất');
        else alert('Không có dữ liệu để xuất');
        return;
      }

      const now = new Date().toLocaleString();
      const computeTotal = (r) => {
        if (typeof window.tinhTongDon === 'function') return window.tinhTongDon(r);
        if (!r || !Array.isArray(r.items)) return 0;
        return r.items.reduce((s, it) => {
          const price = Number(it.price ?? it.gia ?? it.priceVN ?? 0) || 0;
          const qty = Number(it.qty ?? it.soLuong ?? it.quantity ?? 1) || 0;
          return s + price * qty;
        }, 0);
      };

      const rowsHtml = (rows || []).map(r => {
        const itemsHtml = (r.items || []).map(i => `${(i.title || i.name || '')} x${i.qty ?? i.soLuong ?? 1}`).join('<br/>');
        return `<tr>
          <td style="padding:8px;border:1px solid #eee">${r.id || ''}</td>
          <td style="padding:8px;border:1px solid #eee">${(typeof window.formatDisplayDate === 'function') ? window.formatDisplayDate(r.ngay) : (r.ngay || '')}</td>
          <td style="padding:8px;border:1px solid #eee">${r.ten || ''}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:right">${(computeTotal(r)).toLocaleString('vi-VN')}₫</td>
          <td style="padding:8px;border:1px solid #eee">${r.trangThai || ''}</td>
        </tr>
        <tr><td colspan="5" style="padding:6px 8px;border:1px solid #eee;color:#666;font-size:12px">Sản phẩm: ${itemsHtml}</td></tr>`;
      }).join('\n');

      const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;padding:20px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  td,th{padding:8px;border:1px solid #eee;font-size:13px}
  th{background:#fafafa;text-align:left}
  h2{margin:0 0 10px 0}
  .meta{color:#666;font-size:13px;margin-top:6px}
</style>
</head>
<body>
  <h2>${title}</h2>
  <div class="meta">Ngày xuất: ${now}</div>
  <table>
    <thead>
      <tr><th>Mã</th><th>Ngày</th><th>Khách</th><th style="text-align:right">Tổng</th><th>Trạng thái</th></tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <p style="margin-top:16px;font-size:13px;color:#666">(* Đây là bản mock để in / lưu PDF. Tùy chỉnh khi có backend.)</p>
</body>
</html>`;

      const w = window.open('', '_blank');
      if (!w) {
        if (window.showToast) window.showToast('Trình duyệt chặn cửa sổ mới. Hãy bật popup hoặc thử lại.');
        else alert('Trình duyệt chặn cửa sổ mới. Hãy bật popup hoặc thử lại.');
        return;
      }
      w.document.write(html);
      w.document.close();
      w.focus();
      // cố gắng gọi print sau chút delay để tài liệu render
      setTimeout(() => {
        try { w.print(); } catch (e) { /* ignore */ }
      }, 600);

      if (window.showToast) window.showToast('Mở hộp in — bạn có thể lưu thành PDF (mock)');
    } catch (err) {
      console.error('exportPDFMock error', err);
      if (window.showToast) window.showToast('Lỗi khi mở bản in (PDF mock)');
      else alert('Lỗi khi mở bản in (PDF mock)');
    }
  }

  // alias tiếng Việt
  function xuatPDFMock(rows, title) { return exportPDFMock(rows, title); }

  // Expose ra window
  try {
    window.exportCSV = window.exportCSV || exportCSV;
    window.xuatCSV = window.xuatCSV || xuatCSV;
    window.exportPDFMock = window.exportPDFMock || exportPDFMock;
    window.xuatPDFMock = window.xuatPDFMock || xuatPDFMock;
  } catch (e) {
    console.warn('xuatUtils: không thể expose API ra window', e);
  }

})();
