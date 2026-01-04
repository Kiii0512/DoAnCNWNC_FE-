import {
  getOrdersByCustomer,
  cancelOrder,
  reorder
} from "../API/orderApi.js";

/* =========================
   AUTH
========================= */
function isLoggedIn() {
  return !!localStorage.getItem("username");
}

/* =========================
   ENUM NORMALIZER (QUAN TRỌNG)
========================= */
function normalizeStatus(status) {
  if (typeof status === "string") return status.toLowerCase();

  // EnumOrderStatus từ BE
  const map = {
    0: "pending",
    1: "shipped",
    2: "delivered",
    3: "cancelled"
  };

  return map[status] || "pending";
}

/* =========================
   DOM
========================= */
const ordersList = document.getElementById("ordersList");
const emptyState = document.getElementById("emptyState");
const orderDetailPanel = document.getElementById("orderDetailPanel");
const closePanelBtn = document.getElementById("closePanel");
const toast = document.getElementById("toast");
const orderTabs = document.querySelectorAll(".tab-btn");

/* =========================
   STATE
========================= */
let allOrders = [];
let currentFilter = "all";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadOrders();
  initEventListeners();
});

/* =========================
   LOAD ORDERS (JWT HttpOnly)
========================= */
async function loadOrders() {
  if (!isLoggedIn()) {
    showToast("Vui lòng đăng nhập để xem đơn hàng", "error");
    setTimeout(() => window.location.href = "logIn.html", 1500);
    return;
  }

  try {
    ordersList.innerHTML = `
      <div class="loading-state">
        <i class="bx bx-loader-alt bx-spin"></i>
        <p>Đang tải đơn hàng...</p>
      </div>
    `;

    allOrders = await getOrdersByCustomer();

    allOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    renderOrders();
  } catch (err) {
    console.error(err);
    showToast("Không thể tải đơn hàng", "error");
  }
}

/* =========================
   EVENTS
========================= */
function initEventListeners() {
  orderTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      orderTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.status;
      renderOrders();
    });
  });

  closePanelBtn.addEventListener("click", closePanel);
}

/* =========================
   RENDER LIST
========================= */
function renderOrders() {
  const filtered =
    currentFilter === "all"
      ? allOrders
      : allOrders.filter(
          o => normalizeStatus(o.orderStatus) === currentFilter
        );

  if (!filtered.length) {
    ordersList.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";
  ordersList.style.display = "flex";

  ordersList.innerHTML = filtered
    .map(renderOrderCard)
    .join("");

  ordersList.querySelectorAll(".order-card").forEach(card => {
    card.addEventListener("click", () =>
      openOrderDetail(card.dataset.orderId)
    );
  });
}

/* =========================
   ORDER CARD
========================= */
function renderOrderCard(order) {
  return `
    <div class="order-card" data-order-id="${order.orderId}">
      <div class="order-card-header">
        <div>
          <div class="order-id">ĐH-${order.orderId}</div>
          <div class="order-date">${formatDate(order.createdAt)}</div>
        </div>
        <span class="order-status ${getStatusClass(order.orderStatus)}">
          ${getStatusText(order.orderStatus)}
        </span>
      </div>

      <div class="order-card-body">
        <div>${order.items.length} sản phẩm</div>
        <div class="order-total">${formatCurrency(order.total)}</div>
      </div>
    </div>
  `;
}

/* =========================
   DETAIL PANEL
========================= */
function openOrderDetail(orderId) {
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;

  showPanel();
  renderOrderBasicInfo(order);
  renderOrderItems(order.items);
  renderOrderSummary(order);
  renderOrderActions(order);
}

/* =========================
   DETAIL INFO
========================= */
function renderOrderBasicInfo(order) {
  document.getElementById("detailOrderId").textContent =
    `ĐH-${order.orderId}`;

  document.getElementById("detailCreatedAt").textContent =
    formatDate(order.createdAt);

  document.getElementById("detailStatus").textContent =
    getStatusText(order.orderStatus);

  document.getElementById("detailAddress").textContent =
    order.shippingAddress;

  if (order.note) {
    document.getElementById("noteRow").style.display = "flex";
    document.getElementById("detailNote").textContent = order.note;
  } else {
    document.getElementById("noteRow").style.display = "none";
  }
}

/* =========================
   DETAIL ITEMS (DTO CHUẨN)
========================= */
function renderOrderItems(items) {
  const container = document.getElementById("detailItems");

  if (!items || !items.length) {
    container.innerHTML = "<p>Không có sản phẩm</p>";
    return;
  }

  container.innerHTML = items.map(i => `
    <div class="detail-item">
      <div class="detail-item-info">
        <div class="detail-item-name">${i.productName}</div>
        <div class="detail-item-variant">
          Mã biến thể: ${i.variationId}
        </div>
        <div class="detail-item-price">
          <span>x${i.quantity}</span>
          <span>${formatCurrency(i.total)}</span>
        </div>
      </div>
    </div>
  `).join("");
}

/* =========================
   SUMMARY
========================= */
function renderOrderSummary(order) {
  document.getElementById("detailSubTotal").textContent =
    formatCurrency(order.subTotal);

  if (order.discountAmount > 0) {
    document.getElementById("discountRow").style.display = "flex";
    document.getElementById("detailDiscount").textContent =
      `-${formatCurrency(order.discountAmount)}`;
  } else {
    document.getElementById("discountRow").style.display = "none";
  }

  document.getElementById("detailTotal").textContent =
    formatCurrency(order.total);
}

/* =========================
   ACTIONS
========================= */
function renderOrderActions(order) {
  const box = document.getElementById("orderActions");
  const status = normalizeStatus(order.orderStatus);

  let html = "";

  if (status === "pending") {
    html = `
      <button onclick="handleCancelOrder('${order.orderId}')">
        Hủy đơn
      </button>
    `;
  }

  if (status === "delivered" || status === "cancelled") {
    html = `
      <button onclick="handleReorder('${order.orderId}')">
        Mua lại
      </button>
    `;
  }

  box.innerHTML = html || "<p>Không có thao tác</p>";
}

/* =========================
   PANEL
========================= */
function showPanel() {
  orderDetailPanel.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closePanel() {
  orderDetailPanel.classList.remove("show");
  document.body.style.overflow = "";
}

/* =========================
   ACTION HANDLERS
========================= */
window.handleCancelOrder = async function (orderId) {
  if (!confirm("Hủy đơn hàng?")) return;

  await cancelOrder(orderId);
  showToast("Hủy đơn thành công", "success");
  closePanel();
  await loadOrders();
};

window.handleReorder = async function (orderId) {
  await reorder(orderId);
  showToast("Đã thêm vào giỏ hàng", "success");
};

/* =========================
   HELPERS
========================= */
function getStatusClass(status) {
  return normalizeStatus(status);
}

function getStatusText(status) {
  const map = {
    pending: "Chờ xác nhận",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy"
  };
  return map[normalizeStatus(status)] || status;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN");
}

function formatCurrency(v) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(v);
}

function showToast(msg, type = "info") {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}
