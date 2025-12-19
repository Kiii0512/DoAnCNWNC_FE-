class orderlistcontent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="content">

      <div class="page-title">Order Management</div>
      <div class="breadcrumb">Home / Orders</div>

      <!-- TOOLS -->
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

      <!-- TABLE -->
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
