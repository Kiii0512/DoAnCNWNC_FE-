
import { getCustomerInfo } from "../API/customerApi.js";
import { createOrder } from "../API/orderApi.js";

// Helper function to get accountId from cookie
function getAccountId() {
  const name = "account_id=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Helper function to check if user is logged in (by cookie)
function isLoggedIn() {
  const name = "access_token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return true;
    }
  }
  return false;
}

// DOM Elements
const shippingForm = document.getElementById("shippingForm");
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
const toast = document.getElementById("toast");
const loadingOverlay = document.getElementById("loadingOverlay");
const successModal = document.getElementById("successModal");
const viewOrdersBtn = document.getElementById("viewOrdersBtn");
const promoCodeInput = document.getElementById("promoCode");
const applyPromoBtn = document.getElementById("applyPromoBtn");
const promoMessage = document.getElementById("promoMessage");

// State
let checkoutItems = [];
let checkoutData = null;
let customerInfo = null;
let discount = 0;
let appliedPromoCode = null;

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();
  initEventListeners();
});

// Initialize page
async function initializePage() {
  // Check if user is logged in via cookie
  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để thanh toán", "warning");
    setTimeout(() => {
      window.location.href = "logIn.html";
    }, 1500);
    return;
  }

  const checkoutItemsData = sessionStorage.getItem("checkoutItems");
  
  if (!checkoutItemsData) {
    const checkoutDataStr = localStorage.getItem("checkoutData");
    if (checkoutDataStr) {
      try {
        const localCheckoutData = JSON.parse(checkoutDataStr);
        if (localCheckoutData.items && localCheckoutData.items.length > 0) {
          checkoutItems = localCheckoutData.items;
          checkoutData = localCheckoutData;
        }
      } catch (e) {
        console.error("Error parsing checkoutData from localStorage:", e);
      }
    }
  } else {
    try {
      checkoutItems = JSON.parse(checkoutItemsData);
    } catch (e) {
      console.error("Error parsing checkoutItems:", e);
    }
  }
  
  if (!checkoutItems || checkoutItems.length === 0) {
    showToast("Không có sản phẩm để thanh toán", "warning");
    setTimeout(() => {
      window.location.href = "cartPage.html";
    }, 1500);
    return;
  }

  const checkoutDataStr = localStorage.getItem("checkoutData");
  if (checkoutDataStr) {
    try {
      checkoutData = JSON.parse(checkoutDataStr);
      if (checkoutData.items && checkoutData.items.length > 0) {
        checkoutItems = checkoutData.items;
      }
    } catch (e) {
      console.error("Error parsing checkoutData:", e);
    }
  }

  renderOrderItems();

  await loadCustomerInfo();

  updatePlaceOrderButton();
}

// Load customer info
async function loadCustomerInfo() {
  try {
    const accountId = getAccountId() || localStorage.getItem("accountId");
    if (!accountId) {
      console.warn("No accountId found");
      customerInfo = {
        customerId: null,
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: ""
      };
      return;
    }

    console.log("Loading customer info for accountId:", accountId);
    const response = await getCustomerInfo(accountId);
    
    const customerData = response && (response.data || response);
    console.log("Customer data from API:", customerData);
    
    customerInfo = customerData;

    if (customerData) {
      const customerId = customerData.customerId || customerData.CustomerId || customerData.id || customerData.Id;
      console.log("Extracted customerId:", customerId);
      
      if (customerId) {
        localStorage.setItem("customerId", customerId);
        console.log("Stored customerId in localStorage:", customerId);
      } else {
        console.warn("No customerId found in customerData:", customerData);
      }
      
      customerNameInput.value = customerData.customerName || customerData.CustomerName || customerData.name || customerData.Name || "";
      customerPhoneInput.value = customerData.customerPhone || customerData.CustomerPhone || customerData.phone || customerData.Phone || "";
      customerEmailInput.value = customerData.customerEmail || customerData.CustomerEmail || customerData.email || customerData.Email || "";
      customerAddressInput.value = customerData.customerAddress || customerData.CustomerAddress || customerData.address || customerData.Address || "";
      
      console.log("Form pre-filled - Name:", customerNameInput.value, "Email:", customerEmailInput.value);
    }
  } catch (error) {
    console.error("Error loading customer info:", error);
    customerInfo = {
      customerId: null,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: ""
    };
  }
}

