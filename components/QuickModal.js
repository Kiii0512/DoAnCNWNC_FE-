import { getProductById } from "../JS/API/productApi.js";
import { addToCart } from "../JS/service/cartService.js";

class QuickModal extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `
      <div class="modal" id="modal">
        <div class="modal-content">
          <img id="modalImg">

          <div class="modal-info">
            <h3 id="modalTitle"></h3>
            <p id="modalDesc"></p>

            <div class="price-wrap">
              <span id="modalPrice" class="price"></span>
            </div>

            <div class="modal-actions">
              <input type="number" id="qty" value="1" min="1">
              <button id="addToCartModal">Thêm vào giỏ</button>
            </div>

            <button id="closeModal">Đóng</button>
          </div>
        </div>
      </div>
    `;

    this.modal = this.querySelector("#modal");

    document.addEventListener("quickview:open", e =>
      this.open(e.detail.id)
    );

    this.modal.addEventListener("click", e => {
      if (e.target.id === "modal" || e.target.id === "closeModal") {
        this.close();
      }
    });

    this.querySelector("#addToCartModal")
      .addEventListener("click", () => this.add());
  }

  open(id) {
    this.product = getProductById(id);
    if (!this.product) return;

    this.querySelector("#modalImg").src = this.product.img;
    this.querySelector("#modalTitle").textContent = this.product.title;

    // ✅ DESCRIPTION
    this.querySelector("#modalDesc").textContent =
      this.product.description || "Chưa có mô tả cho sản phẩm này.";

    this.querySelector("#modalPrice").textContent =
      this.product.price.toLocaleString("vi-VN") + "₫";

    this.modal.classList.add("open");
  }

  close() {
    this.modal.classList.remove("open");
  }

  add() {
    const qty = +this.querySelector("#qty").value || 1;
    addToCart(this.product.id, qty);

    document.dispatchEvent(new Event("cart:update"));
    document.dispatchEvent(new Event("cart:open"));
    this.close();
  }
}

customElements.define("quick-modal", QuickModal);
