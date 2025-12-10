class content extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Dashboard</title>
        <style>
            *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
            body{display:flex;background:#f5f6fa;color:#333;height:100vh}
            .sidebar{width:240px;background:#111827;color:#fff;padding:20px;display:flex;flex-direction:column;gap:16px}
            .sidebar h2{font-size:22px;margin-bottom:20px}
            .sidebar a{color:#fff;text-decoration:none;padding:10px;border-radius:6px;transition:.2s}
            .sidebar a:hover{background:#1f2937}
            .main{flex:1;padding:24px;overflow-y:auto}

            .topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
            .topbar h1{font-size:26px}
            .kpi-boxes{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:20px}
            .kpi{background:#fff;padding:18px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.08)}
            .kpi h3{font-size:18px;margin-bottom:8px}
            .kpi p{font-size:24px;font-weight:bold}

            .quick-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:10px}
            .quick-item{background:#fff;padding:20px;border-radius:10px;text-align:center;cursor:pointer;transition:.2s;box-shadow:0 2px 6px rgba(0,0,0,0.08)}
            .quick-item:hover{transform:translateY(-4px)}

            .charts{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
            .chart-box{background:#fff;padding:20px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.08);height:280px}
        </style>
        </head>
        <body>
        <div class="sidebar">
            <h2>Admin</h2>
            <a href="#">Dashboard</a>
            <a href="#">Orders</a>
            <a href="#">Products</a>
            <a href="#">Customers</a>
            <a href="#">Vendors</a>
            <a href="#">History</a>
            <a href="#">Messages</a>
        </div>

        <div class="main">
            <div class="topbar">
            <h1>Dashboard</h1>
            <div>🔔 <span style="background:red;color:#fff;padding:2px 6px;border-radius:6px;font-size:12px">3</span></div>
            </div>

            <div class="kpi-boxes">
            <div class="kpi"><h3>Revenue Today</h3><p>12,500,000₫</p></div>
            <div class="kpi"><h3>Orders Today</h3><p>48</p></div>
            <div class="kpi"><h3>Top Product</h3><p>iPhone 16</p></div>
            <div class="kpi"><h3>New Customers</h3><p>12</p></div>
            </div>

            <h2>Quick Actions</h2>
            <div class="quick-links">
            <div class="quick-item">+ Add Product</div>
            <div class="quick-item">+ Create Order</div>
            <div class="quick-item">View Reports</div>
            <div class="quick-item">Inventory</div>
            </div>

            <div class="charts">
            <div class="chart-box">Chart 1 (mock)</div>
            <div class="chart-box">Chart 2 (mock)</div>
            </div>
        </div>
        </body>
        </html>

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

customElements.define("con-tent", content);
