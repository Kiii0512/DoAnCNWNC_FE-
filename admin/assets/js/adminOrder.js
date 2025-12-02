/* adminOrder.js
   Logic riêng cho trang "Admin — Quản lý đơn hàng"
   - Dùng các helper chung (duLieuUtils.js, giaoDienUtils.js, xuatUtils.js, menu.js)
   - Chú thích bằng tiếng Việt
*/
'use strict';

/* ---------- Cấu hình & dữ liệu mẫu (demo) ---------- */
// Nếu duLieuUtils đã expose KHOA_ADMIN thì dùng, nếu không fallback
const KHOA_ADMIN = (window.KHOA_ADMIN) ? window.KHOA_ADMIN : 'admin_donhang_demo';

// dữ liệu mẫu ban đầu (chỉ khi localStorage trống thì dùng)
const MAU = [
  { id: 'DH-1001', ten: 'Nguyen Van A', sdt: '0912345678', phuongThuc: 'Giao tận nơi', diaChi: 'Hà Nội, Q1, Đường A', ngay: '2025-11-01', trangThai: 'dang-cho', items: [{ id: 'p1', title: 'iPhone 17 Pro', price: 32990000, qty: 1, img: 'images/iphone17.jpg' }] },
  { id: 'DH-1002', ten: 'Tran Thi B', sdt: '0987654321', phuongThuc: 'Nhận tại cửa hàng', diaChi: 'TP HCM, Q7', ngay: '2025-11-03', trangThai: 'da-xac-nhan', items: [{ id: 'p2', title: 'AirPods Pro 2', price: 4990000, qty: 2, img: 'images/airpodpro.jpg' }] },
  { id: 'DH-1003', ten: 'Le C', sdt: '0901122334', phuongThuc: 'Giao tận nơi', diaChi: 'Đà Nẵng, Hải Châu', ngay: '2025-11-05', trangThai: 'da-gui', items: [{ id: 'p3', title: 'Cáp Type-C', price: 190000, qty: 3, img: 'https://via.placeholder.com/160x120?text=C%E1%BA%A1p' }] }
];

/* ----- Metadata trạng thái (dùng để render menu / dot color) ----- */
const STATUS_META = {
  'dang-cho': { label: 'Đang chờ', cls: 's-dang-cho', color: '#f97316' },
  'da-xac-nhan': { label: 'Đã xác nhận', cls: 's-da-xac-nhan', color: '#10b981' },
  'dang-chuan-bi': { label: 'Đang chuẩn bị', cls: 's-dang-chuan-bi', color: '#6366f1' },
  'da-gui': { label: 'Đã gửi', cls: 's-da-gui', color: '#0b5cff' },
  'da-hoan-thanh': { label: 'Hoàn thành', cls: 's-da-hoan-thanh', color: '#16a34a' },
  'da-huy': { label: 'Đã hủy', cls: 's-da-huy', color: '#ef4444' }
};

/* ----- Các helper nhỏ (dùng helper chung nếu có, nếu không dùng fallback) ----- */
const _taiDon = (typeof window.taiDon === 'function') ? window.taiDon : function () { try { return JSON.parse(localStorage.getItem(KHOA_ADMIN)) || []; } catch (e) { return []; } };
const _luuDon = (typeof window.luuDon === 'function') ? window.luuDon : function (arr) { try { localStorage.setItem(KHOA_ADMIN, JSON.stringify(arr)); } catch (e) { } };
const _dinhVND = (typeof window.dinhVND === 'function') ? window.dinhVND : function (n) { return (Number(n) || 0).toLocaleString('vi-VN') + '₫'; };
const _sinhMaDonMoi = (typeof window.sinhMaDonMoi === 'function') ? window.sinhMaDonMoi : function () {
  const arr = _taiDon(); let max = 0;
  arr.forEach(o => { const m = String(o.id || '').match(/^[A-Za-z]{2}-(\d+)$/); if (m) { const v = parseInt(m[1], 10); if (!isNaN(v) && v > max) max = v; } });
  return 'DH-' + String(max + 1).padStart(4, '0');
};
const _showToast = (typeof window.showToast === 'function') ? window.showToast : function (m) { try { window.alert(m); } catch (e) { console.log('toast:', m); } };
const _debounce = (typeof window.debounce === 'function') ? window.debounce : function (fn, ms = 250) { let t; return function () { clearTimeout(t); const args = arguments; t = setTimeout(() => fn.apply(this, args), ms); }; };

