/* JS riêng cho trang quản lý đơn hàng */
const KHOA_ADMIN = 'admin_donhang_demo';

/* MAU is provided in thongTinDemo.js (file must be loaded before this script) */
function taiDon(){ try{ return JSON.parse(localStorage.getItem(KHOA_ADMIN)) || (typeof MAU !== 'undefined' ? MAU.slice() : [] ) }catch(e){ return (typeof MAU !== 'undefined' ? MAU.slice() : []) } }
function luuDon(arr){ localStorage.setItem(KHOA_ADMIN, JSON.stringify(arr)); }

function sinhMaDonMoi(){
  const arr = taiDon();
  let maxNum = 0;
  arr.forEach(o=>{
    const m = String(o.id||'').match(/^[A-Za-z]{2}-(\d+)$/);
    if(m) {
      const num = parseInt(m[1],10);
      if(!isNaN(num) && num>maxNum) maxNum = num;
    }
  });
  const next = maxNum + 1;
  return 'DH-' + String(next).padStart(4,'0');
}

function nhanTrangThai(t){ switch(t){ case 'dang-cho': return 's-dang-cho'; case 'da-xac-nhan': return 's-da-xac-nhan'; case 'dang-chuan-bi': return 's-dang-chuan-bi'; case 'da-gui': return 's-da-gui'; case 'da-hoan-thanh': return 's-da-hoan-thanh'; case 'da-huy': return 's-da-huy'; default: return '' } }
function tenTrangThai(t){ switch(t){ case 'dang-cho': return 'Đang chờ'; case 'da-xac-nhan': return 'Đã xác nhận'; case 'dang-chuan-bi': return 'Đang chuẩn bị'; case 'da-gui': return 'Đã gửi'; case 'da-hoan-thanh': return 'Hoàn thành'; case 'da-huy': return 'Đã hủy'; default: return t } }

