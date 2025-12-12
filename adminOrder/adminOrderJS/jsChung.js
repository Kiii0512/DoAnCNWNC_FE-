/* Các hàm tiện ích dùng chung */
const KHOA_GIO = 'gio_demo_v1';

function dinhVND(n){ return Number(n).toLocaleString('vi-VN') + '₫' }

function escapeHtml(s){
  if(!s && s!==0) return '';
  return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; });
}

function debounce(fn, ms){ let t; return function(){ clearTimeout(t); const args=arguments; t=setTimeout(()=>fn.apply(this,args), ms); } }

function showToast(msg, ms=1800){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=> t.classList.remove('show'), ms);
}

/* Trạng thái metadata (dùng chung) */
const STATUS_META = {
  'dang-cho': { label:'Đang chờ', cls:'s-dang-cho', color:'#f97316' },
  'da-xac-nhan': { label:'Đã xác nhận', cls:'s-da-xac-nhan', color:'#10b981' },
  'dang-chuan-bi': { label:'Đang chuẩn bị', cls:'s-dang-chuan-bi', color:'#6366f1' },
  'da-gui': { label:'Đã gửi', cls:'s-da-gui', color:'#0b5cff' },
  'da-hoan-thanh': { label:'Hoàn thành', cls:'s-da-hoan-thanh', color:'#16a34a' },
  'da-huy': { label:'Đã hủy', cls:'s-da-huy', color:'#ef4444' }
};
