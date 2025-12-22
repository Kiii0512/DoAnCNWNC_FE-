class CartPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="cart-panel" style="display:none">
        <h4>Giỏ hàng</h4>
        <div class="cart-items"></div>
        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <strong>Tổng:</strong><strong class="cartTotal">0₫</strong>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn">Thanh toán</button>
          <button class="icon-btn">Xóa</button>
        </div>
      </div>
    `;

    const panel = this.querySelector('.cart-panel');
    const btn = document.getElementById('cartBtn');

    if (btn && panel) {
      btn.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
      });
    }
  }
}

customElements.define('cart-panel', CartPanel);
