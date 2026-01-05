import { getCustomerInfo } from "../API/customerApi.js";
import { createOrder } from "../API/orderApi.js";
import { getProductWithVariations } from "../API/productApi.js";
import { findDiscountsByName } from "../API/discountApi.js";

/* =========================
   AUTH
========================= */
function isLoggedIn() {
  return !!localStorage.getItem("username");
}

/* =========================
   DOM
========================= */
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const customerEmailInput = document.getElementById("customerEmail");
const customerAddressInput = document.getElementById("customerAddress");
const orderNoteTextarea = document.getElementById("orderNote");

const orderItemsContainer = document.getElementById("orderItems");
const summarySubTotal = document.getElementById("summarySubTotal");
const summaryDiscount = document.getElementById("summaryDiscount");
const summaryDiscountRow = document.getElementById("summaryDiscountRow");
const summaryTotal = document.getElementById("summaryTotal");

const placeOrderBtn = document.getElementById("placeOrderBtn");
const agreeTermsCheckbox = document.getElementById("agreeTerms");

const promoCodeInput = document.getElementById("promoCode");
const applyPromoBtn = document.getElementById("applyPromoBtn");
const promoMessage = document.getElementById("promoMessage");

const toast = document.getElementById("toast");
const loadingOverlay = document.getElementById("loadingOverlay");
const successModal = document.getElementById("successModal");
const viewOrdersBtn = document.getElementById("viewOrdersBtn");

/* =========================
   STATE
========================= */
let checkoutItems = [];
let checkoutData = null;
let discount = 0;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để thanh toán", "warning");
    return (window.location.href = "logIn.html");
  }

  await loadCheckoutData();
  await enrichCheckoutItems();
  renderOrderItems();
  await loadCustomerInfo();
  updatePlaceOrderButton();

  placeOrderBtn.addEventListener("click", handlePlaceOrder);
  agreeTermsCheckbox.addEventListener("change", updatePlaceOrderButton);
  applyPromoBtn.addEventListener("click", applyPromoCode);
  promoCodeInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") applyPromoCode();
  });
  
  // View orders button click handler
  if (viewOrdersBtn) {
    viewOrdersBtn.addEventListener("click", () => {
      window.location.href = "ordersPage.html";
    });
  }
});

/* =========================
   LOAD CHECKOUT DATA
========================= */
async function loadCheckoutData() {
  const raw = localStorage.getItem("checkoutData");
  if (!raw) {
    showToast("Không có sản phẩm để thanh toán", "warning");
    return (window.location.href = "cartPage.html");
  }

  checkoutData = JSON.parse(raw);
  checkoutItems = checkoutData.items || [];

  if (!checkoutItems.length) {
    showToast("Không có sản phẩm để thanh toán", "warning");
    return (window.location.href = "cartPage.html");
  }

  discount = checkoutData.discount || 0;
}

/* =========================
   ENRICH PRODUCT + VARIATION
========================= */
async function enrichCheckoutItems() {
  for (const item of checkoutItems) {
    const product = await getProductWithVariations(item.productId);
    const variation = product.variations.find(
      v => v.variationId === item.variationId
    );

    item._product = product;
    item._variation = variation;
  }
}

/* =========================
   CUSTOMER INFO
========================= */
async function loadCustomerInfo() {
  try {
    const res = await getCustomerInfo();
    const c = res.data || res;

    customerNameInput.value = c.customerName || "";
    customerPhoneInput.value = c.customerPhone || "";
    customerEmailInput.value = c.customerEmail || "";
    customerAddressInput.value = c.customerAddress || "";

    localStorage.setItem("customerId", c.customerId);
  } catch {
    // user chưa có info → cho nhập tay
  }
}

