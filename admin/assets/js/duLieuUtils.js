/* duLieuUtils.js
   Helpers chung cho data / localStorage / định dạng tiền & ngày
   - Dùng chung cho adminOrder.js và adminExport.js
   - Các hàm được expose ra window để các script khác gọi trực tiếp
   - Chú thích tiếng Việt
*/
'use strict';

(function () {
  // ----- Khóa localStorage mặc định (có thể thay nếu cần) -----
  const KHOA_ADMIN = 'admin_donhang_demo';

  // ----- Utils: safe JSON parse / stringify -----
  function safeParse(json) {
    try { return JSON.parse(json); } catch (e) { return null; }
  }

  // ----- Lưu / tải đơn hàng từ localStorage -----
  function taiDon() {
    try {
      const raw = localStorage.getItem(KHOA_ADMIN);
      return safeParse(raw) || [];
    } catch (e) {
      console.warn('taiDon: lỗi khi đọc localStorage', e);
      return [];
    }
  }

  function luuDon(arr) {
    try {
      localStorage.setItem(KHOA_ADMIN, JSON.stringify(arr || []));
    } catch (e) {
      console.warn('luuDon: lỗi khi ghi localStorage', e);
    }
  }

  // ----- Định dạng tiền (VND) -----
  function dinhVND(n) {
    const num = Number(n || 0);
    if (Number.isNaN(num)) return '0₫';
    return num.toLocaleString('vi-VN') + '₫';
  }

  // ----- Sinh mã đơn mới (DH-xxxx) -----
  function sinhMaDonMoi() {
    try {
      const arr = taiDon();
      let maxNum = 0;
      arr.forEach(o => {
        const m = String(o.id || '').match(/^[A-Za-z]{2}-(\d+)$/);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const next = maxNum + 1;
      return 'DH-' + String(next).padStart(4, '0');
    } catch (e) {
      console.warn('sinhMaDonMoi error', e);
      return 'DH-0001';
    }
  }

  // ----- Ngày: helpers (ISO handling) -----
  function pad(n) { return (n < 10 ? '0' + n : '' + n); }

  // normalizeToISO: nhận nhiều dạng ngày (ISO YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, Date object..) -> 'YYYY-MM-DD' hoặc null
  function normalizeToISO(s) {
    if (!s) return null;
    if (typeof s === 'string') s = s.trim();
    // if already ISO-like YYYY-MM-DD or YYYY/MM/DD
    const mISO = String(s).match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
    if (mISO) return `${mISO[1]}-${mISO[2]}-${mISO[3]}`;

    // common format: DD/MM/YYYY or DD-MM-YYYY
    const m1 = String(s).match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (m1) {
      const a = parseInt(m1[1], 10), b = parseInt(m1[2], 10), y = m1[3];
      // detect if day/month swapped (if day > 12 assume it's day)
      if (a > 12) return `${y}-${pad(b)}-${pad(a)}`;
      if (b > 12) return `${y}-${pad(a)}-${pad(b)}`;
      // default assume DD/MM/YYYY -> y-m-d
      return `${y}-${pad(b)}-${pad(a)}`;
    }

    // try Date parse
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = pad(parsed.getMonth() + 1);
      const d = pad(parsed.getDate());
      return `${y}-${m}-${d}`;
    }
    return null;
  }

  function formatDisplayDate(s) {
    const iso = normalizeToISO(s);
    if (!iso) return (s ? String(s).slice(0, 10) : '—');
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function todayISO() {
    return (new Date()).toISOString().slice(0, 10);
  }

  function addDaysISO(iso, days) {
    if (!iso) {
      const d0 = new Date();
      d0.setDate(d0.getDate() + days);
      return d0.toISOString().slice(0, 10);
    }
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString().slice(0, 10);
  }

  // Trích ngày ISO từ object order (nhận o.ngay có thể là nhiều dạng)
  function orderDateISO(o) {
    if (!o) return null;
    if (o.ngay) {
      return normalizeToISO(o.ngay);
    }
    return null;
  }

  // ----- Filter / sort orders theo ngày -----
  function sortOrdersByDateDesc(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.slice().sort((a, b) => {
      const ai = orderDateISO(a);
      const bi = orderDateISO(b);
      const ta = ai ? new Date(ai + 'T00:00:00').getTime() : -8640000000000000;
      const tb = bi ? new Date(bi + 'T00:00:00').getTime() : -8640000000000000;
      return tb - ta;
    });
  }

  // Lọc orders trong khoảng tuNgay..denNgay (ISO format: YYYY-MM-DD) - inclusive
  function filterTheoKhoang(orders, tuNgay, denNgay) {
    if (!Array.isArray(orders)) return [];
    if (!tuNgay && !denNgay) return orders.slice();
    const t = tuNgay ? new Date(tuNgay + 'T00:00:00').getTime() : -8640000000000000;
    const d = denNgay ? new Date(denNgay + 'T23:59:59').getTime() : 8640000000000000;
    return orders.filter(o => {
      const iso = orderDateISO(o);
      if (!iso) return false;
      const ngay = new Date(iso + 'T00:00:00').getTime();
      return !isNaN(ngay) && ngay >= t && ngay <= d;
    });
  }

  // ----- Tính tổng tiền của một order -----
  function tinhTongDon(order) {
    if (!order || !Array.isArray(order.items)) return 0;
    return order.items.reduce((s, it) => {
      const price = Number(it.price ?? it.gia ?? it.priceVN ?? 0) || 0;
      const qty = Number(it.qty ?? it.soLuong ?? it.quantity ?? 1) || 0;
      return s + price * qty;
    }, 0);
  }

  // Expose ra window để các script khác dùng trực tiếp
  try {
    window.KHOA_ADMIN = KHOA_ADMIN;
    window.taiDon = taiDon;
    window.luuDon = luuDon;
    window.dinhVND = dinhVND;
    window.sinhMaDonMoi = sinhMaDonMoi;

    window.normalizeToISO = normalizeToISO;
    window.formatDisplayDate = formatDisplayDate;
    window.todayISO = todayISO;
    window.addDaysISO = addDaysISO;
    window.orderDateISO = orderDateISO;
    window.sortOrdersByDateDesc = sortOrdersByDateDesc;
    window.filterTheoKhoang = filterTheoKhoang;
    window.tinhTongDon = tinhTongDon;
  } catch (e) {
    // Nếu chạy trong môi trường không có window, chỉ bỏ qua (thường không xảy ra trên trình duyệt)
    console.warn('duLieuUtils: không thể expose hàm ra window', e);
  }
})();
