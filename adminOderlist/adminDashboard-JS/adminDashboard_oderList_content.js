<<<<<<< Updated upstream
class orderlistcontent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="content">

      <div class="page-title"><h1>Order Management</h1></div>
      <div class="breadcrumb">Home / Orders</div>

      <div class="tools">
        <div style="display:flex; gap:10px">
          <input id="searchOrder" type="text" placeholder="Order ID..." />
          <input id="searchCustomer" type="text" placeholder="Customer ID..." />
          <select id="filterStatus">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button id="resetFilter">Reset</button>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Order Name</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="orderTable"></tbody>
        </table>
      </div>

    </div>
    `;

    const orders = [
      { id: "OD001", customerId: "KH001", name: "Dell Laptop Order", date: "2025-12-15", status: "Pending" },
      { id: "OD002", customerId: "KH002", name: "iPhone 15 Order", date: "2025-12-16", status: "Processing" },
      { id: "OD003", customerId: "KH001", name: "Sony Headphone Order", date: "2025-12-17", status: "Completed" },
      { id: "OD004", customerId: "KH003", name: "Mechanical Keyboard Order", date: "2025-12-18", status: "Cancelled" }
    ];

    const tbody = this.querySelector("#orderTable");

    const render = (data) => {
      tbody.innerHTML = "";

      data.forEach((o, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${o.id}</td>
            <td>${o.customerId}</td>
            <td>${o.name}</td>
            <td>${o.date}</td>
            <td>
              <select class="statusSelect" data-i="${i}">
                <option ${o.status==="Pending"?"selected":""}>Pending</option>
                <option ${o.status==="Processing"?"selected":""}>Processing</option>
                <option ${o.status==="Completed"?"selected":""}>Completed</option>
                <option ${o.status==="Cancelled"?"selected":""}>Cancelled</option>
              </select>
            </td>
            <td class="actions">
              <i class="edit" data-i="${i}" title="View Order">👁</i>
              <i class="delete" data-i="${i}" title="Delete Order">🗑</i>
            </td>
          </tr>
=======
class oderlistcontent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <main>
                <div class="card">
                <div class="page-head">
                    <div class="page-title">
                    <h2 style="margin:0">Admin — Quản lý đơn hàng</h2>
                    <div class="small muted">Danh sách, xem, cập nhật trạng thái, in & export</div>
                    </div>
                    <div class="controls">
                    <button class="btn btn-ghost" id="btnLamMoi">Làm mới</button>
                    <button class="btn btn-ghost" id="btnXuat">Xuất CSV</button>
                    </div>
                </div>

                <div class="filters">
                    <input type="text" id="timKiem" placeholder="Tìm theo tên, mã, số điện thoại..." style="min-width:280px" />
                    <select id="locTrangThai" aria-label="Lọc trạng thái">
                    <option value="">Tất cả trạng thái</option>
                    <option value="dang-cho">Đang chờ</option>
                    <option value="da-xac-nhan">Đã xác nhận</option>
                    <option value="dang-chuan-bi">Đang chuẩn bị</option>
                    <option value="da-gui">Đã gửi</option>
                    <option value="da-hoan-thanh">Hoàn thành</option>
                    <option value="da-huy">Đã hủy</option>
                    </select>
                    <select id="soLuongTrang" aria-label="Số dòng">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    </select>
                    <div style="margin-left:auto" class="inline">
                    <label class="small muted">Chọn:</label>
                    <button class="btn btn-ghost" id="inChon">In</button>
                    <button class="btn btn-ghost" id="xuatChon">Xuất chọn</button>
                    </div>
                </div>

                <div style="overflow:auto">
                    <table id="bangDon" aria-describedby="Danh sách đơn hàng">
                    <thead>
                        <tr>
                        <th><input type="checkbox" id="chkTatCa" aria-label="Chọn tất cả"/></th>
                        <th>Mã đơn</th>
                        <th>Khách</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Ngày</th>
                        <th style="width:190px">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                    </table>
                </div>
            </div>
        </main>

        <!-- Khung chi tiết -->
        <aside class="drawer" id="khungChiTiet" aria-hidden="true">
            <button id="dongKhung" class="btn btn-ghost" style="float:right">Đóng</button>
            <h3>Chi tiết đơn <span id="chiTietMa" class="small muted"></span></h3>
            <div id="chiTietKhach" class="khung-thong-tin"></div>
            <div >
            <label class="small muted">Trạng thái</label>
            <div >
                <select id="chiTietTrangThai" style="padding:8px 10px;border-radius:8px;border:1px solid #e6e7eb">
                <option value="dang-cho">Đang chờ</option>
                <option value="da-xac-nhan">Đã xác nhận</option>
                <option value="dang-chuan-bi">Đang chuẩn bị</option>
                <option value="da-gui">Đã gửi</option>
                <option value="da-hoan-thanh">Hoàn thành</option>
                <option value="da-huy">Đã hủy</option>
                </select>
                <button id="luuTrangThai" class="btn btn-primary">Lưu trạng thái</button>
                <button id="inDon" class="btn btn-ghost">In đơn</button>
            </div>
            </div>

            <div class="product-list" id="chiTietSanPham"></div>
            <div style="margin-top:12px" id="chiTietTong"></div>
        </aside>

        <!-- toast -->
        <div id="toast" class="toast" role="status" aria-live="polite">
        </div>
>>>>>>> Stashed changes
        `;
      });

      attachEvents();
    };

    const attachEvents = () => {

      // Change order status
      this.querySelectorAll(".statusSelect").forEach(sel => {
        sel.onchange = () => {
          const i = sel.dataset.i;
          orders[i].status = sel.value;
        };
      });

      // View order detail
      this.querySelectorAll(".edit").forEach(btn => {
        btn.onclick = () => {
          const o = orders[btn.dataset.i];
          alert(
            `Order ID: ${o.id}
Customer ID: ${o.customerId}
Order Name: ${o.name}
Status: ${o.status}
Created Date: ${o.date}`
          );
        };
      });

      // Delete order
      this.querySelectorAll(".delete").forEach(btn => {
        btn.onclick = () => {
          const i = btn.dataset.i;
          if (confirm("Are you sure you want to delete this order?")) {
            orders.splice(i, 1);
            render(orders);
          }
        };
      });
    };

    // FILTER
    const applyFilter = () => {
      const orderKey = this.querySelector("#searchOrder").value.toLowerCase();
      const customerKey = this.querySelector("#searchCustomer").value.toLowerCase();
      const status = this.querySelector("#filterStatus").value;

      const filtered = orders.filter(o =>
        o.id.toLowerCase().includes(orderKey) &&
        o.customerId.toLowerCase().includes(customerKey) &&
        (status === "" || o.status === status)
      );

      render(filtered);
    };

    ["#searchOrder", "#searchCustomer", "#filterStatus"].forEach(id => {
      this.querySelector(id).addEventListener("input", applyFilter);
      this.querySelector(id).addEventListener("change", applyFilter);
    });

    this.querySelector("#resetFilter").onclick = () => {
      this.querySelector("#searchOrder").value = "";
      this.querySelector("#searchCustomer").value = "";
      this.querySelector("#filterStatus").value = "";
      render(orders);
    };

    render(orders);
  }
}

customElements.define("oderlist-content", orderlistcontent);