/* Render bảng */
function renderBang(){
  const tbody = document.querySelector('#bangDon tbody'); if(!tbody) return;
  tbody.innerHTML='';
  const q = (document.getElementById('timKiem').value||'').toLowerCase();
  const loc = document.getElementById('locTrangThai').value;
  let arr = taiDon();
  if(loc) arr = arr.filter(x=> x.trangThai===loc);
  if(q) arr = arr.filter(x=> (x.ten||'').toLowerCase().includes(q) || (x.id||'').toLowerCase().includes(q) || (x.sdt||'').includes(q));

  arr.forEach(o=>{
    const tr = document.createElement('tr');

    const statusHtml = `
      <div style="display:inline-block;position:relative">
        <button class="status-action" data-id="${o.id}" aria-haspopup="true" aria-expanded="false">
          <span class="status-badge ${nhanTrangThai(o.trangThai)}" style="padding:6px 10px;font-weight:700">${tenTrangThai(o.trangThai)}</span>
          <span class="chev" aria-hidden="true">▾</span>
        </button>
      </div>
    `;

    tr.innerHTML = `
      <td><input type="checkbox" class="chk" data-id="${o.id}" /></td>
      <td><strong>${o.id}</strong></td>
      <td>${o.ten}<div class="small muted">${o.sdt}</div></td>
      <td class="small muted">${o.phuongThuc}</td>
      <td>${statusHtml}</td>
      <td class="small muted">${o.ngay}</td>
      <td class="actions small">
        <button class="btn btn-ghost xem" data-id="${o.id}">Xem</button>
        <button class="btn btn-ghost" data-action="open-status" data-id="${o.id}">Thay đổi</button>
        <button class="btn btn-primary cap-nhat" data-id="${o.id}" style="display:none">Cập nhật</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const chkAll = document.getElementById('chkTatCa');
  if(chkAll) chkAll.checked = false;

  // handlers
  document.querySelectorAll('.xem').forEach(b=> b.addEventListener('click', e=> moKhungChiTiet(e.target.dataset.id)));
  document.querySelectorAll('.status-action').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      const id = btn.dataset.id;
      openFloatingStatusMenu(id, btn);
    });
    btn.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter' || ev.key === ' '){
        ev.preventDefault();
        btn.click();
      }
    });
  });
}

/* Floating (portal) status menu */
let __floatingMenu = null;
let __floatingMenuCleanup = null;

function openFloatingStatusMenu(orderId, triggerBtn){
  closeFloatingMenu();

  const menu = document.createElement('div');
  menu.className = 'floating-status-menu';
  menu.setAttribute('role','menu');
  menu.setAttribute('aria-label','Chọn trạng thái đơn');
  menu.dataset.for = orderId;

  Object.keys(STATUS_META).forEach(key=>{
    const m = STATUS_META[key];
    const opt = document.createElement('div');
    opt.className = 'opt';
    opt.tabIndex = 0;
    opt.dataset.status = key;
    opt.setAttribute('role','menuitem');
    opt.innerHTML = `<span class="dot" style="background:${m.color}"></span><div style="flex:1">${m.label}</div>`;
    const arr = taiDon();
    const o = arr.find(x=>x.id===orderId);
    if(o && o.trangThai === key){
      opt.style.background = '#f3f4f6';
    }

    opt.addEventListener('click', (e)=>{
      e.stopPropagation();
      capNhatTrangThai(orderId, key, true);
      closeFloatingMenu();
    });

    opt.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        opt.click();
      } else if(e.key === 'ArrowDown'){
        e.preventDefault();
        const next = opt.nextElementSibling || menu.querySelector('.opt');
        next && next.focus();
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        const prev = opt.previousElementSibling || menu.querySelector('.opt:last-child');
        prev && prev.focus();
      } else if(e.key === 'Escape'){
        closeFloatingMenu();
        triggerBtn && triggerBtn.focus();
      }
    });

    menu.appendChild(opt);
  });

  document.body.appendChild(menu);
  __floatingMenu = menu;
  positionFloatingMenu(menu, triggerBtn);
  const firstOpt = menu.querySelector('.opt');
  if(firstOpt) firstOpt.focus();

  function onDocumentClick(e){
    if(!menu.contains(e.target) && !triggerBtn.contains(e.target)){
      closeFloatingMenu();
    }
  }
  function onKeydown(e){
    if(e.key === 'Escape'){ closeFloatingMenu(); triggerBtn && triggerBtn.focus(); }
  }
  function onScrollResize(){
    if(!menu || !document.body.contains(menu)) return;
    positionFloatingMenu(menu, triggerBtn);
  }

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', onScrollResize);
  window.addEventListener('scroll', onScrollResize, true);

  __floatingMenuCleanup = function(){
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('keydown', onKeydown);
    window.removeEventListener('resize', onScrollResize);
    window.removeEventListener('scroll', onScrollResize, true);
  };
}

function positionFloatingMenu(menu, triggerBtn){
  const margin = 8;
  const rect = triggerBtn.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const spaceBelow = vh - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const fitsBelow = spaceBelow >= menuRect.height + 6;
  const fitsAbove = spaceAbove >= menuRect.height + 6;

  let top, left;

  if (fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove)) {
    top = rect.bottom + 6;
  } else if (fitsAbove) {
    top = rect.top - menuRect.height - 6;
  } else {
    top = Math.min(Math.max(rect.bottom + 6, margin), vh - margin - Math.min(menuRect.height, vh - 2*margin));
  }

  left = Math.min(Math.max(rect.left, margin), Math.max(margin, vw - menuRect.width - margin));
  menu.style.top = top + 'px';
  menu.style.left = left + 'px';
  menu.style.maxHeight = Math.max(vh - 2*margin, 120) + 'px';
}

function closeFloatingMenu(){
  if(__floatingMenu){
    __floatingMenu.remove();
    __floatingMenu = null;
  }
  if(typeof __floatingMenuCleanup === 'function'){
    __floatingMenuCleanup();
    __floatingMenuCleanup = null;
  }
}

/* Chi tiết / cập nhật trạng thái */
function moKhungChiTiet(id){
  const arr = taiDon(); const o = arr.find(x=>x.id===id); if(!o) return;
  const khung = document.getElementById('khungChiTiet');
  if(!khung) return;
  khung.classList.add('open');
  khung.setAttribute('aria-hidden','false');
  document.getElementById('chiTietMa').textContent = o.id;
  document.getElementById('chiTietKhach').innerHTML = `
    <div><strong>${o.ten}</strong></div>
    <div class="small muted">${o.sdt}</div>
    <div class="small muted">${o.phuongThuc} — ${o.diaChi || '—'}</div>
    <div class="small muted">Ngày đặt: ${o.ngay}</div>
  `;
  document.getElementById('chiTietTrangThai').value = o.trangThai;

  const pr = document.getElementById('chiTietSanPham'); pr.innerHTML=''; let total=0;
  o.items.forEach(it=>{ const sub = it.price * it.qty; total+=sub; const div = document.createElement('div'); div.className='product-item'; div.innerHTML = `<img src="${it.img}" alt="${it.title}"/><div style="flex:1"><div style="font-weight:600">${it.title}</div><div class="small muted">${it.qty} x ${dinhVND(it.price)}</div></div><div style="font-weight:700">${dinhVND(sub)}</div>`; pr.appendChild(div); });
  document.getElementById('chiTietTong').innerHTML = `<div style="margin-top:8px;font-weight:700">Tổng: ${dinhVND(total)}</div>`;

  document.getElementById('luuTrangThai').onclick = ()=>{ const neu = document.getElementById('chiTietTrangThai').value; capNhatTrangThai(id, neu, true); };
  document.getElementById('inDon').onclick = ()=> inDon(id);
}

document.getElementById('dongKhung')?.addEventListener('click', ()=> {
  document.getElementById('khungChiTiet').classList.remove('open');
  document.getElementById('khungChiTiet').setAttribute('aria-hidden','true');
});

function capNhatTrangThai(id, giatri, tuChiTiet=false){
  const value = giatri || null;
  if(!value) return;
  const arr = taiDon(); const i = arr.findIndex(x=>x.id===id); if(i===-1) return;
  arr[i].trangThai = value; luuDon(arr); renderBang();
  if(tuChiTiet){ showToast('Trạng thái đã được cập nhật'); document.getElementById('khungChiTiet').classList.remove('open'); } else {
    showToast('Trạng thái đã được cập nhật');
  }
}

/* CSV / in / tạo đơn từ payload / storage event */
function xuatCSV(rows, tenfile='donhang_export.csv'){
  if(!rows||rows.length===0){ alert('Không có đơn để xuất'); return; }
  const keys = ['id','ten','sdt','phuongThuc','diaChi','ngay','trangThai','items','total'];
  const csv = [keys.join(',')];
  rows.forEach(r=>{
    const items = r.items.map(i=>`${i.title} x${i.qty}`).join(' | ');
    const total = r.items.reduce((s,it)=>s+it.price*it.qty,0);
    const line = [r.id, r.ten, r.sdt, r.phuongThuc, `"${(r.diaChi||'').replace(/"/g,'""') }"`, r.ngay, r.trangThai, `"${items.replace(/"/g,'""')}"`, total];
    csv.push(line.join(','));
  });
  const blob = new Blob([csv.join('\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = tenfile; a.style.display='none'; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
}

function inDon(id){
  const arr = taiDon(); const o = arr.find(x=>x.id===id); if(!o) return;
  const w = window.open('','_blank'); if(!w){ alert('Trình duyệt đã chặn popup. Vui lòng cho phép popup.'); return; }
  const itemsHtml = o.items.map(it=>`<tr><td><img src="${it.img}" style="width:64px;height:44px;object-fit:cover;border-radius:6px"/></td><td>${it.title}</td><td>${it.qty}</td><td>${dinhVND(it.price)}</td><td>${dinhVND(it.price*it.qty)}</td></tr>`).join('');
  const total = o.items.reduce((s,it)=>s+it.price*it.qty,0);
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${o.id}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h2>Đơn ${o.id}</h2><div><strong>${o.ten}</strong> — ${o.sdt}</div><div>${o.phuongThuc} — ${o.diaChi||''}</div><div>Ngày: ${o.ngay}</div><table style="margin-top:12px"><thead><tr><th></th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${itemsHtml}</tbody></table><h3 style="text-align:right">Tổng: ${dinhVND(total)}</h3></body></html>`);
  w.document.close(); w.focus(); w.print();
}

/* In nhiều đơn (dùng khi bấm In chọn) */
function inDonNhieu(ids){
  if(!Array.isArray(ids) || ids.length===0) return;
  const arr = taiDon();
  const orders = arr.filter(o => ids.includes(o.id));
  const w = window.open('', '_blank');
  if(!w){ alert('Trình duyệt đã chặn popup. Vui lòng cho phép popup để in nhiều đơn cùng lúc.'); return; }

  const ordersHtml = orders.map(o => {
    const itemsHtml = (o.items||[]).map(it =>
      `<tr>
         <td style="width:72px"><img src="${it.img}" style="width:64px;height:44px;object-fit:cover;border-radius:6px" /></td>
         <td>${escapeHtml(it.title)}</td>
         <td style="text-align:center">${Number(it.qty)||1}</td>
         <td style="text-align:right">${dinhVND(it.price)}</td>
         <td style="text-align:right">${dinhVND((it.price||0)*(it.qty||1))}</td>
       </tr>`
    ).join('');
    const total = (o.items||[]).reduce((s,it)=> s + (Number(it.price||0) * Number(it.qty||1)), 0);
    return `<section style="page-break-after:always;margin-bottom:18px">
      <h2>Đơn ${escapeHtml(o.id)}</h2>
      <div><strong>${escapeHtml(o.ten)}</strong> — ${escapeHtml(o.sdt||'')}</div>
      <div>${escapeHtml(o.phuongThuc||'')} — ${escapeHtml(o.diaChi||'')}</div>
      <div>Ngày: ${escapeHtml(o.ngay||'')}</div>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead>
          <tr>
            <th style="border:1px solid #ddd;padding:6px;background:#f7f7f7"></th>
            <th style="border:1px solid #ddd;padding:6px;background:#f7f7f7;text-align:left">Sản phẩm</th>
            <th style="border:1px solid #ddd;padding:6px;background:#f7f7f7">SL</th>
            <th style="border:1px solid #ddd;padding:6px;background:#f7f7f7">Đơn giá</th>
            <th style="border:1px solid #ddd;padding:6px;background:#f7f7f7">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3 style="text-align:right;margin-top:8px">Tổng: ${dinhVND(total)}</h3>
    </section>`;
  }).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>In đơn hàng</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;padding:16px;color:#111}
      table td, table th { padding:6px; border:1px solid #ddd; vertical-align:middle; }
      h2{margin:0 0 6px}
      @media print { section { page-break-inside: avoid; } }
    </style>
    </head><body>${ordersHtml}</body></html>`;

  try{
    w.document.open();
    w.document.write(html);
    w.document.close();
    const doPrint = () => { try{ w.focus(); setTimeout(()=> { try{ w.print(); } catch(e){ console.warn('Lỗi khi gọi print:', e); } }, 200); } catch(err){ console.warn(err); } };
    if('onload' in w){ w.onload = doPrint; setTimeout(doPrint, 600); } else { setTimeout(doPrint, 500); }
  } catch(err){ console.error('Lỗi khi mở cửa sổ in nhiều đơn:', err); alert('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.'); }
}

/* Tạo đơn từ payload (storage event từ cửa hàng) */
function taoDonTuPayload(payload){
  try {
    const arr = taiDon();
    const ma = sinhMaDonMoi();
    const ngay = (new Date()).toISOString().slice(0,10);
    const tt = payload.thongTin || {};
    let items = [];
    if(Array.isArray(payload.sanPham) && payload.sanPham.length>0) {
      items = payload.sanPham.map(p=>{
        return {
          id: p.id || (p.productId||'p-?'),
          title: p.title || p.name || 'Sản phẩm',
          price: Number(p.gia || p.price || p.priceVN || 0),
          qty: Number(p.soLuong || p.qty || p.quantity || 1),
          img: p.img || p.image || ''
        };
      });
    } else {
      const gio = JSON.parse(localStorage.getItem(KHOA_GIO) || '[]');
      if(gio && gio.length) {
        items = gio.map(it=>({ id: it.id, title: it.title, price: Number(it.gia || it.price || 0), qty: Number(it.soLuong || it.qty || 1), img: it.img || '' }));
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
    luuDon(arr);
    renderBang();
    console.log('Đã tạo đơn tự động:', newOrder.id);
  } catch(e){
    console.error('Lỗi khi tạo đơn tự động:', e);
  }
}

/* storage listener */
window.addEventListener('storage', function(e){
  if(!e) return;
  if(e.key === 'donHangMoi' && e.newValue){
    try {
      const payload = JSON.parse(e.newValue);
      taoDonTuPayload(payload);
    } catch(err){
      console.warn('donHangMoi không hợp lệ', err);
    }
    try { localStorage.removeItem('donHangMoi'); } catch(e){}
  }
});

/* Khi tải trang: khởi tạo dữ liệu + render */
(function khoiTao(){ if(!localStorage.getItem(KHOA_ADMIN)) luuDon(typeof MAU !== 'undefined' ? MAU : []); renderBang(); })();

/* Controls binding */
document.getElementById('timKiem')?.addEventListener('input', ()=> debounce(renderBang,250)());
document.getElementById('locTrangThai')?.addEventListener('change', renderBang);
document.getElementById('btnLamMoi')?.addEventListener('click', ()=> { renderBang(); alert('Đã làm mới'); });
document.getElementById('btnXuat')?.addEventListener('click', ()=> xuatCSV(taiDon()));
document.getElementById('chkTatCa')?.addEventListener('change', function(){ document.querySelectorAll('.chk').forEach(c=> c.checked = this.checked); });
document.getElementById('xuatChon')?.addEventListener('click', ()=>{ const ids = Array.from(document.querySelectorAll('.chk:checked')).map(i=>i.dataset.id); if(ids.length===0){ alert('Chưa chọn đơn nào'); return; } const rows = taiDon().filter(o=> ids.includes(o.id)); xuatCSV(rows,'donhang_chon.csv'); });

// In chọn nhiều
document.getElementById('inChon')?.addEventListener('click', ()=> {
  const ids = Array.from(document.querySelectorAll('.chk:checked')).map(i=>i.dataset.id);
  if(ids.length===0){ alert('Chưa chọn đơn nào'); return; }
  inDonNhieu(ids);
});
