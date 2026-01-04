import { getProductWithVariations } from "../JS/API/productAPI.js";
import { addToCart } from "../JS/API/cartApi.js";
import { getAllAttributes } from "../JS/API/attributeApi.js";

class QuickModal extends HTMLElement {
  constructor() {
    super();
    this.product = null;
    this.variationAttributes = [];
    this.selectedOptions = {};
    this.selectedVariation = null;
    this._initialized = false;
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="modal" id="modal">
        <div class="modal-content">
          <button id="closeModal" class="btn-close-modal" title="Đóng">
            <i class="bx bx-x"></i>
          </button>
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

            <!-- Variations Section - Shows attribute options -->
            <div id="variationsContainer">
              <div class="variation-group">
                <label>Chọn phiên bản:</label>
                <div id="attributeOptions" class="attribute-options"></div>
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

      // Fetch attributes from API
      this.variationAttributes = await getAllAttributes();
      console.log("=== DEBUG ATTRIBUTES ===");
      console.log("Fetched attributes from API:", JSON.stringify(this.variationAttributes, null, 2));
      console.log("Product variations:", JSON.stringify(this.product.variations, null, 2));

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

      // Render attribute options
      this.renderAttributeOptions();

      // Select first available options
      this.selectFirstOptions();

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

  
  getAttributeInfo(option) {
    // Primary: Use API-provided optionTypeId and optionTypeName
    if (option.optionTypeId && option.optionTypeName) {
      return {
        attributeId: option.optionTypeId,
        name: option.optionTypeName
      };
    }
    
    // Fallback: If optionTypeId is missing, try to detect from value
    if (option.value) {
      const detected = this.detectAttributeTypeFromValue(option.value);
      if (detected) {
        return detected;
      }
    }
    
    // Last resort: Use generic name with index-based ID
    return {
      attributeId: 99,
      name: 'Phiên bản'
    };
  }

  /**
   * Helper: Get attribute name from option value (fallback only)
   * Only used when API doesn't provide optionTypeName
   */
  getAttributeName(value, fallbackName = 'Phiên bản') {
    if (!value) return fallbackName;
    
    const v = value.toString().toLowerCase();
    
    // Màu sắc patterns
    const colorPatterns = ['xanh', 'đen', 'trắng', 'vàng', 'đỏ', 'tím', 'hồng', 'cam', 'titan', 'gray', 'silver', 'gold', 'blue', 'black', 'white', 'red', 'purple', 'pink', 'orange', 'natural'];
    if (colorPatterns.some(p => v.includes(p))) {
      return 'Màu sắc';
    }
    
    // Dung lượng patterns (storage)
    const storagePatterns = ['gb', 'tb', '512', '256', '128', '1tb', '2tb', 'storage'];
    if (storagePatterns.some(p => v.includes(p))) {
      return 'Dung lượng';
    }
    
    // RAM patterns
    const ramPatterns = ['ram', '8gb', '16gb', '32gb', '4gb', '6gb', '12gb'];
    if (ramPatterns.some(p => v.includes(p))) {
      return 'RAM';
    }
    
    // Kích thước patterns
    const sizePatterns = ['inch', '"', '6.1', '6.7', '5.4', '6.8', 'pro', 'ultra', 'plus', 'max'];
    if (sizePatterns.some(p => v.includes(p))) {
      return 'Kích thước';
    }
    
    // Chip/Bộ xử lý patterns
    const chipPatterns = ['a15', 'a16', 'a17', 'snapdragon', 'exynos', 'intel', 'm1', 'm2', 'm3', 'chip'];
    if (chipPatterns.some(p => v.includes(p))) {
      return 'Chip';
    }
    
    // Pin patterns
    const batteryPatterns = ['mah', 'pin', 'battery'];
    if (batteryPatterns.some(p => v.includes(p))) {
      return 'Pin';
    }
    
    return fallbackName;
  }

  
  detectAttributeTypeFromValue(value) {
    if (!value) return null;
    
    const name = this.getAttributeName(value);
    
    // Map name to attributeId
    const nameToId = {
      'Màu sắc': 1,
      'Dung lượng': 2,
      'RAM': 3,
      'Kích thước': 4,
      'Chip': 5,
      'Pin': 6
    };
    
    return {
      attributeId: nameToId[name] || 99,
      name: name
    };
  }

  
  renderAttributeOptions() {
    const container = this.querySelector("#attributeOptions");
    const variations = this.product.variations || [];

    if (!container) return;

    if (!variations.length) {
      container.innerHTML = '<p>Không có phân loại</p>';
      return;
    }

    const attributesMap = {};
    (this.variationAttributes || []).forEach(attr => {
      attributesMap[attr.attributeId] = attr.name;
    });

    const optionGroups = {}; 

    variations.forEach((variation) => {
      variation.options.forEach((option) => {
        
        const attrInfo = this.getAttributeInfo(option);

        const attrId = attrInfo.attributeId;

        let attrName = attrInfo.name;
        if ((attrName === 'Phiên bản' || attrName === 'Thuộc tính') && attributesMap[attrId]) {
          attrName = attributesMap[attrId];
        }

        if (!optionGroups[attrId]) {
          optionGroups[attrId] = {
            name: attrName,
            attributeId: attrId,
            options: []
          };
        }

        // Check if option value already exists (deduplication)
        const existing = optionGroups[attrId].options.find(
          (o) => o.value === option.value
        );

        if (!existing) {
          optionGroups[attrId].options.push({
            ...option,
            variationId: variation.variationId,
            price: variation.price,
            stock: variation.stockQuantity,
          });
        }
      });
    });

    // Convert to array and sort by attributeId
    const sortedGroups = Object.values(optionGroups).sort((a, b) => {
      return (a.attributeId || 0) - (b.attributeId || 0);
    });

    // Build HTML for each option group
    let html = "";

    sortedGroups.forEach(group => {
      html += `
        <div class="variation-group">
          <label>${group.name}:</label>
          <div class="variation-options" data-attribute="${group.name}">
            ${group.options
              .map((opt) => {
                const isSelected = this.selectedOptions[group.name] === opt.value;
                const isOutOfStock = opt.stock <= 0;
                return `
                  <button
                    class="variation-option ${isSelected ? "selected" : ""} ${
                      isOutOfStock ? "disabled" : ""
                    }"
                    data-attribute="${group.name}"
                    data-value="${opt.value}"
                    data-option-id="${opt.optionId}"
                    ${isOutOfStock ? "disabled" : ""}
                  >
                    ${opt.value}
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll(".variation-option:not(.disabled)").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleAttributeSelect(btn);
      });
    });
  }

  
  handleAttributeSelect(btn) {
    const attribute = btn.dataset.attribute;
    const value = btn.dataset.value;

    // Update selected options
    this.selectedOptions[attribute] = value;

    // Update UI
    const container = this.querySelector("#attributeOptions");
    container.querySelectorAll(`.variation-option[data-attribute="${attribute}"]`).forEach((b) => {
      b.classList.remove("selected");
    });
    btn.classList.add("selected");

    // Find matching variation
    this.findMatchingVariation();
  }

  
  selectFirstOptions() {
    const variations = this.product.variations;
    if (!variations || variations.length === 0) return;

    const firstVariation = variations[0];

    // Set selected options from first variation
    this.selectedOptions = {};
    firstVariation.options.forEach((opt, index) => {
      
      const attrName = this.getAttributeName(opt.value, `Thuộc tính ${index + 1}`);
      this.selectedOptions[attrName] = opt.value;
    });

    // Update UI to reflect selection
    this.updateSelectedOptionsUI();

    // Set initial variation
    this.selectedVariation = {
      variationId: firstVariation.variationId,
      price: firstVariation.price,
      stock: firstVariation.stockQuantity,
    };

    // Update display
    this.onVariationSelect();
  }

  
  updateSelectedOptionsUI() {
    const container = this.querySelector("#attributeOptions");
    if (!container) return;

    Object.entries(this.selectedOptions).forEach(([attrName, value]) => {
      const btn = container.querySelector(
        `.variation-option[data-attribute="${attrName}"][data-value="${value}"]`
      );
      if (btn) {
        container.querySelectorAll(`.variation-option[data-attribute="${attrName}"]`).forEach((b) => {
          b.classList.remove("selected");
        });
        btn.classList.add("selected");
      }
    });
  }

  
  findMatchingVariation() {
    const variations = this.product.variations;

    // Find variation that matches all selected options
    const match = variations.find((variation) => {
      return variation.options.every((opt, index) => {
        
        const attrName = this.getAttributeName(opt.value, `Thuộc tính ${index + 1}`);
        return this.selectedOptions[attrName] === opt.value;
      });
    });

    if (match) {
      this.selectedVariation = {
        variationId: match.variationId,
        price: match.price,
        stock: match.stockQuantity,
      };
    } else {
      this.selectedVariation = null;
    }

    this.onVariationSelect();
  }

  onVariationSelect() {
    if (!this.selectedVariation) {
      const priceEl = this.querySelector("#modalPrice");
      if (priceEl) priceEl.textContent = "Liên hệ";

      const stockText = this.querySelector("#stockText");
      const stockInfo = this.querySelector("#stockInfo");
      if (stockInfo && stockText) {
        stockInfo.classList.remove("out-of-stock", "low-stock");
        stockText.textContent = "Liên hệ";
      }

      if (this.quantityInput) {
        this.quantityInput.max = 999;
        this.quantityInput.value = 1;
      }
      return;
    }

    const { price, stock } = this.selectedVariation;

    // Update price display
    const priceEl = this.querySelector("#modalPrice");
    if (priceEl) priceEl.textContent = price.toLocaleString("vi-VN") + "₫";

    // Update stock display
    const stockText = this.querySelector("#stockText");
    const stockInfo = this.querySelector("#stockInfo");

    if (stockInfo && stockText) {
      if (stock <= 0) {
        stockInfo.classList.add("out-of-stock");
        stockInfo.classList.remove("low-stock");
        stockText.textContent = "Hết hàng";
      } else if (stock < 10) {
        stockInfo.classList.add("low-stock");
        stockInfo.classList.remove("out-of-stock");
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
    this.variationAttributes = [];
    this.selectedOptions = {};
    this.selectedVariation = null;
  }

  async add() {
  if (!this.product) return;

  const quantity = parseInt(this.quantityInput?.value) || 1;

  if (!this.selectedVariation) {
    document.dispatchEvent(new CustomEvent("toast:show", {
      detail: { message: "Vui lòng chọn phiên bản sản phẩm", type: "warning" }
    }));
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

    // 🔥 CHUẨN: backend trả 401 thì redirect login
    if (error.message?.includes("401") ||
        error.message?.includes("đăng nhập") ||
        error.message?.includes("Unauthorized")) {

      document.dispatchEvent(new CustomEvent("toast:show", {
        detail: { message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", type: "warning" }
      }));

      setTimeout(() => {
        window.location.href = "login.html?mode=login";
      }, 1500);
      return;
    }

    document.dispatchEvent(new CustomEvent("toast:show", {
      detail: { message: error.message || "Không thể thêm vào giỏ hàng", type: "error" }
    }));
  }
}

}

customElements.define("quick-modal", QuickModal);

