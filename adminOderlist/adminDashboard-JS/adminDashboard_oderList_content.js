class oderlistcontent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class ="content">
                    <div class="page-title"><h1>Admin oderlist</h1></div>
                    <div class="breadcrumb">Home / Dashboard</div>
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
                        <button class="btn" id="inChon">In</button>
                        <button class="btn" id="xuatChon">Xuất</button>
                        <div class="controls">
                        <button class="btn">Làm mới</button>
                        <button class="btn">Xuất Excel</button>
                        <button class="btn">Bộ lọc</button>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div style="overflow:auto">
                        <table id="bangDon" aria-describedby="Danh sách đơn hàng">
                        <thead>
                            <tr>
                            <th style="width:36px"><input type="checkbox" id="chkTatCa" aria-label="Chọn tất cả"/></th>
                            <th>Mã đơn</th>
                            <th>Khách</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Ngày</th>
                            <th style="width:190px">Thao tác</th>
                            </tr>
                        </thead>
                        </table>
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
