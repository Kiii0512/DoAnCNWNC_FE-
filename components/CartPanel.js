import {
  addToCart,
  decreaseItem,
  getCartList,
  getTotal
} from "../JS/service/cartService.js";

class CartPanel extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `
      <div class="cart-panel" id="cartPanel">
        <h4 class="cart-title">Giỏ hàng</h4>

        <div class="cart-items" id="cartItems"></div>

        <div class="cart-total">
          <strong>Tổng:</strong>
          <strong id="cartTotal">0₫</strong>
        </div>

        <div class="cart-actions">
          <button class="btn-primary" id="checkout">Thanh toán</button>
          <button class="btn-secondary" id="clearCart">Xóa</button>
        </div>
      </div>
    `;

    this.panel = this.querySelector("#cartPanel");
    this.itemsEl = this.querySelector("#cartItems");
    this.totalEl = this.querySelector("#cartTotal");

    document.addEventListener("cart:update", () => this.render());
    document.addEventListener("cart:open", () => this.open());

    this.panel.addEventListener("click", e => this.handleClick(e));
    this.render();
  }

  open() {
    this.panel.classList.add("open");
  }

  handleClick(e) {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");

    if (inc) {
      addToCart(inc.dataset.inc, 1);
      this.render();
    }

    if (dec) {
      decreaseItem(dec.dataset.dec);
      this.render();
    }
  }

  render() {
    const list = getCartList();

    this.itemsEl.innerHTML = list.map(p => `
      <div class="cart-item">
        <img src="${p.img}" alt="">
        <div class="cart-info">
          <span class="cart-name">${p.title}</span>
          <span class="cart-qty">× ${p.qty}</span>
        </div>
        <div class="cart-controls">
          <button data-inc="${p.id}">+</button>
          <button data-dec="${p.id}">−</button>
        </div>
      </div>
    `).join("");

    this.totalEl.textContent =
      getTotal().toLocaleString("vi-VN") + "₫";
  }
}

customElements.define("cart-panel", CartPanel);
