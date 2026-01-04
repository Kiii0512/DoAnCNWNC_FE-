
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../API/cartApi.js";
import { getProductWithVariations } from "../API/productApi.js";


function isLoggedIn() {
  return !!localStorage.getItem("username");
}
// DOM Elements
const cartItemsList = document.getElementById("cartItemsList");
const emptyCart = document.getElementById("emptyCart");
const continueShopping = document.getElementById("continueShopping");
const cartSummary = document.getElementById("cartSummary");
const cartItemCount = document.getElementById("cartItemCount");
const cartActionsBar = document.getElementById("cartActionsBar");
const selectAllCheckbox = document.getElementById("selectAllCheckbox");
const selectedCount = document.getElementById("selectedCount");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutSelectedBtn = document.getElementById("checkoutSelectedBtn");
const checkoutSelectedCount = document.getElementById("checkoutSelectedCount");
const selectedSummary = document.getElementById("selectedSummary");
const selectedItemCount = document.getElementById("selectedItemCount");
const toast = document.getElementById("toast");
const removeModal = document.getElementById("removeModal");

// State
let cart = null;
let pendingRemoveItemId = null;
let pendingRemoveVariationId = null;
let selectedItems = new Set();
let discount = 0;
let appliedPromoCode = null;

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await loadCart();
  initEventListeners();
});

// Load cart
async function loadCart() {
  if (!isLoggedIn()) {
    showEmptyCart();
    return;
  }

  try {
    const res = await getCart();
    cart = res;

    if (!cart?.items?.length) {
      showEmptyCart();
      return;
    }

    for (const item of cart.items) {
      const product = await getProductWithVariations(item.productId);

      const variation = product.variations.find(
        v => v.variationId === item.variationId
      );

      item._product = product;
      item._variation = variation;
    }

    selectedItems = new Set(cart.items.map(i => i.cartItemId));
    renderCart();
  } catch (e) {
    console.error(e);
    showEmptyCart();
  }
}

