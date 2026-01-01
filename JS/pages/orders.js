import { getOrdersByCustomer, getOrderDetails, cancelOrder, reorder } from "../API/orderApi.js";

// DOM Elements
const ordersList = document.getElementById("ordersList");
const emptyState = document.getElementById("emptyState");
const orderDetailPanel = document.getElementById("orderDetailPanel");
const closePanelBtn = document.getElementById("closePanel");
const toast = document.getElementById("toast");
const orderTabs = document.querySelectorAll(".tab-btn");

// State
let allOrders = [];
let currentFilter = "all";

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await loadOrders();
  initEventListeners();
});

// Load orders
async function loadOrders() {
  const accountId = localStorage.getItem("username");

  if (!accountId) {
    showToast("Vui lòng đăng nhập để xem đơn hàng", "error");
    setTimeout(() => {
      window.location.href = "logIn.html?mode=login";
    }, 2000);
    return;
  }

  try {
    ordersList.innerHTML = `
      <div class="loading-state">
        <i class="bx bx-loader-alt bx-spin"></i>
        <p>Đang tải đơn hàng...</p>
      </div>
    `;

    allOrders = await getOrdersByCustomer(accountId);
    
    // Sort by date descending (newest first)
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderOrders();
  } catch (error) {
    showToast("Không thể tải đơn hàng", "error");
    ordersList.innerHTML = `
      <div class="empty-state">
        <i class="bx bx-error"></i>
        <h3>Lỗi tải dữ liệu</h3>
        <p>Vui lòng thử lại sau</p>
      </div>
    `;
    console.error("Error loading orders:", error);
  }
}

// Initialize event listeners
function initEventListeners() {
  // Tab filtering
  orderTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      orderTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.status;
      renderOrders();
    });
  });

  // Close panel
  closePanelBtn.addEventListener("click", closePanel);
  
  // Close panel on overlay click
  orderDetailPanel.querySelector(".panel-overlay").addEventListener("click", closePanel);
  
  // Close panel on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && orderDetailPanel.classList.contains("show")) {
      closePanel();
    }
  });
}

// Render orders based on filter
function renderOrders() {
  const filteredOrders =
    currentFilter === "all"
      ? allOrders
      : allOrders.filter((order) => order.orderStatus.toLowerCase() === currentFilter);

  if (filteredOrders.length === 0) {
    ordersList.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }

  ordersList.style.display = "flex";
  emptyState.style.display = "none";

  ordersList.innerHTML = filteredOrders
    .map((order) => renderOrderCard(order))
    .join("");

  // Add click events to cards
  ordersList.querySelectorAll(".order-card").forEach((card) => {
    card.addEventListener("click", () => openOrderDetail(card.dataset.orderId));
  });
}

// Render single order card
function renderOrderCard(order) {
  const statusClass = getStatusClass(order.orderStatus);
  const statusText = getStatusText(order.orderStatus);
  const formattedDate = formatDate(order.createdAt);
  const formattedTotal = formatCurrency(order.total);

  // Get first product image (placeholder if none)
  const firstImage = order.orderDetails?.[0]?.variation?.product?.productImages?.[0]?.imageUrl 
    || "assets/images/no-image.jpg";
  
  const itemsCount = order.orderDetails?.length || 0;

  return `
    <div class="order-card" data-order-id="${order.orderId}">
      <div class="order-card-header">
        <div>
          <div class="order-id">ĐH-${order.orderId}</div>
          <div class="order-date">${formattedDate}</div>
        </div>
        <span class="order-status ${statusClass}">
          <i class="bx ${getStatusIcon(order.orderStatus)}"></i>
          ${statusText}
        </span>
      </div>
      <div class="order-card-body">
        <div class="order-items-preview">
          <img src="${firstImage}" alt="Product" class="order-item-thumb" />
          <span class="order-items-count">${itemsCount} sản phẩm</span>
        </div>
        <div class="order-total">${formattedTotal}</div>
      </div>
    </div>
  `;
}

// Open order detail panel
async function openOrderDetail(orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;

  // Show panel first with basic info
  showPanel();
  renderOrderBasicInfo(order);
  
  // Load detailed order info (with items)
  try {
    const orderDetails = await getOrderDetails(orderId);
    renderOrderItems(orderDetails.orderDetails || []);
    renderOrderSummary(orderDetails);
    renderOrderActions(order, orderDetails);
  } catch (error) {
    console.error("Error loading order details:", error);
  }
}

