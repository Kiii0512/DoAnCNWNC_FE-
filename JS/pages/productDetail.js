/**
 * Product Detail Page Controller
 * Handles displaying product details, variations, and buy actions
 * Updated to use QuickModal-style consistent attribute selection
 */

import { getProductWithVariations } from "../API/productAPI.js";
import { addToCart } from "../API/cartApi.js";
import { getAllAttributes } from "../API/attributeApi.js";

// DOM Elements
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const contentEl = document.getElementById("product-content");
const tabsEl = document.getElementById("product-tabs");

// Product state
let currentProduct = null;
let selectedVariation = null;
let selectedOptions = {};
let quantity = 1;
let variationAttributes = []; // Store attributes from API for proper ordering

/**
 * Helper: Get attribute info from optionTypeId and optionTypeName
 * Uses the API-provided optionTypeId and optionTypeName directly
 * Falls back to pattern matching only if API data is missing
 */
function getAttributeInfo(option) {
  // Primary: Use API-provided optionTypeId and optionTypeName
  if (option.optionTypeId && option.optionTypeName) {
    return {
      attributeId: option.optionTypeId,
      name: option.optionTypeName
    };
  }
  
  // Fallback: If optionTypeId is missing, try to detect from value
  if (option.value) {
    const detected = detectAttributeTypeFromValue(option.value);
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
 * Helper: Get attribute name from option value
 * Uses consistent logic across renderVariations, selectFirstVariation, and findMatchingVariation
 * Similar to QuickModal.js implementation
 */
function getAttributeName(value, fallbackName = 'Phiên bản') {
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

/**
 * Helper: Detect attribute type from option value (returns both id and name)
 * Since API doesn't return optionTypeName, we infer from the value
 */
function detectAttributeTypeFromValue(value) {
  if (!value) return null;
  
  const name = getAttributeName(value);
  
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

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    showError();
    return;
  }

  // Load product data
  await loadProduct(productId);

  // Setup event listeners
  setupEventListeners();
});

/**
 * Load product from API
 */
async function loadProduct(productId) {
  try {
    showLoading(true);

    const product = await getProductWithVariations(productId);

    if (!product) {
      showError();
      return;
    }

    // Fetch attributes from API for proper sorting
    try {
      variationAttributes = await getAllAttributes();
      console.log("=== DEBUG ATTRIBUTES ===");
      console.log("Fetched attributes from API:", JSON.stringify(variationAttributes, null, 2));
      console.log("Product variations:", JSON.stringify(product.variations, null, 2));
    } catch (attrError) {
      console.warn("Failed to fetch attributes, using default sorting:", attrError);
      variationAttributes = [];
    }

    // Use specifications directly from product response
    currentProduct = product;
    renderProduct(product);
    showContent();

  } catch (error) {
    console.error("Error loading product:", error);
    showError();
  } finally {
    showLoading(false);
  }
}

/**
 * Render product details
 */
function renderProduct(product) {
  // Update breadcrumb
  updateBreadcrumb(product);

  // Update images
  renderImages(product.images);

  // Update basic info
  document.getElementById("product-title").textContent = product.title;
  document.getElementById("product-category").textContent = product.category || "";
  document.getElementById("product-brand").textContent = product.brand ? `Thương hiệu: ${product.brand}` : "";
  document.getElementById("product-description").textContent =
    product.description || "Chưa có mô tả cho sản phẩm này.";

  // Update description content
  const descContent = document.getElementById("description-content");
  if (descContent) {
    descContent.innerHTML = `<p>${product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>`;
  }

  // Render specifications
  renderSpecifications(product.specifications || []);

  // Render variations
  renderVariations(product.variations);

  // Select first variation by default
  selectFirstVariation();

  // Update stock display
  updateStockDisplay();
  
  // Update price display for initial variation
  updatePriceDisplay();
}

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb(product) {
  const categoryLink = document.getElementById("breadcrumb-category");
  const productSpan = document.getElementById("breadcrumb-product");

  if (product.category) {
    categoryLink.textContent = product.category;
    categoryLink.onclick = (e) => {
      e.preventDefault();
      localStorage.setItem("categoryName", product.category);
      if (product.categoryId) {
        localStorage.setItem("categoryId", product.categoryId);
      }
      window.location.href = "../categoryPage.html";
    };
  }

  productSpan.textContent = product.title;
}

/**
 * Render product images
 */
function renderImages(images) {
  const mainImage = document.getElementById("main-image");
  const thumbnailList = document.getElementById("thumbnail-list");

  if (!images || images.length === 0) {
    mainImage.src = "/assets/images/no-image.jpg";
    thumbnailList.innerHTML = "";
    return;
  }

  const mainImgData = images.find((img) => img.isMain) || images[0];
  mainImage.src = mainImgData.imageUrl;
  mainImage.alt = currentProduct.title;

  // Render thumbnails
  thumbnailList.innerHTML = images
    .map(
      (img, index) => `
    <div class="thumbnail-item ${index === 0 ? "active" : ""}" data-src="${img.imageUrl}">
      <img src="${img.imageUrl}" alt="Thumbnail ${index + 1}" />
    </div>
  `
    )
    .join("");

  // Add click handlers for thumbnails
  thumbnailList.querySelectorAll(".thumbnail-item").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbnailList.querySelectorAll(".thumbnail-item").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.dataset.src;
    });
  });
}

