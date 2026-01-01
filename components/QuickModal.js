import { getProductWithVariations } from "../JS/API/productAPI.js";
import { addToCart } from "../JS/API/cartApi.js";

class QuickModal extends HTMLElement {
  constructor() {
    super();
    this.product = null;
    this.selectedVariation = null;
    this._initialized = false;
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="modal" id="modal">
        <div class="modal-content">
          <div class="modal-image-section">
            <img id="modalImg" src="" alt="Product image" />
            <div id="modalThumbnails" class="modal-thumbnails"></div>
          </div>

          <div class="modal-info">
            <h3 id="modalTitle"></h3>
            <p id="modalCategory" class="modal-category"></p>
            
            <div class="price-wrap">
              <span id="modalPrice" class="price"></span>
            </div>

            <p id="modalDesc" class="modal-description"></p>

            <!-- Stock info -->
            <div id="stockInfo" class="stock-info">
              <i class="bx bx-package"></i>
              <span id="stockText">Còn hàng</span>
            </div>

            <!-- Variations Section - Shows combinations -->
            <div id="variationsContainer">
              <div class="variation-group">
                <label>Chọn phiên bản:</label>
                <div id="variationCombinations" class="variation-combinations"></div>
              </div>
            </div>

            <!-- Quantity Section -->
            <div class="quantity-section">
              <label>Số lượng:</label>
              <div class="quantity-control">
                <button type="button" id="qtyMinus"><i class="bx bx-minus"></i></button>
                <input type="number" id="qty" value="1" min="1" />
                <button type="button" id="qtyPlus"><i class="bx bx-plus"></i></button>
              </div>
            </div>

            <div class="modal-actions">
              <button id="addToCartModal" class="btn-add-cart">
                <i class="bx bx-cart-plus"></i> Thêm vào giỏ hàng
              </button>
            </div>

            <button id="closeModal" class="btn-close">
              <i class="bx bx-x"></i> Đóng
            </button>
          </div>
        </div>
      </div>
    `;

    this._initialized = true;
    this.modal = this.querySelector("#modal");
    this.quantityInput = this.querySelector("#qty");
    
    // Event listeners
    document.addEventListener("quickview:open", (e) => this.open(e.detail.id));

    this.modal.addEventListener("click", (e) => {
      if (e.target.id === "modal" || e.target.id === "closeModal") {
        this.close();
      }
    });

    const qtyMinus = this.querySelector("#qtyMinus");
    const qtyPlus = this.querySelector("#qtyPlus");
    const addBtn = this.querySelector("#addToCartModal");
    
    if (qtyMinus) qtyMinus.addEventListener("click", () => this.updateQuantity(-1));
    if (qtyPlus) qtyPlus.addEventListener("click", () => this.updateQuantity(1));
    if (this.quantityInput) this.quantityInput.addEventListener("change", () => this.validateQuantity());
    if (addBtn) addBtn.addEventListener("click", () => this.add());
  }

  async open(productId) {
    // Wait for initialization if needed
    if (!this._initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Show loading
    this.showLoading(true);

    try {
      this.product = await getProductWithVariations(productId);
      
      if (!this.product) {
        alert("Không tìm thấy sản phẩm");
        return;
      }

      console.log("Product variations:", this.product.variations);

      // Update basic info
      const imgEl = this.querySelector("#modalImg");
      if (imgEl) imgEl.src = this.product.img || "/assets/images/no-image.jpg";
      
      const titleEl = this.querySelector("#modalTitle");
      if (titleEl) titleEl.textContent = this.product.title;
      
      const categoryEl = this.querySelector("#modalCategory");
      if (categoryEl) {
        categoryEl.textContent = `${this.product.category || ""}${this.product.brand ? ` - ${this.product.brand}` : ""}`;
      }
      
      const descEl = this.querySelector("#modalDesc");
      if (descEl) {
        descEl.textContent = this.product.description || "Chưa có mô tả cho sản phẩm này.";
      }

      // Render thumbnails
      this.renderThumbnails();

      // Render variation combinations
      this.renderVariationCombinations();

      // Initialize with first variation
      this.selectFirstVariation();

      // Show modal
      if (this.modal) {
        this.modal.classList.add("open");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      alert("Không thể tải thông tin sản phẩm");
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const content = this.querySelector(".modal-content");
    if (content) {
      if (show) {
        content.style.opacity = "0.5";
        content.style.pointerEvents = "none";
      } else {
        content.style.opacity = "1";
        content.style.pointerEvents = "auto";
      }
    }
  }

  renderThumbnails() {
    const container = this.querySelector("#modalThumbnails");
    const images = this.product.images || [];
    
    if (!container || images.length <= 1) {
      if (container) container.innerHTML = "";
      return;
    }

    container.innerHTML = images.map((img, index) => `
      <img src="${img.imageUrl}" 
           alt="Thumbnail ${index + 1}" 
           class="thumbnail ${index === 0 ? 'active' : ''}"
           data-src="${img.imageUrl}" />
    `).join("");

    // Add click handlers
    container.querySelectorAll(".thumbnail").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        container.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        const imgEl = this.querySelector("#modalImg");
        if (imgEl) imgEl.src = thumb.dataset.src;
      });
    });
  }

  renderVariationCombinations() {
    const container = this.querySelector("#variationCombinations");
    const variations = this.product.variations || [];

    if (!container) return;

    if (!variations.length) {
      container.innerHTML = '<p>Không có phân loại</p>';
      return;
    }

    // Render each variation as a combination option
    const html = variations.map((v, idx) => {
      // Build combination label from options
      const optionLabels = v.options.map(opt => opt.value).join(" - ");
      const isOutOfStock = v.stockQuantity <= 0;
      
      return `
        <button type="button" 
                class="variation-combo-btn ${idx === 0 ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}"
                data-variation-id="${v.variationId}"
                data-price="${v.price}"
                data-stock="${v.stockQuantity}"
                ${isOutOfStock ? 'disabled' : ''}>
          <span class="combo-name">${optionLabels}</span>
          <span class="combo-price">${Number(v.price).toLocaleString("vi-VN")}₫</span>
          ${isOutOfStock ? '<span class="combo-stock">Hết hàng</span>' : ''}
        </button>
      `;
    }).join("");

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll(".variation-combo-btn:not(.out-of-stock)").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".variation-combo-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.onVariationSelect();
      });
    });
  }

  selectFirstVariation() {
    const container = this.querySelector("#variationCombinations");
    if (!container) return;
    
    const firstBtn = container.querySelector(".variation-combo-btn:not(.out-of-stock)");
    if (firstBtn) {
      firstBtn.classList.add("active");
      this.onVariationSelect();
    }
  }

  onVariationSelect() {
    const container = this.querySelector("#variationCombinations");
    if (!container) return;

    const activeBtn = container.querySelector(".variation-combo-btn.active");
    if (!activeBtn) return;

    const variationId = activeBtn.dataset.variationId;
    const price = parseFloat(activeBtn.dataset.price);
    const stock = parseInt(activeBtn.dataset.stock);

    this.selectedVariation = {
      variationId: variationId,
      price: price,
      stock: stock
    };

    // Update price display
    const priceEl = this.querySelector("#modalPrice");
    if (priceEl) priceEl.textContent = price.toLocaleString("vi-VN") + "₫";

    // Update stock display
    const stockText = this.querySelector("#stockText");
    const stockInfo = this.querySelector("#stockInfo");

    if (stockInfo && stockText) {
      if (stock <= 0) {
        stockInfo.classList.add("out-of-stock");
        stockText.textContent = "Hết hàng";
      } else if (stock < 10) {
        stockInfo.classList.add("low-stock");
        stockText.textContent = `Chỉ còn ${stock} sản phẩm`;
      } else {
        stockInfo.classList.remove("out-of-stock", "low-stock");
        stockText.textContent = "Còn hàng";
      }
    }

    // Update max quantity
    if (this.quantityInput) {
      this.quantityInput.max = stock;
      this.quantityInput.value = 1;
      this.validateQuantity();
    }
  }

  updateQuantity(change) {
    if (!this.quantityInput) return;
    let qty = parseInt(this.quantityInput.value) || 1;
    qty += change;
    this.quantityInput.value = qty;
    this.validateQuantity();
  }

  validateQuantity() {
    if (!this.quantityInput) return;
    let qty = parseInt(this.quantityInput.value) || 1;
    const max = parseInt(this.quantityInput.max) || 999;
    
    if (qty < 1) qty = 1;
    if (qty > max) qty = max;
    
    this.quantityInput.value = qty;
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove("open");
    }
    this.product = null;
    this.selectedVariation = null;
  }

  async add() {
    if (!this.product) return;

    const quantity = parseInt(this.quantityInput?.value) || 1;
    
    if (!this.selectedVariation) {
      alert("Vui lòng chọn phiên bản sản phẩm");
      return;
    }

    // Check if user is logged in
    const accessToken = localStorage.getItem("accesstoken");
    if (!accessToken) {
      // Show notification
      document.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", type: "warning" } 
      }));
      
      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = "logIn.html";
      }, 1500);
      return;
    }

    try {
      await addToCart(this.selectedVariation.variationId, quantity);
      document.dispatchEvent(new Event("cart:update"));
      document.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Đã thêm vào giỏ hàng", type: "success" } 
      }));
      this.close();
    } catch (error) {
      console.error("Add to cart error:", error);
      
      // Show error in toast
      document.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message || "Không thể thêm vào giỏ hàng", type: "error" } 
      }));

      // If token expired, redirect to login after delay
      if (error.message.includes("hết hạn") || error.message.includes("đăng nhập")) {
        setTimeout(() => {
          window.location.href = "logIn.html";
        }, 2000);
      }
    }
  }
}

customElements.define("quick-modal", QuickModal);

