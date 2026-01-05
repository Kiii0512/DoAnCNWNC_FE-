import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../API/cartApi.js";
import { getProductWithVariations } from "../API/productApi.js";

/* ======================
   AUTH
====================== */
function isLoggedIn() {
  return !!localStorage.getItem("username");
}

/* ======================
   DOM SAFE QUERY
====================== */
const $ = (id) => document.getElementById(id);

/* ======================
   DOM ELEMENTS
====================== */
const cartItemsList = $("cartItemsList");
const emptyCart = $("emptyCart");
const continueShopping = $("continueShopping");
const cartSummary = $("cartSummary");
const cartItemCount = $("cartItemCount");
const cartActionsBar = $("cartActionsBar");

const selectAllCheckbox = $("selectAllCheckbox");
const selectedCount = $("selectedCount");
const deleteSelectedBtn = $("deleteSelectedBtn");

const checkoutBtn = $("checkoutBtn");
const checkoutSelectedBtn = $("checkoutSelectedBtn");
const checkoutSelectedCount = $("checkoutSelectedCount");

const selectedSummary = $("selectedSummary");
const selectedItemCount = $("selectedItemCount");

const toast = $("toast");
const removeModal = $("removeModal");
const cancelRemoveBtn = $("cancelRemove");
const confirmRemoveBtn = $("confirmRemove");

/* ======================
   STATE
====================== */
let cart = null;
let pendingRemoveItemId = null;
let pendingRemoveVariationId = null;
let selectedItems = new Set();

/* ======================
   INIT
====================== */
document.addEventListener("DOMContentLoaded", async () => {
  await loadCart();
  initEventListeners();
});

/* ======================
   LOAD CART
====================== */
async function loadCart() {
  if (!isLoggedIn()) {
    showEmptyCart();
    return;
  }

  try {
    cart = await getCart();

    if (!cart?.items?.length) {
      showEmptyCart();
      return;
    }

    for (const item of cart.items) {
      const product = await getProductWithVariations(item.productId);
      const variation = product?.variations?.find(
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

/* ======================
   EVENTS (NULL SAFE)
====================== */
function initEventListeners() {
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      if (selectAllCheckbox.checked) {
        cart?.items?.forEach(i => selectedItems.add(i.cartItemId));
      } else {
        selectedItems.clear();
      }
      renderCart();
    });
  }

  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", deleteSelectedItems);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      handleCheckout(cart?.items || []);
    });
  }

  if (checkoutSelectedBtn) {
    checkoutSelectedBtn.addEventListener("click", () => {
      const items = cart.items.filter(i => selectedItems.has(i.cartItemId));
      handleCheckout(items);
    });
  }

  if (cancelRemoveBtn) {
    cancelRemoveBtn.addEventListener("click", closeRemoveModal);
  }

  if (confirmRemoveBtn) {
    confirmRemoveBtn.addEventListener("click", confirmRemoveItem);
  }
}

/* ======================
   DELETE SELECTED
====================== */
async function deleteSelectedItems() {
  if (!isLoggedIn()) {
    redirectLogin();
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
        await removeFromCart(item.variationId);
      }
    }

    cart.items = cart.items.filter(i => !selectedItems.has(i.cartItemId));
    selectedItems.clear();

    showToast("Đã xóa sản phẩm đã chọn", "success");
    renderCart();
  } catch (e) {
    showToast(e.message || "Xóa sản phẩm thất bại", "error");
  }
}

/* ======================
   RENDER
====================== */
function renderCart() {
  if (!cart?.items?.length) {
    showEmptyCart();
    return;
  }

  showCartItems();
  updateSelectionUI();
}

function renderCartItem(item) {
  const product = item._product;
  const variation = item._variation;

  const image =
    product?.images?.[0]?.imageUrl ||
    "assets/images/no-image.jpg";

  const variantName = variation?.options?.map(o => o.value).join(" - ") || "Mặc định";
  const total = item.price * item.quantity;
  const isSelected = selectedItems.has(item.cartItemId);

  return `
    <div class="cart-item ${isSelected ? "selected" : ""}" data-id="${item.cartItemId}">
      <input type="checkbox" ${isSelected ? "checked" : ""} data-id="${item.cartItemId}">
      <img src="${image}" alt="${product?.title || 'Sản phẩm'}">
      <div class="cart-item-info">
        <div class="cart-item-title">${product?.title || "Sản phẩm"}</div>
        <div class="cart-item-variant">${variantName}</div>
        <div class="cart-item-price">${formatCurrency(item.price)}</div>
      </div>
      <div class="cart-item-quantity">
        <div class="quantity-wrapper">
          <button class="quantity-btn quantity-decrease" data-vid="${item.variationId}" ${item.quantity <= 1 ? "disabled" : ""}>
            <i class="bx bx-minus"></i>
          </button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn quantity-increase" data-vid="${item.variationId}">
            <i class="bx bx-plus"></i>
          </button>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-total">${formatCurrency(total)}</div>
          <button class="cart-item-remove" data-id="${item.cartItemId}" data-vid="${item.variationId}">
            <i class="bx bx-trash"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  `;
}

