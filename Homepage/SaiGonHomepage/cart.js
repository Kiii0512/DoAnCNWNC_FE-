// ===============================
// CART STATE
// ===============================

// Lưu trạng thái giỏ hàng: key = id sản phẩm, value = số lượng
let cart = {};

// Lấy các DOM element cần thao tác
const grid = document.getElementById('grid');         // Grid sản phẩm
const cartCount = document.getElementById('cartCount'); // Số lượng sản phẩm trên icon cart
const cartPanel = document.getElementById('cartPanel'); // Panel giỏ hàng
const cartItems = document.getElementById('cartItems'); // Danh sách item trong cart
const cartTotal = document.getElementById('cartTotal'); // Tổng tiền

// Hàm định dạng giá tiền theo VND
function formatPrice(n) { return Number(n).toLocaleString('vi-VN') + '₫' }

// ===============================
// RENDER PRODUCT CARDS
// ===============================

function renderCards(list) {
  // Xóa toàn bộ card cũ
  grid.innerHTML = '';

  // Duyệt qua từng sản phẩm
  list.forEach(p => {
    // Tạo div card
    const el = document.createElement('div'); 
    el.className = 'card';

    // Thêm nội dung HTML cho card
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

    // Thêm card vào grid
    grid.appendChild(el);
  });
}

// ===============================
// QUICK VIEW MODAL
// ===============================

function quickView(id) {
  // Tìm sản phẩm theo id
  const p = products.find(x => x.id === id);
  if (!p) return;

  // Cập nhật nội dung modal
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalDesc').textContent = "Mô tả sản phẩm (demo).";
  document.getElementById('modalPrice').textContent = formatPrice(p.price);
  document.getElementById('modalOld').textContent = formatPrice(p.old);
  document.getElementById('qty').value = 1;

  // Thêm sự kiện cho nút Thêm vào cart trong modal
  document.getElementById('addToCartModal').onclick = () => {
    addToCart(p.id, Number(document.getElementById('qty').value));
    closeModal(); // đóng modal sau khi thêm
  };

  // Hiển thị modal
  document.getElementById('modal').classList.add('open');
}

// Đóng modal
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

// ===============================
// CART FUNCTIONS
// ===============================

// Thêm sản phẩm vào giỏ hàng
function addToCart(id, qty) {
  if (!cart[id]) cart[id] = 0; // nếu chưa có trong cart thì khởi tạo
  cart[id] += qty;              // cộng số lượng
  updateCartUI();               // cập nhật giao diện giỏ hàng
}

// Cập nhật hiển thị giỏ hàng
function updateCartUI() {
  const ids = Object.keys(cart); // tất cả id sản phẩm trong cart

  // Cập nhật số lượng trên icon cart
  cartCount.textContent = ids.reduce((s, k) => s + cart[k], 0);

  // Hiển thị panel nếu có sản phẩm
  cartPanel.style.display = ids.length > 0 ? 'block' : 'none';

  // Xóa danh sách cũ
  cartItems.innerHTML = '';
  let total = 0;

  // Duyệt qua các sản phẩm trong cart
  ids.forEach(k => {
    const p = products.find(x => x.id == k);
    const qty = cart[k];
    if (!p) return;

    // Tạo row item trong cart
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

    // Tính tổng tiền
    total += p.price * qty;
  });

  cartTotal.textContent = formatPrice(total);
}

// Tăng số lượng
function inc(id) { addToCart(id, 1) }

// Giảm số lượng
function dec(id) {
  if (!cart[id]) return;
  cart[id]--;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
}

// ===============================
// CART / MODAL EVENTS
// ===============================

// Đóng modal khi click nút X
document.getElementById('closeModal').addEventListener('click', closeModal);

// Đóng modal khi click ra ngoài modal-content
document.getElementById('modal').addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

// Toggle hiển thị cart panel khi click icon cart
document.getElementById('cartBtn').addEventListener('click', () => {
  cartPanel.style.display = cartPanel.style.display === 'block' ? 'none' : 'block';
});

// Demo: nút yêu thích
document.getElementById('favBtn').addEventListener('click', () => alert('Yêu thích (demo)'));

// Xóa giỏ hàng
document.getElementById('clearCart').addEventListener('click', () => { cart = {}; updateCartUI(); });

// Thanh toán demo
document.getElementById('checkout').addEventListener('click', () => alert('Demo: thanh toán'));

// ===============================
// MENU TÀI KHOẢN
// ===============================
const tkBtn = document.getElementById("taikhoan");   // nút tài khoản
const accountMenu = document.getElementById("accountMenu"); // menu dropdown

// Toggle menu tài khoản
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