// Render order items
function renderOrderItems() {
  if (!checkoutItems || checkoutItems.length === 0) {
    orderItemsContainer.innerHTML = `
      <div class="empty-state">
        <i class="bx bx-cart-alt"></i>
        <p>Không có sản phẩm</p>
      </div>
    `;
    return;
  }

  orderItemsContainer.innerHTML = checkoutItems
    .map((item, index) => {
      const variation = item.variation;
      const product = variation?.product;
      const image = product?.productImages?.[0]?.imageUrl || "assets/images/no-image.jpg";
      const productName = product?.productName || "Sản phẩm";
      const variantName = variation?.variantName || "Mặc định";
      const unitPrice = variation?.price || 0;
      const quantity = item.quantity || 1;
      const total = unitPrice * quantity;

      return `
        <div class="order-item" data-index="${index}">
          <img src="${image}" alt="${productName}" class="order-item-image" />
          <div class="order-item-info">
            <div class="order-item-name">${productName}</div>
            <div class="order-item-variant">${variantName}</div>
            <div class="order-item-bottom">
              <span class="order-item-qty">x${quantity}</span>
              <span class="order-item-price">${formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
  const subTotal = checkoutItems.reduce((sum, item) => {
    const price = item.variation?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  summarySubTotal.textContent = formatCurrency(subTotal);
  
  const finalDiscount = checkoutData?.discount > 0 ? checkoutData.discount : discount;
  
  if (finalDiscount > 0 && summaryDiscountRow && summaryDiscount) {
    summaryDiscountRow.style.display = "flex";
    summaryDiscount.textContent = `-${formatCurrency(finalDiscount)}`;
  } else if (summaryDiscountRow) {
    summaryDiscountRow.style.display = "none";
  }
  
  const total = subTotal - finalDiscount;
  summaryTotal.textContent = formatCurrency(total);
}

// Initialize event listeners
function initEventListeners() {
  const requiredInputs = [
    customerNameInput,
    customerPhoneInput,
    customerEmailInput,
    customerAddressInput
  ];

  requiredInputs.forEach(input => {
    input.addEventListener("input", updatePlaceOrderButton);
    input.addEventListener("change", updatePlaceOrderButton);
  });

  agreeTermsCheckbox.addEventListener("change", updatePlaceOrderButton);

  placeOrderBtn.addEventListener("click", handlePlaceOrder);

  viewOrdersBtn.addEventListener("click", () => {
    window.location.href = "ordersPage.html";
  });

  applyPromoBtn.addEventListener("click", applyPromoCode);
  promoCodeInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") applyPromoCode();
  });
}

// Apply promo code
async function applyPromoCode() {
  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để áp dụng mã giảm giá", "warning");
    setTimeout(() => {
      window.location.href = "logIn.html";
    }, 1500);
    return;
  }

  const code = promoCodeInput.value.trim().toUpperCase();

  if (!code) {
    promoMessage.textContent = "Vui lòng nhập mã giảm giá";
    promoMessage.className = "promo-message error";
    return;
  }

  const promoCodes = {
    "DISCOUNT10": { discountPercent: 10, description: "Giảm 10%" },
    "DISCOUNT20": { discountPercent: 20, description: "Giảm 20%" },
    "DISCOUNT50": { discountPercent: 50, description: "Giảm 50%" },
    "VIP100": { discountPercent: 15, description: "VIP: Giảm 15%" }
  };

  const promoConfig = promoCodes[code];
  
  if (promoConfig) {
    const subTotal = checkoutItems.reduce((sum, item) => {
      const price = item.variation?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    
    discount = Math.floor(subTotal * (promoConfig.discountPercent / 100));
    appliedPromoCode = code;
    
    promoMessage.textContent = `Áp dụng thành công! ${promoConfig.description} (-${formatCurrency(discount)})`;
    promoMessage.className = "promo-message success";
    promoCodeInput.disabled = true;
    applyPromoBtn.disabled = true;
    
    if (!checkoutData) {
      checkoutData = { items: checkoutItems };
    }
    checkoutData.discount = discount;
    checkoutData.discountId = appliedPromoCode;
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    
    updateOrderSummary();
  } else {
    promoMessage.textContent = "Mã giảm giá không hợp lệ hoặc đã hết hạn";
    promoMessage.className = "promo-message error";
  }
}

// Validate form
function validateForm() {
  const requiredFields = [
    { field: customerNameInput, name: "Họ và tên" },
    { field: customerPhoneInput, name: "Số điện thoại" },
    { field: customerEmailInput, name: "Email" },
    { field: customerAddressInput, name: "Địa chỉ" }
  ];

  for (const { field, name } of requiredFields) {
    if (!field.value.trim()) {
      showToast(`Vui lòng nhập ${name}`, "warning");
      field.focus();
      return false;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmailInput.value.trim())) {
    showToast("Vui lòng nhập đúng địa chỉ email", "warning");
    customerEmailInput.focus();
    return false;
  }

  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  const phone = customerPhoneInput.value.trim().replace(/\s/g, "");
  if (!phoneRegex.test(phone)) {
    showToast("Vui lòng nhập đúng số điện thoại", "warning");
    customerPhoneInput.focus();
    return false;
  }

  return true;
}

// Update place order button state
function updatePlaceOrderButton() {
  const isFormValid = validateFormSimple();
  const isTermsAgreed = agreeTermsCheckbox.checked;
  const hasItems = checkoutItems && checkoutItems.length > 0;

  placeOrderBtn.disabled = !isFormValid || !isTermsAgreed || !hasItems;
}

// Simple form validation for button state
function validateFormSimple() {
  return (
    customerNameInput.value.trim() !== "" &&
    customerPhoneInput.value.trim() !== "" &&
    customerEmailInput.value.trim() !== "" &&
    customerAddressInput.value.trim() !== ""
  );
}

// Handle place order
async function handlePlaceOrder() {
  if (!validateForm()) {
    return;
  }

  if (!agreeTermsCheckbox.checked) {
    showToast("Vui lòng đồng ý với điều khoản", "warning");
    return;
  }

  const customerId = localStorage.getItem("customerId") || null;
  
  if (!customerId) {
    showToast("Vui lòng hoàn thiện thông tin cá nhân trước khi đặt hàng", "warning");
    loadingOverlay.style.display = "none";
    setTimeout(() => {
      window.location.href = "userInfoPage.html";
    }, 1500);
    return;
  }

  loadingOverlay.style.display = "flex";

  try {
    const shippingAddress = customerAddressInput.value.trim();

    const orderItems = checkoutItems.map(item => ({
      variationId: item.variation?.variationId || item.variationId,
      quantity: item.quantity || 1
    }));

    const discountId = checkoutData?.discountId || checkoutData?.appliedPromoCode || null;

    const orderData = {
      shippingAddress: shippingAddress,
      receiverName: customerNameInput.value.trim(),
      receiverPhone: customerPhoneInput.value.trim(),
      note: orderNoteTextarea.value.trim() || null,
      items: orderItems,
      discountId: discountId,
      customerId: customerId
    };

    console.log("Creating order with data:", orderData);

    const order = await createOrder(orderData);

    sessionStorage.removeItem("checkoutItems");
    localStorage.removeItem("checkoutData");

    loadingOverlay.style.display = "none";
    successModal.style.display = "flex";

    sessionStorage.setItem("lastOrderId", order.orderId || order.id);

  } catch (error) {
    console.error("Error creating order:", error);
    loadingOverlay.style.display = "none";
    showToast(error.message || "Đặt hàng thất bại. Vui lòng thử lại", "error");
  }
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

// Export for use in other modules
export { formatCurrency, showToast };

