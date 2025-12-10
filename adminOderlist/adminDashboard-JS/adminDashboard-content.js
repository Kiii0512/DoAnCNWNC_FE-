class content extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="content">
        <div class="inner">

            <div class="page-title"><h1>Admin Dashboard</h1></div>
            <div class="breadcrumb">Home / Dashboard</div>

            <div class="dash-grid">
                <div class="dash-card">
                    <div style="font-size:14px;color:var(--muted);margin-bottom:6px;">Doanh thu hôm nay</div>
                    <div style="font-size:26px;font-weight:700;">$12,430</div>
                </div>

                <div class="dash-card">
                    <div style="font-size:14px;color:var(--muted);margin-bottom:6px;">Đơn hàng hôm nay</div>
                    <div style="font-size:26px;font-weight:700;">128</div>
                </div>

                <div class="dash-card">
                    <div style="font-size:14px;color:var(--muted);margin-bottom:6px;">Top sản phẩm</div>
                    <div style="font-size:26px;font-weight:700;">iPhone 14 Pro Max</div>
                </div>

                <div class="dash-card">
                    <div style="font-size:14px;color:var(--muted);margin-bottom:6px;">Người dùng mới</div>
                    <div style="font-size:26px;font-weight:700;">45</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;">
                <div class="table-wrapper" style="height:320px;">
                    <div class="dash-title">Doanh thu 7 ngày</div>
                    <canvas id="revenueChart" style="width:100%;height:240px;"></canvas>
                </div>

                <div class="table-wrapper" style="height:320px;">
                    <div class="dash-title">Tỉ lệ đơn hàng</div>
                    <canvas id="orderChart" style="width:100%;height:240px;"></canvas>
                </div>
            </div>

        </div>
        </div>
        `;

        // === TẢI CHART.JS ĐÚNG CÁCH ===
        this.loadChartJs(() => {
            this.renderCharts();
        });
    }

    loadChartJs(callback) {
        // nếu Chart đã load rồi thì chạy callback luôn
        if (window.Chart) {
            callback();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = callback;
        document.head.appendChild(script);
    }

    renderCharts() {
        // ===== BIỂU ĐỒ 1 – Doanh thu 7 ngày =====
        const ctx1 = this.querySelector("#revenueChart").getContext("2d");
        new Chart(ctx1, {
            type: "bar",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{
                    label: "Doanh thu",
                    data: [420, 580, 690, 510, 760, 880, 640],
                    backgroundColor: "rgba(37,99,235,0.6)"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

        // ===== BIỂU ĐỒ 2 – Pie chart tỉ lệ đơn hàng =====
        const ctx2 = this.querySelector("#orderChart").getContext("2d");
        new Chart(ctx2, {
            type: "pie",
            data: {
                labels: ["Thành công", "Đang xử lý", "Đã hủy"],
                datasets: [{
                    data: [68, 22, 10],
                    backgroundColor: [
                        "rgba(34,197,94,0.7)",
                        "rgba(234,179,8,0.7)",
                        "rgba(239,68,68,0.7)"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

customElements.define("con-tent", content);
