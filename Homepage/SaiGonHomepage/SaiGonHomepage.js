// ===============================
// LOAD PRODUCTS FROM API
// ===============================
let products = [];

async function loadProducts() {
  try {
    const res = await fetch("YOUR_API/api/products");
    products = await res.json();

    renderCards(products);
    updateCartUI();
  } catch (err) {
    console.error("API Error:", err);
  }
}

// ===============================
// CART STATE
// ===============================
let cart = {};

const grid = document.getElementById('grid');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

function formatPrice(n) { return Number(n).toLocaleString('vi-VN') + '₫' }

// ===============================
// RENDER PRODUCT CARDS
// ===============================
function renderCards(list) {
  grid.innerHTML = '';

  list.forEach(p => {
    const el = document.createElement('div'); 
    el.className = 'card';

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;color:#5b6b76">${p.title.split(' ').slice(0,3).join(' ')}...</div>
        <div class="badge">-${Math.round((1 - p.price / p.old) * 100)}%</div>
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
  });
}

// ===============================
// QUICK VIEW MODAL
// ===============================
function quickView(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalDesc').textContent = "Mô tả sản phẩm (demo).";
  document.getElementById('modalPrice').textContent = formatPrice(p.price);
  document.getElementById('modalOld').textContent = formatPrice(p.old);
  document.getElementById('qty').value = 1;

  document.getElementById('addToCartModal').onclick = () => {
    addToCart(p.id, Number(document.getElementById('qty').value));
    closeModal();
  };

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

// ===============================
// CART FUNCTIONS
// ===============================
function addToCart(id, qty) {
  if (!cart[id]) cart[id] = 0;
  cart[id] += qty;
  updateCartUI();
}

function updateCartUI() {
  const ids = Object.keys(cart);

  cartCount.textContent = ids.reduce((s, k) => s + cart[k], 0);
  cartPanel.style.display = ids.length > 0 ? 'block' : 'none';

  cartItems.innerHTML = '';
  let total = 0;

  ids.forEach(k => {
    const p = products.find(x => x.id == k);
    const qty = cart[k];
    if (!p) return;

    const row = document.createElement('div');
    row.className = 'cart-item';

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
  });

  cartTotal.textContent = formatPrice(total);
}

function inc(id) { addToCart(id, 1) }

function dec(id) {
  if (!cart[id]) return;
  cart[id]--;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
}

// ===============================
// EVENTS
// ===============================
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

document.getElementById('cartBtn').addEventListener('click', () => {
  cartPanel.style.display = cartPanel.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('favBtn').addEventListener('click', () => alert('Yêu thích (demo)'));

document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('q').value.toLowerCase();
  const filtered = products.filter(p => p.title.toLowerCase().includes(q));
  renderCards(filtered);
});

document.getElementById('sort').addEventListener('change', (e) => {
  let list = [...products];
  if (e.target.value === "price-asc") list.sort((a, b) => a.price - b.price);
  if (e.target.value === "price-desc") list.sort((a, b) => b.price - a.price);
  renderCards(list);
});

document.getElementById('clearCart').addEventListener('click', () => { cart = {}; updateCartUI(); });
document.getElementById('checkout').addEventListener('click', () => alert('Demo: thanh toán'));


// === MENU TÀI KHOẢN ===
const tkBtn = document.getElementById("taikhoan");
const accountMenu = document.getElementById("accountMenu");

tkBtn.addEventListener("click", () => {
  accountMenu.style.display =
    accountMenu.style.display === "flex" ? "none" : "flex";
});

// Ẩn menu khi click ra ngoài
document.addEventListener("click", (e) => {
  if (!tkBtn.contains(e.target) && !accountMenu.contains(e.target)) {
    accountMenu.style.display = "none";
  }
});


// ===============================
// BANNER SLIDER (giữ nguyên)
// ===============================
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

function nextSlide() { slideIndex++; showSlide(slideIndex); }
function prevSlideFunc() { slideIndex--; showSlide(slideIndex); }

next.addEventListener("click", nextSlide);
prev.addEventListener("click", prevSlideFunc);
dots.forEach((dot, i) => dot.addEventListener("click", () => {
  slideIndex = i; showSlide(slideIndex);
}));

setInterval(() => { slideIndex++; showSlide(slideIndex); }, 4000);
showSlide(slideIndex);

// ===============================
// START
// ===============================
loadProducts();