/**
 * Render specifications table
 */
function renderSpecifications(specs) {
  const specsTable = document.getElementById("specs-table");

  if (!specs || specs.length === 0) {
    specsTable.innerHTML = "<tr><td>Chưa có thông số kỹ thuật</td></tr>";
    return;
  }

  specsTable.innerHTML = specs
    .map(
      (spec) => `
    <tr>
      <th>${spec.specKey}</th>
      <td>${spec.specValue}</td>
    </tr>
  `
    )
    .join("");
}

/**
 * Render variation options
 * Uses optionTypeId and optionTypeName from API for grouping
 * Falls back to pattern matching if API data is missing
 * Uses getAllAttributes() for sorting by attributeId
 */
function renderVariations(variations) {
  const container = document.getElementById("variations-section");

  if (!variations || variations.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Get attribute list from API for sorting purposes
  const attributesMap = {};
  (variationAttributes || []).forEach(attr => {
    attributesMap[attr.attributeId] = attr.name;
  });

  // Build option groups keyed by attributeId
  const optionGroups = {}; // { attributeId: { name, options: [] } }

  variations.forEach((variation) => {
    variation.options.forEach((option) => {
      // Get attribute info from API-provided optionTypeId and optionTypeName
      // Falls back to pattern matching if not available
      const attrInfo = getAttributeInfo(option);

      const attrId = attrInfo.attributeId;

      // If attribute name from API is generic fallback, try to get better name from attributes API
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
              const isSelected = selectedOptions[group.name] === opt.value;
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
      const attribute = btn.dataset.attribute;
      const value = btn.dataset.value;

      // Update selected options
      selectedOptions[attribute] = value;

      // Update UI
      container.querySelectorAll(`.variation-option[data-attribute="${attribute}"]`).forEach((b) => {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");

      // Find matching variation
      findMatchingVariation();
    });
  });
}

/**
 * Select first available variation
 * Uses getAttributeInfo for consistent attribute name detection
 */
function selectFirstVariation() {
  const variations = currentProduct.variations;
  if (!variations || variations.length === 0) return;

  const firstVariation = variations[0];

  // Set selected options from first variation
  // Use getAttributeInfo for consistent attribute name detection
  selectedOptions = {};
  firstVariation.options.forEach((opt) => {
    const attrInfo = getAttributeInfo(opt);
    const attrName = attrInfo.name;
    selectedOptions[attrName] = opt.value;
  });

  selectedVariation = {
    variationId: firstVariation.variationId,
    price: firstVariation.price,
    stock: firstVariation.stockQuantity,
  };

  // Update price display
  updatePriceDisplay();
}

/**
 * Find matching variation based on selected options
 * Uses getAttributeInfo for consistent attribute name detection
 */
function findMatchingVariation() {
  const variations = currentProduct.variations;

  // Find variation that matches all selected options
  // Use getAttributeInfo for consistent attribute name detection
  const match = variations.find((variation) => {
    return variation.options.every((opt) => {
      const attrInfo = getAttributeInfo(opt);
      const attrName = attrInfo.name;
      return selectedOptions[attrName] === opt.value;
    });
  });

  if (match) {
    selectedVariation = {
      variationId: match.variationId,
      price: match.price,
      stock: match.stockQuantity,
    };
  } else {
    selectedVariation = null;
  }

  updatePriceDisplay();
  updateStockDisplay();
}

/**
 * Update price display
 */
function updatePriceDisplay() {
  const currentPriceEl = document.getElementById("current-price");

  if (!selectedVariation) {
    currentPriceEl.textContent = "Liên hệ";
    return;
  }

  const price = selectedVariation.price;
  currentPriceEl.textContent = price.toLocaleString("vi-VN") + "₫";
}

/**
 * Update stock display
 */
function updateStockDisplay() {
  const stockEl = document.getElementById("product-stock");
  const stockWarning = document.getElementById("stock-warning");
  const qtyInput = document.getElementById("qty-input");

  if (!selectedVariation) {
    stockEl.textContent = "Liên hệ";
    stockEl.className = "product-stock";
    return;
  }

  const stock = selectedVariation.stock;

  if (stock <= 0) {
    stockEl.textContent = "Hết hàng";
    stockEl.className = "product-stock out-of-stock";
    stockWarning.textContent = "Sản phẩm đã hết hàng";
    qtyInput.max = 0;
    document.getElementById("btn-buy-now").disabled = true;
  } else if (stock < 10) {
    stockEl.textContent = `Còn ${stock} sản phẩm`;
    stockEl.className = "product-stock low-stock";
    stockWarning.textContent = `Chỉ còn ${stock} sản phẩm`;
    qtyInput.max = stock;
    qtyInput.value = 1;
    document.getElementById("btn-buy-now").disabled = false;
  } else {
    stockEl.textContent = "Còn hàng";
    stockEl.className = "product-stock in-stock";
    stockWarning.textContent = "";
    qtyInput.max = 999;
    qtyInput.value = 1;
    document.getElementById("btn-buy-now").disabled = false;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Quantity controls
  document.getElementById("qty-minus")?.addEventListener("click", () => updateQuantity(-1));
  document.getElementById("qty-plus")?.addEventListener("click", () => updateQuantity(1));
  document.getElementById("qty-input")?.addEventListener("change", validateQuantity);

  // Add to cart button
  document.getElementById("btn-add-cart")?.addEventListener("click", handleAddToCart);

  // Buy now button
  document.getElementById("btn-buy-now")?.addEventListener("click", handleBuyNow);

  // Tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

/**
 * Update quantity
 */
function updateQuantity(change) {
  const input = document.getElementById("qty-input");
  if (!input) return;

  let qty = parseInt(input.value) || 1;
  qty += change;

  input.value = qty;
  validateQuantity();
}

/**
 * Validate quantity
 */
function validateQuantity() {
  const input = document.getElementById("qty-input");
  if (!input) return;

  let qty = parseInt(input.value) || 1;
  const max = parseInt(input.max) || 999;

  if (qty < 1) qty = 1;
  if (qty > max) qty = max;

  input.value = qty;
  quantity = qty;
}

/**
 * Handle add to cart
 */
async function handleAddToCart() {
  if (!validateSelection()) return;

  try {
    /* Check if user is logged in (using sessionStorage with HTTPS-only cookies)
    const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "warning");
      setTimeout(() => {
        window.location.href = "../logIn.html";
      }, 1500);
      return;
    }
  */
    await addToCart(selectedVariation.variationId, quantity);

    // Show success toast
    showToast("Đã thêm vào giỏ hàng", "success");

  } catch (error) {
    console.error("Add to cart error:", error);
    showToast(error.message || "Không thể thêm vào giỏ hàng", "error");

    if (error.message.includes("Unauthorized") || error.message.includes("đăng nhập")) {
      setTimeout(() => {
        window.location.href = "../logIn.html";
      }, 2000);
    }
  }
}

/**
 * Handle buy now
 */
function handleBuyNow() {
  if (!validateSelection()) return;

  // Check if user is logged in (using sessionStorage with HTTPS-only cookies)
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated) {
    showToast("Vui lòng đăng nhập để đặt hàng", "warning");
    setTimeout(() => {
      window.location.href = "../logIn.html";
    }, 1500);
    return;
  }

  // Redirect to cart page with buy now action
  sessionStorage.setItem("buyNow", JSON.stringify({
    variationId: selectedVariation.variationId,
    quantity: quantity,
    product: {
      id: currentProduct.id,
      title: currentProduct.title,
      price: selectedVariation.price,
      img: currentProduct.img,
      options: selectedOptions,
    },
  }));

  window.location.href = "../cartPage.html?buyNow=true";
}

/**
 * Validate product selection
 */
function validateSelection() {
  if (!currentProduct) {
    showToast("Đang tải sản phẩm...", "warning");
    return false;
  }

  if (!selectedVariation) {
    showToast("Vui lòng chọn phiên bản sản phẩm", "warning");
    return false;
  }

  if (selectedVariation.stock <= 0) {
    showToast("Sản phẩm đã hết hàng", "warning");
    return false;
  }

  return true;
}

/**
 * Switch tabs
 */
function switchTab(tabId) {
  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Update tab panels
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${tabId}-panel`);
  });
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  document.dispatchEvent(
    new CustomEvent("toast:show", {
      detail: { message, type },
    })
  );
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  loadingEl?.classList.toggle("hidden", !show);
}

/**
 * Show error state
 */
function showError() {
  loadingEl?.classList.add("hidden");
  errorEl?.classList.remove("hidden");
  contentEl?.classList.add("hidden");
  tabsEl?.classList.add("hidden");
}

/**
 * Show content
 */
function showContent() {
  loadingEl?.classList.add("hidden");
  errorEl?.classList.add("hidden");
  contentEl?.classList.remove("hidden");
  tabsEl?.classList.remove("hidden");
}