/* ----- Helpers bản địa: chuyển mã trạng thái sang class / tên ----- */
function nhanTrangThai(t) { return STATUS_META[t] ? STATUS_META[t].cls : ''; }
function tenTrangThai(t) { return STATUS_META[t] ? STATUS_META[t].label : (t || '—'); }

/* ---------- Render bảng đơn hàng ---------- */
function renderBang() {
  const tbody = document.querySelector('#bangDon tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const q = (document.getElementById('timKiem')?.value || '').toLowerCase();
  const loc = document.getElementById('locTrangThai')?.value;
  let arr = _taiDon();
  if (loc) arr = arr.filter(x => x.trangThai === loc);
  if (q) arr = arr.filter(x => (x.ten || '').toLowerCase().includes(q) || (x.id || '').toLowerCase().includes(q) || (x.sdt || '').includes(q));

  arr.forEach(o => {
    const tr = document.createElement('tr');

    const statusHtml = `
      <div style="display:inline-block;position:relative">
        <button class="status-action" data-id="${o.id}" aria-haspopup="true" aria-expanded="false" title="Thay đổi trạng thái">
          <span class="status-badge ${nhanTrangThai(o.trangThai)}" style="padding:6px 10px;font-weight:700">${tenTrangThai(o.trangThai)}</span>
          <span class="chev" aria-hidden="true">▾</span>
        </button>
        <div class="status-menu" data-for="${o.id}" role="menu" aria-label="Chọn trạng thái">
          ${Object.keys(STATUS_META).map(k => {
            const m = STATUS_META[k];
            return `<div class="opt" data-status="${k}" role="menuitem" tabindex="0"><span class="dot" style="background:${m.color}"></span><div style="flex:1">${m.label}</div></div>`;
          }).join('')}
        </div>
      </div>
    `;

    tr.innerHTML = `
      <td><input type="checkbox" class="chk" data-id="${o.id}" /></td>
      <td><strong>${o.id}</strong></td>
      <td>${o.ten || '—'}<div class="small muted">${o.sdt || ''}</div></td>
      <td class="small muted">${o.phuongThuc || ''}</td>
      <td>${statusHtml}</td>
      <td class="small muted">${(o.ngay || '')}</td>
      <td class="actions small">
        <button class="btn btn-ghost xem" data-id="${o.id}">Xem</button>
        <button class="btn btn-ghost" data-action="open-status" data-id="${o.id}">Thay đổi</button>
        <button class="btn btn-primary cap-nhat" data-id="${o.id}" style="display:none">Cập nhật</button>
      </td>
    `;
    tbody.appendChild(tr);

    // highlight selected option trong status menu (tô background)
    const menu = tr.querySelector('.status-menu');
    if (menu) {
      menu.querySelectorAll('.opt').forEach(opt => {
        opt.style.background = (opt.dataset.status === o.trangThai) ? '#f3f4f6' : 'transparent';
      });
    }
  });

  // reset checkbox chọn tất cả
  const chkAll = document.getElementById('chkTatCa');
  if (chkAll) chkAll.checked = false;
}

/* ---------- Quản lý status menu (mở/đóng) ---------- */
function closeAllStatusMenus() {
  document.querySelectorAll('.status-menu.open').forEach(m => {
    m.classList.remove('open');
    const btn = document.querySelector(`.status-action[data-id="${m.dataset.for}"]`);
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function toggleStatusMenu(id, btn) {
  if (!id) return;
  closeAllStatusMenus();
  const menu = document.querySelector(`.status-menu[data-for="${id}"]`);
  if (!menu) return;
  menu.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
  // tập trung vào first option để keyboard truy cập nhanh
  const firstOpt = menu.querySelector('.opt');
  if (firstOpt) firstOpt.focus?.();
}

/* đóng menu khi click ngoài */
function onDocClickForStatus(e) {
  const anyOpen = document.querySelector('.status-menu.open');
  if (!anyOpen) return;
  if (e.target.closest('.status-menu') || e.target.closest('.status-action')) return;
  closeAllStatusMenus();
}

/* ---------- Mở khung chi tiết đơn (drawer) ---------- */
function moKhungChiTiet(id) {
  const arr = _taiDon();
  const o = arr.find(x => x.id === id);
  if (!o) return;
  const khung = document.getElementById('khungChiTiet');
  if (!khung) return;
  khung.classList.add('open');
  khung.setAttribute('aria-hidden', 'false');
  document.getElementById('chiTietMa').textContent = o.id;
  document.getElementById('chiTietKhach').innerHTML = `
    <div><strong>${o.ten || '—'}</strong></div>
    <div class="small muted">${o.sdt || ''}</div>
    <div class="small muted">${o.phuongThuc || '—'} — ${o.diaChi || '—'}</div>
    <div class="small muted">Ngày đặt: ${o.ngay || '—'}</div>
  `;
  const sel = document.getElementById('chiTietTrangThai');
  if (sel) sel.value = o.trangThai || '';

  // sản phẩm
  const pr = document.getElementById('chiTietSanPham');
  if (pr) pr.innerHTML = '';
  let total = 0;
  (o.items || []).forEach(it => {
    const sub = (Number(it.price || it.gia || 0) || 0) * (Number(it.qty || it.soLuong || 1) || 1);
    total += sub;
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `<img src="${it.img || ''}" alt="${(it.title || it.name || '')}"/><div style="flex:1"><div style="font-weight:600">${it.title || it.name || 'Sản phẩm'}</div><div class="small muted">${(it.qty || it.soLuong || 1)} x ${_dinhVND(it.price || it.gia || 0)}</div></div><div style="font-weight:700">${_dinhVND(sub)}</div>`;
    pr && pr.appendChild(div);
  });
  document.getElementById('chiTietTong').innerHTML = `<div style="margin-top:8px;font-weight:700">Tổng: ${_dinhVND(total)}</div>`;

  // gán sự kiện lưu & in
  const btnLuu = document.getElementById('luuTrangThai');
  if (btnLuu) btnLuu.onclick = () => { const neu = document.getElementById('chiTietTrangThai').value; capNhatTrangThai(id, neu, true); };
  const btnIn = document.getElementById('inDon');
  if (btnIn) btnIn.onclick = () => inDon(id);
}

/* đóng drawer */
document.getElementById('dongKhung')?.addEventListener('click', () => {
  const kh = document.getElementById('khungChiTiet');
  if (!kh) return;
  kh.classList.remove('open');
  kh.setAttribute('aria-hidden', 'true');
});

/* ---------- Cập nhật trạng thái đơn ---------- */
function capNhatTrangThai(id, giatri, tuChiTiet = false) {
  if (!id || !giatri) return;
  const arr = _taiDon();
  const i = arr.findIndex(x => x.id === id);
  if (i === -1) return;
  arr[i].trangThai = giatri;
  _luuDon(arr);
  renderBang();
  if (tuChiTiet) {
    _showToast('Trạng thái đã được cập nhật');
    // đóng drawer
    const kh = document.getElementById('khungChiTiet');
    if (kh) { kh.classList.remove('open'); kh.setAttribute('aria-hidden', 'true'); }
  } else {
    _showToast('Trạng thái đã được cập nhật');
  }
}

/* ---------- In đơn (mở cửa sổ in) ---------- */
function inDon(id) {
  const arr = _taiDon();
  const o = arr.find(x => x.id === id);
  if (!o) return;
  const w = window.open('', '_blank');
  if (!w) { _showToast('Trình duyệt chặn cửa sổ mới. Bật popup hoặc thử lại.'); return; }
  const itemsHtml = (o.items || []).map(it => `<tr>
    <td><img src="${it.img || ''}" style="width:64px;height:44px;object-fit:cover;border-radius:6px"/></td>
    <td>${it.title || it.name || 'Sản phẩm'}</td>
    <td style="text-align:center">${it.qty || it.soLuong || 1}</td>
    <td style="text-align:right">${_dinhVND(it.price || it.gia || 0)}</td>
    <td style="text-align:right">${_dinhVND((Number(it.price || it.gia || 0) || 0) * (Number(it.qty || it.soLuong || 1) || 1))}</td>
  </tr>`).join('');
  const total = (o.items || []).reduce((s, it) => s + ((Number(it.price || it.gia || 0) || 0) * (Number(it.qty || it.soLuong || 1) || 1)), 0);
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${o.id}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h2>Đơn ${o.id}</h2><div><strong>${o.ten || ''}</strong> — ${o.sdt || ''}</div><div>${o.phuongThuc || ''} — ${o.diaChi || ''}</div><div>Ngày: ${o.ngay || ''}</div><table style="margin-top:12px"><thead><tr><th></th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${itemsHtml}</tbody></table><h3 style="text-align:right">Tổng: ${_dinhVND(total)}</h3></body></html>`);
  w.document.close(); w.focus(); try { w.print(); } catch (e) { /* ignore */ }
}

/* ---------- Tạo đơn từ payload (dùng khi có event từ storage 'donHangMoi') ---------- */
function taoDonTuPayload(payload) {
  try {
    const arr = _taiDon();
    const ma = _sinhMaDonMoi();
    const ngay = (new Date()).toISOString().slice(0, 10);
    const tt = payload?.thongTin || {};
    let items = [];
    if (Array.isArray(payload?.sanPham) && payload.sanPham.length > 0) {
      items = payload.sanPham.map(p => ({
        id: p.id || p.productId || 'p-?',
        title: p.title || p.name || 'Sản phẩm',
        price: Number(p.gia ?? p.price ?? p.priceVN ?? 0),
        qty: Number(p.soLuong ?? p.qty ?? p.quantity ?? 1),
        img: p.img || p.image || ''
      }));
    } else {
      // fallback: lấy từ giỏ (nếu có) - nếu bạn dùng key khác cho giỏ hàng, thay đổi ở đây
      const gio = (typeof window.taiGio === 'function') ? window.taiGio() : (JSON.parse(localStorage.getItem('gio_demo_v1') || '[]') || []);
      if (gio && Array.isArray(gio) && gio.length) {
        items = gio.map(it => ({ id: it.id, title: it.title, price: Number(it.gia ?? it.price ?? 0), qty: Number(it.soLuong ?? it.qty ?? 1), img: it.img || '' }));
      }
    }

    const newOrder = {
      id: ma,
      ten: tt.hoTen || tt.ten || 'Khách không tên',
      sdt: tt.dienThoai || tt.sdt || '',
      phuongThuc: tt.hinhThuc || tt.phuongThuc || 'Giao tận nơi',
      diaChi: tt.tinh && tt.quan ? `${tt.tinh}, ${tt.quan}, ${tt.diaChi || ''}` : (tt.diaChi || ''),
      ngay: ngay,
      trangThai: 'dang-cho',
      items: items
    };

    arr.unshift(newOrder);
    _luuDon(arr);
    renderBang();
    console.log('Đã tạo đơn tự động:', newOrder.id);
  } catch (e) {
    console.error('Lỗi khi tạo đơn tự động:', e);
  }
}

/* ---------- Lắng nghe storage để nhận đơn mới từ cửa hàng ( optional ) ---------- */
window.addEventListener('storage', function (e) {
  if (!e) return;
  if (e.key === 'donHangMoi' && e.newValue) {
    try {
      const payload = JSON.parse(e.newValue);
      taoDonTuPayload(payload);
    } catch (err) {
      console.warn('donHangMoi không hợp lệ', err);
    }
    try { localStorage.removeItem('donHangMoi'); } catch (_) { }
  }
});

/* Khi tải trang: nếu có payload lưu sẵn, xử lý 1 lần */
(function kiemTraDonMoiKhiTai() {
  try {
    const v = localStorage.getItem('donHangMoi');
    if (v) {
      const payload = JSON.parse(v);
      taoDonTuPayload(payload);
      localStorage.removeItem('donHangMoi');
    }
  } catch (e) { /* ignore */ }
})();

/* ---------- Debounced render + binding input ---------- */
const debouncedRender = _debounce(renderBang, 250);
document.getElementById('timKiem')?.addEventListener('input', debouncedRender);
document.getElementById('locTrangThai')?.addEventListener('change', renderBang);
document.getElementById('btnLamMoi')?.addEventListener('click', () => { renderBang(); _showToast('Đã làm mới'); });
document.getElementById('btnXuat')?.addEventListener('click', () => {
  const rows = _taiDon();
  if (typeof window.exportCSV === 'function') window.exportCSV(rows, 'donhang_export.csv');
  else if (typeof window.xuatCSV === 'function') window.xuatCSV(rows, 'donhang_export.csv');
  else _showToast('Chức năng xuất CSV chưa sẵn sàng');
});

/* select all checkbox */
document.getElementById('chkTatCa')?.addEventListener('change', function () {
  document.querySelectorAll('.chk').forEach(c => { c.checked = this.checked; });
});

/* xuất chọn (xuất những hàng được check) */
document.getElementById('xuatChon')?.addEventListener('click', () => {
  const ids = Array.from(document.querySelectorAll('.chk:checked')).map(i => i.dataset.id);
  if (ids.length === 0) { _showToast('Chưa chọn đơn nào'); return; }
  const rows = _taiDon().filter(o => ids.includes(o.id));
  if (typeof window.exportCSV === 'function') window.exportCSV(rows, 'donhang_chon.csv');
  else if (typeof window.xuatCSV === 'function') window.xuatCSV(rows, 'donhang_chon.csv');
  else _showToast('Chức năng xuất CSV chưa sẵn sàng');
});

/* in chọn */
document.getElementById('inChon')?.addEventListener('click', () => {
  const ids = Array.from(document.querySelectorAll('.chk:checked')).map(i => i.dataset.id);
  if (ids.length === 0) { _showToast('Chưa chọn đơn nào'); return; }
  ids.forEach(id => inDon(id));
});

/* ---------- Delegation: xử lý click trong tbody (xem, mở menu trạng thái, chọn option) ---------- */
const tbody = document.querySelector('#bangDon tbody');
if (tbody) {
  tbody.addEventListener('click', function (e) {
    const xemBtn = e.target.closest('.xem');
    if (xemBtn) { moKhungChiTiet(xemBtn.dataset.id); return; }

    const statusActionBtn = e.target.closest('.status-action');
    if (statusActionBtn) {
      e.stopPropagation();
      const id = statusActionBtn.dataset.id;
      toggleStatusMenu(id, statusActionBtn);
      return;
    }

    const opt = e.target.closest('.opt');
    if (opt) {
      const status = opt.dataset.status;
      const menu = opt.closest('.status-menu');
      const id = menu && menu.dataset.for;
      if (id && status) {
        capNhatTrangThai(id, status, true);
        closeAllStatusMenus();
      }
      return;
    }

    const chk = e.target.closest('input.chk');
    if (chk) {
      // không làm gì thêm tại đây; checkbox được đọc khi xuất/in
      return;
    }
  });
}

/* Đóng status menu khi click ra ngoài */
document.addEventListener('click', onDocClickForStatus);

/* ---------- Khởi tạo (nếu localStorage rỗng -> nạp dữ liệu mẫu) ---------- */
(function khoiTao() {
  if (!_taiDon() || _taiDon().length === 0) {
    _luuDon(MAU.slice());
  }
  renderBang();
})();