/* =========================
   RENDER ITEMS
========================= */
function renderOrderItems() {
  orderItemsContainer.innerHTML = checkoutItems.map(item => {
    const product = item._product;
    const variation = item._variation;

    const image =
      product.images?.[0]?.imageUrl ||
      product.img ||
      "assets/images/no-image.jpg";

    const variantName = variation.options
      ?.map(o => o.value)
      .join(" - ") || "Mặc định";

    const total = item.price * item.quantity;

    return `
      <div class="order-item">
        <img src="${image}" class="order-item-image" />
        <div class="order-item-info">
          <div class="order-item-name">${product.title}</div>
          <div class="order-item-variant">${variantName}</div>
          <div class="order-item-bottom">
            <span>x${item.quantity}</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  updateOrderSummary();
}

/* =========================
   SUMMARY
========================= */
function updateOrderSummary() {
  const subTotal = checkoutItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  summarySubTotal.textContent = formatCurrency(subTotal);

  if (discount > 0) {
    summaryDiscountRow.style.display = "flex";
    summaryDiscount.textContent = `-${formatCurrency(discount)}`;
  } else {
    summaryDiscountRow.style.display = "none";
  }

  summaryTotal.textContent = formatCurrency(subTotal - discount);
}

/* =========================
   PLACE ORDER
========================= */
async function handlePlaceOrder() {
  if (!agreeTermsCheckbox.checked) {
    return showToast("Vui lòng đồng ý điều khoản", "warning");
  }

  const customerId = localStorage.getItem("customerId");
  if (!customerId) {
    showToast("Vui lòng hoàn thiện thông tin cá nhân", "warning");
    return (window.location.href = "userInfoPage.html");
  }

  loadingOverlay.style.display = "flex";

  try {
    const payload = {
      shippingAddress: customerAddressInput.value.trim(),
      receiverName: customerNameInput.value.trim(),
      receiverPhone: customerPhoneInput.value.trim(),
      note: orderNoteTextarea.value.trim() || null,
      customerId,
      discountId: checkoutData.discountId || null,
      items: checkoutItems.map(i => ({
        variationId: i.variationId,
        quantity: i.quantity
      }))
    };

    const order = await createOrder(payload);

    localStorage.removeItem("checkoutData");
    loadingOverlay.style.display = "none";
    successModal.style.display = "flex";

    sessionStorage.setItem("lastOrderId", order.orderId);
  } catch (e) {
    loadingOverlay.style.display = "none";
    showToast(e.message || "Đặt hàng thất bại", "error");
  }
}

/* =========================
   UI HELPERS
========================= */
function updatePlaceOrderButton() {
  placeOrderBtn.disabled =
    !customerNameInput.value ||
    !customerPhoneInput.value ||
    !customerEmailInput.value ||
    !customerAddressInput.value ||
    !agreeTermsCheckbox.checked;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
}

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}
async function applyPromoCode() {
  const code = promoCodeInput.value.trim();

  if (!code) {
    showPromoMessage("Vui lòng nhập mã giảm giá", "error");
    return;
  }

  discount = 0;

  try {
    const discounts = await findDiscountsByName(code);

    // ❗ API trả về ARRAY
    if (!Array.isArray(discounts) || discounts.length === 0) {
      showPromoMessage("Mã giảm giá không tồn tại", "error");
      return;
    }

    // 👉 lấy discount đầu tiên (backend search theo name/code)
    const discountData = discounts[0];

    /* =========================
       VALIDATION
    ========================= */
    const now = new Date();
    const startDate = new Date(discountData.startDate);
    const expireDate = new Date(discountData.expireDate);

    if (!discountData.isActive) {
      showPromoMessage("Mã giảm giá đã bị vô hiệu hóa", "error");
      return;
    }

    if (now < startDate) {
      showPromoMessage("Mã giảm giá chưa có hiệu lực", "error");
      return;
    }

    if (now > expireDate) {
      showPromoMessage("Mã giảm giá đã hết hạn", "error");
      return;
    }

    if (
      discountData.usageLimit > 0 &&
      discountData.usageCount >= discountData.usageLimit
    ) {
      showPromoMessage("Mã giảm giá đã hết lượt sử dụng", "error");
      return;
    }

    /* =========================
       CALCULATE SUBTOTAL
    ========================= */
    const subTotal = checkoutItems.reduce(
      (s, i) => s + i.price * i.quantity,
      0
    );

    if (subTotal < discountData.minOrderValue) {
      showPromoMessage(
        `Đơn hàng tối thiểu ${formatCurrency(
          discountData.minOrderValue
        )} để áp dụng mã này`,
        "error"
      );
      return;
    }

    /* =========================
       CALCULATE DISCOUNT
       discountType:
       0 = Percentage
       1 = FixedAmount
       2 = FreeShipping (ignore)
    ========================= */
    let discountAmount = 0;

    if (discountData.discountType === 0) {
      discountAmount = subTotal * (discountData.discountValue / 100);
    } else if (discountData.discountType === 1) {
      discountAmount = discountData.discountValue;
    } else {
      showPromoMessage("Mã freeship không áp dụng tại đây", "error");
      return;
    }

    if (
      discountData.maxDiscountAmount > 0 &&
      discountAmount > discountData.maxDiscountAmount
    ) {
      discountAmount = discountData.maxDiscountAmount;
    }

    if (discountAmount > subTotal) {
      discountAmount = subTotal;
    }

    /* =========================
       APPLY
    ========================= */
    discount = discountAmount;
    checkoutData.discountId = discountData.discountId;

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    updateOrderSummary();

    showPromoMessage(
      `Đã áp dụng mã giảm giá: ${discountData.discountName}`,
      "success"
    );
    showToast("Áp dụng mã giảm giá thành công", "success");

  } catch (e) {
    console.error("applyPromoCode error", e);
    showPromoMessage("Có lỗi xảy ra khi áp dụng mã giảm giá", "error");
  }
}

function showPromoMessage(message, type) {
  promoMessage.textContent = message;
  promoMessage.className = `promo-message ${type}`;
}
