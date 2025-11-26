/* adminOrder.js */
'use strict';

// ---------- Menu scroll behaviour (updated: active persists via location.hash) ----------
(function(){
  const wrap = document.getElementById('scrollWrap');
  const inner = document.getElementById('scrollInner');
  const left = document.getElementById('leftArrow');
  const right = document.getElementById('rightArrow');
  if(!wrap || !inner) return;

  function updateArrows(){
    const maxScroll = inner.scrollWidth - wrap.clientWidth;
    if (maxScroll <= 2) {
      left && (left.hidden = true);
      right && (right.hidden = true);
      left && left.setAttribute('aria-hidden','true');
      right && right.setAttribute('aria-hidden','true');
      return;
    }
    if (wrap.scrollLeft <= 4) {
      left && (left.hidden = true, left.setAttribute('aria-hidden','true'));
    } else {
      left && (left.hidden = false, left.removeAttribute('aria-hidden'));
    }
    if (wrap.scrollLeft >= maxScroll - 4) {
      right && (right.hidden = true, right.setAttribute('aria-hidden','true'));
    } else {
      right && (right.hidden = false, right.removeAttribute('aria-hidden'));
    }
  }

  function doScroll(dir){
    const step = Math.round(wrap.clientWidth * 0.7) || 200;
    const target = dir === 'right' ? Math.min(inner.scrollWidth - wrap.clientWidth, wrap.scrollLeft + step) : Math.max(0, wrap.scrollLeft - step);
    smoothScrollTo(wrap, target, 300);
  }

  function smoothScrollTo(elem, to, duration) {
    const start = elem.scrollLeft;
    const change = to - start;
    const startTime = performance.now();
    function animate(time){
      const t = Math.min(1, (time - startTime) / duration);
      const eased = t<0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
      elem.scrollLeft = Math.round(start + change * eased);
      if (t < 1) requestAnimationFrame(animate); else updateArrows();
    }
    requestAnimationFrame(animate);
  }

  right && right.addEventListener('click', (e)=> { e.stopPropagation(); doScroll('right'); });
  left && left.addEventListener('click', (e)=> { e.stopPropagation(); doScroll('left'); });

  right && right.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); right.click(); }});
  left && left.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); left.click(); }});

  window.addEventListener('resize', updateArrows);
  wrap.addEventListener('scroll', () => { window.requestAnimationFrame(updateArrows); });

  let startX = 0, isTouching = false;
  wrap.addEventListener('touchstart', e=>{ isTouching=true; startX = e.touches[0].clientX; });
  wrap.addEventListener('touchmove', e=>{ if(!isTouching) return; const dx = startX - e.touches[0].clientX; wrap.scrollLeft += dx; startX = e.touches[0].clientX; });
  wrap.addEventListener('touchend', ()=>{ isTouching=false; updateArrows(); });

  // enhanced activation: supports location.hash persistence + click
  const menuItems = Array.from(document.querySelectorAll('.menu-item'));

  function setActiveElement(el){
    menuItems.forEach(x=>{ x.classList.remove('active'); x.removeAttribute('aria-current'); });
    if(!el) return;
    el.classList.add('active');
    el.setAttribute('aria-current','page');
    // ensure visible inside scroll-wrap
    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if(elRect.left < wrapRect.left || elRect.right > wrapRect.right){
      const target = Math.max(0, el.offsetLeft - Math.round(wrap.clientWidth * 0.14));
      smoothScrollTo(wrap, target, 300);
    }
    updateArrows();
  }

  menuItems.forEach(a=>{
    a.setAttribute('tabindex','0');
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href') || ''; if(href.startsWith('#')){ location.hash = href; }
      setActiveElement(a);
    });
    a.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); a.click(); } });
  });

  function setActiveFromLocation(){
    const hash = location.hash || '';
    let sel = null;
    if(hash){ sel = document.querySelector(`.menu-item[href="${hash}"]`) || document.querySelector(`.menu-item[data-route="${hash.replace('#','')}"]`); }
    if(!sel) sel = document.querySelector('.menu-item[href="#orders"]') || document.querySelector('.menu-item'); // default to Orders (or first)
    setActiveElement(sel);
  }

  window.addEventListener('hashchange', setActiveFromLocation);
  window.addEventListener('load', ()=>{ setActiveFromLocation(); updateArrows(); });
  setTimeout(()=>{ setActiveFromLocation(); updateArrows(); }, 160);
})();


// ---------- existing app code (orders, render, etc.) ----------
const KHOA_ADMIN = 'admin_donhang_demo';
const KHOA_GIO = 'gio_demo_v1';

