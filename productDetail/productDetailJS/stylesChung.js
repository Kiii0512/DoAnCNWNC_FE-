/* Shared helpers used by components & page logic */

const KHOA_GIO = 'gio_demo_v1';

function dinhVND(n){ return Number(n||0).toLocaleString('vi-VN') + '₫'; }

function taiGio(){ try{ return JSON.parse(localStorage.getItem(KHOA_GIO)) || []; } catch(e){ return []; } }
function luuGio(arr){ localStorage.setItem(KHOA_GIO, JSON.stringify(arr)); capNhatBadgeGio(); }

function showToast(msg, ms=1200){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=> t.classList.remove('show'), ms);
}

/* Updated: capNhatBadgeGio — hiển thị số trong ngoặc (Giỏ hàng (N)) */
function capNhatBadgeGio(){
  const nut = document.getElementById('btnGio') || document.getElementById('cartBtn');
  if(!nut) return;
  const arr = taiGio();
  const s = arr.reduce((sum,i)=> sum + (Number(i.qty)||0), 0);
  const cartCountSpan = document.getElementById('cartCount');
  if(cartCountSpan){
    cartCountSpan.textContent = s;
    cartCountSpan.style.display = (s <= 0) ? 'none' : 'inline';
    return;
  }
  try { nut.innerHTML = `Giỏ hàng (${s})`; } catch(e){ nut.textContent = `Giỏ hàng (${s})`; }
}
window.addEventListener('storage', capNhatBadgeGio);
document.addEventListener('DOMContentLoaded', capNhatBadgeGio);
