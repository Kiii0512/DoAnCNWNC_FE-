// Demo data
    const products = [
      {id:1,title:'iPhone 15 Pro Max 256GB',price:33990000,old:37990000,img:'https://images.unsplash.com/photo-1510557880182-3dc1f9b11d3b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:2,title:'MacBook Pro M2 14"',price:49990000,old:55990000,img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:3,title:'Samsung Galaxy S24 Ultra',price:26990000,old:29990000,img:'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:4,title:'AirPods Pro 2',price:4990000,old:5990000,img:'https://images.unsplash.com/photo-1585386959984-a415522a9f9b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:5,title:'Laptop Dell XPS 13',price:32990000,old:35990000,img:'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:6,title:'Chuột không dây Logitech',price:890000,old:1290000,img:'https://images.unsplash.com/photo-1585386959984-a415522a9f9b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:7,title:'iPhone 14 128GB',price:15990000,old:17990000,img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:8,title:'Sạc nhanh 65W',price:390000,old:590000,img:'https://images.unsplash.com/photo-1585386959984-a415522a9f9b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'}
    ];

    // cart state
    let cart = {};

    const grid = document.getElementById('grid');
    const cartCount = document.getElementById('cartCount');
    const cartPanel = document.getElementById('cartPanel');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    function formatPrice(n){ return n.toLocaleString('vi-VN') + '₫' }

    function renderCards(list){
      grid.innerHTML = '';
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
      // show panel
      if(ids.length>0) cartPanel.style.display='block';
      else cartPanel.style.display='none';

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

    // initial
    renderCards(products);
    updateCartUI();

    // ==== BANNER SLIDER ====
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");

function showSlide(index) {
  if (index >= slides.length) slideIndex = 0;
  if (index < 0) slideIndex = slides.length - 1;

  slides.forEach((slide, i) => {
    slide.style.display = i === slideIndex ? "block" : "none";
    dots[i].classList.toggle("active", i === slideIndex);
  });
}

function nextSlide() {
  slideIndex++;
  showSlide(slideIndex);
}

function prevSlideFunc() {
  slideIndex--;
  showSlide(slideIndex);
}

next.addEventListener("click", nextSlide);
prev.addEventListener("click", prevSlideFunc);
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    slideIndex = i;
    showSlide(slideIndex);
  });
});

// Tự động chuyển slide
setInterval(() => {
  slideIndex++;
  showSlide(slideIndex);
}, 4000);

// Khởi tạo
showSlide(slideIndex);


// cart bổ sung
// script.js
document.addEventListener("DOMContentLoaded", () => {
  const addToCartBtn = document.querySelector(".btn");

  addToCartBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const product = {
      id: "chair-1",
      name: "Arto Recline",
      price: 199,
      oldPrice: 259,
      image: "https://cdn.pixabay.com/photo/2017/03/27/14/56/chair-2179043_1280.jpg",
      quantity: 1,
    };

    // Lấy giỏ hàng hiện tại
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Kiểm tra nếu sp đã có thì tăng số lượng
    const existingProduct = cart.find((p) => p.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  });
});

