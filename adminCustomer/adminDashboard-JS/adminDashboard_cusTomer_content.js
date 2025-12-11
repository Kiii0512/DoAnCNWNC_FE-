class customerscontent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
  <div class="content">
    <div class="page-title">Customers</div>
    <div class="breadcrumb">Home / Customers</div>

    <div class="tools">
      <input id="searchCustomer" type="text" placeholder="Tìm khách hàng..." />
      <button id="addCustomerBtn">+ Add Customer</button>
    </div>

    <div class="table-card">
      <table id="customerTable">
        <thead>
          <tr>
            <th><input type="checkbox"/></th>
            <th>MKH</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Total Orders</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody></tbody>
      </table>
    </div>
  </div>
        `;

        // ================================
        // DATA: LIST KHÁCH HÀNG
        // ================================
        const customers = [
            { mkh: "KH001", name: "Nguyễn Văn A", phone: "0903233444", orders: 12, status: "Active" },
            { mkh: "KH002", name: "Trần Thị B", phone: "0912122333", orders: 3, status: "Inactive" },
            { mkh: "KH003", name: "Phạm Quốc C", phone: "0905666777", orders: 7, status: "Active" }
        ];

        const tbody = this.querySelector("#customerTable tbody");

        // ================================
        // RENDER TABLE
        // ================================
        const renderTable = () => {
            tbody.innerHTML = "";

            customers.forEach((c, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><input type="checkbox" /></td>
                    <td>${c.mkh}</td>
                    <td>${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.orders}</td>
                    <td>
                        <span class="badge ${c.status === "Active" ? "active" : "inactive"}">
                            ${c.status}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="edit" data-index="${index}">✏️</button>
                        <button class="delete" data-index="${index}">🗑</button>
                    </td>
                `;

                tbody.appendChild(row);
            });

            attachEvents();
        };

        // ================================
        // EVENTS: EDIT + DELETE
        // ================================
        const attachEvents = () => {

            // DELETE
            this.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", () => {
                    const i = Number(btn.dataset.index);
                    customers.splice(i, 1);
                    renderTable();
                });
            });

            // EDIT
            this.querySelectorAll(".edit").forEach(btn => {
                btn.addEventListener("click", () => {
                    const i = Number(btn.dataset.index);
                    const c = customers[i];

                    const newName = prompt("Tên khách hàng:", c.name);
                    if (newName !== null && newName.trim() !== "") c.name = newName;

                    const newPhone = prompt("Số điện thoại:", c.phone);
                    if (newPhone !== null && newPhone.trim() !== "") c.phone = newPhone;

                    renderTable();
                });
            });
        };

        // ================================
        // ADD CUSTOMER
        // ================================
        this.querySelector("#addCustomerBtn").addEventListener("click", () => {
            const mkh = prompt("Mã khách hàng:");
            if (!mkh) return;

            const name = prompt("Tên khách hàng:");
            if (!name) return;

            const phone = prompt("Số điện thoại:");
            const orders = Number(prompt("Số đơn đã mua:") || 0);

            customers.push({
                mkh,
                name,
                phone,
                orders,
                status: "Active"
            });

            renderTable();
        });

        renderTable();
    }
}

customElements.define("customers-content", customerscontent);
