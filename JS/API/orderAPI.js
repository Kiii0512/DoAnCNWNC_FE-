/* =========================
   MOCK DATA (FAKE DATABASE)
========================= */

let ORDERS = [
  {
    orderId: 'ORD0001',
    customerName: 'Nguyễn Văn A',
    createdAt: '2025-09-10',
    totalAmount: 28990000,
    status: 'PENDING',
    items: [
      { productName: 'iPhone 15 Pro', qty: 1, price: 28990000 }
    ]
  },
  {
    orderId: 'ORD0002',
    customerName: 'Trần Thị B',
    createdAt: '2025-09-11',
    totalAmount: 15990000,
    status: 'SHIPPING',
    items: [
      { productName: 'AirPods Pro', qty: 1, price: 15990000 }
    ]
  }
];

/* =========================
   UTILS
========================= */
function delay(ms = 300) {
  return new Promise(res => setTimeout(res, ms));
}

/* =========================
   GET ALL ORDERS
========================= */
export async function getOrders() {
  await delay();
  return JSON.parse(JSON.stringify(ORDERS)); // clone cho an toàn
}

/* =========================
   GET ORDER BY ID
========================= */
export async function getOrderById(orderId) {
  await delay();
  return ORDERS.find(o => o.orderId === orderId) || null;
}

/* =========================
   UPDATE ORDER STATUS
========================= */
export async function updateOrderStatus(orderId, status) {
  await delay();

  const order = ORDERS.find(o => o.orderId === orderId);
  if (!order) throw new Error('Order not found');

  order.status = status;

  return {
    success: true,
    message: 'Cập nhật trạng thái thành công'
  };
}

/* =========================
   DELETE / CANCEL ORDER
========================= */
export async function deleteOrder(orderId) {
  await delay();

  const idx = ORDERS.findIndex(o => o.orderId === orderId);
  if (idx === -1) throw new Error('Order not found');

  ORDERS.splice(idx, 1);

  return {
    success: true,
    message: 'Đã xóa đơn hàng'
  };
}