// Render basic order info
function renderOrderBasicInfo(order) {
  document.getElementById("detailOrderId").textContent = `ĐH-${order.orderId}`;
  document.getElementById("detailCreatedAt").textContent = formatDate(order.createdAt);
  document.getElementById("detailStatus").innerHTML = `
    <span class="order-status ${getStatusClass(order.orderStatus)}">
      <i class="bx ${getStatusIcon(order.orderStatus)}"></i>
      ${getStatusText(order.orderStatus)}
    </span>
  `;
  document.getElementById("detailAddress").textContent = order.shippingAddress || "--";
  
  if (order.note) {
    document.getElementById("noteRow").style.display = "flex";
    document.getElementById("detailNote").textContent = order.note;
  } else {
    document.getElementById("noteRow").style.display = "none";
  }
}

// Render order items
function renderOrderItems(orderDetails) {
  const container = document.getElementById("detailItems");
  
  if (!orderDetails || orderDetails.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px;">
        <p>Không có thông tin sản phẩm</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orderDetails
    .map((item) => {
      const image = item.variation?.product?.productImages?.[0]?.imageUrl 
        || "assets/images/no-image.jpg";
      const productName = item.variation?.product?.productName || "Sản phẩm";
      const variantName = item.variation?.color 
        ? `${item.variation.color}${item.variation.storage ? `, ${item.variation.storage}` : ""}`
        : "Mặc định";

      return `
        <div class="detail-item">
          <img src="${image}" alt="${productName}" class="detail-item-image" />
          <div class="detail-item-info">
            <div class="detail-item-name">${productName}</div>
            <div class="detail-item-variant">${variantName}</div>
            <div class="detail-item-price">
              <span class="detail-item-qty">x${item.quantity}</span>
              <span class="detail-item-total">${formatCurrency(item.total)}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Render order summary
function renderOrderSummary(order) {
  document.getElementById("detailSubTotal").textContent = formatCurrency(order.subTotal);
  
  if (order.discountAmount && order.discountAmount > 0) {
    document.getElementById("discountRow").style.display = "flex";
    document.getElementById("detailDiscount").textContent = `-${formatCurrency(order.discountAmount)}`;
  } else {
    document.getElementById("discountRow").style.display = "none";
  }
  
  document.getElementById("detailTotal").textContent = formatCurrency(order.total);
}

// Render order actions based on status
function renderOrderActions(order, orderDetails) {
  const container = document.getElementById("orderActions");
  const status = order.orderStatus.toLowerCase();
  
  let actionsHTML = "";
  
  // Can cancel if pending or confirmed
  if (status === "pending" || status === "confirmed") {
    actionsHTML += `
      <button class="btn-cancel-order" onclick="handleCancelOrder('${order.orderId}')">
        <i class="bx bx-x-circle"></i> Hủy đơn
      </button>
    `;
  }
  
  // Can reorder if delivered or cancelled
  if (status === "delivered" || status === "cancelled") {
    actionsHTML += `
      <button class="btn-reorder" onclick="handleReorder('${order.orderId}')">
        <i class="bx bx-refresh"></i> Mua lại
      </button>
    `;
  }
  
  // Always show view details action
  if (!actionsHTML) {
    actionsHTML = `
      <p style="color: #6b7280; font-size: 13px; text-align: center; width: 100%;">
        <i class="bx bx-info-circle"></i> Liên hệ hotline 1900 1009 nếu cần hỗ trợ
      </p>
    `;
  }
  
  container.innerHTML = actionsHTML;
}

// Show panel
function showPanel() {
  orderDetailPanel.classList.add("show");
  document.body.style.overflow = "hidden";
}

// Close panel
function closePanel() {
  orderDetailPanel.classList.remove("show");
  document.body.style.overflow = "";
}

// Handle cancel order
window.handleCancelOrder = async function (orderId) {
  if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
    return;
  }

  try {
    await cancelOrder(orderId);
    showToast("Hủy đơn hàng thành công", "success");
    closePanel();
    await loadOrders(); // Reload orders
  } catch (error) {
    showToast(error.message || "Hủy đơn hàng thất bại", "error");
  }
};

// Handle reorder
window.handleReorder = async function (orderId) {
  try {
    await reorder(orderId);
    showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
    closePanel();
    // Optionally redirect to cart
    // window.location.href = "cart.html";
  } catch (error) {
    showToast(error.message || "Mua lại thất bại", "error");
  }
};

// Helper functions
function getStatusClass(status) {
  const statusMap = {
    pending: "pending",
    confirmed: "confirmed",
    shipping: "shipping",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return statusMap[status.toLowerCase()] || "pending";
}

function getStatusText(status) {
  const statusMap = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status.toLowerCase()] || status;
}

function getStatusIcon(status) {
  const iconMap = {
    pending: "bx-time",
    confirmed: "bx-check-circle",
    shipping: "bx-package",
    delivered: "bx-check-double",
    cancelled: "bx-x-circle",
  };
  return iconMap[status.toLowerCase()] || "bx-help-circle";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