function initEventListeners() {
  selectAllCheckbox.addEventListener("change", () => {
    if (selectAllCheckbox.checked) {
      if (cart && cart.items) {
        cart.items.forEach((item) => selectedItems.add(item.cartItemId));
      }
    } else {
      selectedItems.clear();
    }
    renderCart();
  });

  deleteSelectedBtn.addEventListener("click", async () => {
    if (!isLoggedIn()) {
      showToast("Vui lòng đăng nhập để thực hiện thao tác này", "warning");
      setTimeout(() => {
        window.location.href = "logIn.html";
      }, 1500);
      return;
    }

    if (selectedItems.size === 0) {
      showToast("Vui lòng chọn sản phẩm để xóa", "info");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa ${selectedItems.size} sản phẩm đã chọn?`)) {
      return;
    }

    try {
      for (const item of cart.items) {
        if (selectedItems.has(item.cartItemId)) {
          const variationId = item.variation?.variationId || item.variationId;
          if (variationId) {
            await removeFromCart(variationId);
          }
        }
      }

      cart.items = cart.items.filter((item) => !selectedItems.has(item.cartItemId));
      selectedItems.clear();

      showToast("Đã xóa sản phẩm đã chọn", "success");
      renderCart();
    } catch (error) {
      showToast(error.message || "Xóa sản phẩm thất bại", "error");
    }
  });

  checkoutBtn.addEventListener("click", () => {
    handleCheckout(Array.from(cart.items));
  });

  checkoutSelectedBtn.addEventListener("click", () => {
    const selectedCartItems = cart.items.filter((item) => selectedItems.has(item.cartItemId));
    handleCheckout(selectedCartItems);
  });

  document.getElementById("applyPromoBtn").addEventListener("click", applyPromoCode);
  document.getElementById("promoCode").addEventListener("keyup", (e) => {
    if (e.key === "Enter") applyPromoCode();
  });

  document.getElementById("cancelRemove").addEventListener("click", closeRemoveModal);
  document.getElementById("confirmRemove").addEventListener("click", confirmRemoveItem);
}
function renderCartItem(item) {
  const product = item._product;
  const variation = item._variation;

  const image =
    product?.images?.[0]?.imageUrl ||
    product?.img ||
    "assets/images/no-image.jpg";

  const productName = product?.title || "Sản phẩm";
  const variantName = variation?.options
    ?.map(o => o.value)
    .join(" - ") || "Mặc định";

  const unitPrice = item.price; 
  const total = unitPrice * item.quantity;

  const isSelected = selectedItems.has(item.cartItemId);

  return `
    <div class="cart-item ${isSelected ? "selected" : ""}" data-item-id="${item.cartItemId}">
      <div class="cart-item-checkbox">
        <input type="checkbox" ${isSelected ? "checked" : ""} data-item-id="${item.cartItemId}" />
      </div>

      <img src="${image}" class="cart-item-image"/>

      <div class="cart-item-details">
        <div class="cart-item-name">${productName}</div>
        <div class="cart-item-variant">${variantName}</div>
        <div class="cart-item-price">${formatCurrency(unitPrice)}</div>

        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="quantity-btn minus"
              data-variation-id="${item.variationId}"
              ${item.quantity <= 1 ? "disabled" : ""}>-</button>

            <span>${item.quantity}</span>

            <button class="quantity-btn plus"
              data-variation-id="${item.variationId}">+</button>
          </div>

          <button class="remove-btn"
            data-item-id="${item.cartItemId}"
            data-variation-id="${item.variationId}">
            Xóa
          </button>

          <div class="item-total">${formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderCart() {
  if (!cart || !cart.items || cart.items.length === 0) {
    showEmptyCart();
    return;
  }

  showCartItems();
  updateCartSummary();
}

function updateCartSummary() {
  if (!cart || !cart.items || cart.items.length === 0) return;

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = cart.items.reduce((sum, item) => {
    const price = item.variation?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (document.getElementById("summaryItemCount")) {
    document.getElementById("summaryItemCount").textContent = totalItems;
  }
  if (document.getElementById("summarySubTotal")) {
    document.getElementById("summarySubTotal").textContent = formatCurrency(subTotal);
  }
  
  const discountRow = document.getElementById("discountRow");
  const summaryDiscount = document.getElementById("summaryDiscount");
  if (discountRow && summaryDiscount) {
    if (discount > 0) {
      discountRow.style.display = "flex";
      summaryDiscount.textContent = `-${formatCurrency(discount)}`;
    } else {
      discountRow.style.display = "none";
    }
  }
  
  const total = subTotal - discount;
  const summaryTotal = document.getElementById("summaryTotal");
  if (summaryTotal) {
    summaryTotal.textContent = formatCurrency(total);
  }
}

function showEmptyCart() {
  cartItemsList.style.display = "none";
  emptyCart.style.display = "flex";
  continueShopping.style.display = "none";
  cartSummary.style.display = "none";
  cartActionsBar.style.display = "none";
  cartItemCount.textContent = "0 sản phẩm";
}

function showCartItems() {
  cartItemsList.style.display = "flex";
  emptyCart.style.display = "none";
  continueShopping.style.display = "block";
  cartSummary.style.display = "block";
  cartActionsBar.style.display = "flex";

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cartItemCount.textContent = `${totalItems} sản phẩm`;

  cartItemsList.innerHTML = cart.items
    .map((item) => renderCartItem(item))
    .join("");

  cartItemsList.querySelectorAll(".quantity-btn.minus").forEach((btn) => {
    btn.addEventListener("click", () => updateQuantity(btn.dataset.variationId, -1));
  });

  cartItemsList.querySelectorAll(".quantity-btn.plus").forEach((btn) => {
    btn.addEventListener("click", () => updateQuantity(btn.dataset.variationId, 1));
  });

  cartItemsList.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => openRemoveModal(btn.dataset.itemId, btn.dataset.variationId));
  });

  cartItemsList.querySelectorAll(".cart-item-checkbox input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const itemId = checkbox.dataset.itemId;
      if (checkbox.checked) {
        selectedItems.add(itemId);
        checkbox.closest(".cart-item").classList.add("selected");
      } else {
        selectedItems.delete(itemId);
        checkbox.closest(".cart-item").classList.remove("selected");
      }
      updateSelectionUI();
    });
  });

  cartItemsList.querySelectorAll(".cart-item").forEach((item) => {
    const itemId = item.dataset.itemId;
    const checkbox = item.querySelector(".cart-item-checkbox input");
    if (selectedItems.has(itemId)) {
      checkbox.checked = true;
      item.classList.add("selected");
    } else {
      checkbox.checked = false;
      item.classList.remove("selected");
    }
  });

  updateSelectionUI();
}

function updateSelectionUI() {
  const totalItems = cart?.items?.length || 0;
  const selectedCountValue = selectedItems.size;

  selectAllCheckbox.checked = selectedCountValue === totalItems && totalItems > 0;
  selectAllCheckbox.indeterminate = selectedCountValue > 0 && selectedCountValue < totalItems;

  selectedCount.textContent = selectedCountValue;
  selectedItemCount.textContent = selectedCountValue;
  checkoutSelectedCount.textContent = selectedCountValue;

  if (selectedCountValue > 0) {
    selectedSummary.style.display = "block";
    checkoutSelectedBtn.style.display = "flex";
    checkoutBtn.style.display = "none";
  } else {
    selectedSummary.style.display = "none";
    checkoutSelectedBtn.style.display = "none";
    checkoutBtn.style.display = "flex";
  }

  checkoutBtn.disabled = totalItems === 0;
  checkoutSelectedBtn.disabled = selectedCountValue === 0;

  updateSelectedSummary();
}

function updateSelectedSummary() {
  const selectedCartItems = cart.items.filter((item) => selectedItems.has(item.cartItemId));
  const selectedTotalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = selectedCartItems.reduce((sum, item) => {
    const price = item.variation?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  document.getElementById("summaryItemCount").textContent = selectedTotalItems;
  document.getElementById("summarySubTotal").textContent = formatCurrency(subTotal);

  if (discount > 0) {
    document.getElementById("discountRow").style.display = "flex";
    document.getElementById("summaryDiscount").textContent = `-${formatCurrency(discount)}`;
  } else {
    document.getElementById("discountRow").style.display = "none";
  }

  const total = subTotal - discount;
  document.getElementById("summaryTotal").textContent = formatCurrency(total);
}



async function updateQuantity(variationId, change) {
  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để thực hiện thao tác này", "warning");
    setTimeout(() => {
      window.location.href = "logIn.html";
    }, 1500);
    return;
  }

  const item = cart.items.find((i) => i.variation?.variationId === variationId || i.variationId === variationId);
  if (!item) return;

  const newQuantity = item.quantity + change;
  if (newQuantity < 1) return;

  try {
    await updateCartItem(variationId, newQuantity);
    item.quantity = newQuantity;
    renderCart();
  } catch (error) {
    showToast(error.message || "Cập nhật số lượng thất bại", "error");
  }
}

function openRemoveModal(itemId, variationId) {
  pendingRemoveItemId = itemId;
  pendingRemoveVariationId = variationId;
  removeModal.style.display = "flex";
}

function closeRemoveModal() {
  pendingRemoveItemId = null;
  pendingRemoveVariationId = null;
  removeModal.style.display = "none";
}

async function confirmRemoveItem() {
  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để thực hiện thao tác này", "warning");
    setTimeout(() => {
      window.location.href = "logIn.html";
    }, 1500);
    closeRemoveModal();
    return;
  }

  if (!pendingRemoveVariationId) {
    showToast("Lỗi: Không tìm thấy sản phẩm để xóa", "error");
    closeRemoveModal();
    return;
  }

  try {
    await removeFromCart(pendingRemoveVariationId);

    cart.items = cart.items.filter((i) => i.cartItemId !== pendingRemoveItemId);
    selectedItems.delete(pendingRemoveItemId);

    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    renderCart();
  } catch (error) {
    console.error("Remove error:", error);
    if (error.message?.includes("hết hạn") || error.message?.includes("đăng nhập") || error.message?.includes("401")) {
      showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại", "warning");
      setTimeout(() => {
        window.location.href = "logIn.html";
      }, 1500);
    } else {
      showToast(error.message || "Xóa sản phẩm thất bại", "error");
    }
  } finally {
    closeRemoveModal();
  }
}

function handleCheckout(selectedCartItems) {
  if (selectedCartItems.length === 0) {
    showToast("Vui lòng chọn sản phẩm để thanh toán", "info");
    return;
  }

  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để thanh toán", "warning");
    setTimeout(() => {
      window.location.href = "logIn.html";
    }, 1500);
    return;
  }

  const subTotal = selectedCartItems.reduce((sum, item) => {
    const price = item.variation?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const checkoutData = {
    items: selectedCartItems,
    subTotal: subTotal,
    discount: discount,
    appliedPromoCode: appliedPromoCode,
    total: subTotal - discount
  };
  
  localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
  
  window.location.href = "paymentPage.html";
}

// Helper functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Export functions for use in other modules
export function updateCartCount() {
  const els = document.querySelectorAll("#cartCount");

  if (!isLoggedIn() || !cart?.items) {
    els.forEach(el => el.textContent = "0");
    return;
  }

  const total = cart.items.reduce((s, i) => s + i.quantity, 0);
  els.forEach(el => el.textContent = total);
}

// Update cart count on page load
updateCartCount();