const MAU = [
  { id:'DH-1001', ten:'Nguyen Van A', sdt:'0912345678', phuongThuc:'Giao tận nơi', diaChi:'Hà Nội, Q1, Đường A', ngay:'2025-11-01', trangThai:'dang-cho', items:[{id:'p1',title:'iPhone 17 Pro',price:32990000,qty:1, img:'images/iphone17.jpg'}]},
  { id:'DH-1002', ten:'Tran Thi B', sdt:'0987654321', phuongThuc:'Nhận tại cửa hàng', diaChi:'TP HCM, Q7', ngay:'2025-11-03', trangThai:'da-xac-nhan', items:[{id:'p2',title:'AirPods Pro 2',price:4990000,qty:2,img:'images/airpodpro.jpg'}]},
  { id:'DH-1003', ten:'Le C', sdt:'0901122334', phuongThuc:'Giao tận nơi', diaChi:'Đà Nẵng, Hải Châu', ngay:'2025-11-05', trangThai:'da-gui', items:[{id:'p3',title:'Cáp Type-C',price:190000,qty:3,img:'https://via.placeholder.com/160x120?text=C%E1%BA%A1p'}]}
];

function taiDon(){ try{ return JSON.parse(localStorage.getItem(KHOA_ADMIN)) || MAU.slice() }catch(e){ return MAU.slice() } }
function luuDon(arr){ localStorage.setItem(KHOA_ADMIN, JSON.stringify(arr)); }
function taiGio(){ try{ return JSON.parse(localStorage.getItem(KHOA_GIO)) || [] }catch(e){ return [] } }
function dinhVND(n){ return Number(n).toLocaleString('vi-VN') + '₫' }
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

const STATUS_META = {
  'dang-cho': { label:'Đang chờ', cls:'s-dang-cho', color:'#f97316' },
  'da-xac-nhan': { label:'Đã xác nhận', cls:'s-da-xac-nhan', color:'#10b981' },
  'dang-chuan-bi': { label:'Đang chuẩn bị', cls:'s-dang-chuan-bi', color:'#6366f1' },
  'da-gui': { label:'Đã gửi', cls:'s-da-gui', color:'#0b5cff' },
  'da-hoan-thanh': { label:'Hoàn thành', cls:'s-da-hoan-thanh', color:'#16a34a' },
  'da-huy': { label:'Đã hủy', cls:'s-da-huy', color:'#ef4444' }
};

function showToast(msg, ms=1800){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=> t.classList.remove('show'), ms);
}

/* ---------- render table (no global event listeners inside) ---------- */
function renderBang(){
  const tbody = document.querySelector('#bangDon tbody');
  if(!tbody) return;
  tbody.innerHTML='';
  const q = (document.getElementById('timKiem')?.value||'').toLowerCase();
  const loc = document.getElementById('locTrangThai')?.value;
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
        <div class="status-menu" data-for="${o.id}" role="menu" aria-label="Chọn trạng thái">
          ${Object.keys(STATUS_META).map(k=>{
            const m = STATUS_META[k];
            return `<div class="opt" data-status="${k}" role="menuitem"><span class="dot" style="background:${m.color}"></span><div style="flex:1">${m.label}</div></div>`;
          }).join('')}
        </div>
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

    // highlight selected option in status menu
    const menu = tr.querySelector(`.status-menu`);
    if(menu){
      menu.querySelectorAll('.opt').forEach(opt=>{
        opt.style.background = opt.dataset.status === o.trangThai ? '#f3f4f6' : 'transparent';
      });
    }
  });

  // uncheck select-all checkbox
  const chkAll = document.getElementById('chkTatCa');
  if(chkAll) chkAll.checked = false;
}

/* ---------- event handling via delegation (single bindings) ---------- */
function onDocClickForStatus(e){
  const anyOpen = document.querySelector('.status-menu.open');
  if(!anyOpen) return;
  if(e.target.closest('.status-menu') || e.target.closest('.status-action')) return;
  closeAllStatusMenus();
}

function toggleStatusMenu(id, btn){
  closeAllStatusMenus();
  const menu = document.querySelector(`.status-menu[data-for="${id}"]`);
  if(!menu) return;
  menu.classList.add('open');
  btn.setAttribute('aria-expanded','true');
  const firstOpt = menu.querySelector('.opt');
  if(firstOpt) firstOpt.focus?.();
}

function closeAllStatusMenus(){
  document.querySelectorAll('.status-menu.open').forEach(m=>{
    m.classList.remove('open');
    const btn = document.querySelector(`.status-action[data-id="${m.dataset.for}"]`);
    if(btn) btn.setAttribute('aria-expanded','false');
  });
}

/* Delegation on tbody */
const tbody = document.querySelector('#bangDon tbody');
if(tbody){
  tbody.addEventListener('click', function(e){
    const xemBtn = e.target.closest('.xem');
    if(xemBtn){
      // use currentTarget-like reference: the actual button element
      moKhungChiTiet(xemBtn.dataset.id);
      return;
    }

    const statusActionBtn = e.target.closest('.status-action');
    if(statusActionBtn){
      e.stopPropagation();
      const id = statusActionBtn.dataset.id;
      toggleStatusMenu(id, statusActionBtn);
      return;
    }

    const opt = e.target.closest('.opt');
    if(opt){
      const status = opt.dataset.status;
      const menu = opt.closest('.status-menu');
      const id = menu && menu.dataset.for;
      if(id && status){
        capNhatTrangThai(id, status, true);
        closeAllStatusMenus();
      }
      return;
    }

    const chk = e.target.closest('input.chk');
    if(chk){
      // nothing to do special here; checkboxes are read when exporting/printing
      return;
    }
  });
}

