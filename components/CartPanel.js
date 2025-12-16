class CartPanel extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <style>
        .cart-panel {
        position: fixed; right: 18px; bottom: 18px; background:#fff; border-radius:12px; padding:12px;
        border:1px solid #e6e9ee; width:320px; box-shadow:0 6px 20px rgba(16,24,40,.12)
        }
        .cart-items { max-height:220px; overflow:auto }
        .cart-item { display:flex; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9 }
        </style>

        <div class="cart-panel" id="cartPanel" style="display:none">
          <h4>Giỏ hàng</h4>
          <div class="cart-items" id="cartItems"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
            <strong>Tổng:</strong><strong id="cartTotal">0₫</strong>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px">
            <button class="btn" id="checkout">Thanh toán</button>
            <button class="icon-btn" id="clearCart">Xóa</button>
          </div>
        </div>
      `;

      // xử lý hiển thị panel khi nhấn nút giỏ hàng
      const script = document.createElement('script');
      script.textContent = `
        const cartBtn = document.getElementById('cartBtn');
        const cartPanel = document.getElementById('cartPanel');
        if (cartBtn) {
          cartBtn.addEventListener('click', () => {
            cartPanel.style.display = cartPanel.style.display === 'block' ? 'none' : 'block';
          });
        }
      `;
      this.appendChild(script);
    }
  }
  customElements.define('cart-panel', CartPanel);