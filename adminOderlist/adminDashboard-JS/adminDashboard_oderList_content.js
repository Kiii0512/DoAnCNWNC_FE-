class oderlistcontent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="content">
            <div class="inner">
                <div class="page-title">Order List</div>
                <div class="breadcrumb">Home / Order List</div>

                <div class="table-wrapper">
                <table id="orderTable">
                    <thead>
                        <tr>
                            <th></th><th>ID</th><th>Name</th><th>Date</th><th>Status</th>
                            <th>Amount</th><th>Method</th><th>Shipping</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                </div>
            </div>
        </div>
        `;

        // Dataset
        const data = [
            {
                id: "#Kc025418",
                customer: "Mendocart",
                date: "Mar 24, 2022",
                paymentStatus: "Paid",
                amount: "$11250",
                method: "Mastercard",
                shipStatus: "Shipped"
            },
            {
                id: "#Kc025520",
                customer: "Margaret Ak",
                date: "Mar 24, 2022",
                paymentStatus: "Paid",
                amount: "$8999",
                method: "Visa",
                shipStatus: "Processing"
            }
        ];

        // Render Table
        const renderTable = () => {
            const tbody = this.querySelector("#orderTable tbody");
            tbody.innerHTML = "";

            data.forEach((item, index) => {
                tbody.innerHTML += `
                    <tr>
                        <td><input type="checkbox"></td>
                        <td>${item.id}</td>
                        <td>${item.customer}</td>
                        <td>${item.date}</td>
                        <td><span class="status-paid">${item.paymentStatus}</span></td>
                        <td>${item.amount}</td>
                        <td>${item.method}</td>
                        <td><span class="status-${item.shipStatus.toLowerCase()}">${item.shipStatus}</span></td>
                        <td class="actions">
                            <button class="edit" data-index="${index}">✏️</button>
                            <button class="delete" data-index="${index}">🗑</button>
                        </td>
                    </tr>
                `;
            });

            // Gán sự kiện Delete
            this.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", () => {
                    const i = btn.dataset.index;
                    data.splice(i, 1);
                    renderTable();
                });
            });

            // Gán sự kiện Edit
            this.querySelectorAll(".edit").forEach(btn => {
                btn.addEventListener("click", () => {
                    const i = btn.dataset.index;
                    alert("Sửa dòng: " + data[i].id);
                });
            });
        };

        renderTable();
    }
}

customElements.define("oderlist-content", oderlistcontent);