function showCartItems() {
  cartItemsList.style.display = "flex";
  emptyCart.style.display = "none";
  continueShopping.style.display = "block";
  cartSummary.style.display = "block";
  cartActionsBar.style.display = "flex";

  cartItemsList.innerHTML = cart.items.map(renderCartItem).join("");

  cartItemsList.querySelectorAll(".quantity-decrease").forEach(btn =>
    btn.addEventListener("click", () => updateQuantity(btn.dataset.vid, -1))
  );

  cartItemsList.querySelectorAll(".quantity-increase").forEach(btn =>
    btn.addEventListener("click", () => updateQuantity(btn.dataset.vid, 1))
  );

  cartItemsList.querySelectorAll(".cart-item-remove").forEach(btn =>
    btn.addEventListener("click", () => openRemoveModal(btn.dataset.id, btn.dataset.vid))
  );

  cartItemsList.querySelectorAll("input[type=checkbox]").forEach(cb =>
    cb.addEventListener("change", () => {
      cb.checked ? selectedItems.add(cb.dataset.id) : selectedItems.delete(cb.dataset.id);
      updateSelectionUI();
    })
  );
}

/* ======================
   SELECTION UI
====================== */
function updateSelectionUI() {
  const total = cart.items.length;
  const selected = selectedItems.size;

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = selected === total && total > 0;
    selectAllCheckbox.indeterminate = selected > 0 && selected < total;
  }

  if (selectedCount) selectedCount.textContent = selected;
  if (selectedItemCount) selectedItemCount.textContent = selected;
  if (checkoutSelectedCount) checkoutSelectedCount.textContent = selected;

  if (selectedSummary) {
    selectedSummary.style.display = selected > 0 ? "block" : "none";
  }

  if (checkoutBtn && checkoutSelectedBtn) {
    checkoutBtn.style.display = selected > 0 ? "none" : "flex";
    checkoutSelectedBtn.style.display = selected > 0 ? "flex" : "none";
  }
}

/* ======================
   QUANTITY
====================== */
async function updateQuantity(variationId, change) {
  if (!isLoggedIn()) {
    redirectLogin();
    return;
  }

  const item = cart.items.find(i => i.variationId === variationId);
  if (!item) return;

  const qty = item.quantity + change;
  if (qty < 1) return;

  await updateCartItem(variationId, qty);
  item.quantity = qty;
  renderCart();
}

/* ======================
   REMOVE MODAL
====================== */
function openRemoveModal(itemId, variationId) {
  pendingRemoveItemId = itemId;
  pendingRemoveVariationId = variationId;
  if (removeModal) removeModal.style.display = "flex";
}

function closeRemoveModal() {
  pendingRemoveItemId = null;
  pendingRemoveVariationId = null;
  if (removeModal) removeModal.style.display = "none";
}

async function confirmRemoveItem() {
  await removeFromCart(pendingRemoveVariationId);
  cart.items = cart.items.filter(i => i.cartItemId !== pendingRemoveItemId);
  selectedItems.delete(pendingRemoveItemId);
  closeRemoveModal();
  renderCart();
}

/* ======================
   CHECKOUT
====================== */
function handleCheckout(items) {
  if (!items.length) {
    showToast("Vui lòng chọn sản phẩm để thanh toán", "info");
    return;
  }

  if (!isLoggedIn()) {
    redirectLogin();
    return;
  }

  localStorage.setItem("checkoutData", JSON.stringify({ items }));
  window.location.href = "paymentPage.html";
}

/* ======================
   HELPERS
====================== */
function showEmptyCart() {
  if (!cartItemsList) return;
  cartItemsList.style.display = "none";
  emptyCart.style.display = "flex";
  cartActionsBar.style.display = "none";
  cartItemCount.textContent = "0 sản phẩm";
}

function showToast(msg, type = "info") {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function redirectLogin() {
  showToast("Vui lòng đăng nhập", "warning");
  setTimeout(() => window.location.href = "logIn.html", 1200);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