/* ---------- rest of behaviors and helpers ---------- */
function moKhungChiTiet(id){ 
  const arr = taiDon(); const o = arr.find(x=>x.id===id); if(!o) return;
  document.getElementById('khungChiTiet').classList.add('open');
  document.getElementById('khungChiTiet').setAttribute('aria-hidden','false');
  document.getElementById('chiTietMa').textContent = o.id;
  document.getElementById('chiTietKhach').innerHTML = `
    <div><strong>${o.ten}</strong></div>
    <div class="small muted">${o.sdt}</div>
    <div class="small muted">${o.phuongThuc} — ${o.diaChi || '—'}</div>
    <div class="small muted">Ngày đặt: ${o.ngay}</div>
  `;
  const sel = document.getElementById('chiTietTrangThai');
  if(sel) sel.value = o.trangThai;

  const pr = document.getElementById('chiTietSanPham'); if(pr){ pr.innerHTML=''; }
  let total=0;
  o.items.forEach(it=>{
    const sub = it.price * it.qty; total+=sub;
    const div = document.createElement('div'); div.className='product-item';
    div.innerHTML = `<img src="${it.img}" alt="${it.title}"/><div style="flex:1"><div style="font-weight:600">${it.title}</div><div class="small muted">${it.qty} x ${dinhVND(it.price)}</div></div><div style="font-weight:700">${dinhVND(sub)}</div>`;
    pr && pr.appendChild(div);
  });
  document.getElementById('chiTietTong').innerHTML = `<div style="margin-top:8px;font-weight:700">Tổng: ${dinhVND(total)}</div>`;

  const btnLuu = document.getElementById('luuTrangThai');
  if(btnLuu) btnLuu.onclick = ()=>{ const neu = document.getElementById('chiTietTrangThai').value; capNhatTrangThai(id, neu, true); };
  const btnIn = document.getElementById('inDon');
  if(btnIn) btnIn.onclick = ()=> inDon(id);
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
  const w = window.open('','_blank'); 
  const itemsHtml = o.items.map(it=>`<tr><td><img src="${it.img}" style="width:64px;height:44px;object-fit:cover;border-radius:6px"/></td><td>${it.title}</td><td>${it.qty}</td><td>${dinhVND(it.price)}</td><td>${dinhVND(it.price*it.qty)}</td></tr>`).join('');
  const total = o.items.reduce((s,it)=>s+it.price*it.qty,0);
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${o.id}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h2>Đơn ${o.id}</h2><div><strong>${o.ten}</strong> — ${o.sdt}</div><div>${o.phuongThuc} — ${o.diaChi||''}</div><div>Ngày: ${o.ngay}</div><table style="margin-top:12px"><thead><tr><th></th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${itemsHtml}</tbody></table><h3 style="text-align:right">Tổng: ${dinhVND(total)}</h3></body></html>`);
  w.document.close(); w.focus(); w.print(); 
}

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
      const gio = taiGio();
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

(function kiemTraDonMoiKhiTai(){
  try {
    const v = localStorage.getItem('donHangMoi');
    if(v){
      const payload = JSON.parse(v);
      taoDonTuPayload(payload);
      localStorage.removeItem('donHangMoi');
    }
  } catch(e){}
})();

// --------- Utility: debounce (create single debounced function once) ----------
function debounce(fn, ms){ let t; return function(){ clearTimeout(t); const args=arguments; t=setTimeout(()=>fn.apply(this,args), ms); } }

// create debounced render and bind inputs & static controls (only once)
const debouncedRender = debounce(renderBang, 250);

// bind inputs & buttons (guard if elements missing)
document.getElementById('timKiem')?.addEventListener('input', debouncedRender);
document.getElementById('locTrangThai')?.addEventListener('change', renderBang);
document.getElementById('btnLamMoi')?.addEventListener('click', ()=> { renderBang(); alert('Đã làm mới'); });
document.getElementById('btnXuat')?.addEventListener('click', ()=> xuatCSV(taiDon()));
document.getElementById('chkTatCa')?.addEventListener('change', function(){ document.querySelectorAll('.chk').forEach(c=> c.checked = this.checked); });

document.getElementById('xuatChon')?.addEventListener('click', ()=>{
  const ids = Array.from(document.querySelectorAll('.chk:checked')).map(i=>i.dataset.id);
  if(ids.length===0){ alert('Chưa chọn đơn nào'); return; }
  const rows = taiDon().filter(o=> ids.includes(o.id)); xuatCSV(rows,'donhang_chon.csv');
});

document.getElementById('inChon')?.addEventListener('click', ()=>{
  const ids = Array.from(document.querySelectorAll('.chk:checked')).map(i=>i.dataset.id);
  if(ids.length===0){ alert('Chưa chọn đơn nào'); return; }
  ids.forEach(id=> inDon(id));
});

// bind global click to close status menus (only once)
document.addEventListener('click', onDocClickForStatus);

// ---------- init ----------
(function khoiTao(){ if(!localStorage.getItem(KHOA_ADMIN)) luuDon(MAU); renderBang(); })();
