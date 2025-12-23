/* Helpers & demo storage helpers */
const KHOA_ADMIN = 'admin_donhang_demo';

function dinhVND(n){ return Number(n||0).toLocaleString('vi-VN') + '₫' }

function offsetDateISO(offsetDays){
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0,10);
}

function taiDon(){ try{ return JSON.parse(localStorage.getItem(KHOA_ADMIN)) || MAU.slice() }catch(e){ return MAU.slice() } }
function luuDon(arr){ localStorage.setItem(KHOA_ADMIN, JSON.stringify(arr)); }

function showToast(msg, ms=1400){ const t = document.getElementById('toast'); if(!t) return; t.textContent = msg; t.style.display='block'; t.style.opacity='1'; clearTimeout(t._t); t._t = setTimeout(()=>{ t.style.opacity='0'; t.style.display='none'; }, ms); }

/* small debounce helper */
function debounce(fn, ms = 160){ let t; return function(){ clearTimeout(t); const args = arguments; const ctx = this; t = setTimeout(()=> fn.apply(ctx, args), ms); }; }

/* export CSV utility */
function exportCSV(rows, filename='orders_export.csv'){
  if(!rows || rows.length === 0){ alert('Không có dữ liệu để xuất'); return; }
  const keys = ['id','ten','sdt','ngay','trangThai','total'];
  const csv = [keys.join(',')];
  rows.forEach(r=>{
    const total = (r.items||[]).reduce((s,it)=> s + (Number(it.price||0) * Number(it.qty||1)), 0);
    const line = [r.id, r.ten, r.sdt, r.ngay, r.trangThai, total];
    csv.push(line.map(c=> '"'+String(c).replace(/"/g,'""') +'"').join(','));
  });
  const blob = new Blob([csv.join('\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  showToast('Đã xuất CSV');
}