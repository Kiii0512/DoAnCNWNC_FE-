/* Demo data + page logic for staffProduct page */
const KHOA_SP = 'admin_sanpham_demo_v2';
const MAU_SP = [
  { id:'SP-001', sku:'SP-001', ten:'iPhone 17 Pro', gia:32990000, ton:12, img:'https://via.placeholder.com/300x200?text=iPhone+17+Pro', extras:[], specs:[], colors:[], caps:[] },
  { id:'SP-002', sku:'SP-002', ten:'AirPods Pro 2', gia:4990000, ton:5, img:'https://via.placeholder.com/300x200?text=AirPods+Pro+2', extras:[], specs:[], colors:[], caps:[] },
  { id:'SP-003', sku:'SP-003', ten:'Cáp Type-C', gia:190000, ton:30, img:'https://via.placeholder.com/300x200?text=Cap+Type-C', extras:[], specs:[], colors:[], caps:[] }
];

function taiSp(){ try{ return JSON.parse(localStorage.getItem(KHOA_SP)) || MAU_SP.slice(); }catch(e){ return MAU_SP.slice(); } }
function luuSp(arr){ localStorage.setItem(KHOA_SP, JSON.stringify(arr)); }
function generateId(){ const arr = taiSp(); let max=0; arr.forEach(p=>{ const m = String(p.id||'').match(/^(?:SP-|)(\d+)$/); if(m){ const n=Number(m[1]); if(n>max) max=n; } }); return 'SP-' + String(max+1).padStart(3,'0'); }
function generateSku(){ const arr = taiSp(); const existing = new Set(arr.map(x=> (x.sku||'').toUpperCase())); let n=1; while(true){ const s = 'SP-' + String(n).padStart(3,'00'); if(!existing.has(s)) return s; n++; } }
function dinhVND(n){ return Number(n||0).toLocaleString('vi-VN') + '₫' }

/* Render table and rest of page logic
   NOTE: This file assumes DOM IDs from staffProduct.html exist.
   All behaviors (drawer, images, detail modal) mirror the original page. */

/* Render table */
function renderBangSanPham(){
  const tbody = document.querySelector('#bangSanPham tbody'); if(!tbody) return; tbody.innerHTML='';
  const q = (document.getElementById('qSp')?.value||'').toLowerCase();
  const loc = document.querySelector('.seg-btn.active')?.dataset.value || '';
  let arr = taiSp();
  if(loc){ if(loc==='con') arr = arr.filter(p=> (p.ton||0) > 0); else arr = arr.filter(p=> (p.ton||0) <= 0); }
  if(q) arr = arr.filter(p => (p.ten||'').toLowerCase().includes(q) || (p.sku||'').toLowerCase().includes(q) || (p.id||'').toLowerCase().includes(q));

  arr.forEach(p=>{
    const tr = document.createElement('tr');
    const thumb = escapeHtml(p.img || (p.extras && p.extras[0]) || 'https://via.placeholder.com/300x200?text=No+Image');
    tr.innerHTML = `
      <td><input type="checkbox" class="chkSP" data-id="${p.id}" /></td>
      <td><img class="thumb" src="${thumb}" alt="${escapeHtml(p.ten||'')}" /></td>
      <td><strong>${escapeHtml(p.sku||p.id)}</strong><div class="small muted">${escapeHtml(p.ten||'')}</div></td>
      <td>${dinhVND(p.gia)}</td>
      <td>${p.ton}</td>
      <td class="small">
        <button class="btn btn-ghost xemChiTiet" data-id="${p.id}">Chi tiết</button>
        <button class="btn btn-ghost sua" data-id="${p.id}">Sửa</button>
        <button class="btn btn-ghost" data-action="xoa" data-id="${p.id}">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('totalCount').textContent = (arr.length||0);

  document.querySelectorAll('.sua').forEach(b=> b.addEventListener('click', e=> moDrawerSua(e.target.dataset.id)));
  document.querySelectorAll('button[data-action="xoa"]').forEach(b=> b.addEventListener('click', e=> {
    const id = e.target.dataset.id; if(!confirm('Bạn có chắc muốn xóa ' + id + ' ?')) return; xoaSanPham(id);
  }));

  document.querySelectorAll('.xemChiTiet').forEach(b=> b.addEventListener('click', function(e){
    const id = this.dataset.id || (e.currentTarget && e.currentTarget.dataset.id);
    openDetailModal(id);
  }));
}

/* The rest of drawer/modal/image logic is expected to be implemented in other files (demoStaffProduct.js previously included full logic).
   If you prefer, I can also send the full interactive demoStaffProduct.js with drawer/image handlers (read/write localStorage, image drag/drop).
   For now this file contains core data helpers and table rendering. */
