// ===== Demo data =====
const products = [
  {id:1,brand: "iphone",title:'iPhone 15 Pro Max 256GB',price:33990000,old:37990000,img:'https://images.unsplash.com/photo-1510557880182-3dc1f9b11d3b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:2,brand: "iphone",title:'MacBook Pro M2 14"',price:49990000,old:55990000,img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:3, brand: "samsung",title:'Samsung Galaxy S24 Ultra',price:26990000,old:29990000,img:'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:4, brand: "iphone",title:'AirPods Pro 2',price:4990000,old:5990000,img:'https://images.unsplash.com/photo-1585386959984-a415522a9f9b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:5,title:'Laptop Dell XPS 13',price:32990000,old:35990000,img:'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:6,title:'Chuột không dây Logitech',price:890000,old:1290000,img:'https://images.unsplash.com/photo-1585386959984-a415522a9f9b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:7,title:'iPhone 14 128GB',price:15990000,old:17990000,img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
  {id:8,title:'Sạc nhanh 65W',price:390000,old:590000,img:'https://images.unsplash.com/photo-1585386959984-a415522a9f9b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'}
];

// ===== Cart của Huy =====
let cart = {};
const grid = document.getElementById('grid');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

function formatPrice(n){ return n.toLocaleString('vi-VN') + '₫' }

function renderCards(list){
  grid.innerHTML = '';
  if(list.length===0){
    grid.innerHTML = '<p>Không có sản phẩm nào.</p>';
    return;
  }
  list.forEach(p=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;color:#5b6b76">${p.title.split(' ').slice(0,3).join(' ')}...</div>
        <div class="badge">-${Math.round((1-p.price/p.old)*100)}%</div>
      </div>
      <img src="${p.img}" alt="${p.title}"/>
      <div>
        <div style="min-height:40px">${p.title}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div>
            <div class="price">${formatPrice(p.price)}</div>
            <div class="old">${formatPrice(p.old)}</div>
          </div>
          <div class="actions">
            <button onclick="quickView(${p.id})" class="icon-btn">Xem</button>
            <button onclick="addToCart(${p.id},1)" class="btn">Thêm</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(el);
  })
}

// ===== Quick view / Cart =====
function quickView(id){
  const p = products.find(x=>x.id===id);
  document.getElementById('modalImg').src=p.img;
  document.getElementById('modalTitle').textContent=p.title;
  document.getElementById('modalDesc').textContent='Mô tả ngắn cho sản phẩm. Thông số: mẫu demo.';
  document.getElementById('modalPrice').textContent=formatPrice(p.price);
  document.getElementById('modalOld').textContent=formatPrice(p.old);
  document.getElementById('qty').value=1;
  document.getElementById('addToCartModal').onclick = ()=>{ addToCart(p.id, Number(document.getElementById('qty').value)); closeModal() }
  document.getElementById('modal').classList.add('open');
}
function closeModal(){document.getElementById('modal').classList.remove('open')}

function addToCart(id,qty){
  if(!cart[id]) cart[id]=0; cart[id]+=qty;
  updateCartUI();
}

function updateCartUI(){
  const ids = Object.keys(cart);
  cartCount.textContent = ids.reduce((s,k)=>s+cart[k],0);
  cartPanel.style.display = ids.length>0 ? 'block':'none';
  cartItems.innerHTML='';
  let total=0;
  ids.forEach(k=>{
    const p = products.find(x=>x.id==k);
    const qty = cart[k];
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <img src="${p.img}" style="width:56px;height:56px;object-fit:contain;border-radius:6px">
      <div style="flex:1">
        <div style="font-size:14px">${p.title}</div>
        <div style="font-size:13px;color:#6b7280">${formatPrice(p.price)} × ${qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <button onclick="inc(${p.id})" class="icon-btn">+</button>
        <button onclick="dec(${p.id})" class="icon-btn">-</button>
      </div>
    `;
    cartItems.appendChild(row);
    total += p.price * qty;
  })
  cartTotal.textContent = formatPrice(total);
}

function inc(id){ addToCart(id,1) }
function dec(id){ if(!cart[id]) return; cart[id]--; if(cart[id]<=0) delete cart[id]; updateCartUI() }

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') closeModal() });

document.getElementById('cartBtn').addEventListener('click', ()=>{ cartPanel.style.display = cartPanel.style.display==='block' ? 'none' : 'block' });
document.getElementById('favBtn').addEventListener('click', ()=>alert('Tính năng yêu thích demo'));
document.getElementById('searchBtn').addEventListener('click', ()=>{
  const q = document.getElementById('q').value.toLowerCase();
  const filtered = products.filter(p=>p.title.toLowerCase().includes(q));
  renderCards(filtered);
})

document.getElementById('sort').addEventListener('change',(e)=>{
  let list = [...products];
  if(e.target.value==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(e.target.value==='price-desc') list.sort((a,b)=>b.price-a.price);
  renderCards(list);
})

document.getElementById('clearCart').addEventListener('click', ()=>{ cart={}; updateCartUI(); });
document.getElementById('checkout').addEventListener('click', ()=>{ alert('Demo: tiến hành thanh toán'); });

// ===== Brand Filter của Quyền =====
const params = new URLSearchParams(window.location.search);
const brandFilter = params.get("brand");

// Hiển thị toàn bộ hoặc theo brand
let displayProducts = brandFilter ? products.filter(p => p.brand === brandFilter) : products;

// ===== Render initial =====
renderCards(displayProducts);
updateCartUI();
