import { getCustomerInfo } from "../API/customerApi.js";
import { createOrder } from "../API/orderApi.js";

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
let discount = 0; // Discount amount
let appliedPromoCode = null; // Applied promo code

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();
  initEventListeners();
});

// Initialize page
async function initializePage() {
  // Get checkout items from sessionStorage
  const checkoutItemsData = sessionStorage.getItem("checkoutItems");
  
  // If no items in sessionStorage, check localStorage
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
  
  // Validate checkout items
  if (!checkoutItems || checkoutItems.length === 0) {
    showToast("Không có sản phẩm để thanh toán", "warning");
    setTimeout(() => {
      window.location.href = "cartPage.html";
    }, 1500);
    return;
  }

  // Get checkout data from localStorage (includes discount info)
  const checkoutDataStr = localStorage.getItem("checkoutData");
  if (checkoutDataStr) {
    try {
      checkoutData = JSON.parse(checkoutDataStr);
      // Update checkoutItems from checkoutData if available
      if (checkoutData.items && checkoutData.items.length > 0) {
        checkoutItems = checkoutData.items;
      }
    } catch (e) {
      console.error("Error parsing checkoutData:", e);
    }
  }

  // Render order items
  renderOrderItems();

  // Load customer info
  await loadCustomerInfo();

  // Update place order button state
  updatePlaceOrderButton();
}

// Load customer info
async function loadCustomerInfo() {
  try {
    const accountId = localStorage.getItem("accountId");
    if (!accountId) {
      console.warn("No accountId found in localStorage");
      // For demo purposes, use empty values
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
    
    // Handle nested response structure (success: true, data: {...})
    const customerData = response && (response.data || response);
    console.log("Customer data from API:", customerData);
    
    customerInfo = customerData;

    // Store customerId for order creation - handle all possible field names
    if (customerData) {
      const customerId = customerData.customerId || customerData.CustomerId || customerData.id || customerData.Id;
      console.log("Extracted customerId:", customerId);
      
      if (customerId) {
        localStorage.setItem("customerId", customerId);
        console.log("Stored customerId in localStorage:", customerId);
      } else {
        console.warn("No customerId found in customerData:", customerData);
      }
      
      // Pre-fill form with customer info - handle nested data structure
      customerNameInput.value = customerData.customerName || customerData.CustomerName || customerData.name || customerData.Name || "";
      customerPhoneInput.value = customerData.customerPhone || customerData.CustomerPhone || customerData.phone || customerData.Phone || "";
      customerEmailInput.value = customerData.customerEmail || customerData.CustomerEmail || customerData.email || customerData.Email || "";
      customerAddressInput.value = customerData.customerAddress || customerData.CustomerAddress || customerData.address || customerData.Address || "";
      
      console.log("Form pre-filled - Name:", customerNameInput.value, "Email:", customerEmailInput.value);
    }
  } catch (error) {
    console.error("Error loading customer info:", error);
    // Continue without customer info
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

  // Update summary
  updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
  const subTotal = checkoutItems.reduce((sum, item) => {
    const price = item.variation?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  summarySubTotal.textContent = formatCurrency(subTotal);
  
  // Get discount from checkoutData or use local state
  const finalDiscount = checkoutData?.discount > 0 ? checkoutData.discount : discount;
  
  // Update discount display
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
  // Form input listeners for validation
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

  // Terms checkbox
  agreeTermsCheckbox.addEventListener("change", updatePlaceOrderButton);

  // Place order button
  placeOrderBtn.addEventListener("click", handlePlaceOrder);

  // View orders button in success modal
  viewOrdersBtn.addEventListener("click", () => {
    window.location.href = "ordersPage.html";
  });

  // Apply promo code
  applyPromoBtn.addEventListener("click", applyPromoCode);
  promoCodeInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") applyPromoCode();
  });
}

// Apply promo code
async function applyPromoCode() {
  // Check if user is logged in
  const accessToken = localStorage.getItem("accesstoken");
  if (!accessToken) {
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

  // Demo promo codes - in production, validate with API
  const promoCodes = {
    "DISCOUNT10": { discountPercent: 10, description: "Giảm 10%" },
    "DISCOUNT20": { discountPercent: 20, description: "Giảm 20%" },
    "DISCOUNT50": { discountPercent: 50, description: "Giảm 50%" },
    "VIP100": { discountPercent: 15, description: "VIP: Giảm 15%" }
  };

  const promoConfig = promoCodes[code];
  
  if (promoConfig) {
    // Calculate discount amount based on checkout items subtotal
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
    
    // Update checkoutData and localStorage (use discountId for backend compatibility)
    if (!checkoutData) {
      checkoutData = { items: checkoutItems };
    }
    checkoutData.discount = discount;
    checkoutData.discountId = appliedPromoCode; // Use promo code as discountId for backend
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    
    // Update order summary
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

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmailInput.value.trim())) {
    showToast("Vui lòng nhập đúng địa chỉ email", "warning");
    customerEmailInput.focus();
    return false;
  }

  // Validate phone number (Vietnam format)
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
  // Validate form
  if (!validateForm()) {
    return;
  }

  // Check terms agreement
  if (!agreeTermsCheckbox.checked) {
    showToast("Vui lòng đồng ý với điều khoản", "warning");
    return;
  }

  // Get customer ID from localStorage (stored in loadCustomerInfo)
  const customerId = localStorage.getItem("customerId") || null;
  
  // Check if customer profile exists
  if (!customerId) {
    showToast("Vui lòng hoàn thiện thông tin cá nhân trước khi đặt hàng", "warning");
    loadingOverlay.style.display = "none";
    setTimeout(() => {
      window.location.href = "userInfoPage.html";
    }, 1500);
    return;
  }

  // Show loading overlay
  loadingOverlay.style.display = "flex";

  try {
    // Build shipping address from customer address input
    const shippingAddress = customerAddressInput.value.trim();

    // Build order items - only include variationId and quantity as per backend model
    const orderItems = checkoutItems.map(item => ({
      variationId: item.variation?.variationId || item.variationId,
      quantity: item.quantity || 1
    }));

    // Get discount ID from checkoutData
    const discountId = checkoutData?.discountId || checkoutData?.appliedPromoCode || null;

    // Create order request matching C# CreateOrderRequest DTO
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

    // Call createOrder API
    const order = await createOrder(orderData);

    // Clear checkout items from sessionStorage
    sessionStorage.removeItem("checkoutItems");
    
    // Clear checkoutData from localStorage
    localStorage.removeItem("checkoutData");

    // Show success modal
    loadingOverlay.style.display = "none";
    successModal.style.display = "flex";

    // Store the order ID for viewing
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

