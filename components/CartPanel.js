class cartPanel extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
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
  customElements.define('cart-panel', cartPanel);