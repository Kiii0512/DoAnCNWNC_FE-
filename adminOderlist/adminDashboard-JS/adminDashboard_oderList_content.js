class orderlistcontent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="content">

      <div class="page-title"><h1> Order List</h1></div>
      <div class="breadcrumb">Home / Orders</div>

      <!-- TOOLS -->
      <div class="tools">
        <div style="display:flex; gap:10px">
          <input id="searchOrder" type="text" placeholder="Mã order..." />
          <input id="searchCustomer" type="text" placeholder="Mã khách hàng..." />
          <select id="filterStatus">
            <option value="">-- Trạng thái --</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button id="resetFilter">Reset</button>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Mã Order</th>
              <th>Mã KH</th>
              <th>Tên đơn hàng</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="orderTable"></tbody>
        </table>
      </div>

    </div>
    `;

    const orders = [
      { id: "OD001", mkh: "KH001", name: "Đơn Laptop Dell", date: "2025-12-15", status: "Pending" },
      { id: "OD002", mkh: "KH002", name: "Đơn iPhone 15", date: "2025-12-16", status: "Processing" },
      { id: "OD003", mkh: "KH001", name: "Đơn Tai nghe Sony", date: "2025-12-17", status: "Completed" },
      { id: "OD004", mkh: "KH003", name: "Đơn Bàn phím cơ", date: "2025-12-18", status: "Cancelled" }
    ];

    const tbody = this.querySelector("#orderTable");

    const render = (data) => {
      tbody.innerHTML = "";

      data.forEach((o, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${o.id}</td>
            <td>${o.mkh}</td>
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
              <i class="edit" data-i="${i}">👁</i>
            </td>
          </tr>
        `;
      });

      attachEvents();
    };

    const attachEvents = () => {

      // Change status
      this.querySelectorAll(".statusSelect").forEach(sel => {
        sel.onchange = () => {
          const i = sel.dataset.i;
          orders[i].status = sel.value;
        };
      });

      // View detail
      this.querySelectorAll(".edit").forEach(btn => {
        btn.onclick = () => {
          const o = orders[btn.dataset.i];
          alert(
            `Order: ${o.id}\nKhách hàng: ${o.mkh}\nTên: ${o.name}\nTrạng thái: ${o.status}`
          );
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
        o.mkh.toLowerCase().includes(customerKey) &&
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
